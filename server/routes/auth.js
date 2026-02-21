const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { sendOTP, verifyOTP } = require('../utils/otpGenerator');
const { sendOTPSMS } = require('../utils/smsService');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { aadhaarNumber, password } = req.body;

    if (!aadhaarNumber || !password) {
      return res.status(400).json({ error: 'Aadhaar number and password are required' });
    }

    // Find aadhaar record by aadhaar number
    const [aadhaarRecords] = await pool.execute(
      'SELECT * FROM aadhaar_records WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const aadhaarRecord = aadhaarRecords[0];

    // Check if user_id exists
    if (!aadhaarRecord.user_id) {
      return res.status(401).json({ error: 'Account not registered. Please sign up first.' });
    }

    // Get the user associated with this aadhaar record
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [aadhaarRecord.user_id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        aadhaar_record_id: user.aadhaar_record_id
      },
      aadhaarRecord
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup endpoint - ONLY updates user_id in existing aadhaar_record
router.post('/signup', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { aadhaarNumber, password, email, phone } = req.body;

    if (!aadhaarNumber || !password || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await connection.beginTransaction();

    // Check if aadhaar number already exists
    const [existingAadhaar] = await connection.execute(
      'SELECT * FROM aadhaar_records WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (existingAadhaar.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Aadhaar number not found in records. Please contact support.' });
    }

    const aadhaarRecord = existingAadhaar[0];

    // Check if already linked to a user
    if (aadhaarRecord.user_id) {
      await connection.rollback();
      return res.status(400).json({ error: 'Aadhaar number already registered. Please login.' });
    }

    // Check if email already exists
    const [existingEmail] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if phone already exists
    const [existingPhone] = await connection.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const userId = uuidv4();

    // Create user in users table
    await connection.execute(
      `INSERT INTO users (id, email, phone, password_hash, aadhaar_record_id, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [userId, email, phone, passwordHash, aadhaarRecord.id]
    );

    // UPDATE ONLY user_id in existing aadhaar_record using aadhaar_number
    await connection.execute(
      `UPDATE aadhaar_records SET user_id = ? WHERE aadhaar_number = ?`,
      [userId, aadhaarNumber]
    );

    await connection.commit();

    // Send OTP to MOBILE PHONE (SMS) for verification
    const otpResult = await sendOTP(aadhaarNumber, 'sms', 'mobile_verification');
    if (otpResult.success) {
      await sendOTPSMS(phone, `Your Aadhaar Advance verification OTP is: ${otpResult.otp}`);
    }

    res.status(201).json({
      message: 'User created successfully. Please verify your mobile using the OTP sent to your phone.',
      user: { id: userId, email, phone },
      aadhaarRecord: { id: aadhaarRecord.id, aadhaar_number: aadhaarNumber },
      otpSentToMobile: true
    });
  } catch (error) {
    await connection.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { aadhaarNumber, method = 'sms', type = 'login', phone } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ error: 'Aadhaar number is required' });
    }

    // Get aadhaar record directly
    let aadhaarRecords = [];
    let dbPhone = null;
    let userId = null;
    
    try {
      const [records] = await pool.execute(
        'SELECT * FROM aadhaar_records WHERE aadhaar_number = ?',
        [aadhaarNumber]
      );
      
      aadhaarRecords = records;
      
      if (records.length > 0) {
        dbPhone = records[0].phone;
        userId = records[0].user_id;
        console.log(`Found aadhaar record for ${aadhaarNumber}, phone: ${dbPhone}, user_id: ${userId}`);
      }
    } catch (err) {
      console.log('Error fetching aadhaar record:', err.message);
    }

    let phoneToUse = dbPhone || phone;
    
    if (aadhaarRecords.length > 0 && !phoneToUse) {
      return res.status(400).json({ error: 'No phone number found for this Aadhaar. Please contact support.' });
    }

    if (aadhaarRecords.length === 0) {
      return res.status(404).json({ error: 'Aadhaar number not found. Please contact support.' });
    }

    const result = await sendOTP(aadhaarNumber, method, type, phoneToUse);

    if (result.success) {
      if (method === 'sms' && phoneToUse) {
        await sendOTPSMS(phoneToUse, result.otp);
        console.log(`OTP sent to phone ${phoneToUse} for Aadhaar ${aadhaarNumber}`);
      }

      res.json({ 
        message: 'OTP sent successfully', 
        method,
        phoneFromDatabase: !!dbPhone,
        ...(process.env.NODE_ENV === 'development' && { otp: result.otp })
      });
    } else {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp, aadhaarNumber, type = 'login' } = req.body;

    if (!otp || !aadhaarNumber) {
      return res.status(400).json({ error: 'OTP and Aadhaar number are required' });
    }

    const result = await verifyOTP(aadhaarNumber, otp, type);

    if (result.valid) {
      if (type === 'mobile_verification') {
        await pool.execute(
          'UPDATE aadhaar_records SET mobile_verified = TRUE WHERE aadhaar_number = ?',
          [aadhaarNumber]
        );
      }
      
      res.json({ valid: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ valid: false, error: result.error });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      aadhaar_record_id: user.aadhaar_record_id,
      is_active: user.is_active,
      last_login: user.last_login
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if email exists
router.get('/email-exists', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    res.json({ exists: users.length > 0 });
  } catch (error) {
    console.error('Check email exists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if phone exists
router.get('/phone-exists', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    res.json({ exists: users.length > 0 });
  } catch (error) {
    console.error('Check phone exists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

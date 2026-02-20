const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

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

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { aadhaarNumber, password, email, phone, personalInfo } = req.body;

    if (!aadhaarNumber || !password || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if aadhaar number already exists
    const [existingAadhaar] = await pool.execute(
      'SELECT id FROM aadhaar_records WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (existingAadhaar.length > 0) {
      return res.status(400).json({ error: 'Aadhaar number already registered' });
    }

    // Check if email already exists
    const [existingEmail] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if phone already exists
    const [existingPhone] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const userId = uuidv4();
    const aadhaarRecordId = uuidv4();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create user
      await connection.execute(
        `INSERT INTO users (id, email, phone, password_hash, aadhaar_record_id, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [userId, email, phone, passwordHash, aadhaarRecordId]
      );

      // Create aadhaar record
      await connection.execute(
        `INSERT INTO aadhaar_records (
          id, user_id, aadhaar_number, full_name, date_of_birth, gender, 
          address, state, district, city, pincode, 
          status, is_verified, is_eid_linked, mobile_verified, email_verified,
          fingerprint_status, iris_status, face_scan_status, card_type,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', FALSE, FALSE, FALSE, FALSE, 'registered', 'registered', 'registered', 'standard', NOW(), NOW())`,
        [
          aadhaarRecordId,
          userId,
          aadhaarNumber,
          personalInfo?.fullName || '',
          personalInfo?.dateOfBirth || '1990-01-01',
          personalInfo?.gender || 'Male',
          personalInfo?.address || '',
          personalInfo?.state || '',
          personalInfo?.district || null,
          personalInfo?.city || null,
          personalInfo?.pincode || ''
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: 'User created successfully',
        user: { id: userId, email, phone },
        aadhaarRecord: { id: aadhaarRecordId, aadhaar_number: aadhaarNumber }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { aadhaarNumber, method } = req.body;

    // In production, integrate with SMS/Email service
    // For demo, always return success
    res.json({ message: 'OTP sent successfully', otp: '123456' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp, aadhaarNumber } = req.body;

    // In production, verify against stored OTP
    // For demo, accept '123456'
    if (otp === '123456') {
      res.json({ valid: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ valid: false, error: 'Invalid OTP' });
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

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { sendOTP, verifyOTP } = require('../utils/otpGenerator');
const { sendVerificationEmail, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
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
  const connection = await pool.getConnection();
  
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
    const emailVerificationToken = uuidv4();

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
        email_verification_token, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', FALSE, FALSE, FALSE, FALSE, 'registered', 'registered', 'registered', 'standard', ?, ?, NOW(), NOW())`,
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
        personalInfo?.pincode || '',
        emailVerificationToken,
        phone
      ]
    );

    await connection.commit();

    // Send verification email with OTP (async - don't wait for it)
    sendVerificationEmail(email, personalInfo?.fullName || 'User', emailVerificationToken)
      .catch(err => console.error('Failed to send verification email:', err));

    // Also send OTP to email for verification
    const otpResult = await sendOTP(aadhaarNumber, 'email', 'email_verification');
    if (otpResult.success) {
      await sendOTPEmail(email, otpResult.otp, 'email_verification');
    }

    // Send welcome email (async)
    sendWelcomeEmail(email, personalInfo?.fullName || 'User')
      .catch(err => console.error('Failed to send welcome email:', err));

    // Send welcome SMS (async)
    sendOTPSMS(phone, 'Welcome to Aadhaar Advance! Your account has been created successfully.')
      .catch(err => console.error('Failed to send welcome SMS:', err));

    res.status(201).json({
      message: 'User created successfully. Please verify your email using the OTP sent to your email.',
      user: { id: userId, email, phone },
      aadhaarRecord: { id: aadhaarRecordId, aadhaar_number: aadhaarNumber },
      emailVerificationSent: true,
      otpSentToEmail: true
    });
  } catch (error) {
    await connection.rollback();
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Send OTP endpoint - supports both SMS and Email
router.post('/send-otp', async (req, res) => {
  try {
    const { aadhaarNumber, method = 'sms', type = 'login' } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ error: 'Aadhaar number is required' });
    }

    // Get user email/phone for sending OTP
    const [aadhaarRecords] = await pool.execute(
      'SELECT ar.*, u.email, u.phone FROM aadhaar_records ar JOIN users u ON ar.user_id = u.id WHERE ar.aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length === 0 && type !== 'signup') {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate and send OTP via the selected method
    const result = await sendOTP(aadhaarNumber, method, type);

    if (result.success) {
      // Send OTP via the selected method
      if (method === 'email') {
        const user = aadhaarRecords[0];
        await sendOTPEmail(user.email, result.otp, type === 'password_reset' ? 'password_reset' : type === 'email_verification' ? 'email_verification' : 'login');
      } else if (method === 'sms') {
        // For SMS, use the phone from the request or from the database
        const phone = aadhaarRecords[0]?.phone || req.body.phone;
        if (phone) {
          await sendOTPSMS(phone, result.otp);
        }
      }

      res.json({ 
        message: 'OTP sent successfully', 
        method,
        // In development, return OTP for testing
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
      // If verifying email OTP, also mark email as verified
      if (type === 'email_verification') {
        await pool.execute(
          'UPDATE aadhaar_records SET email_verified = TRUE, verification_date = NOW() WHERE aadhaar_number = ?',
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

// Verify email endpoint (with link - also sends OTP)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find aadhaar record with this token
    const [records] = await pool.execute(
      'SELECT * FROM aadhaar_records WHERE email_verification_token = ?',
      [token]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    const aadhaarRecord = records[0];

    // Check if already verified
    if (aadhaarRecord.email_verified) {
      return res.json({ message: 'Email already verified' });
    }

    // Get user email
    const [users] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [aadhaarRecord.user_id]
    );

    if (users.length > 0) {
      // Send OTP to email for verification
      const otpResult = await sendOTP(aadhaarRecord.aadhaar_number, 'email', 'email_verification');
      if (otpResult.success) {
        await sendOTPEmail(users[0].email, otpResult.otp, 'email_verification');
      }

      // Return success with OTP for verification (in development)
      res.json({ 
        message: 'Verification OTP sent to your email. Please enter the OTP to verify.',
        emailVerified: false,
        otpSent: true,
        ...(process.env.NODE_ENV === 'development' && { otp: otpResult.otp })
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete email verification with OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { aadhaarNumber, otp } = req.body;

    if (!aadhaarNumber || !otp) {
      return res.status(400).json({ error: 'Aadhaar number and OTP are required' });
    }

    // Verify the OTP
    const otpResult = await verifyOTP(aadhaarNumber, otp, 'email_verification');
    
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Update email verification status
    await pool.execute(
      'UPDATE aadhaar_records SET email_verified = TRUE, verification_date = NOW(), email_verification_token = NULL WHERE aadhaar_number = ?',
      [aadhaarNumber]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email, aadhaarNumber } = req.body;

    if (!email && !aadhaarNumber) {
      return res.status(400).json({ error: 'Email or Aadhaar number is required' });
    }

    let user, aadhaarRecord;

    if (aadhaarNumber) {
      // Find by aadhaar number
      const [records] = await pool.execute(
        'SELECT ar.*, u.email FROM aadhaar_records ar JOIN users u ON ar.user_id = u.id WHERE ar.aadhaar_number = ?',
        [aadhaarNumber]
      );
      
      if (records.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      aadhaarRecord = records[0];
      email = records[0].email;
    } else {
      // Find by email
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      user = users[0];

      // Get aadhaar record
      const [records] = await pool.execute(
        'SELECT * FROM aadhaar_records WHERE id = ?',
        [user.aadhaar_record_id]
      );

      if (records.length === 0) {
        return res.status(404).json({ error: 'Aadhaar record not found' });
      }

      aadhaarRecord = records[0];
    }

    if (aadhaarRecord.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const newToken = uuidv4();
    await pool.execute(
      'UPDATE aadhaar_records SET email_verification_token = ? WHERE id = ?',
      [newToken, aadhaarRecord.id]
    );

    // Send verification email with link
    await sendVerificationEmail(email, aadhaarRecord.full_name || 'User', newToken);

    // Also send OTP to email
    const otpResult = await sendOTP(aadhaarNumber || aadhaarRecord.aadhaar_number, 'email', 'email_verification');
    if (otpResult.success) {
      await sendOTPEmail(email, otpResult.otp, 'email_verification');
    }

    res.json({ message: 'Verification email and OTP sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { aadhaarNumber, method = 'sms' } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ error: 'Aadhaar number is required' });
    }

    // Find user by aadhaar number
    const [aadhaarRecords] = await pool.execute(
      'SELECT ar.*, u.email, u.phone FROM aadhaar_records ar JOIN users u ON ar.user_id = u.id WHERE ar.aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length === 0) {
      // Don't reveal that the user doesn't exist
      return res.json({ message: 'If the account exists, a password reset OTP has been sent' });
    }

    const user = aadhaarRecords[0];

    // Generate and send OTP
    const result = await sendOTP(aadhaarNumber, method, 'password_reset');

    if (result.success) {
      if (method === 'email') {
        await sendOTPEmail(user.email, result.otp, 'password_reset');
      } else if (method === 'sms') {
        await sendOTPSMS(user.phone, result.otp);
      }
    }

    res.json({ message: 'If the account exists, a password reset OTP has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { aadhaarNumber, otp, newPassword } = req.body;

    if (!aadhaarNumber || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify OTP
    const otpResult = await verifyOTP(aadhaarNumber, otp, 'password_reset');
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.error });
    }

    // Find user
    const [aadhaarRecords] = await pool.execute(
      'SELECT ar.user_id FROM aadhaar_records ar WHERE ar.aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, aadhaarRecords[0].user_id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
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

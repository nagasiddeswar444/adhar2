// OTP Generator Utility
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { sendOTPSMS } = require('./smsService');
const { sendOTPEmail } = require('./emailService');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in database
const storeOTP = async (aadhaarNumber, otp, type = 'login', expiresInMinutes = 2) => {
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  // Delete any existing OTPs for this aadhaar number and type
  await pool.execute(
    'DELETE FROM otp_verification WHERE aadhaar_number = ? AND type = ?',
    [aadhaarNumber, type]
  );

  // Insert new OTP
  await pool.execute(
    `INSERT INTO otp_verification (id, aadhaar_number, otp, type, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [id, aadhaarNumber, otp, type, expiresAt]
  );

  return otp;
};

// Verify OTP
const verifyOTP = async (aadhaarNumber, otp, type = 'login') => {
  // First try exact type match
  let [records] = await pool.execute(
    'SELECT * FROM otp_verification WHERE aadhaar_number = ? AND type = ? AND used = FALSE',
    [aadhaarNumber, type]
  );

  // If no record found with exact type, try to find any unused OTP for this aadhaar number
  if (records.length === 0) {
    [records] = await pool.execute(
      'SELECT * FROM otp_verification WHERE aadhaar_number = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [aadhaarNumber]
    );
  }

  if (records.length === 0) {
    return { valid: false, error: 'OTP not found or already used' };
  }

  const otpRecord = records[0];

  // Check if OTP is expired
  if (new Date() > new Date(otpRecord.expires_at)) {
    return { valid: false, error: 'OTP has expired' };
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    // Increment attempts
    await pool.execute(
      'UPDATE otp_verification SET attempts = attempts + 1 WHERE id = ?',
      [otpRecord.id]
    );
    return { valid: false, error: 'Invalid OTP' };
  }

  // Mark OTP as used
  await pool.execute(
    'UPDATE otp_verification SET used = TRUE, verified_at = NOW() WHERE id = ?',
    [otpRecord.id]
  );

  return { valid: true };
};

// Send OTP via specified method (sms or email)
const sendOTP = async (aadhaarNumber, method = 'sms', type = 'login', phoneNumber = null) => {
  const otp = generateOTP();

  // Store OTP in database with 2 minute expiration
  await storeOTP(aadhaarNumber, otp, type, 2);

  // Get user email/phone for sending
  let user = null;
  try {
    const [aadhaarRecords] = await pool.execute(
      'SELECT ar.*, u.email, u.phone FROM aadhaar_records ar JOIN users u ON ar.user_id = u.id WHERE ar.aadhaar_number = ?',
      [aadhaarNumber]
    );

    if (aadhaarRecords.length > 0) {
      user = aadhaarRecords[0];
    }
  } catch (error) {
    console.error('Error fetching user for OTP:', error);
  }

  // If no phone number provided, try to get from database
  const phone = phoneNumber || user?.phone;

  // Send OTP via the selected method
  if (method === 'sms' && phone) {
    // Send SMS with OTP
    await sendOTPSMS(phone, otp);
    console.log(`SMS OTP sent to ${phone}: ${otp}`);
  } else if (method === 'email' && user?.email) {
    // Send email with OTP
    await sendOTPEmail(user.email, otp, type === 'password_reset' ? 'password_reset' : 'login');
    console.log(`Email OTP sent to ${user.email}: ${otp}`);
  } else if (!phone && !user?.email) {
    // For development/testing, log the OTP
    console.log(`OTP for ${aadhaarNumber} (${method}): ${otp}`);
  }

  return { success: true, otp }; // Return OTP for testing in development
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTP
};

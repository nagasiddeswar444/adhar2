// OTP Generator Utility
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in database
const storeOTP = async (aadhaarNumber, otp, type = 'login', expiresInMinutes = 10) => {
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
  const [records] = await pool.execute(
    'SELECT * FROM otp_verification WHERE aadhaar_number = ? AND type = ? AND used = FALSE',
    [aadhaarNumber, type]
  );

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

// Send OTP (integrates with email/SMS service)
const sendOTP = async (aadhaarNumber, method = 'email', type = 'login') => {
  const otp = generateOTP();

  // Store OTP in database
  await storeOTP(aadhaarNumber, otp, type);

  // Get user email/phone for sending
  const [aadhaarRecords] = await pool.execute(
    'SELECT ar.*, u.email, u.phone FROM aadhaar_records ar JOIN users u ON ar.user_id = u.id WHERE ar.aadhaar_number = ?',
    [aadhaarNumber]
  );

  if (aadhaarRecords.length === 0) {
    // For signup flow, we might not have a user yet
    console.log(`OTP for ${aadhaarNumber}: ${otp}`);
    return { success: true, otp }; // Return OTP for testing
  }

  const user = aadhaarRecords[0];

  // In production, integrate with email/SMS service
  if (method === 'email' || type === 'email_verification') {
    // Send email with OTP
    console.log(`Sending email OTP to ${user.email}: ${otp}`);
    // In production: await sendEmail(user.email, 'Your OTP', `Your OTP is ${otp}`);
  } else if (method === 'sms' || type === 'login') {
    // Send SMS with OTP
    console.log(`Sending SMS OTP to ${user.phone}: ${otp}`);
    // In production: await sendSMS(user.phone, `Your OTP is ${otp}`);
  }

  return { success: true, otp }; // Return OTP for testing in development
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTP
};

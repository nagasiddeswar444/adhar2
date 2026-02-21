const express = require('express');
const router = express.Router();
const { generateOTP } = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../utils/emailService');

// Send OTP via Email
// POST /api/otp/send-email
// Body: { email: "user@example.com" }
router.post('/send-email', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: email'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Send OTP via email
    const result = await sendOTPEmail(email, otp, 'login');

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent to email successfully',
        email: email,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Show OTP only in dev
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Send OTP via Email for Password Reset
// POST /api/otp/send-password-reset
// Body: { email: "user@example.com" }
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: email'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Send OTP via email for password reset
    const result = await sendOTPEmail(email, otp, 'password_reset');

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to email successfully',
        email: email,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;

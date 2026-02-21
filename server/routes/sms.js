const express = require('express');
const router = express.Router();
const { sendSMS, sendOTPSMS } = require('../utils/smsService');

// Send SMS endpoint
// POST /api/sms/send
// Body: { phoneNumber: "+919381796291", message: "Hello" }
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    // Validate inputs
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber and message'
      });
    }

    // Send SMS
    const result = await sendSMS(phoneNumber, message);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        requestId: result.sid,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Send OTP SMS endpoint
// POST /api/sms/send-otp
// Body: { phoneNumber: "+919381796291", otp: "123456" }
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate inputs
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phoneNumber and otp'
      });
    }

    // Send OTP SMS
    const result = await sendOTPSMS(phoneNumber, otp);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'OTP SMS sent successfully',
        requestId: result.sid,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;

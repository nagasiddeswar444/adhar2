// SMS Service Utility
// In production, integrate with services like Twilio, Nexmo, etc.

require('dotenv').config();

// Send SMS using Twilio (example)
const sendSMS = async (phoneNumber, message) => {
  // For development/testing, use console logging
  if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID) {
    console.log('=== SMS ===');
    console.log('To:', phoneNumber);
    console.log('Message:', message);
    console.log('=============');
    return { success: true, sid: 'dev-' + Date.now() };
  }

  // Production: Use Twilio
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP SMS
const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your Aadhaar Advance OTP is: ${otp}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.`;
  return sendSMS(phoneNumber, message);
};

// Send welcome SMS
const sendWelcomeSMS = async (phoneNumber, name) => {
  const message = `Welcome to Aadhaar Advance, ${name}! Your account has been created successfully. Please verify your email to get started.`;
  return sendSMS(phoneNumber, message);
};

// Send appointment confirmation SMS
const sendAppointmentConfirmationSMS = async (phoneNumber, bookingId, date, time, center) => {
  const message = `Your Aadhaar Advance appointment is confirmed! Booking ID: ${bookingId}. Date: ${date}, Time: ${time}, Center: ${center}. Please arrive 15 mins early.`;
  return sendSMS(phoneNumber, message);
};

// Send appointment reminder SMS
const sendAppointmentReminderSMS = async (phoneNumber, bookingId, date, time) => {
  const message = `Reminder: Your Aadhaar Advance appointment (ID: ${bookingId}) is tomorrow at ${time}. Date: ${date}. Please carry required documents.`;
  return sendSMS(phoneNumber, message);
};

// Send cancellation confirmation SMS
const sendCancellationSMS = async (phoneNumber, bookingId) => {
  const message = `Your Aadhaar Advance appointment (ID: ${bookingId}) has been cancelled successfully.`;
  return sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS,
  sendWelcomeSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendCancellationSMS
};

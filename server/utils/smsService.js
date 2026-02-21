// SMS Service Utility
// Using Twilio for SMS delivery

const dotenv = require('dotenv');
dotenv.config();

// Initialize Twilio client
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
try {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Twilio client:', error.message);
  client = null;
}

// Send SMS using Twilio
const sendSMS = async (phoneNumber, message) => {
  // Remove + and any spaces from phone number
  let cleanNumber = phoneNumber.replace(/[+\s]/g, '');
  
  // Add country code if not present (assume India +91)
  if (!cleanNumber.startsWith('+') && !cleanNumber.startsWith('91')) {
    if (cleanNumber.length === 10) {
      cleanNumber = '+91' + cleanNumber;
    } else {
      cleanNumber = '+' + cleanNumber;
    }
  } else if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    cleanNumber = '+' + cleanNumber;
  }
  
  // For development/testing without Twilio, use console logging
  if (!client || process.env.NODE_ENV === 'development' && !process.env.TWILIO_ACCOUNT_SID) {
    console.log('=== SMS (Development Mode) ===');
    console.log('To:', cleanNumber);
    console.log('Message:', message);
    console.log('==============================');
    return { success: true, sid: 'dev-' + Date.now() };
  }

  // Production: Use Twilio API
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: cleanNumber
    });

    console.log('✅ SMS sent successfully via Twilio');
    console.log('Message SID:', result.sid);
    console.log('Status:', result.status);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ Twilio Error:', error.message);
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

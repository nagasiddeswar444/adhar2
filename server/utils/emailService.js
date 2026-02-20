// Email Service Utility
// In production, integrate with services like SendGrid, Mailgun, AWS SES, etc.

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter (configure for your email service)
const createTransporter = () => {
  // For development/testing, use console logging
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    return {
      sendMail: async (options) => {
        console.log('=== EMAIL ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('=============');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  // Production configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

// Send email verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@aadhaar-advance.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Aadhaar Advance. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message from Aadhaar Advance. Please do not reply to this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@aadhaar-advance.com',
    to: email,
    subject: purpose === 'password_reset' ? 'Password Reset OTP' : 'Your Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${purpose === 'password_reset' ? 'Password Reset' : 'Login'} OTP</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message from Aadhaar Advance. Please do not reply to this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@aadhaar-advance.com',
    to: email,
    subject: 'Welcome to Aadhaar Advance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Aadhaar Advance!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining Aadhaar Advance. We're excited to help you manage your Aadhaar updates easily and securely.</p>
        <p>With Aadhaar Advance, you can:</p>
        <ul>
          <li>Book appointment slots at your preferred enrollment center</li>
          <li>Track your application status in real-time</li>
          <li>Update your information online</li>
          <li>Get fraud alerts and security notifications</li>
        </ul>
        <p>To get started, please verify your email address.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message from Aadhaar Advance. Please do not reply to this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmationEmail = async (email, name, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@aadhaar-advance.com',
    to: email,
    subject: 'Appointment Confirmation - Aadhaar Advance',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Confirmed!</h2>
        <p>Hello ${name},</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${appointmentDetails.bookingId}</p>
          <p><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          <p><strong>Center:</strong> ${appointmentDetails.center}</p>
          <p><strong>Service:</strong> ${appointmentDetails.updateType}</p>
        </div>
        <p>Please arrive at the center 15 minutes before your scheduled time and bring the required documents.</p>
        <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message from Aadhaar Advance. Please do not reply to this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmationEmail
};

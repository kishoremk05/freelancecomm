const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Check if email credentials are configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email credentials not configured - email notifications will be disabled');
        return false;
      }

      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Email service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.initialized = false;
      return false;
    }
  }

  async sendBookingNotificationToFreelancer(bookingDetails) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.initialized) {
      logger.warn('Email service not initialized - skipping email notification');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { userName, userEmail, meetingTime, meetLink, calendarLink, slot } = bookingDetails;

      const mailOptions = {
        from: `"FreelanceComm Booking" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: process.env.FREELANCECOMM_EMAIL || 'freelancecomm9@gmail.com',
        subject: `🎯 New Meeting Booked: ${userName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.95;
      font-size: 14px;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #D4AF37;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      margin: 12px 0;
      align-items: center;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 120px;
      font-size: 14px;
    }
    .info-value {
      color: #333;
      font-size: 14px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      margin: 8px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .button-primary {
      background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
      color: white;
    }
    .button-secondary {
      background: white;
      color: #D4AF37;
      border: 2px solid #D4AF37;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 12px;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
    .highlight {
      color: #D4AF37;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Meeting Booked!</h1>
      <p>You have a new appointment scheduled</p>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">👤 Client Name:</span>
        <span class="info-value"><strong>${userName}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">📧 Client Email:</span>
        <span class="info-value">${userEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🕐 Meeting Time:</span>
        <span class="info-value"><strong>${new Date(meetingTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        })} IST</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">⏱️ Duration:</span>
        <span class="info-value">30 minutes</span>
      </div>
    </div>

    <div class="button-container">
      <a href="${meetLink}" class="button button-primary">
        🎥 Join Google Meet
      </a>
      <a href="${calendarLink}" class="button button-secondary">
        📅 View in Calendar
      </a>
    </div>

    <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #2e7d32; font-size: 13px;">
        <strong>✅ Calendar Invite Sent:</strong> A Google Calendar invitation has been sent to <span class="highlight">${userEmail}</span>
      </p>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-size: 13px;">
        <strong>💡 Reminder:</strong> The meeting link and details are also available in your Google Calendar at <a href="https://calendar.google.com" style="color: #D4AF37;">calendar.google.com</a>
      </p>
    </div>

    <div class="footer">
      <p>This is an automated notification from FreelanceComm Booking System</p>
      <p style="margin-top: 8px;">
        <a href="https://calendar.google.com" style="color: #D4AF37; text-decoration: none;">Open Google Calendar</a> | 
        <a href="${calendarLink}" style="color: #D4AF37; text-decoration: none;">View Event</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
New Meeting Booked!

Client Name: ${userName}
Client Email: ${userEmail}
Meeting Time: ${new Date(meetingTime).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata'
        })} IST
Duration: 30 minutes

Google Meet Link: ${meetLink}
Calendar Link: ${calendarLink}

A Google Calendar invitation has been sent to ${userEmail}.

---
FreelanceComm Booking System
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Booking notification email sent to freelancer', {
        messageId: info.messageId,
        userName,
        userEmail
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error('Failed to send booking notification email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBookingConfirmationToUser(bookingDetails) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.initialized) {
      logger.warn('Email service not initialized - skipping email notification');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { userName, userEmail, meetingTime, meetLink, calendarLink } = bookingDetails;

      const mailOptions = {
        from: `"FreelanceComm" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `✅ Meeting Confirmed with FreelanceComm`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Meeting Confirmed!</h1>
    </div>
    <p>Hi ${userName},</p>
    <p>Your meeting with FreelanceComm has been successfully scheduled for:</p>
    <p style="font-size: 18px; font-weight: 600; color: #D4AF37; text-align: center; margin: 20px 0;">
      ${new Date(meetingTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })} IST
    </p>
    <div style="text-align: center;">
      <a href="${meetLink}" class="button">🎥 Join Google Meet</a>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      A calendar invitation has been sent to your email. We look forward to speaking with you!
    </p>
  </div>
</body>
</html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info('Confirmation email sent to user', {
        messageId: info.messageId,
        userEmail
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error('Failed to send confirmation email to user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = {
  emailService
};

const nodemailer = require('nodemailer');
const fs = require('fs');

class EmailService {
  constructor() {
    // Configure email transporter (using Gmail as example)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendBookingConfirmation(booking, user, room, pdfPath) {
    const startTime = new Date(booking.startTime).toLocaleString();
    const endTime = new Date(booking.endTime).toLocaleString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Confirmation - ${room.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed! 🎉</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Your meeting room booking has been confirmed. Please find the details below:</p>
              
              <div class="details">
                <h3>📋 Booking Details</h3>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
                
                <h3>🏢 Room Details</h3>
                <p><strong>Room:</strong> ${room.name}</p>
                <p><strong>Capacity:</strong> ${room.capacity} people</p>
                <p><strong>Equipment:</strong> ${room.equipment ? room.equipment.join(', ') : 'None'}</p>
                
                <h3>⏰ Time Details</h3>
                <p><strong>Start:</strong> ${startTime}</p>
                <p><strong>End:</strong> ${endTime}</p>
                <p><strong>Duration:</strong> ${(new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60)} hours</p>
              </div>
              
              <p>Please find your booking receipt attached to this email.</p>
              
              <p><strong>Important Notes:</strong></p>
              <ul>
                <li>Please arrive 5 minutes before your booking time</li>
                <li>You can cancel your booking up to 2 hours before the start time</li>
                <li>For any changes, please contact the admin</li>
              </ul>
              
              <p>Thank you for choosing our service!</p>
              <p>Best regards,<br>Meeting Room Management Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2026 Meeting Room Management System</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `booking_receipt_${booking.id}.pdf`,
          path: pdfPath
        }
      ]
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBookingCancellation(booking, user, room) {
    const startTime = new Date(booking.startTime).toLocaleString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Cancelled - ${room.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #f44336; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancelled ❌</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Your booking has been cancelled successfully.</p>
              
              <div class="details">
                <h3>Cancelled Booking Details</h3>
                <p><strong>Room:</strong> ${room.name}</p>
                <p><strong>Original Time:</strong> ${startTime}</p>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
              </div>
              
              <p>If you didn't request this cancellation, please contact support immediately.</p>
              <p>We hope to see you again soon!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
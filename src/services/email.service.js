const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Check if SMTP credentials are configured
    const hasValidCredentials = process.env.SMTP_USER && 
                                process.env.SMTP_PASS && 
                                process.env.SMTP_USER !== '' && 
                                process.env.SMTP_PASS !== '';
    
    if (hasValidCredentials) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      this.enabled = true;
      console.log('📧 Email service ENABLED');
    } else {
      this.enabled = false;
      console.log('⚠️ Email service DISABLED - No valid SMTP credentials in .env file');
      console.log('   To enable email, add SMTP_USER and SMTP_PASS to .env');
    }
  }

  async sendBookingConfirmation(booking, user, room, pdfPath) {
    if (!this.enabled) {
      console.log(`📧 [SKIP] Booking confirmation email for ${user.email}`);
      return { success: true, skipped: true };
    }

    const startTime = new Date(booking.startTime).toLocaleString();
    const endTime = new Date(booking.endTime).toLocaleString();
    const duration = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);

    const mailOptions = {
      from: process.env.SMTP_FROM || '"MeetingRoom Pro" <noreply@meetingroompro.com>',
      to: user.email,
      subject: `✅ Booking Confirmed: ${room.name} on ${new Date(booking.startTime).toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2>🎉 Booking Confirmed!</h2>
            <p>Your meeting room has been successfully booked</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>Your meeting room booking has been confirmed.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4f46e5;">
              <h3 style="margin: 0 0 10px 0;">📋 Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id.substring(0, 8)}...</p>
              <p><strong>Status:</strong> ${booking.status}</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4f46e5;">
              <h3 style="margin: 0 0 10px 0;">🏢 Room Details</h3>
              <p><strong>Room:</strong> ${room.name}</p>
              <p><strong>Capacity:</strong> ${room.capacity} people</p>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4f46e5;">
              <h3 style="margin: 0 0 10px 0;">⏰ Time Details</h3>
              <p><strong>Start:</strong> ${startTime}</p>
              <p><strong>End:</strong> ${endTime}</p>
              <p><strong>Duration:</strong> ${duration} hour(s)</p>
            </div>

            <p>Thank you for choosing MeetingRoom Pro!</p>
            <p>Best regards,<br><strong>MeetingRoom Pro Team</strong></p>
          </div>
        </div>
      `,
      attachments: pdfPath ? [
        {
          filename: `booking_receipt_${booking.id.substring(0, 8)}.pdf`,
          path: pdfPath
        }
      ] : []
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      if (info.messageId && info.messageId.includes('ethereal')) {
        console.log('🔍 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBookingCancellation(booking, user, room) {
    if (!this.enabled) {
      console.log(`📧 [SKIP] Cancellation email for ${user.email}`);
      return { success: true, skipped: true };
    }

    const startTime = new Date(booking.startTime).toLocaleString();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"MeetingRoom Pro" <noreply@meetingroompro.com>',
      to: user.email,
      subject: `❌ Booking Cancelled: ${room.name} on ${new Date(booking.startTime).toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2>❌ Booking Cancelled</h2>
            <p>Your meeting room booking has been cancelled</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>Your meeting room booking has been cancelled successfully.</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin: 0 0 10px 0;">Cancelled Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id.substring(0, 8)}...</p>
              <p><strong>Room:</strong> ${room.name}</p>
              <p><strong>Original Time:</strong> ${startTime}</p>
            </div>
            
            <p>If you didn't request this cancellation, please contact support immediately.</p>
            <p>We hope to see you again soon!</p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Cancellation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Cancellation email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    if (!this.enabled) {
      console.log(`📧 [SKIP] Welcome email to ${user.email}`);
      return { success: true, skipped: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"MeetingRoom Pro" <noreply@meetingroompro.com>',
      to: user.email,
      subject: '🎉 Welcome to MeetingRoom Pro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2>🎉 Welcome to MeetingRoom Pro!</h2>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>Thank you for joining MeetingRoom Pro! We're excited to help you manage your meeting rooms efficiently.</p>
            
            <h3>Getting Started:</h3>
            <ul>
              <li>📅 Book meeting rooms in seconds</li>
              <li>🔔 Receive booking confirmations</li>
              <li>📱 Manage your schedule from anywhere</li>
              <li>🔄 Cancel or reschedule bookings easily</li>
            </ul>
            
            <p>Best regards,<br><strong>MeetingRoom Pro Team</strong></p>
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Welcome email sent to:', user.email);
      if (info.messageId && info.messageId.includes('ethereal')) {
        console.log('🔍 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Welcome email failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
const bookingRepository = require('../repositories/booking.repository');
const roomRepository = require('../repositories/room.repository');
const { Worker } = require('worker_threads');
const path = require('path');
const prisma = require('../utils/prisma');
const emailService = require('./email.service');
const pdfService = require('./pdf.service');

class BookingService {
  async createBooking(userId, bookingData) {
    const { roomId, startTime, endTime } = bookingData;

    // Check if room exists
    const room = await roomRepository.findRoomById(roomId);
    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }
    // Check for overlapping bookings
    const overlapping = await bookingRepository.checkOverlap(roomId, startTime, endTime);

    if (overlapping) {
      const error = new Error('Room is already booked for the selected time slot');
      error.statusCode = 409;
      throw error;
    }

    // Create booking
    const booking = await bookingRepository.createBooking({
      userId,
      roomId,
      startTime,
      endTime,
    });

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log(`📅 Booking created: ${booking.id} for user ${user.email}`);

    // Generate PDF receipt and send email (asynchronously - doesn't block response)
    this.generateReceiptAndSendEmail(booking, user, room).catch((error) => {
      console.error('Failed to generate receipt/send email:', error);
    });

    return booking;
  }

  // New method to handle PDF generation and email sending
  async generateReceiptAndSendEmail(booking, user, room) {
    try {
      // Generate PDF receipt
      const pdfResult = await pdfService.generateBookingReceipt(booking, user, room);
      console.log('📄 PDF generated:', pdfResult.filename);

      // Send email with PDF attachment
      const emailResult = await emailService.sendBookingConfirmation(
        booking,
        user,
        room,
        pdfResult.filepath
      );

      if (emailResult.success) {
        console.log('📧 Confirmation email sent to:', user.email);
      } else {
        console.error('❌ Email failed:', emailResult.error);
      }
    } catch (error) {
      console.error('❌ Receipt generation failed:', error);
    }
  }
  async getUserBookings(userId, page, limit, status) {
    return await bookingRepository.findUserBookings(userId, page, limit, status);
  }

  async getAllBookings(page, limit, filters, userRole, userId) {
    if (userRole !== 'ADMIN') {
      return await bookingRepository.findUserBookings(userId, page, limit);
    }
    return await bookingRepository.findAllBookings(page, limit, filters);
  }

  async getBookingById(bookingId, userId, userRole) {
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'ADMIN' && booking.userId !== userId) {
      const error = new Error('You do not have permission to view this booking');
      error.statusCode = 403;
      throw error;
    }

    return booking;
  }

  async cancelBooking(bookingId, userId, userRole) {
    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'ADMIN' && booking.userId !== userId) {
      const error = new Error('You do not have permission to cancel this booking');
      error.statusCode = 403;
      throw error;
    }

    if (new Date(booking.startTime) < new Date()) {
      const error = new Error('Cannot cancel past bookings');
      error.statusCode = 400;
      throw error;
    }

    if (booking.status === 'CANCELLED') {
      const error = new Error('Booking is already cancelled');
      error.statusCode = 400;
      throw error;
    }

    const cancelledBooking = await bookingRepository.cancelBooking(bookingId);

    // Send cancellation email (asynchronously)
    this.sendCancellationEmail(cancelledBooking).catch((error) => {
      console.error('Failed to send cancellation email:', error);
    });

    return cancelledBooking;
  }

  // New method to handle cancellation email
  async sendCancellationEmail(booking) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: booking.userId },
      });
      const room = await roomRepository.findRoomById(booking.roomId);

      const emailResult = await emailService.sendBookingCancellation(booking, user, room);

      if (emailResult.success) {
        console.log('📧 Cancellation email sent to:', user.email);
      } else {
        console.error('❌ Cancellation email failed:', emailResult.error);
      }
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error);
    }
  }

  async getUpcomingBookings(userId) {
    return await bookingRepository.getUserUpcomingBookings(userId);
  }
}

module.exports = new BookingService();

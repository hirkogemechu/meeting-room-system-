const bookingRepository = require('../repositories/booking.repository');
const roomRepository = require('../repositories/room.repository');
const { Worker } = require('worker_threads');
const path = require('path');
const prisma = require('../utils/prisma');

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
    const overlapping = await bookingRepository.checkOverlap(
      roomId, 
      startTime, 
      endTime
    );
    
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
      endTime
    });
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    // Generate PDF receipt (without email for now to avoid errors)
    // We'll add email later after configuring SMTP
    console.log(`Booking created: ${booking.id} for user ${user.email}`);
    
    return booking;
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
    
    return await bookingRepository.cancelBooking(bookingId);
  }
  
  async getUpcomingBookings(userId) {
    return await bookingRepository.getUserUpcomingBookings(userId);
  }
}

module.exports = new BookingService();
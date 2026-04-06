const bookingService = require('../services/booking.service');
const { Parser } = require('json2csv');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const userId = req.user.id;
      const booking = await bookingService.createBooking(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBookings(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const result = await bookingService.getUserBookings(userId, parseInt(page), parseInt(limit));
      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          page: result.page,
          limit: parseInt(limit),
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await bookingService.getAllBookings(parseInt(page), parseInt(limit));
      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          page: result.page,
          limit: parseInt(limit),
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id);
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
async cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;           // Get from authenticated user
    const userRole = req.user.role;       // Get from authenticated user
    
    const booking = await bookingService.cancelBooking(id, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

  async getUpcomingBookings(req, res, next) {
    try {
      const userId = req.user.id;
      const bookings = await bookingService.getUpcomingBookings(userId);
      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

 // Add this method to your BookingController class
async exportBookings(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const prisma = require('../utils/prisma');
    
    // Get all bookings with relations
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        room: {
          select: {
            name: true,
            capacity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (format === 'csv') {
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings_export.csv');
      
      // Write CSV header
      const headers = ['Booking ID', 'User Name', 'User Email', 'Room Name', 'Start Time', 'End Time', 'Status', 'Created At'];
      res.write(headers.join(',') + '\n');
      
      // Write each booking
      for (const booking of bookings) {
        const row = [
          `"${booking.id}"`,
          `"${booking.user?.name || 'Unknown'}"`,
          `"${booking.user?.email || 'Unknown'}"`,
          `"${booking.room?.name || 'Unknown'}"`,
          `"${new Date(booking.startTime).toISOString()}"`,
          `"${new Date(booking.endTime).toISOString()}"`,
          booking.status,
          `"${new Date(booking.createdAt).toISOString()}"`
        ];
        res.write(row.join(',') + '\n');
      }
      
      res.end();
    } else {
      // JSON export
      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    next(error);
  }
}
}

module.exports = new BookingController();
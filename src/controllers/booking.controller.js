const bookingService = require('../services/booking.service');

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
      const { page = 1, limit = 10, status } = req.query;
      
      const result = await bookingService.getUserBookings(
        userId,
        parseInt(page),
        parseInt(limit),
        status
      );
      
      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          page: result.page,
          limit: result.limit,
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
      const userRole = req.user.role;
      const userId = req.user.id;
      const { page = 1, limit = 10, status, roomId, userId: filterUserId } = req.query;
      
      const filters = { status, roomId, userId: filterUserId };
      const result = await bookingService.getAllBookings(
        parseInt(page),
        parseInt(limit),
        filters,
        userRole,
        userId
      );
      
      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          page: result.page,
          limit: result.limit,
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
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const booking = await bookingService.getBookingById(id, userId, userRole);
      
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
      const userId = req.user.id;
      const userRole = req.user.role;
      
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
  
  // ADD THIS EXPORT METHOD
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
            booking.id,
            `"${booking.user.name}"`,
            booking.user.email,
            `"${booking.room.name}"`,
            new Date(booking.startTime).toISOString(),
            new Date(booking.endTime).toISOString(),
            booking.status,
            new Date(booking.createdAt).toISOString()
          ];
          res.write(row.join(',') + '\n');
        }
        
        res.end();
      } else {
        // JSON export
        res.status(200).json({
          success: true,
          data: bookings,
          count: bookings.length
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
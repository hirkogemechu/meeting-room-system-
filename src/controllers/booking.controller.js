const bookingService = require('../services/booking.service');
const { Parser } = require('json2csv');
const prisma = require('../utils/prisma');
class BookingController {
  async createBooking(req, res, next) {
    try {
      const userId = req.user.id;
      const booking = await bookingService.createBooking(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
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
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await bookingService.getAllBookings(
        parseInt(page),
        parseInt(limit),
        req.query,
        req.user.role,
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: result.bookings,
        pagination: {
          page: result.page,
          limit: parseInt(limit),
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(
        req.params.id,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: booking,
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
        data: booking,
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
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportBookings(req, res, next) {
    try {
      const { format = 'csv' } = req.query;

      const bookings = await prisma.booking.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          room: {
            select: {
              name: true,
              capacity: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // CSV EXPORT USING json2csv
      if (format === 'csv') {
        const data = bookings.map((booking) => ({
          bookingId: booking.id,
          userName: booking.user?.name || 'Unknown',
          userEmail: booking.user?.email || 'Unknown',
          roomName: booking.room?.name || 'Unknown',
          startTime: new Date(booking.startTime).toISOString(),
          endTime: new Date(booking.endTime).toISOString(),
          status: booking.status,
          createdAt: new Date(booking.createdAt).toISOString(),
        }));

        const fields = [
          'bookingId',
          'userName',
          'userEmail',
          'roomName',
          'startTime',
          'endTime',
          'status',
          'createdAt',
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings_export.csv');

        return res.status(200).send(csv);
      }

      // JSON EXPORT
      res.status(200).json({
        success: true,
        data: bookings,
        count: bookings.length,
        exportedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Export error:', error);
      next(error);
    }
  }
}

module.exports = new BookingController();

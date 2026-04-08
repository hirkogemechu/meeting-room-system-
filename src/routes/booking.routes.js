const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createBookingSchema } = require('../validations/booking.validation');
const bookingController = require('../controllers/booking.controller');

// User routes
router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/upcoming', protect, bookingController.getUpcomingBookings);

// IMPORTANT: Admin routes MUST come BEFORE the /:id route
router.get('/export', protect, adminOnly, bookingController.exportBookings);
router.get('/', protect, adminOnly, bookingController.getAllBookings);

// This route MUST come LAST - it catches any ID parameter
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;

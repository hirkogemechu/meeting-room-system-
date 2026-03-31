const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createBookingSchema, bookingFiltersSchema } = require('../validations/booking.validation');
const bookingController = require('../controllers/booking.controller');

// User routes
router.post('/', protect, validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/upcoming', protect, bookingController.getUpcomingBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

// Admin only routes
router.get('/', protect, adminOnly, bookingController.getAllBookings);
// Add this line with admin routes
router.get('/export', protect, adminOnly, bookingController.exportBookings);
module.exports = router;
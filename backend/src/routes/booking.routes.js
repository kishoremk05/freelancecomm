const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public endpoint for chatbot booking (no authentication required)
router.post('/', bookingController.createBooking);

// Check availability (public)
router.post('/availability', bookingController.checkAvailability);

// Protected routes (require authentication)
router.get('/', authMiddleware.authenticate, bookingController.getUserBookings);
router.get('/:bookingId', authMiddleware.authenticate, bookingController.getBookingById);
router.put('/:bookingId', authMiddleware.authenticate, bookingController.updateBooking);
router.delete('/:bookingId', authMiddleware.authenticate, bookingController.cancelBooking);
router.post('/:bookingId/reschedule', authMiddleware.authenticate, bookingController.rescheduleBooking);
router.get('/stats/overview', authMiddleware.authenticate, bookingController.getBookingStats);
router.post('/:bookingId/export', authMiddleware.authenticate, bookingController.exportToCalendar);
router.post('/:bookingId/reminder', authMiddleware.authenticate, bookingController.sendReminder);

module.exports = router;
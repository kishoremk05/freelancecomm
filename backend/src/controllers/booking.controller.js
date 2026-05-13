const { calendarService } = require('../services/calendar.service');
const { emailService } = require('../services/email.service');
const logger = require('../utils/logger');

const bookingController = {
  // Create a new Google Meet booking from chatbot
  createBooking: async (req, res) => {
    try {
      const { name, email, meetingTime, duration = 30, message } = req.body;

      // Validate required fields
      if (!name || !email || !meetingTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide name, email, and meeting time'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide a valid email address'
        });
      }

      // Parse meeting time
      const startTime = new Date(meetingTime);
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid meeting time format. Please use ISO 8601 format (e.g., 2024-05-08T14:00:00)'
        });
      }

      // Calculate end time
      const endTime = new Date(startTime.getTime() + duration * 60000);

      // Prepare booking data
      const bookingData = {
        title: `Meeting with ${name}`,
        description: message || `Meeting scheduled via FreelanceComm chatbot with ${name} (${email})`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeZone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata',
        attendees: [
          {
            email: email,
            displayName: name,
            responseStatus: 'needsAction'
          },
          {
            email: process.env.FREELANCECOMM_EMAIL || 'freelancecomm9@gmail.com',
            displayName: 'FreelanceComm',
            responseStatus: 'accepted',
            organizer: true
          }
        ]
      };

      // Create Google Meet event
      const meeting = await calendarService.createGoogleMeetEvent(bookingData);

      logger.info('Meeting created successfully', {
        userName: name,
        userEmail: email,
        meetingTime: startTime,
        meetLink: meeting.meetLink
      });

      // Send email notification to freelancer
      const emailDetails = {
        userName: name,
        userEmail: email,
        meetingTime: startTime.toISOString(),
        meetLink: meeting.meetLink,
        calendarLink: meeting.htmlLink,
        slot: meetingTime
      };

      // Send notification to freelancer (non-blocking)
      emailService.sendBookingNotificationToFreelancer(emailDetails)
        .then(result => {
          if (result.success) {
            logger.info('Freelancer notification email sent successfully');
          } else {
            logger.warn('Failed to send freelancer notification email:', result.error || result.message);
          }
        })
        .catch(err => {
          logger.error('Error sending freelancer notification:', err);
        });

      // Optionally send confirmation to user (non-blocking)
      emailService.sendBookingConfirmationToUser(emailDetails)
        .then(result => {
          if (result.success) {
            logger.info('User confirmation email sent successfully');
          } else {
            logger.warn('Failed to send user confirmation email:', result.error || result.message);
          }
        })
        .catch(err => {
          logger.error('Error sending user confirmation:', err);
        });

      // Return success response
      res.status(201).json({
        status: 'success',
        message: `Meeting scheduled successfully! Google Meet link has been sent to ${email} and freelancecomm9@gmail.com`,
        data: {
          bookingId: meeting.eventId,
          meetLink: meeting.meetLink,
          calendarLink: meeting.htmlLink,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          attendees: [email, 'freelancecomm9@gmail.com'],
          userName: name,
          userEmail: email
        }
      });
    } catch (error) {
      logger.error('Failed to create booking:', error);
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to create meeting. Please try again or contact support.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all bookings for the authenticated user
  getUserBookings: async (req, res) => {
    try {
      // This would fetch from database in production
      res.status(200).json({
        status: 'success',
        message: 'Get user bookings endpoint',
        data: {
          bookings: []
        }
      });
    } catch (error) {
      logger.error('Failed to get user bookings:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookings'
      });
    }
  },

  // Get a specific booking by ID
  getBookingById: async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      // Fetch event from Google Calendar
      const event = await calendarService.getEvent(bookingId);
      
      res.status(200).json({
        status: 'success',
        data: {
          booking: event
        }
      });
    } catch (error) {
      logger.error('Failed to get booking:', error);
      res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
  },

  // Update a booking
  updateBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const updates = req.body;
      
      const updatedEvent = await calendarService.updateEvent(bookingId, updates);
      
      res.status(200).json({
        status: 'success',
        message: 'Booking updated successfully',
        data: {
          booking: updatedEvent
        }
      });
    } catch (error) {
      logger.error('Failed to update booking:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update booking'
      });
    }
  },

  // Cancel a booking
  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      await calendarService.deleteEvent(bookingId);
      
      res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully',
        data: {
          success: true
        }
      });
    } catch (error) {
      logger.error('Failed to cancel booking:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel booking'
      });
    }
  },

  // Reschedule a booking
  rescheduleBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { newStartTime, duration = 30 } = req.body;
      
      if (!newStartTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide new start time'
        });
      }
      
      const startTime = new Date(newStartTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const updates = {
        start: {
          dateTime: startTime.toISOString(),
          timeZone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata'
        }
      };
      
      const updatedEvent = await calendarService.updateEvent(bookingId, updates);
      
      res.status(200).json({
        status: 'success',
        message: 'Booking rescheduled successfully',
        data: {
          booking: updatedEvent
        }
      });
    } catch (error) {
      logger.error('Failed to reschedule booking:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reschedule booking'
      });
    }
  },

  // Check availability for a time slot
  checkAvailability: async (req, res) => {
    try {
      const { startTime, endTime } = req.body;
      
      if (!startTime || !endTime) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide start time and end time'
        });
      }
      
      const availability = await calendarService.checkAvailability({
        startTime,
        endTime,
        timeZone: process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata'
      });
      
      res.status(200).json({
        status: 'success',
        data: availability
      });
    } catch (error) {
      logger.error('Failed to check availability:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check availability'
      });
    }
  },

  // Get booking statistics
  getBookingStats: async (req, res) => {
    try {
      // This would fetch from database in production
      res.status(200).json({
        status: 'success',
        data: {
          totalBookings: 0,
          completed: 0,
          cancelled: 0,
          upcoming: 0
        }
      });
    } catch (error) {
      logger.error('Failed to get booking stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve statistics'
      });
    }
  },

  // Export booking to Google Calendar
  exportToCalendar: async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      const event = await calendarService.getEvent(bookingId);
      
      res.status(200).json({
        status: 'success',
        message: 'Booking exported successfully',
        data: {
          calendarLink: event.htmlLink,
          icsLink: event.htmlLink + '/ical'
        }
      });
    } catch (error) {
      logger.error('Failed to export booking:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to export booking'
      });
    }
  },

  // Send booking reminder
  sendReminder: async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      // This would send email/SMS reminder in production
      res.status(200).json({
        status: 'success',
        message: 'Reminder sent successfully',
        data: {
          success: true
        }
      });
    } catch (error) {
      logger.error('Failed to send reminder:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send reminder'
      });
    }
  }
};

module.exports = bookingController;
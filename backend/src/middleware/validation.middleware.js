// Validation Middleware
// This middleware handles request validation

const { body, validationResult } = require('express-validator');

// Validation rules for booking creation
const validateBooking = [
  body('startTime')
    .isISO8601().withMessage('Invalid start time format')
    .notEmpty().withMessage('Start time is required'),
  body('endTime')
    .isISO8601().withMessage('Invalid end time format')
    .notEmpty().withMessage('End time is required'),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('attendees')
    .optional()
    .isArray().withMessage('Attendees must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for booking update
const validateBookingUpdate = [
  body('startTime')
    .isISO8601().withMessage('Invalid start time format')
    .optional(),
  body('endTime')
    .isISO8601().withMessage('Invalid end time format')
    .optional(),
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for reschedule
const validateReschedule = [
  body('newStartTime')
    .isISO8601().withMessage('Invalid new start time format')
    .notEmpty().withMessage('New start time is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for availability check
const validateAvailabilityCheck = [
  body('startTime')
    .isISO8601().withMessage('Invalid start time format')
    .notEmpty().withMessage('Start time is required'),
  body('endTime')
    .isISO8601().withMessage('Invalid end time format')
    .notEmpty().withMessage('End time is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateBooking,
  validateBookingUpdate,
  validateReschedule,
  validateAvailabilityCheck
};
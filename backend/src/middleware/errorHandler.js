const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error types
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(`${service}: ${message}`, 502);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong!';

  // Log error
  if (err.isOperational) {
    logger.warn(`Operational Error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.error(`Programming Error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      status: err.status,
      message: err.message
    };

    // Add additional error details if available
    if (err.errors) response.errors = err.errors;
    if (err.service) response.service = err.service;

    res.status(err.statusCode).json(response);
  } 
  // Programming or unknown error: don't leak error details
  else {
    // Log error for debugging
    logger.error('Unexpected error:', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// Handle specific error types
const handleJWTError = () => new AuthenticationError('Invalid token. Please log in again.');
const handleJWTExpiredError = () => new AuthenticationError('Your token has expired. Please log in again.');
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new ValidationError('Invalid input data', errors);
};
const handleDuplicateKeyErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new ConflictError(`Duplicate field value: ${value}. Please use another value.`);
};
const handleCastErrorDB = (err) => {
  return new ValidationError(`Invalid ${err.path}: ${err.value}`);
};

// Handle unhandled routes
const handleNotFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

// Async error wrapper (for async route handlers)
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  errorHandler,
  handleNotFound,
  catchAsync,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  handleJWTError,
  handleJWTExpiredError,
  handleValidationErrorDB,
  handleDuplicateKeyErrorDB,
  handleCastErrorDB
};
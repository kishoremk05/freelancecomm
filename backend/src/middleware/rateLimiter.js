const rateLimit = require('express-rate-limit');

// Different rate limits for different endpoints
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use IP + user ID if available for more granular limiting
    return req.ip + (req.user?.id || '');
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      error: options.message.error,
      retryAfter: options.message.retryAfter,
      currentLimit: options.max,
      windowMs: options.windowMs
    });
  }
});

// Stricter limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip
});

// More relaxed limit for webhooks (chatbots might send many messages)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: 'Too many webhook requests, please slow down.',
    retryAfter: '1 minute'
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip
});

// Limit for booking creation to prevent spam
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 bookings per hour
  message: {
    error: 'Too many booking requests, please try again later.',
    retryAfter: '1 hour'
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Global rate limiter middleware
const rateLimiter = (req, res, next) => {
  // Apply different limiters based on route
  if (req.path.startsWith('/api/auth')) {
    return authLimiter(req, res, next);
  } else if (req.path.startsWith('/api/webhooks')) {
    return webhookLimiter(req, res, next);
  } else if (req.path.startsWith('/api/bookings') && req.method === 'POST') {
    return bookingLimiter(req, res, next);
  } else {
    return apiLimiter(req, res, next);
  }
};

// Export individual limiters for specific routes if needed
module.exports = rateLimiter;
module.exports.apiLimiter = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.webhookLimiter = webhookLimiter;
module.exports.bookingLimiter = bookingLimiter;
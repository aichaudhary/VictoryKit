const rateLimit = require('express-rate-limit');

// Create rate limiter middleware
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user?.isAdmin === true;
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip || req.connection.remoteAddress;
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Predefined rate limiters
const strictRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per 5 minutes
  message: {
    success: false,
    error: 'Rate limit exceeded. Please wait before making more requests.',
    retryAfter: 300
  }
});

const moderateRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
});

const lenientRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // 500 requests per hour
});

// URL analysis specific rate limit
const urlAnalysisRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 URL analyses per 15 minutes
  message: {
    success: false,
    error: 'URL analysis rate limit exceeded. Please try again later.',
    retryAfter: 900
  }
});

// Batch analysis rate limit (stricter)
const batchAnalysisRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 batch analyses per 15 minutes
  message: {
    success: false,
    error: 'Batch analysis rate limit exceeded. Please try again later.',
    retryAfter: 900
  }
});

// Admin operations rate limit
const adminRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 admin operations per hour
  skip: (req) => req.user?.isAdmin === true, // Skip for admins
});

module.exports = createRateLimit;
module.exports.strictRateLimit = strictRateLimit;
module.exports.moderateRateLimit = moderateRateLimit;
module.exports.lenientRateLimit = lenientRateLimit;
module.exports.urlAnalysisRateLimit = urlAnalysisRateLimit;
module.exports.batchAnalysisRateLimit = batchAnalysisRateLimit;
module.exports.adminRateLimit = adminRateLimit;
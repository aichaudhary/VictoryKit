#!/bin/bash
# Run this ON EC2 to fix the rate limiter

cat > ~/victorykit/backend/shared/middleware/rateLimiter.middleware.js << 'ENDFILE'
const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/apiError');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { success: false, statusCode: 429, message },
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw ApiError.tooManyRequests(message);
    }
  });
};

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many API requests'
});

const publicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  publicLimiter
};
ENDFILE

echo "✅ Rate limiter file fixed"
pm2 restart all
sleep 5
pm2 status
echo ""
echo "Testing health endpoints..."
curl -s http://localhost:4004/health && echo ""
curl -s http://localhost:4005/health && echo ""
curl -s http://localhost:4006/health && echo ""

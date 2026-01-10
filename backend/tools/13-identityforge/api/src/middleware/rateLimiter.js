/**
 * Rate Limiter Middleware
 * IdentityForge Tool 13
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin operations limiter
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 admin requests per hour
  message: {
    success: false,
    error: 'Too many admin operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create operations limiter
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 create operations per hour
  message: {
    success: false,
    error: 'Too many create operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  rateLimiter: apiLimiter,
  authLimiter,
  adminLimiter,
  createLimiter
};
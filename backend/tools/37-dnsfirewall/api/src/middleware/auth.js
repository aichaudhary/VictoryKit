const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid Bearer token in the Authorization header'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User authentication is required'
      });
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required role: ${allowedRoles.join(' or ')}, your role: ${req.user.role || 'none'}`,
        allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = requireRole(['admin']);

// Analyst or Admin middleware
const requireAnalystOrAdmin = requireRole(['admin', 'analyst']);

// User or higher middleware
const requireUserOrHigher = requireRole(['admin', 'analyst', 'user']);

// API Key Authentication (alternative to JWT for service-to-service)
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide a valid API key in X-API-Key header or apiKey query parameter'
    });
  }

  // In a real implementation, you would validate against a database
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  req.apiKey = apiKey;
  next();
};

// Combined authentication (JWT or API Key)
const authenticateFlexible = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // JWT authentication
    return authenticateToken(req, res, next);
  } else if (apiKey) {
    // API key authentication
    return authenticateApiKey(req, res, () => {
      req.user = { role: 'service', apiKey: true };
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide either a Bearer token or API key'
    });
  }
};

// Request Logging Middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

  // Log user info if authenticated
  if (req.user) {
    console.log(`  User: ${req.user.id || 'unknown'} (${req.user.role || 'no role'})`);
  }

  next();
};

// Security Headers Middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

// CORS Middleware
const corsHandler = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',') :
    ['http://localhost:3000', 'http://localhost:3001'];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

// Input Validation Middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Rate Limiting Middleware (DNS Shield specific)
const createDNSAnalysisLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 DNS analysis requests per windowMs
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many DNS analysis requests. Please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user && req.user.role === 'admin';
    }
  });
};

const createAdminActionLimiter = () => {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 admin actions per hour
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many administrative actions. Please try again later.',
      retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Error Handling Middleware
const errorHandler = (error, req, res, next) => {
  console.error('Middleware Error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'The provided authentication token is invalid'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'The authentication token has expired'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAnalystOrAdmin,
  requireUserOrHigher,
  authenticateApiKey,
  authenticateFlexible,
  requestLogger,
  securityHeaders,
  corsHandler,
  validateInput,
  createDNSAnalysisLimiter,
  createAdminActionLimiter,
  errorHandler
};
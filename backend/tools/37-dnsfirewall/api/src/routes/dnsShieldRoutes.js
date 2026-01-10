const express = require('express');
const dnsShieldController = require('../controllers/dnsShieldController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Global rate limiting for DNS Shield API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 requests per hour for sensitive operations
  message: 'Rate limit exceeded for sensitive operations. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiting
router.use(globalLimiter);

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'DNS Shield API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    service: 'DNS Shield API',
    version: '1.0.0',
    endpoints: {
      'POST /analyze': 'Analyze DNS query for threats',
      'GET /domain/:domain/reputation': 'Get domain reputation',
      'GET /stats': 'Get DNS statistics',
      'GET /threats/top': 'Get top threats',
      'GET /queries': 'Get DNS query history',
      'GET /policies': 'Get DNS policies',
      'POST /policies': 'Create DNS policy',
      'PUT /policies/:policyId': 'Update DNS policy',
      'DELETE /policies/:policyId': 'Delete DNS policy',
      'GET /alerts': 'Get DNS alerts',
      'POST /alerts': 'Create DNS alert',
      'PUT /alerts/:alertId/status': 'Update alert status',
      'GET /reports': 'Get DNS reports',
      'POST /reports/generate': 'Generate DNS report',
      'POST /ml/analyze': 'ML analysis integration',
      'POST /integrate/security-stack': 'Security stack integration'
    },
    authentication: 'Bearer token required',
    rateLimits: {
      global: '1000 requests per 15 minutes',
      analysis: '100 requests per 15 minutes',
      sensitive: '50 requests per hour'
    }
  });
});

// Apply authentication to all routes below
router.use(authenticateToken);

// DNS Analysis Routes
router.post('/analyze', dnsShieldController);
router.get('/domain/:domain/reputation', dnsShieldController);

// Statistics and Monitoring Routes
router.get('/stats', requireRole(['admin', 'analyst']), dnsShieldController);
router.get('/threats/top', requireRole(['admin', 'analyst']), dnsShieldController);
router.get('/queries', requireRole(['admin', 'analyst']), dnsShieldController);

// Policy Management Routes (Admin only)
router.get('/policies', requireRole(['admin']), dnsShieldController);
router.post('/policies', requireRole(['admin']), strictLimiter, dnsShieldController);
router.put('/policies/:policyId', requireRole(['admin']), strictLimiter, dnsShieldController);
router.delete('/policies/:policyId', requireRole(['admin']), strictLimiter, dnsShieldController);

// Alert Management Routes
router.get('/alerts', requireRole(['admin', 'analyst']), dnsShieldController);
router.post('/alerts', requireRole(['admin', 'analyst']), dnsShieldController);
router.put('/alerts/:alertId/status', requireRole(['admin', 'analyst']), dnsShieldController);

// Report Generation Routes
router.get('/reports', requireRole(['admin', 'analyst']), dnsShieldController);
router.post('/reports/generate', requireRole(['admin', 'analyst']), strictLimiter, dnsShieldController);

// Advanced Integration Routes (Admin only)
router.post('/ml/analyze', requireRole(['admin', 'analyst']), dnsShieldController);
router.post('/integrate/security-stack', requireRole(['admin']), strictLimiter, dnsShieldController);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('DNS Shield API Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: 'Invalid or missing authentication token'
    });
  }

  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      details: 'Insufficient permissions'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found in DNS Shield API`,
    availableEndpoints: [
      'GET /health',
      'GET /docs',
      'POST /analyze',
      'GET /domain/:domain/reputation',
      'GET /stats',
      'GET /threats/top',
      'GET /queries',
      'GET /policies',
      'POST /policies',
      'PUT /policies/:policyId',
      'DELETE /policies/:policyId',
      'GET /alerts',
      'POST /alerts',
      'PUT /alerts/:alertId/status',
      'GET /reports',
      'POST /reports/generate',
      'POST /ml/analyze',
      'POST /integrate/security-stack'
    ]
  });
});

module.exports = router;
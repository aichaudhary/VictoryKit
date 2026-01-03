const express = require('express');
const router = express.Router();
const webFilterController = require('../controllers/webFilterController');
const { authenticate, authorize } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

// Apply authentication to all routes
router.use(authenticate);

// URL Analysis Routes
router.post('/analyze', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), webFilterController.analyzeUrl);
router.post('/analyze/batch', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), webFilterController.batchAnalyzeUrls);

// Policy Management Routes (Admin only)
router.post('/policies', authorize(['admin']), webFilterController.createPolicy);
router.get('/policies', authorize(['admin', 'user']), webFilterController.getPolicies);
router.put('/policies/:id', authorize(['admin']), webFilterController.updatePolicy);
router.delete('/policies/:id', authorize(['admin']), webFilterController.deletePolicy);

// User Profile Routes
router.get('/profile/:userId?', webFilterController.getUserProfile);
router.put('/profile/:userId?', webFilterController.updateUserProfile);

// Access Log Routes
router.get('/logs', authorize(['admin']), webFilterController.getAccessLogs);

// Alert Management Routes
router.get('/alerts', authorize(['admin']), webFilterController.getAlerts);
router.put('/alerts/:id/resolve', authorize(['admin']), webFilterController.resolveAlert);

// Reporting Routes
router.get('/reports', authorize(['admin']), webFilterController.getReports);
router.post('/reports/generate', authorize(['admin']), webFilterController.generateReport);

// Real-time Statistics Route
router.get('/stats/realtime', authorize(['admin']), webFilterController.getRealTimeStats);

// Health Check Route (no auth required for monitoring)
router.get('/health', webFilterController.healthCheck);

// Legacy routes for backward compatibility
router.post('/scan', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), webFilterController.scan);

module.exports = router;
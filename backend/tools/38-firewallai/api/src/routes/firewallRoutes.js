const express = require('express');
const router = express.Router();
const firewallController = require('../controllers/firewallController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for sensitive operations
  message: 'Too many sensitive operations from this IP, please try again later.'
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Health check (no auth required)
router.get('/health', firewallController.healthCheck);

// Apply authentication to all routes below
router.use(authenticateToken);

// Firewall Rules Management
router.get('/rules', firewallController.getRules);
router.get('/rules/:id', firewallController.getRule);
router.post('/rules', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.createRule);
router.put('/rules/:id', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.updateRule);
router.delete('/rules/:id', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.deleteRule);
router.patch('/rules/:id/enable', requireRole(['admin', 'firewall_admin']), firewallController.enableRule);
router.patch('/rules/:id/disable', requireRole(['admin', 'firewall_admin']), firewallController.disableRule);

// Firewall Policies Management
router.get('/policies', firewallController.getPolicies);
router.get('/policies/:id', firewallController.getPolicy);
router.post('/policies', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.createPolicy);
router.put('/policies/:id', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.updatePolicy);
router.delete('/policies/:id', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.deletePolicy);

// Traffic Logs Management
router.get('/logs', firewallController.getTrafficLogs);
router.get('/logs/:id', firewallController.getTrafficLog);

// Alerts Management
router.get('/alerts', firewallController.getAlerts);
router.get('/alerts/:id', firewallController.getAlert);
router.patch('/alerts/:id/acknowledge', requireRole(['admin', 'firewall_admin', 'analyst']), firewallController.acknowledgeAlert);
router.patch('/alerts/:id/resolve', requireRole(['admin', 'firewall_admin']), firewallController.resolveAlert);

// Analytics and Reporting
router.get('/analytics', firewallController.getAnalytics);
router.get('/analytics/latest', firewallController.getLatestAnalytics);

// ML Analysis and Threat Detection
router.post('/analyze', requireRole(['admin', 'firewall_admin', 'analyst']), firewallController.analyzeTraffic);
router.post('/scan', requireRole(['admin', 'firewall_admin']), strictLimiter, firewallController.scanNetwork);

// Real-time Monitoring
router.post('/monitoring/start', requireRole(['admin', 'firewall_admin']), firewallController.startMonitoring);
router.post('/monitoring/stop', requireRole(['admin', 'firewall_admin']), firewallController.stopMonitoring);

// Vendor API Integration
router.post('/sync/rules', requireRole(['admin', 'firewall_admin']), firewallController.syncVendorRules);
router.post('/sync/logs', requireRole(['admin', 'firewall_admin']), firewallController.syncVendorLogs);

// Security Stack Integration
router.post('/integrate', requireRole(['admin', 'firewall_admin']), firewallController.integrateWithSecurityStack);

// Audit Trail
router.get('/audit', requireRole(['admin', 'firewall_admin']), firewallController.getAuditTrailPro);

module.exports = router;
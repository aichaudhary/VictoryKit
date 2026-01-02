const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth.middleware');

// Validation rules
const logIdValidation = [
  param('logId').isMongoId().withMessage('Valid log ID is required')
];

const userIdValidation = [
  param('targetUserId').isMongoId().withMessage('Valid user ID is required')
];

const resourceValidation = [
  param('resourceType').isIn(['user', 'vault', 'secret', 'organization', 'api_key']).withMessage('Invalid resource type'),
  param('resourceId').isMongoId().withMessage('Valid resource ID is required')
];

const alertIdValidation = [
  param('alertId').isMongoId().withMessage('Valid alert ID is required')
];

const dateRangeValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
];

const retentionSettingsValidation = [
  body('retentionPeriod').isInt({ min: 30, max: 2555 }).withMessage('Retention period must be between 30 and 2555 days'),
  body('archiveAfter').optional().isInt({ min: 30, max: 2555 }).withMessage('Archive after must be between 30 and 2555 days'),
  body('deleteAfter').optional().isInt({ min: 30, max: 2555 }).withMessage('Delete after must be between 30 and 2555 days')
];

const archiveDeleteValidation = [
  body('olderThan').isISO8601().withMessage('Valid date is required')
];

// All routes require authentication
router.use(auth);

// Audit log queries
router.get('/logs', dateRangeValidation, auditController.getAuditLogs);
router.get('/logs/:logId', logIdValidation, auditController.getAuditLog);

// Audit statistics and reports
router.get('/stats', dateRangeValidation, auditController.getAuditStats);
router.get('/reports/compliance', [
  query('standard').optional().isIn(['SOC2', 'HIPAA', 'PCI_DSS', 'GDPR']).withMessage('Invalid compliance standard')
].concat(dateRangeValidation), auditController.getComplianceReport);

router.get('/reports/export', [
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid export format')
].concat(dateRangeValidation), auditController.exportAuditLogs);

router.post('/reports/generate', [
  body('reportType').isIn(['activity', 'security', 'compliance', 'access']).withMessage('Invalid report type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('format').optional().isIn(['pdf', 'csv', 'json']).withMessage('Invalid format'),
  body('filters').optional().isObject().withMessage('Filters must be an object')
], auditController.generateAuditReport);

// Security alerts
router.get('/alerts', [
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  query('resolved').optional().isBoolean().withMessage('Resolved must be a boolean')
].concat(dateRangeValidation), auditController.getSecurityAlerts);

router.put('/alerts/:alertId/resolve', alertIdValidation.concat([
  body('resolution').trim().isLength({ min: 1 }).withMessage('Resolution is required'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
]), auditController.resolveSecurityAlert);

// User activity analysis
router.get('/users/:targetUserId/activity', userIdValidation.concat(dateRangeValidation), auditController.getUserActivitySummary);

// Resource activity analysis
router.get('/resources/:resourceType/:resourceId/activity', resourceValidation.concat(dateRangeValidation), auditController.getResourceActivitySummary);

// Security monitoring
router.get('/security/failed-logins', dateRangeValidation, auditController.getFailedLoginAttempts);
router.get('/security/suspicious-activity', [
  query('activityType').optional().isIn(['brute_force', 'unusual_access', 'data_exfiltration', 'privilege_escalation']).withMessage('Invalid activity type')
].concat(dateRangeValidation), auditController.getSuspiciousActivities);

router.get('/security/data-access-patterns', [
  query('groupBy').optional().isIn(['user', 'resource', 'time']).withMessage('Invalid group by parameter')
].concat(dateRangeValidation), auditController.getDataAccessPatterns);

// Compliance monitoring
router.get('/compliance/violations', [
  query('standard').optional().isIn(['SOC2', 'HIPAA', 'PCI_DSS', 'GDPR']).withMessage('Invalid compliance standard'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity')
].concat(dateRangeValidation), auditController.getComplianceViolations);

// Audit retention management
router.get('/retention/settings', auditController.getAuditRetentionSettings);
router.put('/retention/settings', retentionSettingsValidation, auditController.updateAuditRetentionSettings);
router.post('/retention/archive', archiveDeleteValidation, auditController.archiveAuditLogs);
router.post('/retention/delete', archiveDeleteValidation, auditController.deleteAuditLogs);

// Dashboard data
router.get('/dashboard', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], auditController.getAuditDashboard);

module.exports = router;
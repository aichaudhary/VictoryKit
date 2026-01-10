const express = require('express');
const router = express.Router();
const controller = require('../controllers');

/**
 * PrivacyShield API Routes
 * RESTful endpoints for privacy protection operations
 */

// ===== System =====
router.get('/status', controller.getStatus);
router.get('/config', controller.getConfig);

// ===== PII Detection & Classification =====
router.post('/pii/scan', controller.scanForPII);
router.get('/pii/records', controller.getPIIRecords);
router.put('/pii/records/:recordId/remediate', controller.remediatePII);
router.get('/pii/stats', controller.getPIIStats);

// ===== Privacy Policy Management =====
router.post('/policies', controller.createPolicy);
router.get('/policies', controller.getPolicies);
router.get('/policies/active', controller.getActivePolicy);
router.put('/policies/:policyId/publish', controller.publishPolicy);

// ===== Consent Management =====
router.post('/consents', controller.recordConsent);
router.get('/consents', controller.getConsents);
router.put('/consents/:consentId/withdraw', controller.withdrawConsent);
router.get('/consents/stats', controller.getConsentStats);

// ===== Data Mapping & ROPA =====
router.post('/mappings', controller.createMapping);
router.get('/mappings', controller.getMappings);
router.get('/mappings/:mappingId/article30', controller.generateArticle30);
router.put('/mappings/:mappingId/risk', controller.calculateMappingRisk);

// ===== Privacy Impact Assessments =====
router.post('/assessments', controller.createAssessment);
router.get('/assessments', controller.getAssessments);
router.put('/assessments/:assessmentId/complete', controller.completeAssessment);
router.get('/assessments/high-risk', controller.findHighRiskQuantifyments);

// ===== Data Subject Rights / DSAR =====
router.post('/dsar', controller.createDSAR);
router.get('/dsar', controller.getDSARs);
router.put('/dsar/:requestId/complete', controller.completeDSAR);
router.get('/dsar/overdue', controller.findOverdueDSARs);

// ===== Third-Party Trackers =====
router.post('/trackers/scan', controller.scanTrackers);
router.get('/trackers', controller.getTrackers);
router.get('/trackers/category/:category', controller.getTrackersByCategory);

// ===== Compliance Reporting =====
router.post('/reports', controller.generateReport);
router.get('/reports', controller.getReports);
router.get('/reports/score', controller.getComplianceScore);

module.exports = router;

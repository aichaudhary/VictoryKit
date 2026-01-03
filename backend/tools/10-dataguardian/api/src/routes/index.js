const express = require('express');
const router = express.Router();

const assetController = require('../controllers/assetController');
const policyController = require('../controllers/policyController');
const incidentController = require('../controllers/incidentController');
const scanController = require('../controllers/scanController');

// ==================== ASSET ROUTES ====================
router.post('/assets', assetController.create);
router.get('/assets', assetController.list);
router.get('/assets/:id', assetController.get);
router.put('/assets/:id', assetController.update);
router.delete('/assets/:id', assetController.delete);
router.post('/assets/:id/classify', assetController.classify);
router.get('/assets/:id/risk', assetController.assessRisk);
router.post('/scan/pii', assetController.scanPII);

// ==================== POLICY ROUTES ====================
router.post('/policies', policyController.create);
router.get('/policies', policyController.list);
router.get('/policies/:id', policyController.get);
router.put('/policies/:id', policyController.update);
router.delete('/policies/:id', policyController.delete);
router.post('/policies/:id/activate', policyController.activate);
router.post('/policies/:id/evaluate', policyController.evaluate);
router.get('/policies/:id/violations', policyController.getViolations);

// ==================== INCIDENT ROUTES ====================
router.post('/incidents', incidentController.create);
router.get('/incidents', incidentController.list);
router.get('/incidents/dashboard', incidentController.dashboard);
router.get('/incidents/:id', incidentController.get);
router.put('/incidents/:id', incidentController.update);
router.post('/incidents/:id/actions', incidentController.addAction);
router.post('/incidents/:id/analyze', incidentController.analyze);

// ==================== DSR (DATA SUBJECT REQUEST) ROUTES ====================
// Manage GDPR/CCPA Data Subject Requests
router.post('/dsr', scanController.createDSR);
router.get('/dsr', scanController.getDSRs);
router.get('/dsr/dashboard', scanController.getDSRDashboard);
router.get('/dsr/:id', scanController.getDSR);
router.post('/dsr/:id/process', scanController.processDSR);

// Data Discovery & PIA
router.post('/discovery', scanController.discoverData);
router.post('/pia', scanController.performPIA);

// ==================== CONSENT ROUTES ====================
// Manage user consent for data processing
router.post('/consent', scanController.recordConsent);
router.post('/consent/verify', scanController.verifyConsent);
router.get('/consent/check', scanController.checkConsent);
router.get('/consent/dashboard', scanController.getConsentDashboard);
router.delete('/consent/:id', scanController.withdrawConsent);
router.get('/consent/subject/:identifier', scanController.getDataSubjectConsents);
router.get('/consent/preferences/:identifier', scanController.getConsentPreferences);
router.put('/consent/preferences/:identifier', scanController.updatePreferences);

// ==================== RETENTION ROUTES ====================
// Manage data retention policies and lifecycle
router.post('/retention', scanController.createRetentionPolicy);
router.get('/retention', scanController.getRetentionPolicies);
router.get('/retention/dashboard', scanController.getRetentionDashboard);
router.get('/retention/pending', scanController.getPendingDispositions);
router.get('/retention/:id', scanController.getRetentionPolicy);
router.put('/retention/:id', scanController.updateRetentionPolicy);
router.delete('/retention/:id', scanController.deleteRetentionPolicy);
router.post('/retention/:id/execute', scanController.executeRetentionPolicy);
router.post('/retention/:id/hold', scanController.applyLegalHold);
router.delete('/retention/:id/hold', scanController.releaseLegalHold);
router.post('/retention/:id/approve', scanController.approveDisposition);

// ==================== UNIFIED DASHBOARD ====================
// Get combined view of DSR, Consent, and Retention
router.get('/dashboard/unified', scanController.getUnifiedDashboard);

module.exports = router;

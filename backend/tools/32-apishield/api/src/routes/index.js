const express = require('express');
const router = express.Router();

// Controllers
const scanController = require('./controllers/scan.controller');
const vulnController = require('./controllers/vulnerabilities.controller');
const endpointController = require('./controllers/endpoints.controller');
const specController = require('./controllers/specs.controller');
const fuzzerController = require('./controllers/fuzzer.controller');
const authController = require('./controllers/auth.controller');
const dashboardController = require('./controllers/dashboard.controller');

// ==========================================
// Dashboard Routes
// ==========================================
router.get('/dashboard', dashboardController.getDashboard);
router.get('/dashboard/trends', dashboardController.getTrends);
router.get('/dashboard/export', dashboardController.exportReport);

// ==========================================
// Scan Routes
// ==========================================
router.post('/scans', scanController.startScan);
router.get('/scans', scanController.listScans);
router.get('/scans/:id', scanController.getScanStatus);
router.get('/scans/:id/results', scanController.getScanResults);
router.post('/scans/:id/cancel', scanController.cancelScan);

// ==========================================
// Vulnerability Routes
// ==========================================
router.get('/vulnerabilities', vulnController.getVulnerabilities);
router.get('/vulnerabilities/stats', vulnController.getVulnerabilityStats);
router.get('/vulnerabilities/:id', vulnController.getVulnerability);
router.patch('/vulnerabilities/:id/status', vulnController.updateVulnerabilityStatus);
router.get('/vulnerabilities/:id/remediation', vulnController.getRemediationCode);

// ==========================================
// Endpoint Routes
// ==========================================
router.get('/endpoints', endpointController.getEndpoints);
router.get('/endpoints/stats', endpointController.getEndpointStats);
router.post('/endpoints', endpointController.createEndpoint);
router.get('/endpoints/:id', endpointController.getEndpoint);
router.put('/endpoints/:id', endpointController.updateEndpoint);
router.delete('/endpoints/:id', endpointController.deleteEndpoint);

// ==========================================
// API Spec Routes
// ==========================================
router.get('/specs', specController.getSpecs);
router.post('/specs', specController.createSpec);
router.get('/specs/:id', specController.getSpec);
router.put('/specs/:id', specController.updateSpec);
router.delete('/specs/:id', specController.deleteSpec);
router.post('/specs/:id/refresh', specController.refreshSpec);
router.post('/specs/:id/analyze', specController.analyzeSpec);

// ==========================================
// Fuzzing Routes
// ==========================================
router.post('/fuzzer/endpoint', fuzzerController.fuzzEndpoint);
router.post('/fuzzer/batch', fuzzerController.batchFuzz);
router.get('/fuzzer/payloads', fuzzerController.getPayloads);
router.post('/fuzzer/payloads', fuzzerController.addPayload);
router.post('/fuzzer/tamper', fuzzerController.testParameterTampering);

// ==========================================
// Auth Testing Routes
// ==========================================
router.post('/auth/test', authController.testAuth);
router.post('/auth/jwt', authController.testJWT);
router.post('/auth/oauth', authController.testOAuth);
router.post('/auth/apikey', authController.testAPIKey);
router.post('/auth/rate-limit', authController.testRateLimiting);
router.post('/auth/cors', authController.testCORS);
router.post('/auth/suite', authController.fullAuthSuite);

module.exports = router;

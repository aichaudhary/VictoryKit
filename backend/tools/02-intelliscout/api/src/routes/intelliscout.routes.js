const express = require('express');
const router = express.Router();
const controller = require('../controllers');

/**
 * IntelliScout API Routes
 * Cyber Threat Intelligence Platform
 */

// ===== System =====
router.get('/status', controller.getStatus);
router.get('/config', controller.getConfig);
router.get('/dashboard', controller.getDashboard);

// ===== Threat Intelligence =====
router.post('/intelligence', controller.createIntelligence);
router.get('/intelligence', controller.getIntelligence);
router.get('/intelligence/search', controller.searchIntelligence);
router.get('/intelligence/:intelId', controller.getIntelligenceById);

// ===== IOC Management =====
router.post('/iocs', controller.createIOC);
router.get('/iocs', controller.getIOCs);
router.get('/iocs/stats', controller.getIOCStats);
router.post('/iocs/bulk', controller.bulkImportIOCs);
router.put('/iocs/:iocId/enrich', controller.enrichIOC);

// ===== Threat Actors =====
router.post('/actors', controller.createThreatActor);
router.get('/actors', controller.getThreatActors);
router.get('/actors/:actorId', controller.getThreatActorById);
router.put('/actors/:actorId/campaign', controller.linkActorToCampaign);

// ===== Campaigns =====
router.post('/campaigns', controller.createCampaign);
router.get('/campaigns', controller.getCampaigns);
router.get('/campaigns/active', controller.getActiveCampaigns);
router.get('/campaigns/:campaignId', controller.getCampaignById);

// ===== Threat Feeds =====
router.post('/feeds', controller.createFeed);
router.get('/feeds', controller.getFeeds);
router.get('/feeds/stats', controller.getFeedStats);
router.post('/feeds/:feedId/sync', controller.syncFeed);

// ===== Vulnerability Intelligence =====
router.post('/vulnerabilities', controller.createVulnerability);
router.get('/vulnerabilities', controller.getVulnerabilities);
router.get('/vulnerabilities/critical', controller.getCriticalVulnerabilities);

// ===== TTP Mapping =====
router.post('/ttps', controller.createTTP);
router.get('/ttps', controller.getTTPs);
router.get('/ttps/matrix', controller.getMitreMatrix);
router.get('/ttps/tactic/:tactic', controller.getTTPsByTactic);

// ===== Threat Reports =====
router.post('/reports', controller.createReport);
router.get('/reports', controller.getReports);
router.get('/reports/:reportId', controller.getReportById);
router.put('/reports/:reportId/publish', controller.publishReport);

module.exports = router;

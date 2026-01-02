/**
 * DLP API Routes
 * All route definitions using controllers
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Controllers
const controllers = require('../controllers');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// ==========================================
// SCAN ROUTES
// ==========================================

router.post('/scan/content', controllers.scan.scanContent);
router.post('/scan/file', upload.single('file'), controllers.scan.scanFile);
router.post('/scan/email', controllers.scan.scanEmail);
router.post('/scan/bulk', controllers.scan.bulkScan);
router.get('/scan/history', controllers.scan.getScanHistory);
router.get('/scan/:id', controllers.scan.getScanById);

// ==========================================
// POLICY ROUTES
// ==========================================

router.get('/policies', controllers.policy.getAllPolicies);
router.get('/policies/:id', controllers.policy.getPolicyById);
router.post('/policies', controllers.policy.createPolicy);
router.put('/policies/:id', controllers.policy.updatePolicy);
router.delete('/policies/:id', controllers.policy.deletePolicy);
router.patch('/policies/:id/toggle', controllers.policy.togglePolicy);

// Pattern routes
router.get('/patterns', controllers.policy.getAllPatterns);
router.post('/patterns', controllers.policy.createPattern);
router.put('/patterns/:id', controllers.policy.updatePattern);
router.delete('/patterns/:id', controllers.policy.deletePattern);
router.post('/patterns/test', controllers.policy.testPattern);

// ==========================================
// INCIDENT ROUTES
// ==========================================

router.get('/incidents', controllers.incident.getAllIncidents);
router.get('/incidents/stats', controllers.incident.getIncidentStats);
router.get('/incidents/:id', controllers.incident.getIncidentById);
router.patch('/incidents/:id/status', controllers.incident.updateIncidentStatus);
router.patch('/incidents/:id/assign', controllers.incident.assignIncident);
router.post('/incidents/:id/notes', controllers.incident.addNote);
router.patch('/incidents/bulk', controllers.incident.bulkUpdateIncidents);

// ==========================================
// CLASSIFICATION ROUTES
// ==========================================

router.get('/classifications', controllers.classification.getAllClassifications);
router.get('/classifications/stats', controllers.classification.getClassificationStats);
router.get('/classifications/:resourceId', controllers.classification.getClassificationByResource);
router.post('/classifications/auto', controllers.classification.classifyContent);
router.post('/classifications/manual', controllers.classification.setClassification);
router.post('/classifications/bulk', controllers.classification.bulkClassify);

// ==========================================
// ENDPOINT ROUTES
// ==========================================

router.get('/endpoints/agents', controllers.endpoint.getAgents);
router.get('/endpoints/config', controllers.endpoint.getAgentConfig);
router.post('/endpoints/register', controllers.endpoint.registerAgent);
router.post('/endpoints/heartbeat', controllers.endpoint.heartbeat);
router.post('/endpoints/activity', controllers.endpoint.reportActivity);
router.get('/endpoints/activity', controllers.endpoint.getActivityHistory);
router.get('/endpoints/stats', controllers.endpoint.getActivityStats);

// ==========================================
// INTEGRATION ROUTES
// ==========================================

router.get('/integrations/status', controllers.integration.getStatus);

// Microsoft 365
router.post('/integrations/microsoft365/onedrive', controllers.integration.scanOneDrive);
router.post('/integrations/microsoft365/teams', controllers.integration.scanTeams);
router.post('/integrations/microsoft365/outlook', controllers.integration.scanOutlook);

// Google Workspace
router.post('/integrations/google/drive', controllers.integration.scanGoogleDrive);
router.post('/integrations/google/gmail', controllers.integration.scanGmail);

// Slack
router.get('/integrations/slack/channels', controllers.integration.getSlackChannels);
router.post('/integrations/slack/channel', controllers.integration.scanSlackChannel);
router.post('/integrations/slack/workspace', controllers.integration.scanSlackWorkspace);

// Cloud Storage
router.get('/integrations/s3/buckets', controllers.integration.listS3Buckets);
router.post('/integrations/s3/scan', controllers.integration.scanS3Bucket);
router.post('/integrations/azure/scan', controllers.integration.scanAzureContainer);
router.post('/integrations/dropbox/scan', controllers.integration.scanDropbox);
router.post('/integrations/box/scan', controllers.integration.scanBox);
router.post('/integrations/cloud/scan-all', controllers.integration.scanAllCloudStorage);

// Notifications
router.post('/integrations/notifications/test', controllers.integration.testNotifications);

// ==========================================
// DASHBOARD / STATS
// ==========================================

router.get('/dashboard/stats', async (req, res) => {
  try {
    const { DLPIncident, ScanResult, DataClassification, EndpointActivity } = require('../models');
    
    const [incidents, scans, classifications, activities] = await Promise.all([
      DLPIncident.countDocuments({ status: 'open' }),
      ScanResult.countDocuments(),
      DataClassification.countDocuments(),
      EndpointActivity.countDocuments({ 'risk.blocked': true })
    ]);
    
    res.json({
      success: true,
      data: {
        openIncidents: incidents,
        totalScans: scans,
        classifiedResources: classifications,
        blockedActivities: activities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

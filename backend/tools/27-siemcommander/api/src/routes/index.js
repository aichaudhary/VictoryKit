const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Health & Status
router.get('/status', controller.getStatus);

// Event Management
router.post('/events/ingest', controller.ingestEvents);
router.get('/events', controller.getEvents);
router.get('/events/:eventId', controller.getEventById);
router.post('/events/query', controller.queryEvents);
router.post('/events/correlate', controller.correlateEvents);

// Threat Detection
router.post('/threats/detect', controller.detectThreats);
router.post('/threats/hunt', controller.threatHunt);

// Incident Management
router.post('/incidents', controller.createIncident);
router.get('/incidents', controller.getIncidents);
router.get('/incidents/:incidentId', controller.getIncidentById);
router.put('/incidents/:incidentId', controller.updateIncident);
router.delete('/incidents/:incidentId', controller.deleteIncident);

// Playbook Management
router.post('/playbooks/execute', controller.executePlaybook);
router.get('/playbooks', controller.getPlaybooks);
router.get('/playbooks/:playbookId', controller.getPlaybookById);
router.post('/playbooks', controller.createPlaybook);
router.put('/playbooks/:playbookId', controller.updatePlaybook);

// Threat Intelligence
router.post('/threat-intel', controller.addThreatIntel);
router.get('/threat-intel', controller.getThreatIntel);
router.post('/threat-intel/update', controller.updateThreatIntelFeeds);
router.get('/threat-intel/ioc/:iocValue', controller.checkIOC);

// Compliance & Reporting
router.post('/reports/generate', controller.generateReport);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);

// Dashboard & Analytics
router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/dashboard/timeline', controller.getThreatTimeline);

// Configuration
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

module.exports = router;

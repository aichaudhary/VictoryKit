const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// ==================== STATUS & HEALTH ====================
router.get('/status', controller.getStatus);
router.get('/health', controller.getHealth);
router.get('/dashboard', controller.getDashboard);
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

// ==================== RECOVERY PLANS ====================
router.get('/plans', controller.getPlans);
router.get('/plans/:id', controller.getPlanById);
router.post('/plans', controller.createPlan);
router.put('/plans/:id', controller.updatePlan);
router.delete('/plans/:id', controller.deletePlan);
router.post('/plans/:id/activate', controller.activatePlan);
router.post('/plans/:id/approve', controller.approvePlan);
router.post('/plans/:id/clone', controller.clonePlan);
router.get('/plans/:id/steps', controller.getPlanSteps);
router.post('/plans/:id/steps', controller.addPlanStep);
router.put('/plans/:id/steps/:stepId', controller.updatePlanStep);
router.delete('/plans/:id/steps/:stepId', controller.deletePlanStep);
router.get('/plans/:id/export', controller.exportPlan);
router.post('/plans/import', controller.importPlan);

// ==================== RECOVERY SITES ====================
router.get('/sites', controller.getSites);
router.get('/sites/:id', controller.getSiteById);
router.post('/sites', controller.createSite);
router.put('/sites/:id', controller.updateSite);
router.delete('/sites/:id', controller.deleteSite);
router.get('/sites/:id/health', controller.getSiteHealth);
router.post('/sites/:id/failover', controller.initiateFailover);
router.post('/sites/:id/failback', controller.initiateFailback);
router.get('/sites/:id/replication', controller.getReplicationStatus);
router.post('/sites/:id/sync', controller.forceSiteSync);

// ==================== SYSTEMS ====================
router.get('/systems', controller.getSystems);
router.get('/systems/:id', controller.getSystemById);
router.post('/systems', controller.createSystem);
router.put('/systems/:id', controller.updateSystem);
router.delete('/systems/:id', controller.deleteSystem);
router.get('/systems/:id/dependencies', controller.getSystemDependencies);
router.post('/systems/:id/dependencies', controller.addSystemDependency);
router.get('/systems/:id/health', controller.getSystemHealth);
router.post('/systems/:id/recover', controller.initiateSystemRecovery);
router.get('/systems/criticality/:level', controller.getSystemsByCriticality);
router.get('/systems/rto-analysis', controller.getRtoAnalysis);

// ==================== RUNBOOKS ====================
router.get('/runbooks', controller.getRunbooks);
router.get('/runbooks/:id', controller.getRunbookById);
router.post('/runbooks', controller.createRunbook);
router.put('/runbooks/:id', controller.updateRunbook);
router.delete('/runbooks/:id', controller.deleteRunbook);
router.post('/runbooks/:id/execute', controller.executeRunbook);
router.post('/runbooks/:id/steps/:stepNum/complete', controller.completeRunbookStep);
router.get('/runbooks/:id/history', controller.getRunbookHistory);
router.post('/runbooks/:id/clone', controller.cloneRunbook);
router.get('/runbooks/:id/export', controller.exportRunbook);

// ==================== DR TESTS ====================
router.get('/tests', controller.getTests);
router.get('/tests/:id', controller.getTestById);
router.post('/tests', controller.createTest);
router.put('/tests/:id', controller.updateTest);
router.delete('/tests/:id', controller.deleteTest);
router.post('/tests/:id/start', controller.startTest);
router.post('/tests/:id/complete', controller.completeTest);
router.post('/tests/:id/cancel', controller.cancelTest);
router.post('/tests/:id/steps/:stepNum', controller.recordTestStepResult);
router.get('/tests/:id/report', controller.getTestReport);
router.post('/tests/:id/report/generate', controller.generateTestReport);
router.get('/tests/upcoming', controller.getUpcomingTests);
router.get('/tests/results/summary', controller.getTestResultsSummary);

// ==================== CONTACTS ====================
router.get('/contacts', controller.getContacts);
router.get('/contacts/:id', controller.getContactById);
router.post('/contacts', controller.createContact);
router.put('/contacts/:id', controller.updateContact);
router.delete('/contacts/:id', controller.deleteContact);
router.get('/contacts/role/:role', controller.getContactsByRole);
router.get('/contacts/team/:team', controller.getContactsByTeam);
router.get('/contacts/on-call', controller.getOnCallContacts);
router.get('/contacts/escalation-path', controller.getEscalationPath);

// ==================== INCIDENTS ====================
router.get('/incidents', controller.getIncidents);
router.get('/incidents/:id', controller.getIncidentById);
router.post('/incidents', controller.createIncident);
router.put('/incidents/:id', controller.updateIncident);
router.delete('/incidents/:id', controller.deleteIncident);
router.post('/incidents/:id/acknowledge', controller.acknowledgeIncident);
router.post('/incidents/:id/activate-dr', controller.activateDRForIncident);
router.post('/incidents/:id/resolve', controller.resolveIncident);
router.post('/incidents/:id/close', controller.closeIncident);
router.post('/incidents/:id/timeline', controller.addTimelineEvent);
router.get('/incidents/:id/timeline', controller.getIncidentTimeline);
router.post('/incidents/:id/post-mortem', controller.schedulePostMortem);
router.get('/incidents/active', controller.getActiveIncidents);
router.get('/incidents/metrics', controller.getIncidentMetrics);

// ==================== REPORTS & ANALYTICS ====================
router.get('/reports/readiness', controller.getReadinessReport);
router.get('/reports/rto-rpo', controller.getRtoRpoReport);
router.get('/reports/compliance', controller.getComplianceReport);
router.get('/reports/test-history', controller.getTestHistoryReport);
router.get('/reports/incident-summary', controller.getIncidentSummaryReport);
router.post('/reports/generate', controller.generateReport);
router.get('/analytics/trends', controller.getTrends);
router.get('/analytics/risk-assessment', controller.getRiskAssessment);

// ==================== NOTIFICATIONS ====================
router.post('/notifications/send', controller.sendNotification);
router.post('/notifications/broadcast', controller.broadcastNotification);
router.get('/notifications/templates', controller.getNotificationTemplates);

// ==================== AI ANALYSIS ====================
router.post('/ai/analyze-plan', controller.aiAnalyzePlan);
router.post('/ai/suggest-improvements', controller.aiSuggestImprovements);
router.post('/ai/generate-runbook', controller.aiGenerateRunbook);
router.post('/ai/risk-prediction', controller.aiRiskPrediction);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// ===== Risk Assessment Routes =====
router.post('/risk-assessments', controller.createRiskAssessment);
router.get('/risk-assessments', controller.getRiskAssessments);
router.get('/risk-assessments/:id', controller.getRiskAssessmentById);
router.put('/risk-assessments/:id', controller.updateRiskAssessment);
router.delete('/risk-assessments/:id', controller.deleteRiskAssessment);

// ===== PHI Discovery Routes =====
router.post('/phi-scans', controller.createPHIScan);
router.get('/phi-scans', controller.getPHIScans);
router.get('/phi-scans/:id', controller.getPHIScanById);
router.put('/phi-scans/:id', controller.updatePHIScan);

// ===== Breach Management Routes =====
router.post('/breaches', controller.createBreach);
router.get('/breaches', controller.getBreaches);
router.get('/breaches/statistics', controller.getBreachStatistics);
router.get('/breaches/:id', controller.getBreachById);
router.put('/breaches/:id', controller.updateBreach);

// ===== Business Associate Agreement Routes =====
router.post('/baas', controller.createBAA);
router.get('/baas', controller.getBAAs);
router.get('/baas/expiring', controller.getExpiringBAAs);
router.get('/baas/:id', controller.getBAAById);
router.put('/baas/:id', controller.updateBAA);

// ===== Training Management Routes =====
router.post('/trainings', controller.createTraining);
router.get('/trainings', controller.getTrainings);
router.get('/trainings/overdue', controller.getOverdueTrainings);
router.get('/trainings/statistics', controller.getTrainingStatistics);
router.get('/trainings/:id', controller.getTrainingById);
router.put('/trainings/:id', controller.updateTraining);

// ===== Access Log Routes =====
router.post('/access-logs', controller.createAccessLog);
router.get('/access-logs', controller.getAccessLogs);
router.get('/access-logs/suspicious', controller.getSuspiciousActivity);
router.get('/access-logs/statistics', controller.getAccessStatistics);
router.get('/access-logs/:id', controller.getAccessLogById);

// ===== Compliance Report Routes =====
router.post('/compliance-reports', controller.createComplianceReport);
router.get('/compliance-reports', controller.getComplianceReports);
router.get('/compliance-reports/:id', controller.getComplianceReportById);
router.put('/compliance-reports/:id', controller.updateComplianceReport);
router.delete('/compliance-reports/:id', controller.deleteComplianceReport);

// ===== Dashboard Routes =====
router.get('/dashboard', controller.getDashboardData);
router.get('/compliance-overview', controller.getComplianceOverview);

module.exports = router;

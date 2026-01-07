const express = require('express');
const router = express.Router();
const controller = require('../controllers');

/**
 * SecurityScore Tool - RESTful Routes
 * 42 API endpoints organized by feature group
 */

// ========== System & Dashboard ==========
router.get('/status', controller.getStatus);
router.get('/dashboard', controller.getDashboard);

// ========== Security Score Management ==========
router.post('/scores', controller.createSecurityScore);
router.get('/scores', controller.getSecurityScores);
router.get('/scores/top', controller.getTopPerformers);
router.get('/scores/:id', controller.getSecurityScoreById);
router.put('/scores/:id', controller.updateSecurityScore);
router.delete('/scores/:id', controller.deleteSecurityScore);
router.post('/scores/:id/calculate', controller.calculateScore);
router.get('/scores/:id/history', controller.getScoreHistory);

// ========== Metric Management ==========
router.post('/metrics', controller.createMetric);
router.get('/metrics', controller.getMetrics);
router.get('/metrics/critical', controller.getCriticalMetrics);
router.get('/metrics/category/:category', controller.getMetricsByCategory);
router.get('/metrics/:id', controller.getMetricById);
router.patch('/metrics/:id/value', controller.updateMetricValue);

// ========== Assessment Management ==========
router.post('/assessments', controller.createAssessment);
router.get('/assessments', controller.getAssessments);
router.get('/assessments/recent', controller.getRecentAssessments);
router.get('/assessments/:id', controller.getAssessmentById);
router.put('/assessments/:id', controller.updateAssessment);
router.post('/assessments/:id/complete', controller.completeAssessment);

// ========== Benchmark Management ==========
router.post('/benchmarks', controller.createBenchmark);
router.get('/benchmarks', controller.getBenchmarks);
router.get('/benchmarks/:id', controller.getBenchmarkById);
router.get('/benchmarks/:benchmarkId/compare/:scoreId', controller.compareToBenchmark);

// ========== Improvement Management ==========
router.post('/improvements', controller.createImprovement);
router.get('/improvements', controller.getImprovements);
router.get('/improvements/:id', controller.getImprovementById);
router.patch('/improvements/:id/progress', controller.updateImprovementProgress);
router.post('/improvements/:id/approve', controller.approveImprovement);

// ========== Control Management ==========
router.post('/controls', controller.createControl);
router.get('/controls', controller.getControls);
router.get('/controls/:id', controller.getControlById);
router.patch('/controls/:id/implementation', controller.updateControlImplementation);
router.post('/controls/:id/test', controller.recordControlTest);

// ========== Framework Management ==========
router.post('/frameworks', controller.createFramework);
router.get('/frameworks', controller.getFrameworks);
router.get('/frameworks/:id', controller.getFrameworkById);
router.post('/frameworks/:id/compliance', controller.updateFrameworkCompliance);

// ========== Report Management ==========
router.post('/reports', controller.generateReport);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);
router.post('/reports/:id/distribute', controller.distributeReport);

module.exports = router;

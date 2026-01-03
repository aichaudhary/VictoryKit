const express = require('express');
const router = express.Router();

// Legacy controllers (kept for backwards compatibility)
const codebaseController = require('../controllers/codebaseController');
const scanController = require('../controllers/scanController');
const issueController = require('../controllers/issueController');

// Enhanced controllers
const analysisController = require('../controllers/analysis.controller');
const repositoryController = require('../controllers/repository.controller');

// =====================================
// ENHANCED ANALYSIS ROUTES (NEW)
// =====================================

// Full scan combining SAST, secrets, and dependency scanning
router.post('/analysis/scan', analysisController.runFullScan);

// Individual scan types
router.post('/analysis/sast', analysisController.runSastScan);
router.post('/analysis/secrets', analysisController.runSecretsScan);
router.post('/analysis/dependencies', analysisController.runDependencyScan);

// AI-powered fix suggestions
router.post('/analysis/fix', analysisController.getFixSuggestions);

// Security rules management
router.get('/analysis/rules', analysisController.getSecurityRules);
router.post('/analysis/rules', analysisController.createSecurityRule);

// Scan history and results
router.get('/analysis/history', analysisController.getScanHistory);
router.get('/analysis/stats', analysisController.getStats);
router.get('/analysis/:id', analysisController.getScanResult);

// =====================================
// ENHANCED REPOSITORY ROUTES (NEW)
// =====================================

// Repository CRUD
router.get('/repositories', repositoryController.listRepositories);
router.post('/repositories', repositoryController.addRepository);
router.get('/repositories/:id', repositoryController.getRepository);
router.put('/repositories/:id', repositoryController.updateRepository);
router.delete('/repositories/:id', repositoryController.deleteRepository);

// Repository operations
router.post('/repositories/:id/sync', repositoryController.syncRepository);
router.get('/repositories/:id/files', repositoryController.getRepositoryFiles);
router.get('/repositories/:id/content', repositoryController.getFileContent);
router.get('/repositories/:id/stats', repositoryController.getRepositoryStats);

// GitHub/GitLab import
router.post('/repositories/import/github', repositoryController.importFromGitHub);

// Webhooks
router.post('/webhooks/:provider', repositoryController.handleWebhook);

// =====================================
// LEGACY ROUTES (Backwards Compatible)
// =====================================

// Codebase routes (legacy)
router.post('/codebases', codebaseController.create);
router.get('/codebases', codebaseController.list);
router.get('/codebases/:id', codebaseController.get);
router.put('/codebases/:id', codebaseController.update);
router.delete('/codebases/:id', codebaseController.delete);
router.post('/codebases/:id/sync', codebaseController.sync);

// Scan routes (legacy)
router.post('/scans', scanController.create);
router.get('/scans', scanController.list);
router.get('/scans/:id', scanController.get);
router.post('/scans/:id/execute', scanController.execute);
router.get('/scans/:id/status', scanController.status);

// Issue routes (legacy)
router.get('/issues', issueController.list);
router.get('/issues/:id', issueController.get);
router.put('/issues/:id', issueController.update);
router.get('/issues/:id/fix', issueController.getFix);
router.get('/reports/:scanId', issueController.report);

module.exports = router;

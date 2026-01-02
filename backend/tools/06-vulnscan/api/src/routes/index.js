const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, authenticate } = require('../../../../../shared');
const scanController = require('../controllers/scan.controller');
const vulnerabilityController = require('../controllers/vulnerability.controller');
const reportController = require('../controllers/report.controller');
const assetController = require('../controllers/asset.controller');
const scheduleController = require('../controllers/schedule.controller');
const cveService = require('../services/cve.service');
const { ApiResponse } = require('../../../../../shared');

const router = express.Router();
router.use(authenticate);

// ======================
// SCAN ROUTES
// ======================
router.post('/scans', validate([
  body('targetType').isIn(['network', 'web_application', 'host', 'container', 'cloud', 'api']),
  body('targetIdentifier').isString().notEmpty(),
  body('scanType').optional().isIn(['full', 'quick', 'compliance', 'authenticated', 'unauthenticated'])
]), scanController.createScan);

router.get('/scans', validate([query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })]), scanController.getAllScans);
router.get('/scans/statistics', validate([query('startDate').optional().isISO8601(), query('endDate').optional().isISO8601()]), scanController.getStatistics);
router.get('/scans/:id', validate([param('id').isMongoId()]), scanController.getScanById);
router.delete('/scans/:id', validate([param('id').isMongoId()]), scanController.deleteScan);

// ======================
// VULNERABILITY ROUTES
// ======================
router.get('/vulnerabilities', validate([query('page').optional().isInt({ min: 1 }), query('severity').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'])]), vulnerabilityController.getAllVulnerabilities);
router.get('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.getVulnerabilityById);
router.patch('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.updateVulnerability);
router.delete('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.deleteVulnerability);

// ======================
// REPORT ROUTES
// ======================
router.post('/reports/generate', validate([
  body('reportType').isIn(['scan_summary', 'compliance', 'trending', 'executive', 'technical']),
  body('format').optional().isIn(['pdf', 'html', 'json'])
]), reportController.generateReport);

router.get('/reports/:id', validate([param('id').isMongoId()]), reportController.getReportById);
router.get('/reports', validate([query('page').optional().isInt({ min: 1 })]), reportController.getAllReports);
router.get('/reports/:id/export', validate([param('id').isMongoId()]), reportController.exportReport);
router.delete('/reports/:id', validate([param('id').isMongoId()]), reportController.deleteReport);

// ======================
// ASSET ROUTES
// ======================
router.post('/assets', validate([
  body('name').isString().notEmpty().trim(),
  body('assetType').isIn(['web_application', 'host', 'network', 'container', 'cloud_resource', 'api', 'database', 'iot_device']),
  body('target').isObject()
]), assetController.createAsset);

router.get('/assets', validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('assetType').optional().isIn(['web_application', 'host', 'network', 'container', 'cloud_resource', 'api', 'database', 'iot_device']),
  query('environment').optional().isIn(['production', 'staging', 'development', 'testing', 'dr']),
  query('criticality').optional().isIn(['critical', 'high', 'medium', 'low'])
]), assetController.getAllAssets);

router.get('/assets/statistics', assetController.getStatistics);
router.get('/assets/tags', assetController.getTags);
router.get('/assets/tag/:tag', assetController.getAssetsByTag);

router.post('/assets/bulk-import', validate([
  body('assets').isArray({ min: 1 })
]), assetController.bulkImport);

router.post('/assets/discover', validate([
  body('scanId').isMongoId()
]), assetController.discoverFromScan);

router.get('/assets/:id', validate([param('id').isMongoId()]), assetController.getAssetById);
router.put('/assets/:id', validate([param('id').isMongoId()]), assetController.updateAsset);
router.delete('/assets/:id', validate([param('id').isMongoId()]), assetController.deleteAsset);

// ======================
// SCHEDULED SCAN ROUTES
// ======================
router.post('/schedules', validate([
  body('name').isString().notEmpty().trim(),
  body('targets').isArray({ min: 1 }),
  body('schedule.type').optional().isIn(['daily', 'weekly', 'monthly', 'custom'])
]), scheduleController.createSchedule);

router.get('/schedules', validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'paused', 'expired'])
]), scheduleController.getAllSchedules);

router.get('/schedules/upcoming', scheduleController.getUpcoming);
router.get('/schedules/statistics', scheduleController.getStatistics);

router.get('/schedules/:id', validate([param('id').isMongoId()]), scheduleController.getScheduleById);
router.put('/schedules/:id', validate([param('id').isMongoId()]), scheduleController.updateSchedule);
router.delete('/schedules/:id', validate([param('id').isMongoId()]), scheduleController.deleteSchedule);
router.post('/schedules/:id/toggle', validate([param('id').isMongoId()]), scheduleController.toggleStatus);
router.post('/schedules/:id/run', validate([param('id').isMongoId()]), scheduleController.runNow);
router.get('/schedules/:id/history', validate([param('id').isMongoId()]), scheduleController.getHistory);

// ======================
// CVE LOOKUP ROUTES
// ======================
router.get('/cve/lookup/:cveId', validate([
  param('cveId').matches(/^CVE-\d{4}-\d{4,}$/i)
]), async (req, res, next) => {
  try {
    const cveData = await cveService.lookupCVE(req.params.cveId.toUpperCase());
    res.json(ApiResponse.success(cveData));
  } catch (error) {
    next(error);
  }
});

router.post('/cve/bulk-lookup', validate([
  body('cveIds').isArray({ min: 1, max: 50 })
]), async (req, res, next) => {
  try {
    const results = await cveService.bulkLookup(req.body.cveIds);
    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
});

router.get('/cve/epss/:cveId', validate([
  param('cveId').matches(/^CVE-\d{4}-\d{4,}$/i)
]), async (req, res, next) => {
  try {
    const epssData = await cveService.getEPSSScore(req.params.cveId.toUpperCase());
    res.json(ApiResponse.success(epssData));
  } catch (error) {
    next(error);
  }
});

router.get('/cve/kev/:cveId', validate([
  param('cveId').matches(/^CVE-\d{4}-\d{4,}$/i)
]), async (req, res, next) => {
  try {
    const isKEV = await cveService.checkKEV(req.params.cveId.toUpperCase());
    res.json(ApiResponse.success({ cveId: req.params.cveId.toUpperCase(), isKEV }));
  } catch (error) {
    next(error);
  }
});

router.get('/cve/search', validate([
  query('keyword').isString().notEmpty(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
]), async (req, res, next) => {
  try {
    const results = await cveService.searchCVEs(req.query.keyword, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    });
    res.json(ApiResponse.success(results));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

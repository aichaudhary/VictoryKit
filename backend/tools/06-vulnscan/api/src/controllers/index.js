/**
 * VulnScan Controllers
 * API Controllers for Vulnerability Management Platform
 * 
 * Comprehensive vulnerability scanning, asset management,
 * patch management, compliance checking, and remediation tracking
 */

const {
  Asset,
  Vulnerability,
  Scan,
  ScanSchedule,
  Patch,
  RuntimeGuard,
  RemediationPlan,
  VulnReport
} = require('../models');

// ============================================================================
// SYSTEM & DASHBOARD
// ============================================================================

/**
 * GET /api/vulnscan/status
 * Get system status and health
 */
const getStatus = async (req, res) => {
  try {
    const status = {
      service: 'VulnScan',
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      features: {
        assetManagement: true,
        vulnerabilityScanning: true,
        patchManagement: true,
        complianceChecking: true,
        remediationTracking: true,
        reporting: true
      }
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/dashboard
 * Get comprehensive dashboard statistics
 */
const getDashboard = async (req, res) => {
  try {
    const [
      assetStats,
      vulnStats,
      scanStats,
      patchStats,
      complianceStats,
      remediationStats
    ] = await Promise.all([
      Asset.getStatistics(),
      Vulnerability.getStatistics(),
      Scan.getStatistics(),
      Patch.getStatistics(),
      RuntimeGuard.getStatistics(),
      RemediationPlan.getStatistics()
    ]);
    
    // Get recent critical items
    const [criticalVulns, criticalAssets, activeScans, overduePatches] = await Promise.all([
      Vulnerability.findCritical().limit(5),
      Asset.findWithCriticalVulns().limit(5),
      Scan.findActive().limit(5),
      Patch.findOverdue().limit(5)
    ]);
    
    const dashboard = {
      overview: {
        totalAssets: assetStats.vulnerabilitySummary?.[0]?.totalAssets || 0,
        totalVulnerabilities: vulnStats.summary?.[0]?.total || 0,
        totalScans: scanStats.summary?.[0]?.totalScans || 0,
        totalPatches: patchStats.summary?.[0]?.total || 0,
        activeScans: activeScans.length,
        activeRemediations: remediationStats.summary?.[0]?.total || 0
      },
      assets: {
        statistics: assetStats,
        criticalAssets: criticalAssets
      },
      vulnerabilities: {
        statistics: vulnStats,
        critical: criticalVulns
      },
      scans: {
        statistics: scanStats,
        active: activeScans
      },
      patches: {
        statistics: patchStats,
        overdue: overduePatches
      },
      compliance: {
        statistics: complianceStats
      },
      remediation: {
        statistics: remediationStats
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/assets
 * Create new asset
 */
const createAsset = async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/assets
 * Get all assets with filtering
 */
const getAssets = async (req, res) => {
  try {
    const { type, criticality, status, tags, riskScore, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (criticality) query.criticality = criticality;
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',') };
    if (riskScore) query.riskScore = { $gte: parseInt(riskScore) };
    
    const assets = await Asset.find(query)
      .sort({ riskScore: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('vulnerabilities', 'vulnId severity cveId');
    
    const total = await Asset.countDocuments(query);
    
    res.json({
      assets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/assets/:id
 * Get asset by ID
 */
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('vulnerabilities')
      .populate('lastScan.scanId');
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/vulnscan/assets/:id
 * Update asset
 */
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/vulnscan/assets/:id
 * Delete asset
 */
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/assets/:id/vulnerabilities
 * Get asset vulnerabilities
 */
const getAssetVulnerabilities = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('vulnerabilities');
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({
      asset: {
        id: asset._id,
        name: asset.name,
        type: asset.type
      },
      summary: asset.vulnerabilitySummary,
      vulnerabilities: asset.vulnerabilities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/assets/high-risk
 * Get high risk assets
 */
const getHighRiskAssets = async (req, res) => {
  try {
    const threshold = req.query.threshold || 70;
    const assets = await Asset.findHighRisk(threshold);
    
    res.json({ assets, threshold });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// VULNERABILITY MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/vulnerabilities
 * Create new vulnerability
 */
const createVulnerability = async (req, res) => {
  try {
    const vulnerability = new Vulnerability(req.body);
    await vulnerability.save();
    res.status(201).json(vulnerability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/vulnerabilities
 * Get all vulnerabilities with filtering
 */
const getVulnerabilities = async (req, res) => {
  try {
    const { severity, status, cveId, exploitable, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (status) query['remediation.status'] = status;
    if (cveId) query.cveId = cveId;
    if (exploitable === 'true') {
      query['exploit.availability'] = { $in: ['functional', 'weaponized'] };
    }
    
    const vulnerabilities = await Vulnerability.find(query)
      .sort({ threatScore: -1, discoveredDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('affectedAssets.asset', 'name type primaryIp');
    
    const total = await Vulnerability.countDocuments(query);
    
    res.json({
      vulnerabilities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/vulnerabilities/:id
 * Get vulnerability by ID
 */
const getVulnerabilityById = async (req, res) => {
  try {
    const vulnerability = await Vulnerability.findById(req.params.id)
      .populate('affectedAssets.asset')
      .populate('remediation.remediationPlan');
    
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    
    res.json(vulnerability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/vulnerabilities/critical
 * Get critical vulnerabilities
 */
const getCriticalVulnerabilities = async (req, res) => {
  try {
    const vulnerabilities = await Vulnerability.findCritical();
    res.json({ count: vulnerabilities.length, vulnerabilities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/vulnerabilities/exploitable
 * Get exploitable vulnerabilities
 */
const getExploitableVulnerabilities = async (req, res) => {
  try {
    const vulnerabilities = await Vulnerability.findExploitable();
    res.json({ count: vulnerabilities.length, vulnerabilities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/vulnerabilities/:id/assign-remediation
 * Assign vulnerability to remediation plan
 */
const assignRemediationToVulnerability = async (req, res) => {
  try {
    const vulnerability = await Vulnerability.findById(req.params.id);
    
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    
    vulnerability.createRemediationPlan(req.body);
    await vulnerability.save();
    
    res.json(vulnerability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/vulnerabilities/:id/patch
 * Mark vulnerability as patched
 */
const patchVulnerability = async (req, res) => {
  try {
    const vulnerability = await Vulnerability.findById(req.params.id);
    
    if (!vulnerability) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    
    vulnerability.markPatched(req.body.userId, req.body.notes);
    await vulnerability.save();
    
    res.json(vulnerability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// SCAN MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/scans
 * Create and optionally start a new scan
 */
const createScan = async (req, res) => {
  try {
    const scan = new Scan(req.body);
    await scan.save();
    
    // If autoStart is true, start the scan
    if (req.body.autoStart) {
      scan.start();
      await scan.save();
    }
    
    res.status(201).json(scan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/scans
 * Get all scans
 */
const getScans = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.scanType = type;
    
    const scans = await Scan.find(query)
      .sort({ 'timing.started': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Scan.countDocuments(query);
    
    res.json({
      scans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/scans/:id
 * Get scan by ID
 */
const getScanById = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id)
      .populate('discoveredAssets.asset')
      .populate('vulnerabilities');
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/scans/:id/start
 * Start a scan
 */
const startScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    scan.start();
    await scan.save();
    
    res.json({ message: 'Scan started successfully', scan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/scans/:id/pause
 * Pause a running scan
 */
const pauseScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    scan.pause();
    await scan.save();
    
    res.json({ message: 'Scan paused successfully', scan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/scans/:id/resume
 * Resume a paused scan
 */
const resumeScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    scan.resume();
    await scan.save();
    
    res.json({ message: 'Scan resumed successfully', scan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/scans/:id/cancel
 * Cancel a scan
 */
const cancelScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    scan.cancel();
    await scan.save();
    
    res.json({ message: 'Scan cancelled successfully', scan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/scans/active
 * Get active scans
 */
const getActiveScans = async (req, res) => {
  try {
    const scans = await Scan.findActive();
    res.json({ count: scans.length, scans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// SCAN SCHEDULES
// ============================================================================

/**
 * POST /api/vulnscan/schedules
 * Create scan schedule
 */
const createSchedule = async (req, res) => {
  try {
    const schedule = new ScanSchedule(req.body);
    schedule.calculateNextRun();
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/schedules
 * Get all schedules
 */
const getSchedules = async (req, res) => {
  try {
    const { enabled, status } = req.query;
    
    const query = {};
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (status) query.status = status;
    
    const schedules = await ScanSchedule.find(query)
      .sort({ 'timing.nextRun': 1 });
    
    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/schedules/:id/execute
 * Manually execute a schedule
 */
const executeSchedule = async (req, res) => {
  try {
    const schedule = await ScanSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const scan = await schedule.execute();
    
    res.json({ message: 'Schedule executed successfully', scan, schedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// PATCH MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/patches
 * Create new patch
 */
const createPatch = async (req, res) => {
  try {
    const patch = new Patch(req.body);
    await patch.save();
    res.status(201).json(patch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/patches
 * Get all patches
 */
const getPatches = async (req, res) => {
  try {
    const { severity, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (status) query['deployment.status'] = status;
    
    const patches = await Patch.find(query)
      .sort({ releaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('vulnerabilities');
    
    const total = await Patch.countDocuments(query);
    
    res.json({
      patches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/patches/:id/deploy
 * Deploy patch to assets
 */
const deployPatch = async (req, res) => {
  try {
    const patch = await Patch.findById(req.params.id);
    
    if (!patch) {
      return res.status(404).json({ error: 'Patch not found' });
    }
    
    await patch.deployToAssets(req.body.assetIds, req.body.deployedBy);
    
    res.json({ message: 'Patch deployment initiated', patch });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/patches/:id/test
 * Test patch
 */
const testPatch = async (req, res) => {
  try {
    const patch = await Patch.findById(req.params.id);
    
    if (!patch) {
      return res.status(404).json({ error: 'Patch not found' });
    }
    
    patch.testPatch(req.body);
    await patch.save();
    
    res.json(patch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/patches/critical
 * Get critical patches
 */
const getCriticalPatches = async (req, res) => {
  try {
    const patches = await Patch.findCritical();
    res.json({ count: patches.length, patches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// COMPLIANCE MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/compliance
 * Create compliance check
 */
const createRuntimeGuard = async (req, res) => {
  try {
    const check = new RuntimeGuard(req.body);
    await check.save();
    res.status(201).json(check);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/compliance
 * Get all compliance checks
 */
const getRuntimeGuards = async (req, res) => {
  try {
    const { framework, status } = req.query;
    
    const query = {};
    if (framework) query['framework.name'] = framework;
    if (status) query.status = status;
    
    const checks = await RuntimeGuard.find(query)
      .sort({ 'timing.started': -1 });
    
    res.json({ checks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/compliance/:id
 * Get compliance check by ID
 */
const getRuntimeGuardById = async (req, res) => {
  try {
    const check = await RuntimeGuard.findById(req.params.id)
      .populate('scope.assets');
    
    if (!check) {
      return res.status(404).json({ error: 'Compliance check not found' });
    }
    
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/compliance/:id/complete
 * Complete compliance check
 */
const completeRuntimeGuard = async (req, res) => {
  try {
    const check = await RuntimeGuard.findById(req.params.id);
    
    if (!check) {
      return res.status(404).json({ error: 'Compliance check not found' });
    }
    
    check.complete();
    await check.save();
    
    res.json(check);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// REMEDIATION MANAGEMENT
// ============================================================================

/**
 * POST /api/vulnscan/remediation
 * Create remediation plan
 */
const createRemediationPlan = async (req, res) => {
  try {
    const plan = new RemediationPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/remediation
 * Get all remediation plans
 */
const getRemediationPlans = async (req, res) => {
  try {
    const { priority, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (priority) query.priority = priority;
    if (status) query.status = status;
    
    const plans = await RemediationPlan.find(query)
      .sort({ priority: 1, 'timeline.targetCompletion': 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('vulnerabilities.vulnerability');
    
    const total = await RemediationPlan.countDocuments(query);
    
    res.json({
      plans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/remediation/:id/approve
 * Approve remediation plan
 */
const approveRemediationPlan = async (req, res) => {
  try {
    const plan = await RemediationPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Remediation plan not found' });
    }
    
    plan.approve(req.body);
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /api/vulnscan/remediation/:id/complete
 * Complete remediation plan
 */
const completeRemediationPlan = async (req, res) => {
  try {
    const plan = await RemediationPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Remediation plan not found' });
    }
    
    plan.complete(req.body.userId);
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ============================================================================
// REPORTING
// ============================================================================

/**
 * POST /api/vulnscan/reports
 * Generate new report
 */
const generateReport = async (req, res) => {
  try {
    const report = new VulnReport(req.body);
    report.status = 'generated';
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/reports
 * Get all reports
 */
const getReports = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    
    const reports = await VulnReport.find(query)
      .sort({ 'generation.generatedAt': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await VulnReport.countDocuments(query);
    
    res.json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/vulnscan/reports/:id
 * Get report by ID
 */
const getReportById = async (req, res) => {
  try {
    const report = await VulnReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // System & Dashboard
  getStatus,
  getDashboard,
  
  // Asset Management
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetVulnerabilities,
  getHighRiskAssets,
  
  // Vulnerability Management
  createVulnerability,
  getVulnerabilities,
  getVulnerabilityById,
  getCriticalVulnerabilities,
  getExploitableVulnerabilities,
  assignRemediationToVulnerability,
  patchVulnerability,
  
  // Scan Management
  createScan,
  getScans,
  getScanById,
  startScan,
  pauseScan,
  resumeScan,
  cancelScan,
  getActiveScans,
  
  // Scan Schedules
  createSchedule,
  getSchedules,
  executeSchedule,
  
  // Patch Management
  createPatch,
  getPatches,
  deployPatch,
  testPatch,
  getCriticalPatches,
  
  // Compliance Management
  createRuntimeGuard,
  getRuntimeGuards,
  getRuntimeGuardById,
  completeRuntimeGuard,
  
  // Remediation Management
  createRemediationPlan,
  getRemediationPlans,
  approveRemediationPlan,
  completeRemediationPlan,
  
  // Reporting
  generateReport,
  getReports,
  getReportById
};

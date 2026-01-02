const { v4: uuidv4 } = require('uuid');
const { SecurityScan, SecurityFinding, CloudResource, ComplianceReport, AttackPath } = require('../models');
const awsScanner = require('../services/aws.scanner');
const azureScanner = require('../services/azure.scanner');
const gcpScanner = require('../services/gcp.scanner');
const complianceEngine = require('../services/compliance.engine');
const attackPathAnalyzer = require('../services/attackpath.analyzer');

/**
 * Start a new security scan
 */
exports.startScan = async (req, res) => {
  try {
    const {
      providers = ['aws', 'azure', 'gcp'],
      scanType = 'full',
      complianceFrameworks = ['CIS', 'SOC2', 'PCI-DSS', 'HIPAA'],
      regions,
      resourceTypes
    } = req.body;

    // Create scan record
    const scan = new SecurityScan({
      scanId: `scan_${uuidv4()}`,
      scanType,
      providers,
      complianceFrameworks,
      regions,
      resourceTypes,
      status: 'pending',
      triggeredBy: 'api',
      triggeredByUserId: req.user?.id
    });

    await scan.save();

    // Start scan asynchronously
    processScan(scan._id).catch(console.error);

    res.status(202).json({
      success: true,
      message: 'Scan initiated successfully',
      data: {
        scanId: scan.scanId,
        status: scan.status,
        estimatedDuration: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Start scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start security scan',
      details: error.message
    });
  }
};

/**
 * Process scan in background
 */
async function processScan(scanId) {
  const scan = await SecurityScan.findById(scanId);
  if (!scan) return;

  try {
    scan.status = 'running';
    scan.startedAt = new Date();
    await scan.save();

    const allFindings = [];
    const allResources = [];

    // Scan each provider
    for (const provider of scan.providers) {
      scan.currentPhase = `Scanning ${provider.toUpperCase()}`;
      await scan.save();

      let scanResult;
      switch (provider) {
        case 'aws':
          scanResult = await awsScanner.scan(scan);
          break;
        case 'azure':
          scanResult = await azureScanner.scan(scan);
          break;
        case 'gcp':
          scanResult = await gcpScanner.scan(scan);
          break;
      }

      if (scanResult) {
        allFindings.push(...(scanResult.findings || []));
        allResources.push(...(scanResult.resources || []));
      }
    }

    // Save resources
    for (const resource of allResources) {
      await CloudResource.findOneAndUpdate(
        { resourceId: resource.resourceId },
        resource,
        { upsert: true, new: true }
      );
    }

    // Save findings
    for (const finding of allFindings) {
      finding.findingId = finding.findingId || `finding_${uuidv4()}`;
      await SecurityFinding.findOneAndUpdate(
        { findingId: finding.findingId },
        { ...finding, lastSeenAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // Run compliance checks
    scan.currentPhase = 'Checking compliance';
    await scan.save();
    const complianceResults = await complianceEngine.evaluate(allFindings, scan.complianceFrameworks);

    // Analyze attack paths
    scan.currentPhase = 'Analyzing attack paths';
    await scan.save();
    const attackPaths = await attackPathAnalyzer.analyze(allResources, allFindings);

    // Save attack paths
    for (const path of attackPaths) {
      path.pathId = path.pathId || `path_${uuidv4()}`;
      await AttackPath.findOneAndUpdate(
        { pathId: path.pathId },
        path,
        { upsert: true, new: true }
      );
    }

    // Calculate security score
    const securityScore = calculateSecurityScore(allFindings);

    // Update scan results
    scan.status = 'completed';
    scan.completedAt = new Date();
    scan.duration = Math.round((scan.completedAt - scan.startedAt) / 1000);
    scan.progress = 100;
    scan.results = {
      totalResources: allResources.length,
      resourcesScanned: allResources.length,
      totalFindings: allFindings.length,
      findingsBySeverity: {
        critical: allFindings.filter(f => f.severity === 'critical').length,
        high: allFindings.filter(f => f.severity === 'high').length,
        medium: allFindings.filter(f => f.severity === 'medium').length,
        low: allFindings.filter(f => f.severity === 'low').length,
        info: allFindings.filter(f => f.severity === 'info').length
      }
    };
    scan.securityScore = { overall: securityScore };
    scan.complianceStatus = complianceResults;
    await scan.save();

  } catch (error) {
    console.error('Scan processing error:', error);
    scan.status = 'failed';
    scan.errors.push({
      message: error.message,
      timestamp: new Date()
    });
    await scan.save();
  }
}

function calculateSecurityScore(findings) {
  if (findings.length === 0) return 100;
  
  const weights = { critical: 25, high: 15, medium: 5, low: 2, info: 0 };
  let totalPenalty = 0;
  
  findings.forEach(f => {
    totalPenalty += weights[f.severity] || 0;
  });
  
  return Math.max(0, Math.min(100, 100 - totalPenalty));
}

/**
 * Get scan status
 */
exports.getScanStatus = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scan = await SecurityScan.findOne({ scanId });
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get scan status',
      details: error.message
    });
  }
};

/**
 * Get scan results
 */
exports.getScanResults = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scan = await SecurityScan.findOne({ scanId });
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    // Get findings from this scan timeframe
    const findings = await SecurityFinding.find({
      lastSeenAt: { $gte: scan.startedAt }
    }).sort({ severity: 1 });

    res.json({
      success: true,
      data: {
        scan,
        findings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get scan results',
      details: error.message
    });
  }
};

/**
 * Get all scans
 */
exports.getScans = async (req, res) => {
  try {
    const { limit = 20, page = 1, status } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const scans = await SecurityScan.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await SecurityScan.countDocuments(query);

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get scans',
      details: error.message
    });
  }
};

/**
 * Cancel a running scan
 */
exports.cancelScan = async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scan = await SecurityScan.findOneAndUpdate(
      { scanId, status: 'running' },
      { status: 'cancelled', completedAt: new Date() },
      { new: true }
    );

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Running scan not found'
      });
    }

    res.json({
      success: true,
      message: 'Scan cancelled',
      data: scan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel scan',
      details: error.message
    });
  }
};

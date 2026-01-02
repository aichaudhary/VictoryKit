const { APIScan, APIEndpoint, APIVulnerability, APISpec } = require('../models');
const OpenAPIParser = require('../services/openapi.parser');
const FuzzingEngine = require('../services/fuzzing.engine');
const OWASPChecker = require('../services/owasp.checker');
const AuthTester = require('../services/auth.tester');

// Start a new scan
exports.startScan = async (req, res) => {
  try {
    const {
      name,
      specId,
      targetUrl,
      scanType = 'full',
      scanProfile = 'active',
      testCategories = ['owasp-top-10'],
      authentication,
      settings
    } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'Target URL is required'
      });
    }

    // Create scan record
    const scan = new APIScan({
      name: name || `API Scan - ${new Date().toISOString()}`,
      specId,
      targetUrl,
      scanType,
      scanProfile,
      testCategories,
      authentication,
      settings: {
        maxRequestsPerSecond: settings?.maxRequestsPerSecond || 10,
        requestTimeout: settings?.requestTimeout || 30000,
        followRedirects: settings?.followRedirects ?? true,
        verifySsl: settings?.verifySsl ?? true,
        ...settings
      },
      status: 'pending',
      progress: 0,
      currentPhase: 'init'
    });

    await scan.save();

    // Start scan in background
    processScan(scan._id).catch(err => {
      console.error('Scan processing error:', err);
    });

    res.status(201).json({
      success: true,
      data: {
        scan: {
          _id: scan._id,
          name: scan.name,
          status: scan.status,
          targetUrl: scan.targetUrl
        }
      }
    });
  } catch (error) {
    console.error('Start scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Background scan processor
async function processScan(scanId) {
  const scan = await APIScan.findById(scanId);
  if (!scan) return;

  try {
    scan.status = 'running';
    scan.startedAt = new Date();
    scan.currentPhase = 'discovery';
    await scan.save();

    // Phase 1: Discovery - Parse API spec or discover endpoints
    let endpoints = [];
    if (scan.specId) {
      const spec = await APISpec.findById(scan.specId);
      if (spec) {
        endpoints = await APIEndpoint.find({ specId: spec._id });
      }
    }

    if (endpoints.length === 0) {
      // Auto-discover endpoints
      endpoints = await discoverEndpoints(scan.targetUrl);
    }

    scan.results = { totalEndpoints: endpoints.length, testedEndpoints: 0 };
    scan.progress = 10;
    await scan.save();

    // Phase 2: Testing
    scan.currentPhase = 'testing';
    await scan.save();

    const vulnerabilities = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    const allFindings = [];

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      scan.currentEndpoint = `${endpoint.method} ${endpoint.path}`;
      scan.progress = 10 + Math.floor((i / endpoints.length) * 60);
      await scan.save();

      // Run OWASP checks
      if (scan.testCategories.includes('owasp-top-10')) {
        const owaspFindings = await OWASPChecker.checkEndpoint(
          scan.targetUrl,
          endpoint,
          scan.authentication
        );
        allFindings.push(...owaspFindings);
      }

      // Run auth tests
      if (scan.testCategories.includes('auth-testing')) {
        const authFindings = await AuthTester.testEndpoint(
          scan.targetUrl,
          endpoint,
          scan.authentication
        );
        allFindings.push(...authFindings);
      }

      // Run fuzzing
      if (scan.testCategories.includes('fuzzing') && scan.scanProfile !== 'passive') {
        const fuzzFindings = await FuzzingEngine.fuzzEndpoint(
          scan.targetUrl,
          endpoint,
          scan.authentication
        );
        allFindings.push(...fuzzFindings);
      }

      scan.results.testedEndpoints = i + 1;
      await scan.save();
    }

    // Phase 3: Analysis
    scan.currentPhase = 'analysis';
    scan.progress = 75;
    await scan.save();

    // Save vulnerabilities and count by severity
    for (const finding of allFindings) {
      const vuln = new APIVulnerability({
        ...finding,
        scanId: scan._id,
        specId: scan.specId
      });
      await vuln.save();
      vulnerabilities[finding.severity]++;
    }

    // Calculate security score
    const totalVulns = Object.values(vulnerabilities).reduce((a, b) => a + b, 0);
    const weightedScore = 
      (vulnerabilities.critical * 40) +
      (vulnerabilities.high * 25) +
      (vulnerabilities.medium * 10) +
      (vulnerabilities.low * 3);
    
    const securityScore = Math.max(0, Math.min(100, 
      100 - Math.round(weightedScore / Math.max(endpoints.length, 1) * 5)
    ));

    // Phase 4: Complete
    scan.currentPhase = 'done';
    scan.status = 'completed';
    scan.progress = 100;
    scan.completedAt = new Date();
    scan.duration = Math.round((scan.completedAt - scan.startedAt) / 1000);
    scan.results = {
      ...scan.results,
      vulnerabilities,
      securityScore,
      totalRequests: allFindings.length * 3, // Approximate
      categories: calculateCategories(allFindings)
    };
    await scan.save();

  } catch (error) {
    console.error('Scan processing error:', error);
    scan.status = 'failed';
    scan.errors.push({
      timestamp: new Date(),
      message: error.message
    });
    await scan.save();
  }
}

async function discoverEndpoints(baseUrl) {
  // Mock discovery - in real implementation, would crawl or use common paths
  const commonPaths = [
    { method: 'GET', path: '/api/health' },
    { method: 'POST', path: '/api/auth/login' },
    { method: 'POST', path: '/api/auth/register' },
    { method: 'GET', path: '/api/users' },
    { method: 'GET', path: '/api/users/:id' },
    { method: 'PUT', path: '/api/users/:id' },
    { method: 'DELETE', path: '/api/users/:id' },
    { method: 'GET', path: '/api/products' },
    { method: 'POST', path: '/api/products' },
    { method: 'GET', path: '/api/orders' }
  ];

  return commonPaths.map((p, idx) => ({
    _id: `discovered-${idx}`,
    ...p,
    fullUrl: `${baseUrl}${p.path}`,
    discoveryMethod: 'crawl'
  }));
}

function calculateCategories(findings) {
  const categoryMap = {};
  for (const f of findings) {
    const cat = f.category || 'other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, count: 0, severity: 'low' };
    }
    categoryMap[cat].count++;
    // Upgrade severity if higher found
    const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
    if (severityOrder.indexOf(f.severity) > severityOrder.indexOf(categoryMap[cat].severity)) {
      categoryMap[cat].severity = f.severity;
    }
  }
  return Object.values(categoryMap);
}

// Get scan status
exports.getScanStatus = async (req, res) => {
  try {
    const scan = await APIScan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      data: {
        scan: {
          _id: scan._id,
          name: scan.name,
          status: scan.status,
          progress: scan.progress,
          currentPhase: scan.currentPhase,
          currentEndpoint: scan.currentEndpoint,
          results: scan.results
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get scan results
exports.getScanResults = async (req, res) => {
  try {
    const scan = await APIScan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    const vulnerabilities = await APIVulnerability.find({ scanId: scan._id })
      .sort({ severity: 1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        scan,
        vulnerabilities
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// List all scans
exports.listScans = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query = {};
    if (status) query.status = status;

    const scans = await APIScan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await APIScan.countDocuments(query);

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Cancel scan
exports.cancelScan = async (req, res) => {
  try {
    const scan = await APIScan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    if (scan.status === 'completed' || scan.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Scan already finished'
      });
    }

    scan.status = 'cancelled';
    scan.completedAt = new Date();
    await scan.save();

    res.json({
      success: true,
      data: { scan }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

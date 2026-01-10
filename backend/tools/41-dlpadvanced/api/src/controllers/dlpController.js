const { 
  Policy, 
  Incident, 
  DataClassification, 
  ScanResult, 
  UserRisk, 
  ComplianceReport 
} = require('../models');

// ============================================================================
// POLICY MANAGEMENT
// ============================================================================

/**
 * GET /api/v1/dlp/policies
 * Get all DLP policies with filtering
 */
exports.getPolicies = async (req, res) => {
  try {
    const { enabled, framework, severity, search } = req.query;
    
    const query = {};
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (framework) query.framework = framework;
    if (severity) query.severity = severity;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const policies = await Policy.find(query)
      .sort({ 'statistics.violations': -1 });
    
    res.json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/policies/:id
 * Get single policy by ID
 */
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findOne({ policyId: req.params.id });
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/policies
 * Create new DLP policy
 */
exports.createPolicy = async (req, res) => {
  try {
    const policyData = {
      ...req.body,
      createdBy: {
        userId: req.user?.userId || 'system',
        name: req.user?.name || 'System',
        timestamp: new Date()
      }
    };
    
    const policy = await Policy.create(policyData);
    
    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/v1/dlp/policies/:id
 * Update existing policy
 */
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ policyId: req.params.id });
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    Object.assign(policy, req.body);
    policy.lastModifiedBy = {
      userId: req.user?.userId || 'system',
      name: req.user?.name || 'System',
      timestamp: new Date()
    };
    
    await policy.save();
    
    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/v1/dlp/policies/:id
 * Delete policy
 */
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findOneAndDelete({ policyId: req.params.id });
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/policies/:id/test
 * Test policy against sample input
 */
exports.testPolicy = async (req, res) => {
  try {
    const { input } = req.body;
    const policy = await Policy.findOne({ policyId: req.params.id });
    
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }
    
    const result = await policy.testPolicy(input);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/policies/templates
 * Get policy templates for different frameworks
 */
exports.getPolicyTemplates = async (req, res) => {
  try {
    const templates = [
      {
        name: 'GDPR Personal Data Protection',
        framework: 'GDPR',
        description: 'Prevent unauthorized transfer of EU personal data',
        conditions: {
          dataTypes: ['PII'],
          actions: ['email', 'upload', 'download'],
          destinations: ['external']
        },
        actions: { block: true, alert: true, log: true },
        severity: 'high'
      },
      {
        name: 'HIPAA PHI Protection',
        framework: 'HIPAA',
        description: 'Protect Protected Health Information (PHI)',
        conditions: {
          dataTypes: ['PHI'],
          actions: ['any'],
          destinations: ['external']
        },
        actions: { block: true, alert: true, encrypt: true, log: true },
        severity: 'critical'
      },
      {
        name: 'PCI-DSS Credit Card Protection',
        framework: 'PCI-DSS',
        description: 'Prevent credit card data exfiltration',
        conditions: {
          dataTypes: ['PCI'],
          actions: ['email', 'upload', 'usb'],
          patterns: ['\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b']
        },
        actions: { block: true, alert: true, quarantine: true, log: true },
        severity: 'critical'
      },
      {
        name: 'Intellectual Property Protection',
        framework: 'Custom',
        description: 'Protect trade secrets and IP from unauthorized sharing',
        conditions: {
          dataTypes: ['Intellectual Property', 'Trade Secret'],
          actions: ['email', 'upload', 'print'],
          destinations: ['external', 'cloud']
        },
        actions: { alert: true, requireJustification: true, log: true },
        severity: 'high'
      }
    ];
    
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// INCIDENT MANAGEMENT
// ============================================================================

/**
 * GET /api/v1/dlp/incidents
 * Get all incidents with filtering
 */
exports.getIncidents = async (req, res) => {
  try {
    const { severity, status, userId, startDate, endDate, limit = 50 } = req.query;
    
    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (userId) query['user.userId'] = userId;
    if (startDate || endDate) {
      query['action.timestamp'] = {};
      if (startDate) query['action.timestamp'].$gte = new Date(startDate);
      if (endDate) query['action.timestamp'].$lte = new Date(endDate);
    }
    
    const incidents = await Incident.find(query)
      .sort({ 'action.timestamp': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/incidents/:id
 * Get single incident details
 */
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/incidents/:id/respond
 * Respond to an incident (assign, add note, escalate)
 */
exports.respondToIncident = async (req, res) => {
  try {
    const { action, note, assignTo } = req.body;
    const incident = await Incident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    if (action === 'assign' && assignTo) {
      await incident.assignTo(assignTo.userId, assignTo.name);
    } else if (action === 'note' && note) {
      await incident.addNote(note, req.user?.name || 'System');
    } else if (action === 'escalate') {
      await incident.escalate();
    }
    
    res.json({
      success: true,
      message: 'Incident updated successfully',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/incidents/:id/resolve
 * Resolve an incident
 */
exports.resolveIncident = async (req, res) => {
  try {
    const { outcome, description } = req.body;
    const incident = await Incident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    await incident.resolve(
      outcome,
      description,
      {
        userId: req.user?.userId || 'system',
        name: req.user?.name || 'System'
      }
    );
    
    res.json({
      success: true,
      message: 'Incident resolved successfully',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/incidents/statistics
 * Get incident statistics
 */
exports.getIncidentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const stats = await Incident.getStatisticsByTimeRange(start, end);
    const critical = await Incident.getCriticalIncidents();
    
    const totalIncidents = await Incident.countDocuments({
      'action.timestamp': { $gte: start, $lte: end }
    });
    
    const resolvedIncidents = await Incident.countDocuments({
      'action.timestamp': { $gte: start, $lte: end },
      status: 'resolved'
    });
    
    res.json({
      success: true,
      data: {
        totalIncidents,
        resolvedIncidents,
        resolutionRate: totalIncidents > 0 ? ((resolvedIncidents / totalIncidents) * 100).toFixed(2) : 0,
        bySeverity: stats,
        criticalIncidents: critical.length,
        timeRange: { start, end }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// DATA DISCOVERY & CLASSIFICATION
// ============================================================================

/**
 * POST /api/v1/dlp/scan/start
 * Start a new data discovery scan
 */
exports.startScan = async (req, res) => {
  try {
    const scanData = {
      ...req.body,
      status: 'pending',
      initiatedBy: {
        userId: req.user?.userId || 'system',
        name: req.user?.name || 'System',
        trigger: 'manual'
      },
      statistics: {
        locationsScanned: 0,
        filesScanned: 0,
        totalSizeScanned: 0,
        filesProcessed: 0,
        filesSkipped: 0,
        errors: 0
      },
      sensitiveFound: {
        count: 0,
        breakdown: { public: 0, internal: 0, confidential: 0, restricted: 0 },
        dataTypes: []
      }
    };
    
    const scan = await ScanResult.create(scanData);
    
    // TODO: Trigger actual scanning process (queue job, call ML service, etc.)
    
    res.status(201).json({
      success: true,
      message: 'Scan started successfully',
      data: scan
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/scan/status/:scanId
 * Get scan status
 */
exports.getScanStatus = async (req, res) => {
  try {
    const scan = await ScanResult.findOne({ scanId: req.params.scanId });
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({
      success: true,
      data: {
        scanId: scan.scanId,
        status: scan.status,
        progress: scan.progress,
        startTime: scan.startTime,
        duration: scan.duration,
        statistics: scan.statistics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/scan/results/:scanId
 * Get detailed scan results
 */
exports.getScanResults = async (req, res) => {
  try {
    const scan = await ScanResult.findOne({ scanId: req.params.scanId });
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/classify
 * Manually classify data
 */
exports.classifyData = async (req, res) => {
  try {
    const { path, classification, dataTypes, override } = req.body;
    
    let dataClass = await DataClassification.findOne({ path });
    
    if (!dataClass) {
      dataClass = await DataClassification.create({
        ...req.body,
        autoClassified: false
      });
    } else if (override) {
      await dataClass.overrideClassification(
        classification,
        'Manual override',
        req.user?.userId || 'system',
        req.user?.name || 'System'
      );
    }
    
    res.json({
      success: true,
      message: 'Data classified successfully',
      data: dataClass
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/inventory
 * Get data inventory
 */
exports.getDataInventory = async (req, res) => {
  try {
    const { classification, location, dataType, riskThreshold } = req.query;
    
    const query = { status: 'active' };
    if (classification) query.classification = classification;
    if (location) query.location = location;
    if (dataType) query['dataTypes.type'] = dataType;
    if (riskThreshold) query.riskScore = { $gte: parseInt(riskThreshold) };
    
    const inventory = await DataClassification.find(query)
      .sort({ riskScore: -1 })
      .limit(1000);
    
    const stats = await DataClassification.getStatsByClassification();
    
    res.json({
      success: true,
      count: inventory.length,
      statistics: stats,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// USER RISK MANAGEMENT
// ============================================================================

/**
 * GET /api/v1/dlp/users
 * Get all users with risk scores
 */
exports.getUsers = async (req, res) => {
  try {
    const { department, riskLevel, watchlist } = req.query;
    
    const query = { status: { $ne: 'terminated' } };
    if (department) query.department = department;
    if (riskLevel) query.riskLevel = riskLevel;
    if (watchlist === 'true') query.watchlist = true;
    
    const users = await UserRisk.find(query)
      .sort({ riskScore: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/users/:id/risk
 * Get user risk details
 */
exports.getUserRisk = async (req, res) => {
  try {
    const user = await UserRisk.findOne({ userId: req.params.id });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/users/:id/activity
 * Get user activity history
 */
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user's incidents
    const incidents = await Incident.getOpenByUser(userId);
    
    // Get user's data access
    const dataAccess = await DataClassification.find({ 
      'owner.userId': userId 
    }).limit(100);
    
    res.json({
      success: true,
      data: {
        incidents,
        dataAccess,
        incidentCount: incidents.length,
        filesOwned: dataAccess.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/users/:id/risk-override
 * Override user risk score
 */
exports.overrideUserRisk = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await UserRisk.findOne({ userId: req.params.id });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (action === 'watchlist') {
      await user.addToWatchlist(reason);
    } else if (action === 'remove_watchlist') {
      await user.removeFromWatchlist();
    }
    
    res.json({
      success: true,
      message: 'User risk updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// COMPLIANCE & REPORTING
// ============================================================================

/**
 * GET /api/v1/dlp/compliance/status
 * Get overall compliance status
 */
exports.getComplianceStatus = async (req, res) => {
  try {
    const frameworks = ['GDPR', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO27001'];
    const statuses = [];
    
    for (const framework of frameworks) {
      const latestReport = await ComplianceReport.getLatestReport(framework);
      statuses.push({
        framework,
        status: latestReport?.overallStatus || 'not_assessed',
        score: latestReport?.complianceScore || 0,
        lastAssessed: latestReport?.generatedAt || null
      });
    }
    
    res.json({ success: true, data: statuses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/compliance/report
 * Generate compliance report
 */
exports.generateComplianceReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      generatedBy: {
        userId: req.user?.userId || 'system',
        name: req.user?.name || 'System'
      }
    };
    
    const report = await ComplianceReport.create(reportData);
    
    // Calculate compliance score
    report.calculateComplianceScore();
    await report.save();
    
    res.status(201).json({
      success: true,
      message: 'Compliance report generated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/compliance/:framework
 * Get compliance details for specific framework
 */
exports.getComplianceByFramework = async (req, res) => {
  try {
    const reports = await ComplianceReport.getByFramework(req.params.framework);
    const trend = await ComplianceReport.getComplianceTrend(req.params.framework, 6);
    
    res.json({
      success: true,
      data: {
        reports,
        trend,
        framework: req.params.framework
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/compliance/data-subject-request
 * Handle GDPR data subject requests
 */
exports.handleDataSubjectRequest = async (req, res) => {
  try {
    const { requestType, subjectEmail, details } = req.body;
    
    // Log the request
    const request = {
      requestType,
      subjectEmail,
      details,
      receivedAt: new Date(),
      status: 'pending'
    };
    
    // TODO: Process the request (search data, generate report, etc.)
    
    res.json({
      success: true,
      message: 'Data subject request received and will be processed',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// MONITORING & REAL-TIME
// ============================================================================

/**
 * GET /api/v1/dlp/monitoring/live
 * Get live data transfer activity
 */
exports.getLiveMonitoring = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const recentIncidents = await Incident.find({
      'action.timestamp': { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    })
      .sort({ 'action.timestamp': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: recentIncidents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/monitoring/channels
 * Get monitoring channel status
 */
exports.getChannelStatus = async (req, res) => {
  try {
    // TODO: Check actual channel/agent status
    const channels = [
      { channel: 'email', status: 'active', monitored: 1250 },
      { channel: 'endpoints', status: 'active', monitored: 450 },
      { channel: 'cloud', status: 'active', monitored: 850 },
      { channel: 'network', status: 'active', monitored: 2100 }
    ];
    
    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/v1/dlp/monitoring/block
 * Block a data transfer in real-time
 */
exports.blockTransfer = async (req, res) => {
  try {
    const { incidentId, reason } = req.body;
    
    const incident = await Incident.findOne({ incidentId });
    
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    
    incident.action.blocked = true;
    await incident.addNote(`Transfer blocked: ${reason}`, req.user?.name || 'System');
    
    res.json({
      success: true,
      message: 'Transfer blocked successfully',
      data: incident
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/monitoring/flows
 * Get data flow visualization data
 */
exports.getDataFlows = async (req, res) => {
  try {
    const flows = await Incident.aggregate([
      {
        $match: {
          'action.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            source: '$source',
            destination: '$destination',
            dataType: '$data.type'
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$data.size' },
          blocked: {
            $sum: { $cond: ['$action.blocked', 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 100
      }
    ]);
    
    res.json({ success: true, data: flows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// REPORTS
// ============================================================================

/**
 * POST /api/v1/dlp/reports/generate
 * Generate custom report
 */
exports.generateReport = async (req, res) => {
  try {
    const { reportType, parameters } = req.body;
    
    // TODO: Generate report based on type
    const report = {
      reportId: `RPT-${Date.now()}`,
      reportType,
      parameters,
      generatedAt: new Date(),
      generatedBy: req.user?.name || 'System',
      status: 'completed'
    };
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/reports/:id
 * Get generated report
 */
exports.getReport = async (req, res) => {
  try {
    // TODO: Fetch actual report
    res.json({
      success: true,
      message: 'Report retrieval not yet implemented'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/v1/dlp/reports/templates
 * Get report templates
 */
exports.getReportTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        description: 'High-level overview for executives',
        parameters: ['timeRange', 'departments']
      },
      {
        id: 'incident_detail',
        name: 'Incident Detail Report',
        description: 'Detailed incident analysis',
        parameters: ['timeRange', 'severity', 'status']
      },
      {
        id: 'compliance_audit',
        name: 'Compliance Audit Report',
        description: 'Compliance assessment for specific framework',
        parameters: ['framework', 'timeRange']
      },
      {
        id: 'user_activity',
        name: 'User Activity Report',
        description: 'User behavior and risk analysis',
        parameters: ['userId', 'timeRange']
      },
      {
        id: 'data_inventory',
        name: 'Data Inventory Report',
        description: 'Sensitive data discovery results',
        parameters: ['classification', 'location', 'timeRange']
      }
    ];
    
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// DASHBOARD METRICS
// ============================================================================

/**
 * GET /api/v1/dlp/dashboard
 * Get dashboard metrics
 */
exports.getDashboardMetrics = async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Incidents
    const criticalIncidents = await Incident.countDocuments({
      severity: 'critical',
      status: { $ne: 'resolved' }
    });
    
    const incidents24h = await Incident.countDocuments({
      'action.timestamp': { $gte: last24h }
    });
    
    // Data protection
    const totalSensitiveFiles = await DataClassification.countDocuments({
      status: 'active',
      classification: { $in: ['Confidential', 'Restricted'] }
    });
    
    const highRiskFiles = await DataClassification.countDocuments({
      status: 'active',
      riskScore: { $gte: 70 }
    });
    
    // Policies
    const activePolicies = await Policy.countDocuments({ enabled: true });
    const policyViolations7d = await Incident.countDocuments({
      'action.timestamp': { $gte: last7d }
    });
    
    // Users
    const highRiskUsers = await UserRisk.countDocuments({
      riskScore: { $gte: 70 },
      status: 'active'
    });
    
    res.json({
      success: true,
      data: {
        criticalIncidents,
        incidents24h,
        totalSensitiveFiles,
        highRiskFiles,
        activePolicies,
        policyViolations7d,
        highRiskUsers,
        dataProtectionScore: 85, // TODO: Calculate actual score
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;

const {
  Device,
  Threat,
  ScanResult,
  SecurityAssessment,
  ComplianceReport,
  AccessPoint
} = require('../models');

// ==================== DEVICE MANAGEMENT ====================

exports.getAllDevices = async (req, res) => {
  try {
    const {
      status,
      deviceType,
      riskScore,
      limit = 100,
      skip = 0,
      sortBy = 'lastSeen',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (deviceType) filter.deviceType = deviceType;
    if (riskScore) filter.riskScore = { $gte: parseInt(riskScore) };

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const devices = await Device.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('connectedAp');

    const total = await Device.countDocuments(filter);

    res.json({
      success: true,
      count: devices.length,
      total,
      data: devices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({ 
      $or: [
        { _id: req.params.id },
        { macAddress: req.params.id }
      ]
    }).populate('connectedAp');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.authorizeDevice = async (req, res) => {
  try {
    const { macAddress, username, department } = req.body;

    const device = await Device.findOneAndUpdate(
      { macAddress },
      {
        status: 'authorized',
        'user.username': username,
        'user.department': department,
        updatedBy: req.user?.username || 'system'
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({
      success: true,
      message: 'Device authorized successfully',
      data: device
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.blockDevice = async (req, res) => {
  try {
    const { macAddress, reason } = req.body;

    const device = await Device.findOneAndUpdate(
      { macAddress },
      {
        status: 'blocked',
        notes: reason,
        updatedBy: req.user?.username || 'system'
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Create a threat entry for blocked device
    await Threat.create({
      threatId: `BLOCK-${Date.now()}-${macAddress}`,
      threatType: 'unauthorized_device',
      severity: 'high',
      source: {
        type: 'device',
        macAddress,
        identifier: device.hostname || macAddress
      },
      description: `Device blocked: ${reason}`,
      status: 'contained',
      responseActions: [{
        action: 'block_device',
        performedAt: new Date(),
        performedBy: req.user?.username || 'system',
        result: 'success'
      }]
    });

    res.json({
      success: true,
      message: 'Device blocked successfully',
      data: device
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeviceProfile = async (req, res) => {
  try {
    const device = await Device.findOne({ macAddress: req.params.mac });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const profile = {
      basicInfo: {
        macAddress: device.macAddress,
        ipAddress: device.ipAddress,
        hostname: device.hostname,
        deviceType: device.deviceType,
        vendor: device.vendor,
        os: device.os
      },
      connectionInfo: {
        connectedAp: device.connectedAp,
        ssid: device.ssid,
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen,
        isActive: device.isActive()
      },
      securityProfile: {
        status: device.status,
        riskScore: device.riskScore,
        riskFactors: device.riskFactors,
        complianceStatus: device.compliance
      },
      trafficStats: device.trafficStats,
      behavioralProfile: device.profile
    };

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeviceRiskScore = async (req, res) => {
  try {
    const device = await Device.findOne({ macAddress: req.params.mac });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const newScore = device.updateRiskScore();
    await device.save();

    res.json({
      success: true,
      message: 'Risk score updated',
      data: {
        macAddress: device.macAddress,
        riskScore: newScore,
        riskFactors: device.riskFactors
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SCAN MANAGEMENT ====================

exports.startScan = async (req, res) => {
  try {
    const {
      scanType = 'quick',
      scanMode = 'hybrid',
      target = {}
    } = req.body;

    const scanId = `SCAN-${Date.now()}`;

    const scan = await ScanResult.create({
      scanId,
      scanType,
      scanMode,
      target,
      startTime: new Date(),
      status: 'running',
      initiatedBy: {
        user: req.user?.username || 'system',
        automated: false,
        reason: req.body.reason || 'Manual scan'
      }
    });

    // Trigger actual scan process (implement in service)
    // wirelessScanService.executeScan(scanId);

    res.json({
      success: true,
      message: 'Scan started',
      data: {
        scanId: scan.scanId,
        status: scan.status,
        startTime: scan.startTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScanStatus = async (req, res) => {
  try {
    const scan = await ScanResult.findOne({ scanId: req.params.scanId });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      success: true,
      data: {
        scanId: scan.scanId,
        status: scan.status,
        progress: scan.progress,
        startTime: scan.startTime,
        endTime: scan.endTime,
        summary: scan.summary
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScanResults = async (req, res) => {
  try {
    const scan = await ScanResult.findOne({ scanId: req.params.scanId });

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllScans = async (req, res) => {
  try {
    const {
      status,
      scanType,
      limit = 50,
      skip = 0
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (scanType) filter.scanType = scanType;

    const scans = await ScanResult.find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-accessPoints -devices -vulnerabilities');

    const total = await ScanResult.countDocuments(filter);

    res.json({
      success: true,
      count: scans.length,
      total,
      data: scans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopScan = async (req, res) => {
  try {
    const scan = await ScanResult.findOneAndUpdate(
      { scanId: req.params.scanId, status: 'running' },
      { status: 'cancelled', endTime: new Date() },
      { new: true }
    );

    if (!scan) {
      return res.status(404).json({ error: 'Active scan not found' });
    }

    res.json({
      success: true,
      message: 'Scan stopped',
      data: scan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== THREAT MANAGEMENT ====================

exports.getAllThreats = async (req, res) => {
  try {
    const {
      status,
      severity,
      threatType,
      limit = 100,
      skip = 0
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (threatType) filter.threatType = threatType;

    const threats = await Threat.find(filter)
      .sort({ detectionTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Threat.countDocuments(filter);

    // Get statistics
    const stats = {
      active: await Threat.countDocuments({ status: 'active' }),
      critical: await Threat.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } }),
      high: await Threat.countDocuments({ severity: 'high', status: { $ne: 'resolved' } })
    };

    res.json({
      success: true,
      count: threats.length,
      total,
      stats,
      data: threats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThreatById = async (req, res) => {
  try {
    const threat = await Threat.findOne({
      $or: [
        { _id: req.params.id },
        { threatId: req.params.id }
      ]
    });

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    res.json({ success: true, data: threat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondToThreat = async (req, res) => {
  try {
    const { action, notes } = req.body;

    const threat = await Threat.findOne({ threatId: req.params.threatId });

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    // Add response action
    threat.responseActions.push({
      action,
      performedAt: new Date(),
      performedBy: req.user?.username || 'system',
      result: 'success',
      details: notes
    });

    // Update status based on action
    if (action === 'block_device' || action === 'quarantine_device') {
      threat.status = 'contained';
    } else if (action === 'manual_intervention') {
      threat.status = 'investigating';
    }

    await threat.save();

    res.json({
      success: true,
      message: 'Response action recorded',
      data: threat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveThreat = async (req, res) => {
  try {
    const { notes } = req.body;

    const threat = await Threat.findOne({ threatId: req.params.threatId });

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    threat.resolve(req.user?.username || 'system', notes);
    await threat.save();

    res.json({
      success: true,
      message: 'Threat resolved',
      data: threat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.escalateThreat = async (req, res) => {
  try {
    const { escalateTo } = req.body;

    const threat = await Threat.findOne({ threatId: req.params.threatId });

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    threat.escalate(escalateTo);
    await threat.save();

    res.json({
      success: true,
      message: 'Threat escalated',
      data: threat
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SECURITY ASSESSMENT ====================

exports.runSecurityAssessment = async (req, res) => {
  try {
    const assessmentId = `ASSESS-${Date.now()}`;

    // Create new assessment
    const assessment = await SecurityAssessment.create({
      assessmentId,
      assessmentType: req.body.assessmentType || 'on_demand',
      assessmentDate: new Date(),
      assessedBy: {
        user: req.user?.username || 'system',
        automated: req.body.automated || false
      },
      scope: req.body.scope || {},
      overallScore: 0
    });

    // Run assessment logic (implement in service)
    // This would populate the assessment with real data

    res.json({
      success: true,
      message: 'Security assessment initiated',
      data: {
        assessmentId: assessment.assessmentId,
        status: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSecurityAssessment = async (req, res) => {
  try {
    const assessment = await SecurityAssessment.findOne({
      $or: [
        { _id: req.params.id },
        { assessmentId: req.params.id }
      ]
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLatestAssessment = async (req, res) => {
  try {
    const assessment = await SecurityAssessment.findOne()
      .sort({ assessmentDate: -1 });

    if (!assessment) {
      return res.status(404).json({ error: 'No assessments found' });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSecurityDashboard = async (req, res) => {
  try {
    const assessment = await SecurityAssessment.findOne()
      .sort({ assessmentDate: -1 })
      .select('overallScore categoryScores trend assessmentDate');

    if (!assessment) {
      return res.json({
        success: true,
        data: {
          overallScore: 0,
          message: 'No assessments available'
        }
      });
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== COMPLIANCE ====================

exports.generateComplianceReport = async (req, res) => {
  try {
    const { framework, reportingPeriod } = req.body;

    if (!framework) {
      return res.status(400).json({ error: 'Framework is required' });
    }

    const reportId = `COMP-${framework}-${Date.now()}`;

    const report = await ComplianceReport.create({
      reportId,
      framework,
      reportDate: new Date(),
      reportingPeriod: reportingPeriod || {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      complianceStatus: 'in_progress',
      generatedBy: {
        user: req.user?.username || 'system',
        automated: req.body.automated || false
      }
    });

    // Generate report logic (implement in service)

    res.json({
      success: true,
      message: 'Compliance report generation started',
      data: {
        reportId: report.reportId,
        framework: report.framework
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findOne({
      $or: [
        { _id: req.params.id },
        { reportId: req.params.id }
      ]
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComplianceStatus = async (req, res) => {
  try {
    const { framework } = req.query;

    const filter = {};
    if (framework) filter.framework = framework;

    const reports = await ComplianceReport.find(filter)
      .sort({ reportDate: -1 })
      .limit(5)
      .select('reportId framework complianceStatus compliancePercentage reportDate');

    const summary = {
      frameworks: await ComplianceReport.distinct('framework'),
      latestReports: reports,
      overallStatus: reports.length > 0 ? reports[0].complianceStatus : 'not_assessed'
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceReport.findOne({ reportId: req.params.reportId });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.approve(req.user?.username || 'admin', req.user?.role || 'admin');
    await report.save();

    res.json({
      success: true,
      message: 'Report approved',
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;

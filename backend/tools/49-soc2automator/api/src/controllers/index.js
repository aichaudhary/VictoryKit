const axios = require('axios');
const models = require('../models');
const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8049';

// ===== Status & Health =====
exports.getStatus = async (req, res) => {
  try {
    const stats = {
      totalScans: await models.Scan.countDocuments(),
      activeScans: await models.Scan.countDocuments({ status: 'in_progress' }),
      totalFindings: await models.Finding.countDocuments(),
      openFindings: await models.Finding.countDocuments({ status: 'open' }),
      criticalFindings: await models.Finding.countDocuments({ status: 'open', severity: 'critical' })
    };
    res.json({ 
      status: 'operational', 
      service: 'PCIDSSCheck', 
      timestamp: new Date(),
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Scanning =====
exports.startScan = async (req, res) => {
  try {
    const { scanType, requirements, scope, merchantLevel } = req.body;
    
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scan = new models.Scan({
      scanId,
      scanType: scanType || 'full_assessment',
      merchantLevel,
      scope,
      requirements: requirements || ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12'],
      status: 'in_progress',
      metadata: {
        initiatedBy: req.body.userId || 'system',
        scannerVersion: '4.0'
      }
    });
    
    await scan.save();
    
    // Log audit
    await logAudit('scan_started', 'scan', scan, req);
    
    // Trigger ML engine scan (async)
    axios.post(`${ML_ENGINE_URL}/scan`, { scanId, scanType, scope })
      .catch(err => console.error('ML Engine error:', err));
    
    res.json({ success: true, scanId, status: 'initiated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getScanStatus = async (req, res) => {
  try {
    const scan = await models.Scan.findOne({ scanId: req.params.scanId });
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllScans = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, scanType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (scanType) filter.scanType = scanType;
    
    const scans = await models.Scan.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await models.Scan.countDocuments(filter);
    
    res.json({ scans, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Requirements =====
exports.getRequirements = async (req, res) => {
  try {
    const requirements = await models.Requirement.find();
    res.json({ requirements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequirementById = async (req, res) => {
  try {
    const requirement = await models.Requirement.findOne({ requirementId: req.params.id });
    if (!requirement) {
      return res.status(404).json({ error: 'Requirement not found' });
    }
    
    // Get associated findings
    const findings = await models.Finding.find({ requirement: req.params.id });
    
    res.json({ requirement, findings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeRequirement = async (req, res) => {
  try {
    const { requirementId, includeSubrequirements, checkCompensatingControls } = req.body;
    
    // Get requirement data
    const requirement = await models.Requirement.findOne({ requirementId });
    const findings = await models.Finding.find({ requirement: requirementId, status: 'open' });
    
    // Call ML engine for deep analysis
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze-requirement`, {
      requirementId,
      includeSubrequirements,
      checkCompensatingControls
    });
    
    res.json({
      requirement,
      findings: findings.length,
      analysis: mlResponse.data,
      complianceScore: requirement.overallCompliance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Findings =====
exports.getFindings = async (req, res) => {
  try {
    const { page = 1, limit = 50, severity, status, requirement, scanId } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (requirement) filter.requirement = requirement;
    if (scanId) filter.scanId = scanId;
    
    const findings = await models.Finding.find(filter)
      .sort({ severity: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await models.Finding.countDocuments(filter);
    const severityCounts = await models.Finding.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    res.json({ 
      findings, 
      total, 
      page: parseInt(page), 
      pages: Math.ceil(total / limit),
      severityCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFindingById = async (req, res) => {
  try {
    const finding = await models.Finding.findOne({ findingId: req.params.id });
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    
    // Get associated remediation
    const remediation = await models.Remediation.findOne({ findingId: req.params.id });
    
    res.json({ finding, remediation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFinding = async (req, res) => {
  try {
    const finding = await models.Finding.findOneAndUpdate(
      { findingId: req.params.id },
      req.body,
      { new: true }
    );
    
    await logAudit('finding_updated', 'finding', finding, req);
    
    res.json({ success: true, finding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Remediation =====
exports.getRemediations = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const remediations = await models.Remediation.find(filter)
      .populate('findingId')
      .sort({ priority: 1, dueDate: 1 });
    
    res.json({ remediations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRemediationPlan = async (req, res) => {
  try {
    const { findingIds, prioritizationMethod, targetDate } = req.body;
    
    // Get findings
    const findings = await models.Finding.find({ findingId: { $in: findingIds } });
    
    // Create remediation tasks
    const remediations = findings.map(finding => ({
      remediationId: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      findingId: finding.findingId,
      title: `Remediate: ${finding.title}`,
      description: finding.remediation.recommendation,
      priority: finding.remediation.priority || 'p3',
      effort: finding.remediation.effort || 'medium',
      status: 'pending'
    }));
    
    await models.Remediation.insertMany(remediations);
    
    res.json({ success: true, remediations: remediations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRemediation = async (req, res) => {
  try {
    const remediation = await models.Remediation.findOneAndUpdate(
      { remediationId: req.params.id },
      req.body,
      { new: true }
    );
    
    await logAudit('remediation_updated', 'remediation', remediation, req);
    
    res.json({ success: true, remediation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Assets =====
exports.getAssets = async (req, res) => {
  try {
    const { category, type, riskLevel } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (riskLevel) filter.riskLevel = riskLevel;
    
    const assets = await models.Asset.find(filter);
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.detectCardholderData = async (req, res) => {
  try {
    const { scanPaths, includeDatab ases, includeFileSystems } = req.body;
    
    // Call ML engine for CHD detection
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/detect-chd`, req.body);
    
    res.json({ success: true, detectedAssets: mlResponse.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Reports =====
exports.getReports = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const reports = await models.Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const { reportType, assessmentDate, includeEvidence, format } = req.body;
    
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get compliance data
    const scans = await models.Scan.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(1);
    const findings = await models.Finding.find({ status: { $in: ['open', 'in_progress'] } });
    const requirements = await models.Requirement.find();
    
    const report = new models.Report({
      reportId,
      type: reportType,
      title: `${reportType} - ${new Date(assessmentDate).toLocaleDateString()}`,
      assessmentDate,
      status: 'draft',
      scans: scans.map(s => s.scanId),
      findings: {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length
      },
      format: format || 'pdf'
    });
    
    await report.save();
    
    // Generate report file (async)
    axios.post(`${ML_ENGINE_URL}/generate-report`, { reportId, reportType })
      .catch(err => console.error('Report generation error:', err));
    
    res.json({ success: true, reportId, status: 'generating' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await models.Report.findOne({ reportId: req.params.id })
      .populate('evidence');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Evidence =====
exports.getEvidence = async (req, res) => {
  try {
    const { requirement, type } = req.query;
    const filter = {};
    if (requirement) filter.requirement = requirement;
    if (type) filter.type = type;
    
    const evidence = await models.Evidence.find(filter).sort({ createdAt: -1 });
    res.json({ evidence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadEvidence = async (req, res) => {
  try {
    const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const evidence = new models.Evidence({
      evidenceId,
      ...req.body,
      uploadedBy: req.body.userId || 'system'
    });
    
    await evidence.save();
    
    res.json({ success: true, evidenceId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Analytics & Dashboard =====
exports.getDashboard = async (req, res) => {
  try {
    const overallCompliance = await calculateOverallCompliance();
    const findings = await models.Finding.find({ status: 'open' });
    const scans = await models.Scan.find().sort({ createdAt: -1 }).limit(5);
    const requirements = await models.Requirement.find();
    
    const findingsBySeverity = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      info: findings.filter(f => f.severity === 'info').length
    };
    
    const requirementCompliance = requirements.map(req => ({
      requirement: req.requirementId,
      score: req.overallCompliance,
      status: req.status
    }));
    
    res.json({
      overallCompliance,
      findingsBySeverity,
      totalFindings: findings.length,
      requirementCompliance,
      recentScans: scans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Configuration =====
exports.getConfig = async (req, res) => {
  res.json({ 
    autoScan: true, 
    alertThreshold: 0.8, 
    category: 'PCI-DSS',
    version: '4.0',
    scanFrequency: 'quarterly'
  });
};

exports.updateConfig = async (req, res) => {
  try {
    await logAudit('config_updated', 'configuration', req.body, req);
    res.json({ success: true, config: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Utilities =====
async function calculateOverallCompliance() {
  const requirements = await models.Requirement.find();
  if (requirements.length === 0) return 0;
  
  const totalScore = requirements.reduce((sum, req) => sum + req.overallCompliance, 0);
  return Math.round(totalScore / requirements.length);
}

async function logAudit(action, category, resource, req) {
  try {
    const log = new models.AuditLog({
      logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      category,
      user: {
        userId: req.body?.userId || 'system',
        username: req.body?.username || 'system'
      },
      ipAddress: req.ip,
      details: resource
    });
    await log.save();
  } catch (error) {
    console.error('Audit log error:', error);
  }
}


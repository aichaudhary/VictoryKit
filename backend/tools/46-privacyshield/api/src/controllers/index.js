const axios = require('axios');
const {
  PIIRecord,
  PrivacyPolicy,
  CookieConsent,
  DataMapping,
  PrivacyAssessment,
  PrivacyRights,
  ThirdPartyTracker,
  ComplianceReport
} = require('../models');

/**
 * PrivacyShield API Controllers
 * Handles all privacy protection operations
 */

// ===== System Status =====
exports.getStatus = async (req, res) => {
  try {
    const status = {
      service: 'PrivacyShield',
      status: 'operational',
      timestamp: new Date(),
      version: '1.0.0',
      database: 'connected',
      frameworks: ['GDPR', 'CCPA', 'PIPEDA', 'LGPD'],
      features: [
        'PII Detection & Classification',
        'Consent Management',
        'Privacy Policy Generation',
        'Data Mapping & ROPA',
        'Privacy Impact Assessments',
        'Data Subject Rights / DSAR',
        'Third-Party Tracker Inventory',
        'Compliance Reporting'
      ]
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== PII Detection & Classification =====
exports.scanForPII = async (req, res) => {
  try {
    const { source, data, sourceType = 'api' } = req.body;
    
    // Call ML engine for PII detection
    const mlResponse = await axios.post('http://localhost:8046/analyze', {
      action: 'detect_pii',
      data,
      source
    });
    
    const detectedPII = mlResponse.data.results || [];
    
    // Save PII records
    const savedRecords = [];
    for (const pii of detectedPII) {
      const record = new PIIRecord({
        recordId: `PII-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourceType,
        sourceLocation: source,
        piiCategory: pii.category,
        piiType: pii.type,
        detectedValue: {
          original: pii.value,
          masked: PIIRecord.schema.methods.maskValue(pii.value, pii.type)
        },
        confidence: {
          score: pii.confidence,
          method: pii.method || 'ml_classifier'
        },
        detectionTimestamp: new Date()
      });
      
      await record.save();
      savedRecords.push(record);
    }
    
    res.json({
      success: true,
      scanned: source,
      piiFound: savedRecords.length,
      records: savedRecords
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPIIRecords = async (req, res) => {
  try {
    const { category, sensitivity, status, riskLevel } = req.query;
    
    const query = {};
    if (category) query.piiCategory = category;
    if (sensitivity) query['sensitivity.level'] = sensitivity;
    if (status) query['remediation.status'] = status;
    if (riskLevel) query['risk.riskLevel'] = riskLevel;
    
    const records = await PIIRecord.find(query)
      .sort({ detectionTimestamp: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remediatePII = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { action, notes, user } = req.body;
    
    const record = await PIIRecord.findOne({ recordId });
    if (!record) {
      return res.status(404).json({ error: 'PII record not found' });
    }
    
    await record.addRemediationAction(action, notes, user);
    
    if (action === 'encrypt' || action === 'delete' || action === 'anonymize') {
      await record.markRemediated(notes, user);
    }
    
    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPIIStats = async (req, res) => {
  try {
    const stats = await PIIRecord.getStatistics();
    const highRisk = await PIIRecord.findHighRisk();
    const unremediated = await PIIRecord.findUnremediated();
    
    res.json({
      success: true,
      stats,
      highRiskCount: highRisk.length,
      unremediatedCount: unremediated.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Privacy Policy Management =====
exports.createPolicy = async (req, res) => {
  try {
    const policyData = req.body;
    
    const policy = new PrivacyPolicy({
      policyId: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...policyData,
      version: { major: 1, minor: 0, patch: 0 }
    });
    
    await policy.save();
    
    res.json({
      success: true,
      policy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const { status, framework, organization } = req.query;
    
    const query = {};
    if (status) query['version.status'] = status;
    if (framework) query['frameworks.framework'] = framework;
    if (organization) query['metadata.organization'] = organization;
    
    const policies = await PrivacyPolicy.find(query)
      .sort({ 'metadata.effectiveDate': -1 });
    
    res.json({
      success: true,
      count: policies.length,
      policies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { url, user } = req.body;
    
    const policy = await PrivacyPolicy.findOne({ policyId });
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    
    await policy.publish(url, user);
    
    res.json({
      success: true,
      policy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActivePolicy = async (req, res) => {
  try {
    const { framework } = req.query;
    const policy = await PrivacyPolicy.getActivePolicy(framework);
    
    if (!policy) {
      return res.status(404).json({ error: 'No active policy found' });
    }
    
    res.json({
      success: true,
      policy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Consent Management =====
exports.recordConsent = async (req, res) => {
  try {
    const consentData = req.body;
    
    const consent = new CookieConsent({
      consentId: `CONSENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...consentData
    });
    
    await consent.validateGDPRCompliance();
    await consent.save();
    
    res.json({
      success: true,
      consent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConsents = async (req, res) => {
  try {
    const { userId, email, status } = req.query;
    
    const query = {};
    if (userId) query['user.userId'] = userId;
    if (email) query['user.email'] = email;
    if (status) query['validity.isValid'] = status === 'valid';
    
    const consents = await CookieConsent.find(query)
      .sort({ 'consentGiven.grantedAt': -1 });
    
    res.json({
      success: true,
      count: consents.length,
      consents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.withdrawConsent = async (req, res) => {
  try {
    const { consentId } = req.params;
    const { method, reason, user, category } = req.body;
    
    const consent = await CookieConsent.findOne({ consentId });
    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }
    
    if (category) {
      await consent.withdrawCategory(category);
    } else {
      await consent.withdrawConsent(method, reason, user);
    }
    
    res.json({
      success: true,
      consent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConsentStats = async (req, res) => {
  try {
    const stats = await CookieConsent.getConsentStats();
    const expiringSoon = await CookieConsent.findExpiringConsents(30);
    
    res.json({
      success: true,
      stats,
      expiringSoonCount: expiringSoon.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Data Mapping & ROPA =====
exports.createMapping = async (req, res) => {
  try {
    const mappingData = req.body;
    
    const mapping = new DataMapping({
      mappingId: `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...mappingData
    });
    
    await mapping.calculateRisk();
    await mapping.save();
    
    res.json({
      success: true,
      mapping
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMappings = async (req, res) => {
  try {
    const { systemName, status, framework, riskLevel } = req.query;
    
    const query = {};
    if (systemName) query['system.name'] = systemName;
    if (status) query.status = status;
    if (framework) query['compliance.framework'] = framework;
    if (riskLevel) query['risk.overallRisk'] = riskLevel;
    
    const mappings = await DataMapping.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: mappings.length,
      mappings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateArticle30 = async (req, res) => {
  try {
    const { mappingId } = req.params;
    
    const mapping = await DataMapping.findOne({ mappingId });
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    
    const article30Record = await mapping.generateArticle30();
    
    res.json({
      success: true,
      article30Record
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.calculateMappingRisk = async (req, res) => {
  try {
    const { mappingId } = req.params;
    
    const mapping = await DataMapping.findOne({ mappingId });
    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }
    
    await mapping.calculateRisk();
    await mapping.save();
    
    res.json({
      success: true,
      riskLevel: mapping.risk.overallRisk,
      dpiaRequired: mapping.risk.dpiaRequired,
      mapping
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Privacy Impact Assessments =====
exports.createAssessment = async (req, res) => {
  try {
    const assessmentData = req.body;
    
    const assessment = new PrivacyAssessment({
      assessmentId: `PIA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...assessmentData
    });
    
    await assessment.save();
    
    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const { status, riskLevel, framework } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (riskLevel) query['assessment.overallRiskLevel'] = riskLevel;
    if (framework) query['metadata.framework'] = framework;
    
    const assessments = await PrivacyAssessment.find(query)
      .sort({ 'metadata.assessmentDate': -1 });
    
    res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { user } = req.body;
    
    const assessment = await PrivacyAssessment.findOne({ assessmentId });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    await assessment.complete(user);
    
    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findHighRiskAssessments = async (req, res) => {
  try {
    const assessments = await PrivacyAssessment.findHighRisk();
    const requireConsultation = await PrivacyAssessment.findRequiringSupervisoryConsultation();
    
    res.json({
      success: true,
      highRisk: assessments,
      requireConsultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Data Subject Rights / DSAR =====
exports.createDSAR = async (req, res) => {
  try {
    const dsarData = req.body;
    
    const dsar = new PrivacyRights({
      requestId: `DSAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...dsarData
    });
    
    await dsar.calculateDueDate();
    await dsar.save();
    
    res.json({
      success: true,
      dsar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDSARs = async (req, res) => {
  try {
    const { requestType, status, framework } = req.query;
    
    const query = {};
    if (requestType) query['request.requestType'] = requestType;
    if (status) query.status = status;
    if (framework) query['request.framework'] = framework;
    
    const dsars = await PrivacyRights.find(query)
      .sort({ 'request.receivedDate': -1 });
    
    res.json({
      success: true,
      count: dsars.length,
      dsars
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeDSAR = async (req, res) => {
  try {
    const { requestId } = req.params;
    const responseDetails = req.body;
    
    const dsar = await PrivacyRights.findOne({ requestId });
    if (!dsar) {
      return res.status(404).json({ error: 'DSAR not found' });
    }
    
    await dsar.complete(responseDetails);
    
    res.json({
      success: true,
      dsar
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.findOverdueDSARs = async (req, res) => {
  try {
    const overdue = await PrivacyRights.findOverdue();
    const dueSoon = await PrivacyRights.findDueSoon(7);
    
    res.json({
      success: true,
      overdue,
      dueSoon
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Third-Party Trackers =====
exports.scanTrackers = async (req, res) => {
  try {
    const { url } = req.body;
    
    // Call ML engine for tracker scanning
    const mlResponse = await axios.post('http://localhost:8046/analyze', {
      action: 'scan_trackers',
      url
    });
    
    const detectedTrackers = mlResponse.data.trackers || [];
    
    // Save trackers
    const savedTrackers = [];
    for (const tracker of detectedTrackers) {
      const existing = await ThirdPartyTracker.findOne({ 
        'technical.cookieName': tracker.name 
      });
      
      if (!existing) {
        const newTracker = new ThirdPartyTracker({
          trackerId: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: tracker.name,
          provider: { name: tracker.provider },
          type: tracker.type || 'cookie',
          category: tracker.category || 'analytics',
          technical: {
            cookieName: tracker.name,
            domain: tracker.domain,
            duration: tracker.duration
          },
          purpose: { primary: tracker.purpose || 'Unknown' },
          detection: {
            method: 'automated_scan',
            firstDetected: new Date(),
            lastSeen: new Date()
          }
        });
        
        await newTracker.save();
        savedTrackers.push(newTracker);
      }
    }
    
    res.json({
      success: true,
      scanned: url,
      trackersFound: savedTrackers.length,
      trackers: savedTrackers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrackers = async (req, res) => {
  try {
    const { category, status, provider, requireConsent } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (provider) query['provider.name'] = provider;
    if (requireConsent === 'true') query['consent.required'] = true;
    
    const trackers = await ThirdPartyTracker.find(query)
      .sort({ 'detection.lastSeen': -1 });
    
    res.json({
      success: true,
      count: trackers.length,
      trackers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrackersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const trackers = await ThirdPartyTracker.findByCategory(category);
    
    res.json({
      success: true,
      category,
      count: trackers.length,
      trackers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Compliance Reporting =====
exports.generateReport = async (req, res) => {
  try {
    const { frameworks, reportType = 'comprehensive' } = req.body;
    
    const reportId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Gather metrics from all collections
    const piiStats = await PIIRecord.getStatistics();
    const consentStats = await CookieConsent.getConsentStats();
    const trackerStats = await ThirdPartyTracker.getStatistics();
    const dsarStats = await PrivacyRights.getStatsByType();
    
    const report = new ComplianceReport({
      reportId,
      metadata: {
        title: `Privacy Compliance Report - ${new Date().toISOString().split('T')[0]}`,
        reportType,
        frameworks,
        reportingPeriod: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date()
        },
        generatedBy: req.body.user || 'system'
      },
      metrics: {
        piiRecords: piiStats,
        consentRecords: consentStats,
        trackers: trackerStats,
        dsarRequests: dsarStats
      }
    });
    
    await report.save();
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { framework, status } = req.query;
    
    const query = {};
    if (framework) query['metadata.frameworks'] = framework;
    if (status) query.status = status;
    
    const reports = await ComplianceReport.find(query)
      .sort({ 'metadata.generatedDate': -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComplianceScore = async (req, res) => {
  try {
    const { framework } = req.query;
    
    const latestReport = await ComplianceReport.getLatestReport(framework);
    if (!latestReport) {
      return res.status(404).json({ error: 'No reports found' });
    }
    
    const trend = await ComplianceReport.getComplianceTrend(framework, 6);
    
    res.json({
      success: true,
      currentScore: latestReport.overallScore,
      trend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Configuration =====
exports.getConfig = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../../../privacyshield-config.json');
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  res.json({ reports: [], total: 0 });
};

exports.getReportById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.getConfig = async (req, res) => {
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Privacy' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

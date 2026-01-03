/**
 * Scan Controller for DataGuardian
 * Handles DSR, Consent, Retention, and Data Discovery endpoints
 */
const privacyService = require('../services/privacyService');
const consentService = require('../services/consentService');
const retentionService = require('../services/retentionService');
const DataSubjectRequest = require('../models/DataSubjectRequest');
const ConsentRecord = require('../models/ConsentRecord');
const DataRetention = require('../models/DataRetention');
const { logger } = require('../../../../../shared');

// ==================== DSR ENDPOINTS ====================

/**
 * Create a new Data Subject Request
 */
exports.createDSR = async (req, res) => {
  try {
    const { type, dataSubject, regulation, details } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!type || !dataSubject?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and dataSubject.email'
      });
    }

    const result = await privacyService.createDSR({
      userId,
      type,
      dataSubject,
      regulation: regulation || 'gdpr',
      details
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Create DSR error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all DSRs for user
 */
exports.getDSRs = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { status, type, regulation, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;
    if (regulation) query.regulation = regulation;

    const skip = (page - 1) * limit;

    const [dsrs, total] = await Promise.all([
      DataSubjectRequest.find(query)
        .sort({ 'timeline.receivedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DataSubjectRequest.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: dsrs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get DSRs error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single DSR
 */
exports.getDSR = async (req, res) => {
  try {
    const dsr = await DataSubjectRequest.findOne({
      $or: [{ _id: req.params.id }, { requestId: req.params.id }]
    });

    if (!dsr) {
      return res.status(404).json({ success: false, error: 'DSR not found' });
    }

    res.json({ success: true, data: dsr });
  } catch (error) {
    logger.error('Get DSR error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Process a DSR
 */
exports.processDSR = async (req, res) => {
  try {
    const result = await privacyService.processDSR(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Process DSR error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get DSR dashboard
 */
exports.getDSRDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const dashboard = await privacyService.getDSRDashboard(userId);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('DSR dashboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Discover data for a data subject
 */
exports.discoverData = async (req, res) => {
  try {
    const { identifier, options } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: identifier'
      });
    }

    const result = await privacyService.discoverData(identifier, options);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Discover data error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Perform Privacy Impact Assessment
 */
exports.performPIA = async (req, res) => {
  try {
    const { name, description, activities, dataCategories, thirdParties, crossBorder, automatedDecisions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: name'
      });
    }

    const result = await privacyService.performPIA({
      name,
      description,
      activities,
      dataCategories,
      thirdParties,
      crossBorder,
      automatedDecisions
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('PIA error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== CONSENT ENDPOINTS ====================

/**
 * Record consent
 */
exports.recordConsent = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const result = await consentService.recordConsent({
      userId,
      ...req.body
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('Record consent error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Verify consent (double opt-in)
 */
exports.verifyConsent = async (req, res) => {
  try {
    const { consentId, verificationToken } = req.body;

    if (!consentId || !verificationToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: consentId and verificationToken'
      });
    }

    const result = await consentService.verifyConsent(consentId, verificationToken);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Verify consent error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Withdraw consent
 */
exports.withdrawConsent = async (req, res) => {
  try {
    const result = await consentService.withdrawConsent(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Withdraw consent error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check consent status
 */
exports.checkConsent = async (req, res) => {
  try {
    const { identifier, purposeCode } = req.query;

    if (!identifier || !purposeCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query params: identifier and purposeCode'
      });
    }

    const result = await consentService.checkConsent(identifier, purposeCode);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Check consent error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get data subject consents
 */
exports.getDataSubjectConsents = async (req, res) => {
  try {
    const result = await consentService.getDataSubjectConsents(
      req.params.identifier,
      req.query
    );
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get data subject consents error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get consent preferences (preference center)
 */
exports.getConsentPreferences = async (req, res) => {
  try {
    const result = await consentService.getConsentPreferences(req.params.identifier);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get consent preferences error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update preferences (bulk consent update)
 */
exports.updatePreferences = async (req, res) => {
  try {
    const result = await consentService.updatePreferences(
      req.params.identifier,
      req.body.preferences
    );
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Update preferences error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get consent dashboard
 */
exports.getConsentDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const dashboard = await consentService.getConsentDashboard(userId);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('Consent dashboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== RETENTION ENDPOINTS ====================

/**
 * Create retention policy
 */
exports.createRetentionPolicy = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const result = await retentionService.createPolicy({
      userId,
      ...req.body
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error('Create retention policy error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all retention policies
 */
exports.getRetentionPolicies = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { status, type, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [policies, total] = await Promise.all([
      DataRetention.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DataRetention.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: policies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get retention policies error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single retention policy
 */
exports.getRetentionPolicy = async (req, res) => {
  try {
    const policy = await DataRetention.findOne({
      $or: [{ _id: req.params.id }, { policyId: req.params.id }]
    });

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({ success: true, data: policy });
  } catch (error) {
    logger.error('Get retention policy error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update retention policy
 */
exports.updateRetentionPolicy = async (req, res) => {
  try {
    const result = await retentionService.updatePolicy(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Update retention policy error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete retention policy
 */
exports.deleteRetentionPolicy = async (req, res) => {
  try {
    const policy = await DataRetention.findOneAndDelete({
      $or: [{ _id: req.params.id }, { policyId: req.params.id }]
    });

    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    logger.error('Delete retention policy error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Execute retention policy
 */
exports.executeRetentionPolicy = async (req, res) => {
  try {
    const result = await retentionService.executePolicy(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Execute retention policy error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Apply legal hold
 */
exports.applyLegalHold = async (req, res) => {
  try {
    const result = await retentionService.applyLegalHold(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Apply legal hold error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Release legal hold
 */
exports.releaseLegalHold = async (req, res) => {
  try {
    const result = await retentionService.releaseLegalHold(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Release legal hold error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get pending dispositions
 */
exports.getPendingDispositions = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const result = await retentionService.getPendingDispositions(userId, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Get pending dispositions error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Approve disposition
 */
exports.approveDisposition = async (req, res) => {
  try {
    const result = await retentionService.approveDisposition(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Approve disposition error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get retention dashboard
 */
exports.getRetentionDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const dashboard = await retentionService.getRetentionDashboard(userId);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    logger.error('Retention dashboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==================== UNIFIED DASHBOARD ====================

/**
 * Get unified DataGuardian dashboard
 */
exports.getUnifiedDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const [dsrDashboard, consentDashboard, retentionDashboard] = await Promise.all([
      privacyService.getDSRDashboard(userId),
      consentService.getConsentDashboard(userId),
      retentionService.getRetentionDashboard(userId)
    ]);

    res.json({
      success: true,
      data: {
        dsr: dsrDashboard,
        consent: consentDashboard,
        retention: retentionDashboard,
        summary: {
          totalDSRs: dsrDashboard.summary.total,
          pendingDSRs: dsrDashboard.summary.pending,
          overdueDSRs: dsrDashboard.summary.overdue,
          totalConsents: consentDashboard.summary.total,
          activeConsents: consentDashboard.summary.granted,
          optInRate: consentDashboard.optInRate,
          retentionPolicies: retentionDashboard.summary.totalPolicies,
          activePolicies: retentionDashboard.summary.activePolicies,
          legalHolds: retentionDashboard.summary.withLegalHold,
          complianceScore: calculateComplianceScore(dsrDashboard, consentDashboard, retentionDashboard)
        }
      }
    });
  } catch (error) {
    logger.error('Unified dashboard error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Calculate overall compliance score
 */
function calculateComplianceScore(dsr, consent, retention) {
  let score = 100;

  // Deduct for overdue DSRs
  if (dsr.summary.overdue > 0) {
    score -= Math.min(dsr.summary.overdue * 10, 30);
  }

  // Deduct for low DSR compliance rate
  if (dsr.complianceRate < 90) {
    score -= (90 - dsr.complianceRate) / 2;
  }

  // Deduct for low opt-in rate (indicates potential consent issues)
  if (consent.optInRate < 70) {
    score -= (70 - consent.optInRate) / 4;
  }

  // Deduct for inactive retention policies
  if (retention.summary.totalPolicies > 0) {
    const activeRatio = retention.summary.activePolicies / retention.summary.totalPolicies;
    if (activeRatio < 0.8) {
      score -= (1 - activeRatio) * 20;
    }
  }

  return Math.max(0, Math.round(score));
}

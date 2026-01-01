const axios = require('axios');
const zeroTrustService = require('../services/zeroTrustService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8032';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'ZeroTrustAI', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await zeroTrustService.analyze(data);

    // Trigger external security integrations
    zeroTrustService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'zero_trust_evaluation',
      accessViolations: result.accessViolations || [],
      trustScore: result.trustScore || {},
      recommendations: result.recommendations || [],
      totalAccessEvents: result.totalAccessEvents || 0,
      riskFactors: result.riskFactors || 0,
      severity: result.trustScore?.score < 50 ? 'critical' : result.trustScore?.score < 70 ? 'high' : 'medium',
      userId: req.user?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the analysis if integration fails
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const result = await zeroTrustService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    zeroTrustService.integrateWithSecurityStack(scanId, {
      analysisType: 'zero_trust_compliance_scan',
      target,
      scanId,
      trustScore: result.trustScore || {},
      violations: result.violations || 0,
      severity: result.trustScore?.score < 50 ? 'critical' : result.trustScore?.score < 70 ? 'high' : 'medium',
      userId: req.user?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the scan if integration fails
    });

    res.json({ success: true, scanId, result });
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Zero Trust' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

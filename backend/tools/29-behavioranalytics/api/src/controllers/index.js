const axios = require('axios');
const riskScoreService = require('../services/riskScoreService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8029';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'BehaviorAnalytics', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await riskScoreService.analyze(data);

    // Trigger external security integrations
    riskScoreService.integrateWithSecurityStack(Date.now().toString(), {
      assessmentType: 'risk_factor_analysis',
      riskFactors: result.riskFactors || [],
      recommendations: result.recommendations || [],
      overallScore: result.overallScore || 0,
      riskLevel: result.riskLevel || 'medium',
      severity: result.riskLevel === 'critical' ? 'critical' : result.riskLevel === 'high' ? 'high' : 'medium',
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
    const result = await riskScoreService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    riskScoreService.integrateWithSecurityStack(scanId, {
      assessmentType: 'comprehensive_risk_scan',
      target,
      scanId,
      overallScore: result.riskScore || 0,
      riskLevel: result.riskScore > 80 ? 'critical' : result.riskScore > 60 ? 'high' : 'medium',
      severity: result.riskScore > 80 ? 'critical' : result.riskScore > 60 ? 'high' : 'medium',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Risk' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

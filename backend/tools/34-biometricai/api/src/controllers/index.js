const axios = require('axios');
const biometricService = require('../services/biometricService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8034';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'BiometricAI', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await biometricService.analyze(data);

    // Trigger external security integrations
    biometricService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'biometric_security_analysis',
      securityAlerts: result.securityAlerts || [],
      authenticity: result.authenticity || {},
      recommendations: result.recommendations || [],
      totalAttempts: result.totalAttempts || 0,
      alertCount: result.alertCount || 0,
      severity: result.criticalAlerts > 0 ? 'critical' : result.alertCount > 3 ? 'high' : 'medium',
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
    const result = await biometricService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    biometricService.integrateWithSecurityStack(scanId, {
      analysisType: 'biometric_authenticity_scan',
      target,
      scanId,
      authenticity: result.authenticity || {},
      alerts: result.alerts || 0,
      severity: result.authenticity?.score < 50 ? 'critical' : result.authenticity?.score < 70 ? 'high' : 'medium',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Biometric' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

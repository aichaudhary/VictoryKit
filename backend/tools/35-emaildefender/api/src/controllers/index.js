const axios = require('axios');
const emailGuardService = require('../services/emailGuardService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8035';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'EmailDefender', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await emailGuardService.analyze(data);

    // Trigger external security integrations
    emailGuardService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'email_security_analysis',
      threats: result.threats || [],
      compliance: result.compliance || {},
      recommendations: result.recommendations || [],
      totalEmails: result.totalEmails || 0,
      threatCount: result.threatCount || 0,
      severity: result.criticalThreats > 0 ? 'critical' : result.threatCount > 5 ? 'high' : 'medium',
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
    const result = await emailGuardService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    emailGuardService.integrateWithSecurityStack(scanId, {
      analysisType: 'email_threat_scan',
      target,
      scanId,
      compliance: result.compliance || {},
      threats: result.threats || 0,
      severity: result.compliance?.score < 50 ? 'critical' : result.compliance?.score < 70 ? 'high' : 'medium',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Email' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

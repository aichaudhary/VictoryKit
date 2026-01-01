const axios = require('axios');
const passwordVaultService = require('../services/passwordVaultService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8033';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'PasswordVault', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await passwordVaultService.analyze(data);

    // Trigger external security integrations
    passwordVaultService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'password_security_analysis',
      securityIssues: result.securityIssues || [],
      compliance: result.compliance || {},
      recommendations: result.recommendations || [],
      totalPasswords: result.totalPasswords || 0,
      issuesCount: result.issuesCount || 0,
      severity: result.criticalIssues > 0 ? 'critical' : result.issuesCount > 3 ? 'high' : 'medium',
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
    const result = await passwordVaultService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    passwordVaultService.integrateWithSecurityStack(scanId, {
      analysisType: 'password_vault_compliance_scan',
      target,
      scanId,
      compliance: result.compliance || {},
      issues: result.issues || 0,
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Password' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

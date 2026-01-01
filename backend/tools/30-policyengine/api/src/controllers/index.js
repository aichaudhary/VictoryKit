const axios = require('axios');
const policyService = require('../services/policyService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8030';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'PolicyEngine', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await policyService.analyze(data);

    // Trigger external security integrations
    policyService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'policy_analysis',
      violations: result.violations || [],
      recommendations: result.recommendations || [],
      compliance: result.compliance || {},
      totalPolicies: result.totalPolicies || 0,
      severity: result.compliance?.score < 50 ? 'critical' : result.compliance?.score < 70 ? 'high' : 'medium',
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
    const result = await policyService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    policyService.integrateWithSecurityStack(scanId, {
      analysisType: 'policy_compliance_scan',
      target,
      scanId,
      compliance: result.compliance || {},
      violations: result.violations || 0,
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Policy' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

const axios = require('axios');
const blueTeamService = require('../services/blueTeamService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8026';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'BlueTeamAI', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await blueTeamService.analyze(data);

    // Trigger external security integrations
    blueTeamService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'threat_analysis',
      threats: result.threats || [],
      anomalies: result.anomalies || [],
      riskScore: result.riskScore || 0,
      severity: result.riskScore > 70 ? 'high' : result.riskScore > 40 ? 'medium' : 'low',
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
    const result = await blueTeamService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    blueTeamService.integrateWithSecurityStack(scanId, {
      analysisType: 'vulnerability_scan',
      target,
      scanId,
      vulnerabilities: result.vulnerabilities || [],
      severity: result.summary?.critical > 0 ? 'critical' : result.summary?.high > 0 ? 'high' : 'medium',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Defense' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

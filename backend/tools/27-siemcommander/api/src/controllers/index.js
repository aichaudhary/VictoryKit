const axios = require('axios');
const siemService = require('../services/siemService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8027';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'SIEMCommander', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await siemService.analyze(data);

    // Trigger external security integrations
    siemService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'event_analysis',
      alerts: result.alerts || [],
      correlations: result.correlations || [],
      totalEvents: result.totalEvents || 0,
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
    const result = await siemService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    siemService.integrateWithSecurityStack(scanId, {
      analysisType: 'log_scan',
      target,
      scanId,
      events: result.events || [],
      severity: result.summary?.alerts > 0 ? 'high' : 'medium',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'SIEM' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

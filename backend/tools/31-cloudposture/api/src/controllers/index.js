const axios = require('axios');
const auditTrackerService = require('../services/auditTrackerService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8031';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'CloudPosture', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await auditTrackerService.analyze(data);

    // Trigger external security integrations
    auditTrackerService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'audit_log_analysis',
      anomalies: result.anomalies || [],
      alerts: result.alerts || [],
      compliance: result.compliance || {},
      totalLogs: result.totalLogs || 0,
      suspiciousActivities: result.suspiciousActivities || 0,
      severity: result.criticalAlerts > 0 ? 'critical' : result.suspiciousActivities > 5 ? 'high' : 'medium',
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
    const result = await auditTrackerService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    auditTrackerService.integrateWithSecurityStack(scanId, {
      analysisType: 'audit_trail_scan',
      target,
      scanId,
      anomalies: result.anomalies || 0,
      compliance: result.compliance || {},
      severity: result.anomalies > 3 ? 'high' : result.anomalies > 0 ? 'medium' : 'low',
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Audit' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

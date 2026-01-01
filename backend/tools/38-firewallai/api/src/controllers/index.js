const axios = require('axios');
const firewallService = require('../services/firewallService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8038';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'FirewallAI', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await firewallService.analyze(data);

    // Trigger security stack integrations asynchronously
    firewallService.integrateWithSecurityStack(`analyze_${Date.now()}`, {
      ...result,
      sourceIP: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(err => console.error('Integration failed:', err));

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const result = await firewallService.scan(target);

    // Trigger security stack integrations asynchronously
    firewallService.integrateWithSecurityStack(`scan_${Date.now()}`, {
      ...result,
      target,
      sourceIP: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(err => console.error('Integration failed:', err));

    res.json({ success: true, scanId: Date.now(), result });
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Firewall' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

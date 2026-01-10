const axios = require('axios');
const vpnGuardianService = require('../services/vpnGuardianService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8039';

exports.getStatus = async (req, res) => {
  try {
    const status = await vpnGuardianService.getConnections();
    const activeConnections = status.filter(conn => conn.status === 'connected').length;
    const totalUsers = await vpnGuardianService.getUsers ? (await vpnGuardianService.getUsers()).length : 0;

    res.json({
      status: 'operational',
      service: 'VPNGuardian',
      timestamp: new Date(),
      metrics: {
        activeConnections,
        totalUsers,
        totalConnections: status.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await vpnGuardianService.analyze(data);

    // Trigger security stack integrations asynchronously
    vpnGuardianService.integrateWithSecurityStack(`analyze_${Date.now()}`, {
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
    const result = await vpnGuardianService.scan(target);

    // Trigger security stack integrations asynchronously
    vpnGuardianService.integrateWithSecurityStack(`scan_${Date.now()}`, {
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

// VPN Connection Management
exports.createConnection = async (req, res) => {
  try {
    const connection = await vpnGuardianService.createConnection(req.body);
    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const filters = req.query;
    const connections = await vpnGuardianService.getConnections(filters);
    res.json({ success: true, connections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const updates = req.body;
    const connection = await vpnGuardianService.updateConnection(connectionId, updates);
    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.disconnectConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = await vpnGuardianService.disconnectConnection(connectionId);
    res.json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConnectionMetrics = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const metrics = await vpnGuardianService.getConnectionMetrics(connectionId);
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VPN Policy Management
exports.createPolicy = async (req, res) => {
  try {
    const policy = await vpnGuardianService.createPolicy(req.body);
    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPolicies = async (req, res) => {
  try {
    const filters = req.query;
    const policies = await vpnGuardianService.getPolicies(filters);
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.applyPolicyToUser = async (req, res) => {
  try {
    const { policyId, userId } = req.params;
    const result = await vpnGuardianService.applyPolicyToUser(policyId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Security Analysis
exports.analyzeConnectionSecurity = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const analysis = await vpnGuardianService.analyzeConnectionSecurity(connectionId);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSecurityAlert = async (req, res) => {
  try {
    const alert = await vpnGuardianService.createSecurityAlert(req.body);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSecurityAlerts = async (req, res) => {
  try {
    const filters = req.query;
    const alerts = await vpnGuardianService.getSecurityAlerts(filters);
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Management
exports.createUser = async (req, res) => {
  try {
    const user = await vpnGuardianService.createUser(req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.authenticateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await vpnGuardianService.authenticateUser(username, password);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // This would need to be implemented in the service
    const users = await vpnGuardianService.getUsers ? await vpnGuardianService.getUsers() : [];
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VPN Provider Integrations
exports.getProviderStatus = async (req, res) => {
  try {
    const { provider } = req.params;
    const status = await vpnGuardianService.getProviderStatus(provider);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.connectToProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const connectionData = req.body;
    const result = await vpnGuardianService.connectToProvider(provider, connectionData);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Legacy methods for backward compatibility
exports.getReports = async (req, res) => {
  try {
    const connections = await vpnGuardianService.getConnections();
    const alerts = await vpnGuardianService.getSecurityAlerts();
    res.json({
      success: true,
      reports: {
        connections: connections.length,
        activeConnections: connections.filter(c => c.status === 'connected').length,
        alerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    // This is a placeholder - in a real implementation you'd have report models
    res.json({ success: true, report: { id, type: 'connection-report', status: 'generated' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        vpnProviders: Object.keys(vpnGuardianService.vpnProviders || {}),
        securitySettings: {
          minEncryptionStrength: 'strong',
          allowedProtocols: ['wireguard', 'ikev2', 'ipsec'],
          mfaRequired: true
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    // This is a placeholder - in a real implementation you'd update configuration
    res.json({ success: true, message: 'Configuration updated' });
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
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'VPN' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

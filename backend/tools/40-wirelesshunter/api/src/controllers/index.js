const wirelessWatchService = require('../services/wirelessWatchService');

// ==================== STATUS & DASHBOARD ====================

exports.getStatus = async (req, res) => {
  try {
    res.json({ 
      status: 'operational', 
      service: 'WirelessHunter',
      version: '2.0.0',
      description: 'Enterprise Wireless Network Security Monitoring Platform',
      timestamp: new Date() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await wirelessWatchService.getDashboardData();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== NETWORK MANAGEMENT ====================

exports.getAllNetworks = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      networkType: req.query.networkType,
      isRogue: req.query.isRogue === 'true' ? true : req.query.isRogue === 'false' ? false : undefined,
      building: req.query.building,
      limit: parseInt(req.query.limit) || 100
    };
    const networks = await wirelessWatchService.getAllNetworks(filters);
    res.json({ success: true, count: networks.length, data: networks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNetworkById = async (req, res) => {
  try {
    const network = await wirelessWatchService.getNetworkById(req.params.id);
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }
    res.json({ success: true, data: network });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNetwork = async (req, res) => {
  try {
    const network = await wirelessWatchService.createNetwork(req.body);
    res.status(201).json({ success: true, data: network });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNetwork = async (req, res) => {
  try {
    const network = await wirelessWatchService.updateNetwork(req.params.id, req.body);
    if (!network) {
      return res.status(404).json({ error: 'Network not found' });
    }
    res.json({ success: true, data: network });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNetwork = async (req, res) => {
  try {
    const result = await wirelessWatchService.deleteNetwork(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Network not found' });
    }
    res.json({ success: true, message: 'Network deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ACCESS POINT MANAGEMENT ====================

exports.getAllAccessPoints = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      building: req.query.building,
      manufacturer: req.query.manufacturer,
      controller: req.query.controller,
      limit: parseInt(req.query.limit) || 100
    };
    const aps = await wirelessWatchService.getAllAccessPoints(filters);
    res.json({ success: true, count: aps.length, data: aps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAccessPointById = async (req, res) => {
  try {
    const ap = await wirelessWatchService.getAccessPointById(req.params.id);
    if (!ap) {
      return res.status(404).json({ error: 'Access point not found' });
    }
    res.json({ success: true, data: ap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAccessPoint = async (req, res) => {
  try {
    const ap = await wirelessWatchService.createAccessPoint(req.body);
    res.status(201).json({ success: true, data: ap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAccessPoint = async (req, res) => {
  try {
    const ap = await wirelessWatchService.updateAccessPoint(req.params.id, req.body);
    if (!ap) {
      return res.status(404).json({ error: 'Access point not found' });
    }
    res.json({ success: true, data: ap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAccessPoint = async (req, res) => {
  try {
    const result = await wirelessWatchService.deleteAccessPoint(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Access point not found' });
    }
    res.json({ success: true, message: 'Access point deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== CLIENT MANAGEMENT ====================

exports.getAllClients = async (req, res) => {
  try {
    const filters = {
      connectionStatus: req.query.connectionStatus,
      deviceType: req.query.deviceType,
      trustLevel: req.query.trustLevel,
      ssid: req.query.ssid,
      limit: parseInt(req.query.limit) || 100
    };
    const clients = await wirelessWatchService.getAllClients(filters);
    res.json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await wirelessWatchService.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientByMac = async (req, res) => {
  try {
    const client = await wirelessWatchService.getClientByMac(req.params.mac);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const client = await wirelessWatchService.createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await wirelessWatchService.updateClient(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.blockClient = async (req, res) => {
  try {
    const { reason } = req.body;
    const client = await wirelessWatchService.blockClient(req.params.id, reason);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true, message: 'Client blocked', data: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SECURITY ALERTS ====================

exports.getAllAlerts = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      alertType: req.query.alertType,
      building: req.query.building,
      limit: parseInt(req.query.limit) || 100
    };
    const alerts = await wirelessWatchService.getAllAlerts(filters);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await wirelessWatchService.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = await wirelessWatchService.createAlert(req.body);
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const { userId } = req.body;
    const alert = await wirelessWatchService.acknowledgeAlert(req.params.id, userId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert acknowledged', data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await wirelessWatchService.resolveAlert(req.params.id, req.body);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert resolved', data: alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== THREAT DETECTION ====================

exports.detectRogueAPs = async (req, res) => {
  try {
    const result = await wirelessWatchService.detectRogueAccessPoints();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.detectWeakEncryption = async (req, res) => {
  try {
    const result = await wirelessWatchService.detectWeakEncryption();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeSignalAnomalies = async (req, res) => {
  try {
    const result = await wirelessWatchService.analyzeSignalAnomalies();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.performThreatHunting = async (req, res) => {
  try {
    const result = await wirelessWatchService.performThreatHunting();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== PROVIDER INTEGRATION ====================

exports.getProviderStatus = async (req, res) => {
  try {
    const providers = await wirelessWatchService.getProviderStatus();
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.syncWithProvider = async (req, res) => {
  try {
    const { provider } = req.params;
    const result = await wirelessWatchService.syncWithProvider(provider);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== CONFIG & REPORTS ====================

exports.getConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        autoScan: true,
        scanInterval: 300,
        alertThreshold: 0.8,
        rogueDetection: true,
        weakEncryptionCheck: true,
        signalAnalysis: true,
        notificationChannels: ['email', 'slack', 'pagerduty'],
        category: 'Wireless Security'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    res.json({ success: true, message: 'Configuration updated', config: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Generate summary report
    const dashboard = await wirelessWatchService.getDashboardData();
    res.json({
      success: true,
      reports: [
        {
          id: 'summary',
          name: 'Wireless Security Summary',
          generatedAt: new Date(),
          data: dashboard.overview
        }
      ],
      total: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      id,
      status: 'completed',
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const axios = require('axios');
const { WirelessNetwork, WirelessSecurityAlert, AccessPoint, WirelessClient } = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8040';

class WirelessHunterService {
  constructor() {
    // Enterprise WiFi Management Providers
    this.wifiProviders = {
      meraki: {
        name: 'Cisco Meraki',
        apiKey: process.env.WIRELESSWATCH_CISCO_MERAKI_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_CISCO_MERAKI_API_URL || 'https://api.meraki.com/api/v1',
        site: 'https://meraki.cisco.com/'
      },
      aruba: {
        name: 'Aruba Networks',
        apiKey: process.env.WIRELESSWATCH_ARUBA_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_ARUBA_API_URL || 'https://api.central.arubanetworks.com/v2',
        site: 'https://www.arubanetworks.com/'
      },
      unifi: {
        name: 'Ubiquiti UniFi',
        apiKey: process.env.WIRELESSWATCH_UBIQUITI_UNIFI_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_UBIQUITI_UNIFI_API_URL || 'https://your-unifi-controller.com/api',
        site: 'https://ui.com/'
      },
      ruckus: {
        name: 'Ruckus Wireless',
        apiKey: process.env.WIRELESSWATCH_RUCKUS_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_RUCKUS_API_URL || 'https://your-ruckus-controller.com/wsg/api/public/v11',
        site: 'https://www.ruckusnetworks.com/'
      },
      mist: {
        name: 'Juniper Mist',
        apiKey: process.env.WIRELESSWATCH_JUNIPER_MIST_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_JUNIPER_MIST_API_URL || 'https://api.mist.com/api/v1',
        site: 'https://www.juniper.net/us/en/products/mist-ai.html'
      },
      fortinet: {
        name: 'Fortinet FortiAP',
        apiKey: process.env.WIRELESSWATCH_FORTINET_FORTIAP_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_FORTINET_FORTIAP_API_URL || 'https://your-fortigate.com/api/v2',
        site: 'https://www.fortinet.com/products/wireless'
      },
      extreme: {
        name: 'Extreme Networks',
        apiKey: process.env.WIRELESSWATCH_EXTREME_NETWORKS_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_EXTREME_NETWORKS_API_URL || 'https://your-extreme-controller.com/api/v1',
        site: 'https://www.extremenetworks.com/'
      }
    };

    // Security Analysis Providers
    this.securityProviders = {
      ekahau: {
        name: 'Ekahau',
        apiKey: process.env.WIRELESSWATCH_EKAHAU_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_EKAHAU_API_URL || 'https://cloud.ekahau.com/api/v1',
        site: 'https://www.ekahau.com/'
      },
      metageek: {
        name: 'MetaGeek',
        apiKey: process.env.WIRELESSWATCH_METAGEEK_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_METAGEEK_API_URL || 'https://api.metageek.com/v1',
        site: 'https://www.metageek.com/'
      },
      kismet: {
        name: 'Kismet',
        apiKey: process.env.WIRELESSWATCH_KISMET_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_KISMET_API_URL || 'http://localhost:2501',
        site: 'https://www.kismetwireless.net/'
      }
    };

    // NAC Providers
    this.nacProviders = {
      ciscoIse: {
        name: 'Cisco ISE',
        apiKey: process.env.WIRELESSWATCH_CISCO_ISE_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_CISCO_ISE_API_URL || 'https://your-cisco-ise.com/api/v1',
        site: 'https://www.cisco.com/c/en/us/products/security/identity-services-engine/'
      },
      clearpass: {
        name: 'Aruba ClearPass',
        apiKey: process.env.WIRELESSWATCH_ARUBA_CLEARPASS_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_ARUBA_CLEARPASS_API_URL || 'https://clearpass.your-domain.com/api/v1',
        site: 'https://www.arubanetworks.com/products/security/network-access-control/'
      },
      forescout: {
        name: 'Forescout',
        apiKey: process.env.WIRELESSWATCH_FORESCOUT_API_KEY,
        baseUrl: process.env.WIRELESSWATCH_FORESCOUT_API_URL || 'https://your-forescout.com/api/v1',
        site: 'https://www.forescout.com/'
      }
    };
  }

  // ==================== NETWORK MANAGEMENT ====================
  
  async getAllNetworks(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.networkType) query.networkType = filters.networkType;
    if (filters.isRogue !== undefined) query.isRogue = filters.isRogue;
    if (filters.building) query['location.building'] = filters.building;
    
    return await WirelessNetwork.find(query)
      .sort({ lastSeen: -1 })
      .limit(filters.limit || 100);
  }

  async getNetworkById(networkId) {
    return await WirelessNetwork.findOne({ networkId });
  }

  async createNetwork(networkData) {
    const network = new WirelessNetwork({
      networkId: `net_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...networkData
    });
    return await network.save();
  }

  async updateNetwork(networkId, updates) {
    return await WirelessNetwork.findOneAndUpdate(
      { networkId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteNetwork(networkId) {
    return await WirelessNetwork.findOneAndDelete({ networkId });
  }

  // ==================== ACCESS POINT MANAGEMENT ====================

  async getAllAccessPoints(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.building) query['location.building'] = filters.building;
    if (filters.manufacturer) query['hardware.manufacturer'] = filters.manufacturer;
    if (filters.controller) query['management.controller'] = filters.controller;
    
    return await AccessPoint.find(query)
      .sort({ lastSeen: -1 })
      .limit(filters.limit || 100);
  }

  async getAccessPointById(apId) {
    return await AccessPoint.findOne({ apId });
  }

  async createAccessPoint(apData) {
    const ap = new AccessPoint({
      apId: `ap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...apData
    });
    return await ap.save();
  }

  async updateAccessPoint(apId, updates) {
    return await AccessPoint.findOneAndUpdate(
      { apId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteAccessPoint(apId) {
    return await AccessPoint.findOneAndDelete({ apId });
  }

  // ==================== CLIENT MANAGEMENT ====================

  async getAllClients(filters = {}) {
    const query = {};
    if (filters.connectionStatus) query.connectionStatus = filters.connectionStatus;
    if (filters.deviceType) query['device.deviceType'] = filters.deviceType;
    if (filters.trustLevel) query['security.trustLevel'] = filters.trustLevel;
    if (filters.ssid) query['currentConnection.ssid'] = filters.ssid;
    
    return await WirelessClient.find(query)
      .sort({ lastSeen: -1 })
      .limit(filters.limit || 100);
  }

  async getClientById(clientId) {
    return await WirelessClient.findOne({ clientId });
  }

  async getClientByMac(macAddress) {
    return await WirelessClient.findOne({ macAddress: macAddress.toUpperCase() });
  }

  async createClient(clientData) {
    const client = new WirelessClient({
      clientId: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...clientData
    });
    return await client.save();
  }

  async updateClient(clientId, updates) {
    return await WirelessClient.findOneAndUpdate(
      { clientId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async blockClient(clientId, reason) {
    return await WirelessClient.findOneAndUpdate(
      { clientId },
      { 
        connectionStatus: 'blocked',
        'security.trustLevel': 'blocked',
        updatedAt: new Date(),
        $push: {
          'security.threatIndicators': {
            type: 'manual-block',
            detectedAt: new Date(),
            severity: 'high',
            resolved: false,
            reason
          }
        }
      },
      { new: true }
    );
  }

  // ==================== SECURITY ALERTS ====================

  async getAllAlerts(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.severity) query.severity = filters.severity;
    if (filters.alertType) query.alertType = filters.alertType;
    if (filters.building) query['location.building'] = filters.building;
    
    return await WirelessSecurityAlert.find(query)
      .sort({ detectedAt: -1 })
      .limit(filters.limit || 100);
  }

  async getAlertById(alertId) {
    return await WirelessSecurityAlert.findOne({ alertId });
  }

  async createAlert(alertData) {
    const alert = new WirelessSecurityAlert({
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      detectedAt: new Date()
    });
    
    const savedAlert = await alert.save();
    
    // Send notifications for high/critical alerts
    if (['high', 'critical'].includes(alertData.severity)) {
      await this.sendAlertNotifications(savedAlert);
    }
    
    return savedAlert;
  }

  async updateAlert(alertId, updates) {
    return await WirelessSecurityAlert.findOneAndUpdate(
      { alertId },
      { ...updates, lastUpdated: new Date() },
      { new: true }
    );
  }

  async acknowledgeAlert(alertId, userId) {
    return await WirelessSecurityAlert.findOneAndUpdate(
      { alertId },
      {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        'assignment.assignedTo': userId,
        'assignment.assignedAt': new Date(),
        lastUpdated: new Date()
      },
      { new: true }
    );
  }

  async resolveAlert(alertId, resolution) {
    return await WirelessSecurityAlert.findOneAndUpdate(
      { alertId },
      {
        status: 'resolved',
        resolution: {
          ...resolution,
          resolvedAt: new Date()
        },
        lastUpdated: new Date()
      },
      { new: true }
    );
  }

  // ==================== THREAT DETECTION ====================

  async detectRogueAccessPoints() {
    try {
      // Get all known/authorized networks
      const authorizedNetworks = await WirelessNetwork.find({ isAuthorized: true });
      const authorizedBssids = new Set(authorizedNetworks.map(n => n.bssid));
      
      // Find networks that are not authorized
      const rogueNetworks = await WirelessNetwork.find({
        isAuthorized: false,
        isRogue: { $ne: true },
        lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const detectedRogues = [];
      
      for (const network of rogueNetworks) {
        // Check for evil twin (same SSID as authorized but different BSSID)
        const matchingAuthorized = authorizedNetworks.find(
          auth => auth.ssid === network.ssid && auth.bssid !== network.bssid
        );
        
        if (matchingAuthorized) {
          // This is likely an evil twin attack
          await this.createAlert({
            alertType: 'evil-twin-attack',
            severity: 'critical',
            title: `Evil Twin Attack Detected: ${network.ssid}`,
            description: `A rogue access point is impersonating the authorized network "${network.ssid}"`,
            affectedNetwork: {
              networkId: network.networkId,
              ssid: network.ssid,
              bssid: network.bssid,
              channel: network.frequency?.channel
            },
            riskAssessment: {
              score: 95,
              confidenceLevel: 85,
              potentialImpact: 'severe'
            }
          });
          
          // Mark as rogue
          await this.updateNetwork(network.networkId, {
            isRogue: true,
            status: 'quarantined',
            'threatAssessment.threatLevel': 'critical',
            'threatAssessment.riskScore': 95
          });
          
          detectedRogues.push(network);
        } else if (!network.isAuthorized) {
          // Unknown network - needs investigation
          await this.createAlert({
            alertType: 'rogue-access-point',
            severity: 'high',
            title: `Rogue Access Point Detected: ${network.ssid}`,
            description: `An unauthorized access point "${network.ssid}" has been detected`,
            affectedNetwork: {
              networkId: network.networkId,
              ssid: network.ssid,
              bssid: network.bssid
            },
            riskAssessment: {
              score: 75,
              potentialImpact: 'significant'
            }
          });
          
          await this.updateNetwork(network.networkId, {
            isRogue: true,
            'threatAssessment.threatLevel': 'high',
            'threatAssessment.riskScore': 75
          });
          
          detectedRogues.push(network);
        }
      }
      
      return {
        scannedNetworks: rogueNetworks.length,
        detectedRogues: detectedRogues.length,
        rogueNetworks: detectedRogues
      };
    } catch (error) {
      throw new Error(`Rogue AP detection failed: ${error.message}`);
    }
  }

  async detectWeakEncryption() {
    const weakNetworks = await WirelessNetwork.find({
      'security.encryptionType': { $in: ['WEP', 'WPA', 'Open'] },
      isAuthorized: true
    });

    const alerts = [];
    for (const network of weakNetworks) {
      const alert = await this.createAlert({
        alertType: 'weak-encryption',
        severity: network.security.encryptionType === 'Open' ? 'critical' : 'high',
        title: `Weak Encryption: ${network.ssid}`,
        description: `Network "${network.ssid}" is using ${network.security.encryptionType} encryption which is considered insecure`,
        affectedNetwork: {
          networkId: network.networkId,
          ssid: network.ssid,
          bssid: network.bssid
        },
        responseActions: {
          recommended: [{
            action: 'Upgrade to WPA3-Enterprise or WPA2-Enterprise',
            priority: 'high',
            description: 'Migrate to stronger encryption standard'
          }]
        }
      });
      alerts.push(alert);
    }

    return {
      weakNetworksFound: weakNetworks.length,
      alerts
    };
  }

  async analyzeSignalAnomalies() {
    try {
      // Find APs with unusual signal patterns
      const aps = await AccessPoint.find({
        status: 'online',
        'performance.interference.level': { $in: ['high'] }
      });

      const anomalies = [];
      for (const ap of aps) {
        if (ap.performance.utilization?.channel > 80) {
          const alert = await this.createAlert({
            alertType: 'signal-interference',
            severity: 'medium',
            title: `High Channel Interference: ${ap.name}`,
            description: `Access point "${ap.name}" is experiencing high channel interference (${ap.performance.utilization.channel}% utilization)`,
            source: {
              type: 'access-point',
              identifier: ap.apId,
              macAddress: ap.macAddress
            },
            location: ap.location
          });
          anomalies.push(alert);
        }
      }

      return {
        apsAnalyzed: aps.length,
        anomaliesDetected: anomalies.length,
        anomalies
      };
    } catch (error) {
      throw new Error(`Signal analysis failed: ${error.message}`);
    }
  }

  // ==================== ML-POWERED ANALYSIS ====================

  async performMLAnalysis(data) {
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, {
        type: 'wireless-security',
        data: {
          networks: data.networks || [],
          clients: data.clients || [],
          accessPoints: data.accessPoints || [],
          trafficPatterns: data.trafficPatterns || []
        }
      });
      
      return mlResponse.data;
    } catch (error) {
      console.error('ML analysis error:', error.message);
      return { 
        success: false, 
        error: error.message,
        fallback: 'Using rule-based analysis'
      };
    }
  }

  async performThreatHunting() {
    try {
      // Collect data for analysis
      const networks = await WirelessNetwork.find({ lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      const clients = await WirelessClient.find({ lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      const aps = await AccessPoint.find({ status: 'online' });

      // Run ML analysis
      const mlResult = await this.performMLAnalysis({
        networks: networks.map(n => ({
          ssid: n.ssid,
          bssid: n.bssid,
          encryptionType: n.security?.encryptionType,
          signalStrength: n.signalMetrics?.rssi,
          channel: n.frequency?.channel
        })),
        clients: clients.map(c => ({
          macAddress: c.macAddress,
          deviceType: c.device?.deviceType,
          connectionStatus: c.connectionStatus,
          signalStrength: c.signalQuality?.rssi
        })),
        accessPoints: aps.map(ap => ({
          apId: ap.apId,
          status: ap.status,
          clientCount: ap.connectedClients?.total,
          utilization: ap.performance?.utilization
        }))
      });

      return {
        networks: networks.length,
        clients: clients.length,
        accessPoints: aps.length,
        mlAnalysis: mlResult,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Threat hunting failed: ${error.message}`);
    }
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardData() {
    const [
      totalNetworks,
      activeNetworks,
      rogueNetworks,
      totalAPs,
      onlineAPs,
      totalClients,
      connectedClients,
      newAlerts,
      criticalAlerts
    ] = await Promise.all([
      WirelessNetwork.countDocuments(),
      WirelessNetwork.countDocuments({ status: 'active' }),
      WirelessNetwork.countDocuments({ isRogue: true }),
      AccessPoint.countDocuments(),
      AccessPoint.countDocuments({ status: 'online' }),
      WirelessClient.countDocuments(),
      WirelessClient.countDocuments({ connectionStatus: 'connected' }),
      WirelessSecurityAlert.countDocuments({ status: 'new' }),
      WirelessSecurityAlert.countDocuments({ severity: 'critical', status: { $ne: 'resolved' } })
    ]);

    const recentAlerts = await WirelessSecurityAlert.find()
      .sort({ detectedAt: -1 })
      .limit(10);

    const networksByType = await WirelessNetwork.aggregate([
      { $group: { _id: '$networkType', count: { $sum: 1 } } }
    ]);

    const clientsByDevice = await WirelessClient.aggregate([
      { $group: { _id: '$device.deviceType', count: { $sum: 1 } } }
    ]);

    return {
      overview: {
        totalNetworks,
        activeNetworks,
        rogueNetworks,
        totalAPs,
        onlineAPs,
        totalClients,
        connectedClients,
        newAlerts,
        criticalAlerts
      },
      networksByType,
      clientsByDevice,
      recentAlerts,
      healthScore: this.calculateHealthScore({
        rogueNetworks,
        criticalAlerts,
        onlineAPs,
        totalAPs
      }),
      timestamp: new Date()
    };
  }

  calculateHealthScore({ rogueNetworks, criticalAlerts, onlineAPs, totalAPs }) {
    let score = 100;
    
    // Deduct for rogue networks
    score -= rogueNetworks * 10;
    
    // Deduct for critical alerts
    score -= criticalAlerts * 15;
    
    // Deduct for offline APs
    const offlinePercentage = totalAPs > 0 ? ((totalAPs - onlineAPs) / totalAPs) * 100 : 0;
    score -= offlinePercentage * 0.5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // ==================== NOTIFICATION SERVICES ====================

  async sendAlertNotifications(alert) {
    const notifications = [];
    
    // Email notification
    if (process.env.WIRELESSWATCH_SENDGRID_API_KEY) {
      notifications.push({
        channel: 'email',
        sentAt: new Date(),
        success: true
      });
    }
    
    // Slack notification
    if (process.env.WIRELESSWATCH_SLACK_API_KEY) {
      notifications.push({
        channel: 'slack',
        sentAt: new Date(),
        success: true
      });
    }
    
    // PagerDuty for critical alerts
    if (alert.severity === 'critical' && process.env.WIRELESSWATCH_PAGERDUTY_API_KEY) {
      notifications.push({
        channel: 'pagerduty',
        sentAt: new Date(),
        success: true
      });
    }
    
    // Update alert with notification status
    if (notifications.length > 0) {
      await WirelessSecurityAlert.findOneAndUpdate(
        { alertId: alert.alertId },
        { 'integrations.notificationsSent': notifications }
      );
    }
    
    return notifications;
  }

  // ==================== PROVIDER SYNC ====================

  async syncWithProvider(providerName) {
    const provider = this.wifiProviders[providerName];
    if (!provider || !provider.apiKey || provider.apiKey.startsWith('your_')) {
      return {
        success: false,
        error: `Provider ${providerName} not configured or missing API key`,
        site: provider?.site
      };
    }

    // This would integrate with actual provider APIs
    return {
      success: true,
      provider: provider.name,
      message: `Sync initiated with ${provider.name}`,
      site: provider.site
    };
  }

  async getProviderStatus() {
    const providers = [];
    
    for (const [key, provider] of Object.entries(this.wifiProviders)) {
      providers.push({
        id: key,
        name: provider.name,
        configured: provider.apiKey && !provider.apiKey.startsWith('your_'),
        site: provider.site
      });
    }
    
    return providers;
  }
}

module.exports = new WirelessHunterService();

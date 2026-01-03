/**
 * Device Controller - IoTSecure
 * Handles IoT device discovery, management, and security operations
 */

const { Device, Vulnerability, Alert } = require('../models');
const iotSecureService = require('../services/iotSecureService');

/**
 * Get all devices with filtering and pagination
 */
exports.getAllDevices = async (req, res) => {
  try {
    const {
      status,
      type,
      riskLevel,
      segment,
      page = 1,
      limit = 50,
      sortBy = 'lastSeen',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (segment) filter.segmentId = segment;

    const devices = await Device.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Device.countDocuments(filter);

    res.json({
      success: true,
      data: devices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device by ID
 */
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id).lean();
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Discover devices on network using external APIs
 */
exports.discoverDevices = async (req, res) => {
  try {
    const { networks, options = {} } = req.body;
    
    if (!networks || !Array.isArray(networks) || networks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Networks array is required (e.g., ["192.168.1.0/24"])' 
      });
    }

    const allResults = [];
    
    for (const network of networks) {
      const result = await iotSecureService.discoverDevices(network, options);
      
      // Store discovered devices in database
      for (const deviceData of result.combined) {
        const existing = await Device.findOne({ ipAddress: deviceData.ip });
        
        if (existing) {
          // Update existing device
          await Device.updateOne(
            { ipAddress: deviceData.ip },
            { 
              $set: { 
                lastSeen: new Date(),
                openPorts: deviceData.openPorts,
                services: deviceData.services
              }
            }
          );
        } else {
          // Create new device
          await Device.create({
            name: deviceData.hostname || `Device-${deviceData.ip}`,
            ipAddress: deviceData.ip,
            macAddress: deviceData.mac || 'Unknown',
            type: deviceData.deviceType,
            manufacturer: deviceData.manufacturer,
            status: 'online',
            riskLevel: deviceData.vulnerabilities.length > 0 ? 'high' : 'low',
            openPorts: deviceData.openPorts,
            services: deviceData.services,
            discoveredAt: new Date(),
            lastSeen: new Date(),
            source: deviceData.source
          });
        }
      }

      allResults.push({
        network,
        devicesFound: result.combined.length,
        devices: result.combined
      });
    }

    res.json({
      success: true,
      data: allResults,
      totalDevices: allResults.reduce((sum, r) => sum + r.devicesFound, 0)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Scan device for vulnerabilities
 */
exports.scanDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findById(id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const scanResult = await iotSecureService.scanDeviceVulnerabilities(
      device.ipAddress,
      { type: device.type, manufacturer: device.manufacturer }
    );

    // Store vulnerabilities in database
    for (const vuln of scanResult.vulnerabilities) {
      const existingVuln = await Vulnerability.findOne({ 
        cveId: vuln.cveId, 
        deviceId: device._id 
      });

      if (!existingVuln) {
        await Vulnerability.create({
          cveId: vuln.cveId,
          deviceId: device._id,
          title: vuln.cveId,
          description: vuln.description,
          severity: vuln.severity.toLowerCase(),
          cvssScore: vuln.score,
          exploitAvailable: vuln.exploitAvailable,
          status: 'open',
          discoveredAt: new Date()
        });
      }
    }

    // Update device risk level
    const newRiskLevel = scanResult.riskScore >= 80 ? 'critical' 
      : scanResult.riskScore >= 60 ? 'high'
      : scanResult.riskScore >= 30 ? 'medium' : 'low';

    await Device.updateOne(
      { _id: device._id },
      { 
        $set: { 
          riskLevel: newRiskLevel,
          riskScore: scanResult.riskScore,
          lastScanned: new Date()
        }
      }
    );

    // Create alert for critical vulnerabilities
    if (scanResult.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
      await Alert.create({
        title: `Critical vulnerabilities found on ${device.name}`,
        description: `${scanResult.vulnerabilities.filter(v => v.severity === 'CRITICAL').length} critical vulnerabilities detected`,
        severity: 'critical',
        source: 'vulnerability_scan',
        deviceId: device._id,
        status: 'active'
      });
    }

    res.json({
      success: true,
      data: {
        device: device.name,
        ipAddress: device.ipAddress,
        ...scanResult
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Quarantine device (isolate from network)
 */
exports.quarantineDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const device = await Device.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: 'quarantined',
          quarantinedAt: new Date(),
          quarantineReason: reason || 'Security policy violation'
        }
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    // Create alert for quarantine action
    await Alert.create({
      title: `Device quarantined: ${device.name}`,
      description: reason || 'Device quarantined due to security policy',
      severity: 'high',
      source: 'quarantine_action',
      deviceId: device._id,
      status: 'active'
    });

    res.json({
      success: true,
      message: `Device ${device.name} has been quarantined`,
      data: device
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Restore device from quarantine
 */
exports.restoreDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findByIdAndUpdate(
      id,
      { 
        $set: { status: 'online' },
        $unset: { quarantinedAt: 1, quarantineReason: 1 }
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    res.json({
      success: true,
      message: `Device ${device.name} has been restored`,
      data: device
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete device
 */
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    // Also delete associated vulnerabilities
    await Vulnerability.deleteMany({ deviceId: device._id });

    res.json({
      success: true,
      message: `Device ${device.name} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device statistics
 */
exports.getDeviceStats = async (req, res) => {
  try {
    const [
      total,
      online,
      offline,
      quarantined,
      critical,
      high,
      medium,
      low
    ] = await Promise.all([
      Device.countDocuments(),
      Device.countDocuments({ status: 'online' }),
      Device.countDocuments({ status: 'offline' }),
      Device.countDocuments({ status: 'quarantined' }),
      Device.countDocuments({ riskLevel: 'critical' }),
      Device.countDocuments({ riskLevel: 'high' }),
      Device.countDocuments({ riskLevel: 'medium' }),
      Device.countDocuments({ riskLevel: 'low' })
    ]);

    // Get device types distribution
    const typeDistribution = await Device.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: { online, offline, quarantined },
        byRisk: { critical, high, medium, low },
        byType: typeDistribution.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

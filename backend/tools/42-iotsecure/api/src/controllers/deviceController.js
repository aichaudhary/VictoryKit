/**
 * Device Controller
 * Handles all device management operations
 */

const { Device, Vulnerability, Alert, Baseline, Firmware } = require('../models');
const shodanService = require('../services/shodanService');
const censysService = require('../services/censysService');

// Helper for pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Helper for sorting
const getSort = (req) => {
  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  return { [sortField]: sortOrder };
};

/**
 * Get all devices with filtering & pagination
 */
exports.getDevices = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const sort = getSort(req);
    
    // Build filter
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.manufacturer) filter.manufacturer = new RegExp(req.query.manufacturer, 'i');
    if (req.query.segment) filter.networkSegment = req.query.segment;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.online === 'true') filter.status = 'online';
    if (req.query.online === 'false') filter.status = 'offline';
    
    const [devices, total] = await Promise.all([
      Device.find(filter).sort(sort).skip(skip).limit(limit),
      Device.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: devices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
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
    const stats = await Device.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get high-risk devices
 */
exports.getHighRiskDevices = async (req, res) => {
  try {
    const minScore = parseInt(req.query.minScore) || 70;
    const devices = await Device.findHighRisk(minScore);
    res.json({ success: true, data: devices, count: devices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get offline devices
 */
exports.getOfflineDevices = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const devices = await Device.findOffline(hours);
    res.json({ success: true, data: devices, count: devices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get devices by type
 */
exports.getDevicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page, limit, skip } = getPagination(req);
    
    const [devices, total] = await Promise.all([
      Device.find({ type }).skip(skip).limit(limit),
      Device.countDocuments({ type })
    ]);
    
    res.json({
      success: true,
      data: devices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get devices by segment
 */
exports.getDevicesBySegment = async (req, res) => {
  try {
    const { segmentId } = req.params;
    const devices = await Device.find({ networkSegment: segmentId });
    res.json({ success: true, data: devices, count: devices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Search devices
 */
exports.searchDevices = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const devices = await Device.find({
      $or: [
        { name: searchRegex },
        { deviceId: searchRegex },
        { ipAddress: searchRegex },
        { macAddress: searchRegex },
        { manufacturer: searchRegex },
        { model: searchRegex },
        { hostname: searchRegex }
      ]
    }).limit(50);
    
    res.json({ success: true, data: devices, count: devices.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk update devices
 */
exports.bulkUpdateDevices = async (req, res) => {
  try {
    const { deviceIds, updates } = req.body;
    
    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Device IDs array required' });
    }
    
    const result = await Device.updateMany(
      { _id: { $in: deviceIds } },
      { $set: updates }
    );
    
    res.json({ 
      success: true, 
      modified: result.modifiedCount,
      matched: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk delete devices
 */
exports.bulkDeleteDevices = async (req, res) => {
  try {
    const { deviceIds } = req.body;
    
    if (!deviceIds || !Array.isArray(deviceIds)) {
      return res.status(400).json({ success: false, error: 'Device IDs array required' });
    }
    
    const result = await Device.deleteMany({ _id: { $in: deviceIds } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk quarantine devices
 */
exports.bulkQuarantineDevices = async (req, res) => {
  try {
    const { deviceIds, reason } = req.body;
    
    const result = await Device.updateMany(
      { _id: { $in: deviceIds } },
      { 
        $set: { 
          status: 'quarantined',
          'quarantine.reason': reason || 'Bulk quarantine action',
          'quarantine.quarantinedAt': new Date()
        }
      }
    );
    
    res.json({ success: true, quarantined: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Discover devices on network
 */
exports.discoverDevices = async (req, res) => {
  try {
    const { subnet, useExternal } = req.body;
    
    let discoveredDevices = [];
    
    // Use Shodan if enabled
    if (useExternal && process.env.SHODAN_API_KEY) {
      const shodanResults = await shodanService.searchByNet(subnet);
      discoveredDevices = [...discoveredDevices, ...shodanResults];
    }
    
    // Use Censys if enabled
    if (useExternal && process.env.CENSYS_API_ID) {
      const censysResults = await censysService.searchByNet(subnet);
      discoveredDevices = [...discoveredDevices, ...censysResults];
    }
    
    // TODO: Add local network scanning
    
    res.json({ 
      success: true, 
      discovered: discoveredDevices.length,
      devices: discoveredDevices
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single device by ID
 */
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create new device
 */
exports.createDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Update device
 */
exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Quarantine device
 */
exports.quarantineDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    await device.quarantine(req.body.reason || 'Manual quarantine');
    
    // Create alert for quarantine action
    await Alert.create({
      type: 'device_quarantined',
      severity: 'medium',
      title: `Device quarantined: ${device.name}`,
      description: req.body.reason || 'Device was manually quarantined',
      affectedDevices: [{ deviceId: device._id, deviceName: device.name, ipAddress: device.ipAddress }],
      source: { type: 'user' }
    });
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Unquarantine device
 */
exports.unquarantineDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'online',
        $unset: { quarantine: 1 }
      },
      { new: true }
    );
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Scan specific device
 */
exports.scanDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // Create scan job
    const Scan = require('../models/Scan');
    const scan = await Scan.create({
      type: req.body.scanType || 'full',
      target: { type: 'device', deviceIds: [device._id] },
      initiatedBy: 'user'
    });
    
    res.json({ 
      success: true, 
      message: 'Scan initiated',
      scanId: scan.scanId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reboot device (if supported)
 */
exports.rebootDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // TODO: Implement actual device reboot via device management protocol
    res.json({ 
      success: true, 
      message: 'Reboot command sent',
      note: 'Actual implementation depends on device protocol support'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Reset device credentials
 */
exports.resetDeviceCredentials = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // TODO: Implement credential reset
    res.json({ 
      success: true, 
      message: 'Credential reset initiated',
      note: 'Implementation depends on device management capabilities'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device vulnerabilities
 */
exports.getDeviceVulnerabilities = async (req, res) => {
  try {
    const vulnerabilities = await Vulnerability.find({
      'affectedDevices.deviceId': req.params.id
    }).sort({ cvssV3Score: -1 });
    
    res.json({ success: true, data: vulnerabilities, count: vulnerabilities.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device alerts
 */
exports.getDeviceAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      'affectedDevices.deviceId': req.params.id
    }).sort({ detectedAt: -1 });
    
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device baseline
 */
exports.getDeviceBaseline = async (req, res) => {
  try {
    const baselines = await Baseline.getForDevice(req.params.id);
    res.json({ success: true, data: baselines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create device baseline
 */
exports.createDeviceBaseline = async (req, res) => {
  try {
    const baseline = await Baseline.create({
      ...req.body,
      device: req.params.id,
      type: req.body.type || 'device',
      status: 'learning'
    });
    res.status(201).json({ success: true, data: baseline });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get device firmware
 */
exports.getDeviceFirmware = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    const firmware = await Firmware.findOne({
      installedOn: req.params.id
    });
    
    res.json({ 
      success: true, 
      data: {
        current: device.firmwareVersion,
        firmware
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update device firmware
 */
exports.updateDeviceFirmware = async (req, res) => {
  try {
    const { firmwareId } = req.body;
    
    // TODO: Implement firmware update workflow
    res.json({ 
      success: true, 
      message: 'Firmware update scheduled',
      note: 'Implementation depends on device OTA update support'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device network info
 */
exports.getDeviceNetwork = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id)
      .select('ipAddress macAddress hostname networkSegment openPorts services protocols');
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get device history
 */
exports.getDeviceHistory = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    
    // Get related alerts as history
    const alerts = await Alert.find({
      'affectedDevices.deviceId': req.params.id
    })
    .sort({ detectedAt: -1 })
    .limit(50)
    .select('type severity title detectedAt status');
    
    res.json({ 
      success: true, 
      data: {
        firstSeen: device.firstSeen,
        lastSeen: device.lastSeen,
        alerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export devices to CSV
 */
exports.exportDevicesCSV = async (req, res) => {
  try {
    const devices = await Device.find({}).lean();
    
    // Build CSV
    const headers = ['deviceId', 'name', 'type', 'ipAddress', 'macAddress', 'status', 'riskScore', 'manufacturer', 'model'];
    const rows = devices.map(d => 
      headers.map(h => d[h] || '').join(',')
    );
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=devices.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Export devices to JSON
 */
exports.exportDevicesJSON = async (req, res) => {
  try {
    const devices = await Device.find({}).lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=devices.json');
    res.json(devices);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

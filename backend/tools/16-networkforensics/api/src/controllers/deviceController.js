/**
 * Device Controller
 * Handles network device management endpoints
 */

const { NetworkDevice } = require("../models");
const { discoveryService, snmpService, websocketService } = require("../services");

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const { status, type, location, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (location) query["location.building"] = new RegExp(location, "i");
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { ip: new RegExp(search, "i") },
        { mac: new RegExp(search, "i") }
      ];
    }

    const devices = await NetworkDevice.find(query)
      .sort({ name: 1 })
      .select("-__v");

    res.json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get device by ID
exports.getDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: "Device not found" });
    }
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create device
exports.createDevice = async (req, res) => {
  try {
    const device = new NetworkDevice(req.body);
    await device.save();

    websocketService.notifyDeviceStatusChange(device);

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ success: false, error: "Device not found" });
    }

    websocketService.notifyDeviceStatusChange(device);

    res.json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: "Device not found" });
    }
    res.json({ success: true, message: "Device deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Discover devices on subnet
exports.discover = async (req, res) => {
  try {
    const { subnet } = req.body;
    if (!subnet) {
      return res.status(400).json({ success: false, error: "Subnet is required" });
    }

    const discovered = await discoveryService.scanSubnet(subnet);

    res.json({
      success: true,
      count: discovered.length,
      data: discovered
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Auto-discover and save devices
exports.autoDiscover = async (req, res) => {
  try {
    const { subnet } = req.body;
    const result = await discoveryService.autoDiscover(subnet);

    res.json({
      success: true,
      discovered: result.discovered,
      added: result.added,
      data: result.devices
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check device status
exports.checkStatus = async (req, res) => {
  try {
    const status = await discoveryService.checkDeviceStatus(req.params.id);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check all devices status
exports.checkAllStatus = async (req, res) => {
  try {
    const results = await discoveryService.checkAllDevices();
    res.json({
      success: true,
      total: results.total,
      online: results.online,
      offline: results.offline,
      data: results.details
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Poll device via SNMP
exports.pollDevice = async (req, res) => {
  try {
    const result = await snmpService.pollDevice(req.params.id);
    if (!result) {
      return res.status(400).json({ success: false, error: "SNMP poll failed" });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get device interfaces
exports.getInterfaces = async (req, res) => {
  try {
    const device = await NetworkDevice.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: "Device not found" });
    }

    let interfaces = device.interfaces || [];

    // Fetch fresh data if SNMP is enabled
    if (device.snmp?.enabled) {
      interfaces = await snmpService.getInterfaces(device.ip, {
        community: device.snmp.community,
        version: device.snmp.version
      });
    }

    res.json({ success: true, data: interfaces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get device statistics
exports.getDeviceStats = async (req, res) => {
  try {
    const [total, byStatus, byType] = await Promise.all([
      NetworkDevice.countDocuments({ status: { $ne: "decommissioned" } }),
      NetworkDevice.aggregate([
        { $match: { status: { $ne: "decommissioned" } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      NetworkDevice.aggregate([
        { $match: { status: { $ne: "decommissioned" } } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        byType: byType.reduce((acc, t) => { acc[t._id] = t.count; return acc; }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Network Controller
 * Handle network monitoring operations
 */

const Network = require("../models/Network");
const Alert = require("../models/Alert");

exports.getAll = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const networks = await Network.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Network.countDocuments(query);

    res.json({
      success: true,
      data: networks,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const network = await Network.findById(req.params.id);
    if (!network) {
      return res
        .status(404)
        .json({ success: false, error: "Network not found" });
    }
    res.json({ success: true, data: network });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const network = new Network(req.body);
    await network.save();
    res.status(201).json({ success: true, data: network });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const network = await Network.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!network) {
      return res
        .status(404)
        .json({ success: false, error: "Network not found" });
    }
    res.json({ success: true, data: network });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const network = await Network.findByIdAndDelete(req.params.id);
    if (!network) {
      return res
        .status(404)
        .json({ success: false, error: "Network not found" });
    }
    res.json({ success: true, message: "Network deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTopology = async (req, res) => {
  try {
    const network = await Network.findById(req.params.id);
    if (!network) {
      return res
        .status(404)
        .json({ success: false, error: "Network not found" });
    }

    // Build topology from assets
    const nodes = network.assets.map((asset) => ({
      id: asset.ipAddress,
      label: asset.hostname || asset.ipAddress,
      type: asset.type,
      criticality: asset.criticality,
    }));

    // Add sensors
    network.sensors.forEach((sensor) => {
      nodes.push({
        id: sensor.id,
        label: sensor.name,
        type: "sensor",
        sensorType: sensor.type,
      });
    });

    res.json({
      success: true,
      data: {
        network: network.name,
        cidr: network.cidr,
        nodes,
        gateway: network.gateway,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const network = await Network.findById(req.params.id);
    if (!network) {
      return res
        .status(404)
        .json({ success: false, error: "Network not found" });
    }

    const alertStats = await Alert.aggregate([
      { $match: { network: network._id } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        network: network.name,
        statistics: network.statistics,
        alertsBysSeverity: alertStats,
        sensors: network.sensors.length,
        assets: network.assets.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalNetworks,
      activeNetworks,
      totalAlerts,
      criticalAlerts,
      recentAlerts,
    ] = await Promise.all([
      Network.countDocuments(),
      Network.countDocuments({ status: "active" }),
      Alert.countDocuments(),
      Alert.countDocuments({ severity: "critical", status: "new" }),
      Alert.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        networks: { total: totalNetworks, active: activeNetworks },
        alerts: { total: totalAlerts, critical: criticalAlerts },
        recentAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

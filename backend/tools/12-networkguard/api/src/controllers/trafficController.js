/**
 * Traffic Controller
 * Handle network traffic analysis
 */

const Traffic = require("../models/Traffic");
const trafficService = require("../services/trafficService");

exports.getSummary = async (req, res) => {
  try {
    const { network, hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const query = { createdAt: { $gte: since } };
    if (network) query.network = network;

    const [totalFlows, anomalies, byProtocol, bandwidth] = await Promise.all([
      Traffic.countDocuments(query),
      Traffic.countDocuments({ ...query, "analysis.isAnomaly": true }),
      Traffic.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$flow.protocol",
            count: { $sum: 1 },
            bytes: { $sum: "$flow.bytes" },
          },
        },
      ]),
      Traffic.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalBytes: { $sum: "$flow.bytes" },
            totalPackets: { $sum: "$flow.packets" },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        period: `${hours} hours`,
        totalFlows,
        anomalies,
        byProtocol,
        bandwidth: bandwidth[0] || { totalBytes: 0, totalPackets: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { flowData } = req.body;

    if (!flowData) {
      return res
        .status(400)
        .json({ success: false, error: "Flow data required" });
    }

    const analysis = await trafficService.analyzeFlow(flowData);

    // Save the traffic record
    const traffic = new Traffic({
      flow: flowData,
      analysis,
    });
    await traffic.save();

    res.json({ success: true, data: { traffic, analysis } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFlows = async (req, res) => {
  try {
    const {
      sourceIp,
      destinationIp,
      protocol,
      page = 1,
      limit = 100,
    } = req.query;
    const query = {};

    if (sourceIp) query["flow.sourceIp"] = sourceIp;
    if (destinationIp) query["flow.destinationIp"] = destinationIp;
    if (protocol) query["flow.protocol"] = protocol.toUpperCase();

    const flows = await Traffic.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Traffic.countDocuments(query);

    res.json({
      success: true,
      data: flows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.startCapture = async (req, res) => {
  try {
    const { network, duration = 60, filter } = req.body;

    // In production, this would trigger actual packet capture
    const captureId = `capture_${Date.now()}`;

    res.json({
      success: true,
      data: {
        captureId,
        network,
        duration,
        filter,
        status: "started",
        message: "Packet capture initiated",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnomalies = async (req, res) => {
  try {
    const { hours = 24, page = 1, limit = 50 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const anomalies = await Traffic.find({
      createdAt: { $gte: since },
      "analysis.isAnomaly": true,
    })
      .sort({ "analysis.anomalyScore": -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Traffic.countDocuments({
      createdAt: { $gte: since },
      "analysis.isAnomaly": true,
    });

    res.json({
      success: true,
      data: anomalies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

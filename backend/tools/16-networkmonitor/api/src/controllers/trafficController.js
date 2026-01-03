/**
 * Traffic Controller
 * Handles network traffic analysis endpoints
 */

const { trafficService, websocketService } = require("../services");
const { TrafficLog } = require("../models");

// Get traffic statistics
exports.getStats = async (req, res) => {
  try {
    const options = {
      startTime: req.query.startTime,
      endTime: req.query.endTime,
      sourceIp: req.query.sourceIp,
      deviceId: req.query.deviceId
    };

    const stats = await trafficService.getStats(options);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bandwidth by device
exports.getBandwidth = async (req, res) => {
  try {
    const options = {
      startTime: req.query.startTime
    };

    const bandwidth = await trafficService.getBandwidthByDevice(options);

    res.json({ success: true, data: bandwidth });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recent flows
exports.getFlows = async (req, res) => {
  try {
    const options = {
      sourceIp: req.query.sourceIp,
      destinationIp: req.query.destinationIp,
      protocol: req.query.protocol,
      port: req.query.port ? parseInt(req.query.port) : undefined,
      limit: parseInt(req.query.limit) || 100
    };

    const flows = await trafficService.getRecentFlows(options);

    res.json({
      success: true,
      count: flows.length,
      data: flows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Log traffic flow
exports.logFlow = async (req, res) => {
  try {
    const trafficLog = await trafficService.logTraffic(req.body);

    // Send real-time update
    websocketService.sendTrafficUpdate({
      source: trafficLog.source.ip,
      destination: trafficLog.destination.ip,
      bytes: trafficLog.bytes,
      protocol: trafficLog.protocol
    });

    res.status(201).json({ success: true, data: trafficLog });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Bulk log traffic flows
exports.bulkLogFlows = async (req, res) => {
  try {
    const { flows } = req.body;
    
    const results = await Promise.all(
      flows.map(flow => trafficService.logTraffic(flow).catch(e => ({ error: e.message })))
    );

    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.status(201).json({
      success: true,
      logged: successful.length,
      failed: failed.length
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get top talkers
exports.getTopTalkers = async (req, res) => {
  try {
    const period = req.query.period || "1h";
    const limit = parseInt(req.query.limit) || 10;

    let startTime;
    switch (period) {
      case "15m": startTime = new Date(Date.now() - 15 * 60 * 1000); break;
      case "1h": startTime = new Date(Date.now() - 60 * 60 * 1000); break;
      case "6h": startTime = new Date(Date.now() - 6 * 60 * 60 * 1000); break;
      case "24h": startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(Date.now() - 60 * 60 * 1000);
    }

    const [topSources, topDestinations] = await Promise.all([
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: { _id: "$source.ip", bytes: { $sum: "$bytes" }, packets: { $sum: "$packets" } } },
        { $sort: { bytes: -1 } },
        { $limit: limit }
      ]),
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: { _id: "$destination.ip", bytes: { $sum: "$bytes" }, packets: { $sum: "$packets" } } },
        { $sort: { bytes: -1 } },
        { $limit: limit }
      ])
    ]);

    res.json({
      success: true,
      period,
      data: {
        topSources: topSources.map(s => ({ ip: s._id, bytes: s.bytes, packets: s.packets })),
        topDestinations: topDestinations.map(d => ({ ip: d._id, bytes: d.bytes, packets: d.packets }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get protocol distribution
exports.getProtocols = async (req, res) => {
  try {
    const period = req.query.period || "24h";
    let startTime;

    switch (period) {
      case "1h": startTime = new Date(Date.now() - 60 * 60 * 1000); break;
      case "6h": startTime = new Date(Date.now() - 6 * 60 * 60 * 1000); break;
      case "24h": startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      case "7d": startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const protocols = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: { 
        _id: "$protocol", 
        bytes: { $sum: "$bytes" }, 
        packets: { $sum: "$packets" },
        flows: { $sum: 1 }
      }},
      { $sort: { bytes: -1 } }
    ]);

    const total = protocols.reduce((sum, p) => sum + p.bytes, 0);

    res.json({
      success: true,
      period,
      data: protocols.map(p => ({
        protocol: p._id || "unknown",
        bytes: p.bytes,
        packets: p.packets,
        flows: p.flows,
        percentage: total > 0 ? ((p.bytes / total) * 100).toFixed(2) : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get application distribution
exports.getApplications = async (req, res) => {
  try {
    const period = req.query.period || "24h";
    let startTime;

    switch (period) {
      case "1h": startTime = new Date(Date.now() - 60 * 60 * 1000); break;
      case "24h": startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      case "7d": startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const applications = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: { 
        _id: "$classification.application", 
        bytes: { $sum: "$bytes" },
        flows: { $sum: 1 }
      }},
      { $sort: { bytes: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      period,
      data: applications.map(a => ({
        application: a._id || "unknown",
        bytes: a.bytes,
        flows: a.flows
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Detect anomalies for a device
exports.detectAnomalies = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const anomalies = await trafficService.detectAnomalies(deviceId);

    res.json({
      success: true,
      anomaliesFound: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get geo distribution
exports.getGeoDistribution = async (req, res) => {
  try {
    const period = req.query.period || "24h";
    let startTime;

    switch (period) {
      case "1h": startTime = new Date(Date.now() - 60 * 60 * 1000); break;
      case "24h": startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      case "7d": startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
      default: startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const [sourceCountries, destCountries] = await Promise.all([
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: startTime }, "source.geo.country": { $exists: true } } },
        { $group: { _id: "$source.geo.country", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } },
        { $limit: 20 }
      ]),
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: startTime }, "destination.geo.country": { $exists: true } } },
        { $group: { _id: "$destination.geo.country", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } },
        { $limit: 20 }
      ])
    ]);

    res.json({
      success: true,
      period,
      data: {
        sourceCountries: sourceCountries.map(c => ({ country: c._id, bytes: c.bytes, flows: c.flows })),
        destCountries: destCountries.map(c => ({ country: c._id, bytes: c.bytes, flows: c.flows }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

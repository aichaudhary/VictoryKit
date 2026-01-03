/**
 * Dashboard Controller
 * Provides aggregated dashboard data
 */

const { NetworkDevice, NetworkAlert, TrafficLog } = require("../models");
const { websocketService } = require("../services");

// Get dashboard overview
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now - 60 * 60 * 1000);

    const [
      deviceStats,
      alertStats,
      trafficStats,
      recentAlerts,
      topDevicesByTraffic
    ] = await Promise.all([
      // Device statistics
      NetworkDevice.aggregate([
        { $match: { status: { $ne: "decommissioned" } } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          online: { $sum: { $cond: [{ $eq: ["$status", "online"] }, 1, 0] } },
          offline: { $sum: { $cond: [{ $eq: ["$status", "offline"] }, 1, 0] } },
          warning: { $sum: { $cond: [{ $eq: ["$status", "warning"] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ["$status", "critical"] }, 1, 0] } }
        }}
      ]),

      // Alert statistics
      NetworkAlert.aggregate([
        { $facet: {
          open: [
            { $match: { resolved: false } },
            { $group: { _id: "$severity", count: { $sum: 1 } } }
          ],
          recent: [
            { $match: { timestamp: { $gte: last24h } } },
            { $count: "total" }
          ]
        }}
      ]),

      // Traffic statistics (last hour)
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: lastHour } } },
        { $group: {
          _id: null,
          totalBytes: { $sum: "$bytes" },
          totalPackets: { $sum: "$packets" },
          flowCount: { $sum: 1 }
        }}
      ]),

      // Recent critical alerts
      NetworkAlert.find({ severity: { $in: ["high", "critical"] }, resolved: false })
        .sort({ timestamp: -1 })
        .limit(5)
        .select("title severity type timestamp source"),

      // Top devices by bandwidth
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: lastHour } } },
        { $group: { _id: "$deviceId", bytes: { $sum: "$bytes" } } },
        { $sort: { bytes: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Process device stats
    const devices = deviceStats[0] || { total: 0, online: 0, offline: 0, warning: 0, critical: 0 };
    
    // Process alert stats
    const alertData = alertStats[0] || { open: [], recent: [{ total: 0 }] };
    const alertsBySeverity = alertData.open.reduce((acc, a) => { acc[a._id] = a.count; return acc; }, {});
    
    // Process traffic
    const traffic = trafficStats[0] || { totalBytes: 0, totalPackets: 0, flowCount: 0 };

    // Enrich top devices
    const enrichedDevices = await Promise.all(
      topDevicesByTraffic.map(async (d) => {
        const device = await NetworkDevice.findById(d._id).select("name ip type");
        return {
          device: device || { name: "Unknown", ip: "N/A" },
          bytes: d.bytes
        };
      })
    );

    res.json({
      success: true,
      data: {
        devices: {
          total: devices.total,
          online: devices.online,
          offline: devices.offline,
          warning: devices.warning,
          critical: devices.critical,
          healthPercent: devices.total > 0 ? Math.round((devices.online / devices.total) * 100) : 0
        },
        alerts: {
          open: Object.values(alertsBySeverity).reduce((a, b) => a + b, 0),
          critical: alertsBySeverity.critical || 0,
          high: alertsBySeverity.high || 0,
          medium: alertsBySeverity.medium || 0,
          low: alertsBySeverity.low || 0,
          last24h: alertData.recent[0]?.total || 0
        },
        traffic: {
          bytesLastHour: traffic.totalBytes,
          packetsLastHour: traffic.totalPackets,
          flowsLastHour: traffic.flowCount,
          bytesFormatted: formatBytes(traffic.totalBytes)
        },
        recentAlerts,
        topDevices: enrichedDevices,
        wsClients: websocketService.getClientCount(),
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get health status
exports.getHealth = async (req, res) => {
  try {
    const [deviceHealth, systemAlerts] = await Promise.all([
      NetworkDevice.aggregate([
        { $match: { status: { $ne: "decommissioned" } } },
        { $group: {
          _id: "$status",
          count: { $sum: 1 },
          devices: { $push: { name: "$name", ip: "$ip" } }
        }}
      ]),
      NetworkAlert.find({ 
        severity: "critical", 
        resolved: false,
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      }).select("title source timestamp")
    ]);

    const total = deviceHealth.reduce((sum, h) => sum + h.count, 0);
    const online = deviceHealth.find(h => h._id === "online")?.count || 0;
    const healthScore = total > 0 ? Math.round((online / total) * 100) : 100;

    let status = "healthy";
    if (healthScore < 80) status = "warning";
    if (healthScore < 60 || systemAlerts.length > 0) status = "critical";

    res.json({
      success: true,
      data: {
        status,
        healthScore,
        deviceHealth: deviceHealth.map(h => ({
          status: h._id,
          count: h.count,
          devices: h.devices.slice(0, 5) // Only first 5
        })),
        activeSystemAlerts: systemAlerts.length,
        systemAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get timeline data
exports.getTimeline = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [trafficTimeline, alertTimeline] = await Promise.all([
      TrafficLog.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" }
          },
          bytes: { $sum: "$bytes" },
          packets: { $sum: "$packets" }
        }},
        { $sort: { _id: 1 } }
      ]),
      NetworkAlert.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        { $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" }
          },
          count: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ["$severity", "critical"] }, 1, 0] } }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      hours,
      data: {
        traffic: trafficTimeline.map(t => ({
          time: t._id,
          bytes: t.bytes,
          packets: t.packets
        })),
        alerts: alertTimeline.map(a => ({
          time: a._id,
          count: a.count,
          critical: a.critical
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get network map data
exports.getNetworkMap = async (req, res) => {
  try {
    const devices = await NetworkDevice.find({ status: { $ne: "decommissioned" } })
      .select("name ip type status location.building bandwidth");

    // Get recent connections between devices
    const connections = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } } },
      { $group: {
        _id: { source: "$source.ip", destination: "$destination.ip" },
        bytes: { $sum: "$bytes" },
        flows: { $sum: 1 }
      }},
      { $match: { bytes: { $gte: 1000000 } } }, // At least 1MB
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      data: {
        nodes: devices.map(d => ({
          id: d._id,
          name: d.name,
          ip: d.ip,
          type: d.type,
          status: d.status,
          building: d.location?.building
        })),
        edges: connections.map(c => ({
          source: c._id.source,
          target: c._id.destination,
          bytes: c.bytes,
          flows: c.flows
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function
function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let value = bytes || 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

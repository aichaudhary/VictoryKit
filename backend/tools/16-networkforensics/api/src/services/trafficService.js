/**
 * Traffic Analysis Service
 * Processes network traffic data and provides analytics
 */

const { TrafficLog, NetworkDevice, NetworkAlert } = require("../models");
const geoip = require("geoip-lite");

class TrafficService {
  constructor() {
    this.protocolPorts = {
      20: "FTP-DATA", 21: "FTP", 22: "SSH", 23: "TELNET", 25: "SMTP",
      53: "DNS", 67: "DHCP", 68: "DHCP", 80: "HTTP", 110: "POP3",
      123: "NTP", 143: "IMAP", 161: "SNMP", 162: "SNMP-TRAP", 389: "LDAP",
      443: "HTTPS", 445: "SMB", 465: "SMTPS", 514: "SYSLOG", 636: "LDAPS",
      993: "IMAPS", 995: "POP3S", 1433: "MSSQL", 1521: "ORACLE",
      3306: "MYSQL", 3389: "RDP", 5432: "POSTGRESQL", 5900: "VNC",
      6379: "REDIS", 8080: "HTTP-ALT", 8443: "HTTPS-ALT", 27017: "MONGODB"
    };
  }

  // Log a traffic flow
  async logTraffic(flowData) {
    const trafficLog = new TrafficLog({
      ...flowData,
      timestamp: new Date()
    });

    // Enrich with geo data
    if (flowData.source?.ip) {
      const geo = geoip.lookup(flowData.source.ip);
      if (geo) {
        trafficLog.source.geo = {
          country: geo.country,
          city: geo.city,
          latitude: geo.ll?.[0],
          longitude: geo.ll?.[1]
        };
      }
    }

    if (flowData.destination?.ip) {
      const geo = geoip.lookup(flowData.destination.ip);
      if (geo) {
        trafficLog.destination.geo = {
          country: geo.country,
          city: geo.city,
          latitude: geo.ll?.[0],
          longitude: geo.ll?.[1]
        };
      }
    }

    // Classify traffic
    trafficLog.classification = this.classifyTraffic(flowData);

    await trafficLog.save();
    return trafficLog;
  }

  // Classify traffic type
  classifyTraffic(flow) {
    const port = flow.destination?.port || flow.source?.port;
    const protocol = flow.protocol?.toUpperCase();

    // Check for suspicious patterns
    if (this.isSuspicious(flow)) {
      return { category: "suspicious", application: "unknown", confidence: 0.9 };
    }

    // Known services
    const service = this.protocolPorts[port];
    if (service) {
      return { category: "known", application: service, confidence: 0.95 };
    }

    // Protocol-based classification
    if (protocol === "ICMP") {
      return { category: "network", application: "ICMP", confidence: 1.0 };
    }

    // Unknown traffic on high ports
    if (port > 49152) {
      return { category: "ephemeral", application: "dynamic", confidence: 0.7 };
    }

    return { category: "unknown", application: "unclassified", confidence: 0.5 };
  }

  // Check for suspicious traffic patterns
  isSuspicious(flow) {
    // Port scan detection (many ports, same source)
    // Unusual protocols
    // High data volumes to external IPs
    const suspiciousPorts = [4444, 5555, 6666, 31337, 12345];
    const port = flow.destination?.port;
    
    if (suspiciousPorts.includes(port)) return true;
    if (flow.bytes > 100000000 && !this.isInternalIP(flow.destination?.ip)) return true;
    
    return false;
  }

  // Check if IP is internal
  isInternalIP(ip) {
    if (!ip) return false;
    return ip.startsWith("10.") || 
           ip.startsWith("192.168.") || 
           ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
           ip === "127.0.0.1";
  }

  // Get traffic statistics
  async getStats(options = {}) {
    const now = new Date();
    const startTime = options.startTime ? new Date(options.startTime) : new Date(now - 24 * 60 * 60 * 1000);
    const endTime = options.endTime ? new Date(options.endTime) : now;

    const matchStage = {
      timestamp: { $gte: startTime, $lte: endTime }
    };

    if (options.sourceIp) matchStage["source.ip"] = options.sourceIp;
    if (options.deviceId) matchStage.deviceId = options.deviceId;

    const [
      totalStats,
      topSources,
      topDestinations,
      topProtocols,
      topApplications,
      trafficOverTime
    ] = await Promise.all([
      // Total statistics
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: {
          _id: null,
          totalBytes: { $sum: "$bytes" },
          totalPackets: { $sum: "$packets" },
          flowCount: { $sum: 1 },
          avgDuration: { $avg: "$duration" }
        }}
      ]),

      // Top source IPs
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: { _id: "$source.ip", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } },
        { $limit: 10 }
      ]),

      // Top destination IPs
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: { _id: "$destination.ip", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } },
        { $limit: 10 }
      ]),

      // Top protocols
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: { _id: "$protocol", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } }
      ]),

      // Top applications
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: { _id: "$classification.application", bytes: { $sum: "$bytes" }, flows: { $sum: 1 } } },
        { $sort: { bytes: -1 } },
        { $limit: 10 }
      ]),

      // Traffic over time (hourly buckets)
      TrafficLog.aggregate([
        { $match: matchStage },
        { $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" }
          },
          bytes: { $sum: "$bytes" },
          packets: { $sum: "$packets" },
          flows: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      summary: totalStats[0] || { totalBytes: 0, totalPackets: 0, flowCount: 0 },
      topSources: topSources.map(s => ({ ip: s._id, bytes: s.bytes, flows: s.flows })),
      topDestinations: topDestinations.map(d => ({ ip: d._id, bytes: d.bytes, flows: d.flows })),
      topProtocols: topProtocols.map(p => ({ protocol: p._id, bytes: p.bytes, flows: p.flows })),
      topApplications: topApplications.map(a => ({ app: a._id, bytes: a.bytes, flows: a.flows })),
      timeline: trafficOverTime.map(t => ({ time: t._id, bytes: t.bytes, packets: t.packets, flows: t.flows }))
    };
  }

  // Get bandwidth utilization per device
  async getBandwidthByDevice(options = {}) {
    const now = new Date();
    const startTime = options.startTime ? new Date(options.startTime) : new Date(now - 60 * 60 * 1000); // Last hour

    const result = await TrafficLog.aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: {
        _id: "$deviceId",
        inbound: { $sum: { $cond: [{ $eq: ["$direction", "inbound"] }, "$bytes", 0] } },
        outbound: { $sum: { $cond: [{ $eq: ["$direction", "outbound"] }, "$bytes", 0] } },
        total: { $sum: "$bytes" }
      }},
      { $sort: { total: -1 } }
    ]);

    // Enrich with device info
    const enriched = await Promise.all(result.map(async (item) => {
      const device = await NetworkDevice.findById(item._id).select("name ip type");
      return {
        device: device || { name: "Unknown", ip: "N/A" },
        inbound: item.inbound,
        outbound: item.outbound,
        total: item.total
      };
    }));

    return enriched;
  }

  // Get recent flows
  async getRecentFlows(options = {}) {
    const query = {};
    
    if (options.sourceIp) query["source.ip"] = options.sourceIp;
    if (options.destinationIp) query["destination.ip"] = options.destinationIp;
    if (options.protocol) query.protocol = options.protocol;
    if (options.port) {
      query.$or = [
        { "source.port": options.port },
        { "destination.port": options.port }
      ];
    }

    const flows = await TrafficLog.find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 100)
      .populate("deviceId", "name ip");

    return flows;
  }

  // Detect anomalies in traffic
  async detectAnomalies(deviceId) {
    const now = new Date();
    const baselineStart = new Date(now - 7 * 24 * 60 * 60 * 1000); // 7 days
    const recentStart = new Date(now - 60 * 60 * 1000); // Last hour

    // Get baseline statistics
    const [baseline, recent] = await Promise.all([
      TrafficLog.aggregate([
        { $match: { deviceId, timestamp: { $gte: baselineStart, $lt: recentStart } } },
        { $group: {
          _id: null,
          avgBytesPerHour: { $avg: "$bytes" },
          avgPacketsPerHour: { $avg: "$packets" }
        }}
      ]),
      TrafficLog.aggregate([
        { $match: { deviceId, timestamp: { $gte: recentStart } } },
        { $group: {
          _id: null,
          totalBytes: { $sum: "$bytes" },
          totalPackets: { $sum: "$packets" },
          uniqueDestinations: { $addToSet: "$destination.ip" }
        }}
      ])
    ]);

    const anomalies = [];
    const baselineData = baseline[0] || { avgBytesPerHour: 0, avgPacketsPerHour: 0 };
    const recentData = recent[0] || { totalBytes: 0, totalPackets: 0, uniqueDestinations: [] };

    // Check for traffic spike
    if (recentData.totalBytes > baselineData.avgBytesPerHour * 3) {
      anomalies.push({
        type: "traffic-spike",
        message: `Traffic volume 3x higher than baseline`,
        current: recentData.totalBytes,
        baseline: baselineData.avgBytesPerHour
      });
    }

    // Check for unusual destination count
    if (recentData.uniqueDestinations?.length > 100) {
      anomalies.push({
        type: "destination-scan",
        message: `Unusually high number of unique destinations (${recentData.uniqueDestinations.length})`,
        count: recentData.uniqueDestinations.length
      });
    }

    return anomalies;
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let value = bytes;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }
}

module.exports = new TrafficService();

/**
 * Alert Service
 * Manages network alerts and notifications
 */

const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { NetworkAlert, NetworkDevice } = require("../models");

class AlertService {
  constructor() {
    this.alertRules = new Map();
    this.suppressedAlerts = new Set();
  }

  // Create a new alert
  async createAlert(alertData) {
    // Check for duplicate/correlated alerts
    const existingAlert = await NetworkAlert.findOne({
      "source.ip": alertData.source?.ip,
      type: alertData.type,
      status: { $in: ["open", "acknowledged", "investigating"] },
      timestamp: { $gte: new Date(Date.now() - 3600000) } // Within last hour
    });

    if (existingAlert) {
      existingAlert.occurrenceCount += 1;
      existingAlert.lastOccurrence = new Date();
      await existingAlert.save();
      return existingAlert;
    }

    // Auto-generate alertId if not provided
    if (!alertData.alertId) {
      alertData.alertId = `ALERT-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    }

    const alert = new NetworkAlert({
      ...alertData,
      status: "open",
      timestamp: new Date()
    });

    await alert.save();

    // Send notifications based on severity
    if (["high", "critical"].includes(alert.severity)) {
      await this.sendNotifications(alert);
    }

    return alert;
  }

  // Get alerts with filtering
  async getAlerts(options = {}) {
    const query = {};
    
    if (options.severity) query.severity = options.severity;
    if (options.type) query.type = options.type;
    if (options.status) query.status = options.status;
    if (options.resolved !== undefined) query.resolved = options.resolved;
    if (options.sourceIp) query["source.ip"] = options.sourceIp;
    if (options.deviceId) query["source.deviceId"] = options.deviceId;
    
    if (options.startTime || options.endTime) {
      query.timestamp = {};
      if (options.startTime) query.timestamp.$gte = new Date(options.startTime);
      if (options.endTime) query.timestamp.$lte = new Date(options.endTime);
    }

    const alerts = await NetworkAlert.find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 100)
      .skip(options.offset || 0)
      .populate("source.deviceId", "name ip type");

    const total = await NetworkAlert.countDocuments(query);

    return { alerts, total };
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId, userId) {
    const alert = await NetworkAlert.findById(alertId);
    if (!alert) throw new Error("Alert not found");

    alert.status = "acknowledged";
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    await alert.save();

    return alert;
  }

  // Resolve an alert
  async resolveAlert(alertId, userId, resolution) {
    const alert = await NetworkAlert.findById(alertId);
    if (!alert) throw new Error("Alert not found");

    alert.status = "resolved";
    alert.resolved = true;
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();
    alert.resolution = resolution;
    await alert.save();

    return alert;
  }

  // Add note to alert
  async addNote(alertId, note, author) {
    const alert = await NetworkAlert.findById(alertId);
    if (!alert) throw new Error("Alert not found");

    alert.notes.push({
      text: note,
      author,
      timestamp: new Date()
    });
    await alert.save();

    return alert;
  }

  // Send notifications
  async sendNotifications(alert) {
    const channels = [];

    // Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await axios.post(process.env.SLACK_WEBHOOK_URL, {
          channel: process.env.SLACK_CHANNEL || "#network-alerts",
          username: "NetworkForensics",
          icon_emoji: ":warning:",
          attachments: [{
            color: alert.severity === "critical" ? "danger" : "warning",
            title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            text: alert.message,
            fields: [
              { title: "Type", value: alert.type, short: true },
              { title: "Source", value: alert.source?.ip || "Unknown", short: true }
            ],
            ts: Math.floor(Date.now() / 1000)
          }]
        });
        channels.push("slack");
      } catch (error) {
        console.error("Slack notification failed:", error.message);
      }
    }

    // PagerDuty for critical alerts
    if (process.env.PAGERDUTY_ROUTING_KEY && alert.severity === "critical") {
      try {
        await axios.post("https://events.pagerduty.com/v2/enqueue", {
          routing_key: process.env.PAGERDUTY_ROUTING_KEY,
          event_action: "trigger",
          payload: {
            summary: `${alert.title}: ${alert.message}`,
            severity: alert.severity,
            source: alert.source?.ip || "NetworkForensics",
            component: alert.type
          }
        });
        channels.push("pagerduty");
      } catch (error) {
        console.error("PagerDuty notification failed:", error.message);
      }
    }

    // Update alert with notification status
    alert.notifications = {
      sent: true,
      sentAt: new Date(),
      channels
    };
    await alert.save();

    return channels;
  }

  // Get alert statistics
  async getStats() {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      openCount,
      criticalCount,
      last24hCount,
      bySeverity,
      byType
    ] = await Promise.all([
      NetworkAlert.countDocuments({ status: { $in: ["open", "acknowledged"] } }),
      NetworkAlert.countDocuments({ severity: "critical", resolved: false }),
      NetworkAlert.countDocuments({ timestamp: { $gte: last24h } }),
      NetworkAlert.aggregate([
        { $match: { resolved: false } },
        { $group: { _id: "$severity", count: { $sum: 1 } } }
      ]),
      NetworkAlert.aggregate([
        { $match: { timestamp: { $gte: last7d } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      openAlerts: openCount,
      criticalAlerts: criticalCount,
      alertsLast24h: last24hCount,
      bySeverity: bySeverity.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      byType: byType.map(t => ({ type: t._id, count: t.count }))
    };
  }

  // Threshold-based alerting
  async checkThresholds(device, metrics) {
    const alerts = [];
    const thresholds = device.monitoring?.thresholds || {};

    // Check latency
    if (thresholds.latency && metrics.latency) {
      if (metrics.latency >= thresholds.latency.critical) {
        alerts.push({
          type: "latency",
          severity: "critical",
          title: `Critical latency on ${device.name}`,
          message: `Latency is ${metrics.latency}ms (threshold: ${thresholds.latency.critical}ms)`,
          source: { deviceId: device._id, ip: device.ip },
          threshold: { metric: "latency", value: metrics.latency, limit: thresholds.latency.critical, unit: "ms" }
        });
      } else if (metrics.latency >= thresholds.latency.warning) {
        alerts.push({
          type: "latency",
          severity: "medium",
          title: `High latency on ${device.name}`,
          message: `Latency is ${metrics.latency}ms (threshold: ${thresholds.latency.warning}ms)`,
          source: { deviceId: device._id, ip: device.ip },
          threshold: { metric: "latency", value: metrics.latency, limit: thresholds.latency.warning, unit: "ms" }
        });
      }
    }

    // Check packet loss
    if (thresholds.packetLoss && metrics.packetLoss) {
      if (metrics.packetLoss >= thresholds.packetLoss.critical) {
        alerts.push({
          type: "packet-loss",
          severity: "critical",
          title: `Critical packet loss on ${device.name}`,
          message: `Packet loss is ${metrics.packetLoss}% (threshold: ${thresholds.packetLoss.critical}%)`,
          source: { deviceId: device._id, ip: device.ip },
          threshold: { metric: "packetLoss", value: metrics.packetLoss, limit: thresholds.packetLoss.critical, unit: "%" }
        });
      }
    }

    // Create alerts
    for (const alertData of alerts) {
      await this.createAlert(alertData);
    }

    return alerts;
  }
}

module.exports = new AlertService();

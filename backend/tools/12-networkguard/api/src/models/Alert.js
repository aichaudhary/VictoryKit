/**
 * Alert Model
 * Network security alerts
 */

const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
  {
    network: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Network",
    },
    sensor: {
      id: String,
      name: String,
    },
    rule: {
      id: String,
      sid: Number,
      name: String,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "intrusion",
        "malware",
        "anomaly",
        "policy_violation",
        "reconnaissance",
        "exfiltration",
        "dos",
        "unauthorized_access",
        "other",
      ],
      default: "other",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    source: {
      ip: String,
      port: Number,
      mac: String,
      hostname: String,
      geoLocation: {
        country: String,
        city: String,
        latitude: Number,
        longitude: Number,
      },
    },
    destination: {
      ip: String,
      port: Number,
      mac: String,
      hostname: String,
    },
    protocol: {
      type: String,
      enum: [
        "TCP",
        "UDP",
        "ICMP",
        "HTTP",
        "HTTPS",
        "DNS",
        "SSH",
        "FTP",
        "SMTP",
        "OTHER",
      ],
      default: "OTHER",
    },
    payload: {
      raw: String,
      decoded: String,
      hexDump: String,
    },
    signature: {
      id: String,
      name: String,
      references: [String],
    },
    indicators: [
      {
        type: String,
        value: String,
        confidence: Number,
      },
    ],
    timeline: [
      {
        action: String,
        user: String,
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: [
        "new",
        "acknowledged",
        "investigating",
        "resolved",
        "false_positive",
      ],
      default: "new",
    },
    resolution: {
      action: String,
      notes: String,
      resolvedBy: String,
      resolvedAt: Date,
    },
    mlAnalysis: {
      classification: String,
      confidence: Number,
      threats: [String],
      recommendations: [String],
      analyzedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

AlertSchema.index({ severity: 1, status: 1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ "source.ip": 1 });
AlertSchema.index({ "destination.ip": 1 });

module.exports = mongoose.model("Alert", AlertSchema);

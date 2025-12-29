/**
 * Network Model
 * Represents monitored network segments
 */

const mongoose = require("mongoose");

const NetworkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["internal", "dmz", "external", "cloud", "hybrid"],
      default: "internal",
    },
    cidr: {
      type: String,
      required: true,
    },
    vlan: Number,
    gateway: String,
    dnsServers: [String],
    sensors: [
      {
        id: String,
        name: String,
        type: {
          type: String,
          enum: ["ids", "ips", "nta", "firewall", "proxy"],
        },
        ipAddress: String,
        status: {
          type: String,
          enum: ["active", "inactive", "error"],
          default: "active",
        },
        lastSeen: Date,
      },
    ],
    assets: [
      {
        ipAddress: String,
        hostname: String,
        macAddress: String,
        type: String,
        criticality: {
          type: String,
          enum: ["critical", "high", "medium", "low"],
          default: "medium",
        },
        lastSeen: Date,
        openPorts: [Number],
      },
    ],
    monitoring: {
      enabled: {
        type: Boolean,
        default: true,
      },
      mode: {
        type: String,
        enum: ["passive", "inline", "tap"],
        default: "passive",
      },
      captureTraffic: {
        type: Boolean,
        default: false,
      },
    },
    statistics: {
      totalAlerts: { type: Number, default: 0 },
      criticalAlerts: { type: Number, default: 0 },
      packetsAnalyzed: { type: Number, default: 0 },
      bandwidthUsage: Number,
      lastActivity: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

NetworkSchema.index({ cidr: 1 });
NetworkSchema.index({ status: 1 });

module.exports = mongoose.model("Network", NetworkSchema);

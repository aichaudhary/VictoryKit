/**
 * Attack Model - DDoS attack records
 */

const mongoose = require("mongoose");

const attackSchema = new mongoose.Schema(
  {
    attackId: {
      type: String,
      unique: true,
      default: () =>
        `ATK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: String,
      enum: [
        "volumetric", // Bandwidth flooding
        "protocol", // SYN flood, UDP flood
        "application", // HTTP flood, Slowloris
        "amplification", // DNS, NTP amplification
        "multi_vector", // Combined attack
        "unknown",
      ],
      required: true,
    },
    subType: {
      type: String,
      enum: [
        // Volumetric
        "udp_flood",
        "icmp_flood",
        "dns_amplification",
        "ntp_amplification",
        // Protocol
        "syn_flood",
        "ack_flood",
        "rst_flood",
        "fragmentation",
        // Application
        "http_flood",
        "https_flood",
        "slowloris",
        "slow_post",
        "cache_bypass",
        // Other
        "mixed",
        "unknown",
      ],
    },
    target: {
      type: {
        type: String,
        enum: ["ip", "domain", "service", "infrastructure"],
      },
      value: String,
      port: Number,
      protocol: String,
    },
    source: {
      totalIps: { type: Number, default: 0 },
      topIps: [String],
      countries: [
        {
          code: String,
          count: Number,
          percentage: Number,
        },
      ],
      asns: [
        {
          asn: String,
          organization: String,
          count: Number,
        },
      ],
      isDistributed: { type: Boolean, default: false },
    },
    metrics: {
      peakBandwidth: {
        value: Number,
        unit: { type: String, enum: ["bps", "kbps", "mbps", "gbps", "tbps"] },
      },
      peakPackets: {
        value: Number,
        unit: { type: String, enum: ["pps", "kpps", "mpps"] },
      },
      peakRequests: {
        value: Number,
        unit: { type: String, enum: ["rps", "krps"] },
      },
      totalData: {
        value: Number,
        unit: { type: String, enum: ["bytes", "kb", "mb", "gb", "tb"] },
      },
      duration: Number, // seconds
    },
    timeline: {
      detected: Date,
      started: Date,
      peaked: Date,
      mitigated: Date,
      ended: Date,
    },
    detection: {
      method: {
        type: String,
        enum: ["threshold", "anomaly", "signature", "ml", "manual"],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      signals: [
        {
          signal: String,
          value: mongoose.Schema.Types.Mixed,
          weight: Number,
        },
      ],
    },
    mitigation: {
      status: {
        type: String,
        enum: ["pending", "active", "completed", "failed"],
        default: "pending",
      },
      actions: [
        {
          action: String,
          target: String,
          timestamp: Date,
          result: String,
        },
      ],
      effectiveness: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    impact: {
      availability: {
        type: Number,
        min: 0,
        max: 100,
      },
      latency: {
        before: Number,
        during: Number,
        unit: { type: String, default: "ms" },
      },
      droppedRequests: Number,
      affectedUsers: Number,
    },
    status: {
      type: String,
      enum: [
        "detected",
        "active",
        "mitigating",
        "mitigated",
        "ended",
        "false_positive",
      ],
      default: "detected",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attackSchema.index({ status: 1 });
attackSchema.index({ type: 1 });
attackSchema.index({ "timeline.detected": -1 });
attackSchema.index({ "target.value": 1 });

module.exports = mongoose.model("Attack", attackSchema);

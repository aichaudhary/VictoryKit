/**
 * Traffic Model - Network traffic records
 */

const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    interval: {
      type: String,
      enum: ["1m", "5m", "15m", "1h", "1d"],
      default: "1m",
    },
    metrics: {
      bandwidth: {
        inbound: Number,
        outbound: Number,
        unit: { type: String, default: "mbps" },
      },
      packets: {
        inbound: Number,
        outbound: Number,
        unit: { type: String, default: "kpps" },
      },
      requests: {
        total: Number,
        successful: Number,
        failed: Number,
        rate: Number,
      },
      connections: {
        active: Number,
        new: Number,
        closed: Number,
      },
      latency: {
        avg: Number,
        p50: Number,
        p95: Number,
        p99: Number,
        unit: { type: String, default: "ms" },
      },
    },
    breakdown: {
      byProtocol: [
        {
          protocol: String,
          bytes: Number,
          packets: Number,
          percentage: Number,
        },
      ],
      byPort: [
        {
          port: Number,
          bytes: Number,
          packets: Number,
        },
      ],
      byCountry: [
        {
          country: String,
          requests: Number,
          bytes: Number,
        },
      ],
    },
    anomalies: {
      detected: { type: Boolean, default: false },
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      signals: [String],
    },
    baseline: {
      isBaseline: { type: Boolean, default: false },
      deviationFromBaseline: Number,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - auto-delete after 30 days
trafficSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Compound indexes
trafficSchema.index({ timestamp: 1, interval: 1 });

module.exports = mongoose.model("Traffic", trafficSchema);

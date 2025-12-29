/**
 * Protection Model - DDoS protection rules
 */

const mongoose = require("mongoose");

const protectionSchema = new mongoose.Schema(
  {
    protectionId: {
      type: String,
      unique: true,
      default: () =>
        `PROT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "rate_limit", // Request rate limiting
        "geo_block", // Geographic blocking
        "ip_block", // IP/CIDR blocking
        "asn_block", // ASN blocking
        "challenge", // JS challenge
        "scrubbing", // Traffic scrubbing
        "blackhole", // Blackhole routing
        "cdn_shield", // CDN-based protection
        "custom",
      ],
      required: true,
    },
    scope: {
      type: {
        type: String,
        enum: ["global", "domain", "path", "ip_range"],
      },
      targets: [String],
    },
    configuration: {
      // Rate limiting
      rateLimit: {
        requests: Number,
        period: Number, // seconds
        burstSize: Number,
      },
      // Geo blocking
      geoBlock: {
        countries: [String],
        action: { type: String, enum: ["block", "challenge", "log"] },
      },
      // IP blocking
      ipBlock: {
        ips: [String],
        cidrs: [String],
      },
      // ASN blocking
      asnBlock: {
        asns: [String],
      },
      // Challenge
      challenge: {
        type: {
          type: String,
          enum: ["javascript", "captcha", "proof_of_work"],
        },
        difficulty: Number,
        validityPeriod: Number,
      },
      // Thresholds
      thresholds: {
        bandwidth: { value: Number, unit: String },
        packets: { value: Number, unit: String },
        requests: { value: Number, unit: String },
        connections: Number,
      },
    },
    triggers: {
      automatic: { type: Boolean, default: true },
      conditions: [
        {
          metric: String,
          operator: { type: String, enum: ["gt", "gte", "lt", "lte", "eq"] },
          value: Number,
        },
      ],
      attackTypes: [String],
    },
    actions: {
      primary: {
        type: String,
        enum: [
          "block",
          "rate_limit",
          "challenge",
          "redirect",
          "scrub",
          "alert",
        ],
      },
      secondary: String,
      logging: { type: Boolean, default: true },
      alerting: { type: Boolean, default: true },
    },
    statistics: {
      activations: { type: Number, default: 0 },
      blockedRequests: { type: Number, default: 0 },
      mitigatedAttacks: { type: Number, default: 0 },
      lastActivated: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "testing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
protectionSchema.index({ type: 1 });
protectionSchema.index({ status: 1 });

module.exports = mongoose.model("Protection", protectionSchema);

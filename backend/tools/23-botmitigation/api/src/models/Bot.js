/**
 * Bot Model - Detected bot entities
 */

const mongoose = require("mongoose");

const botSchema = new mongoose.Schema(
  {
    botId: {
      type: String,
      unique: true,
      default: () =>
        `BOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    classification: {
      type: {
        type: String,
        enum: ["good", "bad", "unknown"],
        default: "unknown",
      },
      category: {
        type: String,
        enum: [
          "search_engine", // Googlebot, Bingbot
          "social_media", // Facebook, Twitter crawlers
          "monitoring", // Uptime, SEO tools
          "scraper", // Content scrapers
          "credential_stuffer", // Login attacks
          "card_cracker", // Payment fraud
          "spam", // Comment/form spam
          "scanner", // Vulnerability scanners
          "api_abuser", // API exploitation
          "click_fraud", // Ad fraud
          "custom",
        ],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    identification: {
      userAgent: String,
      ipAddresses: [String],
      fingerprint: String,
      asn: {
        number: String,
        organization: String,
      },
      datacenter: Boolean,
      proxy: Boolean,
      vpn: Boolean,
      tor: Boolean,
    },
    behavior: {
      requestRate: {
        type: Number,
        default: 0,
      },
      requestPattern: {
        type: String,
        enum: ["regular", "burst", "distributed", "sequential", "random"],
        default: "regular",
      },
      targetedPaths: [String],
      averageSessionDuration: Number,
      pagesPerSession: Number,
      mouseMovement: Boolean,
      keyboardInput: Boolean,
      scrollBehavior: Boolean,
    },
    detection: {
      method: {
        type: String,
        enum: [
          "behavioral",
          "fingerprint",
          "reputation",
          "ml_model",
          "rule",
          "challenge_failed",
          "manual",
        ],
        default: "behavioral",
      },
      signals: [
        {
          signal: String,
          weight: Number,
          value: mongoose.Schema.Types.Mixed,
        },
      ],
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      firstDetected: Date,
      lastSeen: Date,
    },
    action: {
      current: {
        type: String,
        enum: ["allow", "challenge", "rate_limit", "block", "monitor"],
        default: "monitor",
      },
      history: [
        {
          action: String,
          reason: String,
          timestamp: Date,
          performedBy: String,
        },
      ],
    },
    statistics: {
      totalRequests: { type: Number, default: 0 },
      blockedRequests: { type: Number, default: 0 },
      challengesPassed: { type: Number, default: 0 },
      challengesFailed: { type: Number, default: 0 },
    },
    metadata: {
      source: String,
      tags: [String],
      notes: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked", "allowed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
botSchema.index({ "identification.ipAddresses": 1 });
botSchema.index({ "identification.fingerprint": 1 });
botSchema.index({ "classification.type": 1 });
botSchema.index({ "detection.score": -1 });
botSchema.index({ status: 1 });

module.exports = mongoose.model("Bot", botSchema);

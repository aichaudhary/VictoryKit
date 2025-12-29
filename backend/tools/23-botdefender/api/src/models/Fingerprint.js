/**
 * Fingerprint Model - Browser/device fingerprints
 */

const mongoose = require("mongoose");

const fingerprintSchema = new mongoose.Schema(
  {
    fingerprintId: {
      type: String,
      unique: true,
      default: () =>
        `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    components: {
      // Browser
      userAgent: String,
      browser: {
        name: String,
        version: String,
        engine: String,
      },
      // OS
      os: {
        name: String,
        version: String,
      },
      // Device
      device: {
        type: {
          type: String,
          enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
        },
        vendor: String,
        model: String,
      },
      // Screen
      screen: {
        width: Number,
        height: Number,
        colorDepth: Number,
        pixelRatio: Number,
      },
      // Canvas
      canvas: {
        hash: String,
        supported: Boolean,
      },
      // WebGL
      webgl: {
        vendor: String,
        renderer: String,
        hash: String,
      },
      // Audio
      audio: {
        hash: String,
        supported: Boolean,
      },
      // Fonts
      fonts: [String],
      fontsHash: String,
      // Plugins
      plugins: [String],
      pluginsHash: String,
      // Timezone
      timezone: String,
      timezoneOffset: Number,
      // Language
      language: String,
      languages: [String],
      // Hardware
      hardwareConcurrency: Number,
      deviceMemory: Number,
      // Features
      features: {
        cookies: Boolean,
        localStorage: Boolean,
        sessionStorage: Boolean,
        indexedDB: Boolean,
        webSockets: Boolean,
        webRTC: Boolean,
        adBlocker: Boolean,
        doNotTrack: Boolean,
        touchSupport: Boolean,
      },
    },
    analysis: {
      isBot: {
        type: Boolean,
        default: false,
      },
      botProbability: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      isInconsistent: Boolean,
      inconsistencies: [String],
      isEmulated: Boolean,
      emulationSignals: [String],
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low",
      },
    },
    associations: {
      ipAddresses: [String],
      userIds: [String],
      sessions: [String],
      bots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bot" }],
    },
    statistics: {
      firstSeen: Date,
      lastSeen: Date,
      totalVisits: { type: Number, default: 0 },
      uniqueIps: { type: Number, default: 0 },
    },
    flags: {
      isFlagged: { type: Boolean, default: false },
      reason: String,
      flaggedAt: Date,
      flaggedBy: String,
    },
    status: {
      type: String,
      enum: ["active", "flagged", "blocked", "trusted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
fingerprintSchema.index({ hash: 1 });
fingerprintSchema.index({ "analysis.isBot": 1 });
fingerprintSchema.index({ "analysis.riskLevel": 1 });
fingerprintSchema.index({ status: 1 });

module.exports = mongoose.model("Fingerprint", fingerprintSchema);

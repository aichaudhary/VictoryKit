/**
 * Blocklist Model - Blocked IPs and ranges
 */

const mongoose = require("mongoose");

const blocklistSchema = new mongoose.Schema(
  {
    entryId: {
      type: String,
      unique: true,
      default: () =>
        `BLK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    type: {
      type: String,
      enum: ["ip", "cidr", "asn", "country", "user_agent"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      enum: ["ddos_attack", "bot", "abuse", "scanner", "manual", "feed"],
      default: "manual",
    },
    source: {
      type: {
        type: String,
        enum: ["automatic", "manual", "threat_feed", "ml"],
      },
      reference: String,
      attack: { type: mongoose.Schema.Types.ObjectId, ref: "Attack" },
    },
    details: {
      description: String,
      country: String,
      asn: String,
      organization: String,
    },
    statistics: {
      blockedRequests: { type: Number, default: 0 },
      lastBlocked: Date,
    },
    expiration: {
      temporary: { type: Boolean, default: false },
      expiresAt: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
blocklistSchema.index({ type: 1, value: 1 }, { unique: true });
blocklistSchema.index({ status: 1 });
blocklistSchema.index({ "expiration.expiresAt": 1 });

module.exports = mongoose.model("Blocklist", blocklistSchema);

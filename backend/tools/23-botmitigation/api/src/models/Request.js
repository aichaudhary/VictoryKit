/**
 * Request Model - HTTP requests for analysis
 */

const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      default: () =>
        `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    // Request details
    request: {
      method: String,
      path: String,
      host: String,
      protocol: String,
      headers: mongoose.Schema.Types.Mixed,
      query: mongoose.Schema.Types.Mixed,
      body: mongoose.Schema.Types.Mixed,
    },
    // Client info
    client: {
      ip: String,
      country: String,
      region: String,
      city: String,
      asn: String,
      organization: String,
      userAgent: String,
      fingerprint: String,
    },
    // Detection results
    detection: {
      isBot: Boolean,
      botScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      botType: String,
      signals: [
        {
          signal: String,
          value: mongoose.Schema.Types.Mixed,
          contribution: Number,
        },
      ],
      method: String,
    },
    // Action taken
    action: {
      type: {
        type: String,
        enum: ["allowed", "blocked", "challenged", "rate_limited", "logged"],
      },
      reason: String,
      rule: String,
    },
    // Challenge info if issued
    challenge: {
      issued: Boolean,
      type: String,
      result: {
        type: String,
        enum: ["pending", "passed", "failed", "expired"],
      },
      attempts: Number,
    },
    // Response info
    response: {
      statusCode: Number,
      latency: Number,
    },
    // Related entities
    associations: {
      bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot" },
      fingerprint: { type: mongoose.Schema.Types.ObjectId, ref: "Fingerprint" },
      session: String,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index - auto-delete after 30 days
requestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Query indexes
requestSchema.index({ "client.ip": 1 });
requestSchema.index({ "detection.isBot": 1 });
requestSchema.index({ "action.type": 1 });
requestSchema.index({ "request.path": 1 });

module.exports = mongoose.model("Request", requestSchema);

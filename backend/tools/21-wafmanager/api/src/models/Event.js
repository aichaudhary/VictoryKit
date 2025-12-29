const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
    },
    instanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WAFInstance",
    },
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rule",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    request: {
      ip: String,
      country: String,
      method: String,
      uri: String,
      headers: mongoose.Schema.Types.Mixed,
      queryString: String,
      body: String,
      userAgent: String,
    },
    matchedRules: [
      {
        ruleId: String,
        ruleName: String,
        action: String,
        matchDetails: mongoose.Schema.Types.Mixed,
      },
    ],
    action: {
      type: String,
      enum: ["blocked", "allowed", "challenged", "logged"],
    },
    responseCode: Number,
    labels: [String],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      enum: [
        "sqli",
        "xss",
        "rce",
        "lfi",
        "bot",
        "rate_limit",
        "geo",
        "custom",
        "unknown",
      ],
    },
    falsePositive: {
      type: Boolean,
      default: false,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: String,
    reviewedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Generate event ID
eventSchema.pre("save", function (next) {
  if (!this.eventId) {
    this.eventId = "EVT-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Indexes
eventSchema.index({ eventId: 1 });
eventSchema.index({ instanceId: 1 });
eventSchema.index({ timestamp: -1 });
eventSchema.index({ action: 1 });
eventSchema.index({ "request.ip": 1 });

module.exports = mongoose.model("Event", eventSchema);

/**
 * AuditTrailPro - AlertRule Model
 */

const mongoose = require("mongoose");

const alertRuleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  condition: {
    field: String,
    operator: {
      type: String,
      enum: [
        "equals",
        "not_equals",
        "contains",
        "regex",
        "greater_than",
        "less_than",
        "in",
        "not_in",
      ],
    },
    value: mongoose.Schema.Types.Mixed,
    // Complex conditions
    and: [mongoose.Schema.Types.Mixed],
    or: [mongoose.Schema.Types.Mixed],
  },
  eventTypes: [
    {
      type: String,
    },
  ],
  threshold: {
    count: Number,
    timeWindow: Number, // in minutes
    groupBy: String,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  actions: [
    {
      type: {
        type: String,
        enum: ["email", "slack", "webhook", "sms", "pagerduty", "log"],
      },
      target: String,
      template: String,
    },
  ],
  cooldown: {
    type: Number, // minutes before re-alerting
    default: 15,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  statistics: {
    totalTriggers: { type: Number, default: 0 },
    lastTriggered: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

alertRuleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

alertRuleSchema.index({ ruleId: 1 });
alertRuleSchema.index({ isActive: 1, severity: 1 });

module.exports = mongoose.model("AlertRule", alertRuleSchema);

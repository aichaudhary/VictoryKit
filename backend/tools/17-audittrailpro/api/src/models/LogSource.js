/**
 * AuditTrailPro - LogSource Model
 */

const mongoose = require("mongoose");

const logSourceSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "application",
      "database",
      "system",
      "network",
      "security",
      "cloud",
      "custom",
    ],
    required: true,
  },
  protocol: {
    type: String,
    enum: [
      "syslog",
      "http",
      "tcp",
      "udp",
      "kafka",
      "aws_cloudwatch",
      "azure_monitor",
      "custom",
    ],
    default: "http",
  },
  endpoint: String,
  configuration: {
    format: String,
    parser: String,
    filters: [String],
    transform: mongoose.Schema.Types.Mixed,
  },
  credentials: {
    type: {
      type: String,
      enum: ["none", "api_key", "basic", "oauth", "certificate"],
    },
    encrypted: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "error", "configuring"],
    default: "active",
  },
  healthCheck: {
    lastCheck: Date,
    status: String,
    latency: Number,
  },
  statistics: {
    totalLogs: { type: Number, default: 0 },
    lastLogReceived: Date,
    logsPerDay: { type: Number, default: 0 },
  },
  retentionDays: {
    type: Number,
    default: 90,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

logSourceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

logSourceSchema.index({ sourceId: 1 });
logSourceSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("LogSource", logSourceSchema);

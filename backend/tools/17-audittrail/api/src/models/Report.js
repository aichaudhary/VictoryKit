/**
 * AuditTrail - Report Model
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ["compliance", "security", "activity", "custom"],
    default: "activity",
  },
  template: {
    type: String,
    enum: [
      "soc2",
      "hipaa",
      "gdpr",
      "pci_dss",
      "iso27001",
      "user_activity",
      "access_review",
      "custom",
    ],
    default: "custom",
  },
  parameters: {
    dateRange: {
      start: Date,
      end: Date,
    },
    filters: mongoose.Schema.Types.Mixed,
    groupBy: [String],
    includeDetails: { type: Boolean, default: true },
  },
  schedule: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly"],
    },
    dayOfWeek: Number,
    dayOfMonth: Number,
    time: String,
    timezone: String,
  },
  recipients: [
    {
      email: String,
      name: String,
    },
  ],
  format: {
    type: String,
    enum: ["pdf", "csv", "json", "html"],
    default: "pdf",
  },
  lastGenerated: Date,
  lastResult: {
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
    },
    recordCount: Number,
    fileUrl: String,
    error: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

reportSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

reportSchema.index({ reportId: 1 });
reportSchema.index({ type: 1, template: 1 });

module.exports = mongoose.model("Report", reportSchema);

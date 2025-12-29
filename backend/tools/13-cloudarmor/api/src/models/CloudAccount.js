/**
 * CloudAccount Model
 * Cloud provider accounts being monitored
 */

const mongoose = require("mongoose");

const CloudAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["aws", "azure", "gcp", "oci", "alibaba"],
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ["production", "staging", "development", "sandbox"],
      default: "production",
    },
    credentials: {
      type: {
        type: String,
        enum: ["role", "key", "service_account", "managed_identity"],
      },
      roleArn: String,
      externalId: String,
      accessKeyId: String,
      secretAccessKey: String,
      projectId: String,
      tenantId: String,
      subscriptionId: String,
      encrypted: { type: Boolean, default: true },
    },
    regions: [String],
    tags: mongoose.Schema.Types.Mixed,
    scanning: {
      enabled: { type: Boolean, default: true },
      schedule: { type: String, default: "0 */6 * * *" },
      lastScan: Date,
      nextScan: Date,
      status: {
        type: String,
        enum: ["idle", "scanning", "completed", "failed"],
        default: "idle",
      },
    },
    statistics: {
      resources: { type: Number, default: 0 },
      criticalFindings: { type: Number, default: 0 },
      highFindings: { type: Number, default: 0 },
      mediumFindings: { type: Number, default: 0 },
      lowFindings: { type: Number, default: 0 },
      complianceScore: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

CloudAccountSchema.index({ provider: 1, accountId: 1 }, { unique: true });

module.exports = mongoose.model("CloudAccount", CloudAccountSchema);

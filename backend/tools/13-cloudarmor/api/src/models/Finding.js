/**
 * Finding Model
 * Security misconfigurations and vulnerabilities
 */

const mongoose = require("mongoose");

const FindingSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudAccount",
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudResource",
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "public_exposure",
        "encryption",
        "access_control",
        "logging",
        "network",
        "data_protection",
        "identity",
        "configuration",
        "vulnerability",
        "other",
      ],
      default: "configuration",
    },
    compliance: [
      {
        framework: String,
        control: String,
        requirement: String,
      },
    ],
    details: {
      expected: mongoose.Schema.Types.Mixed,
      actual: mongoose.Schema.Types.Mixed,
      evidence: String,
    },
    remediation: {
      description: String,
      steps: [String],
      automated: { type: Boolean, default: false },
      script: String,
      estimatedEffort: String,
    },
    status: {
      type: String,
      enum: [
        "open",
        "in_progress",
        "remediated",
        "suppressed",
        "false_positive",
      ],
      default: "open",
    },
    suppression: {
      reason: String,
      suppressedBy: String,
      suppressedAt: Date,
      expiresAt: Date,
    },
    firstDetected: Date,
    lastDetected: Date,
    mlAnalysis: {
      riskScore: Number,
      exploitability: String,
      impact: String,
      recommendations: [String],
      analyzedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

FindingSchema.index({ severity: 1, status: 1 });
FindingSchema.index({ account: 1 });
FindingSchema.index({ resource: 1 });
FindingSchema.index({ category: 1 });

module.exports = mongoose.model("Finding", FindingSchema);

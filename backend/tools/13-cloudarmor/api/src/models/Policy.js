/**
 * Policy Model
 * Security policies for cloud resources
 */

const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    provider: {
      type: String,
      enum: ["aws", "azure", "gcp", "all"],
      default: "all",
    },
    category: {
      type: String,
      enum: [
        "access_control",
        "encryption",
        "network",
        "logging",
        "data_protection",
        "identity",
        "compliance",
        "custom",
      ],
      default: "custom",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    resourceTypes: [String],
    conditions: [
      {
        field: String,
        operator: {
          type: String,
          enum: [
            "equals",
            "not_equals",
            "contains",
            "not_contains",
            "exists",
            "not_exists",
            "greater_than",
            "less_than",
          ],
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    remediation: {
      description: String,
      steps: [String],
      autoRemediate: { type: Boolean, default: false },
    },
    compliance: [
      {
        framework: String,
        control: String,
      },
    ],
    enabled: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["builtin", "custom", "cis", "nist", "soc2"],
      default: "custom",
    },
    statistics: {
      evaluations: { type: Number, default: 0 },
      violations: { type: Number, default: 0 },
      lastEvaluated: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Policy", PolicySchema);

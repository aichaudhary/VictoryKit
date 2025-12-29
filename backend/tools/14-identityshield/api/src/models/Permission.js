/**
 * IdentityShield - Permission Model
 */

const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    default: "*",
  },
  provider: {
    type: String,
    enum: ["aws", "azure", "gcp", "okta", "custom"],
    default: "aws",
  },
  service: String,
  effect: {
    type: String,
    enum: ["allow", "deny"],
    default: "allow",
  },
  conditions: [
    {
      key: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
    },
  ],
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },
  isPrivileged: {
    type: Boolean,
    default: false,
  },
  isSensitive: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: [
      "read",
      "write",
      "delete",
      "admin",
      "security",
      "billing",
      "network",
    ],
    default: "read",
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  lastUsed: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

permissionSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Auto-detect privileged permissions
  const privilegedActions = ["*", "iam:*", "sts:AssumeRole", "organizations:*"];
  this.isPrivileged = privilegedActions.some((a) => this.action.includes(a));

  // Auto-detect sensitive permissions
  const sensitiveActions = ["kms:", "secretsmanager:", "ssm:GetParameter"];
  this.isSensitive = sensitiveActions.some((a) => this.action.includes(a));

  next();
});

permissionSchema.index({ action: 1 });
permissionSchema.index({ isPrivileged: 1 });
permissionSchema.index({ lastUsed: 1 });

module.exports = mongoose.model("Permission", permissionSchema);

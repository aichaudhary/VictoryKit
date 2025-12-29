/**
 * IdentityShield - Role Model
 */

const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  provider: {
    type: String,
    enum: ["aws", "azure", "gcp", "okta", "active_directory", "custom"],
    default: "aws",
  },
  externalId: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    enum: ["system", "custom", "service", "cross_account"],
    default: "custom",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deprecated"],
    default: "active",
  },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
  policies: [
    {
      policyId: String,
      policyName: String,
      policyType: { type: String, enum: ["managed", "inline", "custom"] },
    },
  ],
  trustPolicy: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  assumableBy: [
    {
      principalType: String,
      principalId: String,
      conditions: mongoose.Schema.Types.Mixed,
    },
  ],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  riskFactors: [
    {
      factor: String,
      severity: String,
      description: String,
    },
  ],
  memberCount: {
    type: Number,
    default: 0,
  },
  lastUsed: Date,
  lastAnalyzed: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

roleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

roleSchema.index({ name: 1, provider: 1 });
roleSchema.index({ riskScore: -1 });

module.exports = mongoose.model("Role", roleSchema);

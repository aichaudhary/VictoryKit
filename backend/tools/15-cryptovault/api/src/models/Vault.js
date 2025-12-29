/**
 * CryptoVault - Vault Model
 */

const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: String,
  provider: {
    type: String,
    enum: ["aws", "azure", "gcp", "hashicorp", "local"],
    default: "aws",
  },
  region: String,
  status: {
    type: String,
    enum: ["active", "inactive", "sealed", "initializing"],
    default: "active",
  },
  type: {
    type: String,
    enum: ["key_vault", "secret_vault", "certificate_vault", "mixed"],
    default: "mixed",
  },
  configuration: {
    softDeleteEnabled: { type: Boolean, default: true },
    purgeProtection: { type: Boolean, default: false },
    retentionDays: { type: Number, default: 90 },
    networkAcls: {
      defaultAction: { type: String, enum: ["allow", "deny"], default: "deny" },
      ipRules: [String],
      virtualNetworkRules: [String],
    },
  },
  accessPolicy: {
    type: {
      type: String,
      enum: ["vault_access_policy", "rbac"],
      default: "rbac",
    },
    policies: [
      {
        principalId: String,
        principalType: String,
        permissions: {
          keys: [String],
          secrets: [String],
          certificates: [String],
        },
      },
    ],
  },
  statistics: {
    keyCount: { type: Number, default: 0 },
    secretCount: { type: Number, default: 0 },
    certificateCount: { type: Number, default: 0 },
    totalOperations: { type: Number, default: 0 },
  },
  compliance: {
    frameworks: [String],
    lastAudit: Date,
    auditStatus: {
      type: String,
      enum: ["compliant", "non_compliant", "pending"],
      default: "pending",
    },
  },
  encryption: {
    type: {
      type: String,
      enum: ["service_managed", "customer_managed"],
      default: "service_managed",
    },
    keyId: String,
  },
  tags: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

vaultSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

vaultSchema.index({ name: 1 });
vaultSchema.index({ provider: 1 });
vaultSchema.index({ status: 1 });

module.exports = mongoose.model("Vault", vaultSchema);

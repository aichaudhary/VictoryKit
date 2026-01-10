/**
 * PrivilegeGuard - Secret Model
 */

const mongoose = require("mongoose");

const secretSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  type: {
    type: String,
    enum: [
      "api_key",
      "database_credential",
      "oauth_token",
      "ssh_key",
      "password",
      "certificate",
      "generic",
    ],
    default: "generic",
  },
  provider: {
    type: String,
    enum: [
      "aws_secretsmanager",
      "azure_keyvault",
      "hashicorp_vault",
      "gcp_secretmanager",
      "local",
    ],
    default: "aws_secretsmanager",
  },
  externalId: String,
  status: {
    type: String,
    enum: ["active", "inactive", "pending_deletion", "deleted"],
    default: "active",
  },
  value: {
    encrypted: { type: Boolean, default: true },
    encryptionKeyId: String,
    // Note: actual secret value is stored encrypted in the provider
    placeholder: { type: String, default: "********" },
  },
  version: {
    current: { type: String, default: "v1" },
    count: { type: Number, default: 1 },
  },
  rotation: {
    enabled: { type: Boolean, default: false },
    intervalDays: { type: Number, default: 30 },
    lastRotated: Date,
    nextRotation: Date,
    rotationLambdaArn: String,
  },
  accessPolicy: {
    allowedPrincipals: [String],
    allowedServices: [String],
    conditions: mongoose.Schema.Types.Mixed,
  },
  usage: {
    accessCount: { type: Number, default: 0 },
    lastAccessed: Date,
    lastAccessedBy: String,
  },
  metadata: {
    application: String,
    environment: String,
    owner: String,
    tags: { type: Map, of: String },
  },
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
  vault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

secretSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Calculate next rotation date
  if (this.rotation.enabled && this.rotation.lastRotated) {
    const nextRotation = new Date(this.rotation.lastRotated);
    nextRotation.setDate(nextRotation.getDate() + this.rotation.intervalDays);
    this.rotation.nextRotation = nextRotation;
  }

  next();
});

secretSchema.index({ name: 1, provider: 1 });
secretSchema.index({ type: 1 });
secretSchema.index({ status: 1 });
secretSchema.index({ "metadata.application": 1 });

module.exports = mongoose.model("Secret", secretSchema);

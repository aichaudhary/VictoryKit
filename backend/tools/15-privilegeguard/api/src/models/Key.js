/**
 * PrivilegeGuard - Key Model
 */

const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  alias: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: String,
  keyType: {
    type: String,
    enum: ["symmetric", "asymmetric", "hmac"],
    default: "symmetric",
  },
  algorithm: {
    type: String,
    enum: [
      "AES-256",
      "AES-128",
      "RSA-2048",
      "RSA-4096",
      "ECDSA-P256",
      "ECDSA-P384",
      "HMAC-SHA256",
    ],
    default: "AES-256",
  },
  provider: {
    type: String,
    enum: ["aws_kms", "azure_keyvault", "gcp_kms", "hashicorp_vault", "local"],
    default: "aws_kms",
  },
  externalId: String,
  status: {
    type: String,
    enum: [
      "active",
      "inactive",
      "pending_deletion",
      "deleted",
      "pending_import",
    ],
    default: "active",
  },
  purpose: {
    type: String,
    enum: ["encrypt_decrypt", "sign_verify", "wrap_unwrap", "generate_mac"],
    default: "encrypt_decrypt",
  },
  keyMaterial: {
    origin: {
      type: String,
      enum: ["aws_kms", "external", "custom"],
      default: "aws_kms",
    },
    expirationModel: {
      type: String,
      enum: ["key_material_expires", "key_material_does_not_expire"],
    },
    expirationDate: Date,
  },
  rotation: {
    enabled: { type: Boolean, default: true },
    intervalDays: { type: Number, default: 365 },
    lastRotated: Date,
    nextRotation: Date,
  },
  policy: {
    allowedOperations: [String],
    allowedPrincipals: [String],
    conditions: mongoose.Schema.Types.Mixed,
  },
  usage: {
    encryptCount: { type: Number, default: 0 },
    decryptCount: { type: Number, default: 0 },
    lastUsed: Date,
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  tags: {
    type: Map,
    of: String,
  },
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

keySchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Calculate next rotation date
  if (this.rotation.enabled && this.rotation.lastRotated) {
    const nextRotation = new Date(this.rotation.lastRotated);
    nextRotation.setDate(nextRotation.getDate() + this.rotation.intervalDays);
    this.rotation.nextRotation = nextRotation;
  }

  next();
});

keySchema.index({ name: 1, provider: 1 });
keySchema.index({ status: 1 });
keySchema.index({ "rotation.nextRotation": 1 });

module.exports = mongoose.model("Key", keySchema);

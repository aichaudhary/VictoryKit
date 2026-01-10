/**
 * PrivilegeGuard - Certificate Model
 */

const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  commonName: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: [
      "ssl_tls",
      "code_signing",
      "client_auth",
      "email",
      "root_ca",
      "intermediate_ca",
    ],
    default: "ssl_tls",
  },
  provider: {
    type: String,
    enum: ["aws_acm", "azure_keyvault", "lets_encrypt", "digicert", "custom"],
    default: "aws_acm",
  },
  externalId: String,
  status: {
    type: String,
    enum: ["active", "pending", "expired", "revoked", "failed"],
    default: "pending",
  },
  subject: {
    commonName: String,
    organization: String,
    organizationalUnit: String,
    country: String,
    state: String,
    locality: String,
  },
  issuer: {
    commonName: String,
    organization: String,
  },
  serialNumber: String,
  validity: {
    notBefore: Date,
    notAfter: Date,
    daysRemaining: Number,
  },
  domains: [
    {
      name: String,
      type: { type: String, enum: ["primary", "san"] },
    },
  ],
  keyAlgorithm: {
    type: String,
    enum: ["RSA-2048", "RSA-4096", "ECDSA-P256", "ECDSA-P384"],
    default: "RSA-2048",
  },
  signatureAlgorithm: String,
  fingerprint: {
    sha1: String,
    sha256: String,
  },
  chain: [
    {
      subject: String,
      issuer: String,
      serialNumber: String,
    },
  ],
  autoRenewal: {
    enabled: { type: Boolean, default: true },
    daysBeforeExpiry: { type: Number, default: 30 },
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastValidated: Date,
  validationErrors: [String],
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

certificateSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Calculate days remaining
  if (this.validity && this.validity.notAfter) {
    const now = new Date();
    const expiry = new Date(this.validity.notAfter);
    this.validity.daysRemaining = Math.ceil(
      (expiry - now) / (1000 * 60 * 60 * 24)
    );

    if (this.validity.daysRemaining <= 0) {
      this.status = "expired";
    }
  }

  next();
});

certificateSchema.index({ commonName: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ "validity.notAfter": 1 });

module.exports = mongoose.model("Certificate", certificateSchema);

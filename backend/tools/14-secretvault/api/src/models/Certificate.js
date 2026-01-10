/**
 * Certificate Model
 * Manages X.509 certificates and their lifecycle
 */

const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  commonName: {
    type: String,
    required: true,
    index: true
  },
  subjectAlternativeNames: [{
    type: String
  }],
  
  // Certificate Type
  type: {
    type: String,
    enum: ["root-ca", "intermediate-ca", "end-entity", "self-signed", "code-signing", "email", "client", "server"],
    required: true
  },
  
  // Certificate Data
  certificatePem: {
    type: String,
    required: true
  },
  privateKeyEncrypted: {
    type: String,
    default: null
  },
  certificateChainPem: {
    type: String,
    default: null
  },
  
  // Certificate Details
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  fingerprint: {
    sha1: { type: String },
    sha256: { type: String, required: true, index: true }
  },
  
  // Issuer Information
  issuer: {
    commonName: String,
    organization: String,
    country: String,
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null }
  },
  
  // Subject Information
  subject: {
    commonName: String,
    organization: String,
    organizationalUnit: String,
    locality: String,
    state: String,
    country: String,
    emailAddress: String
  },
  
  // Validity
  validFrom: {
    type: Date,
    required: true,
    index: true
  },
  validTo: {
    type: Date,
    required: true,
    index: true
  },
  
  // Key Information
  keyAlgorithm: {
    type: String,
    enum: ["RSA-2048", "RSA-3072", "RSA-4096", "ECDSA-P256", "ECDSA-P384", "ECDSA-P521", "Ed25519"],
    required: true
  },
  signatureAlgorithm: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ["active", "expired", "revoked", "pending", "pending-renewal", "suspended"],
    default: "active",
    index: true
  },
  revocationInfo: {
    revokedAt: Date,
    reason: {
      type: String,
      enum: ["unspecified", "keyCompromise", "caCompromise", "affiliationChanged", "superseded", "cessationOfOperation", "certificateHold", "removeFromCRL", "privilegeWithdrawn", "aaCompromise"]
    },
    revokedBy: String
  },
  
  // Provider Information
  provider: {
    type: String,
    enum: ["local", "letsencrypt", "digicert", "sectigo", "globalsign", "venafi", "ejbca", "adcs"],
    default: "local"
  },
  providerCertId: {
    type: String,
    default: null
  },
  providerOrderId: {
    type: String,
    default: null
  },
  
  // Renewal Settings
  renewalPolicy: {
    autoRenew: { type: Boolean, default: false },
    renewBeforeDays: { type: Number, default: 30 },
    lastRenewalAttempt: Date,
    renewalError: String
  },
  
  // Associated Key
  encryptionKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EncryptionKey",
    default: null
  },
  
  // Certificate Extensions
  extensions: {
    keyUsage: [String],
    extendedKeyUsage: [String],
    basicConstraints: {
      ca: Boolean,
      pathLenConstraint: Number
    },
    subjectKeyIdentifier: String,
    authorityKeyIdentifier: String,
    crlDistributionPoints: [String],
    authorityInfoAccess: {
      ocsp: [String],
      caIssuers: [String]
    }
  },
  
  // Certificate Transparency
  ctLogs: [{
    logName: String,
    logId: String,
    timestamp: Date,
    sctVersion: Number
  }],
  
  // Deployment Information
  deployedTo: [{
    target: String,
    deployedAt: Date,
    status: String
  }],
  
  // Tags and Metadata
  tags: [{
    key: String,
    value: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Compliance
  compliance: {
    evValidation: { type: Boolean, default: false },
    ovValidation: { type: Boolean, default: false },
    dvValidation: { type: Boolean, default: true },
    wildcardCert: { type: Boolean, default: false }
  },
  
  // Audit
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: String
}, {
  timestamps: true,
  collection: "certificates"
});

// Indexes
certificateSchema.index({ validTo: 1, status: 1 });
certificateSchema.index({ "subject.commonName": 1 });
certificateSchema.index({ provider: 1, status: 1 });

// Virtual for checking if certificate is expired
certificateSchema.virtual("isExpired").get(function() {
  return new Date() > this.validTo;
});

// Virtual for days until expiration
certificateSchema.virtual("daysUntilExpiration").get(function() {
  const diff = this.validTo.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for checking if renewal is due
certificateSchema.virtual("renewalDue").get(function() {
  if (!this.renewalPolicy.autoRenew) return false;
  const daysUntilExpiry = this.daysUntilExpiration;
  return daysUntilExpiry <= this.renewalPolicy.renewBeforeDays;
});

module.exports = mongoose.model("Certificate", certificateSchema);

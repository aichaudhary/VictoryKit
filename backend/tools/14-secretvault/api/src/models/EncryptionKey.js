/**
 * EncryptionKey Model
 * Stores encryption key metadata (never stores actual key material in plain text)
 */

const mongoose = require("mongoose");

const encryptionKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["symmetric", "asymmetric", "hmac"],
    required: true
  },
  algorithm: {
    type: String,
    enum: [
      "AES-128-GCM", "AES-256-GCM", "AES-256-CBC",
      "RSA-2048", "RSA-4096",
      "ECDSA-P256", "ECDSA-P384", "ECDSA-P521",
      "Ed25519", "X25519",
      "ChaCha20-Poly1305",
      "HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"
    ],
    required: true
  },
  keySize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "expired", "compromised", "pending-deletion", "pending-rotation"],
    default: "active",
    index: true
  },
  
  // Key Provider Information
  provider: {
    type: String,
    enum: ["local", "aws-kms", "azure-keyvault", "gcp-kms", "hashicorp-vault", "thales", "fortanix", "hsm"],
    default: "local"
  },
  providerKeyId: {
    type: String,
    default: null
  },
  providerMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Key Material (encrypted or reference)
  keyMaterial: {
    encrypted: { type: String, default: null }, // Encrypted key material (for local keys)
    publicKey: { type: String, default: null }, // Public key (for asymmetric)
    wrappedBy: { type: mongoose.Schema.Types.ObjectId, ref: "EncryptionKey", default: null }
  },
  
  // Lifecycle Management
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  activatedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  lastRotatedAt: {
    type: Date,
    default: null
  },
  scheduledDeletionAt: {
    type: Date,
    default: null
  },
  
  // Rotation Policy
  rotationPolicy: {
    enabled: { type: Boolean, default: false },
    intervalDays: { type: Number, default: 90 },
    lastRotation: { type: Date, default: null },
    nextRotation: { type: Date, default: null },
    autoRotate: { type: Boolean, default: false }
  },
  
  // Version Tracking
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    providerKeyId: String,
    createdAt: Date,
    deactivatedAt: Date
  }],
  
  // Usage Statistics
  usageStats: {
    totalOperations: { type: Number, default: 0 },
    encryptCount: { type: Number, default: 0 },
    decryptCount: { type: Number, default: 0 },
    signCount: { type: Number, default: 0 },
    verifyCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null }
  },
  
  // Access Control
  allowedOperations: [{
    type: String,
    enum: ["encrypt", "decrypt", "sign", "verify", "wrap", "unwrap", "derive"]
  }],
  accessPolicy: {
    allowedApplications: [{ type: String }],
    allowedUsers: [{ type: String }],
    ipWhitelist: [{ type: String }],
    requireMFA: { type: Boolean, default: false }
  },
  
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
    fipsCompliant: { type: Boolean, default: false },
    pciDssScope: { type: Boolean, default: false },
    hipaaScope: { type: Boolean, default: false },
    gdprScope: { type: Boolean, default: false }
  },
  
  // Audit Trail Reference
  createdBy: {
    type: String,
    required: true
  },
  lastModifiedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: "encryption_keys"
});

// Indexes for performance
encryptionKeySchema.index({ provider: 1, status: 1 });
encryptionKeySchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: "pending-deletion" } });
encryptionKeySchema.index({ "rotationPolicy.nextRotation": 1 });
encryptionKeySchema.index({ "tags.key": 1, "tags.value": 1 });

// Virtual for checking if key is expired
encryptionKeySchema.virtual("isExpired").get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for days until expiration
encryptionKeySchema.virtual("daysUntilExpiration").get(function() {
  if (!this.expiresAt) return null;
  const diff = this.expiresAt.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to increment usage
encryptionKeySchema.methods.recordUsage = async function(operation) {
  this.usageStats.totalOperations += 1;
  this.usageStats.lastUsedAt = new Date();
  
  switch(operation) {
    case "encrypt": this.usageStats.encryptCount += 1; break;
    case "decrypt": this.usageStats.decryptCount += 1; break;
    case "sign": this.usageStats.signCount += 1; break;
    case "verify": this.usageStats.verifyCount += 1; break;
  }
  
  return this.save();
};

module.exports = mongoose.model("EncryptionKey", encryptionKeySchema);

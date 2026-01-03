/**
 * AuditLog Model
 * Comprehensive audit trail for all encryption operations
 */

const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  // Operation Details
  operation: {
    type: String,
    enum: [
      "key.create", "key.read", "key.update", "key.delete", "key.rotate", "key.activate", "key.deactivate",
      "key.encrypt", "key.decrypt", "key.sign", "key.verify", "key.wrap", "key.unwrap",
      "cert.create", "cert.read", "cert.update", "cert.delete", "cert.renew", "cert.revoke",
      "cert.deploy", "cert.verify",
      "policy.create", "policy.update", "policy.delete",
      "config.update", "access.grant", "access.revoke",
      "export.request", "import.complete",
      "provider.sync", "provider.error"
    ],
    required: true,
    index: true
  },
  
  // Resource Information
  resourceType: {
    type: String,
    enum: ["key", "certificate", "policy", "config", "provider"],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  resourceName: {
    type: String,
    required: true
  },
  
  // Actor Information
  actor: {
    userId: { type: String, required: true, index: true },
    username: String,
    email: String,
    role: String,
    application: String,
    serviceAccount: { type: Boolean, default: false }
  },
  
  // Request Context
  request: {
    ipAddress: { type: String, index: true },
    userAgent: String,
    method: String,
    path: String,
    requestId: String,
    correlationId: String
  },
  
  // Operation Result
  status: {
    type: String,
    enum: ["success", "failure", "partial", "denied"],
    required: true,
    index: true
  },
  statusCode: {
    type: Number
  },
  errorMessage: {
    type: String,
    default: null
  },
  errorCode: {
    type: String,
    default: null
  },
  
  // Change Details (for update operations)
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    changedFields: [String]
  },
  
  // Encryption Operation Details
  cryptoDetails: {
    algorithm: String,
    keySize: Number,
    provider: String,
    dataSize: Number,
    processingTimeMs: Number
  },
  
  // Compliance Markers
  compliance: {
    sensitiveData: { type: Boolean, default: false },
    pciScope: { type: Boolean, default: false },
    hipaaScope: { type: Boolean, default: false },
    gdprScope: { type: Boolean, default: false },
    retentionDays: { type: Number, default: 365 }
  },
  
  // Geographic Information
  geo: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  
  // Additional Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Signature for tamper detection
  signature: {
    type: String,
    default: null
  }
}, {
  timestamps: false, // Using custom timestamp field
  collection: "encryption_audit_logs"
});

// Compound indexes for common queries
auditLogSchema.index({ timestamp: -1, operation: 1 });
auditLogSchema.index({ resourceId: 1, timestamp: -1 });
auditLogSchema.index({ "actor.userId": 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

// TTL index for automatic log retention
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 } // 1 year default
);

// Static method to create audit log entry
auditLogSchema.statics.log = async function(data) {
  const entry = new this({
    ...data,
    timestamp: new Date()
  });
  return entry.save();
};

// Static method for bulk logging
auditLogSchema.statics.bulkLog = async function(entries) {
  const docs = entries.map(data => ({
    ...data,
    timestamp: new Date()
  }));
  return this.insertMany(docs);
};

module.exports = mongoose.model("AuditLog", auditLogSchema);

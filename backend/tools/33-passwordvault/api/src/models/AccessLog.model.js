const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'password_change', 'mfa_enable', 'mfa_disable',
      'vault_create', 'vault_access', 'vault_modify', 'vault_delete', 'vault_share',
      'secret_create', 'secret_access', 'secret_modify', 'secret_delete', 'secret_share',
      'api_key_create', 'api_key_access', 'api_key_delete',
      'organization_create', 'organization_modify', 'organization_delete',
      'user_create', 'user_modify', 'user_delete', 'user_suspend', 'user_activate',
      'backup_create', 'backup_restore', 'backup_delete',
      'compliance_check', 'audit_export', 'settings_change'
    ]
  },
  resource: {
    type: {
      type: String,
      enum: ['user', 'vault', 'secret', 'organization', 'api_key', 'backup', 'system']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  details: {
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    device: {
      type: String,
      browser: String,
      os: String,
      mobile: Boolean
    },
    sessionId: String,
    apiKeyId: mongoose.Schema.Types.ObjectId,
    additionalData: mongoose.Schema.Types.Mixed
  },
  result: {
    type: String,
    enum: ['success', 'failure', 'denied', 'error'],
    default: 'success'
  },
  error: {
    code: String,
    message: String,
    stack: String
  },
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [String], // ['unusual_location', 'unusual_time', 'unusual_device', 'failed_attempts']
    alerts: [{
      type: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      message: String,
      triggeredAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  compliance: {
    gdpr: { type: Boolean, default: false },
    hipaa: { type: Boolean, default: false },
    pci: { type: Boolean, default: false },
    sox: { type: Boolean, default: false },
    custom: [String]
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for performance and compliance
accessLogSchema.index({ user: 1, createdAt: -1 });
accessLogSchema.index({ organization: 1, createdAt: -1 });
accessLogSchema.index({ action: 1, createdAt: -1 });
accessLogSchema.index({ 'resource.type': 1, 'resource.id': 1 });
accessLogSchema.index({ result: 1 });
accessLogSchema.index({ 'risk.score': -1 });
accessLogSchema.index({ createdAt: -1 });

// Compound indexes for common queries
accessLogSchema.index({ user: 1, action: 1, createdAt: -1 });
accessLogSchema.index({ organization: 1, action: 1, createdAt: -1 });

// TTL index for automatic cleanup (90 days retention)
accessLogSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 90 * 24 * 60 * 60,
  partialFilterExpression: { 'compliance.gdpr': { $ne: true } }
});

// Static method to log access
accessLogSchema.statics.logAccess = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to log access:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

// Method to check for suspicious activity
accessLogSchema.methods.isSuspicious = function() {
  return this.risk.score > 70 || this.result === 'failure';
};

// Virtual for formatted timestamp
accessLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for risk level
accessLogSchema.virtual('riskLevel').get(function() {
  if (this.risk.score >= 80) return 'critical';
  if (this.risk.score >= 60) return 'high';
  if (this.risk.score >= 40) return 'medium';
  return 'low';
});

module.exports = mongoose.model('AccessLog', accessLogSchema);
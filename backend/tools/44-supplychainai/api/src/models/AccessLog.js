/**
 * AccessLog Model - Backup Access Audit Trail
 * Tracks who accessed backups, when, and what actions were taken
 */

const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Action Type
  action: {
    type: String,
    required: true,
    enum: [
      'backup_create', 'backup_read', 'backup_update', 'backup_delete',
      'restore_initiate', 'restore_complete', 'restore_cancel',
      'download', 'upload', 'browse', 'search',
      'integrity_check', 'verify', 'export',
      'policy_change', 'config_change', 'permission_change',
      'login', 'logout', 'api_access'
    ],
    index: true
  },
  
  // Result
  result: {
    type: String,
    enum: ['success', 'failure', 'denied', 'partial'],
    required: true,
    index: true
  },
  
  // User Information
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    username: String,
    role: String,
    department: String
  },
  
  // Session Information
  session: {
    sessionId: String,
    authMethod: { type: String, enum: ['password', 'sso', 'mfa', 'api_key', 'service_account'] },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: { lat: Number, lng: Number }
    }
  },
  
  // Resource Accessed
  resource: {
    type: { type: String, enum: ['backup', 'storage', 'policy', 'file', 'folder', 'system', 'api'] },
    id: String,
    name: String,
    path: String,
    backup: { type: mongoose.Schema.Types.ObjectId, ref: 'Backup' },
    storageLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation' }
  },
  
  // Details
  details: {
    description: String,
    bytesAccessed: Number,
    filesAccessed: Number,
    duration: Number, // milliseconds
    query: String,
    parameters: mongoose.Schema.Types.Mixed,
    response: {
      statusCode: Number,
      size: Number
    }
  },
  
  // Changes (for update actions)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fields: [String]
  },
  
  // Security
  security: {
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    suspicious: { type: Boolean, default: false },
    flags: [{
      type: { type: String, enum: ['unusual_time', 'unusual_location', 'unusual_volume', 'failed_attempts', 'privilege_escalation'] },
      description: String
    }],
    alertGenerated: { type: Boolean, default: false },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }
  },
  
  // Error (for failures)
  error: {
    code: String,
    message: String,
    stack: String
  },
  
  // Compliance
  compliance: {
    retentionRequired: { type: Boolean, default: true },
    retentionDays: { type: Number, default: 365 },
    gdprRelevant: { type: Boolean, default: false },
    hipaaRelevant: { type: Boolean, default: false },
    pciRelevant: { type: Boolean, default: false }
  },
  
  // Metadata
  tags: [String],
  
  // Timestamps
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'supplychainai_access_logs'
});

// Indexes
accessLogSchema.index({ action: 1, result: 1, timestamp: -1 });
accessLogSchema.index({ 'user.userId': 1, timestamp: -1 });
accessLogSchema.index({ 'user.email': 1 });
accessLogSchema.index({ 'session.ipAddress': 1 });
accessLogSchema.index({ 'resource.backup': 1 });
accessLogSchema.index({ 'security.suspicious': 1 });
accessLogSchema.index({ timestamp: -1 });

// TTL index for automatic cleanup (optional)
// accessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

// Generate log ID
accessLogSchema.pre('save', function(next) {
  if (!this.logId) {
    const prefix = 'LOG';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.logId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Static method to log access
accessLogSchema.statics.logAccess = async function(data) {
  const log = new this({
    action: data.action,
    result: data.result || 'success',
    user: data.user,
    session: data.session,
    resource: data.resource,
    details: data.details,
    changes: data.changes,
    error: data.error,
    timestamp: new Date()
  });
  
  // Calculate risk score
  log.security.riskScore = log.calculateRiskScore();
  
  return log.save();
};

// Method to calculate risk score
accessLogSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Failed actions are riskier
  if (this.result === 'failure') score += 10;
  if (this.result === 'denied') score += 20;
  
  // Sensitive actions
  const sensitiveActions = ['backup_delete', 'restore_initiate', 'policy_change', 'permission_change', 'export'];
  if (sensitiveActions.includes(this.action)) score += 15;
  
  // Large data access
  if (this.details?.bytesAccessed > 10737418240) score += 10; // > 10GB
  
  // Unusual flags
  score += (this.security.flags?.length || 0) * 15;
  
  this.security.suspicious = score >= 30;
  
  return Math.min(score, 100);
};

// Static method to get suspicious activity
accessLogSchema.statics.getSuspiciousActivity = function(since, limit = 50) {
  const query = { 'security.suspicious': true };
  if (since) {
    query.timestamp = { $gte: since };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('resource.backup', 'name')
    .populate('resource.storageLocation', 'name');
};

// Static method to get user activity
accessLogSchema.statics.getUserActivity = function(userId, days = 30, limit = 100) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return this.find({
    'user.userId': userId,
    timestamp: { $gte: since }
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activity summary
accessLogSchema.statics.getActivitySummary = async function(since) {
  const match = since ? { timestamp: { $gte: since } } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { action: '$action', result: '$result' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        results: {
          $push: { result: '$_id.result', count: '$count' }
        },
        total: { $sum: '$count' }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

module.exports = mongoose.model('AccessLog', accessLogSchema);

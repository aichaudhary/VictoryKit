/**
 * Alert Model - Backup Security Alerts
 * Real-time alerts for backup security events
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Alert Classification
  type: {
    type: String,
    required: true,
    enum: [
      'backup_failed', 'backup_missed', 'integrity_violation', 'storage_full',
      'storage_error', 'ransomware_detected', 'unauthorized_access', 'data_tampering',
      'encryption_failure', 'retention_violation', 'rpo_breach', 'rto_breach',
      'replication_failed', 'restore_failed', 'certificate_expiry', 'quota_warning',
      'connectivity_lost', 'performance_degraded', 'compliance_violation', 'system_alert'
    ],
    index: true
  },
  
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
    index: true
  },
  
  // Content
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  
  // Affected Resources
  backup: { type: mongoose.Schema.Types.ObjectId, ref: 'Backup' },
  storageLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation' },
  retentionPolicy: { type: mongoose.Schema.Types.ObjectId, ref: 'RetentionPolicy' },
  integrityCheck: { type: mongoose.Schema.Types.ObjectId, ref: 'IntegrityCheck' },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'dismissed', 'escalated'],
    default: 'new',
    index: true
  },
  
  // Read Status
  read: { type: Boolean, default: false, index: true },
  readAt: Date,
  readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Actions
  actionRequired: { type: Boolean, default: false },
  suggestedActions: [{
    action: String,
    description: String,
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    automated: Boolean
  }],
  actionTaken: String,
  actionTakenAt: Date,
  actionTakenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Auto-remediation
  autoRemediation: {
    enabled: { type: Boolean, default: false },
    attempted: { type: Boolean, default: false },
    attemptedAt: Date,
    action: String,
    result: { type: String, enum: ['success', 'failed', 'partial', 'pending'] },
    details: String
  },
  
  // Notification Status
  notifications: {
    email: { sent: Boolean, sentAt: Date, recipients: [String] },
    sms: { sent: Boolean, sentAt: Date, recipients: [String] },
    slack: { sent: Boolean, sentAt: Date, channel: String },
    webhook: { sent: Boolean, sentAt: Date, url: String, response: String },
    pagerduty: { sent: Boolean, sentAt: Date, incidentId: String }
  },
  
  // Escalation
  escalation: {
    escalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedTo: [String],
    escalationLevel: { type: Number, default: 0 },
    reason: String,
    slaBreached: { type: Boolean, default: false }
  },
  
  // Impact Assessment
  impact: {
    dataAtRisk: { type: Number, default: 0 }, // bytes
    systemsAffected: [String],
    usersAffected: { type: Number, default: 0 },
    businessImpact: { type: String, enum: ['critical', 'high', 'medium', 'low', 'none'] },
    estimatedDowntime: Number // minutes
  },
  
  // Correlation
  relatedAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  correlationId: String,
  isRecurring: { type: Boolean, default: false },
  recurrenceCount: { type: Number, default: 1 },
  
  // Source
  source: {
    type: String,
    enum: ['backup_agent', 'storage_monitor', 'integrity_check', 'policy_engine', 'ml_model', 'external', 'manual'],
    default: 'backup_agent'
  },
  
  // Metadata
  expiresAt: Date,
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'backupguard_alerts'
});

// Indexes
alertSchema.index({ type: 1, severity: 1, status: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ backup: 1 });
alertSchema.index({ storageLocation: 1 });
alertSchema.index({ read: 1, status: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Generate alert ID
alertSchema.pre('save', function(next) {
  if (!this.alertId) {
    const prefix = 'ALT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.alertId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to acknowledge
alertSchema.methods.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.read = true;
  this.readAt = new Date();
  this.readBy = userId;
  return this.save();
};

// Method to resolve
alertSchema.methods.resolve = function(actionTaken, userId) {
  this.status = 'resolved';
  this.actionTaken = actionTaken;
  this.actionTakenAt = new Date();
  this.actionTakenBy = userId;
  return this.save();
};

// Method to escalate
alertSchema.methods.escalate = function(escalateTo, reason) {
  this.status = 'escalated';
  this.escalation = {
    escalated: true,
    escalatedAt: new Date(),
    escalatedTo: escalateTo,
    escalationLevel: (this.escalation.escalationLevel || 0) + 1,
    reason
  };
  return this.save();
};

// Static method to get unread count
alertSchema.statics.getUnreadCount = function(filters = {}) {
  return this.countDocuments({ read: false, status: 'new', ...filters });
};

// Static method to get critical alerts
alertSchema.statics.getCriticalAlerts = function(limit = 10) {
  return this.find({ severity: 'critical', status: { $in: ['new', 'acknowledged'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('backup', 'name type')
    .populate('storageLocation', 'name type');
};

module.exports = mongoose.model('Alert', alertSchema);

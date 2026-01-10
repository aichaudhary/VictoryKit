/**
 * Alert Model - Mobile Security Alerts
 * Real-time security alerts and notifications
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
      'malware_detected', 'jailbreak_detected', 'root_detected', 'policy_violation',
      'suspicious_app', 'network_attack', 'data_leak', 'unauthorized_access',
      'device_compromised', 'phishing_attempt', 'man_in_middle', 'rogue_wifi',
      'compliance_failure', 'certificate_issue', 'device_lost', 'device_stolen',
      'high_risk_app', 'permission_abuse', 'battery_anomaly', 'system_alert'
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
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', index: true },
  app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
  threat: { type: mongoose.Schema.Types.ObjectId, ref: 'Threat' },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
  scan: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan' },
  
  // User Context
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: String,
  
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
  actionTaken: String,
  actionTakenAt: Date,
  actionTakenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Auto-remediation
  autoRemediated: { type: Boolean, default: false },
  remediationAction: String,
  remediationResult: String,
  
  // Notification Status
  notifications: {
    push: { sent: Boolean, sentAt: Date, delivered: Boolean },
    email: { sent: Boolean, sentAt: Date, delivered: Boolean },
    sms: { sent: Boolean, sentAt: Date, delivered: Boolean },
    webhook: { sent: Boolean, sentAt: Date, response: String }
  },
  
  // Escalation
  escalation: {
    escalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedTo: [String],
    escalationLevel: { type: Number, default: 0 },
    reason: String
  },
  
  // Correlation
  relatedAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  correlationId: String,
  
  // Source
  source: {
    type: String,
    enum: ['device_agent', 'cloud_scan', 'policy_engine', 'ml_model', 'network_monitor', 'external_feed', 'manual'],
    default: 'device_agent'
  },
  
  // Metadata
  expiresAt: Date,
  tags: [String],
  notes: String,
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'mobileshield_alerts'
});

// Indexes
alertSchema.index({ type: 1, severity: 1, status: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ device: 1, status: 1 });
alertSchema.index({ read: 1, status: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Generate alert ID
alertSchema.pre('save', function(next) {
  if (!this.alertId) {
    const prefix = 'MDA';
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

// Method to dismiss
alertSchema.methods.dismiss = function(userId, reason) {
  this.status = 'dismissed';
  this.actionTaken = reason || 'Dismissed';
  this.actionTakenAt = new Date();
  this.actionTakenBy = userId;
  return this.save();
};

// Static method to get unread count
alertSchema.statics.getUnreadCount = function(filters = {}) {
  return this.countDocuments({ read: false, status: 'new', ...filters });
};

// Static method to get alerts by severity
alertSchema.statics.getBySeverity = function(severity, limit = 50) {
  return this.find({ severity, status: { $in: ['new', 'acknowledged'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('device', 'name platform')
    .populate('app', 'name packageName');
};

module.exports = mongoose.model('Alert', alertSchema);

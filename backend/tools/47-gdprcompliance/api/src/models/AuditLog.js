const mongoose = require('mongoose');

// Comprehensive Audit Log (Article 5(2) - Accountability)
const auditLogSchema = new mongoose.Schema({
  // Log Entry Identification
  logId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Timestamp
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // Event Classification
  eventCategory: {
    type: String,
    required: true,
    enum: [
      'data_access',
      'data_modification',
      'data_deletion',
      'data_export',
      'consent_action',
      'dsar_action',
      'breach_action',
      'user_authentication',
      'system_configuration',
      'policy_change',
      'security_event',
      'transfer_action',
      'retention_action',
      'dpia_action',
      'dpo_action',
      'processor_action',
      'compliance_check',
      'other'
    ],
    index: true
  },

  eventType: {
    type: String,
    required: true,
    index: true
  },

  // Event Details
  eventDescription: {
    type: String,
    required: true
  },

  eventSeverity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info',
    index: true
  },

  // Actor Information
  actor: {
    actorType: {
      type: String,
      required: true,
      enum: ['user', 'system', 'api', 'service', 'admin', 'dpo', 'data_subject', 'processor', 'other']
    },
    actorId: String,
    actorName: String,
    actorEmail: String,
    actorRole: String,
    actorDepartment: String
  },

  // Session Information
  session: {
    sessionId: String,
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Target/Resource Information
  target: {
    targetType: {
      type: String,
      enum: [
        'data_subject',
        'consent_record',
        'processing_activity',
        'dsar',
        'data_breach',
        'dpia',
        'legal_basis',
        'data_transfer',
        'processor',
        'retention_schedule',
        'dpo',
        'user_account',
        'system_setting',
        'policy',
        'other'
      ]
    },
    targetId: String,
    targetName: String,
    targetReference: mongoose.Schema.Types.Mixed
  },

  // Action Details
  action: {
    actionName: {
      type: String,
      required: true
    },
    actionResult: {
      type: String,
      required: true,
      enum: ['success', 'failure', 'partial_success', 'pending', 'blocked']
    },
    actionDuration: Number,  // milliseconds
    actionMethod: String,    // API endpoint, function name, etc.
  },

  // Data Subject Context (if applicable)
  dataSubject: {
    dataSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataSubject'
    },
    dataSubjectEmail: String,
    dataSubjectCategory: String
  },

  // Changes Made (for modification events)
  changes: {
    fieldChanges: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      changeType: {
        type: String,
        enum: ['created', 'modified', 'deleted']
      }
    }],
    recordsBefore: mongoose.Schema.Types.Mixed,
    recordsAfter: mongoose.Schema.Types.Mixed
  },

  // Data Accessed (for access events)
  dataAccessed: {
    dataCategories: [String],
    recordCount: Number,
    fieldsAccessed: [String],
    accessPurpose: String,
    accessJustification: String
  },

  // Compliance Context
  compliance: {
    legalBasis: String,
    processingPurpose: String,
    dataProtectionImpact: String,
    consentReference: String,
    policyReference: String
  },

  // Security Context
  security: {
    authenticationMethod: String,
    authorizationLevel: String,
    encryptionUsed: Boolean,
    securityFlags: [String],
    threatLevel: String,
    anomalyDetected: Boolean,
    anomalyDescription: String
  },

  // Related Records
  relatedLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditLog'
  }],

  relatedRecords: [{
    recordType: String,
    recordId: String,
    relationship: String
  }],

  // Error Information (for failures)
  error: {
    errorCode: String,
    errorMessage: String,
    errorStack: String,
    errorDetails: mongoose.Schema.Types.Mixed
  },

  // Request/Response (for API calls)
  apiCall: {
    endpoint: String,
    method: String,
    requestHeaders: mongoose.Schema.Types.Mixed,
    requestBody: mongoose.Schema.Types.Mixed,
    responseStatus: Number,
    responseHeaders: mongoose.Schema.Types.Mixed,
    responseBody: mongoose.Schema.Types.Mixed
  },

  // Retention
  retentionPeriod: {
    duration: Number,
    unit: String,
    deleteAfter: Date
  },

  // Review and Investigation
  review: {
    reviewed: Boolean,
    reviewedBy: String,
    reviewDate: Date,
    reviewNotes: String,
    flagged: Boolean,
    flagReason: String
  },

  // Regulatory Reporting
  regulatoryReporting: {
    reportable: Boolean,
    reportedTo: [String],
    reportDate: Date,
    reportReference: String
  },

  // Metadata
  source: {
    system: String,
    component: String,
    version: String,
    environment: String
  },

  tags: [String],
  
  notes: String,

  // Integrity
  integrity: {
    hash: String,
    signedBy: String,
    signatureDate: Date,
    verified: Boolean
  }

}, {
  timestamps: false,  // We use custom timestamp field
  collection: 'auditlogs'
});

// Indexes for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ eventCategory: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ 'actor.actorId': 1, timestamp: -1 });
auditLogSchema.index({ 'actor.actorEmail': 1, timestamp: -1 });
auditLogSchema.index({ 'target.targetType': 1, 'target.targetId': 1 });
auditLogSchema.index({ 'dataSubject.dataSubjectId': 1, timestamp: -1 });
auditLogSchema.index({ 'action.actionResult': 1, timestamp: -1 });
auditLogSchema.index({ eventSeverity: 1, timestamp: -1 });
auditLogSchema.index({ 'session.ipAddress': 1, timestamp: -1 });
auditLogSchema.index({ 'review.flagged': 1, timestamp: -1 });
auditLogSchema.index({ 'retentionPeriod.deleteAfter': 1 });

// Compound indexes for common queries
auditLogSchema.index({ eventCategory: 1, 'actor.actorId': 1, timestamp: -1 });
auditLogSchema.index({ 'dataSubject.dataSubjectId': 1, eventCategory: 1, timestamp: -1 });

// TTL index for automatic deletion
auditLogSchema.index({ 'retentionPeriod.deleteAfter': 1 }, { expireAfterSeconds: 0 });

// Virtuals
auditLogSchema.virtual('isHighSeverity').get(function() {
  return this.eventSeverity === 'high' || this.eventSeverity === 'critical';
});

auditLogSchema.virtual('isFailed').get(function() {
  return this.action.actionResult === 'failure' || this.action.actionResult === 'blocked';
});

auditLogSchema.virtual('requiresReview').get(function() {
  return (
    this.isHighSeverity ||
    this.security.anomalyDetected ||
    this.isFailed ||
    this.regulatoryReporting.reportable
  );
});

// Static Methods
auditLogSchema.statics.logEvent = async function(eventData) {
  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Calculate retention
  const deleteAfter = new Date();
  deleteAfter.setFullYear(deleteAfter.getFullYear() + (eventData.retentionYears || 7));
  
  const logEntry = new this({
    logId,
    ...eventData,
    retentionPeriod: {
      duration: eventData.retentionYears || 7,
      unit: 'years',
      deleteAfter
    }
  });
  
  return await logEntry.save();
};

auditLogSchema.statics.findByActor = function(actorId, startDate, endDate) {
  const query = { 'actor.actorId': actorId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

auditLogSchema.statics.findByDataSubject = function(dataSubjectId, category = null) {
  const query = { 'dataSubject.dataSubjectId': dataSubjectId };
  if (category) query.eventCategory = category;
  
  return this.find(query).sort({ timestamp: -1 });
};

auditLogSchema.statics.findSecurityEvents = function(startDate, endDate, severity = null) {
  const query = { eventCategory: 'security_event' };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (severity) query.eventSeverity = severity;
  
  return this.find(query).sort({ timestamp: -1 });
};

auditLogSchema.statics.findFailedActions = function(hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return this.find({
    timestamp: { $gte: startDate },
    'action.actionResult': { $in: ['failure', 'blocked'] }
  }).sort({ timestamp: -1 });
};

auditLogSchema.statics.findAnomalies = function(hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return this.find({
    timestamp: { $gte: startDate },
    'security.anomalyDetected': true
  }).sort({ timestamp: -1 });
};

auditLogSchema.statics.findRequiringReview = function() {
  return this.find({
    $or: [
      { eventSeverity: { $in: ['high', 'critical'] } },
      { 'security.anomalyDetected': true },
      { 'action.actionResult': { $in: ['failure', 'blocked'] } },
      { 'regulatoryReporting.reportable': true }
    ],
    'review.reviewed': { $ne: true }
  }).sort({ timestamp: -1 });
};

auditLogSchema.statics.findFlaggedLogs = function() {
  return this.find({
    'review.flagged': true
  }).sort({ timestamp: -1 });
};

auditLogSchema.statics.generateComplianceReport = async function(startDate, endDate) {
  const logs = await this.find({
    timestamp: { $gte: startDate, $lte: endDate }
  });
  
  return {
    totalEvents: logs.length,
    eventsByCategory: await this.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$eventCategory', count: { $sum: 1 } } }
    ]),
    eventsBySeverity: await this.aggregate([
      { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$eventSeverity', count: { $sum: 1 } } }
    ]),
    failedActions: logs.filter(l => l.isFailed).length,
    securityAnomalies: logs.filter(l => l.security.anomalyDetected).length,
    dataSubjectAccess: logs.filter(l => l.eventCategory === 'data_access').length,
    dataModifications: logs.filter(l => l.eventCategory === 'data_modification').length,
    dataDeletions: logs.filter(l => l.eventCategory === 'data_deletion').length
  };
};

// Instance Methods
auditLogSchema.methods.flag = function(reason, flaggedBy) {
  this.review.flagged = true;
  this.review.flagReason = reason;
  this.review.reviewedBy = flaggedBy;
  this.review.reviewDate = new Date();
};

auditLogSchema.methods.markReviewed = function(reviewedBy, notes) {
  this.review.reviewed = true;
  this.review.reviewedBy = reviewedBy;
  this.review.reviewDate = new Date();
  this.review.reviewNotes = notes;
};

auditLogSchema.methods.calculateIntegrityHash = function() {
  const crypto = require('crypto');
  const dataToHash = JSON.stringify({
    logId: this.logId,
    timestamp: this.timestamp,
    eventCategory: this.eventCategory,
    eventType: this.eventType,
    actor: this.actor,
    action: this.action
  });
  
  this.integrity.hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  return this.integrity.hash;
};

auditLogSchema.methods.verifyIntegrity = function() {
  const currentHash = this.integrity.hash;
  const calculatedHash = this.calculateIntegrityHash();
  this.integrity.verified = (currentHash === calculatedHash);
  return this.integrity.verified;
};

// Pre-save hook
auditLogSchema.pre('save', function(next) {
  // Calculate integrity hash if not present
  if (!this.integrity.hash) {
    this.calculateIntegrityHash();
  }
  
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

const mongoose = require('mongoose');

/**
 * Data Retention Policy & Record Model
 * Manages data lifecycle, retention policies, and automated deletion
 */
const dataRetentionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Policy Identifier
  policyId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: String,
  
  // Policy Type
  type: { 
    type: String, 
    enum: ['retention', 'deletion', 'archival', 'hold', 'disposition'],
    required: true 
  },
  
  // Scope - What data this policy applies to
  scope: {
    dataCategories: [{
      type: String,
      enum: ['pii', 'phi', 'pci', 'financial', 'credentials', 'intellectual_property', 'logs', 'analytics', 'backups', 'communications', 'user_content', 'system_data', 'all']
    }],
    dataSources: [{
      sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DataAsset' },
      sourceName: String,
      sourceType: { type: String, enum: ['database', 'file-storage', 'api', 'application', 'cloud-service', 'endpoint'] }
    }],
    classifications: [{
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'top-secret']
    }],
    regulations: [{
      type: String,
      enum: ['gdpr', 'ccpa', 'hipaa', 'pci-dss', 'sox', 'lgpd', 'pipeda', 'other']
    }],
    geographic: {
      countries: [String],
      regions: [String],
      includeAll: { type: Boolean, default: true }
    },
    conditions: [{
      field: String,
      operator: { type: String, enum: ['equals', 'contains', 'greater_than', 'less_than', 'matches', 'exists'] },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Retention Period
  retention: {
    duration: { type: Number, required: true }, // In days
    unit: { type: String, enum: ['days', 'months', 'years'], default: 'days' },
    startEvent: { 
      type: String, 
      enum: ['creation', 'last_modified', 'last_accessed', 'relationship_end', 'contract_end', 'consent_withdrawal', 'custom'],
      default: 'creation' 
    },
    customStartField: String, // Field name for custom start event
    extendable: { type: Boolean, default: false },
    maxExtensions: { type: Number, default: 0 },
    extensionDuration: Number // Additional days per extension
  },
  
  // Disposition Actions
  disposition: {
    action: { 
      type: String, 
      enum: ['delete', 'archive', 'anonymize', 'pseudonymize', 'encrypt', 'transfer', 'notify'],
      required: true 
    },
    archiveLocation: String,
    transferDestination: String,
    notifyRecipients: [String],
    notifyDaysBefore: { type: Number, default: 30 },
    requireApproval: { type: Boolean, default: false },
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    postDispositionRetention: Number // How long to keep disposition records
  },
  
  // Legal Hold
  legalHold: {
    active: { type: Boolean, default: false },
    reason: String,
    caseId: String,
    startDate: Date,
    endDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    affectedRecords: Number
  },
  
  // Schedule
  schedule: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'custom'], default: 'daily' },
    cronExpression: String, // For custom schedules
    lastRun: Date,
    nextRun: Date,
    timezone: { type: String, default: 'UTC' }
  },
  
  // Execution History
  executions: [{
    executionId: String,
    startedAt: Date,
    completedAt: Date,
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
    recordsProcessed: Number,
    recordsDeleted: Number,
    recordsArchived: Number,
    recordsAnonymized: Number,
    errors: [{
      message: String,
      recordId: String,
      timestamp: Date
    }],
    summary: mongoose.Schema.Types.Mixed
  }],
  
  // Records Pending Disposition
  pendingRecords: [{
    recordId: mongoose.Schema.Types.ObjectId,
    recordType: String,
    source: String,
    scheduledDate: Date,
    status: { type: String, enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'held'] },
    approvalStatus: { type: String, enum: ['not_required', 'pending', 'approved', 'denied'] },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date
  }],
  
  // Statistics
  statistics: {
    totalRecordsManaged: { type: Number, default: 0 },
    recordsDeleted: { type: Number, default: 0 },
    recordsArchived: { type: Number, default: 0 },
    recordsAnonymized: { type: Number, default: 0 },
    dataVolumeReduced: String, // e.g., "2.5 GB"
    lastUpdated: Date
  },
  
  // Compliance Mapping
  compliance: {
    requirements: [{
      regulation: String,
      article: String,
      requirement: String,
      isMet: { type: Boolean, default: true }
    }],
    certifications: [String],
    lastAuditDate: Date,
    nextAuditDate: Date
  },
  
  // Exceptions
  exceptions: [{
    type: { type: String, enum: ['user_request', 'legal_hold', 'audit', 'investigation', 'business_need'] },
    reason: String,
    recordIds: [mongoose.Schema.Types.ObjectId],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' }
  }],
  
  // Notifications
  notifications: {
    enabled: { type: Boolean, default: true },
    channels: [{
      type: { type: String, enum: ['email', 'slack', 'webhook', 'sms'] },
      target: String,
      enabled: { type: Boolean, default: true }
    }],
    events: {
      policyTriggered: { type: Boolean, default: true },
      executionComplete: { type: Boolean, default: true },
      executionFailed: { type: Boolean, default: true },
      approvalRequired: { type: Boolean, default: true },
      expiryWarning: { type: Boolean, default: true }
    },
    warningDays: { type: Number, default: 7 } // Days before expiry to warn
  },
  
  // Audit Trail
  auditLog: [{
    event: String,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }],
  
  // Policy Status
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'archived', 'under_review'], 
    default: 'draft' 
  },
  priority: { type: Number, default: 100 }, // Lower = higher priority
  
  // Ownership
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: String,
  tags: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  activatedAt: Date,
  deactivatedAt: Date
});

// Indexes for efficient queries
dataRetentionSchema.index({ userId: 1, status: 1 });
dataRetentionSchema.index({ policyId: 1 });
dataRetentionSchema.index({ type: 1, status: 1 });
dataRetentionSchema.index({ 'scope.dataCategories': 1 });
dataRetentionSchema.index({ 'scope.regulations': 1 });
dataRetentionSchema.index({ 'schedule.nextRun': 1 });
dataRetentionSchema.index({ 'legalHold.active': 1 });
dataRetentionSchema.index({ status: 1, 'schedule.enabled': 1 });
dataRetentionSchema.index({ createdAt: -1 });

// Pre-save hook to generate policy ID and update timestamps
dataRetentionSchema.pre('save', function(next) {
  if (!this.policyId) {
    const prefix = this.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.policyId = `RET-${prefix}-${timestamp}-${random}`;
  }
  
  // Calculate next run if schedule is enabled
  if (this.schedule.enabled && !this.schedule.nextRun) {
    this.schedule.nextRun = this.calculateNextRun();
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to calculate next run
dataRetentionSchema.methods.calculateNextRun = function() {
  const now = new Date();
  switch (this.schedule.frequency) {
    case 'daily':
      return new Date(now.setDate(now.getDate() + 1));
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'annually':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setDate(now.getDate() + 1));
  }
};

// Virtual for retention period in days
dataRetentionSchema.virtual('retentionDays').get(function() {
  const multiplier = this.retention.unit === 'years' ? 365 : 
                     this.retention.unit === 'months' ? 30 : 1;
  return this.retention.duration * multiplier;
});

// Static method to find policies due for execution
dataRetentionSchema.statics.findDuePolicies = function() {
  return this.find({
    status: 'active',
    'schedule.enabled': true,
    'schedule.nextRun': { $lte: new Date() },
    'legalHold.active': { $ne: true }
  });
};

module.exports = mongoose.model('DataRetention', dataRetentionSchema);

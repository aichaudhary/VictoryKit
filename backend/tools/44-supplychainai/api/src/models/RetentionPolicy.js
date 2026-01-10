/**
 * RetentionPolicy Model - Backup Retention Rules
 * Manages backup lifecycle and compliance requirements
 */

const mongoose = require('mongoose');

const retentionPolicySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Retention Rules
  retention: {
    // Daily backups
    daily: {
      keep: { type: Number, default: 7 }, // Keep last N daily backups
      enabled: { type: Boolean, default: true }
    },
    // Weekly backups
    weekly: {
      keep: { type: Number, default: 4 }, // Keep last N weekly backups
      dayOfWeek: { type: Number, min: 0, max: 6, default: 0 }, // 0 = Sunday
      enabled: { type: Boolean, default: true }
    },
    // Monthly backups
    monthly: {
      keep: { type: Number, default: 12 }, // Keep last N monthly backups
      dayOfMonth: { type: Number, min: 1, max: 28, default: 1 },
      enabled: { type: Boolean, default: true }
    },
    // Yearly backups
    yearly: {
      keep: { type: Number, default: 7 }, // Keep last N yearly backups
      monthOfYear: { type: Number, min: 1, max: 12, default: 1 },
      dayOfMonth: { type: Number, min: 1, max: 28, default: 1 },
      enabled: { type: Boolean, default: false }
    },
    // Maximum age
    maxAgeDays: { type: Number, default: 365 },
    // Minimum copies
    minCopies: { type: Number, default: 1 }
  },
  
  // Compliance
  compliance: {
    framework: {
      type: String,
      enum: ['none', 'gdpr', 'hipaa', 'sox', 'pci_dss', 'iso27001', 'nist', 'custom'],
      default: 'none'
    },
    requirements: [{
      name: String,
      description: String,
      retentionDays: Number,
      required: Boolean
    }],
    legalHoldEnabled: { type: Boolean, default: false },
    auditTrailRequired: { type: Boolean, default: true }
  },
  
  // Scope
  scope: {
    allBackups: { type: Boolean, default: false },
    backupTypes: [{
      type: String,
      enum: ['full', 'incremental', 'differential', 'snapshot', 'mirror', 'synthetic']
    }],
    sourceTypes: [{
      type: String,
      enum: ['database', 'filesystem', 'vm', 'container', 'application', 'cloud', 'email', 'saas']
    }],
    storageLocations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation' }],
    tags: [String],
    excludeTags: [String]
  },
  
  // Actions
  actions: {
    onExpiry: {
      type: String,
      enum: ['delete', 'archive', 'notify', 'review'],
      default: 'delete'
    },
    archiveLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation' },
    notifyBefore: { type: Number, default: 7 }, // days
    notifyRecipients: [String]
  },
  
  // Storage Tiering
  tiering: {
    enabled: { type: Boolean, default: false },
    rules: [{
      afterDays: Number,
      moveToClass: { type: String, enum: ['infrequent_access', 'archive', 'deep_archive', 'glacier'] },
      storageLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation' }
    }]
  },
  
  // Verification
  verification: {
    integrityCheckInterval: { type: Number, default: 30 }, // days
    restoreTestInterval: { type: Number, default: 90 }, // days
    enabled: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    backupsManaged: { type: Number, default: 0 },
    backupsExpired: { type: Number, default: 0 },
    backupsArchived: { type: Number, default: 0 },
    storageReclaimed: { type: Number, default: 0 }, // bytes
    lastEnforced: Date
  },
  
  // Priority
  priority: { type: Number, min: 1, max: 100, default: 50 },
  isDefault: { type: Boolean, default: false },
  
  // Audit
  effectiveDate: Date,
  reviewDate: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  tags: [String],
  notes: String
}, {
  timestamps: true,
  collection: 'supplychainai_retention_policies'
});

// Indexes
retentionPolicySchema.index({ status: 1, priority: -1 });
retentionPolicySchema.index({ 'compliance.framework': 1 });
retentionPolicySchema.index({ isDefault: 1 });

// Generate policy ID
retentionPolicySchema.pre('save', function(next) {
  if (!this.policyId) {
    const prefix = 'RET';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.policyId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to calculate total retention days
retentionPolicySchema.methods.getMaxRetentionDays = function() {
  let maxDays = 0;
  
  if (this.retention.daily.enabled) maxDays = Math.max(maxDays, this.retention.daily.keep);
  if (this.retention.weekly.enabled) maxDays = Math.max(maxDays, this.retention.weekly.keep * 7);
  if (this.retention.monthly.enabled) maxDays = Math.max(maxDays, this.retention.monthly.keep * 30);
  if (this.retention.yearly.enabled) maxDays = Math.max(maxDays, this.retention.yearly.keep * 365);
  
  return Math.min(maxDays, this.retention.maxAgeDays);
};

// Method to check if backup should be retained
retentionPolicySchema.methods.shouldRetain = function(backup, backupDate) {
  const now = new Date();
  const ageInDays = Math.floor((now - backupDate) / (1000 * 60 * 60 * 24));
  
  // Check max age
  if (ageInDays > this.retention.maxAgeDays) {
    return { retain: false, reason: 'max_age_exceeded' };
  }
  
  // Check daily retention
  if (this.retention.daily.enabled && ageInDays <= this.retention.daily.keep) {
    return { retain: true, reason: 'daily_retention' };
  }
  
  // Check weekly retention
  if (this.retention.weekly.enabled) {
    const weekNumber = Math.floor(ageInDays / 7);
    if (weekNumber <= this.retention.weekly.keep && backupDate.getDay() === this.retention.weekly.dayOfWeek) {
      return { retain: true, reason: 'weekly_retention' };
    }
  }
  
  // Check monthly retention
  if (this.retention.monthly.enabled) {
    const monthNumber = Math.floor(ageInDays / 30);
    if (monthNumber <= this.retention.monthly.keep && backupDate.getDate() === this.retention.monthly.dayOfMonth) {
      return { retain: true, reason: 'monthly_retention' };
    }
  }
  
  // Check yearly retention
  if (this.retention.yearly.enabled) {
    const yearNumber = Math.floor(ageInDays / 365);
    if (yearNumber <= this.retention.yearly.keep && 
        backupDate.getMonth() + 1 === this.retention.yearly.monthOfYear &&
        backupDate.getDate() === this.retention.yearly.dayOfMonth) {
      return { retain: true, reason: 'yearly_retention' };
    }
  }
  
  return { retain: false, reason: 'no_matching_rule' };
};

// Virtual for retention summary
retentionPolicySchema.virtual('retentionSummary').get(function() {
  const parts = [];
  if (this.retention.daily.enabled) parts.push(`${this.retention.daily.keep} daily`);
  if (this.retention.weekly.enabled) parts.push(`${this.retention.weekly.keep} weekly`);
  if (this.retention.monthly.enabled) parts.push(`${this.retention.monthly.keep} monthly`);
  if (this.retention.yearly.enabled) parts.push(`${this.retention.yearly.keep} yearly`);
  return parts.join(', ') || 'No retention rules';
});

module.exports = mongoose.model('RetentionPolicy', retentionPolicySchema);

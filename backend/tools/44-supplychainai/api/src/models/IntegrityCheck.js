/**
 * IntegrityCheck Model - Backup Integrity Verification
 * Tracks hash verification and data integrity operations
 */

const mongoose = require('mongoose');

const integrityCheckSchema = new mongoose.Schema({
  checkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Target Backup
  backup: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Backup', 
    required: true,
    index: true 
  },
  backupId: String,
  
  // Check Type
  type: {
    type: String,
    required: true,
    enum: ['checksum', 'restore_test', 'file_verification', 'metadata_check', 'full_validation'],
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'running', 'passed', 'failed', 'warning', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Timing
  scheduledAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: Number, // milliseconds
  
  // Progress
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    bytesVerified: { type: Number, default: 0 },
    bytesTotal: { type: Number, default: 0 },
    filesVerified: { type: Number, default: 0 },
    filesTotal: { type: Number, default: 0 },
    currentFile: String
  },
  
  // Checksum Verification
  checksum: {
    algorithm: { type: String, enum: ['md5', 'sha1', 'sha256', 'sha512', 'xxhash'], default: 'sha256' },
    expectedHash: String,
    actualHash: String,
    match: Boolean
  },
  
  // Results
  result: {
    valid: Boolean,
    corruptedFiles: [{
      path: String,
      expectedHash: String,
      actualHash: String,
      size: Number,
      reason: String
    }],
    missingFiles: [{
      path: String,
      expectedSize: Number
    }],
    extraFiles: [{
      path: String,
      size: Number
    }],
    corruptedCount: { type: Number, default: 0 },
    missingCount: { type: Number, default: 0 },
    validCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 }
  },
  
  // Restore Test (if applicable)
  restoreTest: {
    performed: { type: Boolean, default: false },
    targetPath: String,
    restoreTime: Number, // milliseconds
    dataRestored: Number, // bytes
    filesRestored: Number,
    verificationPassed: Boolean,
    cleanedUp: Boolean
  },
  
  // Metadata Check
  metadata: {
    backupSizeMatch: Boolean,
    fileCountMatch: Boolean,
    timestampsValid: Boolean,
    encryptionValid: Boolean,
    compressionValid: Boolean
  },
  
  // Error Details
  errors: [{
    timestamp: Date,
    code: String,
    message: String,
    file: String,
    severity: { type: String, enum: ['critical', 'error', 'warning', 'info'] }
  }],
  
  // Actions Taken
  actions: [{
    action: String,
    timestamp: Date,
    result: String,
    automated: { type: Boolean, default: false }
  }],
  
  // Recommendations
  recommendations: [{
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    message: String,
    action: String
  }],
  
  // Trigger
  trigger: {
    type: { type: String, enum: ['scheduled', 'manual', 'post_backup', 'policy', 'alert'], default: 'manual' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'RetentionPolicy' },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }
  },
  
  // Notes
  notes: String,
  tags: [String]
}, {
  timestamps: true,
  collection: 'supplychainai_integrity_checks'
});

// Indexes
integrityCheckSchema.index({ backup: 1, createdAt: -1 });
integrityCheckSchema.index({ type: 1, status: 1 });
integrityCheckSchema.index({ startedAt: -1 });

// Generate check ID
integrityCheckSchema.pre('save', function(next) {
  if (!this.checkId) {
    const prefix = 'CHK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.checkId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to start check
integrityCheckSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  this.progress.percentage = 0;
  return this.save();
};

// Method to pass check
integrityCheckSchema.methods.pass = function(result = {}) {
  this.status = 'passed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  this.progress.percentage = 100;
  this.result = { ...this.result, ...result, valid: true };
  return this.save();
};

// Method to fail check
integrityCheckSchema.methods.fail = function(errors, result = {}) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.duration = this.completedAt - this.startedAt;
  this.result = { ...this.result, ...result, valid: false };
  if (errors) {
    this.errors = errors.map(e => ({
      timestamp: new Date(),
      code: e.code || 'INTEGRITY_FAILURE',
      message: e.message,
      file: e.file,
      severity: 'error'
    }));
  }
  return this.save();
};

// Virtual for summary
integrityCheckSchema.virtual('summary').get(function() {
  const corrupted = this.result?.corruptedCount || 0;
  const missing = this.result?.missingCount || 0;
  const valid = this.result?.validCount || 0;
  const total = this.result?.totalCount || 0;
  
  return {
    status: this.status,
    valid,
    issues: corrupted + missing,
    total,
    successRate: total > 0 ? Math.round((valid / total) * 100) : 0
  };
});

module.exports = mongoose.model('IntegrityCheck', integrityCheckSchema);

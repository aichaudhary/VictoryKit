/**
 * Backup Model - Backup Job Management
 * Tracks backup jobs, status, and metadata
 */

const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  backupId: {
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
  
  // Backup Type
  type: {
    type: String,
    required: true,
    enum: ['full', 'incremental', 'differential', 'snapshot', 'mirror', 'synthetic'],
    index: true
  },
  
  // Source Information
  source: {
    type: { 
      type: String, 
      enum: ['database', 'filesystem', 'vm', 'container', 'application', 'cloud', 'email', 'saas'],
      required: true 
    },
    name: String,
    path: String,
    host: String,
    database: String,
    connectionString: String,
    credentials: {
      encrypted: { type: Boolean, default: true },
      keyId: String
    }
  },
  
  // Target Storage
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'StorageLocation', required: true },
  targetPath: String,
  
  // Schedule
  schedule: {
    enabled: { type: Boolean, default: true },
    cron: String, // Cron expression
    timezone: { type: String, default: 'UTC' },
    nextRun: Date,
    lastRun: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused', 'queued'],
    default: 'pending',
    index: true
  },
  
  // Execution Details
  execution: {
    startTime: Date,
    endTime: Date,
    duration: Number, // milliseconds
    progress: { type: Number, min: 0, max: 100, default: 0 },
    currentFile: String,
    filesProcessed: { type: Number, default: 0 },
    filesTotal: { type: Number, default: 0 },
    bytesProcessed: { type: Number, default: 0 },
    bytesTotal: { type: Number, default: 0 }
  },
  
  // Result
  result: {
    success: Boolean,
    sizeBytes: Number,
    sizeCompressed: Number,
    compressionRatio: Number,
    filesCount: Number,
    foldersCount: Number,
    errorCount: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 }
  },
  
  // Integrity
  integrity: {
    checksum: String,
    algorithm: { type: String, enum: ['md5', 'sha1', 'sha256', 'sha512'], default: 'sha256' },
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    lastIntegrityCheck: Date,
    integrityStatus: { type: String, enum: ['valid', 'invalid', 'unknown'], default: 'unknown' }
  },
  
  // Encryption
  encryption: {
    enabled: { type: Boolean, default: true },
    algorithm: { type: String, default: 'AES-256-GCM' },
    keyId: String,
    keyRotation: Date
  },
  
  // Retention
  retention: {
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'RetentionPolicy' },
    expiresAt: Date,
    keepForever: { type: Boolean, default: false },
    legalHold: { type: Boolean, default: false }
  },
  
  // Recovery Point
  recoveryPoint: {
    rpoTarget: Number, // minutes
    rpoActual: Number,
    rpoCompliant: Boolean,
    lastRecoveryTest: Date,
    recoveryTestResult: { type: String, enum: ['passed', 'failed', 'not_tested'], default: 'not_tested' }
  },
  
  // Errors & Logs
  errors: [{
    timestamp: Date,
    code: String,
    message: String,
    file: String,
    severity: { type: String, enum: ['critical', 'error', 'warning', 'info'] }
  }],
  
  // Chain (for incremental/differential)
  chain: {
    parentBackup: { type: mongoose.Schema.Types.ObjectId, ref: 'Backup' },
    chainId: String,
    chainPosition: Number,
    chainLength: Number
  },
  
  // Tags & Organization
  tags: [String],
  category: String,
  priority: { type: String, enum: ['critical', 'high', 'normal', 'low'], default: 'normal' },
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'supplychainai_backups'
});

// Indexes
backupSchema.index({ type: 1, status: 1 });
backupSchema.index({ 'schedule.nextRun': 1 });
backupSchema.index({ 'retention.expiresAt': 1 });
backupSchema.index({ createdAt: -1 });
backupSchema.index({ target: 1 });

// Generate backup ID
backupSchema.pre('save', function(next) {
  if (!this.backupId) {
    const prefix = 'BKP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.backupId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to start backup
backupSchema.methods.start = function() {
  this.status = 'running';
  this.execution.startTime = new Date();
  this.execution.progress = 0;
  return this.save();
};

// Method to complete backup
backupSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.execution.endTime = new Date();
  this.execution.duration = this.execution.endTime - this.execution.startTime;
  this.execution.progress = 100;
  this.result = { ...this.result, ...result, success: true };
  this.schedule.lastRun = new Date();
  return this.save();
};

// Method to fail backup
backupSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.execution.endTime = new Date();
  this.execution.duration = this.execution.endTime - this.execution.startTime;
  this.result.success = false;
  this.errors.push({
    timestamp: new Date(),
    code: error.code || 'UNKNOWN',
    message: error.message,
    severity: 'error'
  });
  return this.save();
};

// Virtual for size display
backupSchema.virtual('sizeDisplay').get(function() {
  const bytes = this.result?.sizeBytes || 0;
  if (bytes >= 1099511627776) return `${(bytes / 1099511627776).toFixed(2)} TB`;
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
});

module.exports = mongoose.model('Backup', backupSchema);

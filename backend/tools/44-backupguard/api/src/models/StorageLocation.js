/**
 * StorageLocation Model - Backup Storage Targets
 * Manages cloud and on-premise backup storage destinations
 */

const mongoose = require('mongoose');

const storageLocationSchema = new mongoose.Schema({
  storageId: {
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
  
  // Storage Type
  type: {
    type: String,
    required: true,
    enum: ['s3', 'azure_blob', 'gcs', 'wasabi', 'backblaze', 'minio', 'nfs', 'smb', 'sftp', 'local', 'tape'],
    index: true
  },
  
  provider: {
    type: String,
    enum: ['aws', 'azure', 'google', 'wasabi', 'backblaze', 'on_premise', 'other'],
    required: true
  },
  
  // Connection Configuration
  config: {
    // Cloud Storage
    bucket: String,
    container: String,
    region: String,
    endpoint: String,
    accessKeyId: String,
    secretAccessKey: { type: String, select: false }, // Hidden by default
    accountName: String,
    accountKey: { type: String, select: false },
    sasToken: { type: String, select: false },
    projectId: String,
    
    // On-Premise
    host: String,
    port: Number,
    path: String,
    share: String,
    username: String,
    password: { type: String, select: false },
    privateKey: { type: String, select: false },
    
    // Common
    useSSL: { type: Boolean, default: true },
    timeout: { type: Number, default: 30000 },
    retryAttempts: { type: Number, default: 3 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'maintenance', 'full'],
    default: 'active',
    index: true
  },
  
  // Connectivity
  connectivity: {
    lastCheck: Date,
    isConnected: Boolean,
    latencyMs: Number,
    errorMessage: String
  },
  
  // Capacity
  capacity: {
    totalBytes: Number,
    usedBytes: Number,
    availableBytes: Number,
    usagePercent: Number,
    lastUpdated: Date,
    quotaBytes: Number,
    quotaWarningPercent: { type: Number, default: 80 },
    quotaCriticalPercent: { type: Number, default: 95 }
  },
  
  // Features
  features: {
    versioning: { type: Boolean, default: false },
    immutable: { type: Boolean, default: false },
    encryption: { type: Boolean, default: true },
    encryptionType: { type: String, enum: ['sse-s3', 'sse-kms', 'sse-c', 'aes-256', 'none'], default: 'aes-256' },
    compression: { type: Boolean, default: true },
    deduplication: { type: Boolean, default: false },
    objectLock: { type: Boolean, default: false },
    crossRegionReplication: { type: Boolean, default: false }
  },
  
  // Storage Class
  storageClass: {
    type: String,
    enum: ['standard', 'infrequent_access', 'archive', 'deep_archive', 'glacier', 'cold', 'hot', 'cool'],
    default: 'standard'
  },
  
  // Lifecycle
  lifecycle: {
    enabled: { type: Boolean, default: false },
    transitionDays: Number,
    transitionClass: String,
    expirationDays: Number
  },
  
  // Statistics
  stats: {
    backupsCount: { type: Number, default: 0 },
    totalDataBytes: { type: Number, default: 0 },
    lastBackupAt: Date,
    successRate: { type: Number, default: 100 },
    avgTransferSpeed: Number // bytes per second
  },
  
  // Cost
  cost: {
    storagePerGBMonth: Number,
    transferPerGB: Number,
    requestsPer1000: Number,
    estimatedMonthlyCost: Number,
    currency: { type: String, default: 'USD' }
  },
  
  // Security
  security: {
    requireMFA: { type: Boolean, default: false },
    ipWhitelist: [String],
    vpcEndpoint: String,
    privateLink: Boolean
  },
  
  // Tags
  tags: [String],
  isDefault: { type: Boolean, default: false },
  
  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'backupguard_storage_locations'
});

// Indexes
storageLocationSchema.index({ type: 1, status: 1 });
storageLocationSchema.index({ provider: 1 });
storageLocationSchema.index({ isDefault: 1 });

// Generate storage ID
storageLocationSchema.pre('save', function(next) {
  if (!this.storageId) {
    const prefix = 'STR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.storageId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to update capacity
storageLocationSchema.methods.updateCapacity = function(used, total) {
  this.capacity.usedBytes = used;
  this.capacity.totalBytes = total;
  this.capacity.availableBytes = total - used;
  this.capacity.usagePercent = Math.round((used / total) * 100);
  this.capacity.lastUpdated = new Date();
  
  if (this.capacity.usagePercent >= this.capacity.quotaCriticalPercent) {
    this.status = 'full';
  }
  
  return this.save();
};

// Method to test connection
storageLocationSchema.methods.testConnection = async function() {
  const startTime = Date.now();
  try {
    // Simulate connection test
    this.connectivity.isConnected = true;
    this.connectivity.latencyMs = Date.now() - startTime;
    this.connectivity.lastCheck = new Date();
    this.connectivity.errorMessage = null;
    return true;
  } catch (error) {
    this.connectivity.isConnected = false;
    this.connectivity.errorMessage = error.message;
    this.connectivity.lastCheck = new Date();
    this.status = 'error';
    return false;
  }
};

// Virtual for display name with provider
storageLocationSchema.virtual('displayName').get(function() {
  return `${this.name} (${this.provider.toUpperCase()})`;
});

// Virtual for usage status
storageLocationSchema.virtual('usageStatus').get(function() {
  const percent = this.capacity.usagePercent || 0;
  if (percent >= this.capacity.quotaCriticalPercent) return 'critical';
  if (percent >= this.capacity.quotaWarningPercent) return 'warning';
  return 'healthy';
});

module.exports = mongoose.model('StorageLocation', storageLocationSchema);

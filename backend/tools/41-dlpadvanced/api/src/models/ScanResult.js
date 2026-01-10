const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: true,
    unique: true,
    default: () => `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Scan Configuration
  scanType: {
    type: String,
    enum: ['full', 'quick', 'targeted', 'scheduled', 'on_demand'],
    required: true
  },
  scanScope: {
    type: String,
    enum: ['organization', 'department', 'user', 'folder', 'specific'],
    required: true
  },
  
  // Target Information
  targets: [{
    type: {
      type: String,
      enum: ['file_system', 'database', 'cloud_storage', 'email', 'sharepoint', 'network_share']
    },
    path: String,
    included: Boolean,
    excluded: Boolean
  }],
  
  // Filter Criteria
  filters: {
    fileTypes: [String],
    minSize: Number,
    maxSize: Number,
    modifiedAfter: Date,
    modifiedBefore: Date,
    owners: [String],
    classifications: [String]
  },
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // milliseconds
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Results Summary
  statistics: {
    locationsScanned: Number,
    filesScanned: Number,
    totalSizeScanned: Number, // bytes
    filesProcessed: Number,
    filesSkipped: Number,
    errors: Number
  },
  
  // Sensitive Data Found
  sensitiveFound: {
    count: Number,
    breakdown: {
      public: { type: Number, default: 0 },
      internal: { type: Number, default: 0 },
      confidential: { type: Number, default: 0 },
      restricted: { type: Number, default: 0 }
    },
    dataTypes: [{
      type: String,
      count: Number,
      totalSize: Number
    }]
  },
  
  // Detailed Findings
  findings: [{
    fileId: String,
    path: String,
    classification: String,
    dataTypes: [String],
    confidence: Number,
    riskScore: Number,
    size: Number,
    owner: String
  }],
  
  // New Discoveries
  newFiles: Number,
  modifiedFiles: Number,
  deletedFiles: Number,
  
  // Performance Metrics
  performance: {
    filesPerSecond: Number,
    bytesPerSecond: Number,
    avgProcessingTime: Number, // ms per file
    peakMemoryUsage: Number,
    cpuUsage: Number
  },
  
  // Errors and Warnings
  errors: [{
    timestamp: Date,
    location: String,
    errorType: String,
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  warnings: [{
    message: String,
    count: Number
  }],
  
  // Configuration
  configuration: {
    mlEnabled: Boolean,
    ocrEnabled: Boolean,
    deepScan: Boolean,
    parallelThreads: Number,
    maxFileSize: Number,
    timeout: Number
  },
  
  // Initiated By
  initiatedBy: {
    userId: String,
    name: String,
    trigger: {
      type: String,
      enum: ['manual', 'scheduled', 'policy', 'api', 'event']
    }
  },
  
  // Schedule Information (for recurring scans)
  schedule: {
    recurring: Boolean,
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'custom']
    },
    nextRun: Date,
    lastRun: Date
  },
  
  // Comparison with Previous Scan
  comparison: {
    previousScanId: String,
    newSensitiveFiles: Number,
    removedSensitiveFiles: Number,
    reclassifiedFiles: Number,
    riskIncreased: Number,
    riskDecreased: Number
  },
  
  // Actions Taken
  autoActions: [{
    action: String,
    filesAffected: Number,
    timestamp: Date
  }],
  
  // Export and Reporting
  reportGenerated: Boolean,
  reportPath: String,
  exportedAt: Date,
  
  // Tags
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
scanResultSchema.index({ scanId: 1 });
scanResultSchema.index({ status: 1 });
scanResultSchema.index({ scanType: 1 });
scanResultSchema.index({ startTime: -1 });
scanResultSchema.index({ 'initiatedBy.userId': 1 });

// Methods
scanResultSchema.methods.updateProgress = function(progress) {
  this.progress = Math.min(Math.max(progress, 0), 100);
  if (progress >= 100) {
    this.status = 'completed';
    this.endTime = new Date();
    this.duration = this.endTime - this.startTime;
  }
  return this.save();
};

scanResultSchema.methods.addFinding = function(finding) {
  this.findings.push(finding);
  this.sensitiveFound.count = this.findings.length;
  
  // Update breakdown
  const classKey = finding.classification.toLowerCase();
  if (this.sensitiveFound.breakdown[classKey] !== undefined) {
    this.sensitiveFound.breakdown[classKey] += 1;
  }
  
  return this.save();
};

scanResultSchema.methods.addError = function(location, errorType, message, severity = 'medium') {
  this.errors.push({
    timestamp: new Date(),
    location,
    errorType,
    message,
    severity
  });
  this.statistics.errors += 1;
  return this.save();
};

scanResultSchema.methods.complete = function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.progress = 100;
  
  // Calculate performance metrics
  if (this.duration > 0) {
    this.performance.filesPerSecond = (this.statistics.filesScanned / (this.duration / 1000)).toFixed(2);
    this.performance.bytesPerSecond = (this.statistics.totalSizeScanned / (this.duration / 1000)).toFixed(2);
    this.performance.avgProcessingTime = (this.duration / this.statistics.filesScanned).toFixed(2);
  }
  
  return this.save();
};

scanResultSchema.methods.fail = function(reason) {
  this.status = 'failed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.notes = reason;
  return this.save();
};

scanResultSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  return this.save();
};

// Statics
scanResultSchema.statics.getRecentScans = function(limit = 10) {
  return this.find()
    .sort({ startTime: -1 })
    .limit(limit);
};

scanResultSchema.statics.getCompletedScans = function() {
  return this.find({ status: 'completed' })
    .sort({ endTime: -1 });
};

scanResultSchema.statics.getRunningScans = function() {
  return this.find({ status: { $in: ['pending', 'running'] } });
};

scanResultSchema.statics.getStatistics = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        totalFilesScanned: { $sum: '$statistics.filesScanned' },
        totalSensitiveFound: { $sum: '$sensitiveFound.count' },
        avgDuration: { $avg: '$duration' },
        totalErrors: { $sum: '$statistics.errors' }
      }
    }
  ]);
};

scanResultSchema.statics.compareWithPrevious = async function(currentScanId) {
  const currentScan = await this.findOne({ scanId: currentScanId });
  if (!currentScan) return null;
  
  const previousScan = await this.findOne({
    scanType: currentScan.scanType,
    status: 'completed',
    scanId: { $ne: currentScanId }
  }).sort({ endTime: -1 });
  
  if (!previousScan) return null;
  
  currentScan.comparison = {
    previousScanId: previousScan.scanId,
    newSensitiveFiles: currentScan.sensitiveFound.count - previousScan.sensitiveFound.count,
    removedSensitiveFiles: 0, // Would need more complex logic
    reclassifiedFiles: 0,
    riskIncreased: 0,
    riskDecreased: 0
  };
  
  await currentScan.save();
  return currentScan.comparison;
};

module.exports = mongoose.model('ScanResult', scanResultSchema);

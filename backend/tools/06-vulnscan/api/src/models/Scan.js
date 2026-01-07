/**
 * Scan Model
 * Vulnerability Scan Execution & Management
 * 
 * Manages scan execution, scheduling, results, and performance tracking
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const targetSchema = new Schema({
  type: { type: String, enum: ['ip', 'cidr', 'domain', 'url', 'hostname', 'asset_id'], required: true },
  value: { type: String, required: true },
  asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
  ports: [Number],
  excluded: { type: Boolean, default: false }
}, { _id: false });

const credentialSchema = new Schema({
  type: { type: String, enum: ['ssh', 'winrm', 'snmp', 'smb', 'http', 'database', 'api_key'] },
  username: String,
  // Note: In production, passwords should be encrypted
  passwordHash: String,
  privateKey: String,
  domain: String,
  port: Number
}, { _id: false });

const scanSchema = new Schema({
  // Identification
  scanId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Scan Type & Method
  scanType: {
    type: String,
    required: true,
    enum: [
      'network',
      'web_application',
      'database',
      'api',
      'cloud',
      'container',
      'mobile',
      'compliance',
      'configuration',
      'vulnerability_assessment',
      'penetration_test',
      'internal',
      'external',
      'authenticated',
      'unauthenticated'
    ],
    index: true
  },
  scanMethod: {
    type: String,
    enum: ['authenticated', 'unauthenticated', 'agent_based', 'agentless', 'hybrid'],
    default: 'unauthenticated'
  },
  
  // Scan Profile
  profile: {
    name: { type: String, required: true },
    type: { type: String, enum: ['quick', 'full', 'deep', 'custom', 'compliance'], default: 'full' },
    depth: { type: String, enum: ['light', 'moderate', 'aggressive'], default: 'moderate' },
    // Specific checks to enable
    checks: {
      ports: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      os: { type: Boolean, default: true },
      vulnerabilities: { type: Boolean, default: true },
      misconfigurations: { type: Boolean, default: true },
      compliance: { type: Boolean, default: false },
      webApplications: { type: Boolean, default: false },
      ssl: { type: Boolean, default: true },
      credentials: { type: Boolean, default: false }
    },
    // CVE filters
    cveFilters: {
      minSeverity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'informational'] },
      exploitable: Boolean,
      patchAvailable: Boolean,
      categories: [String]
    }
  },
  
  // Targets
  targets: [targetSchema],
  targetCount: { type: Number, default: 0 },
  excludedTargets: [String],
  
  // Credentials (for authenticated scanning)
  credentials: [credentialSchema],
  
  // Scope & Configuration
  scope: {
    portRange: { type: String, default: '1-65535' },
    maxHosts: Number,
    maxDuration: Number, // minutes
    networkThrottle: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'low' },
    followRedirects: { type: Boolean, default: true },
    maxConcurrency: { type: Number, default: 10 }
  },
  
  // Scanner Configuration
  scanner: {
    engine: { 
      type: String, 
      enum: ['nmap', 'openvas', 'nessus', 'qualys', 'rapid7', 'acunetix', 'burp', 'custom'],
      required: true
    },
    version: String,
    plugins: [String],
    customOptions: { type: Map, of: String }
  },
  
  // Execution
  status: {
    type: String,
    required: true,
    enum: [
      'queued',
      'initializing',
      'running',
      'paused',
      'completed',
      'completed_with_errors',
      'failed',
      'cancelled',
      'timeout'
    ],
    default: 'queued',
    index: true
  },
  
  // Timing
  timing: {
    scheduled: Date,
    started: Date,
    paused: Date,
    resumed: Date,
    completed: Date,
    duration: Number, // seconds
    estimatedCompletion: Date
  },
  
  // Progress
  progress: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    hostsScanned: { type: Number, default: 0 },
    totalHosts: { type: Number, default: 0 },
    portsScanned: { type: Number, default: 0 },
    totalPorts: { type: Number, default: 0 },
    checksCompleted: { type: Number, default: 0 },
    totalChecks: { type: Number, default: 0 },
    currentPhase: String,
    currentTarget: String
  },
  
  // Results Summary
  results: {
    assetsDiscovered: { type: Number, default: 0 },
    hostsReachable: { type: Number, default: 0 },
    hostsUnreachable: { type: Number, default: 0 },
    servicesDiscovered: { type: Number, default: 0 },
    vulnerabilitiesFound: {
      total: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      informational: { type: Number, default: 0 }
    },
    newVulnerabilities: { type: Number, default: 0 },
    remediatedVulnerabilities: { type: Number, default: 0 }
  },
  
  // Discovered Assets
  discoveredAssets: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
    ip: String,
    hostname: String,
    os: String,
    services: [String],
    openPorts: [Number],
    vulnerabilitiesCount: Number
  }],
  
  // Discovered Vulnerabilities
  vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }],
  
  // Performance Metrics
  performance: {
    scanSpeed: Number, // hosts per minute
    networkBandwidth: Number, // MB/s
    cpuUsage: Number, // percentage
    memoryUsage: Number, // MB
    packetsSent: Number,
    packetsReceived: Number,
    averageResponseTime: Number // ms
  },
  
  // Errors & Warnings
  errors: [{
    timestamp: { type: Date, default: Date.now },
    severity: { type: String, enum: ['error', 'warning', 'info'] },
    target: String,
    message: String,
    details: String,
    code: String
  }],
  errorCount: { type: Number, default: 0 },
  warningCount: { type: Number, default: 0 },
  
  // Notifications
  notifications: {
    onStart: { type: Boolean, default: false },
    onComplete: { type: Boolean, default: true },
    onError: { type: Boolean, default: true },
    onCriticalVulns: { type: Boolean, default: true },
    recipients: [String], // email addresses
    webhooks: [String],
    slackChannels: [String]
  },
  
  // Scheduling (for recurring scans)
  schedule: {
    isRecurring: { type: Boolean, default: false },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'ScanSchedule' },
    recurrence: {
      frequency: { type: String, enum: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly'] },
      interval: Number,
      dayOfWeek: Number,
      dayOfMonth: Number,
      hour: Number,
      minute: Number
    },
    nextRun: Date,
    lastRun: Date
  },
  
  // Comparison (with previous scans)
  comparison: {
    baselineScan: { type: Schema.Types.ObjectId, ref: 'Scan' },
    previousScan: { type: Schema.Types.ObjectId, ref: 'Scan' },
    changes: {
      newAssets: Number,
      removedAssets: Number,
      newVulns: Number,
      fixedVulns: Number,
      increasedRisk: Number,
      decreasedRisk: Number
    }
  },
  
  // Compliance (if compliance scan)
  compliance: {
    framework: { type: String, enum: ['pci-dss', 'hipaa', 'soc2', 'iso27001', 'nist', 'cis', 'gdpr', 'fedramp'] },
    version: String,
    controls: [{
      controlId: String,
      status: { type: String, enum: ['pass', 'fail', 'warning', 'not_applicable'] },
      score: Number
    }],
    overallScore: Number,
    passed: Number,
    failed: Number,
    warnings: Number
  },
  
  // Reports
  reports: [{
    reportId: { type: Schema.Types.ObjectId, ref: 'VulnReport' },
    type: String,
    format: String,
    generatedAt: Date,
    url: String
  }],
  
  // Execution Context
  initiator: {
    userId: String,
    username: String,
    source: { type: String, enum: ['manual', 'scheduled', 'api', 'webhook', 'integration'] }
  },
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes & Comments
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Raw Output (optional, for debugging)
  rawOutput: {
    stored: { type: Boolean, default: false },
    path: String,
    size: Number
  },
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'scans'
});

// Indexes
scanSchema.index({ scanId: 1 });
scanSchema.index({ scanType: 1 });
scanSchema.index({ status: 1 });
scanSchema.index({ 'timing.started': -1 });
scanSchema.index({ 'timing.scheduled': 1 });
scanSchema.index({ 'initiator.userId': 1 });
scanSchema.index({ tags: 1 });

// Virtual for is complete
scanSchema.virtual('isComplete').get(function() {
  return ['completed', 'completed_with_errors', 'failed', 'cancelled'].includes(this.status);
});

// Virtual for is running
scanSchema.virtual('isRunning').get(function() {
  return ['initializing', 'running'].includes(this.status);
});

// Virtual for duration in minutes
scanSchema.virtual('durationMinutes').get(function() {
  if (!this.timing.duration) return 0;
  return Math.round(this.timing.duration / 60);
});

// Method: Start scan
scanSchema.methods.start = function() {
  this.status = 'running';
  this.timing.started = new Date();
  this.progress.currentPhase = 'Discovery';
};

// Method: Pause scan
scanSchema.methods.pause = function() {
  if (this.status === 'running') {
    this.status = 'paused';
    this.timing.paused = new Date();
  }
};

// Method: Resume scan
scanSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'running';
    this.timing.resumed = new Date();
  }
};

// Method: Complete scan
scanSchema.methods.complete = function(hasErrors = false) {
  this.status = hasErrors ? 'completed_with_errors' : 'completed';
  this.timing.completed = new Date();
  this.progress.percentage = 100;
  
  if (this.timing.started) {
    this.timing.duration = Math.floor((this.timing.completed - this.timing.started) / 1000);
  }
};

// Method: Cancel scan
scanSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.timing.completed = new Date();
  
  if (this.timing.started) {
    this.timing.duration = Math.floor((this.timing.completed - this.timing.started) / 1000);
  }
};

// Method: Fail scan
scanSchema.methods.fail = function(errorMessage) {
  this.status = 'failed';
  this.timing.completed = new Date();
  
  if (errorMessage) {
    this.errors.push({
      severity: 'error',
      message: errorMessage,
      timestamp: new Date()
    });
    this.errorCount++;
  }
};

// Method: Update progress
scanSchema.methods.updateProgress = function(progressData) {
  Object.assign(this.progress, progressData);
  
  // Calculate percentage
  if (this.progress.totalChecks > 0) {
    this.progress.percentage = Math.min(
      100,
      Math.round((this.progress.checksCompleted / this.progress.totalChecks) * 100)
    );
  }
};

// Method: Add error
scanSchema.methods.addError = function(error) {
  this.errors.push({
    timestamp: new Date(),
    severity: error.severity || 'error',
    target: error.target,
    message: error.message,
    details: error.details,
    code: error.code
  });
  
  if (error.severity === 'error') {
    this.errorCount++;
  } else if (error.severity === 'warning') {
    this.warningCount++;
  }
};

// Method: Get results summary
scanSchema.methods.getResultsSummary = function() {
  return {
    scanId: this.scanId,
    name: this.name,
    type: this.scanType,
    status: this.status,
    started: this.timing.started,
    completed: this.timing.completed,
    duration: this.timing.duration,
    assetsScanned: this.results.assetsDiscovered,
    vulnerabilities: this.results.vulnerabilitiesFound,
    errors: this.errorCount,
    warnings: this.warningCount
  };
};

// Static: Find active scans
scanSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['queued', 'initializing', 'running', 'paused'] }
  }).sort({ 'timing.started': -1 });
};

// Static: Find recent scans
scanSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ 'timing.started': -1 })
    .limit(limit);
};

// Static: Find scans by type
scanSchema.statics.findByType = function(scanType) {
  return this.find({ scanType }).sort({ 'timing.started': -1 });
};

// Static: Get scan statistics
scanSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$scanType', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalScans: { $sum: 1 },
              avgDuration: { $avg: '$timing.duration' },
              totalVulns: { $sum: '$results.vulnerabilitiesFound.total' },
              totalAssets: { $sum: '$results.assetsDiscovered' }
            }
          }
        ],
        recentVulns: [
          { $match: { 'timing.started': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          {
            $group: {
              _id: null,
              critical: { $sum: '$results.vulnerabilitiesFound.critical' },
              high: { $sum: '$results.vulnerabilitiesFound.high' },
              medium: { $sum: '$results.vulnerabilitiesFound.medium' },
              low: { $sum: '$results.vulnerabilitiesFound.low' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
scanSchema.pre('save', function(next) {
  // Update target count
  this.targetCount = this.targets.length;
  
  // Calculate progress percentage
  if (this.progress.totalHosts > 0) {
    const hostProgress = (this.progress.hostsScanned / this.progress.totalHosts) * 100;
    this.progress.percentage = Math.min(100, Math.round(hostProgress));
  }
  
  next();
});

const Scan = mongoose.model('Scan', scanSchema);

module.exports = Scan;

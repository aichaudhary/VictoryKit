/**
 * VulnScan - Scan Model
 * Comprehensive vulnerability scan tracking and results management
 */

const mongoose = require('mongoose');

// Scan Target Sub-schema
const scanTargetSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VulnScanAsset'
  },
  targetType: {
    type: String,
    enum: ['IP', 'IP_RANGE', 'CIDR', 'HOSTNAME', 'URL', 'CONTAINER_IMAGE', 'CLOUD_RESOURCE', 'NETWORK', 'ASSET_GROUP'],
    required: true
  },
  target: {
    type: String,
    required: true
  },
  credentials: {
    type: { type: String, enum: ['SSH', 'WINRM', 'SNMP', 'HTTP_BASIC', 'HTTP_FORM', 'API_KEY', 'DATABASE', 'CUSTOM'] },
    credentialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Credential' },
    username: String,
    authMethod: String
  },
  exclusions: [String],
  options: mongoose.Schema.Types.Mixed
}, { _id: false });

// Scan Configuration Sub-schema
const scanConfigSchema = new mongoose.Schema({
  // Port Configuration
  ports: {
    mode: {
      type: String,
      enum: ['TOP_100', 'TOP_1000', 'ALL', 'CUSTOM'],
      default: 'TOP_1000'
    },
    customPorts: [Number],
    excludePorts: [Number]
  },
  
  // Scan Depth & Speed
  depth: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  },
  intensity: {
    type: String,
    enum: ['STEALTH', 'LIGHT', 'NORMAL', 'AGGRESSIVE', 'INSANE'],
    default: 'NORMAL'
  },
  timing: {
    type: Number,
    min: 0,
    max: 5,
    default: 3,
    description: 'Nmap timing template (T0-T5)'
  },
  
  // Concurrent Scanning
  maxConcurrentTargets: {
    type: Number,
    default: 10
  },
  maxConcurrentChecks: {
    type: Number,
    default: 50
  },
  connectionTimeout: {
    type: Number,
    default: 30000,
    description: 'Connection timeout in ms'
  },
  requestTimeout: {
    type: Number,
    default: 60000
  },
  
  // Scan Features
  features: {
    portScan: { type: Boolean, default: true },
    serviceDetection: { type: Boolean, default: true },
    osDetection: { type: Boolean, default: true },
    vulnerabilityCheck: { type: Boolean, default: true },
    complianceCheck: { type: Boolean, default: false },
    webCrawling: { type: Boolean, default: false },
    sslAnalysis: { type: Boolean, default: true },
    bruteForce: { type: Boolean, default: false }
  },
  
  // Web Scanning Options
  webOptions: {
    crawlDepth: { type: Number, default: 3 },
    maxPages: { type: Number, default: 500 },
    followRedirects: { type: Boolean, default: true },
    respectRobotsTxt: { type: Boolean, default: true },
    userAgent: String,
    authentication: {
      enabled: Boolean,
      type: { type: String, enum: ['BASIC', 'FORM', 'BEARER', 'OAUTH2'] },
      loginUrl: String,
      logoutUrl: String,
      credentials: mongoose.Schema.Types.Mixed
    },
    scope: {
      includePatterns: [String],
      excludePatterns: [String]
    }
  },
  
  // Vulnerability Checking
  vulnerabilityOptions: {
    checkCategories: [{
      type: String,
      enum: [
        'INJECTION', 'XSS', 'BROKEN_AUTH', 'SENSITIVE_DATA', 'XXE',
        'BROKEN_ACCESS', 'SECURITY_MISCONFIG', 'INSECURE_DESERIALIZATION',
        'VULNERABLE_COMPONENTS', 'INSUFFICIENT_LOGGING', 'SSRF', 'ALL'
      ]
    }],
    severityThreshold: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'],
      default: 'INFORMATIONAL'
    },
    exploitableOnly: { type: Boolean, default: false },
    checkNucleiTemplates: { type: Boolean, default: true },
    customTemplates: [String],
    cveYearRange: {
      from: Number,
      to: Number
    }
  },
  
  // Container Scanning
  containerOptions: {
    scanLayers: { type: Boolean, default: true },
    checkSecrets: { type: Boolean, default: true },
    checkConfigs: { type: Boolean, default: true },
    sbomGeneration: { type: Boolean, default: false },
    ignoreUnfixed: { type: Boolean, default: false }
  },
  
  // Cloud Scanning
  cloudOptions: {
    regions: [String],
    resourceTypes: [String],
    checkIam: { type: Boolean, default: true },
    checkNetworking: { type: Boolean, default: true },
    checkStorage: { type: Boolean, default: true },
    checkEncryption: { type: Boolean, default: true },
    checkLogging: { type: Boolean, default: true }
  },
  
  // Compliance Framework
  compliance: {
    enabled: { type: Boolean, default: false },
    frameworks: [{
      type: String,
      enum: ['PCI_DSS', 'HIPAA', 'SOC2', 'ISO27001', 'NIST', 'CIS', 'GDPR']
    }],
    customPolicies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ScanPolicy' }]
  },
  
  // Notifications
  notifications: {
    onStart: { type: Boolean, default: false },
    onComplete: { type: Boolean, default: true },
    onCritical: { type: Boolean, default: true },
    channels: [{
      type: { type: String, enum: ['EMAIL', 'SLACK', 'TEAMS', 'WEBHOOK', 'PAGERDUTY'] },
      target: String
    }]
  }
}, { _id: false });

// Discovered Service Sub-schema
const discoveredServiceSchema = new mongoose.Schema({
  port: { type: Number, required: true },
  protocol: { type: String, enum: ['TCP', 'UDP', 'SCTP'], default: 'TCP' },
  state: { type: String, enum: ['OPEN', 'CLOSED', 'FILTERED', 'OPEN|FILTERED'], default: 'OPEN' },
  service: String,
  product: String,
  version: String,
  extraInfo: String,
  cpe: [String],
  scripts: [{
    name: String,
    output: String
  }],
  vulnerabilities: [{
    vulnId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanVulnerability' },
    cve: String,
    severity: String
  }]
}, { _id: false });

// Scan Finding Sub-schema
const scanFindingSchema = new mongoose.Schema({
  findingId: {
    type: String,
    required: true
  },
  vulnerabilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VulnScanVulnerability'
  },
  cve: String,
  cwe: String,
  title: {
    type: String,
    required: true
  },
  description: String,
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'],
    required: true
  },
  cvssScore: Number,
  cvssVector: String,
  confidence: {
    type: String,
    enum: ['CONFIRMED', 'LIKELY', 'POSSIBLE', 'UNCONFIRMED'],
    default: 'LIKELY'
  },
  affectedComponent: {
    host: String,
    port: Number,
    protocol: String,
    service: String,
    path: String,
    parameter: String,
    method: String
  },
  evidence: {
    type: { type: String },
    data: String,
    request: String,
    response: String,
    screenshot: String
  },
  remediation: {
    solution: String,
    references: [String],
    effort: String
  },
  falsePositive: {
    isFalsePositive: { type: Boolean, default: false },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedAt: Date,
    reason: String
  },
  status: {
    type: String,
    enum: ['NEW', 'EXISTING', 'RESOLVED', 'FALSE_POSITIVE'],
    default: 'NEW'
  },
  firstDetected: Date,
  scanner: String,
  templateId: String
}, { _id: true });

// Scan Progress Sub-schema
const scanProgressSchema = new mongoose.Schema({
  phase: {
    type: String,
    enum: ['INITIALIZING', 'DISCOVERY', 'PORT_SCANNING', 'SERVICE_DETECTION', 'VULNERABILITY_SCANNING', 'WEB_CRAWLING', 'COMPLIANCE_CHECK', 'ANALYSIS', 'REPORTING', 'COMPLETED', 'FAILED'],
    default: 'INITIALIZING'
  },
  percentComplete: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  targetsTotal: { type: Number, default: 0 },
  targetsCompleted: { type: Number, default: 0 },
  checksTotal: { type: Number, default: 0 },
  checksCompleted: { type: Number, default: 0 },
  currentTarget: String,
  currentCheck: String,
  estimatedTimeRemaining: Number,
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'] },
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  errors: [{
    timestamp: { type: Date, default: Date.now },
    target: String,
    error: String,
    recoverable: Boolean
  }]
}, { _id: false });

// Scan Summary Sub-schema
const scanSummarySchema = new mongoose.Schema({
  totalTargets: { type: Number, default: 0 },
  scannedTargets: { type: Number, default: 0 },
  failedTargets: { type: Number, default: 0 },
  totalPorts: { type: Number, default: 0 },
  openPorts: { type: Number, default: 0 },
  servicesDiscovered: { type: Number, default: 0 },
  totalVulnerabilities: { type: Number, default: 0 },
  newVulnerabilities: { type: Number, default: 0 },
  resolvedVulnerabilities: { type: Number, default: 0 },
  criticalCount: { type: Number, default: 0 },
  highCount: { type: Number, default: 0 },
  mediumCount: { type: Number, default: 0 },
  lowCount: { type: Number, default: 0 },
  informationalCount: { type: Number, default: 0 },
  exploitableCount: { type: Number, default: 0 },
  avgCvssScore: { type: Number, default: 0 },
  maxCvssScore: { type: Number, default: 0 },
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL', 'NONE']
  },
  complianceStatus: [{
    framework: String,
    status: { type: String, enum: ['PASS', 'FAIL', 'PARTIAL', 'NOT_APPLICABLE'] },
    passedChecks: Number,
    failedChecks: Number,
    totalChecks: Number,
    score: Number
  }]
}, { _id: false });

// ML Analysis Sub-schema
const mlAnalysisSchema = new mongoose.Schema({
  riskPrediction: {
    level: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
    score: Number,
    confidence: Number
  },
  topRisks: [{
    vulnId: String,
    cve: String,
    riskScore: Number,
    factors: [String]
  }],
  recommendations: [{
    priority: Number,
    category: String,
    recommendation: String,
    impact: String
  }],
  trendAnalysis: {
    direction: { type: String, enum: ['IMPROVING', 'STABLE', 'DEGRADING'] },
    comparison: {
      previousScan: {
        scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' },
        riskScore: Number,
        vulnCount: Number
      }
    },
    metrics: {
      mttr: Number,
      detectionRate: Number,
      falsePositiveRate: Number
    }
  },
  anomalies: [{
    type: { type: String },
    description: String,
    severity: String,
    confidence: Number
  }],
  analyzedAt: Date
}, { _id: false });

// Main Scan Schema
const scanSchema = new mongoose.Schema({
  // Identifiers
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Organization Context
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Scan Information
  name: {
    type: String,
    required: true
  },
  description: String,
  scanType: {
    type: String,
    enum: ['NETWORK', 'WEB_APPLICATION', 'API', 'CONTAINER', 'CLOUD', 'COMPLIANCE', 'FULL', 'CUSTOM'],
    required: true,
    index: true
  },
  scanProfile: {
    type: String,
    enum: ['QUICK', 'STANDARD', 'COMPREHENSIVE', 'PCI_DSS', 'HIPAA', 'PENETRATION', 'CUSTOM'],
    default: 'STANDARD'
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanPolicy'
  },

  // Targets
  targets: [scanTargetSchema],
  targetCount: {
    type: Number,
    default: 0
  },

  // Configuration
  config: scanConfigSchema,

  // Scheduling
  schedule: {
    isScheduled: { type: Boolean, default: false },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScanSchedule' },
    scheduledAt: Date,
    recurrence: {
      type: { type: String, enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] },
      cronExpression: String,
      nextRun: Date
    }
  },

  // Status
  status: {
    type: String,
    enum: ['PENDING', 'QUEUED', 'INITIALIZING', 'RUNNING', 'PAUSED', 'COMPLETING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT'],
    default: 'PENDING',
    index: true
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    reason: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Progress
  progress: scanProgressSchema,

  // Timing
  queuedAt: Date,
  startedAt: Date,
  completedAt: Date,
  duration: {
    type: Number,
    description: 'Duration in seconds'
  },
  timeout: {
    type: Number,
    default: 86400000,
    description: 'Timeout in ms (default 24 hours)'
  },

  // Results
  findings: [scanFindingSchema],
  findingsCount: {
    type: Number,
    default: 0
  },
  discoveredServices: [{
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' },
    target: String,
    services: [discoveredServiceSchema]
  }],
  osDetections: [{
    target: String,
    os: String,
    version: String,
    confidence: Number,
    cpe: String
  }],

  // Summary
  summary: scanSummarySchema,

  // ML Analysis
  mlAnalysis: mlAnalysisSchema,

  // Reports
  reports: [{
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanReport' },
    type: String,
    format: String,
    generatedAt: Date,
    url: String
  }],

  // Raw Data Storage
  rawData: {
    nmapOutput: String,
    nucleiOutput: String,
    customScannerOutput: mongoose.Schema.Types.Mixed,
    storageUrl: String
  },

  // Engine Information
  scanEngine: {
    engines: [{
      name: String,
      version: String,
      templates: Number
    }],
    workerId: String,
    workerNode: String
  },

  // Integration
  triggeredBy: {
    type: { type: String, enum: ['MANUAL', 'SCHEDULE', 'CI_CD', 'API', 'WEBHOOK', 'EVENT'] },
    source: String,
    reference: String
  },
  integrationRefs: {
    cicdBuildId: String,
    cicdPipelineId: String,
    commitHash: String,
    pullRequestId: String
  },

  // Tags
  tags: [String],
  labels: [{
    key: String,
    value: String
  }],

  // Notes
  notes: String,

  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'vulnscan_scans'
});

// Indexes
scanSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
scanSchema.index({ organizationId: 1, scanType: 1 });
scanSchema.index({ 'schedule.scheduleId': 1 });
scanSchema.index({ startedAt: -1 });
scanSchema.index({ 'summary.riskScore': -1 });
scanSchema.index({ tags: 1 });
scanSchema.index({ 'targets.assetId': 1 });
scanSchema.index({ 'triggeredBy.type': 1 });

// Virtual for risk level
scanSchema.virtual('calculatedRiskLevel').get(function() {
  const score = this.summary?.riskScore;
  if (!score) return 'NONE';
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'INFORMATIONAL';
});

// Method to update progress
scanSchema.methods.updateProgress = function(progressData) {
  Object.assign(this.progress, progressData);
  return this.save();
};

// Method to add finding
scanSchema.methods.addFinding = function(finding) {
  this.findings.push(finding);
  this.findingsCount = this.findings.length;
  return this.save();
};

// Method to calculate summary
scanSchema.methods.calculateSummary = function() {
  const findings = this.findings;
  
  this.summary = {
    ...this.summary,
    totalVulnerabilities: findings.length,
    criticalCount: findings.filter(f => f.severity === 'CRITICAL').length,
    highCount: findings.filter(f => f.severity === 'HIGH').length,
    mediumCount: findings.filter(f => f.severity === 'MEDIUM').length,
    lowCount: findings.filter(f => f.severity === 'LOW').length,
    informationalCount: findings.filter(f => f.severity === 'INFORMATIONAL').length,
    newVulnerabilities: findings.filter(f => f.status === 'NEW').length
  };
  
  // Calculate risk score
  const weights = { CRITICAL: 10, HIGH: 5, MEDIUM: 2, LOW: 1, INFORMATIONAL: 0 };
  let totalWeight = 0;
  findings.forEach(f => {
    totalWeight += weights[f.severity] || 0;
  });
  
  this.summary.riskScore = Math.min(Math.round(totalWeight / Math.max(this.targetCount, 1) * 10), 100);
  this.summary.riskLevel = this.calculatedRiskLevel;
  
  // Average CVSS
  const cvssScores = findings.map(f => f.cvssScore).filter(s => s);
  if (cvssScores.length > 0) {
    this.summary.avgCvssScore = cvssScores.reduce((a, b) => a + b, 0) / cvssScores.length;
    this.summary.maxCvssScore = Math.max(...cvssScores);
  }
  
  return this;
};

// Pre-save hook
scanSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  
  if (this.status === 'COMPLETED' && this.startedAt) {
    this.duration = Math.round((new Date() - this.startedAt) / 1000);
  }
  
  this.targetCount = this.targets?.length || 0;
  this.findingsCount = this.findings?.length || 0;
  
  next();
});

// Static method for recent scans
scanSchema.statics.getRecentScans = async function(organizationId, limit = 10) {
  return this.find({
    organizationId,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('scanId name scanType status summary.riskScore summary.totalVulnerabilities startedAt duration');
};

// Static method for scan statistics
scanSchema.statics.getStatistics = async function(organizationId, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        createdAt: { $gte: startDate },
        status: 'COMPLETED'
      }
    },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgRiskScore: { $avg: '$summary.riskScore' },
        totalVulns: { $sum: '$summary.totalVulnerabilities' },
        criticalVulns: { $sum: '$summary.criticalCount' },
        highVulns: { $sum: '$summary.highCount' }
      }
    }
  ]);
};

module.exports = mongoose.model('VulnScan', scanSchema);

/**
 * VulnScan - Report Model
 * Comprehensive vulnerability reporting with multiple formats and templates
 */

const mongoose = require('mongoose');

// Report Section Sub-schema
const reportSectionSchema = new mongoose.Schema({
  sectionId: String,
  name: String,
  order: Number,
  included: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ['SUMMARY', 'VULNERABILITIES', 'ASSETS', 'COMPLIANCE', 'TRENDS', 'RECOMMENDATIONS', 'TECHNICAL', 'APPENDIX', 'CUSTOM']
  },
  content: mongoose.Schema.Types.Mixed,
  charts: [{
    chartId: String,
    type: { type: String, enum: ['PIE', 'BAR', 'LINE', 'GAUGE', 'TABLE', 'HEATMAP'] },
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  tables: [{
    tableId: String,
    title: String,
    columns: [String],
    data: [[mongoose.Schema.Types.Mixed]]
  }]
}, { _id: false });

// Report Filter Sub-schema
const reportFilterSchema = new mongoose.Schema({
  dateRange: {
    start: Date,
    end: Date
  },
  severities: [{
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL']
  }],
  statuses: [{
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'RISK_ACCEPTED', 'FALSE_POSITIVE']
  }],
  assetTypes: [String],
  assetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' }],
  assetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AssetGroup' }],
  environments: [String],
  tags: [String],
  cveIds: [String],
  categories: [String],
  complianceFrameworks: [String],
  scanIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' }],
  exploitableOnly: Boolean,
  customFilters: mongoose.Schema.Types.Mixed
}, { _id: false });

// Distribution Configuration Sub-schema
const distributionConfigSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['EMAIL', 'SLACK', 'TEAMS', 'STORAGE', 'WEBHOOK', 'API'],
    required: true
  },
  enabled: { type: Boolean, default: true },
  
  // Email configuration
  email: {
    recipients: [String],
    cc: [String],
    bcc: [String],
    subject: String,
    bodyTemplate: String,
    attachReport: { type: Boolean, default: true }
  },
  
  // Slack configuration
  slack: {
    channel: String,
    webhookUrl: String,
    includePreview: Boolean
  },
  
  // Teams configuration
  teams: {
    channel: String,
    webhookUrl: String
  },
  
  // Storage configuration
  storage: {
    provider: { type: String, enum: ['S3', 'AZURE_BLOB', 'GCS', 'LOCAL'] },
    bucket: String,
    path: String,
    retention: Number
  },
  
  // Webhook configuration
  webhook: {
    url: String,
    method: { type: String, enum: ['POST', 'PUT'] },
    headers: mongoose.Schema.Types.Mixed,
    includeContent: Boolean
  }
}, { _id: false });

// Report Schedule Sub-schema
const reportScheduleSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']
  },
  dayOfWeek: Number,
  dayOfMonth: Number,
  time: {
    hour: Number,
    minute: Number
  },
  timezone: { type: String, default: 'UTC' },
  nextGeneration: Date,
  lastGenerated: Date
}, { _id: false });

// Vulnerability Summary Sub-schema
const vulnSummarySchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  byStatus: {
    open: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    riskAccepted: { type: Number, default: 0 },
    falsePositive: { type: Number, default: 0 }
  },
  bySeverity: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    informational: { type: Number, default: 0 }
  },
  byCategory: mongoose.Schema.Types.Mixed,
  byAssetType: mongoose.Schema.Types.Mixed,
  exploitable: { type: Number, default: 0 },
  withPublicExploit: { type: Number, default: 0 },
  inCisaKev: { type: Number, default: 0 },
  newSinceLastReport: { type: Number, default: 0 },
  resolvedSinceLastReport: { type: Number, default: 0 },
  avgAge: Number,
  avgCvss: Number,
  maxCvss: Number,
  riskScore: Number,
  riskLevel: String,
  mttr: Number,
  slaBreach: { type: Number, default: 0 }
}, { _id: false });

// Report Schema
const reportSchema = new mongoose.Schema({
  // Identifiers
  reportId: {
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
    required: true
  },

  // Report Information
  name: {
    type: String,
    required: true
  },
  description: String,
  reportType: {
    type: String,
    enum: [
      'EXECUTIVE_SUMMARY',
      'TECHNICAL_REPORT',
      'COMPLIANCE_REPORT',
      'DELTA_REPORT',
      'ASSET_REPORT',
      'TREND_REPORT',
      'SLA_REPORT',
      'REMEDIATION_REPORT',
      'SCAN_REPORT',
      'CUSTOM'
    ],
    required: true,
    index: true
  },

  // Template
  template: {
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate' },
    name: String,
    customizations: mongoose.Schema.Types.Mixed
  },

  // Format
  format: {
    type: String,
    enum: ['PDF', 'HTML', 'JSON', 'CSV', 'XLSX', 'DOCX', 'XML'],
    default: 'PDF'
  },
  availableFormats: [{
    format: String,
    url: String,
    size: Number,
    generatedAt: Date
  }],

  // Scope & Filters
  scope: {
    type: { type: String, enum: ['ORGANIZATION', 'ASSET_GROUP', 'ASSETS', 'SCANS', 'CUSTOM'] },
    assetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AssetGroup' }],
    assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' }],
    scans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' }]
  },
  filters: reportFilterSchema,

  // Date Range
  dateRange: {
    type: { type: String, enum: ['CUSTOM', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'LAST_YEAR', 'ALL_TIME'] },
    start: Date,
    end: Date
  },

  // Comparison (for delta reports)
  comparison: {
    enabled: { type: Boolean, default: false },
    previousReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanReport' },
    previousScanId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScan' },
    comparisonDate: Date
  },

  // Sections
  sections: [reportSectionSchema],
  includedSections: [{
    type: String,
    enum: [
      'EXECUTIVE_OVERVIEW',
      'RISK_SUMMARY',
      'VULNERABILITY_DETAILS',
      'ASSET_INVENTORY',
      'COMPLIANCE_STATUS',
      'TREND_ANALYSIS',
      'TOP_VULNERABILITIES',
      'TOP_RISKY_ASSETS',
      'REMEDIATION_STATUS',
      'SLA_METRICS',
      'RECOMMENDATIONS',
      'APPENDIX'
    ]
  }],

  // Summary Data
  summary: vulnSummarySchema,

  // Asset Summary
  assetSummary: {
    total: { type: Number, default: 0 },
    scanned: { type: Number, default: 0 },
    atRisk: { type: Number, default: 0 },
    byType: mongoose.Schema.Types.Mixed,
    byEnvironment: mongoose.Schema.Types.Mixed,
    byCriticality: mongoose.Schema.Types.Mixed
  },

  // Compliance Summary
  complianceSummary: {
    frameworks: [{
      name: String,
      status: { type: String, enum: ['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL'] },
      score: Number,
      passedControls: Number,
      failedControls: Number,
      totalControls: Number
    }]
  },

  // Trend Data
  trends: {
    vulnerability: [{
      date: Date,
      total: Number,
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    }],
    riskScore: [{
      date: Date,
      score: Number
    }],
    remediation: [{
      date: Date,
      resolved: Number,
      mttr: Number
    }]
  },

  // Top Items
  topItems: {
    vulnerabilities: [{
      vulnId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanVulnerability' },
      cve: String,
      title: String,
      severity: String,
      cvss: Number,
      affectedAssets: Number,
      exploitable: Boolean
    }],
    riskyAssets: [{
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'VulnScanAsset' },
      name: String,
      riskScore: Number,
      criticalVulns: Number,
      highVulns: Number
    }],
    categories: [{
      category: String,
      count: Number,
      avgCvss: Number
    }]
  },

  // Generation Status
  status: {
    type: String,
    enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  generationProgress: {
    percent: { type: Number, default: 0 },
    currentStep: String,
    steps: [{
      name: String,
      status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] },
      startedAt: Date,
      completedAt: Date
    }]
  },
  errorMessage: String,

  // File Information
  file: {
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
    checksum: String,
    expiresAt: Date
  },

  // Generation Timing
  requestedAt: {
    type: Date,
    default: Date.now
  },
  generatedAt: Date,
  generationDuration: Number,

  // Distribution
  distribution: [distributionConfigSchema],
  distributionHistory: [{
    method: String,
    target: String,
    sentAt: Date,
    status: { type: String, enum: ['SENT', 'DELIVERED', 'FAILED', 'BOUNCED'] },
    errorMessage: String
  }],

  // Schedule (for recurring reports)
  schedule: reportScheduleSchema,
  isScheduled: {
    type: Boolean,
    default: false
  },

  // Access Control
  visibility: {
    type: String,
    enum: ['PRIVATE', 'TEAM', 'ORGANIZATION', 'PUBLIC_LINK'],
    default: 'PRIVATE'
  },
  publicLink: {
    enabled: { type: Boolean, default: false },
    token: String,
    expiresAt: Date,
    password: String,
    accessCount: { type: Number, default: 0 }
  },
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    permission: { type: String, enum: ['VIEW', 'DOWNLOAD'] },
    sharedAt: Date
  }],

  // Download Tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  downloadHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    downloadedAt: Date,
    format: String,
    ipAddress: String
  }],

  // Ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tags
  tags: [String],

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
  collection: 'vulnscan_reports'
});

// Indexes
reportSchema.index({ organizationId: 1, reportType: 1, createdAt: -1 });
reportSchema.index({ organizationId: 1, status: 1 });
reportSchema.index({ 'schedule.nextGeneration': 1 });
reportSchema.index({ 'publicLink.token': 1 });
reportSchema.index({ tags: 1 });

// Virtual for is downloadable
reportSchema.virtual('isDownloadable').get(function() {
  return this.status === 'COMPLETED' && this.file?.url;
});

// Method to update generation progress
reportSchema.methods.updateProgress = function(stepName, stepStatus, percent) {
  const stepIndex = this.generationProgress.steps.findIndex(s => s.name === stepName);
  
  if (stepIndex >= 0) {
    this.generationProgress.steps[stepIndex].status = stepStatus;
    if (stepStatus === 'IN_PROGRESS') {
      this.generationProgress.steps[stepIndex].startedAt = new Date();
    } else if (stepStatus === 'COMPLETED' || stepStatus === 'FAILED') {
      this.generationProgress.steps[stepIndex].completedAt = new Date();
    }
  }
  
  this.generationProgress.currentStep = stepName;
  if (percent !== undefined) {
    this.generationProgress.percent = percent;
  }
  
  return this.save();
};

// Method to record download
reportSchema.methods.recordDownload = function(userId, format, ipAddress) {
  this.downloadCount += 1;
  this.downloadHistory.push({
    userId,
    downloadedAt: new Date(),
    format,
    ipAddress
  });
  
  // Keep last 1000 downloads
  if (this.downloadHistory.length > 1000) {
    this.downloadHistory = this.downloadHistory.slice(-1000);
  }
  
  return this.save();
};

// Method to generate public link
reportSchema.methods.generatePublicLink = function(expiresInDays = 7, password = null) {
  const token = require('crypto').randomBytes(32).toString('hex');
  
  this.publicLink = {
    enabled: true,
    token,
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    password: password ? require('crypto').createHash('sha256').update(password).digest('hex') : null,
    accessCount: 0
  };
  
  return this.save();
};

// Pre-save hook
reportSchema.pre('save', function(next) {
  if (this.status === 'COMPLETED' && !this.generatedAt) {
    this.generatedAt = new Date();
    if (this.requestedAt) {
      this.generationDuration = Math.round((this.generatedAt - this.requestedAt) / 1000);
    }
  }
  next();
});

// Static method for scheduled reports due
reportSchema.statics.getDueScheduledReports = async function() {
  return this.find({
    isScheduled: true,
    'schedule.enabled': true,
    'schedule.nextGeneration': { $lte: new Date() },
    isActive: true
  });
};

// Static method for report statistics
reportSchema.statics.getStatistics = async function(organizationId) {
  return this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), status: 'COMPLETED' } },
    {
      $group: {
        _id: '$reportType',
        count: { $sum: 1 },
        totalDownloads: { $sum: '$downloadCount' },
        avgGenerationTime: { $avg: '$generationDuration' }
      }
    }
  ]);
};

module.exports = mongoose.model('VulnScanReport', reportSchema);

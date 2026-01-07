/**
 * VulnReport Model
 * Vulnerability Assessment Reporting
 * 
 * Generates comprehensive vulnerability reports with
 * executive summaries, technical details, and trend analysis
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const vulnReportSchema = new Schema({
  // Identification
  reportId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Report Type
  type: {
    type: String,
    required: true,
    enum: [
      'executive_summary',
      'technical_detailed',
      'compliance',
      'trend_analysis',
      'asset_specific',
      'vulnerability_specific',
      'patch_management',
      'risk_assessment',
      'remediation_tracking',
      'audit',
      'custom'
    ],
    index: true
  },
  
  // Report Scope
  scope: {
    // Time Range
    startDate: Date,
    endDate: Date,
    
    // Assets
    assets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    assetGroups: [String],
    allAssets: { type: Boolean, default: false },
    
    // Vulnerabilities
    vulnerabilities: [{ type: Schema.Types.ObjectId, ref: 'Vulnerability' }],
    severityFilter: [{ type: String, enum: ['critical', 'high', 'medium', 'low', 'informational'] }],
    statusFilter: [String],
    
    // Scans
    scans: [{ type: Schema.Types.ObjectId, ref: 'Scan' }],
    
    // Compliance
    frameworks: [{ type: String, enum: ['pci-dss', 'hipaa', 'soc2', 'iso27001', 'nist', 'cis', 'gdpr'] }],
    
    // Other filters
    departments: [String],
    locations: [String],
    tags: [String]
  },
  
  // Executive Summary
  executiveSummary: {
    overview: String,
    keyFindings: [String],
    criticalIssues: [String],
    recommendations: [String],
    riskLevel: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    complianceStatus: String,
    trendSummary: String
  },
  
  // Statistics
  statistics: {
    // Assets
    totalAssets: { type: Number, default: 0 },
    assetsScanned: { type: Number, default: 0 },
    criticalAssets: { type: Number, default: 0 },
    vulnerableAssets: { type: Number, default: 0 },
    
    // Vulnerabilities
    totalVulnerabilities: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    informational: { type: Number, default: 0 },
    
    // Status Distribution
    open: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    patched: { type: Number, default: 0 },
    mitigated: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    falsePositive: { type: Number, default: 0 },
    
    // Risk Metrics
    averageRiskScore: { type: Number, default: 0 },
    totalRiskScore: { type: Number, default: 0 },
    highestRiskAsset: String,
    
    // Exploitation
    exploitableVulnerabilities: { type: Number, default: 0 },
    exploitedInWild: { type: Number, default: 0 },
    publicExploits: { type: Number, default: 0 },
    
    // Patches
    patchesAvailable: { type: Number, default: 0 },
    patchesApplied: { type: Number, default: 0 },
    patchesPending: { type: Number, default: 0 },
    
    // Compliance
    complianceScore: { type: Number, min: 0, max: 100 },
    compliantAssets: { type: Number, default: 0 },
    nonCompliantAssets: { type: Number, default: 0 }
  },
  
  // Top Vulnerabilities
  topVulnerabilities: [{
    vulnerability: { type: Schema.Types.ObjectId, ref: 'Vulnerability' },
    cveId: String,
    title: String,
    severity: String,
    threatScore: Number,
    affectedAssets: Number,
    exploitable: Boolean,
    patchAvailable: Boolean
  }],
  
  // Top Affected Assets
  topAffectedAssets: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
    name: String,
    type: String,
    vulnerabilitiesCount: Number,
    criticalCount: Number,
    riskScore: Number,
    criticality: String
  }],
  
  // Vulnerability Breakdown
  vulnerabilityBreakdown: {
    byCategory: [{
      category: String,
      count: Number,
      percentage: Number
    }],
    bySeverity: [{
      severity: String,
      count: Number,
      percentage: Number
    }],
    byAge: [{
      ageRange: String,
      count: Number
    }],
    byCVSS: [{
      cvssRange: String,
      count: Number
    }]
  },
  
  // Asset Analysis
  assetAnalysis: {
    byType: [{
      type: String,
      total: Number,
      vulnerable: Number,
      averageVulnerabilities: Number
    }],
    byCriticality: [{
      criticality: String,
      count: Number,
      vulnerableCount: Number
    }],
    byDepartment: [{
      department: String,
      assets: Number,
      vulnerabilities: Number
    }]
  },
  
  // Trend Analysis
  trends: {
    enabled: { type: Boolean, default: false },
    comparisonPeriod: String,
    previousReport: { type: Schema.Types.ObjectId, ref: 'VulnReport' },
    
    changes: {
      newVulnerabilities: Number,
      remediatedVulnerabilities: Number,
      vulnerabilityChange: Number, // +/- percentage
      riskScoreChange: Number,
      complianceScoreChange: Number
    },
    
    monthlyTrends: [{
      month: String,
      vulnerabilities: {
        total: Number,
        critical: Number,
        high: Number,
        remediated: Number
      },
      riskScore: Number
    }]
  },
  
  // Compliance Assessment
  compliance: {
    frameworks: [{
      name: String,
      version: String,
      overallScore: Number,
      status: { type: String, enum: ['compliant', 'non_compliant', 'partially_compliant'] },
      controlsPassed: Number,
      controlsFailed: Number,
      criticalFindings: Number,
      gaps: [String]
    }]
  },
  
  // Remediation Status
  remediation: {
    totalPlans: Number,
    activePlans: Number,
    completedPlans: Number,
    averageRemediationTime: Number, // days
    overdueItems: Number,
    onTrackItems: Number,
    completionRate: Number // percentage
  },
  
  // Risk Assessment
  riskAssessment: {
    overallRisk: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    riskDistribution: [{
      level: String,
      assetCount: Number,
      vulnerabilityCount: Number
    }],
    topRisks: [{
      description: String,
      likelihood: String,
      impact: String,
      affectedAssets: Number,
      recommendation: String
    }]
  },
  
  // Detailed Findings (for technical reports)
  findings: [{
    findingId: String,
    title: String,
    severity: String,
    category: String,
    description: String,
    affectedAssets: [String],
    technicalDetails: String,
    remediation: String,
    references: [String]
  }],
  
  // Recommendations
  recommendations: [{
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    category: String,
    title: String,
    description: String,
    benefit: String,
    effort: { type: String, enum: ['low', 'medium', 'high'] },
    estimatedCost: Number,
    timeline: String
  }],
  
  // Charts & Visualizations
  visualizations: [{
    type: { type: String, enum: ['pie', 'bar', 'line', 'heatmap', 'timeline', 'table'] },
    title: String,
    description: String,
    data: { type: Map, of: Schema.Types.Mixed },
    chartConfig: { type: Map, of: Schema.Types.Mixed }
  }],
  
  // Generation Information
  generation: {
    generatedBy: String,
    generatedAt: { type: Date, default: Date.now },
    generationDuration: Number, // seconds
    automated: { type: Boolean, default: false },
    scheduledReport: { type: Boolean, default: false },
    template: String,
    version: String
  },
  
  // Distribution
  distribution: {
    recipients: [{
      name: String,
      email: String,
      role: String,
      deliveryStatus: { type: String, enum: ['pending', 'sent', 'failed', 'opened', 'downloaded'] },
      sentAt: Date
    }],
    distributionMethod: { 
      type: String, 
      enum: ['email', 'download', 'api', 'integration', 'scheduled'],
      default: 'email'
    },
    confidential: { type: Boolean, default: true },
    expiryDate: Date
  },
  
  // Export Options
  exports: [{
    format: { type: String, enum: ['pdf', 'html', 'csv', 'json', 'xml', 'docx', 'xlsx'] },
    path: String,
    url: String,
    size: Number, // bytes
    generatedAt: Date,
    downloadCount: { type: Number, default: 0 },
    lastDownloaded: Date
  }],
  
  // Report Configuration
  configuration: {
    includeExecutiveSummary: { type: Boolean, default: true },
    includeTechnicalDetails: { type: Boolean, default: true },
    includeCharts: { type: Boolean, default: true },
    includeTrends: { type: Boolean, default: true },
    includeRecommendations: { type: Boolean, default: true },
    includeCompliance: { type: Boolean, default: true },
    detailLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    sections: [String],
    customFields: { type: Map, of: String }
  },
  
  // Branding
  branding: {
    logo: String,
    companyName: String,
    reportHeader: String,
    reportFooter: String,
    colorScheme: String
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['generating', 'generated', 'distributed', 'archived', 'failed'],
    default: 'generating',
    index: true
  },
  
  // Approval (for sensitive reports)
  approval: {
    required: { type: Boolean, default: false },
    approvedBy: String,
    approvalDate: Date,
    comments: String
  },
  
  // Schedule (for recurring reports)
  schedule: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
    nextGeneration: Date,
    lastGeneration: Date
  },
  
  // Tags & Labels
  tags: [String],
  labels: { type: Map, of: String },
  
  // Notes
  notes: [{
    author: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'vulnreports'
});

// Indexes
vulnReportSchema.index({ reportId: 1 });
vulnReportSchema.index({ type: 1 });
vulnReportSchema.index({ status: 1 });
vulnReportSchema.index({ 'generation.generatedAt': -1 });
vulnReportSchema.index({ 'scope.startDate': 1, 'scope.endDate': 1 });
vulnReportSchema.index({ tags: 1 });

// Virtual for report age (days since generation)
vulnReportSchema.virtual('age').get(function() {
  if (!this.generation.generatedAt) return 0;
  const now = new Date();
  const diff = now - this.generation.generatedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
vulnReportSchema.virtual('isExpired').get(function() {
  if (!this.distribution.expiryDate) return false;
  return new Date() > this.distribution.expiryDate;
});

// Method: Generate executive summary
vulnReportSchema.methods.generateExecutiveSummary = function() {
  const stats = this.statistics;
  
  let overview = `This vulnerability assessment report covers ${stats.totalAssets} assets scanned between ${this.scope.startDate?.toDateString()} and ${this.scope.endDate?.toDateString()}. `;
  overview += `A total of ${stats.totalVulnerabilities} vulnerabilities were identified, `;
  overview += `including ${stats.critical} critical and ${stats.high} high severity issues.`;
  
  this.executiveSummary.overview = overview;
  
  // Key findings
  const keyFindings = [];
  
  if (stats.critical > 0) {
    keyFindings.push(`${stats.critical} critical vulnerabilities require immediate attention`);
  }
  
  if (stats.exploitableVulnerabilities > 0) {
    keyFindings.push(`${stats.exploitableVulnerabilities} vulnerabilities have public exploits available`);
  }
  
  if (stats.exploitedInWild > 0) {
    keyFindings.push(`${stats.exploitedInWild} vulnerabilities are being actively exploited`);
  }
  
  const complianceRate = stats.totalAssets > 0 
    ? Math.round((stats.compliantAssets / stats.totalAssets) * 100) 
    : 0;
  keyFindings.push(`${complianceRate}% compliance rate across assessed assets`);
  
  this.executiveSummary.keyFindings = keyFindings;
  
  // Determine risk level
  if (stats.critical > 0 || stats.exploitedInWild > 0) {
    this.executiveSummary.riskLevel = 'critical';
  } else if (stats.high > 10 || stats.exploitableVulnerabilities > 5) {
    this.executiveSummary.riskLevel = 'high';
  } else if (stats.high > 0 || stats.medium > 20) {
    this.executiveSummary.riskLevel = 'medium';
  } else {
    this.executiveSummary.riskLevel = 'low';
  }
};

// Method: Add export
vulnReportSchema.methods.addExport = function(exportData) {
  this.exports.push({
    format: exportData.format,
    path: exportData.path,
    url: exportData.url,
    size: exportData.size,
    generatedAt: new Date()
  });
};

// Method: Mark as distributed
vulnReportSchema.methods.distribute = async function(recipients) {
  this.distribution.recipients = recipients.map(r => ({
    name: r.name,
    email: r.email,
    role: r.role,
    deliveryStatus: 'sent',
    sentAt: new Date()
  }));
  
  this.status = 'distributed';
  await this.save();
};

// Method: Archive report
vulnReportSchema.methods.archive = function() {
  this.status = 'archived';
};

// Static: Find recent reports
vulnReportSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: { $in: ['generated', 'distributed'] } })
    .sort({ 'generation.generatedAt': -1 })
    .limit(limit);
};

// Static: Find reports by type
vulnReportSchema.statics.findByType = function(type) {
  return this.find({ type })
    .sort({ 'generation.generatedAt': -1 });
};

// Static: Find scheduled reports due
vulnReportSchema.statics.findScheduledDue = function() {
  return this.find({
    'schedule.isRecurring': true,
    'schedule.nextGeneration': { $lte: new Date() }
  });
};

// Static: Get report statistics
vulnReportSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgVulnerabilities: { $avg: '$statistics.totalVulnerabilities' },
              avgRiskScore: { $avg: '$statistics.averageRiskScore' },
              totalDistributed: { $sum: { $cond: [{ $eq: ['$status', 'distributed'] }, 1, 0] } }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
vulnReportSchema.pre('save', function(next) {
  // Generate executive summary if not set
  if (this.isNew && this.configuration.includeExecutiveSummary) {
    this.generateExecutiveSummary();
  }
  
  // Set expiry date if not set (30 days for confidential reports)
  if (!this.distribution.expiryDate && this.distribution.confidential) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.distribution.expiryDate = expiryDate;
  }
  
  next();
});

const VulnReport = mongoose.model('VulnReport', vulnReportSchema);

module.exports = VulnReport;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CODESENTINEL - Scan Report Model
 * Comprehensive Security Analysis Reports
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const scanReportSchema = new mongoose.Schema({
  // ═══════════════════════════════════════════════════════════════════════════
  // Report Identification
  // ═══════════════════════════════════════════════════════════════════════════
  reportId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  scanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CodeScan', 
    required: true,
    index: true
  },
  codebaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Codebase', 
    required: true,
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Report Metadata
  // ═══════════════════════════════════════════════════════════════════════════
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  reportType: {
    type: String,
    enum: ['full', 'summary', 'executive', 'compliance', 'trending', 'diff'],
    default: 'full'
  },
  format: {
    type: String,
    enum: ['json', 'pdf', 'html', 'sarif', 'csv', 'markdown'],
    default: 'json'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Codebase Snapshot
  // ═══════════════════════════════════════════════════════════════════════════
  codebaseSnapshot: {
    name: String,
    repository: String,
    branch: String,
    commit: String,
    languages: [String],
    frameworks: [String],
    totalFiles: Number,
    totalLines: Number,
    scannedAt: Date
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Security Score
  // ═══════════════════════════════════════════════════════════════════════════
  securityScore: {
    overall: { type: Number, min: 0, max: 100, required: true },
    grade: { 
      type: String, 
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'] 
    },
    breakdown: {
      vulnerabilities: { type: Number, min: 0, max: 100 },
      secrets: { type: Number, min: 0, max: 100 },
      dependencies: { type: Number, min: 0, max: 100 },
      codeQuality: { type: Number, min: 0, max: 100 },
      compliance: { type: Number, min: 0, max: 100 }
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    },
    changeFromLast: Number
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Finding Summary
  // ═══════════════════════════════════════════════════════════════════════════
  summary: {
    totalIssues: { type: Number, default: 0 },
    newIssues: { type: Number, default: 0 },
    resolvedIssues: { type: Number, default: 0 },
    bySeverity: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 }
    },
    byType: {
      vulnerabilities: { type: Number, default: 0 },
      secrets: { type: Number, default: 0 },
      dependencies: { type: Number, default: 0 },
      codeSmells: { type: Number, default: 0 },
      securityHotspots: { type: Number, default: 0 }
    },
    byCategory: mongoose.Schema.Types.Mixed,
    topRisks: [{
      title: String,
      severity: String,
      count: Number,
      category: String
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Compliance Status
  // ═══════════════════════════════════════════════════════════════════════════
  compliance: {
    owasp: {
      version: { type: String, enum: ['2017', '2021', '2023'] },
      violations: [{
        category: String,
        name: String,
        count: Number,
        severity: String
      }],
      score: Number
    },
    pciDss: {
      compliant: Boolean,
      violations: [String],
      score: Number
    },
    gdpr: {
      compliant: Boolean,
      dataHandlingIssues: Number,
      score: Number
    },
    hipaa: {
      compliant: Boolean,
      violations: [String],
      score: Number
    },
    soc2: {
      compliant: Boolean,
      controls: mongoose.Schema.Types.Mixed,
      score: Number
    },
    iso27001: {
      compliant: Boolean,
      controls: mongoose.Schema.Types.Mixed,
      score: Number
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI Insights
  // ═══════════════════════════════════════════════════════════════════════════
  aiInsights: {
    executiveSummary: String,
    keyFindings: [String],
    riskAssessment: String,
    recommendations: [{
      priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
      title: String,
      description: String,
      estimatedEffort: String,
      impact: String
    }],
    attackSurface: {
      external: Number,
      internal: Number,
      critical: Number
    },
    threatModel: {
      primaryThreats: [String],
      exploitability: String,
      businessImpact: String
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Dependency Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  dependencyAnalysis: {
    totalDependencies: Number,
    directDependencies: Number,
    vulnerableDependencies: Number,
    outdatedDependencies: Number,
    licenseRisks: Number,
    riskiestPackages: [{
      name: String,
      version: String,
      vulnerabilities: Number,
      severity: String
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // File Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  fileAnalysis: {
    mostVulnerableFiles: [{
      file: String,
      issues: Number,
      critical: Number,
      high: Number
    }],
    languageBreakdown: mongoose.Schema.Types.Mixed,
    hotspots: [{
      file: String,
      line: Number,
      issues: [String]
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Historical Comparison
  // ═══════════════════════════════════════════════════════════════════════════
  comparison: {
    previousScanId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeScan' },
    previousScore: Number,
    newVulnerabilities: Number,
    fixedVulnerabilities: Number,
    scoreChange: Number,
    trendData: [{
      date: Date,
      score: Number,
      issues: Number
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Export & Sharing
  // ═══════════════════════════════════════════════════════════════════════════
  export: {
    fileUrl: String,
    fileSize: Number,
    generatedAt: Date,
    expiresAt: Date,
    downloadCount: { type: Number, default: 0 }
  },
  sharing: {
    isPublic: { type: Boolean, default: false },
    shareToken: String,
    sharedWith: [{
      email: String,
      accessLevel: { type: String, enum: ['view', 'download'] },
      sharedAt: Date
    }]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Scan Performance
  // ═══════════════════════════════════════════════════════════════════════════
  performance: {
    scanDuration: Number,
    filesPerSecond: Number,
    peakMemory: Number,
    rulesExecuted: Number
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Timestamps
  // ═══════════════════════════════════════════════════════════════════════════
  generatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ═══════════════════════════════════════════════════════════════════════════════
// Compound Indexes for Performance
// ═══════════════════════════════════════════════════════════════════════════════
scanReportSchema.index({ userId: 1, generatedAt: -1 });
scanReportSchema.index({ codebaseId: 1, generatedAt: -1 });
scanReportSchema.index({ 'securityScore.overall': 1 });
scanReportSchema.index({ 'securityScore.grade': 1 });
scanReportSchema.index({ reportType: 1, format: 1 });
scanReportSchema.index({ 'sharing.shareToken': 1 });
scanReportSchema.index({ 'export.expiresAt': 1 });

module.exports = mongoose.model('ScanReport', scanReportSchema);

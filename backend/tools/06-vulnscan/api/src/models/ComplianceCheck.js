/**
 * ComplianceCheck Model
 * Security Compliance Assessment & Tracking
 * 
 * Manages compliance assessments across multiple frameworks
 * with control mapping, evidence collection, and gap analysis
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const controlSchema = new Schema({
  controlId: { type: String, required: true },
  title: String,
  description: String,
  category: String,
  requirement: String,
  
  // Assessment
  status: {
    type: String,
    enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_applicable', 'pending_review'],
    default: 'pending_review'
  },
  score: { type: Number, min: 0, max: 100 },
  
  // Evidence
  evidence: [{
    type: { type: String, enum: ['screenshot', 'log', 'configuration', 'document', 'scan_result', 'other'] },
    description: String,
    url: String,
    collectedBy: String,
    collectedDate: Date
  }],
  
  // Findings
  findings: [{
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'informational'] },
    description: String,
    recommendation: String
  }],
  
  // Remediation
  remediation: {
    required: { type: Boolean, default: false },
    plan: String,
    assignedTo: String,
    dueDate: Date,
    status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'verified'] }
  },
  
  // Assessment Details
  assessedBy: String,
  assessedDate: Date,
  reviewedBy: String,
  reviewedDate: Date,
  
  notes: String
}, { _id: true });

const complianceCheckSchema = new Schema({
  // Identification
  checkId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Framework
  framework: {
    name: {
      type: String,
      required: true,
      enum: [
        'pci-dss',
        'hipaa',
        'soc2',
        'iso27001',
        'nist-csf',
        'nist-800-53',
        'cis',
        'gdpr',
        'fedramp',
        'cmmc',
        'cobit',
        'fisma',
        'sox',
        'glba',
        'ffiec'
      ],
      index: true
    },
    version: String,
    description: String
  },
  
  // Assessment Type
  assessmentType: {
    type: String,
    required: true,
    enum: ['self_assessment', 'internal_audit', 'external_audit', 'continuous', 'certification'],
    default: 'self_assessment'
  },
  
  // Scope
  scope: {
    assets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
    assetGroups: [String],
    departments: [String],
    locations: [String],
    systems: [String],
    includeAll: { type: Boolean, default: false }
  },
  assessedAssetsCount: { type: Number, default: 0 },
  
  // Timeline
  timing: {
    scheduled: Date,
    started: Date,
    completed: Date,
    dueDate: Date,
    duration: Number, // seconds
    validFrom: Date,
    validUntil: Date,
    nextAssessment: Date
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: [
      'planned',
      'in_progress',
      'under_review',
      'completed',
      'approved',
      'failed',
      'expired',
      'cancelled'
    ],
    default: 'planned',
    index: true
  },
  
  // Controls Assessment
  controls: [controlSchema],
  totalControls: { type: Number, default: 0 },
  
  // Overall Assessment Results
  results: {
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    complianceLevel: {
      type: String,
      enum: ['fully_compliant', 'substantially_compliant', 'partially_compliant', 'non_compliant', 'pending'],
      default: 'pending'
    },
    
    // Control Status Counts
    compliant: { type: Number, default: 0 },
    nonCompliant: { type: Number, default: 0 },
    partiallyCompliant: { type: Number, default: 0 },
    notApplicable: { type: Number, default: 0 },
    pendingReview: { type: Number, default: 0 },
    
    // Findings by Severity
    findings: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      informational: { type: Number, default: 0 }
    },
    
    // Categories Assessment
    categoriesAssessed: [{
      category: String,
      totalControls: Number,
      compliantControls: Number,
      score: Number
    }]
  },
  
  // Gap Analysis
  gaps: [{
    controlId: String,
    controlTitle: String,
    category: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    currentState: String,
    requiredState: String,
    gap: String,
    impact: String,
    effortToRemediate: { type: String, enum: ['low', 'medium', 'high', 'very_high'] },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    remediationPlan: String,
    estimatedCost: Number,
    targetDate: Date,
    assignedTo: String,
    status: { type: String, enum: ['identified', 'planned', 'in_progress', 'remediated', 'verified'] }
  }],
  
  // Vulnerabilities Related to Compliance
  relatedVulnerabilities: [{
    vulnerability: { type: Schema.Types.ObjectId, ref: 'Vulnerability' },
    cveId: String,
    affectedControls: [String],
    severity: String,
    status: String
  }],
  
  // Assets Compliance Status
  assetCompliance: [{
    asset: { type: Schema.Types.ObjectId, ref: 'Asset' },
    compliant: { type: Boolean, default: false },
    score: Number,
    nonCompliantControls: [String],
    criticalFindings: Number,
    lastAssessed: Date
  }],
  
  // Assessor Information
  assessor: {
    userId: String,
    name: String,
    email: String,
    organization: String,
    certification: String,
    auditorId: String
  },
  
  // Review & Approval
  review: {
    status: { type: String, enum: ['not_reviewed', 'under_review', 'approved', 'rejected'], default: 'not_reviewed' },
    reviewedBy: String,
    reviewDate: Date,
    comments: String,
    approvedBy: String,
    approvalDate: Date
  },
  
  // Methodology
  methodology: {
    approach: { type: String, enum: ['manual', 'automated', 'hybrid'], default: 'hybrid' },
    tools: [String],
    standards: [String],
    samplingMethod: String,
    sampleSize: Number
  },
  
  // Evidence Collection
  evidenceCollection: {
    automated: { type: Boolean, default: true },
    manualVerification: { type: Boolean, default: true },
    evidenceRetention: Number, // days
    storageLocation: String
  },
  
  // Reporting
  reports: [{
    reportId: { type: Schema.Types.ObjectId, ref: 'VulnReport' },
    type: { type: String, enum: ['executive', 'detailed', 'technical', 'remediation'] },
    format: String,
    generatedAt: Date,
    generatedBy: String,
    url: String
  }],
  
  // Remediation Tracking
  remediation: {
    totalGaps: { type: Number, default: 0 },
    remediatedGaps: { type: Number, default: 0 },
    inProgressGaps: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 }
  },
  
  // Previous Assessments (for trend analysis)
  previousAssessments: [{
    assessmentId: { type: Schema.Types.ObjectId, ref: 'ComplianceCheck' },
    date: Date,
    score: Number,
    complianceLevel: String
  }],
  
  // Trend Analysis
  trend: {
    direction: { type: String, enum: ['improving', 'stable', 'declining', 'unknown'], default: 'unknown' },
    scoreChange: Number,
    gapsResolved: Number,
    newGapsIdentified: Number
  },
  
  // Notifications
  notifications: {
    enabled: { type: Boolean, default: true },
    onCompletion: { type: Boolean, default: true },
    onCriticalFindings: { type: Boolean, default: true },
    onNonCompliance: { type: Boolean, default: true },
    recipients: [String]
  },
  
  // Certification
  certification: {
    required: { type: Boolean, default: false },
    certificationBody: String,
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    renewalRequired: { type: Boolean, default: false }
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
  
  // Metadata
  metadata: { type: Map, of: Schema.Types.Mixed }
}, {
  timestamps: true,
  collection: 'compliancechecks'
});

// Indexes
complianceCheckSchema.index({ checkId: 1 });
complianceCheckSchema.index({ 'framework.name': 1 });
complianceCheckSchema.index({ status: 1 });
complianceCheckSchema.index({ 'timing.started': -1 });
complianceCheckSchema.index({ 'results.overallScore': -1 });
complianceCheckSchema.index({ tags: 1 });

// Virtual for is expired
complianceCheckSchema.virtual('isExpired').get(function() {
  if (!this.timing.validUntil) return false;
  return new Date() > this.timing.validUntil;
});

// Virtual for days until expiry
complianceCheckSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.timing.validUntil) return null;
  const now = new Date();
  const diff = this.timing.validUntil - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for compliance percentage
complianceCheckSchema.virtual('compliancePercentage').get(function() {
  if (this.totalControls === 0) return 0;
  return Math.round((this.results.compliant / this.totalControls) * 100);
});

// Method: Assess control
complianceCheckSchema.methods.assessControl = function(controlId, assessment) {
  const control = this.controls.id(controlId);
  
  if (control) {
    control.status = assessment.status;
    control.score = assessment.score;
    control.assessedBy = assessment.assessedBy;
    control.assessedDate = new Date();
    
    if (assessment.findings) {
      control.findings = assessment.findings;
    }
    
    if (assessment.evidence) {
      control.evidence.push(...assessment.evidence);
    }
    
    if (assessment.notes) {
      control.notes = assessment.notes;
    }
    
    // Update overall results
    this.updateResults();
  }
};

// Method: Update overall results
complianceCheckSchema.methods.updateResults = function() {
  const results = {
    compliant: 0,
    nonCompliant: 0,
    partiallyCompliant: 0,
    notApplicable: 0,
    pendingReview: 0,
    findings: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0
    }
  };
  
  let totalScore = 0;
  let scoredControls = 0;
  
  this.controls.forEach(control => {
    results[control.status]++;
    
    if (control.score !== undefined) {
      totalScore += control.score;
      scoredControls++;
    }
    
    control.findings.forEach(finding => {
      results.findings[finding.severity]++;
    });
  });
  
  // Calculate overall score
  this.results.overallScore = scoredControls > 0 
    ? Math.round(totalScore / scoredControls) 
    : 0;
  
  // Update counts
  Object.assign(this.results, results);
  
  // Determine compliance level
  const complianceRate = this.totalControls > 0 
    ? (results.compliant / this.totalControls) * 100 
    : 0;
  
  if (complianceRate >= 95) {
    this.results.complianceLevel = 'fully_compliant';
  } else if (complianceRate >= 80) {
    this.results.complianceLevel = 'substantially_compliant';
  } else if (complianceRate >= 50) {
    this.results.complianceLevel = 'partially_compliant';
  } else {
    this.results.complianceLevel = 'non_compliant';
  }
};

// Method: Identify gaps
complianceCheckSchema.methods.identifyGaps = function() {
  this.gaps = [];
  
  this.controls.forEach(control => {
    if (control.status === 'non_compliant' || control.status === 'partially_compliant') {
      control.findings.forEach(finding => {
        this.gaps.push({
          controlId: control.controlId,
          controlTitle: control.title,
          category: control.category,
          severity: finding.severity,
          currentState: 'Non-compliant',
          requiredState: 'Compliant',
          gap: finding.description,
          impact: 'Compliance risk',
          effortToRemediate: 'medium',
          priority: finding.severity,
          remediationPlan: finding.recommendation,
          status: 'identified'
        });
      });
    }
  });
  
  this.remediation.totalGaps = this.gaps.length;
};

// Method: Generate report
complianceCheckSchema.methods.generateReport = async function(reportType = 'detailed') {
  const VulnReport = mongoose.model('VulnReport');
  
  const report = new VulnReport({
    reportId: `comp-report-${Date.now()}`,
    name: `${this.framework.name.toUpperCase()} Compliance Report - ${this.name}`,
    type: 'compliance',
    scope: {
      frameworks: [this.framework.name],
      startDate: this.timing.started,
      endDate: this.timing.completed
    },
    summary: {
      overallScore: this.results.overallScore,
      complianceLevel: this.results.complianceLevel,
      totalControls: this.totalControls,
      compliantControls: this.results.compliant,
      gaps: this.gaps.length
    },
    generatedBy: this.assessor.name,
    generatedAt: new Date()
  });
  
  await report.save();
  
  this.reports.push({
    reportId: report._id,
    type: reportType,
    format: 'pdf',
    generatedAt: new Date(),
    generatedBy: this.assessor.name
  });
  
  await this.save();
  
  return report;
};

// Method: Complete assessment
complianceCheckSchema.methods.complete = function() {
  this.status = 'completed';
  this.timing.completed = new Date();
  
  if (this.timing.started) {
    this.timing.duration = Math.floor(
      (this.timing.completed - this.timing.started) / 1000
    );
  }
  
  // Update results
  this.updateResults();
  
  // Identify gaps
  this.identifyGaps();
  
  // Set validity period (typically 1 year)
  this.timing.validFrom = new Date();
  this.timing.validUntil = new Date();
  this.timing.validUntil.setFullYear(this.timing.validUntil.getFullYear() + 1);
  
  // Schedule next assessment
  this.timing.nextAssessment = new Date();
  this.timing.nextAssessment.setFullYear(this.timing.nextAssessment.getFullYear() + 1);
};

// Static: Find by framework
complianceCheckSchema.statics.findByFramework = function(framework) {
  return this.find({ 'framework.name': framework })
    .sort({ 'timing.started': -1 });
};

// Static: Find expiring soon
complianceCheckSchema.statics.findExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'timing.validUntil': { $lte: futureDate, $gte: new Date() },
    status: { $in: ['completed', 'approved'] }
  }).sort({ 'timing.validUntil': 1 });
};

// Static: Get compliance statistics
complianceCheckSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        byFramework: [
          { $group: { _id: '$framework.name', count: { $sum: 1 }, avgScore: { $avg: '$results.overallScore' } } },
          { $sort: { count: -1 } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byComplianceLevel: [
          { $group: { _id: '$results.complianceLevel', count: { $sum: 1 } } }
        ],
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              avgScore: { $avg: '$results.overallScore' },
              totalGaps: { $sum: '$remediation.totalGaps' },
              totalControls: { $sum: '$totalControls' }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// Pre-save hook
complianceCheckSchema.pre('save', function(next) {
  // Update total controls
  this.totalControls = this.controls.length;
  
  // Update assessed assets count
  this.assessedAssetsCount = this.scope.assets.length;
  
  // Update remediation completion percentage
  if (this.remediation.totalGaps > 0) {
    this.remediation.completionPercentage = Math.round(
      (this.remediation.remediatedGaps / this.remediation.totalGaps) * 100
    );
  }
  
  next();
});

const ComplianceCheck = mongoose.model('ComplianceCheck', complianceCheckSchema);

module.exports = ComplianceCheck;

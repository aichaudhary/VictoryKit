const mongoose = require('mongoose');

const complianceReportSchema = new mongoose.Schema({
  // Report Identification
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Compliance Framework
  framework: {
    type: String,
    required: true,
    enum: [
      'PCI-DSS',
      'HIPAA',
      'NIST',
      'ISO27001',
      'SOC2',
      'GDPR',
      'CCPA',
      'FISMA',
      'FedRAMP',
      'Custom'
    ],
    index: true
  },
  frameworkVersion: String,
  
  // Report Details
  reportDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  reportingPeriod: {
    startDate: Date,
    endDate: Date
  },
  
  // Overall Compliance Status
  complianceStatus: {
    type: String,
    required: true,
    enum: ['compliant', 'partial_compliant', 'non_compliant', 'in_progress'],
    index: true
  },
  compliancePercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Requirements Assessment
  requirements: [{
    requirementId: String,
    section: String,
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['pass', 'fail', 'partial', 'not_applicable', 'not_tested']
    },
    score: Number,
    testDate: Date,
    evidence: [{
      type: String,
      description: String,
      filePath: String,
      collectedAt: Date
    }],
    findings: [String],
    gaps: [String],
    remediation: String,
    responsible: String,
    dueDate: Date,
    notes: String
  }],
  
  // Wireless-Specific Requirements
  wirelessRequirements: {
    encryption: {
      required: Boolean,
      implemented: Boolean,
      standard: String,
      compliant: Boolean,
      findings: [String]
    },
    accessControl: {
      required: Boolean,
      implemented: Boolean,
      method: String,
      compliant: Boolean,
      findings: [String]
    },
    monitoring: {
      required: Boolean,
      implemented: Boolean,
      coverage: Number,
      compliant: Boolean,
      findings: [String]
    },
    segmentation: {
      required: Boolean,
      implemented: Boolean,
      method: String,
      compliant: Boolean,
      findings: [String]
    },
    guestAccess: {
      required: Boolean,
      implemented: Boolean,
      isolated: Boolean,
      compliant: Boolean,
      findings: [String]
    },
    rogueApDetection: {
      required: Boolean,
      implemented: Boolean,
      automated: Boolean,
      compliant: Boolean,
      findings: [String]
    },
    incidentResponse: {
      required: Boolean,
      implemented: Boolean,
      documented: Boolean,
      compliant: Boolean,
      findings: [String]
    }
  },
  
  // Control Categories
  controlCategories: [{
    category: String,
    totalControls: Number,
    compliantControls: Number,
    nonCompliantControls: Number,
    partialControls: Number,
    notApplicableControls: Number,
    complianceRate: Number
  }],
  
  // Gaps and Issues
  gaps: [{
    gapId: String,
    requirement: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    description: String,
    currentState: String,
    requiredState: String,
    impact: String,
    remediation: String,
    effort: String,
    cost: String,
    timeline: String,
    responsible: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'remediated', 'accepted', 'mitigated']
    }
  }],
  
  // Audit Trail
  auditTrail: [{
    timestamp: Date,
    event: String,
    performedBy: String,
    details: String,
    evidence: String
  }],
  
  // Exceptions and Compensating Controls
  exceptions: [{
    requirement: String,
    reason: String,
    approvedBy: String,
    approvalDate: Date,
    expiryDate: Date,
    compensatingControls: [String],
    riskAcceptance: String
  }],
  
  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    requirement: String,
    recommendation: String,
    benefit: String,
    effort: String,
    timeline: String,
    cost: String,
    status: String
  }],
  
  // Testing Methodology
  methodology: {
    approach: String,
    tools: [String],
    samplingStrategy: String,
    testPeriod: {
      start: Date,
      end: Date
    },
    testers: [String]
  },
  
  // Scope
  scope: {
    locations: [String],
    departments: [String],
    systems: [String],
    assetsCovered: Number,
    assetsExcluded: [String],
    exclusionReason: String
  },
  
  // Previous Report Comparison
  previousReport: {
    reportId: String,
    reportDate: Date,
    compliancePercentage: Number,
    improvement: Number,
    newGaps: Number,
    closedGaps: Number
  },
  
  // Attestation
  attestation: {
    attested: Boolean,
    attestedBy: String,
    attestationDate: Date,
    statement: String,
    signature: String
  },
  
  // Certification Status
  certification: {
    certified: Boolean,
    certificationBody: String,
    certificationDate: Date,
    certificateNumber: String,
    validUntil: Date,
    auditor: String
  },
  
  // Report Metadata
  generatedBy: {
    user: String,
    role: String,
    automated: Boolean
  },
  approvedBy: {
    user: String,
    role: String,
    date: Date
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  
  // Distribution
  distribution: [{
    recipient: String,
    role: String,
    distributedAt: Date,
    acknowledged: Boolean,
    acknowledgedAt: Date
  }],
  
  // Next Assessment
  nextAssessment: {
    scheduledDate: Date,
    type: String,
    scope: String
  },
  
  // Document Attachments
  attachments: [{
    filename: String,
    type: String,
    description: String,
    filePath: String,
    uploadedAt: Date,
    uploadedBy: String
  }],
  
  // Executive Summary
  executiveSummary: {
    overallStatus: String,
    keyFindings: [String],
    criticalGaps: Number,
    improvementAreas: [String],
    strengths: [String],
    timeline: String,
    budget: String,
    businessImpact: String
  },
  
  // Tags and Notes
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
complianceReportSchema.index({ framework: 1, reportDate: -1 });
complianceReportSchema.index({ complianceStatus: 1 });
complianceReportSchema.index({ 'reportingPeriod.startDate': 1, 'reportingPeriod.endDate': 1 });
complianceReportSchema.index({ status: 1 });

// Methods
complianceReportSchema.methods.calculateCompliancePercentage = function() {
  const total = this.requirements.length;
  if (total === 0) return 0;
  
  const passed = this.requirements.filter(r => r.status === 'pass').length;
  const partial = this.requirements.filter(r => r.status === 'partial').length;
  const notApplicable = this.requirements.filter(r => r.status === 'not_applicable').length;
  
  // Calculate based on applicable requirements only
  const applicable = total - notApplicable;
  if (applicable === 0) return 100;
  
  // Partial compliance counts as 50%
  const effectivePassed = passed + (partial * 0.5);
  
  this.compliancePercentage = Math.round((effectivePassed / applicable) * 100);
  return this.compliancePercentage;
};

complianceReportSchema.methods.determineComplianceStatus = function() {
  const percentage = this.compliancePercentage || this.calculateCompliancePercentage();
  
  if (percentage >= 100) {
    this.complianceStatus = 'compliant';
  } else if (percentage >= 80) {
    this.complianceStatus = 'partial_compliant';
  } else {
    this.complianceStatus = 'non_compliant';
  }
  
  return this.complianceStatus;
};

complianceReportSchema.methods.getCriticalGaps = function() {
  return this.gaps.filter(g => g.severity === 'critical' && g.status !== 'remediated');
};

complianceReportSchema.methods.generateActionPlan = function() {
  const criticalGaps = this.getCriticalGaps();
  const actions = [];
  
  criticalGaps.forEach(gap => {
    actions.push({
      priority: 1,
      action: gap.remediation,
      requirement: gap.requirement,
      timeline: gap.timeline,
      responsible: gap.responsible
    });
  });
  
  // Add high priority recommendations
  this.recommendations
    .filter(r => r.priority === 'critical' || r.priority === 'high')
    .forEach(r => {
      actions.push({
        priority: r.priority === 'critical' ? 1 : 2,
        action: r.recommendation,
        timeline: r.timeline,
        benefit: r.benefit
      });
    });
  
  return actions.sort((a, b) => a.priority - b.priority);
};

complianceReportSchema.methods.compareWithPrevious = function(previousReport) {
  if (!previousReport) return null;
  
  this.previousReport = {
    reportId: previousReport.reportId,
    reportDate: previousReport.reportDate,
    compliancePercentage: previousReport.compliancePercentage,
    improvement: this.compliancePercentage - previousReport.compliancePercentage,
    newGaps: this.gaps.length - previousReport.gaps.length,
    closedGaps: 0 // Calculate based on gap comparison
  };
  
  return this.previousReport;
};

complianceReportSchema.methods.approve = function(approver, role) {
  this.approvedBy = {
    user: approver,
    role: role,
    date: new Date()
  };
  this.status = 'approved';
  
  this.auditTrail.push({
    timestamp: new Date(),
    event: 'report_approved',
    performedBy: approver,
    details: `Report approved by ${approver} (${role})`
  });
};

complianceReportSchema.methods.publish = function() {
  if (this.status !== 'approved') {
    throw new Error('Report must be approved before publishing');
  }
  
  this.status = 'published';
  
  this.auditTrail.push({
    timestamp: new Date(),
    event: 'report_published',
    details: 'Report published and distributed'
  });
};

module.exports = mongoose.model('ComplianceReport', complianceReportSchema);

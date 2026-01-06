const mongoose = require('mongoose');

/**
 * ComplianceReport Model - Multi-Framework Privacy Compliance Assessment
 * GDPR, CCPA, PIPEDA, LGPD compliance scoring and gap analysis
 */
const ComplianceReportSchema = new mongoose.Schema({
  // Report identification
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Report metadata
  metadata: {
    title: String,
    reportType: {
      type: String,
      enum: ['comprehensive', 'framework_specific', 'gap_analysis', 'trend_analysis', 'executive_summary', 'audit_readiness'],
      required: true
    },
    frameworks: [{
      type: String,
      enum: ['gdpr', 'ccpa', 'cpra', 'pipeda', 'lgpd', 'appi', 'pdpa_singapore', 'pdpa_thailand', 'popia']
    }],
    reportingPeriod: {
      startDate: Date,
      endDate: Date
    },
    generatedDate: {
      type: Date,
      default: Date.now
    },
    generatedBy: String
  },

  // Overall compliance score
  overallScore: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    },
    status: {
      type: String,
      enum: ['compliant', 'mostly_compliant', 'partially_compliant', 'non_compliant', 'critical']
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    },
    previousScore: Number,
    changePercentage: Number
  },

  // Framework-specific scores
  frameworkScores: [{
    framework: String,
    applicable: Boolean,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    grade: String,
    status: String,
    lastAssessed: Date,
    assessor: String,
    dimensions: [{
      name: String,
      weight: Number,
      score: Number,
      maxScore: Number,
      status: String
    }]
  }],

  // Compliance dimensions
  dimensions: {
    consentManagement: {
      score: Number,
      findings: [String],
      strengths: [String],
      weaknesses: [String],
      recommendations: [String]
    },
    dataSubjectRights: {
      score: Number,
      avgResponseTime: Number, // hours
      requestsReceived: Number,
      requestsCompleted: Number,
      overdueRequests: Number,
      findings: [String]
    },
    securityMeasures: {
      score: Number,
      encryptionCoverage: Number, // percentage
      accessControlsImplemented: Boolean,
      incidentResponsePlan: Boolean,
      findings: [String]
    },
    breachResponse: {
      score: Number,
      breachesReported: Number,
      timelyNotifications: Number,
      findings: [String]
    },
    documentation: {
      score: Number,
      ropaComplete: Boolean,
      privacyPolicyCurrent: Boolean,
      dpiasConducted: Number,
      findings: [String]
    },
    vendorManagement: {
      score: Number,
      totalVendors: Number,
      vendorsWithDPA: Number,
      dpaCoverage: Number, // percentage
      findings: [String]
    },
    internationalTransfers: {
      score: Number,
      transfersIdentified: Number,
      transfersWithSafeguards: Number,
      findings: [String]
    },
    retentionPolicies: {
      score: Number,
      policiesDocumented: Boolean,
      automatedDeletion: Boolean,
      findings: [String]
    },
    training: {
      score: Number,
      employeesTrained: Number,
      totalEmployees: Number,
      trainingCoverage: Number, // percentage
      findings: [String]
    },
    thirdPartyTrackers: {
      score: Number,
      totalTrackers: Number,
      compliantTrackers: Number,
      highRiskTrackers: Number,
      findings: [String]
    }
  },

  // Gap analysis
  gaps: [{
    gapId: String,
    category: String,
    framework: String,
    requirement: String,
    currentState: String,
    desiredState: String,
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    impact: String,
    likelihood: String,
    riskScore: Number,
    identified: Date,
    status: {
      type: String,
      enum: ['identified', 'acknowledged', 'in_progress', 'resolved', 'accepted']
    }
  }],

  // Remediation plan
  remediations: [{
    remediationId: String,
    gapId: String,
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    assignedTo: String,
    dueDate: Date,
    estimatedEffort: Number, // hours
    estimatedCost: Number,
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'deferred', 'cancelled']
    },
    completedDate: Date,
    verification: {
      verified: Boolean,
      verifiedBy: String,
      verifiedDate: Date
    }
  }],

  // Risk assessment
  risks: [{
    riskId: String,
    title: String,
    description: String,
    category: String,
    likelihood: {
      type: String,
      enum: ['rare', 'unlikely', 'possible', 'likely', 'certain']
    },
    impact: {
      type: String,
      enum: ['negligible', 'low', 'moderate', 'high', 'severe']
    },
    riskScore: Number,
    riskLevel: String,
    mitigations: [String],
    residualRisk: String
  }],

  // Compliance metrics
  metrics: {
    piiRecords: {
      total: Number,
      highRisk: Number,
      remediated: Number,
      remediationRate: Number
    },
    consentRecords: {
      total: Number,
      validConsents: Number,
      withdrawnConsents: Number,
      expiredConsents: Number,
      consentRate: Number
    },
    dataMappings: {
      total: Number,
      requireDPIA: Number,
      dpiasCompleted: Number,
      outOfDate: Number
    },
    privacyAssessments: {
      total: Number,
      highRisk: Number,
      completed: Number,
      requireConsultation: Number
    },
    dsarRequests: {
      total: Number,
      completed: Number,
      overdue: Number,
      avgResponseTime: Number,
      completionRate: Number
    },
    trackers: {
      total: Number,
      requireConsent: Number,
      highRisk: Number,
      compliant: Number
    },
    dataBreaches: {
      total: Number,
      reported: Number,
      within72Hours: Number,
      complianceRate: Number
    }
  },

  // Strengths
  strengths: [{
    area: String,
    description: String,
    evidence: [String]
  }],

  // Recommendations
  recommendations: [{
    priority: String,
    category: String,
    title: String,
    description: String,
    expectedBenefit: String,
    estimatedEffort: String,
    resources: [String]
  }],

  // Executive summary
  executiveSummary: {
    overview: String,
    keyFindings: [String],
    criticalIssues: [String],
    immediatActions: [String],
    nextSteps: [String]
  },

  // Comparison with previous reports
  comparison: {
    previousReportId: String,
    previousScore: Number,
    scoreChange: Number,
    gapsResolved: Number,
    newGapsIdentified: Number,
    trendAnalysis: String
  },

  // External audits
  audits: [{
    auditor: String,
    auditDate: Date,
    auditType: String,
    findings: [String],
    recommendations: [String],
    followUpRequired: Boolean
  }],

  // Report generation
  generation: {
    duration: Number, // seconds
    dataSourcesQueried: [String],
    recordsAnalyzed: Number,
    automatedChecks: Number,
    manualReviews: Number
  },

  // Report distribution
  distribution: {
    recipients: [{
      name: String,
      email: String,
      role: String,
      sentDate: Date
    }],
    accessLevel: {
      type: String,
      enum: ['public', 'internal', 'management', 'board', 'confidential']
    }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
    default: 'draft',
    index: true
  },

  // Approval
  approval: {
    approvedBy: String,
    approvedDate: Date,
    comments: String
  },

  // Next review
  nextReview: {
    scheduledDate: Date,
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi_annually', 'annually']
    }
  },

  // Notes
  tags: [String],
  notes: String,
  attachments: [String]

}, {
  timestamps: true,
  collection: 'compliance_reports'
});

// Indexes
ComplianceReportSchema.index({ reportId: 1 });
ComplianceReportSchema.index({ 'metadata.frameworks': 1 });
ComplianceReportSchema.index({ status: 1, 'metadata.generatedDate': -1 });

// Virtual: Compliance status
ComplianceReportSchema.virtual('complianceStatus').get(function() {
  const score = this.overallScore.score;
  if (score >= 90) return 'compliant';
  if (score >= 75) return 'mostly_compliant';
  if (score >= 60) return 'partially_compliant';
  if (score >= 40) return 'non_compliant';
  return 'critical';
});

// Virtual: Critical gaps count
ComplianceReportSchema.virtual('criticalGapsCount').get(function() {
  return this.gaps.filter(g => g.severity === 'critical').length;
});

// Instance method: Calculate overall score
ComplianceReportSchema.methods.calculateOverallScore = function() {
  if (!this.frameworkScores || this.frameworkScores.length === 0) {
    return 0;
  }
  
  // Average applicable framework scores
  const applicableScores = this.frameworkScores
    .filter(fs => fs.applicable)
    .map(fs => fs.score);
  
  if (applicableScores.length === 0) return 0;
  
  const avgScore = applicableScores.reduce((sum, score) => sum + score, 0) / applicableScores.length;
  this.overallScore.score = Math.round(avgScore);
  
  // Assign grade
  if (avgScore >= 97) this.overallScore.grade = 'A+';
  else if (avgScore >= 93) this.overallScore.grade = 'A';
  else if (avgScore >= 90) this.overallScore.grade = 'A-';
  else if (avgScore >= 87) this.overallScore.grade = 'B+';
  else if (avgScore >= 83) this.overallScore.grade = 'B';
  else if (avgScore >= 80) this.overallScore.grade = 'B-';
  else if (avgScore >= 77) this.overallScore.grade = 'C+';
  else if (avgScore >= 73) this.overallScore.grade = 'C';
  else if (avgScore >= 70) this.overallScore.grade = 'C-';
  else if (avgScore >= 60) this.overallScore.grade = 'D';
  else this.overallScore.grade = 'F';
  
  // Determine status
  this.overallScore.status = this.complianceStatus;
  
  return this.overallScore.score;
};

// Instance method: Add gap
ComplianceReportSchema.methods.addGap = function(gap) {
  const gapId = `GAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  this.gaps.push({
    gapId,
    ...gap,
    identified: new Date(),
    status: 'identified'
  });
  
  return this.save();
};

// Instance method: Generate executive summary
ComplianceReportSchema.methods.generateExecutiveSummary = function() {
  const criticalGaps = this.gaps.filter(g => g.severity === 'critical');
  const highGaps = this.gaps.filter(g => g.severity === 'high');
  
  this.executiveSummary = {
    overview: `Privacy compliance assessment for ${this.metadata.frameworks.join(', ')}. Overall score: ${this.overallScore.score}/100 (${this.overallScore.grade}).`,
    keyFindings: [
      `${criticalGaps.length} critical gaps identified`,
      `${highGaps.length} high-priority gaps identified`,
      `Data subject rights response time: ${this.dimensions.dataSubjectRights?.avgResponseTime || 'N/A'} hours`,
      `DPA coverage: ${this.dimensions.vendorManagement?.dpaCoverage || 0}%`
    ],
    criticalIssues: criticalGaps.map(g => g.requirement),
    immediatActions: criticalGaps.slice(0, 5).map(g => `Address ${g.requirement}`),
    nextSteps: [
      'Review and prioritize remediation plan',
      'Assign resources to critical gaps',
      'Schedule follow-up assessment'
    ]
  };
  
  return this.save();
};

// Static: Get latest report
ComplianceReportSchema.statics.getLatestReport = function(framework = null) {
  const query = { status: 'published' };
  if (framework) {
    query['metadata.frameworks'] = framework;
  }
  
  return this.findOne(query).sort({ 'metadata.generatedDate': -1 });
};

// Static: Get compliance trend
ComplianceReportSchema.statics.getComplianceTrend = async function(framework = null, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const query = {
    status: 'published',
    'metadata.generatedDate': { $gte: startDate }
  };
  
  if (framework) {
    query['metadata.frameworks'] = framework;
  }
  
  const reports = await this.find(query)
    .sort({ 'metadata.generatedDate': 1 })
    .select('overallScore.score metadata.generatedDate');
  
  return reports.map(r => ({
    date: r.metadata.generatedDate,
    score: r.overallScore.score
  }));
};

// Static: Get gap statistics
ComplianceReportSchema.statics.getGapStatistics = async function(reportId) {
  const report = await this.findOne({ reportId });
  if (!report) return null;
  
  return {
    total: report.gaps.length,
    critical: report.gaps.filter(g => g.severity === 'critical').length,
    high: report.gaps.filter(g => g.severity === 'high').length,
    medium: report.gaps.filter(g => g.severity === 'medium').length,
    low: report.gaps.filter(g => g.severity === 'low').length,
    resolved: report.gaps.filter(g => g.status === 'resolved').length,
    inProgress: report.gaps.filter(g => g.status === 'in_progress').length
  };
};

// Pre-save: Calculate scores
ComplianceReportSchema.pre('save', function(next) {
  if (this.isModified('frameworkScores') || this.isNew) {
    this.calculateOverallScore();
  }
  
  next();
});

module.exports = mongoose.model('ComplianceReport', ComplianceReportSchema);

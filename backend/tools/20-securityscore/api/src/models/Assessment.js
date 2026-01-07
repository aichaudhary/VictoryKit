const mongoose = require('mongoose');

/**
 * Assessment Model
 * 
 * Manages security assessments including self-assessments, audits,
 * penetration tests, and vulnerability scans that contribute to security scores.
 */

const assessmentSchema = new mongoose.Schema({
  // Basic Information
  assessmentId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Assessment name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Assessment Type and Classification
  type: {
    type: String,
    enum: ['self_assessment', 'internal_audit', 'external_audit', 'penetration_test', 'vulnerability_scan', 'security_review', 'compliance_audit', 'risk_assessment', 'control_assessment', 'gap_analysis'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance', 'physical', 'procedural'],
    index: true
  },
  scope: {
    type: String,
    enum: ['organization_wide', 'department', 'system', 'application', 'infrastructure', 'process', 'control_family', 'specific_controls'],
    required: true
  },

  // Target Entity
  target: {
    entityType: {
      type: String,
      enum: ['organization', 'department', 'business_unit', 'system', 'application', 'infrastructure', 'process']
    },
    entityId: String,
    entityName: String,
    description: String
  },

  // Assessment Schedule
  schedule: {
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    duration: Number, // in days
    frequency: {
      type: String,
      enum: ['one_time', 'monthly', 'quarterly', 'semi_annual', 'annual', 'continuous']
    },
    nextScheduledDate: Date
  },

  // Status and Progress
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled', 'failed'],
    default: 'planned',
    index: true
  },
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    currentPhase: {
      type: String,
      enum: ['planning', 'preparation', 'execution', 'analysis', 'reporting', 'remediation']
    },
    milestones: [{
      name: String,
      dueDate: Date,
      completedDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'delayed']
      }
    }]
  },

  // Assessor Information
  assessor: {
    type: {
      type: String,
      enum: ['internal', 'external', 'third_party', 'automated']
    },
    organization: String,
    lead: {
      name: String,
      email: String,
      userId: String,
      certifications: [String]
    },
    team: [{
      name: String,
      email: String,
      role: String,
      userId: String
    }],
    credentials: [{
      type: String,
      number: String,
      issuer: String,
      expiryDate: Date
    }]
  },

  // Methodology and Framework
  methodology: {
    framework: {
      type: String,
      enum: ['NIST-CSF', 'ISO27001', 'CIS', 'COBIT', 'OWASP', 'SANS', 'PCI-DSS', 'HIPAA', 'SOC2', 'Custom']
    },
    version: String,
    approach: {
      type: String,
      enum: ['white_box', 'black_box', 'gray_box', 'hybrid']
    },
    tools: [String],
    techniques: [String]
  },

  // Assessment Scope Details
  scopeDetails: {
    systems: [{
      systemId: String,
      name: String,
      type: String,
      criticality: String
    }],
    networks: [{
      networkId: String,
      name: String,
      cidr: String
    }],
    applications: [{
      applicationId: String,
      name: String,
      url: String
    }],
    controls: [{
      controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
      name: String,
      family: String
    }],
    exclusions: [{
      type: String,
      identifier: String,
      reason: String
    }]
  },

  // Findings
  findings: {
    summary: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      informational: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    details: [{
      findingId: String,
      title: String,
      severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'informational']
      },
      category: String,
      description: String,
      impact: String,
      likelihood: String,
      riskScore: Number,
      cvss: {
        version: String,
        vector: String,
        baseScore: Number
      },
      affectedAssets: [String],
      evidence: [{
        type: String,
        description: String,
        url: String,
        screenshot: String
      }],
      recommendation: String,
      remediationSteps: [String],
      remediationTimeline: String,
      status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive']
      },
      assignedTo: String,
      dueDate: Date,
      resolvedDate: Date
    }]
  },

  // Compliance Results
  compliance: {
    overall: {
      compliant: { type: Number, default: 0 },
      nonCompliant: { type: Number, default: 0 },
      partiallyCompliant: { type: Number, default: 0 },
      notApplicable: { type: Number, default: 0 },
      notTested: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    frameworks: [{
      name: String,
      version: String,
      score: Number,
      compliantControls: Number,
      totalControls: Number,
      gaps: [{
        controlId: String,
        title: String,
        severity: String,
        description: String
      }]
    }],
    certificationStatus: {
      eligible: Boolean,
      requirements: [String],
      gaps: [String]
    }
  },

  // Risk Assessment
  risk: {
    overallRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    inherentRisk: Number,
    residualRisk: Number,
    riskCategories: [{
      category: String,
      score: Number,
      level: String,
      findings: Number
    }],
    topRisks: [{
      riskId: String,
      title: String,
      score: Number,
      impact: String,
      likelihood: String,
      mitigation: String
    }]
  },

  // Metrics and Measurements
  metrics: [{
    metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
    name: String,
    value: Number,
    target: Number,
    status: String,
    impact: Number
  }],

  // Results and Scoring
  results: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    },
    categoryScores: {
      network: Number,
      endpoint: Number,
      identity: Number,
      data: Number,
      application: Number,
      cloud: Number,
      compliance: Number
    },
    benchmarkComparison: {
      industryAverage: Number,
      peerAverage: Number,
      bestPractice: Number,
      percentile: Number
    },
    previousScore: Number,
    scoreChange: Number,
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining']
    }
  },

  // Recommendations
  recommendations: [{
    recommendationId: String,
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low']
    },
    title: String,
    description: String,
    category: String,
    estimatedImpact: Number,
    estimatedCost: Number,
    estimatedEffort: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    },
    timeline: String,
    implementation: [String],
    relatedFindings: [String],
    status: {
      type: String,
      enum: ['proposed', 'approved', 'in_progress', 'implemented', 'rejected']
    },
    assignedTo: String,
    dueDate: Date
  }],

  // Documentation
  documentation: {
    methodology: String,
    testCases: [{
      testId: String,
      title: String,
      description: String,
      result: String,
      evidence: String
    }],
    tools: [{
      name: String,
      version: String,
      purpose: String
    }],
    references: [String],
    notes: String
  },

  // Reports
  reports: [{
    reportId: String,
    type: {
      type: String,
      enum: ['executive', 'technical', 'compliance', 'full']
    },
    format: {
      type: String,
      enum: ['pdf', 'html', 'docx', 'json']
    },
    generatedDate: Date,
    url: String,
    size: Number,
    version: String
  }],

  // Remediation Tracking
  remediation: {
    plan: String,
    priority: String,
    owner: String,
    budget: Number,
    currency: { type: String, default: 'USD' },
    timeline: {
      startDate: Date,
      targetDate: Date,
      completedDate: Date
    },
    progress: {
      percentage: { type: Number, default: 0 },
      itemsTotal: Number,
      itemsCompleted: Number
    },
    validation: {
      required: Boolean,
      method: String,
      scheduled: Date,
      completed: Date,
      result: String
    }
  },

  // Approval Workflow
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvers: [{
      name: String,
      email: String,
      role: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      date: Date,
      comments: String
    }],
    finalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    approvedDate: Date
  },

  // Quality Assurance
  qualityAssurance: {
    reviewed: Boolean,
    reviewer: {
      name: String,
      email: String,
      userId: String
    },
    reviewDate: Date,
    issues: [{
      description: String,
      severity: String,
      resolved: Boolean
    }],
    approved: Boolean
  },

  // Related Entities
  relatedEntities: {
    securityScore: { type: mongoose.Schema.Types.ObjectId, ref: 'SecurityScore' },
    previousAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    nextAssessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
    improvements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Improvement' }]
  },

  // Metadata
  metadata: {
    createdBy: {
      name: String,
      email: String,
      userId: String
    },
    lastModifiedBy: {
      name: String,
      email: String,
      userId: String
    },
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    confidentiality: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'confidential'
    },
    retentionPeriod: Number, // in days
    archiveDate: Date
  }
}, {
  timestamps: true,
  collection: 'assessments'
});

// Indexes
assessmentSchema.index({ assessmentId: 1 });
assessmentSchema.index({ type: 1, status: 1 });
assessmentSchema.index({ 'schedule.startDate': 1 });
assessmentSchema.index({ 'target.entityType': 1, 'target.entityId': 1 });
assessmentSchema.index({ 'methodology.framework': 1 });
assessmentSchema.index({ 'results.overallScore': -1 });

// Generate assessmentId
assessmentSchema.pre('save', function(next) {
  if (!this.assessmentId) {
    this.assessmentId = 'ASMT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Instance Methods

/**
 * Calculate overall score
 */
assessmentSchema.methods.calculateOverallScore = function() {
  // Calculate based on findings severity
  const { critical, high, medium, low, total } = this.findings.summary;
  
  if (total === 0) {
    this.results.overallScore = 100;
    return 100;
  }

  const criticalPenalty = critical * 20;
  const highPenalty = high * 10;
  const mediumPenalty = medium * 5;
  const lowPenalty = low * 1;

  const totalPenalty = criticalPenalty + highPenalty + mediumPenalty + lowPenalty;
  const score = Math.max(0, 100 - totalPenalty);

  this.results.overallScore = Math.round(score);
  
  // Calculate grade
  if (score >= 97) this.results.grade = 'A+';
  else if (score >= 93) this.results.grade = 'A';
  else if (score >= 90) this.results.grade = 'A-';
  else if (score >= 87) this.results.grade = 'B+';
  else if (score >= 83) this.results.grade = 'B';
  else if (score >= 80) this.results.grade = 'B-';
  else if (score >= 77) this.results.grade = 'C+';
  else if (score >= 73) this.results.grade = 'C';
  else if (score >= 70) this.results.grade = 'C-';
  else if (score >= 60) this.results.grade = 'D';
  else this.results.grade = 'F';

  return this.results.overallScore;
};

/**
 * Update findings summary
 */
assessmentSchema.methods.updateFindingsSummary = function() {
  const summary = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
    total: 0
  };

  this.findings.details.forEach(finding => {
    if (finding.status !== 'false_positive') {
      summary[finding.severity]++;
      summary.total++;
    }
  });

  this.findings.summary = summary;
  this.calculateOverallScore();
};

/**
 * Calculate risk score
 */
assessmentSchema.methods.calculateRiskScore = function() {
  const { critical, high, medium, low } = this.findings.summary;
  
  const criticalWeight = critical * 10;
  const highWeight = high * 5;
  const mediumWeight = medium * 2;
  const lowWeight = low * 0.5;

  const totalRiskPoints = criticalWeight + highWeight + mediumWeight + lowWeight;
  const maxRiskPoints = 100; // threshold for maximum risk

  this.risk.overallRiskScore = Math.min(100, Math.round((totalRiskPoints / maxRiskPoints) * 100));

  // Determine risk level
  if (this.risk.overallRiskScore >= 80) this.risk.riskLevel = 'critical';
  else if (this.risk.overallRiskScore >= 60) this.risk.riskLevel = 'high';
  else if (this.risk.overallRiskScore >= 40) this.risk.riskLevel = 'medium';
  else this.risk.riskLevel = 'low';

  return this.risk.overallRiskScore;
};

/**
 * Mark as completed
 */
assessmentSchema.methods.complete = function() {
  this.status = 'completed';
  this.schedule.actualEndDate = new Date();
  this.progress.percentage = 100;
  this.progress.currentPhase = 'reporting';
  this.updateFindingsSummary();
  this.calculateRiskScore();
};

// Static Methods

/**
 * Find by entity
 */
assessmentSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({ 
    'target.entityType': entityType,
    'target.entityId': entityId
  })
    .sort({ 'schedule.startDate': -1 })
    .exec();
};

/**
 * Find recent
 */
assessmentSchema.statics.findRecent = function(limit = 10) {
  return this.find({ status: 'completed' })
    .sort({ 'schedule.actualEndDate': -1 })
    .limit(limit)
    .exec();
};

/**
 * Find by framework
 */
assessmentSchema.statics.findByFramework = function(framework) {
  return this.find({ 'methodology.framework': framework })
    .sort({ 'schedule.startDate': -1 })
    .exec();
};

/**
 * Get statistics
 */
assessmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        averageScore: { $avg: '$results.overallScore' },
        criticalFindings: { $sum: '$findings.summary.critical' },
        highFindings: { $sum: '$findings.summary.high' }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('Assessment', assessmentSchema);

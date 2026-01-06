const mongoose = require('mongoose');

/**
 * PrivacyAssessment Model - Privacy Impact Assessment (PIA) / Data Protection Impact Assessment (DPIA)
 * Evaluates privacy risks of data processing activities
 */
const PrivacyAssessmentSchema = new mongoose.Schema({
  // Assessment identification
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Assessment metadata
  metadata: {
    title: {
      type: String,
      required: true
    },
    description: String,
    assessmentType: {
      type: String,
      enum: ['pia', 'dpia', 'tia', 'lia', 'quick_scan', 'full_assessment'],
      required: true
    },
    framework: {
      type: String,
      enum: ['gdpr', 'ccpa', 'pipeda', 'lgpd', 'iso29134', 'nist'],
      default: 'gdpr'
    },
    startDate: Date,
    completionDate: Date,
    targetCompletionDate: Date
  },

  // Processing activity being assessed
  processingActivity: {
    activityName: String,
    systemName: String,
    dataMapping reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataMapping'
    },
    description: String,
    purposes: [String],
    legalBases: [String],
    dataCategories: [String],
    dataSubjectCategories: [String]
  },

  // Assessment triggers (GDPR Article 35(3))
  triggers: [{
    trigger: {
      type: String,
      enum: [
        'systematic_extensive_evaluation', // Automated profiling
        'large_scale_special_category', // Sensitive data at scale
        'systematic_monitoring_public', // CCTV, tracking
        'new_technology', // Innovative technology
        'data_matching', // Combining datasets
        'special_category_data', // GDPR Article 9
        'children_data', // Children's data
        'vulnerable_groups', // Vulnerable data subjects
        'international_transfer', // Cross-border transfers
        'innovative_use', // Novel use of data
        'high_volume', // Large-scale processing
        'automated_decisions' // Article 22 automated decisions
      ]
    },
    applicable: Boolean,
    description: String
  }],

  // Assessment team
  team: {
    lead: {
      name: String,
      role: String,
      email: String
    },
    members: [{
      name: String,
      role: String,
      email: String,
      responsibilities: String
    }],
    dpoInvolved: Boolean,
    dpoName: String,
    externalConsultants: [{
      name: String,
      organization: String,
      expertise: String
    }]
  },

  // Necessity and proportionality (GDPR Article 35(7)(b))
  necessityProportionality: {
    lawfulBasis: String,
    necessity: {
      necessary: Boolean,
      justification: String,
      alternativesConsidered: [String]
    },
    proportionality: {
      proportionate: Boolean,
      justification: String,
      dataMinimization: Boolean
    },
    legitimateInterests: {
      applicable: Boolean,
      balancingTestCompleted: Boolean,
      result: String
    }
  },

  // Risk identification (GDPR Article 35(7)(c))
  risks: [{
    riskId: String,
    riskName: String,
    category: {
      type: String,
      enum: ['confidentiality', 'integrity', 'availability', 'discrimination', 'financial_loss', 'reputation', 'physical_harm', 'loss_of_control']
    },
    description: String,
    affectedDataSubjects: [String],
    likelihood: {
      type: String,
      enum: ['rare', 'unlikely', 'possible', 'likely', 'certain'],
      required: true
    },
    severity: {
      type: String,
      enum: ['negligible', 'low', 'moderate', 'high', 'severe'],
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 25 // 5x5 matrix
    },
    inherentRisk: Boolean // Risk before mitigations
  }],

  // Mitigation measures (GDPR Article 35(7)(d))
  mitigations: [{
    mitigationId: String,
    relatedRiskIds: [String],
    measureType: {
      type: String,
      enum: ['technical', 'organizational', 'legal', 'procedural']
    },
    measure: String,
    description: String,
    implementation: {
      status: {
        type: String,
        enum: ['planned', 'in_progress', 'implemented', 'verified', 'not_implemented']
      },
      implementedBy: String,
      implementedDate: Date,
      targetDate: Date,
      cost: Number,
      effectiveness: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    residualRisk: {
      likelihood: String,
      severity: String,
      riskLevel: String,
      riskScore: Number
    }
  }],

  // Privacy by design and default
  privacyByDesign: {
    implemented: Boolean,
    measures: [String],
    defaultSettings: String,
    dataMinimization: Boolean,
    pseudonymization: Boolean,
    encryption: Boolean,
    accessControls: Boolean
  },

  // Data subject consultation
  dataSubjectConsultation: {
    required: Boolean,
    conducted: Boolean,
    method: String, // Survey, focus group, etc.
    date: Date,
    participants: Number,
    findings: String,
    concerns: [String],
    incorporated: Boolean
  },

  // DPO opinion (GDPR Article 35(2))
  dpoOpinion: {
    provided: Boolean,
    dpoName: String,
    date: Date,
    opinion: String,
    recommendations: [String],
    concerns: [String],
    approved: Boolean
  },

  // Supervisory authority consultation (GDPR Article 36)
  supervisoryConsultation: {
    required: Boolean,
    reason: String,
    authority: String,
    consultedDate: Date,
    response: String,
    guidance: [String],
    additionalMeasures: [String]
  },

  // Overall assessment
  assessment: {
    overallRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    totalRisks: Number,
    highRisks: Number,
    criticalRisks: Number,
    mitigatedRisks: Number,
    residualRisks: Number,
    acceptableRisk: Boolean,
    justification: String
  },

  // Decision
  decision: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'approved_with_conditions', 'rejected', 'requires_consultation'],
      default: 'pending'
    },
    decidedBy: String,
    decidedDate: Date,
    decision: String,
    conditions: [String],
    reviewRequired: Boolean,
    nextReviewDate: Date
  },

  // Recommendations
  recommendations: [{
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    recommendation: String,
    assignedTo: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'deferred']
    }
  }],

  // Status tracking
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'dpo_review', 'stakeholder_review', 'completed', 'approved', 'requires_supervisory_consultation'],
    default: 'not_started',
    index: true
  },

  // Review cycle
  review: {
    reviewFrequency: String, // e.g., "Annual", "Biennial"
    lastReviewDate: Date,
    nextReviewDate: Date,
    reviewers: [String],
    reviewNotes: String
  },

  // Metadata
  version: {
    type: String,
    default: '1.0'
  },
  tags: [String],
  notes: String,
  createdBy: String,
  lastModifiedBy: String

}, {
  timestamps: true,
  collection: 'privacy_assessments'
});

// Indexes
PrivacyAssessmentSchema.index({ assessmentId: 1 });
PrivacyAssessmentSchema.index({ status: 1 });
PrivacyAssessmentSchema.index({ 'assessment.overallRiskLevel': 1 });
PrivacyAssessmentSchema.index({ 'decision.status': 1 });
PrivacyAssessmentSchema.index({ 'review.nextReviewDate': 1 });

// Virtual: Requires supervisory consultation
PrivacyAssessmentSchema.virtual('requiresSupervisoryConsultation').get(function() {
  return this.assessment.overallRiskLevel === 'critical' ||
         (this.assessment.overallRiskLevel === 'high' && !this.assessment.acceptableRisk);
});

// Virtual: Is overdue
PrivacyAssessmentSchema.virtual('isOverdue').get(function() {
  return this.metadata.targetCompletionDate && 
         this.metadata.targetCompletionDate < new Date() &&
         this.status !== 'completed';
});

// Instance method: Calculate risk score
PrivacyAssessmentSchema.methods.calculateRiskScore = function(likelihood, severity) {
  const likelihoodScores = { rare: 1, unlikely: 2, possible: 3, likely: 4, certain: 5 };
  const severityScores = { negligible: 1, low: 2, moderate: 3, high: 4, severe: 5 };
  
  const score = (likelihoodScores[likelihood] || 1) * (severityScores[severity] || 1);
  
  let riskLevel;
  if (score >= 20) riskLevel = 'critical';
  else if (score >= 12) riskLevel = 'high';
  else if (score >= 6) riskLevel = 'medium';
  else riskLevel = 'low';
  
  return { score, riskLevel };
};

// Instance method: Add risk
PrivacyAssessmentSchema.methods.addRisk = function(risk) {
  const riskCalculation = this.calculateRiskScore(risk.likelihood, risk.severity);
  risk.riskScore = riskCalculation.score;
  risk.riskLevel = riskCalculation.riskLevel;
  risk.riskId = `RISK-${Date.now()}`;
  
  this.risks.push(risk);
  this.updateOverallAssessment();
  
  return this.save();
};

// Instance method: Update overall assessment
PrivacyAssessmentSchema.methods.updateOverallAssessment = function() {
  this.assessment.totalRisks = this.risks.length;
  this.assessment.highRisks = this.risks.filter(r => r.riskLevel === 'high').length;
  this.assessment.criticalRisks = this.risks.filter(r => r.riskLevel === 'critical').length;
  
  // Calculate overall risk level
  if (this.assessment.criticalRisks > 0) {
    this.assessment.overallRiskLevel = 'critical';
  } else if (this.assessment.highRisks > 0) {
    this.assessment.overallRiskLevel = 'high';
  } else if (this.risks.some(r => r.riskLevel === 'medium')) {
    this.assessment.overallRiskLevel = 'medium';
  } else {
    this.assessment.overallRiskLevel = 'low';
  }
  
  // Check if supervisory consultation needed
  if (this.requiresSupervisoryConsultation && !this.supervisoryConsultation.required) {
    this.supervisoryConsultation.required = true;
    this.supervisoryConsultation.reason = 'High residual risk after mitigation';
  }
};

// Instance method: Complete assessment
PrivacyAssessmentSchema.methods.complete = function(user) {
  this.status = 'completed';
  this.metadata.completionDate = new Date();
  this.lastModifiedBy = user;
  
  return this.save();
};

// Static: Find requiring supervisory consultation
PrivacyAssessmentSchema.statics.findRequiringSupervisoryConsultation = function() {
  return this.find({
    'supervisoryConsultation.required': true,
    'supervisoryConsultation.consultedDate': { $exists: false }
  });
};

// Static: Find high-risk assessments
PrivacyAssessmentSchema.statics.findHighRisk = function() {
  return this.find({
    'assessment.overallRiskLevel': { $in: ['high', 'critical'] }
  }).sort({ 'assessment.criticalRisks': -1 });
};

// Static: Find due for review
PrivacyAssessmentSchema.statics.findDueForReview = function() {
  return this.find({
    'review.nextReviewDate': { $lte: new Date() }
  }).sort({ 'review.nextReviewDate': 1 });
};

module.exports = mongoose.model('PrivacyAssessment', PrivacyAssessmentSchema);

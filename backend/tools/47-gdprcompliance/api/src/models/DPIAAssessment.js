const mongoose = require('mongoose');

// Data Protection Impact Assessment (Article 35)
const dpiaAssessmentSchema = new mongoose.Schema({
  // DPIA Identification
  dpiaId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  dpiaName: {
    type: String,
    required: true
  },
  dpiaReference: String,

  // Processing Activity
  processingActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingActivity',
    required: true
  },
  processingActivityName: String,

  // Trigger for DPIA (Article 35(3))
  triggers: {
    systematicExtensiveEvaluation: Boolean,          // Article 35(3)(a)
    largeScaleSpecialCategoryData: Boolean,          // Article 35(3)(b)
    systematicMonitoringPublicArea: Boolean,         // Article 35(3)(c)
    otherHighRisk: Boolean
  },
  triggerDescription: String,

  // DPIA Team
  team: {
    lead: {
      name: String,
      role: String,
      email: String
    },
    members: [{
      name: String,
      role: String,
      department: String,
      expertise: String
    }],
    dpoInvolved: {
      type: Boolean,
      required: true
    },
    dpoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DPO'
    }
  },

  // Assessment Status
  status: {
    type: String,
    required: true,
    enum: [
      'not_started',
      'scoping',
      'in_progress',
      'data_subject_consultation',
      'dpo_review',
      'management_review',
      'completed',
      'requires_supervisory_consultation',
      'approved',
      'rejected'
    ],
    default: 'not_started',
    index: true
  },

  // Timeline
  startDate: Date,
  completionDate: Date,
  reviewDate: Date,
  nextReviewDate: Date,
  approvalDate: Date,

  // Section 1: Description of Processing (Article 35(7)(a))
  processingDescription: {
    purposes: [{
      type: String,
      required: true
    }],
    detailedDescription: {
      type: String,
      required: true
    },
    dataSubjectCategories: [String],
    personalDataCategories: [{
      category: String,
      specificFields: [String],
      isSpecialCategory: Boolean,
      specialCategoryType: String
    }],
    recipients: [String],
    dataRetentionPeriod: String,
    dataFlowDiagram: String,
    dataTransfers: [{
      destination: String,
      mechanism: String
    }]
  },

  // Section 2: Necessity and Proportionality (Article 35(7)(b))
  necessityProportionality: {
    lawfulBasis: {
      basisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LegalBasis'
      },
      basisType: String,
      justification: String
    },
    necessity: {
      isNecessary: Boolean,
      justification: String,
      alternativesConsidered: [String]
    },
    proportionality: {
      isProportionate: Boolean,
      justification: String,
      dataMinimizationApplied: Boolean
    },
    legitimateInterests: {
      controllerInterests: String,
      thirdPartyInterests: String,
      balancingTest: String
    }
  },

  // Section 3: Risk Assessment (Article 35(7)(c))
  riskAssessment: {
    identifiedRisks: [{
      riskId: String,
      riskSource: String,
      riskDescription: String,
      threatType: {
        type: String,
        enum: [
          'unauthorized_access',
          'data_loss',
          'data_breach',
          'identity_theft',
          'discrimination',
          'reputational_damage',
          'financial_loss',
          'physical_harm',
          'loss_of_control',
          'other'
        ]
      },
      affectedRights: [String],
      likelihood: {
        type: String,
        enum: ['negligible', 'low', 'medium', 'high', 'very_high']
      },
      severity: {
        type: String,
        enum: ['negligible', 'low', 'medium', 'high', 'very_high']
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      riskScore: Number  // Calculated from likelihood x severity
    }],
    
    overallRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    
    highRiskJustification: String
  },

  // Section 4: Mitigation Measures (Article 35(7)(d))
  mitigationMeasures: [{
    measureId: String,
    relatedRiskId: String,
    measureType: {
      type: String,
      enum: ['technical', 'organizational', 'contractual', 'procedural']
    },
    measureDescription: String,
    implementation: {
      status: {
        type: String,
        enum: ['planned', 'in_progress', 'implemented', 'not_implemented']
      },
      implementationDate: Date,
      responsible: String,
      cost: Number,
      effectiveness: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    residualRisk: {
      likelihood: String,
      severity: String,
      riskLevel: String
    }
  }],

  // Security Measures
  securityMeasures: {
    encryption: {
      inTransit: Boolean,
      atRest: Boolean,
      algorithms: [String]
    },
    accessControl: {
      implemented: Boolean,
      mechanisms: [String],
      roleBasedAccess: Boolean
    },
    pseudonymization: {
      implemented: Boolean,
      methods: [String]
    },
    anonymization: {
      implemented: Boolean,
      techniques: [String]
    },
    dataMinimization: {
      implemented: Boolean,
      approach: String
    },
    privacyByDesign: {
      implemented: Boolean,
      principles: [String]
    },
    privacyByDefault: {
      implemented: Boolean,
      defaults: [String]
    }
  },

  // Data Subject Rights
  dataSubjectRights: {
    accessMechanism: String,
    rectificationProcess: String,
    erasureProcess: String,
    restrictionProcess: String,
    portabilityMechanism: String,
    objectionMechanism: String,
    automatedDecisionOptOut: String
  },

  // Data Subject Consultation (if applicable)
  dataSubjectConsultation: {
    required: Boolean,
    conducted: Boolean,
    consultationMethod: String,
    consultationDate: Date,
    viewsSought: String,
    viewsReceived: String,
    howViewsConsidered: String,
    reasonIfNotConducted: String
  },

  // DPO Opinion (Article 35(2))
  dpoOpinion: {
    provided: Boolean,
    opinionDate: Date,
    opinion: String,
    recommendations: [String],
    concerns: [String]
  },

  // Supervisory Authority Consultation (Article 36)
  supervisoryConsultation: {
    required: Boolean,
    reasonIfRequired: String,
    requestDate: Date,
    authority: {
      name: String,
      country: String,
      referenceNumber: String
    },
    responseDate: Date,
    authorityOpinion: String,
    authorityRecommendations: [String],
    complianceWithAdvice: String
  },

  // Decision
  decision: {
    proceedWithProcessing: Boolean,
    conditions: [String],
    approvedBy: String,
    approvalDate: Date,
    rejectionReason: String
  },

  // Residual Risk Assessment
  residualRiskAssessment: {
    overallResidualRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    acceptable: Boolean,
    acceptanceJustification: String,
    additionalMeasuresRequired: [String]
  },

  // Monitoring and Review
  monitoring: {
    reviewFrequency: {
      type: String,
      enum: ['quarterly', 'biannually', 'annually', 'ad_hoc']
    },
    nextReviewTriggers: [String],
    reviewHistory: [{
      reviewDate: Date,
      reviewer: String,
      changes: String,
      outcome: String
    }]
  },

  // Documentation
  documents: [{
    documentType: {
      type: String,
      enum: ['data_flow_diagram', 'risk_matrix', 'consultation_record', 'dpo_opinion', 'approval', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],

  // Compliance Score
  complianceScore: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    criteria: [{
      criterion: String,
      met: Boolean,
      evidence: String
    }]
  },

  // Related Records
  relatedDPIAs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DPIAAssessment'
  }],
  relatedBreaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataBreach'
  }],

  // Metadata
  version: {
    type: Number,
    default: 1
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DPIAAssessment'
  },
  createdBy: String,
  lastModifiedBy: String,
  approvedBy: String,
  confidentialityLevel: {
    type: String,
    enum: ['internal', 'confidential', 'highly_confidential'],
    default: 'confidential'
  },
  notes: String

}, {
  timestamps: true
});

// Indexes
dpiaAssessmentSchema.index({ dpiaId: 1 });
dpiaAssessmentSchema.index({ status: 1 });
dpiaAssessmentSchema.index({ processingActivityId: 1 });
dpiaAssessmentSchema.index({ nextReviewDate: 1 });

// Virtuals
dpiaAssessmentSchema.virtual('isHighRisk').get(function() {
  return this.riskAssessment.overallRiskLevel === 'high' || 
         this.riskAssessment.overallRiskLevel === 'critical';
});

dpiaAssessmentSchema.virtual('requiresSupervisoryConsultation').get(function() {
  // Article 36: Consult if high residual risk remains after mitigation
  return (
    this.residualRiskAssessment.overallResidualRisk === 'high' ||
    this.residualRiskAssessment.overallResidualRisk === 'critical'
  );
});

// Methods
dpiaAssessmentSchema.methods.calculateRiskScore = function(likelihood, severity) {
  // Risk matrix calculation
  const likelihoodValues = { negligible: 1, low: 2, medium: 3, high: 4, very_high: 5 };
  const severityValues = { negligible: 1, low: 2, medium: 3, high: 4, very_high: 5 };
  
  const score = likelihoodValues[likelihood] * severityValues[severity];
  
  // Determine risk level
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
};

dpiaAssessmentSchema.methods.assessCompleteness = function() {
  const completeness = {
    hasProcessingDescription: !!this.processingDescription.detailedDescription,
    hasNecessityJustification: !!this.necessityProportionality.necessity.justification,
    hasRiskAssessment: this.riskAssessment.identifiedRisks.length > 0,
    hasMitigationMeasures: this.mitigationMeasures.length > 0,
    hasDPOOpinion: this.team.dpoInvolved ? this.dpoOpinion.provided : true,
    hasDataSubjectConsultation: this.dataSubjectConsultation.required ? 
      this.dataSubjectConsultation.conducted : true
  };
  
  const total = Object.keys(completeness).length;
  const completed = Object.values(completeness).filter(v => v).length;
  
  return {
    completeness,
    percentage: (completed / total) * 100,
    isComplete: completed === total
  };
};

dpiaAssessmentSchema.methods.addRisk = function(risk) {
  risk.riskScore = this.calculateRiskScore(risk.likelihood, risk.severity);
  risk.riskLevel = this.calculateRiskScore(risk.likelihood, risk.severity);
  this.riskAssessment.identifiedRisks.push(risk);
  this.updateOverallRiskLevel();
};

dpiaAssessmentSchema.methods.updateOverallRiskLevel = function() {
  const risks = this.riskAssessment.identifiedRisks;
  if (risks.length === 0) {
    this.riskAssessment.overallRiskLevel = 'low';
    return;
  }
  
  // Highest risk level determines overall risk
  const riskLevels = risks.map(r => r.riskLevel);
  if (riskLevels.includes('critical')) this.riskAssessment.overallRiskLevel = 'critical';
  else if (riskLevels.includes('high')) this.riskAssessment.overallRiskLevel = 'high';
  else if (riskLevels.includes('medium')) this.riskAssessment.overallRiskLevel = 'medium';
  else this.riskAssessment.overallRiskLevel = 'low';
};

// Statics
dpiaAssessmentSchema.statics.findDueForReview = function() {
  return this.find({
    status: 'approved',
    nextReviewDate: { $lte: new Date() }
  });
};

dpiaAssessmentSchema.statics.findHighRisk = function() {
  return this.find({
    'riskAssessment.overallRiskLevel': { $in: ['high', 'critical'] }
  });
};

dpiaAssessmentSchema.statics.findRequiringSupervisoryConsultation = function() {
  return this.find({
    'supervisoryConsultation.required': true,
    'supervisoryConsultation.responseDate': { $exists: false }
  });
};

module.exports = mongoose.model('DPIAAssessment', dpiaAssessmentSchema);

const mongoose = require('mongoose');

// Lawful Basis for Processing (Article 6)
const legalBasisSchema = new mongoose.Schema({
  // Identification
  basisId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  basisName: String,

  // Processing Activity Reference
  processingActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingActivity',
    required: true,
    index: true
  },
  processingActivityName: String,

  // Lawful Basis Type (Article 6(1))
  basisType: {
    type: String,
    required: true,
    enum: [
      'consent',              // Article 6(1)(a)
      'contract',             // Article 6(1)(b)
      'legal_obligation',     // Article 6(1)(c)
      'vital_interests',      // Article 6(1)(d)
      'public_task',          // Article 6(1)(e)
      'legitimate_interests'  // Article 6(1)(f)
    ],
    index: true
  },

  // Article 6(1)(a) - Consent
  consentDetails: {
    consentRequired: Boolean,
    consentMechanismId: String,
    consentRecordIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsentRecord'
    }],
    withdrawalMechanism: String
  },

  // Article 6(1)(b) - Contract
  contractDetails: {
    contractType: String,
    contractDescription: String,
    contractReference: String,
    necessityJustification: String,
    preContractualSteps: Boolean,
    preContractualDescription: String
  },

  // Article 6(1)(c) - Legal Obligation
  legalObligationDetails: {
    legalReference: String,
    jurisdiction: {
      type: String,
      enum: ['EU', 'member_state', 'international']
    },
    specificLaw: String,
    regulatoryAuthority: String,
    obligationDescription: String
  },

  // Article 6(1)(d) - Vital Interests
  vitalInterestsDetails: {
    justification: String,
    subjectType: {
      type: String,
      enum: ['data_subject', 'another_person']
    },
    circumstances: String,
    noOtherBasisAvailable: Boolean
  },

  // Article 6(1)(e) - Public Task
  publicTaskDetails: {
    publicInterestBasis: String,
    officialAuthorityBasis: String,
    legalBasis: String,
    taskDescription: String,
    publicAuthorityName: String
  },

  // Article 6(1)(f) - Legitimate Interests
  legitimateInterestsDetails: {
    controllerInterests: {
      type: String,
      required: function() { return this.basisType === 'legitimate_interests'; }
    },
    thirdPartyInterests: String,
    balancingTestCompleted: Boolean,
    balancingTestDate: Date,
    balancingTestDocumentUrl: String,
    
    // Legitimate Interest Assessment (LIA)
    lia: {
      purposeTest: {
        purpose: String,
        isLegitimate: Boolean,
        justification: String
      },
      necessityTest: {
        isNecessary: Boolean,
        alternativesConsidered: [String],
        leastIntrusiveApproach: Boolean,
        justification: String
      },
      balancingTest: {
        dataSubjectRights: [String],
        dataSubjectExpectations: String,
        relationshipWithDataSubject: String,
        natureOfData: String,
        processingImpact: String,
        safeguardsImplemented: [String],
        balanceOutcome: String,
        interestsOverride: Boolean
      }
    },
    
    dataSubjectRightsConsidered: Boolean,
    optOutMechanism: {
      provided: Boolean,
      description: String
    }
  },

  // Special Category Data (Article 9)
  specialCategoryProcessing: {
    applies: Boolean,
    derogation: {
      type: String,
      enum: [
        'explicit_consent',                    // Article 9(2)(a)
        'employment_social_security',          // Article 9(2)(b)
        'vital_interests',                     // Article 9(2)(c)
        'nonprofit_body',                      // Article 9(2)(d)
        'made_public',                         // Article 9(2)(e)
        'legal_claims',                        // Article 9(2)(f)
        'substantial_public_interest',         // Article 9(2)(g)
        'health_social_care',                  // Article 9(2)(h)
        'public_health',                       // Article 9(2)(i)
        'archiving_research_statistics'        // Article 9(2)(j)
      ]
    },
    justification: String,
    additionalSafeguards: [String]
  },

  // Criminal Convictions Data (Article 10)
  criminalConvictionsProcessing: {
    applies: Boolean,
    officialAuthorityControl: Boolean,
    memberStateLaw: String,
    appropriateSafeguards: [String]
  },

  // Data Subject Categories Covered
  dataSubjectCategories: [String],

  // Personal Data Categories Covered
  personalDataCategories: [String],

  // Purpose Limitation
  purposes: [{
    purpose: String,
    description: String
  }],

  // Status and Validity
  status: {
    type: String,
    enum: ['active', 'inactive', 'under_review', 'invalid'],
    default: 'active'
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: Date,

  // Review and Assessment
  lastReviewDate: Date,
  nextReviewDate: Date,
  reviewedBy: String,
  
  // Compliance Validation
  complianceChecks: [{
    check: String,
    status: Boolean,
    checkDate: Date,
    checkedBy: String,
    notes: String
  }],

  // DPO Assessment
  dpoReview: {
    reviewed: Boolean,
    reviewDate: Date,
    reviewedBy: String,
    approved: Boolean,
    comments: String
  },

  // Documentation
  supportingDocuments: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    uploadDate: Date
  }],

  // Change History
  changeHistory: [{
    changeDate: Date,
    changedBy: String,
    changeType: String,
    changeDescription: String,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],

  // Dependencies
  linkedConsentRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsentRecord'
  }],
  linkedDPIAs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DPIAAssessment'
  }],

  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  approvedBy: String,
  approvalDate: Date,
  version: {
    type: Number,
    default: 1
  },
  notes: String

}, {
  timestamps: true
});

// Indexes
legalBasisSchema.index({ basisId: 1 });
legalBasisSchema.index({ processingActivityId: 1 });
legalBasisSchema.index({ basisType: 1, status: 1 });
legalBasisSchema.index({ nextReviewDate: 1 });

// Virtuals
legalBasisSchema.virtual('isValid').get(function() {
  if (this.status !== 'active') return false;
  if (!this.validUntil) return true;
  return this.validUntil > new Date();
});

legalBasisSchema.virtual('requiresConsent').get(function() {
  return this.basisType === 'consent' || 
         (this.specialCategoryProcessing.applies && 
          this.specialCategoryProcessing.derogation === 'explicit_consent');
});

// Methods
legalBasisSchema.methods.validateBasis = function() {
  const validation = {
    valid: true,
    issues: []
  };

  // Check type-specific requirements
  switch (this.basisType) {
    case 'consent':
      if (!this.consentDetails.consentMechanismId) {
        validation.valid = false;
        validation.issues.push('Consent mechanism must be specified');
      }
      if (!this.consentDetails.withdrawalMechanism) {
        validation.valid = false;
        validation.issues.push('Withdrawal mechanism must be specified');
      }
      break;

    case 'contract':
      if (!this.contractDetails.necessityJustification) {
        validation.valid = false;
        validation.issues.push('Contract necessity justification required');
      }
      break;

    case 'legal_obligation':
      if (!this.legalObligationDetails.legalReference) {
        validation.valid = false;
        validation.issues.push('Legal reference must be specified');
      }
      break;

    case 'legitimate_interests':
      if (!this.legitimateInterestsDetails.balancingTestCompleted) {
        validation.valid = false;
        validation.issues.push('Balancing test must be completed');
      }
      if (!this.legitimateInterestsDetails.lia.balancingTest.interestsOverride) {
        validation.valid = false;
        validation.issues.push('Balancing test shows interests do not override data subject rights');
      }
      break;
  }

  // Check special category processing
  if (this.specialCategoryProcessing.applies && !this.specialCategoryProcessing.derogation) {
    validation.valid = false;
    validation.issues.push('Special category derogation must be specified');
  }

  return validation;
};

legalBasisSchema.methods.performBalancingTest = function(liaData) {
  // Perform Legitimate Interest Assessment balancing test
  this.legitimateInterestsDetails.lia = {
    purposeTest: liaData.purposeTest,
    necessityTest: liaData.necessityTest,
    balancingTest: liaData.balancingTest
  };
  
  this.legitimateInterestsDetails.balancingTestCompleted = true;
  this.legitimateInterestsDetails.balancingTestDate = new Date();
  
  return this.legitimateInterestsDetails.lia.balancingTest.interestsOverride;
};

legalBasisSchema.methods.needsReview = function() {
  if (!this.nextReviewDate) return false;
  return new Date() >= this.nextReviewDate;
};

// Statics
legalBasisSchema.statics.findByProcessingActivity = function(activityId) {
  return this.find({ processingActivityId: activityId, status: 'active' });
};

legalBasisSchema.statics.findDueForReview = function() {
  return this.find({
    status: 'active',
    nextReviewDate: { $lte: new Date() }
  });
};

legalBasisSchema.statics.findByType = function(basisType) {
  return this.find({ basisType, status: 'active' });
};

legalBasisSchema.statics.findRequiringBalancingTest = function() {
  return this.find({
    basisType: 'legitimate_interests',
    'legitimateInterestsDetails.balancingTestCompleted': false
  });
};

// Pre-save hook
legalBasisSchema.pre('save', function(next) {
  // Validate basis before saving
  const validation = this.validateBasis();
  if (!validation.valid) {
    this.status = 'under_review';
  }
  
  next();
});

module.exports = mongoose.model('LegalBasis', legalBasisSchema);

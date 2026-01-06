const mongoose = require('mongoose');

// International Data Transfers (Chapter V - Articles 44-50)
const dataTransferSchema = new mongoose.Schema({
  // Transfer Identification
  transferId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transferName: String,

  // Processing Activity Reference
  processingActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingActivity',
    index: true
  },
  processingActivityName: String,

  // Transfer Direction
  transferType: {
    type: String,
    required: true,
    enum: ['outbound', 'inbound', 'onward'],
    index: true
  },

  // Origin
  originCountry: {
    type: String,
    required: true
  },
  originOrganization: String,

  // Destination
  destinationCountry: {
    type: String,
    required: true,
    index: true
  },
  destinationOrganization: {
    type: String,
    required: true
  },
  destinationContact: {
    name: String,
    email: String,
    phone: String,
    address: String
  },

  // Recipient Type
  recipientType: {
    type: String,
    required: true,
    enum: ['processor', 'controller', 'joint_controller', 'sub_processor', 'third_party']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Processor'
  },

  // Transfer Mechanism (Chapter V)
  transferMechanism: {
    mechanismType: {
      type: String,
      required: true,
      enum: [
        'adequacy_decision',           // Article 45
        'standard_contractual_clauses', // Article 46(2)(c)
        'binding_corporate_rules',     // Article 47
        'code_of_conduct',             // Article 46(2)(e)
        'certification',               // Article 46(2)(f)
        'derogation',                  // Article 49
        'other_safeguards'
      ],
      index: true
    },

    // Article 45 - Adequacy Decision
    adequacyDecision: {
      hasAdequacyDecision: Boolean,
      decisionReference: String,
      decisionDate: Date,
      validUntil: Date
    },

    // Article 46 - Standard Contractual Clauses (SCCs)
    standardContractualClauses: {
      sccVersion: {
        type: String,
        enum: ['2021_SCCs', '2010_SCCs', 'other']
      },
      sccModule: {
        type: String,
        enum: ['controller_to_controller', 'controller_to_processor', 'processor_to_processor', 'processor_to_controller']
      },
      signedDate: Date,
      documentUrl: String,
      
      // Transfer Impact Assessment (TIA)
      tiaCompleted: Boolean,
      tiaDate: Date,
      tiaDocumentUrl: String,
      supplementaryMeasures: [{
        measure: String,
        description: String,
        implemented: Boolean
      }]
    },

    // Article 47 - Binding Corporate Rules (BCRs)
    bindingCorporateRules: {
      bcrsApproved: Boolean,
      approvalAuthority: String,
      approvalDate: Date,
      approvalReference: String,
      bcrsDocumentUrl: String
    },

    // Article 49 - Derogations
    derogation: {
      derogationType: {
        type: String,
        enum: [
          'explicit_consent',           // Article 49(1)(a)
          'contract_performance',       // Article 49(1)(b)
          'important_public_interest',  // Article 49(1)(d)
          'legal_claims',               // Article 49(1)(e)
          'vital_interests',            // Article 49(1)(f)
          'public_register',            // Article 49(1)(g)
          'compelling_legitimate_interests' // Article 49(1) second subparagraph
        ]
      },
      justification: String,
      occasional: Boolean,
      limitedDataSubjects: Boolean
    }
  },

  // Data Categories
  personalDataCategories: [{
    category: String,
    specificFields: [String],
    isSpecialCategory: Boolean,
    specialCategoryType: String,
    volume: String
  }],

  // Data Subject Categories
  dataSubjectCategories: [String],
  estimatedDataSubjects: Number,

  // Transfer Frequency
  transferFrequency: {
    type: String,
    enum: ['one-time', 'occasional', 'regular', 'continuous'],
    required: true
  },
  frequency Description: String,

  // Transfer Purpose
  transferPurpose: {
    type: String,
    required: true
  },
  purposeDescription: String,

  // Third Country Assessment
  thirdCountryAssessment: {
    assessmentDate: Date,
    assessedBy: String,
    
    legalFramework: {
      dataProtectionLaws: String,
      governmentAccessLaws: String,
      surveillancePractices: String,
      concerns: [String]
    },
    
    recipientProtections: {
      technicalMeasures: [String],
      organizationalMeasures: [String],
      contractualCommitments: [String]
    },
    
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    
    riskMitigationRequired: Boolean,
    mitigationMeasures: [String]
  },

  // Security Measures for Transfer
  securityMeasures: {
    encryptionInTransit: {
      implemented: Boolean,
      algorithm: String
    },
    encryptionAtRest: {
      implemented: Boolean,
      algorithm: String
    },
    pseudonymization: Boolean,
    accessControls: [String],
    otherMeasures: [String]
  },

  // Data Retention at Destination
  dataRetention: {
    retentionPeriod: String,
    retentionJustification: String,
    deletionProcedure: String
  },

  // Sub-transfers
  onwardTransfers: {
    allowed: Boolean,
    conditions: String,
    authorizationRequired: Boolean,
    authorizedTransfers: [{
      destination: String,
      authorization: String,
      date: Date
    }]
  },

  // Data Subject Rights at Destination
  dataSubjectRights: {
    accessRight: Boolean,
    rectificationRight: Boolean,
    erasureRight: Boolean,
    restrictionRight: Boolean,
    portabilityRight: Boolean,
    objectionRight: Boolean,
    exerciseMechanism: String
  },

  // Supervisory Authority
  supervisoryAuthority: {
    competentAuthority: String,
    country: String,
    notificationRequired: Boolean,
    notificationDate: Date,
    approvalRequired: Boolean,
    approvalDate: Date,
    approvalReference: String
  },

  // DPO Review
  dpoReview: {
    reviewed: Boolean,
    reviewDate: Date,
    reviewedBy: String,
    approved: Boolean,
    comments: String
  },

  // Transfer Status
  status: {
    type: String,
    required: true,
    enum: [
      'draft',
      'under_review',
      'approved',
      'active',
      'suspended',
      'terminated'
    ],
    default: 'draft',
    index: true
  },

  // Timeline
  effectiveDate: Date,
  expirationDate: Date,
  lastReviewDate: Date,
  nextReviewDate: Date,

  // Suspension/Termination
  suspension: {
    suspended: Boolean,
    suspensionDate: Date,
    suspensionReason: String,
    resumptionDate: Date
  },

  termination: {
    terminated: Boolean,
    terminationDate: Date,
    terminationReason: String,
    dataReturnedOrDeleted: Boolean,
    dataReturnDate: Date
  },

  // Transparency
  transparency: {
    dataSubjectsInformed: Boolean,
    informationMethod: String,
    informationDate: Date,
    privacyNoticeUrl: String
  },

  // Monitoring
  monitoring: {
    lastAuditDate: Date,
    nextAuditDate: Date,
    complianceIssues: [{
      issue: String,
      identifiedDate: Date,
      resolved: Boolean,
      resolutionDate: Date
    }]
  },

  // Documentation
  documents: [{
    documentType: {
      type: String,
      enum: ['scc', 'tia', 'adequacy_decision', 'bcr', 'data_mapping', 'risk_assessment', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],

  // Related Records
  relatedTransfers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataTransfer'
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
dataTransferSchema.index({ transferId: 1 });
dataTransferSchema.index({ destinationCountry: 1, status: 1 });
dataTransferSchema.index({ 'transferMechanism.mechanismType': 1 });
dataTransferSchema.index({ nextReviewDate: 1 });

// Virtuals
dataTransferSchema.virtual('requiresTIA').get(function() {
  // Transfer Impact Assessment required for SCCs to countries without adequacy
  return (
    this.transferMechanism.mechanismType === 'standard_contractual_clauses' &&
    !this.transferMechanism.adequacyDecision.hasAdequacyDecision
  );
});

dataTransferSchema.virtual('isActive').get(function() {
  if (this.status !== 'active') return false;
  if (this.suspension.suspended) return false;
  if (this.termination.terminated) return false;
  if (this.expirationDate && this.expirationDate < new Date()) return false;
  return true;
});

// Methods
dataTransferSchema.methods.hasAdequacyDecision = function() {
  // Check if destination country has EU adequacy decision
  const adequateCountries = [
    'Andorra', 'Argentina', 'Canada', 'Faroe Islands', 'Guernsey', 
    'Israel', 'Isle of Man', 'Japan', 'Jersey', 'New Zealand', 
    'South Korea', 'Switzerland', 'United Kingdom', 'Uruguay', 'USA'
  ];
  
  return adequateCountries.includes(this.destinationCountry);
};

dataTransferSchema.methods.requiresSCCs = function() {
  return (
    !this.hasAdequacyDecision() &&
    !this.transferMechanism.bindingCorporateRules.bcrsApproved &&
    this.transferMechanism.mechanismType !== 'derogation'
  );
};

dataTransferSchema.methods.validateTransferMechanism = function() {
  const validation = { valid: true, issues: [] };
  
  switch (this.transferMechanism.mechanismType) {
    case 'adequacy_decision':
      if (!this.transferMechanism.adequacyDecision.hasAdequacyDecision) {
        validation.valid = false;
        validation.issues.push('Adequacy decision not confirmed');
      }
      break;
      
    case 'standard_contractual_clauses':
      if (!this.transferMechanism.standardContractualClauses.signedDate) {
        validation.valid = false;
        validation.issues.push('SCCs not signed');
      }
      if (this.requiresTIA && !this.transferMechanism.standardContractualClauses.tiaCompleted) {
        validation.valid = false;
        validation.issues.push('Transfer Impact Assessment required but not completed');
      }
      break;
      
    case 'binding_corporate_rules':
      if (!this.transferMechanism.bindingCorporateRules.bcrsApproved) {
        validation.valid = false;
        validation.issues.push('BCRs not approved');
      }
      break;
      
    case 'derogation':
      if (!this.transferMechanism.derogation.derogationType) {
        validation.valid = false;
        validation.issues.push('Derogation type not specified');
      }
      if (!this.transferMechanism.derogation.occasional) {
        validation.valid = false;
        validation.issues.push('Derogations should only be used for occasional transfers');
      }
      break;
  }
  
  return validation;
};

dataTransferSchema.methods.suspend = function(reason) {
  this.suspension.suspended = true;
  this.suspension.suspensionDate = new Date();
  this.suspension.suspensionReason = reason;
  this.status = 'suspended';
};

dataTransferSchema.methods.terminate = function(reason) {
  this.termination.terminated = true;
  this.termination.terminationDate = new Date();
  this.termination.terminationReason = reason;
  this.status = 'terminated';
};

// Statics
dataTransferSchema.statics.findByDestination = function(country) {
  return this.find({ destinationCountry: country, status: 'active' });
};

dataTransferSchema.statics.findRequiringReview = function() {
  return this.find({
    status: 'active',
    nextReviewDate: { $lte: new Date() }
  });
};

dataTransferSchema.statics.findByMechanism = function(mechanismType) {
  return this.find({
    'transferMechanism.mechanismType': mechanismType,
    status: 'active'
  });
};

dataTransferSchema.statics.findHighRisk = function() {
  return this.find({
    'thirdCountryAssessment.riskLevel': { $in: ['high', 'critical'] },
    status: 'active'
  });
};

module.exports = mongoose.model('DataTransfer', dataTransferSchema);

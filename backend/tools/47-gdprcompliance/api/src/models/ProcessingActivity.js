const mongoose = require('mongoose');

// Article 30 - Records of Processing Activities
const processingActivitySchema = new mongoose.Schema(
  {
    // Activity Identification
    activityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    activityName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Controller Information (Article 30(1)(a))
    controller: {
      name: {
        type: String,
        required: true,
      },
      contactPerson: String,
      address: {
        street: String,
        city: String,
        postalCode: String,
        country: String,
      },
      email: String,
      phone: String,
    },

    // Joint Controllers (if applicable)
    jointControllers: [
      {
        name: String,
        contactDetails: String,
        arrangementReference: String,
      },
    ],

    // DPO Contact (Article 30(1)(a))
    dpoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DPO',
    },

    // Purposes of Processing (Article 30(1)(b))
    purposes: [
      {
        purpose: {
          type: String,
          required: true,
        },
        description: String,
        lawfulBasis: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LegalBasis',
          required: true,
        },
      },
    ],

    // Categories of Data Subjects (Article 30(1)(c))
    dataSubjectCategories: [
      {
        type: String,
        enum: [
          'customers',
          'employees',
          'job_applicants',
          'suppliers',
          'business_contacts',
          'website_visitors',
          'subscribers',
          'minors',
          'vulnerable_groups',
          'other',
        ],
      },
    ],

    // Categories of Personal Data (Article 30(1)(c))
    personalDataCategories: [
      {
        category: {
          type: String,
          required: true,
          enum: [
            'identification_data',
            'contact_details',
            'demographic_data',
            'financial_data',
            'employment_data',
            'education_data',
            'location_data',
            'online_identifiers',
            'communication_data',
            'behavioral_data',
            'technical_data',
            'special_category_data',
            'criminal_convictions_data',
          ],
        },
        specificDataFields: [String],
        isSpecialCategory: {
          type: Boolean,
          default: false,
        },
        specialCategoryType: {
          type: String,
          enum: [
            'health',
            'biometric',
            'genetic',
            'racial_ethnic',
            'political',
            'religious',
            'trade_union',
            'sex_life',
          ],
        },
      },
    ],

    // Categories of Recipients (Article 30(1)(d))
    recipientCategories: [
      {
        category: {
          type: String,
          enum: [
            'internal_departments',
            'group_companies',
            'processors',
            'third_party_services',
            'public_authorities',
            'professional_advisors',
            'other',
          ],
        },
        specificRecipients: [String],
        purposeOfDisclosure: String,
      },
    ],

    // International Data Transfers (Article 30(1)(e))
    dataTransfers: [
      {
        transferId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DataTransfer',
        },
        destinationCountry: String,
        transferMechanism: String,
        adequacyDecision: Boolean,
      },
    ],

    // Time Limits for Erasure (Article 30(1)(f))
    retentionSchedule: {
      retentionScheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RetentionSchedule',
      },
      retentionPeriod: String,
      retentionRationale: String,
      deletionMethod: String,
    },

    // Security Measures (Article 30(1)(g))
    securityMeasures: {
      technical: [
        {
          measure: String,
          description: String,
          implemented: Boolean,
        },
      ],
      organizational: [
        {
          measure: String,
          description: String,
          implemented: Boolean,
        },
      ],
      encryption: {
        inTransit: Boolean,
        atRest: Boolean,
        algorithm: String,
      },
      accessControls: {
        implemented: Boolean,
        description: String,
      },
      backupProcedures: {
        implemented: Boolean,
        frequency: String,
      },
      incidentcommandPlan: {
        implemented: Boolean,
        lastReviewed: Date,
      },
    },

    // DPIA Requirement Assessment
    dpiaRequired: {
      required: Boolean,
      reason: String,
      dpiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DPIAAssessment',
      },
      completionDate: Date,
    },

    // Data Source
    dataSource: [
      {
        source: {
          type: String,
          enum: ['data_subject', 'third_party', 'public_sources', 'generated', 'other'],
        },
        description: String,
      },
    ],

    // Processors (Article 28)
    processors: [
      {
        processorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Processor',
        },
        processorName: String,
        services: String,
        agreementReference: String,
      },
    ],

    // Automated Decision Making
    automatedDecisionMaking: {
      isUsed: Boolean,
      logic: String,
      significance: String,
      safeguards: [String],
    },

    // Activity Status
    status: {
      type: String,
      enum: ['active', 'suspended', 'discontinued', 'under_review'],
      default: 'active',
    },

    // Review and Compliance
    lastReviewDate: Date,
    nextReviewDate: Date,
    reviewFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'biannually', 'annually'],
    },
    complianceStatus: {
      type: String,
      enum: ['compliant', 'needs_improvement', 'non_compliant', 'under_review'],
      default: 'under_review',
    },
    complianceNotes: String,

    // Documentation References
    relatedDocuments: [
      {
        documentType: String,
        documentName: String,
        documentUrl: String,
        uploadDate: Date,
      },
    ],

    // Metadata
    createdBy: String,
    lastModifiedBy: String,
    approvedBy: String,
    approvalDate: Date,
    version: {
      type: Number,
      default: 1,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
processingActivitySchema.index({ activityId: 1 });
processingActivitySchema.index({ status: 1 });
processingActivitySchema.index({ 'controller.name': 1 });
processingActivitySchema.index({ nextReviewDate: 1 });

// Methods
processingActivitySchema.methods.requiresDPIA = function () {
  // Check if DPIA is required based on GDPR Article 35 criteria
  const hasSpecialCategory = this.personalDataCategories.some((cat) => cat.isSpecialCategory);
  const hasAutomatedDecisionMaking = this.automatedDecisionMaking.isUsed;
  const hasSystematicMonitoring = this.purposes.some(
    (p) => p.purpose.includes('monitoring') || p.purpose.includes('tracking')
  );

  return hasSpecialCategory || hasAutomatedDecisionMaking || hasSystematicMonitoring;
};

processingActivitySchema.methods.isCompleteRecord = function () {
  return !!(
    this.controller.name &&
    this.purposes.length > 0 &&
    this.dataSubjectCategories.length > 0 &&
    this.personalDataCategories.length > 0 &&
    this.securityMeasures.technical.length > 0
  );
};

// Statics
processingActivitySchema.statics.findDueForReview = function () {
  return this.find({
    status: 'active',
    nextReviewDate: { $lte: new Date() },
  });
};

module.exports = mongoose.model('ProcessingActivity', processingActivitySchema);

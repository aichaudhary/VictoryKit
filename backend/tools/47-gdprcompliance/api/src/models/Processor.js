const mongoose = require('mongoose');

// Processor Management (Article 28)
const processorSchema = new mongoose.Schema(
  {
    // Processor Identification
    processorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    processorName: {
      type: String,
      required: true,
      index: true,
    },
    legalEntity: String,

    // Contact Information
    contactDetails: {
      primaryContact: {
        name: String,
        title: String,
        email: String,
        phone: String,
      },
      dpo: {
        name: String,
        email: String,
        phone: String,
      },
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: {
          type: String,
          required: true,
        },
      },
      website: String,
    },

    // Processor Type
    processorType: {
      type: String,
      required: true,
      enum: [
        'cloud_provider',
        'saas_provider',
        'it_services',
        'payment_processor',
        'marketing_services',
        'analytics_provider',
        'crm_provider',
        'payroll_services',
        'logistics',
        'customer_support',
        'other',
      ],
    },

    // Services Provided
    servicesProvided: {
      description: {
        type: String,
        required: true,
      },
      serviceCategories: [String],
      specificServices: [String],
    },

    // Processing Activities
    processingActivities: [
      {
        activityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProcessingActivity',
        },
        activityName: String,
        processingPurpose: String,
        dataCategories: [String],
        dataSubjectCategories: [String],
      },
    ],

    // Article 28 Agreement
    processingAgreement: {
      agreementType: {
        type: String,
        enum: ['dpa', 'contract_with_dpa_clauses', 'msa_with_dpa', 'other'],
        required: true,
      },
      agreementReference: String,
      signedDate: Date,
      effectiveDate: Date,
      expirationDate: Date,
      autoRenewal: Boolean,
      documentUrl: String,

      // Article 28(3) Required Clauses
      requiredClauses: {
        processingInstructions: {
          included: Boolean,
          description: String,
        },
        confidentialityObligation: {
          included: Boolean,
          description: String,
        },
        securityMeasures: {
          included: Boolean,
          description: String,
        },
        subProcessorAuthorization: {
          included: Boolean,
          type: {
            type: String,
            enum: ['specific', 'general'],
          },
          notificationRequired: Boolean,
        },
        dataSubjectRights: {
          included: Boolean,
          assistanceCommitment: String,
        },
        deletionOrReturn: {
          included: Boolean,
          procedure: String,
        },
        auditRights: {
          included: Boolean,
          auditFrequency: String,
          lastAuditDate: Date,
          nextAuditDate: Date,
        },
        breachNotification: {
          included: Boolean,
          notificationDeadline: String,
        },
      },
    },

    // Sub-Processors (Article 28(2) and 28(4))
    subProcessors: {
      used: Boolean,
      authorizationType: {
        type: String,
        enum: ['specific_authorization', 'general_authorization'],
      },
      list: [
        {
          subProcessorName: String,
          services: String,
          location: String,
          authorizedDate: Date,
          notificationDate: Date,
          objectionPeriod: String,
          status: {
            type: String,
            enum: ['authorized', 'pending', 'objected', 'removed'],
          },
        },
      ],
    },

    // International Data Transfers
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

    // Security Measures (Article 32)
    securityMeasures: {
      technicalMeasures: [
        {
          measure: String,
          description: String,
          implemented: Boolean,
          evidenceUrl: String,
        },
      ],
      organizationalMeasures: [
        {
          measure: String,
          description: String,
          implemented: Boolean,
          evidenceUrl: String,
        },
      ],

      certifications: [
        {
          certificationType: {
            type: String,
            enum: ['ISO27001', 'ISO27701', 'SOC2', 'TISAX', 'other'],
          },
          certificateNumber: String,
          issueDate: Date,
          expiryDate: Date,
          certificateUrl: String,
        },
      ],

      encryptionInTransit: Boolean,
      encryptionAtRest: Boolean,
      accessControls: Boolean,
      incidentcommand: Boolean,
      businessContinuity: Boolean,
      dataBackup: Boolean,

      lastSecurityAssessment: Date,
      nextSecurityAssessment: Date,
    },

    // Data Protection Officer
    processorDPO: {
      hasDPO: Boolean,
      dpoName: String,
      dpoEmail: String,
      dpoPhone: String,
      dpoAddress: String,
    },

    // Instructions to Processor
    processingInstructions: [
      {
        instructionDate: Date,
        instructionType: {
          type: String,
          enum: ['general', 'specific', 'data_deletion', 'data_return', 'security_update', 'other'],
        },
        instructionDescription: String,
        issuedBy: String,
        acknowledgedBy: String,
        acknowledgedDate: Date,
        implementedDate: Date,
        status: {
          type: String,
          enum: ['pending', 'acknowledged', 'implemented', 'rejected'],
        },
      },
    ],

    // Data Subject Rights Assistance
    dataSubjectRightsSupport: {
      accessRequests: {
        supported: Boolean,
        mechanism: String,
        responseTime: String,
      },
      rectification: {
        supported: Boolean,
        mechanism: String,
      },
      erasure: {
        supported: Boolean,
        mechanism: String,
      },
      portability: {
        supported: Boolean,
        format: [String],
      },
    },

    // Audit and Inspection Rights
    auditRights: {
      auditAllowed: Boolean,
      auditFrequency: String,
      noticeRequired: String,
      audits: [
        {
          auditDate: Date,
          auditType: {
            type: String,
            enum: ['on-site', 'remote', 'document_review', 'certification_review'],
          },
          auditor: String,
          findings: String,
          issues: [
            {
              issue: String,
              severity: String,
              remediation: String,
              resolved: Boolean,
              resolutionDate: Date,
            },
          ],
          auditReportUrl: String,
        },
      ],
    },

    // Breach Notification
    breachNotification: {
      obligationExists: Boolean,
      notificationDeadline: String,
      contactProcedure: String,
      breachHistory: [
        {
          breachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DataBreach',
          },
          notificationDate: Date,
          breachDescription: String,
          affectedDataSubjects: Number,
        },
      ],
    },

    // Data Deletion/Return
    dataHandling: {
      deletionSupported: Boolean,
      deletionMethod: String,
      deletionCertification: Boolean,
      returnSupported: Boolean,
      returnFormat: [String],
      retentionAfterTermination: String,

      dataHandlingRequests: [
        {
          requestDate: Date,
          requestType: {
            type: String,
            enum: ['deletion', 'return', 'both'],
          },
          completionDate: Date,
          certificateUrl: String,
          status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
          },
        },
      ],
    },

    // Risk Assessment
    riskAssessment: {
      lastAssessmentDate: Date,
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
      },
      riskFactors: [
        {
          factor: String,
          impact: String,
          mitigation: String,
        },
      ],
      nextAssessmentDate: Date,
    },

    // Compliance Status
    complianceStatus: {
      status: {
        type: String,
        enum: ['compliant', 'needs_improvement', 'non_compliant', 'under_review'],
        default: 'under_review',
      },
      lastReviewDate: Date,
      nextReviewDate: Date,
      reviewedBy: String,
      complianceIssues: [
        {
          issue: String,
          identifiedDate: Date,
          severity: String,
          remediation: String,
          resolved: Boolean,
          resolutionDate: Date,
        },
      ],
    },

    // Processor Status
    status: {
      type: String,
      required: true,
      enum: ['under_evaluation', 'approved', 'active', 'suspended', 'terminated', 'blacklisted'],
      default: 'under_evaluation',
      index: true,
    },

    // Relationship Timeline
    relationshipStart: Date,
    relationshipEnd: Date,

    // Termination
    termination: {
      terminated: Boolean,
      terminationDate: Date,
      terminationReason: String,
      dataDeleted: Boolean,
      dataReturned: Boolean,
      completionDate: Date,
    },

    // Insurance
    insurance: {
      hasCyberInsurance: Boolean,
      insurer: String,
      coverageAmount: Number,
      currency: String,
      policyNumber: String,
      expiryDate: Date,
    },

    // Performance Metrics
    performanceMetrics: {
      dataBreaches: Number,
      securityIncidents: Number,
      dsarResponseTime: Number,
      uptimePercentage: Number,
      complianceScore: Number,
    },

    // Documentation
    documents: [
      {
        documentType: {
          type: String,
          enum: ['dpa', 'certificate', 'audit_report', 'security_policy', 'sla', 'other'],
        },
        fileName: String,
        fileUrl: String,
        uploadDate: Date,
        expiryDate: Date,
      },
    ],

    // Metadata
    createdBy: String,
    lastModifiedBy: String,
    approvedBy: String,
    approvalDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
processorSchema.index({ processorId: 1 });
processorSchema.index({ processorName: 1, status: 1 });
processorSchema.index({ 'contactDetails.address.country': 1 });
processorSchema.index({ 'complianceStatus.nextReviewDate': 1 });

// Virtuals
processorSchema.virtual('isActive').get(function () {
  return this.status === 'active' || this.status === 'approved';
});

processorSchema.virtual('agreementExpiringSoon').get(function () {
  if (!this.processingAgreement.expirationDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.processingAgreement.expirationDate <= thirtyDaysFromNow;
});

// Methods
processorSchema.methods.validateArticle28Compliance = function () {
  const validation = { compliant: true, issues: [] };
  const clauses = this.processingAgreement.requiredClauses;

  if (!clauses.processingInstructions.included) {
    validation.compliant = false;
    validation.issues.push('Processing instructions clause missing');
  }
  if (!clauses.confidentialityObligation.included) {
    validation.compliant = false;
    validation.issues.push('Confidentiality obligation clause missing');
  }
  if (!clauses.securityMeasures.included) {
    validation.compliant = false;
    validation.issues.push('Security measures clause missing');
  }
  if (!clauses.deletionOrReturn.included) {
    validation.compliant = false;
    validation.issues.push('Data deletion/return clause missing');
  }
  if (!clauses.auditRights.included) {
    validation.compliant = false;
    validation.issues.push('Audit rights clause missing');
  }

  return validation;
};

processorSchema.methods.addSubProcessor = function (subProcessorData) {
  this.subProcessors.list.push({
    ...subProcessorData,
    status: 'pending',
    notificationDate: new Date(),
  });
};

processorSchema.methods.issueInstruction = function (instruction) {
  this.processingInstructions.push({
    instructionDate: new Date(),
    instructionType: instruction.type,
    instructionDescription: instruction.description,
    issuedBy: instruction.issuedBy,
    status: 'pending',
  });
};

processorSchema.methods.recordBreach = function (breachData) {
  this.breachNotification.breachHistory.push({
    breachId: breachData.breachId,
    notificationDate: new Date(),
    breachDescription: breachData.description,
    affectedDataSubjects: breachData.affectedCount,
  });
  this.performanceMetrics.dataBreaches += 1;
};

// Statics
processorSchema.statics.findActive = function () {
  return this.find({ status: { $in: ['active', 'approved'] } });
};

processorSchema.statics.findRequiringReview = function () {
  return this.find({
    status: 'active',
    'complianceStatus.nextReviewDate': { $lte: new Date() },
  });
};

processorSchema.statics.findByCountry = function (country) {
  return this.find({
    'contactDetails.address.country': country,
    status: 'active',
  });
};

processorSchema.statics.findExpiringAgreements = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'active',
    'processingAgreement.expirationDate': {
      $gte: new Date(),
      $lte: futureDate,
    },
  });
};

processorSchema.statics.findNonCompliant = function () {
  return this.find({
    status: 'active',
    'complianceStatus.status': 'non_compliant',
  });
};

module.exports = mongoose.model('Processor', processorSchema);

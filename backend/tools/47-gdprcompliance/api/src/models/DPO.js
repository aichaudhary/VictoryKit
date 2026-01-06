const mongoose = require('mongoose');

// Data Protection Officer (Articles 37-39)
const dpoSchema = new mongoose.Schema({
  // DPO Identification
  dpoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Personal Information
  personalDetails: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    fullName: String,
    title: String,
    professionalDesignation: [String]  // CIPP/E, CIPM, FIP, etc.
  },

  // Contact Information (Article 37(7) - must be published)
  contactDetails: {
    email: {
      type: String,
      required: true,
      index: true
    },
    phone: String,
    alternativePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    officeLocation: String,
    publicContactPage: String  // URL where contact details are published
  },

  // Employment Type
  employmentType: {
    type: String,
    required: true,
    enum: ['internal', 'external', 'shared_service'],
    index: true
  },

  // Organization Information
  organization: {
    organizationName: {
      type: String,
      required: true
    },
    organizationType: {
      type: String,
      enum: ['private_company', 'public_authority', 'ngo', 'healthcare', 'education', 'other']
    },
    department: String,
    reportingTo: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date
  },

  // External DPO Details (if external)
  externalDPO: {
    serviceProvider: String,
    contractReference: String,
    contractStartDate: Date,
    contractEndDate: Date,
    servicesIncluded: [String],
    otherClientsCount: Number
  },

  // Professional Background (Article 37(5) - expert knowledge)
  professionalQualifications: {
    expertKnowledge: {
      dataProtectionLaw: {
        type: Number,
        min: 1,
        max: 5  // 1-5 rating
      },
      dataProtectionPractices: {
        type: Number,
        min: 1,
        max: 5
      },
      businessSectorKnowledge: {
        type: Number,
        min: 1,
        max: 5
      },
      organizationStructureKnowledge: {
        type: Number,
        min: 1,
        max: 5
      }
    },

    certifications: [{
      certificationType: {
        type: String,
        enum: ['CIPP_E', 'CIPP_US', 'CIPM', 'CIPT', 'FIP', 'CDPO', 'GDPR_Practitioner', 'ISO27001_Lead', 'other']
      },
      issuingBody: String,
      certificateNumber: String,
      issueDate: Date,
      expiryDate: Date,
      certificateUrl: String
    }],

    education: [{
      degree: String,
      institution: String,
      field: String,
      graduationYear: Number
    }],

    experience: [{
      position: String,
      organization: String,
      startDate: Date,
      endDate: Date,
      responsibilities: String
    }],

    training: [{
      trainingName: String,
      provider: String,
      completionDate: Date,
      certificateUrl: String
    }]
  },

  // Tasks and Responsibilities (Article 39)
  responsibilities: {
    // Article 39(1)(a) - Inform and advise
    informAndAdvise: {
      assigned: Boolean,
      description: String,
      activities: [{
        activity: String,
        frequency: String,
        lastPerformed: Date
      }]
    },

    // Article 39(1)(b) - Monitor compliance
    monitorCompliance: {
      assigned: Boolean,
      description: String,
      monitoringAreas: [String],
      lastAuditDate: Date,
      nextAuditDate: Date
    },

    // Article 39(1)(c) - Advice on DPIAs
    dpiaAdvice: {
      assigned: Boolean,
      dpiasReviewed: Number,
      dpiasInProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DPIAAssessment'
      }]
    },

    // Article 39(1)(d) - Cooperate with supervisory authority
    supervisoryCooperation: {
      assigned: Boolean,
      primaryAuthority: String,
      lastInteractionDate: Date,
      interactions: [{
        date: Date,
        authority: String,
        subject: String,
        outcome: String
      }]
    },

    // Article 39(1)(e) - Act as contact point
    contactPoint: {
      assigned: Boolean,
      dataSubjectInquiries: Number,
      authorityInquiries: Number,
      averageResponseTime: String
    }
  },

  // Independence (Article 38(3))
  independence: {
    reportsDirectlyToManagement: Boolean,
    reportingLine: String,
    noConflictOfInterest: Boolean,
    canPerformOtherTasks: Boolean,
    otherTasks: [String],
    conflictCheckDate: Date,
    conflictCheckBy: String
  },

  // Resources (Article 38(2))
  resources: {
    hasAdequateResources: Boolean,
    team: [{
      memberName: String,
      role: String,
      expertise: String
    }],
    budget: {
      annualBudget: Number,
      currency: String,
      year: Number
    },
    tools: [String],
    trainingBudget: Number
  },

  // Designation Requirements (Article 37)
  designationRequirements: {
    isRequired: Boolean,
    requirementReason: {
      type: String,
      enum: [
        'public_authority',                          // Article 37(1)(a)
        'core_activities_monitoring',                // Article 37(1)(b)
        'core_activities_special_category_criminal', // Article 37(1)(c)
        'voluntary'
      ]
    },
    designationDate: Date,
    notifiedToAuthority: Boolean,
    notificationDate: Date,
    authorityReference: String
  },

  // Supervision Authority Registration
  authorityRegistration: {
    registered: Boolean,
    competentAuthority: String,
    registrationNumber: String,
    registrationDate: Date,
    publicationUrl: String
  },

  // Activities Log
  activities: [{
    activityType: {
      type: String,
      enum: [
        'training_delivered',
        'advice_provided',
        'dpia_reviewed',
        'audit_conducted',
        'policy_reviewed',
        'breach_advised',
        'dsar_advised',
        'authority_communication',
        'data_subject_communication',
        'compliance_report',
        'other'
      ]
    },
    activityDate: Date,
    description: String,
    participants: [String],
    outcome: String,
    documentUrl: String
  }],

  // Advice and Opinions
  adviceProvided: [{
    adviceDate: Date,
    subject: String,
    requestedBy: String,
    advice: String,
    followed: Boolean,
    documentUrl: String
  }],

  // Training Programs
  trainingPrograms: [{
    programName: String,
    targetAudience: String,
    lastDeliveryDate: Date,
    nextDeliveryDate: Date,
    attendeesCount: Number,
    materials: String
  }],

  // Compliance Monitoring
  complianceMonitoring: {
    monitoringPlan: String,
    lastComplianceReview: Date,
    nextComplianceReview: Date,
    complianceScore: Number,
    
    audits: [{
      auditDate: Date,
      auditScope: String,
      findings: [{
        finding: String,
        severity: String,
        recommendation: String,
        status: String
      }],
      auditReportUrl: String
    }]
  },

  // Data Subject Inquiries
  dataSubjectInquiries: [{
    inquiryDate: Date,
    inquiryType: String,
    dataSubjectName: String,
    dataSubjectEmail: String,
    inquiry: String,
    response: String,
    responseDate: Date,
    resolved: Boolean
  }],

  // Breach Involvement
  breachInvolvement: [{
    breachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataBreach'
    },
    involvementDate: Date,
    role: String,
    adviceProvided: String
  }],

  // DSAR Involvement
  dsarInvolvement: [{
    dsarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DSAR'
    },
    involvementDate: Date,
    adviceProvided: String
  }],

  // Performance Metrics
  performanceMetrics: {
    trainingSessionsDelivered: Number,
    policiesReviewed: Number,
    dpiasReviewed: Number,
    breachesHandled: Number,
    dsarsAdvised: Number,
    averageResponseTime: Number,  // hours
    complianceImprovementScore: Number
  },

  // Status
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'suspended', 'terminated'],
    default: 'active',
    index: true
  },

  // Termination
  termination: {
    terminated: Boolean,
    terminationDate: Date,
    terminationReason: String,
    notifiedAuthority: Boolean,
    successorDPO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DPO'
    }
  },

  // Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['designation_letter', 'cv', 'certificate', 'contract', 'report', 'advice', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],

  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  notes: String

}, {
  timestamps: true
});

// Indexes
dpoSchema.index({ dpoId: 1 });
dpoSchema.index({ 'contactDetails.email': 1 });
dpoSchema.index({ employmentType: 1, status: 1 });
dpoSchema.index({ 'organization.organizationName': 1 });

// Virtuals
dpoSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

dpoSchema.virtual('yearsOfService').get(function() {
  const endDate = this.organization.endDate || new Date();
  const startDate = this.organization.startDate;
  return (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
});

dpoSchema.virtual('fullContactInfo').get(function() {
  return {
    name: this.personalDetails.fullName,
    email: this.contactDetails.email,
    phone: this.contactDetails.phone
  };
});

// Methods
dpoSchema.methods.assessExpertise = function() {
  const expertise = this.professionalQualifications.expertKnowledge;
  const avgScore = (
    expertise.dataProtectionLaw +
    expertise.dataProtectionPractices +
    expertise.businessSectorKnowledge +
    expertise.organizationStructureKnowledge
  ) / 4;
  
  if (avgScore >= 4) return 'Expert';
  if (avgScore >= 3) return 'Proficient';
  if (avgScore >= 2) return 'Intermediate';
  return 'Developing';
};

dpoSchema.methods.logActivity = function(activityType, description, outcome) {
  this.activities.push({
    activityType,
    activityDate: new Date(),
    description,
    outcome
  });
  
  // Update performance metrics
  switch (activityType) {
    case 'training_delivered':
      this.performanceMetrics.trainingSessionsDelivered += 1;
      break;
    case 'dpia_reviewed':
      this.performanceMetrics.dpiasReviewed += 1;
      break;
    case 'breach_advised':
      this.performanceMetrics.breachesHandled += 1;
      break;
    case 'dsar_advised':
      this.performanceMetrics.dsarsAdvised += 1;
      break;
  }
};

dpoSchema.methods.provideAdvice = function(subject, requestedBy, advice) {
  this.adviceProvided.push({
    adviceDate: new Date(),
    subject,
    requestedBy,
    advice,
    followed: false
  });
};

dpoSchema.methods.recordInquiry = function(inquiryData) {
  this.dataSubjectInquiries.push({
    inquiryDate: new Date(),
    ...inquiryData,
    resolved: false
  });
  this.responsibilities.contactPoint.dataSubjectInquiries += 1;
};

dpoSchema.methods.checkConflictOfInterest = function() {
  // Check if other tasks conflict with DPO duties
  const conflictingRoles = [
    'CEO', 'CFO', 'CTO', 'IT Manager', 'HR Manager', 
    'Marketing Manager', 'Head of Operations'
  ];
  
  const hasConflict = this.independence.otherTasks.some(task => 
    conflictingRoles.some(role => task.toLowerCase().includes(role.toLowerCase()))
  );
  
  this.independence.noConflictOfInterest = !hasConflict;
  this.independence.conflictCheckDate = new Date();
  
  return !hasConflict;
};

// Statics
dpoSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

dpoSchema.statics.findByOrganization = function(orgName) {
  return this.find({
    'organization.organizationName': orgName,
    status: 'active'
  });
};

dpoSchema.statics.findExternal = function() {
  return this.find({
    employmentType: 'external',
    status: 'active'
  });
};

dpoSchema.statics.findRequiringTraining = function() {
  // Find DPOs whose certifications are expiring soon
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  return this.find({
    status: 'active',
    'professionalQualifications.certifications.expiryDate': {
      $lte: sixMonthsFromNow,
      $gte: new Date()
    }
  });
};

// Pre-save hook
dpoSchema.pre('save', function(next) {
  // Set full name
  if (this.personalDetails.firstName && this.personalDetails.lastName) {
    this.personalDetails.fullName = 
      `${this.personalDetails.firstName} ${this.personalDetails.lastName}`;
  }
  
  next();
});

module.exports = mongoose.model('DPO', dpoSchema);

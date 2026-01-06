const mongoose = require('mongoose');

// Data Breach Management (Articles 33-34)
const dataBreachSchema = new mongoose.Schema({
  // Breach Identification
  breachId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  breachReference: String,

  // Discovery Information
  discoveryDate: {
    type: Date,
    required: true,
    index: true
  },
  discoveredBy: {
    name: String,
    role: String,
    department: String
  },
  discoveryMethod: {
    type: String,
    enum: [
      'internal_audit',
      'security_monitoring',
      'employee_report',
      'customer_complaint',
      'third_party_notification',
      'penetration_test',
      'incident_response',
      'regulatory_inspection',
      'other'
    ]
  },

  // Breach Classification
  breachType: {
    type: String,
    required: true,
    enum: [
      'confidentiality_breach',      // Unauthorized disclosure
      'availability_breach',         // Data loss or destruction
      'integrity_breach',           // Unauthorized alteration
      'combined_breach'             // Multiple types
    ]
  },

  breachCategory: {
    type: String,
    enum: [
      'cyber_attack',
      'hacking',
      'malware_ransomware',
      'phishing',
      'social_engineering',
      'insider_threat',
      'human_error',
      'lost_stolen_device',
      'unauthorized_access',
      'system_failure',
      'third_party_breach',
      'physical_breach',
      'other'
    ]
  },

  // Severity Assessment
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    index: true
  },

  riskLevel: {
    type: String,
    enum: ['high_risk', 'medium_risk', 'low_risk', 'unlikely_risk'],
    required: true
  },

  // Affected Data
  affectedDataCategories: [{
    category: {
      type: String,
      enum: [
        'identification_data',
        'contact_details',
        'financial_data',
        'credentials',
        'health_data',
        'biometric_data',
        'location_data',
        'communication_data',
        'behavioral_data',
        'special_category_data',
        'criminal_convictions',
        'other'
      ]
    },
    specificFields: [String],
    isSpecialCategory: Boolean
  }],

  // Affected Data Subjects
  dataSubjectsAffected: {
    estimatedNumber: {
      type: Number,
      required: true
    },
    identifiedDataSubjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataSubject'
    }],
    categories: [{
      type: String,
      enum: ['customers', 'employees', 'minors', 'vulnerable_groups', 'suppliers', 'other']
    }],
    includesMinors: Boolean,
    includesVulnerableGroups: Boolean
  },

  // Breach Description
  description: {
    type: String,
    required: true
  },
  circumstances: String,
  rootCause: String,

  // Impact Assessment
  likelyConsequences: {
    identityTheft: Boolean,
    financialLoss: Boolean,
    reputationalDamage: Boolean,
    discriminationRisk: Boolean,
    physicalHarm: Boolean,
    psychologicalDistress: Boolean,
    lossOfControl: Boolean,
    limitationOfRights: Boolean,
    other: String
  },

  potentialImpact: {
    type: String,
    enum: ['no_impact', 'minimal', 'moderate', 'significant', 'severe']
  },

  // Supervisory Authority Notification (Article 33 - 72 hours)
  supervisoryNotification: {
    required: {
      type: Boolean,
      required: true
    },
    notificationDeadline: Date,  // 72 hours from discovery
    notified: Boolean,
    notificationDate: Date,
    authority: {
      name: String,
      country: String,
      referenceNumber: String
    },
    notificationMethod: {
      type: String,
      enum: ['online_portal', 'email', 'phone', 'written_form', 'in_person']
    },
    phaseNotification: {
      type: String,
      enum: ['single', 'phased'],
      default: 'single'
    },
    followUpNotifications: [{
      date: Date,
      content: String,
      additionalInformation: String
    }]
  },

  // Data Subject Notification (Article 34)
  dataSubjectNotification: {
    required: {
      type: Boolean,
      required: true
    },
    exemptionReason: {
      type: String,
      enum: [
        'appropriate_technical_measures',  // e.g., encryption
        'subsequent_measures_taken',       // measures that ensure risk no longer likely
        'disproportionate_effort',        // public communication instead
        'not_applicable'
      ]
    },
    notified: Boolean,
    notificationDate: Date,
    notificationMethod: {
      type: String,
      enum: ['email', 'letter', 'phone', 'sms', 'public_announcement', 'website_notice']
    },
    notificationContent: String,
    notificationLanguages: [String],
    recipientsCount: Number
  },

  // 72-Hour Timeline Tracking
  timeline: {
    discoveryTime: Date,
    reportedToManagementTime: Date,
    dpoNotifiedTime: Date,
    investigationStartTime: Date,
    containmentTime: Date,
    supervisoryAuthorityNotificationTime: Date,
    dataSubjectNotificationTime: Date,
    resolutionTime: Date
  },

  // Compliance with 72-Hour Rule
  complianceTracking: {
    hours72Deadline: Date,
    notificationWithin72Hours: Boolean,
    hoursToNotification: Number,
    delayReason: String
  },

  // Containment and Mitigation
  containmentMeasures: [{
    measure: String,
    implementedAt: Date,
    implementedBy: String,
    effectiveness: String
  }],

  mitigationMeasures: [{
    measure: String,
    implementedAt: Date,
    implementedBy: String,
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'failed']
    }
  }],

  // Investigation
  investigation: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'ongoing'],
      default: 'not_started'
    },
    leadInvestigator: String,
    investigationTeam: [String],
    findings: String,
    evidenceCollected: [{
      type: String,
      description: String,
      location: String,
      collectedAt: Date
    }],
    forensicsRequired: Boolean,
    externalExpertsEngaged: Boolean
  },

  // Resolution
  status: {
    type: String,
    required: true,
    enum: [
      'discovered',
      'under_investigation',
      'contained',
      'notification_pending',
      'authorities_notified',
      'data_subjects_notified',
      'mitigation_in_progress',
      'resolved',
      'closed'
    ],
    default: 'discovered',
    index: true
  },

  resolutionDate: Date,
  resolutionSummary: String,

  // Lessons Learned
  lessonsLearned: String,
  preventiveMeasures: [{
    measure: String,
    implemented: Boolean,
    implementationDate: Date,
    responsible: String
  }],

  // DPO Involvement
  dpoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DPO'
  },
  dpoConsulted: Boolean,
  dpoAdvice: String,

  // Third-Party Involvement
  thirdPartiesInvolved: [{
    name: String,
    role: {
      type: String,
      enum: ['processor', 'sub_processor', 'vendor', 'cloud_provider', 'other']
    },
    notified: Boolean,
    notificationDate: Date,
    responsibilityLevel: String
  }],

  // Legal and Regulatory
  legalReview: {
    required: Boolean,
    completed: Boolean,
    reviewedBy: String,
    reviewDate: Date,
    findings: String
  },

  insuranceClaim: {
    filed: Boolean,
    claimNumber: String,
    insurer: String,
    filedDate: Date,
    status: String
  },

  // Financial Impact
  costs: {
    investigationCosts: Number,
    notificationCosts: Number,
    remedialMeasuresCosts: Number,
    legalCosts: Number,
    regulatoryFines: Number,
    compensationPaid: Number,
    totalCost: Number,
    currency: String
  },

  // Documentation
  documents: [{
    documentType: {
      type: String,
      enum: ['incident_report', 'notification_letter', 'investigation_report', 'evidence', 'correspondence', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: Date,
    uploadedBy: String
  }],

  // Audit Trail
  auditLog: [{
    action: String,
    performedBy: String,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed
  }],

  // Related Records
  relatedDSARs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAR'
  }],

  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  confidentialityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'highly_confidential'],
    default: 'highly_confidential'
  },
  notes: String

}, {
  timestamps: true
});

// Indexes
dataBreachSchema.index({ breachId: 1 });
dataBreachSchema.index({ discoveryDate: -1 });
dataBreachSchema.index({ severity: 1, status: 1 });
dataBreachSchema.index({ 'supervisoryNotification.notificationDeadline': 1 });
dataBreachSchema.index({ 'complianceTracking.hours72Deadline': 1 });

// Virtuals
dataBreachSchema.virtual('hoursUntil72HourDeadline').get(function() {
  if (!this.complianceTracking.hours72Deadline) return null;
  const now = new Date();
  const deadline = this.complianceTracking.hours72Deadline;
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10; // Round to 1 decimal
});

dataBreachSchema.virtual('is72HourDeadlinePassed').get(function() {
  if (!this.complianceTracking.hours72Deadline) return false;
  return new Date() > this.complianceTracking.hours72Deadline;
});

// Methods
dataBreachSchema.methods.calculate72HourDeadline = function() {
  // 72 hours from discovery (Article 33)
  const deadline = new Date(this.discoveryDate);
  deadline.setHours(deadline.getHours() + 72);
  return deadline;
};

dataBreachSchema.methods.assessNotificationRequirement = function() {
  // Determine if notification is required based on risk assessment
  const highRisk = this.riskLevel === 'high_risk';
  const hasSpecialCategory = this.affectedDataCategories.some(cat => cat.isSpecialCategory);
  const largeScale = this.dataSubjectsAffected.estimatedNumber > 1000;
  
  return {
    supervisoryAuthority: this.riskLevel !== 'unlikely_risk',
    dataSubjects: highRisk || hasSpecialCategory || largeScale
  };
};

dataBreachSchema.methods.notifySupervisoryAuthority = function(authority, method) {
  this.supervisoryNotification.notified = true;
  this.supervisoryNotification.notificationDate = new Date();
  this.supervisoryNotification.authority = authority;
  this.supervisoryNotification.notificationMethod = method;
  
  // Calculate compliance
  const hoursToNotification = 
    (this.supervisoryNotification.notificationDate - this.discoveryDate) / (1000 * 60 * 60);
  this.complianceTracking.hoursToNotification = hoursToNotification;
  this.complianceTracking.notificationWithin72Hours = hoursToNotification <= 72;
  
  this.auditLog.push({
    action: 'supervisory_authority_notified',
    performedBy: 'system',
    timestamp: new Date(),
    details: { authority: authority.name, hoursToNotification }
  });
};

dataBreachSchema.methods.notifyDataSubjects = function(method, content) {
  this.dataSubjectNotification.notified = true;
  this.dataSubjectNotification.notificationDate = new Date();
  this.dataSubjectNotification.notificationMethod = method;
  this.dataSubjectNotification.notificationContent = content;
  this.dataSubjectNotification.recipientsCount = this.dataSubjectsAffected.estimatedNumber;
  
  this.auditLog.push({
    action: 'data_subjects_notified',
    performedBy: 'system',
    timestamp: new Date(),
    details: { method, recipientsCount: this.dataSubjectNotification.recipientsCount }
  });
};

// Statics
dataBreachSchema.statics.findApproaching72HourDeadline = function(hours = 12) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  
  return this.find({
    'supervisoryNotification.required': true,
    'supervisoryNotification.notified': false,
    'complianceTracking.hours72Deadline': {
      $gte: now,
      $lte: futureTime
    }
  });
};

dataBreachSchema.statics.findOverdue72Hours = function() {
  return this.find({
    'supervisoryNotification.required': true,
    'supervisoryNotification.notified': false,
    'complianceTracking.hours72Deadline': { $lt: new Date() }
  });
};

// Pre-save hook
dataBreachSchema.pre('save', function(next) {
  // Auto-calculate 72-hour deadline
  if (!this.complianceTracking.hours72Deadline && this.discoveryDate) {
    this.complianceTracking.hours72Deadline = this.calculate72HourDeadline();
  }
  
  // Set notification deadline for supervisory authority
  if (this.supervisoryNotification.required && !this.supervisoryNotification.notificationDeadline) {
    this.supervisoryNotification.notificationDeadline = this.calculate72HourDeadline();
  }
  
  next();
});

module.exports = mongoose.model('DataBreach', dataBreachSchema);

const mongoose = require('mongoose');

// Data Retention Schedule (Article 5(1)(e) - Storage Limitation)
const retentionScheduleSchema = new mongoose.Schema({
  // Schedule Identification
  scheduleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scheduleName: {
    type: String,
    required: true
  },

  // Processing Activity Reference
  processingActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingActivity',
    index: true
  },
  processingActivityName: String,

  // Data Category
  dataCategory: {
    type: String,
    required: true,
    enum: [
      'customer_data',
      'employee_data',
      'financial_records',
      'contracts',
      'marketing_data',
      'analytics_data',
      'communication_logs',
      'access_logs',
      'audit_trails',
      'consent_records',
      'health_records',
      'biometric_data',
      'other'
    ],
    index: true
  },
  specificDataTypes: [String],

  // Data Subject Category
  dataSubjectCategory: {
    type: String,
    enum: ['customers', 'employees', 'prospects', 'suppliers', 'visitors', 'other']
  },

  // Retention Period
  retentionPeriod: {
    duration: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['days', 'months', 'years']
    },
    description: String
  },

  // Retention Rationale (Article 5(1)(e))
  retentionRationale: {
    justification: {
      type: String,
      required: true
    },
    legalBasis: {
      type: String,
      enum: [
        'contractual_obligation',
        'legal_requirement',
        'legitimate_interest',
        'consent_duration',
        'statutory_limitation',
        'regulatory_requirement',
        'business_need',
        'other'
      ]
    },
    legalReferences: [String],
    businessJustification: String
  },

  // Trigger Events
  retentionTriggers: {
    startEvent: {
      type: String,
      required: true,
      enum: [
        'data_collection',
        'contract_signature',
        'service_delivery',
        'relationship_end',
        'consent_grant',
        'employment_start',
        'employment_end',
        'transaction_completion',
        'custom_event'
      ]
    },
    startEventDescription: String,
    
    endEvent: {
      type: String,
      enum: [
        'retention_period_expiry',
        'purpose_fulfilled',
        'consent_withdrawal',
        'relationship_termination',
        'legal_requirement_met',
        'data_subject_request',
        'business_decision',
        'custom_event'
      ]
    },
    endEventDescription: String
  },

  // Extended Retention
  extendedRetention: {
    allowed: Boolean,
    conditions: [String],
    maxExtension: {
      duration: Number,
      unit: String
    },
    approvalRequired: Boolean
  },

  // Deletion Method
  deletionProcedure: {
    deletionMethod: {
      type: String,
      required: true,
      enum: [
        'soft_delete',
        'hard_delete',
        'anonymization',
        'pseudonymization',
        'archival',
        'encryption_key_destruction',
        'physical_destruction',
        'secure_wipe'
      ]
    },
    deletionDescription: String,
    verificationMethod: String,
    certificationRequired: Boolean,
    
    // Automated Deletion
    automatedDeletion: {
      enabled: Boolean,
      automationScript: String,
      executionFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly']
      },
      lastExecutionDate: Date,
      nextExecutionDate: Date
    }
  },

  // Exceptions and Holds
  exceptions: [{
    exceptionType: {
      type: String,
      enum: ['legal_hold', 'litigation_hold', 'regulatory_investigation', 'data_subject_request', 'other']
    },
    reason: String,
    appliedDate: Date,
    appliedBy: String,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'removed']
    },
    affectedRecords: Number
  }],

  // Data Storage Locations
  storageLocations: [{
    system: String,
    database: String,
    tables: [String],
    backupLocation: String,
    archivalLocation: String
  }],

  // Retention Implementation
  implementation: {
    implementationStatus: {
      type: String,
      enum: ['planned', 'in_progress', 'implemented', 'needs_update'],
      default: 'planned'
    },
    implementationDate: Date,
    implementedBy: String,
    
    // Technical Controls
    technicalControls: [{
      control: String,
      description: String,
      implemented: Boolean
    }],
    
    // Operational Procedures
    operationalProcedures: [{
      procedure: String,
      responsible: String,
      frequency: String
    }]
  },

  // Monitoring and Compliance
  monitoring: {
    lastReviewDate: Date,
    nextReviewDate: Date,
    reviewFrequency: {
      type: String,
      enum: ['quarterly', 'biannually', 'annually']
    },
    
    complianceChecks: [{
      checkDate: Date,
      checkedBy: String,
      recordsReviewed: Number,
      complianceRate: Number,
      issues: [{
        issue: String,
        recordsAffected: Number,
        resolved: Boolean,
        resolutionDate: Date
      }]
    }]
  },

  // Deletion Statistics
  deletionStatistics: {
    totalRecordsDeleted: {
      type: Number,
      default: 0
    },
    lastDeletionDate: Date,
    deletionHistory: [{
      deletionDate: Date,
      recordCount: Number,
      method: String,
      performedBy: String,
      verificationComplete: Boolean,
      certificateUrl: String
    }]
  },

  // Data Subject Notifications
  dataSubjectNotification: {
    notificationRequired: Boolean,
    notificationMethod: String,
    notificationTiming: String,
    templateUrl: String
  },

  // Related Retention Schedules
  relatedSchedules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RetentionSchedule'
  }],

  // Regulatory Requirements
  regulatoryRequirements: [{
    regulation: String,
    jurisdiction: String,
    requirement: String,
    reference: String
  }],

  // Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'under_review', 'approved', 'active', 'suspended', 'archived'],
    default: 'draft',
    index: true
  },

  // Approval Workflow
  approval: {
    approvedBy: String,
    approvalDate: Date,
    dpoReviewed: Boolean,
    dpoApprovalDate: Date,
    legalReviewed: Boolean,
    legalApprovalDate: Date
  },

  // Documentation
  documents: [{
    documentType: {
      type: String,
      enum: ['policy', 'procedure', 'legal_opinion', 'risk_assessment', 'deletion_certificate', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadDate: Date
  }],

  // Metadata
  version: {
    type: Number,
    default: 1
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RetentionSchedule'
  },
  createdBy: String,
  lastModifiedBy: String,
  notes: String

}, {
  timestamps: true
});

// Indexes
retentionScheduleSchema.index({ scheduleId: 1 });
retentionScheduleSchema.index({ dataCategory: 1, status: 1 });
retentionScheduleSchema.index({ processingActivityId: 1 });
retentionScheduleSchema.index({ 'monitoring.nextReviewDate': 1 });
retentionScheduleSchema.index({ 'deletionProcedure.automatedDeletion.nextExecutionDate': 1 });

// Virtuals
retentionScheduleSchema.virtual('retentionPeriodInDays').get(function() {
  const { duration, unit } = this.retentionPeriod;
  
  switch (unit) {
    case 'days':
      return duration;
    case 'months':
      return duration * 30;
    case 'years':
      return duration * 365;
    default:
      return 0;
  }
});

retentionScheduleSchema.virtual('hasActiveException').get(function() {
  return this.exceptions.some(ex => ex.status === 'active');
});

// Methods
retentionScheduleSchema.methods.calculateRetentionEndDate = function(startDate) {
  const endDate = new Date(startDate);
  const { duration, unit } = this.retentionPeriod;
  
  switch (unit) {
    case 'days':
      endDate.setDate(endDate.getDate() + duration);
      break;
    case 'months':
      endDate.setMonth(endDate.getMonth() + duration);
      break;
    case 'years':
      endDate.setFullYear(endDate.getFullYear() + duration);
      break;
  }
  
  return endDate;
};

retentionScheduleSchema.methods.isRetentionExpired = function(recordDate) {
  const retentionEndDate = this.calculateRetentionEndDate(recordDate);
  return new Date() > retentionEndDate;
};

retentionScheduleSchema.methods.addException = function(exceptionData) {
  this.exceptions.push({
    ...exceptionData,
    appliedDate: new Date(),
    status: 'active'
  });
};

retentionScheduleSchema.methods.recordDeletion = function(recordCount, method, performedBy) {
  this.deletionStatistics.totalRecordsDeleted += recordCount;
  this.deletionStatistics.lastDeletionDate = new Date();
  this.deletionStatistics.deletionHistory.push({
    deletionDate: new Date(),
    recordCount,
    method,
    performedBy,
    verificationComplete: false
  });
};

retentionScheduleSchema.methods.scheduleNextDeletion = function() {
  if (!this.deletionProcedure.automatedDeletion.enabled) return null;
  
  const frequency = this.deletionProcedure.automatedDeletion.executionFrequency;
  const nextDate = new Date();
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
  }
  
  this.deletionProcedure.automatedDeletion.nextExecutionDate = nextDate;
  return nextDate;
};

// Statics
retentionScheduleSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

retentionScheduleSchema.statics.findByDataCategory = function(category) {
  return this.find({ dataCategory: category, status: 'active' });
};

retentionScheduleSchema.statics.findDueForReview = function() {
  return this.find({
    status: 'active',
    'monitoring.nextReviewDate': { $lte: new Date() }
  });
};

retentionScheduleSchema.statics.findDueForDeletion = function() {
  return this.find({
    status: 'active',
    'deletionProcedure.automatedDeletion.enabled': true,
    'deletionProcedure.automatedDeletion.nextExecutionDate': { $lte: new Date() }
  });
};

retentionScheduleSchema.statics.findWithActiveExceptions = function() {
  return this.find({
    'exceptions.status': 'active'
  });
};

module.exports = mongoose.model('RetentionSchedule', retentionScheduleSchema);

const mongoose = require('mongoose');

/**
 * PrivacyRights Model - Data Subject Rights / Consumer Rights Management
 * GDPR Articles 15-22, CCPA, PIPEDA, LGPD rights requests
 */
const PrivacyRightsSchema = new mongoose.Schema({
  // Request identification
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Data subject / consumer information
  dataSubject: {
    userId: String,
    email: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    phone: String,
    accountId: String,
    category: {
      type: String,
      enum: ['customer', 'employee', 'contractor', 'prospect', 'visitor', 'child', 'other']
    }
  },

  // Request details
  request: {
    requestType: {
      type: String,
      enum: [
        // GDPR
        'access', // Article 15
        'rectification', // Article 16
        'erasure', // Article 17 (Right to be forgotten)
        'restriction', // Article 18
        'portability', // Article 20
        'objection', // Article 21
        'withdraw_consent', // Article 7(3)
        'automated_decision_info', // Article 22
        // CCPA
        'know', // Right to know
        'delete', // Right to delete
        'opt_out_sale', // Opt-out of sale
        'opt_out_sharing', // Opt-out of sharing
        'correct', // Right to correct
        'limit_use', // Limit use of sensitive data
        // Other
        'access_logs', // Access to processing logs
        'data_sources' // Sources of data
      ],
      required: true,
      index: true
    },
    framework: {
      type: String,
      enum: ['gdpr', 'ccpa', 'cpra', 'pipeda', 'lgpd', 'other'],
      required: true
    },
    description: String,
    specificRequests: [String],
    receivedDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    channel: {
      type: String,
      enum: ['web_form', 'email', 'phone', 'mail', 'in_person', 'api', 'mobile_app'],
      required: true
    }
  },

  // Identity verification
  verification: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'verified', 'failed', 'not_required'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['email_verification', 'two_factor', 'document_upload', 'security_questions', 'phone_verification', 'in_person']
    },
    verifiedAt: Date,
    verifiedBy: String,
    attempts: Number,
    failureReason: String,
    documentsProvided: [String]
  },

  // Processing timeline
  timeline: {
    received: Date,
    acknowledged: Date,
    identityVerified: Date,
    dataGathered: Date,
    reviewed: Date,
    approved: Date,
    fulfilled: Date,
    closed: Date
  },

  // SLA tracking
  sla: {
    standardDays: {
      type: Number,
      default: 30 // GDPR default
    },
    extendedBy: Number,
    extensionReason: String,
    daysRemaining: Number,
    isOverdue: Boolean,
    overdueBy: Number
  },

  // Request-specific details
  accessRequest: {
    dataRequested: [String], // Specific data categories
    formatPreference: {
      type: String,
      enum: ['json', 'csv', 'pdf', 'xml', 'html']
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'download_link', 'mail', 'in_person', 'api']
    },
    includeProcessingInfo: Boolean,
    includeThirdParties: Boolean,
    includeRetentionPeriod: Boolean
  },

  rectificationRequest: {
    fieldsToCorrect: [{
      field: String,
      currentValue: String,
      correctedValue: String,
      reason: String
    }],
    evidenceProvided: [String]
  },

  erasureRequest: {
    reason: {
      type: String,
      enum: [
        'no_longer_necessary', // Article 17(1)(a)
        'withdraw_consent', // Article 17(1)(b)
        'object_to_processing', // Article 17(1)(c)
        'unlawful_processing', // Article 17(1)(d)
        'legal_obligation', // Article 17(1)(e)
        'child_consent' // Article 17(1)(f)
      ]
    },
    dataToDelete: [String],
    thirdPartiesNotified: [{
      party: String,
      notifiedAt: Date,
      responseReceived: Boolean
    }],
    backupsDeleted: Boolean,
    deletionMethod: String
  },

  portabilityRequest: {
    dataToExport: [String],
    format: {
      type: String,
      enum: ['json', 'csv', 'xml'],
      default: 'json'
    },
    includeMetadata: Boolean,
    directTransfer: {
      requested: Boolean,
      recipient: String,
      recipientContact: String,
      completed: Boolean
    }
  },

  objectionRequest: {
    processingType: {
      type: String,
      enum: ['direct_marketing', 'legitimate_interests', 'profiling', 'scientific_research']
    },
    reason: String,
    specificProcessing: [String]
  },

  // Data gathering
  dataGathering: {
    systems: [{
      systemName: String,
      dataFound: Boolean,
      recordCount: Number,
      dataCategories: [String],
      gatheredAt: Date,
      gatheredBy: String
    }],
    totalSystems: Number,
    completedSystems: Number,
    estimatedRecords: Number
  },

  // Response
  response: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'prepared', 'sent', 'confirmed'],
      default: 'pending'
    },
    responseDate: Date,
    responseMethod: String,
    content: String,
    attachments: [String],
    downloadLink: String,
    expiresAt: Date,
    accessed: Boolean,
    accessedAt: Date
  },

  // Rejection / denial
  denial: {
    denied: Boolean,
    reason: {
      type: String,
      enum: [
        'manifestly_unfounded',
        'excessive',
        'unable_to_verify_identity',
        'legal_exception',
        'affects_others_rights',
        'not_applicable',
        'disproportionate_effort'
      ]
    },
    explanation: String,
    deniedBy: String,
    deniedDate: Date,
    appeal: {
      appealSubmitted: Boolean,
      appealDate: Date,
      appealOutcome: String
    }
  },

  // Fee charged (if excessive or manifestly unfounded)
  fee: {
    charged: Boolean,
    amount: Number,
    currency: String,
    reason: String,
    paid: Boolean,
    paidDate: Date
  },

  // Workflow
  workflow: {
    assignedTo: String,
    assignedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    escalated: Boolean,
    escalatedTo: String,
    escalationReason: String
  },

  // Communications
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'mail', 'in_person']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    date: Date,
    from: String,
    to: String,
    subject: String,
    content: String,
    sentBy: String
  }],

  // Compliance metrics
  metrics: {
    processingTimeHours: Number,
    deadlineMet: Boolean,
    daysBeforeDeadline: Number,
    extensionUsed: Boolean,
    systemsQueried: Number,
    recordsProcessed: Number
  },

  // Status
  status: {
    type: String,
    enum: ['submitted', 'identity_verification', 'under_review', 'gathering_data', 'in_progress', 'completed', 'denied', 'overdue', 'closed'],
    default: 'submitted',
    index: true
  },

  // Metadata
  tags: [String],
  notes: String,
  internalNotes: String

}, {
  timestamps: true,
  collection: 'privacy_rights'
});

// Indexes
PrivacyRightsSchema.index({ requestId: 1 });
PrivacyRightsSchema.index({ 'dataSubject.email': 1, 'request.requestType': 1 });
PrivacyRightsSchema.index({ status: 1, 'request.dueDate': 1 });
PrivacyRightsSchema.index({ 'request.receivedDate': 1 });

// Virtual: Days remaining
PrivacyRightsSchema.virtual('daysRemaining').get(function() {
  const diff = this.request.dueDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: Is overdue
PrivacyRightsSchema.virtual('isOverdue').get(function() {
  return this.request.dueDate < new Date() && 
         !['completed', 'closed', 'denied'].includes(this.status);
});

// Instance method: Calculate due date
PrivacyRightsSchema.methods.calculateDueDate = function() {
  const receivedDate = new Date(this.request.receivedDate);
  const standardDays = this.request.framework === 'ccpa' ? 45 : 30;
  this.sla.standardDays = standardDays;
  
  this.request.dueDate = new Date(receivedDate);
  this.request.dueDate.setDate(receivedDate.getDate() + standardDays);
  
  return this.save();
};

// Instance method: Extend deadline
PrivacyRightsSchema.methods.extendDeadline = function(days, reason) {
  this.sla.extendedBy = days;
  this.sla.extensionReason = reason;
  
  this.request.dueDate = new Date(this.request.dueDate);
  this.request.dueDate.setDate(this.request.dueDate.getDate() + days);
  
  return this.save();
};

// Instance method: Complete request
PrivacyRightsSchema.methods.complete = function(responseDetails) {
  this.status = 'completed';
  this.timeline.fulfilled = new Date();
  this.timeline.closed = new Date();
  
  this.response.status = 'sent';
  this.response.responseDate = new Date();
  Object.assign(this.response, responseDetails);
  
  // Calculate metrics
  const processingTime = this.timeline.closed - this.request.receivedDate;
  this.metrics.processingTimeHours = Math.round(processingTime / (1000 * 60 * 60));
  this.metrics.deadlineMet = this.timeline.closed <= this.request.dueDate;
  
  const daysBeforeDeadline = Math.ceil((this.request.dueDate - this.timeline.closed) / (1000 * 60 * 60 * 24));
  this.metrics.daysBeforeDeadline = daysBeforeDeadline;
  
  return this.save();
};

// Instance method: Deny request
PrivacyRightsSchema.methods.deny = function(reason, explanation, user) {
  this.denial.denied = true;
  this.denial.reason = reason;
  this.denial.explanation = explanation;
  this.denial.deniedBy = user;
  this.denial.deniedDate = new Date();
  this.status = 'denied';
  
  return this.save();
};

// Instance method: Add communication
PrivacyRightsSchema.methods.addCommunication = function(comm) {
  this.communications.push({
    ...comm,
    date: new Date()
  });
  
  return this.save();
};

// Static: Find overdue requests
PrivacyRightsSchema.statics.findOverdue = function() {
  return this.find({
    status: { $nin: ['completed', 'closed', 'denied'] },
    'request.dueDate': { $lt: new Date() }
  }).sort({ 'request.dueDate': 1 });
};

// Static: Find due soon
PrivacyRightsSchema.statics.findDueSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: { $nin: ['completed', 'closed', 'denied'] },
    'request.dueDate': { $lte: futureDate, $gte: new Date() }
  }).sort({ 'request.dueDate': 1 });
};

// Static: Get statistics by request type
PrivacyRightsSchema.statics.getStatsByType = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$request.requestType',
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        overdue: {
          $sum: { $cond: ['$sla.isOverdue', 1, 0] }
        },
        avgProcessingTime: { $avg: '$metrics.processingTimeHours' }
      }
    }
  ]);
};

// Pre-save: Calculate due date and SLA
PrivacyRightsSchema.pre('save', function(next) {
  if (this.isNew && !this.request.dueDate) {
    this.calculateDueDate();
  }
  
  // Update SLA tracking
  if (this.request.dueDate) {
    const now = new Date();
    const diff = this.request.dueDate - now;
    this.sla.daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    this.sla.isOverdue = diff < 0 && !['completed', 'closed', 'denied'].includes(this.status);
    if (this.sla.isOverdue) {
      this.sla.overdueBy = Math.abs(this.sla.daysRemaining);
    }
  }
  
  next();
});

module.exports = mongoose.model('PrivacyRights', PrivacyRightsSchema);

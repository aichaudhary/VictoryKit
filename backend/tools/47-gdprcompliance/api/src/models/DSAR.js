const mongoose = require('mongoose');

// Data Subject Access Request (Articles 15-22)
const dsarSchema = new mongoose.Schema({
  // Request Identification
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Data Subject Information
  dataSubjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSubject',
    index: true
  },
  dataSubjectEmail: {
    type: String,
    required: true,
    index: true
  },
  dataSubjectName: String,

  // Request Type (GDPR Rights)
  requestType: {
    type: String,
    required: true,
    enum: [
      'access',              // Article 15 - Right of access
      'rectification',       // Article 16 - Right to rectification
      'erasure',            // Article 17 - Right to erasure (right to be forgotten)
      'restriction',        // Article 18 - Right to restriction of processing
      'portability',        // Article 20 - Right to data portability
      'objection',          // Article 21 - Right to object
      'automated_decision', // Article 22 - Automated individual decision-making
      'withdraw_consent'    // Article 7(3) - Withdrawal of consent
    ],
    index: true
  },

  // Request Details
  requestDescription: {
    type: String,
    required: true
  },
  requestChannel: {
    type: String,
    enum: ['email', 'web_form', 'phone', 'written_letter', 'in_person', 'api'],
    required: true
  },
  requestLanguage: {
    type: String,
    default: 'en'
  },

  // Identity Verification (GDPR allows controllers to verify identity)
  identityVerification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'additional_info_required'],
      default: 'pending'
    },
    verificationMethod: {
      type: String,
      enum: ['email_confirmation', 'document_upload', 'knowledge_based', 'two_factor', 'in_person', 'third_party_service']
    },
    verifiedAt: Date,
    verifiedBy: String,
    verificationNotes: String
  },

  // Timeline (30-day deadline - Article 12(3))
  receivedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  acknowledgedDate: Date,
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  completedDate: Date,
  
  // Extension (can extend by 2 months if complex - Article 12(3))
  extensionRequested: {
    type: Boolean,
    default: false
  },
  extensionReason: String,
  extendedDueDate: Date,

  // Request Status
  status: {
    type: String,
    enum: [
      'submitted',
      'under_review',
      'identity_verification_pending',
      'in_progress',
      'awaiting_approval',
      'approved',
      'completed',
      'rejected',
      'withdrawn',
      'overdue'
    ],
    default: 'submitted',
    index: true
  },

  // Processing Workflow
  workflow: [{
    stage: String,
    assignedTo: String,
    startedAt: Date,
    completedAt: Date,
    status: String,
    notes: String
  }],

  // Current Assignment
  assignedTo: {
    userId: String,
    userName: String,
    department: String,
    assignedAt: Date
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Request-Specific Data
  accessRequest: {
    dataCategories: [String],
    systemsChecked: [String],
    dataFound: Boolean,
    recordCount: Number,
    deliveryFormat: {
      type: String,
      enum: ['pdf', 'json', 'csv', 'xml', 'physical_copy']
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'secure_download', 'api', 'postal_mail', 'in_person']
    }
  },

  rectificationRequest: {
    fieldsToCorrect: [{
      field: String,
      currentValue: String,
      requestedValue: String,
      corrected: Boolean
    }],
    recipientsNotified: [String]
  },

  erasureRequest: {
    erasureReason: {
      type: String,
      enum: [
        'no_longer_necessary',
        'consent_withdrawn',
        'objection_with_no_overriding_grounds',
        'unlawfully_processed',
        'legal_obligation',
        'child_consent'
      ]
    },
    dataCategoriesToErase: [String],
    systemsAffected: [String],
    erasureCompleted: Boolean,
    erasureDate: Date,
    backupsHandled: Boolean,
    thirdPartiesNotified: [String]
  },

  restrictionRequest: {
    restrictionReason: {
      type: String,
      enum: [
        'accuracy_contested',
        'unlawful_but_objection_to_erasure',
        'no_longer_needed_but_needed_for_legal_claims',
        'objection_pending_verification'
      ]
    },
    restrictionStartDate: Date,
    restrictionEndDate: Date,
    notificationBeforeLifting: Boolean
  },

  portabilityRequest: {
    dataCategories: [String],
    exportFormat: String,
    directTransferRequested: Boolean,
    recipientController: String,
    transferCompleted: Boolean
  },

  objectionRequest: {
    objectionReason: String,
    processingActivity: String,
    objectionGrounds: String,
    legitimateInterestsOverride: Boolean,
    processingCeased: Boolean
  },

  // Response to Data Subject
  response: {
    responseDate: Date,
    responseMethod: {
      type: String,
      enum: ['email', 'secure_portal', 'postal_mail', 'in_person']
    },
    responseContent: String,
    attachments: [{
      fileName: String,
      fileUrl: String,
      uploadDate: Date
    }]
  },

  // Rejection Handling
  rejectionReason: {
    type: String,
    enum: [
      'identity_not_verified',
      'manifestly_unfounded',
      'excessive_request',
      'legal_obligation_to_retain',
      'public_interest',
      'legal_claims',
      'freedom_of_expression',
      'other'
    ]
  },
  rejectionDetails: String,

  // Fees (can charge reasonable fee if manifestly unfounded/excessive - Article 12(5))
  feeCharged: {
    amount: Number,
    currency: String,
    reason: String,
    paid: Boolean,
    paymentDate: Date
  },

  // Compliance Tracking
  complianceMetrics: {
    processingTimeHours: Number,
    deadlineMet: Boolean,
    daysBeforeDeadline: Number,
    escalationRequired: Boolean
  },

  // Communication Log
  communications: [{
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    channel: String,
    subject: String,
    content: String,
    sentBy: String,
    sentAt: Date,
    attachments: [String]
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
  relatedBreaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataBreach'
  }],

  // Internal Notes
  internalNotes: [{
    note: String,
    author: String,
    createdAt: Date
  }],

  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  tags: [String]

}, {
  timestamps: true
});

// Indexes
dsarSchema.index({ requestId: 1 });
dsarSchema.index({ dataSubjectEmail: 1, requestType: 1 });
dsarSchema.index({ status: 1, dueDate: 1 });
dsarSchema.index({ receivedDate: -1 });
dsarSchema.index({ assignedTo.userId: 1, status: 1 });

// Virtuals
dsarSchema.virtual('daysRemaining').get(function() {
  const deadline = this.extensionRequested ? this.extendedDueDate : this.dueDate;
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

dsarSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'rejected') return false;
  const deadline = this.extensionRequested ? this.extendedDueDate : this.dueDate;
  return new Date() > deadline;
});

// Methods
dsarSchema.methods.calculateDueDate = function() {
  // 30 days from receipt (Article 12(3))
  const dueDate = new Date(this.receivedDate);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
};

dsarSchema.methods.requestExtension = function(reason) {
  // Can extend by additional 2 months (60 days)
  this.extensionRequested = true;
  this.extensionReason = reason;
  const extendedDate = new Date(this.dueDate);
  extendedDate.setDate(extendedDate.getDate() + 60);
  this.extendedDueDate = extendedDate;
};

dsarSchema.methods.complete = function(completionDetails) {
  this.status = 'completed';
  this.completedDate = new Date();
  this.complianceMetrics.processingTimeHours = 
    (this.completedDate - this.receivedDate) / (1000 * 60 * 60);
  this.complianceMetrics.deadlineMet = !this.isOverdue;
  this.complianceMetrics.daysBeforeDeadline = this.daysRemaining;
};

dsarSchema.methods.addCommunication = function(direction, channel, subject, content, sentBy) {
  this.communications.push({
    direction,
    channel,
    subject,
    content,
    sentBy,
    sentAt: new Date()
  });
};

// Statics
dsarSchema.statics.findOverdue = function() {
  return this.find({
    status: { $nin: ['completed', 'rejected', 'withdrawn'] },
    dueDate: { $lt: new Date() }
  });
};

dsarSchema.statics.findDueSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.find({
    status: { $nin: ['completed', 'rejected', 'withdrawn'] },
    dueDate: { $lte: futureDate, $gte: new Date() }
  });
};

// Pre-save hook
dsarSchema.pre('save', function(next) {
  // Auto-calculate due date if not set
  if (!this.dueDate && this.receivedDate) {
    this.dueDate = this.calculateDueDate();
  }
  
  // Update overdue status
  if (this.isOverdue && this.status !== 'completed' && this.status !== 'rejected') {
    this.status = 'overdue';
  }
  
  next();
});

module.exports = mongoose.model('DSAR', dsarSchema);

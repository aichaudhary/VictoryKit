const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema({
  // Consent Identification
  consentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Data Subject Reference
  dataSubjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DataSubject',
    required: true,
    index: true
  },
  dataSubjectEmail: {
    type: String,
    required: true,
    index: true
  },

  // Consent Purpose (Article 6(1)(a))
  purpose: {
    type: String,
    required: true,
    enum: [
      'marketing_email',
      'marketing_sms',
      'marketing_phone',
      'analytics_tracking',
      'personalization',
      'third_party_sharing',
      'profiling',
      'automated_decision_making',
      'newsletter',
      'cookies_advertising',
      'cookies_functional',
      'cookies_analytics',
      'data_transfer_non_eu',
      'research_purposes',
      'other'
    ]
  },
  purposeDescription: String,

  // Consent Text (exact wording shown to user)
  consentText: {
    type: String,
    required: true
  },
  consentLanguage: {
    type: String,
    default: 'en'
  },

  // Consent Requirements (GDPR Article 7)
  consentCriteria: {
    freelyGiven: {
      type: Boolean,
      required: true,
      default: false
    },
    specific: {
      type: Boolean,
      required: true,
      default: false
    },
    informed: {
      type: Boolean,
      required: true,
      default: false
    },
    unambiguous: {
      type: Boolean,
      required: true,
      default: false
    },
    clearAffirmativeAction: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  // Consent Grant Details
  grantedAt: {
    type: Date,
    required: true
  },
  grantMethod: {
    type: String,
    enum: ['checkbox', 'button', 'signature', 'verbal', 'written', 'email_confirmation', 'sms_confirmation'],
    required: true
  },
  grantLocation: {
    page: String,
    form: String,
    url: String
  },

  // Technical Evidence
  ipAddress: String,
  userAgent: String,
  geoLocation: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Consent Status
  status: {
    type: String,
    enum: ['active', 'withdrawn', 'expired', 'renewed', 'invalidated'],
    default: 'active',
    index: true
  },

  // Withdrawal Mechanism (Article 7(3))
  withdrawalMechanismProvided: {
    type: Boolean,
    required: true,
    default: true
  },
  withdrawalMethod: {
    type: String,
    enum: ['email', 'web_form', 'settings_page', 'api', 'phone', 'written_request']
  },
  withdrawnAt: Date,
  withdrawalReason: String,
  withdrawnBy: String,

  // Consent Renewal
  renewalRequired: Boolean,
  renewalDate: Date,
  previousConsentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsentRecord'
  },

  // Validity Period
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: Date,
  isLifelong: {
    type: Boolean,
    default: false
  },

  // Granular Controls
  granularChoices: [{
    option: String,
    selected: Boolean
  }],

  // Dependencies
  linkedConsents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsentRecord'
  }],
  mandatoryForService: {
    type: Boolean,
    default: false
  },

  // Processing Activities
  linkedProcessingActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingActivity'
  }],

  // Compliance Validation
  complianceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  validationChecks: [{
    check: String,
    passed: Boolean,
    checkDate: Date
  }],

  // Audit Trail
  auditLog: [{
    action: String,
    performedBy: String,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed
  }],

  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  notes: String

}, {
  timestamps: true
});

// Indexes
consentRecordSchema.index({ dataSubjectId: 1, status: 1 });
consentRecordSchema.index({ purpose: 1, status: 1 });
consentRecordSchema.index({ grantedAt: -1 });
consentRecordSchema.index({ validUntil: 1 });

// Virtuals
consentRecordSchema.virtual('isExpired').get(function() {
  if (this.isLifelong) return false;
  if (!this.validUntil) return false;
  return this.validUntil < new Date();
});

consentRecordSchema.virtual('isValid').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Methods
consentRecordSchema.methods.validateGDPRCompliance = function() {
  const criteria = this.consentCriteria;
  return (
    criteria.freelyGiven &&
    criteria.specific &&
    criteria.informed &&
    criteria.unambiguous &&
    criteria.clearAffirmativeAction &&
    this.withdrawalMechanismProvided
  );
};

consentRecordSchema.methods.withdraw = function(reason, withdrawnBy) {
  this.status = 'withdrawn';
  this.withdrawnAt = new Date();
  this.withdrawalReason = reason;
  this.withdrawnBy = withdrawnBy;
  this.auditLog.push({
    action: 'consent_withdrawn',
    performedBy: withdrawnBy,
    timestamp: new Date(),
    details: { reason }
  });
};

// Statics
consentRecordSchema.statics.findActiveByDataSubject = function(dataSubjectId) {
  return this.find({
    dataSubjectId,
    status: 'active',
    $or: [
      { isLifelong: true },
      { validUntil: { $gt: new Date() } }
    ]
  });
};

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);

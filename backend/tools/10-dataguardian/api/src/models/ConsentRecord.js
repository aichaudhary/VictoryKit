const mongoose = require('mongoose');

/**
 * Consent Record Model
 * Tracks user consent for data processing under GDPR, CCPA, and other privacy regulations
 */
const consentRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Consent Identifier
  consentId: { type: String, unique: true, required: true },
  
  // Data Subject Information
  dataSubject: {
    identifier: { type: String, required: true }, // User ID, email, or customer ID
    identifierType: { type: String, enum: ['email', 'user_id', 'customer_id', 'phone', 'device_id'], required: true },
    email: String,
    name: String,
    ipAddress: String,
    userAgent: String,
    country: String,
    region: String
  },
  
  // Consent Purpose & Type
  purpose: {
    code: { type: String, required: true }, // e.g., 'marketing', 'analytics', 'personalization'
    name: { type: String, required: true },
    description: String,
    category: { 
      type: String, 
      enum: ['essential', 'functional', 'analytics', 'marketing', 'advertising', 'social', 'third-party', 'research', 'other'],
      required: true 
    },
    legalBasis: { 
      type: String, 
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
      default: 'consent' 
    }
  },
  
  // Consent Details
  consent: {
    status: { type: String, enum: ['granted', 'denied', 'withdrawn', 'expired', 'pending'], required: true },
    version: { type: String, default: '1.0' },
    method: { 
      type: String, 
      enum: ['checkbox', 'banner', 'form', 'verbal', 'written', 'api', 'preference_center', 'double_opt_in'],
      required: true 
    },
    doubleOptIn: { type: Boolean, default: false },
    doubleOptInConfirmedAt: Date,
    explicit: { type: Boolean, default: false }, // GDPR requires explicit consent for sensitive data
    granular: { type: Boolean, default: false }  // Whether consent is purpose-specific
  },
  
  // Applicable Regulations
  regulations: [{
    type: { type: String, enum: ['gdpr', 'ccpa', 'lgpd', 'pipeda', 'pdpa', 'pecr', 'tcf', 'other'] },
    compliant: { type: Boolean, default: true },
    notes: String
  }],
  
  // TCF (Transparency & Consent Framework) specific
  tcf: {
    enabled: { type: Boolean, default: false },
    version: String,
    tcString: String, // IAB TCF consent string
    cmpId: Number,
    cmpVersion: Number,
    vendorConsents: [Number],
    purposeConsents: [Number],
    specialFeatureOptIns: [Number]
  },
  
  // Data Processing Details
  processing: {
    dataCategories: [String], // What data is being processed
    processingActivities: [String], // What is being done with the data
    dataRetentionPeriod: String,
    thirdParties: [{
      name: String,
      purpose: String,
      country: String
    }],
    crossBorderTransfer: { type: Boolean, default: false },
    transferDestinations: [String]
  },
  
  // Source Information
  source: {
    type: { type: String, enum: ['website', 'mobile_app', 'email', 'phone', 'in_person', 'api', 'import', 'partner'], required: true },
    url: String,
    page: String,
    campaign: String,
    formId: String,
    referrer: String
  },
  
  // Timeline
  timeline: {
    collectedAt: { type: Date, default: Date.now },
    confirmedAt: Date, // For double opt-in
    lastUpdatedAt: Date,
    expiresAt: Date,
    withdrawnAt: Date,
    renewedAt: Date
  },
  
  // Consent History
  history: [{
    action: { type: String, enum: ['granted', 'denied', 'withdrawn', 'renewed', 'modified', 'expired'] },
    previousStatus: String,
    newStatus: String,
    timestamp: { type: Date, default: Date.now },
    reason: String,
    method: String,
    actor: String, // Who made the change (user, system, admin)
    ipAddress: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Proof of Consent
  proof: {
    hasProof: { type: Boolean, default: true },
    proofType: { type: String, enum: ['timestamp', 'screenshot', 'form_submission', 'api_log', 'recording', 'signed_document'] },
    proofUrl: String,
    proofHash: String, // Hash of the consent proof for integrity
    signatureData: String, // For digital signatures
    witnessData: mongoose.Schema.Types.Mixed
  },
  
  // Notifications
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    confirmationSentAt: Date,
    reminderEnabled: { type: Boolean, default: false },
    lastReminderAt: Date,
    expiryNotificationSent: { type: Boolean, default: false }
  },
  
  // Withdrawal Information
  withdrawal: {
    requested: { type: Boolean, default: false },
    requestedAt: Date,
    processedAt: Date,
    reason: String,
    method: String,
    confirmationSent: { type: Boolean, default: false }
  },
  
  // Preferences (for preference centers)
  preferences: {
    frequency: { type: String, enum: ['all', 'weekly', 'monthly', 'important_only', 'none'] },
    channels: [{
      channel: { type: String, enum: ['email', 'sms', 'push', 'phone', 'mail', 'in_app'] },
      enabled: { type: Boolean, default: true }
    }],
    topics: [{
      topic: String,
      subscribed: Boolean
    }]
  },
  
  // Metadata
  metadata: {
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    internalNotes: String
  },
  
  // Active Status
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
consentRecordSchema.index({ userId: 1, 'consent.status': 1 });
consentRecordSchema.index({ 'dataSubject.identifier': 1 });
consentRecordSchema.index({ 'dataSubject.email': 1 });
consentRecordSchema.index({ 'purpose.code': 1 });
consentRecordSchema.index({ 'purpose.category': 1 });
consentRecordSchema.index({ consentId: 1 });
consentRecordSchema.index({ 'timeline.expiresAt': 1 });
consentRecordSchema.index({ 'consent.status': 1, isActive: 1 });
consentRecordSchema.index({ 'regulations.type': 1 });
consentRecordSchema.index({ createdAt: -1 });

// Pre-save hook to generate consent ID and update timestamps
consentRecordSchema.pre('save', function(next) {
  if (!this.consentId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.consentId = `CNS-${timestamp}-${random}`;
  }
  
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if consent is valid
consentRecordSchema.virtual('isValid').get(function() {
  if (this.consent.status !== 'granted') return false;
  if (!this.isActive) return false;
  if (this.timeline.expiresAt && new Date() > new Date(this.timeline.expiresAt)) return false;
  return true;
});

// Virtual for days until expiry
consentRecordSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.timeline.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.timeline.expiresAt);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
});

// Static method to check consent for a data subject and purpose
consentRecordSchema.statics.checkConsent = async function(identifier, purposeCode) {
  const record = await this.findOne({
    'dataSubject.identifier': identifier,
    'purpose.code': purposeCode,
    'consent.status': 'granted',
    isActive: true,
    $or: [
      { 'timeline.expiresAt': null },
      { 'timeline.expiresAt': { $gt: new Date() } }
    ]
  });
  
  return {
    hasConsent: !!record,
    consentId: record?.consentId,
    grantedAt: record?.timeline.collectedAt,
    expiresAt: record?.timeline.expiresAt
  };
};

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);

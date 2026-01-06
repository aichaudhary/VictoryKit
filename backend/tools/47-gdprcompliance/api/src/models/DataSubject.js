const mongoose = require('mongoose');

const dataSubjectSchema = new mongoose.Schema({
  // Identity Information
  subjectId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  alternativeIdentifiers: [{
    type: { type: String, enum: ['phone', 'customerId', 'accountId', 'userId', 'other'] },
    value: String
  }],

  // Data Subject Category
  category: {
    type: String,
    enum: ['customer', 'employee', 'prospect', 'supplier', 'visitor', 'subscriber', 'other'],
    required: true
  },

  // Contact Information
  contactDetails: {
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    preferredLanguage: String
  },

  // Special Category Indicators (Article 9)
  specialCategoryData: {
    hasHealthData: { type: Boolean, default: false },
    hasBiometricData: { type: Boolean, default: false },
    hasGeneticData: { type: Boolean, default: false },
    hasRacialEthnicData: { type: Boolean, default: false },
    hasPoliticalOpinions: { type: Boolean, default: false },
    hasReligiousBeliefs: { type: Boolean, default: false },
    hasTradeUnionMembership: { type: Boolean, default: false },
    hasSexLifeData: { type: Boolean, default: false }
  },

  // Data Subject Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'erased', 'restricted'],
    default: 'active'
  },

  // Rights Exercise History
  rightsExercised: [{
    rightType: {
      type: String,
      enum: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'automated-decision']
    },
    requestDate: Date,
    completionDate: Date,
    status: String,
    dsarId: { type: mongoose.Schema.Types.ObjectId, ref: 'DSAR' }
  }],

  // Consent Overview
  activeConsents: [{
    consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsentRecord' },
    purpose: String,
    status: String,
    grantedDate: Date
  }],

  // Data Mapping
  dataLocations: [{
    system: String,
    database: String,
    tables: [String],
    lastMapped: Date
  }],

  // Retention
  retentionScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RetentionSchedule'
  },
  retentionEndDate: Date,
  
  // Metadata
  createdBy: String,
  lastModifiedBy: String,
  lastAccessDate: Date,
  notes: String

}, {
  timestamps: true
});

// Indexes
dataSubjectSchema.index({ email: 1, status: 1 });
dataSubjectSchema.index({ category: 1, status: 1 });
dataSubjectSchema.index({ 'specialCategoryData.hasHealthData': 1 });

// Methods
dataSubjectSchema.methods.isSpecialCategory = function() {
  const specialData = this.specialCategoryData;
  return Object.values(specialData).some(value => value === true);
};

dataSubjectSchema.methods.getActiveConsentsCount = function() {
  return this.activeConsents.filter(c => c.status === 'active').length;
};

module.exports = mongoose.model('DataSubject', dataSubjectSchema);

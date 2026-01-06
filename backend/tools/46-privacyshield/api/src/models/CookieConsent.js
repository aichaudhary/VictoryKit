const mongoose = require('mongoose');

/**
 * CookieConsent Model - User consent management for cookies and tracking
 * GDPR ePrivacy Directive, CCPA opt-out compliance
 */
const CookieConsentSchema = new mongoose.Schema({
  // Consent identification
  consentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // User identification
  user: {
    userId: String,
    email: String,
    sessionId: String,
    fingerprint: String, // Browser fingerprint
    ipAddress: String,
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown']
    }
  },

  // Location data
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Consent timestamp
  consentGiven: {
    grantedAt: {
      type: Date,
      required: true,
      index: true
    },
    consentMethod: {
      type: String,
      enum: ['banner_accept_all', 'banner_reject_all', 'banner_customize', 'settings_page', 'implicit', 'pre_ticked', 'opt_out'],
      required: true
    },
    consentVersion: String, // Cookie policy version
    bannerVersion: String
  },

  // Granular consent per category
  categories: [{
    category: {
      type: String,
      enum: ['strictly_necessary', 'functional', 'analytics', 'marketing', 'social_media', 'personalization'],
      required: true
    },
    consented: {
      type: Boolean,
      required: true
    },
    consentedAt: Date,
    withdrawnAt: Date,
    lastModified: Date
  }],

  // Specific cookies consented
  cookies: [{
    cookieName: String,
    cookieId: String,
    provider: String,
    category: String,
    purpose: String,
    consented: Boolean,
    duration: String, // e.g., "session", "1 year"
    thirdParty: Boolean
  }],

  // Consent validity
  validity: {
    isValid: {
      type: Boolean,
      default: true
    },
    expiresAt: Date, // e.g., 12 months from consent
    requiresRenewal: Boolean,
    renewalReason: String,
    lastValidated: Date
  },

  // GDPR compliance
  gdprCompliance: {
    freelyGiven: Boolean,
    specific: Boolean,
    informed: Boolean,
    unambiguous: Boolean,
    clearAffirmativeAction: Boolean,
    withdrawalAvailable: Boolean,
    complianceScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Withdrawal
  withdrawal: {
    withdrawn: {
      type: Boolean,
      default: false,
      index: true
    },
    withdrawnAt: Date,
    withdrawalMethod: {
      type: String,
      enum: ['settings_page', 'banner', 'email_link', 'customer_support', 'dsar']
    },
    withdrawalReason: String,
    allCategoriesWithdrawn: Boolean
  },

  // Consent renewal history
  renewals: [{
    renewedAt: Date,
    previousConsentId: String,
    reason: String,
    categoriesChanged: Boolean
  }],

  // Tracking preferences (CCPA)
  tracking: {
    doNotSell: {
      type: Boolean,
      default: false
    },
    doNotShare: {
      type: Boolean,
      default: false
    },
    limitSensitiveData: {
      type: Boolean,
      default: false
    },
    optedOutAt: Date
  },

  // Consent evidence
  evidence: {
    consentText: String, // Text shown to user
    privacyPolicyUrl: String,
    cookiePolicyUrl: String,
    screenshot: String, // Base64 or URL
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  },

  // Communication preferences
  preferences: {
    marketingEmails: Boolean,
    analyticsTracking: Boolean,
    personalization: Boolean,
    thirdPartySharing: Boolean,
    lastUpdated: Date
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'withdrawn', 'expired', 'renewed', 'invalid'],
    default: 'active',
    index: true
  },

  // Metadata
  notes: String,
  tags: [String],
  source: String // e.g., "website", "mobile_app", "api"

}, {
  timestamps: true,
  collection: 'cookie_consents'
});

// Indexes
CookieConsentSchema.index({ 'user.userId': 1, status: 1 });
CookieConsentSchema.index({ 'user.email': 1, status: 1 });
CookieConsentSchema.index({ 'consentGiven.grantedAt': 1 });
CookieConsentSchema.index({ 'validity.expiresAt': 1 });
CookieConsentSchema.index({ 'categories.category': 1, 'categories.consented': 1 });

// Virtual: Days until expiration
CookieConsentSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.validity.expiresAt) return null;
  const diff = this.validity.expiresAt - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: Is expired
CookieConsentSchema.virtual('isExpired').get(function() {
  return this.validity.expiresAt && this.validity.expiresAt < new Date();
});

// Instance method: Withdraw consent
CookieConsentSchema.methods.withdrawConsent = function(method, reason, user) {
  this.withdrawal.withdrawn = true;
  this.withdrawal.withdrawnAt = new Date();
  this.withdrawal.withdrawalMethod = method;
  this.withdrawal.withdrawalReason = reason;
  this.withdrawal.allCategoriesWithdrawn = true;
  this.status = 'withdrawn';
  
  // Mark all categories as withdrawn
  this.categories.forEach(cat => {
    if (cat.consented) {
      cat.consented = false;
      cat.withdrawnAt = new Date();
    }
  });
  
  return this.save();
};

// Instance method: Withdraw specific category
CookieConsentSchema.methods.withdrawCategory = function(category) {
  const cat = this.categories.find(c => c.category === category);
  if (cat && cat.consented) {
    cat.consented = false;
    cat.withdrawnAt = new Date();
    cat.lastModified = new Date();
  }
  
  // Check if all categories withdrawn
  const allWithdrawn = this.categories.every(c => !c.consented);
  if (allWithdrawn) {
    this.withdrawal.withdrawn = true;
    this.withdrawal.withdrawnAt = new Date();
    this.status = 'withdrawn';
  }
  
  return this.save();
};

// Instance method: Update category consent
CookieConsentSchema.methods.updateCategoryConsent = function(category, consented) {
  const cat = this.categories.find(c => c.category === category);
  if (cat) {
    cat.consented = consented;
    cat.lastModified = new Date();
    if (consented) {
      cat.consentedAt = new Date();
      cat.withdrawnAt = null;
    } else {
      cat.withdrawnAt = new Date();
    }
  }
  
  return this.save();
};

// Instance method: Validate GDPR compliance
CookieConsentSchema.methods.validateGDPRCompliance = function() {
  const criteria = this.gdprCompliance;
  
  // Check all criteria
  criteria.freelyGiven = this.consentGiven.consentMethod !== 'pre_ticked' && 
                         this.consentGiven.consentMethod !== 'implicit';
  criteria.specific = this.categories.length > 1; // Granular consent
  criteria.informed = !!this.evidence.privacyPolicyUrl;
  criteria.unambiguous = ['banner_accept_all', 'banner_customize', 'settings_page'].includes(this.consentGiven.consentMethod);
  criteria.clearAffirmativeAction = this.consentGiven.consentMethod !== 'implicit';
  criteria.withdrawalAvailable = true; // Assumes withdrawal mechanism exists
  
  // Calculate score
  const criteriaCount = 6;
  const metCriteria = [
    criteria.freelyGiven,
    criteria.specific,
    criteria.informed,
    criteria.unambiguous,
    criteria.clearAffirmativeAction,
    criteria.withdrawalAvailable
  ].filter(Boolean).length;
  
  criteria.complianceScore = Math.round((metCriteria / criteriaCount) * 100);
  
  return this.save();
};

// Instance method: Renew consent
CookieConsentSchema.methods.renewConsent = function(reason) {
  this.renewals.push({
    renewedAt: new Date(),
    previousConsentId: this.consentId,
    reason
  });
  
  this.validity.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // +1 year
  this.validity.lastValidated = new Date();
  this.status = 'active';
  
  return this.save();
};

// Static: Find expiring consents
CookieConsentSchema.statics.findExpiringConsents = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    'validity.expiresAt': { $lte: futureDate, $gte: new Date() }
  }).sort({ 'validity.expiresAt': 1 });
};

// Static: Get consent statistics
CookieConsentSchema.statics.getConsentStats = async function() {
  return await this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byMethod: [
          { $group: { _id: '$consentGiven.consentMethod', count: { $sum: 1 } } }
        ],
        byCategory: [
          { $unwind: '$categories' },
          { $group: { _id: { category: '$categories.category', consented: '$categories.consented' }, count: { $sum: 1 } } }
        ],
        withdrawn: [
          { $match: { 'withdrawal.withdrawn': true } },
          { $count: 'count' }
        ]
      }
    }
  ]);
};

// Pre-save: Set expiration date
CookieConsentSchema.pre('save', function(next) {
  if (this.isNew && !this.validity.expiresAt) {
    // Default: 12 months validity
    this.validity.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('CookieConsent', CookieConsentSchema);

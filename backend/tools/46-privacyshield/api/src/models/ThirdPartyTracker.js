const mongoose = require('mongoose');

/**
 * ThirdPartyTracker Model - Cookie & Tracker Inventory Management
 * ePrivacy Directive, GDPR Article 6, CCPA tracking disclosures
 */
const ThirdPartyTrackerSchema = new mongoose.Schema({
  // Tracker identification
  trackerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Basic information
  name: {
    type: String,
    required: true
  },
  provider: {
    name: {
      type: String,
      required: true
    },
    website: String,
    privacyPolicyUrl: String,
    country: String
  },

  // Tracker type
  type: {
    type: String,
    enum: ['cookie', 'pixel', 'web_beacon', 'local_storage', 'session_storage', 'indexed_db', 'sdk', 'api_call', 'fingerprinting'],
    required: true
  },

  category: {
    type: String,
    enum: [
      'strictly_necessary',
      'functional',
      'analytics',
      'advertising',
      'social_media',
      'personalization',
      'security',
      'performance',
      'tag_management',
      'payment',
      'communication',
      'video',
      'chat',
      'crm',
      'ab_testing',
      'heatmap',
      'surveys',
      'error_tracking',
      'cdn'
    ],
    required: true,
    index: true
  },

  // Technical details
  technical: {
    cookieName: String,
    domain: String,
    path: String,
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['session', 'minutes', 'hours', 'days', 'months', 'years', 'persistent']
      }
    },
    httpOnly: Boolean,
    secure: Boolean,
    sameSite: {
      type: String,
      enum: ['None', 'Lax', 'Strict']
    },
    size: Number,
    pattern: String // Regex pattern for matching
  },

  // Purpose and data collection
  purpose: {
    primary: {
      type: String,
      required: true
    },
    detailed: String,
    functionality: [String]
  },

  dataCollected: [{
    dataType: String,
    description: String,
    isPII: Boolean,
    sensitivity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],

  dataShared: {
    isShared: Boolean,
    recipients: [{
      name: String,
      relationship: {
        type: String,
        enum: ['parent_company', 'subsidiary', 'partner', 'service_provider', 'advertiser', 'analytics_provider', 'other']
      },
      purpose: String,
      country: String
    }],
    internationalTransfer: Boolean,
    transferMechanism: {
      type: String,
      enum: ['adequacy_decision', 'sccs', 'bcrs', 'derogation', 'not_applicable']
    }
  },

  // Consent requirements
  consent: {
    required: {
      type: Boolean,
      required: true
    },
    consentType: {
      type: String,
      enum: ['explicit', 'implied', 'not_required']
    },
    withdrawalAvailable: Boolean,
    gdprBasis: {
      type: String,
      enum: ['consent', 'legitimate_interests', 'contract', 'legal_obligation', 'vital_interests', 'public_task']
    }
  },

  // Detection and monitoring
  detection: {
    method: {
      type: String,
      enum: ['automated_scan', 'manual_entry', 'vendor_disclosure', 'third_party_service', 'tag_management'],
      required: true
    },
    firstDetected: Date,
    lastSeen: Date,
    detectionTool: String,
    scanFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on_demand']
    }
  },

  // Compliance
  compliance: {
    isCompliant: Boolean,
    frameworks: [{
      framework: {
        type: String,
        enum: ['gdpr', 'ccpa', 'ePrivacy', 'pipeda', 'lgpd']
      },
      compliant: Boolean,
      issues: [String]
    }],
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    riskFactors: [String]
  },

  // Vendor information
  vendor: {
    name: String,
    contactEmail: String,
    dpaStatus: {
      type: String,
      enum: ['signed', 'pending', 'not_required', 'missing']
    },
    dpaSignedDate: Date,
    certifications: [String],
    privacyShieldStatus: String // Historical
  },

  // Privacy policy references
  disclosures: {
    inPrivacyPolicy: Boolean,
    policySection: String,
    policyVersion: String,
    inCookiePolicy: Boolean,
    publiclyDisclosed: Boolean
  },

  // Pages where tracker is present
  presence: {
    pages: [{
      url: String,
      pageType: {
        type: String,
        enum: ['homepage', 'product', 'checkout', 'login', 'account', 'blog', 'all']
      },
      detected: Date
    }],
    domains: [String],
    isGlobal: Boolean
  },

  // Alternative options
  alternatives: [{
    name: String,
    provider: String,
    privacyFriendly: Boolean,
    reason: String
  }],

  // Blocking and opt-out
  blocking: {
    canBeBlocked: Boolean,
    blockingImpact: {
      type: String,
      enum: ['none', 'minor', 'moderate', 'severe', 'site_unusable']
    },
    optOutAvailable: Boolean,
    optOutMethod: String,
    optOutUrl: String
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'pending_review', 'pending_removal', 'approved', 'deprecated'],
    default: 'pending_review',
    index: true
  },

  // Review and approval
  review: {
    reviewedBy: String,
    reviewedAt: Date,
    approvedBy: String,
    approvedAt: Date,
    nextReviewDate: Date,
    reviewFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi_annually', 'annually']
    }
  },

  // Change tracking
  changes: [{
    date: Date,
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: String,
    reason: String
  }],

  // Notes
  tags: [String],
  notes: String,
  internalNotes: String

}, {
  timestamps: true,
  collection: 'third_party_trackers'
});

// Indexes
ThirdPartyTrackerSchema.index({ trackerId: 1 });
ThirdPartyTrackerSchema.index({ 'provider.name': 1 });
ThirdPartyTrackerSchema.index({ category: 1, status: 1 });
ThirdPartyTrackerSchema.index({ 'technical.cookieName': 1 });

// Virtual: Duration in days
ThirdPartyTrackerSchema.virtual('durationInDays').get(function() {
  if (!this.technical.duration) return null;
  
  const { value, unit } = this.technical.duration;
  
  switch(unit) {
    case 'session': return 0;
    case 'minutes': return value / (24 * 60);
    case 'hours': return value / 24;
    case 'days': return value;
    case 'months': return value * 30;
    case 'years': return value * 365;
    case 'persistent': return Infinity;
    default: return null;
  }
});

// Virtual: Requires consent (GDPR perspective)
ThirdPartyTrackerSchema.virtual('requiresConsent').get(function() {
  return this.category !== 'strictly_necessary';
});

// Instance method: Calculate risk score
ThirdPartyTrackerSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Category risk
  const categoryRisk = {
    strictly_necessary: 0,
    functional: 10,
    analytics: 20,
    advertising: 40,
    social_media: 30,
    personalization: 15,
    security: 5,
    performance: 10
  };
  score += categoryRisk[this.category] || 20;
  
  // Data collection risk
  if (this.dataCollected && this.dataCollected.length > 0) {
    score += this.dataCollected.length * 5;
    
    const hasPII = this.dataCollected.some(d => d.isPII);
    if (hasPII) score += 20;
    
    const hasHighSensitivity = this.dataCollected.some(d => d.sensitivity === 'high' || d.sensitivity === 'critical');
    if (hasHighSensitivity) score += 15;
  }
  
  // Data sharing risk
  if (this.dataShared.isShared) {
    score += 15;
    if (this.dataShared.recipients.length > 2) score += 10;
    if (this.dataShared.internationalTransfer) score += 15;
  }
  
  // Compliance issues
  if (!this.compliance.isCompliant) score += 20;
  
  // DPA status
  if (this.vendor.dpaStatus === 'missing' || this.vendor.dpaStatus === 'pending') {
    score += 15;
  }
  
  // Privacy policy disclosure
  if (!this.disclosures.inPrivacyPolicy) score += 10;
  
  // Duration risk (longer = higher risk)
  const daysInDays = this.durationInDays;
  if (daysInDays > 365) score += 10;
  
  this.compliance.riskScore = Math.min(score, 100);
  return this.compliance.riskScore;
};

// Instance method: Mark for review
ThirdPartyTrackerSchema.methods.scheduleReview = function(frequency = 'quarterly') {
  this.review.reviewFrequency = frequency;
  
  const nextDate = new Date();
  switch(frequency) {
    case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
    case 'semi_annually': nextDate.setMonth(nextDate.getMonth() + 6); break;
    case 'annually': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
  }
  
  this.review.nextReviewDate = nextDate;
  return this.save();
};

// Instance method: Log change
ThirdPartyTrackerSchema.methods.logChange = function(field, oldValue, newValue, user, reason) {
  this.changes.push({
    date: new Date(),
    field,
    oldValue,
    newValue,
    changedBy: user,
    reason
  });
  
  return this.save();
};

// Static: Find trackers by category
ThirdPartyTrackerSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static: Find high-risk trackers
ThirdPartyTrackerSchema.statics.findHighRisk = function() {
  return this.find({
    'compliance.riskScore': { $gte: 70 },
    status: { $in: ['active', 'pending_review'] }
  }).sort({ 'compliance.riskScore': -1 });
};

// Static: Find trackers requiring consent
ThirdPartyTrackerSchema.statics.findRequiringConsent = function() {
  return this.find({
    category: { $ne: 'strictly_necessary' },
    'consent.required': true,
    status: 'active'
  });
};

// Static: Find trackers needing review
ThirdPartyTrackerSchema.statics.findDueForReview = function() {
  return this.find({
    'review.nextReviewDate': { $lte: new Date() },
    status: { $in: ['active', 'approved'] }
  });
};

// Static: Get statistics
ThirdPartyTrackerSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        requireConsent: {
          $sum: { $cond: ['$consent.required', 1, 0] }
        },
        highRisk: {
          $sum: { $cond: [{ $gte: ['$compliance.riskScore', 70] }, 1, 0] }
        },
        byCategory: {
          $push: {
            category: '$category',
            count: 1
          }
        }
      }
    }
  ]);
};

// Pre-save: Calculate risk score
ThirdPartyTrackerSchema.pre('save', function(next) {
  if (this.isModified('dataCollected') || this.isModified('dataShared') || this.isNew) {
    this.calculateRiskScore();
  }
  
  next();
});

module.exports = mongoose.model('ThirdPartyTracker', ThirdPartyTrackerSchema);

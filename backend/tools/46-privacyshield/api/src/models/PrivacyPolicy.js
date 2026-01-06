const mongoose = require('mongoose');

/**
 * PrivacyPolicy Model - Multi-framework privacy policy management
 * Generates and manages privacy policies across GDPR, CCPA, PIPEDA, LGPD
 */
const PrivacyPolicySchema = new mongoose.Schema({
  // Policy identification
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Version management
  version: {
    versionNumber: {
      type: String,
      required: true
    },
    major: Number,
    minor: Number,
    patch: Number,
    status: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published', 'archived', 'deprecated'],
      default: 'draft',
      index: true
    },
    effectiveDate: Date,
    expirationDate: Date,
    publishedAt: Date,
    archivedAt: Date
  },

  // Policy metadata
  metadata: {
    title: {
      type: String,
      required: true
    },
    description: String,
    organization: {
      name: {
        type: String,
        required: true
      },
      legalName: String,
      website: String,
      contact: {
        email: String,
        phone: String,
        address: String
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    jurisdiction: [{
      type: String,
      enum: ['EU', 'EEA', 'US', 'CA', 'UK', 'BR', 'global']
    }]
  },

  // Applicable frameworks
  frameworks: [{
    framework: {
      type: String,
      enum: ['gdpr', 'ccpa', 'cpra', 'pipeda', 'lgpd', 'appi', 'pdpa_singapore', 'pdpa_thailand'],
      required: true
    },
    applicable: {
      type: Boolean,
      default: true
    },
    complianceLevel: {
      type: String,
      enum: ['full', 'partial', 'minimal', 'not_applicable']
    },
    specificRequirements: [String],
    lastAssessment: Date
  }],

  // Policy sections
  sections: [{
    sectionId: String,
    title: String,
    order: Number,
    content: String, // HTML or Markdown
    required: Boolean,
    frameworkSpecific: [String], // Which frameworks require this section
    lastUpdated: Date
  }],

  // Data practices
  dataPractices: {
    dataCollected: [{
      category: {
        type: String,
        enum: ['identifiers', 'financial', 'health', 'biometric', 'location', 'online_identifiers', 'demographic', 'behavioral']
      },
      specificTypes: [String],
      purpose: String,
      legalBasis: String,
      retention: String,
      disclosed: Boolean
    }],
    
    purposes: [{
      purpose: String,
      description: String,
      legalBasis: String,
      dataCategories: [String]
    }],
    
    thirdPartySharing: [{
      recipientName: String,
      recipientType: String,
      dataShared: [String],
      purpose: String,
      jurisdiction: String,
      safeguards: String
    }],
    
    internationalTransfers: [{
      destination: String,
      mechanism: {
        type: String,
        enum: ['adequacy_decision', 'sccs', 'bcrs', 'derogation']
      },
      safeguards: String
    }],
    
    retentionPolicies: [{
      dataCategory: String,
      retentionPeriod: String,
      justification: String,
      deletionMethod: String
    }],
    
    securityMeasures: [{
      measure: String,
      description: String,
      applicable: Boolean
    }]
  },

  // Consumer/Data Subject Rights
  rights: [{
    right: {
      type: String,
      enum: [
        'access', 'rectification', 'erasure', 'restriction', 'portability', 
        'objection', 'opt_out_sale', 'opt_out_targeting', 'withdraw_consent',
        'know', 'delete', 'non_discrimination'
      ]
    },
    framework: [String],
    description: String,
    howToExercise: String,
    responseTime: String,
    feeCharged: Boolean
  }],

  // Cookie and tracking
  cookiePolicy: {
    included: Boolean,
    categories: [{
      category: {
        type: String,
        enum: ['strictly_necessary', 'functional', 'analytics', 'marketing', 'social_media']
      },
      consentRequired: Boolean,
      description: String,
      examples: [String]
    }],
    thirdPartyCookies: [{
      name: String,
      provider: String,
      purpose: String,
      duration: String
    }],
    optOutMechanism: String
  },

  // Contact information
  contacts: {
    dataController: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    dpo: {
      name: String,
      email: String,
      phone: String,
      required: Boolean
    },
    supervisoryAuthority: {
      name: String,
      jurisdiction: String,
      website: String,
      contactInfo: String
    }
  },

  // Change log
  changeLog: [{
    version: String,
    date: Date,
    summary: String,
    detailedChanges: [String],
    reason: String,
    changedBy: String
  }],

  // Approval workflow
  approval: {
    requiredApprovers: [String],
    approvals: [{
      approver: String,
      role: String,
      approvedAt: Date,
      comments: String
    }],
    rejections: [{
      rejectedBy: String,
      rejectedAt: Date,
      reason: String
    }]
  },

  // Publication
  publication: {
    publishedUrl: String,
    formats: [{
      format: {
        type: String,
        enum: ['html', 'pdf', 'markdown', 'json']
      },
      url: String,
      generatedAt: Date
    }],
    accessibilityCompliant: Boolean,
    lastPublishedAt: Date
  },

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    acceptances: {
      type: Number,
      default: 0
    },
    rejections: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },

  // Metadata
  tags: [String],
  notes: String,
  createdBy: String,
  lastModifiedBy: String

}, {
  timestamps: true,
  collection: 'privacy_policies'
});

// Indexes
PrivacyPolicySchema.index({ 'version.status': 1, 'version.effectiveDate': 1 });
PrivacyPolicySchema.index({ 'metadata.organization.name': 1 });
PrivacyPolicySchema.index({ 'frameworks.framework': 1 });

// Virtual: Is active
PrivacyPolicySchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.version.status === 'published' &&
         (!this.version.effectiveDate || this.version.effectiveDate <= now) &&
         (!this.version.expirationDate || this.version.expirationDate > now);
});

// Virtual: Compliance coverage
PrivacyPolicySchema.virtual('complianceScore').get(function() {
  const totalFrameworks = this.frameworks.length;
  if (totalFrameworks === 0) return 0;
  
  const compliantFrameworks = this.frameworks.filter(f => 
    f.applicable && f.complianceLevel === 'full'
  ).length;
  
  return Math.round((compliantFrameworks / totalFrameworks) * 100);
});

// Instance method: Increment version
PrivacyPolicySchema.methods.incrementVersion = function(type = 'patch') {
  const [major, minor, patch] = this.version.versionNumber.split('.').map(Number);
  
  switch(type) {
    case 'major':
      this.version.versionNumber = `${major + 1}.0.0`;
      this.version.major = major + 1;
      this.version.minor = 0;
      this.version.patch = 0;
      break;
    case 'minor':
      this.version.versionNumber = `${major}.${minor + 1}.0`;
      this.version.minor = minor + 1;
      this.version.patch = 0;
      break;
    case 'patch':
      this.version.versionNumber = `${major}.${minor}.${patch + 1}`;
      this.version.patch = patch + 1;
      break;
  }
  
  this.version.status = 'draft';
  return this.save();
};

// Instance method: Publish policy
PrivacyPolicySchema.methods.publish = function(url, user) {
  this.version.status = 'published';
  this.version.publishedAt = new Date();
  this.publication.publishedUrl = url;
  this.publication.lastPublishedAt = new Date();
  this.lastModifiedBy = user;
  
  return this.save();
};

// Instance method: Add change log entry
PrivacyPolicySchema.methods.logChange = function(summary, changes, reason, user) {
  this.changeLog.push({
    version: this.version.versionNumber,
    date: new Date(),
    summary,
    detailedChanges: changes,
    reason,
    changedBy: user
  });
  
  return this.save();
};

// Static: Get active policy
PrivacyPolicySchema.statics.getActivePolicy = function(framework = null) {
  const query = { 'version.status': 'published' };
  
  if (framework) {
    query['frameworks.framework'] = framework;
    query['frameworks.applicable'] = true;
  }
  
  return this.findOne(query).sort({ 'version.effectiveDate': -1 });
};

// Static: Get policy history
PrivacyPolicySchema.statics.getPolicyHistory = function(organizationName) {
  return this.find({ 'metadata.organization.name': organizationName })
    .sort({ 'version.effectiveDate': -1 });
};

module.exports = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);

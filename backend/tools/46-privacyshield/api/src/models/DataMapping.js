const mongoose = require('mongoose');

/**
 * DataMapping Model - Data flow mapping for GDPR Article 30, CCPA disclosures
 * Maps data collection, processing, storage, transfers, and deletion
 */
const DataMappingSchema = new mongoose.Schema({
  // Mapping identification
  mappingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // System/Application being mapped
  system: {
    systemName: {
      type: String,
      required: true,
      index: true
    },
    systemType: {
      type: String,
      enum: ['web_application', 'mobile_app', 'api', 'database', 'crm', 'marketing_platform', 'analytics', 'cloud_service', 'internal_tool'],
      required: true
    },
    systemOwner: String,
    environment: {
      type: String,
      enum: ['production', 'staging', 'development', 'test']
    },
    url: String,
    description: String
  },

  // Data collection points
  dataCollection: [{
    collectionPoint: String, // Form name, API endpoint, etc.
    collectionMethod: {
      type: String,
      enum: ['form_submission', 'api_call', 'file_upload', 'cookie', 'automated_scraping', 'third_party_import', 'user_provided', 'device_collected']
    },
    dataCategories: [{
      type: String,
      enum: ['identifiers', 'financial', 'health', 'biometric', 'location', 'online_identifiers', 'demographic', 'behavioral']
    }],
    specificFields: [String], // e.g., ['email', 'name', 'phone']
    purpose: String,
    legalBasis: {
      type: String,
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
    },
    consentObtained: Boolean,
    mandatory: Boolean
  }],

  // Processing activities
  processing: [{
    activityName: String,
    activityType: {
      type: String,
      enum: ['storage', 'analysis', 'profiling', 'automated_decision', 'aggregation', 'transformation', 'enrichment', 'anonymization']
    },
    dataUsed: [String],
    purpose: String,
    legalBasis: String,
    processor: String, // Who performs processing
    location: String, // Geographic location
    securityMeasures: [String],
    automatedDecisionMaking: Boolean
  }],

  // Storage locations
  storage: [{
    storageType: {
      type: String,
      enum: ['database', 'file_system', 'cloud_storage', 'backup', 'cache', 'cdn', 'data_warehouse', 'blockchain']
    },
    storageName: String,
    provider: String, // e.g., "AWS S3", "Azure Blob"
    region: String,
    country: String,
    dataCategories: [String],
    encrypted: Boolean,
    encryptionMethod: String,
    accessControls: [String],
    retentionPeriod: String,
    backupIncluded: Boolean
  }],

  // Data transfers
  transfers: [{
    transferType: {
      type: String,
      enum: ['internal', 'third_party', 'international', 'cross_border']
    },
    recipient: String,
    recipientType: {
      type: String,
      enum: ['processor', 'controller', 'joint_controller', 'sub_processor', 'third_party']
    },
    originCountry: String,
    destinationCountry: String,
    dataCategories: [String],
    purpose: String,
    frequency: {
      type: String,
      enum: ['real_time', 'daily', 'weekly', 'monthly', 'on_demand', 'one_time']
    },
    transferMechanism: {
      type: String,
      enum: ['adequacy_decision', 'sccs', 'bcrs', 'derogation', 'none_required']
    },
    safeguards: [String],
    dpaInPlace: Boolean
  }],

  // Data subjects
  dataSubjects: [{
    category: {
      type: String,
      enum: ['customers', 'employees', 'contractors', 'suppliers', 'visitors', 'children', 'prospects', 'users']
    },
    estimatedCount: Number,
    specialCategories: Boolean, // GDPR Article 9
    childrenData: Boolean // COPPA, GDPR Art 8
  }],

  // Retention and deletion
  retention: {
    retentionPeriod: String, // e.g., "7 years", "Until account deletion"
    retentionJustification: String,
    legalRequirement: String,
    reviewFrequency: String,
    deletionProcess: {
      automatic: Boolean,
      manual: Boolean,
      method: {
        type: String,
        enum: ['hard_delete', 'soft_delete', 'anonymization', 'pseudonymization', 'secure_wipe']
      },
      verificationRequired: Boolean
    },
    exceptions: [String] // Legal holds, litigation
  },

  // Third-party integrations
  thirdParties: [{
    partyName: String,
    partyType: {
      type: String,
      enum: ['processor', 'sub_processor', 'analytics', 'advertising', 'payment', 'cloud_provider', 'api_service']
    },
    dataShared: [String],
    purpose: String,
    dpaStatus: {
      type: String,
      enum: ['signed', 'pending', 'not_required', 'missing']
    },
    privacyPolicyUrl: String,
    jurisdiction: String
  }],

  // Data subject rights support
  rightsSupport: {
    accessSupported: Boolean,
    rectificationSupported: Boolean,
    erasureSupported: Boolean,
    portabilitySupported: Boolean,
    objectionSupported: Boolean,
    restrictionSupported: Boolean,
    automatedProcess: String, // Description of automated rights fulfillment
    manualProcess: String,
    responseTime: String // e.g., "30 days"
  },

  // Risk assessment
  risk: {
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    riskFactors: [String],
    mitigations: [String],
    dpiaRequired: Boolean,
    dpiaCompleted: Boolean,
    dpiaId: String,
    lastAssessment: Date
  },

  // Compliance frameworks
  compliance: [{
    framework: {
      type: String,
      enum: ['gdpr', 'ccpa', 'pipeda', 'lgpd', 'hipaa', 'pci_dss']
    },
    applicable: Boolean,
    compliant: Boolean,
    gaps: [String],
    remediationPlan: String
  }],

  // Data flow diagram
  dataFlow: {
    diagramUrl: String, // Link to visual diagram
    flowSteps: [{
      step: Number,
      description: String,
      component: String,
      dataTransformed: Boolean,
      securityApplied: [String]
    }],
    lastUpdated: Date
  },

  // Article 30 ROPA (Record of Processing Activities)
  article30Record: {
    controllerName: String,
    controllerContact: String,
    representativeName: String,
    dpoContact: String,
    processingPurposes: [String],
    personalDataCategories: [String],
    dataSubjectCategories: [String],
    recipients: [String],
    thirdCountryTransfers: [String],
    timeLimit: String,
    technicalMeasures: [String],
    organizationalMeasures: [String],
    lastReviewed: Date
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'active', 'outdated', 'archived'],
    default: 'draft',
    index: true
  },

  // Metadata
  mappedBy: String,
  reviewedBy: String,
  approvedBy: String,
  lastReviewDate: Date,
  nextReviewDate: Date,
  version: {
    type: String,
    default: '1.0'
  },
  notes: String,
  tags: [String]

}, {
  timestamps: true,
  collection: 'data_mappings'
});

// Indexes
DataMappingSchema.index({ 'system.systemName': 1, status: 1 });
DataMappingSchema.index({ 'dataSubjects.category': 1 });
DataMappingSchema.index({ 'compliance.framework': 1, 'compliance.applicable': 1 });
DataMappingSchema.index({ nextReviewDate: 1 });

// Virtual: Is outdated
DataMappingSchema.virtual('isOutdated').get(function() {
  return this.nextReviewDate && this.nextReviewDate < new Date();
});

// Virtual: Requires DPIA
DataMappingSchema.virtual('requiresDPIA').get(function() {
  return this.risk.dpiaRequired && !this.risk.dpiaCompleted;
});

// Instance method: Calculate risk level
DataMappingSchema.methods.calculateRisk = function() {
  let riskScore = 0;
  
  // Special categories of data (+30 points)
  if (this.dataSubjects.some(ds => ds.specialCategories)) {
    riskScore += 30;
  }
  
  // Children's data (+20 points)
  if (this.dataSubjects.some(ds => ds.childrenData)) {
    riskScore += 20;
  }
  
  // International transfers without adequacy (+20 points)
  const riskyTransfers = this.transfers.filter(t => 
    t.transferType === 'international' && 
    t.transferMechanism !== 'adequacy_decision'
  );
  if (riskyTransfers.length > 0) {
    riskScore += 20;
  }
  
  // Unencrypted storage (+15 points)
  if (this.storage.some(s => !s.encrypted)) {
    riskScore += 15;
  }
  
  // Automated decision making (+15 points)
  if (this.processing.some(p => p.automatedDecisionMaking)) {
    riskScore += 15;
  }
  
  // Determine risk level
  if (riskScore >= 70) {
    this.risk.overallRisk = 'critical';
    this.risk.dpiaRequired = true;
  } else if (riskScore >= 50) {
    this.risk.overallRisk = 'high';
    this.risk.dpiaRequired = true;
  } else if (riskScore >= 30) {
    this.risk.overallRisk = 'medium';
  } else {
    this.risk.overallRisk = 'low';
  }
  
  return this.save();
};

// Instance method: Generate Article 30 record
DataMappingSchema.methods.generateArticle30 = function() {
  this.article30Record = {
    controllerName: this.system.systemOwner || 'Organization',
    processingPurposes: [...new Set(this.processing.map(p => p.purpose))],
    personalDataCategories: [...new Set(this.dataCollection.flatMap(dc => dc.dataCategories))],
    dataSubjectCategories: this.dataSubjects.map(ds => ds.category),
    recipients: [...new Set(this.thirdParties.map(tp => tp.partyName))],
    thirdCountryTransfers: [...new Set(this.transfers
      .filter(t => t.transferType === 'international')
      .map(t => t.destinationCountry))],
    timeLimit: this.retention.retentionPeriod,
    technicalMeasures: [...new Set(this.processing.flatMap(p => p.securityMeasures))],
    organizationalMeasures: ['Access controls', 'Training', 'Policies'],
    lastReviewed: new Date()
  };
  
  return this.save();
};

// Static: Find mappings requiring review
DataMappingSchema.statics.findRequiringReview = function() {
  return this.find({
    $or: [
      { nextReviewDate: { $lte: new Date() } },
      { status: 'outdated' }
    ]
  }).sort({ nextReviewDate: 1 });
};

// Static: Find high-risk mappings
DataMappingSchema.statics.findHighRisk = function() {
  return this.find({
    'risk.overallRisk': { $in: ['high', 'critical'] }
  });
};

// Static: Get compliance summary
DataMappingSchema.statics.getComplianceSummary = async function(framework) {
  const query = framework ? { 'compliance.framework': framework } : {};
  
  return await this.aggregate([
    { $match: query },
    { $unwind: '$compliance' },
    { $match: framework ? { 'compliance.framework': framework } : {} },
    {
      $group: {
        _id: '$compliance.compliant',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('DataMapping', DataMappingSchema);

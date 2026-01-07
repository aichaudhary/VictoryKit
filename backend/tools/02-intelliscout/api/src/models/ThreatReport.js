const mongoose = require('mongoose');

/**
 * ThreatReport Model
 * Stores comprehensive threat intelligence reports
 */
const ThreatReportSchema = new mongoose.Schema({
  // Report identification
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    index: true
  },

  // Report classification
  reportType: {
    type: String,
    enum: ['tactical', 'operational', 'strategic', 'technical', 'executive', 'incident', 'campaign'],
    required: true,
    index: true
  },

  category: {
    type: String,
    enum: ['malware', 'phishing', 'ransomware', 'apt', 'vulnerability', 'threat_actor', 
           'campaign', 'industry_analysis', 'trend_analysis', 'general'],
    required: true
  },

  // Executive summary
  executiveSummary: {
    type: String,
    required: true
  },

  // Key findings
  keyFindings: [{
    finding: String,
    severity: {
      type: String,
      enum: ['info', 'low', 'medium', 'high', 'critical']
    },
    priority: Number
  }],

  // Detailed analysis
  analysis: {
    overview: String,
    background: String,
    technicalDetails: String,
    impactAssessment: String,
    trendAnalysis: String,
    futureOutlook: String
  },

  // Intelligence references
  intelligence: {
    threats: [{
      intelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThreatIntelligence'
      },
      title: String,
      relevance: String
    }],
    iocs: [{
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      iocType: String,
      iocValue: String,
      context: String
    }],
    actors: [{
      actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThreatActor'
      },
      actorName: String,
      role: String
    }],
    campaigns: [{
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
      },
      campaignName: String,
      description: String
    }],
    vulnerabilities: [{
      vulnId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VulnerabilityIntel'
      },
      cveId: String,
      severity: String
    }],
    ttps: [{
      mappingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TTPMapping'
      },
      tacticId: String,
      techniqueId: String,
      description: String
    }]
  },

  // MITRE ATT&CK coverage
  mitreCoverage: {
    tactics: [{
      id: String,
      name: String,
      techniques: [{
        id: String,
        name: String
      }]
    }],
    coveragePercentage: Number
  },

  // Recommendations
  recommendations: [{
    category: {
      type: String,
      enum: ['immediate', 'short_term', 'long_term', 'strategic']
    },
    recommendation: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    effort: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],

  // Indicators summary
  indicatorsSummary: {
    totalIOCs: Number,
    iocsByType: mongoose.Schema.Types.Mixed,
    criticalIOCs: Number,
    newIOCs: Number
  },

  // Timeline
  timeline: {
    reportingPeriod: {
      startDate: Date,
      endDate: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    publishedDate: {
      type: Date,
      index: true
    },
    lastModified: Date,
    expiresAt: Date
  },

  // Audience and distribution
  audience: {
    intendedAudience: [{
      type: String,
      enum: ['technical', 'management', 'executive', 'soc', 'incident_response', 'all']
    }],
    readingLevel: {
      type: String,
      enum: ['technical', 'moderate', 'executive']
    }
  },

  distribution: {
    shared: Boolean,
    sharedWith: [String], // Organization IDs or email addresses
    sharedAt: Date,
    accessControl: {
      type: String,
      enum: ['public', 'internal', 'restricted', 'confidential'],
      default: 'internal'
    }
  },

  // Classification
  classification: {
    tlp: {
      type: String,
      enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
      default: 'TLP:AMBER'
    },
    sensitivity: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high']
    },
    handlingCaveats: [String]
  },

  // Sources and references
  sources: [{
    sourceName: String,
    sourceType: {
      type: String,
      enum: ['internal', 'osint', 'commercial', 'government', 'partner', 'research']
    },
    url: String,
    reliability: {
      type: String,
      enum: ['low', 'medium', 'high', 'verified']
    }
  }],

  references: [{
    title: String,
    author: String,
    publishDate: Date,
    url: String,
    type: String // article, whitepaper, blog, etc.
  }],

  // Geographies affected
  geographicScope: {
    global: Boolean,
    regions: [String],
    countries: [String],
    cities: [String]
  },

  // Industries affected
  industriesAffected: [{
    industry: String,
    impactLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String
  }],

  // Impact assessment
  impact: {
    overallSeverity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    scope: {
      type: String,
      enum: ['limited', 'moderate', 'significant', 'widespread', 'global']
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high', 'confirmed']
    },
    businessImpact: String,
    technicalImpact: String,
    operationalImpact: String,
    financialImpact: String
  },

  // Detection and response
  detectionResponse: {
    detectionRules: [{
      ruleType: String,
      ruleName: String,
      rule: String
    }],
    huntingQueries: [{
      platform: String,
      query: String,
      description: String
    }],
    responseActions: [{
      action: String,
      priority: String,
      timeline: String
    }]
  },

  // Export formats
  exports: {
    pdf: {
      generated: Boolean,
      url: String,
      generatedAt: Date
    },
    stix: {
      generated: Boolean,
      url: String,
      version: String,
      generatedAt: Date
    },
    taxii: {
      generated: Boolean,
      collectionId: String,
      published: Boolean,
      publishedAt: Date
    },
    misp: {
      generated: Boolean,
      eventId: String,
      published: Boolean,
      publishedAt: Date
    },
    json: {
      generated: Boolean,
      url: String,
      generatedAt: Date
    }
  },

  // Metrics
  metrics: {
    pageViews: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    feedback: [{
      rating: Number,
      comment: String,
      submittedBy: String,
      submittedAt: Date
    }],
    usefulness: {
      type: Number,
      min: 0,
      max: 5
    }
  },

  // Authors and contributors
  authors: [{
    name: String,
    email: String,
    organization: String,
    role: String
  }],

  contributors: [{
    name: String,
    contribution: String
  }],

  // Review process
  review: {
    reviewRequired: Boolean,
    reviewers: [{
      reviewer: String,
      reviewedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested']
      },
      comments: String
    }],
    approvedBy: String,
    approvedAt: Date
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'published', 'updated', 'archived'],
    default: 'draft',
    index: true
  },

  // Version control
  version: {
    type: String,
    default: '1.0'
  },

  changelog: [{
    version: String,
    changes: String,
    changedBy: String,
    changedAt: Date
  }],

  // Tags
  tags: [String],

  // Custom fields
  customFields: mongoose.Schema.Types.Mixed

}, {
  timestamps: true,
  collection: 'threatreports'
});

// Indexes
ThreatReportSchema.index({ reportId: 1 });
ThreatReportSchema.index({ reportType: 1, status: 1 });
ThreatReportSchema.index({ 'timeline.publishedDate': -1 });
ThreatReportSchema.index({ 'classification.tlp': 1 });
ThreatReportSchema.index({ tags: 1 });

// Virtual: Age in days
ThreatReportSchema.virtual('ageInDays').get(function() {
  const publishDate = this.timeline.publishedDate || this.timeline.createdAt;
  const diff = new Date() - publishDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual: Is expired
ThreatReportSchema.virtual('isExpired').get(function() {
  if (!this.timeline.expiresAt) return false;
  return this.timeline.expiresAt < new Date();
});

// Instance method: Publish report
ThreatReportSchema.methods.publish = function(publishedBy) {
  this.status = 'published';
  this.timeline.publishedDate = new Date();
  
  this.changelog.push({
    version: this.version,
    changes: 'Report published',
    changedBy: publishedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

// Instance method: Update version
ThreatReportSchema.methods.updateVersion = function(changes, changedBy) {
  const [major, minor] = this.version.split('.');
  this.version = `${major}.${parseInt(minor) + 1}`;
  this.timeline.lastModified = new Date();
  this.status = 'updated';
  
  this.changelog.push({
    version: this.version,
    changes,
    changedBy,
    changedAt: new Date()
  });
  
  return this.save();
};

// Instance method: Generate IOCs summary
ThreatReportSchema.methods.generateIOCsSummary = function() {
  const iocs = this.intelligence.iocs || [];
  const summary = {
    totalIOCs: iocs.length,
    iocsByType: {},
    criticalIOCs: 0,
    newIOCs: 0
  };
  
  iocs.forEach(ioc => {
    summary.iocsByType[ioc.iocType] = (summary.iocsByType[ioc.iocType] || 0) + 1;
  });
  
  this.indicatorsSummary = summary;
  return this;
};

// Instance method: Export to STIX
ThreatReportSchema.methods.exportToSTIX = async function() {
  // This would integrate with STIX library
  this.exports.stix.generated = true;
  this.exports.stix.version = '2.1';
  this.exports.stix.generatedAt = new Date();
  
  return this.save();
};

// Instance method: Track view
ThreatReportSchema.methods.trackView = function() {
  this.metrics.pageViews += 1;
  return this.save();
};

// Instance method: Track download
ThreatReportSchema.methods.trackDownload = function() {
  this.metrics.downloads += 1;
  return this.save();
};

// Static: Find published reports
ThreatReportSchema.statics.findPublished = function(reportType = null) {
  const query = { status: 'published' };
  if (reportType) query.reportType = reportType;
  
  return this.find(query).sort({ 'timeline.publishedDate': -1 });
};

// Static: Find by TLP level
ThreatReportSchema.statics.findByTLP = function(tlpLevel) {
  return this.find({
    'classification.tlp': tlpLevel,
    status: 'published'
  }).sort({ 'timeline.publishedDate': -1 });
};

// Static: Find recent reports
ThreatReportSchema.statics.findRecent = function(days = 30, limit = 10) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    'timeline.publishedDate': { $gte: cutoffDate },
    status: 'published'
  })
  .sort({ 'timeline.publishedDate': -1 })
  .limit(limit);
};

// Static: Get statistics
ThreatReportSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draft: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalViews: { $sum: '$metrics.pageViews' },
        totalDownloads: { $sum: '$metrics.downloads' },
        byType: {
          $push: {
            type: '$reportType',
            status: '$status'
          }
        }
      }
    }
  ]);
};

// Pre-save: Generate IOCs summary
ThreatReportSchema.pre('save', function(next) {
  if (this.isModified('intelligence.iocs')) {
    this.generateIOCsSummary();
  }
  next();
});

module.exports = mongoose.model('ThreatReport', ThreatReportSchema);

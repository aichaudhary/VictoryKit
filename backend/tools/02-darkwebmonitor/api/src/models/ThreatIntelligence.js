const mongoose = require('mongoose');

/**
 * ThreatIntelligence Model - Core threat intelligence records
 * Aggregates threat data from multiple sources
 */
const ThreatIntelligenceSchema = new mongoose.Schema({
  // Intelligence identification
  intelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Intelligence metadata
  metadata: {
    title: {
      type: String,
      required: true
    },
    description: String,
    intelType: {
      type: String,
      enum: [
        'malware',
        'phishing',
        'ransomware',
        'apt',
        'vulnerability',
        'data_breach',
        'botnet',
        'ddos',
        'insider_threat',
        'supply_chain',
        'zero_day',
        'threat_actor',
        'campaign'
      ],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      index: true
    },
    confidence: {
      type: String,
      enum: ['unconfirmed', 'low', 'medium', 'high', 'confirmed'],
      default: 'medium',
      index: true
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Sources
  sources: [{
    sourceName: String,
    sourceType: {
      type: String,
      enum: ['osint', 'commercial', 'government', 'community', 'internal', 'partner']
    },
    sourceUrl: String,
    collectedAt: Date,
    reliability: {
      type: String,
      enum: ['unknown', 'low', 'medium', 'high', 'verified']
    }
  }],

  // TLP (Traffic Light Protocol) classification
  tlp: {
    level: {
      type: String,
      enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
      default: 'TLP:AMBER',
      index: true
    },
    color: String,
    sharingGuidance: String
  },

  // IOCs (Indicators of Compromise) reference
  iocs: [{
    iocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IOC'
    },
    iocType: String,
    iocValue: String,
    context: String
  }],

  // Threat actor reference
  threatActors: [{
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatActor'
    },
    actorName: String,
    confidence: String
  }],

  // Campaign reference
  campaigns: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    campaignName: String
  }],

  // MITRE ATT&CK mapping
  mitreAttack: {
    tactics: [{
      id: String, // e.g., TA0001
      name: String // e.g., Initial Access
    }],
    techniques: [{
      id: String, // e.g., T1566.001
      name: String, // e.g., Spearphishing Attachment
      subTechnique: String
    }]
  },

  // Targeted entities
  targets: {
    industries: [String], // e.g., finance, healthcare, government
    countries: [String],
    organizations: [String],
    technologies: [String] // e.g., Windows, Apache, WordPress
  },

  // Vulnerability information (if applicable)
  vulnerabilities: [{
    cve: String,
    cvss: Number,
    exploitAvailable: Boolean,
    patchAvailable: Boolean
  }],

  // Timeline
  timeline: {
    firstSeen: {
      type: Date,
      index: true
    },
    lastSeen: Date,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  },

  // Impact assessment
  impact: {
    scope: {
      type: String,
      enum: ['limited', 'moderate', 'significant', 'widespread', 'global']
    },
    potentialDamage: {
      financial: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe']
      },
      reputational: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe']
      },
      operational: {
        type: String,
        enum: ['low', 'medium', 'high', 'severe']
      }
    },
    affectedSystems: Number
  },

  // Remediation and mitigation
  remediation: {
    recommendations: [String],
    mitigations: [String],
    detectionRules: [{
      ruleType: String, // e.g., YARA, Snort, Sigma
      rule: String
    }]
  },

  // Enrichment data
  enrichment: {
    enriched: Boolean,
    enrichedAt: Date,
    enrichmentSources: [String],
    additionalContext: mongoose.Schema.Types.Mixed
  },

  // Analysis
  analysis: {
    analystNotes: String,
    analyzedBy: String,
    analyzedAt: Date,
    keyFindings: [String],
    relatedThreats: [String]
  },

  // Sharing and distribution
  sharing: {
    shared: Boolean,
    sharedWith: [String], // Organization IDs or names
    sharedAt: Date,
    exportFormats: [String] // STIX, TAXII, OpenIOC, MISP
  },

  // Status
  status: {
    type: String,
    enum: ['new', 'analyzing', 'validated', 'published', 'expired', 'archived'],
    default: 'new',
    index: true
  },

  // Tags and categorization
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,

  // Audit trail
  auditTrail: [{
    action: String,
    performedBy: String,
    performedAt: Date,
    details: String
  }]

}, {
  timestamps: true,
  collection: 'threat_intelligence'
});

// Indexes
ThreatIntelligenceSchema.index({ intelId: 1 });
ThreatIntelligenceSchema.index({ 'metadata.intelType': 1, 'metadata.severity': 1 });
ThreatIntelligenceSchema.index({ 'tlp.level': 1 });
ThreatIntelligenceSchema.index({ status: 1, 'timeline.reportedAt': -1 });
ThreatIntelligenceSchema.index({ tags: 1 });

// Virtual: Is active
ThreatIntelligenceSchema.virtual('isActive').get(function() {
  if (!this.timeline.expiresAt) return true;
  return this.timeline.expiresAt > new Date();
});

// Virtual: Age in days
ThreatIntelligenceSchema.virtual('ageInDays').get(function() {
  const diff = new Date() - this.timeline.reportedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Instance method: Calculate threat score
ThreatIntelligenceSchema.methods.calculateThreatScore = function() {
  let score = 0;
  
  // Severity weight (0-40 points)
  const severityScores = { low: 10, medium: 20, high: 30, critical: 40 };
  score += severityScores[this.metadata.severity] || 0;
  
  // Confidence weight (0-30 points)
  const confidenceScores = { unconfirmed: 5, low: 10, medium: 15, high: 25, confirmed: 30 };
  score += confidenceScores[this.metadata.confidence] || 0;
  
  // Source reliability (0-15 points)
  const highReliabilitySources = this.sources.filter(s => s.reliability === 'verified' || s.reliability === 'high').length;
  score += Math.min(highReliabilitySources * 5, 15);
  
  // Impact scope (0-15 points)
  const scopeScores = { limited: 3, moderate: 6, significant: 10, widespread: 12, global: 15 };
  score += scopeScores[this.impact?.scope] || 0;
  
  return Math.min(score, 100);
};

// Instance method: Enrich intelligence
ThreatIntelligenceSchema.methods.enrich = async function(enrichmentData) {
  this.enrichment.enriched = true;
  this.enrichment.enrichedAt = new Date();
  this.enrichment.additionalContext = enrichmentData;
  
  return this.save();
};

// Instance method: Add IOC reference
ThreatIntelligenceSchema.methods.addIOC = function(iocId, iocType, iocValue, context) {
  this.iocs.push({
    iocId,
    iocType,
    iocValue,
    context
  });
  
  return this.save();
};

// Instance method: Publish intelligence
ThreatIntelligenceSchema.methods.publish = function(user) {
  this.status = 'published';
  this.auditTrail.push({
    action: 'published',
    performedBy: user,
    performedAt: new Date(),
    details: 'Intelligence published'
  });
  
  return this.save();
};

// Static: Find active high-severity threats
ThreatIntelligenceSchema.statics.findActiveCriticalThreats = function() {
  return this.find({
    'metadata.severity': { $in: ['high', 'critical'] },
    status: { $in: ['validated', 'published'] },
    $or: [
      { 'timeline.expiresAt': { $exists: false } },
      { 'timeline.expiresAt': { $gt: new Date() } }
    ]
  }).sort({ 'timeline.reportedAt': -1 });
};

// Static: Find by threat type
ThreatIntelligenceSchema.statics.findByType = function(intelType) {
  return this.find({
    'metadata.intelType': intelType,
    status: { $in: ['validated', 'published'] }
  }).sort({ 'timeline.reportedAt': -1 });
};

// Static: Get threat statistics
ThreatIntelligenceSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: {
          $sum: { $cond: [{ $eq: ['$metadata.severity', 'critical'] }, 1, 0] }
        },
        high: {
          $sum: { $cond: [{ $eq: ['$metadata.severity', 'high'] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$metadata.intelType',
            severity: '$metadata.severity'
          }
        }
      }
    }
  ]);
};

// Pre-save: Calculate confidence score
ThreatIntelligenceSchema.pre('save', function(next) {
  // Map confidence level to score
  const confidenceMap = {
    unconfirmed: 10,
    low: 30,
    medium: 60,
    high: 85,
    confirmed: 100
  };
  
  this.metadata.confidenceScore = confidenceMap[this.metadata.confidence] || 60;
  
  next();
});

module.exports = mongoose.model('ThreatIntelligence', ThreatIntelligenceSchema);

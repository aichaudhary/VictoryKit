const mongoose = require('mongoose');

/**
 * IOC (Indicator of Compromise) Model
 * Stores and manages threat indicators
 */
const IOCSchema = new mongoose.Schema({
  // IOC identification
  iocId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // IOC details
  iocType: {
    type: String,
    enum: [
      'ip',
      'domain',
      'url',
      'email',
      'file_hash',
      'filename',
      'registry_key',
      'mutex',
      'user_agent',
      'certificate',
      'asn',
      'cve',
      'cryptocurrency_address'
    ],
    required: true,
    index: true
  },

  iocValue: {
    type: String,
    required: true,
    index: true
  },

  // Hash details (for file_hash type)
  hashDetails: {
    md5: String,
    sha1: String,
    sha256: String,
    ssdeep: String
  },

  // Categorization
  category: {
    type: String,
    enum: ['network', 'file', 'host', 'vulnerability', 'blockchain'],
    required: true
  },

  subType: String, // e.g., phishing, malware, c2, exploit

  // Threat classification
  threat: {
    type: {
      type: String,
      enum: ['malware', 'phishing', 'ransomware', 'botnet', 'c2', 'exploit', 'scanner', 'spam'],
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
      enum: ['low', 'medium', 'high', 'confirmed'],
      default: 'medium'
    }
  },

  // Context and description
  context: {
    description: String,
    behavior: String,
    campaign: String,
    threatActor: String,
    malwareFamily: String
  },

  // Detection information
  detection: {
    firstSeen: {
      type: Date,
      required: true,
      index: true
    },
    lastSeen: {
      type: Date,
      index: true
    },
    detectionCount: {
      type: Number,
      default: 1
    },
    sources: [{
      name: String,
      url: String,
      detectedAt: Date,
      reliability: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified']
      }
    }]
  },

  // Enrichment data
  enrichment: {
    virusTotalScore: {
      positives: Number,
      total: Number,
      scanDate: Date
    },
    geoLocation: {
      country: String,
      countryCode: String,
      city: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      asn: String,
      asnOrg: String
    },
    whois: {
      registrar: String,
      registrationDate: Date,
      expirationDate: Date,
      registrantName: String,
      registrantEmail: String
    },
    reputation: {
      score: Number, // 0-100 (0=malicious, 100=benign)
      verdict: {
        type: String,
        enum: ['malicious', 'suspicious', 'neutral', 'benign']
      },
      abuseReports: Number
    },
    dnsRecords: [{
      type: String, // A, AAAA, MX, TXT, etc.
      value: String,
      timestamp: Date
    }],
    sslCertificate: {
      subject: String,
      issuer: String,
      validFrom: Date,
      validTo: Date,
      fingerprint: String
    },
    openPorts: [{
      port: Number,
      protocol: String,
      service: String,
      version: String
    }]
  },

  // Relationship to threat intelligence
  relatedIntel: [{
    intelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreatIntelligence'
    },
    relationship: {
      type: String,
      enum: ['associated_with', 'communicates_with', 'drops', 'downloads', 'exploits']
    }
  }],

  // MITRE ATT&CK techniques
  mitreTechniques: [{
    id: String,
    name: String
  }],

  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'expired', 'false_positive', 'whitelisted', 'pending_review'],
    default: 'active',
    index: true
  },

  expiresAt: Date,

  // Actions and recommendations
  recommendations: {
    action: {
      type: String,
      enum: ['block', 'alert', 'monitor', 'investigate', 'none']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    automatedResponse: Boolean,
    blocklistAdded: Boolean,
    blocklistAddedAt: Date
  },

  // Detection rules
  detectionRules: [{
    ruleType: {
      type: String,
      enum: ['yara', 'snort', 'sigma', 'suricata', 'custom']
    },
    ruleName: String,
    ruleContent: String,
    createdAt: Date
  }],

  // False positive tracking
  falsePositive: {
    isFalsePositive: Boolean,
    reportedBy: String,
    reportedAt: Date,
    reason: String,
    verified: Boolean
  },

  // Sharing
  tlp: {
    type: String,
    enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
    default: 'TLP:GREEN'
  },

  shared: {
    shared: Boolean,
    sharedWith: [String],
    sharedAt: Date
  },

  // Tags
  tags: [String],

  // Analyst notes
  notes: [{
    author: String,
    content: String,
    createdAt: Date
  }],

  // Audit trail
  auditTrail: [{
    action: String,
    performedBy: String,
    performedAt: Date,
    details: String
  }]

}, {
  timestamps: true,
  collection: 'iocs'
});

// Indexes
IOCSchema.index({ iocId: 1 });
IOCSchema.index({ iocType: 1, iocValue: 1 });
IOCSchema.index({ 'threat.type': 1, 'threat.severity': 1 });
IOCSchema.index({ status: 1, 'detection.firstSeen': -1 });
IOCSchema.index({ tags: 1 });

// Virtual: Age in days
IOCSchema.virtual('ageInDays').get(function() {
  const diff = new Date() - this.detection.firstSeen;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual: Is expired
IOCSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Instance method: Mark as false positive
IOCSchema.methods.markFalsePositive = function(user, reason) {
  this.falsePositive.isFalsePositive = true;
  this.falsePositive.reportedBy = user;
  this.falsePositive.reportedAt = new Date();
  this.falsePositive.reason = reason;
  this.status = 'false_positive';
  
  this.auditTrail.push({
    action: 'marked_false_positive',
    performedBy: user,
    performedAt: new Date(),
    details: reason
  });
  
  return this.save();
};

// Instance method: Add to blocklist
IOCSchema.methods.addToBlocklist = function(user) {
  this.recommendations.blocklistAdded = true;
  this.recommendations.blocklistAddedAt = new Date();
  
  this.auditTrail.push({
    action: 'added_to_blocklist',
    performedBy: user,
    performedAt: new Date(),
    details: 'IOC added to blocklist'
  });
  
  return this.save();
};

// Instance method: Update last seen
IOCSchema.methods.updateLastSeen = function() {
  this.detection.lastSeen = new Date();
  this.detection.detectionCount += 1;
  
  return this.save();
};

// Instance method: Enrich IOC
IOCSchema.methods.enrich = function(enrichmentData) {
  Object.assign(this.enrichment, enrichmentData);
  
  // Update reputation verdict based on enrichment
  if (enrichmentData.reputation) {
    const score = enrichmentData.reputation.score;
    if (score < 25) this.enrichment.reputation.verdict = 'malicious';
    else if (score < 50) this.enrichment.reputation.verdict = 'suspicious';
    else if (score < 75) this.enrichment.reputation.verdict = 'neutral';
    else this.enrichment.reputation.verdict = 'benign';
  }
  
  return this.save();
};

// Static: Find active high-severity IOCs
IOCSchema.statics.findActiveHighSeverity = function() {
  return this.find({
    'threat.severity': { $in: ['high', 'critical'] },
    status: 'active',
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ 'detection.firstSeen': -1 });
};

// Static: Find by type
IOCSchema.statics.findByType = function(iocType, status = 'active') {
  return this.find({
    iocType,
    status
  }).sort({ 'detection.lastSeen': -1 });
};

// Static: Find malicious IPs
IOCSchema.statics.findMaliciousIPs = function() {
  return this.find({
    iocType: 'ip',
    'threat.type': { $in: ['malware', 'botnet', 'c2', 'scanner'] },
    status: 'active'
  });
};

// Static: Get IOC statistics
IOCSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        critical: {
          $sum: { $cond: [{ $eq: ['$threat.severity', 'critical'] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$iocType',
            severity: '$threat.severity'
          }
        }
      }
    }
  ]);
};

// Pre-save: Set expiration if not set
IOCSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Default expiration: 90 days for active IOCs
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    this.expiresAt = new Date(Date.now() + ninetyDays);
  }
  
  // Auto-update status if expired
  if (this.expiresAt && this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

module.exports = mongoose.model('IOC', IOCSchema);

const mongoose = require('mongoose');

/**
 * Campaign Model
 * Stores coordinated attack campaigns and threat operations
 */
const CampaignSchema = new mongoose.Schema({
  // Campaign identification
  campaignId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    index: true
  },

  aliases: [String],

  // Campaign classification
  campaignType: {
    type: String,
    enum: ['apt', 'ransomware', 'phishing', 'ddos', 'botnet', 'supply_chain', 'watering_hole', 
           'credential_harvesting', 'data_breach', 'cyber_espionage', 'disinformation', 'unknown'],
    required: true,
    index: true
  },

  // Description
  description: String,
  summary: String,

  // Attribution
  attribution: {
    threatActors: [{
      actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThreatActor'
      },
      actorName: String,
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high', 'confirmed'],
        default: 'medium'
      }
    }],
    attributionBasis: String,
    overallConfidence: String
  },

  // Timeline
  timeline: {
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: Date,
    ongoing: {
      type: Boolean,
      default: true
    },
    peakActivity: [{
      startDate: Date,
      endDate: Date,
      description: String
    }],
    majorMilestones: [{
      date: Date,
      event: String,
      significance: String
    }]
  },

  // Targets
  targets: {
    industries: [String],
    countries: [String],
    organizations: [{
      name: String,
      industry: String,
      country: String,
      compromisedAt: Date
    }],
    technologies: [String],
    victimCount: {
      estimated: Number,
      confirmed: Number
    },
    geographicDistribution: [{
      country: String,
      victimCount: Number,
      percentage: Number
    }]
  },

  // Tactics, Techniques, and Procedures
  ttps: {
    initialAccess: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    execution: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    persistence: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    privilegeEscalation: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    defenseEvasion: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    credentialAccess: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    discovery: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    lateralMovement: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    collection: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    exfiltration: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    commandAndControl: [{
      technique: String,
      mitreId: String,
      description: String
    }],
    impact: [{
      technique: String,
      mitreId: String,
      description: String
    }]
  },

  // Associated IOCs
  iocs: {
    ips: [{
      value: String,
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      role: String, // c2, phishing, malware_host, etc.
      firstSeen: Date,
      lastSeen: Date
    }],
    domains: [{
      value: String,
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      role: String,
      firstSeen: Date,
      lastSeen: Date
    }],
    urls: [{
      value: String,
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      role: String,
      firstSeen: Date,
      lastSeen: Date
    }],
    fileHashes: [{
      value: String,
      hashType: String,
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      role: String,
      firstSeen: Date,
      lastSeen: Date
    }],
    emails: [{
      value: String,
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      role: String,
      firstSeen: Date,
      lastSeen: Date
    }]
  },

  // Malware and tools
  malware: {
    families: [{
      name: String,
      variant: String,
      role: {
        type: String,
        enum: ['dropper', 'loader', 'backdoor', 'ransomware', 'stealer', 'rat', 'rootkit', 'worm', 'trojan']
      },
      firstSeen: Date
    }],
    customTools: [{
      name: String,
      description: String,
      purpose: String
    }]
  },

  // Infrastructure
  infrastructure: {
    c2Servers: [{
      ip: String,
      domain: String,
      protocol: String,
      port: Number,
      firstSeen: Date,
      lastSeen: Date,
      active: Boolean
    }],
    phishingInfrastructure: [{
      domain: String,
      registrar: String,
      registrationDate: Date,
      targetBrand: String
    }],
    hostingProviders: [String],
    registrars: [String]
  },

  // Exploits and vulnerabilities
  exploits: [{
    cve: String,
    vulnerability: String,
    exploitType: String,
    targetedSystems: [String],
    exploitedAt: Date
  }],

  // Impact assessment
  impact: {
    scope: {
      type: String,
      enum: ['limited', 'moderate', 'significant', 'widespread', 'global'],
      default: 'moderate'
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    damages: {
      financial: {
        estimated: Number,
        currency: String,
        impact: String
      },
      operational: {
        downtime: String,
        systemsAffected: Number,
        impact: String
      },
      reputational: {
        mediaAttention: String,
        impact: String
      }
    },
    dataCompromised: {
      types: [String], // PII, credentials, financial, intellectual_property, etc.
      recordCount: Number,
      estimated: Boolean
    }
  },

  // Detection and response
  detection: {
    detectionDifficulty: {
      type: String,
      enum: ['trivial', 'easy', 'moderate', 'difficult', 'very_difficult']
    },
    signatures: [{
      ruleType: String,
      ruleName: String,
      rule: String,
      effectiveness: String
    }],
    huntingQueries: [{
      queryType: String,
      query: String,
      description: String
    }],
    behavioralIndicators: [String]
  },

  // Countermeasures
  countermeasures: {
    mitigations: [{
      mitigation: String,
      effectiveness: String,
      implementation: String
    }],
    recommendations: [String],
    defensiveActions: [{
      action: String,
      priority: String,
      timeline: String
    }]
  },

  // Intelligence sources
  sources: [{
    name: String,
    url: String,
    reportDate: Date,
    reliability: {
      type: String,
      enum: ['low', 'medium', 'high', 'verified']
    }
  }],

  // Analysis
  analysis: {
    overview: String,
    keyFindings: [String],
    evolutionNotes: String,
    relatedCampaigns: [{
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
      },
      campaignName: String,
      relationship: String,
      confidence: String
    }],
    analystNotes: [{
      analyst: String,
      note: String,
      createdAt: Date
    }]
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'dormant', 'concluded', 'monitoring', 'investigating'],
    default: 'active',
    index: true
  },

  // Sharing
  tlp: {
    type: String,
    enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
    default: 'TLP:AMBER'
  },

  // Tags
  tags: [String],

  // Custom fields
  customFields: mongoose.Schema.Types.Mixed

}, {
  timestamps: true,
  collection: 'campaigns'
});

// Indexes
CampaignSchema.index({ campaignId: 1 });
CampaignSchema.index({ name: 1 });
CampaignSchema.index({ campaignType: 1, status: 1 });
CampaignSchema.index({ 'timeline.startDate': -1 });
CampaignSchema.index({ tags: 1 });

// Virtual: Duration in days
CampaignSchema.virtual('durationInDays').get(function() {
  const start = this.timeline.startDate;
  const end = this.timeline.endDate || new Date();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
});

// Instance method: Add IOC
CampaignSchema.methods.addIOC = function(iocType, iocValue, iocId, role) {
  const iocEntry = {
    value: iocValue,
    iocId,
    role,
    firstSeen: new Date()
  };
  
  switch(iocType) {
    case 'ip':
      this.iocs.ips.push(iocEntry);
      break;
    case 'domain':
      this.iocs.domains.push(iocEntry);
      break;
    case 'url':
      this.iocs.urls.push(iocEntry);
      break;
    case 'file_hash':
      this.iocs.fileHashes.push(iocEntry);
      break;
    case 'email':
      this.iocs.emails.push(iocEntry);
      break;
  }
  
  return this.save();
};

// Instance method: Update status
CampaignSchema.methods.updateStatus = function(status, note) {
  this.status = status;
  
  if (status === 'concluded' && !this.timeline.endDate) {
    this.timeline.endDate = new Date();
    this.timeline.ongoing = false;
  }
  
  if (note) {
    this.analysis.analystNotes.push({
      analyst: 'system',
      note,
      createdAt: new Date()
    });
  }
  
  return this.save();
};

// Static: Find active campaigns
CampaignSchema.statics.findActiveCampaigns = function() {
  return this.find({
    status: 'active',
    'timeline.ongoing': true
  }).sort({ 'timeline.startDate': -1 });
};

// Static: Find by type
CampaignSchema.statics.findByType = function(campaignType) {
  return this.find({
    campaignType
  }).sort({ 'timeline.startDate': -1 });
};

// Static: Find by threat actor
CampaignSchema.statics.findByThreatActor = function(actorId) {
  return this.find({
    'attribution.threatActors.actorId': actorId
  });
};

// Static: Get statistics
CampaignSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        byType: {
          $push: {
            type: '$campaignType',
            status: '$status'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Campaign', CampaignSchema);

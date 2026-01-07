const mongoose = require('mongoose');

/**
 * ThreatActor Model
 * Stores profiles of threat actors, APT groups, and cybercrime organizations
 */
const ThreatActorSchema = new mongoose.Schema({
  // Actor identification
  actorId: {
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

  // Classification
  category: {
    type: String,
    enum: ['nation_state', 'cybercrime', 'hacktivist', 'insider_threat', 'script_kiddie', 'unknown'],
    required: true,
    index: true
  },

  sophisticationLevel: {
    type: String,
    enum: ['novice', 'intermediate', 'advanced', 'expert', 'strategic'],
    default: 'intermediate'
  },

  // Attribution
  attribution: {
    country: String,
    countryCode: String,
    region: String,
    sponsorship: {
      type: String,
      enum: ['state_sponsored', 'independent', 'criminal_organization', 'unknown']
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high', 'confirmed'],
      default: 'medium'
    },
    attributionBasis: String
  },

  // Motivation
  motivations: [{
    type: String,
    enum: [
      'financial_gain',
      'espionage',
      'sabotage',
      'political_activism',
      'revenge',
      'notoriety',
      'cyber_warfare',
      'data_theft',
      'intellectual_property_theft',
      'unknown'
    ]
  }],

  primaryMotivation: String,

  // Target profile
  targets: {
    industries: [String],
    countries: [String],
    organizations: [String],
    technologies: [String],
    targetTypes: [{
      type: String,
      enum: ['government', 'military', 'critical_infrastructure', 'financial', 'healthcare', 
             'technology', 'education', 'retail', 'energy', 'telecommunications', 'media']
    }]
  },

  // Tactics, Techniques, and Procedures (TTPs)
  ttps: {
    preferredTactics: [String], // MITRE ATT&CK tactics
    preferredTechniques: [{
      id: String,
      name: String,
      frequency: {
        type: String,
        enum: ['rarely', 'sometimes', 'often', 'always']
      }
    }],
    attackVectors: [String], // phishing, exploit, supply_chain, etc.
    persistence: [String],
    defenseEvasion: [String],
    lateralMovement: [String]
  },

  // Tools and infrastructure
  tools: {
    malwareFamilies: [String],
    customTools: [{
      name: String,
      description: String,
      firstSeen: Date
    }],
    exploits: [String],
    infrastructure: {
      c2Domains: [String],
      c2IPs: [String],
      hostingProviders: [String],
      vpnServices: [String]
    }
  },

  // Associated campaigns
  campaigns: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    campaignName: String,
    startDate: Date,
    endDate: Date,
    confidence: String
  }],

  // Activity timeline
  timeline: {
    firstSeen: {
      type: Date,
      required: true,
      index: true
    },
    lastSeen: Date,
    active: {
      type: Boolean,
      default: true
    },
    activityLevel: {
      type: String,
      enum: ['dormant', 'low', 'moderate', 'high', 'very_high'],
      default: 'moderate'
    },
    peakActivityPeriods: [{
      startDate: Date,
      endDate: Date,
      description: String
    }]
  },

  // Intelligence sources
  intelligence: {
    sources: [{
      name: String,
      url: String,
      reliability: {
        type: String,
        enum: ['low', 'medium', 'high', 'verified']
      },
      reportedAt: Date
    }],
    reports: [{
      title: String,
      author: String,
      publishDate: Date,
      url: String,
      summary: String
    }],
    attributionEvidence: [{
      evidenceType: {
        type: String,
        enum: ['technical', 'linguistic', 'operational', 'infrastructure', 'malware']
      },
      description: String,
      strength: {
        type: String,
        enum: ['weak', 'moderate', 'strong', 'conclusive']
      }
    }]
  },

  // Associated IOCs
  associatedIOCs: [{
    iocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IOC'
    },
    iocType: String,
    iocValue: String,
    confidence: String,
    firstSeen: Date
  }],

  // Victimology
  victimology: {
    knownVictims: [{
      name: String,
      industry: String,
      country: String,
      dateCompromised: Date,
      impact: String
    }],
    estimatedVictimCount: Number,
    geographicDistribution: [{
      country: String,
      victimCount: Number
    }]
  },

  // Capability assessment
  capabilities: {
    technicalCapability: {
      type: String,
      enum: ['low', 'medium', 'high', 'advanced', 'elite']
    },
    resources: {
      type: String,
      enum: ['limited', 'moderate', 'substantial', 'extensive']
    },
    reach: {
      type: String,
      enum: ['local', 'regional', 'national', 'international', 'global']
    },
    opsec: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', 'elite']
    }
  },

  // Analyst assessment
  analysis: {
    overview: String,
    keyFindings: [String],
    tradecraft: String,
    evolutionNotes: String,
    analystNotes: [{
      analyst: String,
      note: String,
      createdAt: Date
    }]
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
  collection: 'threatactors'
});

// Indexes
ThreatActorSchema.index({ actorId: 1 });
ThreatActorSchema.index({ name: 1 });
ThreatActorSchema.index({ category: 1, sophisticationLevel: 1 });
ThreatActorSchema.index({ 'attribution.country': 1 });
ThreatActorSchema.index({ 'timeline.active': 1 });

// Virtual: Years active
ThreatActorSchema.virtual('yearsActive').get(function() {
  const firstSeen = this.timeline.firstSeen;
  const lastSeen = this.timeline.lastSeen || new Date();
  const years = (lastSeen - firstSeen) / (1000 * 60 * 60 * 24 * 365);
  return Math.round(years * 10) / 10;
});

// Instance method: Calculate threat score
ThreatActorSchema.methods.calculateThreatScore = function() {
  let score = 0;
  
  // Sophistication (0-30)
  const sophisticationScores = {
    'novice': 5,
    'intermediate': 10,
    'advanced': 20,
    'expert': 25,
    'strategic': 30
  };
  score += sophisticationScores[this.sophisticationLevel] || 10;
  
  // Activity level (0-25)
  const activityScores = {
    'dormant': 0,
    'low': 5,
    'moderate': 10,
    'high': 20,
    'very_high': 25
  };
  score += activityScores[this.timeline.activityLevel] || 10;
  
  // Resources (0-20)
  const resourceScores = {
    'limited': 5,
    'moderate': 10,
    'substantial': 15,
    'extensive': 20
  };
  score += resourceScores[this.capabilities?.resources] || 10;
  
  // Attribution confidence (0-15)
  const confidenceScores = {
    'low': 5,
    'medium': 8,
    'high': 12,
    'confirmed': 15
  };
  score += confidenceScores[this.attribution?.confidence] || 8;
  
  // Reach (0-10)
  const reachScores = {
    'local': 2,
    'regional': 4,
    'national': 6,
    'international': 8,
    'global': 10
  };
  score += reachScores[this.capabilities?.reach] || 5;
  
  return Math.min(score, 100);
};

// Instance method: Add campaign
ThreatActorSchema.methods.addCampaign = function(campaignData) {
  this.campaigns.push({
    ...campaignData,
    confidence: campaignData.confidence || 'medium'
  });
  
  return this.save();
};

// Instance method: Update activity level
ThreatActorSchema.methods.updateActivity = function(activityLevel) {
  this.timeline.activityLevel = activityLevel;
  this.timeline.lastSeen = new Date();
  
  return this.save();
};

// Static: Find active nation-state actors
ThreatActorSchema.statics.findActiveNationState = function() {
  return this.find({
    category: 'nation_state',
    'timeline.active': true
  }).sort({ 'timeline.lastSeen': -1 });
};

// Static: Find by country
ThreatActorSchema.statics.findByCountry = function(country) {
  return this.find({
    'attribution.country': country
  });
};

// Static: Find by sophistication
ThreatActorSchema.statics.findBySophistication = function(level) {
  return this.find({
    sophisticationLevel: level,
    'timeline.active': true
  });
};

// Static: Get statistics
ThreatActorSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: ['$timeline.active', 1, 0] }
        },
        byCategory: {
          $push: {
            category: '$category',
            sophistication: '$sophisticationLevel'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('ThreatActor', ThreatActorSchema);

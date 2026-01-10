const mongoose = require('mongoose');

/**
 * TTPMapping Model
 * Maps observed activities to MITRE ATT&CK tactics, techniques, and procedures
 */
const TTPMappingSchema = new mongoose.Schema({
  // Mapping identification
  mappingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // MITRE ATT&CK tactic
  tactic: {
    id: {
      type: String,
      required: true,
      index: true // TA0001, TA0002, etc.
    },
    name: {
      type: String,
      required: true // Initial Access, Execution, etc.
    },
    description: String,
    url: String
  },

  // MITRE ATT&CK technique
  technique: {
    id: {
      type: String,
      required: true,
      index: true // T1566, T1059, etc.
    },
    name: {
      type: String,
      required: true // Phishing, Command and Scripting Interpreter, etc.
    },
    description: String,
    url: String,
    platforms: [String], // Windows, Linux, macOS, etc.
    dataSource: [String],
    defensesBypassed: [String],
    permissionsRequired: [String]
  },

  // Sub-technique (if applicable)
  subTechnique: {
    id: String, // T1566.001, T1059.001, etc.
    name: String,
    description: String,
    url: String
  },

  // Detection information
  detection: {
    detectedAt: {
      type: Date,
      required: true,
      index: true
    },
    detectedBy: String,
    detectionMethod: {
      type: String,
      enum: ['automated', 'manual', 'intelligence', 'behavioral', 'signature']
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high', 'confirmed'],
      default: 'medium'
    },
    observationCount: {
      type: Number,
      default: 1
    }
  },

  // Context
  context: {
    campaign: {
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
      },
      campaignName: String
    },
    threatActor: {
      actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThreatActor'
      },
      actorName: String
    },
    malwareFamily: String,
    targetIndustry: String,
    targetCountry: String
  },

  // Evidence
  evidence: {
    iocs: [{
      iocId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IOC'
      },
      iocType: String,
      iocValue: String,
      relevance: String
    }],
    logs: [{
      logSource: String,
      logType: String,
      timestamp: Date,
      content: String
    }],
    artifacts: [{
      artifactType: String,
      description: String,
      path: String,
      hash: String
    }],
    behavioralIndicators: [String],
    networkActivity: [{
      sourceIP: String,
      destinationIP: String,
      port: Number,
      protocol: String,
      timestamp: Date
    }]
  },

  // Detection rules
  detectionRules: [{
    ruleType: {
      type: String,
      enum: ['sigma', 'yara', 'snort', 'suricata', 'splunk', 'elastic', 'custom']
    },
    ruleName: String,
    ruleContent: String,
    effectiveness: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],

  // Mitigation
  mitigations: [{
    mitreId: String, // M1026, M1049, etc.
    name: String,
    description: String,
    implemented: Boolean,
    effectiveness: String
  }],

  // Detection coverage
  coverage: {
    dataSourcesAvailable: [String],
    dataSourcesMissing: [String],
    detectionGaps: [String],
    coverageScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Procedures (specific implementations)
  procedures: [{
    description: String,
    source: String,
    example: String,
    observedAt: Date
  }],

  // Related techniques
  relatedTechniques: [{
    techniqueId: String,
    techniqueName: String,
    relationship: {
      type: String,
      enum: ['precedes', 'follows', 'alternative', 'combines_with']
    }
  }],

  // Timeline
  timeline: {
    firstObserved: {
      type: Date,
      required: true,
      index: true
    },
    lastObserved: Date,
    frequency: {
      type: String,
      enum: ['rare', 'occasional', 'frequent', 'constant'],
      default: 'occasional'
    }
  },

  // Severity and impact
  impact: {
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    businessImpact: String,
    technicalImpact: String,
    affectedSystems: Number
  },

  // Detection difficulty
  detectionDifficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult', 'very_difficult'],
    default: 'moderate'
  },

  // Prevention difficulty
  preventionDifficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult', 'very_difficult'],
    default: 'moderate'
  },

  // Statistics
  statistics: {
    totalObservations: {
      type: Number,
      default: 0
    },
    uniqueCampaigns: {
      type: Number,
      default: 0
    },
    uniqueActors: {
      type: Number,
      default: 0
    },
    successRate: Number, // Percentage of successful attacks using this TTP
    detectionRate: Number // Percentage of times this TTP was detected
  },

  // Analysis
  analysis: {
    overview: String,
    tradecraft: String,
    trends: String,
    recommendations: [String],
    analystNotes: [{
      analyst: String,
      note: String,
      createdAt: Date
    }]
  },

  // Intelligence sources
  sources: [{
    name: String,
    url: String,
    reportedAt: Date,
    reliability: String
  }],

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'monitoring', 'archived'],
    default: 'active',
    index: true
  },

  // Sharing
  tlp: {
    type: String,
    enum: ['TLP:WHITE', 'TLP:GREEN', 'TLP:AMBER', 'TLP:RED'],
    default: 'TLP:GREEN'
  },

  // Tags
  tags: [String],

  // Custom fields
  customFields: mongoose.Schema.Types.Mixed

}, {
  timestamps: true,
  collection: 'ttpmappings'
});

// Indexes
TTPMappingSchema.index({ mappingId: 1 });
TTPMappingSchema.index({ 'tactic.id': 1 });
TTPMappingSchema.index({ 'technique.id': 1 });
TTPMappingSchema.index({ 'tactic.id': 1, 'technique.id': 1 });
TTPMappingSchema.index({ 'detection.detectedAt': -1 });
TTPMappingSchema.index({ status: 1 });

// Virtual: Days since first observed
TTPMappingSchema.virtual('daysSinceFirstObserved').get(function() {
  const diff = new Date() - this.timeline.firstObserved;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual: MITRE ATT&CK URL
TTPMappingSchema.virtual('mitreUrl').get(function() {
  if (this.subTechnique?.id) {
    return `https://attack.mitre.org/techniques/${this.technique.id}/${this.subTechnique.id.split('.')[1]}/`;
  }
  return `https://attack.mitre.org/techniques/${this.technique.id}/`;
});

// Instance method: Update observation
TTPMappingSchema.methods.recordObservation = function() {
  this.detection.observationCount += 1;
  this.statistics.totalObservations += 1;
  this.timeline.lastObserved = new Date();
  
  // Update frequency based on observation count
  const daysSinceFirst = (new Date() - this.timeline.firstObserved) / (1000 * 60 * 60 * 24);
  const observationsPerDay = this.statistics.totalObservations / daysSinceFirst;
  
  if (observationsPerDay > 5) this.timeline.frequency = 'constant';
  else if (observationsPerDay > 1) this.timeline.frequency = 'frequent';
  else if (observationsPerDay > 0.2) this.timeline.frequency = 'occasional';
  else this.timeline.frequency = 'rare';
  
  return this.save();
};

// Instance method: Add evidence
TTPMappingSchema.methods.addEvidence = function(evidenceType, evidenceData) {
  switch(evidenceType) {
    case 'ioc':
      this.evidence.iocs.push(evidenceData);
      break;
    case 'log':
      this.evidence.logs.push(evidenceData);
      break;
    case 'artifact':
      this.evidence.artifacts.push(evidenceData);
      break;
    case 'behavioral':
      this.evidence.behavioralIndicators.push(evidenceData);
      break;
    case 'network':
      this.evidence.networkActivity.push(evidenceData);
      break;
  }
  
  return this.save();
};

// Instance method: Calculate detection coverage
TTPMappingSchema.methods.calculateCoverage = function() {
  const technique = this.technique;
  const availableSources = this.coverage.dataSourcesAvailable || [];
  const requiredSources = technique.dataSource || [];
  
  if (requiredSources.length === 0) {
    this.coverage.coverageScore = 0;
    return 0;
  }
  
  const coveredSources = requiredSources.filter(src => 
    availableSources.some(avail => avail.toLowerCase().includes(src.toLowerCase()))
  );
  
  const score = Math.round((coveredSources.length / requiredSources.length) * 100);
  this.coverage.coverageScore = score;
  
  // Identify missing sources
  this.coverage.dataSourcesMissing = requiredSources.filter(src =>
    !availableSources.some(avail => avail.toLowerCase().includes(src.toLowerCase()))
  );
  
  return score;
};

// Instance method: Link to campaign
TTPMappingSchema.methods.linkToCampaign = function(campaignId, campaignName) {
  this.context.campaign = { campaignId, campaignName };
  this.statistics.uniqueCampaigns += 1;
  return this.save();
};

// Instance method: Link to threat actor
TTPMappingSchema.methods.linkToThreatActor = function(actorId, actorName) {
  this.context.threatActor = { actorId, actorName };
  this.statistics.uniqueActors += 1;
  return this.save();
};

// Static: Find by tactic
TTPMappingSchema.statics.findByTactic = function(tacticId) {
  return this.find({
    'tactic.id': tacticId,
    status: 'active'
  }).sort({ 'statistics.totalObservations': -1 });
};

// Static: Find by technique
TTPMappingSchema.statics.findByTechnique = function(techniqueId) {
  return this.find({
    'technique.id': techniqueId,
    status: 'active'
  }).sort({ 'detection.detectedAt': -1 });
};

// Static: Find most frequent TTPs
TTPMappingSchema.statics.findMostFrequent = function(limit = 10) {
  return this.find({
    status: 'active'
  })
  .sort({ 'statistics.totalObservations': -1 })
  .limit(limit);
};

// Static: Get MITRE coverage statistics
TTPMappingSchema.statics.getMITRECoverage = async function() {
  const tactics = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$tactic.id',
        tacticName: { $first: '$tactic.name' },
        techniqueCount: { $sum: 1 },
        observations: { $sum: '$statistics.totalObservations' }
      }
    },
    { $sort: { observations: -1 } }
  ]);
  
  const techniques = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$technique.id',
        techniqueName: { $first: '$technique.name' },
        tacticId: { $first: '$tactic.id' },
        observations: { $sum: '$statistics.totalObservations' }
      }
    },
    { $sort: { observations: -1 } }
  ]);
  
  return {
    tactics,
    techniques,
    totalTactics: tactics.length,
    totalTechniques: techniques.length,
    totalObservations: techniques.reduce((sum, t) => sum + t.observations, 0)
  };
};

// Static: Get statistics
TTPMappingSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalObservations: { $sum: '$statistics.totalObservations' },
        uniqueTactics: { $addToSet: '$tactic.id' },
        uniqueTechniques: { $addToSet: '$technique.id' }
      }
    },
    {
      $project: {
        total: 1,
        active: 1,
        totalObservations: 1,
        uniqueTacticsCount: { $size: '$uniqueTactics' },
        uniqueTechniquesCount: { $size: '$uniqueTechniques' }
      }
    }
  ]);
};

// Pre-save: Set MITRE URLs
TTPMappingSchema.pre('save', function(next) {
  if (!this.tactic.url && this.tactic.id) {
    this.tactic.url = `https://attack.mitre.org/tactics/${this.tactic.id}/`;
  }
  
  if (!this.technique.url && this.technique.id) {
    this.technique.url = `https://attack.mitre.org/techniques/${this.technique.id}/`;
  }
  
  if (!this.subTechnique?.url && this.subTechnique?.id) {
    const subId = this.subTechnique.id.split('.')[1];
    this.subTechnique.url = `https://attack.mitre.org/techniques/${this.technique.id}/${subId}/`;
  }
  
  next();
});

module.exports = mongoose.model('TTPMapping', TTPMappingSchema);

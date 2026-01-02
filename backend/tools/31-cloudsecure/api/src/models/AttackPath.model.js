const mongoose = require('mongoose');

const attackPathSchema = new mongoose.Schema({
  // Path identification
  pathId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Attack path details
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Risk level
  riskLevel: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low']
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Attack type
  attackType: {
    type: String,
    enum: [
      'privilege-escalation',
      'lateral-movement',
      'data-exfiltration',
      'ransomware-path',
      'cryptomining',
      'initial-access',
      'persistence',
      'credential-theft',
      'resource-hijacking'
    ]
  },
  
  // Entry point
  entryPoint: {
    resourceId: String,
    resourceName: String,
    resourceType: String,
    vulnerability: String
  },
  
  // Target (crown jewel)
  target: {
    resourceId: String,
    resourceName: String,
    resourceType: String,
    dataClassification: String,
    businessImpact: String
  },
  
  // Path steps
  steps: [{
    stepNumber: Number,
    resourceId: String,
    resourceName: String,
    resourceType: String,
    action: String,
    technique: String, // MITRE ATT&CK technique
    findingId: String,
    description: String
  }],
  
  // MITRE ATT&CK mapping
  mitreMapping: [{
    tactic: String,
    technique: String,
    techniqueId: String
  }],
  
  // Blast radius
  blastRadius: {
    resourceCount: Number,
    dataAtRisk: String,
    servicesAffected: [String],
    estimatedImpact: String
  },
  
  // Remediation
  remediationPriority: {
    type: Number,
    min: 1,
    max: 10
  },
  quickestFix: {
    stepNumber: Number,
    action: String,
    estimatedTime: String
  },
  remediationPlan: [{
    order: Number,
    action: String,
    resource: String,
    effort: String,
    impact: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'mitigated', 'accepted', 'in-progress'],
    default: 'active'
  },
  
  // Detection
  detectedAt: {
    type: Date,
    default: Date.now
  },
  lastValidatedAt: Date,
  
  // Provider
  provider: {
    type: String,
    enum: ['aws', 'azure', 'gcp', 'multi-cloud']
  },
  
  // Organization
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true,
  collection: 'attack_paths'
});

// Indexes
attackPathSchema.index({ riskLevel: 1, status: 1 });
attackPathSchema.index({ organizationId: 1, riskScore: -1 });

module.exports = mongoose.model('AttackPath', attackPathSchema);

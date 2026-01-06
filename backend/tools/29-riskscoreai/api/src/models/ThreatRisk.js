const mongoose = require('mongoose');

const threatRiskSchema = new mongoose.Schema({
  threatId: { type: String, required: true, unique: true, index: true },
  threatName: { type: String, required: true },
  
  threatType: {
    type: String,
    enum: ['malware', 'phishing', 'ransomware', 'ddos', 'data_breach', 'insider_threat', 'apt', 'zero_day', 'social_engineering', 'supply_chain', 'other'],
    required: true,
    index: true
  },
  
  riskScore: {
    current: { type: Number, required: true, min: 0, max: 100, index: true },
    initial: { type: Number, min: 0, max: 100 },
    trend: { type: String, enum: ['increasing', 'stable', 'decreasing'], default: 'stable' }
  },
  
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  
  severity: {
    rating: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    cvss_score: { type: Number, min: 0, max: 10 },
    business_impact: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'] }
  },
  
  exploitability: {
    ease: { type: String, enum: ['low', 'medium', 'high'], required: true },
    skillRequired: { type: String, enum: ['novice', 'intermediate', 'expert', 'advanced'] },
    toolsAvailable: { type: Boolean, default: false },
    exploitPubliclyAvailable: { type: Boolean, default: false },
    activelyExploited: { type: Boolean, default: false, index: true }
  },
  
  attackVector: {
    vector: { type: String, required: true },
    complexity: { type: String, enum: ['low', 'medium', 'high'] },
    privilegesRequired: { type: String, enum: ['none', 'low', 'high'] },
    userInteraction: { type: String, enum: ['none', 'required'] }
  },
  
  scope: {
    affectedAssets: [{ type: String }],
    affectedUsers: [{ type: String }],
    affectedSystems: [{ type: String }],
    geographicSpread: { type: String, enum: ['localized', 'regional', 'widespread', 'global'] }
  },
  
  mitreAttack: {
    tactics: [{ type: String }],
    techniques: [{ type: String }],
    procedures: [{ type: String }]
  },
  
  threatIntelligence: {
    sources: [{ type: String }],
    indicators: [{
      type: { type: String, enum: ['ip', 'domain', 'url', 'hash', 'email'] },
      value: { type: String },
      confidence: { type: Number, min: 0, max: 100 }
    }],
    threatActors: [{ type: String }],
    campaigns: [{ type: String }],
    malwareFamilies: [{ type: String }]
  },
  
  timeline: {
    firstDetected: { type: Date, required: true },
    lastSeen: { type: Date },
    expectedDuration: { type: String },
    isActive: { type: Boolean, default: true, index: true }
  },
  
  response: {
    containmentStatus: { type: String, enum: ['none', 'partial', 'full'], default: 'none' },
    mitigationApplied: [{ type: String }],
    remediationSteps: [{ type: String }],
    incidentCreated: { type: Boolean, default: false },
    playbookExecuted: { type: String }
  },
  
  impact: {
    confidentiality: { type: String, enum: ['none', 'low', 'high'] },
    integrity: { type: String, enum: ['none', 'low', 'high'] },
    availability: { type: String, enum: ['none', 'low', 'high'] },
    financialImpact: { type: Number }, // Estimated cost in USD
    reputationalImpact: { type: String, enum: ['none', 'low', 'medium', 'high'] }
  },
  
  riskFactors: [{
    factor: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    weight: { type: Number, min: 0, max: 1 },
    contribution: { type: Number }
  }],
  
  aiAnalysis: {
    threatClassification: { type: String },
    predictedImpact: { type: Number, min: 0, max: 100 },
    similarThreats: [{ type: String }],
    recommendedActions: [{ type: String }],
    confidence: { type: Number, min: 0, max: 100 }
  },
  
  lastCalculated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

threatRiskSchema.index({ 'riskScore.current': -1, threatType: 1 });
threatRiskSchema.index({ riskLevel: 1, 'timeline.isActive': 1 });
threatRiskSchema.index({ 'exploitability.activelyExploited': 1, 'timeline.isActive': 1 });

module.exports = mongoose.model('ThreatRisk', threatRiskSchema);

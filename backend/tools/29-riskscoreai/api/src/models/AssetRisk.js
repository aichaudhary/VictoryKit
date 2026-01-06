const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema({
  factor: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  weight: { type: Number, min: 0, max: 1 },
  contribution: { type: Number }, // How much this factor contributed to final score
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
}, { _id: false });

const assetRiskSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true, index: true },
  assetName: { type: String, required: true },
  
  assetType: {
    type: String,
    enum: ['server', 'endpoint', 'application', 'database', 'network_device', 'cloud_resource', 'iot_device', 'mobile_device'],
    required: true,
    index: true
  },
  
  riskScore: {
    current: { type: Number, required: true, min: 0, max: 100, index: true },
    previous: { type: Number, min: 0, max: 100 },
    trend: { type: String, enum: ['improving', 'stable', 'degrading'], default: 'stable' },
    percentChange: { type: Number }
  },
  
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  
  criticality: {
    businessCriticality: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    dataClassification: { type: String, enum: ['public', 'internal', 'confidential', 'restricted'], required: true },
    revenue_impact: { type: String, enum: ['none', 'low', 'medium', 'high'] },
    userBase: { type: Number }, // Number of users depending on this asset
    dependencies: [{ type: String }] // Other assets that depend on this
  },
  
  vulnerabilities: {
    total: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    cves: [{ type: String }],
    avgCvssScore: { type: Number, min: 0, max: 10 },
    patchStatus: { type: String, enum: ['up_to_date', 'pending', 'overdue'], default: 'pending' },
    lastPatched: { type: Date }
  },
  
  threats: {
    active: { type: Number, default: 0 },
    mitigated: { type: Number, default: 0 },
    types: [{ type: String }],
    lastThreatDetected: { type: Date }
  },
  
  exposure: {
    networkExposure: { type: String, enum: ['internal', 'dmz', 'internet_facing'], required: true },
    publiclyAccessible: { type: Boolean, default: false },
    exposedPorts: [{ type: Number }],
    exposedServices: [{ type: String }]
  },
  
  securityControls: {
    implemented: [{ type: String }],
    missing: [{ type: String }],
    effectiveness: { type: Number, min: 0, max: 100 }
  },
  
  compliance: {
    frameworks: [{ type: String }],
    compliant: { type: Boolean, default: false },
    violations: [{ type: String }],
    lastAudit: { type: Date }
  },
  
  riskFactors: [riskFactorSchema],
  
  aiInsights: {
    keyRiskDrivers: [{ type: String }],
    recommendations: [{ type: String }],
    predictedRisk: { type: Number, min: 0, max: 100 },
    confidenceScore: { type: Number, min: 0, max: 100 }
  },
  
  metadata: {
    owner: { type: String },
    department: { type: String, index: true },
    location: { type: String },
    environment: { type: String, enum: ['production', 'staging', 'development', 'test'] },
    tags: [{ type: String }]
  },
  
  lastCalculated: { type: Date, default: Date.now },
  nextReassessment: { type: Date }
}, {
  timestamps: true
});

assetRiskSchema.index({ 'riskScore.current': -1, assetType: 1 });
assetRiskSchema.index({ riskLevel: 1, 'metadata.department': 1 });
assetRiskSchema.index({ 'metadata.department': 1, 'riskScore.current': -1 });

assetRiskSchema.methods.updateRiskScore = async function(newScore) {
  this.riskScore.previous = this.riskScore.current;
  this.riskScore.current = newScore;
  
  // Calculate trend
  if (this.riskScore.previous) {
    const change = newScore - this.riskScore.previous;
    this.riskScore.percentChange = (change / this.riskScore.previous) * 100;
    
    if (change < -5) this.riskScore.trend = 'improving';
    else if (change > 5) this.riskScore.trend = 'degrading';
    else this.riskScore.trend = 'stable';
  }
  
  // Update risk level
  if (newScore >= 80) this.riskLevel = 'critical';
  else if (newScore >= 60) this.riskLevel = 'high';
  else if (newScore >= 40) this.riskLevel = 'medium';
  else this.riskLevel = 'low';
  
  this.lastCalculated = new Date();
  await this.save();
};

module.exports = mongoose.model('AssetRisk', assetRiskSchema);

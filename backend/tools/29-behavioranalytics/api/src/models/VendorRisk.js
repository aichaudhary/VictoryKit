const mongoose = require('mongoose');

const vendorRiskSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, unique: true, index: true },
  vendorName: { type: String, required: true, index: true },
  
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
  
  vendorProfile: {
    industry: { type: String },
    size: { type: String, enum: ['small', 'medium', 'large', 'enterprise'] },
    country: { type: String },
    yearEstablished: { type: Number },
    publiclyTraded: { type: Boolean, default: false }
  },
  
  relationship: {
    accessLevel: { type: String, enum: ['none', 'limited', 'moderate', 'extensive'], required: true },
    dataShared: [{ type: String }],
    systemsAccess: [{ type: String }],
    contractValue: { type: Number }, // Annual USD
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    dependencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    serviceType: { type: String }
  },
  
  securityPosture: {
    certifications: [{ type: String }], // ISO 27001, SOC 2, etc.
    lastSecurityAudit: { type: Date },
    nextSecurityAudit: { type: Date },
    vulnerabilityScanCompleted: { type: Boolean, default: false },
    penetrationTestCompleted: { type: Boolean, default: false },
    securityQuestionnaire: {
      completed: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100 },
      lastUpdated: { type: Date }
    }
  },
  
  incidentHistory: {
    totalBreaches: { type: Number, default: 0 },
    recentBreaches: [{
      date: { type: Date },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      description: { type: String },
      recordsCompromised: { type: Number },
      resolved: { type: Boolean, default: false }
    }],
    downtime: [{
      date: { type: Date },
      duration: { type: Number }, // Hours
      impact: { type: String }
    }],
    slaBreaches: { type: Number, default: 0 }
  },
  
  compliance: {
    required: [{ type: String }], // GDPR, HIPAA, PCI-DSS, etc.
    status: {
      gdpr: { type: Boolean },
      hipaa: { type: Boolean },
      pci_dss: { type: Boolean },
      sox: { type: Boolean },
      iso27001: { type: Boolean }
    },
    violations: [{
      framework: { type: String },
      date: { type: Date },
      resolved: { type: Boolean, default: false }
    }]
  },
  
  financialStability: {
    creditRating: { type: String },
    financialHealth: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] },
    revenueGrowth: { type: String, enum: ['declining', 'flat', 'growing', 'rapid'] },
    bankruptcy_risk: { type: Boolean, default: false }
  },
  
  reputation: {
    industryRating: { type: Number, min: 0, max: 5 },
    customerReviews: { type: Number, min: 0, max: 5 },
    securityRating: { type: Number, min: 0, max: 100 }, // Third-party security rating
    trustScore: { type: Number, min: 0, max: 100 }
  },
  
  assessmentHistory: [{
    date: { type: Date },
    score: { type: Number, min: 0, max: 100 },
    assessmentType: { type: String, enum: ['initial', 'annual_review', 'incident_triggered', 'random_audit'] },
    findings: [{ type: String }]
  }],
  
  riskFactors: [{
    factor: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    weight: { type: Number, min: 0, max: 1 },
    contribution: { type: Number },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
  }],
  
  aiInsights: {
    keyRisks: [{ type: String }],
    recommendations: [{ type: String }],
    similarVendors: [{ type: String }],
    predictedRisk: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 100 }
  },
  
  lastCalculated: { type: Date, default: Date.now },
  nextReassessment: { type: Date }
}, {
  timestamps: true
});

vendorRiskSchema.index({ 'riskScore.current': -1 });
vendorRiskSchema.index({ riskLevel: 1, 'relationship.dependencyLevel': 1 });
vendorRiskSchema.index({ vendorName: 'text' });

module.exports = mongoose.model('VendorRisk', vendorRiskSchema);

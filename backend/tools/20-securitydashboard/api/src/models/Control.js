const mongoose = require('mongoose');

/**
 * Control Model - Security controls and their implementation status
 */

const controlSchema = new mongoose.Schema({
  controlId: { type: String, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 2000 },
  
  category: {
    type: String,
    enum: ['network', 'endpoint', 'identity', 'data', 'application', 'cloud', 'compliance', 'physical', 'administrative'],
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['preventive', 'detective', 'corrective', 'deterrent', 'compensating'],
    required: true
  },
  
  framework: {
    primary: { type: String, enum: ['NIST-CSF', 'ISO27001', 'CIS', 'PCI-DSS', 'HIPAA', 'SOC2', 'COBIT', 'Custom'] },
    mappings: [{
      framework: String,
      controlId: String,
      title: String,
      category: String
    }]
  },
  
  implementation: {
    status: {
      type: String,
      enum: ['not_implemented', 'planned', 'partially_implemented', 'implemented', 'optimized'],
      default: 'not_implemented',
      index: true
    },
    level: {
      type: String,
      enum: ['manual', 'automated', 'semi_automated'],
      default: 'manual'
    },
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    startDate: Date,
    targetDate: Date,
    completedDate: Date,
    owner: { userId: String, name: String, email: String },
    responsible: { userId: String, name: String },
    approver: { userId: String, name: String }
  },
  
  effectiveness: {
    rating: {
      type: String,
      enum: ['very_effective', 'effective', 'partially_effective', 'ineffective', 'not_tested'],
      default: 'not_tested'
    },
    score: { type: Number, min: 0, max: 100, default: 0 },
    lastTested: Date,
    nextTest: Date,
    testMethod: String,
    evidence: [{ date: Date, type: String, url: String, description: String }]
  },
  
  testing: {
    frequency: { type: String, enum: ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'] },
    lastTest: { date: Date, result: String, tester: String },
    nextScheduled: Date,
    results: [{
      date: Date,
      testType: String,
      result: { type: String, enum: ['passed', 'failed', 'partial'] },
      findings: [String],
      tester: String,
      evidence: String
    }]
  },
  
  compliance: {
    required: Boolean,
    frameworks: [{ name: String, requirement: String, importance: String }],
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_applicable'],
      default: 'not_applicable'
    },
    lastAudit: Date,
    nextAudit: Date,
    auditor: String,
    findings: [String]
  },
  
  risk: {
    inherent: { level: String, score: Number },
    residual: { level: String, score: Number },
    mitigation: { level: String, percentage: Number },
    appetite: String
  },
  
  dependencies: {
    prerequisites: [{ controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' }, status: String }],
    related: [{ controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' }, relationship: String }]
  },
  
  technical: {
    technology: [String],
    tools: [{ name: String, version: String, status: String }],
    configuration: mongoose.Schema.Types.Mixed,
    automation: { enabled: Boolean, platform: String, schedule: String }
  },
  
  metrics: [{
    metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' },
    name: String,
    targetValue: Number,
    currentValue: Number,
    unit: String
  }],
  
  documentation: {
    procedure: String,
    guidelines: String,
    references: [{ title: String, url: String }],
    notes: String
  },
  
  exceptions: [{
    reason: String,
    approver: String,
    approvedDate: Date,
    expiryDate: Date,
    compensatingControls: [String],
    status: { type: String, enum: ['active', 'expired', 'revoked'] }
  }],
  
  metadata: {
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,
    createdBy: { name: String, email: String },
    lastModifiedBy: { name: String, email: String },
    version: { type: Number, default: 1 }
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  collection: 'controls'
});

// Indexes
controlSchema.index({ controlId: 1 });
controlSchema.index({ category: 1, 'implementation.status': 1 });
controlSchema.index({ 'framework.primary': 1 });
controlSchema.index({ 'compliance.status': 1 });

// Generate controlId
controlSchema.pre('save', function(next) {
  if (!this.controlId) {
    this.controlId = 'CTRL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Methods
controlSchema.methods.recordTest = function(result, tester, findings, evidence) {
  this.testing.results.push({
    date: new Date(),
    testType: 'manual',
    result: result,
    findings: findings || [],
    tester: tester,
    evidence: evidence
  });
  this.testing.lastTest = { date: new Date(), result, tester };
  this.effectiveness.lastTested = new Date();
  
  if (result === 'passed') {
    this.effectiveness.rating = 'effective';
    this.effectiveness.score = Math.min(100, this.effectiveness.score + 10);
  } else if (result === 'failed') {
    this.effectiveness.rating = 'ineffective';
    this.effectiveness.score = Math.max(0, this.effectiveness.score - 20);
  }
};

controlSchema.methods.updateImplementation = function(status, percentage) {
  this.implementation.status = status;
  this.implementation.percentage = percentage;
  if (status === 'implemented' && percentage === 100) {
    this.implementation.completedDate = new Date();
  }
};

controlSchema.statics.findByFramework = function(framework) {
  return this.find({ 'framework.primary': framework, status: 'active' }).sort({ category: 1 }).exec();
};

controlSchema.statics.findNonCompliant = function() {
  return this.find({ 'compliance.status': { $in: ['non_compliant', 'partially_compliant'] }, status: 'active' })
    .sort({ 'metadata.priority': 1 }).exec();
};

controlSchema.statics.findNotImplemented = function() {
  return this.find({ 'implementation.status': { $in: ['not_implemented', 'planned'] }, status: 'active' })
    .sort({ 'metadata.priority': 1 }).exec();
};

controlSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$implementation.status',
        count: { $sum: 1 },
        avgEffectiveness: { $avg: '$effectiveness.score' }
      }
    }
  ]);
};

module.exports = mongoose.model('Control', controlSchema);

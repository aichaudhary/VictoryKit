const mongoose = require('mongoose');

const frameworkSchema = new mongoose.Schema({
  frameworkId: { type: String, unique: true, index: true },
  name: { type: String, required: true, enum: ['NIST-CSF', 'ISO27001', 'CIS', 'PCI-DSS', 'HIPAA', 'SOC2', 'GDPR', 'FedRAMP', 'CMMC', 'COBIT'], index: true },
  displayName: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String, maxlength: 2000 },
  type: { type: String, enum: ['compliance', 'security', 'privacy', 'risk', 'governance'], required: true },
  scope: { type: String, enum: ['industry_specific', 'general', 'regulatory', 'best_practice'], default: 'general' },
  
  structure: {
    totalControls: Number,
    domains: [{ domainId: String, name: String, description: String, controlCount: Number }],
    categories: [{ categoryId: String, name: String, controlCount: Number }]
  },
  
  controls: [{
    controlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Control' },
    identifier: String,
    title: String,
    domain: String,
    priority: String,
    implementationStatus: String,
    complianceStatus: String
  }],
  
  implementation: {
    status: { type: String, enum: ['not_started', 'in_progress', 'implemented', 'certified'], default: 'not_started' },
    startDate: Date,
    targetDate: Date,
    progress: { percentage: Number, implementedControls: Number }
  },
  
  compliance: {
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_assessed'], default: 'not_assessed' },
    summary: { compliant: Number, nonCompliant: Number, partiallyCompliant: Number, notApplicable: Number },
    lastAssessment: Date,
    gaps: [{ controlId: String, title: String, severity: String }]
  },
  
  certification: {
    isCertified: Boolean,
    certificationBody: String,
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    audits: [{ type: String, auditor: String, date: Date, result: String }]
  },
  
  mappings: [{ targetFramework: String, mappingType: String, completeness: Number }],
  assessments: [{ assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }, date: Date, score: Number }],
  
  documentation: {
    standards: [{ title: String, url: String }],
    guidelines: [{ title: String, url: String }]
  },
  
  requirements: {
    mandatory: Boolean,
    regulatoryBody: String,
    complianceDeadline: Date
  },
  
  metrics: [{ metricId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoreMetric' }, name: String, currentValue: Number }],
  stakeholders: [{ name: String, role: String, email: String }],
  
  metadata: {
    issuingOrganization: String,
    publicationDate: Date,
    tags: [String],
    priority: String,
    createdBy: { name: String, email: String },
    version: { type: Number, default: 1 }
  },
  
  status: { type: String, enum: ['active', 'inactive', 'deprecated'], default: 'active', index: true }
}, {
  timestamps: true,
  collection: 'frameworks'
});

frameworkSchema.index({ frameworkId: 1 });
frameworkSchema.index({ name: 1, version: 1 });

frameworkSchema.pre('save', function(next) {
  if (!this.frameworkId) {
    this.frameworkId = 'FW-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

frameworkSchema.methods.calculateComplianceScore = function() {
  const { compliant, nonCompliant, partiallyCompliant, notApplicable } = this.compliance.summary;
  const total = compliant + nonCompliant + partiallyCompliant;
  if (total === 0) return 0;
  const score = ((compliant + (partiallyCompliant * 0.5)) / total) * 100;
  this.compliance.overallScore = Math.round(score);
  return this.compliance.overallScore;
};

frameworkSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ name: 1 }).exec();
};

frameworkSchema.statics.findCompliant = function() {
  return this.find({ 'compliance.status': 'compliant', status: 'active' }).exec();
};

frameworkSchema.statics.getStatistics = async function() {
  return await this.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$compliance.status', count: { $sum: 1 }, avgScore: { $avg: '$compliance.overallScore' } } }
  ]);
};

module.exports = mongoose.model('Framework', frameworkSchema);

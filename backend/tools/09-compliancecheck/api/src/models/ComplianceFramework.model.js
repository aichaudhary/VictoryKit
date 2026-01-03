/**
 * ComplianceFramework Model - Enhanced Framework Definition
 * Tool 09 - ComplianceCheck
 * 
 * Comprehensive framework schema with version control, 
 * control mappings, and cross-framework relationships
 */

const mongoose = require('mongoose');

const controlRequirementSchema = new mongoose.Schema({
  requirementId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  subcategory: { type: String },
  priority: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'], 
    default: 'medium' 
  },
  implementationGuidance: { type: String },
  testingProcedures: [{ type: String }],
  evidenceRequirements: [{
    type: { type: String, enum: ['document', 'screenshot', 'log', 'config', 'attestation', 'interview', 'observation'] },
    description: String,
    required: { type: Boolean, default: true }
  }],
  mappings: [{
    framework: String,
    controlId: String,
    relationship: { type: String, enum: ['equivalent', 'partial', 'related'] }
  }],
  automationSupport: {
    canAutomate: { type: Boolean, default: false },
    automationType: { type: String, enum: ['api-check', 'config-scan', 'log-analysis', 'policy-check', 'evidence-collection'] },
    integrations: [String] // e.g., ['aws-config', 'azure-policy', 'vanta']
  }
}, { _id: false });

const frameworkVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  releaseDate: { type: Date },
  effectiveDate: { type: Date },
  endOfLifeDate: { type: Date },
  changes: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { _id: false });

const complianceFrameworkSchema = new mongoose.Schema({
  // Basic Information
  frameworkId: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  name: { 
    type: String, 
    required: true,
    enum: [
      'SOC2', 'SOC2_TYPE1', 'SOC2_TYPE2',
      'ISO27001', 'ISO27001_2022', 'ISO27017', 'ISO27018',
      'HIPAA', 'HITECH',
      'PCI-DSS', 'PCI-DSS_4.0',
      'GDPR', 'CCPA', 'LGPD', 'PIPEDA',
      'NIST_CSF', 'NIST_800-53', 'NIST_800-171',
      'CIS_CONTROLS', 'CIS_BENCHMARKS',
      'FEDRAMP_LOW', 'FEDRAMP_MODERATE', 'FEDRAMP_HIGH',
      'COBIT', 'ITIL',
      'HITRUST_CSF',
      'SOX', 'SOX_IT',
      'CMMC_L1', 'CMMC_L2', 'CMMC_L3',
      'CUSTOM'
    ]
  },
  displayName: { type: String, required: true },
  description: { type: String },
  shortDescription: { type: String },
  
  // Classification
  category: {
    type: String,
    enum: ['security', 'privacy', 'industry', 'government', 'financial', 'healthcare', 'general'],
    required: true
  },
  subcategory: { type: String },
  applicableIndustries: [{
    type: String,
    enum: ['healthcare', 'finance', 'technology', 'retail', 'government', 'education', 'manufacturing', 'all']
  }],
  applicableRegions: [{
    type: String,
    enum: ['global', 'usa', 'eu', 'uk', 'canada', 'asia-pacific', 'latam', 'middle-east', 'africa']
  }],
  
  // Version Management
  currentVersion: { type: String, required: true },
  versions: [frameworkVersionSchema],
  
  // Controls & Requirements
  totalControls: { type: Number, default: 0 },
  controlCategories: [{
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    controlCount: { type: Number, default: 0 },
    weight: { type: Number, default: 1 } // For weighted scoring
  }],
  requirements: [controlRequirementSchema],
  
  // Cross-Framework Mapping
  mappedFrameworks: [{
    frameworkId: String,
    frameworkName: String,
    mappingCompleteness: { type: Number, min: 0, max: 100 },
    lastMappingUpdate: Date
  }],
  
  // Certification/Audit Information
  certificationBody: { type: String }, // e.g., 'AICPA' for SOC2
  auditRequirements: {
    frequencyMonths: { type: Number }, // e.g., 12 for annual
    auditorRequirements: { type: String },
    reportTypes: [{ type: String }]
  },
  
  // Scoring Configuration
  scoringMethod: {
    type: String,
    enum: ['binary', 'weighted', 'maturity', 'risk-based'],
    default: 'weighted'
  },
  passingThreshold: { type: Number, default: 80 },
  maturityLevels: [{
    level: { type: Number },
    name: { type: String },
    description: { type: String },
    minScore: { type: Number }
  }],
  
  // Automation & Integration
  supportedIntegrations: [{
    provider: { type: String }, // e.g., 'vanta', 'drata', 'aws-audit-manager'
    integrationId: { type: String },
    capabilities: [{ type: String }] // e.g., ['evidence-collection', 'control-testing', 'reporting']
  }],
  automationLevel: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: 'partial'
  },
  autoEvidencePercentage: { type: Number, default: 0 },
  
  // Resources & Documentation
  officialDocumentation: { type: String }, // URL
  implementationGuide: { type: String },
  templateDocuments: [{
    name: String,
    type: String,
    url: String
  }],
  
  // Metadata
  isActive: { type: Boolean, default: true },
  isCustom: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  
  // Statistics
  stats: {
    totalAssessments: { type: Number, default: 0 },
    avgComplianceScore: { type: Number, default: 0 },
    lastAssessmentDate: { type: Date }
  }
}, {
  timestamps: true,
  collection: 'compliance_frameworks'
});

// Indexes
complianceFrameworkSchema.index({ frameworkId: 1 }, { unique: true });
complianceFrameworkSchema.index({ name: 1 });
complianceFrameworkSchema.index({ category: 1, isActive: 1 });
complianceFrameworkSchema.index({ applicableIndustries: 1 });
complianceFrameworkSchema.index({ 'requirements.requirementId': 1 });

// Virtual for control completion
complianceFrameworkSchema.virtual('controlsWithAutomation').get(function() {
  if (!this.requirements) return 0;
  return this.requirements.filter(r => r.automationSupport?.canAutomate).length;
});

// Methods
complianceFrameworkSchema.methods.getControlById = function(controlId) {
  return this.requirements.find(r => r.requirementId === controlId);
};

complianceFrameworkSchema.methods.getControlsByCategory = function(category) {
  return this.requirements.filter(r => r.category === category);
};

complianceFrameworkSchema.methods.getMappedControls = function(targetFramework) {
  const mappings = [];
  this.requirements.forEach(req => {
    const mapping = req.mappings?.find(m => m.framework === targetFramework);
    if (mapping) {
      mappings.push({
        sourceControl: req.requirementId,
        targetControl: mapping.controlId,
        relationship: mapping.relationship
      });
    }
  });
  return mappings;
};

// Static methods
complianceFrameworkSchema.statics.getActiveFrameworks = function() {
  return this.find({ isActive: true }).select('frameworkId name displayName category totalControls');
};

complianceFrameworkSchema.statics.getFrameworkByName = function(name) {
  return this.findOne({ name, isActive: true });
};

complianceFrameworkSchema.statics.getFrameworksForIndustry = function(industry) {
  return this.find({ 
    applicableIndustries: { $in: [industry, 'all'] },
    isActive: true 
  });
};

module.exports = mongoose.model('ComplianceFramework', complianceFrameworkSchema);

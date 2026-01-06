const mongoose = require('mongoose');

const frameworkMappingSchema = new mongoose.Schema({
  mappingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  policyId: {
    type: String,
    required: true,
    index: true
  },
  policyName: String,
  framework: {
    name: {
      type: String,
      required: true,
      enum: [
        'NIST-800-53',
        'ISO-27001',
        'CIS-Controls',
        'PCI-DSS',
        'HIPAA',
        'GDPR',
        'SOX',
        'COBIT',
        'SOC2',
        'FedRAMP',
        'CMMC'
      ]
    },
    version: String,
    domain: String
  },
  mappings: [{
    controlId: { type: String, required: true },
    controlName: String,
    controlFamily: String,
    controlDescription: String,
    coverage: {
      type: String,
      required: true,
      enum: ['full', 'partial', 'none']
    },
    coveragePercentage: { type: Number, min: 0, max: 100 },
    implementation: {
      status: {
        type: String,
        enum: ['not_implemented', 'planned', 'partially_implemented', 'implemented', 'verified']
      },
      notes: String,
      evidence: [String]
    },
    gap: {
      hasGap: Boolean,
      gapDescription: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      remediationPlan: String,
      targetDate: Date
    }
  }],
  complianceStatus: {
    overall: {
      type: String,
      enum: ['compliant', 'partially_compliant', 'non_compliant', 'not_assessed']
    },
    totalControls: Number,
    implementedControls: Number,
    partialControls: Number,
    notImplementedControls: Number,
    complianceScore: { type: Number, min: 0, max: 100 }
  },
  assessment: {
    lastAssessmentDate: Date,
    nextAssessmentDate: Date,
    assessedBy: String,
    assessmentNotes: String
  },
  metadata: {
    createdBy: String,
    lastUpdatedBy: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes
frameworkMappingSchema.index({ policyId: 1, 'framework.name': 1 });
frameworkMappingSchema.index({ 'framework.name': 1, 'complianceStatus.overall': 1 });
frameworkMappingSchema.index({ 'mappings.controlId': 1 });

// Methods
frameworkMappingSchema.methods.calculateComplianceScore = function() {
  const total = this.mappings.length;
  if (total === 0) return 0;
  
  const implemented = this.mappings.filter(m => m.implementation.status === 'implemented' || m.implementation.status === 'verified').length;
  const partial = this.mappings.filter(m => m.implementation.status === 'partially_implemented').length;
  
  const score = ((implemented + (partial * 0.5)) / total) * 100;
  this.complianceStatus.complianceScore = Math.round(score);
  
  this.complianceStatus.implementedControls = implemented;
  this.complianceStatus.partialControls = partial;
  this.complianceStatus.notImplementedControls = total - implemented - partial;
  this.complianceStatus.totalControls = total;
  
  return this.complianceStatus.complianceScore;
};

module.exports = mongoose.model('FrameworkMapping', frameworkMappingSchema);

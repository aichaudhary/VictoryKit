const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  requirementId: {
    type: String,
    enum: ['req1', 'req2', 'req3', 'req4', 'req5', 'req6', 'req7', 'req8', 'req9', 'req10', 'req11', 'req12'],
    required: true,
    unique: true
  },
  number: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  subRequirements: [{
    id: String,
    number: String,
    description: String,
    testing_procedures: [String],
    compliant: { type: Boolean, default: false },
    notes: String,
    evidence: [String],
    lastAssessed: Date
  }],
  overallCompliance: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'compliant', 'non_compliant', 'partially_compliant', 'not_applicable'],
    default: 'not_started'
  },
  openFindings: { type: Number, default: 0 },
  criticalFindings: { type: Number, default: 0 },
  lastScanDate: Date,
  nextScanDate: Date,
  assessmentNotes: String,
  compensatingControls: [{
    control: String,
    justification: String,
    validatedBy: String,
    validationDate: Date
  }],
  customizations: {
    enabled: { type: Boolean, default: true },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'high' },
    frequency: String
  }
}, { timestamps: true });

requirementSchema.index({ requirementId: 1 });
requirementSchema.index({ status: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);

const mongoose = require('mongoose');

const recoveryStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  responsibleTeam: { type: String },
  responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  estimatedDuration: { type: Number }, // minutes
  dependencies: [{ type: Number }], // step numbers that must complete first
  runbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Runbook' },
  automationScript: { type: String },
  isAutomated: { type: Boolean, default: false },
  verificationSteps: [{ type: String }],
  rollbackSteps: [{ type: String }],
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed', 'skipped'], default: 'pending' }
});

const recoveryPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  version: { type: String, default: '1.0.0' },
  status: { 
    type: String, 
    enum: ['draft', 'review', 'approved', 'active', 'deprecated', 'archived'],
    default: 'draft'
  },
  planType: {
    type: String,
    enum: ['full-dr', 'partial-dr', 'failover', 'failback', 'data-recovery', 'site-recovery', 'application-recovery'],
    required: true
  },
  scope: {
    type: String,
    enum: ['enterprise', 'department', 'application', 'infrastructure', 'data-center'],
    default: 'application'
  },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'high' },
  
  // Recovery Objectives
  rto: { type: Number, required: true }, // Recovery Time Objective in minutes
  rpo: { type: Number, required: true }, // Recovery Point Objective in minutes
  mtpd: { type: Number }, // Maximum Tolerable Period of Disruption in hours
  
  // Associated Resources
  primarySite: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' },
  recoverySite: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' },
  systems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
  
  // Recovery Steps
  steps: [recoveryStepSchema],
  
  // Communication
  escalationPath: [{
    level: { type: Number },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    triggerCondition: { type: String },
    timeToEscalate: { type: Number } // minutes
  }],
  notificationGroups: [{ type: String }],
  
  // Testing
  lastTestedAt: { type: Date },
  testFrequency: { type: String, enum: ['monthly', 'quarterly', 'semi-annual', 'annual'], default: 'quarterly' },
  nextTestDate: { type: Date },
  testResults: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'DRTest' },
    date: { type: Date },
    result: { type: String, enum: ['pass', 'partial', 'fail'] },
    notes: { type: String }
  }],
  
  // Compliance
  complianceFrameworks: [{ type: String }], // SOC2, ISO27001, HIPAA, etc.
  regulatoryRequirements: [{ type: String }],
  
  // Audit Trail
  createdBy: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  lastReviewedBy: { type: String },
  lastReviewedAt: { type: Date },
  changeHistory: [{
    version: { type: String },
    changedBy: { type: String },
    changedAt: { type: Date },
    changeDescription: { type: String }
  }],
  
  // Metadata
  tags: [{ type: String }],
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
recoveryPlanSchema.index({ planId: 1 });
recoveryPlanSchema.index({ status: 1, planType: 1 });
recoveryPlanSchema.index({ priority: 1 });
recoveryPlanSchema.index({ 'systems': 1 });
recoveryPlanSchema.index({ nextTestDate: 1 });

module.exports = mongoose.model('RecoveryPlan', recoveryPlanSchema);

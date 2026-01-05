const mongoose = require('mongoose');

const runbookStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  instructions: { type: String, required: true },
  
  stepType: {
    type: String,
    enum: ['manual', 'automated', 'verification', 'decision', 'notification', 'wait'],
    default: 'manual'
  },
  
  // Automation
  automationScript: { type: String },
  scriptLanguage: { type: String, enum: ['bash', 'powershell', 'python', 'ansible', 'terraform', 'other'] },
  scriptParameters: { type: Map, of: String },
  expectedOutput: { type: String },
  
  // Timing
  estimatedDurationMinutes: { type: Number, default: 5 },
  timeout: { type: Number }, // minutes
  waitBeforeNext: { type: Number, default: 0 }, // seconds
  
  // Dependencies
  prerequisites: [{ type: Number }], // step numbers
  canRunParallel: { type: Boolean, default: false },
  parallelGroup: { type: String },
  
  // Verification
  verificationMethod: { type: String },
  successCriteria: { type: String },
  rollbackOnFailure: { type: Boolean, default: true },
  
  // Rollback
  rollbackInstructions: { type: String },
  rollbackScript: { type: String },
  
  // Warnings & Notes
  warnings: [{ type: String }],
  notes: [{ type: String }],
  
  // Assignment
  assignedRole: { type: String },
  requiredSkills: [{ type: String }],
  
  // Status (for execution tracking)
  executionStatus: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'skipped'], default: 'pending' },
  executedBy: { type: String },
  executedAt: { type: Date },
  executionNotes: { type: String }
});

const runbookSchema = new mongoose.Schema({
  runbookId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  version: { type: String, default: '1.0.0' },
  
  category: {
    type: String,
    enum: ['failover', 'failback', 'recovery', 'maintenance', 'incident', 'backup', 'restore', 'testing', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'active', 'deprecated'],
    default: 'draft'
  },
  
  // Scope
  scope: {
    systems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
    sites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' }],
    plans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryPlan' }]
  },
  
  // Steps
  steps: [runbookStepSchema],
  
  // Timing
  totalEstimatedDuration: { type: Number }, // minutes (calculated)
  
  // Prerequisites
  prerequisites: {
    requiredAccess: [{ type: String }],
    requiredTools: [{ type: String }],
    requiredDocuments: [{ type: String }],
    environmentChecks: [{ type: String }]
  },
  
  // Execution Settings
  executionSettings: {
    requiresApproval: { type: Boolean, default: true },
    approvers: [{ type: String }],
    canBeAutomated: { type: Boolean, default: false },
    parallelExecution: { type: Boolean, default: false },
    stopOnFailure: { type: Boolean, default: true }
  },
  
  // Communication
  notificationSettings: {
    notifyOnStart: { type: Boolean, default: true },
    notifyOnComplete: { type: Boolean, default: true },
    notifyOnFailure: { type: Boolean, default: true },
    notificationChannels: [{ type: String }],
    stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }]
  },
  
  // Execution History
  lastExecutedAt: { type: Date },
  lastExecutedBy: { type: String },
  executionCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 }, // percentage
  averageExecutionTime: { type: Number }, // minutes
  
  executionHistory: [{
    executionId: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    executedBy: { type: String },
    result: { type: String, enum: ['success', 'partial', 'failed', 'aborted'] },
    duration: { type: Number },
    notes: { type: String },
    stepsCompleted: { type: Number },
    stepsFailed: { type: Number }
  }],
  
  // Review & Audit
  createdBy: { type: String },
  lastReviewedBy: { type: String },
  lastReviewedAt: { type: Date },
  nextReviewDate: { type: Date },
  reviewCycle: { type: String, enum: ['monthly', 'quarterly', 'semi-annual', 'annual'], default: 'quarterly' },
  
  changeHistory: [{
    version: { type: String },
    changedBy: { type: String },
    changedAt: { type: Date },
    changeDescription: { type: String }
  }],
  
  // Documentation
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  relatedDocuments: [{ type: String }],
  
  // Metadata
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Calculate total duration before save
runbookSchema.pre('save', function(next) {
  if (this.steps && this.steps.length > 0) {
    this.totalEstimatedDuration = this.steps.reduce((total, step) => {
      return total + (step.estimatedDurationMinutes || 0);
    }, 0);
  }
  next();
});

// Indexes
runbookSchema.index({ runbookId: 1 });
runbookSchema.index({ category: 1, status: 1 });
runbookSchema.index({ 'scope.systems': 1 });
runbookSchema.index({ nextReviewDate: 1 });

module.exports = mongoose.model('Runbook', runbookSchema);

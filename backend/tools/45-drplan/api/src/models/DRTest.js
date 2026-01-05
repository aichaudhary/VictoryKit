const mongoose = require('mongoose');

const testStepResultSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  stepName: { type: String },
  status: { type: String, enum: ['passed', 'failed', 'skipped', 'partial'], required: true },
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number }, // seconds
  executedBy: { type: String },
  expectedResult: { type: String },
  actualResult: { type: String },
  notes: { type: String },
  evidence: [{
    type: { type: String },
    url: { type: String },
    description: { type: String }
  }],
  issues: [{ type: String }]
});

const drTestSchema = new mongoose.Schema({
  testId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  
  testType: {
    type: String,
    enum: ['tabletop', 'walkthrough', 'simulation', 'parallel', 'full-failover', 'partial-failover', 'component', 'integration'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'preparing', 'in-progress', 'completed', 'cancelled', 'failed'],
    default: 'scheduled'
  },
  result: {
    type: String,
    enum: ['passed', 'passed-with-issues', 'failed', 'incomplete', 'pending'],
    default: 'pending'
  },
  
  // Schedule
  scheduledDate: { type: Date, required: true },
  scheduledDuration: { type: Number }, // minutes
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  actualDuration: { type: Number }, // minutes
  
  // Scope
  scope: {
    plans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryPlan' }],
    systems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
    sites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' }],
    runbooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Runbook' }]
  },
  
  // Objectives
  objectives: [{
    description: { type: String },
    measurementCriteria: { type: String },
    targetValue: { type: String },
    actualValue: { type: String },
    met: { type: Boolean }
  }],
  
  // RTO/RPO Validation
  rtoRpoValidation: {
    targetRTO: { type: Number }, // minutes
    achievedRTO: { type: Number },
    rtoMet: { type: Boolean },
    targetRPO: { type: Number }, // minutes
    achievedRPO: { type: Number },
    rpoMet: { type: Boolean },
    dataLossAmount: { type: String },
    recoverySequence: [{ type: String }]
  },
  
  // Participants
  participants: [{
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    name: { type: String },
    role: { type: String },
    department: { type: String },
    attended: { type: Boolean, default: false },
    feedback: { type: String }
  }],
  testLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  
  // Step Results
  stepResults: [testStepResultSchema],
  stepsTotal: { type: Number, default: 0 },
  stepsPassed: { type: Number, default: 0 },
  stepsFailed: { type: Number, default: 0 },
  stepsSkipped: { type: Number, default: 0 },
  
  // Issues & Findings
  issues: [{
    issueId: { type: String },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    category: { type: String },
    description: { type: String },
    impact: { type: String },
    rootCause: { type: String },
    recommendation: { type: String },
    assignedTo: { type: String },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'deferred'] },
    dueDate: { type: Date },
    resolvedAt: { type: Date }
  }],
  
  // Lessons Learned
  lessonsLearned: [{
    category: { type: String },
    observation: { type: String },
    recommendation: { type: String },
    actionItem: { type: String },
    priority: { type: String, enum: ['high', 'medium', 'low'] }
  }],
  
  // Metrics
  metrics: {
    overallScore: { type: Number }, // 0-100
    communicationScore: { type: Number },
    executionScore: { type: Number },
    documentationScore: { type: Number },
    timelinessScore: { type: Number },
    technicalScore: { type: Number }
  },
  
  // Documentation
  preTestChecklist: [{
    item: { type: String },
    completed: { type: Boolean },
    notes: { type: String }
  }],
  postTestChecklist: [{
    item: { type: String },
    completed: { type: Boolean },
    notes: { type: String }
  }],
  
  // Evidence & Attachments
  evidence: [{
    name: { type: String },
    type: { type: String, enum: ['screenshot', 'log', 'video', 'document', 'other'] },
    url: { type: String },
    description: { type: String },
    capturedAt: { type: Date }
  }],
  
  // Report
  reportGenerated: { type: Boolean, default: false },
  reportUrl: { type: String },
  executiveSummary: { type: String },
  
  // Compliance
  complianceFrameworks: [{ type: String }],
  auditRequired: { type: Boolean, default: false },
  auditorNotes: { type: String },
  
  // Follow-up
  nextTestDate: { type: Date },
  followUpActions: [{
    action: { type: String },
    assignee: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'] },
    completedAt: { type: Date }
  }],
  
  // Metadata
  createdBy: { type: String },
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
drTestSchema.index({ testId: 1 });
drTestSchema.index({ testType: 1, status: 1 });
drTestSchema.index({ scheduledDate: 1 });
drTestSchema.index({ result: 1 });
drTestSchema.index({ 'scope.plans': 1 });

module.exports = mongoose.model('DRTest', drTestSchema);

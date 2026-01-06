const mongoose = require('mongoose');

const stepExecutionSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  action: { type: String, required: true },
  tool: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'skipped'], default: 'pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number }, // in milliseconds
  inputData: { type: mongoose.Schema.Types.Mixed },
  outputData: { type: mongoose.Schema.Types.Mixed },
  error: {
    message: { type: String },
    code: { type: String },
    stack: { type: String }
  },
  retryAttempts: { type: Number, default: 0 },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'] },
    message: { type: String }
  }]
}, { _id: true });

const executionSchema = new mongoose.Schema({
  executionId: { type: String, unique: true, required: true, index: true },
  
  playbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook', required: true, index: true },
  playbookName: { type: String, required: true },
  
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', index: true },
  
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'pending',
    index: true
  },
  
  executionMode: {
    type: String,
    enum: ['automatic', 'semi_automatic', 'manual_approval'],
    default: 'automatic'
  },
  
  triggerType: {
    type: String,
    enum: ['manual', 'scheduled', 'event_based', 'api_trigger'],
    required: true
  },
  
  triggeredBy: { type: String },
  
  inputData: { type: mongoose.Schema.Types.Mixed },
  outputData: { type: mongoose.Schema.Types.Mixed },
  
  steps: [stepExecutionSchema],
  
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, required: true },
  completedSteps: { type: Number, default: 0 },
  failedSteps: { type: Number, default: 0 },
  
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number }, // in milliseconds
  
  approvals: [{
    stepNumber: { type: Number },
    requestedAt: { type: Date },
    requestedFrom: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'] },
    notes: { type: String }
  }],
  
  rollback: {
    required: { type: Boolean, default: false },
    initiated: { type: Boolean, default: false },
    initiatedAt: { type: Date },
    initiatedBy: { type: String },
    completed: { type: Boolean, default: false },
    steps: [stepExecutionSchema]
  },
  
  notifications: [{
    type: { type: String, enum: ['email', 'slack', 'teams', 'webhook', 'sms'] },
    recipient: { type: String },
    status: { type: String, enum: ['pending', 'sent', 'failed'] },
    sentAt: { type: Date }
  }],
  
  metrics: {
    totalAPICallsnode: { type: Number, default: 0 },
    dataProcessed: { type: Number, default: 0 }, // in bytes
    actionsExecuted: { type: Number, default: 0 },
    timeSaved: { type: Number, default: 0 }, // estimated time saved in seconds
    costEstimate: { type: Number, default: 0 }
  },
  
  error: {
    message: { type: String },
    code: { type: String },
    stack: { type: String },
    failedAt: { type: Date },
    canRetry: { type: Boolean, default: true }
  },
  
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'] },
    message: { type: String },
    source: { type: String }
  }],
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  tags: [{ type: String }],
  
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

executionSchema.index({ status: 1, createdAt: -1 });
executionSchema.index({ playbookId: 1, status: 1 });
executionSchema.index({ caseId: 1 });
executionSchema.index({ triggeredBy: 1 });
executionSchema.index({ startedAt: -1 });

executionSchema.methods.addLog = async function(level, message, source = 'system') {
  this.logs.push({ level, message, source });
  if (this.logs.length > 1000) {
    this.logs = this.logs.slice(-1000); // Keep last 1000 logs
  }
  await this.save();
};

executionSchema.methods.updateStepStatus = async function(stepNumber, status, outputData, error) {
  const step = this.steps.find(s => s.stepNumber === stepNumber);
  if (step) {
    step.status = status;
    if (status === 'running' && !step.startedAt) {
      step.startedAt = new Date();
    }
    if ((status === 'completed' || status === 'failed') && step.startedAt) {
      step.completedAt = new Date();
      step.duration = step.completedAt - step.startedAt;
    }
    if (outputData) step.outputData = outputData;
    if (error) step.error = error;
    
    if (status === 'completed') this.completedSteps++;
    if (status === 'failed') this.failedSteps++;
    
    await this.save();
  }
};

executionSchema.methods.calculateDuration = function() {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
};

module.exports = mongoose.model('Execution', executionSchema);

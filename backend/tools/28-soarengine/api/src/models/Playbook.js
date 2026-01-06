const mongoose = require('mongoose');

const playbookStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  action: { type: String, required: true },
  tool: { type: String, required: true },
  parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
  condition: { type: String },
  onSuccess: { type: String, enum: ['continue', 'skip_next', 'jump_to', 'complete'], default: 'continue' },
  onFailure: { type: String, enum: ['stop', 'retry', 'continue', 'rollback'], default: 'stop' },
  retryCount: { type: Number, default: 0 },
  timeout: { type: Number, default: 300 }
}, { _id: false });

const playbookSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['phishing_response', 'malware_containment', 'ddos_mitigation', 'data_breach', 'insider_threat', 'vulnerability_remediation', 'compliance', 'custom'],
    required: true,
    index: true
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  
  trigger: {
    type: {
      type: String,
      enum: ['manual', 'scheduled', 'event_based', 'api_trigger'],
      default: 'manual'
    },
    conditions: [{ type: mongoose.Schema.Types.Mixed }]
  },
  
  steps: [playbookStepSchema],
  
  requiredIntegrations: [{ type: String }],
  
  metadata: {
    author: { type: String },
    version: { type: String, default: '1.0.0' },
    tags: [{ type: String }],
    complexity: { type: String, enum: ['simple', 'moderate', 'advanced', 'expert'], default: 'moderate' },
    estimatedDuration: { type: Number }, // in seconds
    isTemplate: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false }
  },
  
  executionStats: {
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 },
    lastExecuted: { type: Date },
    timeSaved: { type: Number, default: 0 } // in seconds
  },
  
  approvalSettings: {
    requiresApproval: { type: Boolean, default: false },
    approvers: [{ type: String }],
    approvalTimeout: { type: Number, default: 3600 }
  },
  
  rollbackPlan: {
    enabled: { type: Boolean, default: false },
    steps: [playbookStepSchema]
  },
  
  schedule: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['once', 'daily', 'weekly', 'monthly', 'cron'] },
    config: { type: mongoose.Schema.Types.Mixed },
    startTime: { type: Date },
    endTime: { type: Date }
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'deprecated'],
    default: 'draft',
    index: true
  },
  
  aiInsights: {
    recommendedImprovements: [{ type: String }],
    similarPlaybooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playbook' }],
    riskScore: { type: Number, min: 0, max: 100 }
  }
}, {
  timestamps: true
});

playbookSchema.index({ category: 1, status: 1 });
playbookSchema.index({ 'metadata.tags': 1 });
playbookSchema.index({ createdAt: -1 });

playbookSchema.methods.recordExecution = async function(success, duration) {
  this.executionStats.totalExecutions++;
  if (success) {
    this.executionStats.successfulExecutions++;
  } else {
    this.executionStats.failedExecutions++;
  }
  this.executionStats.averageDuration = 
    ((this.executionStats.averageDuration * (this.executionStats.totalExecutions - 1)) + duration) / 
    this.executionStats.totalExecutions;
  this.executionStats.lastExecuted = new Date();
  await this.save();
};

module.exports = mongoose.model('Playbook', playbookSchema);

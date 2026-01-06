const mongoose = require('mongoose');

const playbookSchema = new mongoose.Schema({
  playbookId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['incident_response', 'threat_hunting', 'containment', 'recovery', 'investigation', 'automation'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  triggerConditions: [{
    type: String,
    operator: String,
    value: String
  }],
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    name: String,
    description: String,
    action: {
      type: String,
      enum: ['isolate_host', 'block_ip', 'disable_account', 'kill_process', 'collect_evidence', 'notify', 'query_logs', 'scan_system', 'custom'],
      required: true
    },
    parameters: mongoose.Schema.Types.Mixed,
    timeout: Number, // seconds
    retryOnFailure: {
      type: Boolean,
      default: false
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    continueOnError: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: false
    }
  }],
  autoExecute: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: true
  },
  approvers: [String],
  successCriteria: {
    type: String
  },
  rollbackPlan: {
    hasRollback: Boolean,
    steps: [String]
  },
  executionStats: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successfulExecutions: {
      type: Number,
      default: 0
    },
    failedExecutions: {
      type: Number,
      default: 0
    },
    avgExecutionTime: Number, // seconds
    lastExecuted: Date
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  author: String,
  tags: [String],
  active: {
    type: Boolean,
    default: true
  },
  integrations: [{
    service: String,
    endpoint: String,
    method: String
  }]
}, {
  timestamps: true
});

// Indexes
playbookSchema.index({ category: 1, active: 1 });
playbookSchema.index({ severity: 1 });
playbookSchema.index({ tags: 1 });

module.exports = mongoose.model('Playbook', playbookSchema);

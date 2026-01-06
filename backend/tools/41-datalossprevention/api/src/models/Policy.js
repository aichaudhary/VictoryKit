const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    default: () => `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  framework: {
    type: String,
    enum: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO27001', 'CCPA', 'Custom'],
    default: 'Custom'
  },
  
  // Policy Conditions
  conditions: {
    dataTypes: [{
      type: String,
      enum: ['PII', 'PHI', 'PCI', 'Financial', 'Intellectual Property', 'Trade Secret', 'Confidential', 'Any']
    }],
    users: [{
      type: String // User IDs, departments, or 'all'
    }],
    actions: [{
      type: String,
      enum: ['email', 'upload', 'download', 'print', 'copy', 'screenshot', 'usb', 'any']
    }],
    destinations: [{
      type: String // Domain patterns, IP ranges, 'external', 'cloud'
    }],
    patterns: [{
      type: String // Regex patterns for content matching
    }],
    mlConfidenceThreshold: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.75
    }
  },
  
  // Policy Actions
  actions: {
    block: {
      type: Boolean,
      default: false
    },
    alert: {
      type: Boolean,
      default: true
    },
    encrypt: {
      type: Boolean,
      default: false
    },
    quarantine: {
      type: Boolean,
      default: false
    },
    log: {
      type: Boolean,
      default: true
    },
    notifyUsers: [{
      type: String // Email addresses
    }],
    requireJustification: {
      type: Boolean,
      default: false
    },
    allowOverride: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  createdBy: {
    userId: String,
    name: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  lastModifiedBy: {
    userId: String,
    name: String,
    timestamp: Date
  },
  
  // Statistics
  statistics: {
    violations: {
      type: Number,
      default: 0
    },
    blocked: {
      type: Number,
      default: 0
    },
    alerted: {
      type: Number,
      default: 0
    },
    overridden: {
      type: Number,
      default: 0
    },
    lastTriggered: Date,
    effectiveness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Testing & Simulation
  testMode: {
    type: Boolean,
    default: false
  },
  testResults: [{
    timestamp: Date,
    input: String,
    matched: Boolean,
    confidence: Number,
    action: String
  }]
}, {
  timestamps: true
});

// Indexes
policySchema.index({ policyId: 1 });
policySchema.index({ enabled: 1 });
policySchema.index({ severity: 1 });
policySchema.index({ framework: 1 });
policySchema.index({ 'createdBy.userId': 1 });

// Methods
policySchema.methods.incrementViolation = function() {
  this.statistics.violations += 1;
  this.statistics.lastTriggered = new Date();
  return this.save();
};

policySchema.methods.incrementBlocked = function() {
  this.statistics.blocked += 1;
  return this.save();
};

policySchema.methods.calculateEffectiveness = function() {
  const total = this.statistics.violations || 1;
  const blocked = this.statistics.blocked;
  this.statistics.effectiveness = Math.round((blocked / total) * 100);
  return this.statistics.effectiveness;
};

policySchema.methods.testPolicy = async function(input) {
  const result = {
    timestamp: new Date(),
    input: input.substring(0, 200), // Store preview
    matched: false,
    confidence: 0,
    action: 'none'
  };
  
  // Check patterns
  for (const pattern of this.conditions.patterns) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(input)) {
      result.matched = true;
      result.confidence = 1.0;
      break;
    }
  }
  
  if (result.matched) {
    if (this.actions.block) result.action = 'block';
    else if (this.actions.alert) result.action = 'alert';
  }
  
  this.testResults.push(result);
  await this.save();
  
  return result;
};

// Statics
policySchema.statics.getActiveByFramework = function(framework) {
  return this.find({ framework, enabled: true });
};

policySchema.statics.getTopViolators = function(limit = 10) {
  return this.find({ enabled: true })
    .sort({ 'statistics.violations': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Policy', policySchema);

const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['malware', 'phishing', 'ddos', 'data_breach', 'insider_threat', 'apt', 'ransomware', 'unauthorized_access', 'other'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'investigating', 'contained', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P3'
  },
  assignedTo: {
    userId: String,
    username: String,
    team: String
  },
  reporter: {
    userId: String,
    username: String
  },
  affectedAssets: [{
    type: String,
    assetType: String,
    hostname: String,
    ip: String
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    actor: String,
    details: String
  }],
  playbook: {
    playbookId: String,
    playbookName: String,
    executed: Boolean,
    executionTime: Date,
    steps: [{
      stepNumber: Number,
      action: String,
      status: String,
      result: String
    }]
  },
  mitigation: {
    actions: [String],
    containmentStatus: String,
    recoveryStatus: String
  },
  rootCause: {
    identified: Boolean,
    description: String,
    cve: String,
    attackVector: String
  },
  impact: {
    scope: String,
    dataCompromised: Boolean,
    systemsAffected: Number,
    estimatedCost: Number,
    businessImpact: String
  },
  evidence: [{
    type: String,
    description: String,
    url: String,
    hash: String,
    collectedAt: Date,
    collectedBy: String
  }],
  notes: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: String,
    content: String
  }],
  tags: [String],
  aiRecommendations: [{
    type: String,
    confidence: Number,
    reasoning: String
  }],
  escalated: {
    type: Boolean,
    default: false
  },
  escalationDetails: {
    escalatedAt: Date,
    escalatedTo: String,
    reason: String
  },
  resolvedAt: Date,
  resolutionTime: Number, // minutes
  firstResponseTime: Number // minutes
}, {
  timestamps: true
});

// Indexes
incidentSchema.index({ status: 1, severity: -1, createdAt: -1 });
incidentSchema.index({ 'assignedTo.userId': 1, status: 1 });
incidentSchema.index({ category: 1, createdAt: -1 });
incidentSchema.index({ tags: 1 });

// Virtual for response SLA
incidentSchema.virtual('slaStatus').get(function() {
  if (!this.createdAt) return 'unknown';
  const minutes = (Date.now() - this.createdAt) / (1000 * 60);
  const sla = {
    critical: 15,
    high: 60,
    medium: 240,
    low: 1440
  };
  return minutes > sla[this.severity] ? 'breached' : 'within_sla';
});

module.exports = mongoose.model('Incident', incidentSchema);

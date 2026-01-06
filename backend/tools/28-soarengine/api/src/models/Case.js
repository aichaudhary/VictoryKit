const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  actor: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  automated: { type: Boolean, default: false }
}, { _id: false });

const evidenceSchema = new mongoose.Schema({
  type: { type: String, enum: ['log', 'file', 'screenshot', 'network_capture', 'memory_dump', 'email', 'document'], required: true },
  fileName: { type: String },
  filePath: { type: String },
  hash: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: String },
  description: { type: String }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  dueDate: { type: Date },
  completedAt: { type: Date }
}, { _id: true, timestamps: true });

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, required: true, index: true },
  
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  
  category: {
    type: String,
    enum: ['malware', 'phishing', 'ddos', 'data_breach', 'unauthorized_access', 'policy_violation', 'vulnerability', 'insider_threat', 'other'],
    required: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['new', 'in_progress', 'pending', 'resolved', 'closed', 'escalated'],
    default: 'new',
    index: true
  },
  
  assignedTo: { type: String, index: true },
  reportedBy: { type: String },
  
  affectedAssets: [{
    type: { type: String, enum: ['endpoint', 'server', 'user', 'application', 'network', 'database'] },
    identifier: { type: String },
    impact: { type: String }
  }],
  
  relatedEvents: [{ type: String }],
  relatedAlerts: [{ type: String }],
  
  timeline: [timelineEventSchema],
  
  evidence: [evidenceSchema],
  
  tasks: [taskSchema],
  
  playbooks: [{
    playbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook' },
    executionId: { type: String },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    startedAt: { type: Date },
    completedAt: { type: Date }
  }],
  
  sla: {
    responseTime: { type: Number, required: true }, // in minutes
    resolutionTime: { type: Number, required: true }, // in minutes
    responseDeadline: { type: Date },
    resolutionDeadline: { type: Date },
    breached: { type: Boolean, default: false }
  },
  
  metrics: {
    detectionTime: { type: Date },
    responseTime: { type: Date },
    containmentTime: { type: Date },
    resolutionTime: { type: Date },
    meanTimeToRespond: { type: Number }, // in seconds
    meanTimeToResolve: { type: Number } // in seconds
  },
  
  threat: {
    iocs: [{
      type: { type: String, enum: ['ip', 'domain', 'url', 'hash', 'email', 'cve'] },
      value: { type: String },
      confidence: { type: Number, min: 0, max: 100 }
    }],
    attackVectors: [{ type: String }],
    mitreAttack: [{
      technique: { type: String },
      tactic: { type: String }
    }],
    threatActors: [{ type: String }]
  },
  
  resolution: {
    summary: { type: String },
    rootCause: { type: String },
    actionsTaken: [{ type: String }],
    lessonsLearned: [{ type: String }],
    recommendations: [{ type: String }]
  },
  
  aiAnalysis: {
    summary: { type: String },
    recommendedActions: [{ type: String }],
    similarCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
    riskScore: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 100 }
  },
  
  closedAt: { type: Date },
  closedBy: { type: String }
}, {
  timestamps: true
});

caseSchema.index({ status: 1, severity: -1 });
caseSchema.index({ assignedTo: 1, status: 1 });
caseSchema.index({ createdAt: -1 });
caseSchema.index({ 'sla.responseDeadline': 1 });
caseSchema.index({ 'sla.resolutionDeadline': 1 });

caseSchema.pre('save', function(next) {
  if (this.isNew) {
    const now = new Date();
    if (!this.sla.responseDeadline) {
      this.sla.responseDeadline = new Date(now.getTime() + this.sla.responseTime * 60000);
    }
    if (!this.sla.resolutionDeadline) {
      this.sla.resolutionDeadline = new Date(now.getTime() + this.sla.resolutionTime * 60000);
    }
  }
  next();
});

caseSchema.methods.addTimelineEvent = async function(action, actor, details, automated = false) {
  this.timeline.push({ action, actor, details, automated });
  await this.save();
};

caseSchema.methods.checkSLA = function() {
  const now = new Date();
  if ((this.sla.responseDeadline && now > this.sla.responseDeadline && !this.metrics.responseTime) ||
      (this.sla.resolutionDeadline && now > this.sla.resolutionDeadline && this.status !== 'resolved' && this.status !== 'closed')) {
    this.sla.breached = true;
  }
  return this.sla.breached;
};

module.exports = mongoose.model('Case', caseSchema);

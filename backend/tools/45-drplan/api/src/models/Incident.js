const mongoose = require('mongoose');

const incidentTimelineSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  event: { type: String, required: true },
  description: { type: String },
  recordedBy: { type: String },
  eventType: { type: String, enum: ['detection', 'notification', 'escalation', 'action', 'update', 'resolution', 'communication'] }
});

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  
  incidentType: {
    type: String,
    enum: ['outage', 'degradation', 'security', 'natural-disaster', 'infrastructure-failure', 
           'network-failure', 'data-loss', 'ransomware', 'human-error', 'vendor-outage', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'identified', 'dr-activated', 'recovering', 'recovered', 'post-mortem', 'closed'],
    default: 'detected'
  },
  
  // Timing
  detectedAt: { type: Date, required: true },
  acknowledgedAt: { type: Date },
  drActivatedAt: { type: Date },
  recoveryStartedAt: { type: Date },
  recoveredAt: { type: Date },
  closedAt: { type: Date },
  
  // Duration Metrics
  timeToAcknowledge: { type: Number }, // minutes
  timeToActivateDR: { type: Number },
  timeToRecover: { type: Number },
  totalDowntime: { type: Number },
  
  // Impact
  impact: {
    affectedSystems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'System' }],
    affectedSites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' }],
    affectedUsers: { type: Number },
    affectedCustomers: { type: Number },
    revenueImpact: { type: Number },
    dataLoss: { type: String },
    slaBreached: { type: Boolean, default: false },
    regulatoryImpact: { type: String }
  },
  
  // DR Execution
  drExecution: {
    planActivated: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoveryPlan' },
    runbooksExecuted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Runbook' }],
    failoverSite: { type: mongoose.Schema.Types.ObjectId, ref: 'RecoverySite' },
    failoverSuccessful: { type: Boolean },
    actualRTO: { type: Number },
    actualRPO: { type: Number },
    rtoMet: { type: Boolean },
    rpoMet: { type: Boolean }
  },
  
  // Response Team
  incidentCommander: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  responseTeam: [{
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    role: { type: String },
    joinedAt: { type: Date },
    leftAt: { type: Date }
  }],
  
  // Timeline
  timeline: [incidentTimelineSchema],
  
  // Root Cause
  rootCause: {
    category: { type: String },
    description: { type: String },
    identifiedAt: { type: Date },
    identifiedBy: { type: String },
    contributingFactors: [{ type: String }]
  },
  
  // Resolution
  resolution: {
    description: { type: String },
    steps: [{ type: String }],
    workarounds: [{ type: String }],
    permanentFix: { type: String },
    preventionMeasures: [{ type: String }]
  },
  
  // Communication
  communications: [{
    timestamp: { type: Date },
    channel: { type: String },
    audience: { type: String },
    message: { type: String },
    sentBy: { type: String }
  }],
  externalCommunicationRequired: { type: Boolean, default: false },
  customerNotified: { type: Boolean, default: false },
  regulatorNotified: { type: Boolean, default: false },
  
  // Post-Mortem
  postMortem: {
    scheduled: { type: Boolean, default: false },
    scheduledDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    documentUrl: { type: String },
    lessonsLearned: [{ type: String }],
    actionItems: [{
      description: { type: String },
      assignee: { type: String },
      dueDate: { type: Date },
      status: { type: String, enum: ['pending', 'in-progress', 'completed'] },
      completedAt: { type: Date }
    }]
  },
  
  // Related
  relatedIncidents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }],
  ticketId: { type: String }, // External ticketing system
  changeRequestId: { type: String },
  
  // Documentation
  attachments: [{
    name: { type: String },
    type: { type: String },
    url: { type: String },
    uploadedAt: { type: Date }
  }],
  
  // Metadata
  reportedBy: { type: String },
  tags: [{ type: String }],
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ detectedAt: -1 });
incidentSchema.index({ incidentType: 1 });
incidentSchema.index({ 'impact.affectedSystems': 1 });

module.exports = mongoose.model('Incident', incidentSchema);

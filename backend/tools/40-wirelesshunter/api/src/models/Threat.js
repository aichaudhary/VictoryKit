const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  // Threat Identification
  threatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Threat Classification
  threatType: {
    type: String,
    required: true,
    enum: [
      'rogue_ap',
      'evil_twin',
      'deauth_attack',
      'mitm_attack',
      'brute_force',
      'wep_attack',
      'wps_attack',
      'kr00k_vulnerability',
      'krack_attack',
      'beacon_flood',
      'packet_injection',
      'rf_jamming',
      'unauthorized_device',
      'weak_encryption',
      'misconfiguration',
      'anomalous_behavior',
      'data_exfiltration',
      'insider_threat',
      'other'
    ],
    index: true
  },
  
  // Severity
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    index: true
  },
  
  // Source Information
  source: {
    type: {
      type: String,
      enum: ['device', 'access_point', 'network', 'external', 'unknown']
    },
    identifier: String,
    macAddress: String,
    ipAddress: String,
    location: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Target Information
  target: {
    type: {
      type: String,
      enum: ['device', 'access_point', 'network', 'multiple', 'unknown']
    },
    identifier: String,
    macAddress: String,
    ipAddress: String,
    affectedCount: Number,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Detection Information
  detectionTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  detectionMethod: {
    type: String,
    enum: ['signature', 'anomaly', 'behavioral', 'ml_model', 'manual', 'external_feed']
  },
  detectedBy: String,
  mlConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Status and Resolution
  status: {
    type: String,
    required: true,
    enum: ['active', 'investigating', 'contained', 'resolved', 'false_positive', 'ignored'],
    default: 'active',
    index: true
  },
  resolutionTime: Date,
  resolvedBy: String,
  resolutionNotes: String,
  
  // Threat Details
  description: {
    type: String,
    required: true
  },
  technicalDetails: mongoose.Schema.Types.Mixed,
  
  // Impact Assessment
  impact: {
    confidentiality: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    integrity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    availability: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    businessImpact: String,
    affectedAssets: [String],
    estimatedDamage: Number
  },
  
  // Response Actions
  responseActions: [{
    action: {
      type: String,
      enum: ['block_device', 'quarantine_device', 'disable_ap', 'alert_sent', 'ticket_created', 'escalated', 'manual_intervention', 'automated_mitigation']
    },
    performedAt: Date,
    performedBy: String,
    result: String,
    details: String
  }],
  
  // Evidence and Artifacts
  evidence: [{
    type: {
      type: String,
      enum: ['packet_capture', 'log_entry', 'screenshot', 'report', 'other']
    },
    description: String,
    filePath: String,
    timestamp: Date,
    hash: String
  }],
  
  // Attack Vector
  attackVector: {
    entry: String,
    methodology: String,
    tools: [String],
    indicators: [String]
  },
  
  // Indicators of Compromise
  iocs: [{
    type: {
      type: String,
      enum: ['mac_address', 'ip_address', 'ssid', 'signature', 'pattern', 'behavior']
    },
    value: String,
    confidence: Number
  }],
  
  // Related Threats
  relatedThreats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat'
  }],
  
  // Notification and Escalation
  notifications: [{
    recipient: String,
    method: {
      type: String,
      enum: ['email', 'sms', 'webhook', 'ticket', 'dashboard']
    },
    sentAt: Date,
    acknowledged: Boolean,
    acknowledgedAt: Date
  }],
  escalated: Boolean,
  escalatedTo: String,
  escalatedAt: Date,
  
  // MITRE ATT&CK Mapping
  mitreAttack: {
    tactics: [String],
    techniques: [String],
    subTechniques: [String]
  },
  
  // Compliance Impact
  complianceImpact: {
    frameworks: [String],
    requiresReporting: Boolean,
    reportingDeadline: Date,
    breachNotification: Boolean
  },
  
  // Timeline
  timeline: [{
    timestamp: Date,
    event: String,
    details: String,
    performedBy: String
  }],
  
  // Metadata
  tags: [String],
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes
threatSchema.index({ threatType: 1, status: 1 });
threatSchema.index({ severity: 1, detectionTime: -1 });
threatSchema.index({ status: 1, detectionTime: -1 });
threatSchema.index({ 'source.macAddress': 1 });
threatSchema.index({ 'target.macAddress': 1 });

// Methods
threatSchema.methods.escalate = function(escalatedTo) {
  this.escalated = true;
  this.escalatedTo = escalatedTo;
  this.escalatedAt = new Date();
  this.timeline.push({
    timestamp: new Date(),
    event: 'escalated',
    details: `Threat escalated to ${escalatedTo}`,
    performedBy: 'system'
  });
};

threatSchema.methods.resolve = function(resolvedBy, notes) {
  this.status = 'resolved';
  this.resolutionTime = new Date();
  this.resolvedBy = resolvedBy;
  this.resolutionNotes = notes;
  this.timeline.push({
    timestamp: new Date(),
    event: 'resolved',
    details: notes,
    performedBy: resolvedBy
  });
};

threatSchema.methods.calculatePriority = function() {
  let priority = 3;
  
  // Severity impact
  const severityMap = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
  priority = severityMap[this.severity] || 3;
  
  // Active threats get higher priority
  if (this.status === 'active') priority = Math.min(priority + 1, 5);
  
  // High confidence ML detections
  if (this.mlConfidence && this.mlConfidence > 0.9) priority = Math.min(priority + 1, 5);
  
  this.priority = priority;
  return priority;
};

module.exports = mongoose.model('Threat', threatSchema);

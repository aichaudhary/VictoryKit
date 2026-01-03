const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Alert Identification
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Alert Type
  type: {
    type: String,
    enum: [
      'new_device',           // Unknown device detected
      'rogue_device',         // Unauthorized device
      'device_offline',       // Device went offline
      'device_online',        // Device came back online
      'vulnerability',        // New vulnerability detected
      'critical_vuln',        // Critical CVE found
      'exploit_attempt',      // Exploit attempt detected
      'brute_force',          // Brute force attempt
      'default_credentials',  // Default password detected
      'weak_password',        // Weak credentials found
      'port_change',          // Port configuration changed
      'service_change',       // Service changed
      'firmware_outdated',    // Firmware needs update
      'firmware_vulnerable',  // Firmware has CVE
      'behavior_anomaly',     // Unusual behavior
      'traffic_anomaly',      // Unusual traffic pattern
      'protocol_violation',   // Protocol abuse
      'compliance_violation', // Compliance issue
      'network_scan',         // Network scan detected
      'lateral_movement',     // Potential lateral movement
      'data_exfiltration',    // Potential data exfil
      'dos_attack',           // DoS attack detected
      'certificate_expiry',   // SSL cert expiring
      'maintenance_due',      // Scheduled maintenance
      'threshold_exceeded',   // Metric threshold exceeded
      'custom'                // Custom alert type
    ],
    required: true,
    index: true
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive', 'ignored'],
    default: 'new',
    index: true
  },
  
  // Title & Description
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  
  // Source
  source: {
    type: {
      type: String,
      enum: ['scan', 'monitor', 'baseline', 'api', 'integration', 'ml', 'rule', 'user'],
      required: true
    },
    scanId: String,
    monitorId: String,
    ruleId: String,
    integrationName: String
  },
  
  // Affected Device(s)
  affectedDevices: [{
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    deviceName: String,
    ipAddress: String,
    macAddress: String,
    deviceType: String
  }],
  
  // Related Vulnerability (if applicable)
  vulnerability: {
    cveId: String,
    cvssScore: Number,
    severity: String,
    vulnerabilityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability'
    }
  },
  
  // Network Context
  network: {
    sourceIp: String,
    destinationIp: String,
    sourcePort: Number,
    destinationPort: Number,
    protocol: String,
    segment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Segment'
    }
  },
  
  // Location Context
  location: {
    building: String,
    floor: String,
    room: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    country: String,
    city: String
  },
  
  // Threat Intelligence
  threatIntel: {
    iocType: String,
    iocValue: String,
    threatActor: String,
    campaign: String,
    malwareFamily: String,
    confidence: { type: Number, min: 0, max: 100 },
    sources: [String]
  },
  
  // Behavioral Data
  behavioral: {
    baselineDeviation: Number,
    expectedValue: mongoose.Schema.Types.Mixed,
    actualValue: mongoose.Schema.Types.Mixed,
    metric: String
  },
  
  // Risk Score
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    index: true
  },
  
  // Timestamps
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  lastUpdatedAt: Date,
  escalatedAt: Date,
  
  // Assignment
  assignedTo: {
    userId: String,
    userName: String,
    email: String,
    assignedAt: Date
  },
  
  // Escalation
  escalation: {
    level: { type: Number, default: 0 },
    escalatedBy: String,
    reason: String,
    notifiedUsers: [{
      userId: String,
      notifiedAt: Date,
      channel: String
    }]
  },
  
  // Resolution
  resolution: {
    method: {
      type: String,
      enum: ['manual', 'automated', 'patched', 'quarantined', 'removed', 'accepted_risk', 'false_positive']
    },
    notes: String,
    resolvedBy: String,
    timeToResolve: Number  // milliseconds
  },
  
  // Related Alerts (for correlation)
  relatedAlerts: [{
    alertId: String,
    alertRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    },
    relationship: {
      type: String,
      enum: ['parent', 'child', 'related', 'duplicate']
    }
  }],
  
  // Evidence/Artifacts
  evidence: [{
    type: {
      type: String,
      enum: ['log', 'pcap', 'screenshot', 'file', 'memory_dump', 'config']
    },
    filename: String,
    path: String,
    size: Number,
    hash: String,
    uploadedAt: Date
  }],
  
  // Comments/Notes
  comments: [{
    userId: String,
    userName: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: true }
  }],
  
  // Actions Taken
  actions: [{
    type: {
      type: String,
      enum: ['notification_sent', 'device_quarantined', 'port_blocked', 'credential_reset', 
             'firmware_update_triggered', 'scan_initiated', 'escalated', 'ticket_created']
    },
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed,
    automated: Boolean,
    successful: Boolean
  }],
  
  // Notification Status
  notifications: {
    email: { sent: Boolean, sentAt: Date, recipients: [String] },
    slack: { sent: Boolean, sentAt: Date, channel: String },
    sms: { sent: Boolean, sentAt: Date, recipients: [String] },
    webhook: { sent: Boolean, sentAt: Date, url: String },
    pagerduty: { sent: Boolean, sentAt: Date, incidentId: String }
  },
  
  // SIEM/SOAR Integration
  integrations: {
    siemEventId: String,
    soarCaseId: String,
    ticketId: String,
    ticketUrl: String
  },
  
  // ML/AI Analysis
  aiAnalysis: {
    confidence: Number,
    prediction: String,
    explanation: String,
    suggestedActions: [String],
    analyzedAt: Date
  },
  
  // Suppression
  suppressed: {
    type: Boolean,
    default: false
  },
  suppressedUntil: Date,
  suppressionReason: String,
  
  // Tags & Categories
  tags: [String],
  category: String,
  subcategory: String,
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tenant/Organization (for multi-tenancy)
  tenantId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
alertSchema.index({ severity: 1, status: 1, detectedAt: -1 });
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ 'affectedDevices.deviceId': 1 });
alertSchema.index({ 'vulnerability.cveId': 1 });
alertSchema.index({ riskScore: -1 });
alertSchema.index({ tenantId: 1, status: 1, detectedAt: -1 });

// Pre-save to generate alertId
alertSchema.pre('save', function(next) {
  if (!this.alertId) {
    const severityPrefix = this.severity.charAt(0).toUpperCase();
    this.alertId = `ALT-${severityPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  this.lastUpdatedAt = new Date();
  next();
});

// Virtual for time since detection
alertSchema.virtual('age').get(function() {
  return Date.now() - this.detectedAt;
});

// Virtual for SLA status
alertSchema.virtual('slaStatus').get(function() {
  const ageHours = this.age / (1000 * 60 * 60);
  const slaThresholds = {
    critical: 1,
    high: 4,
    medium: 24,
    low: 72,
    info: 168
  };
  const threshold = slaThresholds[this.severity] || 24;
  
  if (this.status === 'resolved') return 'met';
  if (ageHours > threshold) return 'breached';
  if (ageHours > threshold * 0.75) return 'at_risk';
  return 'within';
});

// Static method to get critical unresolved
alertSchema.statics.getCriticalUnresolved = function() {
  return this.find({
    severity: 'critical',
    status: { $nin: ['resolved', 'false_positive', 'ignored'] }
  }).sort({ detectedAt: -1 });
};

// Static method to get alert counts by severity
alertSchema.statics.getCountsBySeverity = function(tenantId) {
  const match = { status: { $nin: ['resolved', 'false_positive', 'ignored'] } };
  if (tenantId) match.tenantId = tenantId;
  
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$severity', count: { $sum: 1 } } }
  ]);
};

// Static method to get alert stats
alertSchema.statics.getStats = async function(tenantId, timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  const match = { detectedAt: { $gte: since } };
  if (tenantId) match.tenantId = tenantId;
  
  const [total, bySeverity, byType, avgResolutionTime] = await Promise.all([
    this.countDocuments(match),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    this.aggregate([
      { $match: { ...match, 'resolution.timeToResolve': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$resolution.timeToResolve' } } }
    ])
  ]);
  
  return {
    total,
    bySeverity: bySeverity.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    byType,
    avgResolutionTime: avgResolutionTime[0]?.avg || 0
  };
};

// Instance method to acknowledge
alertSchema.methods.acknowledge = async function(userId, userName) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.assignedTo = { userId, userName, assignedAt: new Date() };
  return this.save();
};

// Instance method to resolve
alertSchema.methods.resolve = async function(resolution) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolution = {
    ...resolution,
    timeToResolve: this.resolvedAt - this.detectedAt
  };
  return this.save();
};

// Instance method to escalate
alertSchema.methods.escalate = async function(escalatedBy, reason) {
  this.escalation.level += 1;
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.reason = reason;
  this.escalatedAt = new Date();
  return this.save();
};

// Instance method to add comment
alertSchema.methods.addComment = async function(userId, userName, content, isInternal = true) {
  this.comments.push({ userId, userName, content, isInternal });
  return this.save();
};

// Instance method to suppress
alertSchema.methods.suppress = async function(until, reason) {
  this.suppressed = true;
  this.suppressedUntil = until;
  this.suppressionReason = reason;
  return this.save();
};

module.exports = mongoose.model('Alert', alertSchema);

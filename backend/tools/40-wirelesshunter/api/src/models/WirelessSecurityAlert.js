const mongoose = require('mongoose');

const wirelessSecurityAlertSchema = new mongoose.Schema({
  // Alert Identification
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Alert Classification
  alertType: {
    type: String,
    enum: [
      'rogue-access-point',
      'evil-twin-attack',
      'deauthentication-attack',
      'weak-encryption',
      'unauthorized-client',
      'mac-spoofing',
      'signal-interference',
      'channel-hopping',
      'jamming-attack',
      'karma-attack',
      'wps-attack',
      'pmkid-attack',
      'dragonblood-attack',
      'kr00k-attack',
      'fragattacks',
      'policy-violation',
      'bandwidth-abuse',
      'ap-impersonation',
      'honeypot-detected',
      'captive-portal-bypass',
      'radius-attack',
      'certificate-mismatch',
      'unknown-device',
      'geofence-violation'
    ],
    required: true,
    index: true
  },
  
  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false-positive', 'escalated'],
    default: 'new',
    index: true
  },
  
  // Alert Details
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Affected Network
  affectedNetwork: {
    networkId: String,
    ssid: String,
    bssid: String,
    channel: Number,
    frequency: String
  },
  
  // Source Information
  source: {
    type: {
      type: String,
      enum: ['access-point', 'client', 'wids', 'manual', 'ml-engine', 'integration', 'sensor']
    },
    identifier: String,
    ipAddress: String,
    macAddress: String,
    hostname: String,
    deviceType: String
  },
  
  // Target Information (if applicable)
  target: {
    ssid: String,
    bssid: String,
    clientMac: String,
    ipAddress: String
  },
  
  // Location Context
  location: {
    building: String,
    floor: Number,
    zone: String,
    accessPointId: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Technical Details
  technicalDetails: {
    signalStrength: Number,
    channel: Number,
    frequency: String,
    encryptionType: String,
    attackVector: String,
    packetCount: Number,
    frameTypes: [String],
    vendorOUI: String,
    rawData: mongoose.Schema.Types.Mixed
  },
  
  // Risk Assessment
  riskAssessment: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    impactedAssets: [{
      assetType: String,
      assetId: String,
      assetName: String
    }],
    potentialImpact: {
      type: String,
      enum: ['none', 'minimal', 'moderate', 'significant', 'severe', 'catastrophic']
    },
    mitreTactics: [String],
    mitreTechniques: [String]
  },
  
  // Response Actions
  responseActions: {
    automated: [{
      action: {
        type: String,
        enum: ['block-client', 'quarantine-network', 'disable-ssid', 'alert-admin', 'contain-threat', 'isolate-ap', 'trigger-scan', 'update-policy']
      },
      executedAt: Date,
      success: Boolean,
      details: String
    }],
    manual: [{
      action: String,
      performedBy: String,
      performedAt: Date,
      notes: String
    }],
    recommended: [{
      action: String,
      priority: {
        type: String,
        enum: ['immediate', 'high', 'medium', 'low']
      },
      description: String
    }]
  },
  
  // Resolution
  resolution: {
    resolvedAt: Date,
    resolvedBy: String,
    resolutionType: {
      type: String,
      enum: ['blocked', 'removed', 'patched', 'policy-update', 'false-positive', 'monitoring', 'accepted-risk', 'external-resolution']
    },
    notes: String,
    rootCause: String,
    preventiveMeasures: [String]
  },
  
  // Correlation
  correlation: {
    relatedAlerts: [String],
    campaignId: String,
    attackerProfile: {
      macAddresses: [String],
      knownThreatActor: Boolean,
      threatActorName: String
    },
    ioc: [{
      type: String,
      value: String,
      confidence: Number
    }]
  },
  
  // Integrations
  integrations: {
    sentToSIEM: {
      type: Boolean,
      default: false
    },
    siemEventId: String,
    sentToSOAR: {
      type: Boolean,
      default: false
    },
    soarCaseId: String,
    ticketCreated: {
      type: Boolean,
      default: false
    },
    ticketId: String,
    ticketSystem: String,
    notificationsSent: [{
      channel: {
        type: String,
        enum: ['email', 'sms', 'slack', 'teams', 'pagerduty', 'webhook']
      },
      sentAt: Date,
      recipients: [String],
      success: Boolean
    }]
  },
  
  // Assignment
  assignment: {
    assignedTo: String,
    assignedAt: Date,
    assignedBy: String,
    team: String,
    escalationLevel: {
      type: Number,
      default: 0
    },
    slaDeadline: Date,
    slaBreached: {
      type: Boolean,
      default: false
    }
  },
  
  // Comments and Notes
  comments: [{
    author: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: true
    }
  }],
  
  // Evidence
  evidence: [{
    type: {
      type: String,
      enum: ['pcap', 'screenshot', 'log', 'packet-analysis', 'spectrum-analysis', 'report']
    },
    filename: String,
    fileSize: Number,
    storagePath: String,
    uploadedAt: Date,
    uploadedBy: String
  }],
  
  // Timestamps
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
wirelessSecurityAlertSchema.index({ alertType: 1, severity: 1, status: 1 });
wirelessSecurityAlertSchema.index({ 'affectedNetwork.ssid': 1 });
wirelessSecurityAlertSchema.index({ 'location.building': 1, 'location.floor': 1 });
wirelessSecurityAlertSchema.index({ detectedAt: -1 });
wirelessSecurityAlertSchema.index({ 'assignment.assignedTo': 1, status: 1 });

module.exports = mongoose.model('WirelessSecurityAlert', wirelessSecurityAlertSchema);

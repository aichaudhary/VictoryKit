const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vendor: {
    type: String,
    required: true,
    enum: ['pfsense', 'palo-alto', 'fortinet', 'checkpoint', 'cisco-asa', 'aws', 'azure', 'gcp', 'other'],
    index: true
  },
  device: {
    id: String,
    name: String,
    ip: String,
    location: String
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
    enum: ['threat', 'policy-violation', 'configuration', 'performance', 'compliance', 'system', 'other'],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'intrusion', 'malware', 'phishing', 'ddos', 'scan', 'brute-force',
      'policy-violation', 'config-change', 'high-traffic', 'compliance-failure',
      'system-error', 'license-expiry', 'other'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  source: {
    ip: String,
    port: Number,
    mac: String,
    hostname: String,
    country: String,
    asn: String
  },
  destination: {
    ip: String,
    port: Number,
    mac: String,
    hostname: String,
    country: String,
    asn: String
  },
  protocol: {
    type: String,
    enum: ['tcp', 'udp', 'icmp', 'ip', 'gre', 'esp', 'ah', 'sctp', 'other']
  },
  rule: {
    id: String,
    name: String,
    policyId: String,
    policyName: String
  },
  threat: {
    detected: {
      type: Boolean,
      default: false
    },
    type: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    signature: {
      id: String,
      name: String,
      category: String
    },
    indicators: [{
      type: String,
      value: String,
      type: {
        type: String,
        enum: ['ip', 'domain', 'url', 'hash', 'email', 'file', 'other']
      }
    }]
  },
  impact: {
    scope: {
      type: String,
      enum: ['single-host', 'subnet', 'network', 'organization', 'internet']
    },
    affected: {
      hosts: Number,
      users: Number,
      services: Number
    },
    potential: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical']
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false-positive', 'suppressed'],
    default: 'new',
    index: true
  },
  assignedTo: {
    userId: String,
    username: String,
    email: String
  },
  tags: [{
    type: String,
    index: true
  }],
  mitigation: {
    actions: [{
      type: String,
      timestamp: Date,
      user: String,
      description: String,
      success: Boolean
    }],
    recommendations: [{
      type: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: String,
      automated: Boolean
    }],
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'failed'],
      default: 'pending'
    }
  },
  notifications: {
    sent: [{
      channel: {
        type: String,
        enum: ['email', 'slack', 'teams', 'pagerduty', 'webhook', 'sms']
      },
      recipient: String,
      timestamp: Date,
      success: Boolean
    }],
    escalation: {
      enabled: {
        type: Boolean,
        default: false
      },
      levels: [{
        delay: Number, // minutes
        channels: [{
          type: String,
          enum: ['email', 'slack', 'teams', 'pagerduty', 'webhook', 'sms']
        }],
        recipients: [String]
      }]
    }
  },
  compliance: {
    frameworks: [{
      type: String,
      enum: ['pci-dss', 'hipaa', 'sox', 'gdpr', 'nist', 'iso-27001']
    }],
    violations: [{
      framework: String,
      requirement: String,
      description: String
    }]
  },
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [{
      type: String,
      weight: Number
    }]
  },
  metadata: {
    correlationId: String,
    parentAlertId: String,
    childAlerts: [String],
    sourceLogId: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  // Advanced ML and AI features
  mlAnalysis: {
    processed: {
      type: Boolean,
      default: false
    },
    threatScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    behavioralScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    predictions: {
      attackType: String,
      attackVector: String,
      likelihood: Number,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      timeToCompromise: Number // in minutes
    },
    correlations: [{
      alertId: mongoose.Schema.Types.ObjectId,
      correlationType: String,
      strength: Number,
      description: String
    }],
    falsePositiveProbability: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    lastAnalyzed: Date
  },
  // Automated response and orchestration
  automation: {
    enabled: {
      type: Boolean,
      default: true
    },
    playbook: {
      id: String,
      name: String,
      version: String,
      executed: {
        type: Boolean,
        default: false
      },
      steps: [{
        stepId: String,
        name: String,
        type: {
          type: String,
          enum: ['action', 'decision', 'wait', 'notification']
        },
        executedAt: Date,
        result: String,
        success: Boolean,
        error: String
      }]
    },
    actions: [{
      type: {
        type: String,
        enum: ['block-ip', 'rate-limit', 'quarantine', 'isolate', 'patch', 'restart-service', 'disable-user', 'alert-team']
      },
      executedAt: Date,
      result: String,
      success: Boolean,
      automated: {
        type: Boolean,
        default: true
      },
      parameters: mongoose.Schema.Types.Mixed
    }],
    decisions: [{
      type: {
        type: String,
        enum: ['escalate', 'suppress', 'ignore', 'investigate']
      },
      reason: String,
      confidence: Number,
      executedAt: Date
    }]
  },
  // Enterprise integrations
  integrations: {
    siem: {
      exported: {
        type: Boolean,
        default: false
      },
      systems: [{
        name: {
          type: String,
          enum: ['splunk', 'elk', 'qradar', 'sentinel', 'other']
        },
        exportedAt: Date,
        status: {
          type: String,
          enum: ['success', 'failed', 'pending']
        },
        referenceId: String,
        correlationId: String
      }]
    },
    soar: {
      processed: {
        type: Boolean,
        default: false
      },
      incidents: [{
        incidentId: String,
        system: {
          type: String,
          enum: ['cortex-xsoar', 'swimlane', 'resilient', 'other']
        },
        createdAt: Date,
        status: {
          type: String,
          enum: ['new', 'investigating', 'contained', 'resolved', 'closed']
        },
        severity: String,
        assignee: String,
        playbook: String
      }]
    },
    edr: {
      scanned: {
        type: Boolean,
        default: false
      },
      results: [{
        system: {
          type: String,
          enum: ['crowdstrike', 'defender', 'sentinelone', 'other']
        },
        scannedAt: Date,
        verdict: {
          type: String,
          enum: ['clean', 'suspicious', 'malicious', 'unknown']
        },
        actions: [{
          type: String,
          executedAt: Date,
          result: String
        }],
        quarantine: {
          applied: Boolean,
          timestamp: Date,
          scope: String
        }
      }]
    },
    threatIntel: {
      enriched: {
        type: Boolean,
        default: false
      },
      sources: [{
        name: {
          type: String,
          enum: ['alienvault-otx', 'recorded-future', 'mandiant', 'other']
        },
        enrichedAt: Date,
        intelligence: {
          reputation: String,
          tags: [String],
          campaigns: [String],
          actors: [String],
          malware: [String],
          cve: [String]
        }
      }]
    },
    ticketing: {
      created: {
        type: Boolean,
        default: false
      },
      systems: [{
        name: {
          type: String,
          enum: ['jira', 'servicenow', 'zendesk', 'other']
        },
        ticketId: String,
        createdAt: Date,
        status: String,
        assignee: String,
        priority: String
      }]
    }
  },
  // Incident management
  incident: {
    isIncident: {
      type: Boolean,
      default: false
    },
    incidentId: String,
    parentIncidentId: String,
    childIncidents: [String],
    classification: {
      type: {
        type: String,
        enum: ['security-incident', 'data-breach', 'ransomware', 'ddos', 'intrusion', 'other']
      },
      confidence: Number
    },
    timeline: [{
      timestamp: Date,
      event: String,
      user: String,
      description: String,
      evidence: mongoose.Schema.Types.Mixed
    }],
    containment: {
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'failed'],
        default: 'not-started'
      },
      actions: [{
        action: String,
        executedAt: Date,
        result: String,
        success: Boolean
      }],
      effectiveness: {
        type: String,
        enum: ['none', 'partial', 'full'],
        default: 'none'
      }
    },
    eradication: {
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'failed'],
        default: 'not-started'
      },
      actions: [{
        action: String,
        executedAt: Date,
        result: String,
        success: Boolean
      }]
    },
    recovery: {
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'failed'],
        default: 'not-started'
      },
      actions: [{
        action: String,
        executedAt: Date,
        result: String,
        success: Boolean
      }]
    },
    lessonsLearned: {
      documented: {
        type: Boolean,
        default: false
      },
      summary: String,
      recommendations: [String],
      preventiveMeasures: [String]
    }
  },
  // Advanced analytics and reporting
  analytics: {
    trends: {
      similarAlerts: Number,
      frequency: {
        hourly: Number,
        daily: Number,
        weekly: Number
      },
      patterns: [{
        type: String,
        confidence: Number,
        description: String
      }]
    },
    impact: {
      business: {
        downtime: Number, // minutes
        financial: Number, // USD
        reputation: {
          type: String,
          enum: ['none', 'low', 'medium', 'high', 'critical']
        }
      },
      technical: {
        systemsAffected: Number,
        dataExposed: {
          type: String,
          enum: ['none', 'partial', 'full', 'unknown']
        },
        recoveryTime: Number // hours
      }
    },
    attribution: {
      likelyActor: String,
      motivation: {
        type: String,
        enum: ['financial', 'espionage', 'hacktivism', 'state-sponsored', 'other', 'unknown']
      },
      sophistication: {
        type: String,
        enum: ['script-kiddie', 'intermediate', 'advanced', 'apt', 'nation-state']
      },
      confidence: Number
    }
  },
  // Real-time processing
  realtime: {
    processingTime: Number,
    queuePosition: Number,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal'
    },
    sla: {
      responseTime: Number, // minutes
      resolutionTime: Number, // hours
      breached: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: false, // We use timestamp field instead
  collection: 'alerts'
});

// Compound indexes for performance
alertSchema.index({ timestamp: -1, severity: 1 });
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ category: 1, type: 1, timestamp: -1 });
alertSchema.index({ 'threat.detected': 1, timestamp: -1 });
alertSchema.index({ vendor: 1, timestamp: -1 });

// TTL index for automatic cleanup (180 days for alerts)
alertSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 });

// Virtual for formatted timestamp
alertSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Virtual for age in hours
alertSchema.virtual('ageHours').get(function() {
  return Math.floor((Date.now() - this.timestamp) / (1000 * 60 * 60));
});

// Instance method to acknowledge alert
alertSchema.methods.acknowledge = function(userId, username) {
  this.status = 'acknowledged';
  this.assignedTo = { userId, username };
  return this.save();
};

// Instance method to resolve alert
alertSchema.methods.resolve = function(userId, username, resolution = '') {
  this.status = 'resolved';
  this.assignedTo = { userId, username };
  this.mitigation.actions.push({
    type: 'resolution',
    timestamp: new Date(),
    user: username,
    description: resolution,
    success: true
  });
  this.mitigation.status = 'completed';
  return this.save();
};

// Instance method to escalate alert
alertSchema.methods.escalate = function() {
  if (this.notifications.escalation.enabled) {
    // Logic for escalation would be handled by notification service
    return true;
  }
  return false;
};

// Instance method to check if alert needs escalation
alertSchema.methods.needsEscalation = function() {
  if (!this.notifications.escalation.enabled || this.status !== 'new') {
    return false;
  }

  const ageHours = this.ageHours;
  const escalationLevel = this.notifications.escalation.levels.find(level =>
    ageHours >= level.delay / 60 // convert minutes to hours
  );

  return !!escalationLevel;
};

// Static method to find active alerts
alertSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['new', 'acknowledged', 'investigating'] }
  }).sort({ timestamp: -1 });
};

// Static method to find alerts by severity
alertSchema.statics.findBySeverity = function(severity, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    severity: severity,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to find threats
alertSchema.statics.findThreats = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    'threat.detected': true,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to get alert statistics
alertSchema.statics.getAlertStats = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          severity: '$severity',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.severity',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

module.exports = mongoose.model('Alert', alertSchema);
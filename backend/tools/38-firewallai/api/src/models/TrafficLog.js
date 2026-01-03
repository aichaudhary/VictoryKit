const mongoose = require('mongoose');

const trafficLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
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
  session: {
    id: {
      type: String,
      index: true
    },
    startTime: Date,
    endTime: Date,
    duration: Number // in milliseconds
  },
  source: {
    ip: {
      type: String,
      required: true,
      index: true
    },
    port: {
      type: Number,
      min: 1,
      max: 65535
    },
    mac: String,
    hostname: String,
    country: String,
    region: String,
    city: String,
    asn: String,
    organization: String
  },
  destination: {
    ip: {
      type: String,
      required: true,
      index: true
    },
    port: {
      type: Number,
      min: 1,
      max: 65535
    },
    mac: String,
    hostname: String,
    country: String,
    region: String,
    city: String,
    asn: String,
    organization: String
  },
  protocol: {
    type: String,
    required: true,
    enum: ['tcp', 'udp', 'icmp', 'ip', 'gre', 'esp', 'ah', 'sctp', 'other'],
    index: true
  },
  application: {
    name: String,
    category: String,
    subcategory: String,
    technology: String,
    risk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'unknown']
    }
  },
  action: {
    type: String,
    required: true,
    enum: ['allow', 'deny', 'reject', 'drop', 'reset', 'alert', 'log'],
    index: true
  },
  rule: {
    id: String,
    name: String,
    policyId: String,
    policyName: String
  },
  interface: {
    inbound: String,
    outbound: String
  },
  zone: {
    source: String,
    destination: String
  },
  traffic: {
    bytes: {
      sent: {
        type: Number,
        default: 0
      },
      received: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    packets: {
      sent: {
        type: Number,
        default: 0
      },
      received: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    flags: {
      syn: Boolean,
      ack: Boolean,
      fin: Boolean,
      rst: Boolean,
      psh: Boolean,
      urg: Boolean
    }
  },
  threat: {
    detected: {
      type: Boolean,
      default: false,
      index: true
    },
    type: {
      type: String,
      enum: ['malware', 'phishing', 'c2c', 'exploit', 'vulnerability', 'spyware', 'trojan', 'worm', 'ransomware', 'ddos', 'scan', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
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
    prevention: {
      action: String,
      profile: String
    }
  },
  user: {
    id: String,
    name: String,
    group: String,
    department: String
  },
  url: {
    full: String,
    category: String,
    reputation: {
      type: String,
      enum: ['trusted', 'suspicious', 'malicious', 'unknown']
    }
  },
  file: {
    name: String,
    type: String,
    size: Number,
    hash: {
      md5: String,
      sha1: String,
      sha256: String
    },
    verdict: {
      type: String,
      enum: ['clean', 'malicious', 'suspicious', 'unknown']
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
    logLevel: {
      type: String,
      enum: ['debug', 'info', 'warning', 'error', 'critical'],
      default: 'info'
    },
    source: {
      type: String,
      enum: ['firewall', 'siem', 'ids', 'ips', 'waf', 'proxy', 'other']
    },
    tags: [{
      type: String
    }],
    customFields: mongoose.Schema.Types.Mixed
  },
  // Advanced ML and AI analysis
  mlAnalysis: {
    processed: {
      type: Boolean,
      default: false,
      index: true
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
    indicators: [{
      type: {
        type: String,
        enum: ['ip', 'port', 'protocol', 'behavior', 'signature', 'geolocation', 'timing']
      },
      value: mongoose.Schema.Types.Mixed,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      confidence: Number
    }],
    predictions: {
      attackType: String,
      attackVector: String,
      likelihood: Number,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    },
    correlations: [{
      logId: mongoose.Schema.Types.ObjectId,
      correlationType: String,
      strength: Number,
      description: String
    }],
    lastAnalyzed: Date
  },
  // Real-time processing and alerting
  realtime: {
    processed: {
      type: Boolean,
      default: false
    },
    alertsTriggered: [{
      alertId: String,
      type: String,
      severity: String,
      triggeredAt: Date
    }],
    notificationsSent: [{
      channel: {
        type: String,
        enum: ['email', 'slack', 'teams', 'webhook', 'sms']
      },
      sentAt: Date,
      status: {
        type: String,
        enum: ['sent', 'failed', 'pending']
      }
    }],
    actionsTaken: [{
      type: {
        type: String,
        enum: ['block-ip', 'rate-limit', 'quarantine', 'alert', 'log', 'escalate']
      },
      executedAt: Date,
      result: String,
      automated: {
        type: Boolean,
        default: true
      }
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
        name: String,
        exportedAt: Date,
        status: {
          type: String,
          enum: ['success', 'failed', 'pending']
        },
        referenceId: String
      }]
    },
    soar: {
      processed: {
        type: Boolean,
        default: false
      },
      incidents: [{
        incidentId: String,
        system: String,
        createdAt: Date,
        status: String
      }]
    },
    edr: {
      scanned: {
        type: Boolean,
        default: false
      },
      results: [{
        system: String,
        scannedAt: Date,
        verdict: {
          type: String,
          enum: ['clean', 'suspicious', 'malicious', 'unknown']
        },
        actions: [String]
      }]
    },
    threatIntel: {
      enriched: {
        type: Boolean,
        default: false
      },
      sources: [{
        name: String,
        enrichedAt: Date,
        intelligence: mongoose.Schema.Types.Mixed
      }]
    }
  },
  // Performance and monitoring
  performance: {
    processingTime: {
      type: Number,
      default: 0
    },
    memoryUsage: Number,
    cpuUsage: Number,
    latency: Number,
    throughput: Number
  },
  // Compliance and audit
  audit: {
    complianceChecked: {
      type: Boolean,
      default: false
    },
    violations: [{
      framework: {
        type: String,
        enum: ['pci-dss', 'hipaa', 'sox', 'gdpr', 'nist', 'iso-27001']
      },
      requirement: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: String,
      remediation: String
    }],
    retention: {
      required: {
        type: Boolean,
        default: true
      },
      period: {
        type: Number,
        default: 90
      },
      deleteAfter: Date
    }
  },
  // Advanced analytics
  analytics: {
    session: {
      id: String,
      sequence: Number,
      totalInSession: Number
    },
    patterns: {
      frequency: Number,
      periodicity: String,
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'volatile']
      }
    },
    geo: {
      source: {
        continent: String,
        country: String,
        region: String,
        city: String,
        coordinates: {
          lat: Number,
          lon: Number
        }
      },
      destination: {
        continent: String,
        country: String,
        region: String,
        city: String,
        coordinates: {
          lat: Number,
          lon: Number
        }
      },
      distance: Number,
      routing: String
    },
    network: {
      path: [String],
      hops: Number,
      latency: Number,
      jitter: Number,
      packetLoss: Number
    }
  }
}, {
  timestamps: false, // We use timestamp field instead
  collection: 'traffic_logs',
  capped: { size: 1073741824, max: 1000000 } // 1GB capped collection, max 1M documents
});

// Compound indexes for performance
trafficLogSchema.index({ timestamp: -1, vendor: 1 });
trafficLogSchema.index({ 'source.ip': 1, timestamp: -1 });
trafficLogSchema.index({ 'destination.ip': 1, timestamp: -1 });
trafficLogSchema.index({ protocol: 1, action: 1, timestamp: -1 });
trafficLogSchema.index({ 'threat.detected': 1, timestamp: -1 });
trafficLogSchema.index({ 'application.name': 1, timestamp: -1 });

// TTL index for automatic cleanup (90 days)
trafficLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Virtual for formatted timestamp
trafficLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Instance method to check if traffic is suspicious
trafficLogSchema.methods.isSuspicious = function() {
  return this.threat.detected ||
         this.risk.score > 70 ||
         this.action === 'deny' ||
         this.action === 'reject';
};

// Instance method to get traffic summary
trafficLogSchema.methods.getSummary = function() {
  return {
    timestamp: this.timestamp,
    source: `${this.source.ip}:${this.source.port}`,
    destination: `${this.destination.ip}:${this.destination.port}`,
    protocol: this.protocol,
    action: this.action,
    bytes: this.traffic.bytes.total,
    threat: this.threat.detected
  };
};

// Static method to find logs by IP
trafficLogSchema.statics.findByIP = function(ip, hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    $or: [
      { 'source.ip': ip },
      { 'destination.ip': ip }
    ],
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to find threats
trafficLogSchema.statics.findThreats = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({
    'threat.detected': true,
    timestamp: { $gte: since }
  }).sort({ timestamp: -1 });
};

// Static method to get traffic statistics
trafficLogSchema.statics.getTrafficStats = function(hours = 24) {
  const since = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          action: '$action',
          protocol: '$protocol'
        },
        count: { $sum: 1 },
        totalBytes: { $sum: '$traffic.bytes.total' },
        totalPackets: { $sum: '$traffic.packets.total' }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        protocols: {
          $push: {
            protocol: '$_id.protocol',
            count: '$count',
            bytes: '$totalBytes',
            packets: '$totalPackets'
          }
        },
        totalCount: { $sum: '$count' },
        totalBytes: { $sum: '$totalBytes' },
        totalPackets: { $sum: '$totalPackets' }
      }
    }
  ]);
};

module.exports = mongoose.model('TrafficLog', trafficLogSchema);
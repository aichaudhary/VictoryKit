const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  period: {
    type: String,
    required: true,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    index: true
  },
  periodStart: {
    type: Date,
    required: true,
    index: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  vendor: {
    type: String,
    required: true,
    enum: ['pfsense', 'palo-alto', 'fortinet', 'checkpoint', 'cisco-asa', 'aws', 'azure', 'gcp', 'all'],
    index: true
  },
  device: {
    id: String,
    name: String,
    ip: String,
    location: String
  },
  traffic: {
    total: {
      sessions: {
        type: Number,
        default: 0
      },
      bytes: {
        type: Number,
        default: 0
      },
      packets: {
        type: Number,
        default: 0
      }
    },
    byProtocol: [{
      protocol: {
        type: String,
        enum: ['tcp', 'udp', 'icmp', 'ip', 'gre', 'esp', 'ah', 'sctp', 'other']
      },
      sessions: Number,
      bytes: Number,
      packets: Number,
      percentage: Number
    }],
    byAction: [{
      action: {
        type: String,
        enum: ['allow', 'deny', 'reject', 'drop', 'reset', 'alert', 'log']
      },
      sessions: Number,
      bytes: Number,
      packets: Number,
      percentage: Number
    }],
    byZone: [{
      sourceZone: String,
      destinationZone: String,
      sessions: Number,
      bytes: Number,
      packets: Number
    }],
    topSources: [{
      ip: String,
      hostname: String,
      country: String,
      sessions: Number,
      bytes: Number,
      packets: Number
    }],
    topDestinations: [{
      ip: String,
      hostname: String,
      country: String,
      sessions: Number,
      bytes: Number,
      packets: Number
    }],
    topApplications: [{
      name: String,
      category: String,
      sessions: Number,
      bytes: Number,
      packets: Number
    }]
  },
  security: {
    threats: {
      total: {
        type: Number,
        default: 0
      },
      byType: [{
        type: {
          type: String,
          enum: ['malware', 'phishing', 'c2c', 'exploit', 'vulnerability', 'spyware', 'trojan', 'worm', 'ransomware', 'ddos', 'scan', 'other']
        },
        count: Number,
        blocked: Number,
        percentage: Number
      }],
      bySeverity: [{
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        },
        count: Number,
        percentage: Number
      }]
    },
    alerts: {
      total: {
        type: Number,
        default: 0
      },
      bySeverity: [{
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical']
        },
        count: Number,
        resolved: Number,
        percentage: Number
      }],
      byCategory: [{
        category: {
          type: String,
          enum: ['threat', 'policy-violation', 'configuration', 'performance', 'compliance', 'system', 'other']
        },
        count: Number,
        percentage: Number
      }],
      responseTime: {
        average: Number, // in minutes
        median: Number,
        p95: Number
      }
    },
    compliance: {
      violations: {
        total: Number,
        byFramework: [{
          framework: {
            type: String,
            enum: ['pci-dss', 'hipaa', 'sox', 'gdpr', 'nist', 'iso-27001']
          },
          count: Number,
          percentage: Number
        }]
      },
      score: {
        overall: {
          type: Number,
          min: 0,
          max: 100
        },
        byFramework: [{
          framework: String,
          score: Number
        }]
      }
    }
  },
  performance: {
    throughput: {
      current: Number, // Mbps
      average: Number,
      peak: Number,
      utilization: Number // percentage
    },
    latency: {
      average: Number, // ms
      p95: Number,
      p99: Number
    },
    connections: {
      active: Number,
      established: Number,
      failed: Number,
      rate: Number // connections per second
    },
    cpu: {
      usage: Number, // percentage
      cores: Number
    },
    memory: {
      usage: Number, // percentage
      total: Number, // MB
      available: Number // MB
    },
    disk: {
      usage: Number, // percentage
      total: Number, // GB
      available: Number // GB
    }
  },
  risk: {
    score: {
      current: {
        type: Number,
        min: 0,
        max: 100
      },
      trend: {
        type: String,
        enum: ['improving', 'stable', 'deteriorating']
      },
      change: Number // percentage change from previous period
    },
    factors: [{
      factor: String,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      score: Number,
      trend: String
    }],
    recommendations: [{
      type: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: String,
      impact: String
    }]
  },
  predictions: {
    threatLevel: {
      nextHour: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      nextDay: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      confidence: Number
    },
    traffic: {
      predictedSessions: Number,
      predictedBytes: Number,
      confidence: Number
    },
    anomalies: [{
      type: String,
      probability: Number,
      description: String
    }]
  },
  metadata: {
    dataSources: [String],
    calculationTime: Number, // in milliseconds
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    customMetrics: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: false, // We use timestamp field instead
  collection: 'analytics'
});

// Compound indexes for performance
analyticsSchema.index({ period: 1, periodStart: 1, vendor: 1 });
analyticsSchema.index({ timestamp: -1, vendor: 1 });
analyticsSchema.index({ 'security.threats.total': -1 });

// TTL index for automatic cleanup (1 year for analytics)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Virtual for formatted period
analyticsSchema.virtual('formattedPeriod').get(function() {
  return `${this.periodStart.toISOString()} - ${this.periodEnd.toISOString()}`;
});

// Instance method to calculate risk score
analyticsSchema.methods.calculateRiskScore = function() {
  let score = 0;

  // Threat-based scoring
  const threatRatio = this.security.threats.total / Math.max(this.traffic.total.sessions, 1);
  score += Math.min(threatRatio * 100, 40);

  // Alert-based scoring
  const alertRatio = this.security.alerts.total / Math.max(this.traffic.total.sessions, 1);
  score += Math.min(alertRatio * 100, 30);

  // Performance-based scoring
  if (this.performance.cpu.usage > 90) score += 10;
  if (this.performance.memory.usage > 90) score += 10;
  if (this.performance.throughput.utilization > 95) score += 10;

  // Compliance-based scoring
  score += Math.max(0, 100 - (this.security.compliance.score.overall || 100));

  this.risk.score.current = Math.min(Math.round(score), 100);
  return this.risk.score.current;
};

// Instance method to generate recommendations
analyticsSchema.methods.generateRecommendations = function() {
  const recommendations = [];

  // Threat recommendations
  if (this.security.threats.total > this.traffic.total.sessions * 0.01) {
    recommendations.push({
      type: 'threat-detection',
      priority: 'high',
      description: 'High threat detection rate detected. Consider reviewing firewall rules and threat intelligence feeds.',
      impact: 'Reduce security incidents by improving threat detection accuracy'
    });
  }

  // Performance recommendations
  if (this.performance.cpu.usage > 80) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      description: 'High CPU utilization detected. Consider optimizing firewall rules or upgrading hardware.',
      impact: 'Improve firewall performance and reduce latency'
    });
  }

  if (this.performance.memory.usage > 80) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      description: 'High memory utilization detected. Consider memory optimization or hardware upgrade.',
      impact: 'Prevent memory-related performance issues'
    });
  }

  // Compliance recommendations
  if ((this.security.compliance.score.overall || 100) < 80) {
    recommendations.push({
      type: 'compliance',
      priority: 'high',
      description: 'Compliance score below threshold. Review and remediate compliance violations.',
      impact: 'Ensure regulatory compliance and reduce audit findings'
    });
  }

  this.risk.recommendations = recommendations;
  return recommendations;
};

// Static method to get latest analytics
analyticsSchema.statics.getLatest = function(vendor = 'all', period = 'daily') {
  return this.findOne({ vendor, period })
    .sort({ timestamp: -1 });
};

// Static method to get analytics for period
analyticsSchema.statics.getForPeriod = function(vendor, period, startDate, endDate) {
  return this.find({
    vendor,
    period,
    periodStart: { $gte: startDate },
    periodEnd: { $lte: endDate }
  }).sort({ periodStart: 1 });
};

// Static method to get risk trends
analyticsSchema.statics.getRiskTrends = function(vendor, days = 30) {
  const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return this.find({
    vendor,
    period: 'daily',
    timestamp: { $gte: since }
  })
  .select('timestamp risk.score.current')
  .sort({ timestamp: 1 });
};

// Static method to get top threats
analyticsSchema.statics.getTopThreats = function(vendor, days = 7) {
  const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  return this.aggregate([
    { $match: { vendor, timestamp: { $gte: since } } },
    { $unwind: '$security.threats.byType' },
    {
      $group: {
        _id: '$security.threats.byType.type',
        totalCount: { $sum: '$security.threats.byType.count' },
        totalBlocked: { $sum: '$security.threats.byType.blocked' }
      }
    },
    { $sort: { totalCount: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);
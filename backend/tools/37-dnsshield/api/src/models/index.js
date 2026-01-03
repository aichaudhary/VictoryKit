const mongoose = require('mongoose');

// DNS Query Analysis Model
const dnsQuerySchema = new mongoose.Schema({
  queryId: { type: String, required: true, unique: true, index: true },
  domain: { type: String, required: true, index: true },
  queryType: { type: String, required: true, enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR', 'NS', 'SOA'] },
  sourceIP: { type: String, required: true, index: true },
  responseCode: { type: Number, default: 0 },
  responseTime: { type: Number }, // in milliseconds
  resolvedIPs: [{ type: String }],
  ttl: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
  userAgent: { type: String },
  threatLevel: { type: String, enum: ['safe', 'suspicious', 'malicious', 'unknown'], default: 'unknown' },
  blocked: { type: Boolean, default: false },
  blockReason: { type: String },
  categories: [{ type: String }],
  reputation: {
    score: { type: Number, min: 0, max: 100 },
    sources: [{ type: String }]
  },
  geoLocation: {
    country: { type: String },
    city: { type: String },
    isp: { type: String }
  },
  metadata: {
    clientVersion: { type: String },
    protocol: { type: String },
    flags: [{ type: String }]
  }
}, {
  timestamps: true
});

// Domain Analysis Model
const domainAnalysisSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true, index: true },
  analysisId: { type: String, required: true, unique: true },
  threatLevel: { type: String, enum: ['safe', 'suspicious', 'malicious'], default: 'safe' },
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  categories: [{ type: String }],
  reputation: {
    score: { type: Number, min: 0, max: 100 },
    sources: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
  },
  dnsRecords: {
    A: [{ type: String }],
    AAAA: [{ type: String }],
    CNAME: [{ type: String }],
    MX: [{ type: String }],
    TXT: [{ type: String }],
    NS: [{ type: String }],
    SOA: { type: String },
    lastUpdated: { type: Date, default: Date.now }
  },
  whois: {
    registrar: { type: String },
    creationDate: { type: Date },
    expiryDate: { type: Date },
    lastUpdated: { type: Date }
  },
  sslInfo: {
    valid: { type: Boolean },
    issuer: { type: String },
    expiryDate: { type: Date },
    lastChecked: { type: Date }
  },
  malwareAnalysis: {
    detected: { type: Boolean },
    signatures: [{ type: String }],
    lastScanned: { type: Date }
  },
  phishingAnalysis: {
    detected: { type: Boolean },
    confidence: { type: Number, min: 0, max: 100 },
    indicators: [{ type: String }]
  },
  tunnelingDetection: {
    detected: { type: Boolean },
    method: { type: String },
    confidence: { type: Number, min: 0, max: 100 }
  },
  lastAnalyzed: { type: Date, default: Date.now },
  analysisCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// DNS Policy Model
const dnsPolicySchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['allowlist', 'blocklist', 'category_filter', 'reputation_filter'], required: true },
  scope: {
    type: { type: String, enum: ['global', 'user', 'group', 'ip_range'], default: 'global' },
    targets: [{ type: String }] // user IDs, group IDs, IP ranges
  },
  rules: {
    blockedDomains: [{ type: String }],
    blockedCategories: [{ type: String }],
    allowedDomains: [{ type: String }],
    reputationThreshold: { type: Number, min: 0, max: 100 },
    queryTypes: [{ type: String }],
    timeRestrictions: {
      enabled: { type: Boolean, default: false },
      allowedHours: [{ start: { type: String }, end: { type: String } }],
      blockedDays: [{ type: String }]
    }
  },
  actions: {
    block: { type: Boolean, default: true },
    log: { type: Boolean, default: true },
    alert: { type: Boolean, default: false },
    redirect: { type: String }, // redirect URL for blocked queries
    customResponse: { type: String } // custom DNS response
  },
  priority: { type: Number, default: 10 },
  enabled: { type: Boolean, default: true },
  createdBy: { type: String },
  lastModified: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// DNS Monitoring Model
const dnsMonitoringSchema = new mongoose.Schema({
  monitorId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['query_volume', 'threat_detection', 'performance', 'anomaly'], required: true },
  target: {
    type: { type: String, enum: ['domain', 'ip_range', 'user', 'global'], default: 'global' },
    value: { type: String }
  },
  thresholds: {
    queryRate: { type: Number }, // queries per minute
    errorRate: { type: Number }, // percentage
    threatCount: { type: Number },
    responseTime: { type: Number } // milliseconds
  },
  alerts: {
    enabled: { type: Boolean, default: true },
    channels: [{ type: String }], // email, slack, webhook, etc.
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
  },
  schedule: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['realtime', 'hourly', 'daily', 'weekly'], default: 'realtime' },
    timezone: { type: String, default: 'UTC' }
  },
  status: { type: String, enum: ['active', 'inactive', 'alerting'], default: 'active' },
  lastTriggered: { type: Date },
  metadata: {
    createdBy: { type: String },
    tags: [{ type: String }]
  }
}, {
  timestamps: true
});

// DNS Alert Model
const dnsAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['threat_detected', 'anomaly_detected', 'policy_violation', 'performance_issue'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  source: {
    type: { type: String, enum: ['query_analysis', 'domain_scan', 'monitoring', 'policy_engine'], required: true },
    details: { type: mongoose.Schema.Types.Mixed }
  },
  affected: {
    domains: [{ type: String }],
    ips: [{ type: String }],
    users: [{ type: String }],
    policies: [{ type: String }]
  },
  evidence: {
    queryId: { type: String },
    domain: { type: String },
    indicators: [{ type: String }],
    confidence: { type: Number, min: 0, max: 100 }
  },
  status: { type: String, enum: ['new', 'investigating', 'resolved', 'false_positive'], default: 'new' },
  assignedTo: { type: String },
  resolution: {
    action: { type: String },
    notes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: String }
  },
  notifications: [{
    channel: { type: String },
    sentAt: { type: Date },
    status: { type: String }
  }],
  metadata: {
    tags: [{ type: String }],
    customFields: { type: mongoose.Schema.Types.Mixed }
  }
}, {
  timestamps: true
});

// DNS Report Model
const dnsReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['threat_summary', 'traffic_analysis', 'policy_compliance', 'performance'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  parameters: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    filters: {
      domains: [{ type: String }],
      ips: [{ type: String }],
      categories: [{ type: String }],
      threatLevels: [{ type: String }]
    }
  },
  summary: {
    totalQueries: { type: Number, default: 0 },
    blockedQueries: { type: Number, default: 0 },
    maliciousDomains: { type: Number, default: 0 },
    uniqueDomains: { type: Number, default: 0 },
    topCategories: [{ category: { type: String }, count: { type: Number } }],
    threatDistribution: { type: mongoose.Schema.Types.Mixed }
  },
  data: {
    queries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DNSQuery' }],
    domains: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DomainAnalysis' }],
    alerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DNSAlert' }]
  },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String },
  format: { type: String, enum: ['json', 'pdf', 'csv', 'html'], default: 'json' },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
  fileUrl: { type: String },
  expiresAt: { type: Date }
}, {
  timestamps: true
});

// DNS Statistics Model
const dnsStatsSchema = new mongoose.Schema({
  statsId: { type: String, required: true, unique: true, index: true },
  period: {
    type: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  metrics: {
    totalQueries: { type: Number, default: 0 },
    uniqueDomains: { type: Number, default: 0 },
    blockedQueries: { type: Number, default: 0 },
    maliciousDomains: { type: Number, default: 0 },
    averageResponseTime: { type: Number },
    errorRate: { type: Number },
    topDomains: [{ domain: { type: String }, count: { type: Number } }],
    topCategories: [{ category: { type: String }, count: { type: Number } }],
    threatBreakdown: {
      safe: { type: Number, default: 0 },
      suspicious: { type: Number, default: 0 },
      malicious: { type: Number, default: 0 }
    },
    queryTypeDistribution: { type: mongoose.Schema.Types.Mixed },
    geographicDistribution: [{ country: { type: String }, count: { type: Number } }]
  },
  performance: {
    cacheHitRate: { type: Number },
    averageLookupTime: { type: Number },
    serverLoad: { type: Number },
    memoryUsage: { type: Number }
  },
  alerts: {
    total: { type: Number, default: 0 },
    bySeverity: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      critical: { type: Number, default: 0 }
    }
  },
  calculatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create indexes
dnsQuerySchema.index({ domain: 1, timestamp: -1 });
dnsQuerySchema.index({ sourceIP: 1, timestamp: -1 });
dnsQuerySchema.index({ threatLevel: 1, timestamp: -1 });
dnsQuerySchema.index({ blocked: 1, timestamp: -1 });

domainAnalysisSchema.index({ threatLevel: 1, lastAnalyzed: -1 });
domainAnalysisSchema.index({ 'reputation.score': 1 });
domainAnalysisSchema.index({ 'malwareAnalysis.detected': 1 });

dnsPolicySchema.index({ type: 1, enabled: 1 });
dnsPolicySchema.index({ priority: -1 });

dnsMonitoringSchema.index({ type: 1, status: 1 });
dnsMonitoringSchema.index({ 'schedule.frequency': 1 });

dnsAlertSchema.index({ type: 1, severity: 1, status: 1 });
dnsAlertSchema.index({ createdAt: -1 });

dnsReportSchema.index({ type: 1, generatedAt: -1 });
dnsReportSchema.index({ status: 1 });

dnsStatsSchema.index({ 'period.type': 1, 'period.startDate': 1 });

// Export models
module.exports = {
  DNSQuery: mongoose.model('DNSQuery', dnsQuerySchema),
  DomainAnalysis: mongoose.model('DomainAnalysis', domainAnalysisSchema),
  DNSPolicy: mongoose.model('DNSPolicy', dnsPolicySchema),
  DNSMonitoring: mongoose.model('DNSMonitoring', dnsMonitoringSchema),
  DNSAlert: mongoose.model('DNSAlert', dnsAlertSchema),
  DNSReport: mongoose.model('DNSReport', dnsReportSchema),
  DNSStats: mongoose.model('DNSStats', dnsStatsSchema)
};
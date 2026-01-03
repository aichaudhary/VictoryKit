const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  // Segment Identification
  segmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  
  // Segment Type
  type: {
    type: String,
    enum: [
      'production',       // Production IoT devices
      'development',      // Development/testing
      'guest',            // Guest network
      'ot',               // Operational Technology
      'it',               // IT network
      'ics',              // Industrial Control Systems
      'scada',            // SCADA systems
      'medical',          // Medical devices
      'hvac',             // Building automation
      'physical_security', // Cameras, access control
      'management',       // Management network
      'dmz',              // DMZ
      'quarantine',       // Isolated quarantine
      'honeypot',         // Honeypot network
      'custom'
    ],
    required: true,
    index: true
  },
  
  // Network Configuration
  network: {
    vlanId: {
      type: Number,
      min: 1,
      max: 4094
    },
    subnet: {
      type: String,
      required: true  // e.g., "192.168.10.0/24"
    },
    gateway: String,
    dhcpEnabled: { type: Boolean, default: true },
    dhcpRange: {
      start: String,
      end: String
    },
    dnsServers: [String],
    mtu: { type: Number, default: 1500 }
  },
  
  // Security Zone
  securityZone: {
    type: String,
    enum: ['untrusted', 'semi-trusted', 'trusted', 'restricted', 'critical'],
    default: 'semi-trusted',
    index: true
  },
  
  // Trust Level (0-100)
  trustLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated', 'maintenance'],
    default: 'active',
    index: true
  },
  
  // Location
  location: {
    site: String,
    building: String,
    floor: String,
    zone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Access Control
  accessControl: {
    // Internet access
    internetAccess: {
      type: String,
      enum: ['full', 'filtered', 'proxy_only', 'none'],
      default: 'filtered'
    },
    
    // Cross-segment communication
    allowedSegments: [{
      segmentId: String,
      segmentRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment'
      },
      direction: { type: String, enum: ['inbound', 'outbound', 'bidirectional'] },
      ports: [Number],
      protocols: [String],
      reason: String
    }],
    
    blockedSegments: [{
      segmentId: String,
      segmentRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment'
      },
      reason: String
    }],
    
    // External access
    externalAccess: {
      allowed: Boolean,
      vpnRequired: Boolean,
      mfaRequired: Boolean,
      allowedIps: [String],
      allowedCountries: [String]
    }
  },
  
  // Firewall Rules
  firewallRules: [{
    ruleId: String,
    name: String,
    action: { type: String, enum: ['allow', 'deny', 'log'] },
    direction: { type: String, enum: ['inbound', 'outbound', 'both'] },
    source: {
      type: { type: String, enum: ['any', 'ip', 'ip_range', 'segment', 'tag'] },
      value: String
    },
    destination: {
      type: { type: String, enum: ['any', 'ip', 'ip_range', 'segment', 'tag'] },
      value: String
    },
    ports: [Number],
    portRanges: [{ start: Number, end: Number }],
    protocol: String,
    priority: Number,
    enabled: { type: Boolean, default: true },
    logging: { type: Boolean, default: false },
    comment: String
  }],
  
  // Monitoring Configuration
  monitoring: {
    enabled: { type: Boolean, default: true },
    trafficAnalysis: { type: Boolean, default: true },
    anomalyDetection: { type: Boolean, default: true },
    packetCapture: {
      enabled: Boolean,
      retentionDays: Number
    },
    netflowEnabled: Boolean,
    syslogForwarding: {
      enabled: Boolean,
      destination: String,
      port: Number
    }
  },
  
  // Compliance Requirements
  compliance: {
    standards: [String],  // e.g., ["PCI-DSS", "HIPAA", "IEC62443"]
    dataClassification: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret']
    },
    piiPresent: Boolean,
    phiPresent: Boolean,
    encryptionRequired: Boolean,
    auditRequired: Boolean
  },
  
  // Device Statistics
  deviceStats: {
    totalDevices: { type: Number, default: 0 },
    onlineDevices: { type: Number, default: 0 },
    offlineDevices: { type: Number, default: 0 },
    compromisedDevices: { type: Number, default: 0 },
    quarantinedDevices: { type: Number, default: 0 },
    highRiskDevices: { type: Number, default: 0 },
    lastUpdated: Date
  },
  
  // Traffic Statistics
  trafficStats: {
    avgBandwidth: Number,  // Mbps
    peakBandwidth: Number,
    avgPacketsPerSec: Number,
    totalBytesToday: Number,
    totalBytesWeek: Number,
    topProtocols: [{
      protocol: String,
      percentage: Number
    }],
    lastUpdated: Date
  },
  
  // Risk Assessment
  risk: {
    score: { type: Number, min: 0, max: 100 },
    level: { type: String, enum: ['critical', 'high', 'medium', 'low', 'minimal'] },
    factors: [{
      name: String,
      score: Number,
      details: String
    }],
    lastAssessed: Date
  },
  
  // Alerts Configuration
  alertSettings: {
    newDeviceAlert: { type: Boolean, default: true },
    rogueDeviceAlert: { type: Boolean, default: true },
    trafficAnomalyAlert: { type: Boolean, default: true },
    crossSegmentAlert: { type: Boolean, default: true },
    thresholds: {
      maxDevices: Number,
      maxBandwidth: Number,  // Mbps
      maxConnections: Number
    }
  },
  
  // Baseline Reference
  baseline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baseline'
  },
  
  // Owner/Manager
  owner: {
    userId: String,
    userName: String,
    email: String,
    department: String
  },
  
  // Metadata
  tags: [String],
  color: String,  // For UI visualization
  icon: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tenant
  tenantId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
segmentSchema.index({ 'network.vlanId': 1 }, { sparse: true });
segmentSchema.index({ 'network.subnet': 1 });
segmentSchema.index({ securityZone: 1, status: 1 });
segmentSchema.index({ 'location.site': 1, 'location.building': 1 });

// Pre-save to generate segmentId
segmentSchema.pre('save', function(next) {
  if (!this.segmentId) {
    this.segmentId = `seg_${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  next();
});

// Virtual for utilization
segmentSchema.virtual('utilization').get(function() {
  if (!this.alertSettings?.thresholds?.maxDevices || !this.deviceStats?.totalDevices) {
    return null;
  }
  return (this.deviceStats.totalDevices / this.alertSettings.thresholds.maxDevices) * 100;
});

// Virtual for CIDR info
segmentSchema.virtual('cidrInfo').get(function() {
  if (!this.network?.subnet) return null;
  const [ip, prefix] = this.network.subnet.split('/');
  const prefixNum = parseInt(prefix);
  const hostBits = 32 - prefixNum;
  const totalHosts = Math.pow(2, hostBits) - 2;
  return {
    network: ip,
    prefix: prefixNum,
    totalHosts,
    usableHosts: totalHosts - 2
  };
});

// Static method to find by IP
segmentSchema.statics.findByIp = async function(ipAddress) {
  // This would need proper IP range checking logic
  const segments = await this.find({ status: 'active' });
  
  for (const segment of segments) {
    if (segment.network?.subnet) {
      // Simple check - in production use proper IP range library
      const [networkIp] = segment.network.subnet.split('/');
      const networkParts = networkIp.split('.');
      const ipParts = ipAddress.split('.');
      
      // Check if first 3 octets match (simple /24 check)
      if (networkParts[0] === ipParts[0] && 
          networkParts[1] === ipParts[1] && 
          networkParts[2] === ipParts[2]) {
        return segment;
      }
    }
  }
  return null;
};

// Static method to get active segments
segmentSchema.statics.getActive = function(tenantId) {
  const match = { status: 'active' };
  if (tenantId) match.tenantId = tenantId;
  return this.find(match).sort({ type: 1, name: 1 });
};

// Static method to get critical segments
segmentSchema.statics.getCritical = function() {
  return this.find({
    securityZone: { $in: ['restricted', 'critical'] },
    status: 'active'
  });
};

// Static method to get segment stats
segmentSchema.statics.getStats = async function(tenantId) {
  const match = tenantId ? { tenantId } : {};
  
  const [total, byType, byZone, totalDevices] = await Promise.all([
    this.countDocuments(match),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: match },
      { $group: { _id: '$securityZone', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$deviceStats.totalDevices' } } }
    ])
  ]);
  
  return {
    total,
    byType: byType.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {}),
    byZone: byZone.reduce((acc, z) => ({ ...acc, [z._id]: z.count }), {}),
    totalDevices: totalDevices[0]?.total || 0
  };
};

// Instance method to update device stats
segmentSchema.methods.updateDeviceStats = async function(stats) {
  this.deviceStats = {
    ...this.deviceStats,
    ...stats,
    lastUpdated: new Date()
  };
  return this.save();
};

// Instance method to update traffic stats
segmentSchema.methods.updateTrafficStats = async function(stats) {
  this.trafficStats = {
    ...this.trafficStats,
    ...stats,
    lastUpdated: new Date()
  };
  return this.save();
};

// Instance method to add firewall rule
segmentSchema.methods.addFirewallRule = async function(rule) {
  rule.ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  this.firewallRules.push(rule);
  // Sort by priority
  this.firewallRules.sort((a, b) => (a.priority || 100) - (b.priority || 100));
  return this.save();
};

// Instance method to check if communication allowed to another segment
segmentSchema.methods.canCommunicateWith = function(targetSegmentId) {
  // Check if blocked
  const isBlocked = this.accessControl?.blockedSegments?.some(
    s => s.segmentId === targetSegmentId
  );
  if (isBlocked) return { allowed: false, reason: 'explicitly_blocked' };
  
  // Check if allowed
  const allowedRule = this.accessControl?.allowedSegments?.find(
    s => s.segmentId === targetSegmentId
  );
  if (allowedRule) {
    return {
      allowed: true,
      direction: allowedRule.direction,
      ports: allowedRule.ports,
      protocols: allowedRule.protocols
    };
  }
  
  // Default: not allowed
  return { allowed: false, reason: 'not_explicitly_allowed' };
};

// Instance method to calculate risk score
segmentSchema.methods.calculateRisk = async function() {
  let score = 0;
  const factors = [];
  
  // Device risk
  const compromisedRatio = this.deviceStats.compromisedDevices / (this.deviceStats.totalDevices || 1);
  if (compromisedRatio > 0) {
    const deviceScore = Math.round(compromisedRatio * 50);
    score += deviceScore;
    factors.push({ name: 'compromised_devices', score: deviceScore, details: `${this.deviceStats.compromisedDevices} compromised` });
  }
  
  const highRiskRatio = this.deviceStats.highRiskDevices / (this.deviceStats.totalDevices || 1);
  if (highRiskRatio > 0) {
    const riskScore = Math.round(highRiskRatio * 30);
    score += riskScore;
    factors.push({ name: 'high_risk_devices', score: riskScore, details: `${this.deviceStats.highRiskDevices} high risk` });
  }
  
  // Security zone factor
  const zoneFactor = {
    untrusted: 20,
    'semi-trusted': 10,
    trusted: 5,
    restricted: 3,
    critical: 2
  };
  const zoneScore = zoneFactor[this.securityZone] || 10;
  if (this.deviceStats.compromisedDevices > 0) {
    score += zoneScore;
    factors.push({ name: 'security_zone_exposure', score: zoneScore, details: `${this.securityZone} zone` });
  }
  
  // Internet access
  if (this.accessControl?.internetAccess === 'full') {
    score += 10;
    factors.push({ name: 'full_internet_access', score: 10, details: 'Full internet access enabled' });
  }
  
  // Calculate level
  let level = 'minimal';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';
  else if (score >= 20) level = 'low';
  
  this.risk = {
    score: Math.min(100, score),
    level,
    factors,
    lastAssessed: new Date()
  };
  
  return this.save();
};

module.exports = mongoose.model('Segment', segmentSchema);

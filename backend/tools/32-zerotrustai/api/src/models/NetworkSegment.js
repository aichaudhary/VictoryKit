const mongoose = require('mongoose');

const networkSegmentSchema = new mongoose.Schema({
  segmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Segment Information
  segment: {
    segment_name: { type: String, required: true, index: true },
    description: String,
    segment_type: { 
      type: String, 
      enum: ['zone', 'vlan', 'subnet', 'security_group', 'micro_perimeter'],
      required: true,
      index: true
    },
    security_zone: { 
      type: String, 
      enum: ['public', 'dmz', 'internal', 'restricted', 'critical', 'management'],
      required: true,
      index: true
    },
    trust_level: { 
      type: String, 
      enum: ['untrusted', 'low', 'medium', 'high', 'critical'],
      index: true
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'maintenance', 'quarantined'],
      default: 'active',
      index: true
    },
    classification: { 
      type: String, 
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret']
    }
  },
  
  // Network Configuration
  network: {
    cidr_blocks: [{
      cidr: String,
      description: String,
      is_primary: Boolean
    }],
    ip_ranges: [{
      start_ip: String,
      end_ip: String,
      total_ips: Number
    }],
    vlan_id: Number,
    subnet_mask: String,
    gateway: String,
    dns_servers: [String],
    dhcp_enabled: Boolean,
    dhcp_range: {
      start: String,
      end: String
    }
  },
  
  // Isolation Rules
  isolation: {
    isolation_level: { 
      type: String, 
      enum: ['none', 'partial', 'strict', 'complete'],
      default: 'partial'
    },
    allowed_inbound_segments: [{
      segment_id: String,
      segment_name: String,
      trust_level: String,
      ports: [Number],
      protocols: [String]
    }],
    allowed_outbound_segments: [{
      segment_id: String,
      segment_name: String,
      trust_level: String,
      ports: [Number],
      protocols: [String]
    }],
    blocked_segments: [{
      segment_id: String,
      reason: String,
      blocked_at: Date
    }],
    internet_access: {
      allowed: Boolean,
      egress_only: Boolean,
      proxy_required: Boolean,
      monitored: Boolean
    }
  },
  
  // Access Control
  access_control: {
    default_action: { type: String, enum: ['allow', 'deny'], default: 'deny' },
    firewall_rules: [{
      rule_id: String,
      priority: Number,
      direction: { type: String, enum: ['inbound', 'outbound', 'both'] },
      action: { type: String, enum: ['allow', 'deny', 'log'] },
      source: {
        type: String,
        cidrs: [String],
        segments: [String]
      },
      destination: {
        type: String,
        cidrs: [String],
        segments: [String]
      },
      ports: [Number],
      protocols: [String],
      enabled: Boolean,
      created_at: Date
    }],
    acls: [{
      acl_id: String,
      name: String,
      rules: [{
        action: String,
        source: String,
        destination: String,
        service: String
      }]
    }]
  },
  
  // Allowed Resources & Users
  members: {
    allowed_users: [{
      user_id: String,
      username: String,
      clearance_level: String,
      added_at: Date
    }],
    allowed_devices: [{
      device_id: String,
      device_name: String,
      device_type: String,
      trust_score: Number,
      added_at: Date
    }],
    allowed_applications: [{
      app_id: String,
      app_name: String,
      approved_by: String,
      added_at: Date
    }],
    total_members: { type: Number, default: 0 }
  },
  
  // Resources in Segment
  resources: [{
    resource_id: String,
    resource_name: String,
    resource_type: { type: String, enum: ['server', 'database', 'application', 'service', 'storage', 'container'] },
    ip_address: String,
    ports: [Number],
    data_classification: String,
    is_critical: Boolean,
    last_scan: Date
  }],
  
  // Monitoring & Traffic
  monitoring: {
    traffic_monitoring_enabled: Boolean,
    intrusion_detection_enabled: Boolean,
    deep_packet_inspection: Boolean,
    log_level: { type: String, enum: ['none', 'basic', 'detailed', 'verbose'], default: 'basic' },
    siem_integration: Boolean,
    alert_channels: [String],
    traffic_stats: {
      total_bytes_in: { type: Number, default: 0 },
      total_bytes_out: { type: Number, default: 0 },
      total_packets_in: { type: Number, default: 0 },
      total_packets_out: { type: Number, default: 0 },
      dropped_packets: { type: Number, default: 0 },
      last_updated: Date
    }
  },
  
  // Security Policies
  policies: [{
    policy_id: String,
    policy_name: String,
    policy_type: String,
    enforcement_level: { type: String, enum: ['advisory', 'enforce', 'block'] },
    applied_at: Date,
    last_evaluated: Date
  }],
  
  // Lateral Movement Detection
  lateral_movement: {
    detection_enabled: Boolean,
    suspicious_connections: [{
      source_ip: String,
      destination_ip: String,
      detected_at: Date,
      risk_score: Number,
      investigated: Boolean
    }],
    east_west_traffic_baseline: {
      average_connections_per_hour: Number,
      typical_destinations: [String],
      typical_protocols: [String]
    },
    anomalies_detected: [{
      anomaly_type: String,
      description: String,
      detected_at: Date,
      severity: String,
      resolved: Boolean
    }]
  },
  
  // Micro-segmentation Strategy
  micro_segmentation: {
    enabled: Boolean,
    strategy: { 
      type: String, 
      enum: ['application_based', 'user_based', 'device_based', 'data_based', 'hybrid']
    },
    granularity: { type: String, enum: ['coarse', 'medium', 'fine', 'ultra_fine'] },
    enforcement_mode: { type: String, enum: ['learning', 'monitoring', 'enforcing'] },
    sub_segments: [{
      sub_segment_id: String,
      name: String,
      purpose: String,
      members_count: Number
    }]
  },
  
  // Threat Intelligence
  threat_intelligence: {
    known_threats: [{
      threat_id: String,
      threat_type: String,
      detected_at: Date,
      mitigated: Boolean,
      mitigation_action: String
    }],
    blocked_ips: [{
      ip_address: String,
      reason: String,
      threat_level: String,
      blocked_at: Date,
      auto_unblock_at: Date
    }],
    threat_feeds_integrated: [String]
  },
  
  // Compliance & Audit
  compliance: {
    compliance_frameworks: [String],
    is_compliant: Boolean,
    last_audit_date: Date,
    next_audit_due: Date,
    audit_findings: [{
      finding: String,
      severity: String,
      detected_at: Date,
      remediated: Boolean
    }],
    encryption_required: Boolean,
    encryption_in_transit: Boolean,
    encryption_at_rest: Boolean
  },
  
  // Quarantine & Incident Response
  incident_response: {
    auto_quarantine_enabled: Boolean,
    quarantine_threshold: Number,
    incident_history: [{
      incident_id: String,
      incident_type: String,
      detected_at: Date,
      response_action: String,
      resolved: Boolean,
      resolved_at: Date
    }],
    containment_actions: [{
      action: String,
      triggered_by: String,
      executed_at: Date,
      result: String
    }]
  },
  
  // Management
  management: {
    owner: {
      user_id: String,
      name: String,
      email: String
    },
    created_by: String,
    last_modified_by: String,
    approved_by: String,
    approval_date: Date,
    change_history: [{
      change_type: String,
      changed_by: String,
      changed_at: Date,
      description: String
    }]
  },
  
  metadata: {
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    tags: [String],
    notes: String
  }
}, {
  timestamps: true,
  collection: 'network_segments'
});

// Indexes
networkSegmentSchema.index({ 'segment.security_zone': 1, 'segment.status': 1 });
networkSegmentSchema.index({ 'segment.trust_level': 1 });
networkSegmentSchema.index({ 'micro_segmentation.enabled': 1 });

// Methods
networkSegmentSchema.methods.allowInboundFrom = function(sourceSegmentId, sourceSegmentName, ports, protocols) {
  const existing = this.isolation.allowed_inbound_segments.find(s => s.segment_id === sourceSegmentId);
  
  if (!existing) {
    this.isolation.allowed_inbound_segments.push({
      segment_id: sourceSegmentId,
      segment_name: sourceSegmentName,
      ports: ports || [],
      protocols: protocols || []
    });
  } else {
    existing.ports = [...new Set([...(existing.ports || []), ...(ports || [])])];
    existing.protocols = [...new Set([...(existing.protocols || []), ...(protocols || [])])];
  }
  
  return this.save();
};

networkSegmentSchema.methods.blockSegment = function(segmentId, reason) {
  const existing = this.isolation.blocked_segments.find(s => s.segment_id === segmentId);
  
  if (!existing) {
    this.isolation.blocked_segments.push({
      segment_id: segmentId,
      reason: reason,
      blocked_at: new Date()
    });
  }
  
  // Remove from allowed lists
  this.isolation.allowed_inbound_segments = this.isolation.allowed_inbound_segments.filter(
    s => s.segment_id !== segmentId
  );
  this.isolation.allowed_outbound_segments = this.isolation.allowed_outbound_segments.filter(
    s => s.segment_id !== segmentId
  );
  
  return this.save();
};

networkSegmentSchema.methods.addFirewallRule = function(rule) {
  rule.rule_id = rule.rule_id || `rule_${Date.now()}`;
  rule.created_at = new Date();
  rule.enabled = rule.enabled !== false;
  
  this.access_control.firewall_rules.push(rule);
  
  // Sort by priority
  this.access_control.firewall_rules.sort((a, b) => a.priority - b.priority);
  
  return this.save();
};

networkSegmentSchema.methods.detectLateralMovement = function(connection) {
  const baseline = this.lateral_movement.east_west_traffic_baseline;
  const anomalies = [];
  
  // Check if destination is typical
  if (baseline.typical_destinations && !baseline.typical_destinations.includes(connection.destination_ip)) {
    anomalies.push({
      anomaly_type: 'unusual_destination',
      description: `Connection to atypical destination: ${connection.destination_ip}`,
      detected_at: new Date(),
      severity: 'medium',
      resolved: false
    });
  }
  
  // Check protocol
  if (baseline.typical_protocols && !baseline.typical_protocols.includes(connection.protocol)) {
    anomalies.push({
      anomaly_type: 'unusual_protocol',
      description: `Connection using atypical protocol: ${connection.protocol}`,
      detected_at: new Date(),
      severity: 'low',
      resolved: false
    });
  }
  
  // Add to suspicious connections if anomalies detected
  if (anomalies.length > 0) {
    this.lateral_movement.suspicious_connections.push({
      source_ip: connection.source_ip,
      destination_ip: connection.destination_ip,
      detected_at: new Date(),
      risk_score: anomalies.length * 30,
      investigated: false
    });
    
    this.lateral_movement.anomalies_detected.push(...anomalies);
  }
  
  return anomalies;
};

networkSegmentSchema.methods.quarantine = function(reason) {
  this.segment.status = 'quarantined';
  
  this.incident_response.containment_actions.push({
    action: 'quarantine_segment',
    triggered_by: 'automated_system',
    executed_at: new Date(),
    result: `Segment quarantined: ${reason}`
  });
  
  // Block all inbound/outbound except management
  this.isolation.isolation_level = 'complete';
  this.isolation.internet_access.allowed = false;
  
  return this.save();
};

networkSegmentSchema.methods.enableMicroSegmentation = function(strategy) {
  this.micro_segmentation.enabled = true;
  this.micro_segmentation.strategy = strategy || 'hybrid';
  this.micro_segmentation.granularity = 'fine';
  this.micro_segmentation.enforcement_mode = 'learning';
  
  return this.save();
};

module.exports = mongoose.model('NetworkSegment', networkSegmentSchema);

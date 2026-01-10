const mongoose = require('mongoose');

const deviceTrustSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Device Information
  device: {
    device_type: { 
      type: String, 
      enum: ['laptop', 'desktop', 'mobile', 'tablet', 'server', 'iot', 'unknown'],
      required: true,
      index: true
    },
    manufacturer: String,
    model: String,
    serial_number: String,
    mac_address: String,
    hostname: String,
    device_name: String,
    ownership: { 
      type: String, 
      enum: ['corporate', 'byod', 'contractor', 'guest'],
      default: 'corporate',
      index: true
    },
    is_managed: { type: Boolean, default: false, index: true },
    management_platform: String,
    enrolled_date: Date,
    last_sync: Date
  },
  
  // Operating System
  os: {
    os_type: { type: String, enum: ['windows', 'macos', 'linux', 'ios', 'android', 'other'] },
    os_name: String,
    os_version: String,
    build_number: String,
    kernel_version: String,
    is_supported: Boolean,
    end_of_life: Date,
    patch_level: String,
    last_patched: Date
  },
  
  // Security Posture
  security: {
    encryption: {
      disk_encrypted: Boolean,
      encryption_method: String,
      bitlocker_enabled: Boolean,
      filevault_enabled: Boolean
    },
    antivirus: {
      installed: Boolean,
      enabled: Boolean,
      up_to_date: Boolean,
      vendor: String,
      last_scan: Date,
      threats_detected: Number
    },
    firewall: {
      enabled: Boolean,
      type: String,
      rules_count: Number,
      last_updated: Date
    },
    security_software: [{
      name: String,
      version: String,
      enabled: Boolean,
      last_updated: Date
    }],
    is_jailbroken: { type: Boolean, default: false },
    is_rooted: { type: Boolean, default: false },
    developer_mode: Boolean,
    screen_lock: {
      enabled: Boolean,
      type: String,
      timeout_minutes: Number
    },
    biometric_enabled: Boolean
  },
  
  // Compliance Status
  compliance: {
    is_compliant: { type: Boolean, default: false, index: true },
    compliance_frameworks: [String],
    compliance_score: { type: Number, min: 0, max: 100 },
    last_assessed: Date,
    violations: [{
      rule: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      description: String,
      detected_at: Date,
      remediated: Boolean
    }],
    required_software: [{
      name: String,
      installed: Boolean,
      version: String,
      status: String
    }]
  },
  
  // Trust Assessment
  trust: {
    trust_score: { type: Number, min: 0, max: 100, index: true },
    trust_level: { 
      type: String, 
      enum: ['untrusted', 'low', 'medium', 'high', 'verified'],
      index: true
    },
    factors: {
      security_posture_score: { type: Number, min: 0, max: 100 },
      compliance_score: { type: Number, min: 0, max: 100 },
      patch_status_score: { type: Number, min: 0, max: 100 },
      behavior_score: { type: Number, min: 0, max: 100 },
      age_score: { type: Number, min: 0, max: 100 }
    },
    risk_indicators: [{
      indicator: String,
      severity: String,
      detected_at: Date
    }],
    last_calculated: Date
  },
  
  // Network Information
  network: {
    current_ip: String,
    current_network: String,
    network_type: String,
    vpn_connected: Boolean,
    vpn_client: String,
    wifi_ssid: String,
    cellular_carrier: String,
    known_networks: [{
      network_name: String,
      network_type: String,
      trusted: Boolean,
      last_connected: Date
    }]
  },
  
  // Access History
  access: {
    first_seen: Date,
    last_seen: { type: Date, index: true },
    total_logins: { type: Number, default: 0 },
    failed_login_attempts: { type: Number, default: 0 },
    last_successful_login: Date,
    last_failed_login: Date,
    resources_accessed: [{
      resource_id: String,
      resource_name: String,
      last_accessed: Date,
      access_count: Number
    }],
    suspicious_activities: [{
      activity_type: String,
      description: String,
      detected_at: Date,
      risk_score: Number
    }]
  },
  
  // User Assignment
  user: {
    primary_user_id: String,
    primary_user_name: String,
    department: String,
    additional_users: [{
      user_id: String,
      username: String,
      last_used: Date
    }]
  },
  
  // Certificates
  certificates: [{
    certificate_id: String,
    common_name: String,
    issuer: String,
    valid_from: Date,
    valid_until: Date,
    is_valid: Boolean,
    purpose: String
  }],
  
  // Applications
  applications: [{
    app_name: String,
    app_version: String,
    vendor: String,
    installation_date: Date,
    is_approved: Boolean,
    is_malware: Boolean,
    risk_score: Number
  }],
  
  // Anomalies
  anomalies: [{
    anomaly_type: String,
    description: String,
    severity: String,
    detected_at: Date,
    resolved: Boolean,
    resolved_at: Date
  }],
  
  // Actions & Remediation
  actions: {
    quarantined: Boolean,
    quarantine_reason: String,
    quarantine_date: Date,
    pending_actions: [{
      action: String,
      priority: String,
      scheduled_for: Date
    }],
    remediation_history: [{
      action: String,
      performed_by: String,
      performed_at: Date,
      result: String
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
  collection: 'device_trust'
});

// Indexes
deviceTrustSchema.index({ 'user.primary_user_id': 1 });
deviceTrustSchema.index({ 'device.device_type': 1, 'trust.trust_score': -1 });
deviceTrustSchema.index({ 'compliance.is_compliant': 1 });
deviceTrustSchema.index({ 'access.last_seen': -1 });

// Methods
deviceTrustSchema.methods.calculateTrustScore = function() {
  let score = 100;
  
  // Security posture (-40 points max)
  if (!this.security.encryption?.disk_encrypted) score -= 20;
  if (!this.security.antivirus?.up_to_date) score -= 10;
  if (!this.security.firewall?.enabled) score -= 10;
  if (this.security.is_jailbroken || this.security.is_rooted) score -= 40;
  
  // Compliance (-30 points max)
  if (!this.compliance.is_compliant) score -= 30;
  
  // OS updates (-20 points max)
  if (!this.os.is_supported) score -= 20;
  else {
    const daysSincePatched = this.os.last_patched 
      ? (Date.now() - this.os.last_patched.getTime()) / (1000 * 60 * 60 * 24) 
      : 999;
    if (daysSincePatched > 90) score -= 20;
    else if (daysSincePatched > 30) score -= 10;
  }
  
  // Management (-10 points max)
  if (!this.device.is_managed) score -= 10;
  
  this.trust.trust_score = Math.max(0, score);
  
  // Determine trust level
  if (this.trust.trust_score >= 90) this.trust.trust_level = 'verified';
  else if (this.trust.trust_score >= 70) this.trust.trust_level = 'high';
  else if (this.trust.trust_score >= 50) this.trust.trust_level = 'medium';
  else if (this.trust.trust_score >= 30) this.trust.trust_level = 'low';
  else this.trust.trust_level = 'untrusted';
  
  this.trust.last_calculated = new Date();
  
  return this.trust.trust_score;
};

deviceTrustSchema.methods.assessCompliance = function(requirements) {
  let compliant = true;
  const violations = [];
  
  // Check encryption
  if (requirements.encryption_required && !this.security.encryption?.disk_encrypted) {
    compliant = false;
    violations.push({
      rule: 'Encryption Required',
      severity: 'critical',
      description: 'Disk encryption is not enabled',
      detected_at: new Date(),
      remediated: false
    });
  }
  
  // Check antivirus
  if (requirements.antivirus_required && !this.security.antivirus?.up_to_date) {
    compliant = false;
    violations.push({
      rule: 'Antivirus Required',
      severity: 'high',
      description: 'Antivirus is not up to date',
      detected_at: new Date(),
      remediated: false
    });
  }
  
  // Check OS support
  if (!this.os.is_supported) {
    compliant = false;
    violations.push({
      rule: 'Supported OS Required',
      severity: 'high',
      description: 'Operating system is no longer supported',
      detected_at: new Date(),
      remediated: false
    });
  }
  
  // Check jailbreak/root
  if (this.security.is_jailbroken || this.security.is_rooted) {
    compliant = false;
    violations.push({
      rule: 'No Jailbreak/Root',
      severity: 'critical',
      description: 'Device is jailbroken or rooted',
      detected_at: new Date(),
      remediated: false
    });
  }
  
  this.compliance.is_compliant = compliant;
  this.compliance.violations = violations;
  this.compliance.last_assessed = new Date();
  
  return { compliant, violations };
};

deviceTrustSchema.methods.quarantine = function(reason) {
  this.actions.quarantined = true;
  this.actions.quarantine_reason = reason;
  this.actions.quarantine_date = new Date();
  this.trust.trust_level = 'untrusted';
  return this.save();
};

module.exports = mongoose.model('DeviceTrust', deviceTrustSchema);

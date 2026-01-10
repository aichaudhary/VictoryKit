const mongoose = require('mongoose');

const userIdentitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Identity Information
  identity: {
    username: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    full_name: String,
    employee_id: String,
    department: String,
    title: String,
    location: String,
    manager_id: String,
    cost_center: String,
    employment_type: { type: String, enum: ['employee', 'contractor', 'partner', 'guest'] },
    hire_date: Date,
    termination_date: Date,
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended', 'locked', 'terminated'],
      default: 'active',
      index: true
    }
  },
  
  // Roles & Permissions
  authorization: {
    role: { type: String, index: true },
    clearance_level: { 
      type: String, 
      enum: ['basic', 'elevated', 'privileged', 'admin', 'super_admin'],
      default: 'basic',
      index: true
    },
    groups: [String],
    assigned_permissions: [{
      permission: String,
      resource: String,
      granted_by: String,
      granted_at: Date,
      expires_at: Date
    }],
    privilege_elevation_history: [{
      from_level: String,
      to_level: String,
      reason: String,
      approved_by: String,
      timestamp: Date
    }],
    is_privileged: { type: Boolean, default: false, index: true }
  },
  
  // Authentication Methods
  authentication: {
    primary_method: String,
    enabled_methods: [{
      method: { type: String, enum: ['password', 'mfa', 'certificate', 'biometric', 'sso', 'passwordless'] },
      enabled: Boolean,
      configured_at: Date,
      last_used: Date
    }],
    mfa: {
      enabled: { type: Boolean, default: false },
      methods: [{ type: String, enum: ['totp', 'sms', 'push', 'hardware_token', 'biometric'] }],
      backup_codes_remaining: Number,
      last_verified: Date
    },
    password: {
      last_changed: Date,
      expires_at: Date,
      reset_required: Boolean,
      history_count: Number
    },
    certificates: [{
      certificate_id: String,
      common_name: String,
      valid_until: Date,
      is_active: Boolean
    }],
    biometric: {
      fingerprint_enrolled: Boolean,
      face_enrolled: Boolean,
      voice_enrolled: Boolean
    }
  },
  
  // Behavior Patterns
  behavior: {
    baseline: {
      typical_login_hours: [{
        day_of_week: String,
        start_hour: Number,
        end_hour: Number
      }],
      typical_locations: [{
        country: String,
        city: String,
        frequency: Number
      }],
      typical_devices: [String],
      typical_resources: [String],
      typical_applications: [String],
      established_at: Date
    },
    current_patterns: {
      recent_login_times: [Date],
      recent_locations: [String],
      recent_devices: [String],
      recent_resources: [String]
    },
    anomalies_detected: [{
      anomaly_type: String,
      description: String,
      severity: String,
      detected_at: Date,
      deviation_score: Number,
      resolved: Boolean
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
      identity_verification_score: { type: Number, min: 0, max: 100 },
      authentication_strength_score: { type: Number, min: 0, max: 100 },
      behavior_consistency_score: { type: Number, min: 0, max: 100 },
      compliance_score: { type: Number, min: 0, max: 100 },
      risk_score: { type: Number, min: 0, max: 100 }
    },
    last_calculated: Date,
    recalculation_triggers: [String]
  },
  
  // Risk Profile
  risk: {
    risk_score: { type: Number, min: 0, max: 100, index: true },
    risk_level: { 
      type: String, 
      enum: ['minimal', 'low', 'medium', 'high', 'critical'],
      index: true
    },
    risk_factors: [{
      factor: String,
      severity: String,
      description: String,
      score_impact: Number,
      identified_at: Date
    }],
    is_high_risk: { type: Boolean, default: false, index: true },
    insider_threat_score: { type: Number, min: 0, max: 100 },
    compromised_indicators: [{
      indicator: String,
      detected_at: Date,
      confidence: Number
    }]
  },
  
  // Access History
  access: {
    last_login: { type: Date, index: true },
    last_login_ip: String,
    last_login_device: String,
    last_login_location: String,
    total_logins: { type: Number, default: 0 },
    failed_login_attempts: { type: Number, default: 0 },
    last_failed_login: Date,
    concurrent_sessions: { type: Number, default: 0 },
    max_concurrent_sessions: Number,
    active_sessions: [{
      session_id: String,
      device_id: String,
      ip_address: String,
      started_at: Date,
      last_activity: Date
    }],
    recent_access_requests: [{
      request_id: String,
      resource: String,
      decision: String,
      timestamp: Date
    }]
  },
  
  // Data Access
  data_access: {
    sensitive_data_accessed: [{
      data_classification: String,
      resource: String,
      action: String,
      timestamp: Date
    }],
    data_exfiltration_risk: Number,
    large_downloads: [{
      file_name: String,
      file_size: Number,
      timestamp: Date,
      flagged: Boolean
    }],
    unusual_access_patterns: [{
      pattern: String,
      detected_at: Date,
      risk_score: Number
    }]
  },
  
  // Continuous Authentication
  continuous_auth: {
    enabled: Boolean,
    last_validation: Date,
    validation_frequency_seconds: Number,
    behavioral_biometrics: {
      keystroke_dynamics_enrolled: Boolean,
      mouse_patterns_enrolled: Boolean,
      typing_speed_baseline: Number,
      mouse_velocity_baseline: Number
    },
    validation_failures: Number,
    last_re_authentication: Date
  },
  
  // Compliance & Training
  compliance: {
    security_training_completed: Boolean,
    last_training_date: Date,
    next_training_due: Date,
    acknowledged_policies: [{
      policy_id: String,
      policy_name: String,
      acknowledged_at: Date,
      version: Number
    }],
    compliance_violations: [{
      violation_type: String,
      policy: String,
      detected_at: Date,
      resolved: Boolean
    }]
  },
  
  // Incident History
  incidents: [{
    incident_id: String,
    incident_type: String,
    severity: String,
    description: String,
    detected_at: Date,
    resolved: Boolean,
    resolved_at: Date,
    impact_on_trust: Number
  }],
  
  // Management
  management: {
    created_by: String,
    last_modified_by: String,
    last_review_date: Date,
    next_review_due: Date,
    watchlist: Boolean,
    watchlist_reason: String,
    watchlist_added_at: Date
  },
  
  metadata: {
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    tags: [String],
    notes: String
  }
}, {
  timestamps: true,
  collection: 'user_identities'
});

// Indexes
userIdentitySchema.index({ 'identity.email': 1, 'identity.status': 1 });
userIdentitySchema.index({ 'authorization.role': 1, 'authorization.clearance_level': 1 });
userIdentitySchema.index({ 'risk.risk_score': -1 });
userIdentitySchema.index({ 'trust.trust_score': -1 });
userIdentitySchema.index({ 'access.last_login': -1 });

// Methods
userIdentitySchema.methods.calculateTrustScore = function() {
  const factors = this.trust.factors;
  
  const weights = {
    identity_verification_score: 0.20,
    authentication_strength_score: 0.25,
    behavior_consistency_score: 0.25,
    compliance_score: 0.15,
    risk_score: 0.15
  };
  
  let totalScore = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    totalScore += (factors[factor] || 50) * weight;
  }
  
  this.trust.trust_score = Math.round(totalScore);
  
  // Determine trust level
  if (totalScore >= 90) this.trust.trust_level = 'verified';
  else if (totalScore >= 70) this.trust.trust_level = 'high';
  else if (totalScore >= 50) this.trust.trust_level = 'medium';
  else if (totalScore >= 30) this.trust.trust_level = 'low';
  else this.trust.trust_level = 'untrusted';
  
  this.trust.last_calculated = new Date();
  
  return this.trust.trust_score;
};

userIdentitySchema.methods.calculateRiskScore = function() {
  let riskScore = 0;
  
  // Privileged access increases risk
  if (this.authorization.is_privileged) riskScore += 15;
  if (this.authorization.clearance_level === 'admin' || this.authorization.clearance_level === 'super_admin') {
    riskScore += 20;
  }
  
  // Failed login attempts
  if (this.access.failed_login_attempts > 10) riskScore += 20;
  else if (this.access.failed_login_attempts > 5) riskScore += 10;
  
  // Behavioral anomalies
  const recentAnomalies = this.behavior.anomalies_detected.filter(a => 
    !a.resolved && (Date.now() - a.detected_at.getTime()) < 7 * 24 * 60 * 60 * 1000
  );
  riskScore += Math.min(30, recentAnomalies.length * 10);
  
  // Compliance violations
  const unresolvedViolations = this.compliance.compliance_violations.filter(v => !v.resolved);
  riskScore += Math.min(20, unresolvedViolations.length * 5);
  
  // Recent incidents
  const recentIncidents = this.incidents.filter(i => 
    !i.resolved && (Date.now() - i.detected_at.getTime()) < 30 * 24 * 60 * 60 * 1000
  );
  riskScore += Math.min(25, recentIncidents.length * 10);
  
  // MFA not enabled
  if (!this.authentication.mfa?.enabled) riskScore += 15;
  
  this.risk.risk_score = Math.min(100, riskScore);
  
  // Determine risk level
  if (this.risk.risk_score >= 75) this.risk.risk_level = 'critical';
  else if (this.risk.risk_score >= 50) this.risk.risk_level = 'high';
  else if (this.risk.risk_score >= 25) this.risk.risk_level = 'medium';
  else if (this.risk.risk_score >= 10) this.risk.risk_level = 'low';
  else this.risk.risk_level = 'minimal';
  
  this.risk.is_high_risk = this.risk.risk_score >= 50;
  
  return this.risk.risk_score;
};

userIdentitySchema.methods.detectBehaviorAnomaly = function(currentActivity) {
  const anomalies = [];
  
  // Check login time
  const currentHour = new Date(currentActivity.timestamp).getHours();
  const typicalHours = this.behavior.baseline.typical_login_hours;
  const isTypicalTime = typicalHours.some(h => 
    currentHour >= h.start_hour && currentHour <= h.end_hour
  );
  
  if (!isTypicalTime) {
    anomalies.push({
      anomaly_type: 'unusual_time',
      description: 'Login attempt outside typical hours',
      severity: 'medium',
      detected_at: new Date(),
      deviation_score: 60,
      resolved: false
    });
  }
  
  // Check location
  const typicalLocations = this.behavior.baseline.typical_locations.map(l => l.country);
  if (currentActivity.location && !typicalLocations.includes(currentActivity.location.country)) {
    anomalies.push({
      anomaly_type: 'unusual_location',
      description: `Access from untypical country: ${currentActivity.location.country}`,
      severity: 'high',
      detected_at: new Date(),
      deviation_score: 80,
      resolved: false
    });
  }
  
  // Check device
  if (currentActivity.device_id && !this.behavior.baseline.typical_devices.includes(currentActivity.device_id)) {
    anomalies.push({
      anomaly_type: 'new_device',
      description: 'Access from new/unknown device',
      severity: 'medium',
      detected_at: new Date(),
      deviation_score: 65,
      resolved: false
    });
  }
  
  if (anomalies.length > 0) {
    this.behavior.anomalies_detected.push(...anomalies);
  }
  
  return anomalies;
};

userIdentitySchema.methods.addToWatchlist = function(reason) {
  this.management.watchlist = true;
  this.management.watchlist_reason = reason;
  this.management.watchlist_added_at = new Date();
  return this.save();
};

module.exports = mongoose.model('UserIdentity', userIdentitySchema);

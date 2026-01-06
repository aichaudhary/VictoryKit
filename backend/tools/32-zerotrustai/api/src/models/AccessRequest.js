const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Request Details
  request: {
    timestamp: { type: Date, default: Date.now, index: true },
    resource_id: { type: String, required: true, index: true },
    resource_type: { type: String, required: true },
    resource_name: String,
    resource_sensitivity: { 
      type: String, 
      enum: ['public', 'internal', 'confidential', 'restricted', 'top_secret'],
      default: 'internal'
    },
    action_requested: { type: String, required: true },
    protocol: String,
    source_port: Number,
    destination_port: Number
  },
  
  // User Identity
  user: {
    user_id: { type: String, required: true, index: true },
    username: String,
    email: String,
    department: String,
    role: String,
    clearance_level: { type: String, enum: ['basic', 'elevated', 'privileged', 'admin'] },
    groups: [String],
    is_privileged: { type: Boolean, default: false }
  },
  
  // Device Trust
  device: {
    device_id: { type: String, required: true, index: true },
    device_type: { type: String, enum: ['laptop', 'desktop', 'mobile', 'tablet', 'server', 'iot', 'unknown'] },
    os: String,
    os_version: String,
    manufacturer: String,
    model: String,
    is_managed: Boolean,
    is_compliant: Boolean,
    trust_score: { type: Number, min: 0, max: 100 },
    security_posture: {
      encryption_enabled: Boolean,
      firewall_enabled: Boolean,
      antivirus_updated: Boolean,
      os_patched: Boolean,
      disk_encrypted: Boolean,
      is_jailbroken: Boolean,
      screen_lock_enabled: Boolean,
      last_security_scan: Date
    }
  },
  
  // Context
  context: {
    ip_address: { type: String, index: true },
    geo_location: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
      is_trusted_location: Boolean
    },
    network: {
      network_type: { type: String, enum: ['corporate', 'vpn', 'public', 'home', 'mobile', 'unknown'] },
      network_name: String,
      is_trusted_network: Boolean,
      connection_type: String
    },
    time_context: {
      hour_of_day: Number,
      day_of_week: String,
      is_business_hours: Boolean,
      timezone: String
    }
  },
  
  // Authentication
  authentication: {
    method: { 
      type: String, 
      enum: ['password', 'mfa', 'certificate', 'biometric', 'sso', 'passwordless', 'risk_adaptive']
    },
    mfa_verified: Boolean,
    mfa_type: [{ type: String, enum: ['totp', 'sms', 'push', 'hardware_token', 'biometric'] }],
    certificate_valid: Boolean,
    sso_provider: String,
    auth_strength: { type: Number, min: 0, max: 100 },
    session_id: String
  },
  
  // Trust Evaluation
  trust: {
    overall_trust_score: { type: Number, min: 0, max: 100, required: true, index: true },
    trust_level: { 
      type: String, 
      enum: ['untrusted', 'low', 'medium', 'high', 'verified'],
      index: true
    },
    factors: {
      identity_trust: { type: Number, min: 0, max: 100 },
      device_trust: { type: Number, min: 0, max: 100 },
      location_trust: { type: Number, min: 0, max: 100 },
      behavior_trust: { type: Number, min: 0, max: 100 },
      time_trust: { type: Number, min: 0, max: 100 },
      network_trust: { type: Number, min: 0, max: 100 }
    },
    confidence: { type: Number, min: 0, max: 100 },
    calculated_at: Date
  },
  
  // Risk Analysis
  risk: {
    risk_score: { type: Number, min: 0, max: 100, index: true },
    risk_level: { 
      type: String, 
      enum: ['minimal', 'low', 'medium', 'high', 'critical'],
      index: true
    },
    risk_factors: [{
      factor: String,
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      description: String,
      score_impact: Number
    }],
    anomaly_detected: { type: Boolean, default: false, index: true },
    anomaly_types: [String],
    threat_indicators: [String]
  },
  
  // Policy Evaluation
  policy: {
    matched_policies: [{
      policy_id: String,
      policy_name: String,
      action: { type: String, enum: ['allow', 'deny', 'step_up_auth', 'limited_access'] },
      priority: Number
    }],
    applicable_frameworks: [String],
    compliance_requirements: [String],
    violations: [{
      rule: String,
      severity: String,
      description: String
    }]
  },
  
  // Decision
  decision: {
    verdict: { 
      type: String, 
      enum: ['allow', 'deny', 'step_up_auth', 'limited_access', 'pending'],
      required: true,
      index: true
    },
    reason: String,
    confidence: { type: Number, min: 0, max: 100 },
    conditions: [{
      type: String,
      description: String,
      expires_at: Date
    }],
    adaptive_controls: [{
      control_type: String,
      action: String,
      triggered_by: String
    }],
    decided_at: { type: Date, default: Date.now },
    decided_by: { type: String, enum: ['automated', 'manual', 'adaptive'], default: 'automated' }
  },
  
  // Session Tracking
  session: {
    session_id: String,
    session_start: Date,
    session_duration_seconds: Number,
    continuous_auth_checks: Number,
    last_validation: Date,
    is_active: { type: Boolean, default: true }
  },
  
  // Audit Trail
  audit: {
    approval_chain: [{
      approver: String,
      action: String,
      timestamp: Date,
      comments: String
    }],
    modifications: [{
      modified_by: String,
      modified_at: Date,
      field: String,
      old_value: String,
      new_value: String
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
  collection: 'access_requests'
});

// Indexes
accessRequestSchema.index({ 'user.user_id': 1, 'request.timestamp': -1 });
accessRequestSchema.index({ 'device.device_id': 1, 'request.timestamp': -1 });
accessRequestSchema.index({ 'decision.verdict': 1, 'risk.risk_level': 1 });
accessRequestSchema.index({ 'context.ip_address': 1, 'request.timestamp': -1 });
accessRequestSchema.index({ 'trust.overall_trust_score': 1 });

// Methods
accessRequestSchema.methods.calculateTrustScore = function() {
  const factors = this.trust.factors;
  
  const weights = {
    identity_trust: 0.25,
    device_trust: 0.20,
    location_trust: 0.15,
    behavior_trust: 0.20,
    time_trust: 0.10,
    network_trust: 0.10
  };
  
  let totalScore = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    totalScore += (factors[factor] || 50) * weight;
  }
  
  this.trust.overall_trust_score = Math.round(totalScore);
  
  // Determine trust level
  if (totalScore >= 90) this.trust.trust_level = 'verified';
  else if (totalScore >= 70) this.trust.trust_level = 'high';
  else if (totalScore >= 50) this.trust.trust_level = 'medium';
  else if (totalScore >= 30) this.trust.trust_level = 'low';
  else this.trust.trust_level = 'untrusted';
  
  this.trust.calculated_at = new Date();
  
  return this.trust.overall_trust_score;
};

accessRequestSchema.methods.calculateRiskScore = function() {
  let riskScore = 0;
  
  // Low trust increases risk
  if (this.trust.overall_trust_score < 30) riskScore += 40;
  else if (this.trust.overall_trust_score < 50) riskScore += 25;
  else if (this.trust.overall_trust_score < 70) riskScore += 10;
  
  // Resource sensitivity
  const sensitivityRisk = {
    'public': 0,
    'internal': 5,
    'confidential': 15,
    'restricted': 25,
    'top_secret': 35
  };
  riskScore += sensitivityRisk[this.request.resource_sensitivity] || 0;
  
  // Device non-compliance
  if (!this.device.is_compliant) riskScore += 20;
  if (this.device.security_posture?.is_jailbroken) riskScore += 30;
  
  // Untrusted location/network
  if (!this.context.geo_location?.is_trusted_location) riskScore += 15;
  if (!this.context.network?.is_trusted_network) riskScore += 15;
  
  // Weak authentication
  if (!this.authentication.mfa_verified) riskScore += 20;
  
  // Outside business hours
  if (!this.context.time_context?.is_business_hours) riskScore += 10;
  
  // Anomaly detected
  if (this.risk.anomaly_detected) riskScore += 25;
  
  this.risk.risk_score = Math.min(100, riskScore);
  
  // Determine risk level
  if (this.risk.risk_score >= 75) this.risk.risk_level = 'critical';
  else if (this.risk.risk_score >= 50) this.risk.risk_level = 'high';
  else if (this.risk.risk_score >= 25) this.risk.risk_level = 'medium';
  else if (this.risk.risk_score >= 10) this.risk.risk_level = 'low';
  else this.risk.risk_level = 'minimal';
  
  return this.risk.risk_score;
};

accessRequestSchema.methods.makeDecision = function() {
  const trustScore = this.trust.overall_trust_score;
  const riskScore = this.risk.risk_score;
  const resourceSensitivity = this.request.resource_sensitivity;
  
  // Critical risk = deny
  if (riskScore >= 75) {
    this.decision.verdict = 'deny';
    this.decision.reason = 'Critical risk level detected';
    return 'deny';
  }
  
  // High risk + sensitive resource = deny
  if (riskScore >= 50 && ['restricted', 'top_secret'].includes(resourceSensitivity)) {
    this.decision.verdict = 'deny';
    this.decision.reason = 'High risk for sensitive resource';
    return 'deny';
  }
  
  // Medium risk or low trust = step up auth
  if (riskScore >= 30 || trustScore < 50) {
    this.decision.verdict = 'step_up_auth';
    this.decision.reason = 'Additional authentication required';
    this.decision.conditions.push({
      type: 'mfa_required',
      description: 'Complete multi-factor authentication',
      expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
    return 'step_up_auth';
  }
  
  // Low risk + high trust = allow
  if (riskScore < 30 && trustScore >= 70) {
    this.decision.verdict = 'allow';
    this.decision.reason = 'Trusted access granted';
    return 'allow';
  }
  
  // Default: limited access
  this.decision.verdict = 'limited_access';
  this.decision.reason = 'Limited access granted with monitoring';
  return 'limited_access';
};

module.exports = mongoose.model('AccessRequest', accessRequestSchema);

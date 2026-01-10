const mongoose = require('mongoose');

const zeroTrustPolicySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  policy_name: { type: String, required: true, index: true },
  
  // Policy Details
  policy: {
    description: String,
    purpose: String,
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'archived'],
      default: 'draft',
      index: true
    },
    priority: { type: Number, min: 1, max: 100, default: 50 },
    category: {
      type: String,
      enum: ['access_control', 'authentication', 'network', 'device', 'data', 'application'],
      index: true
    },
    framework: String
  },
  
  // Scope
  scope: {
    resources: [{
      resource_id: String,
      resource_type: String,
      resource_name: String,
      sensitivity_level: String
    }],
    users: [{
      type: { type: String, enum: ['user', 'group', 'role', 'all'] },
      identifier: String,
      name: String
    }],
    devices: [{
      type: { type: String, enum: ['managed', 'byod', 'all'] },
      os_types: [String],
      compliance_required: Boolean
    }],
    networks: [{
      network_type: String,
      trusted: Boolean,
      cidr_blocks: [String]
    }],
    applications: [String]
  },
  
  // Trust Requirements
  trust_requirements: {
    minimum_trust_score: { type: Number, min: 0, max: 100, required: true },
    required_trust_factors: [{
      factor: String,
      minimum_score: Number,
      weight: Number
    }],
    identity_requirements: {
      authentication_strength: { type: String, enum: ['basic', 'strong', 'very_strong'] },
      mfa_required: Boolean,
      mfa_types: [String],
      certificate_required: Boolean,
      biometric_required: Boolean
    },
    device_requirements: {
      managed_device_required: Boolean,
      compliance_required: Boolean,
      minimum_os_version: String,
      encryption_required: Boolean,
      minimum_device_trust: Number
    },
    location_requirements: {
      allowed_countries: [String],
      blocked_countries: [String],
      trusted_locations_only: Boolean,
      geofencing_enabled: Boolean
    },
    network_requirements: {
      allowed_networks: [String],
      vpn_required: Boolean,
      corporate_network_only: Boolean
    }
  },
  
  // Conditions
  conditions: {
    time_based: {
      allowed_hours: [{
        day_of_week: String,
        start_time: String,
        end_time: String
      }],
      timezone: String,
      business_hours_only: Boolean
    },
    context_based: {
      max_concurrent_sessions: Number,
      session_timeout_minutes: Number,
      idle_timeout_minutes: Number,
      require_continuous_auth: Boolean
    },
    risk_based: {
      max_risk_score: Number,
      block_anomalies: Boolean,
      adaptive_controls: Boolean
    }
  },
  
  // Actions
  enforcement: {
    default_action: {
      type: String,
      enum: ['allow', 'deny', 'step_up_auth', 'limited_access'],
      required: true
    },
    on_trust_below_threshold: String,
    on_risk_above_threshold: String,
    on_anomaly_detected: String,
    on_policy_violation: String,
    adaptive_actions: [{
      trigger: String,
      action: String,
      description: String
    }]
  },
  
  // Monitoring
  monitoring: {
    continuous_validation_enabled: Boolean,
    validation_interval_seconds: { type: Number, default: 300 },
    alert_on_violation: Boolean,
    alert_channels: [String],
    log_all_requests: Boolean,
    audit_level: { type: String, enum: ['none', 'basic', 'detailed', 'verbose'], default: 'basic' }
  },
  
  // Statistics
  statistics: {
    total_requests_evaluated: { type: Number, default: 0 },
    requests_allowed: { type: Number, default: 0 },
    requests_denied: { type: Number, default: 0 },
    step_up_auth_triggered: { type: Number, default: 0 },
    violations_detected: { type: Number, default: 0 },
    last_evaluated: Date,
    last_violation: Date
  },
  
  // Management
  management: {
    owner: {
      user_id: String,
      name: String,
      email: String
    },
    approvers: [{
      user_id: String,
      name: String,
      approved_at: Date
    }],
    version: { type: Number, default: 1 },
    previous_versions: [{
      version: Number,
      modified_by: String,
      modified_at: Date,
      changes: String
    }],
    review_required_by: Date,
    last_reviewed: Date
  },
  
  metadata: {
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    tags: [String],
    notes: String
  }
}, {
  timestamps: true,
  collection: 'zero_trust_policies'
});

// Indexes
zeroTrustPolicySchema.index({ 'policy.status': 1, 'policy.priority': -1 });
zeroTrustPolicySchema.index({ 'scope.resources.resource_id': 1 });
zeroTrustPolicySchema.index({ 'scope.users.identifier': 1 });

// Methods
zeroTrustPolicySchema.methods.activate = function() {
  this.policy.status = 'active';
  this.metadata.updated_at = new Date();
  return this.save();
};

zeroTrustPolicySchema.methods.deactivate = function() {
  this.policy.status = 'inactive';
  this.metadata.updated_at = new Date();
  return this.save();
};

zeroTrustPolicySchema.methods.evaluateRequest = function(accessRequest) {
  // Check if policy applies to this request
  const appliesToUser = this.appliesToUser(accessRequest.user);
  const appliesToResource = this.appliesToResource(accessRequest.request);
  const appliesToDevice = this.appliesToDevice(accessRequest.device);
  
  if (!appliesToUser || !appliesToResource || !appliesToDevice) {
    return null; // Policy doesn't apply
  }
  
  // Evaluate trust requirements
  const trustMet = accessRequest.trust.overall_trust_score >= this.trust_requirements.minimum_trust_score;
  
  // Evaluate conditions
  const conditionsMet = this.evaluateConditions(accessRequest);
  
  if (trustMet && conditionsMet) {
    return {
      policy_id: this.policyId,
      policy_name: this.policy_name,
      action: this.enforcement.default_action,
      priority: this.policy.priority
    };
  }
  
  // Trust or conditions not met - apply enforcement action
  return {
    policy_id: this.policyId,
    policy_name: this.policy_name,
    action: trustMet ? this.enforcement.on_risk_above_threshold : this.enforcement.on_trust_below_threshold,
    priority: this.policy.priority,
    reason: `Policy requirements not met: ${!trustMet ? 'Low trust score' : 'Conditions not satisfied'}`
  };
};

zeroTrustPolicySchema.methods.appliesToUser = function(user) {
  if (!this.scope.users || this.scope.users.length === 0) return true;
  
  for (const scopeUser of this.scope.users) {
    if (scopeUser.type === 'all') return true;
    if (scopeUser.type === 'user' && scopeUser.identifier === user.user_id) return true;
    if (scopeUser.type === 'role' && scopeUser.identifier === user.role) return true;
    if (scopeUser.type === 'group' && user.groups.includes(scopeUser.identifier)) return true;
  }
  
  return false;
};

zeroTrustPolicySchema.methods.appliesToResource = function(request) {
  if (!this.scope.resources || this.scope.resources.length === 0) return true;
  
  return this.scope.resources.some(r => r.resource_id === request.resource_id);
};

zeroTrustPolicySchema.methods.appliesToDevice = function(device) {
  if (!this.scope.devices || this.scope.devices.length === 0) return true;
  
  for (const scopeDevice of this.scope.devices) {
    if (scopeDevice.type === 'all') return true;
    if (scopeDevice.type === 'managed' && device.is_managed) return true;
    if (scopeDevice.type === 'byod' && !device.is_managed) return true;
  }
  
  return false;
};

zeroTrustPolicySchema.methods.evaluateConditions = function(accessRequest) {
  // Time-based conditions
  if (this.conditions.time_based?.business_hours_only) {
    if (!accessRequest.context.time_context?.is_business_hours) return false;
  }
  
  // Risk-based conditions
  if (this.conditions.risk_based?.max_risk_score) {
    if (accessRequest.risk.risk_score > this.conditions.risk_based.max_risk_score) return false;
  }
  
  if (this.conditions.risk_based?.block_anomalies) {
    if (accessRequest.risk.anomaly_detected) return false;
  }
  
  return true;
};

zeroTrustPolicySchema.methods.updateStatistics = function(verdict) {
  this.statistics.total_requests_evaluated++;
  
  if (verdict === 'allow') this.statistics.requests_allowed++;
  else if (verdict === 'deny') this.statistics.requests_denied++;
  else if (verdict === 'step_up_auth') this.statistics.step_up_auth_triggered++;
  
  this.statistics.last_evaluated = new Date();
  
  return this.save();
};

module.exports = mongoose.model('ZeroTrustPolicy', zeroTrustPolicySchema);

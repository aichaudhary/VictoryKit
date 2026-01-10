const mongoose = require('mongoose');

const anomalyDetectionSchema = new mongoose.Schema({
  // Core identifiers
  anomalyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Detection details
  detection: {
    detected_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    detection_model: {
      type: String,
      enum: ['isolation_forest', 'lstm_autoencoder', 'random_forest', 'statistical', 'rule_based', 'ensemble'],
      required: true
    },
    model_version: String,
    detection_method: String,
    confidence_score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      index: true
    }
  },
  
  // Anomaly classification
  anomaly: {
    type: {
      type: String,
      required: true,
      enum: ['unusual_access_pattern', 'privilege_escalation', 'data_exfiltration', 'config_tampering', 'failed_auth_attempts', 'unusual_time', 'unusual_location', 'volume_spike', 'behavioral_deviation', 'suspicious_sequence'],
      index: true
    },
    category: {
      type: String,
      enum: ['access_anomaly', 'behavioral_anomaly', 'temporal_anomaly', 'volume_anomaly', 'sequence_anomaly', 'statistical_anomaly'],
      index: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      index: true,
      default: 'medium'
    },
    risk_score: {
      type: Number,
      min: 0,
      max: 100,
      index: true
    },
    description: String
  },
  
  // Affected audit logs
  auditLogs: {
    primary_audit_id: {
      type: String,
      required: true,
      index: true
    },
    related_audit_ids: [String],
    total_logs_analyzed: Number,
    anomalous_log_count: Number,
    time_range: {
      start: Date,
      end: Date
    }
  },
  
  // Baseline and deviation
  baseline: {
    baseline_period: String,
    baseline_start: Date,
    baseline_end: Date,
    normal_behavior: mongoose.Schema.Types.Mixed,
    statistical_measures: {
      mean: Number,
      median: Number,
      std_deviation: Number,
      percentile_95: Number,
      percentile_99: Number
    }
  },
  
  deviation: {
    metric: String,
    expected_value: Number,
    actual_value: Number,
    deviation_percentage: Number,
    deviation_type: {
      type: String,
      enum: ['positive', 'negative', 'both']
    },
    z_score: Number,
    outlier_type: {
      type: String,
      enum: ['mild', 'moderate', 'extreme']
    }
  },
  
  // Context and patterns
  context: {
    user: {
      user_id: String,
      username: String,
      typical_behavior: mongoose.Schema.Types.Mixed,
      risk_profile: String
    },
    system: {
      system_id: String,
      system_name: String,
      normal_activity: mongoose.Schema.Types.Mixed
    },
    temporal: {
      time_of_day: String,
      day_of_week: String,
      is_business_hours: Boolean,
      is_holiday: Boolean,
      typical_activity_time: [String]
    },
    location: {
      ip_address: String,
      geo_location: String,
      is_known_location: Boolean,
      typical_locations: [String]
    }
  },
  
  patterns: {
    sequence_pattern: [String],
    frequency_pattern: mongoose.Schema.Types.Mixed,
    volume_pattern: mongoose.Schema.Types.Mixed,
    correlation_patterns: [{
      correlated_with: String,
      correlation_type: String,
      correlation_strength: Number
    }]
  },
  
  // ML Model details
  mlModel: {
    features_used: [String],
    feature_importance: mongoose.Schema.Types.Mixed,
    training_data_size: Number,
    training_date: Date,
    false_positive_rate: Number,
    false_negative_rate: Number,
    model_accuracy: Number,
    hyperparameters: mongoose.Schema.Types.Mixed
  },
  
  // Analysis results
  analysis: {
    indicators_of_compromise: [String],
    suspicious_attributes: [String],
    similar_past_anomalies: [String],
    potential_attack_patterns: [String],
    threat_intel_matches: [{
      source: String,
      match_type: String,
      confidence: Number,
      details: String
    }]
  },
  
  // Investigation status
  investigation: {
    status: {
      type: String,
      enum: ['new', 'triaged', 'investigating', 'confirmed_threat', 'false_positive', 'resolved', 'escalated'],
      default: 'new',
      index: true
    },
    assigned_to: String,
    assigned_at: Date,
    priority: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4']
    },
    investigation_id: String,
    notes: [String],
    resolution: String,
    resolution_date: Date,
    false_positive_reason: String
  },
  
  // Response and remediation
  response: {
    automated_action_taken: {
      type: Boolean,
      default: false
    },
    actions: [{
      action_type: String,
      action_description: String,
      taken_by: String,
      taken_at: Date,
      status: String,
      result: String
    }],
    alert_triggered: {
      type: Boolean,
      default: false
    },
    notifications_sent: [{
      channel: String,
      recipient: String,
      sent_at: Date,
      acknowledged: Boolean
    }],
    ticket_created: String,
    ticket_system: String
  },
  
  // Tuning and feedback
  tuning: {
    is_true_positive: Boolean,
    feedback_provided: {
      type: Boolean,
      default: false
    },
    feedback_by: String,
    feedback_date: Date,
    feedback_notes: String,
    model_adjustment_needed: {
      type: Boolean,
      default: false
    },
    suppression_rule_created: {
      type: Boolean,
      default: false
    },
    suppression_rule_id: String
  },
  
  // Metadata
  metadata: {
    detection_source: String,
    detection_rule_id: String,
    custom_tags: [String],
    related_anomalies: [String],
    parent_anomaly: String,
    archived: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'anomaly_detections'
});

// Indexes
anomalyDetectionSchema.index({ 'detection.detected_at': -1, 'anomaly.severity': 1 });
anomalyDetectionSchema.index({ 'investigation.status': 1, 'anomaly.risk_score': -1 });
anomalyDetectionSchema.index({ 'context.user.user_id': 1, 'detection.detected_at': -1 });
anomalyDetectionSchema.index({ 'detection.confidence_score': -1, 'anomaly.type': 1 });

// Instance methods
anomalyDetectionSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Confidence contribution
  score += this.detection.confidence_score * 0.4;
  
  // Severity contribution
  const severityScores = { critical: 40, high: 30, medium: 20, low: 10 };
  score += severityScores[this.anomaly.severity] || 0;
  
  // Context factors
  if (this.context.temporal && !this.context.temporal.is_business_hours) score += 10;
  if (this.context.location && !this.context.location.is_known_location) score += 15;
  
  // Deviation magnitude
  if (this.deviation.outlier_type === 'extreme') score += 15;
  else if (this.deviation.outlier_type === 'moderate') score += 10;
  
  this.anomaly.risk_score = Math.min(100, score);
  return this.anomaly.risk_score;
};

anomalyDetectionSchema.methods.assignInvestigator = function(userId) {
  this.investigation.assigned_to = userId;
  this.investigation.assigned_at = new Date();
  this.investigation.status = 'triaged';
};

anomalyDetectionSchema.methods.markAsFalsePositive = function(reason, userId) {
  this.investigation.status = 'false_positive';
  this.investigation.false_positive_reason = reason;
  this.investigation.resolution_date = new Date();
  this.tuning.is_true_positive = false;
  this.tuning.feedback_provided = true;
  this.tuning.feedback_by = userId;
  this.tuning.feedback_date = new Date();
};

anomalyDetectionSchema.methods.escalate = function(investigationId) {
  this.investigation.status = 'escalated';
  this.investigation.investigation_id = investigationId;
  this.investigation.priority = 'P1';
};

// Static methods
anomalyDetectionSchema.statics.findUnresolved = function(minRiskScore = 0) {
  return this.find({
    'investigation.status': { $in: ['new', 'triaged', 'investigating'] },
    'anomaly.risk_score': { $gte: minRiskScore }
  }).sort({ 'anomaly.risk_score': -1, 'detection.detected_at': -1 });
};

anomalyDetectionSchema.statics.findByType = function(anomalyType, options = {}) {
  const query = { 'anomaly.type': anomalyType };
  
  if (options.severity) {
    query['anomaly.severity'] = options.severity;
  }
  
  if (options.startDate) {
    query['detection.detected_at'] = { $gte: new Date(options.startDate) };
  }
  
  return this.find(query).sort({ 'detection.detected_at': -1 }).limit(options.limit || 100);
};

anomalyDetectionSchema.statics.findByUser = function(userId) {
  return this.find({
    'context.user.user_id': userId
  }).sort({ 'detection.detected_at': -1 });
};

anomalyDetectionSchema.statics.getFalsePositiveRate = function(modelType, startDate) {
  return this.aggregate([
    {
      $match: {
        'detection.detection_model': modelType,
        'detection.detected_at': { $gte: new Date(startDate) },
        'tuning.feedback_provided': true
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        falsePositives: {
          $sum: { $cond: [{ $eq: ['$tuning.is_true_positive', false] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        falsePositives: 1,
        rate: { $divide: ['$falsePositives', '$total'] }
      }
    }
  ]);
};

module.exports = mongoose.model('AnomalyDetection', anomalyDetectionSchema);

const mongoose = require('mongoose');

const biometricAlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    ref: 'BiometricSession'
  },
  alertType: {
    type: String,
    enum: [
      'spoofing_attempt',
      'anomaly_detected',
      'device_mismatch',
      'location_anomaly',
      'behavioral_anomaly',
      'multiple_failures',
      'suspicious_pattern',
      'tampering_detected',
      'quality_degradation',
      'system_compromise'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    biometricType: String,
    expectedValue: mongoose.Schema.Types.Mixed,
    actualValue: mongoose.Schema.Types.Mixed,
    threshold: Number,
    deviation: Number,
    evidence: mongoose.Schema.Types.Mixed
  },
  location: {
    ip: String,
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    fingerprint: String
  },
  response: {
    autoBlocked: { type: Boolean, default: false },
    manualReview: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false }
  },
  resolution: {
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'false_positive', 'dismissed'],
      default: 'open'
    },
    resolvedBy: mongoose.Schema.Types.ObjectId,
    resolvedAt: Date,
    resolution: String,
    actions: [{
      action: String,
      timestamp: Date,
      performedBy: mongoose.Schema.Types.ObjectId
    }]
  },
  integrations: {
    siemForwarded: { type: Boolean, default: false },
    threatIntelChecked: { type: Boolean, default: false },
    notificationsSent: [String], // email, sms, webhook URLs
    externalIds: mongoose.Schema.Types.Mixed // IDs from external systems
  },
  metadata: {
    apiVersion: String,
    modelVersion: String,
    detectionEngine: String,
    processingTime: Number
  }
}, {
  timestamps: true,
  collection: 'biometric_alerts'
});

// Indexes for performance
biometricAlertSchema.index({ userId: 1, createdAt: -1 });
biometricAlertSchema.index({ alertType: 1, severity: 1 });
biometricAlertSchema.index({ 'resolution.status': 1 });
biometricAlertSchema.index({ confidence: -1 });
biometricAlertSchema.index({ 'location.ip': 1 });
biometricAlertSchema.index({ sessionId: 1 });

// Compound indexes for common queries
biometricAlertSchema.index({ userId: 1, severity: 1, createdAt: -1 });
biometricAlertSchema.index({ alertType: 1, 'resolution.status': 1 });

module.exports = mongoose.model('BiometricAlert', biometricAlertSchema);
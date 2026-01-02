const mongoose = require('mongoose');

const biometricSessionSchema = new mongoose.Schema({
  sessionId: {
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
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  biometricType: {
    type: String,
    enum: ['face', 'fingerprint', 'voice', 'iris', 'behavioral', 'multi-modal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'authenticated', 'failed', 'blocked', 'timeout'],
    default: 'pending'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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
    screenResolution: String,
    timezone: String
  },
  behavioralData: {
    typingSpeed: Number,
    mouseMovements: [{
      x: Number,
      y: Number,
      timestamp: Date
    }],
    keystrokeDynamics: [{
      key: String,
      pressTime: Number,
      releaseTime: Number
    }]
  },
  attempts: [{
    timestamp: Date,
    method: String,
    result: String,
    confidence: Number,
    error: String
  }],
  securityAlerts: [{
    type: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String,
    confidence: Number,
    timestamp: Date
  }],
  metadata: {
    apiVersion: String,
    clientVersion: String,
    sessionDuration: Number
  }
}, {
  timestamps: true,
  collection: 'biometric_sessions'
});

// Indexes for performance
biometricSessionSchema.index({ userId: 1, createdAt: -1 });
biometricSessionSchema.index({ deviceId: 1, createdAt: -1 });
biometricSessionSchema.index({ status: 1, createdAt: -1 });
biometricSessionSchema.index({ 'location.ip': 1 });
biometricSessionSchema.index({ riskScore: -1 });

module.exports = mongoose.model('BiometricSession', biometricSessionSchema);
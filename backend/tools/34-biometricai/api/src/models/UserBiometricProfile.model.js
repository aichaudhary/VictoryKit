const mongoose = require('mongoose');

const userBiometricProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profiles: {
    face: {
      enrolled: { type: Boolean, default: false },
      templates: [{
        templateId: String,
        data: String, // Encrypted template data
        quality: Number,
        enrolledAt: Date,
        lastUsed: Date,
        deviceInfo: String
      }],
      settings: {
        livenessDetection: { type: Boolean, default: true },
        antiSpoofing: { type: Boolean, default: true },
        confidenceThreshold: { type: Number, default: 0.85 }
      }
    },
    fingerprint: {
      enrolled: { type: Boolean, default: false },
      templates: [{
        templateId: String,
        finger: {
          type: String,
          enum: ['left_thumb', 'left_index', 'left_middle', 'left_ring', 'left_pinky',
                 'right_thumb', 'right_index', 'right_middle', 'right_ring', 'right_pinky']
        },
        data: String, // Encrypted template data
        quality: Number,
        enrolledAt: Date,
        lastUsed: Date,
        sensorType: String
      }],
      settings: {
        multiFinger: { type: Boolean, default: false },
        qualityThreshold: { type: Number, default: 80 }
      }
    },
    voice: {
      enrolled: { type: Boolean, default: false },
      templates: [{
        templateId: String,
        phrases: [String],
        data: String, // Encrypted voice template
        quality: Number,
        enrolledAt: Date,
        lastUsed: Date,
        language: { type: String, default: 'en-US' }
      }],
      settings: {
        textDependent: { type: Boolean, default: true },
        noiseCancellation: { type: Boolean, default: true },
        accentDetection: { type: Boolean, default: true }
      }
    },
    iris: {
      enrolled: { type: Boolean, default: false },
      templates: [{
        templateId: String,
        eye: {
          type: String,
          enum: ['left', 'right']
        },
        data: String, // Encrypted iris template
        quality: Number,
        enrolledAt: Date,
        lastUsed: Date,
        deviceInfo: String
      }],
      settings: {
        antiReflection: { type: Boolean, default: true },
        qualityThreshold: { type: Number, default: 85 }
      }
    },
    behavioral: {
      enrolled: { type: Boolean, default: false },
      templates: [{
        templateId: String,
        typingPattern: {
          keystrokeDynamics: mongoose.Schema.Types.Mixed,
          typingSpeed: Number,
          errorRate: Number
        },
        mousePattern: {
          movementPatterns: mongoose.Schema.Types.Mixed,
          clickPatterns: mongoose.Schema.Types.Mixed
        },
        devicePattern: {
          screenResolution: String,
          timezone: String,
          platform: String
        },
        enrolledAt: Date,
        lastUsed: Date,
        confidence: Number
      }],
      settings: {
        continuousLearning: { type: Boolean, default: true },
        adaptiveThreshold: { type: Boolean, default: true }
      }
    }
  },
  securitySettings: {
    multiFactorRequired: { type: Boolean, default: false },
    maxFailedAttempts: { type: Number, default: 3 },
    lockoutDuration: { type: Number, default: 300 }, // seconds
    sessionTimeout: { type: Number, default: 3600 }, // seconds
    ipWhitelist: [String],
    deviceWhitelist: [{
      deviceId: String,
      deviceName: String,
      trusted: { type: Boolean, default: false }
    }]
  },
  statistics: {
    totalAuthentications: { type: Number, default: 0 },
    successfulAuthentications: { type: Number, default: 0 },
    failedAuthentications: { type: Number, default: 0 },
    lastAuthentication: Date,
    averageConfidence: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 }
  },
  auditLog: [{
    action: String,
    timestamp: Date,
    ip: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  collection: 'user_biometric_profiles'
});

// Indexes
userBiometricProfileSchema.index({ userId: 1 });
userBiometricProfileSchema.index({ 'profiles.face.enrolled': 1 });
userBiometricProfileSchema.index({ 'profiles.fingerprint.enrolled': 1 });
userBiometricProfileSchema.index({ 'statistics.lastAuthentication': -1 });

module.exports = mongoose.model('UserBiometricProfile', userBiometricProfileSchema);
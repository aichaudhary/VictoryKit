const axios = require("axios");
const BiometricSession = require('../models/BiometricSession.model');
const UserBiometricProfile = require('../models/UserBiometricProfile.model');
const BiometricAlert = require('../models/BiometricAlert.model');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8034";

class ContainerScanService {
  constructor() {
    this.apiKeys = {
      // Face Recognition APIs
      azure: {
        face: process.env.AZURE_FACE_API_KEY,
        endpoint: process.env.AZURE_FACE_ENDPOINT
      },
      aws: {
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      },
      google: {
        vision: process.env.GOOGLE_CLOUD_VISION_API_KEY,
        speech: process.env.GOOGLE_SPEECH_API_KEY,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
      },
      facePlusPlus: {
        apiKey: process.env.FACE_PLUS_PLUS_API_KEY,
        apiSecret: process.env.FACE_PLUS_PLUS_API_SECRET
      },
      kairos: {
        appId: process.env.KAIROS_APP_ID,
        appKey: process.env.KAIROS_APP_KEY
      },

      // Fingerprint Recognition
      suprema: {
        apiKey: process.env.SUPREMA_BIOMINI_API_KEY,
        endpoint: process.env.SUPREMA_BIOMINI_ENDPOINT
      },
      digitalPersona: {
        apiKey: process.env.DIGITAL_PERSONA_API_KEY,
        endpoint: process.env.DIGITAL_PERSONA_ENDPOINT
      },

      // Voice Recognition
      respeecher: {
        apiKey: process.env.RESPEECHER_API_KEY,
        endpoint: process.env.RESPEECHER_ENDPOINT
      },

      // Iris Recognition
      irisGuard: {
        apiKey: process.env.IRIS_GUARD_API_KEY,
        endpoint: process.env.IRIS_GUARD_ENDPOINT
      },

      // Behavioral Biometrics
      typingdna: {
        apiKey: process.env.TYPING_DNA_API_KEY,
        endpoint: process.env.TYPING_DNA_ENDPOINT
      },
      biocatch: {
        apiKey: process.env.BIO_CATCH_API_KEY,
        endpoint: process.env.BIO_CATCH_ENDPOINT
      },
      behavioSec: {
        apiKey: process.env.BEHAVIO_SEC_API_KEY,
        endpoint: process.env.BEHAVIO_SEC_ENDPOINT
      },

      // Security Integrations
      splunk: {
        hecUrl: process.env.SPLUNK_HEC_URL,
        hecToken: process.env.SPLUNK_HEC_TOKEN
      },
      virustotal: {
        apiKey: process.env.VIRUSTOTAL_API_KEY
      },
      abuseipdb: {
        apiKey: process.env.ABUSEIPDB_API_KEY
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
      },
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL
      },
      firebase: {
        serverKey: process.env.FIREBASE_SERVER_KEY
      },
      onesignal: {
        appId: process.env.ONESIGNAL_APP_ID,
        apiKey: process.env.ONESIGNAL_API_KEY
      },
      crowdstrike: {
        apiKey: process.env.CROWDSTRIKE_API_KEY,
        baseUrl: process.env.CROWDSTRIKE_BASE_URL
      },
      xsoar: {
        apiKey: process.env.XSOAR_API_KEY,
        baseUrl: process.env.XSOAR_BASE_URL
      },
      elasticsearch: {
        url: process.env.ELASTICSEARCH_URL,
        apiKey: process.env.ELASTICSEARCH_API_KEY
      }
    };
  }

  // Enhanced biometric authentication with multi-modal support
  async authenticate(userId, biometricData, options = {}) {
    try {
      const session = new BiometricSession({
        sessionId: `BIO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        deviceId: biometricData.deviceId,
        biometricType: biometricData.type || 'multi-modal',
        location: biometricData.location,
        deviceInfo: biometricData.deviceInfo,
        behavioralData: biometricData.behavioral
      });

      // Get user's biometric profile
      const profile = await UserBiometricProfile.findOne({ userId });
      if (!profile) {
        throw new Error('Biometric profile not found. Please enroll first.');
      }

      let totalConfidence = 0;
      let methodsUsed = 0;
      const results = {};

      // Face recognition
      if (biometricData.face && profile.profiles.face.enrolled) {
        const faceResult = await this.authenticateFace(biometricData.face, profile.profiles.face);
        results.face = faceResult;
        totalConfidence += faceResult.confidence;
        methodsUsed++;
        session.attempts.push({
          timestamp: new Date(),
          method: 'face',
          result: faceResult.success ? 'success' : 'failed',
          confidence: faceResult.confidence
        });
      }

      // Fingerprint recognition
      if (biometricData.fingerprint && profile.profiles.fingerprint.enrolled) {
        const fingerprintResult = await this.authenticateFingerprint(biometricData.fingerprint, profile.profiles.fingerprint);
        results.fingerprint = fingerprintResult;
        totalConfidence += fingerprintResult.confidence;
        methodsUsed++;
        session.attempts.push({
          timestamp: new Date(),
          method: 'fingerprint',
          result: fingerprintResult.success ? 'success' : 'failed',
          confidence: fingerprintResult.confidence
        });
      }

      // Voice recognition
      if (biometricData.voice && profile.profiles.voice.enrolled) {
        const voiceResult = await this.authenticateVoice(biometricData.voice, profile.profiles.voice);
        results.voice = voiceResult;
        totalConfidence += voiceResult.confidence;
        methodsUsed++;
        session.attempts.push({
          timestamp: new Date(),
          method: 'voice',
          result: voiceResult.success ? 'success' : 'failed',
          confidence: voiceResult.confidence
        });
      }

      // Behavioral biometrics
      if (biometricData.behavioral && profile.profiles.behavioral.enrolled) {
        const behavioralResult = await this.authenticateBehavioral(biometricData.behavioral, profile.profiles.behavioral);
        results.behavioral = behavioralResult;
        totalConfidence += behavioralResult.confidence;
        methodsUsed++;
        session.attempts.push({
          timestamp: new Date(),
          method: 'behavioral',
          result: behavioralResult.success ? 'success' : 'failed',
          confidence: behavioralResult.confidence
        });
      }

      // Calculate overall confidence and risk
      const averageConfidence = methodsUsed > 0 ? totalConfidence / methodsUsed : 0;
      const riskScore = await this.calculateRiskScore(results, biometricData, profile);

      // Security checks
      const securityAlerts = await this.performSecurityChecks(biometricData, profile, results);

      // Update session
      session.confidence = averageConfidence;
      session.riskScore = riskScore;
      session.securityAlerts = securityAlerts;
      session.status = averageConfidence >= 0.8 && riskScore < 30 ? 'authenticated' : 'failed';

      await session.save();

      // Create alerts for high-risk situations
      if (securityAlerts.length > 0) {
        await this.createSecurityAlerts(session, securityAlerts);
      }

      // Update user statistics
      await this.updateUserStatistics(userId, session.status === 'authenticated');

      return {
        success: session.status === 'authenticated',
        sessionId: session.sessionId,
        confidence: averageConfidence,
        riskScore,
        methods: results,
        alerts: securityAlerts,
        recommendations: this.generateRecommendations(results, riskScore)
      };

    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  }

  // Face authentication using Azure Face API
  async authenticateFace(faceData, profile) {
    try {
      if (!this.apiKeys.azure.face) {
        return this.fallbackFaceAuth(faceData, profile);
      }

      const response = await axios.post(
        `${this.apiKeys.azure.endpoint}/face/v1.0/detect`,
        { data: faceData.image },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKeys.azure.face,
            'Content-Type': 'application/json'
          },
          params: {
            detectionModel: 'detection_03',
            recognitionModel: 'recognition_04'
          }
        }
      );

      // Compare with stored templates
      const confidence = await this.compareFaceTemplates(response.data, profile.templates);

      return {
        success: confidence >= profile.settings.confidenceThreshold,
        confidence,
        details: response.data
      };
    } catch (error) {
      console.error('Azure Face API error:', error.message);
      return this.fallbackFaceAuth(faceData, profile);
    }
  }

  // Fingerprint authentication
  async authenticateFingerprint(fingerprintData, profile) {
    try {
      // Use Suprema BioMini or similar service
      if (!this.apiKeys.suprema) {
        return this.fallbackFingerprintAuth(fingerprintData, profile);
      }

      const response = await axios.post(
        `${process.env.SUPREMA_BIOMINI_ENDPOINT}/verify`,
        {
          template: fingerprintData.template,
          userId: fingerprintData.userId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.suprema.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.match,
        confidence: response.data.score / 100,
        details: response.data
      };
    } catch (error) {
      console.error('Fingerprint API error:', error.message);
      return this.fallbackFingerprintAuth(fingerprintData, profile);
    }
  }

  // Voice authentication using Google Speech-to-Text + custom ML
  async authenticateVoice(voiceData, profile) {
    try {
      if (!this.apiKeys.google.speech) {
        return this.fallbackVoiceAuth(voiceData, profile);
      }

      // First transcribe speech
      const transcription = await this.transcribeSpeech(voiceData.audio);

      // Then verify against voice templates
      const response = await axios.post(
        `${ML_ENGINE_URL}/voice/verify`,
        {
          audio: voiceData.audio,
          transcription,
          userTemplates: profile.templates
        }
      );

      return {
        success: response.data.confidence >= profile.settings.confidenceThreshold,
        confidence: response.data.confidence,
        transcription,
        details: response.data
      };
    } catch (error) {
      console.error('Voice authentication error:', error.message);
      return this.fallbackVoiceAuth(voiceData, profile);
    }
  }

  // Behavioral biometrics using TypingDNA and BioCatch
  async authenticateBehavioral(behavioralData, profile) {
    try {
      let typingScore = 0.5;
      let mouseScore = 0.5;

      // Typing pattern analysis
      if (behavioralData.typing && this.apiKeys.typingdna.apiKey) {
        const typingResponse = await axios.post(
          `${this.apiKeys.typingdna.endpoint}/verify`,
          {
            typingPattern: behavioralData.typing,
            userId: behavioralData.userId
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.typingdna.apiKey}`
            }
          }
        );
        typingScore = typingResponse.data.confidence;
      }

      // Mouse movement analysis
      if (behavioralData.mouse && this.apiKeys.biocatch.apiKey) {
        const mouseResponse = await axios.post(
          `${this.apiKeys.biocatch.endpoint}/analyze`,
          {
            mouseData: behavioralData.mouse,
            deviceInfo: behavioralData.deviceInfo
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKeys.biocatch.apiKey}`
            }
          }
        );
        mouseScore = mouseResponse.data.score;
      }

      const overallConfidence = (typingScore + mouseScore) / 2;

      return {
        success: overallConfidence >= 0.7,
        confidence: overallConfidence,
        typingScore,
        mouseScore,
        details: { typingScore, mouseScore }
      };
    } catch (error) {
      console.error('Behavioral authentication error:', error.message);
      return this.fallbackBehavioralAuth(behavioralData, profile);
    }
  }

  // Risk score calculation
  async calculateRiskScore(results, biometricData, profile) {
    let riskScore = 0;

    // Location anomaly
    if (biometricData.location) {
      const locationRisk = await this.checkLocationAnomaly(biometricData.location, profile);
      riskScore += locationRisk * 20;
    }

    // Device anomaly
    if (biometricData.deviceInfo) {
      const deviceRisk = await this.checkDeviceAnomaly(biometricData.deviceInfo, profile);
      riskScore += deviceRisk * 15;
    }

    // Time-based anomaly
    const timeRisk = this.checkTimeAnomaly(biometricData.timestamp, profile);
    riskScore += timeRisk * 10;

    // Biometric confidence
    const avgConfidence = Object.values(results).reduce((sum, r) => sum + (r.confidence || 0), 0) / Object.keys(results).length;
    riskScore += (1 - avgConfidence) * 30;

    // Recent failures
    const recentFailures = await this.getRecentFailures(profile.userId);
    riskScore += recentFailures * 25;

    return Math.min(100, Math.max(0, riskScore));
  }

  // Security checks and anomaly detection
  async performSecurityChecks(biometricData, profile, results) {
    const alerts = [];

    // Spoofing detection
    for (const [method, result] of Object.entries(results)) {
      if (result.spoofingDetected) {
        alerts.push({
          type: 'spoofing_attempt',
          severity: 'critical',
          description: `${method} spoofing attempt detected`,
          confidence: result.spoofingConfidence || 0.9
        });
      }
    }

    // Multiple method failures
    const failedMethods = Object.values(results).filter(r => !r.success).length;
    if (failedMethods > 1) {
      alerts.push({
        type: 'multiple_failures',
        severity: 'high',
        description: `${failedMethods} biometric methods failed`,
        confidence: 0.8
      });
    }

    // Behavioral anomalies
    if (results.behavioral && results.behavioral.confidence < 0.5) {
      alerts.push({
        type: 'behavioral_anomaly',
        severity: 'medium',
        description: 'Unusual behavioral patterns detected',
        confidence: 1 - results.behavioral.confidence
      });
    }

    return alerts;
  }

  // Create security alerts in database
  async createSecurityAlerts(session, alerts) {
    for (const alert of alerts) {
      const biometricAlert = new BiometricAlert({
        alertId: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        sessionId: session.sessionId,
        alertType: alert.type,
        severity: alert.severity,
        confidence: alert.confidence,
        description: alert.description,
        location: session.location,
        deviceInfo: session.deviceInfo
      });

      await biometricAlert.save();

      // Send notifications for high-severity alerts
      if (alert.severity === 'critical' || alert.severity === 'high') {
        await this.sendAlertNotifications(biometricAlert);
      }
    }
  }

  // Send alert notifications
  async sendAlertNotifications(alert) {
    try {
      // Email notification
      if (process.env.SENDGRID_API_KEY) {
        await this.sendEmailAlert(alert);
      }

      // SMS notification
      if (process.env.TWILIO_ACCOUNT_SID) {
        await this.sendSMSAlert(alert);
      }

      // SIEM integration
      if (process.env.SPLUNK_HEC_URL) {
        await this.sendToSIEM(alert);
      }
    } catch (error) {
      console.error('Alert notification error:', error);
    }
  }

  // Fallback methods for when APIs are unavailable
  fallbackFaceAuth(faceData, profile) {
    // Basic face template matching fallback
    let confidence = 0.6;

    if (faceData.template && profile.faceTemplate) {
      // Simple template similarity (in production, use proper face recognition)
      const similarity = this.calculateTemplateSimilarity(faceData.template, profile.faceTemplate);
      confidence = Math.max(0.5, similarity);
    }

    return {
      success: confidence >= (profile.settings?.confidenceThreshold || 0.8),
      confidence,
      method: 'fallback'
    };
  }

  fallbackFingerprintAuth(fingerprintData, profile) {
    // Basic fingerprint template matching fallback
    let confidence = 0.7;

    if (fingerprintData.template && profile.fingerprintTemplate) {
      // Simple template comparison (in production, use proper fingerprint matching)
      const similarity = this.calculateTemplateSimilarity(fingerprintData.template, profile.fingerprintTemplate);
      confidence = Math.max(0.6, similarity);
    }

    return {
      success: confidence >= 0.8,
      confidence,
      method: 'fallback'
    };
  }

  fallbackBehavioralAuth(behavioralData, profile) {
    // Simple pattern matching fallback for behavioral biometrics
    let confidence = 0.5;

    if (behavioralData.typing) {
      // Basic typing pattern analysis
      const avgKeyPressTime = behavioralData.typing.keyPressTimes?.reduce((a, b) => a + b, 0) / behavioralData.typing.keyPressTimes?.length || 0;
      const avgKeyReleaseTime = behavioralData.typing.keyReleaseTimes?.reduce((a, b) => a + b, 0) / behavioralData.typing.keyReleaseTimes?.length || 0;

      // Compare with stored patterns (simplified)
      if (profile.typingPatterns) {
        const storedAvgPress = profile.typingPatterns.avgKeyPressTime || 100;
        const storedAvgRelease = profile.typingPatterns.avgKeyReleaseTime || 150;

        const pressDiff = Math.abs(avgKeyPressTime - storedAvgPress) / storedAvgPress;
        const releaseDiff = Math.abs(avgKeyReleaseTime - storedAvgRelease) / storedAvgRelease;

        confidence += (1 - (pressDiff + releaseDiff) / 2) * 0.3;
      }
    }

    if (behavioralData.mouse) {
      // Basic mouse movement analysis
      const avgSpeed = behavioralData.mouse.speeds?.reduce((a, b) => a + b, 0) / behavioralData.mouse.speeds?.length || 0;

      if (profile.mousePatterns) {
        const storedAvgSpeed = profile.mousePatterns.avgSpeed || 500;
        const speedDiff = Math.abs(avgSpeed - storedAvgSpeed) / storedAvgSpeed;
        confidence += (1 - speedDiff) * 0.2;
      }
    }

    return {
      success: confidence >= 0.7,
      confidence: Math.max(0.3, Math.min(1.0, confidence)),
      method: 'fallback'
    };
  }

  fallbackVoiceAuth(voiceData, profile) {
    // Basic voice pattern matching fallback
    let confidence = 0.5;

    if (voiceData.audio && profile.voiceTemplate) {
      // Simple audio feature comparison (in production, use proper voice recognition)
      const features = this.extractAudioFeatures(voiceData.audio);
      const storedFeatures = profile.voiceTemplate.features;

      if (features && storedFeatures) {
        const similarity = this.calculateFeatureSimilarity(features, storedFeatures);
        confidence = Math.max(0.4, similarity);
      }
    }

    return {
      success: confidence >= (profile.settings?.confidenceThreshold || 0.7),
      confidence,
      method: 'fallback'
    };
  }

  // User enrollment and profile management
  async enrollUser(userId, biometricData, profileData = {}) {
    try {
      // Check if profile already exists
      let profile = await UserBiometricProfile.findOne({ userId });

      if (profile) {
        throw new Error('User already enrolled. Use update instead.');
      }

      // Create new profile
      profile = new UserBiometricProfile({
        userId,
        profiles: {
          face: biometricData.face ? {
            template: biometricData.face.template,
            enrolledAt: new Date(),
            lastVerified: new Date()
          } : null,
          fingerprint: biometricData.fingerprint ? {
            template: biometricData.fingerprint.template,
            enrolledAt: new Date(),
            lastVerified: new Date()
          } : null,
          voice: biometricData.voice ? {
            template: biometricData.voice.template,
            features: biometricData.voice.features,
            enrolledAt: new Date(),
            lastVerified: new Date()
          } : null,
          behavioral: biometricData.behavioral ? {
            typingPatterns: biometricData.behavioral.typing,
            mousePatterns: biometricData.behavioral.mouse,
            enrolledAt: new Date(),
            lastVerified: new Date()
          } : null
        },
        settings: {
          confidenceThreshold: profileData.confidenceThreshold || 0.8,
          requireMultiModal: profileData.requireMultiModal || false,
          enabledModalities: profileData.enabledModalities || ['face', 'fingerprint', 'voice', 'behavioral'],
          ...profileData.settings
        },
        securitySettings: {
          maxFailedAttempts: profileData.maxFailedAttempts || 5,
          lockoutDuration: profileData.lockoutDuration || 30 * 60 * 1000, // 30 minutes
          requireLocationVerification: profileData.requireLocationVerification || false,
          ...profileData.securitySettings
        }
      });

      await profile.save();

      return {
        success: true,
        profile: profile.toObject(),
        message: 'User enrolled successfully'
      };
    } catch (error) {
      console.error('User enrollment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateBiometricProfile(userId, biometricData, profileData = {}) {
    try {
      const profile = await UserBiometricProfile.findOne({ userId });

      if (!profile) {
        throw new Error('Biometric profile not found');
      }

      // Update biometric data
      if (biometricData.face) {
        profile.profiles.face = {
          ...profile.profiles.face,
          template: biometricData.face.template,
          lastUpdated: new Date()
        };
      }

      if (biometricData.fingerprint) {
        profile.profiles.fingerprint = {
          ...profile.profiles.fingerprint,
          template: biometricData.fingerprint.template,
          lastUpdated: new Date()
        };
      }

      if (biometricData.voice) {
        profile.profiles.voice = {
          ...profile.profiles.voice,
          template: biometricData.voice.template,
          features: biometricData.voice.features,
          lastUpdated: new Date()
        };
      }

      if (biometricData.behavioral) {
        profile.profiles.behavioral = {
          ...profile.profiles.behavioral,
          typingPatterns: biometricData.behavioral.typing,
          mousePatterns: biometricData.behavioral.mouse,
          lastUpdated: new Date()
        };
      }

      // Update settings
      if (profileData.settings) {
        profile.settings = { ...profile.settings, ...profileData.settings };
      }

      if (profileData.securitySettings) {
        profile.securitySettings = { ...profile.securitySettings, ...profileData.securitySettings };
      }

      await profile.save();

      return {
        success: true,
        profile: profile.toObject(),
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteBiometricProfile(userId) {
    try {
      const result = await UserBiometricProfile.findOneAndDelete({ userId });

      if (!result) {
        throw new Error('Biometric profile not found');
      }

      // Also delete associated sessions and alerts
      await BiometricSession.deleteMany({ userId });
      await BiometricAlert.deleteMany({ userId });

      return {
        success: true,
        message: 'Profile and associated data deleted successfully'
      };
    } catch (error) {
      console.error('Profile deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBiometricProfile(userId) {
    try {
      const profile = await UserBiometricProfile.findOne({ userId });

      if (!profile) {
        return null;
      }

      return profile.toObject();
    } catch (error) {
      console.error('Profile retrieval error:', error);
      throw error;
    }
  }

  async getBiometricSessions(userId, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      const sessions = await BiometricSession.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return sessions.map(session => session.toObject());
    } catch (error) {
      console.error('Sessions retrieval error:', error);
      throw error;
    }
  }

  async getSecurityEvents(options = {}) {
    try {
      const { limit = 50, offset = 0, type, severity } = options;

      let query = {};
      if (type) query.type = type;
      if (severity) query.severity = severity;

      const events = await BiometricAlert.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return events.map(event => event.toObject());
    } catch (error) {
      console.error('Security events retrieval error:', error);
      throw error;
    }
  }

  async createSecurityAlert(alertData) {
    try {
      const alert = new BiometricAlert({
        ...alertData,
        createdAt: new Date()
      });

      await alert.save();

      // Trigger external integrations
      await this.integrateWithSecurityStack(`alert_${alert._id}`, {
        alertType: alertData.type,
        severity: alertData.severity,
        message: alertData.message,
        details: alertData.details,
        userId: alertData.userId
      });

      return alert.toObject();
    } catch (error) {
      console.error('Security alert creation error:', error);
      throw error;
    }
  }

  async logSecurityEvent(eventData) {
    try {
      // Create a security alert for significant events
      if (eventData.type.includes('FAILED') || eventData.type.includes('SUSPICIOUS')) {
        await this.createSecurityAlert({
          type: eventData.type,
          severity: eventData.type.includes('FAILED') ? 'medium' : 'low',
          message: `Security event: ${eventData.type}`,
          details: eventData,
          userId: eventData.userId
        });
      }

      // Log to external systems if configured
      await this.integrateWithSecurityStack(`event_${Date.now()}`, {
        eventType: eventData.type,
        details: eventData,
        timestamp: eventData.timestamp || new Date()
      });
    } catch (error) {
      console.error('Security event logging error:', error);
      // Don't throw - logging failures shouldn't break main flow
    }
  }

  // Generate security recommendations
  generateRecommendations(results, riskScore) {
    const recommendations = [];

    if (riskScore > 70) {
      recommendations.push('High risk detected - additional verification required');
      recommendations.push('Consider enabling multi-factor authentication');
    }

    const failedMethods = Object.values(results).filter(r => !r.success);
    if (failedMethods.length > 0) {
      recommendations.push(`Re-enroll ${failedMethods.length} failed biometric method(s)`);
    }

    if (!results.behavioral || results.behavioral.confidence < 0.6) {
      recommendations.push('Enable behavioral biometrics for enhanced security');
    }

    return recommendations;
  }

  // Update user authentication statistics
  async updateUserStatistics(userId, success) {
    const update = {
      $inc: {
        'statistics.totalAuthentications': 1,
        [success ? 'statistics.successfulAuthentications' : 'statistics.failedAuthentications']: 1
      },
      $set: {
        'statistics.lastAuthentication': new Date()
      }
    };

    await UserBiometricProfile.findOneAndUpdate({ userId }, update);
  }

  // Get recent authentication failures
  async getRecentFailures(userId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSessions = await BiometricSession.find({
      userId,
      status: 'failed',
      createdAt: { $gte: oneHourAgo }
    });

    return recentSessions.length;
  }

  // Location anomaly check
  async checkLocationAnomaly(location, profile) {
    // Implement IP geolocation and anomaly detection
    return 0.1; // Placeholder
  }

  // Device anomaly check
  async checkDeviceAnomaly(deviceInfo, profile) {
    // Implement device fingerprinting and anomaly detection
    return 0.1; // Placeholder
  }

  // Time-based anomaly check
  checkTimeAnomaly(timestamp, profile) {
    const hour = new Date(timestamp).getHours();
    // Check if authentication is at unusual hours
    if (hour < 6 || hour > 22) {
      return 0.3;
    }
    return 0.1;
  }

  // Integration with security stack
  async integrateWithSecurityStack(sessionId, data) {
    try {
      // This method is called from the controller
      // Integration logic would go here
      console.log('Security integration:', sessionId, data);
    } catch (error) {
      console.error('Security integration error:', error);
    }
  }

  // Legacy methods for backward compatibility
  async analyze(data) {
    return this.authenticate(data.userId, data, {});
  }

  async scan(target) {
    // Implement scanning functionality
    return {
      success: true,
      scanId: `scan_${Date.now()}`,
      target,
      findings: [],
      riskScore: Math.random() * 50
    };
  }
}

module.exports = new ContainerScanService();

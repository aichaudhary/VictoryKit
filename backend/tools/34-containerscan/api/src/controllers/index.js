const axios = require('axios');
const biometricService = require('../services/biometricService');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8034';

exports.getStatus = async (req, res) => {
  try {
    res.json({ status: 'operational', service: 'ContainerScan', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { data } = req.body;
    const result = await biometricService.analyze(data);

    // Trigger external security integrations
    biometricService.integrateWithSecurityStack(Date.now().toString(), {
      analysisType: 'biometric_security_analysis',
      securityAlerts: result.securityAlerts || [],
      authenticity: result.authenticity || {},
      recommendations: result.recommendations || [],
      totalAttempts: result.totalAttempts || 0,
      alertCount: result.alertCount || 0,
      severity: result.criticalAlerts > 0 ? 'critical' : result.alertCount > 3 ? 'high' : 'medium',
      userId: req.user?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the analysis if integration fails
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scan = async (req, res) => {
  try {
    const { target } = req.body;
    const result = await biometricService.scan(target);
    const scanId = Date.now().toString();

    // Trigger external security integrations
    biometricService.integrateWithSecurityStack(scanId, {
      analysisType: 'biometric_authenticity_scan',
      target,
      scanId,
      authenticity: result.authenticity || {},
      alerts: result.alerts || 0,
      severity: result.authenticity?.score < 50 ? 'critical' : result.authenticity?.score < 70 ? 'high' : 'medium',
      userId: req.user?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the scan if integration fails
    });

    res.json({ success: true, scanId, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  res.json({ reports: [], total: 0 });
};

exports.getReportById = async (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
};

exports.getConfig = async (req, res) => {
  res.json({ autoScan: true, alertThreshold: 0.8, category: 'Biometric' });
};

exports.updateConfig = async (req, res) => {
  res.json({ success: true, config: req.body });
};

// Biometric Authentication Controllers
exports.authenticateBiometric = async (req, res) => {
  try {
    const { userId, biometricData, options = {} } = req.body;

    if (!userId || !biometricData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and biometric data are required'
      });
    }

    const result = await biometricService.authenticate(userId, biometricData, {
      deviceFingerprint: req.deviceFingerprint,
      ...options
    });

    // Log successful authentication
    if (result.success) {
      await biometricService.logSecurityEvent({
        type: 'BIOMETRIC_AUTH_SUCCESS',
        userId,
        biometricData,
        result,
        deviceFingerprint: req.deviceFingerprint,
        timestamp: new Date()
      });
    }

    res.json({
      success: result.success,
      message: result.success ? 'Authentication successful' : 'Authentication failed',
      data: result
    });
  } catch (error) {
    console.error('Biometric authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      error: error.message
    });
  }
};

exports.authenticateMultiFactor = async (req, res) => {
  try {
    // MFA is handled by middleware, just return success
    res.json({
      success: true,
      message: 'Multi-factor authentication successful',
      user: req.user,
      biometricAuth: req.biometricAuth
    });
  } catch (error) {
    console.error('MFA error:', error);
    res.status(500).json({
      success: false,
      message: 'Multi-factor authentication error'
    });
  }
};

exports.enrollBiometric = async (req, res) => {
  try {
    const { userId, biometricData, profileData } = req.body;

    if (!userId || !biometricData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and biometric data are required'
      });
    }

    const result = await biometricService.enrollUser(userId, biometricData, profileData);

    res.json({
      success: result.success,
      message: result.success ? 'Enrollment successful' : 'Enrollment failed',
      data: result
    });
  } catch (error) {
    console.error('Biometric enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Enrollment service error',
      error: error.message
    });
  }
};

exports.updateBiometricProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { biometricData, profileData } = req.body;

    const result = await biometricService.updateBiometricProfile(userId, biometricData, profileData);

    res.json({
      success: result.success,
      message: result.success ? 'Profile updated successfully' : 'Profile update failed',
      data: result
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update error',
      error: error.message
    });
  }
};

exports.deleteBiometricProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await biometricService.deleteBiometricProfile(userId);

    res.json({
      success: result.success,
      message: result.success ? 'Profile deleted successfully' : 'Profile deletion failed'
    });
  } catch (error) {
    console.error('Profile deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile deletion error',
      error: error.message
    });
  }
};

exports.getBiometricProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await biometricService.getBiometricProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Biometric profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile retrieval error',
      error: error.message
    });
  }
};

exports.getBiometricSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const sessions = await biometricService.getBiometricSessions(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Sessions retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Sessions retrieval error',
      error: error.message
    });
  }
};

exports.getSecurityEvents = async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, severity } = req.query;

    const events = await biometricService.getSecurityEvents({
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
      severity
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Security events retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Security events retrieval error',
      error: error.message
    });
  }
};

exports.createSecurityAlert = async (req, res) => {
  try {
    const { type, severity, message, details } = req.body;

    const alert = await biometricService.createSecurityAlert({
      type,
      severity,
      message,
      details,
      userId: req.user?.id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Security alert created',
      data: alert
    });
  } catch (error) {
    console.error('Security alert creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Security alert creation error',
      error: error.message
    });
  }
};

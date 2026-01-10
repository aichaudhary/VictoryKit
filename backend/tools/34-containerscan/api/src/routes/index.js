const express = require('express');
const router = express.Router();
const controller = require('../controllers');
const biometricAuth = require('../middleware/biometricAuth.middleware');

// Public routes (no authentication required)
router.get('/status', controller.getStatus);
router.get('/config', controller.getConfig);

// Protected routes (require authentication)
router.use(biometricAuth.authenticateToken); // JWT auth for all routes below
router.use(biometricAuth.securityMonitor); // Security monitoring
router.use(biometricAuth.deviceFingerprint); // Device fingerprinting

// Biometric authentication routes
router.post('/auth/biometric',
  biometricAuth.biometricRateLimit, // Rate limiting
  controller.authenticateBiometric
);

router.post('/auth/mfa',
  biometricAuth.authenticateMultiFactor,
  controller.authenticateMultiFactor
);

// Enrollment routes
router.post('/enroll',
  biometricAuth.biometricRateLimit,
  controller.enrollBiometric
);

router.put('/enroll/:userId',
  controller.updateBiometricProfile
);

router.delete('/enroll/:userId',
  controller.deleteBiometricProfile
);

// Profile management
router.get('/profile/:userId',
  controller.getBiometricProfile
);

router.get('/sessions/:userId',
  controller.getBiometricSessions
);

// Analysis and reporting
router.post('/analyze',
  controller.analyze
);

router.get('/reports',
  controller.getReports
);

router.get('/reports/:id',
  controller.getReportById
);

// Scanning
router.post('/scan',
  controller.scan
);

// Configuration (admin only - would need additional role checking)
router.put('/config',
  controller.updateConfig
);

// Security events
router.get('/security/events',
  controller.getSecurityEvents
);

router.post('/security/alert',
  controller.createSecurityAlert
);

module.exports = router;

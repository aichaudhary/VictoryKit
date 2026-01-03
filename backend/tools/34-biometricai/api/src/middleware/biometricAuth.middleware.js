const jwt = require('jsonwebtoken');
const BiometricAIService = require('../services/biometricService');

class BiometricAuthMiddleware {
  // JWT-based authentication middleware
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = user;
      next();
    });
  }

  // Biometric authentication middleware
  async authenticateBiometric(req, res, next) {
    try {
      const { biometricData, userId } = req.body;

      if (!biometricData || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Biometric data and user ID required'
        });
      }

      // Perform biometric authentication
      const result = await BiometricAIService.authenticate(userId, biometricData, {
        requireMultiModal: false, // Allow single modality for middleware
        confidenceThreshold: 0.7
      });

      if (!result.success) {
        // Log failed authentication attempt
        await BiometricAIService.logSecurityEvent({
          type: 'BIOMETRIC_AUTH_FAILED',
          userId,
          biometricData,
          result,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        });

        return res.status(401).json({
          success: false,
          message: 'Biometric authentication failed',
          details: result
        });
      }

      // Attach authentication result to request
      req.biometricAuth = result;
      req.user = { id: userId, biometricProfile: result.profile };

      next();
    } catch (error) {
      console.error('Biometric auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication service error'
      });
    }
  }

  // Multi-factor authentication middleware (JWT + Biometric)
  async authenticateMultiFactor(req, res, next) {
    try {
      // First check JWT token
      await this.authenticateToken(req, res, async () => {
        // Then perform biometric authentication
        await this.authenticateBiometric(req, res, next);
      });
    } catch (error) {
      console.error('MFA middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Multi-factor authentication error'
      });
    }
  }

  // Rate limiting for biometric endpoints
  biometricRateLimit(req, res, next) {
    const clientIP = req.ip;
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000; // 15 minutes
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

    // Simple in-memory rate limiting (use Redis in production)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!global.rateLimitStore.has(clientIP)) {
      global.rateLimitStore.set(clientIP, []);
    }

    const requests = global.rateLimitStore.get(clientIP);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many biometric authentication attempts',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    global.rateLimitStore.set(clientIP, validRequests);

    next();
  }

  // Security monitoring middleware
  async securityMonitor(req, res, next) {
    const startTime = Date.now();

    // Store original send method
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;

      // Log security-relevant requests
      if (req.path.includes('/auth') || req.path.includes('/biometric')) {
        BiometricAIService.logSecurityEvent({
          type: 'API_ACCESS',
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          duration,
          statusCode: res.statusCode,
          userId: req.user?.id,
          timestamp: new Date()
        }).catch(err => console.error('Security logging error:', err));
      }

      // Call original send method
      originalSend.call(this, data);
    };

    next();
  }

  // Device fingerprinting middleware
  deviceFingerprint(req, res, next) {
    const fingerprint = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      accept: req.get('Accept'),
      acceptLanguage: req.get('Accept-Language'),
      acceptEncoding: req.get('Accept-Encoding'),
      cacheControl: req.get('Cache-Control'),
      connection: req.get('Connection'),
      host: req.get('Host'),
      screenResolution: req.body.screenResolution,
      timezone: req.body.timezone,
      plugins: req.body.plugins,
      canvasFingerprint: req.body.canvasFingerprint,
      webglFingerprint: req.body.webglFingerprint,
      fonts: req.body.fonts
    };

    req.deviceFingerprint = fingerprint;
    next();
  }
}

module.exports = new BiometricAuthMiddleware();
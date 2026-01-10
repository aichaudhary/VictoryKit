/**
 * Authentication Routes
 * IdentityForge Tool 13
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Generate JWT token
const generateToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      sessionId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '24h'
    }
  );
};

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { identifier, password, mfaToken } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username/email and password'
      });
    }

    // Find user
    const user = await User.findForAuth(identifier);

    if (!user) {
      await AuditLog.log({
        user: {
          id: null,
          username: identifier,
          email: identifier,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'login',
          resource: 'system',
          details: { identifier }
        },
        result: 'failure',
        reason: 'User not found',
        category: 'authentication'
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();

      await AuditLog.log({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'login',
          resource: 'system',
          details: { identifier }
        },
        result: 'failure',
        reason: 'Invalid password',
        category: 'authentication'
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      await AuditLog.log({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'login',
          resource: 'system'
        },
        result: 'failure',
        reason: 'Account locked',
        category: 'authentication',
        severity: 'medium'
      });

      return res.status(423).json({
        success: false,
        error: 'Account is locked due to too many failed login attempts'
      });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(200).json({
          success: true,
          requiresMfa: true,
          message: 'MFA token required'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 2 // Allow 2 time windows (30 seconds each)
      });

      if (!verified) {
        await AuditLog.log({
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          action: {
            type: 'login',
            resource: 'system'
          },
          result: 'failure',
          reason: 'Invalid MFA token',
          category: 'authentication'
        });

        return res.status(401).json({
          success: false,
          error: 'Invalid MFA token'
        });
      }
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    // Generate session ID
    const sessionId = require('crypto').randomUUID();

    // Generate token
    const token = generateToken(user, sessionId);

    // Log successful login
    await AuditLog.log({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'login',
        resource: 'system'
      },
      result: 'success',
      category: 'authentication',
      session: {
        id: sessionId
      }
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions: user.permissions,
        mfaEnabled: user.mfaEnabled,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout event
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await AuditLog.log({
          user: {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          action: {
            type: 'logout',
            resource: 'system'
          },
          result: 'success',
          category: 'authentication',
          session: {
            id: decoded.sessionId
          }
        });
      } catch (err) {
        // Invalid token, but still log the attempt
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Setup MFA
router.post('/mfa/setup', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+mfaSecret');

    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `IdentityForge (${user.username})`,
      issuer: 'VictoryKit'
    });

    user.mfaSecret = secret.base32;
    await user.save();

    res.json({
      success: true,
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup MFA'
    });
  }
});

// Verify and enable MFA
router.post('/mfa/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+mfaSecret');

    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA not set up'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA token'
      });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(require('crypto').randomBytes(4).toString('hex').toUpperCase());
    }

    user.mfaEnabled = true;
    user.mfaBackupCodes = backupCodes;
    await user.save();

    // Log MFA enable
    await AuditLog.log({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'update',
        resource: 'user',
        resourceId: user._id,
        details: { mfaEnabled: true }
      },
      result: 'success',
      category: 'security'
    });

    res.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify MFA'
    });
  }
});

// Disable MFA
router.post('/mfa/disable', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password +mfaSecret +mfaBackupCodes');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password'
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = undefined;
    await user.save();

    // Log MFA disable
    await AuditLog.log({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'update',
        resource: 'user',
        resourceId: user._id,
        details: { mfaEnabled: false }
      },
      result: 'success',
      category: 'security',
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable MFA'
    });
  }
});

// Verify current user
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -mfaSecret -mfaBackupCodes -passwordResetToken -passwordResetExpires')
      .populate('roles', 'name description permissions');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

module.exports = router;
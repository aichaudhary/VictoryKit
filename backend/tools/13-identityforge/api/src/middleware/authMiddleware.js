/**
 * Authentication Middleware
 * IdentityForge Tool 13
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Protect routes
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('+mfaSecret +mfaBackupCodes');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: 'Account is not active'
        });
      }

      // Add user to request
      req.user = user;

      // Log access
      await AuditLog.log({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'access',
          resource: 'api',
          details: {
            endpoint: req.originalUrl,
            method: req.method
          }
        },
        result: 'success',
        category: 'authentication',
        session: {
          id: decoded.sessionId
        },
        metadata: {
          correlationId: req.headers['x-correlation-id'] || req.headers['x-request-id']
        }
      });

      next();
    } catch (err) {
      // Log failed access
      await AuditLog.log({
        user: {
          id: null,
          username: 'unknown',
          email: 'unknown',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'access',
          resource: 'api',
          details: {
            endpoint: req.originalUrl,
            method: req.method,
            token: token.substring(0, 10) + '...'
          }
        },
        result: 'failure',
        reason: 'Invalid token',
        category: 'authentication'
      });

      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Populate user roles if not already done
    if (!req.user.roles || req.user.roles.length === 0 || typeof req.user.roles[0] === 'string') {
      await req.user.populate('roles');
    }

    // Check if user has required role
    const userRoleNames = req.user.roles.map(role =>
      typeof role === 'object' ? role.name : role
    );

    const hasRole = roles.some(role => userRoleNames.includes(role));

    if (!hasRole) {
      // Log unauthorized access
      await AuditLog.log({
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'access',
          resource: 'api',
          details: {
            endpoint: req.originalUrl,
            method: req.method,
            requiredRoles: roles,
            userRoles: userRoleNames
          }
        },
        result: 'denied',
        reason: 'Insufficient permissions',
        category: 'authorization',
        severity: 'medium'
      });

      return res.status(403).json({
        success: false,
        error: 'User role not authorized to access this route'
      });
    }

    next();
  };
};

// Check specific permissions
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    try {
      // Populate user roles and permissions
      await req.user.populate('roles');

      // Check direct permissions
      const permissionString = `${resource}:${action}`;
      if (req.user.permissions.includes(permissionString) || req.user.permissions.includes('*')) {
        return next();
      }

      // Check role permissions
      for (const role of req.user.roles) {
        if (await role.hasPermission(permissionString)) {
          return next();
        }
      }

      // Check policies (ABAC)
      const Policy = require('../models/Policy');
      const policies = await Policy.findForUser(
        req.user._id,
        req.user.roles.map(r => r._id),
        req.user.profile?.department
      );

      for (const policy of policies) {
        const result = await policy.evaluate({
          user: req.user,
          resource,
          action,
          environment: {
            ip: req.ip,
            timestamp: new Date(),
            userAgent: req.get('User-Agent')
          }
        });

        if (result.decision === 'allow') {
          return next();
        } else if (result.decision === 'deny') {
          break; // Explicit deny
        }
      }

      // Log permission denied
      await AuditLog.log({
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        action: {
          type: 'access',
          resource,
          details: {
            action,
            endpoint: req.originalUrl,
            method: req.method
          }
        },
        result: 'denied',
        reason: 'Permission denied',
        category: 'authorization',
        severity: 'low'
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to perform this action'
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  authorize,
  checkPermission
};
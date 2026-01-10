const jwt = require('jsonwebtoken');
const { catchAsync } = require('./error.middleware');
const User = require('../models/User');

// Protect routes - require authentication
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Check organization membership and permissions
const checkOrganizationAccess = (requiredPermission = null) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Check if user is a member of the organization
    const isMember = req.user.organizations.some(org =>
      org.organization.toString() === organizationId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User is not a member of this organization'
      });
    }

    // If specific permission is required, check it
    if (requiredPermission) {
      const userOrg = req.user.organizations.find(org =>
        org.organization.toString() === organizationId
      );

      if (!userOrg.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${requiredPermission}`
        });
      }
    }

    req.organizationId = organizationId;
    next();
  });
};

// Check vault access permissions
const checkVaultAccess = (requiredPermission = 'read') => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const vaultId = req.params.vaultId || req.body.vaultId || req.query.vaultId;

    if (!vaultId) {
      return res.status(400).json({
        success: false,
        message: 'Vault ID is required'
      });
    }

    // Import Vault model here to avoid circular dependency
    const Vault = require('../models/Vault');

    const vault = await Vault.findById(vaultId);

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Vault not found'
      });
    }

    // Check if user is the owner
    if (vault.owner.toString() === req.user._id.toString()) {
      req.vault = vault;
      return next();
    }

    // Check if user has access through sharing
    const userAccess = vault.sharedWith.find(shared =>
      shared.user.toString() === req.user._id.toString()
    );

    if (!userAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this vault'
      });
    }

    // Check if user has the required permission
    if (!userAccess.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`
      });
    }

    req.vault = vault;
    req.userPermissions = userAccess.permissions;
    next();
  });
};

// Check secret access permissions
const checkSecretAccess = (requiredPermission = 'read') => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const secretId = req.params.secretId || req.body.secretId || req.query.secretId;

    if (!secretId) {
      return res.status(400).json({
        success: false,
        message: 'Secret ID is required'
      });
    }

    // Import Secret model here to avoid circular dependency
    const Secret = require('../models/Secret');

    const secret = await Secret.findById(secretId);

    if (!secret) {
      return res.status(404).json({
        success: false,
        message: 'Secret not found'
      });
    }

    // Check vault access first
    const vault = await require('../models/Vault').findById(secret.vault);

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: 'Associated vault not found'
      });
    }

    // Check if user is the vault owner
    if (vault.owner.toString() === req.user._id.toString()) {
      req.secret = secret;
      req.vault = vault;
      return next();
    }

    // Check if user has vault access
    const userAccess = vault.sharedWith.find(shared =>
      shared.user.toString() === req.user._id.toString()
    );

    if (!userAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this vault'
      });
    }

    // Check if user has the required permission on the vault
    if (!userAccess.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`
      });
    }

    req.secret = secret;
    req.vault = vault;
    req.userPermissions = userAccess.permissions;
    next();
  });
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't throw error for optional auth
      req.user = null;
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  checkOrganizationAccess,
  checkVaultAccess,
  checkSecretAccess,
  optionalAuth
};
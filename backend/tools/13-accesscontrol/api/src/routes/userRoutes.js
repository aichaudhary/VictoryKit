/**
 * User Routes
 * AccessControl Tool 13
 */

const express = require('express');
const { checkPermission } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all users
router.get('/', checkPermission('user', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) {
      // This would need role population and filtering
    }
    if (req.query.search) {
      filter.$or = [
        { username: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password -mfaSecret -mfaBackupCodes -passwordResetToken -passwordResetExpires')
      .populate('roles', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get single user
router.get('/:id', checkPermission('user', 'read'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -mfaSecret -mfaBackupCodes -passwordResetToken -passwordResetExpires')
      .populate('roles', 'name description permissions')
      .populate('profile.manager', 'username email firstName lastName');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Create user
router.post('/', createLimiter, checkPermission('user', 'create'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, roles, permissions, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      roles: roles || [],
      permissions: permissions || [],
      profile: profile || {},
      metadata: {
        createdBy: req.user._id
      }
    });

    // Log creation
    await AuditLog.log({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'create',
        resource: 'user',
        resourceId: user._id,
        details: { username: user.username, email: user.email }
      },
      result: 'success',
      category: 'administration'
    });

    // Return user without sensitive data
    const userResponse = await User.findById(user._id)
      .select('-password -mfaSecret -mfaBackupCodes')
      .populate('roles', 'name description');

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// Update user
router.put('/:id', checkPermission('user', 'update'), async (req, res) => {
  try {
    const { firstName, lastName, roles, permissions, status, profile } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (roles !== undefined) user.roles = roles;
    if (permissions !== undefined) user.permissions = permissions;
    if (status !== undefined) user.status = status;
    if (profile !== undefined) user.profile = { ...user.profile, ...profile };

    user.metadata.updatedBy = req.user._id;
    await user.save();

    // Log update
    await AuditLog.log({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'update',
        resource: 'user',
        resourceId: user._id,
        details: { updatedFields: Object.keys(req.body) }
      },
      result: 'success',
      category: 'administration'
    });

    // Return updated user
    const updatedUser = await User.findById(user._id)
      .select('-password -mfaSecret -mfaBackupCodes')
      .populate('roles', 'name description');

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/:id', checkPermission('user', 'delete'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    await user.remove();

    // Log deletion
    await AuditLog.log({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'delete',
        resource: 'user',
        resourceId: user._id,
        details: { username: user.username, email: user.email }
      },
      result: 'success',
      category: 'administration',
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Assign role to user
router.post('/:id/roles', checkPermission('user', 'update'), async (req, res) => {
  try {
    const { roleId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const Role = require('../models/Role');
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await user.save();
    }

    // Log role assignment
    await AuditLog.log({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'grant',
        resource: 'user',
        resourceId: user._id,
        details: { roleName: role.name, roleId: role._id }
      },
      result: 'success',
      category: 'administration'
    });

    res.json({
      success: true,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign role'
    });
  }
});

// Remove role from user
router.delete('/:id/roles/:roleId', checkPermission('user', 'update'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.roles = user.roles.filter(roleId => roleId.toString() !== req.params.roleId);
    await user.save();

    // Log role removal
    await AuditLog.log({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      action: {
        type: 'revoke',
        resource: 'user',
        resourceId: user._id,
        details: { roleId: req.params.roleId }
      },
      result: 'success',
      category: 'administration'
    });

    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove role'
    });
  }
});

module.exports = router;
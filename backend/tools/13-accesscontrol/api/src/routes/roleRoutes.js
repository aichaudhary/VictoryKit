/**
 * Role Routes
 * AccessControl Tool 13
 */

const express = require('express');
const { checkPermission } = require('../middleware/authMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get all roles
router.get('/', checkPermission('role', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, 'i');
    }
    if (req.query.system !== undefined) {
      filter.isSystem = req.query.system === 'true';
    }

    const roles = await Role.find(filter)
      .populate('parentRole', 'name')
      .populate('childRoles', 'name')
      .sort({ priority: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Role.countDocuments(filter);

    res.json({
      success: true,
      data: roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
});

// Get single role
router.get('/:id', checkPermission('role', 'read'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('parentRole', 'name description')
      .populate('childRoles', 'name description')
      .populate('metadata.createdBy', 'username email')
      .populate('metadata.updatedBy', 'username email');

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Get user count
    const userCount = await Role.findById(req.params.id).populate('userCount');

    res.json({
      success: true,
      data: {
        ...role.toObject(),
        userCount: userCount.userCount || 0
      }
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role'
    });
  }
});

// Create role
router.post('/', createLimiter, checkPermission('role', 'create'), async (req, res) => {
  try {
    const { name, description, permissions, parentRole, color, icon, restrictions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role with this name already exists'
      });
    }

    // Validate parent role if provided
    if (parentRole) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'Parent role not found'
        });
      }
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      parentRole,
      color,
      icon,
      restrictions: restrictions || {},
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
        resource: 'role',
        resourceId: role._id,
        details: { name: role.name, permissions: role.permissions }
      },
      result: 'success',
      category: 'administration'
    });

    // Populate and return
    const populatedRole = await Role.findById(role._id)
      .populate('parentRole', 'name')
      .populate('metadata.createdBy', 'username email');

    res.status(201).json({
      success: true,
      data: populatedRole
    });
  } catch (error) {
    console.error('Create role error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create role'
    });
  }
});

// Update role
router.put('/:id', checkPermission('role', 'update'), async (req, res) => {
  try {
    const { name, description, permissions, parentRole, color, icon, restrictions, isActive } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent modifying system roles unless admin
    if (role.isSystem && !req.user.permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify system roles'
      });
    }

    // Validate parent role if provided
    if (parentRole && parentRole !== role.parentRole?.toString()) {
      const parent = await Role.findById(parentRole);
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'Parent role not found'
        });
      }

      // Prevent circular references
      if (parentRole === req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'Role cannot be its own parent'
        });
      }
    }

    // Update fields
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (parentRole !== undefined) role.parentRole = parentRole;
    if (color !== undefined) role.color = color;
    if (icon !== undefined) role.icon = icon;
    if (restrictions !== undefined) role.restrictions = restrictions;
    if (isActive !== undefined) role.isActive = isActive;

    role.metadata.updatedBy = req.user._id;
    await role.save();

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
        resource: 'role',
        resourceId: role._id,
        details: { updatedFields: Object.keys(req.body) }
      },
      result: 'success',
      category: 'administration'
    });

    // Return updated role
    const updatedRole = await Role.findById(role._id)
      .populate('parentRole', 'name')
      .populate('metadata.updatedBy', 'username email');

    res.json({
      success: true,
      data: updatedRole
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role'
    });
  }
});

// Delete role
router.delete('/:id', checkPermission('role', 'delete'), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete system roles'
      });
    }

    await role.remove();

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
        resource: 'role',
        resourceId: role._id,
        details: { name: role.name }
      },
      result: 'success',
      category: 'administration',
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    });
  }
});

// Get role hierarchy
router.get('/:id/hierarchy', checkPermission('role', 'read'), async (req, res) => {
  try {
    const hierarchy = await Role.getHierarchy(req.params.id);

    if (!hierarchy) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role hierarchy'
    });
  }
});

// Get roles by user
router.get('/user/:userId', checkPermission('role', 'read'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId).populate('roles');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.roles
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user roles'
    });
  }
});

module.exports = router;
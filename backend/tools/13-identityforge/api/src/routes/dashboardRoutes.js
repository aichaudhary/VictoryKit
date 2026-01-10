/**
 * Dashboard Routes
 * IdentityForge Tool 13
 */

const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    // Overview metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalRoles = await Role.countDocuments();
    const totalPolicies = await Policy.countDocuments({ isActive: true });

    // Recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await AuditLog.find({
      timestamp: { $gte: yesterday },
      'action.type': { $in: ['login', 'access', 'create', 'update', 'delete'] }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('user.id', 'username email')
    .select('user action result timestamp');

    // Role distribution
    const roleDistribution = await Role.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'roles',
          as: 'users'
        }
      },
      {
        $project: {
          role: '$name',
          count: { $size: '$users' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const dashboard = {
      overview: {
        totalUsers,
        activeUsers,
        totalRoles,
        totalPolicies
      },
      recentActivity: recentActivity.map(log => ({
        user: log.user.id ? log.user.id.username : 'Unknown',
        action: log.action.type,
        resource: log.action.resource,
        result: log.result,
        timestamp: log.timestamp
      })),
      roleDistribution
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Get user activity summary
router.get('/activity', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activity = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            type: '$action.type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1, '_id.type': 1 }
      }
    ]);

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity data'
    });
  }
});

// Get security metrics
router.get('/security', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const securityEvents = await AuditLog.countDocuments({
      timestamp: { $gte: startDate },
      category: 'security',
      severity: { $in: ['high', 'critical'] }
    });

    const failedLogins = await AuditLog.countDocuments({
      timestamp: { $gte: startDate },
      'action.type': 'login',
      result: 'failure'
    });

    const permissionDenies = await AuditLog.countDocuments({
      timestamp: { $gte: startDate },
      result: 'denied',
      category: 'authorization'
    });

    const mfaEnabled = await User.countDocuments({ mfaEnabled: true });
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        securityEvents,
        failedLogins,
        permissionDenies,
        mfaAdoption: totalUsers > 0 ? (mfaEnabled / totalUsers) * 100 : 0,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get security metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch security metrics'
    });
  }
});

module.exports = router;
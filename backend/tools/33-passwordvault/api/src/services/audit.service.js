const AccessLog = require('../models/access-log.model');
const User = require('../models/user.model');
const Vault = require('../models/vault.model');
const Secret = require('../models/secret.model');
const Organization = require('../models/organization.model');
const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');

class AuditService {
  constructor() {
    this.retentionDays = 365; // Keep logs for 1 year
    this.maxExportRows = 10000;
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters = {}, userId, isAdmin = false) {
    try {
      let query = {};

      // Apply filters
      if (filters.userId) query.user = filters.userId;
      if (filters.resource) query.resource = filters.resource;
      if (filters.resourceId) query.resourceId = filters.resourceId;
      if (filters.action) query.action = filters.action;
      if (filters.status) query.status = filters.status;

      // Date range
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
      }

      // Organization filter for non-admin users
      if (!isAdmin) {
        const user = await User.findById(userId).populate('organization');
        if (user.organization) {
          // Get all users in the same organization
          const orgUsers = await User.find({ organization: user.organization._id }).select('_id');
          const userIds = orgUsers.map(u => u._id);
          query.user = { $in: userIds };
        } else {
          // Personal user can only see their own logs
          query.user = userId;
        }
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AccessLog.find(query)
          .populate('user', 'firstName lastName email')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        AccessLog.countDocuments(query)
      ]);

      return {
        logs: logs.map(log => ({
          id: log._id,
          user: log.user,
          resource: log.resource,
          resourceId: log.resourceId,
          action: log.action,
          status: log.status,
          details: log.details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          timestamp: log.timestamp
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(filters = {}, userId, isAdmin = false) {
    try {
      let matchQuery = {};

      // Apply same filters as getAuditLogs
      if (filters.userId) matchQuery.user = filters.userId;
      if (filters.resource) matchQuery.resource = filters.resource;
      if (filters.resourceId) matchQuery.resourceId = filters.resourceId;
      if (filters.action) matchQuery.action = filters.action;
      if (filters.status) matchQuery.status = filters.status;

      if (filters.startDate || filters.endDate) {
        matchQuery.timestamp = {};
        if (filters.startDate) matchQuery.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) matchQuery.timestamp.$lte = new Date(filters.endDate);
      }

      if (!isAdmin) {
        const user = await User.findById(userId).populate('organization');
        if (user.organization) {
          const orgUsers = await User.find({ organization: user.organization._id }).select('_id');
          const userIds = orgUsers.map(u => u._id);
          matchQuery.user = { $in: userIds };
        } else {
          matchQuery.user = userId;
        }
      }

      const [
        actionStats,
        statusStats,
        resourceStats,
        userStats,
        hourlyStats,
        riskStats
      ] = await Promise.all([
        // Actions breakdown
        AccessLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Status breakdown
        AccessLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Resource breakdown
        AccessLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$resource', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),

        // Top users
        AccessLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$user', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              user: { firstName: 1, lastName: 1, email: 1 },
              count: 1
            }
          }
        ]),

        // Hourly activity
        AccessLog.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } },
          { $limit: 24 } // Last 24 hours
        ]),

        // Risk analysis
        this.getRiskAnalysis(matchQuery)
      ]);

      return {
        summary: {
          totalLogs: actionStats.reduce((sum, stat) => sum + stat.count, 0),
          successRate: statusStats.find(s => s._id === 'success')?.count || 0,
          failureRate: statusStats.find(s => s._id === 'failed')?.count || 0
        },
        breakdowns: {
          actions: actionStats,
          statuses: statusStats,
          resources: resourceStats,
          topUsers: userStats,
          hourlyActivity: hourlyStats
        },
        riskAnalysis: riskStats
      };
    } catch (error) {
      console.error('Get audit stats error:', error);
      throw error;
    }
  }

  /**
   * Risk analysis for security monitoring
   */
  async getRiskAnalysis(matchQuery) {
    try {
      const [
        failedLogins,
        suspiciousIPs,
        unusualHours,
        rapidActions
      ] = await Promise.all([
        // Failed login attempts
        AccessLog.aggregate([
          { $match: { ...matchQuery, action: 'login', status: 'failed' } },
          {
            $group: {
              _id: { user: '$user', ip: '$ipAddress' },
              count: { $sum: 1 },
              lastAttempt: { $max: '$timestamp' }
            }
          },
          { $match: { count: { $gte: 3 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Suspicious IP addresses
        AccessLog.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: '$ipAddress',
              uniqueUsers: { $addToSet: '$user' },
              actions: { $sum: 1 },
              lastSeen: { $max: '$timestamp' }
            }
          },
          { $match: { uniqueUsers: { $size: { $gte: 5 } } } }, // Same IP used by 5+ users
          { $sort: { actions: -1 } }
        ]),

        // Unusual access hours
        AccessLog.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: {
                user: '$user',
                hour: { $hour: '$timestamp' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $gte: ['$_id.hour', 2] }, // Between 2 AM and 6 AM
                  { $lte: ['$_id.hour', 6] }
                ]
              }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Rapid successive actions (potential automation)
        AccessLog.aggregate([
          { $match: matchQuery },
          { $sort: { user: 1, timestamp: 1 } },
          {
            $group: {
              _id: '$user',
              actions: {
                $push: {
                  timestamp: '$timestamp',
                  action: '$action'
                }
              }
            }
          },
          {
            $project: {
              rapidActions: {
                $filter: {
                  input: '$actions',
                  as: 'action',
                  cond: {
                    $lt: [
                      { $subtract: ['$$action.timestamp', { $arrayElemAt: ['$actions.timestamp', { $subtract: [{ $indexOfArray: ['$actions', '$$action'] }, 1] }] }] },
                      1000 // Less than 1 second between actions
                    ]
                  }
                }
              }
            }
          },
          { $match: { 'rapidActions.5': { $exists: true } } }, // 5+ rapid actions
          { $project: { user: '$_id', rapidActionCount: { $size: '$rapidActions' } } },
          { $sort: { rapidActionCount: -1 } }
        ])
      ]);

      return {
        failedLogins: failedLogins.length,
        suspiciousIPs: suspiciousIPs.length,
        unusualAccessHours: unusualHours.length,
        potentialAutomation: rapidActions.length,
        alerts: this.generateSecurityAlerts(failedLogins, suspiciousIPs, unusualHours, rapidActions)
      };
    } catch (error) {
      console.error('Risk analysis error:', error);
      return { error: 'Unable to perform risk analysis' };
    }
  }

  /**
   * Generate security alerts
   */
  generateSecurityAlerts(failedLogins, suspiciousIPs, unusualHours, rapidActions) {
    const alerts = [];

    if (failedLogins.length > 0) {
      alerts.push({
        level: 'high',
        type: 'failed_logins',
        message: `${failedLogins.length} users have 3+ failed login attempts`,
        details: failedLogins.slice(0, 5)
      });
    }

    if (suspiciousIPs.length > 0) {
      alerts.push({
        level: 'medium',
        type: 'suspicious_ips',
        message: `${suspiciousIPs.length} IP addresses used by multiple users`,
        details: suspiciousIPs.slice(0, 5)
      });
    }

    if (unusualHours.length > 0) {
      alerts.push({
        level: 'low',
        type: 'unusual_hours',
        message: `${unusualHours.length} users accessing during unusual hours`,
        details: unusualHours.slice(0, 5)
      });
    }

    if (rapidActions.length > 0) {
      alerts.push({
        level: 'medium',
        type: 'potential_automation',
        message: `${rapidActions.length} users showing signs of automated access`,
        details: rapidActions.slice(0, 5)
      });
    }

    return alerts;
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters = {}, userId, isAdmin = false, format = 'csv') {
    try {
      const { logs } = await this.getAuditLogs({ ...filters, limit: this.maxExportRows }, userId, isAdmin);

      if (logs.length === 0) {
        throw new Error('No logs found for export');
      }

      const exportData = logs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        user_email: log.user?.email || 'Unknown',
        user_name: `${log.user?.firstName || ''} ${log.user?.lastName || ''}`.trim(),
        resource: log.resource,
        resource_id: log.resourceId,
        action: log.action,
        status: log.status,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        details: JSON.stringify(log.details)
      }));

      if (format === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(exportData);

        // Save to temporary file
        const filename = `audit-logs-${Date.now()}.csv`;
        const filepath = path.join('/tmp', filename);
        await fs.writeFile(filepath, csv);

        return {
          filename,
          filepath,
          format: 'csv',
          recordCount: logs.length
        };
      } else if (format === 'json') {
        const filename = `audit-logs-${Date.now()}.json`;
        const filepath = path.join('/tmp', filename);
        await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));

        return {
          filename,
          filepath,
          format: 'json',
          recordCount: logs.length
        };
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export audit logs error:', error);
      throw error;
    }
  }

  /**
   * Generate compliance reports
   */
  async generateComplianceReport(organizationId, reportType, userId, isAdmin = false) {
    try {
      // Verify access
      if (!isAdmin) {
        const user = await User.findById(userId);
        if (!user.organization || user.organization.toString() !== organizationId) {
          throw new Error('Access denied');
        }
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const orgUsers = await User.find({ organization: organizationId }).select('_id');
      const userIds = orgUsers.map(u => u._id);

      const baseQuery = {
        user: { $in: userIds },
        timestamp: {
          $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      };

      let reportData;

      switch (reportType) {
        case 'access_summary':
          reportData = await this.generateAccessSummaryReport(baseQuery, organization);
          break;
        case 'security_incidents':
          reportData = await this.generateSecurityIncidentsReport(baseQuery, organization);
          break;
        case 'user_activity':
          reportData = await this.generateUserActivityReport(baseQuery, organization);
          break;
        case 'data_retention':
          reportData = await this.generateDataRetentionReport(baseQuery, organization);
          break;
        default:
          throw new Error('Unsupported report type');
      }

      return {
        organization: {
          id: organization._id,
          name: organization.name
        },
        reportType,
        generatedAt: new Date(),
        period: 'Last 90 days',
        ...reportData
      };
    } catch (error) {
      console.error('Generate compliance report error:', error);
      throw error;
    }
  }

  /**
   * Generate access summary report
   */
  async generateAccessSummaryReport(baseQuery, organization) {
    const [
      totalAccesses,
      uniqueUsers,
      resourceBreakdown,
      timeBasedAccess,
      topResources
    ] = await Promise.all([
      AccessLog.countDocuments(baseQuery),
      AccessLog.distinct('user', baseQuery).then(users => users.length),
      AccessLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AccessLog.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      AccessLog.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$resourceId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      summary: {
        totalAccesses,
        uniqueUsers,
        averageAccessesPerUser: uniqueUsers > 0 ? (totalAccesses / uniqueUsers).toFixed(2) : 0
      },
      resourceBreakdown,
      timeBasedAccess,
      topResources
    };
  }

  /**
   * Generate security incidents report
   */
  async generateSecurityIncidentsReport(baseQuery, organization) {
    const [
      failedAuthentications,
      suspiciousActivities,
      policyViolations,
      dataExposures
    ] = await Promise.all([
      AccessLog.countDocuments({
        ...baseQuery,
        action: 'login',
        status: 'failed'
      }),
      AccessLog.aggregate([
        { $match: { ...baseQuery, status: 'failed' } },
        {
          $group: {
            _id: { user: '$user', action: '$action' },
            count: { $sum: 1 },
            lastIncident: { $max: '$timestamp' }
          }
        },
        { $match: { count: { $gte: 5 } } },
        { $sort: { count: -1 } }
      ]),
      AccessLog.countDocuments({
        ...baseQuery,
        action: { $in: ['unauthorized_access', 'permission_denied'] }
      }),
      AccessLog.countDocuments({
        ...baseQuery,
        action: 'data_export',
        'details.sensitive': true
      })
    ]);

    return {
      incidents: {
        failedAuthentications,
        suspiciousActivities: suspiciousActivities.length,
        policyViolations,
        dataExposures
      },
      details: {
        suspiciousActivities
      },
      riskLevel: this.calculateRiskLevel(failedAuthentications, suspiciousActivities.length, policyViolations)
    };
  }

  /**
   * Generate user activity report
   */
  async generateUserActivityReport(baseQuery, organization) {
    const userActivities = await AccessLog.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$user',
          totalActions: { $sum: 1 },
          successfulActions: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          failedActions: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          lastActivity: { $max: '$timestamp' },
          actions: {
            $push: {
              action: '$action',
              status: '$status',
              timestamp: '$timestamp'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { firstName: 1, lastName: 1, email: 1 },
          totalActions: 1,
          successfulActions: 1,
          failedActions: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successfulActions', '$totalActions'] },
              100
            ]
          },
          lastActivity: 1
        }
      },
      { $sort: { totalActions: -1 } }
    ]);

    return {
      userActivities,
      summary: {
        totalUsers: userActivities.length,
        averageActionsPerUser: userActivities.length > 0 ?
          (userActivities.reduce((sum, u) => sum + u.totalActions, 0) / userActivities.length).toFixed(2) : 0
      }
    };
  }

  /**
   * Generate data retention report
   */
  async generateDataRetentionReport(baseQuery, organization) {
    const retentionStats = await AccessLog.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: {
            resource: '$resource',
            age: {
              $switch: {
                branches: [
                  { case: { $lt: ['$timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, then: '30+ days' },
                  { case: { $lt: ['$timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }, then: '7-30 days' },
                  { case: { $lt: ['$timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000)] }, then: '1-7 days' }
                ],
                default: '< 1 day'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.resource': 1, '_id.age': 1 } }
    ]);

    return {
      retentionStats,
      compliance: {
        meetsRetentionPolicy: true, // Assuming 90-day retention
        oldestRecord: await AccessLog.find(baseQuery).sort({ timestamp: 1 }).limit(1).then(logs => logs[0]?.timestamp)
      }
    };
  }

  /**
   * Calculate risk level
   */
  calculateRiskLevel(failedAuth, suspiciousActivities, policyViolations) {
    let score = 0;
    score += failedAuth * 0.1;
    score += suspiciousActivities * 2;
    score += policyViolations * 1.5;

    if (score >= 20) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);

      const result = await AccessLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return {
        deletedCount: result.deletedCount,
        message: `Cleaned up ${result.deletedCount} old audit logs`
      };
    } catch (error) {
      console.error('Cleanup old logs error:', error);
      throw error;
    }
  }

  /**
   * Archive audit logs
   */
  async archiveLogs(archivePath = '/tmp/audit-archive') {
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Archive logs older than 30 days

      const logs = await AccessLog.find({
        timestamp: { $lt: cutoffDate }
      }).lean();

      if (logs.length === 0) {
        return { message: 'No logs to archive' };
      }

      // Create archive directory
      await fs.mkdir(archivePath, { recursive: true });

      // Save to JSON file
      const filename = `audit-archive-${Date.now()}.json`;
      const filepath = path.join(archivePath, filename);
      await fs.writeFile(filepath, JSON.stringify(logs, null, 2));

      // Delete archived logs
      const result = await AccessLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return {
        archivedCount: logs.length,
        deletedCount: result.deletedCount,
        archiveFile: filepath
      };
    } catch (error) {
      console.error('Archive logs error:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();
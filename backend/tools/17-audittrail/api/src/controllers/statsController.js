/**
 * AuditTrail - Stats Controller
 * Dashboard and statistics endpoints
 */

const AuditLog = require('../models/AuditLog');
const AlertService = require('../services/alertService');

// Get dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsLast24h,
      logsLast7d,
      eventsByType,
      eventsByRisk,
      recentEvents,
      timeline24h,
      topActors,
      failedEvents24h
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ timestamp: { $gte: last24h } }),
      AuditLog.countDocuments({ timestamp: { $gte: last7d } }),
      AuditLog.aggregate([
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('logId action eventType actor resource timestamp status riskLevel'),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        {
          $group: {
            _id: { $dateToString: { format: '%H:00', date: '$timestamp' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: last24h } } },
        { 
          $group: { 
            _id: '$actor.id', 
            name: { $first: '$actor.name' },
            type: { $first: '$actor.type' },
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      AuditLog.countDocuments({ 
        timestamp: { $gte: last24h },
        status: 'failure'
      })
    ]);

    // Get alert stats
    const alertStats = AlertService.getAlertStats();

    res.json({
      success: true,
      dashboard: {
        summary: {
          totalLogs,
          logsLast24h,
          logsLast7d,
          failedEvents24h,
          avgEventsPerHour: Math.round(logsLast24h / 24),
          activeAlerts: alertStats.open
        },
        eventsByType: Object.fromEntries(
          eventsByType.map(e => [e._id || 'unknown', e.count])
        ),
        eventsByRisk: Object.fromEntries(
          eventsByRisk.map(e => [e._id || 'unknown', e.count])
        ),
        timeline: timeline24h.map(t => ({
          hour: t._id,
          count: t.count
        })),
        recentEvents: recentEvents.map(e => ({
          id: e.logId,
          action: e.action,
          eventType: e.eventType,
          actor: e.actor?.name || 'System',
          resource: e.resource?.name || e.resource?.type || 'Unknown',
          timestamp: e.timestamp,
          status: e.status,
          riskLevel: e.riskLevel
        })),
        topActors: topActors.map(a => ({
          id: a._id,
          name: a.name || 'Unknown',
          type: a.type || 'user',
          count: a.count
        })),
        alerts: alertStats
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
      error: error.message
    });
  }
};

// Get general stats
exports.getStats = async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const periodMs = parsePeriod(period);
    const startDate = new Date(Date.now() - periodMs);

    const [
      total,
      inPeriod,
      byStatus,
      byEventType,
      byRisk
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      period,
      stats: {
        total,
        inPeriod,
        byStatus: Object.fromEntries(byStatus.map(s => [s._id || 'unknown', s.count])),
        byEventType: Object.fromEntries(byEventType.map(e => [e._id || 'unknown', e.count])),
        byRisk: Object.fromEntries(byRisk.map(r => [r._id || 'unknown', r.count]))
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
};

// Get timeline data
exports.getTimeline = async (req, res) => {
  try {
    const { period = '24h', granularity = 'hour' } = req.query;
    const periodMs = parsePeriod(period);
    const startDate = new Date(Date.now() - periodMs);

    let dateFormat;
    switch (granularity) {
      case 'minute': dateFormat = '%Y-%m-%dT%H:%M'; break;
      case 'hour': dateFormat = '%Y-%m-%dT%H:00'; break;
      case 'day': dateFormat = '%Y-%m-%d'; break;
      default: dateFormat = '%Y-%m-%dT%H:00';
    }

    const timeline = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          failure: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } },
          highRisk: { $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      period,
      granularity,
      timeline: timeline.map(t => ({
        time: t._id,
        total: t.total,
        success: t.success,
        failure: t.failure,
        highRisk: t.highRisk
      }))
    });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timeline',
      error: error.message
    });
  }
};

// Get top actors
exports.getTopActors = async (req, res) => {
  try {
    const { period = '24h', limit = 10 } = req.query;
    const periodMs = parsePeriod(period);
    const startDate = new Date(Date.now() - periodMs);

    const actors = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: '$actor.id',
          name: { $first: '$actor.name' },
          type: { $first: '$actor.type' },
          email: { $first: '$actor.email' },
          count: { $sum: 1 },
          failures: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } },
          highRisk: { $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] } },
          lastActivity: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      period,
      actors: actors.map(a => ({
        id: a._id,
        name: a.name || 'Unknown',
        type: a.type || 'user',
        email: a.email,
        eventCount: a.count,
        failures: a.failures,
        highRiskEvents: a.highRisk,
        lastActivity: a.lastActivity
      }))
    });
  } catch (error) {
    console.error('Top actors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top actors',
      error: error.message
    });
  }
};

// Get top resources
exports.getTopResources = async (req, res) => {
  try {
    const { period = '24h', limit = 10 } = req.query;
    const periodMs = parsePeriod(period);
    const startDate = new Date(Date.now() - periodMs);

    const resources = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { type: '$resource.type', id: '$resource.id' },
          name: { $first: '$resource.name' },
          path: { $first: '$resource.path' },
          count: { $sum: 1 },
          uniqueActors: { $addToSet: '$actor.id' },
          lastAccess: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      period,
      resources: resources.map(r => ({
        type: r._id.type || 'unknown',
        id: r._id.id,
        name: r.name,
        path: r.path,
        accessCount: r.count,
        uniqueActors: r.uniqueActors.filter(Boolean).length,
        lastAccess: r.lastAccess
      }))
    });
  } catch (error) {
    console.error('Top resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top resources',
      error: error.message
    });
  }
};

// Get risk distribution
exports.getRiskDistribution = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const periodMs = parsePeriod(period);
    const startDate = new Date(Date.now() - periodMs);

    const [distribution, trend] = await Promise.all([
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate }, riskLevel: { $in: ['high', 'critical'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      period,
      distribution: Object.fromEntries(
        distribution.map(d => [d._id || 'unknown', d.count])
      ),
      highRiskTrend: trend.map(t => ({
        date: t._id,
        count: t.count
      }))
    });
  } catch (error) {
    console.error('Risk distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get risk distribution',
      error: error.message
    });
  }
};

// Helper function to parse period string
function parsePeriod(period) {
  const match = period.match(/^(\d+)([mhd])$/);
  if (!match) return 24 * 60 * 60 * 1000; // Default 24h

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

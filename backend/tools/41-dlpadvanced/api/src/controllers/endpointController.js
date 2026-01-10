/**
 * Endpoint Controller - Endpoint Agent Management
 */

const { EndpointActivity } = require('../models');

/**
 * Register endpoint agent
 */
exports.registerAgent = async (req, res) => {
  try {
    const { agentId, hostname, os, username, ipAddress, agentVersion } = req.body;
    
    if (!agentId || !hostname) {
      return res.status(400).json({ 
        success: false, 
        error: 'Agent ID and hostname are required' 
      });
    }
    
    // Store in memory or cache (for production, use Redis)
    const agent = {
      agentId,
      hostname,
      os,
      username,
      ipAddress,
      agentVersion,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      status: 'active'
    };
    
    // Get endpoint service
    const integrations = require('../services/index');
    integrations.endpointAgent.registerAgent(agentId, agent);
    
    res.json({
      success: true,
      message: 'Agent registered',
      data: agent
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Agent heartbeat
 */
exports.heartbeat = async (req, res) => {
  try {
    const { agentId } = req.body;
    
    const integrations = require('../services/index');
    integrations.endpointAgent.updateHeartbeat(agentId);
    
    res.json({ success: true, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get connected agents
 */
exports.getAgents = async (req, res) => {
  try {
    const integrations = require('../services/index');
    const agents = integrations.endpointAgent.getConnectedAgents();
    
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Report endpoint activity
 */
exports.reportActivity = async (req, res) => {
  try {
    const { agentId, activityType, data } = req.body;
    
    if (!agentId || !activityType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Agent ID and activity type are required' 
      });
    }
    
    // Store activity
    const activity = await EndpointActivity.create({
      deviceId: agentId,
      activity: {
        type: activityType,
        application: data.application,
        processName: data.processName
      },
      file: data.file,
      destination: data.destination,
      context: {
        ipAddress: data.ipAddress,
        networkType: data.networkType,
        location: data.location,
        timestamp: new Date()
      }
    });
    
    // Check against DLP policies
    const dlpService = require('../services/dlpService');
    let scanResult = null;
    
    if (data.content) {
      scanResult = await dlpService.scanContent(data.content);
    }
    
    // Determine if action should be blocked
    let blocked = false;
    let action = 'allow';
    
    if (scanResult && scanResult.riskScore >= 70) {
      blocked = true;
      action = 'block';
      
      activity.risk = {
        score: scanResult.riskScore,
        flags: scanResult.findings.map(f => f.type),
        blocked: true
      };
      await activity.save();
    }
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('endpoint:activity', {
        agentId,
        activityType,
        blocked,
        riskScore: scanResult?.riskScore || 0
      });
    }
    
    res.json({
      success: true,
      action,
      blocked,
      riskScore: scanResult?.riskScore || 0,
      message: blocked ? 'Action blocked due to DLP policy' : 'Action allowed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get activity history
 */
exports.getActivityHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      agentId, 
      activityType,
      blocked,
      startDate,
      endDate 
    } = req.query;
    
    const query = {};
    if (agentId) query.deviceId = agentId;
    if (activityType) query['activity.type'] = activityType;
    if (blocked !== undefined) query['risk.blocked'] = blocked === 'true';
    if (startDate || endDate) {
      query['context.timestamp'] = {};
      if (startDate) query['context.timestamp'].$gte = new Date(startDate);
      if (endDate) query['context.timestamp'].$lte = new Date(endDate);
    }
    
    const activities = await EndpointActivity.find(query)
      .sort({ 'context.timestamp': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await EndpointActivity.countDocuments(query);
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get activity statistics
 */
exports.getActivityStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const [byType, byDevice, blockedStats, timeline] = await Promise.all([
      EndpointActivity.aggregate([
        { $match: { 'context.timestamp': { $gte: startDate } } },
        { $group: { _id: '$activity.type', count: { $sum: 1 } } }
      ]),
      EndpointActivity.aggregate([
        { $match: { 'context.timestamp': { $gte: startDate } } },
        { $group: { _id: '$deviceId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      EndpointActivity.aggregate([
        { $match: { 'context.timestamp': { $gte: startDate } } },
        { $group: { 
          _id: null, 
          total: { $sum: 1 },
          blocked: { $sum: { $cond: ['$risk.blocked', 1, 0] } }
        }}
      ]),
      EndpointActivity.aggregate([
        { $match: { 'context.timestamp': { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$context.timestamp' } },
            count: { $sum: 1 },
            blocked: { $sum: { $cond: ['$risk.blocked', 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
        topDevices: byDevice,
        blockedStats: blockedStats[0] || { total: 0, blocked: 0 },
        timeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get agent configuration
 */
exports.getAgentConfig = async (req, res) => {
  try {
    const integrations = require('../services/index');
    
    res.json({
      success: true,
      config: integrations.AgentConfigTemplate
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

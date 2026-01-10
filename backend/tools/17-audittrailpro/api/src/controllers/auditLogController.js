/**
 * AuditTrailPro - AuditLog Controller
 * Enhanced with real-time streaming and integrity verification
 */

const AuditLog = require("../models/AuditLog");
const auditService = require("../services/auditService");
const WebSocketService = require("../services/websocketService");
const AlertService = require("../services/alertService");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const {
      eventType,
      status,
      actorId,
      riskLevel,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (actorId) filter["actor.id"] = actorId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sort),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get events (for frontend compatibility)
exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      eventType,
      status,
      riskLevel,
      search
    } = req.query;

    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { 'actor.name': { $regex: search, $options: 'i' } },
        { 'resource.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('logId action eventType actor resource timestamp status riskLevel metadata'),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      events: events.map(e => ({
        id: e.logId,
        action: e.action,
        eventType: e.eventType,
        actor: e.actor?.name || 'System',
        actorType: e.actor?.type || 'system',
        resource: e.resource?.name || e.resource?.type || 'Unknown',
        resourceType: e.resource?.type,
        timestamp: e.timestamp,
        status: e.status,
        riskLevel: e.riskLevel,
        source: e.metadata?.source
      })),
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

// Server-sent events stream for real-time updates
exports.getEventStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
};

exports.getById = async (req, res) => {
  try {
    const log = await AuditLog.findOne({ 
      $or: [
        { _id: req.params.id },
        { logId: req.params.id }
      ]
    });
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: "Audit log not found" });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const log = new AuditLog({
      ...req.body,
      logId: req.body.logId || `LOG-${uuidv4().split('-')[0].toUpperCase()}`,
    });
    await log.save();

    // Check alert rules
    const alerts = await AlertService.evaluateLog(log);

    // Broadcast via WebSocket
    WebSocketService.broadcastEvent({
      id: log.logId,
      action: log.action,
      eventType: log.eventType,
      actor: log.actor?.name,
      resource: log.resource?.name,
      timestamp: log.timestamp,
      status: log.status,
      riskLevel: log.riskLevel
    });

    res.status(201).json({ 
      success: true, 
      data: log,
      alertsTriggered: alerts.length
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createBatch = async (req, res) => {
  try {
    const { logs } = req.body;
    if (!Array.isArray(logs)) {
      return res
        .status(400)
        .json({ success: false, error: "logs must be an array" });
    }

    const createdLogs = [];
    let alertsTriggered = 0;
    
    for (const logData of logs) {
      const log = new AuditLog({
        ...logData,
        logId: logData.logId || `LOG-${uuidv4().split('-')[0].toUpperCase()}`,
      });
      await log.save();
      createdLogs.push(log);

      // Check alerts and broadcast
      const alerts = await AlertService.evaluateLog(log);
      alertsTriggered += alerts.length;

      WebSocketService.broadcastEvent({
        id: log.logId,
        action: log.action,
        eventType: log.eventType,
        actor: log.actor?.name,
        timestamp: log.timestamp
      });
    }

    res.status(201).json({
      success: true,
      data: { 
        created: createdLogs.length, 
        logs: createdLogs,
        alertsTriggered
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.verifyIntegrity = async (req, res) => {
  try {
    const log = await AuditLog.findOne({
      $or: [
        { _id: req.params.id },
        { logId: req.params.id }
      ]
    });
    if (!log) {
      return res
        .status(404)
        .json({ success: false, error: "Audit log not found" });
    }

    const isValid = await log.verifyIntegrity();

    res.json({
      success: true,
      data: {
        logId: log.logId,
        isValid,
        hash: log.hash,
        previousHash: log.previousHash,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify entire chain integrity
exports.verifyChainIntegrity = async (req, res) => {
  try {
    const { startDate, endDate, limit = 1000 } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));

    const results = {
      verified: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const isValid = await log.verifyIntegrity();
      
      if (isValid) {
        results.verified++;
      } else {
        results.failed++;
        results.errors.push({
          logId: log.logId,
          timestamp: log.timestamp,
          issue: 'Hash mismatch detected'
        });
      }

      // Verify chain link
      if (i > 0 && log.previousHash !== logs[i - 1].hash) {
        results.errors.push({
          logId: log.logId,
          timestamp: log.timestamp,
          issue: 'Chain broken - previousHash does not match'
        });
      }
    }

    res.json({
      success: true,
      integrity: {
        totalVerified: logs.length,
        passed: results.verified,
        failed: results.failed,
        chainIntact: results.errors.length === 0,
        errors: results.errors.slice(0, 100), // Limit errors in response
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get integrity status summary
exports.getIntegrityStatus = async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Sample recent logs for integrity check
    const sampleLogs = await AuditLog.find({ timestamp: { $gte: last24h } })
      .sort({ timestamp: -1 })
      .limit(100);

    let validCount = 0;
    let invalidCount = 0;

    for (const log of sampleLogs) {
      const isValid = await log.verifyIntegrity();
      if (isValid) validCount++;
      else invalidCount++;
    }

    const totalLogs = await AuditLog.countDocuments();
    const latestLog = await AuditLog.findOne().sort({ timestamp: -1 });

    res.json({
      success: true,
      status: {
        overall: invalidCount === 0 ? 'healthy' : 'warning',
        totalLogs,
        sampleSize: sampleLogs.length,
        validSamples: validCount,
        invalidSamples: invalidCount,
        integrityScore: sampleLogs.length > 0 
          ? Math.round((validCount / sampleLogs.length) * 100) 
          : 100,
        latestLog: latestLog ? {
          logId: latestLog.logId,
          timestamp: latestLog.timestamp,
          hash: latestLog.hash
        } : null,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayLogs, byEventType, byStatus, recentAlerts] =
      await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.countDocuments({ timestamp: { $gte: today } }),
        AuditLog.aggregate([
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
        ]),
        AuditLog.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        AuditLog.find({ riskLevel: { $in: ["high", "critical"] } })
          .sort({ timestamp: -1 })
          .limit(10),
      ]);

    res.json({
      success: true,
      data: {
        statistics: { totalLogs, todayLogs },
        byEventType: byEventType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

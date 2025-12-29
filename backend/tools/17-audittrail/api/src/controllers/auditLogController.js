/**
 * AuditTrail - AuditLog Controller
 */

const AuditLog = require("../models/AuditLog");
const auditService = require("../services/auditService");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const {
      eventType,
      status,
      actorId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (actorId) filter["actor.id"] = actorId;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ timestamp: -1 }),
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
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
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
      logId: req.body.logId || `log-${uuidv4()}`,
    });
    await log.save();

    // Check alert rules
    await auditService.checkAlertRules(log);

    res.status(201).json({ success: true, data: log });
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
    for (const logData of logs) {
      const log = new AuditLog({
        ...logData,
        logId: logData.logId || `log-${uuidv4()}`,
      });
      await log.save();
      createdLogs.push(log);
    }

    res.status(201).json({
      success: true,
      data: { created: createdLogs.length, logs: createdLogs },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { query, fields, startDate, endDate, limit = 100 } = req.query;

    const filter = {};

    if (query) {
      const searchFields = fields
        ? fields.split(",")
        : ["action", "actor.name", "resource.name"];
      filter.$or = searchFields.map((field) => ({
        [field]: { $regex: query, $options: "i" },
      }));
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    res.json({ success: true, data: logs, count: logs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const analysis = await auditService.analyzeLogs(req.body);
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyIntegrity = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
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

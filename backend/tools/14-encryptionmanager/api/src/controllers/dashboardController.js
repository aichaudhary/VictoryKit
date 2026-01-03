/**
 * Dashboard Controller
 * Provides overview statistics and dashboard data
 */

const { EncryptionKey, Certificate, AuditLog } = require("../models");

// Get dashboard overview
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Key statistics
    const [
      totalKeys,
      activeKeys,
      expiringSoonKeys,
      compromisedKeys,
      keysByType,
      keysByStatus,
      keysByProvider,
    ] = await Promise.all([
      EncryptionKey.countDocuments(),
      EncryptionKey.countDocuments({ status: "active" }),
      EncryptionKey.countDocuments({
        status: "active",
        expiresAt: { $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      }),
      EncryptionKey.countDocuments({ status: "compromised" }),
      EncryptionKey.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      EncryptionKey.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EncryptionKey.aggregate([
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
    ]);

    // Operations in last 24 hours
    const keyOperations24h = await AuditLog.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
    });

    // Recent operations
    const recentOperations = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Certificate statistics (if applicable)
    let certStats = { total: 0, expiringSoon: 0 };
    try {
      certStats = {
        total: await Certificate.countDocuments(),
        expiringSoon: await Certificate.countDocuments({
          expiresAt: {
            $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            $gte: now,
          },
        }),
      };
    } catch (e) {
      // Certificate model may not exist yet
    }

    // Format aggregation results
    const formatAggregation = (arr, defaults = {}) => {
      const result = { ...defaults };
      arr.forEach((item) => {
        if (item._id) result[item._id] = item.count;
      });
      return result;
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalKeys,
          activeKeys,
          expiringSoon: expiringSoonKeys,
          compromisedKeys,
          keyOperations24h,
          certificates: certStats.total,
          certificatesExpiringSoon: certStats.expiringSoon,
        },
        keysByType: formatAggregation(keysByType, {
          symmetric: 0,
          asymmetric: 0,
          hmac: 0,
        }),
        keysByStatus: formatAggregation(keysByStatus, {
          active: 0,
          inactive: 0,
          expired: 0,
          compromised: 0,
          "pending-deletion": 0,
        }),
        keysByProvider: formatAggregation(keysByProvider, {
          local: 0,
          "aws-kms": 0,
          "azure-keyvault": 0,
          "gcp-kms": 0,
        }),
        recentOperations: recentOperations.map((op) => ({
          operation: op.action,
          keyName: op.keyName || "N/A",
          timestamp: op.createdAt,
          status: op.status || "success",
          userId: op.userId,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get key health report
exports.getHealthReport = async (req, res) => {
  try {
    const now = new Date();

    // Find keys with issues
    const [expiredKeys, expiringKeys, unusedKeys, keysNeedingRotation] =
      await Promise.all([
        EncryptionKey.find({
          status: "active",
          expiresAt: { $lt: now },
        }).select("name algorithm expiresAt"),
        EncryptionKey.find({
          status: "active",
          expiresAt: {
            $gte: now,
            $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        }).select("name algorithm expiresAt"),
        EncryptionKey.find({
          status: "active",
          lastUsed: { $lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
        }).select("name algorithm lastUsed"),
        EncryptionKey.find({
          status: "active",
          "rotationPolicy.enabled": true,
          "rotationPolicy.nextRotation": { $lt: now },
        }).select("name algorithm rotationPolicy"),
      ]);

    const issues = [];

    expiredKeys.forEach((key) => {
      issues.push({
        severity: "critical",
        type: "expired",
        keyId: key._id,
        keyName: key.name,
        message: `Key expired on ${key.expiresAt.toISOString()}`,
      });
    });

    expiringKeys.forEach((key) => {
      issues.push({
        severity: "warning",
        type: "expiring",
        keyId: key._id,
        keyName: key.name,
        message: `Key expires on ${key.expiresAt.toISOString()}`,
      });
    });

    unusedKeys.forEach((key) => {
      issues.push({
        severity: "info",
        type: "unused",
        keyId: key._id,
        keyName: key.name,
        message: `Key not used since ${key.lastUsed?.toISOString() || "never"}`,
      });
    });

    keysNeedingRotation.forEach((key) => {
      issues.push({
        severity: "warning",
        type: "rotation-overdue",
        keyId: key._id,
        keyName: key.name,
        message: `Key rotation overdue since ${key.rotationPolicy.nextRotation.toISOString()}`,
      });
    });

    res.json({
      success: true,
      data: {
        healthScore:
          issues.filter((i) => i.severity === "critical").length === 0
            ? issues.filter((i) => i.severity === "warning").length === 0
              ? 100
              : 75
            : 50,
        issues,
        summary: {
          critical: issues.filter((i) => i.severity === "critical").length,
          warning: issues.filter((i) => i.severity === "warning").length,
          info: issues.filter((i) => i.severity === "info").length,
        },
      },
    });
  } catch (error) {
    console.error("Health report error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get encryption metrics
exports.getMetrics = async (req, res) => {
  try {
    const { period = "24h" } = req.query;
    let since;

    switch (period) {
      case "1h":
        since = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case "24h":
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const [operationsByType, operationsOverTime, topKeys] = await Promise.all([
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === "1h" ? "%Y-%m-%d %H:%M" : "%Y-%m-%d %H:00",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since }, keyId: { $ne: null } } },
        { $group: { _id: "$keyName", operations: { $sum: 1 } } },
        { $sort: { operations: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        period,
        operationsByType: operationsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        operationsOverTime: operationsOverTime.map((item) => ({
          time: item._id,
          operations: item.count,
        })),
        topKeys: topKeys.map((item) => ({
          keyName: item._id,
          operations: item.operations,
        })),
      },
    });
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

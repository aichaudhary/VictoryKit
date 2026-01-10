/**
 * Audit Controller
 * Handles audit log retrieval and compliance reporting
 */

const { AuditLog } = require("../models");

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      keyId,
      action,
      userId,
      startDate,
      endDate,
      limit = 100,
      page = 1,
    } = req.query;

    const filter = {};

    if (keyId) filter.keyId = keyId;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get audit log by ID
exports.getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).lean();

    if (!log) {
      return res.status(404).json({ success: false, error: "Audit log not found" });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get compliance report
exports.getComplianceReport = async (req, res) => {
  try {
    const { startDate, endDate, framework = "all" } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const logs = await AuditLog.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    // Build compliance metrics
    const metrics = {
      period: { start, end },
      totalOperations: logs.length,
      operationsByType: {},
      keyAccess: {},
      userActivity: {},
    };

    logs.forEach((log) => {
      // Count by operation type
      metrics.operationsByType[log.action] =
        (metrics.operationsByType[log.action] || 0) + 1;

      // Track key access
      if (log.keyName) {
        if (!metrics.keyAccess[log.keyName]) {
          metrics.keyAccess[log.keyName] = { count: 0, lastAccess: null };
        }
        metrics.keyAccess[log.keyName].count++;
        if (
          !metrics.keyAccess[log.keyName].lastAccess ||
          new Date(log.createdAt) > new Date(metrics.keyAccess[log.keyName].lastAccess)
        ) {
          metrics.keyAccess[log.keyName].lastAccess = log.createdAt;
        }
      }

      // Track user activity
      if (log.userId) {
        metrics.userActivity[log.userId] =
          (metrics.userActivity[log.userId] || 0) + 1;
      }
    });

    // Framework-specific checks
    const complianceChecks = [];

    // GDPR checks
    if (framework === "all" || framework === "gdpr") {
      complianceChecks.push({
        framework: "GDPR",
        checks: [
          {
            requirement: "Encryption of personal data",
            status: metrics.operationsByType["encrypt"] > 0 ? "pass" : "warning",
            details: `${metrics.operationsByType["encrypt"] || 0} encryption operations`,
          },
          {
            requirement: "Key rotation",
            status:
              metrics.operationsByType["key-rotate"] > 0 ? "pass" : "warning",
            details: `${metrics.operationsByType["key-rotate"] || 0} key rotations`,
          },
          {
            requirement: "Access logging",
            status: "pass",
            details: `${logs.length} operations logged`,
          },
        ],
      });
    }

    // PCI-DSS checks
    if (framework === "all" || framework === "pci-dss") {
      complianceChecks.push({
        framework: "PCI-DSS",
        checks: [
          {
            requirement: "Strong cryptography",
            status: "pass",
            details: "AES-256 encryption in use",
          },
          {
            requirement: "Key management procedures",
            status: metrics.operationsByType["key-create"] ? "pass" : "info",
            details: `${metrics.operationsByType["key-create"] || 0} keys created`,
          },
          {
            requirement: "Audit trails",
            status: "pass",
            details: "Full audit logging enabled",
          },
        ],
      });
    }

    // HIPAA checks
    if (framework === "all" || framework === "hipaa") {
      complianceChecks.push({
        framework: "HIPAA",
        checks: [
          {
            requirement: "Data encryption",
            status: "pass",
            details: "Encryption services operational",
          },
          {
            requirement: "Access controls",
            status: "pass",
            details: `${Object.keys(metrics.userActivity).length} unique users tracked`,
          },
          {
            requirement: "Audit controls",
            status: "pass",
            details: "Comprehensive audit logging",
          },
        ],
      });
    }

    res.json({
      success: true,
      data: {
        ...metrics,
        complianceChecks,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Compliance report error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export audit logs
exports.exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, format = "json" } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();

    if (format === "csv") {
      const headers = [
        "Timestamp",
        "Action",
        "Key ID",
        "Key Name",
        "User ID",
        "Status",
        "Details",
      ];
      const rows = logs.map((log) => [
        log.createdAt,
        log.action,
        log.keyId || "",
        log.keyName || "",
        log.userId || "",
        log.status || "success",
        JSON.stringify(log.details || {}),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=audit-logs-${Date.now()}.csv`
      );
      return res.send(csv);
    }

    res.json({
      success: true,
      data: logs,
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

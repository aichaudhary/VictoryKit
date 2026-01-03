/**
 * Audit Service
 * Comprehensive logging for encryption operations and compliance
 */

const axios = require("axios");
const { AuditLog } = require("../models");

class AuditService {
  constructor() {
    this.providers = {
      splunk: this.splunkConfig(),
      datadog: this.datadogConfig()
    };
  }

  splunkConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_SPLUNK_HEC_TOKEN,
      hecToken: process.env.ENCRYPTIONMANAGER_SPLUNK_HEC_TOKEN,
      hecUrl: process.env.ENCRYPTIONMANAGER_SPLUNK_HEC_URL,
      index: process.env.ENCRYPTIONMANAGER_SPLUNK_INDEX || "encryption_audit"
    };
  }

  datadogConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_DATADOG_API_KEY,
      apiKey: process.env.ENCRYPTIONMANAGER_DATADOG_API_KEY,
      appKey: process.env.ENCRYPTIONMANAGER_DATADOG_APP_KEY,
      site: process.env.ENCRYPTIONMANAGER_DATADOG_SITE || "datadoghq.com"
    };
  }

  // ==========================================
  // Log Audit Events
  // ==========================================
  
  async log(data) {
    const auditEntry = {
      operation: data.operation,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      resourceName: data.resourceName,
      actor: data.actor || { userId: "system", serviceAccount: true },
      request: data.request || {},
      status: data.status || "success",
      statusCode: data.statusCode,
      errorMessage: data.errorMessage,
      changes: data.changes,
      cryptoDetails: data.cryptoDetails,
      compliance: data.compliance || {},
      geo: data.geo,
      metadata: data.metadata,
      timestamp: new Date()
    };

    // Save to MongoDB
    try {
      const log = await AuditLog.log(auditEntry);
      
      // Forward to external systems
      this.forwardToSplunk(auditEntry);
      this.forwardToDatadog(auditEntry);
      
      return log;
    } catch (error) {
      console.error("[Audit] Failed to log entry:", error.message);
      return null;
    }
  }

  async logKeyOperation(operation, key, actor, details = {}) {
    return this.log({
      operation: `key.${operation}`,
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor,
      cryptoDetails: {
        algorithm: key.algorithm,
        keySize: key.keySize,
        provider: key.provider,
        ...details.cryptoDetails
      },
      status: details.status || "success",
      errorMessage: details.error,
      metadata: details.metadata
    });
  }

  async logCertificateOperation(operation, cert, actor, details = {}) {
    return this.log({
      operation: `cert.${operation}`,
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: cert.name,
      actor,
      status: details.status || "success",
      errorMessage: details.error,
      metadata: {
        commonName: cert.commonName,
        provider: cert.provider,
        ...details.metadata
      }
    });
  }

  async logEncryptionOperation(operation, keyId, keyName, actor, details = {}) {
    return this.log({
      operation: `key.${operation}`,
      resourceType: "key",
      resourceId: keyId,
      resourceName: keyName,
      actor,
      cryptoDetails: {
        algorithm: details.algorithm,
        dataSize: details.dataSize,
        processingTimeMs: details.processingTimeMs
      },
      status: details.status || "success",
      compliance: details.compliance
    });
  }

  // ==========================================
  // Splunk Integration
  // ==========================================
  
  async forwardToSplunk(entry) {
    const config = this.providers.splunk;
    if (!config.enabled) return;

    try {
      await axios.post(
        config.hecUrl,
        {
          event: entry,
          sourcetype: "encryption_audit",
          index: config.index,
          time: Math.floor(entry.timestamp.getTime() / 1000)
        },
        {
          headers: {
            Authorization: `Splunk ${config.hecToken}`,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      console.error("[Splunk] Failed to forward audit log:", error.message);
    }
  }

  // ==========================================
  // Datadog Integration
  // ==========================================
  
  async forwardToDatadog(entry) {
    const config = this.providers.datadog;
    if (!config.enabled) return;

    try {
      await axios.post(
        `https://http-intake.logs.${config.site}/api/v2/logs`,
        [{
          ddsource: "encryptionmanager",
          ddtags: `env:${process.env.NODE_ENV},operation:${entry.operation}`,
          hostname: "victorykit",
          message: JSON.stringify(entry),
          service: "encryptionmanager"
        }],
        {
          headers: {
            "DD-API-KEY": config.apiKey,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      console.error("[Datadog] Failed to forward audit log:", error.message);
    }
  }

  // ==========================================
  // Query Audit Logs
  // ==========================================
  
  async getAuditLogs(query = {}, options = {}) {
    const {
      page = 1,
      limit = 50,
      sortBy = "timestamp",
      sortOrder = -1
    } = options;

    const filter = {};
    
    if (query.operation) filter.operation = query.operation;
    if (query.resourceType) filter.resourceType = query.resourceType;
    if (query.resourceId) filter.resourceId = query.resourceId;
    if (query.userId) filter["actor.userId"] = query.userId;
    if (query.status) filter.status = query.status;
    if (query.startDate) filter.timestamp = { $gte: new Date(query.startDate) };
    if (query.endDate) {
      filter.timestamp = filter.timestamp || {};
      filter.timestamp.$lte = new Date(query.endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(filter);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAuditSummary(resourceId) {
    const summary = await AuditLog.aggregate([
      { $match: { resourceId: resourceId } },
      {
        $group: {
          _id: "$operation",
          count: { $sum: 1 },
          lastOccurrence: { $max: "$timestamp" },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ["$status", "failure"] }, 1, 0] }
          }
        }
      }
    ]);

    return summary;
  }

  async getOperationStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            operation: "$operation"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          operations: {
            $push: {
              operation: "$_id.operation",
              count: "$count"
            }
          },
          totalCount: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return stats;
  }
}

module.exports = new AuditService();

/**
 * AuditTrailPro - Audit Service
 * Log analysis and ML integration
 */

const axios = require("axios");
const AuditLog = require("../models/AuditLog");
const AlertRule = require("../models/AlertRule");
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8017";

class AuditService {
  async checkAlertRules(log) {
    try {
      const rules = await AlertRule.find({ isActive: true });

      for (const rule of rules) {
        // Check event type match
        if (
          rule.eventTypes?.length &&
          !rule.eventTypes.includes(log.eventType)
        ) {
          continue;
        }

        // Check condition match
        if (this.matchesCondition(log, rule.condition)) {
          await this.triggerAlert(rule, log);
        }
      }
    } catch (error) {
      console.error("Alert check failed:", error.message);
    }
  }

  matchesCondition(log, condition) {
    if (!condition || !condition.field) return false;

    const value = this.getNestedValue(log, condition.field);

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "contains":
        return String(value).includes(condition.value);
      case "regex":
        return new RegExp(condition.value).test(value);
      case "in":
        return condition.value.includes(value);
      case "greater_than":
        return value > condition.value;
      case "less_than":
        return value < condition.value;
      default:
        return false;
    }
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((o, k) => o?.[k], obj);
  }

  async triggerAlert(rule, log) {
    // Update rule statistics
    await AlertRule.findByIdAndUpdate(rule._id, {
      $inc: { "statistics.totalTriggers": 1 },
      "statistics.lastTriggered": new Date(),
    });

    console.log(`🚨 Alert triggered: ${rule.name} for log ${log.logId}`);

    // Trigger external security integrations
    this.integrateWithSecurityStack(rule._id, {
      ruleName: rule.name,
      eventType: log.eventType,
      severity: rule.severity,
      userId: log.actor?.id,
      resource: log.resource?.name,
      anomaliesCount: 1,
      userId: log.actor?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the alert if integration fails
    });

    // Execute alert actions
    for (const action of rule.actions) {
      await this.executeAlertAction(action, rule, log);
    }
  }

  async executeAlertAction(action, rule, log) {
    switch (action.type) {
      case "log":
        console.log(`Alert [${rule.severity}]: ${rule.name} - ${log.action}`);
        break;
      case "webhook":
        try {
          await axios.post(action.target, { rule, log });
        } catch (e) {
          console.error("Webhook failed:", e.message);
        }
        break;
      // Other action types would be implemented here
      default:
        break;
    }
  }

  async analyzeLogs(params) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze/logs`,
        params
      );
      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackAnalysis(params);
    }
  }

  async fallbackAnalysis(params) {
    const { startDate, endDate, eventTypes } = params;

    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (eventTypes?.length) {
      filter.eventType = { $in: eventTypes };
    }

    const [total, byType, byStatus, byRisk] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
    ]);

    return {
      summary: {
        totalLogs: total,
        dateRange: { start: startDate, end: endDate },
      },
      distribution: {
        byEventType: byType.reduce((acc, i) => {
          acc[i._id] = i.count;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, i) => {
          acc[i._id] = i.count;
          return acc;
        }, {}),
        byRiskLevel: byRisk.reduce((acc, i) => {
          acc[i._id] = i.count;
          return acc;
        }, {}),
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  async generateReport(params, template) {
    const { dateRange, filters, groupBy } = params;

    const filter = {};
    if (dateRange) {
      filter.timestamp = {};
      if (dateRange.start) filter.timestamp.$gte = new Date(dateRange.start);
      if (dateRange.end) filter.timestamp.$lte = new Date(dateRange.end);
    }

    // Apply additional filters
    if (filters) {
      Object.assign(filter, filters);
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });

    // Generate report based on template
    let reportData;
    switch (template) {
      case "user_activity":
        reportData = this.generateUserActivityReport(logs);
        break;
      case "access_review":
        reportData = this.generateAccessReviewReport(logs);
        break;
      default:
        reportData = {
          logs,
          summary: { total: logs.length },
        };
    }

    return {
      template,
      parameters: params,
      data: reportData,
      recordCount: logs.length,
      generatedAt: new Date().toISOString(),
    };
  }

  generateUserActivityReport(logs) {
    const userActivity = {};

    for (const log of logs) {
      const userId = log.actor?.id || "unknown";
      if (!userActivity[userId]) {
        userActivity[userId] = {
          name: log.actor?.name,
          actions: 0,
          failures: 0,
          resources: new Set(),
        };
      }
      userActivity[userId].actions++;
      if (log.status === "failure") userActivity[userId].failures++;
      if (log.resource?.type)
        userActivity[userId].resources.add(log.resource.type);
    }

    return Object.entries(userActivity).map(([id, data]) => ({
      userId: id,
      name: data.name,
      totalActions: data.actions,
      failures: data.failures,
      resourceTypes: [...data.resources],
    }));
  }

  generateAccessReviewReport(logs) {
    const accessLogs = logs.filter((l) =>
      ["authentication", "authorization", "data_access"].includes(l.eventType)
    );

    return {
      total: accessLogs.length,
      successful: accessLogs.filter((l) => l.status === "success").length,
      failed: accessLogs.filter((l) => l.status === "failure").length,
      blocked: accessLogs.filter((l) => l.status === "blocked").length,
      logs: accessLogs.slice(0, 100), // Limit details
    };
  }

  // Integration with external security stack
  async integrateWithSecurityStack(alertId, alertData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log audit alerts and anomalies
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'AuditAlert_CL',
            data: {
              AlertId: alertId,
              RuleName: alertData.ruleName,
              EventType: alertData.eventType,
              Severity: alertData.severity,
              UserId: alertData.userId,
              Resource: alertData.resource,
              AnomaliesDetected: alertData.anomaliesCount,
              Timestamp: new Date().toISOString(),
              Source: 'AuditTrailPro'
            }
          }).catch(err => console.error('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for security violations
      if (connectors.cortexXSOAR && alertData.severity === 'high') {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Audit Security Alert - ${alertData.ruleName}`,
            type: 'Audit Violation',
            severity: 'High',
            details: {
              alertId,
              ruleName: alertData.ruleName,
              eventType: alertData.eventType,
              userId: alertData.userId,
              resource: alertData.resource,
              anomaliesCount: alertData.anomaliesCount
            }
          }).catch(err => console.error('XSOAR integration failed:', err.message))
        );
      }

      // Okta - Check user risk and potentially suspend
      if (connectors.okta && alertData.userId) {
        integrationPromises.push(
          connectors.okta.assessUserRisk({
            userId: alertData.userId,
            factors: ['audit_violations', 'suspicious_activity']
          }).then(risk => {
            if (risk.level === 'high') {
              console.log(`High risk user detected: ${alertData.userId}`);
            }
          }).catch(err => console.error('Okta risk assessment failed:', err.message))
        );
      }

      // OpenCTI - Enrich with threat intelligence for suspicious activities
      if (connectors.opencti && alertData.anomaliesCount > 0) {
        integrationPromises.push(
          connectors.opencti.searchIndicators({
            pattern: alertData.userId,
            pattern_type: 'user-account'
          }).then(indicators => {
            if (indicators.length > 0) {
              console.log(`Found ${indicators.length} threat indicators for user ${alertData.userId}`);
            }
          }).catch(err => console.error('OpenCTI enrichment failed:', err.message))
        );
      }

      await Promise.allSettled(integrationPromises);
      console.log('AuditTrailPro security stack integration completed');

    } catch (error) {
      console.error('AuditTrailPro integration error:', error);
    }
  }
}

module.exports = new AuditService();

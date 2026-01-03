/**
 * AuditTrail - Alert Service
 * Real-time alert detection and management
 */

const AuditLog = require('../models/AuditLog');
const AlertRule = require('../models/AlertRule');
const WebSocketService = require('./websocketService');
const axios = require('axios');

class AlertService {
  constructor() {
    this.activeAlerts = new Map();
    this.alertThrottles = new Map(); // Prevent alert flooding
    this.alertHistory = [];
  }

  // Evaluate log against all active alert rules
  async evaluateLog(log) {
    try {
      const rules = await AlertRule.find({ enabled: true });
      const triggeredAlerts = [];

      for (const rule of rules) {
        const triggered = await this.evaluateRule(rule, log);
        if (triggered) {
          const alert = await this.createAlert(rule, log);
          if (alert) {
            triggeredAlerts.push(alert);
          }
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error('Error evaluating log against rules:', error);
      return [];
    }
  }

  // Evaluate a single rule against a log
  async evaluateRule(rule, log) {
    const { conditions } = rule;

    // Check if all conditions match
    for (const condition of conditions) {
      if (!this.matchCondition(condition, log)) {
        return false;
      }
    }

    // Check threshold conditions
    if (rule.threshold && rule.threshold.count > 1) {
      return await this.checkThreshold(rule, log);
    }

    return true;
  }

  matchCondition(condition, log) {
    const { field, operator, value } = condition;
    const logValue = this.getNestedValue(log, field);

    switch (operator) {
      case 'equals':
        return logValue === value;
      case 'not_equals':
        return logValue !== value;
      case 'contains':
        return String(logValue).toLowerCase().includes(String(value).toLowerCase());
      case 'starts_with':
        return String(logValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'ends_with':
        return String(logValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'regex':
        return new RegExp(value, 'i').test(String(logValue));
      case 'in':
        return Array.isArray(value) && value.includes(logValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(logValue);
      case 'greater_than':
        return parseFloat(logValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(logValue) < parseFloat(value);
      case 'exists':
        return logValue !== undefined && logValue !== null;
      case 'not_exists':
        return logValue === undefined || logValue === null;
      default:
        return false;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async checkThreshold(rule, log) {
    const { threshold } = rule;
    const windowMs = this.parseTimeWindow(threshold.window);
    const startTime = new Date(Date.now() - windowMs);

    // Build filter based on grouping
    const filter = {
      timestamp: { $gte: startTime }
    };

    // Add condition filters
    for (const condition of rule.conditions) {
      if (condition.operator === 'equals') {
        this.setNestedValue(filter, condition.field, condition.value);
      }
    }

    // Add grouping
    if (threshold.groupBy) {
      const groupValue = this.getNestedValue(log, threshold.groupBy);
      if (groupValue) {
        this.setNestedValue(filter, threshold.groupBy, groupValue);
      }
    }

    const count = await AuditLog.countDocuments(filter);
    return count >= threshold.count;
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  parseTimeWindow(window) {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // Default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 3600000;
    }
  }

  async createAlert(rule, log) {
    // Check throttle
    const throttleKey = `${rule._id}-${rule.threshold?.groupBy ? this.getNestedValue(log, rule.threshold.groupBy) : 'global'}`;
    const lastAlert = this.alertThrottles.get(throttleKey);
    const throttleMs = this.parseTimeWindow(rule.throttle || '5m');

    if (lastAlert && Date.now() - lastAlert < throttleMs) {
      return null; // Throttled
    }

    this.alertThrottles.set(throttleKey, Date.now());

    const alert = {
      id: `ALR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule._id,
      ruleName: rule.name,
      severity: rule.severity,
      category: rule.category,
      timestamp: new Date(),
      triggerLog: {
        logId: log.logId,
        action: log.action,
        actor: log.actor,
        resource: log.resource,
        timestamp: log.timestamp
      },
      status: 'open',
      escalated: false,
      acknowledgements: []
    };

    // Store alert
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Keep history limited
    if (this.alertHistory.length > 10000) {
      this.alertHistory = this.alertHistory.slice(-5000);
    }

    // Broadcast via WebSocket
    WebSocketService.broadcastAlert(alert);

    // Execute alert actions
    await this.executeActions(rule, alert, log);

    return alert;
  }

  async executeActions(rule, alert, log) {
    if (!rule.actions || !rule.actions.length) return;

    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'webhook':
            await this.sendWebhook(action, alert, log);
            break;
          case 'email':
            await this.sendEmail(action, alert, log);
            break;
          case 'slack':
            await this.sendSlack(action, alert, log);
            break;
          case 'pagerduty':
            await this.sendPagerDuty(action, alert, log);
            break;
          case 'log':
            console.log(`[ALERT] ${alert.ruleName}: ${JSON.stringify(alert.triggerLog)}`);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error.message);
      }
    }
  }

  async sendWebhook(action, alert, log) {
    const { url, method = 'POST', headers = {} } = action.config || {};
    if (!url) return;

    await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      data: {
        alert,
        log: {
          logId: log.logId,
          action: log.action,
          eventType: log.eventType,
          actor: log.actor,
          resource: log.resource,
          timestamp: log.timestamp,
          riskLevel: log.riskLevel
        }
      },
      timeout: 10000
    });
  }

  async sendEmail(action, alert, log) {
    // Email sending would be implemented with nodemailer or similar
    console.log(`[EMAIL] Would send to: ${action.config?.recipients?.join(', ')}`);
  }

  async sendSlack(action, alert, log) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL || action.config?.webhookUrl;
    if (!webhookUrl) return;

    const severityColors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#16a34a'
    };

    await axios.post(webhookUrl, {
      attachments: [{
        color: severityColors[alert.severity] || '#6b7280',
        title: `🚨 ${alert.ruleName}`,
        text: `*Severity:* ${alert.severity.toUpperCase()}\n*Action:* ${log.action}\n*Actor:* ${log.actor?.name || 'Unknown'}\n*Resource:* ${log.resource?.name || 'Unknown'}`,
        footer: 'AuditTrail Alert System',
        ts: Math.floor(Date.now() / 1000)
      }]
    });
  }

  async sendPagerDuty(action, alert, log) {
    const routingKey = process.env.PAGERDUTY_ROUTING_KEY || action.config?.routingKey;
    if (!routingKey) return;

    await axios.post('https://events.pagerduty.com/v2/enqueue', {
      routing_key: routingKey,
      event_action: 'trigger',
      dedup_key: alert.id,
      payload: {
        summary: `${alert.ruleName}: ${log.action} by ${log.actor?.name}`,
        severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'error' : 'warning',
        source: 'AuditTrail',
        timestamp: new Date().toISOString(),
        custom_details: {
          log_id: log.logId,
          action: log.action,
          actor: log.actor?.name,
          resource: log.resource?.name
        }
      }
    });
  }

  // Get active alerts
  getActiveAlerts(filters = {}) {
    let alerts = Array.from(this.activeAlerts.values());

    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }
    if (filters.status) {
      alerts = alerts.filter(a => a.status === filters.status);
    }
    if (filters.category) {
      alerts = alerts.filter(a => a.category === filters.category);
    }

    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Acknowledge alert
  acknowledgeAlert(alertId, userId, userName) {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return null;

    alert.acknowledgements.push({
      userId,
      userName,
      timestamp: new Date()
    });
    alert.status = 'acknowledged';

    WebSocketService.broadcastAlert({ ...alert, action: 'acknowledged' });

    return alert;
  }

  // Resolve alert
  resolveAlert(alertId, userId, userName, resolution) {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return null;

    alert.status = 'resolved';
    alert.resolution = {
      userId,
      userName,
      notes: resolution,
      timestamp: new Date()
    };

    WebSocketService.broadcastAlert({ ...alert, action: 'resolved' });

    // Remove from active after some time
    setTimeout(() => {
      this.activeAlerts.delete(alertId);
    }, 300000); // Keep for 5 minutes after resolution

    return alert;
  }

  // Get alert statistics
  getAlertStats() {
    const alerts = Array.from(this.activeAlerts.values());
    const now = Date.now();
    const last24h = alerts.filter(a => now - new Date(a.timestamp).getTime() < 86400000);

    return {
      total: alerts.length,
      open: alerts.filter(a => a.status === 'open').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      last24h: last24h.length
    };
  }

  // Get alert history
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit).reverse();
  }

  // CRUD for alert rules
  async createRule(ruleData) {
    const rule = new AlertRule(ruleData);
    await rule.save();
    return rule;
  }

  async updateRule(ruleId, updates) {
    const rule = await AlertRule.findByIdAndUpdate(ruleId, updates, { new: true });
    return rule;
  }

  async deleteRule(ruleId) {
    await AlertRule.findByIdAndDelete(ruleId);
    return { deleted: true };
  }

  async getRules(filters = {}) {
    const query = {};
    if (filters.enabled !== undefined) query.enabled = filters.enabled;
    if (filters.severity) query.severity = filters.severity;
    if (filters.category) query.category = filters.category;

    return AlertRule.find(query).sort({ createdAt: -1 });
  }

  async getRule(ruleId) {
    return AlertRule.findById(ruleId);
  }
}

module.exports = new AlertService();

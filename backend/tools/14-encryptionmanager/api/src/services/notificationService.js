/**
 * Notification Service
 * Alerts for key expiration, rotation, and security events
 */

const axios = require("axios");

class NotificationService {
  constructor() {
    this.channels = {
      slack: this.slackConfig(),
      pagerduty: this.pagerdutyConfig(),
      email: this.emailConfig()
    };
  }

  slackConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_SLACK_WEBHOOK_URL,
      webhookUrl: process.env.ENCRYPTIONMANAGER_SLACK_WEBHOOK_URL,
      channel: process.env.ENCRYPTIONMANAGER_SLACK_CHANNEL || "#encryption-alerts"
    };
  }

  pagerdutyConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_PAGERDUTY_ROUTING_KEY,
      routingKey: process.env.ENCRYPTIONMANAGER_PAGERDUTY_ROUTING_KEY,
      apiKey: process.env.ENCRYPTIONMANAGER_PAGERDUTY_API_KEY
    };
  }

  emailConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_SMTP_HOST,
      host: process.env.ENCRYPTIONMANAGER_SMTP_HOST,
      port: process.env.ENCRYPTIONMANAGER_SMTP_PORT || 587,
      user: process.env.ENCRYPTIONMANAGER_SMTP_USER,
      password: process.env.ENCRYPTIONMANAGER_SMTP_PASSWORD,
      from: process.env.ENCRYPTIONMANAGER_SMTP_FROM
    };
  }

  // ==========================================
  // Notification Types
  // ==========================================
  
  async notifyKeyExpiring(key, daysUntilExpiry) {
    const severity = daysUntilExpiry <= 7 ? "critical" : 
                    daysUntilExpiry <= 14 ? "high" : "warning";
    
    const message = {
      title: `🔑 Key Expiring: ${key.name}`,
      description: `Key "${key.name}" will expire in ${daysUntilExpiry} days`,
      severity,
      details: {
        keyId: key._id,
        keyName: key.name,
        algorithm: key.algorithm,
        expiresAt: key.expiresAt,
        provider: key.provider
      }
    };

    return this.sendToAllChannels(message);
  }

  async notifyCertificateExpiring(cert, daysUntilExpiry) {
    const severity = daysUntilExpiry <= 7 ? "critical" : 
                    daysUntilExpiry <= 14 ? "high" : "warning";
    
    const message = {
      title: `📜 Certificate Expiring: ${cert.commonName}`,
      description: `Certificate for "${cert.commonName}" will expire in ${daysUntilExpiry} days`,
      severity,
      details: {
        certId: cert._id,
        commonName: cert.commonName,
        validTo: cert.validTo,
        provider: cert.provider
      }
    };

    return this.sendToAllChannels(message);
  }

  async notifyKeyRotated(key) {
    const message = {
      title: `🔄 Key Rotated: ${key.name}`,
      description: `Key "${key.name}" has been successfully rotated to version ${key.version}`,
      severity: "info",
      details: {
        keyId: key._id,
        keyName: key.name,
        version: key.version,
        rotatedAt: new Date().toISOString()
      }
    };

    return this.sendToAllChannels(message);
  }

  async notifySecurityEvent(event) {
    const message = {
      title: `⚠️ Security Event: ${event.type}`,
      description: event.description,
      severity: event.severity || "high",
      details: event.details
    };

    return this.sendToAllChannels(message);
  }

  async notifyKeyCompromised(key, details) {
    const message = {
      title: `🚨 KEY COMPROMISED: ${key.name}`,
      description: `Key "${key.name}" has been marked as compromised. Immediate action required.`,
      severity: "critical",
      details: {
        keyId: key._id,
        keyName: key.name,
        algorithm: key.algorithm,
        reason: details.reason,
        detectedAt: new Date().toISOString()
      }
    };

    return this.sendToAllChannels(message);
  }

  // ==========================================
  // Channel Implementations
  // ==========================================
  
  async sendToAllChannels(message) {
    const results = {
      slack: null,
      pagerduty: null,
      email: null
    };

    if (this.channels.slack.enabled) {
      results.slack = await this.sendSlack(message);
    }

    if (this.channels.pagerduty.enabled && ["critical", "high"].includes(message.severity)) {
      results.pagerduty = await this.sendPagerDuty(message);
    }

    return results;
  }

  async sendSlack(message) {
    const config = this.channels.slack;
    
    const colorMap = {
      critical: "#FF0000",
      high: "#FF6600",
      warning: "#FFCC00",
      info: "#0066FF"
    };

    try {
      await axios.post(config.webhookUrl, {
        channel: config.channel,
        attachments: [{
          color: colorMap[message.severity] || "#808080",
          title: message.title,
          text: message.description,
          fields: Object.entries(message.details || {}).map(([key, value]) => ({
            title: key,
            value: typeof value === "object" ? JSON.stringify(value) : String(value),
            short: true
          })),
          footer: "EncryptionManager | VictoryKit",
          ts: Math.floor(Date.now() / 1000)
        }]
      });
      
      return { success: true };
    } catch (error) {
      console.error("[Slack] Notification failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPagerDuty(message) {
    const config = this.channels.pagerduty;
    
    const severityMap = {
      critical: "critical",
      high: "error",
      warning: "warning",
      info: "info"
    };

    try {
      await axios.post("https://events.pagerduty.com/v2/enqueue", {
        routing_key: config.routingKey,
        event_action: "trigger",
        payload: {
          summary: message.title,
          severity: severityMap[message.severity] || "warning",
          source: "EncryptionManager",
          custom_details: message.details
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error("[PagerDuty] Notification failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // Scheduled Checks
  // ==========================================
  
  async checkExpiringKeys(warningDays = 14) {
    const { EncryptionKey } = require("../models");
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + warningDays);

    const expiringKeys = await EncryptionKey.find({
      status: "active",
      expiresAt: { $lte: expiryDate, $gt: new Date() }
    });

    for (const key of expiringKeys) {
      const daysUntilExpiry = Math.ceil(
        (key.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      await this.notifyKeyExpiring(key, daysUntilExpiry);
    }

    return { keysChecked: expiringKeys.length };
  }

  async checkExpiringCertificates(warningDays = 30) {
    const { Certificate } = require("../models");
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + warningDays);

    const expiringCerts = await Certificate.find({
      status: "active",
      validTo: { $lte: expiryDate, $gt: new Date() }
    });

    for (const cert of expiringCerts) {
      const daysUntilExpiry = Math.ceil(
        (cert.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      await this.notifyCertificateExpiring(cert, daysUntilExpiry);
    }

    return { certificatesChecked: expiringCerts.length };
  }
}

module.exports = new NotificationService();

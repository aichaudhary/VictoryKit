/**
 * Notification Service for DLP Alerts
 * Multi-channel notification delivery
 */

const axios = require('axios');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmail();
  }
  
  initializeEmail() {
    if (!process.env.SMTP_HOST) return;
    
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // ==========================================
  // Slack Notifications
  // ==========================================
  
  async sendSlackWebhook(incident) {
    if (!process.env.SLACK_WEBHOOK_URL) return;
    
    const severity = incident.riskScore >= 80 ? '🔴' : incident.riskScore >= 50 ? '🟠' : '🟡';
    
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${severity} DLP Alert: ${incident.dataTypes?.join(', ') || 'Sensitive Data Detected'}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Risk Score:*\n${incident.riskScore}/100` },
            { type: 'mrkdwn', text: `*Source:*\n${incident.source || 'Unknown'}` },
            { type: 'mrkdwn', text: `*User:*\n${incident.user || 'N/A'}` },
            { type: 'mrkdwn', text: `*Time:*\n${new Date(incident.timestamp).toLocaleString()}` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Location:*\n${incident.location || 'N/A'}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Incident' },
              url: `${process.env.DASHBOARD_URL}/incidents/${incident.id}`,
              style: 'primary'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Quarantine' },
              style: 'danger',
              value: incident.id,
              action_id: 'quarantine_action'
            }
          ]
        }
      ]
    };
    
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
      return { success: true, channel: 'slack' };
    } catch (error) {
      console.error('Slack webhook failed:', error.message);
      return { success: false, channel: 'slack', error: error.message };
    }
  }
  
  // ==========================================
  // Microsoft Teams Notifications
  // ==========================================
  
  async sendTeamsWebhook(incident) {
    if (!process.env.TEAMS_WEBHOOK_URL) return;
    
    const color = incident.riskScore >= 80 ? 'FF0000' : incident.riskScore >= 50 ? 'FFA500' : 'FFFF00';
    
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color,
      summary: `DLP Alert: ${incident.dataTypes?.join(', ')}`,
      sections: [{
        activityTitle: `🛡️ DLP Alert - Risk Score: ${incident.riskScore}/100`,
        facts: [
          { name: 'Data Types', value: incident.dataTypes?.join(', ') || 'Unknown' },
          { name: 'Source', value: incident.source || 'Unknown' },
          { name: 'User', value: incident.user || 'N/A' },
          { name: 'Location', value: incident.location || 'N/A' },
          { name: 'Time', value: new Date(incident.timestamp).toLocaleString() }
        ],
        markdown: true
      }],
      potentialAction: [{
        '@type': 'OpenUri',
        name: 'View Incident',
        targets: [{
          os: 'default',
          uri: `${process.env.DASHBOARD_URL}/incidents/${incident.id}`
        }]
      }]
    };
    
    try {
      await axios.post(process.env.TEAMS_WEBHOOK_URL, payload);
      return { success: true, channel: 'teams' };
    } catch (error) {
      console.error('Teams webhook failed:', error.message);
      return { success: false, channel: 'teams', error: error.message };
    }
  }
  
  // ==========================================
  // PagerDuty Notifications
  // ==========================================
  
  async sendPagerDuty(incident) {
    if (!process.env.PAGERDUTY_API_KEY || !process.env.PAGERDUTY_SERVICE_ID) return;
    
    const severity = incident.riskScore >= 80 ? 'critical' : incident.riskScore >= 50 ? 'error' : 'warning';
    
    const payload = {
      routing_key: process.env.PAGERDUTY_SERVICE_ID,
      event_action: 'trigger',
      dedup_key: `dlp-${incident.id}`,
      payload: {
        summary: `DLP Alert: ${incident.dataTypes?.join(', ')} detected - Risk Score: ${incident.riskScore}`,
        severity,
        source: incident.source || 'DLP System',
        timestamp: incident.timestamp || new Date().toISOString(),
        custom_details: {
          risk_score: incident.riskScore,
          data_types: incident.dataTypes,
          user: incident.user,
          location: incident.location
        }
      },
      links: [{
        href: `${process.env.DASHBOARD_URL}/incidents/${incident.id}`,
        text: 'View Incident'
      }]
    };
    
    try {
      await axios.post('https://events.pagerduty.com/v2/enqueue', payload, {
        headers: {
          'Authorization': `Token token=${process.env.PAGERDUTY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, channel: 'pagerduty' };
    } catch (error) {
      console.error('PagerDuty notification failed:', error.message);
      return { success: false, channel: 'pagerduty', error: error.message };
    }
  }
  
  // ==========================================
  // Email Notifications
  // ==========================================
  
  async sendEmail(incident) {
    if (!this.emailTransporter || !process.env.DLP_ALERT_EMAILS) return;
    
    const recipients = process.env.DLP_ALERT_EMAILS.split(',');
    const severity = incident.riskScore >= 80 ? 'CRITICAL' : incident.riskScore >= 50 ? 'HIGH' : 'MEDIUM';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: ${incident.riskScore >= 80 ? '#dc3545' : incident.riskScore >= 50 ? '#fd7e14' : '#ffc107'}; color: white; padding: 20px; }
          .content { padding: 20px; }
          .fact { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ DLP Alert - ${severity}</h1>
        </div>
        <div class="content">
          <div class="fact"><span class="label">Risk Score:</span> ${incident.riskScore}/100</div>
          <div class="fact"><span class="label">Data Types:</span> ${incident.dataTypes?.join(', ') || 'Unknown'}</div>
          <div class="fact"><span class="label">Source:</span> ${incident.source || 'Unknown'}</div>
          <div class="fact"><span class="label">User:</span> ${incident.user || 'N/A'}</div>
          <div class="fact"><span class="label">Location:</span> ${incident.location || 'N/A'}</div>
          <div class="fact"><span class="label">Time:</span> ${new Date(incident.timestamp).toLocaleString()}</div>
          <br>
          <a href="${process.env.DASHBOARD_URL}/incidents/${incident.id}" class="button">View Incident</a>
        </div>
      </body>
      </html>
    `;
    
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'dlp@security.local',
        to: recipients.join(', '),
        subject: `[DLP ${severity}] ${incident.dataTypes?.join(', ')} - Risk Score: ${incident.riskScore}`,
        html
      });
      return { success: true, channel: 'email' };
    } catch (error) {
      console.error('Email notification failed:', error.message);
      return { success: false, channel: 'email', error: error.message };
    }
  }
  
  // ==========================================
  // Webhook (Generic)
  // ==========================================
  
  async sendCustomWebhook(incident) {
    const webhooks = process.env.CUSTOM_WEBHOOK_URLS?.split(',') || [];
    const results = [];
    
    for (const webhookUrl of webhooks) {
      try {
        await axios.post(webhookUrl.trim(), {
          type: 'dlp_incident',
          incident: {
            id: incident.id,
            riskScore: incident.riskScore,
            dataTypes: incident.dataTypes,
            source: incident.source,
            user: incident.user,
            location: incident.location,
            timestamp: incident.timestamp
          }
        });
        results.push({ success: true, url: webhookUrl });
      } catch (error) {
        results.push({ success: false, url: webhookUrl, error: error.message });
      }
    }
    
    return results;
  }
  
  // ==========================================
  // SIEM Integration
  // ==========================================
  
  async sendToSIEM(incident) {
    // Splunk HEC
    if (process.env.SPLUNK_HEC_URL && process.env.SPLUNK_HEC_TOKEN) {
      try {
        await axios.post(process.env.SPLUNK_HEC_URL, {
          sourcetype: 'dlp:incident',
          event: incident
        }, {
          headers: {
            'Authorization': `Splunk ${process.env.SPLUNK_HEC_TOKEN}`
          }
        });
      } catch (error) {
        console.error('Splunk HEC failed:', error.message);
      }
    }
    
    // Azure Sentinel
    if (process.env.SENTINEL_WORKSPACE_ID && process.env.SENTINEL_SHARED_KEY) {
      try {
        const logType = 'DLPIncident';
        const date = new Date().toUTCString();
        const body = JSON.stringify([incident]);
        
        // Azure Monitor expects signature-based auth
        // In production, use @azure/monitor-ingestion
        await axios.post(
          `https://${process.env.SENTINEL_WORKSPACE_ID}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              'Log-Type': logType,
              'x-ms-date': date
            }
          }
        );
      } catch (error) {
        console.error('Sentinel ingestion failed:', error.message);
      }
    }
  }
  
  // ==========================================
  // Send All Notifications
  // ==========================================
  
  async notifyAll(incident) {
    const results = {
      incident: incident.id,
      timestamp: new Date(),
      channels: []
    };
    
    // Send to all configured channels in parallel
    const notifications = await Promise.allSettled([
      this.sendSlackWebhook(incident),
      this.sendTeamsWebhook(incident),
      this.sendPagerDuty(incident),
      this.sendEmail(incident),
      this.sendCustomWebhook(incident),
      this.sendToSIEM(incident)
    ]);
    
    notifications.forEach((result, index) => {
      const channels = ['slack', 'teams', 'pagerduty', 'email', 'webhook', 'siem'];
      if (result.status === 'fulfilled' && result.value) {
        results.channels.push(result.value);
      }
    });
    
    return results;
  }
  
  // ==========================================
  // Notification Rules
  // ==========================================
  
  /**
   * Determine which channels to notify based on rules
   */
  async notifyByRules(incident, rules = {}) {
    const {
      criticalChannels = ['slack', 'teams', 'pagerduty', 'email'],
      highChannels = ['slack', 'teams', 'email'],
      mediumChannels = ['slack', 'email'],
      lowChannels = ['email']
    } = rules;
    
    let channels;
    if (incident.riskScore >= 90) {
      channels = criticalChannels;
    } else if (incident.riskScore >= 70) {
      channels = highChannels;
    } else if (incident.riskScore >= 50) {
      channels = mediumChannels;
    } else {
      channels = lowChannels;
    }
    
    const results = [];
    
    for (const channel of channels) {
      switch (channel) {
        case 'slack':
          results.push(await this.sendSlackWebhook(incident));
          break;
        case 'teams':
          results.push(await this.sendTeamsWebhook(incident));
          break;
        case 'pagerduty':
          results.push(await this.sendPagerDuty(incident));
          break;
        case 'email':
          results.push(await this.sendEmail(incident));
          break;
      }
    }
    
    return results;
  }
}

module.exports = new NotificationService();

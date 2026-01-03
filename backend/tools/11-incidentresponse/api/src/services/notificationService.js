/**
 * Notification Service
 * Real-world integrations for alerting and communication
 * 
 * Integrates with: Slack, Microsoft Teams, Email (SMTP), PagerDuty, Twilio SMS
 */

const axios = require('axios');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Slack
    this.slackBotToken = process.env.INCIDENTRESPONSE_SLACK_BOT_TOKEN;
    this.slackWebhook = process.env.INCIDENTRESPONSE_SLACK_WEBHOOK_URL;
    this.slackIncidentChannel = process.env.INCIDENTRESPONSE_SLACK_CHANNEL_INCIDENTS || '#security-incidents';
    this.slackAlertChannel = process.env.INCIDENTRESPONSE_SLACK_CHANNEL_ALERTS || '#security-alerts';
    
    // Microsoft Teams
    this.teamsWebhook = process.env.INCIDENTRESPONSE_TEAMS_WEBHOOK_URL;
    
    // Email
    this.smtpHost = process.env.INCIDENTRESPONSE_SMTP_HOST;
    this.smtpPort = process.env.INCIDENTRESPONSE_SMTP_PORT || 587;
    this.smtpUser = process.env.INCIDENTRESPONSE_SMTP_USER;
    this.smtpPassword = process.env.INCIDENTRESPONSE_SMTP_PASSWORD;
    this.emailFrom = process.env.INCIDENTRESPONSE_EMAIL_FROM || 'security@victorykit.ai';
    
    // PagerDuty
    this.pagerDutyApiKey = process.env.INCIDENTRESPONSE_PAGERDUTY_API_KEY;
    this.pagerDutyServiceId = process.env.INCIDENTRESPONSE_PAGERDUTY_SERVICE_ID;
    
    // Twilio SMS
    this.twilioAccountSid = process.env.INCIDENTRESPONSE_TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.INCIDENTRESPONSE_TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.INCIDENTRESPONSE_TWILIO_PHONE_NUMBER;

    // Initialize email transporter
    if (this.smtpHost && this.smtpUser) {
      this.emailTransporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpPort === 465,
        auth: { user: this.smtpUser, pass: this.smtpPassword }
      });
    }
  }

  /**
   * Send notification through all configured channels
   */
  async notifyAll(incident, notificationType = 'new') {
    const notifications = [];
    
    const message = this.formatIncidentMessage(incident, notificationType);

    if (this.slackWebhook || this.slackBotToken) {
      notifications.push(this.sendSlackNotification(message, incident.severity));
    }
    if (this.teamsWebhook) {
      notifications.push(this.sendTeamsNotification(message, incident));
    }
    if (incident.severity === 'critical' && this.pagerDutyApiKey) {
      notifications.push(this.triggerPagerDuty(incident));
    }

    const results = await Promise.allSettled(notifications);
    return {
      sent: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message })
    };
  }

  /**
   * Slack notification
   */
  async sendSlackNotification(message, severity) {
    const channel = severity === 'critical' || severity === 'high' 
      ? this.slackAlertChannel 
      : this.slackIncidentChannel;

    const severityColors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#ca8a04',
      low: '#2563eb',
      informational: '#6b7280'
    };

    const payload = {
      channel,
      attachments: [{
        color: severityColors[severity] || '#6b7280',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🚨 ${message.title}`, emoji: true }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Severity:*\n${severity.toUpperCase()}` },
              { type: 'mrkdwn', text: `*Status:*\n${message.status}` },
              { type: 'mrkdwn', text: `*Category:*\n${message.category}` },
              { type: 'mrkdwn', text: `*Incident ID:*\n${message.incidentId}` }
            ]
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: message.description || 'No description provided.' }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: '🔍 View Incident' },
                url: `https://incidentresponse.maula.ai/incident/${message.incidentId}`,
                style: 'primary'
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: '✅ Acknowledge' },
                action_id: `ack_${message.incidentId}`
              }
            ]
          }
        ]
      }]
    };

    try {
      if (this.slackBotToken) {
        await axios.post('https://slack.com/api/chat.postMessage', payload, {
          headers: { 'Authorization': `Bearer ${this.slackBotToken}`, 'Content-Type': 'application/json' }
        });
      } else if (this.slackWebhook) {
        await axios.post(this.slackWebhook, payload);
      }
      return { channel: 'Slack', success: true };
    } catch (error) {
      console.error('Slack notification error:', error.message);
      return { channel: 'Slack', success: false, error: error.message };
    }
  }

  /**
   * Microsoft Teams notification
   */
  async sendTeamsNotification(message, incident) {
    if (!this.teamsWebhook) {
      return { channel: 'Teams', success: false, error: 'Webhook not configured' };
    }

    const severityColors = {
      critical: 'attention',
      high: 'warning',
      medium: 'accent',
      low: 'good',
      informational: 'default'
    };

    const card = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              size: 'Large',
              weight: 'Bolder',
              text: `🚨 Security Incident: ${message.title}`,
              color: severityColors[incident.severity]
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Incident ID', value: message.incidentId },
                { title: 'Severity', value: incident.severity.toUpperCase() },
                { title: 'Status', value: message.status },
                { title: 'Category', value: message.category },
                { title: 'Detected', value: new Date(incident.createdAt).toLocaleString() }
              ]
            },
            {
              type: 'TextBlock',
              text: message.description || 'No description provided.',
              wrap: true
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View Incident',
              url: `https://incidentresponse.maula.ai/incident/${message.incidentId}`
            }
          ]
        }
      }]
    };

    try {
      await axios.post(this.teamsWebhook, card);
      return { channel: 'Teams', success: true };
    } catch (error) {
      console.error('Teams notification error:', error.message);
      return { channel: 'Teams', success: false, error: error.message };
    }
  }

  /**
   * PagerDuty alert trigger
   */
  async triggerPagerDuty(incident) {
    if (!this.pagerDutyApiKey) {
      return { channel: 'PagerDuty', success: false, error: 'API key not configured' };
    }

    const payload = {
      routing_key: this.pagerDutyServiceId,
      event_action: 'trigger',
      dedup_key: incident.incidentId,
      payload: {
        summary: `[${incident.severity.toUpperCase()}] ${incident.title}`,
        severity: incident.severity === 'critical' ? 'critical' : 
                  incident.severity === 'high' ? 'error' : 
                  incident.severity === 'medium' ? 'warning' : 'info',
        source: 'VictoryKit IncidentResponse',
        timestamp: new Date().toISOString(),
        custom_details: {
          incident_id: incident.incidentId,
          category: incident.classification?.type,
          affected_assets: incident.affectedAssets?.length || 0,
          indicators: incident.indicators?.length || 0
        }
      },
      links: [{
        href: `https://incidentresponse.maula.ai/incident/${incident.incidentId}`,
        text: 'View in VictoryKit'
      }]
    };

    try {
      await axios.post('https://events.pagerduty.com/v2/enqueue', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      return { channel: 'PagerDuty', success: true };
    } catch (error) {
      console.error('PagerDuty error:', error.message);
      return { channel: 'PagerDuty', success: false, error: error.message };
    }
  }

  /**
   * Email notification
   */
  async sendEmail(recipients, incident) {
    if (!this.emailTransporter) {
      return { channel: 'Email', success: false, error: 'SMTP not configured' };
    }

    const message = this.formatIncidentMessage(incident, 'new');
    const severityEmojis = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵', informational: '⚪' };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">${severityEmojis[incident.severity]} Security Incident Alert</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 0 0 8px 8px;">
          <h3 style="color: #1f2937;">${message.title}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Incident ID:</td><td style="padding: 8px 0;">${message.incidentId}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Severity:</td><td style="padding: 8px 0;"><strong style="color: ${incident.severity === 'critical' ? '#dc2626' : '#ea580c'}">${incident.severity.toUpperCase()}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Category:</td><td style="padding: 8px 0;">${message.category}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Status:</td><td style="padding: 8px 0;">${message.status}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Detected:</td><td style="padding: 8px 0;">${new Date(incident.createdAt).toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px;">${message.description || 'No description provided.'}</p>
          <a href="https://incidentresponse.maula.ai/incident/${message.incidentId}" 
             style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
            View Incident
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">
          This is an automated alert from VictoryKit IncidentResponse.
        </p>
      </div>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: this.emailFrom,
        to: Array.isArray(recipients) ? recipients.join(', ') : recipients,
        subject: `[${incident.severity.toUpperCase()}] Security Incident: ${message.title}`,
        html
      });
      return { channel: 'Email', success: true };
    } catch (error) {
      console.error('Email error:', error.message);
      return { channel: 'Email', success: false, error: error.message };
    }
  }

  /**
   * SMS notification via Twilio
   */
  async sendSMS(phoneNumbers, incident) {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      return { channel: 'SMS', success: false, error: 'Twilio not configured' };
    }

    const message = `🚨 SECURITY ALERT [${incident.severity.toUpperCase()}]\n${incident.title}\nID: ${incident.incidentId}\nView: https://incidentresponse.maula.ai/i/${incident.incidentId}`;

    const results = [];
    const numbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

    for (const to of numbers) {
      try {
        const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
          new URLSearchParams({ To: to, From: this.twilioPhoneNumber, Body: message }),
          { headers: { 'Authorization': `Basic ${auth}` } }
        );
        results.push({ to, success: true });
      } catch (error) {
        results.push({ to, success: false, error: error.message });
      }
    }

    return { channel: 'SMS', results };
  }

  /**
   * Format incident message for notifications
   */
  formatIncidentMessage(incident, type) {
    const typeLabels = {
      new: 'New Incident Created',
      update: 'Incident Updated',
      escalate: 'Incident Escalated',
      resolve: 'Incident Resolved'
    };

    return {
      type: typeLabels[type] || type,
      incidentId: incident.incidentId,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      category: incident.classification?.type || 'unknown',
      assignee: incident.leadInvestigator || 'Unassigned',
      createdAt: incident.createdAt
    };
  }
}

module.exports = new NotificationService();

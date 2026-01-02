/**
 * DLP Integration Index
 * Exports all cloud and endpoint integrations
 */

// Cloud Integrations
const microsoft365 = require('./integrations/microsoft365');
const googleWorkspace = require('./integrations/googleWorkspace');
const slack = require('./integrations/slack');
const cloudStorage = require('./integrations/cloudStorage');

// Notifications
const notifications = require('./notifications/notificationService');

// Endpoint
const { EndpointAgentService, AgentProtocol, AgentConfigTemplate } = require('./endpoints/endpointAgentService');

module.exports = {
  // Microsoft 365
  microsoft365,
  
  // Google Workspace
  googleWorkspace,
  
  // Slack
  slack,
  
  // Cloud Storage (AWS S3, Azure Blob, Dropbox, Box)
  cloudStorage,
  
  // Notifications (Slack, Teams, PagerDuty, Email, SIEM)
  notifications,
  
  // Endpoint Monitoring
  endpointAgent: EndpointAgentService,
  AgentProtocol,
  AgentConfigTemplate,
  
  // Integration status checker
  async checkIntegrationStatus() {
    return {
      microsoft365: {
        configured: !!process.env.AZURE_AD_CLIENT_ID,
        status: process.env.AZURE_AD_CLIENT_ID ? 'ready' : 'not_configured'
      },
      googleWorkspace: {
        configured: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        status: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'ready' : 'not_configured'
      },
      slack: {
        configured: !!process.env.SLACK_BOT_TOKEN,
        status: process.env.SLACK_BOT_TOKEN ? 'ready' : 'not_configured'
      },
      awsS3: {
        configured: !!process.env.AWS_ACCESS_KEY_ID,
        status: process.env.AWS_ACCESS_KEY_ID ? 'ready' : 'not_configured'
      },
      azureBlob: {
        configured: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
        status: process.env.AZURE_STORAGE_CONNECTION_STRING ? 'ready' : 'not_configured'
      },
      dropbox: {
        configured: !!process.env.DROPBOX_ACCESS_TOKEN,
        status: process.env.DROPBOX_ACCESS_TOKEN ? 'ready' : 'not_configured'
      },
      box: {
        configured: !!process.env.BOX_CLIENT_ID,
        status: process.env.BOX_CLIENT_ID ? 'ready' : 'not_configured'
      },
      notifications: {
        slack: !!process.env.SLACK_WEBHOOK_URL,
        teams: !!process.env.TEAMS_WEBHOOK_URL,
        pagerduty: !!process.env.PAGERDUTY_API_KEY,
        email: !!process.env.SMTP_HOST
      }
    };
  }
};

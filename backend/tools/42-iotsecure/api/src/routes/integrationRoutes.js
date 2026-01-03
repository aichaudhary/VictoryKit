const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');

/**
 * External Integrations Routes
 * Base path: /api/v1/iotsecure/integrations
 */

// Get all integrations status
router.get('/', integrationController.getIntegrations);

// Get integration health
router.get('/health', integrationController.getIntegrationHealth);

// === Shodan Integration ===
router.get('/shodan/status', integrationController.getShodanStatus);
router.post('/shodan/search', integrationController.shodanSearch);
router.get('/shodan/host/:ip', integrationController.shodanHostLookup);
router.post('/shodan/scan', integrationController.shodanScan);

// === Censys Integration ===
router.get('/censys/status', integrationController.getCensysStatus);
router.post('/censys/search', integrationController.censysSearch);
router.get('/censys/host/:ip', integrationController.censysHostView);

// === NVD/NIST Integration ===
router.get('/nvd/status', integrationController.getNvdStatus);
router.get('/nvd/cve/:cveId', integrationController.nvdCveLookup);
router.post('/nvd/search', integrationController.nvdSearch);
router.post('/nvd/sync', integrationController.syncNvd);

// === VirusTotal Integration ===
router.get('/virustotal/status', integrationController.getVirusTotalStatus);
router.post('/virustotal/file/scan', integrationController.virusTotalFileScan);
router.get('/virustotal/file/:hash', integrationController.virusTotalFileReport);
router.post('/virustotal/url/scan', integrationController.virusTotalUrlScan);

// === GreyNoise Integration ===
router.get('/greynoise/status', integrationController.getGreyNoiseStatus);
router.get('/greynoise/ip/:ip', integrationController.greynoiseIpLookup);
router.post('/greynoise/query', integrationController.greynoiseQuery);

// === BinaryEdge Integration ===
router.get('/binaryedge/status', integrationController.getBinaryEdgeStatus);
router.get('/binaryedge/host/:ip', integrationController.binaryedgeHostLookup);
router.post('/binaryedge/search', integrationController.binaryedgeSearch);

// === AI Providers ===
router.get('/openai/status', integrationController.getOpenAIStatus);
router.post('/openai/analyze', integrationController.openaiAnalyze);
router.get('/anthropic/status', integrationController.getAnthropicStatus);
router.post('/anthropic/analyze', integrationController.anthropicAnalyze);

// === SIEM Integrations ===
router.get('/sentinel/status', integrationController.getSentinelStatus);
router.post('/sentinel/send-event', integrationController.sentinelSendEvent);
router.get('/splunk/status', integrationController.getSplunkStatus);
router.post('/splunk/send-event', integrationController.splunkSendEvent);

// === SOAR Integrations ===
router.get('/xsoar/status', integrationController.getXsoarStatus);
router.post('/xsoar/create-incident', integrationController.xsoarCreateIncident);

// === Notification Channels ===
router.get('/notifications/channels', integrationController.getNotificationChannels);
router.post('/notifications/test', integrationController.testNotificationChannel);

// Slack
router.get('/slack/status', integrationController.getSlackStatus);
router.post('/slack/send', integrationController.slackSendMessage);

// Email (SendGrid/AWS SES)
router.get('/email/status', integrationController.getEmailStatus);
router.post('/email/send', integrationController.sendEmail);

// SMS (Twilio)
router.get('/sms/status', integrationController.getSmsStatus);
router.post('/sms/send', integrationController.sendSms);

// PagerDuty
router.get('/pagerduty/status', integrationController.getPagerDutyStatus);
router.post('/pagerduty/trigger', integrationController.pagerdutyTrigger);

// Discord
router.get('/discord/status', integrationController.getDiscordStatus);
router.post('/discord/send', integrationController.discordSendMessage);

// Webhooks
router.get('/webhooks', integrationController.getWebhooks);
router.post('/webhooks', integrationController.createWebhook);
router.put('/webhooks/:id', integrationController.updateWebhook);
router.delete('/webhooks/:id', integrationController.deleteWebhook);
router.post('/webhooks/:id/test', integrationController.testWebhook);

// === Threat Intelligence ===
router.get('/threat-intel/feeds', integrationController.getThreatFeeds);
router.post('/threat-intel/sync', integrationController.syncThreatFeeds);
router.get('/threat-intel/ioc/:value', integrationController.lookupIOC);

// === Configuration ===
router.get('/config', integrationController.getIntegrationConfig);
router.put('/config/:integration', integrationController.updateIntegrationConfig);
router.post('/config/:integration/test', integrationController.testIntegration);
router.post('/config/:integration/enable', integrationController.enableIntegration);
router.post('/config/:integration/disable', integrationController.disableIntegration);

module.exports = router;

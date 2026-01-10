/**
 * Integration Routes - External Security Integrations and APIs
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Device, Alert, Vulnerability } = require('../models');

// ============================================
// SHODAN INTEGRATION
// ============================================

// GET /integrations/shodan/info - Get Shodan API info
router.get('/shodan/info', async (req, res) => {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      return res.json({ 
        success: true, 
        data: { configured: false, message: 'Shodan API key not configured' }
      });
    }
    
    const response = await axios.get(`https://api.shodan.io/api-info?key=${apiKey}`);
    res.json({ success: true, data: { configured: true, ...response.data } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /integrations/shodan/host/:ip - Get Shodan data for IP
router.get('/shodan/host/:ip', async (req, res) => {
  try {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      // Return simulated data
      return res.json({
        success: true,
        simulated: true,
        data: generateSimulatedShodanData(req.params.ip)
      });
    }
    
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${req.params.ip}?key=${apiKey}`
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.json({ success: true, data: null, message: 'Host not found in Shodan' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /integrations/shodan/search - Search Shodan
router.post('/shodan/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.body;
    const apiKey = process.env.SHODAN_API_KEY;
    
    if (!apiKey || apiKey.includes('placeholder')) {
      return res.json({
        success: true,
        simulated: true,
        data: { matches: [], total: 0 }
      });
    }
    
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GREYNOICE INTEGRATION
// ============================================

// GET /integrations/greynoise/ip/:ip - Check IP reputation
router.get('/greynoise/ip/:ip', async (req, res) => {
  try {
    const apiKey = process.env.GREYNOISE_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      return res.json({
        success: true,
        simulated: true,
        data: {
          ip: req.params.ip,
          noise: Math.random() > 0.7,
          riot: Math.random() > 0.9,
          classification: ['benign', 'malicious', 'unknown'][Math.floor(Math.random() * 3)]
        }
      });
    }
    
    const response = await axios.get(
      `https://api.greynoise.io/v3/community/${req.params.ip}`,
      { headers: { 'key': apiKey } }
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// VIRUSTOTAL INTEGRATION
// ============================================

// GET /integrations/virustotal/file/:hash - Check file hash
router.get('/virustotal/file/:hash', async (req, res) => {
  try {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey || apiKey.includes('placeholder')) {
      return res.json({
        success: true,
        simulated: true,
        data: {
          hash: req.params.hash,
          detected: Math.random() > 0.8,
          detectionRatio: `${Math.floor(Math.random() * 5)}/72`
        }
      });
    }
    
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/files/${req.params.hash}`,
      { headers: { 'x-apikey': apiKey } }
    );
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// NOTIFICATION INTEGRATIONS
// ============================================

// POST /integrations/slack/webhook - Send Slack notification
router.post('/slack/webhook', async (req, res) => {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'Slack webhook not configured' });
    }
    
    const { text, channel, attachments } = req.body;
    await axios.post(webhookUrl, { text, channel, attachments });
    
    res.json({ success: true, message: 'Slack notification sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /integrations/discord/webhook - Send Discord notification
router.post('/discord/webhook', async (req, res) => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl || webhookUrl.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'Discord webhook not configured' });
    }
    
    const { content, embeds } = req.body;
    await axios.post(webhookUrl, { content, embeds });
    
    res.json({ success: true, message: 'Discord notification sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /integrations/pagerduty/incident - Create PagerDuty incident
router.post('/pagerduty/incident', async (req, res) => {
  try {
    const routingKey = process.env.PAGERDUTY_ROUTING_KEY;
    if (!routingKey || routingKey.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'PagerDuty not configured' });
    }
    
    const { summary, severity, source, alertId } = req.body;
    
    await axios.post('https://events.pagerduty.com/v2/enqueue', {
      routing_key: routingKey,
      event_action: 'trigger',
      dedup_key: alertId,
      payload: {
        summary,
        severity,
        source,
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({ success: true, message: 'PagerDuty incident created' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SIEM INTEGRATIONS
// ============================================

// POST /integrations/sentinel/log - Send to Microsoft Sentinel
router.post('/sentinel/log', async (req, res) => {
  try {
    const workspaceId = process.env.SENTINEL_WORKSPACE_ID;
    const sharedKey = process.env.SENTINEL_SHARED_KEY;
    
    if (!workspaceId || !sharedKey || workspaceId.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'Sentinel not configured' });
    }
    
    // Build signature and send log
    const { logType, logData } = req.body;
    const body = JSON.stringify(logData);
    const contentLength = Buffer.byteLength(body);
    const date = new Date().toUTCString();
    
    // In production, implement proper signature generation
    res.json({ success: true, message: 'Log sent to Sentinel (simulated)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /integrations/splunk/event - Send to Splunk HEC
router.post('/splunk/event', async (req, res) => {
  try {
    const hecUrl = process.env.SPLUNK_HEC_URL;
    const hecToken = process.env.SPLUNK_HEC_TOKEN;
    
    if (!hecUrl || !hecToken || hecUrl.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'Splunk HEC not configured' });
    }
    
    const { event, sourcetype, index } = req.body;
    
    await axios.post(`${hecUrl}/services/collector/event`, {
      event,
      sourcetype: sourcetype || 'iotsentinel',
      index: index || 'main'
    }, {
      headers: { 'Authorization': `Splunk ${hecToken}` }
    });
    
    res.json({ success: true, message: 'Event sent to Splunk' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SOAR INTEGRATIONS
// ============================================

// POST /integrations/xsoar/incident - Create XSOAR incident
router.post('/xsoar/incident', async (req, res) => {
  try {
    const xsoarUrl = process.env.CORTEX_XSOAR_URL;
    const apiKey = process.env.CORTEX_XSOAR_API_KEY;
    
    if (!xsoarUrl || !apiKey || xsoarUrl.includes('placeholder')) {
      return res.json({ success: true, simulated: true, message: 'Cortex XSOAR not configured' });
    }
    
    const { name, type, severity, details } = req.body;
    
    await axios.post(`${xsoarUrl}/incident`, {
      name,
      type,
      severity,
      details,
      createInvestigation: true
    }, {
      headers: { 
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({ success: true, message: 'XSOAR incident created' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// AI/ML INTEGRATIONS
// ============================================

// POST /integrations/ai/analyze - AI-powered analysis
router.post('/ai/analyze', async (req, res) => {
  try {
    const { provider = 'openai', prompt, context } = req.body;
    
    let apiKey, endpoint, model;
    
    switch (provider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY;
        endpoint = 'https://api.openai.com/v1/chat/completions';
        model = process.env.OPENAI_MODEL || 'gpt-4o';
        break;
      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY;
        endpoint = 'https://api.anthropic.com/v1/messages';
        model = 'claude-sonnet-4-20250514';
        break;
      case 'google':
        apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        // Gemini uses different API structure
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid AI provider' });
    }
    
    if (!apiKey || apiKey.includes('placeholder')) {
      return res.json({
        success: true,
        simulated: true,
        data: {
          analysis: 'AI analysis not available - API key not configured',
          recommendations: ['Configure AI provider API key in environment variables']
        }
      });
    }
    
    // Make actual API call based on provider
    let response;
    if (provider === 'openai') {
      response = await axios.post(endpoint, {
        model,
        messages: [
          { role: 'system', content: 'You are an IoT security expert. Analyze the provided data and give security recommendations.' },
          { role: 'user', content: `${prompt}\n\nContext: ${JSON.stringify(context)}` }
        ]
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      
      res.json({
        success: true,
        data: {
          analysis: response.data.choices[0].message.content,
          model,
          provider
        }
      });
    } else {
      res.json({ success: true, simulated: true, message: `${provider} integration pending` });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STATUS AND HEALTH
// ============================================

// GET /integrations/status - Get all integration statuses
router.get('/status', async (req, res) => {
  try {
    const integrations = {
      shodan: !!process.env.SHODAN_API_KEY && !process.env.SHODAN_API_KEY.includes('placeholder'),
      censys: !!process.env.CENSYS_API_KEY && !process.env.CENSYS_API_KEY.includes('placeholder'),
      virustotal: !!process.env.VIRUSTOTAL_API_KEY && !process.env.VIRUSTOTAL_API_KEY.includes('placeholder'),
      greynoise: !!process.env.GREYNOISE_API_KEY && !process.env.GREYNOISE_API_KEY.includes('placeholder'),
      nvd: !!process.env.NVD_API_KEY && !process.env.NVD_API_KEY.includes('placeholder'),
      openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder'),
      anthropic: !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder'),
      slack: !!process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_WEBHOOK_URL.includes('placeholder'),
      discord: !!process.env.DISCORD_WEBHOOK_URL && !process.env.DISCORD_WEBHOOK_URL.includes('placeholder'),
      pagerduty: !!process.env.PAGERDUTY_ROUTING_KEY && !process.env.PAGERDUTY_ROUTING_KEY.includes('placeholder'),
      sentinel: !!process.env.SENTINEL_WORKSPACE_ID && !process.env.SENTINEL_WORKSPACE_ID.includes('placeholder'),
      xsoar: !!process.env.CORTEX_XSOAR_URL && !process.env.CORTEX_XSOAR_URL.includes('placeholder')
    };
    
    const configuredCount = Object.values(integrations).filter(Boolean).length;
    
    res.json({
      success: true,
      data: {
        integrations,
        summary: {
          total: Object.keys(integrations).length,
          configured: configuredCount,
          notConfigured: Object.keys(integrations).length - configuredCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Generate simulated Shodan data
function generateSimulatedShodanData(ip) {
  return {
    ip_str: ip,
    org: 'Simulated Organization',
    asn: 'AS12345',
    isp: 'Simulated ISP',
    country_code: 'US',
    city: 'San Francisco',
    ports: [22, 80, 443, 8080],
    vulns: Math.random() > 0.5 ? ['CVE-2021-44228', 'CVE-2020-1472'] : [],
    os: 'Linux',
    hostnames: [`host-${ip.replace(/\./g, '-')}.example.com`],
    last_update: new Date().toISOString()
  };
}

module.exports = router;

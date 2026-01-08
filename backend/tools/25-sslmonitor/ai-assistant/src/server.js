/**
 * SSLMonitor AI Assistant - WebSocket Server
 * Provides real-time AI assistance for SSL/TLS certificate monitoring
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const { executeFunction } = require('./functionExecutor');

const app = express();
const PORT = process.env.AI_PORT || 6025;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'sslmonitor-ai-assistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/maula/ai' });

// AI Provider configurations
const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro']
  },
  claude: {
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022']
  },
  openai: {
    name: 'OpenAI GPT',
    models: ['gpt-4o', 'gpt-4-turbo']
  },
  grok: {
    name: 'xAI Grok',
    models: ['grok-3-latest', 'grok-2-latest']
  }
};

// SSLMonitor AI Functions
const SSL_FUNCTIONS = [
  {
    name: 'scan_certificate',
    description: 'Scan a domain for SSL/TLS certificate information and security analysis',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name to scan' },
        port: { type: 'number', description: 'Port number (default: 443)' },
        include_chain: { type: 'boolean', description: 'Include certificate chain analysis' }
      },
      required: ['domain']
    }
  },
  {
    name: 'get_expiring_certificates',
    description: 'Get list of certificates expiring within specified days',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Number of days to look ahead' },
        severity: { type: 'string', description: 'Filter by severity' }
      }
    }
  },
  {
    name: 'check_ssl_vulnerabilities',
    description: 'Check domain for SSL/TLS vulnerabilities',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to check' },
        vulnerability_types: { type: 'array', description: 'Specific vulnerabilities to check' }
      },
      required: ['domain']
    }
  },
  {
    name: 'generate_compliance_report',
    description: 'Generate SSL/TLS compliance report',
    parameters: {
      type: 'object',
      properties: {
        standard: { type: 'string', description: 'Compliance standard' },
        domain_ids: { type: 'array', description: 'Domain IDs to include' },
        format: { type: 'string', description: 'Report format' }
      },
      required: ['standard']
    }
  },
  {
    name: 'add_domain_monitoring',
    description: 'Add a domain for SSL/TLS certificate monitoring',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name to monitor' },
        scan_frequency: { type: 'string', description: 'Scan frequency' },
        alert_days_before: { type: 'number', description: 'Days before expiry to alert' }
      },
      required: ['domain']
    }
  }
];

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New Neural Link connection established');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to SSLMonitor AI Assistant',
    capabilities: SSL_FUNCTIONS.map(f => f.name)
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'ai_message':
          await handleAIMessage(ws, message);
          break;
        case 'function_call':
          await handleFunctionCall(ws, message);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message',
        error: error.message 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Neural Link connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle AI chat messages
async function handleAIMessage(ws, message) {
  const { content, provider = 'gemini', model, conversationHistory = [] } = message;

  // Send typing indicator
  ws.send(JSON.stringify({ type: 'typing', status: true }));

  try {
    // Build system prompt for SSLMonitor
    const systemPrompt = `You are an expert SSL/TLS security analyst assistant for SSLMonitor, an enterprise certificate monitoring platform. 

Your capabilities include:
- Scanning and analyzing SSL/TLS certificates
- Identifying certificate expiration risks
- Detecting SSL/TLS vulnerabilities (POODLE, BEAST, Heartbleed, etc.)
- Generating compliance reports (PCI-DSS, HIPAA, GDPR, NIST)
- Recommending security improvements
- Managing domain monitoring

When users ask about certificates, domains, or SSL security, use the available functions to provide accurate, real-time information.

Always provide clear, actionable security recommendations. Format responses in a professional manner suitable for security teams.`;

    // Simulate AI response (in production, call actual AI providers)
    const response = await generateAIResponse(provider, model, systemPrompt, content, conversationHistory);
    
    // Stream response tokens
    for (const token of response.split(' ')) {
      ws.send(JSON.stringify({
        type: 'token',
        content: token + ' ',
        done: false
      }));
      await sleep(50); // Simulate streaming delay
    }

    // Send completion
    ws.send(JSON.stringify({
      type: 'token',
      content: '',
      done: true,
      usage: { promptTokens: content.length, completionTokens: response.length }
    }));

  } catch (error) {
    console.error('AI message error:', error);
    ws.send(JSON.stringify({ 
      type: 'error', 
      message: 'Failed to generate AI response',
      error: error.message 
    }));
  } finally {
    ws.send(JSON.stringify({ type: 'typing', status: false }));
  }
}

// Handle function calls
async function handleFunctionCall(ws, message) {
  const { functionName, parameters } = message;
  
  try {
    const result = await executeFunction(functionName, parameters);
    ws.send(JSON.stringify({
      type: 'function_result',
      functionName,
      result,
      success: true
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'function_result',
      functionName,
      error: error.message,
      success: false
    }));
  }
}

// Generate AI response (mock for now, integrate with actual providers in production)
async function generateAIResponse(provider, model, systemPrompt, userMessage, history) {
  // In production, this would call the actual AI provider APIs
  // For now, return contextual mock responses
  
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('scan') || lowerMessage.includes('check')) {
    return `I'll scan the SSL/TLS certificate for you. To scan a domain, I'll analyze:

**Certificate Details:**
- Subject and Issuer information
- Validity period and expiration date
- Public key algorithm and size
- Signature algorithm

**Security Analysis:**
- Certificate chain validation
- Known vulnerability checks (POODLE, BEAST, Heartbleed)
- Protocol support (TLS 1.2, TLS 1.3)
- Cipher suite strength

Please provide the domain name you'd like me to scan, and I'll generate a comprehensive security report.`;
  }
  
  if (lowerMessage.includes('expir')) {
    return `I'll check for expiring certificates in your monitored domains. Here's what I typically look for:

**Expiration Alerts:**
- 🔴 **Critical**: Certificates expiring within 7 days
- 🟠 **Warning**: Certificates expiring within 30 days
- 🟡 **Notice**: Certificates expiring within 60 days

I can also configure automatic renewal reminders and integrate with your certificate authority for seamless renewals. Would you like me to check your current certificate inventory?`;
  }
  
  if (lowerMessage.includes('compliance') || lowerMessage.includes('report')) {
    return `I can generate compliance reports for various regulatory standards:

**Supported Standards:**
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **HIPAA**: Health Insurance Portability and Accountability Act
- **GDPR**: General Data Protection Regulation
- **NIST**: National Institute of Standards and Technology

Each report includes:
- Certificate inventory assessment
- Security configuration review
- Vulnerability findings
- Remediation recommendations

Which compliance standard would you like me to generate a report for?`;
  }
  
  return `I'm your SSLMonitor AI Assistant, specializing in SSL/TLS certificate security. I can help you with:

📋 **Certificate Management**
- Scan and analyze SSL certificates
- Monitor expiration dates
- Track certificate chain validity

🔒 **Security Analysis**
- Detect vulnerabilities (POODLE, BEAST, Heartbleed)
- Evaluate cipher suite strength
- Check protocol configurations

📊 **Compliance & Reporting**
- Generate PCI-DSS, HIPAA, GDPR reports
- Track compliance status
- Export audit documentation

How can I assist you with your SSL/TLS security today?`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start server
server.listen(PORT, () => {
  console.log(`🔐 SSLMonitor AI Assistant running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/maula/ai`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, wss };

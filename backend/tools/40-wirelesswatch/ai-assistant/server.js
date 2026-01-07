/**
 * WirelessWatch AI Assistant Server
 * WebSocket server with Gemini 1.5 Pro for wireless security AI assistance
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { executeFunctions } from './functionExecutor.js';

dotenv.config();

const app = express();
const PORT = process.env.AI_WS_PORT || 6040;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: `You are WirelessWatch AI, an expert wireless network security analyst specializing in:
- RF spectrum analysis and interference detection
- Rogue access point detection and classification
- Evil twin and KARMA attack prevention
- WiFi vulnerability assessment (KRACK, FragAttacks, Dragonblood)
- Wireless intrusion prevention systems (WIPS)
- Channel optimization and coverage planning
- Client behavior analysis and threat detection
- Compliance auditing for wireless networks
- Site survey analysis and heatmap generation

You help security teams monitor, protect, and optimize their wireless infrastructure.
Always provide specific technical details including BSSIDs, channels, signal strengths when relevant.
When detecting threats, classify severity and recommend immediate containment actions.
For optimization recommendations, include specific channel assignments and power levels.
Format responses clearly with sections for findings, risks, and recommendations.`
});

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();
const clients = new Map();

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/maula-ai' });

// Function definitions for Gemini
const functionDeclarations = [
  {
    name: 'scan_rf_spectrum',
    description: 'Perform RF spectrum analysis to detect interference, rogue signals, and optimize channel allocation',
    parameters: {
      type: 'object',
      properties: {
        band: { type: 'string', enum: ['2.4GHz', '5GHz', '6GHz', 'all'], description: 'Frequency band to scan' },
        channels: { type: 'array', items: { type: 'string' }, description: 'Specific channels to scan' },
        duration: { type: 'number', description: 'Scan duration in seconds' },
        sensitivity: { type: 'string', enum: ['low', 'normal', 'high'], description: 'Scan sensitivity level' }
      },
      required: ['band']
    }
  },
  {
    name: 'detect_rogue_aps',
    description: 'Scan for and classify rogue access points, evil twins, and unauthorized wireless devices',
    parameters: {
      type: 'object',
      properties: {
        scanArea: { type: 'string', description: 'Geographic or logical area to scan' },
        deepScan: { type: 'boolean', description: 'Perform deep scan with fingerprinting' },
        includeClients: { type: 'boolean', description: 'Include connected client analysis' },
        classificationLevel: { type: 'string', enum: ['basic', 'standard', 'advanced'], description: 'Classification detail level' }
      },
      required: ['scanArea']
    }
  },
  {
    name: 'assess_wifi_security',
    description: 'Evaluate wireless network security including encryption, authentication, and known vulnerabilities',
    parameters: {
      type: 'object',
      properties: {
        ssid: { type: 'string', description: 'Network SSID to assess' },
        bssid: { type: 'string', description: 'BSSID of specific AP' },
        checkVulnerabilities: { type: 'boolean', description: 'Check for known vulnerabilities' },
        pentestMode: { type: 'boolean', description: 'Include penetration testing checks' }
      },
      required: ['ssid']
    }
  },
  {
    name: 'optimize_channel_plan',
    description: 'Generate optimized channel allocation to minimize interference and maximize performance',
    parameters: {
      type: 'object',
      properties: {
        site: { type: 'string', description: 'Site identifier' },
        constraints: { type: 'object', description: 'Channel constraints' },
        prioritizeDensity: { type: 'boolean', description: 'Optimize for high-density deployment' },
        dfsAllowed: { type: 'boolean', description: 'Allow DFS channels' }
      },
      required: ['site']
    }
  },
  {
    name: 'investigate_client',
    description: 'Investigate wireless client behavior, connection history, and potential security risks',
    parameters: {
      type: 'object',
      properties: {
        macAddress: { type: 'string', description: 'Client MAC address' },
        timeRange: { type: 'string', description: 'Investigation time range' },
        includeRoaming: { type: 'boolean', description: 'Include roaming analysis' },
        threatAnalysis: { type: 'boolean', description: 'Perform threat behavior analysis' }
      },
      required: ['macAddress']
    }
  },
  {
    name: 'contain_rogue_device',
    description: 'Initiate containment actions against rogue or malicious wireless devices',
    parameters: {
      type: 'object',
      properties: {
        targetBssid: { type: 'string', description: 'Target device BSSID' },
        containmentMethod: { type: 'string', enum: ['deauth', 'blackhole', 'tarpit', 'alert_only'], description: 'Containment method' },
        duration: { type: 'number', description: 'Containment duration in seconds' },
        logActions: { type: 'boolean', description: 'Log all containment actions' }
      },
      required: ['targetBssid']
    }
  },
  {
    name: 'generate_heatmap',
    description: 'Generate RF coverage and signal strength heatmap for site survey analysis',
    parameters: {
      type: 'object',
      properties: {
        floorPlan: { type: 'string', description: 'Floor plan identifier' },
        band: { type: 'string', enum: ['2.4GHz', '5GHz', '6GHz'], description: 'Frequency band' },
        metric: { type: 'string', enum: ['signal_strength', 'snr', 'interference', 'coverage'], description: 'Metric to map' },
        resolution: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Map resolution' }
      },
      required: ['floorPlan', 'band']
    }
  },
  {
    name: 'audit_compliance',
    description: 'Audit wireless network compliance against security standards and policies',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', enum: ['PCI-DSS', 'HIPAA', 'SOC2', 'NIST-800-153', 'custom'], description: 'Compliance framework' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Audit scope' },
        includeRemediation: { type: 'boolean', description: 'Include remediation steps' }
      },
      required: ['framework', 'scope']
    }
  },
  {
    name: 'analyze_attack_patterns',
    description: 'Analyze detected attack patterns including deauth floods, PMKID attacks, and handshake captures',
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'Security event ID' },
        correlateEvents: { type: 'boolean', description: 'Correlate with related events' },
        attributeSource: { type: 'boolean', description: 'Attempt to attribute attack source' },
        generateIocs: { type: 'boolean', description: 'Generate indicators of compromise' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'generate_security_report',
    description: 'Generate comprehensive wireless security assessment report',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', enum: ['summary', 'detailed', 'executive', 'technical'], description: 'Report type' },
        startDate: { type: 'string', description: 'Report start date' },
        endDate: { type: 'string', description: 'Report end date' },
        includeExecutiveSummary: { type: 'boolean', description: 'Include executive summary' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  }
];

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const sessionId = uuidv4();
  
  console.log(`[WirelessWatch AI] Client connected: ${clientId}`);
  
  clients.set(clientId, { ws, sessionId });
  sessions.set(sessionId, {
    id: sessionId,
    clientId,
    startTime: new Date(),
    messages: [],
    context: {}
  });

  ws.send(JSON.stringify({
    type: 'connected',
    payload: { sessionId, clientId }
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, clientId, message);
    } catch (error) {
      console.error('[WirelessWatch AI] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error: error.message }
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[WirelessWatch AI] Client disconnected: ${clientId}`);
    const client = clients.get(clientId);
    if (client) {
      sessions.delete(client.sessionId);
      clients.delete(clientId);
    }
  });

  ws.on('error', (error) => {
    console.error(`[WirelessWatch AI] WebSocket error for ${clientId}:`, error);
  });
});

async function handleMessage(ws, clientId, message) {
  const { type, payload } = message;
  const client = clients.get(clientId);
  if (!client) return;

  const session = sessions.get(client.sessionId);
  if (!session) return;

  switch (type) {
    case 'message':
      await handleChatMessage(ws, session, payload);
      break;
    case 'function_call':
      await handleFunctionCall(ws, session, payload);
      break;
    case 'context_update':
      session.context = { ...session.context, ...payload.context };
      break;
    default:
      console.warn(`[WirelessWatch AI] Unknown message type: ${type}`);
  }
}

async function handleChatMessage(ws, session, payload) {
  const { messageId, content, context } = payload;

  if (context) {
    session.context = { ...session.context, ...context };
  }

  session.messages.push({
    role: 'user',
    content,
    timestamp: new Date()
  });

  try {
    const history = session.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history.slice(0, -1),
      tools: [{ functionDeclarations }]
    });

    const result = await chat.sendMessage(content);
    const response = result.response;

    const functionCall = response.functionCalls()?.[0];

    if (functionCall) {
      const functionResult = await executeFunctions(
        functionCall.name,
        functionCall.args
      );

      const functionContext = `Function ${functionCall.name} result: ${JSON.stringify(functionResult.data)}`;
      const finalResult = await chat.sendMessage(functionContext);
      const finalResponse = finalResult.response.text();

      session.messages.push({
        role: 'assistant',
        content: finalResponse,
        functionCall: functionCall.name,
        functionResult: functionResult,
        timestamp: new Date()
      });

      ws.send(JSON.stringify({
        type: 'response',
        payload: {
          messageId: messageId || uuidv4(),
          content: finalResponse,
          functionCall: {
            name: functionCall.name,
            parameters: functionCall.args
          },
          functionResult
        }
      }));
    } else {
      const responseText = response.text();

      session.messages.push({
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      });

      ws.send(JSON.stringify({
        type: 'response',
        payload: {
          messageId: messageId || uuidv4(),
          content: responseText
        }
      }));
    }
  } catch (error) {
    console.error('[WirelessWatch AI] Chat error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: {
        messageId,
        error: error.message
      }
    }));
  }
}

async function handleFunctionCall(ws, session, payload) {
  const { requestId, functionName, parameters } = payload;

  try {
    const result = await executeFunctions(functionName, parameters);

    ws.send(JSON.stringify({
      type: 'function_result',
      payload: {
        requestId,
        result
      }
    }));
  } catch (error) {
    console.error('[WirelessWatch AI] Function call error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: {
        requestId,
        error: error.message
      }
    }));
  }
}

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WirelessWatch AI Assistant',
    version: '1.0.0',
    model: 'gemini-1.5-pro',
    connections: clients.size,
    uptime: process.uptime()
  });
});

app.get('/functions', (req, res) => {
  res.json({
    functions: functionDeclarations.map(fn => ({
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters
    }))
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`[WirelessWatch AI] WebSocket server running on port ${PORT}`);
  console.log(`[WirelessWatch AI] WebSocket path: /maula-ai`);
  console.log(`[WirelessWatch AI] Health endpoint: http://localhost:${PORT}/health`);
});

export default app;

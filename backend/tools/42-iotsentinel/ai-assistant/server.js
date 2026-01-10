/**
 * IoTSentinel AI Assistant Server
 * WebSocket server with Gemini 1.5 Pro for IoT security AI assistance
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
const PORT = process.env.AI_WS_PORT || 6042;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: `You are IoTSentinel AI, an expert in IoT security with deep knowledge of:
- Smart device vulnerabilities (CVE database, zero-days, common exploits)
- Firmware analysis (malware detection, backdoors, hardcoded credentials)
- Network isolation and microsegmentation for IoT
- Device authentication and access control
- Threat detection and behavioral anomalies
- IoT compliance frameworks (NIST, IEC 62443, HIPAA, ISO 27001)

You help users discover devices, scan for vulnerabilities, analyze firmware,
configure network segmentation, monitor threats, and generate compliance reports.
You can autonomously perform multi-step security tasks and provide actionable
recommendations for IoT risk mitigation.

When reporting vulnerabilities, include CVE IDs, CVSS scores, and remediation steps.
For device discovery, provide MAC addresses, manufacturers, device types, and risk levels.
Always explain security findings clearly and prioritize critical issues.`
});

app.use(cors());
app.use(express.json());

const sessions = new Map();
const clients = new Map();

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/maula/ai' });

// Function definitions for Gemini
const functionDeclarations = [
  {
    name: 'discover_devices',
    description: 'Discover and inventory IoT devices on the network with fingerprinting and classification',
    parameters: {
      type: 'object',
      properties: {
        networkRange: { type: 'string', description: 'IP range or subnet to scan' },
        scanType: { type: 'string', enum: ['quick', 'standard', 'deep', 'passive'], description: 'Discovery scan type' },
        includeShadowIoT: { type: 'boolean', description: 'Include shadow/unauthorized IoT devices' },
        categorize: { type: 'boolean', description: 'Auto-categorize discovered devices' }
      },
      required: ['networkRange']
    }
  },
  {
    name: 'scan_vulnerabilities',
    description: 'Scan IoT devices for CVEs, misconfigurations, and security weaknesses',
    parameters: {
      type: 'object',
      properties: {
        deviceIds: { type: 'array', items: { type: 'string' }, description: 'Device IDs to scan' },
        scanDepth: { type: 'string', enum: ['quick', 'standard', 'comprehensive'], description: 'Scan depth' },
        checkCVEs: { type: 'boolean', description: 'Check against CVE database' },
        checkFirmware: { type: 'boolean', description: 'Verify firmware versions' }
      },
      required: ['deviceIds']
    }
  },
  {
    name: 'analyze_firmware',
    description: 'Analyze IoT device firmware for malware, backdoors, and hardcoded credentials',
    parameters: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Device ID to analyze' },
        firmwareFile: { type: 'string', description: 'Path to firmware file' },
        checkMalware: { type: 'boolean', description: 'Scan for malware signatures' },
        extractSecrets: { type: 'boolean', description: 'Search for hardcoded credentials' }
      },
      required: ['deviceId']
    }
  },
  {
    name: 'configure_segmentation',
    description: 'Configure network segmentation rules to isolate IoT devices',
    parameters: {
      type: 'object',
      properties: {
        deviceIds: { type: 'array', items: { type: 'string' }, description: 'Devices to segment' },
        segmentName: { type: 'string', description: 'Name for the network segment' },
        accessPolicy: { type: 'string', enum: ['isolated', 'restricted', 'monitored'], description: 'Access policy' },
        allowedConnections: { type: 'array', items: { type: 'string' }, description: 'Allowed targets' }
      },
      required: ['deviceIds', 'segmentName']
    }
  },
  {
    name: 'monitor_threats',
    description: 'Real-time monitoring for IoT-specific threats and anomalies',
    parameters: {
      type: 'object',
      properties: {
        deviceIds: { type: 'array', items: { type: 'string' }, description: 'Devices to monitor' },
        timeRange: { type: 'string', description: 'Monitoring time range' },
        alertThreshold: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Alert sensitivity' },
        threatTypes: { type: 'array', items: { type: 'string' }, description: 'Specific threat types' }
      },
      required: ['deviceIds']
    }
  },
  {
    name: 'authenticate_device',
    description: 'Configure device authentication and access control policies',
    parameters: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Device to configure' },
        authMethod: { type: 'string', enum: ['certificate', 'token', 'mfa'], description: 'Auth method' },
        accessLevel: { type: 'string', enum: ['read-only', 'standard', 'admin'], description: 'Access level' },
        rotateCredentials: { type: 'boolean', description: 'Rotate existing credentials' }
      },
      required: ['deviceId']
    }
  },
  {
    name: 'detect_anomaly',
    description: 'Detect behavioral anomalies in IoT device communication patterns',
    parameters: {
      type: 'object',
      properties: {
        deviceIds: { type: 'array', items: { type: 'string' }, description: 'Devices to analyze' },
        timeRange: { type: 'string', description: 'Analysis time period' },
        baselineCompare: { type: 'boolean', description: 'Compare against baseline' },
        anomalyTypes: { type: 'array', items: { type: 'string' }, description: 'Types to detect' }
      },
      required: ['deviceIds']
    }
  },
  {
    name: 'audit_compliance',
    description: 'Audit IoT infrastructure against compliance frameworks',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', enum: ['NIST', 'IEC62443', 'HIPAA', 'ISO27001', 'GDPR'], description: 'Framework' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Audit scope' },
        includeRemediation: { type: 'boolean', description: 'Include remediation steps' },
        generateEvidence: { type: 'boolean', description: 'Generate compliance evidence' }
      },
      required: ['framework', 'scope']
    }
  },
  {
    name: 'respond_incident',
    description: 'Automated incident response for IoT security events',
    parameters: {
      type: 'object',
      properties: {
        incidentId: { type: 'string', description: 'Incident ID to respond to' },
        responseAction: { type: 'string', enum: ['isolate', 'quarantine', 'block', 'monitor', 'remediate'], description: 'Action' },
        automated: { type: 'boolean', description: 'Execute automatically' },
        notifyTeam: { type: 'boolean', description: 'Send notifications' }
      },
      required: ['incidentId', 'responseAction']
    }
  },
  {
    name: 'generate_report',
    description: 'Generate IoT security reports and dashboards',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', enum: ['inventory', 'vulnerability', 'compliance', 'executive'], description: 'Type' },
        startDate: { type: 'string', description: 'Report period start' },
        endDate: { type: 'string', description: 'Report period end' },
        includeRecommendations: { type: 'boolean', description: 'Include recommendations' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  }
];

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const sessionId = uuidv4();
  
  console.log(`[IoTSentinel AI] Client connected: ${clientId}`);
  
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
      console.error('[IoTSentinel AI] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error: error.message }
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[IoTSentinel AI] Client disconnected: ${clientId}`);
    const client = clients.get(clientId);
    if (client) {
      sessions.delete(client.sessionId);
      clients.delete(clientId);
    }
  });

  ws.on('error', (error) => {
    console.error(`[IoTSentinel AI] WebSocket error for ${clientId}:`, error);
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
      const functionResult = await executeFunctions(functionCall.name, functionCall.args);
      const functionContext = `Function ${functionCall.name} result: ${JSON.stringify(functionResult.data)}`;
      const finalResult = await chat.sendMessage(functionContext);
      const finalResponse = finalResult.response.text();

      session.messages.push({
        role: 'assistant',
        content: finalResponse,
        functionCall: functionCall.name,
        functionResult,
        timestamp: new Date()
      });

      ws.send(JSON.stringify({
        type: 'response',
        payload: {
          messageId: messageId || uuidv4(),
          content: finalResponse,
          functionCall: { name: functionCall.name, parameters: functionCall.args },
          functionResult
        }
      }));
    } else {
      const responseText = response.text();
      session.messages.push({ role: 'assistant', content: responseText, timestamp: new Date() });
      ws.send(JSON.stringify({
        type: 'response',
        payload: { messageId: messageId || uuidv4(), content: responseText }
      }));
    }
  } catch (error) {
    console.error('[IoTSentinel AI] Chat error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { messageId, error: error.message }
    }));
  }
}

async function handleFunctionCall(ws, session, payload) {
  const { requestId, functionName, parameters } = payload;

  try {
    const result = await executeFunctions(functionName, parameters);
    ws.send(JSON.stringify({
      type: 'function_result',
      payload: { requestId, result }
    }));
  } catch (error) {
    console.error('[IoTSentinel AI] Function call error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { requestId, error: error.message }
    }));
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'IoTSentinel AI Assistant',
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

server.listen(PORT, () => {
  console.log(`[IoTSentinel AI] WebSocket server running on port ${PORT}`);
  console.log(`[IoTSentinel AI] WebSocket path: /maula/ai`);
});

export default app;

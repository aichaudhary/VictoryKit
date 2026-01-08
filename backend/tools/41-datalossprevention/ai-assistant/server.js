/**
 * DLP Shield AI Assistant Server
 * WebSocket server with Gemini 1.5 Pro for data loss prevention AI assistance
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
const PORT = process.env.AI_WS_PORT || 6041;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: `You are DLP Shield AI, an expert data loss prevention analyst specializing in:
- Sensitive data identification (PII, PHI, PCI, financial, legal, IP)
- Content inspection and pattern matching
- User behavior analytics and insider threat detection
- Regulatory compliance (GDPR, CCPA, HIPAA, PCI-DSS, SOX, GLBA)
- Incident investigation and response
- Data classification and labeling
- Exfiltration detection and prevention
- Policy creation and enforcement

You help security teams protect sensitive data across all channels (email, web, cloud, endpoint).
Always consider the regulatory implications of data handling.
When analyzing incidents, provide context about severity, affected data types, and recommended actions.
For policy recommendations, balance security with business usability.
Format responses with clear sections for findings, risks, compliance impact, and recommendations.`
});

app.use(cors());
app.use(express.json());

const sessions = new Map();
const clients = new Map();

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/maula/ai' });

// Function definitions
const functionDeclarations = [
  {
    name: 'analyze_content',
    description: 'Analyze content for sensitive data including PII, PHI, PCI, and custom patterns',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Content to analyze' },
        contentType: { type: 'string', enum: ['text', 'email', 'file', 'structured'], description: 'Type of content' },
        checkPatterns: { type: 'array', items: { type: 'string' }, description: 'Specific patterns to check' },
        includeContext: { type: 'boolean', description: 'Include surrounding context in findings' }
      },
      required: ['content']
    }
  },
  {
    name: 'investigate_incident',
    description: 'Investigate a DLP incident with full context, user history, and policy details',
    parameters: {
      type: 'object',
      properties: {
        incidentId: { type: 'string', description: 'Incident ID to investigate' },
        includeUserHistory: { type: 'boolean', description: 'Include user incident history' },
        correlateEvents: { type: 'boolean', description: 'Correlate with related events' },
        generateTimeline: { type: 'boolean', description: 'Generate incident timeline' }
      },
      required: ['incidentId']
    }
  },
  {
    name: 'assess_user_risk',
    description: 'Assess user data handling risk based on behavior patterns and incident history',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID to assess' },
        timeRange: { type: 'string', description: 'Assessment time range' },
        includeBaseline: { type: 'boolean', description: 'Compare against baseline behavior' },
        insiderThreatScore: { type: 'boolean', description: 'Calculate insider threat score' }
      },
      required: ['userId']
    }
  },
  {
    name: 'create_policy',
    description: 'Create a DLP policy with detection rules, conditions, and response actions',
    parameters: {
      type: 'object',
      properties: {
        policyName: { type: 'string', description: 'Name for the policy' },
        dataTypes: { type: 'array', items: { type: 'string' }, description: 'Data types to protect' },
        channels: { type: 'array', items: { type: 'string' }, description: 'Channels to monitor' },
        responseActions: { type: 'object', description: 'Actions on policy match' }
      },
      required: ['policyName', 'dataTypes', 'channels']
    }
  },
  {
    name: 'classify_data',
    description: 'Classify data repositories and files based on sensitivity and content analysis',
    parameters: {
      type: 'object',
      properties: {
        targetPath: { type: 'string', description: 'Path to classify' },
        classificationScheme: { type: 'string', description: 'Classification scheme to use' },
        deepScan: { type: 'boolean', description: 'Perform deep content analysis' },
        applyLabels: { type: 'boolean', description: 'Apply sensitivity labels' }
      },
      required: ['targetPath']
    }
  },
  {
    name: 'detect_exfiltration',
    description: 'Detect potential data exfiltration attempts and suspicious transfer patterns',
    parameters: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: 'Time range for detection' },
        channels: { type: 'array', items: { type: 'string' }, description: 'Channels to analyze' },
        volumeThreshold: { type: 'number', description: 'Volume threshold in MB' },
        includeAnomalies: { type: 'boolean', description: 'Include behavioral anomalies' }
      },
      required: ['timeRange']
    }
  },
  {
    name: 'audit_compliance',
    description: 'Audit data handling compliance against regulatory requirements',
    parameters: {
      type: 'object',
      properties: {
        regulation: { type: 'string', enum: ['GDPR', 'CCPA', 'HIPAA', 'PCI-DSS', 'SOX', 'GLBA'], description: 'Regulation to audit' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Audit scope' },
        includeRemediation: { type: 'boolean', description: 'Include remediation steps' },
        generateEvidence: { type: 'boolean', description: 'Generate compliance evidence' }
      },
      required: ['regulation', 'scope']
    }
  },
  {
    name: 'discover_sensitive_data',
    description: 'Discover and inventory sensitive data across endpoints, cloud, and repositories',
    parameters: {
      type: 'object',
      properties: {
        targets: { type: 'array', items: { type: 'string' }, description: 'Targets to scan' },
        dataTypes: { type: 'array', items: { type: 'string' }, description: 'Data types to find' },
        scanDepth: { type: 'string', enum: ['shallow', 'standard', 'deep'], description: 'Scan depth' },
        classifyResults: { type: 'boolean', description: 'Classify discovered data' }
      },
      required: ['targets', 'dataTypes']
    }
  },
  {
    name: 'generate_report',
    description: 'Generate DLP reports including incidents, trends, and executive summaries',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', enum: ['summary', 'detailed', 'executive', 'compliance'], description: 'Report type' },
        startDate: { type: 'string', description: 'Report start date' },
        endDate: { type: 'string', description: 'Report end date' },
        includeRecommendations: { type: 'boolean', description: 'Include recommendations' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  },
  {
    name: 'remediate_exposure',
    description: 'Remediate data exposure by applying encryption, access controls, or removal',
    parameters: {
      type: 'object',
      properties: {
        exposureId: { type: 'string', description: 'Exposure ID to remediate' },
        remediationAction: { type: 'string', enum: ['encrypt', 'quarantine', 'delete', 'restrict_access', 'notify_owner'], description: 'Remediation action' },
        notifyOwner: { type: 'boolean', description: 'Notify data owner' },
        documentAction: { type: 'boolean', description: 'Document remediation action' }
      },
      required: ['exposureId', 'remediationAction']
    }
  }
];

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const sessionId = uuidv4();
  
  console.log(`[DLP AI] Client connected: ${clientId}`);
  
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
      console.error('[DLP AI] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error: error.message }
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[DLP AI] Client disconnected: ${clientId}`);
    const client = clients.get(clientId);
    if (client) {
      sessions.delete(client.sessionId);
      clients.delete(clientId);
    }
  });

  ws.on('error', (error) => {
    console.error(`[DLP AI] WebSocket error for ${clientId}:`, error);
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
    console.error('[DLP AI] Chat error:', error);
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
    console.error('[DLP AI] Function call error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { requestId, error: error.message }
    }));
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'DLP Shield AI Assistant',
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
  console.log(`[DLP AI] WebSocket server running on port ${PORT}`);
  console.log(`[DLP AI] WebSocket path: /maula/ai`);
});

export default app;

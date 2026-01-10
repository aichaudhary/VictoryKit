/**
 * VPNGuardian AI Assistant Server
 * WebSocket server with Gemini 1.5 Pro integration for VPN security AI assistance
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
const PORT = process.env.AI_WS_PORT || 6039;
const API_PORT = process.env.AI_API_PORT || 6040;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  systemInstruction: `You are VPNGuardian AI, an expert VPN security assistant specializing in:
- VPN tunnel management and security
- Zero-trust network access implementation
- Traffic analysis and anomaly detection
- Endpoint security and device compliance
- Certificate management and PKI
- Split tunneling configuration
- Access policy creation and enforcement
- Compliance monitoring (NIST, SOC2, ISO 27001, GDPR, HIPAA)
- Threat detection and incident response

You help security teams configure, monitor, and secure VPN infrastructure.
Always provide actionable recommendations with specific configurations when possible.
When analyzing security issues, consider attack vectors, mitigation strategies, and compliance implications.
Format responses with clear sections and use bullet points for lists.
For technical configurations, provide code or config examples.`
});

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();
const clients = new Map();

// Create HTTP server for WebSocket upgrade
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/maula/ai' });

// Function definitions for Gemini
const functionDeclarations = [
  {
    name: 'analyze_vpn_traffic',
    description: 'Analyze VPN traffic patterns, detect anomalies, and identify potential security threats',
    parameters: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'VPN session ID to analyze' },
        timeRange: { type: 'string', description: 'Time range for analysis (e.g., 1h, 24h, 7d)' },
        includePayload: { type: 'boolean', description: 'Include payload inspection in analysis' },
        threatLevel: { type: 'string', enum: ['all', 'low', 'medium', 'high', 'critical'], description: 'Minimum threat level to report' }
      },
      required: ['sessionId', 'timeRange']
    }
  },
  {
    name: 'assess_endpoint_security',
    description: 'Evaluate endpoint device security posture and compliance with access policies',
    parameters: {
      type: 'object',
      properties: {
        endpointId: { type: 'string', description: 'Endpoint device ID' },
        checkType: { type: 'string', enum: ['full', 'quick', 'compliance', 'vulnerability'], description: 'Type of security check' },
        strictMode: { type: 'boolean', description: 'Use strict compliance requirements' }
      },
      required: ['endpointId']
    }
  },
  {
    name: 'generate_access_policy',
    description: 'Generate zero-trust access policies based on user roles and resource sensitivity',
    parameters: {
      type: 'object',
      properties: {
        userRole: { type: 'string', description: 'User role or group' },
        resources: { type: 'array', items: { type: 'string' }, description: 'Target resources' },
        riskTolerance: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk tolerance level' },
        timeConstraints: { 
          type: 'object', 
          properties: {
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            days: { type: 'array', items: { type: 'string' } }
          },
          description: 'Time-based access constraints' 
        }
      },
      required: ['userRole', 'resources']
    }
  },
  {
    name: 'detect_tunnel_compromise',
    description: 'Detect VPN tunnel compromise, man-in-the-middle attacks, and session hijacking',
    parameters: {
      type: 'object',
      properties: {
        tunnelId: { type: 'string', description: 'VPN tunnel ID to check' },
        checkCertificates: { type: 'boolean', description: 'Validate certificate chain' },
        deepAnalysis: { type: 'boolean', description: 'Perform deep cryptographic analysis' }
      },
      required: ['tunnelId']
    }
  },
  {
    name: 'optimize_routing',
    description: 'Optimize VPN routing for performance while maintaining security policies',
    parameters: {
      type: 'object',
      properties: {
        sourceRegion: { type: 'string', description: 'Source region for routing' },
        destinationZones: { type: 'array', items: { type: 'string' }, description: 'Target network zones' },
        prioritizeSpeed: { type: 'boolean', description: 'Prioritize speed over redundancy' },
        constraints: { type: 'object', description: 'Routing constraints' }
      },
      required: ['sourceRegion', 'destinationZones']
    }
  },
  {
    name: 'audit_user_access',
    description: 'Audit user access patterns and flag suspicious connection behaviors',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID to audit' },
        auditPeriod: { type: 'string', description: 'Audit period (e.g., 7d, 30d)' },
        includeGeoData: { type: 'boolean', description: 'Include geographic data in audit' },
        flagThreshold: { type: 'number', description: 'Anomaly score threshold for flagging (0-1)' }
      },
      required: ['userId']
    }
  },
  {
    name: 'manage_certificates',
    description: 'Manage VPN certificates including renewal, revocation, and rotation recommendations',
    parameters: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['list', 'renew', 'revoke', 'rotate', 'check'], description: 'Certificate operation' },
        certId: { type: 'string', description: 'Certificate ID (if applicable)' },
        validity: { type: 'number', description: 'Validity period in days (for renewal)' },
        keyStrength: { type: 'string', enum: ['RSA-2048', 'RSA-4096', 'ECDSA-P256', 'ECDSA-P384'], description: 'Key algorithm and strength' }
      },
      required: ['operation']
    }
  },
  {
    name: 'configure_split_tunnel',
    description: 'Configure split tunneling rules based on application requirements and security policies',
    parameters: {
      type: 'object',
      properties: {
        applications: { type: 'array', items: { type: 'string' }, description: 'Applications to include/exclude' },
        domains: { type: 'array', items: { type: 'string' }, description: 'Domains to include/exclude' },
        bypassLocal: { type: 'boolean', description: 'Bypass local network traffic' },
        securityLevel: { type: 'string', enum: ['low', 'medium', 'high', 'paranoid'], description: 'Security level for split tunnel' }
      },
      required: ['applications', 'domains']
    }
  },
  {
    name: 'generate_threat_report',
    description: 'Generate comprehensive threat report with attack vectors, blocked threats, and recommendations',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', enum: ['summary', 'detailed', 'executive', 'technical'], description: 'Type of report' },
        startDate: { type: 'string', description: 'Report start date (ISO format)' },
        endDate: { type: 'string', description: 'Report end date (ISO format)' },
        includeRemediation: { type: 'boolean', description: 'Include remediation recommendations' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  },
  {
    name: 'enforce_compliance',
    description: 'Enforce compliance policies and generate deviation reports for regulatory requirements',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', enum: ['NIST-800-53', 'SOC2', 'ISO-27001', 'GDPR', 'HIPAA', 'PCI-DSS'], description: 'Compliance framework' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Scope of compliance check' },
        autoRemediate: { type: 'boolean', description: 'Automatically remediate non-compliant settings' },
        notifyViolations: { type: 'boolean', description: 'Send notifications for violations' }
      },
      required: ['framework', 'scope']
    }
  }
];

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const sessionId = uuidv4();
  
  console.log(`[VPNGuardian AI] Client connected: ${clientId}`);
  
  // Store client and session
  clients.set(clientId, { ws, sessionId });
  sessions.set(sessionId, {
    id: sessionId,
    clientId,
    startTime: new Date(),
    messages: [],
    context: {}
  });

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    payload: { sessionId, clientId }
  }));

  // Message handler
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, clientId, message);
    } catch (error) {
      console.error('[VPNGuardian AI] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error: error.message }
      }));
    }
  });

  // Close handler
  ws.on('close', () => {
    console.log(`[VPNGuardian AI] Client disconnected: ${clientId}`);
    const client = clients.get(clientId);
    if (client) {
      sessions.delete(client.sessionId);
      clients.delete(clientId);
    }
  });

  // Error handler
  ws.on('error', (error) => {
    console.error(`[VPNGuardian AI] WebSocket error for ${clientId}:`, error);
  });
});

// Handle incoming messages
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
      console.warn(`[VPNGuardian AI] Unknown message type: ${type}`);
  }
}

// Handle chat messages
async function handleChatMessage(ws, session, payload) {
  const { messageId, content, context } = payload;

  // Update context if provided
  if (context) {
    session.context = { ...session.context, ...context };
  }

  // Add user message to history
  session.messages.push({
    role: 'user',
    content,
    timestamp: new Date()
  });

  try {
    // Build conversation history for Gemini
    const history = session.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Create chat session with function calling
    const chat = model.startChat({
      history: history.slice(0, -1),
      tools: [{ functionDeclarations }]
    });

    // Generate response
    const result = await chat.sendMessage(content);
    const response = result.response;

    // Check if there's a function call
    const functionCall = response.functionCalls()?.[0];

    if (functionCall) {
      // Execute the function
      const functionResult = await executeFunctions(
        functionCall.name,
        functionCall.args
      );

      // Add function result to context
      const functionContext = `Function ${functionCall.name} result: ${JSON.stringify(functionResult.data)}`;

      // Get final response with function result
      const finalResult = await chat.sendMessage(functionContext);
      const finalResponse = finalResult.response.text();

      // Store assistant response
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
      // Regular text response
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
    console.error('[VPNGuardian AI] Chat error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: {
        messageId,
        error: error.message
      }
    }));
  }
}

// Handle direct function calls
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
    console.error('[VPNGuardian AI] Function call error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: {
        requestId,
        error: error.message
      }
    }));
  }
}

// REST API endpoints for health and testing
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VPNGuardian AI Assistant',
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
  console.log(`[VPNGuardian AI] WebSocket server running on port ${PORT}`);
  console.log(`[VPNGuardian AI] WebSocket path: /maula/ai`);
  console.log(`[VPNGuardian AI] Health endpoint: http://localhost:${PORT}/health`);
});

export default app;

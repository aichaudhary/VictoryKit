/**
 * DDOSShield AI Assistant - WebSocket Server
 * Tool #24 - AI-Powered DDoS Protection & Mitigation
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { executeDDOSShieldFunction } from './functions/ddosdefenderFunctions';

const PORT = process.env.AI_WS_PORT || 6024;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Client {
  id: string;
  ws: WebSocket;
  conversationHistory: Array<{ role: string; content: string }>;
}

const clients = new Map<string, Client>();

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `You are Maula, the AI assistant for DDOSShield - an AI-powered DDoS protection platform.

You help security teams:
- Detect and analyze DDoS attacks in real-time
- Monitor traffic patterns and identify anomalies
- Configure and optimize protection settings
- Manage blocklists and rate limiting
- Investigate incidents and generate reports

You have access to the following functions:
1. analyze_traffic - Analyze traffic patterns for anomalies
2. detect_attack - Detect ongoing DDoS attacks
3. mitigate_attack - Apply mitigation strategies
4. manage_blocklist - Manage IP blocklists
5. configure_protection - Configure protection rules
6. analyze_attack_patterns - Analyze historical patterns
7. get_traffic_baseline - Get/update traffic baselines
8. investigate_incident - Investigate DDoS incidents
9. optimize_protection - AI-driven optimization
10. generate_report - Generate protection reports

Provide expert, actionable guidance on DDoS protection. Be concise but thorough.`;

const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`[DDOSShield AI] WebSocket server starting on port ${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  const client: Client = {
    id: clientId,
    ws,
    conversationHistory: []
  };
  clients.set(clientId, client);

  console.log(`[DDOSShield AI] Client connected: ${clientId}`);

  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    message: 'Connected to DDOSShield AI Assistant'
  }));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(client, message);
    } catch (error) {
      console.error('[DDOSShield AI] Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { error: 'Failed to process message' }
      }));
    }
  });

  ws.on('close', () => {
    console.log(`[DDOSShield AI] Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error(`[DDOSShield AI] WebSocket error for ${clientId}:`, error);
  });
});

async function handleMessage(client: Client, message: { type: string; content?: string; functionName?: string; parameters?: Record<string, unknown>; requestId?: string }) {
  switch (message.type) {
    case 'chat':
      await handleChat(client, message.content || '');
      break;

    case 'function_call':
      await handleFunctionCall(client, message.functionName || '', message.parameters || {}, message.requestId);
      break;

    default:
      client.ws.send(JSON.stringify({
        type: 'error',
        payload: { error: `Unknown message type: ${message.type}` }
      }));
  }
}

async function handleChat(client: Client, content: string) {
  client.conversationHistory.push({ role: 'user', content });

  try {
    let responseText = '';

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'I understand. I am Maula, ready to help with DDoS protection.' }] },
          ...client.conversationHistory.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }))
        ]
      });

      const result = await chat.sendMessage(content);
      responseText = result.response.text();
    } else {
      responseText = `I'm Maula, the DDOSShield AI assistant. I can help you with DDoS protection, but I need an API key to be configured. Your question was: "${content}"`;
    }

    client.conversationHistory.push({ role: 'assistant', content: responseText });

    client.ws.send(JSON.stringify({
      type: 'response',
      payload: {
        messageId: uuidv4(),
        content: responseText
      }
    }));
  } catch (error) {
    console.error('[DDOSShield AI] Chat error:', error);
    client.ws.send(JSON.stringify({
      type: 'error',
      payload: { error: 'Failed to generate response' }
    }));
  }
}

async function handleFunctionCall(client: Client, functionName: string, parameters: Record<string, unknown>, requestId?: string) {
  try {
    const result = await executeDDOSShieldFunction(functionName, parameters);

    client.ws.send(JSON.stringify({
      type: 'function_result',
      requestId,
      payload: {
        functionName,
        success: true,
        data: result
      }
    }));
  } catch (error) {
    console.error(`[DDOSShield AI] Function error (${functionName}):`, error);
    client.ws.send(JSON.stringify({
      type: 'function_result',
      requestId,
      payload: {
        functionName,
        success: false,
        error: error instanceof Error ? error.message : 'Function execution failed'
      }
    }));
  }
}

wss.on('listening', () => {
  console.log(`[DDOSShield AI] ✓ WebSocket server listening on port ${PORT}`);
});

wss.on('error', (error) => {
  console.error('[DDOSShield AI] Server error:', error);
});

export { wss };

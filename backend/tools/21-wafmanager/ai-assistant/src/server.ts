/**
 * WAFManager AI Assistant - WebSocket Server
 * Tool #21 - AI-Powered Web Application Firewall Management
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { executeWAFManagerFunction } from './functions/wafmanagerFunctions';

const PORT = process.env.AI_WS_PORT || 6021;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Client {
  id: string;
  ws: WebSocket;
  conversationHistory: Array<{ role: string; content: string }>;
}

const clients = new Map<string, Client>();
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `You are Maula, the AI assistant for WAFManager - an AI-powered Web Application Firewall management platform.

You help security teams:
- Configure and optimize WAF rules
- Detect and block web application attacks
- Analyze traffic patterns and threats
- Protect against OWASP Top 10 vulnerabilities
- Manage blocklists and rate limiting

You have access to 10 functions: analyze_traffic, create_rule, detect_attacks, optimize_rules, manage_blocklist, analyze_attack_patterns, test_rule, configure_protection, investigate_incident, generate_report.

Provide expert guidance on WAF configuration and web security.`;

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  const client: Client = { id: clientId, ws, conversationHistory: [] };
  clients.set(clientId, client);

  ws.send(JSON.stringify({ type: 'connected', clientId, message: 'Connected to WAFManager AI' }));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'chat') {
        await handleChat(client, message.content);
      } else if (message.type === 'function_call') {
        await handleFunctionCall(client, message.functionName, message.parameters, message.requestId);
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', payload: { error: 'Failed to process message' } }));
    }
  });

  ws.on('close', () => clients.delete(clientId));
});

async function handleChat(client: Client, content: string) {
  client.conversationHistory.push({ role: 'user', content });
  let responseText = genAI 
    ? (await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent(SYSTEM_PROMPT + '\n\nUser: ' + content)).response.text()
    : `I'm Maula, WAFManager AI. Configure your API key for full functionality. Your question: "${content}"`;
  
  client.conversationHistory.push({ role: 'assistant', content: responseText });
  client.ws.send(JSON.stringify({ type: 'response', payload: { messageId: uuidv4(), content: responseText } }));
}

async function handleFunctionCall(client: Client, functionName: string, parameters: Record<string, unknown>, requestId?: string) {
  try {
    const result = await executeWAFManagerFunction(functionName, parameters);
    client.ws.send(JSON.stringify({ type: 'function_result', requestId, payload: { functionName, success: true, data: result } }));
  } catch (error) {
    client.ws.send(JSON.stringify({ type: 'function_result', requestId, payload: { functionName, success: false, error: (error as Error).message } }));
  }
}

console.log(`[WAFManager AI] WebSocket server listening on port ${PORT}`);
export { wss };

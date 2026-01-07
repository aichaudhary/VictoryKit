/**
 * BotDefender AI Assistant - WebSocket Server
 * Tool #23 - AI-Powered Bot Detection & Mitigation
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { executeBotDefenderFunction } from './functions/botdefenderFunctions';

const PORT = process.env.AI_WS_PORT || 6023;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Client {
  id: string;
  ws: WebSocket;
  conversationHistory: Array<{ role: string; content: string }>;
}

const clients = new Map<string, Client>();
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `You are Maula, the AI assistant for BotDefender - an AI-powered bot detection and mitigation platform.

You help security teams:
- Detect and classify malicious bots
- Analyze browser fingerprints for automation
- Manage bot challenges (CAPTCHA, proof-of-work)
- Protect against credential stuffing and scraping
- Allow legitimate bots (search engines, monitoring)

You have access to 10 functions: detect_bots, analyze_fingerprint, analyze_behavior, configure_challenge, manage_botlist, protect_endpoint, detect_credential_stuffing, analyze_scraping, manage_good_bots, generate_report.

Provide expert guidance on bot detection and mitigation.`;

const wss = new WebSocketServer({ port: Number(PORT) });

wss.on('connection', (ws: WebSocket) => {
  const clientId = uuidv4();
  const client: Client = { id: clientId, ws, conversationHistory: [] };
  clients.set(clientId, client);

  ws.send(JSON.stringify({ type: 'connected', clientId, message: 'Connected to BotDefender AI' }));

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
    : `I'm Maula, BotDefender AI. Configure your API key for full functionality. Your question: "${content}"`;
  
  client.conversationHistory.push({ role: 'assistant', content: responseText });
  client.ws.send(JSON.stringify({ type: 'response', payload: { messageId: uuidv4(), content: responseText } }));
}

async function handleFunctionCall(client: Client, functionName: string, parameters: Record<string, unknown>, requestId?: string) {
  try {
    const result = await executeBotDefenderFunction(functionName, parameters);
    client.ws.send(JSON.stringify({ type: 'function_result', requestId, payload: { functionName, success: true, data: result } }));
  } catch (error) {
    client.ws.send(JSON.stringify({ type: 'function_result', requestId, payload: { functionName, success: false, error: (error as Error).message } }));
  }
}

console.log(`[BotDefender AI] WebSocket server listening on port ${PORT}`);
export { wss };

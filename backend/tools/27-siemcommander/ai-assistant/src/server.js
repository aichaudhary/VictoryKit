const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const { initializeAIProviders, processAIMessage } = require('./services/aiService');
const { executeSIEMFunction } = require('./services/functionExecutor');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/maula/ai' });

const PORT = process.env.SIEM_AI_PORT || 6027;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SIEMCommander AI Assistant', 
    port: PORT,
    websocket: 'active',
    path: '/maula/ai'
  });
});

// Initialize AI providers
initializeAIProviders();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔗 Neural Link established - SIEMCommander AI connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📥 Received:', data.type);

      switch (data.type) {
        case 'ai_message':
          await handleAIMessage(ws, data);
          break;
        
        case 'function_call':
          await handleFunctionCall(ws, data);
          break;
        
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        
        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Unknown message type' 
          }));
      }
    } catch (error) {
      console.error('❌ WebSocket error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: error.message 
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Neural Link disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Neural Link established. SIEMCommander AI ready. Multi-LLM capabilities online.',
    timestamp: Date.now()
  }));
});

// Handle AI message with streaming
async function handleAIMessage(ws, data) {
  const { message, provider = 'gemini', model, settings = {}, conversationHistory = [] } = data;

  try {
    // Send thinking indicator
    ws.send(JSON.stringify({ type: 'thinking', status: true }));

    // Process with selected AI provider
    const response = await processAIMessage({
      message,
      provider,
      model,
      settings,
      conversationHistory,
      toolConfig: {
        toolName: 'SIEMCommander',
        systemPrompt: settings.systemPrompt || 'You are SIEMCommander AI, an elite SOC expert.',
        functions: settings.functions || []
      },
      onToken: (token) => {
        // Stream tokens back to client
        ws.send(JSON.stringify({
          type: 'ai_token',
          token,
          provider
        }));
      },
      onFunctionCall: async (functionName, args) => {
        // Execute SIEM-specific function
        const result = await executeSIEMFunction(functionName, args);
        return result;
      }
    });

    // Send completion
    ws.send(JSON.stringify({
      type: 'ai_complete',
      message: response.message,
      provider,
      model: response.model,
      tokensUsed: response.tokensUsed,
      functionCalls: response.functionCalls || []
    }));

    ws.send(JSON.stringify({ type: 'thinking', status: false }));

  } catch (error) {
    console.error('AI processing error:', error);
    ws.send(JSON.stringify({
      type: 'ai_error',
      error: error.message
    }));
    ws.send(JSON.stringify({ type: 'thinking', status: false }));
  }
}

// Handle direct function calls
async function handleFunctionCall(ws, data) {
  const { functionName, parameters } = data;

  try {
    ws.send(JSON.stringify({ type: 'function_executing', functionName }));

    const result = await executeSIEMFunction(functionName, parameters);

    ws.send(JSON.stringify({
      type: 'function_result',
      functionName,
      result,
      timestamp: Date.now()
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'function_error',
      functionName,
      error: error.message
    }));
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`🤖 SIEMCommander AI Assistant running on port ${PORT}`);
  console.log(`🌐 WebSocket path: ws://localhost:${PORT}/maula/ai`);
  console.log(`💚 Multi-LLM providers: Gemini, Claude, GPT, Grok, Mistral, Llama`);
});

module.exports = server;

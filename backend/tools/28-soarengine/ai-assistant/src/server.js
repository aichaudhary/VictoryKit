const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const aiService = require('./services/aiService');
const functionExecutor = require('./services/functionExecutor');

const app = express();
const PORT = process.env.AI_PORT || 6028;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SOAREngine AI Assistant',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on /maula-ai path
const wss = new WebSocket.Server({
  server,
  path: '/maula-ai'
});

console.log('🤖 SOAREngine AI Assistant WebSocket server initializing...');

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`✅ New AI client connected from ${clientIp}`);

  let currentProvider = 'gemini'; // Default provider
  let conversationHistory = [];

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📩 Received message type: ${message.type}`);

      switch (message.type) {
        case 'chat':
          await handleChatMessage(ws, message, conversationHistory, currentProvider);
          break;

        case 'switchProvider':
          currentProvider = message.provider;
          ws.send(JSON.stringify({
            type: 'providerSwitched',
            provider: currentProvider,
            timestamp: new Date().toISOString()
          }));
          console.log(`🔄 Provider switched to: ${currentProvider}`);
          break;

        case 'functionCall':
          await handleFunctionCall(ws, message);
          break;

        case 'clearHistory':
          conversationHistory = [];
          ws.send(JSON.stringify({
            type: 'historyCleared',
            timestamp: new Date().toISOString()
          }));
          console.log('🧹 Conversation history cleared');
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Unknown message type',
            timestamp: new Date().toISOString()
          }));
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log(`❌ AI client disconnected from ${clientIp}`);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to SOAREngine AI Assistant',
    provider: currentProvider,
    timestamp: new Date().toISOString()
  }));
});

// Handle chat messages with streaming
async function handleChatMessage(ws, message, history, provider) {
  const { content, systemPrompt, functions } = message;

  // Add user message to history
  history.push({ role: 'user', content });

  try {
    // Send thinking indicator
    ws.send(JSON.stringify({
      type: 'thinking',
      timestamp: new Date().toISOString()
    }));

    // Get AI response with streaming
    let fullResponse = '';
    let functionCallData = null;

    await aiService.streamChatResponse(
      provider,
      content,
      systemPrompt,
      history,
      functions,
      (chunk) => {
        // Stream text chunks to client
        if (chunk.type === 'text') {
          fullResponse += chunk.content;
          ws.send(JSON.stringify({
            type: 'stream',
            content: chunk.content,
            timestamp: new Date().toISOString()
          }));
        } else if (chunk.type === 'functionCall') {
          functionCallData = chunk.data;
        }
      }
    );

    // If function call detected, execute it
    if (functionCallData) {
      console.log(`🔧 Function call detected: ${functionCallData.name}`);

      ws.send(JSON.stringify({
        type: 'functionCallStarted',
        function: functionCallData.name,
        arguments: functionCallData.arguments,
        timestamp: new Date().toISOString()
      }));

      try {
        const result = await functionExecutor.executeFunction(
          functionCallData.name,
          functionCallData.arguments
        );

        ws.send(JSON.stringify({
          type: 'functionCallCompleted',
          function: functionCallData.name,
          result,
          timestamp: new Date().toISOString()
        }));

        // Add function result to response
        fullResponse += `\n\n**Function executed:** ${functionCallData.name}\n**Result:** ${JSON.stringify(result, null, 2)}`;

      } catch (funcError) {
        console.error('❌ Function execution error:', funcError);
        ws.send(JSON.stringify({
          type: 'functionCallError',
          function: functionCallData.name,
          error: funcError.message,
          timestamp: new Date().toISOString()
        }));
      }
    }

    // Add assistant response to history
    history.push({ role: 'assistant', content: fullResponse });

    // Send completion message
    ws.send(JSON.stringify({
      type: 'complete',
      content: fullResponse,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('❌ AI Service error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

// Handle direct function calls
async function handleFunctionCall(ws, message) {
  const { functionName, arguments: args } = message;

  try {
    ws.send(JSON.stringify({
      type: 'functionCallStarted',
      function: functionName,
      arguments: args,
      timestamp: new Date().toISOString()
    }));

    const result = await functionExecutor.executeFunction(functionName, args);

    ws.send(JSON.stringify({
      type: 'functionCallCompleted',
      function: functionName,
      result,
      timestamp: new Date().toISOString()
    }));

  } catch (error) {
    console.error('❌ Function call error:', error);
    ws.send(JSON.stringify({
      type: 'functionCallError',
      function: functionName,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`🤖 SOAREngine AI Assistant running on port ${PORT}`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}/maula-ai`);
  console.log(`📡 HTTP Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing WebSocket server...');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

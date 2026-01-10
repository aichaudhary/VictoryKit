const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const aiService = require('./aiService');
const functionExecutor = require('./functionExecutor');

const PORT = process.env.AI_PORT || 6029;
const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

// Store active connections
const clients = new Map();

wss.on('connection', (ws, request) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sessionId = `session_${Date.now()}`;
  
  clients.set(clientId, { ws, sessionId, conversationHistory: [] });
  
  console.log(`✅ New client connected: ${clientId} (${clients.size} total)`);
  
  ws.send(JSON.stringify({
    type: 'connection_established',
    clientId,
    sessionId,
    timestamp: new Date().toISOString(),
    message: 'Connected to BehaviorAnalytics Assistant - AI-Powered Enterprise Risk Assessment'
  }));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      const client = clients.get(clientId);
      
      console.log(`📨 Message from ${clientId}:`, data.type || data.action);
      
      if (data.type === 'chat_message') {
        await handleChatMessage(ws, client, data);
      } else if (data.type === 'function_call') {
        await handleFunctionCall(ws, client, data);
      } else if (data.type === 'stream_request') {
        await handleStreamRequest(ws, client, data);
      }
      
    } catch (error) {
      console.error('Message handling error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`❌ Client disconnected: ${clientId} (${clients.size} remaining)`);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
    clients.delete(clientId);
  });
});

async function handleChatMessage(ws, client, data) {
  const { message, provider, model, stream } = data;
  
  // Add user message to history
  client.conversationHistory.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  
  // Send acknowledgment
  ws.send(JSON.stringify({
    type: 'message_received',
    timestamp: new Date().toISOString()
  }));
  
  try {
    if (stream) {
      // Streaming response
      ws.send(JSON.stringify({
        type: 'stream_start',
        timestamp: new Date().toISOString()
      }));
      
      let fullResponse = '';
      
      await aiService.streamChat(
        message,
        client.conversationHistory.slice(0, -1), // Exclude current message
        provider || 'gemini',
        model,
        (chunk) => {
          fullResponse += chunk;
          ws.send(JSON.stringify({
            type: 'stream_chunk',
            content: chunk,
            timestamp: new Date().toISOString()
          }));
        }
      );
      
      ws.send(JSON.stringify({
        type: 'stream_end',
        fullResponse,
        timestamp: new Date().toISOString()
      }));
      
      // Add assistant response to history
      client.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString()
      });
      
    } else {
      // Non-streaming response
      const response = await aiService.chat(
        message,
        client.conversationHistory.slice(0, -1),
        provider || 'gemini',
        model
      );
      
      ws.send(JSON.stringify({
        type: 'chat_response',
        content: response,
        timestamp: new Date().toISOString()
      }));
      
      client.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function handleFunctionCall(ws, client, data) {
  const { function_name, parameters } = data;
  
  try {
    ws.send(JSON.stringify({
      type: 'function_executing',
      function_name,
      timestamp: new Date().toISOString()
    }));
    
    const result = await functionExecutor.execute(function_name, parameters);
    
    ws.send(JSON.stringify({
      type: 'function_result',
      function_name,
      result,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Function execution error:', error);
    ws.send(JSON.stringify({
      type: 'function_error',
      function_name,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function handleStreamRequest(ws, client, data) {
  const { prompt, provider, model } = data;
  
  try {
    ws.send(JSON.stringify({
      type: 'stream_start',
      timestamp: new Date().toISOString()
    }));
    
    let fullResponse = '';
    
    await aiService.streamChat(
      prompt,
      [],
      provider || 'gemini',
      model,
      (chunk) => {
        fullResponse += chunk;
        ws.send(JSON.stringify({
          type: 'stream_chunk',
          content: chunk,
          timestamp: new Date().toISOString()
        }));
      }
    );
    
    ws.send(JSON.stringify({
      type: 'stream_end',
      fullResponse,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Stream error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

// HTTP upgrade handling
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  
  if (pathname === '/maula/ai') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'behavioranalytics-ai-assistant',
      clients: clients.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 BehaviorAnalytics AI Assistant running on port ${PORT}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/maula/ai`);
  console.log(`🧠 Multi-LLM: Gemini 1.5 Pro | Claude 3.5 Sonnet | GPT-4 Turbo | xAI Grok`);
  console.log(`📊 Risk Assessment Functions: 10 specialized tools`);
  console.log(`🔴🟡🟢 Risk Frameworks: NIST, ISO 27001, FAIR`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing connections...');
  clients.forEach((client, id) => {
    client.ws.close();
  });
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

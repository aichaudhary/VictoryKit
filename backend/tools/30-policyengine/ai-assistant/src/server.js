const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const AIService = require('./services/aiService');
const FunctionExecutor = require('./services/functionExecutor');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/maula/ai' });

const PORT = process.env.AI_PORT || 6030;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'PolicyEngine AI Assistant',
    status: 'healthy',
    port: PORT,
    websocket: '/maula/ai'
  });
});

// AI Service and Function Executor
const aiService = new AIService();
const functionExecutor = new FunctionExecutor();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection from:', req.socket.remoteAddress);
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;
      
      if (type === 'ai_request') {
        const { query, context, session_id, function_name, parameters } = payload;
        
        // Send acknowledgement
        ws.send(JSON.stringify({
          type: 'ai_processing',
          payload: {
            message: 'Processing your request...',
            sessionId: session_id
          }
        }));
        
        // Handle function calls
        if (function_name) {
          const functionResult = await functionExecutor.execute(function_name, parameters);
          
          ws.send(JSON.stringify({
            type: 'function_result',
            payload: {
              functionName: function_name,
              result: functionResult,
              sessionId: session_id
            }
          }));
        }
        
        // Generate AI response with streaming
        await aiService.generateResponse(
          query,
          context,
          (chunk) => {
            ws.send(JSON.stringify({
              type: 'ai_stream',
              payload: {
                chunk,
                sessionId: session_id
              }
            }));
          },
          () => {
            ws.send(JSON.stringify({
              type: 'ai_complete',
              payload: {
                sessionId: session_id,
                message: 'Response complete'
              }
            }));
          }
        );
      }
      
      if (type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: Date.now() } }));
      }
      
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          error: error.message,
          timestamp: Date.now()
        }
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    payload: {
      message: 'Connected to PolicyEngine AI Assistant',
      timestamp: Date.now(),
      capabilities: [
        'create_policy',
        'analyze_policy',
        'map_policy_to_controls',
        'check_policy_compliance',
        'generate_policy_documentation',
        'manage_policy_exception',
        'create_policy_as_code',
        'compare_policies',
        'assess_policy_effectiveness',
        'recommend_policy_updates'
      ]
    }
  }));
});

server.listen(PORT, () => {
  console.log(`PolicyEngine AI Assistant running on port ${PORT}`);
  console.log(`WebSocket server running at ws://localhost:${PORT}/maula/ai`);
});

module.exports = { app, server, wss };

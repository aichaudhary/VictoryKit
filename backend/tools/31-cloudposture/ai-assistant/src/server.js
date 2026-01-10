const WebSocket = require('ws');
const http = require('http');
const { executeFunctions } = require('./functionExecutor');
const { initializeAI } = require('./aiService');

const PORT = process.env.WS_PORT || 6031;
const server = http.createServer();
const wss = new WebSocket.Server({ server, path: '/maula/ai' });

const aiService = initializeAI();

wss.on('connection', (ws) => {
  console.log('🔗 New audit AI connection');
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to CloudPosture AI Assistant',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'function_call') {
        // Function execution mode
        const result = await executeFunctions(message.functions);
        
        ws.send(JSON.stringify({
          type: 'function_result',
          requestId: message.requestId,
          results: result,
          timestamp: new Date().toISOString()
        }));
      } else if (message.type === 'chat') {
        // AI conversation mode
        ws.send(JSON.stringify({
          type: 'stream_start',
          requestId: message.requestId,
          timestamp: new Date().toISOString()
        }));
        
        await aiService.streamResponse(message.query, message.context, (chunk) => {
          ws.send(JSON.stringify({
            type: 'stream_chunk',
            requestId: message.requestId,
            chunk: chunk,
            timestamp: new Date().toISOString()
          }));
        });
        
        ws.send(JSON.stringify({
          type: 'stream_end',
          requestId: message.requestId,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('❌ WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Audit AI connection closed');
  });
});

server.listen(PORT, () => {
  console.log(`🤖 CloudPosture AI Assistant running on port ${PORT} at /maula/ai`);
});

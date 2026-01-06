require('dotenv').config();
const WebSocket = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { executeFunctionCall } = require('./functionExecutor');

const PORT = process.env.AI_PORT || 6033;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt for PasswordVault AI
const SYSTEM_PROMPT = `You are PasswordVault AI, an expert in enterprise password and secrets management with deep knowledge of cryptography, secure storage, access control, and credential lifecycle management.

Your core capabilities:
1. Generate strong, unique passwords using cryptographically secure methods
2. Organize and manage secrets in vaults with proper categorization
3. Assess password strength and identify security vulnerabilities
4. Implement secure sharing with role-based access control
5. Rotate credentials on schedule and detect compromised passwords
6. Audit access patterns and detect suspicious activity
7. Comply with security policies (NIST SP 800-63, SOC2, ISO 27001, PCI-DSS, HIPAA)
8. Configure encryption settings (AES-256-GCM, ChaCha20-Poly1305)
9. Manage team access and permissions with RBAC
10. Recover accounts and implement emergency access procedures

Security Best Practices:
- Never display actual passwords in plain text
- Use cryptographically secure random generation
- Recommend minimum 12-character passwords with complexity
- Enforce password rotation policies
- Implement zero-knowledge architecture where possible
- Monitor for breached credentials using hash-based detection
- Require MFA for sensitive operations

When helping users:
- Explain encryption and security concepts in clear language
- Provide actionable recommendations for improving security posture
- Guide through vault organization and categorization
- Help configure appropriate access controls and sharing
- Assist with compliance requirements and audits

You have access to functions that allow you to interact with the PasswordVault system. Use them to provide real-time assistance.`;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT, path: '/maula-ai' });

console.log(`PasswordVault AI Assistant WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected to PasswordVault AI');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { type, content, conversationHistory = [] } = data;
      
      if (type === 'chat') {
        await handleChatMessage(ws, content, conversationHistory);
      } else if (type === 'function_result') {
        // Handle function execution results
        ws.send(JSON.stringify({
          type: 'function_complete',
          result: data.result
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from PasswordVault AI');
  });
});

async function handleChatMessage(ws, userMessage, conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: SYSTEM_PROMPT
    });
    
    // Build chat history
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const chat = model.startChat({ history });
    
    // Stream the response
    const result = await chat.sendMessageStream(userMessage);
    
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      
      ws.send(JSON.stringify({
        type: 'stream',
        content: text
      }));
    }
    
    // Check for function calls in response
    const functionCalls = extractFunctionCalls(fullResponse);
    
    if (functionCalls.length > 0) {
      for (const funcCall of functionCalls) {
        ws.send(JSON.stringify({
          type: 'function_call',
          function: funcCall.name,
          parameters: funcCall.parameters
        }));
        
        // Execute function
        const result = await executeFunctionCall(funcCall.name, funcCall.parameters);
        
        ws.send(JSON.stringify({
          type: 'function_result',
          function: funcCall.name,
          result
        }));
      }
    }
    
    ws.send(JSON.stringify({
      type: 'complete',
      content: fullResponse
    }));
    
  } catch (error) {
    console.error('Chat error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: error.message
    }));
  }
}

function extractFunctionCalls(response) {
  const functionCalls = [];
  const functionPattern = /\[FUNCTION:(\w+)\((.*?)\)\]/g;
  let match;
  
  while ((match = functionPattern.exec(response)) !== null) {
    try {
      const params = match[2] ? JSON.parse(`{${match[2]}}`) : {};
      functionCalls.push({
        name: match[1],
        parameters: params
      });
    } catch (e) {
      console.error('Error parsing function call:', e);
    }
  }
  
  return functionCalls;
}

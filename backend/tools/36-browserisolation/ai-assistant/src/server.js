/**
 * BrowserIsolation AI Assistant Server
 * Provides real-time AI assistance for web content filtering and URL security
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSocketServer } from 'ws';
import { executeBrowserIsolationFunction } from './functionExecutor.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 6036;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Gemini 1.5 Pro model
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

// BrowserIsolation AI function declarations
const functions = [
  {
    name: 'analyze_url_safety',
    description: 'Comprehensive URL safety analysis including reputation, category classification, and threat detection',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to analyze' },
        checkRedirects: { type: 'boolean', description: 'Follow redirect chain' },
        deepScan: { type: 'boolean', description: 'Perform deep content analysis' }
      },
      required: ['url']
    }
  },
  {
    name: 'classify_website_content',
    description: 'Classify website content into categories (adult, gambling, malware, social media, etc.)',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Website URL to classify' },
        analyzeSubdomains: { type: 'boolean', description: 'Include subdomain analysis' }
      },
      required: ['url']
    }
  },
  {
    name: 'detect_malicious_content',
    description: 'Detect malicious content including malware, phishing, and exploit kits',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to scan for malicious content' },
        includeScreenshot: { type: 'boolean', description: 'Capture screenshot for analysis' }
      },
      required: ['url']
    }
  },
  {
    name: 'analyze_ssl_certificate',
    description: 'Analyze SSL/TLS certificate validity, issuer, and security configuration',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to check SSL certificate' },
        checkChain: { type: 'boolean', description: 'Validate complete certificate chain' }
      },
      required: ['domain']
    }
  },
  {
    name: 'generate_policy_recommendation',
    description: 'Generate web filtering policy recommendations based on organization needs',
    parameters: {
      type: 'object',
      properties: {
        organizationType: { type: 'string', description: 'Type of organization (school, enterprise, government)' },
        riskTolerance: { type: 'string', description: 'Risk tolerance level (low, medium, high)' },
        userCount: { type: 'number', description: 'Number of users' }
      },
      required: ['organizationType', 'riskTolerance']
    }
  },
  {
    name: 'analyze_bandwidth_usage',
    description: 'Analyze bandwidth usage patterns and identify optimization opportunities',
    parameters: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: 'Time range for analysis (hour, day, week, month)' },
        groupBy: { type: 'string', description: 'Group by user, department, or category' }
      },
      required: ['timeRange']
    }
  },
  {
    name: 'detect_data_leakage',
    description: 'Detect potential data leakage attempts through web traffic',
    parameters: {
      type: 'object',
      properties: {
        trafficData: { type: 'object', description: 'Traffic data to analyze' },
        sensitivity: { type: 'string', description: 'Detection sensitivity (low, medium, high)' }
      },
      required: ['trafficData']
    }
  },
  {
    name: 'analyze_user_behavior',
    description: 'Analyze user browsing behavior patterns and detect anomalies',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID to analyze' },
        timeWindow: { type: 'string', description: 'Time window for analysis' },
        includeBaseline: { type: 'boolean', description: 'Compare against baseline behavior' }
      },
      required: ['userId', 'timeWindow']
    }
  },
  {
    name: 'generate_compliance_report',
    description: 'Generate compliance report for regulatory requirements (CIPA, COPPA, GDPR)',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', description: 'Type of compliance report' },
        startDate: { type: 'string', description: 'Report start date' },
        endDate: { type: 'string', description: 'Report end date' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  },
  {
    name: 'analyze_threat_intelligence',
    description: 'Analyze threat intelligence feeds and update filtering rules',
    parameters: {
      type: 'object',
      properties: {
        feedSource: { type: 'string', description: 'Threat intelligence feed source' },
        autoUpdate: { type: 'boolean', description: 'Automatically update filtering rules' }
      },
      required: ['feedSource']
    }
  }
];

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`🛡️ BrowserIsolation AI Assistant running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to BrowserIsolation AI');
  
  // Initialize chat session
  const chat = model.startChat({
    tools: [{ functionDeclarations: functions }],
    history: []
  });

  ws.on('message', async (message) => {
    try {
      const { type, content, functionName, parameters } = JSON.parse(message);

      if (type === 'function_call') {
        // Direct function execution
        console.log(`⚡ Executing function: ${functionName}`);
        const result = await executeBrowserIsolationFunction(functionName, parameters);
        
        ws.send(JSON.stringify({
          type: 'function_result',
          functionName,
          result
        }));
      } else {
        // AI chat with function calling
        console.log(`💬 Processing message: ${content.substring(0, 50)}...`);
        
        const result = await chat.sendMessage(content);
        const response = result.response;

        // Check if model wants to call a function
        const functionCall = response.functionCalls()?.[0];
        
        if (functionCall) {
          console.log(`🔧 AI requested function: ${functionCall.name}`);
          
          // Execute the function
          const functionResult = await executeBrowserIsolationFunction(
            functionCall.name,
            functionCall.args
          );

          // Send function result back to model
          const functionResponse = await chat.sendMessage([{
            functionResponse: {
              name: functionCall.name,
              response: functionResult
            }
          }]);

          ws.send(JSON.stringify({
            type: 'ai_response',
            content: functionResponse.response.text(),
            functionCalled: functionCall.name,
            functionResult
          }));
        } else {
          // Regular AI response
          ws.send(JSON.stringify({
            type: 'ai_response',
            content: response.text()
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('👋 Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to BrowserIsolation AI Assistant',
    availableFunctions: functions.map(f => f.name)
  }));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down BrowserIsolation AI Assistant...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

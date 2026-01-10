/**
 * DNSShield AI Assistant Server
 * Provides real-time AI assistance for DNS security and threat intelligence
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSocketServer } from 'ws';
import { executeDNSShieldFunction } from './functionExecutor.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 6037;
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

// DNSShield AI function declarations
const functions = [
  {
    name: 'analyze_dns_query',
    description: 'Comprehensive DNS query analysis including threat detection, reputation scoring, and category classification',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name to analyze' },
        queryType: { type: 'string', description: 'DNS query type (A, AAAA, MX, etc.)' },
        clientIP: { type: 'string', description: 'Client IP address making the query' },
        includeHistory: { type: 'boolean', description: 'Include historical query data' }
      },
      required: ['domain']
    }
  },
  {
    name: 'detect_dns_tunneling',
    description: 'Detect DNS tunneling attempts used for data exfiltration or C2 communication',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to analyze for tunneling' },
        queryPattern: { type: 'object', description: 'Query pattern data' },
        sensitivity: { type: 'string', description: 'Detection sensitivity (low, medium, high)' }
      },
      required: ['domain', 'queryPattern']
    }
  },
  {
    name: 'classify_domain_threat',
    description: 'Classify domain threat level and categorize based on multiple threat intelligence sources',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to classify' },
        checkSubdomains: { type: 'boolean', description: 'Include subdomain analysis' },
        deepAnalysis: { type: 'boolean', description: 'Perform deep threat analysis' }
      },
      required: ['domain']
    }
  },
  {
    name: 'analyze_dnssec_status',
    description: 'Validate DNSSEC signatures and analyze DNS security configuration',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to validate' },
        verifyChain: { type: 'boolean', description: 'Verify complete trust chain' },
        checkAlgorithms: { type: 'boolean', description: 'Check cryptographic algorithms' }
      },
      required: ['domain']
    }
  },
  {
    name: 'generate_blocking_policy',
    description: 'Generate intelligent DNS blocking policies based on threat patterns and organization requirements',
    parameters: {
      type: 'object',
      properties: {
        organizationType: { type: 'string', description: 'Organization type (enterprise, school, isp)' },
        threatCategories: { type: 'array', items: { type: 'string' }, description: 'Threat categories to block' },
        customRules: { type: 'array', description: 'Custom blocking rules' }
      },
      required: ['organizationType', 'threatCategories']
    }
  },
  {
    name: 'analyze_query_patterns',
    description: 'Analyze DNS query patterns to identify anomalies, trends, and potential security issues',
    parameters: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: 'Time range for analysis (hour, day, week, month)' },
        clientFilter: { type: 'string', description: 'Filter by client IP or network' },
        includeBaseline: { type: 'boolean', description: 'Compare against baseline patterns' }
      },
      required: ['timeRange']
    }
  },
  {
    name: 'detect_dga_domains',
    description: 'Detect Domain Generation Algorithm (DGA) domains used by malware for C2 communication',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to analyze for DGA patterns' },
        algorithmChecks: { type: 'array', items: { type: 'string' }, description: 'Specific DGA algorithms to check' },
        confidence: { type: 'number', description: 'Minimum confidence threshold (0-1)' }
      },
      required: ['domain']
    }
  },
  {
    name: 'analyze_cache_performance',
    description: 'Analyze DNS cache performance, hit rates, and optimization opportunities',
    parameters: {
      type: 'object',
      properties: {
        timeWindow: { type: 'string', description: 'Time window for analysis' },
        includeRecommendations: { type: 'boolean', description: 'Include optimization recommendations' }
      },
      required: ['timeWindow']
    }
  },
  {
    name: 'generate_threat_report',
    description: 'Generate comprehensive threat intelligence report with blocked queries, trends, and recommendations',
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', description: 'Type of report (daily, weekly, monthly, custom)' },
        startDate: { type: 'string', description: 'Report start date' },
        endDate: { type: 'string', description: 'Report end date' },
        includeGraphs: { type: 'boolean', description: 'Include graphical data' }
      },
      required: ['reportType', 'startDate', 'endDate']
    }
  },
  {
    name: 'optimize_resolver_config',
    description: 'Analyze and recommend DNS resolver configuration optimizations for performance and security',
    parameters: {
      type: 'object',
      properties: {
        currentConfig: { type: 'object', description: 'Current resolver configuration' },
        trafficProfile: { type: 'object', description: 'DNS traffic profile data' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Optimization goals (performance, security, privacy)' }
      },
      required: ['currentConfig', 'trafficProfile']
    }
  }
];

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`🛡️ DNSShield AI Assistant running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to DNSShield AI');
  
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
        const result = await executeDNSShieldFunction(functionName, parameters);
        
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
          const functionResult = await executeDNSShieldFunction(
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
    message: 'Connected to DNSShield AI Assistant',
    availableFunctions: functions.map(f => f.name)
  }));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down DNSShield AI Assistant...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

/**
 * PrivilegeGuard AI Assistant
 * WebSocket Server for Real-time AI-Powered Cryptographic Guidance
 * Port: 6015
 *
 * Features:
 * - Claude Opus/Sonnet 4.5 integration for intelligent vault and crypto recommendations
 * - Real-time vault architecture suggestions
 * - Key security analysis and cryptographic policy advice
 * - Compliance auditing and automated key lifecycle management
 * - Multi-LLM fallback (Claude, Gemini, GPT-4)
 */

import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import crypto from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.AI_PORT || 6015;
const wss = new WebSocket.Server({ port: Number(PORT) });

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Connection tracking
const connections = new Map<string, WebSocket>();
const sessions = new Map<string, any>();

interface VaultQuery {
  type: 'vault_design' | 'key_analysis' | 'crypto_recommendation' | 'security_policy' | 'compliance_check' | 'lifecycle_management';
  data: any;
  context?: any;
}

interface AIResponse {
  id: string;
  type: string;
  content: string;
  suggestions?: any[];
  confidence?: number;
  timestamp: string;
}

console.log(`🔐 PrivilegeGuard AI Assistant started on port ${PORT}`);
console.log('🤖 Claude Opus/Sonnet 4.5 ready for cryptographic intelligence');

wss.on('connection', (ws: WebSocket) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);

  console.log(`🔗 New connection: ${connectionId}`);

  // Send welcome message
  const welcomeMessage: AIResponse = {
    id: uuidv4(),
    type: 'welcome',
    content: 'Welcome to PrivilegeGuard AI Assistant. I can help you with vault design, key management, cryptographic operations, and security policies.',
    suggestions: [
      'Design optimal vault architecture',
      'Analyze key security strength',
      'Recommend cryptographic algorithms',
      'Check compliance requirements',
      'Manage key lifecycle policies'
    ],
    timestamp: new Date().toISOString()
  };

  ws.send(JSON.stringify(welcomeMessage));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Message from ${connectionId}:`, message);

      const response = await handleVaultQuery(message, connectionId);
      ws.send(JSON.stringify(response));

    } catch (error) {
      console.error('❌ Error processing message:', error);
      const errorResponse: AIResponse = {
        id: uuidv4(),
        type: 'error',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(errorResponse));
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Connection closed: ${connectionId}`);
    connections.delete(connectionId);
    sessions.delete(connectionId);
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${connectionId}:`, error);
  });
});

async function handleVaultQuery(query: VaultQuery, connectionId: string): Promise<AIResponse> {
  const { type, data, context } = query;

  switch (type) {
    case 'vault_design':
      return await designVaultArchitecture(data, context);

    case 'key_analysis':
      return await analyzeKeySecurity(data, context);

    case 'crypto_recommendation':
      return await recommendCryptographicAlgorithm(data, context);

    case 'security_policy':
      return await getSecurityPolicyAdvice(data, context);

    case 'compliance_check':
      return await checkCryptoCompliance(data, context);

    case 'lifecycle_management':
      return await manageKeyLifecycle(data, context);

    default:
      return {
        id: uuidv4(),
        type: 'unknown',
        content: 'I\'m not sure how to help with that. Try asking about vault design, key management, or cryptographic security.',
        timestamp: new Date().toISOString()
      };
  }
}

async function designVaultArchitecture(data: any, context?: any): Promise<AIResponse> {
  const prompt = `As an expert in cryptographic key management and vault architecture, design an optimal vault structure for the following requirements:

Organization size: ${data.orgSize || 'medium'}
Security requirements: ${data.securityLevel || 'high'}
Compliance needs: ${data.compliance || 'GDPR, ISO 27001'}
Key types: ${data.keyTypes || 'encryption, signing, authentication'}
Scalability needs: ${data.scalability || 'moderate growth'}
Budget constraints: ${data.budget || 'enterprise'}

Provide a detailed vault architecture including:
1. Recommended vault types and hierarchy
2. Key separation and isolation strategies
3. Access control and permission models
4. Backup and disaster recovery plans
5. Monitoring and audit requirements
6. Cost-benefit analysis

Focus on security best practices and operational efficiency.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1200,
      temperature: 0.3,
      system: 'You are a world-class cryptography architect providing comprehensive vault design recommendations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'vault_design',
      content: content,
      suggestions: parseVaultSuggestions(content),
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.warn('Claude API failed, trying Gemini:', error);
    try {
      const result = await geminiModel.generateContent(prompt);
      const content = result.response.text();

      return {
        id: uuidv4(),
        type: 'vault_design',
        content: content,
        suggestions: parseVaultSuggestions(content),
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
    } catch (geminiError) {
      console.warn('Gemini API failed, trying OpenAI:', geminiError);
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
        temperature: 0.3
      });

      const content = completion.choices[0].message.content || '';

      return {
        id: uuidv4(),
        type: 'vault_design',
        content: content,
        suggestions: parseVaultSuggestions(content),
        confidence: 0.80,
        timestamp: new Date().toISOString()
      };
    }
  }
}

async function analyzeKeySecurity(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Analyze the security posture of the following cryptographic key configuration:

Key algorithm: ${data.algorithm}
Key size: ${data.keySize} bits
Usage context: ${data.usage || 'general cryptographic operations'}
Storage method: ${data.storage || 'software-based'}
Rotation frequency: ${data.rotation || 'manual'}
Access controls: ${data.accessControl || 'role-based'}

Provide a comprehensive security assessment including:
1. Current security strength rating
2. Identified vulnerabilities or weaknesses
3. Recommended improvements
4. Quantum resistance evaluation
5. Compliance alignment
6. Risk mitigation strategies

Be specific about any security concerns and provide actionable recommendations.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 900,
      temperature: 0.2,
      system: 'You are a cryptographic security auditor providing detailed key security analysis.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'key_analysis',
      content: content,
      suggestions: parseKeySecuritySuggestions(content),
      confidence: 0.98,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'key_analysis',
      content: 'Key security analysis temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function recommendCryptographicAlgorithm(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Recommend the most appropriate cryptographic algorithm for:

Use case: ${data.useCase || 'data encryption'}
Security requirements: ${data.securityLevel || 'high'}
Performance constraints: ${data.performance || 'balanced'}
Platform compatibility: ${data.platform || 'cross-platform'}
Future-proofing: ${data.futureProof || '5-10 years'}
Compliance requirements: ${data.compliance || 'general security standards'}

Provide detailed recommendations including:
1. Primary algorithm recommendation with justification
2. Alternative algorithms for different scenarios
3. Key sizes and parameter choices
4. Implementation considerations
5. Migration strategies if applicable
6. Security lifetime estimates

Focus on current best practices and emerging standards.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      system: 'You are a cryptography expert providing algorithm selection guidance.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'crypto_recommendation',
      content: content,
      suggestions: parseAlgorithmSuggestions(content),
      confidence: 0.96,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'crypto_recommendation',
      content: 'Cryptographic recommendation temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function getSecurityPolicyAdvice(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Develop comprehensive security policies for cryptographic key management:

Organization type: ${data.orgType || 'enterprise'}
Industry sector: ${data.industry || 'technology'}
Regulatory requirements: ${data.regulations || 'GDPR, SOX'}
Current maturity level: ${data.maturity || 'intermediate'}
Risk tolerance: ${data.riskTolerance || 'low'}

Create policies covering:
1. Key generation and distribution procedures
2. Storage and protection requirements
3. Usage and access control policies
4. Rotation and retirement schedules
5. Incident response and breach notification
6. Audit and monitoring requirements
7. Training and awareness programs

Ensure policies are practical, enforceable, and aligned with industry standards.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1300,
      temperature: 0.4,
      system: 'You are a security policy expert specializing in cryptographic governance.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'security_policy',
      content: content,
      suggestions: parsePolicySuggestions(content),
      confidence: 0.92,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'security_policy',
      content: 'Security policy advice temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function checkCryptoCompliance(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Assess cryptographic compliance for the following implementation:

Standards: ${data.standards || 'FIPS 140-3, PCI DSS, GDPR'}
Current implementation: ${data.implementation || 'standard cryptographic practices'}
Identified gaps: ${data.gaps || 'none specified'}
Audit findings: ${data.auditFindings || 'none'}

Provide a comprehensive compliance assessment including:
1. Compliance status for each applicable standard
2. Detailed gap analysis with specific findings
3. Remediation recommendations with priorities
4. Implementation timelines
5. Documentation and evidence requirements
6. Ongoing compliance monitoring strategies

Be thorough and provide specific, actionable guidance.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1100,
      temperature: 0.3,
      system: 'You are a compliance auditor specializing in cryptographic standards and regulations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'compliance_check',
      content: content,
      suggestions: parseComplianceSuggestions(content),
      confidence: 0.97,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'compliance_check',
      content: 'Compliance check temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function manageKeyLifecycle(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Design a key lifecycle management strategy for:

Key ecosystem: ${data.ecosystem || 'enterprise-wide'}
Key types: ${data.keyTypes || 'multiple types'}
Operational scale: ${data.scale || 'large enterprise'}
Automation level: ${data.automation || 'semi-automated'}
Business continuity requirements: ${data.continuity || 'high availability'}

Develop a comprehensive lifecycle management plan including:
1. Key generation and provisioning procedures
2. Usage monitoring and alerting thresholds
3. Rotation schedules and procedures
4. Retirement and destruction processes
5. Emergency key recovery procedures
6. Audit and reporting requirements
7. Integration with existing systems

Focus on operational efficiency, security, and compliance.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      system: 'You are a key lifecycle management expert providing strategic guidance.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'lifecycle_management',
      content: content,
      suggestions: parseLifecycleSuggestions(content),
      confidence: 0.94,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'lifecycle_management',
      content: 'Lifecycle management advice temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

// Helper functions to parse AI responses into structured suggestions
function parseVaultSuggestions(content: string): any[] {
  const suggestions = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.toLowerCase().includes('vault') || line.toLowerCase().includes('hierarchy')) {
      suggestions.push({
        type: 'architecture',
        value: line.trim(),
        priority: 'high'
      });
    }
  }

  return suggestions.slice(0, 3);
}

function parseKeySecuritySuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('rotate')) {
    suggestions.push({ type: 'rotation', action: 'implement', priority: 'high' });
  }
  if (content.toLowerCase().includes('access control')) {
    suggestions.push({ type: 'access', action: 'strengthen', priority: 'high' });
  }
  return suggestions;
}

function parseAlgorithmSuggestions(content: string): any[] {
  const suggestions = [];
  const algorithms = ['AES', 'RSA', 'ECC', 'ChaCha20', 'Ed25519'];
  for (const algo of algorithms) {
    if (content.includes(algo)) {
      suggestions.push({
        type: 'algorithm',
        value: algo,
        priority: 'high'
      });
    }
  }
  return suggestions.slice(0, 3);
}

function parsePolicySuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('rotation')) {
    suggestions.push({ type: 'policy', category: 'rotation', priority: 'high' });
  }
  if (content.toLowerCase().includes('access')) {
    suggestions.push({ type: 'policy', category: 'access', priority: 'high' });
  }
  return suggestions;
}

function parseComplianceSuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('gap')) {
    suggestions.push({ type: 'compliance', action: 'address_gaps', priority: 'high' });
  }
  return suggestions;
}

function parseLifecycleSuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('automate')) {
    suggestions.push({ type: 'lifecycle', method: 'automation', priority: 'high' });
  }
  return suggestions;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down PrivilegeGuard AI Assistant...');
  wss.close(() => {
    console.log('✅ AI Assistant stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down PrivilegeGuard AI Assistant...');
  wss.close(() => {
    console.log('✅ AI Assistant stopped');
    process.exit(0);
  });
});
      await handleMessage(ws, clientId, message);
    } catch (error) {
      logger.error(`Error handling message from ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message',
        timestamp: new Date().toISOString(),
      }));
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    clients.delete(clientId);
    logger.info(`Client disconnected: ${clientId}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error for ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Message handler
async function handleMessage(ws: WebSocket, clientId: string, message: any) {
  const { type, provider, content, conversationId, tools } = message;

  switch (type) {
    case 'chat':
      await handleChatMessage(ws, clientId, {
        provider: provider || 'gemini',
        content,
        conversationId: conversationId || uuidv4(),
        tools: tools !== false, // Enable tools by default
      });
      break;

    case 'function_call':
      await handleFunctionCall(ws, clientId, message);
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;

    case 'switch_provider':
      ws.send(JSON.stringify({
        type: 'provider_switched',
        provider: message.provider,
        timestamp: new Date().toISOString(),
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${type}`,
        timestamp: new Date().toISOString(),
      }));
  }
}

// Chat message handler
async function handleChatMessage(
  ws: WebSocket,
  clientId: string,
  options: { provider: string; content: string; conversationId: string; tools: boolean }
) {
  const { provider, content, conversationId, tools } = options;

  // Send typing indicator
  ws.send(JSON.stringify({
    type: 'typing',
    conversationId,
    timestamp: new Date().toISOString(),
  }));

  try {
    // Get tool definitions if enabled
    const toolDefs = tools ? fraudFunctions.getToolDefinitions() : undefined;

    // Stream response from LLM
    const stream = await llmRouter.streamChat(provider, content, {
      conversationId,
      tools: toolDefs,
      systemPrompt: getSystemPrompt(),
    });

    let fullResponse = '';
    let functionCalls: any[] = [];

    for await (const chunk of stream) {
      if (chunk.type === 'text') {
        fullResponse += chunk.content;
        ws.send(JSON.stringify({
          type: 'chunk',
          content: chunk.content,
          conversationId,
          timestamp: new Date().toISOString(),
        }));
      } else if (chunk.type === 'function_call') {
        functionCalls.push(chunk.functionCall);
      }
    }

    // Handle function calls
    if (functionCalls.length > 0) {
      for (const call of functionCalls) {
        const result = await fraudFunctions.execute(call.name, call.arguments);
        ws.send(JSON.stringify({
          type: 'function_result',
          name: call.name,
          result,
          conversationId,
          timestamp: new Date().toISOString(),
        }));
      }
    }

    // Send completion
    ws.send(JSON.stringify({
      type: 'complete',
      content: fullResponse,
      conversationId,
      provider,
      timestamp: new Date().toISOString(),
    }));

  } catch (error) {
    logger.error(`Chat error for ${clientId}:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Chat processing failed',
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  }
}

// Function call handler
async function handleFunctionCall(ws: WebSocket, clientId: string, message: any) {
  const { name, arguments: args, conversationId } = message;

  try {
    const result = await fraudFunctions.execute(name, args);
    ws.send(JSON.stringify({
      type: 'function_result',
      name,
      result,
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: `Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  }
}

// System prompt for fraud detection assistant
function getSystemPrompt(): string {
  return `You are FraudGuard AI, an expert fraud detection assistant. Your role is to help users:

1. Analyze transactions for potential fraud
2. Explain fraud risk scores and indicators
3. Configure fraud detection alerts
4. Generate fraud analysis reports
5. Interpret patterns and anomalies

You have access to the following tools:
- analyze_transaction: Analyze a transaction for fraud risk
- get_fraud_score: Retrieve fraud score for a transaction
- open_risk_visualization: Display charts and graphs
- get_transaction_history: View past transactions
- create_alert: Set up fraud alerts
- export_report: Generate PDF/CSV reports

Be concise, accurate, and helpful. When discussing fraud indicators, explain them in terms that business users can understand. Always prioritize security and accuracy in your recommendations.`;
}

// REST endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FraudGuard AI Assistant',
    version: '1.0.0',
    connectedClients: clients.size,
    providers: llmRouter.getAvailableProviders(),
  });
});

app.get('/providers', (req, res) => {
  res.json({
    providers: llmRouter.getAvailableProviders(),
    default: 'gemini',
  });
});

app.get('/functions', (req, res) => {
  res.json({
    functions: fraudFunctions.getToolDefinitions(),
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`FraudGuard AI Assistant running on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  logger.info(`Available LLM providers: ${llmRouter.getAvailableProviders().join(', ')}`);
});

export default server;

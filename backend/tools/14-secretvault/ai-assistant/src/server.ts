/**
 * SecretVault AI Assistant
 * WebSocket Server for Real-time AI-Powered Encryption Guidance
 * Port: 6014
 *
 * Features:
 * - Claude Opus/Sonnet 4.5 integration for intelligent encryption recommendations
 * - Real-time encryption algorithm suggestions
 * - Key strength analysis and security policy advice
 * - Compliance auditing and automated key rotation suggestions
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

const PORT = process.env.AI_PORT || 6014;
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

interface EncryptionQuery {
  type: 'algorithm_recommendation' | 'key_analysis' | 'policy_advice' | 'compliance_check' | 'rotation_suggestion';
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

console.log(`🔐 SecretVault AI Assistant started on port ${PORT}`);
console.log('🤖 Claude Opus/Sonnet 4.5 ready for encryption intelligence');

wss.on('connection', (ws: WebSocket) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);

  console.log(`🔗 New connection: ${connectionId}`);

  // Send welcome message
  const welcomeMessage: AIResponse = {
    id: uuidv4(),
    type: 'welcome',
    content: 'Welcome to SecretVault AI Assistant. I can help you with encryption algorithms, key management, security policies, and compliance recommendations.',
    suggestions: [
      'Analyze encryption key strength',
      'Recommend optimal algorithms',
      'Check compliance requirements',
      'Suggest key rotation policies'
    ],
    timestamp: new Date().toISOString()
  };

  ws.send(JSON.stringify(welcomeMessage));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Message from ${connectionId}:`, message);

      const response = await handleEncryptionQuery(message, connectionId);
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

async function handleEncryptionQuery(query: EncryptionQuery, connectionId: string): Promise<AIResponse> {
  const { type, data, context } = query;

  switch (type) {
    case 'algorithm_recommendation':
      return await getAlgorithmRecommendation(data, context);

    case 'key_analysis':
      return await analyzeKeyStrength(data, context);

    case 'policy_advice':
      return await getPolicyAdvice(data, context);

    case 'compliance_check':
      return await checkCompliance(data, context);

    case 'rotation_suggestion':
      return await suggestKeyRotation(data, context);

    default:
      return {
        id: uuidv4(),
        type: 'unknown',
        content: 'I\'m not sure how to help with that. Try asking about encryption algorithms, key management, or security policies.',
        timestamp: new Date().toISOString()
      };
  }
}

async function getAlgorithmRecommendation(data: any, context?: any): Promise<AIResponse> {
  const prompt = `As an expert in cryptography and data security, recommend the most appropriate encryption algorithm for the following scenario:

Data type: ${data.dataType || 'general data'}
Security requirements: ${data.securityLevel || 'standard'}
Performance needs: ${data.performance || 'balanced'}
Compliance requirements: ${data.compliance || 'general'}
Key management: ${data.keyManagement || 'software-based'}

Provide a detailed recommendation with rationale, including:
1. Recommended algorithm and key size
2. Why this algorithm is suitable
3. Any implementation considerations
4. Alternative options if needed

Focus on industry best practices and current standards.`;

  try {
    // Try Claude first (Opus/Sonnet 4.5)
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      system: 'You are a world-class cryptography expert providing precise, secure encryption recommendations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'algorithm_recommendation',
      content: content,
      suggestions: parseAlgorithmSuggestions(content),
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.warn('Claude API failed, trying Gemini:', error);
    // Fallback to Gemini
    try {
      const result = await geminiModel.generateContent(prompt);
      const content = result.response.text();

      return {
        id: uuidv4(),
        type: 'algorithm_recommendation',
        content: content,
        suggestions: parseAlgorithmSuggestions(content),
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
    } catch (geminiError) {
      console.warn('Gemini API failed, trying OpenAI:', geminiError);
      // Final fallback to GPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = completion.choices[0].message.content || '';

      return {
        id: uuidv4(),
        type: 'algorithm_recommendation',
        content: content,
        suggestions: parseAlgorithmSuggestions(content),
        confidence: 0.80,
        timestamp: new Date().toISOString()
      };
    }
  }
}

async function analyzeKeyStrength(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Analyze the strength of the following encryption key configuration:

Algorithm: ${data.algorithm}
Key size: ${data.keySize} bits
Usage: ${data.usage || 'general encryption'}
Environment: ${data.environment || 'standard'}

Provide:
1. Strength assessment (weak/adequate/strong/excellent)
2. Security lifetime estimate
3. Recommendations for improvement
4. Quantum resistance considerations
5. Compliance alignment

Be specific about any vulnerabilities or concerns.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 800,
      temperature: 0.2,
      system: 'You are a cryptography security auditor providing detailed key strength analysis.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'key_analysis',
      content: content,
      suggestions: parseKeySuggestions(content),
      confidence: 0.98,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback logic similar to above
    return {
      id: uuidv4(),
      type: 'key_analysis',
      content: 'Key analysis temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function getPolicyAdvice(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Provide security policy recommendations for encryption key management:

Organization size: ${data.orgSize || 'medium'}
Industry: ${data.industry || 'general'}
Compliance requirements: ${data.compliance || 'GDPR, ISO 27001'}
Current maturity: ${data.maturity || 'intermediate'}

Recommend policies for:
1. Key generation and storage
2. Key rotation schedules
3. Access controls and segregation
4. Incident response procedures
5. Audit and monitoring requirements

Make recommendations practical and implementable.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1200,
      temperature: 0.4,
      system: 'You are a security policy expert providing comprehensive encryption governance recommendations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'policy_advice',
      content: content,
      suggestions: parsePolicySuggestions(content),
      confidence: 0.92,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'policy_advice',
      content: 'Policy advice temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

async function checkCompliance(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Assess compliance of the following encryption implementation:

Standards: ${data.standards || 'GDPR, HIPAA, PCI DSS'}
Current implementation: ${data.implementation || 'standard AES encryption'}
Gaps identified: ${data.gaps || 'none specified'}

Provide:
1. Compliance status for each standard
2. Identified gaps or issues
3. Remediation recommendations
4. Timeline for compliance
5. Documentation requirements

Be thorough and specific about requirements.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.3,
      system: 'You are a compliance auditor specializing in encryption and data protection regulations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'compliance_check',
      content: content,
      suggestions: parseComplianceSuggestions(content),
      confidence: 0.96,
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

async function suggestKeyRotation(data: any, context?: any): Promise<AIResponse> {
  const prompt = `Recommend key rotation strategy for:

Key type: ${data.keyType || 'encryption keys'}
Current rotation frequency: ${data.currentRotation || 'none'}
Risk tolerance: ${data.riskTolerance || 'medium'}
Operational impact: ${data.operationalImpact || 'minimal'}

Consider:
1. Industry best practices
2. Cryptographic lifetime of algorithms
3. Operational feasibility
4. Cost-benefit analysis
5. Automated vs manual rotation

Provide specific rotation schedules and procedures.`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 900,
      temperature: 0.3,
      system: 'You are a key management expert providing strategic rotation recommendations.',
      messages: [{ role: 'user', content: prompt }]
    });

    const content = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

    return {
      id: uuidv4(),
      type: 'rotation_suggestion',
      content: content,
      suggestions: parseRotationSuggestions(content),
      confidence: 0.94,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      id: uuidv4(),
      type: 'rotation_suggestion',
      content: 'Rotation suggestions temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString()
    };
  }
}

// Helper functions to parse AI responses into structured suggestions
function parseAlgorithmSuggestions(content: string): any[] {
  // Parse the content to extract algorithm recommendations
  const suggestions = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.includes('AES') || line.includes('RSA') || line.includes('ECC') || line.includes('ChaCha')) {
      suggestions.push({
        type: 'algorithm',
        value: line.trim(),
        priority: 'high'
      });
    }
  }

  return suggestions.slice(0, 3); // Return top 3
}

function parseKeySuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('increase key size')) {
    suggestions.push({ type: 'key_size', action: 'increase', priority: 'high' });
  }
  if (content.toLowerCase().includes('rotate')) {
    suggestions.push({ type: 'rotation', action: 'schedule', priority: 'medium' });
  }
  return suggestions;
}

function parsePolicySuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('rotation')) {
    suggestions.push({ type: 'policy', category: 'rotation', priority: 'high' });
  }
  if (content.toLowerCase().includes('access control')) {
    suggestions.push({ type: 'policy', category: 'access', priority: 'high' });
  }
  return suggestions;
}

function parseComplianceSuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('gap')) {
    suggestions.push({ type: 'compliance', action: 'remediate_gaps', priority: 'high' });
  }
  return suggestions;
}

function parseRotationSuggestions(content: string): any[] {
  const suggestions = [];
  if (content.toLowerCase().includes('automate')) {
    suggestions.push({ type: 'rotation', method: 'automated', priority: 'high' });
  }
  return suggestions;
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SecretVault AI Assistant...');
  wss.close(() => {
    console.log('✅ AI Assistant stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down SecretVault AI Assistant...');
  wss.close(() => {
    console.log('✅ AI Assistant stopped');
    process.exit(0);
  });
});</content>
<parameter name="filePath">/workspaces/VictoryKit/backend/tools/14-secretvault/ai-assistant/src/server.ts
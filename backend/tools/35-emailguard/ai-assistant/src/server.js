/**
 * EmailGuard AI Assistant Server
 * WebSocket server for AI-powered email security assistance
 * Port: 6035
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { executeEmailGuardFunction } from './functionExecutor.js';

dotenv.config();

const PORT = process.env.AI_PORT || 6035;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
  },
});

// AI Function definitions for EmailGuard
const emailGuardFunctions = [
  {
    name: 'analyze_email_threat',
    description: 'Perform comprehensive threat analysis on an email including phishing, malware, and BEC detection',
    parameters: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'Unique email identifier' },
        includeAttachments: { type: 'boolean', description: 'Include attachment analysis' },
        deepScan: { type: 'boolean', description: 'Perform deep content analysis' }
      },
      required: ['emailId']
    }
  },
  {
    name: 'classify_email_content',
    description: 'Classify email content for sensitivity, category, and priority',
    parameters: {
      type: 'object',
      properties: {
        emailId: { type: 'string', description: 'Email identifier' },
        classificationScheme: { type: 'string', description: 'Classification scheme to use' }
      },
      required: ['emailId']
    }
  },
  {
    name: 'detect_phishing_attempt',
    description: 'Specialized phishing detection with detailed analysis of indicators',
    parameters: {
      type: 'object',
      properties: {
        emailContent: { type: 'object', description: 'Email content including headers and body' },
        senderHistory: { type: 'boolean', description: 'Include sender history analysis' }
      },
      required: ['emailContent']
    }
  },
  {
    name: 'analyze_attachment_risk',
    description: 'Analyze email attachment for potential security risks',
    parameters: {
      type: 'object',
      properties: {
        attachmentId: { type: 'string', description: 'Attachment identifier' },
        sandboxAnalysis: { type: 'boolean', description: 'Run in sandbox' }
      },
      required: ['attachmentId']
    }
  },
  {
    name: 'assess_sender_reputation',
    description: 'Assess sender reputation and trustworthiness',
    parameters: {
      type: 'object',
      properties: {
        senderEmail: { type: 'string', description: 'Sender email address' },
        senderDomain: { type: 'string', description: 'Sender domain' }
      },
      required: ['senderEmail', 'senderDomain']
    }
  },
  {
    name: 'generate_policy_recommendation',
    description: 'Generate email security policy recommendations based on threat landscape',
    parameters: {
      type: 'object',
      properties: {
        threatData: { type: 'object', description: 'Recent threat data' },
        currentPolicies: { type: 'array', description: 'Current policy configuration' }
      },
      required: ['threatData']
    }
  },
  {
    name: 'investigate_email_chain',
    description: 'Investigate an email thread for suspicious activity patterns',
    parameters: {
      type: 'object',
      properties: {
        threadId: { type: 'string', description: 'Email thread identifier' },
        lookbackDays: { type: 'number', description: 'Days to look back' }
      },
      required: ['threadId']
    }
  },
  {
    name: 'detect_bec_attempt',
    description: 'Detect Business Email Compromise attempts with executive impersonation analysis',
    parameters: {
      type: 'object',
      properties: {
        emailContent: { type: 'object', description: 'Email content' },
        executiveList: { type: 'array', description: 'List of executives to check against' }
      },
      required: ['emailContent']
    }
  },
  {
    name: 'summarize_threat_landscape',
    description: 'Generate summary of current email threat landscape for the organization',
    parameters: {
      type: 'object',
      properties: {
        timePeriod: { type: 'string', description: 'Time period for analysis' },
        includeRecommendations: { type: 'boolean', description: 'Include actionable recommendations' }
      },
      required: ['timePeriod']
    }
  },
  {
    name: 'analyze_url_safety',
    description: 'Analyze URL for safety and potential threats',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to analyze' },
        followRedirects: { type: 'boolean', description: 'Follow redirect chain' }
      },
      required: ['url']
    }
  }
];

// System prompt for EmailGuard
const systemPrompt = `You are the AI assistant for EmailGuard, an enterprise email security and protection platform.

Your capabilities include:
- Analyzing emails for phishing, malware, spam, and BEC attacks
- Detecting business email compromise and executive impersonation
- Assessing sender reputation and domain trustworthiness
- Analyzing URLs and attachments for security risks
- Classifying email content by sensitivity and priority
- Generating security policy recommendations
- Investigating email threads for suspicious patterns
- Summarizing the organization's threat landscape

Key threat detection features:
- Phishing detection: URL analysis, domain reputation, content analysis, brand impersonation
- Malware scanning: ClamAV, YARA rules, ML-based detection, sandbox analysis
- Spam filtering: Bayesian filter, blacklist/greylist, sender score
- BEC detection: Executive impersonation, wire transfer requests, urgency analysis
- Spoofing checks: SPF, DKIM, DMARC, ARC, BIMI

Email authentication standards:
- SPF (Sender Policy Framework)
- DKIM (DomainKeys Identified Mail)
- DMARC (Domain-based Message Authentication)
- ARC (Authenticated Received Chain)
- BIMI (Brand Indicators for Message Identification)

Threat indicators to watch:
- Suspicious sender domains (typosquatting, lookalike domains)
- Urgent language and pressure tactics
- Requests for sensitive information or wire transfers
- Mismatched reply-to addresses
- Newly registered domains
- Malicious attachments (macros, executables)
- Shortened or obfuscated URLs

When users ask about email security, provide expert guidance on best practices, threat prevention, and incident response. Use the available functions to analyze emails, detect threats, and assess risks.`;

// Active connections and chat sessions
const connections = new Map();
const chatSessions = new Map();

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`[EmailGuard AI] WebSocket server starting on port ${PORT}...`);

wss.on('connection', (ws) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);
  
  console.log(`[EmailGuard AI] Client connected: ${connectionId}`);
  
  // Initialize chat session
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: 'Initialize as EmailGuard assistant.' }] },
      { role: 'model', parts: [{ text: 'EmailGuard assistant initialized. I can help you with email threat analysis, phishing detection, malware scanning, BEC prevention, sender reputation assessment, policy recommendations, and threat landscape summaries. How can I assist you with email security today?' }] }
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
    },
  });
  chatSessions.set(connectionId, chat);
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    connectionId,
    message: 'Connected to EmailGuard AI Assistant',
    availableFunctions: emailGuardFunctions.map(f => f.name)
  }));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(connectionId, ws, message);
    } catch (error) {
      console.error(`[EmailGuard AI] Error processing message:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log(`[EmailGuard AI] Client disconnected: ${connectionId}`);
    connections.delete(connectionId);
    chatSessions.delete(connectionId);
  });
  
  ws.on('error', (error) => {
    console.error(`[EmailGuard AI] WebSocket error:`, error);
  });
});

// Handle incoming messages
async function handleMessage(connectionId, ws, message) {
  const { type, id, content, function: functionCall, stream } = message;
  
  switch (type) {
    case 'message':
      await handleChatMessage(connectionId, ws, id || uuidv4(), content, stream);
      break;
      
    case 'function_call':
      await handleFunctionCall(ws, id || uuidv4(), functionCall);
      break;
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
      
    default:
      ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${type}`
      }));
  }
}

// Handle chat messages
async function handleChatMessage(connectionId, ws, messageId, content, stream = true) {
  const chat = chatSessions.get(connectionId);
  
  if (!chat) {
    ws.send(JSON.stringify({
      type: 'error',
      id: messageId,
      error: 'Chat session not found'
    }));
    return;
  }
  
  try {
    // Check if the message requires a function call
    const functionMatch = await detectFunctionIntent(content);
    
    if (functionMatch) {
      // Execute function and include result in response
      const result = await executeEmailGuardFunction(functionMatch.name, functionMatch.parameters);
      
      ws.send(JSON.stringify({
        type: 'function_result',
        id: messageId,
        function: functionMatch.name,
        result
      }));
      
      // Generate explanation of results
      const explanation = await chat.sendMessage(
        `Explain these ${functionMatch.name} results to the user: ${JSON.stringify(result)}`
      );
      
      ws.send(JSON.stringify({
        type: 'message',
        id: messageId,
        message: {
          id: messageId,
          role: 'assistant',
          content: explanation.response.text(),
          timestamp: new Date().toISOString(),
          functionResult: { name: functionMatch.name, result }
        }
      }));
      
      return;
    }
    
    // Regular chat message
    if (stream) {
      const result = await chat.sendMessageStream(content);
      let fullText = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        ws.send(JSON.stringify({
          type: 'stream',
          id: messageId,
          content: chunkText,
          isComplete: false
        }));
      }
      
      ws.send(JSON.stringify({
        type: 'stream',
        id: messageId,
        content: '',
        isComplete: true
      }));
      
      ws.send(JSON.stringify({
        type: 'message',
        id: messageId,
        message: {
          id: messageId,
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toISOString()
        }
      }));
    } else {
      const result = await chat.sendMessage(content);
      const responseText = result.response.text();
      
      ws.send(JSON.stringify({
        type: 'message',
        id: messageId,
        message: {
          id: messageId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString()
        }
      }));
    }
  } catch (error) {
    console.error(`[EmailGuard AI] Chat error:`, error);
    ws.send(JSON.stringify({
      type: 'error',
      id: messageId,
      error: error.message
    }));
  }
}

// Handle direct function calls
async function handleFunctionCall(ws, id, functionCall) {
  const { name, parameters } = functionCall;
  
  const functionDef = emailGuardFunctions.find(f => f.name === name);
  if (!functionDef) {
    ws.send(JSON.stringify({
      type: 'error',
      id,
      error: `Unknown function: ${name}`
    }));
    return;
  }
  
  try {
    const result = await executeEmailGuardFunction(name, parameters);
    
    ws.send(JSON.stringify({
      type: 'function_result',
      id,
      function: name,
      success: true,
      data: result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'function_result',
      id,
      function: name,
      success: false,
      error: error.message
    }));
  }
}

// Detect if user message requires a function call
async function detectFunctionIntent(content) {
  const lowerContent = content.toLowerCase();
  
  // Threat analysis keywords
  if (lowerContent.match(/analyze.*(email|threat|security)/i) ||
      lowerContent.match(/scan.*(email|message)/i) ||
      lowerContent.match(/check.*(email|threat)/i)) {
    return {
      name: 'analyze_email_threat',
      parameters: extractThreatParams(content)
    };
  }
  
  // Phishing detection keywords
  if (lowerContent.match(/phishing|phish|fake.*email|suspicious.*email/i)) {
    return {
      name: 'detect_phishing_attempt',
      parameters: extractPhishingParams(content)
    };
  }
  
  // Attachment analysis keywords
  if (lowerContent.match(/attachment|file.*scan|malware.*file|suspicious.*file/i)) {
    return {
      name: 'analyze_attachment_risk',
      parameters: extractAttachmentParams(content)
    };
  }
  
  // Sender reputation keywords
  if (lowerContent.match(/sender.*reputation|trust.*sender|domain.*reputation|who.*sent/i)) {
    return {
      name: 'assess_sender_reputation',
      parameters: extractSenderParams(content)
    };
  }
  
  // BEC detection keywords
  if (lowerContent.match(/bec|business.*email.*compromise|executive.*impersonation|wire.*transfer|ceo.*fraud/i)) {
    return {
      name: 'detect_bec_attempt',
      parameters: extractBECParams(content)
    };
  }
  
  // URL safety keywords
  if (lowerContent.match(/url|link|check.*link|safe.*link|suspicious.*url/i)) {
    return {
      name: 'analyze_url_safety',
      parameters: extractURLParams(content)
    };
  }
  
  // Policy recommendation keywords
  if (lowerContent.match(/policy|recommend.*policy|security.*policy|rule/i)) {
    return {
      name: 'generate_policy_recommendation',
      parameters: extractPolicyParams(content)
    };
  }
  
  // Email chain investigation keywords
  if (lowerContent.match(/investigate.*thread|email.*chain|conversation.*history/i)) {
    return {
      name: 'investigate_email_chain',
      parameters: extractChainParams(content)
    };
  }
  
  // Classification keywords
  if (lowerContent.match(/classify|categorize|priority|sensitivity/i)) {
    return {
      name: 'classify_email_content',
      parameters: extractClassifyParams(content)
    };
  }
  
  // Threat landscape keywords
  if (lowerContent.match(/threat.*landscape|security.*summary|threat.*report|overview/i)) {
    return {
      name: 'summarize_threat_landscape',
      parameters: extractLandscapeParams(content)
    };
  }
  
  return null;
}

// Parameter extraction helpers
function extractThreatParams(content) {
  return {
    emailId: extractEmailId(content) || uuidv4(),
    includeAttachments: content.toLowerCase().includes('attachment'),
    deepScan: content.toLowerCase().includes('deep') || content.toLowerCase().includes('thorough')
  };
}

function extractPhishingParams(content) {
  return {
    emailContent: {
      from: 'suspicious@example.com',
      subject: 'Urgent: Action Required',
      body: 'Sample email content for analysis'
    },
    senderHistory: true
  };
}

function extractAttachmentParams(content) {
  return {
    attachmentId: uuidv4(),
    sandboxAnalysis: content.toLowerCase().includes('sandbox')
  };
}

function extractSenderParams(content) {
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : 'unknown@example.com';
  const domain = email.split('@')[1];
  
  return {
    senderEmail: email,
    senderDomain: domain
  };
}

function extractBECParams(content) {
  return {
    emailContent: {
      from: 'ceo@company.com',
      subject: 'Urgent Wire Transfer Needed',
      body: 'Please process this wire transfer immediately.'
    },
    executiveList: ['CEO', 'CFO', 'COO']
  };
}

function extractURLParams(content) {
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  return {
    url: urlMatch ? urlMatch[0] : 'https://example.com',
    followRedirects: true
  };
}

function extractPolicyParams(content) {
  return {
    threatData: { recentThreats: [], trendingAttacks: [] },
    currentPolicies: []
  };
}

function extractChainParams(content) {
  return {
    threadId: uuidv4(),
    lookbackDays: 30
  };
}

function extractClassifyParams(content) {
  return {
    emailId: extractEmailId(content) || uuidv4(),
    classificationScheme: 'default'
  };
}

function extractLandscapeParams(content) {
  let period = 'week';
  if (content.toLowerCase().includes('month')) period = 'month';
  if (content.toLowerCase().includes('day')) period = 'day';
  if (content.toLowerCase().includes('quarter')) period = 'quarter';
  
  return {
    timePeriod: period,
    includeRecommendations: true
  };
}

function extractEmailId(content) {
  const idMatch = content.match(/email[_-]?id[:\s]+([a-zA-Z0-9-]+)/i);
  return idMatch ? idMatch[1] : null;
}

console.log(`[EmailGuard AI] Server running on ws://localhost:${PORT}`);
console.log(`[EmailGuard AI] Available functions: ${emailGuardFunctions.map(f => f.name).join(', ')}`);

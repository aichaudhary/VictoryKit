/**
 * ContainerScan AI Assistant Server
 * WebSocket server for AI-powered biometric authentication assistance
 * Port: 6034
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { executeBiometricFunction } from './functionExecutor.js';

dotenv.config();

const PORT = process.env.AI_PORT || 6034;
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

// AI Function definitions for ContainerScan
const biometricFunctions = [
  {
    name: 'biometric_quality_analyzer',
    description: 'Analyze biometric sample quality for face, fingerprint, voice, iris, or palm. Returns quality score, issues found, and recommendations for improvement.',
    parameters: {
      type: 'object',
      properties: {
        sampleId: { type: 'string', description: 'Unique identifier for the biometric sample' },
        modality: { type: 'string', enum: ['face', 'fingerprint', 'voice', 'iris', 'palm'], description: 'Type of biometric modality' },
        sampleData: { type: 'string', description: 'Base64 encoded sample data' },
        requirements: { type: 'object', description: 'Quality requirements and thresholds' }
      },
      required: ['sampleId', 'modality', 'sampleData']
    }
  },
  {
    name: 'spoof_detection_engine',
    description: 'Detect presentation attacks and spoofing attempts on biometric samples. Identifies photo attacks, video replays, masks, and synthetic samples.',
    parameters: {
      type: 'object',
      properties: {
        sampleId: { type: 'string', description: 'Unique identifier for the biometric sample' },
        modality: { type: 'string', enum: ['face', 'fingerprint', 'voice', 'iris', 'palm'], description: 'Type of biometric modality' },
        sampleData: { type: 'string', description: 'Base64 encoded sample data' },
        checkTypes: { type: 'array', items: { type: 'string' }, description: 'Types of spoof attacks to check for' }
      },
      required: ['sampleId', 'modality', 'sampleData']
    }
  },
  {
    name: 'liveness_verification',
    description: 'Verify that a biometric sample is from a live person, not a spoof. Supports passive and active liveness detection with challenges.',
    parameters: {
      type: 'object',
      properties: {
        modality: { type: 'string', enum: ['face', 'fingerprint', 'voice', 'iris'], description: 'Type of biometric modality' },
        sampleData: { type: 'string', description: 'Base64 encoded sample data' },
        challengeType: { type: 'string', enum: ['passive', 'active'], description: 'Type of liveness challenge' },
        challenges: { type: 'array', description: 'Specific challenges for active liveness' }
      },
      required: ['modality', 'sampleData']
    }
  },
  {
    name: 'match_score_calculator',
    description: 'Calculate biometric match scores between templates. Supports single modality and multi-modal fusion with various scoring methods.',
    parameters: {
      type: 'object',
      properties: {
        template1: { type: 'string', description: 'First biometric template' },
        template2: { type: 'string', description: 'Second biometric template' },
        modality: { type: 'string', enum: ['face', 'fingerprint', 'voice', 'iris', 'behavioral', 'palm'], description: 'Type of biometric modality' },
        fusionMode: { type: 'string', enum: ['single', 'weighted', 'score_level', 'feature_level'], description: 'Multi-modal fusion method' }
      },
      required: ['template1', 'template2', 'modality']
    }
  },
  {
    name: 'behavioral_pattern_analyzer',
    description: 'Analyze behavioral biometrics including typing patterns, mouse movements, and touch gestures. Detects anomalies in user behavior.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier for baseline comparison' },
        behaviorData: { type: 'object', description: 'Keystroke, mouse, and touch pattern data' },
        baselineComparison: { type: 'boolean', description: 'Compare against user baseline' }
      },
      required: ['userId', 'behaviorData']
    }
  },
  {
    name: 'risk_assessment_engine',
    description: 'Assess authentication risk based on biometric scores, device info, location, and contextual factors. Recommends authentication actions.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        authenticationAttempt: { type: 'object', description: 'Details of the authentication attempt' },
        contextFactors: { type: 'object', description: 'Additional context like device, location, time' }
      },
      required: ['userId', 'authenticationAttempt']
    }
  },
  {
    name: 'template_optimizer',
    description: 'Optimize biometric templates for storage and matching efficiency. Improves template quality and reduces size while maintaining accuracy.',
    parameters: {
      type: 'object',
      properties: {
        templateData: { type: 'string', description: 'Original biometric template' },
        modality: { type: 'string', enum: ['face', 'fingerprint', 'voice', 'iris', 'palm'], description: 'Type of biometric modality' },
        targetQuality: { type: 'number', description: 'Target quality score (0-1)' },
        compressionLevel: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Compression level' }
      },
      required: ['templateData', 'modality']
    }
  },
  {
    name: 'authentication_advisor',
    description: 'Provide AI-powered recommendations for biometric authentication based on enrolled modalities, context, and security requirements.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        enrolledModalities: { type: 'array', items: { type: 'string' }, description: 'List of enrolled biometric modalities' },
        contextFactors: { type: 'object', description: 'Context including device trust, location risk, time' },
        securityRequirements: { type: 'string', description: 'Required security level' }
      },
      required: ['userId', 'enrolledModalities', 'contextFactors']
    }
  },
  {
    name: 'compliance_checker',
    description: 'Check biometric system configuration against compliance frameworks including GDPR, CCPA, BIPA, ISO 24745, ISO 30107, and NIST 800-63B.',
    parameters: {
      type: 'object',
      properties: {
        framework: { type: 'string', enum: ['GDPR', 'CCPA', 'BIPA', 'ISO24745', 'ISO30107', 'NIST80063B'], description: 'Compliance framework' },
        systemConfiguration: { type: 'object', description: 'Current system configuration' },
        dataHandlingPractices: { type: 'object', description: 'Data handling and storage practices' }
      },
      required: ['framework', 'systemConfiguration', 'dataHandlingPractices']
    }
  },
  {
    name: 'anomaly_detector',
    description: 'Detect anomalies in biometric authentication patterns. Identifies unusual behavior, device changes, location anomalies, and potential threats.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier for baseline comparison' },
        timePeriod: { type: 'string', enum: ['hour', 'day', 'week', 'month'], description: 'Time period for analysis' },
        dataPoints: { type: 'array', description: 'Authentication events and metrics' },
        baselineData: { type: 'object', description: 'Historical baseline for comparison' }
      },
      required: ['timePeriod', 'dataPoints']
    }
  }
];

// System prompt for ContainerScan
const systemPrompt = `You are the AI assistant for ContainerScan, a comprehensive multi-modal biometric authentication system.

Your capabilities include:
- Analyzing biometric sample quality for face, fingerprint, voice, iris, behavioral, and palm modalities
- Detecting presentation attacks and spoofing attempts
- Verifying liveness through passive and active challenges
- Calculating match scores with single and multi-modal fusion
- Analyzing behavioral patterns (typing, mouse, touch)
- Assessing authentication risk and recommending actions
- Optimizing biometric templates
- Providing authentication advice based on context
- Checking compliance with GDPR, CCPA, BIPA, ISO 24745, ISO 30107, NIST 800-63B
- Detecting anomalies in authentication patterns

Key metrics and thresholds:
- Face recognition threshold: 0.75 (high security), 0.65 (medium), 0.55 (low)
- Fingerprint matching: 0.80 (high), 0.70 (medium), 0.60 (low)
- Voice verification: 0.70 (high), 0.60 (medium), 0.50 (low)
- Iris recognition: 0.90 (high), 0.85 (medium), 0.80 (low)
- Liveness detection minimum: 0.85
- Anti-spoofing confidence minimum: 0.90

Security standards:
- Template encryption: AES-256-GCM
- Transport encryption: TLS 1.3
- Cancelable biometrics for template protection
- Data minimization and purpose limitation per GDPR

When users ask about biometric authentication, provide expert guidance on best practices, security considerations, and system configuration. Use the available functions to analyze samples, detect threats, and assess risk.`;

// Active connections and chat sessions
const connections = new Map();
const chatSessions = new Map();

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`[ContainerScan AI] WebSocket server starting on port ${PORT}...`);

wss.on('connection', (ws) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);
  
  console.log(`[ContainerScan AI] Client connected: ${connectionId}`);
  
  // Initialize chat session
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: 'Initialize as ContainerScan assistant.' }] },
      { role: 'model', parts: [{ text: 'ContainerScan assistant initialized. I can help you with biometric quality analysis, spoof detection, liveness verification, match scoring, behavioral analysis, risk assessment, template optimization, authentication advice, compliance checking, and anomaly detection. How can I assist you?' }] }
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
    message: 'Connected to ContainerScan AI Assistant',
    availableFunctions: biometricFunctions.map(f => f.name)
  }));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(connectionId, ws, message);
    } catch (error) {
      console.error(`[ContainerScan AI] Error processing message:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log(`[ContainerScan AI] Client disconnected: ${connectionId}`);
    connections.delete(connectionId);
    chatSessions.delete(connectionId);
  });
  
  ws.on('error', (error) => {
    console.error(`[ContainerScan AI] WebSocket error:`, error);
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
      const result = await executeBiometricFunction(functionMatch.name, functionMatch.parameters);
      
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
    console.error(`[ContainerScan AI] Chat error:`, error);
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
  
  const functionDef = biometricFunctions.find(f => f.name === name);
  if (!functionDef) {
    ws.send(JSON.stringify({
      type: 'error',
      id,
      error: `Unknown function: ${name}`
    }));
    return;
  }
  
  try {
    const result = await executeBiometricFunction(name, parameters);
    
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
  
  // Quality analysis keywords
  if (lowerContent.match(/analyze.*(quality|sample|image|biometric)/i) ||
      lowerContent.match(/quality.*(check|analyze|assess)/i)) {
    return {
      name: 'biometric_quality_analyzer',
      parameters: extractQualityParams(content)
    };
  }
  
  // Spoof detection keywords
  if (lowerContent.match(/spoof|fake|attack|presentation attack|replay/i) ||
      lowerContent.match(/detect.*(spoof|fake|attack)/i)) {
    return {
      name: 'spoof_detection_engine',
      parameters: extractSpoofParams(content)
    };
  }
  
  // Liveness keywords
  if (lowerContent.match(/liveness|live.*detection|alive|real.*person/i)) {
    return {
      name: 'liveness_verification',
      parameters: extractLivenessParams(content)
    };
  }
  
  // Match score keywords
  if (lowerContent.match(/match.*score|compare|verify.*identity|authentication.*score/i)) {
    return {
      name: 'match_score_calculator',
      parameters: extractMatchParams(content)
    };
  }
  
  // Behavioral analysis keywords
  if (lowerContent.match(/behavioral|typing.*pattern|mouse.*pattern|keystroke/i)) {
    return {
      name: 'behavioral_pattern_analyzer',
      parameters: extractBehavioralParams(content)
    };
  }
  
  // Risk assessment keywords
  if (lowerContent.match(/risk.*assess|threat.*level|security.*risk|evaluate.*risk/i)) {
    return {
      name: 'risk_assessment_engine',
      parameters: extractRiskParams(content)
    };
  }
  
  // Template optimization keywords
  if (lowerContent.match(/optimize.*template|template.*optimization|compress.*template/i)) {
    return {
      name: 'template_optimizer',
      parameters: extractOptimizationParams(content)
    };
  }
  
  // Authentication advice keywords
  if (lowerContent.match(/recommend.*auth|authentication.*advice|which.*modality|best.*method/i)) {
    return {
      name: 'authentication_advisor',
      parameters: extractAdviceParams(content)
    };
  }
  
  // Compliance keywords
  if (lowerContent.match(/compliance|gdpr|ccpa|bipa|iso.*24745|iso.*30107|nist.*800/i)) {
    return {
      name: 'compliance_checker',
      parameters: extractComplianceParams(content)
    };
  }
  
  // Anomaly detection keywords
  if (lowerContent.match(/anomaly|unusual|suspicious|abnormal|detect.*threat/i)) {
    return {
      name: 'anomaly_detector',
      parameters: extractAnomalyParams(content)
    };
  }
  
  return null;
}

// Parameter extraction helpers
function extractQualityParams(content) {
  const modality = extractModality(content) || 'face';
  return {
    sampleId: uuidv4(),
    modality,
    sampleData: 'demo_sample_data'
  };
}

function extractSpoofParams(content) {
  const modality = extractModality(content) || 'face';
  return {
    sampleId: uuidv4(),
    modality,
    sampleData: 'demo_sample_data',
    checkTypes: ['photo', 'video', 'mask', 'synthetic']
  };
}

function extractLivenessParams(content) {
  const modality = extractModality(content) || 'face';
  return {
    modality,
    sampleData: 'demo_sample_data',
    challengeType: content.toLowerCase().includes('active') ? 'active' : 'passive'
  };
}

function extractMatchParams(content) {
  const modality = extractModality(content) || 'face';
  return {
    template1: 'demo_template_1',
    template2: 'demo_template_2',
    modality,
    fusionMode: 'single'
  };
}

function extractBehavioralParams(content) {
  return {
    userId: 'demo_user',
    behaviorData: {
      keystrokes: [],
      mouseMovements: [],
      touchPatterns: []
    },
    baselineComparison: true
  };
}

function extractRiskParams(content) {
  return {
    userId: 'demo_user',
    authenticationAttempt: {
      modality: extractModality(content) || 'face',
      matchScore: 0.85,
      livenessScore: 0.92,
      deviceInfo: { type: 'desktop', trusted: true }
    }
  };
}

function extractOptimizationParams(content) {
  const modality = extractModality(content) || 'face';
  return {
    templateData: 'demo_template',
    modality,
    targetQuality: 0.95,
    compressionLevel: 'medium'
  };
}

function extractAdviceParams(content) {
  return {
    userId: 'demo_user',
    enrolledModalities: ['face', 'fingerprint', 'voice'],
    contextFactors: {
      deviceTrust: 'trusted',
      locationRisk: 'low',
      timeOfDay: new Date().toISOString()
    }
  };
}

function extractComplianceParams(content) {
  let framework = 'GDPR';
  if (content.toLowerCase().includes('ccpa')) framework = 'CCPA';
  if (content.toLowerCase().includes('bipa')) framework = 'BIPA';
  if (content.toLowerCase().includes('24745')) framework = 'ISO24745';
  if (content.toLowerCase().includes('30107')) framework = 'ISO30107';
  if (content.toLowerCase().includes('800-63') || content.toLowerCase().includes('nist')) framework = 'NIST80063B';
  
  return {
    framework,
    systemConfiguration: { encryption: 'AES-256-GCM', storage: 'cancelable' },
    dataHandlingPractices: { retention: 365, anonymization: true }
  };
}

function extractAnomalyParams(content) {
  return {
    timePeriod: 'day',
    dataPoints: [],
    baselineData: {}
  };
}

function extractModality(content) {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('face') || lowerContent.includes('facial')) return 'face';
  if (lowerContent.includes('finger') || lowerContent.includes('print')) return 'fingerprint';
  if (lowerContent.includes('voice') || lowerContent.includes('speak')) return 'voice';
  if (lowerContent.includes('iris') || lowerContent.includes('eye')) return 'iris';
  if (lowerContent.includes('palm') || lowerContent.includes('hand')) return 'palm';
  if (lowerContent.includes('behavior') || lowerContent.includes('typing')) return 'behavioral';
  return null;
}

console.log(`[ContainerScan AI] Server running on ws://localhost:${PORT}`);
console.log(`[ContainerScan AI] Available functions: ${biometricFunctions.map(f => f.name).join(', ')}`);

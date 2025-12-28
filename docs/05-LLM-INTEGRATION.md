# 🤖 LLM Integration Architecture - MAULA.AI

## 🏗️ AI Assistant Architecture

```
AI ASSISTANT SYSTEM
│
├─ 🎯 LLM Router (Central)
│   └─ Routes requests to selected provider
│
├─ 🔌 Provider Services (6)
│   ├─ Anthropic Claude
│   ├─ OpenAI GPT
│   ├─ xAI Grok
│   ├─ Mistral AI
│   ├─ Google Gemini
│   └─ Meta Llama (via Together AI)
│
└─ 🛡️ 50 Tool AI Instances
    ├─ Each tool = Own AI context
    ├─ Tool-specific prompts
    └─ Independent chat sessions
```

---

## 📂 AI Service Structure

```
ai-services/
│
├─ llm-router/                        # Central LLM Router
│   ├─ src/
│   │   ├─ router.ts                  # Main routing logic
│   │   ├─ providers/
│   │   │   ├─ anthropic.ts
│   │   │   ├─ openai.ts
│   │   │   ├─ xai.ts
│   │   │   ├─ mistral.ts
│   │   │   ├─ google.ts
│   │   │   └─ llama.ts
│   │   ├─ streaming/
│   │   │   └─ streamHandler.ts
│   │   ├─ context/
│   │   │   ├─ contextBuilder.ts
│   │   │   └─ memoryManager.ts
│   │   ├─ prompts/
│   │   │   └─ systemPrompts.ts
│   │   └─ utils/
│   │       ├─ tokenCounter.ts
│   │       └─ costCalculator.ts
│   ├─ package.json
│   └─ Dockerfile
│
└─ tool-ai-configs/                   # AI configs for all 50 tools
    ├─ fraudguard-ai.json
    ├─ smartscore-ai.json
    ├─ ipintel-ai.json
    └─ ... (50 configs)
```

---

## 🔌 LLM Provider Integrations

### 1. Anthropic Claude
```typescript
// providers/anthropic.ts

import Anthropic from '@anthropic-ai/sdk';

class ClaudeProvider {
  private client: Anthropic;
  
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }
  
  async chat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4096,
      system: this.buildSystemPrompt(context, config),
      messages: [
        ...this.formatHistory(context.history),
        { role: 'user', content: message }
      ]
    });
    
    return response.content[0].text;
  }
  
  async streamChat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): AsyncGenerator<string> {
    const stream = await this.client.messages.stream({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 4096,
      system: this.buildSystemPrompt(context, config),
      messages: [
        ...this.formatHistory(context.history),
        { role: 'user', content: message }
      ]
    });
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        yield chunk.delta.text;
      }
    }
  }
}
```

### 2. OpenAI GPT
```typescript
// providers/openai.ts

import OpenAI from 'openai';

class GPTProvider {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }
  
  async chat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: config.model || 'gpt-4-turbo-preview',
      max_tokens: config.maxTokens || 4096,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(context, config) },
        ...this.formatHistory(context.history),
        { role: 'user', content: message }
      ]
    });
    
    return response.choices[0].message.content;
  }
  
  async streamChat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: config.model || 'gpt-4-turbo-preview',
      max_tokens: config.maxTokens || 4096,
      stream: true,
      messages: [
        { role: 'system', content: this.buildSystemPrompt(context, config) },
        ...this.formatHistory(context.history),
        { role: 'user', content: message }
      ]
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
```

### 3. xAI Grok
```typescript
// providers/xai.ts

import axios from 'axios';

class GrokProvider {
  private apiKey: string;
  private baseURL = 'https://api.x.ai/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async chat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: config.model || 'grok-beta',
        messages: [
          { role: 'system', content: this.buildSystemPrompt(context, config) },
          ...this.formatHistory(context.history),
          { role: 'user', content: message }
        ],
        max_tokens: config.maxTokens || 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  }
}
```

### 4. Mistral AI
```typescript
// providers/mistral.ts

import MistralClient from '@mistralai/mistralai';

class MistralProvider {
  private client: MistralClient;
  
  constructor(apiKey: string) {
    this.client = new MistralClient(apiKey);
  }
  
  async chat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): Promise<string> {
    const response = await this.client.chat({
      model: config.model || 'mistral-large-latest',
      messages: [
        { role: 'system', content: this.buildSystemPrompt(context, config) },
        ...this.formatHistory(context.history),
        { role: 'user', content: message }
      ],
      maxTokens: config.maxTokens || 4096
    });
    
    return response.choices[0].message.content;
  }
}
```

### 5. Google Gemini
```typescript
// providers/google.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiProvider {
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async chat(
    message: string,
    context: AIContext,
    config: ToolAIConfig
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: config.model || 'gemini-pro'
    });
    
    const chat = model.startChat({
      history: this.formatHistory(context.history),
      generationConfig: {
        maxOutputTokens: config.maxTokens || 4096
      }
    });
    
    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}
```

---

## 🧠 System Prompt Builder

### Tool-Specific Prompts
```typescript
// prompts/systemPrompts.ts

interface ToolAIConfig {
  toolName: string;
  toolDescription: string;
  capabilities: string[];
  dataFields: string[];
  actions: string[];
}

class SystemPromptBuilder {
  buildPrompt(context: AIContext, config: ToolAIConfig): string {
    return `
You are an AI assistant for ${config.toolName}, a security tool within the MAULA.AI platform.

## Tool Purpose
${config.toolDescription}

## Your Capabilities
${config.capabilities.map(c => `- ${c}`).join('\n')}

## Available Data
You have access to the following data:
${config.dataFields.map(f => `- ${f}`).join('\n')}

## Actions You Can Help With
${config.actions.map(a => `- ${a}`).join('\n')}

## Current Context
User ID: ${context.userId}
Tool: ${config.toolName}
Current Data: ${JSON.stringify(context.currentData, null, 2)}

## Guidelines
1. Be concise and technical
2. Explain security findings clearly
3. Provide actionable recommendations
4. Reference specific data points from the analysis
5. Help users configure settings when asked
6. Explain risk scores and threat levels
7. Guide users through the tool's features

## Current User Query
The user is asking about their ${config.toolName} analysis. Help them understand the results and take appropriate action.
`;
  }
}
```

### Example: IPIntel Tool Prompt
```typescript
const IPIntelAIConfig: ToolAIConfig = {
  toolName: 'IPIntel',
  toolDescription: 'Advanced IP address intelligence and risk analysis tool',
  capabilities: [
    'Analyze IP addresses for fraud risk',
    'Detect proxies, VPNs, Tor, and datacenter IPs',
    'Provide geolocation data',
    'Identify ISP and organization',
    'Calculate risk scores',
    'Explain threat levels',
    'Recommend security actions'
  ],
  dataFields: [
    'IP address',
    'Risk score (0-100)',
    'Proxy/VPN/Tor detection',
    'Country, city, region',
    'ISP and organization',
    'ASN number',
    'Threat level',
    'Latitude/longitude'
  ],
  actions: [
    'Explain risk score components',
    'Recommend blocking/allowing IPs',
    'Configure threshold settings',
    'Set up webhooks for alerts',
    'Export analysis data',
    'Compare multiple IP analyses'
  ]
};
```

---

## 🔄 Context Management

### AI Context Structure
```typescript
interface AIContext {
  userId: string;
  toolName: string;
  sessionId: string;
  
  // Current tool data
  currentData: {
    analysis?: any;           // Latest analysis result
    settings?: any;           // User's tool settings
    apiKey?: string;          // Masked API key
  };
  
  // Conversation history
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  // User context
  userProfile: {
    subscription: string;
    preferences: any;
    usage: {
      apiCalls: number;
      aiMessages: number;
      aiCredits: number;
    };
  };
  
  // Recent activity
  recentAnalyses: any[];      // Last N analyses
  recentQueries: string[];    // Last N questions
  
  // Tool-specific metadata
  metadata: Record<string, any>;
}
```

### Context Builder
```typescript
class ContextBuilder {
  async buildContext(
    userId: string,
    toolName: string,
    sessionId: string
  ): Promise<AIContext> {
    const [
      currentData,
      history,
      userProfile,
      recentAnalyses
    ] = await Promise.all([
      this.getCurrentToolData(userId, toolName),
      this.getChatHistory(userId, toolName, sessionId),
      this.getUserProfile(userId),
      this.getRecentAnalyses(userId, toolName, 5)
    ]);
    
    return {
      userId,
      toolName,
      sessionId,
      currentData,
      history,
      userProfile,
      recentAnalyses,
      recentQueries: history.filter(h => h.role === 'user')
        .slice(-5)
        .map(h => h.content),
      metadata: {}
    };
  }
}
```

---

## 📊 Token & Cost Management

### Token Counter
```typescript
class TokenCounter {
  // Approximate token count (1 token ≈ 4 characters)
  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  estimateCost(
    provider: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = {
      'claude': {
        input: 0.003 / 1000,   // $3 per million input tokens
        output: 0.015 / 1000   // $15 per million output tokens
      },
      'gpt': {
        input: 0.01 / 1000,
        output: 0.03 / 1000
      },
      'grok': {
        input: 0.002 / 1000,
        output: 0.01 / 1000
      },
      'mistral': {
        input: 0.002 / 1000,
        output: 0.006 / 1000
      },
      'gemini': {
        input: 0.0005 / 1000,
        output: 0.0015 / 1000
      }
    };
    
    const rates = pricing[provider];
    return (inputTokens * rates.input) + (outputTokens * rates.output);
  }
}
```

---

## 🌊 Streaming Response Handler

### WebSocket Streaming
```typescript
class StreamHandler {
  async handleStream(
    socket: WebSocket,
    provider: LLMProvider,
    message: string,
    context: AIContext
  ) {
    const stream = provider.streamChat(message, context, config);
    
    let fullResponse = '';
    let tokenCount = 0;
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      tokenCount += this.tokenCounter.countTokens(chunk);
      
      // Send chunk to frontend
      socket.send(JSON.stringify({
        type: 'chunk',
        content: chunk
      }));
    }
    
    // Save to database
    await this.saveChatMessage({
      userId: context.userId,
      toolName: context.toolName,
      sessionId: context.sessionId,
      message,
      response: fullResponse,
      provider: provider.name,
      tokens: {
        input: this.tokenCounter.countTokens(message),
        output: tokenCount,
        cost: this.tokenCounter.estimateCost(provider.name, ...)
      }
    });
    
    // Send completion
    socket.send(JSON.stringify({
      type: 'complete',
      tokens: tokenCount
    }));
  }
}
```

---

## 🔐 Rate Limiting & Credits

### AI Usage Limits
```typescript
interface AIRateLimits {
  free: {
    messagesPerDay: 50,
    messagesPerHour: 10,
    maxTokensPerMessage: 1000,
    allowedProviders: ['gemini']
  },
  pro: {
    messagesPerDay: 1000,
    messagesPerHour: 100,
    maxTokensPerMessage: 4000,
    allowedProviders: ['claude', 'gpt', 'gemini', 'mistral']
  },
  enterprise: {
    messagesPerDay: 10000,
    messagesPerHour: 1000,
    maxTokensPerMessage: 8000,
    allowedProviders: ['claude', 'gpt', 'grok', 'gemini', 'mistral', 'llama']
  }
}
```

### Credit System
```typescript
class CreditManager {
  async deductCredits(
    userId: string,
    cost: number
  ): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (user.subscription.aiCredits < cost) {
      throw new Error('Insufficient AI credits');
    }
    
    user.subscription.aiCredits -= cost;
    await user.save();
    
    return true;
  }
  
  async checkLimit(
    userId: string,
    provider: string
  ): Promise<boolean> {
    const user = await User.findById(userId);
    const limits = AIRateLimits[user.subscription.plan];
    
    // Check if provider is allowed
    if (!limits.allowedProviders.includes(provider)) {
      throw new Error(`Provider ${provider} not available on ${user.subscription.plan} plan`);
    }
    
    // Check rate limits (using Redis)
    const messageCount = await redis.get(`ai:${userId}:day`);
    if (messageCount >= limits.messagesPerDay) {
      throw new Error('Daily message limit exceeded');
    }
    
    return true;
  }
}
```

---

## 📈 Analytics & Monitoring

### AI Usage Analytics
```typescript
interface AIAnalytics {
  date: Date;
  userId: string;
  toolName: string;
  metrics: {
    totalMessages: number;
    totalTokens: {
      input: number;
      output: number;
    };
    totalCost: number;
    providerUsage: {
      [provider: string]: {
        messages: number;
        tokens: number;
        cost: number;
      };
    };
    averageResponseTime: number;
    successRate: number;
  };
}
```

---

**Next:** Complete folder structure for the entire project

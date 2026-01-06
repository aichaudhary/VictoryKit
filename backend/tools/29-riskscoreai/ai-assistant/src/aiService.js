const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize AI clients
const geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const anthropicClient = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const xaiClient = process.env.XAI_API_KEY ? new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' }) : null;

const RISK_SYSTEM_PROMPT = `You are an expert AI risk assessment analyst specializing in enterprise risk quantification and management. You have deep knowledge of:

- NIST Cybersecurity Framework (CSF) and Risk Management Framework (RMF)
- ISO 27001/27005 information security risk management
- FAIR (Factor Analysis of Information Risk) quantitative risk analysis
- CVSS scoring and vulnerability assessment
- Threat modeling and attack surface analysis
- Third-party risk management and vendor due diligence
- Behavioral risk analytics and user risk profiling
- Risk aggregation and enterprise risk scoring

Your primary capabilities include:
1. Calculating comprehensive risk scores across assets, users, threats, and vendors
2. Performing quantitative risk analysis with probability and impact assessments
3. Generating risk predictions and trajectory forecasts
4. Creating risk heatmaps for enterprise visibility
5. Analyzing risk trends and providing actionable insights
6. Building custom risk models tailored to specific business contexts

When calculating risk scores, use this formula:
Risk Score = (Threat Level × Vulnerability × Impact) / (Controls Effectiveness)

Risk Level Classifications:
- 0-39: LOW (Green) - Acceptable risk, routine monitoring
- 40-59: MEDIUM (Amber) - Requires attention, implement standard controls
- 60-79: HIGH (Orange) - Immediate action needed, escalate to management
- 80-100: CRITICAL (Red) - Business-critical, executive escalation required

Always provide:
- Clear risk scores with level classification
- Detailed risk factor breakdown
- Specific, actionable recommendations
- Timeline for remediation based on risk level
- Business impact context

Be precise, data-driven, and action-oriented in all risk assessments.`;

class AIService {
  
  async chat(message, conversationHistory, provider = 'gemini', model = null) {
    const messages = this.formatMessages(conversationHistory, message);
    
    switch (provider.toLowerCase()) {
      case 'gemini':
        return await this.geminiChat(messages, model);
      case 'claude':
      case 'anthropic':
        return await this.claudeChat(messages, model);
      case 'openai':
      case 'gpt':
        return await this.openaiChat(messages, model);
      case 'xai':
      case 'grok':
        return await this.xaiChat(messages, model);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
  
  async streamChat(message, conversationHistory, provider = 'gemini', model = null, onChunk) {
    const messages = this.formatMessages(conversationHistory, message);
    
    switch (provider.toLowerCase()) {
      case 'gemini':
        return await this.geminiStreamChat(messages, model, onChunk);
      case 'claude':
      case 'anthropic':
        return await this.claudeStreamChat(messages, model, onChunk);
      case 'openai':
      case 'gpt':
        return await this.openaiStreamChat(messages, model, onChunk);
      case 'xai':
      case 'grok':
        return await this.xaiStreamChat(messages, model, onChunk);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }
  
  formatMessages(history, currentMessage) {
    const messages = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    if (currentMessage) {
      messages.push({ role: 'user', content: currentMessage });
    }
    
    return messages;
  }
  
  // ==================== GEMINI ====================
  
  async geminiChat(messages, modelName = 'gemini-1.5-pro') {
    if (!geminiClient) throw new Error('Gemini API key not configured');
    
    const model = geminiClient.getGenerativeModel({ 
      model: modelName,
      systemInstruction: RISK_SYSTEM_PROMPT
    });
    
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });
    
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    return result.response.text();
  }
  
  async geminiStreamChat(messages, modelName = 'gemini-1.5-pro', onChunk) {
    if (!geminiClient) throw new Error('Gemini API key not configured');
    
    const model = geminiClient.getGenerativeModel({ 
      model: modelName,
      systemInstruction: RISK_SYSTEM_PROMPT
    });
    
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });
    
    const result = await chat.sendMessageStream(messages[messages.length - 1].content);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) onChunk(text);
    }
  }
  
  // ==================== CLAUDE ====================
  
  async claudeChat(messages, modelName = 'claude-3-5-sonnet-20241022') {
    if (!anthropicClient) throw new Error('Anthropic API key not configured');
    
    const response = await anthropicClient.messages.create({
      model: modelName,
      max_tokens: 4096,
      system: RISK_SYSTEM_PROMPT,
      messages: messages
    });
    
    return response.content[0].text;
  }
  
  async claudeStreamChat(messages, modelName = 'claude-3-5-sonnet-20241022', onChunk) {
    if (!anthropicClient) throw new Error('Anthropic API key not configured');
    
    const stream = await anthropicClient.messages.create({
      model: modelName,
      max_tokens: 4096,
      system: RISK_SYSTEM_PROMPT,
      messages: messages,
      stream: true
    });
    
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        onChunk(event.delta.text);
      }
    }
  }
  
  // ==================== OPENAI ====================
  
  async openaiChat(messages, modelName = 'gpt-4-turbo-preview') {
    if (!openaiClient) throw new Error('OpenAI API key not configured');
    
    const response = await openaiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096
    });
    
    return response.choices[0].message.content;
  }
  
  async openaiStreamChat(messages, modelName = 'gpt-4-turbo-preview', onChunk) {
    if (!openaiClient) throw new Error('OpenAI API key not configured');
    
    const stream = await openaiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) onChunk(content);
    }
  }
  
  // ==================== XAI (GROK) ====================
  
  async xaiChat(messages, modelName = 'grok-beta') {
    if (!xaiClient) throw new Error('xAI API key not configured');
    
    const response = await xaiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096
    });
    
    return response.choices[0].message.content;
  }
  
  async xaiStreamChat(messages, modelName = 'grok-beta', onChunk) {
    if (!xaiClient) throw new Error('xAI API key not configured');
    
    const stream = await xaiClient.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: RISK_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) onChunk(content);
    }
  }
  
  // ==================== HELPER METHODS ====================
  
  isProviderAvailable(provider) {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return !!geminiClient;
      case 'claude':
      case 'anthropic':
        return !!anthropicClient;
      case 'openai':
      case 'gpt':
        return !!openaiClient;
      case 'xai':
      case 'grok':
        return !!xaiClient;
      default:
        return false;
    }
  }
  
  getAvailableProviders() {
    return {
      gemini: !!geminiClient,
      claude: !!anthropicClient,
      openai: !!openaiClient,
      xai: !!xaiClient
    };
  }
}

module.exports = new AIService();

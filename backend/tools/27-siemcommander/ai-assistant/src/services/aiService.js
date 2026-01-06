const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let openaiClient, anthropicClient, googleAI;

// Initialize AI providers
function initializeAIProviders() {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized');
  }

  if (process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('✅ Anthropic Claude initialized');
  }

  if (process.env.GOOGLE_AI_API_KEY) {
    googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    console.log('✅ Google Gemini initialized');
  }
}

// Process AI message with selected provider
async function processAIMessage({ message, provider, model, settings, conversationHistory, toolConfig, onToken, onFunctionCall }) {
  
  switch (provider) {
    case 'gemini':
      return await processWithGemini({ message, model, settings, conversationHistory, toolConfig, onToken, onFunctionCall });
    
    case 'claude':
      return await processWithClaude({ message, model, settings, conversationHistory, toolConfig, onToken, onFunctionCall });
    
    case 'gpt':
      return await processWithOpenAI({ message, model, settings, conversationHistory, toolConfig, onToken, onFunctionCall });
    
    case 'grok':
      return await processWithGrok({ message, model, settings, conversationHistory, toolConfig, onToken });
    
    case 'mistral':
      return await processWithMistral({ message, model, settings, conversationHistory, toolConfig, onToken });
    
    case 'llama':
      return await processWithLlama({ message, model, settings, conversationHistory, toolConfig, onToken });
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// Google Gemini implementation
async function processWithGemini({ message, model = 'gemini-2.0-flash-exp', settings, conversationHistory, toolConfig, onToken, onFunctionCall }) {
  if (!googleAI) throw new Error('Google AI not initialized');

  const geminiModel = googleAI.getGenerativeModel({ 
    model,
    systemInstruction: toolConfig.systemPrompt
  });

  // Build conversation history
  const history = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const chat = geminiModel.startChat({ history });

  // Stream response
  const result = await chat.sendMessageStream(message);

  let fullText = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    if (onToken) onToken(chunkText);
  }

  return {
    message: fullText,
    model,
    provider: 'gemini',
    tokensUsed: null // Gemini doesn't return token count in streaming
  };
}

// Anthropic Claude implementation
async function processWithClaude({ message, model = 'claude-3-5-sonnet-20241022', settings, conversationHistory, toolConfig, onToken, onFunctionCall }) {
  if (!anthropicClient) throw new Error('Anthropic not initialized');

  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const stream = await anthropicClient.messages.stream({
    model,
    max_tokens: settings.maxTokens || 4096,
    temperature: settings.temperature || 0.7,
    system: toolConfig.systemPrompt,
    messages
  });

  let fullText = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      fullText += chunk.delta.text;
      if (onToken) onToken(chunk.delta.text);
    }
  }

  return {
    message: fullText,
    model,
    provider: 'claude',
    tokensUsed: null
  };
}

// OpenAI GPT implementation
async function processWithOpenAI({ message, model = 'gpt-4o', settings, conversationHistory, toolConfig, onToken, onFunctionCall }) {
  if (!openaiClient) throw new Error('OpenAI not initialized');

  const messages = [
    { role: 'system', content: toolConfig.systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const stream = await openaiClient.chat.completions.create({
    model,
    messages,
    temperature: settings.temperature || 0.7,
    max_tokens: settings.maxTokens || 4096,
    stream: true
  });

  let fullText = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullText += content;
      if (onToken) onToken(content);
    }
  }

  return {
    message: fullText,
    model,
    provider: 'gpt',
    tokensUsed: null
  };
}

// Placeholder implementations for other providers
async function processWithGrok({ message, model, settings, conversationHistory, toolConfig, onToken }) {
  // xAI Grok implementation (similar to OpenAI)
  return {
    message: `[Grok] ${message} - Provider integration pending`,
    model: model || 'grok-2-1212',
    provider: 'grok'
  };
}

async function processWithMistral({ message, model, settings, conversationHistory, toolConfig, onToken }) {
  // Mistral AI implementation
  return {
    message: `[Mistral] ${message} - Provider integration pending`,
    model: model || 'mistral-large',
    provider: 'mistral'
  };
}

async function processWithLlama({ message, model, settings, conversationHistory, toolConfig, onToken }) {
  // Meta Llama via Together AI implementation
  return {
    message: `[Llama] ${message} - Provider integration pending`,
    model: model || 'llama-3.3-70b',
    provider: 'llama'
  };
}

module.exports = {
  initializeAIProviders,
  processAIMessage
};

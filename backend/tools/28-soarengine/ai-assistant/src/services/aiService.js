const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

class AIService {
  constructor() {
    // Initialize AI clients
    this.gemini = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;

    this.claude = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;

    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async streamChatResponse(provider, userMessage, systemPrompt, history, functions, onChunk) {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return await this.streamGemini(userMessage, systemPrompt, history, functions, onChunk);
      case 'claude':
        return await this.streamClaude(userMessage, systemPrompt, history, functions, onChunk);
      case 'gpt':
      case 'openai':
        return await this.streamOpenAI(userMessage, systemPrompt, history, functions, onChunk);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async streamGemini(userMessage, systemPrompt, history, functions, onChunk) {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: history.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessageStream(userMessage);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          onChunk({ type: 'text', content: text });
        }
      }

    } catch (error) {
      console.error('Gemini streaming error:', error);
      throw error;
    }
  }

  async streamClaude(userMessage, systemPrompt, history, functions, onChunk) {
    if (!this.claude) {
      throw new Error('Claude API key not configured');
    }

    try {
      const messages = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));

      const stream = await this.claude.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        tools: functions ? this.convertFunctionsToTools(functions) : undefined
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
          onChunk({ type: 'text', content: chunk.delta.text });
        } else if (chunk.type === 'content_block_start' && chunk.content_block?.type === 'tool_use') {
          onChunk({
            type: 'functionCall',
            data: {
              name: chunk.content_block.name,
              arguments: chunk.content_block.input
            }
          });
        }
      }

    } catch (error) {
      console.error('Claude streaming error:', error);
      throw error;
    }
  }

  async streamOpenAI(userMessage, systemPrompt, history, functions, onChunk) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        tools: functions ? this.convertFunctionsToOpenAITools(functions) : undefined,
        stream: true
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          onChunk({ type: 'text', content: delta.content });
        }

        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            if (toolCall.function) {
              onChunk({
                type: 'functionCall',
                data: {
                  name: toolCall.function.name,
                  arguments: JSON.parse(toolCall.function.arguments)
                }
              });
            }
          }
        }
      }

    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }

  convertFunctionsToTools(functions) {
    return functions.map(func => ({
      name: func.name,
      description: func.description,
      input_schema: func.parameters
    }));
  }

  convertFunctionsToOpenAITools(functions) {
    return functions.map(func => ({
      type: 'function',
      function: {
        name: func.name,
        description: func.description,
        parameters: func.parameters
      }
    }));
  }
}

module.exports = new AIService();

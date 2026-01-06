const axios = require('axios');
require('dotenv').config();

class AIService {
  constructor() {
    this.apiKeys = {
      gemini: process.env.GEMINI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      xai: process.env.XAI_API_KEY
    };
    
    this.systemPrompt = `You are MAULA.AI PolicyEngine, an expert AI assistant specialized in security policy management, governance, risk, and compliance (GRC).

You have deep expertise in:
- Security policy development and management
- Compliance frameworks (NIST 800-53, ISO 27001, CIS Controls, PCI-DSS, HIPAA, GDPR, SOX, COBIT, SOC2)
- Policy-as-code implementation (OPA, Sentinel, AWS SCP)
- Risk assessment and exception management
- Compliance automation and monitoring
- Policy lifecycle management (draft → review → approval → publish → enforce)

You provide:
✓ Policy creation and analysis
✓ Framework mapping and gap analysis
✓ Compliance checking and violation detection
✓ Exception risk assessment
✓ Policy documentation generation
✓ Policy-as-code conversion
✓ Policy effectiveness assessment
✓ Remediation recommendations

Always be precise, compliance-focused, and provide actionable guidance.`;
  }
  
  async generateResponse(query, context, onChunk, onComplete) {
    try {
      const provider = process.env.AI_PROVIDER || 'gemini';
      
      switch (provider) {
        case 'gemini':
          await this.geminiStream(query, context, onChunk, onComplete);
          break;
        case 'anthropic':
          await this.anthropicStream(query, context, onChunk, onComplete);
          break;
        case 'openai':
          await this.openaiStream(query, context, onChunk, onComplete);
          break;
        case 'xai':
          await this.xaiStream(query, context, onChunk, onComplete);
          break;
        default:
          await this.geminiStream(query, context, onChunk, onComplete);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      onChunk({ error: error.message });
      onComplete();
    }
  }
  
  async geminiStream(query, context, onChunk, onComplete) {
    if (!this.apiKeys.gemini) {
      onChunk({ error: 'Gemini API key not configured' });
      onComplete();
      return;
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${this.apiKeys.gemini}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            { text: this.systemPrompt },
            { text: `Context: ${JSON.stringify(context)}` },
            { text: `Query: ${query}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };
    
    try {
      const response = await axios.post(url, requestBody, {
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const jsonLine = JSON.parse(line);
            if (jsonLine.candidates && jsonLine.candidates[0]?.content?.parts) {
              const text = jsonLine.candidates[0].content.parts[0]?.text;
              if (text) {
                onChunk({ text, provider: 'gemini' });
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      });
      
      response.data.on('end', () => {
        onComplete();
      });
      
      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        onChunk({ error: error.message });
        onComplete();
      });
      
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      onChunk({ error: 'Gemini API error' });
      onComplete();
    }
  }
  
  async anthropicStream(query, context, onChunk, onComplete) {
    if (!this.apiKeys.anthropic) {
      onChunk({ error: 'Anthropic API key not configured' });
      onComplete();
      return;
    }
    
    const url = 'https://api.anthropic.com/v1/messages';
    
    try {
      const response = await axios.post(url, {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        temperature: 0.7,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}`
          }
        ],
        stream: true
      }, {
        headers: {
          'x-api-key': this.apiKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          try {
            const jsonData = JSON.parse(line.replace('data: ', ''));
            if (jsonData.type === 'content_block_delta' && jsonData.delta?.text) {
              onChunk({ text: jsonData.delta.text, provider: 'anthropic' });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
      
      response.data.on('end', () => {
        onComplete();
      });
      
    } catch (error) {
      console.error('Anthropic API error:', error.response?.data || error.message);
      onChunk({ error: 'Anthropic API error' });
      onComplete();
    }
  }
  
  async openaiStream(query, context, onChunk, onComplete) {
    if (!this.apiKeys.openai) {
      onChunk({ error: 'OpenAI API key not configured' });
      onComplete();
      return;
    }
    
    const url = 'https://api.openai.com/v1/chat/completions';
    
    try {
      const response = await axios.post(url, {
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          
          try {
            const jsonData = JSON.parse(line.replace('data: ', ''));
            const text = jsonData.choices?.[0]?.delta?.content;
            if (text) {
              onChunk({ text, provider: 'openai' });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
      
      response.data.on('end', () => {
        onComplete();
      });
      
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      onChunk({ error: 'OpenAI API error' });
      onComplete();
    }
  }
  
  async xaiStream(query, context, onChunk, onComplete) {
    if (!this.apiKeys.xai) {
      onChunk({ error: 'xAI API key not configured' });
      onComplete();
      return;
    }
    
    const url = 'https://api.x.ai/v1/chat/completions';
    
    try {
      const response = await axios.post(url, {
        model: 'grok-beta',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.xai}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          
          try {
            const jsonData = JSON.parse(line.replace('data: ', ''));
            const text = jsonData.choices?.[0]?.delta?.content;
            if (text) {
              onChunk({ text, provider: 'xai' });
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });
      
      response.data.on('end', () => {
        onComplete();
      });
      
    } catch (error) {
      console.error('xAI API error:', error.response?.data || error.message);
      onChunk({ error: 'xAI API error' });
      onComplete();
    }
  }
}

module.exports = AIService;

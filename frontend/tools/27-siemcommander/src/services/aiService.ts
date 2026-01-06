import { TOOL_CONFIG, AI_WEBSOCKET_URL } from '../config';

export class AIService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(AI_WEBSOCKET_URL);

        this.ws.onopen = () => {
          console.log('🔗 Neural Link established');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📥 Received:', data.type);

          // Call registered handlers
          this.messageHandlers.forEach((handler) => {
            handler(data);
          });
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 Neural Link disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, 2000 * this.reconnectAttempts);
    }
  }

  onMessage(handler: (data: any) => void): () => void {
    const id = Math.random().toString(36);
    this.messageHandlers.set(id, handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(id);
    };
  }

  sendMessage(message: string, provider: string, model: string, settings: any, conversationHistory: any[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'ai_message',
      message,
      provider,
      model,
      settings: {
        ...settings,
        systemPrompt: TOOL_CONFIG.systemPrompt,
        functions: TOOL_CONFIG.functions
      },
      conversationHistory
    }));
  }

  callFunction(functionName: string, parameters: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'function_call',
      functionName,
      parameters
    }));
  }

  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const aiService = new AIService();

/**
 * SSLMonitor AI Service
 * WebSocket client for Neural Link AI interface
 */

const WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:6025/maula-ai';

export interface AIMessage {
  type: 'ai_message' | 'function_call' | 'ping';
  content?: string;
  functionName?: string;
  parameters?: Record<string, unknown>;
  provider?: string;
  model?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface AIResponse {
  type: 'connected' | 'token' | 'function_result' | 'error' | 'typing' | 'pong';
  content?: string;
  message?: string;
  done?: boolean;
  result?: unknown;
  success?: boolean;
  error?: string;
  status?: boolean;
  capabilities?: string[];
}

type MessageHandler = (response: AIResponse) => void;

class AIService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionPromise: Promise<void> | null = null;

  /**
   * Connect to the AI WebSocket server
   */
  connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('🔗 Connected to SSLMonitor AI Assistant');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: AIResponse = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(response));
          } catch (error) {
            console.error('Failed to parse AI response:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from AI Assistant');
          this.connectionPromise = null;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Attempt to reconnect after disconnection
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  /**
   * Disconnect from the AI server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Send a message to the AI
   */
  async sendMessage(
    content: string, 
    options?: { 
      provider?: string; 
      model?: string;
      conversationHistory?: Array<{ role: string; content: string }>;
    }
  ): Promise<void> {
    await this.ensureConnected();
    
    const message: AIMessage = {
      type: 'ai_message',
      content,
      provider: options?.provider || 'gemini',
      model: options?.model || 'gemini-2.0-flash-exp',
      conversationHistory: options?.conversationHistory || []
    };

    this.ws?.send(JSON.stringify(message));
  }

  /**
   * Call an AI function
   */
  async callFunction(functionName: string, parameters: Record<string, unknown>): Promise<void> {
    await this.ensureConnected();
    
    const message: AIMessage = {
      type: 'function_call',
      functionName,
      parameters
    };

    this.ws?.send(JSON.stringify(message));
  }

  /**
   * Add a message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Ensure connection is established
   */
  private async ensureConnected(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send ping to keep connection alive
   */
  ping(): void {
    if (this.isConnected()) {
      this.ws?.send(JSON.stringify({ type: 'ping' }));
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;

// PasswordVault AI Service
// WebSocket client for real-time AI assistance

const WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:6033/maula/ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: FunctionCall;
  functionResult?: FunctionResult;
}

export interface FunctionCall {
  name: string;
  parameters: Record<string, unknown>;
}

export interface FunctionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AIServiceCallbacks {
  onStream?: (content: string) => void;
  onComplete?: (fullResponse: string) => void;
  onFunctionCall?: (functionName: string, parameters: Record<string, unknown>) => void;
  onFunctionResult?: (functionName: string, result: unknown) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class PasswordVaultAIService {
  private ws: WebSocket | null = null;
  private callbacks: AIServiceCallbacks = {};
  private conversationHistory: ChatMessage[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  
  constructor() {
    this.connect();
  }
  
  connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);
        
        this.ws.onopen = () => {
          console.log('Connected to PasswordVault AI');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.callbacks.onConnect?.();
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onclose = () => {
          console.log('Disconnected from PasswordVault AI');
          this.isConnecting = false;
          this.callbacks.onDisconnect?.();
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('PasswordVault AI WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }
  
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'stream':
          this.callbacks.onStream?.(message.content);
          break;
          
        case 'complete':
          this.callbacks.onComplete?.(message.content);
          this.conversationHistory.push({
            role: 'assistant',
            content: message.content,
            timestamp: new Date(),
          });
          break;
          
        case 'function_call':
          this.callbacks.onFunctionCall?.(message.function, message.parameters);
          break;
          
        case 'function_result':
          this.callbacks.onFunctionResult?.(message.function, message.result);
          break;
          
        case 'error':
          this.callbacks.onError?.(new Error(message.message));
          break;
      }
    } catch (error) {
      console.error('Error parsing AI message:', error);
    }
  }
  
  setCallbacks(callbacks: AIServiceCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  async sendMessage(content: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }
    
    this.conversationHistory.push({
      role: 'user',
      content,
      timestamp: new Date(),
    });
    
    this.ws?.send(JSON.stringify({
      type: 'chat',
      content,
      conversationHistory: this.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    }));
  }
  
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
  
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let aiServiceInstance: PasswordVaultAIService | null = null;

export function getAIService(): PasswordVaultAIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new PasswordVaultAIService();
  }
  return aiServiceInstance;
}

export default PasswordVaultAIService;

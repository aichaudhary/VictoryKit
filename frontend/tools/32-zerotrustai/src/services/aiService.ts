interface ZeroTrustFunction {
  name: string;
  parameters: any;
}

interface AIMessage {
  type: string;
  requestId?: string;
  functions?: ZeroTrustFunction[];
  query?: string;
  context?: any;
}

class ZeroTrustAIService {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectInterval: number = 5000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  
  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:6032';
    this.wsUrl = `${wsProtocol}//${wsHost}/maula-ai`;
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('🤖 Connected to ZeroTrustAI Assistant');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('🔌 Disconnected from AI Assistant');
          setTimeout(() => this.reconnect(), this.reconnectInterval);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  private reconnect(): void {
    console.log('🔄 Attempting to reconnect...');
    this.connect().catch(() => {
      setTimeout(() => this.reconnect(), this.reconnectInterval);
    });
  }
  
  private handleMessage(data: any): void {
    const { type, requestId } = data;
    
    const handler = this.messageHandlers.get(requestId || 'default');
    if (handler) {
      handler(data);
    }
  }
  
  async executeFunctions(functions: ZeroTrustFunction[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error('Request timeout'));
      }, 30000);
      
      this.messageHandlers.set(requestId, (data) => {
        clearTimeout(timeout);
        this.messageHandlers.delete(requestId);
        
        if (data.type === 'function_result') {
          resolve(data.results);
        } else if (data.type === 'error') {
          reject(new Error(data.error));
        }
      });
      
      const message: AIMessage = {
        type: 'function_call',
        requestId,
        functions
      };
      
      this.ws.send(JSON.stringify(message));
    });
  }
  
  async chat(query: string, context?: any, onChunk?: (chunk: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      const requestId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let fullResponse = '';
      
      const timeout = setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error('Chat timeout'));
      }, 60000);
      
      this.messageHandlers.set(requestId, (data) => {
        if (data.type === 'stream_chunk') {
          fullResponse += data.chunk;
          if (onChunk) {
            onChunk(data.chunk);
          }
        } else if (data.type === 'stream_end') {
          clearTimeout(timeout);
          this.messageHandlers.delete(requestId);
          resolve(fullResponse);
        } else if (data.type === 'error') {
          clearTimeout(timeout);
          this.messageHandlers.delete(requestId);
          reject(new Error(data.error));
        }
      });
      
      const message: AIMessage = {
        type: 'chat',
        requestId,
        query,
        context
      };
      
      this.ws.send(JSON.stringify(message));
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new ZeroTrustAIService();

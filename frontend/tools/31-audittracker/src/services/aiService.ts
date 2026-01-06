interface AuditFunction {
  name: string;
  parameters: any;
}

interface AIMessage {
  type: string;
  requestId?: string;
  functions?: AuditFunction[];
  query?: string;
  context?: any;
}

class AuditAIService {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectInterval: number = 5000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  
  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:6031';
    this.wsUrl = `${wsProtocol}//${wsHost}/maula-ai`;
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('🤖 Connected to AuditTracker AI Assistant');
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
  
  async executeFunctions(functions: AuditFunction[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.messageHandlers.set(requestId, (data) => {
        if (data.type === 'function_result') {
          this.messageHandlers.delete(requestId);
          resolve(data.results);
        } else if (data.type === 'error') {
          this.messageHandlers.delete(requestId);
          reject(new Error(data.error));
        }
      });
      
      const message: AIMessage = {
        type: 'function_call',
        requestId,
        functions
      };
      
      this.ws.send(JSON.stringify(message));
      
      setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  }
  
  async streamChat(query: string, context: any, onChunk: (chunk: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.messageHandlers.set(requestId, (data) => {
        if (data.type === 'stream_chunk') {
          onChunk(data.chunk);
        } else if (data.type === 'stream_end') {
          this.messageHandlers.delete(requestId);
          resolve();
        } else if (data.type === 'error') {
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
      
      setTimeout(() => {
        this.messageHandlers.delete(requestId);
        reject(new Error('Request timeout'));
      }, 120000);
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

export const auditAIService = new AuditAIService();
export default auditAIService;

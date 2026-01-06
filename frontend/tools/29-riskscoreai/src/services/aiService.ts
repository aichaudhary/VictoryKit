const AI_WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:6029/maula-ai';

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'xai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface StreamChunkCallback {
  (chunk: string): void;
}

export interface AIServiceEvents {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  onStreamChunk?: StreamChunkCallback;
  onStreamEnd?: (fullResponse: string) => void;
  onFunctionResult?: (result: any) => void;
}

class AIService {
  private ws: WebSocket | null = null;
  private clientId: string | null = null;
  private sessionId: string | null = null;
  private conversationHistory: ChatMessage[] = [];
  private events: AIServiceEvents = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(events: AIServiceEvents = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      this.events = events;

      try {
        this.ws = new WebSocket(AI_WS_URL);

        this.ws.onopen = () => {
          console.log('✅ Connected to RiskScoreAI Assistant');
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data, resolve, reject);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.events.onError?.(new Error('WebSocket connection error'));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ Disconnected from RiskScoreAI Assistant');
          this.events.onDisconnected?.();
          this.attemptReconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any, resolve?: Function, reject?: Function) {
    switch (data.type) {
      case 'connection_established':
        this.clientId = data.clientId;
        this.sessionId = data.sessionId;
        console.log(`🔗 Session established: ${this.sessionId}`);
        this.events.onConnected?.();
        resolve?.();
        break;

      case 'message_received':
        console.log('📨 Message received by server');
        break;

      case 'stream_start':
        console.log('📡 Stream started');
        break;

      case 'stream_chunk':
        this.events.onStreamChunk?.(data.content);
        break;

      case 'stream_end':
        console.log('✅ Stream completed');
        this.events.onStreamEnd?.(data.fullResponse);
        this.conversationHistory.push({
          role: 'assistant',
          content: data.fullResponse,
          timestamp: data.timestamp
        });
        break;

      case 'chat_response':
        this.conversationHistory.push({
          role: 'assistant',
          content: data.content,
          timestamp: data.timestamp
        });
        break;

      case 'function_executing':
        console.log(`⚙️  Executing function: ${data.function_name}`);
        break;

      case 'function_result':
        console.log(`✅ Function completed: ${data.function_name}`);
        this.events.onFunctionResult?.(data.result);
        break;

      case 'function_error':
        console.error(`❌ Function error: ${data.function_name}`, data.error);
        this.events.onError?.(new Error(data.error));
        break;

      case 'error':
        console.error('Server error:', data.error);
        this.events.onError?.(new Error(data.error));
        break;
    }
  }

  async sendMessage(
    message: string,
    provider: AIProvider = 'gemini',
    model?: string,
    stream: boolean = true
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    this.ws.send(JSON.stringify({
      type: 'chat_message',
      message,
      provider,
      model,
      stream
    }));
  }

  async callFunction(functionName: string, parameters: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'function_call',
      function_name: functionName,
      parameters
    }));
  }

  async streamRequest(
    prompt: string,
    provider: AIProvider = 'gemini',
    model?: string
  ): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'stream_request',
      prompt,
      provider,
      model
    }));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.events).catch(console.error);
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.events.onError?.(new Error('Failed to reconnect to AI Assistant'));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.clientId = null;
    this.sessionId = null;
    this.conversationHistory = [];
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getClientId(): string | null {
    return this.clientId;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  // ==================== RISK ASSESSMENT HELPERS ====================

  async calculateAssetRisk(assetData: any): Promise<void> {
    return this.callFunction('calculate_asset_risk', assetData);
  }

  async calculateUserRisk(userData: any): Promise<void> {
    return this.callFunction('calculate_user_risk', userData);
  }

  async assessThreatRisk(threatData: any): Promise<void> {
    return this.callFunction('assess_threat_risk', threatData);
  }

  async scoreVulnerability(vulnData: any): Promise<void> {
    return this.callFunction('score_vulnerability', vulnData);
  }

  async calculateVendorRisk(vendorData: any): Promise<void> {
    return this.callFunction('calculate_vendor_risk', vendorData);
  }

  async generateRiskHeatmap(params: any): Promise<void> {
    return this.callFunction('generate_risk_heatmap', params);
  }

  async predictRiskTrajectory(params: any): Promise<void> {
    return this.callFunction('predict_risk_trajectory', params);
  }

  async aggregateRiskScore(params: any): Promise<void> {
    return this.callFunction('aggregate_risk_score', params);
  }

  async analyzeRiskTrends(params: any): Promise<void> {
    return this.callFunction('analyze_risk_trends', params);
  }

  async createCustomRiskModel(modelData: any): Promise<void> {
    return this.callFunction('create_custom_risk_model', modelData);
  }
}

export default new AIService();

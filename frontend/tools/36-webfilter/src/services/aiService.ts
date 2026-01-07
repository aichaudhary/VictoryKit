/**
 * WebFilter AI Service
 * WebSocket client for real-time AI assistance
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6036';

export interface AIMessage {
  type: 'request' | 'response' | 'error' | 'status';
  function?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

class WebFilterAIService {
  private ws: WebSocket | null = null;
  private messageQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[WebFilter AI] Connected to AI Assistant');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('[WebFilter AI] Disconnected from AI Assistant');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[WebFilter AI] WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: AIMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebFilter AI] Failed to parse message:', error);
        }
      };
    } catch (error) {
      console.error('[WebFilter AI] Connection error:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebFilter AI] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebFilter AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: AIMessage): void {
    if (message.type === 'response' && this.messageQueue.length > 0) {
      const { resolve } = this.messageQueue.shift()!;
      resolve({
        success: true,
        data: message.result,
        executionTime: message.result?.executionTime
      });
    } else if (message.type === 'error' && this.messageQueue.length > 0) {
      const { reject } = this.messageQueue.shift()!;
      reject(new Error(message.error || 'Unknown AI error'));
    }
  }

  private sendMessage(functionName: string, parameters: Record<string, any>): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const message: AIMessage = {
        type: 'request',
        function: functionName,
        parameters,
        timestamp: new Date().toISOString()
      };

      this.messageQueue.push({ resolve, reject });
      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        const index = this.messageQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.messageQueue.splice(index, 1);
          reject(new Error('AI request timeout'));
        }
      }, 30000);
    });
  }

  // AI Function: Analyze URL Threat
  async analyzeUrlThreat(params: {
    url: string;
    deepScan?: boolean;
    checkReputation?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('analyze_url_threat', params);
  }

  // AI Function: Classify Content Category
  async classifyContentCategory(params: {
    url: string;
    content?: string;
    includeImages?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('classify_content_category', params);
  }

  // AI Function: Detect Bypass Attempt
  async detectBypassAttempt(params: {
    url: string;
    userAgent?: string;
    headers?: Record<string, string>;
  }): Promise<AIResponse> {
    return this.sendMessage('detect_bypass_attempt', params);
  }

  // AI Function: Analyze User Behavior
  async analyzeUserBehavior(params: {
    userId: string;
    timePeriod: 'hour' | 'day' | 'week' | 'month';
    includePatterns?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('analyze_user_behavior', params);
  }

  // AI Function: Generate Policy Recommendation
  async generatePolicyRecommendation(params: {
    organizationType: 'enterprise' | 'education' | 'government' | 'healthcare';
    currentThreats?: any[];
    complianceRequirements?: string[];
  }): Promise<AIResponse> {
    return this.sendMessage('generate_policy_recommendation', params);
  }

  // AI Function: Investigate Suspicious Activity
  async investigateSuspiciousActivity(params: {
    activityId: string;
    timeRange?: { start: string; end: string };
    correlateUsers?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('investigate_suspicious_activity', params);
  }

  // AI Function: Assess Content Risk
  async assessContentRisk(params: {
    url: string;
    contentType?: string;
    organizationProfile?: 'high_security' | 'standard' | 'permissive';
  }): Promise<AIResponse> {
    return this.sendMessage('assess_content_risk', params);
  }

  // AI Function: Analyze Bandwidth Usage
  async analyzeBandwidthUsage(params: {
    userId?: string;
    timePeriod: 'hour' | 'day' | 'week' | 'month';
    categorize?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('analyze_bandwidth_usage', params);
  }

  // AI Function: Detect Data Exfiltration
  async detectDataExfiltration(params: {
    userId: string;
    dataVolume?: number;
    destination: string;
    sensitivity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    return this.sendMessage('detect_data_exfiltration', params);
  }

  // AI Function: Summarize Filtering Activity
  async summarizeFilteringActivity(params: {
    timePeriod: 'day' | 'week' | 'month' | 'quarter';
    includeUsers?: boolean;
    includeThreats?: boolean;
    includeTrends?: boolean;
  }): Promise<AIResponse> {
    return this.sendMessage('summarize_filtering_activity', params);
  }

  // Utility: Check connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Utility: Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Utility: Reconnect manually
  reconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Export singleton instance
export const aiService = new WebFilterAIService();
export default aiService;

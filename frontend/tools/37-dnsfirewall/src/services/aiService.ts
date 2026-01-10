const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6037';

type MessageHandler = (data: any) => void;

class DNSFirewallAIService {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('🔌 Connected to DNSFirewall AI Assistant');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          
          if (message.type === 'connected') {
            console.log('✅ AI Assistant ready:', message.availableFunctions);
          } else if (message.type === 'function_result' || message.type === 'ai_response') {
            const handler = this.messageHandlers.get(message.functionName || 'default');
            if (handler) {
              handler(message);
            }
          } else if (message.type === 'error') {
            console.error('❌ AI Error:', message.error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('👋 Disconnected from AI Assistant');
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
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private sendMessage(functionName: string, parameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.messageHandlers.set(functionName, (response) => {
        this.messageHandlers.delete(functionName);
        if (response.type === 'error') {
          reject(new Error(response.error));
        } else {
          resolve(response.result || response.content);
        }
      });

      this.ws.send(JSON.stringify({
        type: 'function_call',
        functionName,
        parameters
      }));
    });
  }

  // AI Functions
  async analyzeDNSQuery(params: {
    domain: string;
    queryType?: string;
    clientIP?: string;
    includeHistory?: boolean;
  }) {
    return this.sendMessage('analyze_dns_query', params);
  }

  async detectDNSTunneling(params: {
    domain: string;
    queryPattern: any;
    sensitivity?: string;
  }) {
    return this.sendMessage('detect_dns_tunneling', params);
  }

  async classifyDomainThreat(params: {
    domain: string;
    checkSubdomains?: boolean;
    deepAnalysis?: boolean;
  }) {
    return this.sendMessage('classify_domain_threat', params);
  }

  async analyzeDNSSECStatus(params: {
    domain: string;
    verifyChain?: boolean;
    checkAlgorithms?: boolean;
  }) {
    return this.sendMessage('analyze_dnssec_status', params);
  }

  async generateBlockingPolicy(params: {
    organizationType: string;
    threatCategories: string[];
    customRules?: any[];
  }) {
    return this.sendMessage('generate_blocking_policy', params);
  }

  async analyzeQueryPatterns(params: {
    timeRange: string;
    clientFilter?: string;
    includeBaseline?: boolean;
  }) {
    return this.sendMessage('analyze_query_patterns', params);
  }

  async detectDGADomains(params: {
    domain: string;
    algorithmChecks?: string[];
    confidence?: number;
  }) {
    return this.sendMessage('detect_dga_domains', params);
  }

  async analyzeCachePerformance(params: {
    timeWindow: string;
    includeRecommendations?: boolean;
  }) {
    return this.sendMessage('analyze_cache_performance', params);
  }

  async generateThreatReport(params: {
    reportType: string;
    startDate: string;
    endDate: string;
    includeGraphs?: boolean;
  }) {
    return this.sendMessage('generate_threat_report', params);
  }

  async optimizeResolverConfig(params: {
    currentConfig: any;
    trafficProfile: any;
    goals?: string[];
  }) {
    return this.sendMessage('optimize_resolver_config', params);
  }

  // Chat with AI
  async chat(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.messageHandlers.set('default', (response) => {
        this.messageHandlers.delete('default');
        if (response.type === 'error') {
          reject(new Error(response.error));
        } else {
          resolve(response.content);
        }
      });

      this.ws.send(JSON.stringify({
        type: 'chat',
        content: message
      }));
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }
}

export default new DNSFirewallAIService();

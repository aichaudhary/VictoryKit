const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6038';

type MessageHandler = (data: any) => void;

class FirewallAIAssistantService {
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
          console.log('🔌 Connected to FirewallAI Assistant');
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

  async analyzeTrafficPattern(params: {
    timeRange: string;
    segments?: string[];
    threshold?: number;
    includeBaselines?: boolean;
  }) {
    return this.sendMessage('analyze_traffic_pattern', params);
  }

  async generateFirewallPolicy(params: {
    assets: any[];
    riskLevel: string;
    controls?: string[];
    changeWindow?: string;
  }) {
    return this.sendMessage('generate_firewall_policy', params);
  }

  async simulateRuleChange(params: {
    rules: any[];
    trafficProfile: any;
    blastRadius?: string;
    rollbackPlan?: string;
  }) {
    return this.sendMessage('simulate_rule_change', params);
  }

  async detectIntrusionCampaign(params: {
    events: any[];
    timeHorizon: string;
    includeMITRE?: boolean;
    sensitivity?: string;
  }) {
    return this.sendMessage('detect_intrusion_campaign', params);
  }

  async recommendMicrosegmentation(params: {
    assets: any[];
    flows: any[];
    sensitivityTags?: string[];
    guardrails?: string[];
  }) {
    return this.sendMessage('recommend_microsegmentation', params);
  }

  async optimizeWAFRules(params: {
    application: string;
    attackVectors?: string[];
    falsePositivePatterns?: string[];
    performanceBudget?: number;
  }) {
    return this.sendMessage('optimize_waf_rules', params);
  }

  async generateIncidentRunbook(params: {
    incidentType: string;
    severity: string;
    affectedAssets: any[];
    dependencies?: any[];
  }) {
    return this.sendMessage('generate_incident_runbook', params);
  }

  async enrichThreatIntel(params: {
    indicator: string;
    indicatorType: string;
    sources?: string[];
    confidenceFloor?: number;
  }) {
    return this.sendMessage('enrich_threat_intel', params);
  }

  async assessComplianceGap(params: {
    framework: string;
    controls: any[];
    evidence?: any[];
    exceptions?: any[];
  }) {
    return this.sendMessage('assess_compliance_gap', params);
  }

  async forecastCapacity(params: {
    currentUtilization: any;
    growthRate: number;
    seasonality?: any[];
    attackPatterns?: any[];
  }) {
    return this.sendMessage('forecast_capacity', params);
  }

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

export default new FirewallAIAssistantService();
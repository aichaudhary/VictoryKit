/**
 * DDOSShield AI Service
 * Tool #24 - WebSocket client for AI-powered DDoS protection
 */

import { getWsUrl, getSystemPrompt, getAIFunctions } from './config';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: {
    name: string;
    parameters: Record<string, unknown>;
  };
  functionResult?: {
    success: boolean;
    data: unknown;
    error?: string;
  };
}

export interface AISession {
  sessionId: string;
  clientId: string;
  connected: boolean;
  messages: AIMessage[];
}

type MessageHandler = (message: AIMessage) => void;
type ConnectionHandler = (session: AISession) => void;
type ErrorHandler = (error: Error) => void;

class DDOSShieldAIService {
  private ws: WebSocket | null = null;
  private session: AISession | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<AISession> {
    return new Promise((resolve, reject) => {
      try {
        const url = getWsUrl();
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('[DDOSShield AI] Connected');
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message, resolve);
          } catch (error) {
            console.error('[DDOSShield AI] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[DDOSShield AI] WebSocket error:', error);
          const err = new Error('WebSocket connection error');
          this.errorHandlers.forEach(handler => handler(err));
          reject(err);
        };

        this.ws.onclose = () => {
          console.log('[DDOSShield AI] Disconnected');
          if (this.session) {
            this.session.connected = false;
          }
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: { type: string; payload?: Record<string, unknown>; clientId?: string }, resolve?: (session: AISession) => void) {
    switch (message.type) {
      case 'connected':
        this.session = {
          sessionId: crypto.randomUUID(),
          clientId: message.clientId as string || crypto.randomUUID(),
          connected: true,
          messages: []
        };
        this.connectionHandlers.forEach(handler => handler(this.session!));
        if (resolve) resolve(this.session);
        break;

      case 'response':
        const payload = message.payload || message;
        const aiMessage: AIMessage = {
          id: (payload.messageId as string) || crypto.randomUUID(),
          role: 'assistant',
          content: payload.content as string,
          timestamp: new Date(),
          functionCall: payload.functionCall as AIMessage['functionCall'],
          functionResult: payload.functionResult as AIMessage['functionResult']
        };
        this.session?.messages.push(aiMessage);
        this.messageHandlers.forEach(handler => handler(aiMessage));
        break;

      case 'function_result':
        console.log('[DDOSShield AI] Function result:', message.payload);
        break;

      case 'error':
        const error = new Error((message.payload?.error as string) || 'Unknown error');
        this.errorHandlers.forEach(handler => handler(error));
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[DDOSShield AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.session = null;
    }
  }

  sendMessage(content: string, context?: Record<string, unknown>): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to DDOSShield AI');
    }

    const messageId = crypto.randomUUID();
    const userMessage: AIMessage = {
      id: messageId,
      role: 'user',
      content,
      timestamp: new Date()
    };
    this.session?.messages.push(userMessage);

    this.ws.send(JSON.stringify({
      type: 'chat',
      content,
      conversationId: this.session?.sessionId,
      context
    }));

    return messageId;
  }

  callFunction(functionName: string, parameters: Record<string, unknown>): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to DDOSShield AI');
    }

    const requestId = crypto.randomUUID();
    this.ws.send(JSON.stringify({
      type: 'function_call',
      requestId,
      functionName,
      parameters
    }));

    return requestId;
  }

  // Event handlers
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  getSession(): AISession | null {
    return this.session;
  }

  getMessages(): AIMessage[] {
    return this.session?.messages || [];
  }

  isConnected(): boolean {
    return this.session?.connected || false;
  }

  getAvailableFunctions() {
    return getAIFunctions();
  }

  getSystemPrompt(): string {
    return getSystemPrompt();
  }

  // Convenience methods for DDOSShield AI functions

  async analyzeTraffic(params: {
    timeRange: string;
    targetEndpoint?: string;
    includeGeoData?: boolean;
    baselineComparison?: boolean;
  }): Promise<string> {
    return this.callFunction('analyze_traffic', {
      timeRange: params.timeRange,
      targetEndpoint: params.targetEndpoint,
      includeGeoData: params.includeGeoData ?? true,
      baselineComparison: params.baselineComparison ?? true
    });
  }

  async detectAttack(params: {
    sensitivity?: 'low' | 'medium' | 'high';
    attackTypes?: string[];
    autoMitigate?: boolean;
    alertThreshold?: number;
  }): Promise<string> {
    return this.callFunction('detect_attack', {
      sensitivity: params.sensitivity || 'medium',
      attackTypes: params.attackTypes || ['volumetric', 'protocol', 'application'],
      autoMitigate: params.autoMitigate ?? false,
      alertThreshold: params.alertThreshold || 10000
    });
  }

  async mitigateAttack(params: {
    attackId: string;
    strategy: 'block' | 'rate-limit' | 'challenge' | 'scrub';
    duration?: string;
    targetIps?: string[];
  }): Promise<string> {
    return this.callFunction('mitigate_attack', {
      attackId: params.attackId,
      strategy: params.strategy,
      duration: params.duration || '1h',
      targetIps: params.targetIps
    });
  }

  async manageBlocklist(params: {
    action: 'add' | 'remove' | 'list' | 'import';
    ips?: string[];
    reason?: string;
    expiration?: string;
  }): Promise<string> {
    return this.callFunction('manage_blocklist', {
      action: params.action,
      ips: params.ips || [],
      reason: params.reason,
      expiration: params.expiration
    });
  }

  async configureProtection(params: {
    protectionLevel: 'basic' | 'standard' | 'aggressive';
    rateLimit?: Record<string, unknown>;
    geoBlocking?: string[];
    challengeMode?: string;
  }): Promise<string> {
    return this.callFunction('configure_protection', {
      protectionLevel: params.protectionLevel,
      rateLimit: params.rateLimit,
      geoBlocking: params.geoBlocking || [],
      challengeMode: params.challengeMode || 'javascript'
    });
  }

  async analyzeAttackPatterns(params: {
    timeRange: string;
    groupBy?: 'source' | 'type' | 'target' | 'time';
    predictWindow?: string;
    includeSignatures?: boolean;
  }): Promise<string> {
    return this.callFunction('analyze_attack_patterns', {
      timeRange: params.timeRange,
      groupBy: params.groupBy || 'type',
      predictWindow: params.predictWindow || '7d',
      includeSignatures: params.includeSignatures ?? true
    });
  }

  async getTrafficBaseline(params: {
    action: 'get' | 'update' | 'reset';
    learningPeriod?: string;
    endpoints?: string[];
    metrics?: string[];
  }): Promise<string> {
    return this.callFunction('get_traffic_baseline', {
      action: params.action,
      learningPeriod: params.learningPeriod || '7d',
      endpoints: params.endpoints || [],
      metrics: params.metrics || ['pps', 'bandwidth', 'requests']
    });
  }

  async investigateIncident(params: {
    incidentId: string;
    includeForensics?: boolean;
    traceSource?: boolean;
    generateReport?: boolean;
  }): Promise<string> {
    return this.callFunction('investigate_incident', {
      incidentId: params.incidentId,
      includeForensics: params.includeForensics ?? true,
      traceSource: params.traceSource ?? true,
      generateReport: params.generateReport ?? true
    });
  }

  async optimizeProtection(params: {
    optimizationGoal?: 'performance' | 'security' | 'balanced';
    analyzeEffectiveness?: boolean;
    autoApply?: boolean;
    constraints?: Record<string, unknown>;
  }): Promise<string> {
    return this.callFunction('optimize_protection', {
      optimizationGoal: params.optimizationGoal || 'balanced',
      analyzeEffectiveness: params.analyzeEffectiveness ?? true,
      autoApply: params.autoApply ?? false,
      constraints: params.constraints
    });
  }

  async generateReport(params: {
    reportType: 'incident' | 'protection' | 'compliance' | 'executive';
    timeRange: string;
    format?: 'pdf' | 'csv' | 'json';
    includeRecommendations?: boolean;
  }): Promise<string> {
    return this.callFunction('generate_report', {
      reportType: params.reportType,
      timeRange: params.timeRange,
      format: params.format || 'pdf',
      includeRecommendations: params.includeRecommendations ?? true
    });
  }
}

export const ddosShieldAI = new DDOSShieldAIService();
export default ddosShieldAI;

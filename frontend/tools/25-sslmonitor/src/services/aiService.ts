/**
 * SSLMonitor AI Service
 * Tool #25 - WebSocket client for AI-powered SSL/TLS monitoring
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

class SSLMonitorAIService {
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
          console.log('[SSLMonitor AI] Connected');
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message, resolve);
          } catch (error) {
            console.error('[SSLMonitor AI] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[SSLMonitor AI] WebSocket error:', error);
          const err = new Error('WebSocket connection error');
          this.errorHandlers.forEach(handler => handler(err));
          reject(err);
        };

        this.ws.onclose = () => {
          console.log('[SSLMonitor AI] Disconnected');
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
        console.log('[SSLMonitor AI] Function result:', message.payload);
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
      console.log(`[SSLMonitor AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
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
      throw new Error('Not connected to SSLMonitor AI');
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
      throw new Error('Not connected to SSLMonitor AI');
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

  // Convenience methods for SSLMonitor AI functions

  async scanCertificate(params: {
    domain: string;
    port?: number;
    includeChain?: boolean;
    checkOcsp?: boolean;
  }): Promise<string> {
    return this.callFunction('scan_certificate', {
      domain: params.domain,
      port: params.port || 443,
      includeChain: params.includeChain ?? true,
      checkOcsp: params.checkOcsp ?? true
    });
  }

  async checkExpiration(params: {
    domains?: string[];
    warningDays?: number;
    criticalDays?: number;
    includeWildcards?: boolean;
  }): Promise<string> {
    return this.callFunction('check_expiration', {
      domains: params.domains || [],
      warningDays: params.warningDays || 30,
      criticalDays: params.criticalDays || 7,
      includeWildcards: params.includeWildcards ?? true
    });
  }

  async validateChain(params: {
    domain: string;
    checkRevocation?: boolean;
    verifyIntermediate?: boolean;
    checkRootStore?: boolean;
  }): Promise<string> {
    return this.callFunction('validate_chain', {
      domain: params.domain,
      checkRevocation: params.checkRevocation ?? true,
      verifyIntermediate: params.verifyIntermediate ?? true,
      checkRootStore: params.checkRootStore ?? true
    });
  }

  async analyzeSecurity(params: {
    domain: string;
    checkProtocols?: boolean;
    checkCiphers?: boolean;
    checkVulnerabilities?: boolean;
  }): Promise<string> {
    return this.callFunction('analyze_security', {
      domain: params.domain,
      checkProtocols: params.checkProtocols ?? true,
      checkCiphers: params.checkCiphers ?? true,
      checkVulnerabilities: params.checkVulnerabilities ?? true
    });
  }

  async monitorDomain(params: {
    domain: string;
    action: 'add' | 'remove' | 'update' | 'pause';
    checkInterval?: string;
    alertContacts?: string[];
  }): Promise<string> {
    return this.callFunction('monitor_domain', {
      domain: params.domain,
      action: params.action,
      checkInterval: params.checkInterval || '6h',
      alertContacts: params.alertContacts || []
    });
  }

  async checkCompliance(params: {
    domain: string;
    standards?: ('PCI-DSS' | 'HIPAA' | 'NIST' | 'SOC2')[];
    includeHsts?: boolean;
    includeCaa?: boolean;
  }): Promise<string> {
    return this.callFunction('check_compliance', {
      domain: params.domain,
      standards: params.standards || ['PCI-DSS', 'NIST'],
      includeHsts: params.includeHsts ?? true,
      includeCaa: params.includeCaa ?? true
    });
  }

  async discoverCertificates(params: {
    target: string;
    ports?: number[];
    includeSubdomains?: boolean;
    maxDepth?: number;
  }): Promise<string> {
    return this.callFunction('discover_certificates', {
      target: params.target,
      ports: params.ports || [443, 8443],
      includeSubdomains: params.includeSubdomains ?? true,
      maxDepth: params.maxDepth || 3
    });
  }

  async compareConfigs(params: {
    domains: string[];
    compareType?: 'between-domains' | 'over-time';
    timeRange?: string;
    metrics?: string[];
  }): Promise<string> {
    return this.callFunction('compare_configs', {
      domains: params.domains,
      compareType: params.compareType || 'between-domains',
      timeRange: params.timeRange || '30d',
      metrics: params.metrics || ['grade', 'protocols', 'ciphers']
    });
  }

  async getRecommendations(params: {
    domain: string;
    priority?: 'security' | 'performance' | 'compatibility';
    includeSteps?: boolean;
    considerBrowserSupport?: boolean;
  }): Promise<string> {
    return this.callFunction('get_recommendations', {
      domain: params.domain,
      priority: params.priority || 'security',
      includeSteps: params.includeSteps ?? true,
      considerBrowserSupport: params.considerBrowserSupport ?? true
    });
  }

  async generateReport(params: {
    reportType: 'status' | 'compliance' | 'security' | 'inventory';
    domains?: string[];
    format?: 'pdf' | 'csv' | 'json' | 'html';
    includeHistory?: boolean;
  }): Promise<string> {
    return this.callFunction('generate_report', {
      reportType: params.reportType,
      domains: params.domains || [],
      format: params.format || 'pdf',
      includeHistory: params.includeHistory ?? true
    });
  }
}

export const sslMonitorAI = new SSLMonitorAIService();
export default sslMonitorAI;

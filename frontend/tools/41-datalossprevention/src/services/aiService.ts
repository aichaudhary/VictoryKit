/**
 * DLP Shield AI Service
 * WebSocket-based AI assistant for data loss prevention
 */

import { config, getAIWebSocketUrl, AIFunction } from './config';

// Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function';
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
  data: unknown;
  error?: string;
}

export interface AISession {
  id: string;
  startTime: Date;
  messages: AIMessage[];
  context: DLPContext;
}

export interface DLPContext {
  activeIncidents?: number;
  policiesEnabled?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  selectedPolicy?: string;
  currentRegulation?: string;
  scanStatus?: string;
}

type MessageHandler = (message: AIMessage) => void;
type ConnectionHandler = (connected: boolean) => void;
type ErrorHandler = (error: Error) => void;

class DLPAIService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private session: AISession | null = null;
  private pendingRequests: Map<string, { resolve: (value: AIMessage) => void; reject: (reason: Error) => void }> = new Map();

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = getAIWebSocketUrl();
        console.log(`[DLP AI] Connecting to ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('[DLP AI] Connected');
          this.reconnectAttempts = 0;
          this.initializeSession();
          this.notifyConnectionHandlers(true);
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (event) => {
          console.error('[DLP AI] WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.notifyErrorHandlers(error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log(`[DLP AI] Disconnected: ${event.code} ${event.reason}`);
          this.notifyConnectionHandlers(false);
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.session = null;
  }

  async sendMessage(content: string, context?: Partial<DLPContext>): Promise<AIMessage> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const messageId = this.generateMessageId();
      const message: AIMessage = {
        id: messageId,
        role: 'user',
        content,
        timestamp: new Date()
      };

      if (context && this.session) {
        this.session.context = { ...this.session.context, ...context };
      }

      if (this.session) {
        this.session.messages.push(message);
      }

      this.pendingRequests.set(messageId, { resolve, reject });

      this.ws.send(JSON.stringify({
        type: 'message',
        payload: {
          messageId,
          content,
          context: this.session?.context,
          sessionId: this.session?.id
        }
      }));

      this.notifyMessageHandlers(message);

      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  async executeFunction(functionName: string, parameters: Record<string, unknown>): Promise<FunctionResult> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = this.generateMessageId();

      this.pendingRequests.set(requestId, {
        resolve: (msg) => resolve(msg.functionResult!),
        reject
      });

      this.ws.send(JSON.stringify({
        type: 'function_call',
        payload: {
          requestId,
          functionName,
          parameters,
          sessionId: this.session?.id
        }
      }));

      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Function execution timeout'));
        }
      }, 60000);
    });
  }

  getAvailableFunctions(): AIFunction[] {
    return config.aiAssistant.functions;
  }

  getFunctionsByCategory(category: string): AIFunction[] {
    return config.aiAssistant.functions.filter(fn => fn.category === category);
  }

  getFunctionCategories(): string[] {
    return [...new Set(config.aiAssistant.functions.map(fn => fn.category))];
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
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

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  clearHistory(): void {
    if (this.session) {
      this.session.messages = [];
    }
  }

  private initializeSession(): void {
    this.session = {
      id: this.generateSessionId(),
      startTime: new Date(),
      messages: [],
      context: {
        riskLevel: 'low'
      }
    };
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      switch (parsed.type) {
        case 'response':
          this.handleResponse(parsed.payload);
          break;
        case 'function_result':
          this.handleFunctionResult(parsed.payload);
          break;
        case 'error':
          this.handleError(parsed.payload);
          break;
        case 'stream':
          this.handleStream(parsed.payload);
          break;
        default:
          console.warn('[DLP AI] Unknown message type:', parsed.type);
      }
    } catch (error) {
      console.error('[DLP AI] Failed to parse message:', error);
    }
  }

  private handleResponse(payload: { messageId: string; content: string; functionCall?: FunctionCall }): void {
    const message: AIMessage = {
      id: payload.messageId,
      role: 'assistant',
      content: payload.content,
      timestamp: new Date(),
      functionCall: payload.functionCall
    };

    if (this.session) {
      this.session.messages.push(message);
    }

    this.notifyMessageHandlers(message);

    const pending = this.pendingRequests.get(payload.messageId);
    if (pending) {
      this.pendingRequests.delete(payload.messageId);
      pending.resolve(message);
    }
  }

  private handleFunctionResult(payload: { requestId: string; result: FunctionResult }): void {
    const message: AIMessage = {
      id: payload.requestId,
      role: 'function',
      content: JSON.stringify(payload.result.data),
      timestamp: new Date(),
      functionResult: payload.result
    };

    if (this.session) {
      this.session.messages.push(message);
    }

    this.notifyMessageHandlers(message);

    const pending = this.pendingRequests.get(payload.requestId);
    if (pending) {
      this.pendingRequests.delete(payload.requestId);
      pending.resolve(message);
    }
  }

  private handleError(payload: { messageId?: string; error: string }): void {
    const error = new Error(payload.error);
    this.notifyErrorHandlers(error);

    if (payload.messageId) {
      const pending = this.pendingRequests.get(payload.messageId);
      if (pending) {
        this.pendingRequests.delete(payload.messageId);
        pending.reject(error);
      }
    }
  }

  private handleStream(payload: { messageId: string; chunk: string; done: boolean }): void {
    const message: AIMessage = {
      id: payload.messageId,
      role: 'assistant',
      content: payload.chunk,
      timestamp: new Date()
    };
    this.notifyMessageHandlers(message);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[DLP AI] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[DLP AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  private notifyMessageHandlers(message: AIMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const dlpAI = new DLPAIService();

// Export class for testing
export { DLPAIService };

// Convenience functions
export const analyzeContent = (content: string, contentType = 'text', checkPatterns: string[] = [], includeContext = true) =>
  dlpAI.executeFunction('analyze_content', { content, contentType, checkPatterns, includeContext });

export const investigateIncident = (incidentId: string, includeUserHistory = true, correlateEvents = true, generateTimeline = true) =>
  dlpAI.executeFunction('investigate_incident', { incidentId, includeUserHistory, correlateEvents, generateTimeline });

export const assessUserRisk = (userId: string, timeRange = '30d', includeBaseline = true, insiderThreatScore = true) =>
  dlpAI.executeFunction('assess_user_risk', { userId, timeRange, includeBaseline, insiderThreatScore });

export const createPolicy = (policyName: string, dataTypes: string[], channels: string[], responseActions = {}) =>
  dlpAI.executeFunction('create_policy', { policyName, dataTypes, channels, responseActions });

export const classifyData = (targetPath: string, classificationScheme = 'default', deepScan = false, applyLabels = false) =>
  dlpAI.executeFunction('classify_data', { targetPath, classificationScheme, deepScan, applyLabels });

export const detectExfiltration = (timeRange = '24h', channels: string[] = [], volumeThreshold = 100, includeAnomalies = true) =>
  dlpAI.executeFunction('detect_exfiltration', { timeRange, channels, volumeThreshold, includeAnomalies });

export const auditCompliance = (regulation: string, scope: string[], includeRemediation = true, generateEvidence = true) =>
  dlpAI.executeFunction('audit_compliance', { regulation, scope, includeRemediation, generateEvidence });

export const discoverSensitiveData = (targets: string[], dataTypes: string[], scanDepth = 'standard', classifyResults = true) =>
  dlpAI.executeFunction('discover_sensitive_data', { targets, dataTypes, scanDepth, classifyResults });

export const generateReport = (reportType = 'summary', startDate: string, endDate: string, includeRecommendations = true) =>
  dlpAI.executeFunction('generate_report', { reportType, startDate, endDate, includeRecommendations });

export const remediateExposure = (exposureId: string, remediationAction: string, notifyOwner = true, documentAction = true) =>
  dlpAI.executeFunction('remediate_exposure', { exposureId, remediationAction, notifyOwner, documentAction });

export default dlpAI;

/**
 * VPNAnalyzer AI Service
 * WebSocket-based AI assistant integration using Gemini 1.5 Pro
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
  context: VPNContext;
}

export interface VPNContext {
  activeSessions?: number;
  connectedEndpoints?: number;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  selectedTunnel?: string;
  currentPolicy?: string;
  complianceStatus?: string;
}

type MessageHandler = (message: AIMessage) => void;
type ConnectionHandler = (connected: boolean) => void;
type ErrorHandler = (error: Error) => void;

class VPNAnalyzerAIService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private session: AISession | null = null;
  private pendingRequests: Map<string, { resolve: (value: AIMessage) => void; reject: (reason: Error) => void }> = new Map();

  /**
   * Connect to the AI WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = getAIWebSocketUrl();
        console.log(`[VPNAnalyzer AI] Connecting to ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('[VPNAnalyzer AI] Connected');
          this.reconnectAttempts = 0;
          this.initializeSession();
          this.notifyConnectionHandlers(true);
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (event) => {
          console.error('[VPNAnalyzer AI] WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.notifyErrorHandlers(error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log(`[VPNAnalyzer AI] Disconnected: ${event.code} ${event.reason}`);
          this.notifyConnectionHandlers(false);
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the AI WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    this.session = null;
  }

  /**
   * Send a message to the AI assistant
   */
  async sendMessage(content: string, context?: Partial<VPNContext>): Promise<AIMessage> {
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

      // Update session context if provided
      if (context && this.session) {
        this.session.context = { ...this.session.context, ...context };
      }

      // Add to session
      if (this.session) {
        this.session.messages.push(message);
      }

      // Store pending request
      this.pendingRequests.set(messageId, { resolve, reject });

      // Send to server
      this.ws.send(JSON.stringify({
        type: 'message',
        payload: {
          messageId,
          content,
          context: this.session?.context,
          sessionId: this.session?.id
        }
      }));

      // Notify handlers
      this.notifyMessageHandlers(message);

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(messageId)) {
          this.pendingRequests.delete(messageId);
          reject(new Error('Request timeout'));
        }
      }, 60000);
    });
  }

  /**
   * Execute an AI function directly
   */
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

  /**
   * Get available AI functions
   */
  getAvailableFunctions(): AIFunction[] {
    return config.aiAssistant.functions;
  }

  /**
   * Get functions by category
   */
  getFunctionsByCategory(category: string): AIFunction[] {
    return config.aiAssistant.functions.filter(fn => fn.category === category);
  }

  /**
   * Get all function categories
   */
  getFunctionCategories(): string[] {
    return [...new Set(config.aiAssistant.functions.map(fn => fn.category))];
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Subscribe to errors
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Get current session
   */
  getSession(): AISession | null {
    return this.session;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Clear session history
   */
  clearHistory(): void {
    if (this.session) {
      this.session.messages = [];
    }
  }

  // Private methods
  private initializeSession(): void {
    this.session = {
      id: this.generateSessionId(),
      startTime: new Date(),
      messages: [],
      context: {
        threatLevel: 'low'
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
          console.warn('[VPNAnalyzer AI] Unknown message type:', parsed.type);
      }
    } catch (error) {
      console.error('[VPNAnalyzer AI] Failed to parse message:', error);
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
    // Handle streaming responses for real-time UI updates
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
      console.error('[VPNAnalyzer AI] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[VPNAnalyzer AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
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
export const vpnGuardianAI = new VPNAnalyzerAIService();

// Export class for testing
export { VPNAnalyzerAIService };

// Convenience functions
export const analyzeVPNTraffic = (sessionId: string, timeRange: string, includePayload = false, threatLevel = 'all') =>
  vpnGuardianAI.executeFunction('analyze_vpn_traffic', { sessionId, timeRange, includePayload, threatLevel });

export const assessEndpointSecurity = (endpointId: string, checkType = 'full', strictMode = false) =>
  vpnGuardianAI.executeFunction('assess_endpoint_security', { endpointId, checkType, strictMode });

export const generateAccessPolicy = (userRole: string, resources: string[], riskTolerance = 'medium', timeConstraints = {}) =>
  vpnGuardianAI.executeFunction('generate_access_policy', { userRole, resources, riskTolerance, timeConstraints });

export const detectTunnelCompromise = (tunnelId: string, checkCertificates = true, deepAnalysis = false) =>
  vpnGuardianAI.executeFunction('detect_tunnel_compromise', { tunnelId, checkCertificates, deepAnalysis });

export const optimizeRouting = (sourceRegion: string, destinationZones: string[], prioritizeSpeed = false, constraints = {}) =>
  vpnGuardianAI.executeFunction('optimize_routing', { sourceRegion, destinationZones, prioritizeSpeed, constraints });

export const auditUserAccess = (userId: string, auditPeriod = '7d', includeGeoData = true, flagThreshold = 0.7) =>
  vpnGuardianAI.executeFunction('audit_user_access', { userId, auditPeriod, includeGeoData, flagThreshold });

export const manageCertificates = (operation: string, certId: string, validity = 365, keyStrength = 'RSA-4096') =>
  vpnGuardianAI.executeFunction('manage_certificates', { operation, certId, validity, keyStrength });

export const configureSplitTunnel = (applications: string[], domains: string[], bypassLocal = true, securityLevel = 'high') =>
  vpnGuardianAI.executeFunction('configure_split_tunnel', { applications, domains, bypassLocal, securityLevel });

export const generateThreatReport = (reportType = 'comprehensive', startDate: string, endDate: string, includeRemediation = true) =>
  vpnGuardianAI.executeFunction('generate_threat_report', { reportType, startDate, endDate, includeRemediation });

export const enforceCompliance = (framework: string, scope: string[], autoRemediate = false, notifyViolations = true) =>
  vpnGuardianAI.executeFunction('enforce_compliance', { framework, scope, autoRemediate, notifyViolations });

export default vpnGuardianAI;

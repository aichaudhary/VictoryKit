/**
 * WirelessHunter AI Service
 * WebSocket-based AI assistant for wireless security monitoring
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
  context: WirelessContext;
}

export interface WirelessContext {
  managedAPs?: number;
  connectedClients?: number;
  rogueDevicesDetected?: number;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  selectedSite?: string;
  activeBand?: '2.4GHz' | '5GHz' | '6GHz' | 'all';
}

type MessageHandler = (message: AIMessage) => void;
type ConnectionHandler = (connected: boolean) => void;
type ErrorHandler = (error: Error) => void;

class WirelessHunterAIService {
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
        console.log(`[WirelessHunter AI] Connecting to ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('[WirelessHunter AI] Connected');
          this.reconnectAttempts = 0;
          this.initializeSession();
          this.notifyConnectionHandlers(true);
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (event) => {
          console.error('[WirelessHunter AI] WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.notifyErrorHandlers(error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log(`[WirelessHunter AI] Disconnected: ${event.code} ${event.reason}`);
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
  async sendMessage(content: string, context?: Partial<WirelessContext>): Promise<AIMessage> {
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
        threatLevel: 'low',
        activeBand: 'all'
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
          console.warn('[WirelessHunter AI] Unknown message type:', parsed.type);
      }
    } catch (error) {
      console.error('[WirelessHunter AI] Failed to parse message:', error);
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
      console.error('[WirelessHunter AI] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WirelessHunter AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
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
export const wirelessWatchAI = new WirelessHunterAIService();

// Export class for testing
export { WirelessHunterAIService };

// Convenience functions for direct AI function execution
export const scanRFSpectrum = (band: string, channels: string[], duration = 30, sensitivity = 'normal') =>
  wirelessWatchAI.executeFunction('scan_rf_spectrum', { band, channels, duration, sensitivity });

export const detectRogueAPs = (scanArea: string, deepScan = false, includeClients = true, classificationLevel = 'standard') =>
  wirelessWatchAI.executeFunction('detect_rogue_aps', { scanArea, deepScan, includeClients, classificationLevel });

export const assessWiFiSecurity = (ssid: string, bssid: string, checkVulnerabilities = true, pentestMode = false) =>
  wirelessWatchAI.executeFunction('assess_wifi_security', { ssid, bssid, checkVulnerabilities, pentestMode });

export const optimizeChannelPlan = (site: string, constraints = {}, prioritizeDensity = false, dfsAllowed = true) =>
  wirelessWatchAI.executeFunction('optimize_channel_plan', { site, constraints, prioritizeDensity, dfsAllowed });

export const investigateClient = (macAddress: string, timeRange = '24h', includeRoaming = true, threatAnalysis = true) =>
  wirelessWatchAI.executeFunction('investigate_client', { macAddress, timeRange, includeRoaming, threatAnalysis });

export const containRogueDevice = (targetBssid: string, containmentMethod = 'deauth', duration = 3600, logActions = true) =>
  wirelessWatchAI.executeFunction('contain_rogue_device', { targetBssid, containmentMethod, duration, logActions });

export const generateHeatmap = (floorPlan: string, band = '5GHz', metric = 'signal_strength', resolution = 'high') =>
  wirelessWatchAI.executeFunction('generate_heatmap', { floorPlan, band, metric, resolution });

export const auditCompliance = (framework: string, scope: string[], includeRemediation = true) =>
  wirelessWatchAI.executeFunction('audit_compliance', { framework, scope, includeRemediation });

export const analyzeAttackPatterns = (eventId: string, correlateEvents = true, attributeSource = true, generateIocs = true) =>
  wirelessWatchAI.executeFunction('analyze_attack_patterns', { eventId, correlateEvents, attributeSource, generateIocs });

export const generateSecurityReport = (reportType = 'comprehensive', startDate: string, endDate: string, includeExecutiveSummary = true) =>
  wirelessWatchAI.executeFunction('generate_security_report', { reportType, startDate, endDate, includeExecutiveSummary });

export default wirelessWatchAI;

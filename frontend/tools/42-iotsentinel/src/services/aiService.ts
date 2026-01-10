/**
 * IoTSentinel AI Service
 * Tool #42 - WebSocket client for AI-powered IoT security
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

class IoTSentinelAIService {
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
          console.log('[IoTSentinel AI] Connected');
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message, resolve);
          } catch (error) {
            console.error('[IoTSentinel AI] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[IoTSentinel AI] WebSocket error:', error);
          const err = new Error('WebSocket connection error');
          this.errorHandlers.forEach(handler => handler(err));
          reject(err);
        };

        this.ws.onclose = () => {
          console.log('[IoTSentinel AI] Disconnected');
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

  private handleMessage(message: { type: string; payload: Record<string, unknown> }, resolve?: (session: AISession) => void) {
    switch (message.type) {
      case 'connected':
        this.session = {
          sessionId: message.payload.sessionId as string,
          clientId: message.payload.clientId as string,
          connected: true,
          messages: []
        };
        this.connectionHandlers.forEach(handler => handler(this.session!));
        if (resolve) resolve(this.session);
        break;

      case 'response':
        const aiMessage: AIMessage = {
          id: message.payload.messageId as string || crypto.randomUUID(),
          role: 'assistant',
          content: message.payload.content as string,
          timestamp: new Date(),
          functionCall: message.payload.functionCall as AIMessage['functionCall'],
          functionResult: message.payload.functionResult as AIMessage['functionResult']
        };
        this.session?.messages.push(aiMessage);
        this.messageHandlers.forEach(handler => handler(aiMessage));
        break;

      case 'function_result':
        console.log('[IoTSentinel AI] Function result:', message.payload);
        break;

      case 'error':
        const error = new Error(message.payload.error as string);
        this.errorHandlers.forEach(handler => handler(error));
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[IoTSentinel AI] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
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
      throw new Error('Not connected to IoTSentinel AI');
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
      type: 'message',
      payload: { messageId, content, context }
    }));

    return messageId;
  }

  callFunction(functionName: string, parameters: Record<string, unknown>): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to IoTSentinel AI');
    }

    const requestId = crypto.randomUUID();
    this.ws.send(JSON.stringify({
      type: 'function_call',
      payload: { requestId, functionName, parameters }
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

  // Convenience methods for IoTSentinel AI functions

  async discoverDevices(params: {
    networkRange: string;
    scanType?: 'quick' | 'standard' | 'deep' | 'passive';
    includeShadowIoT?: boolean;
    categorize?: boolean;
  }): Promise<string> {
    return this.callFunction('discover_devices', {
      networkRange: params.networkRange,
      scanType: params.scanType || 'standard',
      includeShadowIoT: params.includeShadowIoT ?? true,
      categorize: params.categorize ?? true
    });
  }

  async scanVulnerabilities(params: {
    deviceIds: string[] | 'all';
    scanDepth?: 'quick' | 'standard' | 'comprehensive';
    checkCVEs?: boolean;
    checkFirmware?: boolean;
  }): Promise<string> {
    return this.callFunction('scan_vulnerabilities', {
      deviceIds: params.deviceIds,
      scanDepth: params.scanDepth || 'standard',
      checkCVEs: params.checkCVEs ?? true,
      checkFirmware: params.checkFirmware ?? true
    });
  }

  async analyzeFirmware(params: {
    deviceId: string;
    firmwareFile?: string;
    checkMalware?: boolean;
    extractSecrets?: boolean;
  }): Promise<string> {
    return this.callFunction('analyze_firmware', {
      deviceId: params.deviceId,
      firmwareFile: params.firmwareFile,
      checkMalware: params.checkMalware ?? true,
      extractSecrets: params.extractSecrets ?? true
    });
  }

  async configureSegmentation(params: {
    deviceIds: string[];
    segmentName: string;
    accessPolicy?: 'isolated' | 'restricted' | 'monitored';
    allowedConnections?: string[];
  }): Promise<string> {
    return this.callFunction('configure_segmentation', {
      deviceIds: params.deviceIds,
      segmentName: params.segmentName,
      accessPolicy: params.accessPolicy || 'restricted',
      allowedConnections: params.allowedConnections || []
    });
  }

  async monitorThreats(params: {
    deviceIds: string[] | 'all';
    timeRange?: string;
    alertThreshold?: 'low' | 'medium' | 'high';
    threatTypes?: string[];
  }): Promise<string> {
    return this.callFunction('monitor_threats', {
      deviceIds: params.deviceIds,
      timeRange: params.timeRange || '24h',
      alertThreshold: params.alertThreshold || 'medium',
      threatTypes: params.threatTypes || []
    });
  }

  async authenticateDevice(params: {
    deviceId: string;
    authMethod?: 'certificate' | 'token' | 'mfa';
    accessLevel?: 'read-only' | 'standard' | 'admin';
    rotateCredentials?: boolean;
  }): Promise<string> {
    return this.callFunction('authenticate_device', {
      deviceId: params.deviceId,
      authMethod: params.authMethod || 'certificate',
      accessLevel: params.accessLevel || 'standard',
      rotateCredentials: params.rotateCredentials ?? false
    });
  }

  async detectAnomaly(params: {
    deviceIds: string[] | 'all';
    timeRange?: string;
    baselineCompare?: boolean;
    anomalyTypes?: string[];
  }): Promise<string> {
    return this.callFunction('detect_anomaly', {
      deviceIds: params.deviceIds,
      timeRange: params.timeRange || '7d',
      baselineCompare: params.baselineCompare ?? true,
      anomalyTypes: params.anomalyTypes || ['traffic', 'protocol', 'timing', 'destination']
    });
  }

  async auditCompliance(params: {
    framework: 'NIST' | 'IEC62443' | 'HIPAA' | 'ISO27001' | 'GDPR';
    scope?: string[] | 'all';
    includeRemediation?: boolean;
    generateEvidence?: boolean;
  }): Promise<string> {
    return this.callFunction('audit_compliance', {
      framework: params.framework,
      scope: params.scope || 'all',
      includeRemediation: params.includeRemediation ?? true,
      generateEvidence: params.generateEvidence ?? true
    });
  }

  async respondIncident(params: {
    incidentId: string;
    responseAction: 'isolate' | 'quarantine' | 'block' | 'monitor' | 'remediate';
    automated?: boolean;
    notifyTeam?: boolean;
  }): Promise<string> {
    return this.callFunction('respond_incident', {
      incidentId: params.incidentId,
      responseAction: params.responseAction,
      automated: params.automated ?? false,
      notifyTeam: params.notifyTeam ?? true
    });
  }

  async generateReport(params: {
    reportType: 'inventory' | 'vulnerability' | 'compliance' | 'executive';
    startDate: string;
    endDate: string;
    includeRecommendations?: boolean;
  }): Promise<string> {
    return this.callFunction('generate_report', {
      reportType: params.reportType,
      startDate: params.startDate,
      endDate: params.endDate,
      includeRecommendations: params.includeRecommendations ?? true
    });
  }
}

export const iotSecureAI = new IoTSentinelAIService();
export default iotSecureAI;

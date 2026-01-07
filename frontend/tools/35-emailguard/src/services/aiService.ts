// EmailGuard AI Service
// WebSocket client for AI-powered email security assistance

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6035/maula-ai';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4035';

// Types
export type AIFunction = 
  | 'analyze_email_threat'
  | 'classify_email_content'
  | 'detect_phishing_attempt'
  | 'analyze_attachment_risk'
  | 'assess_sender_reputation'
  | 'generate_policy_recommendation'
  | 'investigate_email_chain'
  | 'detect_bec_attempt'
  | 'summarize_threat_landscape'
  | 'analyze_url_safety';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: FunctionCall;
  functionResult?: FunctionResult;
}

export interface FunctionCall {
  name: AIFunction;
  parameters: Record<string, unknown>;
}

export interface FunctionResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface ThreatAnalysisResult {
  emailId: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  overallScore: number;
  threatTypes: string[];
  indicators: ThreatIndicator[];
  recommendations: string[];
  summary: string;
}

export interface ThreatIndicator {
  type: string;
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

export interface ContentClassification {
  emailId: string;
  category: 'business' | 'personal' | 'marketing' | 'transactional' | 'spam' | 'threat';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  confidence: number;
}

export interface PhishingDetectionResult {
  isPhishing: boolean;
  confidence: number;
  indicators: PhishingIndicator[];
  brandImpersonation?: {
    detected: boolean;
    brand: string;
    confidence: number;
  };
  urgencyScore: number;
  recommendation: string;
}

export interface PhishingIndicator {
  type: 'url' | 'sender' | 'content' | 'attachment' | 'header';
  indicator: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface AttachmentRiskResult {
  attachmentId: string;
  filename: string;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  malwareDetected: boolean;
  fileType: {
    claimed: string;
    actual: string;
    mismatch: boolean;
  };
  indicators: string[];
  sandboxReport?: {
    executed: boolean;
    behaviors: string[];
    networkActivity: string[];
    fileOperations: string[];
    verdict: string;
  };
}

export interface SenderReputationResult {
  senderEmail: string;
  senderDomain: string;
  reputationScore: number;
  domainAge: number;
  authenticationStatus: {
    spf: 'pass' | 'fail' | 'neutral' | 'none';
    dkim: 'pass' | 'fail' | 'none';
    dmarc: 'pass' | 'fail' | 'none';
  };
  previousIncidents: number;
  firstSeen?: string;
  volumeStats?: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  recommendation: 'allow' | 'monitor' | 'block';
}

export interface PolicyRecommendation {
  recommendations: Policy[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  rationale: string;
  implementationGuide: string[];
}

export interface Policy {
  name: string;
  type: 'inbound' | 'outbound' | 'internal';
  conditions: string[];
  actions: string[];
  reason: string;
}

export interface EmailChainInvestigation {
  threadId: string;
  timeline: TimelineEvent[];
  participants: Participant[];
  anomalies: Anomaly[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
  };
}

export interface TimelineEvent {
  timestamp: string;
  type: string;
  description: string;
  participant: string;
}

export interface Participant {
  email: string;
  name?: string;
  role: 'initiator' | 'recipient' | 'cc';
  reputation: number;
}

export interface Anomaly {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface BECDetectionResult {
  isBEC: boolean;
  confidence: number;
  impersonationTarget?: {
    name: string;
    title: string;
    similarity: number;
  };
  financialRequest: {
    detected: boolean;
    amount?: number;
    urgency: 'low' | 'medium' | 'high';
  };
  urgencyIndicators: string[];
  recommendation: string;
}

export interface ThreatLandscapeSummary {
  period: string;
  summary: string;
  topThreats: ThreatSummary[];
  trends: TrendData[];
  recommendations: string[];
  overallRiskScore: number;
}

export interface ThreatSummary {
  type: string;
  count: number;
  percentageChange: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrendData {
  date: string;
  threats: number;
  blocked: number;
  quarantined: number;
}

export interface URLSafetyResult {
  url: string;
  isSafe: boolean;
  threatType?: 'phishing' | 'malware' | 'spam' | 'scam' | 'none';
  redirectChain: string[];
  finalDestination: string;
  reputation: {
    score: number;
    category: string;
  };
  screenshot?: string;
  analysisTime: number;
}

// Callback types
type MessageCallback = (message: AIMessage) => void;
type StreamCallback = (chunk: string, isComplete: boolean) => void;
type ErrorCallback = (error: Error) => void;
type ConnectionCallback = (connected: boolean) => void;

class EmailGuardAIService {
  private ws: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private streamCallbacks: Map<string, StreamCallback> = new Map();
  private errorCallbacks: ErrorCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageQueue: AIMessage[] = [];
  private isConnected = false;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[EmailGuard AI] WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.connectionCallbacks.forEach(cb => cb(true));
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[EmailGuard AI] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[EmailGuard AI] WebSocket error:', error);
        this.errorCallbacks.forEach(cb => cb(new Error('WebSocket error')));
      };

      this.ws.onclose = () => {
        console.log('[EmailGuard AI] WebSocket disconnected');
        this.isConnected = false;
        this.connectionCallbacks.forEach(cb => cb(false));
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[EmailGuard AI] Failed to connect:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[EmailGuard AI] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: { type: string; id?: string; content?: string; message?: AIMessage; error?: string; isComplete?: boolean }): void {
    switch (data.type) {
      case 'message':
        if (data.message) {
          this.messageCallbacks.forEach(cb => cb(data.message!));
        }
        break;

      case 'stream':
        if (data.id && data.content !== undefined) {
          const callback = this.streamCallbacks.get(data.id);
          if (callback) {
            callback(data.content, data.isComplete || false);
            if (data.isComplete) {
              this.streamCallbacks.delete(data.id);
            }
          }
        }
        break;

      case 'function_result':
        if (data.id) {
          const pending = this.pendingRequests.get(data.id);
          if (pending) {
            pending.resolve(data);
            this.pendingRequests.delete(data.id);
          }
        }
        break;

      case 'error':
        if (data.id) {
          const pending = this.pendingRequests.get(data.id);
          if (pending) {
            pending.reject(new Error(data.error || 'Unknown error'));
            this.pendingRequests.delete(data.id);
          }
        }
        this.errorCallbacks.forEach(cb => cb(new Error(data.error || 'Unknown error')));
        break;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send({ type: 'message', message });
      }
    }
  }

  private send(data: Record<string, unknown>): boolean {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    callback(this.isConnected);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  sendMessage(content: string, streamCallback?: StreamCallback): string {
    const id = this.generateId();
    const message: AIMessage = {
      id,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    if (streamCallback) {
      this.streamCallbacks.set(id, streamCallback);
    }

    if (!this.send({ type: 'message', message, stream: !!streamCallback })) {
      this.messageQueue.push(message);
    }

    return id;
  }

  async callFunction<T>(name: AIFunction, parameters: Record<string, unknown>): Promise<T> {
    const id = this.generateId();

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const sent = this.send({
        type: 'function_call',
        id,
        function: { name, parameters },
      });

      if (!sent) {
        this.pendingRequests.delete(id);
        reject(new Error('Not connected'));
      }

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Function call timeout'));
        }
      }, 30000);
    });
  }

  // AI Function Helpers
  async analyzeEmailThreat(data: {
    emailId: string;
    includeAttachments?: boolean;
    deepScan?: boolean;
  }): Promise<ThreatAnalysisResult> {
    return this.callFunction('analyze_email_threat', data);
  }

  async classifyEmailContent(data: {
    emailId: string;
    classificationScheme?: string;
  }): Promise<ContentClassification> {
    return this.callFunction('classify_email_content', data);
  }

  async detectPhishing(data: {
    emailContent: {
      from: string;
      subject: string;
      body: string;
      headers?: Record<string, string>;
    };
    senderHistory?: boolean;
  }): Promise<PhishingDetectionResult> {
    return this.callFunction('detect_phishing_attempt', data);
  }

  async analyzeAttachmentRisk(data: {
    attachmentId: string;
    sandboxAnalysis?: boolean;
  }): Promise<AttachmentRiskResult> {
    return this.callFunction('analyze_attachment_risk', data);
  }

  async assessSenderReputation(data: {
    senderEmail: string;
    senderDomain: string;
  }): Promise<SenderReputationResult> {
    return this.callFunction('assess_sender_reputation', data);
  }

  async generatePolicyRecommendation(data: {
    threatData: Record<string, unknown>;
    currentPolicies?: unknown[];
  }): Promise<PolicyRecommendation> {
    return this.callFunction('generate_policy_recommendation', data);
  }

  async investigateEmailChain(data: {
    threadId: string;
    lookbackDays?: number;
  }): Promise<EmailChainInvestigation> {
    return this.callFunction('investigate_email_chain', data);
  }

  async detectBEC(data: {
    emailContent: {
      from: string;
      subject: string;
      body: string;
    };
    executiveList?: string[];
  }): Promise<BECDetectionResult> {
    return this.callFunction('detect_bec_attempt', data);
  }

  async summarizeThreatLandscape(data: {
    timePeriod: 'day' | 'week' | 'month' | 'quarter';
    includeRecommendations?: boolean;
  }): Promise<ThreatLandscapeSummary> {
    return this.callFunction('summarize_threat_landscape', data);
  }

  async analyzeURLSafety(data: {
    url: string;
    followRedirects?: boolean;
  }): Promise<URLSafetyResult> {
    return this.callFunction('analyze_url_safety', data);
  }

  // HTTP fallback
  async httpFallback(endpoint: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${API_URL}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
const aiService = new EmailGuardAIService();

export default aiService;

export {
  EmailGuardAIService,
  aiService,
};

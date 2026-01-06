// BiometricAI AI Service
// WebSocket client for AI-powered biometric assistance

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:6034/maula-ai';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4034';

// Types
export type AIFunction = 
  | 'biometric_quality_analyzer'
  | 'spoof_detection_engine'
  | 'liveness_verification'
  | 'match_score_calculator'
  | 'behavioral_pattern_analyzer'
  | 'risk_assessment_engine'
  | 'template_optimizer'
  | 'authentication_advisor'
  | 'compliance_checker'
  | 'anomaly_detector';

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

export interface QualityAnalysis {
  overallScore: number;
  issues: QualityIssue[];
  recommendations: string[];
  acceptable: boolean;
  modalityScores: Record<string, number>;
}

export interface QualityIssue {
  type: 'blur' | 'noise' | 'lighting' | 'position' | 'occlusion' | 'resolution' | 'angle';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: { x: number; y: number; width: number; height: number };
}

export interface SpoofDetectionResult {
  isSpoof: boolean;
  confidence: number;
  attackType?: 'photo' | 'video' | 'mask' | 'synthetic' | 'presentation' | 'replay';
  indicators: SpoofIndicator[];
  recommendations: string[];
}

export interface SpoofIndicator {
  type: string;
  detected: boolean;
  confidence: number;
  description: string;
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  challenges: LivenessChallenge[];
  passedChallenges: number;
  totalChallenges: number;
}

export interface LivenessChallenge {
  type: 'blink' | 'smile' | 'turn_head' | 'nod' | 'speak_phrase' | 'follow_dot';
  completed: boolean;
  score: number;
  timestamp?: Date;
}

export interface MatchResult {
  matchScore: number;
  matchThreshold: number;
  isMatch: boolean;
  modality: string;
  confidence: number;
  fusionDetails?: Record<string, number>;
}

export interface BehavioralAnalysis {
  userId: string;
  patternMatch: number;
  typingMetrics: {
    speed: number;
    rhythm: number;
    consistency: number;
  };
  mouseMetrics: {
    velocity: number;
    curvature: number;
    clickPattern: number;
  };
  anomalies: BehavioralAnomaly[];
}

export interface BehavioralAnomaly {
  type: string;
  deviation: number;
  description: string;
  timestamp: Date;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: RiskFactor[];
  recommendations: string[];
  action: 'allow' | 'step_up' | 'deny' | 'review';
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface TemplateOptimization {
  originalQuality: number;
  optimizedQuality: number;
  improvements: string[];
  optimizedTemplate: string;
  compressionRatio: number;
}

export interface AuthenticationAdvice {
  recommendedModality: string;
  fallbackModalities: string[];
  mfaRecommended: boolean;
  threshold: 'low' | 'medium' | 'high';
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComplianceCheck {
  framework: 'GDPR' | 'CCPA' | 'BIPA' | 'ISO24745' | 'ISO30107' | 'NIST80063B';
  compliant: boolean;
  requirements: ComplianceRequirement[];
  missingItems: string[];
  recommendations: string[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not_applicable';
  details: string;
}

export interface AnomalyDetection {
  anomaliesDetected: boolean;
  anomalies: DetectedAnomaly[];
  baselineDeviation: number;
  alertLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface DetectedAnomaly {
  type: 'unusual_time' | 'new_device' | 'location_change' | 'behavior_shift' | 'failed_attempts' | 'quality_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  context: Record<string, unknown>;
}

// Callback types
type MessageCallback = (message: AIMessage) => void;
type StreamCallback = (chunk: string, isComplete: boolean) => void;
type ErrorCallback = (error: Error) => void;
type ConnectionCallback = (connected: boolean) => void;

class BiometricAIService {
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
        console.log('[BiometricAI] WebSocket connected');
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
          console.error('[BiometricAI] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[BiometricAI] WebSocket error:', error);
        this.errorCallbacks.forEach(cb => cb(new Error('WebSocket error')));
      };

      this.ws.onclose = () => {
        console.log('[BiometricAI] WebSocket disconnected');
        this.isConnected = false;
        this.connectionCallbacks.forEach(cb => cb(false));
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[BiometricAI] Failed to connect:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[BiometricAI] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
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

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Function call timeout'));
        }
      }, 30000);
    });
  }

  // AI Function Helpers
  async analyzeQuality(data: {
    sampleId: string;
    modality: 'face' | 'fingerprint' | 'voice' | 'iris' | 'palm';
    sampleData: string;
    requirements?: Record<string, unknown>;
  }): Promise<QualityAnalysis> {
    return this.callFunction('biometric_quality_analyzer', data);
  }

  async detectSpoof(data: {
    sampleId: string;
    modality: 'face' | 'fingerprint' | 'voice' | 'iris' | 'palm';
    sampleData: string;
    checkTypes?: ('photo' | 'video' | 'mask' | 'synthetic' | 'presentation' | 'replay')[];
  }): Promise<SpoofDetectionResult> {
    return this.callFunction('spoof_detection_engine', data);
  }

  async verifyLiveness(data: {
    modality: 'face' | 'fingerprint' | 'voice' | 'iris';
    sampleData: string;
    challengeType?: 'passive' | 'active';
    challenges?: LivenessChallenge[];
  }): Promise<LivenessResult> {
    return this.callFunction('liveness_verification', data);
  }

  async calculateMatchScore(data: {
    template1: string;
    template2: string;
    modality: 'face' | 'fingerprint' | 'voice' | 'iris' | 'behavioral' | 'palm';
    fusionMode?: 'single' | 'weighted' | 'score_level' | 'feature_level';
  }): Promise<MatchResult> {
    return this.callFunction('match_score_calculator', data);
  }

  async analyzeBehavioralPattern(data: {
    userId: string;
    behaviorData: {
      keystrokes?: Record<string, unknown>[];
      mouseMovements?: Record<string, unknown>[];
      touchPatterns?: Record<string, unknown>[];
    };
    baselineComparison?: boolean;
  }): Promise<BehavioralAnalysis> {
    return this.callFunction('behavioral_pattern_analyzer', data);
  }

  async assessRisk(data: {
    userId: string;
    authenticationAttempt: {
      modality: string;
      matchScore: number;
      livenessScore?: number;
      deviceInfo: Record<string, unknown>;
      location?: Record<string, unknown>;
    };
    contextFactors?: Record<string, unknown>;
  }): Promise<RiskAssessment> {
    return this.callFunction('risk_assessment_engine', data);
  }

  async optimizeTemplate(data: {
    templateData: string;
    modality: 'face' | 'fingerprint' | 'voice' | 'iris' | 'palm';
    targetQuality?: number;
    compressionLevel?: 'low' | 'medium' | 'high';
  }): Promise<TemplateOptimization> {
    return this.callFunction('template_optimizer', data);
  }

  async getAuthenticationAdvice(data: {
    userId: string;
    enrolledModalities: string[];
    contextFactors: {
      deviceTrust: 'trusted' | 'known' | 'unknown';
      locationRisk: 'low' | 'medium' | 'high';
      timeOfDay: string;
      transactionValue?: number;
    };
    securityRequirements?: string;
  }): Promise<AuthenticationAdvice> {
    return this.callFunction('authentication_advisor', data);
  }

  async checkCompliance(data: {
    framework: 'GDPR' | 'CCPA' | 'BIPA' | 'ISO24745' | 'ISO30107' | 'NIST80063B';
    systemConfiguration: Record<string, unknown>;
    dataHandlingPractices: Record<string, unknown>;
  }): Promise<ComplianceCheck> {
    return this.callFunction('compliance_checker', data);
  }

  async detectAnomalies(data: {
    userId?: string;
    timePeriod: 'hour' | 'day' | 'week' | 'month';
    dataPoints: Record<string, unknown>[];
    baselineData?: Record<string, unknown>;
  }): Promise<AnomalyDetection> {
    return this.callFunction('anomaly_detector', data);
  }

  // HTTP fallback for when WebSocket is unavailable
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
const aiService = new BiometricAIService();

export default aiService;

export {
  BiometricAIService,
  aiService,
};

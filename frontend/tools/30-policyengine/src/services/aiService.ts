// PolicyEngine AI Service - WebSocket Client
// Handles real-time AI streaming communication

export interface AIMessage {
  type: 'ai_request' | 'ai_stream' | 'ai_complete' | 'function_result' | 'error' | 'connected' | 'ping' | 'pong';
  payload: any;
}

export interface AIRequestPayload {
  query: string;
  context?: any;
  session_id: string;
  function_name?: string;
  parameters?: any;
}

class AIService {
  private ws: WebSocket | null = null;
  private wsURL: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private sessionId: string;
  
  constructor() {
    this.wsURL = import.meta.env.VITE_POLICYENGINE_AI_WS_URL || 'ws://localhost:6030/maula/ai';
    this.sessionId = this.generateSessionId();
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsURL);
        
        this.ws.onopen = () => {
          console.log('PolicyEngine AI WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.attemptReconnect();
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reject(error);
      }
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  private handleMessage(data: string): void {
    try {
      const message: AIMessage = JSON.parse(data);
      
      // Call registered handlers for this message type
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.payload);
      }
      
      // Also call the 'all' handler if registered
      const allHandler = this.messageHandlers.get('all');
      if (allHandler) {
        allHandler(message);
      }
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }
  
  on(messageType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }
  
  off(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }
  
  send(message: AIMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
  
  // ==================== AI REQUEST METHODS ====================
  
  async askAI(query: string, context?: any): Promise<void> {
    const payload: AIRequestPayload = {
      query,
      context,
      session_id: this.sessionId
    };
    
    this.send({
      type: 'ai_request',
      payload
    });
  }
  
  async executeFunction(functionName: string, parameters: any): Promise<void> {
    const payload: AIRequestPayload = {
      query: `Execute ${functionName}`,
      context: parameters,
      session_id: this.sessionId,
      function_name: functionName,
      parameters
    };
    
    this.send({
      type: 'ai_request',
      payload
    });
  }
  
  // ==================== POLICY FUNCTIONS ====================
  
  async createPolicy(policyData: {
    policy_name: string;
    category: string;
    content: any;
    framework?: any;
    compliance?: any;
    applicability?: any;
    owner: any;
  }): Promise<void> {
    return this.executeFunction('create_policy', policyData);
  }
  
  async analyzePolicy(policyId: string, analysisType: 'coverage' | 'compliance' | 'gaps' | 'all'): Promise<void> {
    return this.executeFunction('analyze_policy', {
      policy_id: policyId,
      analysis_type: analysisType
    });
  }
  
  async mapPolicyToControls(mappingData: {
    policy_id: string;
    framework: { name: string; version: string };
    mappings: Array<any>;
  }): Promise<void> {
    return this.executeFunction('map_policy_to_controls', mappingData);
  }
  
  async checkPolicyCompliance(checkData: {
    policy_id: string;
    scope?: string;
    scope_id?: string;
    check_type?: 'automated' | 'manual';
  }): Promise<void> {
    return this.executeFunction('check_policy_compliance', checkData);
  }
  
  async generatePolicyDocumentation(docData: {
    policy_id: string;
    doc_type: 'full' | 'policy' | 'compliance' | 'framework';
    format?: 'json' | 'markdown' | 'pdf';
  }): Promise<void> {
    return this.executeFunction('generate_policy_documentation', docData);
  }
  
  async managePolicyException(action: 'create' | 'approve' | 'reject' | 'list', exceptionData: any): Promise<void> {
    return this.executeFunction('manage_policy_exception', {
      action,
      exception_data: exceptionData
    });
  }
  
  async createPolicyAsCode(policyAsCodeData: {
    policy_id: string;
    target_platform: 'opa' | 'sentinel' | 'aws_scp' | 'azure_policy';
    output_format?: 'code' | 'json';
  }): Promise<void> {
    return this.executeFunction('create_policy_as_code', policyAsCodeData);
  }
  
  async comparePolicies(comparisonData: {
    policy_id_1: string;
    policy_id_2: string;
    comparison_type: 'content' | 'framework' | 'all';
  }): Promise<void> {
    return this.executeFunction('compare_policies', comparisonData);
  }
  
  async assessPolicyEffectiveness(assessmentData: {
    policy_id: string;
    assessment_period: string;
  }): Promise<void> {
    return this.executeFunction('assess_policy_effectiveness', assessmentData);
  }
  
  async recommendPolicyUpdates(policyId: string, recommendationType: string): Promise<void> {
    return this.executeFunction('recommend_policy_updates', {
      policy_id: policyId,
      recommendation_type: recommendationType
    });
  }
  
  // ==================== STREAMING HANDLERS ====================
  
  onAIStream(handler: (chunk: any) => void): void {
    this.on('ai_stream', handler);
  }
  
  onAIComplete(handler: () => void): void {
    this.on('ai_complete', handler);
  }
  
  onFunctionResult(handler: (result: any) => void): void {
    this.on('function_result', handler);
  }
  
  onError(handler: (error: any) => void): void {
    this.on('error', handler);
  }
  
  onConnected(handler: (data: any) => void): void {
    this.on('connected', handler);
  }
  
  // ==================== UTILITIES ====================
  
  ping(): void {
    this.send({ type: 'ping', payload: { timestamp: Date.now() } });
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new AIService();

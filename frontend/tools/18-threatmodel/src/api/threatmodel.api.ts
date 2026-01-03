/**
 * ThreatModel API Client - Tool 18 - Threat Modeling & Analysis
 * Enhanced with AI Analysis, Threat Intel, Reports, and Real-time WebSocket
 */
const API_BASE_URL = import.meta.env.VITE_THREATMODEL_API_URL || 'http://localhost:4018/api/v1/threatmodel';
const WS_URL = import.meta.env.VITE_THREATMODEL_WS_URL || 'ws://localhost:4118';

// ============================================================================
// Type Definitions
// ============================================================================
export interface Threat {
  _id: string;
  name: string;
  category: 'STRIDE' | 'DREAD' | 'PASTA';
  type: 'Spoofing' | 'Tampering' | 'Repudiation' | 'InformationDisclosure' | 'DenialOfService' | 'ElevationOfPrivilege';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number;
  impact: number;
  riskScore: number;
  mitigations: Mitigation[];
  assets: string[];
  attackVector?: string;
  cveReferences?: string[];
  mitreAttack?: { technique: string; tactic: string; url: string }[];
  status: 'identified' | 'analyzing' | 'mitigated' | 'accepted' | 'transferred';
  createdAt: string;
  updatedAt: string;
}

export interface Mitigation {
  _id: string;
  name: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  effectiveness: number;
  cost: 'low' | 'medium' | 'high';
  status: 'proposed' | 'in_progress' | 'implemented' | 'verified';
  compliance?: string[];
}

export interface Component {
  _id: string;
  name: string;
  type: 'external_entity' | 'process' | 'data_store' | 'data_flow' | 'trust_boundary';
  description: string;
  position?: { x: number; y: number };
  properties?: Record<string, unknown>;
  threats?: string[];
}

export interface ThreatModel {
  _id: string;
  name: string;
  description: string;
  scope: string;
  methodology: 'STRIDE' | 'PASTA' | 'DREAD' | 'VAST' | 'OCTAVE';
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'archived';
  threats: Threat[];
  components: Component[];
  dataFlows: DataFlow[];
  assets: Asset[];
  trustBoundaries: TrustBoundary[];
  attackSurface: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  reviewers: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataFlow {
  _id: string;
  name: string;
  source: string;
  destination: string;
  dataType: string;
  protocol?: string;
  encrypted: boolean;
  authenticated: boolean;
  threats?: string[];
}

export interface Asset {
  _id: string;
  name: string;
  type: 'data' | 'system' | 'service' | 'network' | 'physical';
  value: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  classification?: string;
}

export interface TrustBoundary {
  _id: string;
  name: string;
  type: 'network' | 'machine' | 'process' | 'thread';
  description: string;
  components: string[];
}

export interface STRIDEAnalysis {
  category: string;
  threatType: string;
  description: string;
  affectedComponents: string[];
  likelihood: number;
  impact: number;
  riskScore: number;
  suggestedMitigations: string[];
  cveReferences?: CVE[];
  mitreMapping?: MITRETechnique[];
}

export interface PASTAAnalysis {
  stage: number;
  stageName: string;
  description: string;
  findings: string[];
  risks: { name: string; severity: string; description: string }[];
  recommendations: string[];
}

export interface CVE {
  id: string;
  description: string;
  severity: string;
  cvssScore: number;
  cvssVector: string;
  publishedDate: string;
  references: string[];
}

export interface MITRETechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  platforms: string[];
  url: string;
}

export interface AttackTree {
  goal: string;
  nodes: AttackTreeNode[];
}

export interface AttackTreeNode {
  id: string;
  label: string;
  type: 'AND' | 'OR' | 'LEAF';
  probability?: number;
  cost?: number;
  children?: AttackTreeNode[];
}

export interface DREADScore {
  damage: number;
  reproducibility: number;
  exploitability: number;
  affectedUsers: number;
  discoverability: number;
  totalScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ThreatDashboard {
  overview: {
    totalModels: number;
    totalThreats: number;
    mitigatedThreats: number;
    criticalThreats: number;
    activeAnalyses: number;
    riskScore: number;
  };
  strideBreakdown: { category: string; count: number; percentage: number }[];
  threatsByCategory: { category: string; count: number }[];
  threatsBySeverity: { severity: string; count: number }[];
  mitigationProgress: { status: string; count: number }[];
  topRisks: Threat[];
  recentThreats: Threat[];
  recentActivity: { action: string; target: string; user: string; timestamp: string }[];
  complianceStatus: { framework: string; score: number; status: string }[];
}

export interface Report {
  id: string;
  name: string;
  type: 'executive' | 'technical' | 'compliance' | 'risk';
  format: 'html' | 'markdown' | 'json' | 'yaml' | 'csv';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
  meta?: { total?: number; page?: number; limit?: number };
}

// ============================================================================
// WebSocket Service for Real-time Updates
// ============================================================================
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private modelSubscriptions: Set<string> = new Set();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(WS_URL);
        this.ws.onopen = () => {
          console.log('🔌 ThreatModel WebSocket connected');
          this.reconnectAttempts = 0;
          this.resubscribeToModels();
          resolve();
        };
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Failed to parse WS message:', e);
          }
        };
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        this.ws.onclose = () => {
          console.log('WebSocket closed, attempting reconnect...');
          this.attemptReconnect();
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  private resubscribeToModels(): void {
    this.modelSubscriptions.forEach(modelId => {
      this.send({ type: 'subscribe_model', modelId });
    });
  }

  private handleMessage(message: { type: string; [key: string]: unknown }): void {
    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
    const allHandlers = this.listeners.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message));
    }
  }

  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribeToModel(modelId: string): void {
    this.modelSubscriptions.add(modelId);
    this.send({ type: 'subscribe_model', modelId });
  }

  unsubscribeFromModel(modelId: string): void {
    this.modelSubscriptions.delete(modelId);
    this.send({ type: 'unsubscribe_model', modelId });
  }

  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.listeners.clear();
    this.modelSubscriptions.clear();
  }
}

// ============================================================================
// Main API Client
// ============================================================================
class ThreatModelApi {
  private baseUrl: string;
  public ws: WebSocketService;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.ws = new WebSocketService();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      const r = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error || d.message };
      return d;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error' };
    }
  }

  // ==================== Dashboard ====================
  async getDashboard(): Promise<ApiResponse<ThreatDashboard>> {
    return this.request('/dashboard');
  }

  async getInfo(): Promise<ApiResponse<{ name: string; version: string; features: string[] }>> {
    return this.request('/info');
  }

  // ==================== Threat Models ====================
  async getModels(filters?: { status?: string; methodology?: string }): Promise<ApiResponse<ThreatModel[]>> {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return this.request(`/models${params ? `?${params}` : ''}`);
  }

  async getModelById(id: string): Promise<ApiResponse<ThreatModel>> {
    return this.request(`/threat-models/${id}`);
  }

  async createModel(model: Partial<ThreatModel>): Promise<ApiResponse<ThreatModel>> {
    return this.request('/threat-models', {
      method: 'POST',
      body: JSON.stringify(model)
    });
  }

  async updateModel(id: string, updates: Partial<ThreatModel>): Promise<ApiResponse<ThreatModel>> {
    return this.request(`/threat-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteModel(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/threat-models/${id}`, { method: 'DELETE' });
  }

  // ==================== Threats ====================
  async getThreats(modelId?: string): Promise<ApiResponse<Threat[]>> {
    return this.request(modelId ? `/threat-models/${modelId}/threats` : '/threats');
  }

  async getThreatById(id: string): Promise<ApiResponse<Threat>> {
    return this.request(`/threats/${id}`);
  }

  async createThreat(modelId: string, threat: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return this.request(`/threat-models/${modelId}/threats`, {
      method: 'POST',
      body: JSON.stringify(threat)
    });
  }

  async updateThreat(id: string, updates: Partial<Threat>): Promise<ApiResponse<Threat>> {
    return this.request(`/threats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // ==================== AI Analysis ====================
  async analyzeModel(modelId: string): Promise<ApiResponse<{ strideAnalysis: STRIDEAnalysis[]; risks: Threat[]; recommendations: string[] }>> {
    return this.request(`/ai/analyze/${modelId}`, { method: 'POST' });
  }

  async autoDetectThreats(modelId: string): Promise<ApiResponse<{ threats: Threat[]; confidence: number }>> {
    return this.request(`/ai/auto-detect/${modelId}`, { method: 'POST' });
  }

  async generateSTRIDE(modelId: string): Promise<ApiResponse<STRIDEAnalysis[]>> {
    return this.request(`/ai/stride/${modelId}`, { method: 'POST' });
  }

  async generatePASTA(modelId: string): Promise<ApiResponse<PASTAAnalysis[]>> {
    return this.request(`/ai/pasta/${modelId}`, { method: 'POST' });
  }

  async generateAttackTrees(modelId: string, threatId?: string): Promise<ApiResponse<AttackTree[]>> {
    return this.request(`/ai/attack-trees/${modelId}${threatId ? `?threatId=${threatId}` : ''}`, { method: 'POST' });
  }

  async suggestMitigations(threatId: string): Promise<ApiResponse<Mitigation[]>> {
    return this.request(`/ai/suggest-mitigations/${threatId}`, { method: 'POST' });
  }

  async calculateDREAD(threatId: string): Promise<ApiResponse<DREADScore>> {
    return this.request(`/ai/dread-score/${threatId}`, { method: 'POST' });
  }

  async mapToCompliance(modelId: string, frameworks: string[]): Promise<ApiResponse<{ framework: string; mappings: object[] }[]>> {
    return this.request(`/ai/compliance-mapping/${modelId}`, {
      method: 'POST',
      body: JSON.stringify({ frameworks })
    });
  }

  async getExecutiveSummary(modelId: string): Promise<ApiResponse<{ summary: string; keyRisks: string[]; recommendations: string[] }>> {
    return this.request(`/ai/executive-summary/${modelId}`);
  }

  // ==================== Threat Intelligence ====================
  async searchCVEs(query: string, options?: { severity?: string; year?: number }): Promise<ApiResponse<CVE[]>> {
    const params = new URLSearchParams({ query, ...options as Record<string, string> }).toString();
    return this.request(`/intel/cve/search?${params}`);
  }

  async getCVEById(cveId: string): Promise<ApiResponse<CVE>> {
    return this.request(`/intel/cve/${cveId}`);
  }

  async getMITRETechniques(tactic?: string, platform?: string): Promise<ApiResponse<MITRETechnique[]>> {
    const params = new URLSearchParams({ ...(tactic && { tactic }), ...(platform && { platform }) }).toString();
    return this.request(`/intel/mitre/techniques${params ? `?${params}` : ''}`);
  }

  async analyzeURL(url: string): Promise<ApiResponse<{ malicious: boolean; score: number; threats: string[] }>> {
    return this.request('/intel/virustotal/url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  async analyzeDomain(domain: string): Promise<ApiResponse<{ reputation: number; categories: string[]; threats: string[] }>> {
    return this.request('/intel/virustotal/domain', {
      method: 'POST',
      body: JSON.stringify({ domain })
    });
  }

  async searchShodan(query: string): Promise<ApiResponse<{ results: object[]; total: number }>> {
    return this.request(`/intel/shodan/search?query=${encodeURIComponent(query)}`);
  }

  async getOWASPTop10(): Promise<ApiResponse<{ id: string; name: string; description: string; mitigations: string[] }[]>> {
    return this.request('/intel/owasp/top10');
  }

  // ==================== Reports ====================
  async generateReport(modelId: string, options: { type: string; format: string; sections?: string[] }): Promise<ApiResponse<Report>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ modelId, ...options })
    });
  }

  async getReportForModel(modelId: string, format: string = 'html'): Promise<ApiResponse<Report>> {
    return this.request(`/reports/threat-model/${modelId}?format=${format}`);
  }

  async exportModel(modelId: string, format: 'json' | 'yaml' | 'csv'): Promise<ApiResponse<{ content: string; filename: string }>> {
    return this.request(`/reports/export/${modelId}?format=${format}`);
  }

  // ==================== Components & Data Flows ====================
  async getComponents(modelId: string): Promise<ApiResponse<Component[]>> {
    return this.request(`/threat-models/${modelId}/components`);
  }

  async addComponent(modelId: string, component: Partial<Component>): Promise<ApiResponse<Component>> {
    return this.request(`/threat-models/${modelId}/components`, {
      method: 'POST',
      body: JSON.stringify(component)
    });
  }

  async getDataFlows(modelId: string): Promise<ApiResponse<DataFlow[]>> {
    return this.request(`/threat-models/${modelId}/data-flows`);
  }

  async addDataFlow(modelId: string, dataFlow: Partial<DataFlow>): Promise<ApiResponse<DataFlow>> {
    return this.request(`/threat-models/${modelId}/data-flows`, {
      method: 'POST',
      body: JSON.stringify(dataFlow)
    });
  }

  // ==================== Mitigations ====================
  async getMitigations(modelId?: string): Promise<ApiResponse<Mitigation[]>> {
    return this.request(modelId ? `/threat-models/${modelId}/mitigations` : '/mitigations');
  }

  async updateMitigation(id: string, updates: Partial<Mitigation>): Promise<ApiResponse<Mitigation>> {
    return this.request(`/mitigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
}

export const threatModelApi = new ThreatModelApi();

// ============================================================================
// Simulated Data for Demo Mode
// ============================================================================
export const simulatedData = {
  dashboard: {
    overview: {
      totalModels: 24,
      totalThreats: 186,
      mitigatedThreats: 142,
      criticalThreats: 12,
      activeAnalyses: 3,
      riskScore: 67
    },
    strideBreakdown: [
      { category: 'Spoofing', count: 28, percentage: 15 },
      { category: 'Tampering', count: 35, percentage: 19 },
      { category: 'Repudiation', count: 18, percentage: 10 },
      { category: 'Info Disclosure', count: 42, percentage: 23 },
      { category: 'DoS', count: 31, percentage: 17 },
      { category: 'Elevation', count: 32, percentage: 17 }
    ],
    threatsByCategory: [
      { category: 'STRIDE', count: 85 },
      { category: 'DREAD', count: 56 },
      { category: 'PASTA', count: 45 }
    ],
    threatsBySeverity: [
      { severity: 'critical', count: 12 },
      { severity: 'high', count: 34 },
      { severity: 'medium', count: 78 },
      { severity: 'low', count: 62 }
    ],
    mitigationProgress: [
      { status: 'implemented', count: 89 },
      { status: 'in_progress', count: 42 },
      { status: 'proposed', count: 55 }
    ],
    topRisks: [],
    recentThreats: [
      { _id: '1', name: 'SQL Injection', category: 'STRIDE', type: 'Tampering', description: 'User input not sanitized in login form', severity: 'critical', likelihood: 0.8, impact: 0.9, riskScore: 8.5, mitigations: [], assets: ['Database', 'Web Server'], status: 'identified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '2', name: 'Session Hijacking', category: 'STRIDE', type: 'Spoofing', description: 'Insecure session token generation', severity: 'high', likelihood: 0.6, impact: 0.8, riskScore: 7.2, mitigations: [], assets: ['Auth Service'], status: 'analyzing', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '3', name: 'XSS Attack', category: 'STRIDE', type: 'Tampering', description: 'Reflected XSS in search parameter', severity: 'high', likelihood: 0.7, impact: 0.7, riskScore: 6.8, mitigations: [], assets: ['Web Frontend'], status: 'mitigated', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    recentActivity: [
      { action: 'Threat Added', target: 'SQL Injection', user: 'admin', timestamp: new Date().toISOString() },
      { action: 'Analysis Complete', target: 'Web App Model', user: 'ai-engine', timestamp: new Date().toISOString() },
      { action: 'Mitigation Updated', target: 'Input Validation', user: 'security-lead', timestamp: new Date().toISOString() }
    ],
    complianceStatus: [
      { framework: 'OWASP Top 10', score: 78, status: 'partial' },
      { framework: 'NIST CSF', score: 65, status: 'partial' },
      { framework: 'ISO 27001', score: 82, status: 'compliant' }
    ]
  } as ThreatDashboard,
  
  models: [
    { _id: '1', name: 'E-Commerce Platform', description: 'Main e-commerce web application threat model', scope: 'Production', methodology: 'STRIDE', status: 'approved', threats: [], components: [], dataFlows: [], assets: [{ _id: '1', name: 'Customer Data', type: 'data', value: 'critical', description: 'PII and payment info' }], trustBoundaries: [], attackSurface: ['API Endpoints', 'Web UI', 'Mobile App'], riskLevel: 'high', owner: 'security-team', reviewers: ['ciso', 'dev-lead'], version: '2.1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: '2', name: 'Payment Gateway', description: 'Payment processing system', scope: 'Production', methodology: 'PASTA', status: 'in_progress', threats: [], components: [], dataFlows: [], assets: [], trustBoundaries: [], attackSurface: ['Payment API'], riskLevel: 'critical', owner: 'payment-team', reviewers: [], version: '1.0.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: '3', name: 'Internal Admin Portal', description: 'Administrative dashboard for operations', scope: 'Internal', methodology: 'STRIDE', status: 'draft', threats: [], components: [], dataFlows: [], assets: [], trustBoundaries: [], attackSurface: ['Admin UI'], riskLevel: 'medium', owner: 'ops-team', reviewers: [], version: '0.5.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ] as ThreatModel[],

  threats: [
    { _id: '1', name: 'SQL Injection', category: 'STRIDE', type: 'Tampering', description: 'Attacker can inject SQL commands through unsanitized user input', severity: 'critical', likelihood: 0.8, impact: 0.9, riskScore: 8.5, mitigations: [], assets: ['Database'], status: 'identified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: '2', name: 'Credential Stuffing', category: 'STRIDE', type: 'Spoofing', description: 'Automated login attempts using leaked credentials', severity: 'high', likelihood: 0.9, impact: 0.7, riskScore: 7.8, mitigations: [], assets: ['Auth Service'], status: 'analyzing', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { _id: '3', name: 'Insecure Direct Object Reference', category: 'STRIDE', type: 'InformationDisclosure', description: 'Users can access other users data by modifying IDs', severity: 'high', likelihood: 0.6, impact: 0.8, riskScore: 7.2, mitigations: [], assets: ['API'], status: 'identified', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ] as Threat[],

  strideAnalysis: [
    { category: 'Spoofing', threatType: 'Identity Spoofing', description: 'Attacker impersonates legitimate user', affectedComponents: ['Auth Service', 'API Gateway'], likelihood: 0.7, impact: 0.8, riskScore: 7.5, suggestedMitigations: ['Implement MFA', 'Use strong session tokens', 'Add rate limiting'] },
    { category: 'Tampering', threatType: 'Data Tampering', description: 'Attacker modifies data in transit or at rest', affectedComponents: ['Database', 'API'], likelihood: 0.6, impact: 0.9, riskScore: 8.1, suggestedMitigations: ['Use HTTPS everywhere', 'Implement integrity checks', 'Add input validation'] },
    { category: 'Repudiation', threatType: 'Transaction Repudiation', description: 'User denies performing actions', affectedComponents: ['Payment Service', 'Order System'], likelihood: 0.4, impact: 0.6, riskScore: 5.2, suggestedMitigations: ['Implement audit logging', 'Use digital signatures', 'Add transaction IDs'] },
    { category: 'InformationDisclosure', threatType: 'Data Leakage', description: 'Sensitive data exposed to unauthorized users', affectedComponents: ['API', 'Database', 'Logs'], likelihood: 0.5, impact: 0.9, riskScore: 7.8, suggestedMitigations: ['Encrypt sensitive data', 'Implement access controls', 'Mask PII in logs'] },
    { category: 'DenialOfService', threatType: 'Service Unavailability', description: 'Attacker overwhelms system resources', affectedComponents: ['Web Server', 'API Gateway', 'Database'], likelihood: 0.7, impact: 0.7, riskScore: 7.0, suggestedMitigations: ['Implement rate limiting', 'Use CDN', 'Add auto-scaling'] },
    { category: 'ElevationOfPrivilege', threatType: 'Privilege Escalation', description: 'Attacker gains higher privileges', affectedComponents: ['Auth Service', 'Admin Portal'], likelihood: 0.3, impact: 1.0, riskScore: 8.5, suggestedMitigations: ['Implement RBAC', 'Regular permission audits', 'Least privilege principle'] }
  ] as STRIDEAnalysis[],

  mitreTechniques: [
    { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access', description: 'Adversaries may attempt to exploit a weakness in an Internet-facing host', platforms: ['Windows', 'Linux', 'macOS'], url: 'https://attack.mitre.org/techniques/T1190' },
    { id: 'T1078', name: 'Valid Accounts', tactic: 'Persistence', description: 'Adversaries may obtain and abuse credentials of existing accounts', platforms: ['Windows', 'Linux', 'macOS', 'Cloud'], url: 'https://attack.mitre.org/techniques/T1078' },
    { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', description: 'Adversaries may steal data by exfiltrating it over a different protocol', platforms: ['Windows', 'Linux', 'macOS'], url: 'https://attack.mitre.org/techniques/T1048' }
  ] as MITRETechnique[],

  owaspTop10: [
    { id: 'A01:2021', name: 'Broken Access Control', description: 'Restrictions on authenticated users are not properly enforced', mitigations: ['Deny by default', 'Implement access control mechanisms', 'Log access control failures'] },
    { id: 'A02:2021', name: 'Cryptographic Failures', description: 'Failures related to cryptography which often lead to sensitive data exposure', mitigations: ['Classify data by sensitivity', 'Encrypt data at rest and in transit', 'Use strong algorithms'] },
    { id: 'A03:2021', name: 'Injection', description: 'User-supplied data is not validated, filtered, or sanitized', mitigations: ['Use parameterized queries', 'Use positive server-side validation', 'Escape special characters'] },
    { id: 'A04:2021', name: 'Insecure Design', description: 'Missing or ineffective control design', mitigations: ['Use secure design patterns', 'Threat modeling', 'Security requirements'] },
    { id: 'A05:2021', name: 'Security Misconfiguration', description: 'Missing appropriate security hardening', mitigations: ['Minimal platform', 'Review configurations', 'Automated verification'] }
  ]
};

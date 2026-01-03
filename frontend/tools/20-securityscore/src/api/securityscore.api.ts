/**
 * SecurityScore API Client v2.0 - Enhanced Security Posture Scoring
 */
const API_BASE_URL = import.meta.env.VITE_SECURITYSCORE_API_URL || 'http://localhost:4020/api';
const WS_URL = import.meta.env.VITE_SECURITYSCORE_WS_URL || 'ws://localhost:4120';

// ======================
// Type Definitions
// ======================
export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  findings: { critical: number; high: number; medium: number; low: number };
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export interface SecurityScore {
  _id: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: ScoreCategory[];
  benchmarkComparison: { industry: number; peers: number; previous: number; percentile?: number };
  trend: { date: string; score: number; change?: number }[];
  lastAssessment: string;
  nextScheduled: string;
}

export interface ScoreDashboard {
  currentScore: SecurityScore;
  improvements: { action: string; impact: number; effort: string; category: string; priority?: string }[];
  recentChanges: { date: string; change: number; reason: string }[];
  alerts?: Alert[];
  complianceStatus?: ComplianceStatus;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  category: string;
  timestamp: string;
}

export interface AIAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
}

export interface Recommendation {
  action: string;
  impact: string;
  effort: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedImprovement: number;
}

export interface ComplianceStatus {
  frameworks: FrameworkCompliance[];
  overallCompliance: number;
  gaps: ComplianceGap[];
}

export interface FrameworkCompliance {
  id: string;
  name: string;
  compliance: number;
  controlsSatisfied: number;
  totalControls: number;
  status: string;
}

export interface ComplianceGap {
  framework: string;
  control: string;
  category: string;
  gap: number;
  priority: string;
}

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
  trend: 'improving' | 'stable' | 'worsening';
  mttr: number;
  affectedAssets: number;
}

export interface PredictedScore {
  date: string;
  predictedScore: number;
  confidence: number;
  confidenceInterval: { lower: number; upper: number };
  trendDirection: string;
}

export interface RiskScenario {
  name: string;
  description: string;
  projectedScore: number;
  probability: number;
  assumptions: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: string[];
  format: string;
}

export interface GeneratedReport {
  reportId: string;
  type: string;
  format: string;
  filename: string;
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
}

// ======================
// API Client Class
// ======================
class SecurityScoreApi {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(baseUrl: string = API_BASE_URL, wsUrl: string = WS_URL) {
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Request failed' };
      return data;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // ======================
  // Score Operations
  // ======================
  async getDashboard(): Promise<ApiResponse<ScoreDashboard>> {
    return this.request('/dashboard');
  }

  async getScore(id?: string): Promise<ApiResponse<SecurityScore>> {
    return this.request(id ? `/scores/${id}` : '/scores');
  }

  async getScoreBreakdown(id: string): Promise<ApiResponse<any>> {
    return this.request(`/scores/${id}/breakdown`);
  }

  async getScoreTrend(id: string): Promise<ApiResponse<any>> {
    return this.request(`/scores/${id}/trend`);
  }

  async calculateScore(id: string): Promise<ApiResponse<SecurityScore>> {
    return this.request(`/scores/${id}/calculate`, { method: 'POST' });
  }

  // ======================
  // AI Analysis
  // ======================
  async getAIAnalysis(securityData: any, options?: any): Promise<ApiResponse<AIAnalysis>> {
    return this.request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ securityData, options })
    });
  }

  async getAIRecommendations(securityScore: SecurityScore, context?: any): Promise<ApiResponse<Recommendation[]>> {
    return this.request('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({ securityScore, context })
    });
  }

  async getAIPrediction(historicalData: any[], periods: number = 6): Promise<ApiResponse<any>> {
    return this.request('/ai/predict', {
      method: 'POST',
      body: JSON.stringify({ historicalData, periods })
    });
  }

  async getIndustryComparison(score: number, industry: string): Promise<ApiResponse<any>> {
    return this.request('/ai/compare', {
      method: 'POST',
      body: JSON.stringify({ score, industry })
    });
  }

  // ======================
  // External Ratings
  // ======================
  async getExternalRatings(organizationId: string, platforms?: string[]): Promise<ApiResponse<any>> {
    const query = platforms ? `?platforms=${platforms.join(',')}` : '';
    return this.request(`/external/ratings/${organizationId}${query}`);
  }

  async getIndustryBenchmarks(industry?: string, size?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (size) params.append('size', size);
    return this.request(`/external/benchmarks?${params.toString()}`);
  }

  async getPeerComparison(organizationId: string): Promise<ApiResponse<any>> {
    return this.request(`/external/peers/${organizationId}`);
  }

  // ======================
  // Vulnerabilities
  // ======================
  async getVulnerabilities(organizationId: string): Promise<ApiResponse<VulnerabilitySummary>> {
    return this.request(`/vulnerabilities/${organizationId}`);
  }

  async getVulnerabilityTrend(organizationId: string, days: number = 90): Promise<ApiResponse<any>> {
    return this.request(`/vulnerabilities/${organizationId}/trend?days=${days}`);
  }

  async getAffectedAssets(organizationId: string): Promise<ApiResponse<any>> {
    return this.request(`/vulnerabilities/${organizationId}/assets`);
  }

  // ======================
  // Compliance
  // ======================
  async getComplianceFrameworks(): Promise<ApiResponse<FrameworkCompliance[]>> {
    return this.request('/compliance/frameworks');
  }

  async getComplianceStatus(securityScore: any, frameworks?: string[]): Promise<ApiResponse<ComplianceStatus>> {
    return this.request('/compliance/status', {
      method: 'POST',
      body: JSON.stringify({ securityScore, frameworks })
    });
  }

  async getComplianceGaps(frameworkId: string, securityScore: any): Promise<ApiResponse<any>> {
    return this.request(`/compliance/gaps/${frameworkId}`, {
      method: 'POST',
      body: JSON.stringify({ securityScore })
    });
  }

  // ======================
  // Predictive Analytics
  // ======================
  async getForecast(organizationId: string, historicalScores: any[], periods: number = 6): Promise<ApiResponse<PredictedScore[]>> {
    return this.request('/predictive/forecast', {
      method: 'POST',
      body: JSON.stringify({ organizationId, historicalScores, periods })
    });
  }

  async getCategoryRisks(organizationId: string, currentScores: any): Promise<ApiResponse<any>> {
    return this.request('/predictive/risks', {
      method: 'POST',
      body: JSON.stringify({ organizationId, currentScores })
    });
  }

  async getRiskScenarios(organizationId: string, currentScore: any): Promise<ApiResponse<RiskScenario[]>> {
    return this.request('/predictive/scenarios', {
      method: 'POST',
      body: JSON.stringify({ organizationId, currentScore })
    });
  }

  async detectAnomalies(organizationId: string, historicalScores: any[]): Promise<ApiResponse<any>> {
    return this.request('/predictive/anomalies', {
      method: 'POST',
      body: JSON.stringify({ organizationId, historicalScores })
    });
  }

  // ======================
  // Reporting
  // ======================
  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    return this.request('/reports/templates');
  }

  async generateReport(type: string, data: any, options?: { format?: string }): Promise<ApiResponse<GeneratedReport>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, data, options })
    });
  }

  async downloadReport(reportId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}`);
      if (!response.ok) return null;
      return await response.blob();
    } catch {
      return null;
    }
  }

  // ======================
  // Comprehensive Analysis
  // ======================
  async runComprehensiveAnalysis(organizationId: string, securityScore: any, options?: any): Promise<ApiResponse<any>> {
    return this.request('/analyze/comprehensive', {
      method: 'POST',
      body: JSON.stringify({ organizationId, securityScore, options })
    });
  }

  async runQuickAnalysis(securityScore: any, industry?: string): Promise<ApiResponse<any>> {
    return this.request('/analyze/quick', {
      method: 'POST',
      body: JSON.stringify({ securityScore, industry })
    });
  }

  // ======================
  // WebSocket
  // ======================
  connectWebSocket(organizationId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.ws?.send(JSON.stringify({
        type: 'subscribe',
        data: { organizationId }
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const listeners = this.listeners.get(message.type) || [];
        listeners.forEach(listener => listener(message.data));
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => this.connectWebSocket(organizationId), 5000);
    };
  }

  onScoreUpdate(callback: (data: any) => void): void {
    const listeners = this.listeners.get('score_update') || [];
    listeners.push(callback);
    this.listeners.set('score_update', listeners);
  }

  onAlert(callback: (data: any) => void): void {
    const listeners = this.listeners.get('alert') || [];
    listeners.push(callback);
    this.listeners.set('alert', listeners);
  }

  disconnectWebSocket(): void {
    this.ws?.close();
    this.ws = null;
  }
}

export const securityScoreApi = new SecurityScoreApi();

// ======================
// Simulated Data
// ======================
export const simulatedData = {
  dashboard: {
    currentScore: {
      _id: '1',
      overallScore: 78,
      grade: 'B' as const,
      categories: [
        { name: 'Network Security', score: 85, maxScore: 100, weight: 0.15, findings: { critical: 0, high: 2, medium: 5, low: 8 }, trend: 'up' as const, change: 3 },
        { name: 'Endpoint Security', score: 72, maxScore: 100, weight: 0.15, findings: { critical: 1, high: 3, medium: 7, low: 12 }, trend: 'stable' as const, change: 0 },
        { name: 'Identity & Access', score: 80, maxScore: 100, weight: 0.20, findings: { critical: 0, high: 1, medium: 4, low: 6 }, trend: 'up' as const, change: 5 },
        { name: 'Data Protection', score: 75, maxScore: 100, weight: 0.15, findings: { critical: 0, high: 2, medium: 6, low: 10 }, trend: 'down' as const, change: -2 },
        { name: 'Application Security', score: 68, maxScore: 100, weight: 0.15, findings: { critical: 2, high: 4, medium: 8, low: 14 }, trend: 'stable' as const, change: 1 },
        { name: 'Cloud Security', score: 82, maxScore: 100, weight: 0.10, findings: { critical: 0, high: 1, medium: 3, low: 5 }, trend: 'up' as const, change: 4 },
        { name: 'Compliance', score: 90, maxScore: 100, weight: 0.10, findings: { critical: 0, high: 0, medium: 2, low: 4 }, trend: 'up' as const, change: 2 }
      ],
      benchmarkComparison: { industry: 72, peers: 75, previous: 74, percentile: 68 },
      trend: [
        { date: '2024-01', score: 70, change: 0 },
        { date: '2024-02', score: 72, change: 2 },
        { date: '2024-03', score: 74, change: 2 },
        { date: '2024-04', score: 73, change: -1 },
        { date: '2024-05', score: 76, change: 3 },
        { date: '2024-06', score: 78, change: 2 }
      ],
      lastAssessment: new Date().toISOString(),
      nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    improvements: [
      { action: 'Enable MFA for all privileged accounts', impact: 8, effort: 'Medium', category: 'Identity & Access', priority: 'Critical' },
      { action: 'Patch 2 critical application vulnerabilities', impact: 12, effort: 'High', category: 'Application Security', priority: 'Critical' },
      { action: 'Implement network segmentation for PCI zone', impact: 6, effort: 'High', category: 'Network Security', priority: 'High' },
      { action: 'Deploy endpoint detection on remaining 15% of assets', impact: 5, effort: 'Medium', category: 'Endpoint Security', priority: 'High' },
      { action: 'Encrypt data at rest for customer database', impact: 4, effort: 'Medium', category: 'Data Protection', priority: 'Medium' }
    ],
    recentChanges: [
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), change: 2, reason: 'Resolved 3 high-severity findings' },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), change: -1, reason: 'New vulnerability discovered' },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), change: 3, reason: 'MFA rollout completed' }
    ],
    alerts: [
      { id: '1', type: 'critical' as const, message: '2 critical vulnerabilities require immediate attention', category: 'Application Security', timestamp: new Date().toISOString() },
      { id: '2', type: 'warning' as const, message: 'Compliance audit due in 14 days', category: 'Compliance', timestamp: new Date().toISOString() }
    ]
  } as ScoreDashboard,

  aiAnalysis: {
    overview: 'Your security posture is above industry average with a score of 78/100 (Grade B). Key strengths include strong compliance and cloud security practices. Primary improvement opportunities exist in application security and endpoint coverage.',
    strengths: [
      'Strong compliance posture (90/100)',
      'Cloud security controls well implemented (82/100)',
      'Network perimeter protection above average',
      'Identity management practices maturing'
    ],
    weaknesses: [
      'Application security has 2 critical vulnerabilities',
      'Endpoint protection coverage at 85%',
      'Data encryption not fully implemented',
      'Patch management cycle exceeds 30 days'
    ],
    recommendations: [
      { action: 'Remediate critical CVEs in production applications', impact: 'High', effort: 'High', category: 'Application Security', priority: 'Critical' as const, estimatedImprovement: 8 },
      { action: 'Complete MFA rollout for all user accounts', impact: 'High', effort: 'Medium', category: 'Identity & Access', priority: 'High' as const, estimatedImprovement: 5 },
      { action: 'Implement data-at-rest encryption', impact: 'Medium', effort: 'Medium', category: 'Data Protection', priority: 'Medium' as const, estimatedImprovement: 4 }
    ],
    riskLevel: 'Medium' as const,
    confidence: 0.87
  } as AIAnalysis,

  complianceStatus: {
    frameworks: [
      { id: 'nist_csf', name: 'NIST Cybersecurity Framework', compliance: 78, controlsSatisfied: 84, totalControls: 108, status: 'Substantially Compliant' },
      { id: 'iso_27001', name: 'ISO/IEC 27001:2022', compliance: 72, controlsSatisfied: 67, totalControls: 93, status: 'Substantially Compliant' },
      { id: 'soc2', name: 'SOC 2 Type II', compliance: 85, controlsSatisfied: 54, totalControls: 64, status: 'Substantially Compliant' },
      { id: 'pci_dss', name: 'PCI DSS 4.0', compliance: 68, controlsSatisfied: 53, totalControls: 78, status: 'Partially Compliant' },
      { id: 'hipaa', name: 'HIPAA Security Rule', compliance: 82, controlsSatisfied: 44, totalControls: 54, status: 'Substantially Compliant' }
    ],
    overallCompliance: 77,
    gaps: [
      { framework: 'PCI DSS', control: '6.2', category: 'application', gap: 15, priority: 'High' },
      { framework: 'ISO 27001', control: 'A.12.6', category: 'endpoint', gap: 12, priority: 'Medium' },
      { framework: 'NIST CSF', control: 'PR.DS-1', category: 'data', gap: 10, priority: 'Medium' }
    ]
  } as ComplianceStatus,

  vulnerabilities: {
    critical: 2,
    high: 8,
    medium: 23,
    low: 45,
    total: 78,
    trend: 'improving' as const,
    mttr: 18.5,
    affectedAssets: 12
  } as VulnerabilitySummary,

  predictions: [
    { date: '2024-07', predictedScore: 80, confidence: 0.92, confidenceInterval: { lower: 78, upper: 82 }, trendDirection: 'Improving' },
    { date: '2024-08', predictedScore: 82, confidence: 0.88, confidenceInterval: { lower: 79, upper: 85 }, trendDirection: 'Improving' },
    { date: '2024-09', predictedScore: 83, confidence: 0.84, confidenceInterval: { lower: 79, upper: 87 }, trendDirection: 'Improving' },
    { date: '2024-10', predictedScore: 84, confidence: 0.80, confidenceInterval: { lower: 79, upper: 89 }, trendDirection: 'Stable' },
    { date: '2024-11', predictedScore: 85, confidence: 0.76, confidenceInterval: { lower: 79, upper: 91 }, trendDirection: 'Stable' },
    { date: '2024-12', predictedScore: 86, confidence: 0.72, confidenceInterval: { lower: 78, upper: 94 }, trendDirection: 'Stable' }
  ] as PredictedScore[],

  riskScenarios: [
    { name: 'Best Case', description: 'All planned improvements implemented successfully', projectedScore: 93, probability: 0.25, assumptions: ['Full security budget approval', 'Successful tool deployments', 'Complete training compliance'] },
    { name: 'Expected', description: 'Normal operations with gradual improvement', projectedScore: 83, probability: 0.50, assumptions: ['Current initiatives continue', 'Standard vulnerability remediation', 'Regular security operations'] },
    { name: 'Worst Case', description: 'Security challenges or incidents occur', projectedScore: 68, probability: 0.15, assumptions: ['Major vulnerability disclosure', 'Security tool failure', 'Staff turnover'] },
    { name: 'Crisis', description: 'Significant security breach or event', projectedScore: 53, probability: 0.10, assumptions: ['Data breach occurs', 'Regulatory action taken', 'Critical infrastructure compromise'] }
  ] as RiskScenario[]
};

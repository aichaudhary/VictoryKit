/**
 * RiskAssess API Client - Tool 19 - Enhanced Risk Assessment & Management
 * Features: AI Analysis, Real-time Collaboration, Threat Intelligence, Compliance Integration
 */
const API_BASE_URL = import.meta.env.VITE_RISKASSESS_API_URL || 'http://localhost:4019/api/v1';

export interface Risk {
  _id: string;
  name: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  owner: string;
  status: 'open' | 'mitigated' | 'accepted' | 'transferred';
  mitigations: { action: string; status: string; dueDate: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskMatrix {
  risks: { x: number; y: number; name: string; severity: string }[];
}

export interface RiskDashboard {
  overview: { totalRisks: number; highRisks: number; openRisks: number; avgRiskScore: number; };
  risksByCategory: { category: string; count: number }[];
  riskTrend: { date: string; score: number }[];
  topRisks: Risk[];
}

export interface AIAnalysisResult {
  consensus: {
    overall: number;
    confidence: number;
    factors: string[];
  };
  recommendations: {
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
  }[];
  models: {
    provider: string;
    score: number;
    confidence: number;
  }[];
}

export interface ThreatIntelligenceFeed {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  lastUpdate: string;
  threatCount: number;
  source: string;
}

export interface ComplianceFramework {
  name: string;
  description: string;
  compliance: number;
  requirements: number;
  gaps: number;
  lastAssessment: string;
}

export interface PredictivePrediction {
  riskName: string;
  predictedSeverity: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface CollaborationMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'notification';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
}

class RiskAssessApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const r = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error };
      return d;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Network error' };
    }
  }

  // Core Risk Assessment APIs
  async getDashboard(): Promise<ApiResponse<RiskDashboard>> {
    return this.request('/riskassess/dashboard');
  }

  async getRisks(): Promise<ApiResponse<Risk[]>> {
    return this.request('/riskassess/risks');
  }

  async getRiskMatrix(): Promise<ApiResponse<RiskMatrix>> {
    return this.request('/riskassess/matrix');
  }

  // AI Analysis APIs
  async getAIAnalysis(risks: Risk[]): Promise<ApiResponse<AIAnalysisResult>> {
    return this.request('/ai/analysis', {
      method: 'POST',
      body: JSON.stringify({ risks })
    });
  }

  async getAIAnalysisHistory(): Promise<ApiResponse<AIAnalysisResult[]>> {
    return this.request('/ai/analysis/history');
  }

  // Threat Intelligence APIs
  async getThreatFeeds(): Promise<ApiResponse<ThreatIntelligenceFeed[]>> {
    return this.request('/threat-intelligence/feeds');
  }

  async searchThreats(query: string): Promise<ApiResponse<any[]>> {
    return this.request('/threat-intelligence/search', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  // Compliance APIs
  async getComplianceStatus(): Promise<ApiResponse<ComplianceFramework[]>> {
    return this.request('/compliance/status');
  }

  async getComplianceGaps(framework: string): Promise<ApiResponse<any[]>> {
    return this.request(`/compliance/gaps/${framework}`);
  }

  // Predictive Analytics APIs
  async getPredictions(): Promise<ApiResponse<PredictivePrediction[]>> {
    return this.request('/analytics/predictions');
  }

  async getRiskTrends(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/trends');
  }

  // Advanced Reporting APIs
  async generateReport(type: 'pdf' | 'excel' | 'json', filters: any): Promise<ApiResponse<{ url: string }>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type, filters })
    });
  }

  async getReportTemplates(): Promise<ApiResponse<any[]>> {
    return this.request('/reports/templates');
  }

  // Real-time Collaboration APIs
  async joinCollaboration(sessionId: string): Promise<ApiResponse<{ sessionId: string; participants: string[] }>> {
    return this.request('/collaboration/join', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  async getCollaborationMessages(sessionId: string): Promise<ApiResponse<CollaborationMessage[]>> {
    return this.request(`/collaboration/messages/${sessionId}`);
  }

  // Health Check API
  async getHealth(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }
}

export const riskAssessApi = new RiskAssessApi();

export const simulatedData = {
  dashboard: {
    overview: { totalRisks: 78, highRisks: 15, openRisks: 42, avgRiskScore: 6.2 },
    risksByCategory: [
      { category: 'Security', count: 28 },
      { category: 'Compliance', count: 22 },
      { category: 'Operational', count: 18 }
    ],
    riskTrend: [
      { date: '2024-01', score: 7.1 },
      { date: '2024-02', score: 6.5 }
    ],
    topRisks: [{
      _id: '1',
      name: 'Data Breach Risk',
      category: 'Security',
      description: 'Potential unauthorized access to sensitive data',
      probability: 0.4,
      impact: 0.9,
      riskScore: 8.5,
      owner: 'CISO',
      status: 'open' as const,
      mitigations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
  } as RiskDashboard,

  risks: [{
    _id: '1',
    name: 'Ransomware Attack',
    category: 'Security',
    description: 'Risk of ransomware infection through phishing or vulnerabilities',
    probability: 0.3,
    impact: 0.95,
    riskScore: 8.8,
    owner: 'IT Security',
    status: 'open' as const,
    mitigations: [{
      action: 'Implement advanced backup verification',
      status: 'completed',
      dueDate: '2024-02-01'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }] as Risk[],

  aiAnalysis: {
    consensus: {
      overall: 8.2,
      confidence: 85,
      factors: ['High impact potential', 'Increasing threat landscape', 'Inadequate current controls']
    },
    recommendations: [
      {
        suggestion: 'Implement multi-factor authentication for all remote access',
        priority: 'high' as const,
        rationale: 'Reduces unauthorized access risk by 70%'
      },
      {
        suggestion: 'Conduct quarterly security awareness training',
        priority: 'medium' as const,
        rationale: 'Addresses human factor in security incidents'
      }
    ],
    models: [
      { provider: 'OpenAI', score: 8.5, confidence: 88 },
      { provider: 'Azure OpenAI', score: 8.1, confidence: 82 },
      { provider: 'Anthropic Claude', score: 8.3, confidence: 85 }
    ]
  } as AIAnalysisResult,

  threatFeeds: [
    {
      name: 'NVD (National Vulnerability Database)',
      description: 'Comprehensive vulnerability database',
      status: 'active' as const,
      lastUpdate: new Date().toISOString(),
      threatCount: 15420,
      source: 'NIST'
    },
    {
      name: 'MITRE ATT&CK',
      description: 'Tactics, techniques, and procedures of cyber adversaries',
      status: 'active' as const,
      lastUpdate: new Date().toISOString(),
      threatCount: 2450,
      source: 'MITRE'
    }
  ] as ThreatIntelligenceFeed[],

  complianceFrameworks: [
    {
      name: 'NIST CSF',
      description: 'NIST Cybersecurity Framework',
      compliance: 78,
      requirements: 108,
      gaps: 24,
      lastAssessment: new Date().toISOString()
    },
    {
      name: 'ISO 27001',
      description: 'Information Security Management Systems',
      compliance: 82,
      requirements: 114,
      gaps: 20,
      lastAssessment: new Date().toISOString()
    }
  ] as ComplianceFramework[],

  predictions: [
    {
      riskName: 'Data Breach Risk',
      predictedSeverity: 'high' as const,
      trend: 'increasing' as const,
      confidence: 87,
      timeframe: '3 months',
      factors: ['Increasing cyber threats', 'Remote work expansion', 'Data volume growth']
    }
  ] as PredictivePrediction[]
};

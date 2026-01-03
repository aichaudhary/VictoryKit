/**
 * RiskAssess API Client - Tool 19 - Risk Assessment & Management
 */
const API_BASE_URL = import.meta.env.VITE_RISKASSESS_API_URL || 'http://localhost:4019/api/v1/riskassess';

export interface Risk { _id: string; name: string; category: string; description: string; probability: number; impact: number; riskScore: number; owner: string; status: 'open' | 'mitigated' | 'accepted' | 'transferred'; mitigations: { action: string; status: string; dueDate: string }[]; createdAt: string; updatedAt: string; }
export interface RiskMatrix { risks: { x: number; y: number; name: string; severity: string }[]; }
export interface RiskDashboard { overview: { totalRisks: number; highRisks: number; openRisks: number; avgRiskScore: number; }; risksByCategory: { category: string; count: number }[]; riskTrend: { date: string; score: number }[]; topRisks: Risk[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class RiskAssessApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<RiskDashboard>> { return this.request('/dashboard'); }
  async getRisks(): Promise<ApiResponse<Risk[]>> { return this.request('/risks'); }
  async getRiskMatrix(): Promise<ApiResponse<RiskMatrix>> { return this.request('/matrix'); }
}

export const riskAssessApi = new RiskAssessApi();
export const simulatedData = {
  dashboard: { overview: { totalRisks: 78, highRisks: 15, openRisks: 42, avgRiskScore: 6.2 }, risksByCategory: [{ category: 'Security', count: 28 }, { category: 'Compliance', count: 22 }, { category: 'Operational', count: 18 }], riskTrend: [{ date: '2024-01', score: 7.1 }, { date: '2024-02', score: 6.5 }], topRisks: [{ _id: '1', name: 'Data Breach Risk', category: 'Security', description: 'Potential unauthorized access', probability: 0.4, impact: 0.9, riskScore: 8.5, owner: 'CISO', status: 'open', mitigations: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } as RiskDashboard,
  risks: [{ _id: '1', name: 'Ransomware Attack', category: 'Security', description: 'Risk of ransomware infection', probability: 0.3, impact: 0.95, riskScore: 8.8, owner: 'IT Security', status: 'open', mitigations: [{ action: 'Backup verification', status: 'completed', dueDate: '2024-02-01' }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] as Risk[],
};

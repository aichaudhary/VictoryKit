/**
 * SecurityScore API Client - Tool 20 - Security Posture Scoring
 */
const API_BASE_URL = import.meta.env.VITE_SECURITYSCORE_API_URL || 'http://localhost:4020/api/v1/securityscore';

export interface ScoreCategory { name: string; score: number; maxScore: number; weight: number; findings: { critical: number; high: number; medium: number; low: number }; }
export interface SecurityScore { _id: string; overallScore: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; categories: ScoreCategory[]; benchmarkComparison: { industry: number; peers: number; previous: number }; trend: { date: string; score: number }[]; lastAssessment: string; nextScheduled: string; }
export interface ScoreDashboard { currentScore: SecurityScore; improvements: { action: string; impact: number; effort: string; category: string }[]; recentChanges: { date: string; change: number; reason: string }[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class SecurityScoreApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<ScoreDashboard>> { return this.request('/dashboard'); }
  async getScore(): Promise<ApiResponse<SecurityScore>> { return this.request('/score'); }
  async runAssessment(): Promise<ApiResponse<SecurityScore>> { return this.request('/assess', { method: 'POST' }); }
}

export const securityScoreApi = new SecurityScoreApi();
export const simulatedData = {
  dashboard: { currentScore: { _id: '1', overallScore: 78, grade: 'B', categories: [{ name: 'Network Security', score: 85, maxScore: 100, weight: 0.25, findings: { critical: 0, high: 2, medium: 5, low: 8 } }, { name: 'Application Security', score: 72, maxScore: 100, weight: 0.25, findings: { critical: 1, high: 3, medium: 7, low: 12 } }, { name: 'Data Protection', score: 80, maxScore: 100, weight: 0.25, findings: { critical: 0, high: 1, medium: 4, low: 6 } }, { name: 'Access Control', score: 75, maxScore: 100, weight: 0.25, findings: { critical: 0, high: 2, medium: 6, low: 10 } }], benchmarkComparison: { industry: 72, peers: 75, previous: 74 }, trend: [{ date: '2024-01', score: 74 }, { date: '2024-02', score: 76 }, { date: '2024-03', score: 78 }], lastAssessment: new Date().toISOString(), nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }, improvements: [{ action: 'Enable MFA everywhere', impact: 5, effort: 'Medium', category: 'Access Control' }, { action: 'Patch critical vulns', impact: 8, effort: 'High', category: 'Application Security' }], recentChanges: [{ date: new Date().toISOString(), change: 2, reason: 'Resolved 3 high findings' }] } as ScoreDashboard,
};

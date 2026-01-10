import { DNSQuery, BlockedDomain, ThreatIntelligence, DNSPolicy, DNSAnalytics, DomainReputation, DNSTunnelingLog, ResolverCache, DNSSECRecord, UserSettings, DNSStats, QueryPattern, ThreatReport } from '../types/dnsfirewall';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4037';

class DNSFirewallAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  // DNS Query Management
  async queryDomain(data: { domain: string; queryType?: string; clientIP?: string }): Promise<DNSQuery> {
    const response = await fetch(`${this.baseURL}/api/dns/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getQueryHistory(params: { limit?: number; offset?: number; clientIP?: string; domain?: string }): Promise<{ queries: DNSQuery[]; total: number }> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/dns/queries?${queryString}`);
    return response.json();
  }

  async getQueryById(queryId: string): Promise<DNSQuery> {
    const response = await fetch(`${this.baseURL}/api/dns/queries/${queryId}`);
    return response.json();
  }

  // Blocked Domains
  async getBlockedDomains(params?: { page?: number; limit?: number; category?: string }): Promise<{ domains: BlockedDomain[]; total: number }> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/blocked?${queryString}`);
    return response.json();
  }

  async blockDomain(data: { domain: string; category: string; reason: string; duration?: number }): Promise<BlockedDomain> {
    const response = await fetch(`${this.baseURL}/api/blocked`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async unblockDomain(domainId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/api/blocked/${domainId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Threat Intelligence
  async getThreatIntelligence(params?: { category?: string; severity?: string; limit?: number }): Promise<ThreatIntelligence[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/threats?${queryString}`);
    return response.json();
  }

  async checkDomainReputation(domain: string): Promise<DomainReputation> {
    const response = await fetch(`${this.baseURL}/api/reputation/${encodeURIComponent(domain)}`);
    return response.json();
  }

  async updateThreatFeeds(): Promise<{ updated: number; added: number; removed: number }> {
    const response = await fetch(`${this.baseURL}/api/threats/update`, {
      method: 'POST'
    });
    return response.json();
  }

  // DNS Policies
  async getPolicies(): Promise<DNSPolicy[]> {
    const response = await fetch(`${this.baseURL}/api/policies`);
    return response.json();
  }

  async createPolicy(policy: Omit<DNSPolicy, '_id' | 'createdAt' | 'updatedAt'>): Promise<DNSPolicy> {
    const response = await fetch(`${this.baseURL}/api/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    return response.json();
  }

  async updatePolicy(policyId: string, updates: Partial<DNSPolicy>): Promise<DNSPolicy> {
    const response = await fetch(`${this.baseURL}/api/policies/${policyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async deletePolicy(policyId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseURL}/api/policies/${policyId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // DNS Analytics
  async getAnalytics(timeRange: string): Promise<DNSAnalytics> {
    const response = await fetch(`${this.baseURL}/api/analytics?timeRange=${timeRange}`);
    return response.json();
  }

  async getTopDomains(params: { limit?: number; timeRange?: string; category?: string }): Promise<{ domain: string; queries: number; blocked: boolean }[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/analytics/top-domains?${queryString}`);
    return response.json();
  }

  async getQueryStats(timeRange: string): Promise<DNSStats> {
    const response = await fetch(`${this.baseURL}/api/analytics/stats?timeRange=${timeRange}`);
    return response.json();
  }

  async getQueryPatterns(params: { timeRange: string; clientFilter?: string }): Promise<QueryPattern[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/analytics/patterns?${queryString}`);
    return response.json();
  }

  // DNS Tunneling Detection
  async getTunnelingLogs(params?: { limit?: number; severity?: string }): Promise<DNSTunnelingLog[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/tunneling?${queryString}`);
    return response.json();
  }

  async analyzeTunneling(data: { domain: string; queryPattern: any }): Promise<{ isTunneling: boolean; confidence: number; indicators: string[] }> {
    const response = await fetch(`${this.baseURL}/api/tunneling/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // DNSSEC
  async validateDNSSEC(domain: string): Promise<DNSSECRecord> {
    const response = await fetch(`${this.baseURL}/api/dnssec/validate/${encodeURIComponent(domain)}`);
    return response.json();
  }

  async getDNSSECStatus(domain: string): Promise<{ enabled: boolean; valid: boolean; algorithms: string[] }> {
    const response = await fetch(`${this.baseURL}/api/dnssec/status/${encodeURIComponent(domain)}`);
    return response.json();
  }

  // Cache Management
  async getCacheStats(): Promise<{ size: number; hitRate: number; missRate: number; entries: number }> {
    const response = await fetch(`${this.baseURL}/api/cache/stats`);
    return response.json();
  }

  async flushCache(domain?: string): Promise<{ success: boolean; flushed: number }> {
    const endpoint = domain 
      ? `${this.baseURL}/api/cache/flush/${encodeURIComponent(domain)}`
      : `${this.baseURL}/api/cache/flush`;
    const response = await fetch(endpoint, { method: 'POST' });
    return response.json();
  }

  async getCacheEntries(params?: { limit?: number; domain?: string }): Promise<ResolverCache[]> {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/cache/entries?${queryString}`);
    return response.json();
  }

  // Reporting
  async generateThreatReport(params: { reportType: string; startDate: string; endDate: string }): Promise<ThreatReport> {
    const response = await fetch(`${this.baseURL}/api/reports/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }

  async exportLogs(params: { startDate: string; endDate: string; format: string }): Promise<Blob> {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/reports/export?${queryString}`);
    return response.blob();
  }

  // User Settings
  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${this.baseURL}/api/settings`);
    return response.json();
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(`${this.baseURL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return response.json();
  }

  // Dashboard
  async getDashboard(): Promise<{
    totalQueries: number;
    blockedQueries: number;
    threatsStopped: number;
    cacheHitRate: number;
    topThreats: { category: string; count: number }[];
    recentBlocked: BlockedDomain[];
    queryTrends: { time: string; queries: number; blocked: number }[];
  }> {
    const response = await fetch(`${this.baseURL}/api/dashboard`);
    return response.json();
  }

  // Real-time Stats
  async getRealtimeStats(): Promise<{
    qps: number;
    blockedPerSecond: number;
    activeClients: number;
    cacheHitRate: number;
    avgResponseTime: number;
  }> {
    const response = await fetch(`${this.baseURL}/api/stats/realtime`);
    return response.json();
  }
}

export default new DNSFirewallAPI();

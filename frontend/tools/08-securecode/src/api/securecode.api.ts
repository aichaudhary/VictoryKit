/**
 * SecureCode API Client
 * Static Application Security Testing (SAST) Tool
 */

// Vite environment variable type declaration
declare const import_meta_env: { VITE_SECURECODE_API_URL?: string } | undefined;

const getApiUrl = (): string => {
  try {
    // @ts-ignore - Vite injects import.meta.env at build time
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SECURECODE_API_URL) {
      // @ts-ignore
      return import.meta.env.VITE_SECURECODE_API_URL;
    }
  } catch {
    // Fallback for environments without import.meta
  }
  return 'http://localhost:4008/api';
};

const API_BASE_URL = getApiUrl();

// =====================================
// TYPE DEFINITIONS
// =====================================

export interface ScanOptions {
  code?: string;
  repositoryId?: string;
  branch?: string;
  language?: string;
  scanTypes?: ('sast' | 'secrets' | 'dependencies')[];
  includeFixSuggestions?: boolean;
  customRules?: string[];
}

export interface Finding {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  endLine?: number;
  column?: number;
  codeSnippet?: string;
  cweId?: string;
  owaspCategory?: string;
  suggestedFix?: string;
  confidence: 'high' | 'medium' | 'low';
  scanner: string;
}

export interface ScanResult {
  id: string;
  status: 'completed' | 'failed' | 'pending';
  scanType: string;
  securityScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  findings: Finding[];
  summary: {
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    fixed: number;
  };
  metadata: {
    language?: string;
    linesOfCode?: number;
    filesScanned?: number;
    duration?: number;
    scanners?: string[];
  };
  createdAt: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  defaultBranch: string;
  status: 'active' | 'inactive' | 'error';
  lastScanAt?: string;
  lastSyncAt?: string;
  scanSettings: {
    autoScan: boolean;
    scanOnPush: boolean;
    scanOnPR: boolean;
    scanSchedule: string;
    enabledScanners: string[];
    excludePaths: string[];
  };
  metadata: {
    language?: string;
    stars?: number;
    forks?: number;
    isPrivate?: boolean;
    lastCommit?: string;
  };
  createdAt: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  languages: string[];
  pattern?: string;
  cweId?: string;
  owaspCategory?: string;
  isEnabled: boolean;
  isBuiltIn: boolean;
  fixTemplate?: string;
  createdAt: string;
}

export interface FixSuggestion {
  findingId: string;
  title: string;
  description: string;
  fixedCode: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  references: string[];
}

export interface ScanStats {
  overview: {
    totalScans: number;
    totalRepositories: number;
    totalFindings: number;
    averageScore: number;
    fixedFindings: number;
  };
  trends: {
    scansPerDay: { date: string; count: number }[];
    findingsPerDay: { date: string; count: number }[];
    scoreHistory: { date: string; score: number }[];
  };
  topVulnerabilities: {
    type: string;
    count: number;
    severity: string;
  }[];
  languageBreakdown: {
    language: string;
    count: number;
    findings: number;
  }[];
}

// =====================================
// API CLIENT CLASS
// =====================================

class SecureCodeAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('SecureCode API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // =====================================
  // ANALYSIS ENDPOINTS
  // =====================================

  /**
   * Run a full security scan (SAST + Secrets + Dependencies)
   */
  async runFullScan(options: ScanOptions): Promise<{ success: boolean; data?: ScanResult; error?: string }> {
    return this.request<ScanResult>('/analysis/scan', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Run SAST scan only
   */
  async runSastScan(code: string, language?: string): Promise<{ success: boolean; data?: ScanResult; error?: string }> {
    return this.request<ScanResult>('/analysis/sast', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }

  /**
   * Run secrets detection scan
   */
  async runSecretsScan(code: string): Promise<{ success: boolean; data?: ScanResult; error?: string }> {
    return this.request<ScanResult>('/analysis/secrets', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  /**
   * Run dependency vulnerability scan
   */
  async runDependencyScan(packageJson: string, lockFile?: string): Promise<{ success: boolean; data?: ScanResult; error?: string }> {
    return this.request<ScanResult>('/analysis/dependencies', {
      method: 'POST',
      body: JSON.stringify({ packageJson, lockFile }),
    });
  }

  /**
   * Get AI-powered fix suggestions for findings
   */
  async getFixSuggestions(findings: Finding[]): Promise<{ success: boolean; data?: FixSuggestion[]; error?: string }> {
    return this.request<FixSuggestion[]>('/analysis/fix', {
      method: 'POST',
      body: JSON.stringify({ findings }),
    });
  }

  /**
   * Get security rules
   */
  async getSecurityRules(filters?: {
    category?: string;
    severity?: string;
    language?: string;
    enabled?: boolean;
  }): Promise<{ success: boolean; data?: SecurityRule[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.language) params.append('language', filters.language);
    if (filters?.enabled !== undefined) params.append('enabled', String(filters.enabled));

    return this.request<SecurityRule[]>(`/analysis/rules?${params}`);
  }

  /**
   * Create a custom security rule
   */
  async createSecurityRule(rule: Partial<SecurityRule>): Promise<{ success: boolean; data?: SecurityRule; error?: string }> {
    return this.request<SecurityRule>('/analysis/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  /**
   * Get scan history
   */
  async getScanHistory(filters?: {
    repositoryId?: string;
    scanType?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: { scans: ScanResult[]; total: number }; error?: string }> {
    const params = new URLSearchParams();
    if (filters?.repositoryId) params.append('repository', filters.repositoryId);
    if (filters?.scanType) params.append('scanType', filters.scanType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    return this.request<{ scans: ScanResult[]; total: number }>(`/analysis/history?${params}`);
  }

  /**
   * Get specific scan result
   */
  async getScanResult(scanId: string): Promise<{ success: boolean; data?: ScanResult; error?: string }> {
    return this.request<ScanResult>(`/analysis/${scanId}`);
  }

  /**
   * Get analysis statistics
   */
  async getStats(): Promise<{ success: boolean; data?: ScanStats; error?: string }> {
    return this.request<ScanStats>('/analysis/stats');
  }

  // =====================================
  // REPOSITORY ENDPOINTS
  // =====================================

  /**
   * List all repositories
   */
  async listRepositories(filters?: {
    provider?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: { repositories: Repository[]; total: number }; error?: string }> {
    const params = new URLSearchParams();
    if (filters?.provider) params.append('provider', filters.provider);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    return this.request<{ repositories: Repository[]; total: number }>(`/repositories?${params}`);
  }

  /**
   * Get repository by ID
   */
  async getRepository(id: string): Promise<{ success: boolean; data?: { repository: Repository; recentScans: ScanResult[] }; error?: string }> {
    return this.request<{ repository: Repository; recentScans: ScanResult[] }>(`/repositories/${id}`);
  }

  /**
   * Add a new repository
   */
  async addRepository(repo: {
    name: string;
    fullName?: string;
    url: string;
    provider: 'github' | 'gitlab' | 'bitbucket';
    defaultBranch?: string;
    accessToken?: string;
    scanSettings?: Partial<Repository['scanSettings']>;
  }): Promise<{ success: boolean; data?: Repository; error?: string }> {
    return this.request<Repository>('/repositories', {
      method: 'POST',
      body: JSON.stringify(repo),
    });
  }

  /**
   * Update repository settings
   */
  async updateRepository(id: string, updates: Partial<Repository>): Promise<{ success: boolean; data?: Repository; error?: string }> {
    return this.request<Repository>(`/repositories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete repository
   */
  async deleteRepository(id: string, deleteScans = false): Promise<{ success: boolean; error?: string }> {
    return this.request(`/repositories/${id}?deleteScans=${deleteScans}`, {
      method: 'DELETE',
    });
  }

  /**
   * Sync repository from GitHub/GitLab
   */
  async syncRepository(id: string): Promise<{ success: boolean; data?: Repository; error?: string }> {
    return this.request<Repository>(`/repositories/${id}/sync`, {
      method: 'POST',
    });
  }

  /**
   * Get repository files
   */
  async getRepositoryFiles(id: string, path?: string, branch?: string): Promise<{ success: boolean; data?: { path: string; branch: string; files: any[] }; error?: string }> {
    const params = new URLSearchParams();
    if (path) params.append('path', path);
    if (branch) params.append('branch', branch);

    return this.request<{ path: string; branch: string; files: any[] }>(`/repositories/${id}/files?${params}`);
  }

  /**
   * Get file content from repository
   */
  async getFileContent(id: string, path: string, branch?: string): Promise<{ success: boolean; data?: { path: string; branch: string; content: string; language: string }; error?: string }> {
    const params = new URLSearchParams({ path });
    if (branch) params.append('branch', branch);

    return this.request<{ path: string; branch: string; content: string; language: string }>(`/repositories/${id}/content?${params}`);
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats(id: string): Promise<{ success: boolean; data?: { repository: Repository; stats: any; scoreTrend: any[] }; error?: string }> {
    return this.request<{ repository: Repository; stats: any; scoreTrend: any[] }>(`/repositories/${id}/stats`);
  }

  /**
   * Import repositories from GitHub
   */
  async importFromGitHub(accessToken: string, filter?: { type?: string }): Promise<{ success: boolean; data?: { repositories: any[]; total: number }; error?: string }> {
    return this.request<{ repositories: any[]; total: number }>('/repositories/import/github', {
      method: 'POST',
      body: JSON.stringify({ accessToken, filter }),
    });
  }
}

// Export singleton instance
export const securecodeAPI = new SecureCodeAPI();

// Export types for use in components
export default securecodeAPI;

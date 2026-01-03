/**
 * LogAnalyzer API Client
 * Tool 12 - AI-Powered Log Analysis & SIEM Integration
 */

const API_BASE_URL = import.meta.env.VITE_LOGANALYZER_API_URL || 'http://localhost:4012/api/v1/loganalyzer';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogSource = 'application' | 'system' | 'security' | 'network' | 'database' | 'web' | 'cloud' | 'custom';

export interface LogEntry {
  _id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata?: Record<string, any>;
  host?: string;
  service?: string;
  tags?: string[];
  parsed?: {
    ip?: string;
    user?: string;
    action?: string;
    resource?: string;
    statusCode?: number;
  };
  correlationId?: string;
}

export interface LogQuery {
  search?: string;
  level?: LogLevel | LogLevel[];
  source?: LogSource;
  startTime?: string;
  endTime?: string;
  host?: string;
  service?: string;
  limit?: number;
  page?: number;
}

export interface LogAnalysisResult {
  totalLogs: number;
  timeRange: { start: string; end: string };
  levelDistribution: Record<LogLevel, number>;
  topSources: { source: string; count: number }[];
  topHosts: { host: string; count: number }[];
  anomalies: LogAnomaly[];
  patterns: LogPattern[];
  recommendations: string[];
  aiPowered: boolean;
  simulated?: boolean;
}

export interface LogAnomaly {
  id: string;
  type: 'spike' | 'drop' | 'unusual-pattern' | 'security-event' | 'error-cluster';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedLogs: number;
  timeRange: { start: string; end: string };
  samples: string[];
}

export interface LogPattern {
  id: string;
  pattern: string;
  occurrences: number;
  examples: string[];
  category: string;
}

export interface LogDashboard {
  overview: {
    totalLogs: number;
    logsToday: number;
    errorRate: number;
    avgLogsPerMinute: number;
  };
  byLevel: Record<LogLevel, number>;
  bySource: Record<string, number>;
  recentErrors: LogEntry[];
  trends: {
    time: string;
    count: number;
    errors: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
}

class LogAnalyzerApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Request failed' };
      return data;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async getDashboard(): Promise<ApiResponse<LogDashboard>> {
    return this.request('/dashboard');
  }

  async queryLogs(query: LogQuery): Promise<ApiResponse<{ logs: LogEntry[]; total: number }>> {
    return this.request('/logs', { method: 'POST', body: JSON.stringify(query) });
  }

  async analyzeLogs(query: LogQuery): Promise<ApiResponse<LogAnalysisResult>> {
    return this.request('/analyze', { method: 'POST', body: JSON.stringify(query) });
  }

  async detectAnomalies(timeRange?: string): Promise<ApiResponse<{ anomalies: LogAnomaly[] }>> {
    return this.request(`/anomalies${timeRange ? `?timeRange=${timeRange}` : ''}`);
  }

  async extractPatterns(query: LogQuery): Promise<ApiResponse<{ patterns: LogPattern[] }>> {
    return this.request('/patterns', { method: 'POST', body: JSON.stringify(query) });
  }
}

export const logAnalyzerApi = new LogAnalyzerApi();

export const simulatedData = {
  dashboard: {
    overview: { totalLogs: 2500000, logsToday: 85000, errorRate: 2.3, avgLogsPerMinute: 59 },
    byLevel: { debug: 800000, info: 1200000, warn: 350000, error: 140000, critical: 10000 } as Record<LogLevel, number>,
    bySource: { application: 900000, system: 600000, security: 400000, network: 300000, web: 200000, database: 100000 },
    recentErrors: [
      { _id: '1', timestamp: new Date().toISOString(), level: 'error' as LogLevel, source: 'application' as LogSource, message: 'Database connection timeout', host: 'prod-db-01' },
      { _id: '2', timestamp: new Date(Date.now() - 60000).toISOString(), level: 'critical' as LogLevel, source: 'security' as LogSource, message: 'Multiple failed login attempts detected', host: 'auth-server' },
    ],
    trends: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, count: Math.floor(Math.random() * 5000) + 2000, errors: Math.floor(Math.random() * 100) })),
  } as LogDashboard,
  logs: Array.from({ length: 50 }, (_, i) => ({
    _id: `log-${i}`,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    level: ['debug', 'info', 'info', 'warn', 'error'][Math.floor(Math.random() * 5)] as LogLevel,
    source: ['application', 'system', 'security'][Math.floor(Math.random() * 3)] as LogSource,
    message: ['Request processed successfully', 'User authenticated', 'Cache miss', 'High memory usage', 'Connection reset'][Math.floor(Math.random() * 5)],
    host: `server-${Math.floor(Math.random() * 10) + 1}`,
  })) as LogEntry[],
  analysis: {
    totalLogs: 85000,
    timeRange: { start: new Date(Date.now() - 86400000).toISOString(), end: new Date().toISOString() },
    levelDistribution: { debug: 25000, info: 40000, warn: 12000, error: 7500, critical: 500 } as Record<LogLevel, number>,
    topSources: [{ source: 'application', count: 35000 }, { source: 'system', count: 25000 }, { source: 'security', count: 15000 }],
    topHosts: [{ host: 'prod-web-01', count: 15000 }, { host: 'prod-api-01', count: 12000 }],
    anomalies: [{ id: '1', type: 'spike' as const, severity: 'high' as const, description: 'Error rate spike detected', affectedLogs: 500, timeRange: { start: new Date(Date.now() - 3600000).toISOString(), end: new Date().toISOString() }, samples: ['Connection timeout', 'Database unavailable'] }],
    patterns: [{ id: '1', pattern: 'User * logged in from *', occurrences: 1500, examples: ['User admin logged in from 192.168.1.1'], category: 'authentication' }],
    recommendations: ['Investigate error spike in last hour', 'Review authentication patterns', 'Consider log rotation policy'],
    aiPowered: false,
    simulated: true,
  } as LogAnalysisResult,
};

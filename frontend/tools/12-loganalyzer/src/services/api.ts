/**
 * LogAnalyzer API Service
 * Comprehensive API wrapper for log analysis operations
 * Domain: loganalyzer.maula.ai
 * Ports: Frontend=3012, API=4012, ML=8012, Engine=6012
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4012/api/v1';
const ML_ENGINE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8012';

// Types
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  source: string;
  message: string;
  metadata: Record<string, unknown>;
  parsed: Record<string, unknown>;
  tags: string[];
}

export interface LogSource {
  id: string;
  name: string;
  type: 'syslog' | 'filebeat' | 'fluentd' | 'api' | 'agent' | 'cloud';
  status: 'healthy' | 'warning' | 'error' | 'inactive';
  config: SourceConfig;
  stats: SourceStats;
  lastSeen: string;
}

export interface SourceConfig {
  endpoint?: string;
  port?: number;
  protocol?: string;
  parser?: string;
  filters?: string[];
}

export interface SourceStats {
  logsIngested: number;
  rate: number;
  avgLatency: number;
  errors: number;
}

export interface LogParser {
  id: string;
  name: string;
  description: string;
  pattern: string;
  type: 'regex' | 'grok' | 'json' | 'csv' | 'custom';
  fields: ParserField[];
  testSamples: string[];
}

export interface ParserField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json';
  required: boolean;
  index: boolean;
}

export interface LogAlert {
  id: string;
  name: string;
  description: string;
  query: string;
  condition: AlertCondition;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'triggered';
  notifications: AlertNotification[];
  lastTriggered?: string;
  triggerCount: number;
}

export interface AlertCondition {
  type: 'threshold' | 'anomaly' | 'pattern' | 'absence';
  threshold?: number;
  window?: string;
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export interface AlertNotification {
  channel: 'email' | 'slack' | 'pagerduty' | 'webhook';
  target: string;
}

export interface SearchQuery {
  query: string;
  timeRange: { start: string; end: string };
  sources?: string[];
  levels?: string[];
  limit?: number;
  offset?: number;
  sort?: { field: string; order: 'asc' | 'desc' };
}

export interface SearchResult {
  logs: LogEntry[];
  total: number;
  took: number;
  aggregations?: Record<string, unknown>;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  sources: string[];
  retentionDays: number;
  archiveEnabled: boolean;
  archiveDestination?: string;
  compressionEnabled: boolean;
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    apiRequest<{
      logsIngested: { total: number; rate: number; change: number };
      sources: { active: number; total: number };
      alerts: { triggered: number; active: number };
      performance: { avgParseTime: number; avgQueryTime: number };
    }>('/loganalyzer/dashboard/stats'),

  getLogLevelDistribution: (timeRange: string = '24h') =>
    apiRequest<Record<string, number>>(`/loganalyzer/dashboard/levels?range=${timeRange}`),

  getIngestionRate: (interval: string = '1m') =>
    apiRequest<{ timestamp: string; rate: number }[]>(`/loganalyzer/dashboard/ingestion?interval=${interval}`),

  getRecentLogs: (limit: number = 10) =>
    apiRequest<LogEntry[]>(`/loganalyzer/dashboard/recent?limit=${limit}`),
};

// Search API
export const searchAPI = {
  query: (params: SearchQuery) =>
    apiRequest<SearchResult>('/loganalyzer/search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  aggregate: (params: {
    query: string;
    timeRange: { start: string; end: string };
    groupBy: string;
    metric: 'count' | 'avg' | 'sum' | 'min' | 'max';
    field?: string;
  }) =>
    apiRequest<{ buckets: { key: string; value: number }[] }>('/loganalyzer/search/aggregate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  suggest: (prefix: string, field: string) =>
    apiRequest<string[]>(`/loganalyzer/search/suggest?prefix=${prefix}&field=${field}`),

  saveQuery: (data: { name: string; query: string; description?: string }) =>
    apiRequest<{ id: string }>('/loganalyzer/search/saved', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSavedQueries: () =>
    apiRequest<{ id: string; name: string; query: string }[]>('/loganalyzer/search/saved'),
};

// Sources API
export const sourcesAPI = {
  list: () =>
    apiRequest<{ sources: LogSource[]; total: number }>('/loganalyzer/sources'),

  get: (id: string) =>
    apiRequest<LogSource>(`/loganalyzer/sources/${id}`),

  create: (data: Omit<LogSource, 'id' | 'status' | 'stats' | 'lastSeen'>) =>
    apiRequest<LogSource>('/loganalyzer/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LogSource>) =>
    apiRequest<LogSource>(`/loganalyzer/sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/loganalyzer/sources/${id}`, { method: 'DELETE' }),

  test: (id: string) =>
    apiRequest<{ success: boolean; latency: number; message?: string }>(
      `/loganalyzer/sources/${id}/test`,
      { method: 'POST' }
    ),

  getStats: (id: string, timeRange: string = '24h') =>
    apiRequest<SourceStats>(`/loganalyzer/sources/${id}/stats?range=${timeRange}`),
};

// Parsers API
export const parsersAPI = {
  list: () =>
    apiRequest<{ parsers: LogParser[]; total: number }>('/loganalyzer/parsers'),

  get: (id: string) =>
    apiRequest<LogParser>(`/loganalyzer/parsers/${id}`),

  create: (data: Omit<LogParser, 'id'>) =>
    apiRequest<LogParser>('/loganalyzer/parsers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LogParser>) =>
    apiRequest<LogParser>(`/loganalyzer/parsers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/loganalyzer/parsers/${id}`, { method: 'DELETE' }),

  test: (parserId: string, sample: string) =>
    apiRequest<{ success: boolean; parsed: Record<string, unknown>; errors?: string[] }>(
      `/loganalyzer/parsers/${parserId}/test`,
      {
        method: 'POST',
        body: JSON.stringify({ sample }),
      }
    ),
};

// Alerts API
export const alertsAPI = {
  list: (params?: { status?: string; severity?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ alerts: LogAlert[]; total: number }>(
      `/loganalyzer/alerts${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) =>
    apiRequest<LogAlert>(`/loganalyzer/alerts/${id}`),

  create: (data: Omit<LogAlert, 'id' | 'status' | 'lastTriggered' | 'triggerCount'>) =>
    apiRequest<LogAlert>('/loganalyzer/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LogAlert>) =>
    apiRequest<LogAlert>(`/loganalyzer/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/loganalyzer/alerts/${id}`, { method: 'DELETE' }),

  pause: (id: string) =>
    apiRequest<LogAlert>(`/loganalyzer/alerts/${id}/pause`, { method: 'POST' }),

  resume: (id: string) =>
    apiRequest<LogAlert>(`/loganalyzer/alerts/${id}/resume`, { method: 'POST' }),

  getHistory: (id: string, limit: number = 50) =>
    apiRequest<{ timestamp: string; matched: number }[]>(
      `/loganalyzer/alerts/${id}/history?limit=${limit}`
    ),
};

// Retention API
export const retentionAPI = {
  list: () =>
    apiRequest<{ policies: RetentionPolicy[]; total: number }>('/loganalyzer/retention'),

  get: (id: string) =>
    apiRequest<RetentionPolicy>(`/loganalyzer/retention/${id}`),

  create: (data: Omit<RetentionPolicy, 'id'>) =>
    apiRequest<RetentionPolicy>('/loganalyzer/retention', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<RetentionPolicy>) =>
    apiRequest<RetentionPolicy>(`/loganalyzer/retention/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<void>(`/loganalyzer/retention/${id}`, { method: 'DELETE' }),

  getStorageStats: () =>
    apiRequest<{
      totalSize: number;
      usedSize: number;
      bySource: Record<string, number>;
      byAge: Record<string, number>;
    }>('/loganalyzer/retention/storage'),
};

// Analytics API
export const analyticsAPI = {
  getTimeSeries: (params: {
    query: string;
    timeRange: { start: string; end: string };
    interval: string;
  }) =>
    apiRequest<{ timestamp: string; count: number }[]>('/loganalyzer/analytics/timeseries', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getTopValues: (field: string, timeRange: string = '24h', limit: number = 10) =>
    apiRequest<{ value: string; count: number }[]>(
      `/loganalyzer/analytics/top?field=${field}&range=${timeRange}&limit=${limit}`
    ),

  getErrorRate: (source?: string, timeRange: string = '24h') =>
    apiRequest<{ errorRate: number; trend: number; byHour: { hour: string; rate: number }[] }>(
      `/loganalyzer/analytics/errors?${source ? `source=${source}&` : ''}range=${timeRange}`
    ),
};

// ML Engine API
export const mlAPI = {
  detectAnomalies: (params: {
    query: string;
    timeRange: { start: string; end: string };
    sensitivity?: number;
  }) =>
    apiRequest<{
      anomalies: { timestamp: string; score: number; logs: LogEntry[] }[];
      baseline: number;
    }>('/loganalyzer/ml/anomalies', {
      method: 'POST',
      body: JSON.stringify(params),
    }, ML_ENGINE_URL),

  classifyLog: (logEntry: Partial<LogEntry>) =>
    apiRequest<{
      predictedLevel: string;
      category: string;
      confidence: number;
    }>('/loganalyzer/ml/classify', {
      method: 'POST',
      body: JSON.stringify(logEntry),
    }, ML_ENGINE_URL),

  extractPatterns: (params: {
    query: string;
    timeRange: { start: string; end: string };
    minSupport?: number;
  }) =>
    apiRequest<{
      patterns: { pattern: string; count: number; examples: string[] }[];
    }>('/loganalyzer/ml/patterns', {
      method: 'POST',
      body: JSON.stringify(params),
    }, ML_ENGINE_URL),

  suggestParser: (samples: string[]) =>
    apiRequest<{
      suggestedPattern: string;
      fields: ParserField[];
      confidence: number;
    }>('/loganalyzer/ml/suggest-parser', {
      method: 'POST',
      body: JSON.stringify({ samples }),
    }, ML_ENGINE_URL),

  predictVolume: (source: string, horizon: string = '24h') =>
    apiRequest<{
      predictions: { timestamp: string; predicted: number; confidence: number }[];
    }>(`/loganalyzer/ml/predict-volume?source=${source}&horizon=${horizon}`, {}, ML_ENGINE_URL),
};

// Live Stream API (WebSocket)
export const liveStreamAPI = {
  connect: (query?: string, sources?: string[]) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (sources) params.append('sources', sources.join(','));
    
    const wsUrl = API_BASE_URL.replace('http', 'ws').replace('/api/v1', '/ws');
    return new WebSocket(`${wsUrl}/loganalyzer/stream?${params.toString()}`);
  },
};

// Export default API object
export default {
  dashboard: dashboardAPI,
  search: searchAPI,
  sources: sourcesAPI,
  parsers: parsersAPI,
  alerts: alertsAPI,
  retention: retentionAPI,
  analytics: analyticsAPI,
  ml: mlAPI,
  liveStream: liveStreamAPI,
};

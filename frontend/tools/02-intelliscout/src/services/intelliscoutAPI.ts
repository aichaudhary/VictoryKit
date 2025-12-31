import {
  ThreatIntel,
  ThreatAnalysis,
  ThreatReport,
  IntelStatistics,
  SearchFilters,
  PaginatedResponse,
} from "../types";
import { API_ENDPOINTS } from "../constants";

const API_BASE = API_ENDPOINTS.INTELLISCOUT_API;

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API Error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Threat Intelligence API
// ============================================================================

export const threatIntelAPI = {
  // Create new threat intelligence
  create: async (
    data: Partial<ThreatIntel>
  ): Promise<{ success: boolean; data: ThreatIntel }> => {
    return apiCall("/api/v1/threat-intel", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all threat intelligence (paginated)
  getAll: async (
    filters?: SearchFilters
  ): Promise<PaginatedResponse<ThreatIntel>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.severities?.length)
      params.append("severities", filters.severities.join(","));
    if (filters?.threatTypes?.length)
      params.append("threatTypes", filters.threatTypes.join(","));
    if (filters?.sourceTypes?.length)
      params.append("sourceTypes", filters.sourceTypes.join(","));
    if (filters?.status?.length)
      params.append("status", filters.status.join(","));
    if (filters?.dateRange?.start)
      params.append("startDate", filters.dateRange.start);
    if (filters?.dateRange?.end)
      params.append("endDate", filters.dateRange.end);

    return apiCall(`/api/v1/threat-intel?${params.toString()}`);
  },

  // Get threat intelligence by ID
  getById: async (
    id: string
  ): Promise<{ success: boolean; data: ThreatIntel }> => {
    return apiCall(`/api/v1/threat-intel/${id}`);
  },

  // Update threat intelligence
  update: async (
    id: string,
    data: Partial<ThreatIntel>
  ): Promise<{ success: boolean; data: ThreatIntel }> => {
    return apiCall(`/api/v1/threat-intel/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete threat intelligence
  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiCall(`/api/v1/threat-intel/${id}`, {
      method: "DELETE",
    });
  },

  // Correlate indicators
  correlate: async (
    indicators: Partial<ThreatIntel["indicators"]>
  ): Promise<{
    success: boolean;
    correlations: any[];
    relatedThreats: ThreatIntel[];
  }> => {
    return apiCall("/api/v1/threat-intel/correlate", {
      method: "POST",
      body: JSON.stringify({ indicators }),
    });
  },

  // Get statistics
  getStatistics: async (): Promise<{
    success: boolean;
    data: IntelStatistics;
  }> => {
    return apiCall("/api/v1/statistics");
  },
};

// ============================================================================
// Analysis API
// ============================================================================

export const analysisAPI = {
  // Create new analysis
  create: async (
    data: Partial<ThreatAnalysis>
  ): Promise<{ success: boolean; data: ThreatAnalysis }> => {
    return apiCall("/api/v1/analyses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all analyses (paginated)
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<ThreatAnalysis>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.type) params.append("type", filters.type);

    return apiCall(`/api/v1/analyses?${params.toString()}`);
  },

  // Get analysis by ID
  getById: async (
    id: string
  ): Promise<{ success: boolean; data: ThreatAnalysis }> => {
    return apiCall(`/api/v1/analyses/${id}`);
  },

  // Run threat landscape analysis
  runLandscapeAnalysis: async (timeRange: {
    start: string;
    end: string;
  }): Promise<{ success: boolean; data: ThreatAnalysis }> => {
    return apiCall("/api/v1/analyses/landscape", {
      method: "POST",
      body: JSON.stringify({ timeRange }),
    });
  },

  // Run IOC correlation analysis
  runCorrelationAnalysis: async (
    indicators: string[]
  ): Promise<{ success: boolean; data: ThreatAnalysis }> => {
    return apiCall("/api/v1/analyses/correlation", {
      method: "POST",
      body: JSON.stringify({ indicators }),
    });
  },
};

// ============================================================================
// Report API
// ============================================================================

export const reportAPI = {
  // Create new report
  create: async (
    data: Partial<ThreatReport>
  ): Promise<{ success: boolean; data: ThreatReport }> => {
    return apiCall("/api/v1/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all reports
  getAll: async (filters?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<ThreatReport>> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.type) params.append("type", filters.type);

    return apiCall(`/api/v1/reports?${params.toString()}`);
  },

  // Get report by ID
  getById: async (
    id: string
  ): Promise<{ success: boolean; data: ThreatReport }> => {
    return apiCall(`/api/v1/reports/${id}`);
  },

  // Generate executive summary
  generateExecutiveSummary: async (
    threatIds: string[]
  ): Promise<{ success: boolean; data: ThreatReport }> => {
    return apiCall("/api/v1/reports/executive-summary", {
      method: "POST",
      body: JSON.stringify({ threatIds }),
    });
  },

  // Generate IOC report
  generateIOCReport: async (
    threatIds: string[]
  ): Promise<{ success: boolean; data: ThreatReport }> => {
    return apiCall("/api/v1/reports/ioc-report", {
      method: "POST",
      body: JSON.stringify({ threatIds }),
    });
  },

  // Export report
  exportReport: async (
    id: string,
    format: "pdf" | "json" | "csv"
  ): Promise<Blob> => {
    const response = await fetch(
      `${API_BASE}/api/v1/reports/${id}/export?format=${format}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export report");
    }

    return response.blob();
  },
};

// ============================================================================
// OSINT Search API
// ============================================================================

export const osintAPI = {
  // Search IP address
  searchIP: async (ip: string): Promise<{ success: boolean; data: any }> => {
    return apiCall("/api/v1/osint/ip", {
      method: "POST",
      body: JSON.stringify({ ip }),
    });
  },

  // Search domain
  searchDomain: async (
    domain: string
  ): Promise<{ success: boolean; data: any }> => {
    return apiCall("/api/v1/osint/domain", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  },

  // Search hash
  searchHash: async (
    hash: string
  ): Promise<{ success: boolean; data: any }> => {
    return apiCall("/api/v1/osint/hash", {
      method: "POST",
      body: JSON.stringify({ hash }),
    });
  },

  // Search email
  searchEmail: async (
    email: string
  ): Promise<{ success: boolean; data: any }> => {
    return apiCall("/api/v1/osint/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Bulk IOC search
  bulkSearch: async (indicators: {
    ips?: string[];
    domains?: string[];
    hashes?: string[];
    emails?: string[];
  }): Promise<{ success: boolean; data: any }> => {
    return apiCall("/api/v1/osint/bulk", {
      method: "POST",
      body: JSON.stringify(indicators),
    });
  },
};

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async (): Promise<{
    success: boolean;
    data: {
      statistics: IntelStatistics;
      recentThreats: ThreatIntel[];
      criticalAlerts: ThreatIntel[];
      trendData: any[];
    };
  }> => {
    return apiCall("/api/v1/dashboard/overview");
  },

  // Get threat timeline
  getTimeline: async (
    days: number = 30
  ): Promise<{ success: boolean; data: any[] }> => {
    return apiCall(`/api/v1/dashboard/timeline?days=${days}`);
  },

  // Get threat heatmap
  getHeatmap: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiCall("/api/v1/dashboard/heatmap");
  },
};

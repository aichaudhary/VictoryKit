/**
 * IntelliScout - Threat Intelligence Feed Services
 * Real integrations with global threat intelligence sources
 */

import { API_ENDPOINTS } from "../constants";

// ============================================================================
// Types
// ============================================================================

export interface IOCLookupResult {
  indicator: string;
  indicatorType: "ip" | "domain" | "hash" | "url" | "email";
  source: string;
  found: boolean;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAN" | "UNKNOWN";
  confidence: number;
  data: Record<string, any>;
  timestamp: string;
}

export interface ThreatFeedResponse {
  success: boolean;
  indicator: string;
  totalSources: number;
  sourcesChecked: string[];
  results: IOCLookupResult[];
  aggregatedThreatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAN";
  aggregatedConfidence: number;
  geoData?: GeoData;
  whoisData?: WhoisData;
  relatedIOCs?: string[];
  tags: string[];
  mitreTechniques: string[];
  recommendations: string[];
  timestamp: string;
}

export interface GeoData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  org?: string;
  isp?: string;
}

export interface WhoisData {
  registrar?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  registrant?: string;
  nameServers?: string[];
  status?: string[];
}

export interface BulkLookupResult {
  total: number;
  processed: number;
  results: ThreatFeedResponse[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    clean: number;
  };
}

// ============================================================================
// Main Threat Feed Service
// ============================================================================

class ThreatFeedService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_ENDPOINTS.INTELLISCOUT_API;
  }

  /**
   * Lookup a single indicator across all threat feeds
   */
  async lookupIndicator(
    indicator: string,
    options?: {
      type?: "ip" | "domain" | "hash" | "url" | "email" | "auto";
      sources?: string[];
      deepAnalysis?: boolean;
      includeGeo?: boolean;
      includeWhois?: boolean;
    }
  ): Promise<ThreatFeedResponse> {
    const response = await fetch(`${this.baseUrl}/v1/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indicator,
        type: options?.type || "auto",
        sources: options?.sources || ["all"],
        deepAnalysis: options?.deepAnalysis ?? true,
        includeGeo: options?.includeGeo ?? true,
        includeWhois: options?.includeWhois ?? true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Lookup failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Bulk lookup multiple indicators
   */
  async bulkLookup(
    indicators: string[],
    options?: { type?: string; sources?: string[] }
  ): Promise<BulkLookupResult> {
    const response = await fetch(`${this.baseUrl}/v1/lookup/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indicators,
        type: options?.type || "auto",
        sources: options?.sources || ["all"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Bulk lookup failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for related indicators
   */
  async searchRelated(
    indicator: string,
    options?: { depth?: number; limit?: number }
  ): Promise<{ indicator: string; related: string[]; connections: any[] }> {
    const response = await fetch(`${this.baseUrl}/v1/lookup/related`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        indicator,
        depth: options?.depth || 2,
        limit: options?.limit || 50,
      }),
    });

    if (!response.ok) {
      throw new Error(`Related search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get threat landscape overview
   */
  async getThreatLandscape(options?: {
    timeRange?: "24h" | "7d" | "30d" | "90d";
    threatTypes?: string[];
    regions?: string[];
  }): Promise<{
    summary: Record<string, number>;
    topThreats: any[];
    trends: any[];
    activeAPTs: any[];
    emergingThreats: any[];
  }> {
    const params = new URLSearchParams();
    if (options?.timeRange) params.append("timeRange", options.timeRange);
    if (options?.threatTypes) params.append("threatTypes", options.threatTypes.join(","));
    if (options?.regions) params.append("regions", options.regions.join(","));

    const response = await fetch(`${this.baseUrl}/v1/landscape?${params}`);

    if (!response.ok) {
      throw new Error(`Landscape fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get threat actor profile
   */
  async getThreatActor(
    actorId: string
  ): Promise<{
    id: string;
    names: string[];
    aliases: string[];
    description: string;
    motivation: string;
    sophistication: string;
    targetSectors: string[];
    targetCountries: string[];
    ttps: any[];
    knownIOCs: string[];
    campaigns: any[];
    timeline: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/v1/actors/${actorId}`);

    if (!response.ok) {
      throw new Error(`Actor fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search threat actors
   */
  async searchActors(query: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/v1/actors/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Actor search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get MITRE ATT&CK techniques for an indicator
   */
  async getMitreTechniques(
    indicator: string
  ): Promise<{
    indicator: string;
    tactics: string[];
    techniques: { id: string; name: string; description: string }[];
    procedures: any[];
  }> {
    const response = await fetch(`${this.baseUrl}/v1/mitre/map`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicator }),
    });

    if (!response.ok) {
      throw new Error(`MITRE mapping failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate STIX bundle for indicators
   */
  async exportSTIX(indicators: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/v1/export/stix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indicators }),
    });

    if (!response.ok) {
      throw new Error(`STIX export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Generate threat report
   */
  async generateReport(options: {
    type: "executive" | "technical" | "ioc" | "campaign";
    indicators?: string[];
    analysisId?: string;
    format?: "pdf" | "html" | "json";
  }): Promise<Blob | object> {
    const response = await fetch(`${this.baseUrl}/v1/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`Report generation failed: ${response.statusText}`);
    }

    if (options.format === "json") {
      return response.json();
    }
    return response.blob();
  }

  /**
   * Subscribe to real-time threat alerts
   */
  subscribeToAlerts(
    filters: {
      threatTypes?: string[];
      severities?: string[];
      indicators?: string[];
    },
    onAlert: (alert: any) => void
  ): () => void {
    const ws = new WebSocket(API_ENDPOINTS.WS_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", filters }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "alert") {
        onAlert(data.payload);
      }
    };

    return () => ws.close();
  }
}

// Export singleton instance
export const threatFeedService = new ThreatFeedService();

// ============================================================================
// Individual Feed Helpers (for direct access)
// ============================================================================

export const threatFeeds = {
  /**
   * Check IP reputation across feeds
   */
  checkIP: async (ip: string) => {
    return threatFeedService.lookupIndicator(ip, { type: "ip" });
  },

  /**
   * Check domain reputation
   */
  checkDomain: async (domain: string) => {
    return threatFeedService.lookupIndicator(domain, {
      type: "domain",
      includeWhois: true,
    });
  },

  /**
   * Check file hash (MD5, SHA1, SHA256)
   */
  checkHash: async (hash: string) => {
    return threatFeedService.lookupIndicator(hash, { type: "hash" });
  },

  /**
   * Check URL for malicious content
   */
  checkURL: async (url: string) => {
    return threatFeedService.lookupIndicator(url, { type: "url" });
  },

  /**
   * Check email for phishing/spam
   */
  checkEmail: async (email: string) => {
    return threatFeedService.lookupIndicator(email, { type: "email" });
  },

  /**
   * Auto-detect indicator type and check
   */
  autoCheck: async (indicator: string) => {
    return threatFeedService.lookupIndicator(indicator, { type: "auto" });
  },
};

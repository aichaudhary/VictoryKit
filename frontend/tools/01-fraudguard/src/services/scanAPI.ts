/**
 * FraudGuard Public Scanner API Client
 * Connects to backend /api/scan/* endpoints
 */

// In production, use relative /api path which nginx proxies to backend
// In development, VITE_API_URL can be set to full backend URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Types for scan results
export interface URLScanResult {
  success: boolean;
  url: string;
  final_url?: string;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  is_safe: boolean;
  threats: {
    type: string;
    severity: string;
    source: string;
    description?: string;
  }[];
  categories: string[];
  analysis: {
    virustotal?: {
      malicious: number;
      suspicious: number;
      harmless: number;
      undetected: number;
      reputation: number;
    };
    safe_browsing?: {
      is_safe: boolean;
      threats: string[];
    };
    urlscan?: {
      verdict: string;
      score: number;
      screenshot_url?: string;
      certificates?: any[];
    };
  };
  scan_id: string;
  scanned_at: string;
}

export interface EmailCheckResult {
  success: boolean;
  email: string;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  breaches: {
    name: string;
    domain: string;
    breach_date: string;
    added_date: string;
    pwn_count: number;
    data_classes: string[];
    is_verified: boolean;
    is_sensitive: boolean;
    description?: string;
  }[];
  total_breaches: number;
  earliest_breach?: string;
  latest_breach?: string;
  exposed_data_types: string[];
  email_validation?: {
    valid: boolean;
    disposable: boolean;
    honeypot: boolean;
    deliverability: string;
    fraud_score: number;
  };
  recommendations: string[];
  scan_id: string;
  checked_at: string;
}

export interface PhoneValidationResult {
  success: boolean;
  phone: string;
  formatted: {
    local: string;
    international: string;
    e164: string;
  };
  valid: boolean;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  carrier?: {
    name: string;
    type: string;
    mcc?: string;
    mnc?: string;
  };
  location?: {
    country: string;
    country_code: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  line_type?: string;
  fraud_indicators?: {
    is_voip: boolean;
    is_prepaid: boolean;
    is_risky: boolean;
    spam_score: number;
    leak_count: number;
  };
  recommendations: string[];
  scan_id: string;
  validated_at: string;
}

export interface IPCheckResult {
  success: boolean;
  ip: string;
  risk_score: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  is_threat: boolean;
  geolocation?: {
    country: string;
    country_code: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    asn?: string;
  };
  threat_intel?: {
    abuse_confidence: number;
    total_reports: number;
    is_whitelisted: boolean;
    is_tor: boolean;
    is_proxy: boolean;
    is_vpn: boolean;
    is_datacenter: boolean;
    is_bot: boolean;
    categories: string[];
    recent_reports?: {
      date: string;
      category: string;
      comment?: string;
    }[];
  };
  recommendations: string[];
  scan_id: string;
  checked_at: string;
}

export interface PasswordCheckResult {
  success: boolean;
  is_compromised: boolean;
  exposure_count: number;
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  strength?: {
    score: number;
    feedback: string[];
  };
  recommendations: string[];
  checked_at: string;
}

export interface ScanHistoryItem {
  scan_id: string;
  scan_type: 'url' | 'email' | 'phone' | 'ip' | 'password';
  input: string;
  risk_score: number;
  risk_level: string;
  scanned_at: string;
}

export interface ScanStats {
  total_scans: number;
  scans_by_type: Record<string, number>;
  high_risk_count: number;
  average_risk_score: number;
  recent_activity: {
    date: string;
    count: number;
  }[];
}

// API Client
class ScanAPI {
  private baseUrl: string;

  constructor() {
    // API_BASE already includes /api, so we just add /scan
    this.baseUrl = `${API_BASE}/scan`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // URL Scanning
  async scanURL(url: string, options?: { deep_scan?: boolean }): Promise<URLScanResult> {
    return this.request<URLScanResult>('/url', {
      method: 'POST',
      body: JSON.stringify({ url, ...options }),
    });
  }

  // Email Checking
  async checkEmail(email: string): Promise<EmailCheckResult> {
    return this.request<EmailCheckResult>('/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Phone Validation
  async validatePhone(phone: string, country_code?: string): Promise<PhoneValidationResult> {
    return this.request<PhoneValidationResult>('/phone', {
      method: 'POST',
      body: JSON.stringify({ phone, country_code }),
    });
  }

  // IP Check
  async checkIP(ip: string): Promise<IPCheckResult> {
    return this.request<IPCheckResult>('/ip', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
  }

  // Password Check
  async checkPassword(password: string): Promise<PasswordCheckResult> {
    return this.request<PasswordCheckResult>('/password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Scan History
  async getHistory(options?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ history: ScanHistoryItem[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const query = params.toString();
    return this.request<{ history: ScanHistoryItem[]; total: number }>(
      `/history${query ? `?${query}` : ''}`
    );
  }

  // Scan Stats
  async getStats(): Promise<ScanStats> {
    return this.request<ScanStats>('/stats/summary');
  }
}

export const scanAPI = new ScanAPI();
export default scanAPI;

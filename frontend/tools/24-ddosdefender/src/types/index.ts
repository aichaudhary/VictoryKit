// DDoSDefender TypeScript Interfaces

export interface Attack {
  _id: string;
  attackId: string;
  type: 'volumetric' | 'protocol' | 'application' | 'amplification';
  subType: string;
  target: {
    ip: string;
    port: number;
    domain?: string;
  };
  source: {
    ips: string[];
    countries: string[];
    asns: number[];
  };
  metrics: {
    bandwidth: number; // Mbps
    packets: number; // packets per second
    requests: number; // requests per second
    duration: number; // seconds
  };
  status: 'active' | 'mitigated' | 'blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  mitigatedAt?: Date;
  mitigation: {
    method: string;
    provider: string;
    effectiveness: number;
  };
  geoData: {
    country: string;
    region: string;
    city: string;
    coordinates: [number, number];
  };
}

export interface TrafficData {
  _id: string;
  timestamp: Date;
  bandwidth: number;
  packets: number;
  requests: number;
  connections: number;
  source: {
    ip: string;
    country: string;
    asn: number;
  };
  protocol: string;
  port: number;
  flags: {
    isAttack: boolean;
    attackType?: string;
    severity?: string;
  };
}

export interface ProtectionRule {
  _id: string;
  name: string;
  type: 'rate-limit' | 'geo-block' | 'ip-block' | 'protocol-filter' | 'behavioral';
  conditions: {
    threshold: number;
    window: number; // seconds
    criteria: string[];
  };
  actions: {
    block: boolean;
    rateLimit: number;
    redirect?: string;
    log: boolean;
  };
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  totalAttacks: number;
  activeAttacks: number;
  mitigatedAttacks: number;
  bandwidthUsage: number;
  peakTraffic: number;
  topAttackTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topSourceCountries: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  timeline: Array<{
    timestamp: Date;
    attacks: number;
    bandwidth: number;
  }>;
}

export interface Incident {
  _id: string;
  incidentId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigated' | 'closed';
  attacks: string[]; // Attack IDs
  startedAt: Date;
  resolvedAt?: Date;
  impact: {
    duration: number;
    bandwidthAffected: number;
    servicesAffected: string[];
  };
  response: {
    actions: string[];
    effectiveness: number;
    notes: string;
  };
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemStatus {
  protection: 'active' | 'inactive' | 'degraded';
  traffic: 'normal' | 'high' | 'critical';
  alerts: number;
  uptime: number;
  lastAttack: Date;
  providers: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded';
    lastCheck: Date;
  }>;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: 'traffic_update' | 'attack_detected' | 'attack_mitigated' | 'system_status' | 'alert';
  data: any;
  timestamp: Date;
}
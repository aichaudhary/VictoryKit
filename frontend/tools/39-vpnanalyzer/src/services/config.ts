/**
 * VPNAnalyzer Configuration
 * Centralized configuration for the VPN security management tool
 */

import vpnanalyzerConfig from '../../vpnanalyzer-config.json';

export interface VPNAnalyzerConfig {
  toolInfo: {
    id: number;
    name: string;
    displayName: string;
    description: string;
    category: string;
    version: string;
    icon: string;
    color: string;
    theme: string;
  };
  deployment: {
    subdomain: string;
    domain: string;
    fullUrl: string;
    aiAssistantUrl: string;
  };
  ports: {
    frontend: number;
    backend: number;
    aiWebSocket: number;
    vpnGateway: number;
    wireguard: number;
  };
  database: {
    name: string;
    collections: string[];
  };
  features: {
    vpnManagement: {
      enabled: boolean;
      protocols: string[];
      splitTunneling: boolean;
      killSwitch: boolean;
      dnsLeakProtection: boolean;
      multiHop: boolean;
    };
    zeroTrust: {
      enabled: boolean;
      devicePosture: boolean;
      continuousVerification: boolean;
      leastPrivilege: boolean;
      microsegmentation: boolean;
    };
    trafficAnalysis: {
      enabled: boolean;
      deepPacketInspection: boolean;
      anomalyDetection: boolean;
      bandwidthMonitoring: boolean;
      applicationControl: boolean;
    };
    endpointSecurity: {
      enabled: boolean;
      deviceCompliance: boolean;
      certificateManagement: boolean;
      mfa: boolean;
      biometricAuth: boolean;
    };
  };
  aiAssistant: {
    enabled: boolean;
    model: string;
    wsPort: number;
    functions: AIFunction[];
  };
  integrations: {
    identity: string[];
    siem: string[];
    endpoint: string[];
    cloud: string[];
  };
  security: {
    encryption: {
      atRest: boolean;
      inTransit: boolean;
      algorithm: string;
    };
    authentication: {
      mfa: boolean;
      sso: boolean;
      certificateBased: boolean;
      biometric: boolean;
    };
    audit: {
      enabled: boolean;
      immutableLogs: boolean;
      retentionDays: number;
    };
  };
  performance: {
    maxConnections: number;
    throughput: string;
    latencyTarget: string;
    autoscaling: boolean;
  };
  compliance: {
    frameworks: string[];
    certifications: string[];
    dataResidency: string;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
  category: string;
}

// Export the typed configuration
export const config: VPNAnalyzerConfig = vpnanalyzerConfig as VPNAnalyzerConfig;

// Helper functions for configuration access
export const getToolInfo = () => config.toolInfo;
export const getDeployment = () => config.deployment;
export const getPorts = () => config.ports;
export const getDatabase = () => config.database;
export const getFeatures = () => config.features;
export const getAIAssistant = () => config.aiAssistant;
export const getIntegrations = () => config.integrations;
export const getSecurity = () => config.security;
export const getCompliance = () => config.compliance;

// Get AI functions by category
export const getAIFunctionsByCategory = (category: string): AIFunction[] => {
  return config.aiAssistant.functions.filter(fn => fn.category === category);
};

// Get all AI function categories
export const getAIFunctionCategories = (): string[] => {
  return [...new Set(config.aiAssistant.functions.map(fn => fn.category))];
};

// Get WebSocket URL for AI assistant
export const getAIWebSocketUrl = (): string => {
  const { deployment, ports } = config;
  const protocol = deployment.fullUrl.startsWith('https') ? 'wss' : 'ws';
  const host = `${deployment.subdomain}.${deployment.domain}`;
  return `${protocol}://${host}:${ports.aiWebSocket}`;
};

// Get API base URL
export const getApiBaseUrl = (): string => {
  const { deployment, ports } = config;
  return `${deployment.fullUrl.replace(':3039', '')}:${ports.backend}/api`;
};

// Check if a feature is enabled
export const isFeatureEnabled = (featureGroup: keyof VPNAnalyzerConfig['features'], feature?: string): boolean => {
  const group = config.features[featureGroup];
  if (!group) return false;
  if (!feature) return group.enabled;
  return group[feature as keyof typeof group] as boolean || false;
};

// Get supported VPN protocols
export const getSupportedProtocols = (): string[] => {
  return config.features.vpnManagement.protocols;
};

// Get compliance frameworks
export const getComplianceFrameworks = (): string[] => {
  return config.compliance.frameworks;
};

export default config;

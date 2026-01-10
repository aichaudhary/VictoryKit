/**
 * WirelessHunter Configuration
 * Centralized configuration for wireless network security monitoring
 */

import wirelesshunterConfig from '../../wirelesshunter-config.json';

export interface WirelessHunterConfig {
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
    snmp: number;
    syslog: number;
  };
  database: {
    name: string;
    collections: string[];
  };
  features: {
    apManagement: {
      enabled: boolean;
      monitoring: boolean;
      configuration: boolean;
      firmwareManagement: boolean;
      heatMapping: boolean;
    };
    rogueDetection: {
      enabled: boolean;
      autoClassification: boolean;
      containment: boolean;
      alerting: boolean;
      geoLocation: boolean;
    };
    spectrumAnalysis: {
      enabled: boolean;
      rfInterference: boolean;
      channelOptimization: boolean;
      noiseFloor: boolean;
      dutyCycle: boolean;
    };
    wips: {
      enabled: boolean;
      deauthProtection: boolean;
      evilTwinDetection: boolean;
      karmaAttackPrevention: boolean;
      autoContainment: boolean;
    };
    vulnerability: {
      enabled: boolean;
      wpaVulnerabilities: boolean;
      krackDetection: boolean;
      fragAttack: boolean;
      dragonblood: boolean;
    };
  };
  aiAssistant: {
    enabled: boolean;
    model: string;
    wsPort: number;
    functions: AIFunction[];
  };
  integrations: {
    apVendors: string[];
    siem: string[];
    nac: string[];
    management: string[];
  };
  security: {
    encryption: {
      atRest: boolean;
      inTransit: boolean;
      algorithm: string;
    };
    wifiStandards: string[];
    authentication: {
      eapTypes: string[];
      radiusIntegration: boolean;
      certificateBased: boolean;
    };
  };
  performance: {
    maxManagedAPs: number;
    maxClientsMonitored: number;
    scanFrequency: string;
    alertLatency: string;
  };
  compliance: {
    frameworks: string[];
    wirelessPolicies: string[];
    auditRetention: number;
  };
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
  category: string;
}

// Export typed configuration
export const config: WirelessHunterConfig = wirelesshunterConfig as WirelessHunterConfig;

// Helper functions
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
  return `${deployment.fullUrl.replace(':3040', '')}:${ports.backend}/api`;
};

// Check if a feature is enabled
export const isFeatureEnabled = (featureGroup: keyof WirelessHunterConfig['features'], feature?: string): boolean => {
  const group = config.features[featureGroup];
  if (!group) return false;
  if (!feature) return group.enabled;
  return group[feature as keyof typeof group] as boolean || false;
};

// Get supported WiFi standards
export const getSupportedWiFiStandards = (): string[] => {
  return config.security.wifiStandards;
};

// Get supported AP vendors
export const getSupportedAPVendors = (): string[] => {
  return config.integrations.apVendors;
};

export default config;

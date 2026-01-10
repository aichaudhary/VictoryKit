/**
 * DDOSShield Configuration
 * Tool #24 - AI-Powered DDoS Protection & Mitigation
 */

import configData from '../../ddosdefender-config.json';

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, string>;
}

export interface ToolConfig {
  toolName: string;
  toolId: string;
  tagline: string;
  subdomain: string;
  fullDomain: string;
  aiAssistant: string;
  description: string;
  ports: {
    frontend: number;
    backend: number;
    aiWebSocket: number;
    ml: number;
  };
  databaseName: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  features: string[];
  systemPrompt: string;
  aiFunctions: AIFunction[];
  navigationItems: Array<{ label: string; path: string; icon: string }>;
}

export const config: ToolConfig = configData as ToolConfig;

// Utility functions
export const getApiUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  return isDev 
    ? `http://localhost:${config.ports.backend}`
    : `https://${config.fullDomain}/api`;
};

export const getWsUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  const protocol = isDev ? 'ws' : 'wss';
  const host = isDev ? `localhost:${config.ports.aiWebSocket}` : config.fullDomain;
  return `${protocol}://${host}/maula/ai`;
};

export const getMlUrl = (): string => {
  const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development';
  return isDev 
    ? `http://localhost:${config.ports.ml}`
    : `https://${config.fullDomain}/ml`;
};

export const getThemeColors = () => config.theme;

export const getAIFunctions = (): AIFunction[] => config.aiFunctions;

export const getAIFunctionByName = (name: string): AIFunction | undefined => 
  config.aiFunctions.find(fn => fn.name === name);

export const getSystemPrompt = (): string => config.systemPrompt;

export const getFeatures = (): string[] => config.features;

export const getNavigationItems = () => config.navigationItems;

// Attack severity levels
export const ATTACK_SEVERITY = {
  LOW: { min: 0, max: 100, color: '#00ff88', label: 'Low' },
  MEDIUM: { min: 101, max: 1000, color: '#ffaa00', label: 'Medium' },
  HIGH: { min: 1001, max: 10000, color: '#ff6600', label: 'High' },
  CRITICAL: { min: 10001, max: Infinity, color: '#ff4444', label: 'Critical' }
} as const;

// Attack types
export const ATTACK_TYPES = [
  'volumetric',
  'syn-flood',
  'udp-flood',
  'icmp-flood',
  'http-flood',
  'slowloris',
  'dns-amplification',
  'ntp-amplification',
  'memcached',
  'application-layer'
] as const;

// Mitigation strategies
export const MITIGATION_STRATEGIES = [
  'block',
  'rate-limit',
  'challenge',
  'scrub',
  'null-route',
  'geo-block'
] as const;

export default config;

/**
 * WAFManager Configuration
 * Tool #21 - AI-Powered Web Application Firewall Management
 */

import configData from '../../wafmanager-config.json';

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
  return `${protocol}://${host}/maula-ai`;
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

// WAF Rule types
export const WAF_RULE_TYPES = [
  'block', 'allow', 'rate-limit', 'challenge', 'log', 'redirect'
] as const;

// Attack categories (OWASP)
export const ATTACK_CATEGORIES = [
  'sqli', 'xss', 'csrf', 'lfi', 'rfi', 'rce', 'ssrf', 'xxe', 'injection'
] as const;

// Protection levels
export const PROTECTION_LEVELS = ['low', 'medium', 'high', 'paranoid'] as const;

export default config;

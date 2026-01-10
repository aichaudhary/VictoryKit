import auditTrackerConfig from '../../cloudposture-config.json';

export interface CloudPostureConfig {
  tool_id: number;
  tool_name: string;
  version: string;
  base_domain: string;
  api_port: number;
  frontend_port: number;
  ml_port: number;
  ai_port: number;
  theme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  navigation: Array<{
    label: string;
    path: string;
    icon: string;
  }>;
  audit_sources: string[];
  compliance_frameworks: string[];
  ai: {
    system_prompt: string;
    model_config: {
      primary_model: string;
      fallback_models: string[];
    };
    functions: Array<{
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: any;
        required: string[];
      };
    }>;
  };
}

export function getConfig(): CloudPostureConfig {
  return auditTrackerConfig as CloudPostureConfig;
}

export function getApiUrl(): string {
  const config = getConfig();
  return `http://${config.base_domain}:${config.api_port}/api/v1/cloudposture`;
}

export function getWebSocketUrl(): string {
  const config = getConfig();
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${config.base_domain}:${config.ai_port}/maula/ai`;
}

export function getTheme() {
  return getConfig().theme;
}

export function getNavigation() {
  return getConfig().navigation;
}

export function getAuditSources() {
  return getConfig().audit_sources;
}

export function getComplianceFrameworks() {
  return getConfig().compliance_frameworks;
}

export function getAIFunctions() {
  return getConfig().ai.functions;
}

export default {
  getConfig,
  getApiUrl,
  getWebSocketUrl,
  getTheme,
  getNavigation,
  getAuditSources,
  getComplianceFrameworks,
  getAIFunctions
};

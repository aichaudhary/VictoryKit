import configData from '../../zerotrustai-config.json';

export interface ZeroTrustConfig {
  tool_id: number;
  tool_name: string;
  ports: {
    frontend: number;
    api: number;
    ml: number;
    ai: number;
  };
  database: string;
  domain: string;
  ai_path: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  ai_assistant: {
    model: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
    functions: any[];
  };
  navigation: any[];
  zero_trust_principles: any[];
  trust_factors: any[];
  authentication_methods: any[];
  policy_frameworks: any[];
}

class ConfigService {
  private config: ZeroTrustConfig;
  
  constructor() {
    this.config = configData as ZeroTrustConfig;
  }
  
  getConfig(): ZeroTrustConfig {
    return this.config;
  }
  
  getToolName(): string {
    return this.config.tool_name;
  }
  
  getPorts() {
    return this.config.ports;
  }
  
  getAPIUrl(): string {
    return `http://localhost:${this.config.ports.api}/api/v1/zerotrustai`;
  }
  
  getWSUrl(): string {
    return `ws://localhost:${this.config.ports.ai}${this.config.ai_path}`;
  }
  
  getTheme() {
    return this.config.theme;
  }
  
  getAIFunctions() {
    return this.config.ai_assistant.functions;
  }
  
  getNavigation() {
    return this.config.navigation;
  }
  
  getZeroTrustPrinciples() {
    return this.config.zero_trust_principles;
  }
  
  getTrustFactors() {
    return this.config.trust_factors;
  }
  
  getAuthenticationMethods() {
    return this.config.authentication_methods;
  }
  
  getPolicyFrameworks() {
    return this.config.policy_frameworks;
  }
}

export default new ConfigService();

// ZeroTrust Configuration Service

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
}

// Default configuration
const defaultConfig: ZeroTrustConfig = {
  tool_id: 32,
  tool_name: "ZeroTrust",
  ports: {
    frontend: 3032,
    api: 4032,
    ml: 8032,
    ai: 6032
  },
  database: "zerotrust_db",
  domain: "zerotrust.maula.ai",
  ai_path: "/ws/zerotrust",
  theme: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    accent: "#c4b5fd"
  }
};

class ConfigService {
  private config: ZeroTrustConfig;
  
  constructor() {
    this.config = defaultConfig;
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
    return import.meta.env.VITE_API_URL || `http://localhost:${this.config.ports.api}/api/v1/zerotrust`;
  }
  
  getWSUrl(): string {
    return `ws://localhost:${this.config.ports.ai}${this.config.ai_path}`;
  }
  
  getTheme() {
    return this.config.theme;
  }
}

export default new ConfigService();

import soarConfig from '../soarengine-config.json';

export interface ToolConfig {
  toolName: string;
  tagline: string;
  subdomain: string;
  aiPath: string;
  port: number;
  apiPort: number;
  mlPort: number;
  aiPort: number;
  databaseName: string;
  systemPrompt: string;
  functions: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  navigationItems: Array<{
    label: string;
    path: string;
    icon: string;
  }>;
}

class Config {
  private config: ToolConfig;

  constructor() {
    this.config = soarConfig as ToolConfig;
  }

  get toolName() {
    return this.config.toolName;
  }

  get tagline() {
    return this.config.tagline;
  }

  get subdomain() {
    return this.config.subdomain;
  }

  get aiPath() {
    return this.config.aiPath;
  }

  get ports() {
    return {
      frontend: this.config.port,
      api: this.config.apiPort,
      ml: this.config.mlPort,
      ai: this.config.aiPort
    };
  }

  get databaseName() {
    return this.config.databaseName;
  }

  get systemPrompt() {
    return this.config.systemPrompt;
  }

  get functions() {
    return this.config.functions;
  }

  get colorTheme() {
    return this.config.colorTheme;
  }

  get navigationItems() {
    return this.config.navigationItems;
  }

  get aiWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_AI_HOST || `localhost:${this.config.aiPort}`;
    return `${protocol}//${host}${this.config.aiPath}`;
  }

  get apiBaseUrl() {
    const protocol = window.location.protocol;
    const host = import.meta.env.VITE_API_HOST || `localhost:${this.config.apiPort}`;
    return `${protocol}//${host}/api/v1/soarengine`;
  }

  getFullConfig(): ToolConfig {
    return this.config;
  }
}

export default new Config();

// PolicyEngine Configuration Loader
// Loads and manages PolicyEngine configuration

export interface PolicyEngineFunction {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export interface PolicyEngineNavItem {
  label: string;
  icon: string;
  path: string;
}

export interface PolicyEngineConfig {
  name: string;
  version: string;
  description: string;
  ports: {
    frontend: number;
    api: number;
    ml: number;
    ai: number;
  };
  database: {
    name: string;
    host: string;
    port: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  ai: {
    system_prompt: string;
    functions: PolicyEngineFunction[];
    models: string[];
    default_model: string;
  };
  navigation: PolicyEngineNavItem[];
  features: {
    [key: string]: boolean;
  };
}

class ConfigService {
  private config: PolicyEngineConfig | null = null;
  
  async loadConfig(): Promise<PolicyEngineConfig> {
    if (this.config) {
      return this.config;
    }
    
    try {
      const response = await fetch('/policyengine-config.json');
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      
      this.config = await response.json();
      return this.config;
    } catch (error) {
      console.error('Failed to load PolicyEngine config:', error);
      // Return default config
      return this.getDefaultConfig();
    }
  }
  
  getConfig(): PolicyEngineConfig | null {
    return this.config;
  }
  
  getSystemPrompt(): string {
    return this.config?.ai.system_prompt || '';
  }
  
  getFunctions(): PolicyEngineFunction[] {
    return this.config?.ai.functions || [];
  }
  
  getNavigation(): PolicyEngineNavItem[] {
    return this.config?.navigation || [];
  }
  
  getColors(): { primary: string; secondary: string; accent: string } {
    return this.config?.colors || {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa'
    };
  }
  
  getPorts(): { frontend: number; api: number; ml: number; ai: number } {
    return this.config?.ports || {
      frontend: 3030,
      api: 4030,
      ml: 8030,
      ai: 6030
    };
  }
  
  getDatabase(): { name: string; host: string; port: number } {
    return this.config?.database || {
      name: 'policyengine_db',
      host: 'localhost',
      port: 27017
    };
  }
  
  isFeatureEnabled(feature: string): boolean {
    return this.config?.features?.[feature] ?? true;
  }
  
  private getDefaultConfig(): PolicyEngineConfig {
    return {
      name: 'PolicyEngine',
      version: '1.0.0',
      description: 'AI-Powered Security Policy Management',
      ports: {
        frontend: 3030,
        api: 4030,
        ml: 8030,
        ai: 6030
      },
      database: {
        name: 'policyengine_db',
        host: 'localhost',
        port: 27017
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        accent: '#a78bfa'
      },
      ai: {
        system_prompt: 'PolicyEngine AI Assistant',
        functions: [],
        models: ['gemini-1.5-pro', 'claude-3-5-sonnet', 'gpt-4-turbo', 'grok-beta'],
        default_model: 'gemini-1.5-pro'
      },
      navigation: [
        { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
        { label: 'Policy Library', icon: 'library_books', path: '/policies' },
        { label: 'Create Policy', icon: 'add_circle', path: '/policies/create' },
        { label: 'Compliance Monitor', icon: 'verified_user', path: '/compliance' },
        { label: 'Policy Analysis', icon: 'analytics', path: '/analysis' },
        { label: 'Exceptions', icon: 'error_outline', path: '/exceptions' },
        { label: 'Policy-as-Code', icon: 'code', path: '/policy-as-code' },
        { label: 'Framework Mapping', icon: 'account_tree', path: '/frameworks' },
        { label: 'Reports', icon: 'assessment', path: '/reports' }
      ],
      features: {
        policy_creation: true,
        policy_analysis: true,
        compliance_checking: true,
        exception_management: true,
        framework_mapping: true,
        policy_as_code: true,
        ai_assistance: true
      }
    };
  }
}

export default new ConfigService();

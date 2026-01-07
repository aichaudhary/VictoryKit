import config from '../../firewallai-config.json';

class ConfigService {
  private config: any;

  constructor() {
    this.config = config;
  }

  getToolInfo() {
    return this.config.toolInfo;
  }

  getDeployment() {
    return this.config.deployment;
  }

  getPorts() {
    return this.config.ports;
  }

  getDatabase() {
    return this.config.database;
  }

  getFeatures() {
    return this.config.features;
  }

  getMonitoring() {
    return this.config.monitoring;
  }

  getAIFunctions() {
    return this.config.aiAssistant.functions;
  }

  getIntegrations() {
    return this.config.integrations;
  }

  getSecurity() {
    return this.config.security;
  }

  getPerformance() {
    return this.config.performance;
  }

  getCompliance() {
    return this.config.compliance;
  }

  getAPIURL() {
    return `http://localhost:${this.config.ports.backend}`;
  }

  getWebSocketURL() {
    return `ws://localhost:${this.config.ports.aiWebSocket}`;
  }

  getProductionURL() {
    return this.config.deployment.fullUrl;
  }

  getAIAssistantURL() {
    return this.config.deployment.aiAssistantUrl;
  }

  getFullConfig() {
    return this.config;
  }
}

export default new ConfigService();
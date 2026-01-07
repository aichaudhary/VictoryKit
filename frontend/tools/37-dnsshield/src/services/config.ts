import config from '../../dnsshield-config.json';

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

  // Feature checks
  isDNSProtectionEnabled() {
    return this.config.features.dnsProtection.enabled;
  }

  isDNSSecurityEnabled() {
    return this.config.features.dnsSecurity.enabled;
  }

  isThreatIntelligenceEnabled() {
    return this.config.features.threatIntelligence.enabled;
  }

  isAnalyticsEnabled() {
    return this.config.features.dnsAnalytics.enabled;
  }

  // DNS Protection features
  isMalwareBlockingEnabled() {
    return this.config.features.dnsProtection.malwareDomainBlocking;
  }

  isPhishingProtectionEnabled() {
    return this.config.features.dnsProtection.phishingProtection;
  }

  isAdBlockingEnabled() {
    return this.config.features.dnsProtection.adBlocking;
  }

  // DNS Security features
  isDNSSECEnabled() {
    return this.config.features.dnsSecurity.dnssec;
  }

  isDNSOverHTTPSEnabled() {
    return this.config.features.dnsSecurity.dnsOverHTTPS;
  }

  isDNSOverTLSEnabled() {
    return this.config.features.dnsSecurity.dnsOverTLS;
  }

  isTunnelDetectionEnabled() {
    return this.config.features.dnsSecurity.tunnelDetection;
  }

  // Threat categories
  getThreatCategories() {
    return this.config.features.threatIntelligence.threatCategories;
  }

  getThreatFeeds() {
    return this.config.features.threatIntelligence.feeds;
  }

  // API URLs
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

  // Configuration
  getFullConfig() {
    return this.config;
  }
}

export default new ConfigService();

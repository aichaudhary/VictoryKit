const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');
const { getConnectors } = require('../../../../../shared/connectors');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8005';
  }

  async analyzeUrl(urlData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/analyze`, urlData, { timeout: 10000 });
      return response.data;
    } catch (error) {
      logger.warn('ML engine unavailable, using rule-based analysis');
      return this.ruleBasedAnalysis(urlData);
    }
  }

  async checkReputation(url) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/reputation`, { url }, { timeout: 5000 });
      return response.data;
    } catch (error) {
      logger.warn('Reputation check failed');
      return { blacklisted: false, reports: 0 };
    }
  }

  async detectCampaign(urls) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/campaign`, { urls }, { timeout: 8000 });
      return response.data;
    } catch (error) {
      logger.warn('Campaign detection failed');
      return { campaignDetected: false };
    }
  }

  ruleBasedAnalysis(data) {
    const { url, domain, urlFeatures } = data;
    let riskScore = 30;
    let isPhishing = false;
    let phishingType = 'unknown';

    const suspiciousKeywords = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'suspended', 'alert'];
    const phishingDomains = ['paypa1', 'amaz0n', 'g00gle', 'micros0ft'];

    if (urlFeatures?.hasIpAddress) riskScore += 20;
    if (urlFeatures?.length > 75) riskScore += 15;
    if (!urlFeatures?.isHttps) riskScore += 10;
    if (urlFeatures?.isShortenedUrl) riskScore += 25;
    if (urlFeatures?.numHyphens > 3) riskScore += 10;
    
    if (suspiciousKeywords.some(kw => url.toLowerCase().includes(kw))) {
      riskScore += 15;
      phishingType = 'credential_harvesting';
    }

    if (phishingDomains.some(pd => domain.toLowerCase().includes(pd))) {
      riskScore += 30;
      isPhishing = true;
      phishingType = 'fake_service';
    }

    if (riskScore >= 70) isPhishing = true;

    return {
      isPhishing,
      riskScore: Math.min(riskScore, 100),
      phishingType,
      confidence: Math.min(riskScore, 100),
      modelName: 'rule-based',
      timestamp: new Date()
    };
  }

  // Integration with external security stack
  async integrateWithSecurityStack(analysisId, analysisData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log phishing analysis results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'PhishingAnalysis_CL',
            data: {
              AnalysisId: analysisId,
              UserId: analysisData.userId,
              AnalysisType: analysisData.analysisType,
              TimeRange: analysisData.timeRange,
              Timestamp: new Date().toISOString(),
              Source: 'PhishNetAI'
            }
          }).catch(err => logger.warn('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for high-risk phishing
      if (connectors.cortexXSOAR && analysisData.riskScore > 80) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `High-Risk Phishing Detected - ${analysisId}`,
            type: 'Phishing',
            severity: 'High',
            details: {
              analysisId,
              riskScore: analysisData.riskScore,
              phishingType: analysisData.phishingType,
              url: analysisData.url
            }
          }).catch(err => logger.warn('XSOAR integration failed:', err.message))
        );
      }

      // CrowdStrike - Check for related IOCs
      if (connectors.crowdstrike) {
        integrationPromises.push(
          connectors.crowdstrike.searchIOCs({
            type: 'domain',
            value: analysisData.domain
          }).then(iocs => {
            if (iocs.length > 0) {
              logger.info(`Found ${iocs.length} related IOCs for domain ${analysisData.domain}`);
              // Could trigger containment actions
            }
          }).catch(err => logger.warn('CrowdStrike IOC search failed:', err.message))
        );
      }

      // Cloudflare - Update WAF rules if phishing detected
      if (connectors.cloudflare && analysisData.isPhishing) {
        integrationPromises.push(
          connectors.cloudflare.createWAFRule({
            description: `Block phishing domain: ${analysisData.domain}`,
            expression: `http.host eq "${analysisData.domain}"`,
            action: 'block'
          }).catch(err => logger.warn('Cloudflare WAF rule creation failed:', err.message))
        );
      }

      // OpenCTI - Enrich with threat intelligence
      if (connectors.opencti) {
        integrationPromises.push(
          connectors.opencti.searchIndicators({
            pattern: analysisData.url,
            pattern_type: 'url'
          }).then(indicators => {
            if (indicators.length > 0) {
              logger.info(`Found ${indicators.length} threat intelligence indicators`);
            }
          }).catch(err => logger.warn('OpenCTI enrichment failed:', err.message))
        );
      }

      await Promise.allSettled(integrationPromises);
      logger.info('PhishNetAI security stack integration completed');

    } catch (error) {
      logger.error('PhishNetAI integration error:', error);
    }
  }
}

module.exports = new MLService();

const axios = require('axios');
let getConnectors;
try {
  ({ getConnectors } = require("../../../../../shared/connectors"));
} catch (error) {
  console.warn('Connectors not available, security stack integration disabled');
  getConnectors = () => ({});
}

const {
  UrlAnalysis,
  FilterPolicy,
  UserProfile,
  AccessLog,
  Alert,
  Report
} = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8036';

class BrowserIsolationService {
  constructor() {
    this.threatApis = this.initializeThreatAPIs();
    this.contentApis = this.initializeContentAPIs();
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  initializeThreatAPIs() {
    return {
      googleSafeBrowsing: {
        apiKey: process.env.WEBFILTER_GOOGLE_SAFE_BROWSING_API_KEY,
        baseUrl: process.env.WEBFILTER_GOOGLE_SAFE_BROWSING_BASE_URL
      },
      virusTotal: {
        apiKey: process.env.WEBFILTER_VIRUSTOTAL_DOMAIN_API_KEY,
        baseUrl: process.env.WEBFILTER_VIRUSTOTAL_DOMAIN_BASE_URL
      },
      abuseIPDB: {
        apiKey: process.env.WEBFILTER_ABUSEIPDB_DOMAIN_API_KEY,
        baseUrl: process.env.WEBFILTER_ABUSEIPDB_DOMAIN_BASE_URL
      },
      phishTank: {
        apiKey: process.env.WEBFILTER_PHISHTANK_API_KEY,
        baseUrl: process.env.WEBFILTER_PHISHTANK_BASE_URL
      },
      urlScan: {
        apiKey: process.env.WEBFILTER_URLSCAN_API_KEY,
        baseUrl: process.env.WEBFILTER_URLSCAN_BASE_URL
      }
    };
  }

  initializeContentAPIs() {
    return {
      brightCloud: {
        apiKey: process.env.WEBFILTER_BRIGHTCLOUD_API_KEY,
        baseUrl: process.env.WEBFILTER_BRIGHTCLOUD_BASE_URL
      },
      openDns: {
        apiKey: process.env.WEBFILTER_OPENDNS_UMBRELLA_API_KEY,
        baseUrl: process.env.WEBFILTER_OPENDNS_UMBRELLA_BASE_URL
      },
      paloAlto: {
        apiKey: process.env.WEBFILTER_PAN_URL_FILTERING_API_KEY,
        baseUrl: process.env.WEBFILTER_PAN_URL_FILTERING_BASE_URL
      },
      ibmWatson: {
        apiKey: process.env.WEBFILTER_IBM_WATSON_API_KEY,
        baseUrl: process.env.WEBFILTER_IBM_WATSON_BASE_URL
      },
      microsoftModerator: {
        apiKey: process.env.WEBFILTER_MICROSOFT_CONTENT_MODERATOR_API_KEY,
        baseUrl: process.env.WEBFILTER_MICROSOFT_CONTENT_MODERATOR_BASE_URL
      }
    };
  }

  async analyzeUrl(url, options = {}) {
    try {
      const { userId, userAgent, ipAddress, checkCache = true } = options;

      // Check cache first
      if (checkCache) {
        const cached = await this.getCachedAnalysis(url);
        if (cached) return cached;
      }

      // Parse URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      const query = urlObj.search;

      // Perform comprehensive analysis
      const [
        threatAnalysis,
        contentAnalysis,
        reputationAnalysis,
        mlAnalysis
      ] = await Promise.allSettled([
        this.performThreatAnalysis(url, domain),
        this.performContentAnalysis(url),
        this.checkDomainReputation(domain),
        this.performMLAnalysis(url)
      ]);

      // Combine results
      const analysis = {
        url,
        domain,
        path,
        query,
        threatLevel: 'safe',
        riskScore: 0,
        categories: [],
        malwareDetected: false,
        phishingDetected: false,
        spamDetected: false,
        reputationScore: 50,
        trustScore: 50,
        analyzedBy: [],
        analysisTimestamp: new Date()
      };

      // Process threat analysis
      if (threatAnalysis.status === 'fulfilled') {
        const threatData = threatAnalysis.value;
        analysis.threatLevel = threatData.threatLevel || analysis.threatLevel;
        analysis.riskScore = Math.max(analysis.riskScore, threatData.riskScore || 0);
        analysis.malwareDetected = analysis.malwareDetected || threatData.malwareDetected;
        analysis.phishingDetected = analysis.phishingDetected || threatData.phishingDetected;
        analysis.analyzedBy.push('threat_apis');
      }

      // Process content analysis
      if (contentAnalysis.status === 'fulfilled') {
        const contentData = contentAnalysis.value;
        analysis.categories = [...new Set([...analysis.categories, ...contentData.categories])];
        analysis.analyzedBy.push('content_apis');
      }

      // Process reputation analysis
      if (reputationAnalysis.status === 'fulfilled') {
        const repData = reputationAnalysis.value;
        analysis.reputationScore = repData.reputationScore || analysis.reputationScore;
        analysis.trustScore = repData.trustScore || analysis.trustScore;
        analysis.analyzedBy.push('reputation_apis');
      }

      // Process ML analysis
      if (mlAnalysis.status === 'fulfilled') {
        const mlData = mlAnalysis.value;
        analysis.riskScore = Math.max(analysis.riskScore, mlData.riskScore || 0);
        if (mlData.categories) {
          analysis.categories = [...new Set([...analysis.categories, ...mlData.categories])];
        }
        analysis.analyzedBy.push('ml_engine');
      }

      // Determine final threat level
      analysis.threatLevel = this.calculateThreatLevel(analysis);

      // Save to database
      const savedAnalysis = await this.saveAnalysis(analysis);

      // Log access
      if (userId) {
        await this.logAccess({
          userId,
          url,
          domain,
          action: analysis.threatLevel === 'blocked' ? 'blocked' : 'allowed',
          reason: analysis.threatLevel,
          categories: analysis.categories,
          riskScore: analysis.riskScore,
          userAgent,
          ipAddress
        });
      }

      // Check for alerts
      if (analysis.riskScore > 70 || analysis.threatLevel === 'malicious') {
        await this.createAlert({
          type: 'threat_detected',
          severity: analysis.riskScore > 90 ? 'critical' : 'high',
          title: `High-risk URL detected: ${domain}`,
          description: `URL ${url} has been flagged with risk score ${analysis.riskScore}`,
          details: analysis,
          url,
          domain,
          riskScore: analysis.riskScore,
          categories: analysis.categories
        });
      }

      return savedAnalysis;
    } catch (error) {
      console.error('URL analysis error:', error);
      throw new Error(`URL analysis failed: ${error.message}`);
    }
  }

  async performThreatAnalysis(url, domain) {
    const results = { riskScore: 0, threatLevel: 'safe', malwareDetected: false, phishingDetected: false };

    try {
      // Google Safe Browsing
      if (this.threatApis.googleSafeBrowsing.apiKey) {
        const googleResult = await this.checkGoogleSafeBrowsing(url);
        if (googleResult.threats && googleResult.threats.length > 0) {
          results.riskScore = Math.max(results.riskScore, 90);
          results.threatLevel = 'malicious';
          results.malwareDetected = googleResult.threats.includes('MALWARE');
          results.phishingDetected = googleResult.threats.includes('SOCIAL_ENGINEERING');
        }
      }

      // VirusTotal
      if (this.threatApis.virusTotal.apiKey) {
        const vtResult = await this.checkVirusTotal(domain);
        if (vtResult.malicious > 0) {
          results.riskScore = Math.max(results.riskScore, vtResult.malicious * 20);
          results.malwareDetected = true;
        }
      }

      // PhishTank
      if (this.threatApis.phishTank.apiKey) {
        const phishResult = await this.checkPhishTank(url);
        if (phishResult.isPhish) {
          results.riskScore = Math.max(results.riskScore, 95);
          results.phishingDetected = true;
          results.threatLevel = 'malicious';
        }
      }

    } catch (error) {
      console.warn('Threat analysis partial failure:', error.message);
    }

    return results;
  }

  async performContentAnalysis(url) {
    const results = { categories: [] };

    try {
      // BrightCloud
      if (this.contentApis.brightCloud.apiKey) {
        const brightCloudResult = await this.checkBrightCloud(url);
        results.categories = [...results.categories, ...brightCloudResult.categories];
      }

      // OpenDNS
      if (this.contentApis.openDns.apiKey) {
        const openDnsResult = await this.checkOpenDNS(url);
        results.categories = [...results.categories, ...openDnsResult.categories];
      }

    } catch (error) {
      console.warn('Content analysis partial failure:', error.message);
    }

    return results;
  }

  async checkDomainReputation(domain) {
    const results = { reputationScore: 50, trustScore: 50 };

    try {
      // AbuseIPDB
      if (this.threatApis.abuseIPDB.apiKey) {
        const abuseResult = await this.checkAbuseIPDB(domain);
        results.reputationScore = 100 - abuseResult.abuseScore;
        results.trustScore = abuseResult.trustScore || 50;
      }

    } catch (error) {
      console.warn('Reputation check partial failure:', error.message);
    }

    return results;
  }

  async performMLAnalysis(url) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze`, {
        url,
        type: 'web_filter'
      }, { timeout: 10000 });

      return response.data;
    } catch (error) {
      console.warn('ML analysis failed:', error.message);
      return { riskScore: 0, categories: [] };
    }
  }

  calculateThreatLevel(analysis) {
    if (analysis.malwareDetected || analysis.phishingDetected) {
      return 'malicious';
    }
    if (analysis.riskScore > 70) {
      return 'suspicious';
    }
    if (analysis.categories.some(cat =>
      ['malware', 'phishing', 'spam', 'adult', 'gambling'].includes(cat.toLowerCase())
    )) {
      return 'blocked';
    }
    return 'safe';
  }

  async getCachedAnalysis(url) {
    try {
      const cached = await UrlAnalysis.findOne({
        url,
        cacheExpiry: { $gt: new Date() }
      });

      if (cached) {
        cached.isCached = true;
        return cached;
      }
    } catch (error) {
      console.warn('Cache check failed:', error.message);
    }
    return null;
  }

  async saveAnalysis(analysis) {
    try {
      const cacheExpiry = new Date(Date.now() + this.cacheTimeout);

      const saved = await UrlAnalysis.findOneAndUpdate(
        { url: analysis.url },
        { ...analysis, cacheExpiry, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      return saved;
    } catch (error) {
      console.error('Save analysis failed:', error);
      throw error;
    }
  }

  async logAccess(logData) {
    try {
      await AccessLog.create(logData);
    } catch (error) {
      console.warn('Access logging failed:', error.message);
    }
  }

  async createAlert(alertData) {
    try {
      const alert = await Alert.create(alertData);

      // Send notifications
      await this.sendAlertNotifications(alert);

      return alert;
    } catch (error) {
      console.warn('Alert creation failed:', error.message);
    }
  }

  async sendAlertNotifications(alert) {
    try {
      // Slack notification
      if (process.env.WEBFILTER_SLACK_BOT_TOKEN) {
        await this.sendSlackNotification(alert);
      }

      // Email notification
      if (alert.severity === 'critical') {
        await this.sendEmailNotification(alert);
      }

    } catch (error) {
      console.warn('Notification sending failed:', error.message);
    }
  }

  async checkPolicies(url, userId = null) {
    try {
      const policies = await FilterPolicy.find({
        enabled: true,
        $or: [
          { 'scope.type': 'global' },
          { 'scope.type': 'user', 'scope.targetIds': userId },
          { 'scope.targetIds': userId }
        ]
      }).sort({ priority: -1 });

      for (const policy of policies) {
        const shouldBlock = await this.evaluatePolicy(policy, url);
        if (shouldBlock) {
          return {
            blocked: true,
            policy: policy.name,
            action: policy.action,
            reason: `Policy violation: ${policy.name}`
          };
        }
      }

      return { blocked: false };
    } catch (error) {
      console.warn('Policy check failed:', error.message);
      return { blocked: false };
    }
  }

  async evaluatePolicy(policy, url) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const fullUrl = url.toLowerCase();

    switch (policy.type) {
      case 'url_filter':
        if (policy.rules.blockedUrls?.some(blocked => fullUrl.includes(blocked.toLowerCase()))) {
          return true;
        }
        if (policy.rules.allowedUrls?.some(allowed => fullUrl.includes(allowed.toLowerCase()))) {
          return false;
        }
        break;

      case 'domain_filter':
        if (policy.rules.blockedDomains?.some(blocked => domain.includes(blocked.toLowerCase()))) {
          return true;
        }
        if (policy.rules.allowedDomains?.some(allowed => domain.includes(allowed.toLowerCase()))) {
          return false;
        }
        break;

      case 'keyword_filter':
        if (policy.rules.blockedKeywords?.some(keyword =>
          fullUrl.includes(keyword.toLowerCase())
        )) {
          return true;
        }
        break;

      case 'category_filter':
        // This would need content analysis integration
        break;
    }

    return false;
  }

  async getRealTimeStats(timeRange = '24h') {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - this.parseTimeRange(timeRange));

      const stats = await AccessLog.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            blockedRequests: {
              $sum: { $cond: [{ $eq: ['$action', 'blocked'] }, 1, 0] }
            },
            allowedRequests: {
              $sum: { $cond: [{ $eq: ['$action', 'allowed'] }, 1, 0] }
            },
            uniqueUsers: { $addToSet: '$userId' },
            topCategories: {
              $push: '$categories'
            },
            topDomains: {
              $push: '$domain'
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalRequests: 0,
          blockedRequests: 0,
          allowedRequests: 0,
          blockRate: 0,
          uniqueUsers: 0,
          topCategories: [],
          topDomains: []
        };
      }

      const result = stats[0];
      const allCategories = result.topCategories.flat().filter(Boolean);
      const allDomains = result.topDomains.filter(Boolean);

      const topCategories = this.getTopItems(allCategories, 10);
      const topDomains = this.getTopItems(allDomains, 10);

      return {
        totalRequests: result.totalRequests,
        blockedRequests: result.blockedRequests,
        allowedRequests: result.allowedRequests,
        blockRate: result.totalRequests > 0 ? (result.blockedRequests / result.totalRequests) * 100 : 0,
        uniqueUsers: result.uniqueUsers.length,
        topCategories,
        topDomains
      };
    } catch (error) {
      console.error('Real-time stats error:', error);
      throw error;
    }
  }

  parseTimeRange(range) {
    const now = Date.now();
    switch (range) {
      case '1h': return 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  getTopItems(array, limit) {
    const counts = {};
    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }

  // API integration methods (implementations would call actual APIs)
  async checkGoogleSafeBrowsing(url) {
    // Implementation for Google Safe Browsing API
    return { threats: [] };
  }

  async checkVirusTotal(domain) {
    // Implementation for VirusTotal API
    return { malicious: 0 };
  }

  async checkPhishTank(url) {
    // Implementation for PhishTank API
    return { isPhish: false };
  }

  async checkBrightCloud(url) {
    // Implementation for BrightCloud API
    return { categories: [] };
  }

  async checkOpenDNS(url) {
    // Implementation for OpenDNS API
    return { categories: [] };
  }

  async checkAbuseIPDB(domain) {
    // Implementation for AbuseIPDB API
    return { abuseScore: 0, trustScore: 50 };
  }

  async sendSlackNotification(alert) {
    // Implementation for Slack notifications
  }

  async sendEmailNotification(alert) {
    // Implementation for email notifications
  }

  // Legacy methods for backward compatibility
  async analyze(data) {
    return this.analyzeUrl(data.url || data, { checkCache: false });
  }

  async scan(target) {
    return this.analyzeUrl(target, { checkCache: false });
  }

  async integrateWithSecurityStack(entityId, data) {
    const connectors = getConnectors();
    const integrationPromises = [];

    // Microsoft Sentinel - Log web filtering events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'BrowserIsolationEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            blockedUrls: data.blockedUrls || [],
            suspiciousDomains: data.suspiciousDomains || [],
            threatLevel: data.threatLevel || 'low',
            categories: data.categories || [],
            userAgent: data.userAgent,
            sourceIP: data.sourceIP
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for high-risk web activity
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          name: `Web Filter Alert: ${data.url || 'Unknown URL'}`,
          type: 'Web Security',
          severity: data.threatLevel === 'critical' ? 'Critical' : 'High',
          details: {
            url: data.url,
            domain: data.domain,
            riskScore: data.riskScore,
            categories: data.categories,
            sourceIP: data.sourceIP
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // Microsoft Defender - Submit indicators
    if (connectors.defender && data.threatLevel === 'malicious') {
      integrationPromises.push(
        connectors.defender.submitIndicator({
          indicator: data.url || data.domain,
          type: 'url',
          threatType: 'WebThreat',
          severity: 'High',
          description: `Blocked by BrowserIsolation: ${data.reason || 'High risk content'}`
        }).catch(err => ({ error: `Defender integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Submit detections
    if (connectors.crowdstrike && data.riskScore > 80) {
      integrationPromises.push(
        connectors.crowdstrike.submitDetection({
          type: 'web_filter',
          severity: data.riskScore > 90 ? 'critical' : 'high',
          description: `BrowserIsolation detected high-risk content: ${data.url}`,
          indicators: [{
            type: 'url',
            value: data.url,
            malicious: true
          }]
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // XSOAR - Create incidents for high-risk web activity (enhanced)
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'BrowserIsolationAlert',
          severity: data.threatLevel === 'critical' ? 'high' : 'medium',
          title: `Web Filter Alert: ${data.blockedUrls?.length || 0} URLs blocked`,
          description: `Automated web filtering detected suspicious activity from ${data.sourceIP}`,
          labels: ['web-filter', 'automated-detection'],
          details: {
            entityId,
            blockedUrls: data.blockedUrls,
            suspiciousDomains: data.suspiciousDomains,
            categories: data.categories
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Block malicious domains at endpoint level
    if (connectors.crowdstrike && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.crowdstrike.addToBlocklist({
          type: 'domain',
          entries: data.suspiciousDomains,
          reason: 'BrowserIsolation automated detection',
          severity: data.threatLevel
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Update firewall rules
    if (connectors.cloudflare && data.blockedUrls?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateFirewallRules({
          action: 'block',
          urls: data.blockedUrls,
          reason: 'BrowserIsolation automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - Implement rate limiting for suspicious IPs
    if (connectors.kong && data.sourceIP && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createRateLimit({
          consumer: data.sourceIP,
          route: 'web-access',
          limit: data.threatLevel === 'critical' ? 10 : 50,
          window: 'minute',
          reason: 'BrowserIsolation suspicious activity'
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - Log authentication attempts from filtered domains
    if (connectors.okta && data.userAgent) {
      integrationPromises.push(
        connectors.okta.logSecurityEvent({
          eventType: 'web_filter_interaction',
          userAgent: data.userAgent,
          sourceIP: data.sourceIP,
          blockedContent: data.blockedUrls?.length || 0,
          severity: data.threatLevel
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - Enrich threat intelligence
    if (connectors.opencti && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'domain',
          values: data.suspiciousDomains,
          labels: ['web-filter', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `Web filtering detected suspicious domains from ${data.sourceIP}`
        }).catch(err => ({ error: `OpenCTI integration failed: ${err.message}` }))
      );
    }

    // Execute all integrations in parallel with error resilience
    const results = await Promise.allSettled(integrationPromises);
    const failures = results.filter(result => result.status === 'rejected').map(result => result.reason);

    if (failures.length > 0) {
      console.warn('Some security stack integrations failed:', failures);
    }

    return {
      success: true,
      integrationsAttempted: integrationPromises.length,
      failures: failures.length,
      details: results.map((result, index) => ({
        integration: index,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : null
      }))
    };
  }
}

module.exports = new BrowserIsolationService();
const axios = require('axios');
const dns = require('dns').promises;
let getConnectors;
try {
  ({ getConnectors } = require('../../../../../../shared/connectors'));
} catch (error) {
  console.warn('Connectors not available, security stack integration disabled');
  getConnectors = () => ({});
}
const { DNSQuery, DomainAnalysis, DNSPolicy, DNSAlert } = require('../models');
const NodeCache = require('node-cache');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8037';

// Initialize cache for DNS results
const dnsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minute TTL

class DNSShieldService {
  constructor() {
    this.threatIntelligenceAPIs = this.initializeThreatAPIs();
    this.cache = dnsCache;
  }

  initializeThreatAPIs() {
    return {
      opendns: {
        apiKey: process.env.DNSSHIELD_OPENDNS_INVESTIGATE_API_KEY,
        baseUrl: process.env.DNSSHIELD_OPENDNS_INVESTIGATE_BASE_URL || 'https://investigate.api.umbrella.com'
      },
      quad9: {
        apiKey: process.env.DNSSHIELD_QUAD9_API_KEY,
        baseUrl: process.env.DNSSHIELD_QUAD9_BASE_URL || 'https://api.quad9.net'
      },
      virustotal: {
        apiKey: process.env.DNSSHIELD_VIRUSTOTAL_DOMAIN_API_KEY,
        baseUrl: process.env.DNSSHIELD_VIRUSTOTAL_DOMAIN_BASE_URL || 'https://www.virustotal.com/api/v3'
      },
      abuseipdb: {
        apiKey: process.env.DNSSHIELD_ABUSEIPDB_DOMAIN_API_KEY,
        baseUrl: process.env.DNSSHIELD_ABUSEIPDB_DOMAIN_BASE_URL || 'https://api.abuseipdb.com/api/v2'
      },
      phishtank: {
        apiKey: process.env.DNSSHIELD_PHISHTANK_API_KEY,
        baseUrl: process.env.DNSSHIELD_PHISHTANK_BASE_URL || 'https://phishtank.com/api'
      },
      passivetotal: {
        apiKey: process.env.DNSSHIELD_PASSIVETOTAL_API_KEY,
        baseUrl: process.env.DNSSHIELD_PASSIVETOTAL_BASE_URL || 'https://api.passivetotal.org/v2'
      },
      shodan: {
        apiKey: process.env.DNSSHIELD_SHODAN_DNS_API_KEY,
        baseUrl: process.env.DNSSHIELD_SHODAN_DNS_BASE_URL || 'https://api.shodan.io/dns'
      },
      googleSafeBrowsing: {
        apiKey: process.env.DNSSHIELD_GOOGLE_SAFE_BROWSING_API_KEY,
        baseUrl: process.env.DNSSHIELD_GOOGLE_SAFE_BROWSING_BASE_URL || 'https://safebrowsing.googleapis.com/v4'
      },
      alienvault: {
        apiKey: process.env.DNSSHIELD_ALIENVAULT_OTX_API_KEY,
        baseUrl: process.env.DNSSHIELD_ALIENVAULT_OTX_BASE_URL || 'https://otx.alienvault.com/api/v1'
      },
      ibmXforce: {
        apiKey: process.env.DNSSHIELD_IBM_XFORCE_API_KEY,
        baseUrl: process.env.DNSSHIELD_IBM_XFORCE_BASE_URL || 'https://api.xforce.ibmcloud.com'
      }
    };
  }

  async analyzeDNSQuery(queryData) {
    const { domain, queryType, sourceIP, userAgent } = queryData;
    const queryId = `dns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Check cache first
      const cacheKey = `${domain}_${queryType}`;
      let cachedResult = this.cache.get(cacheKey);

      if (cachedResult) {
        console.log(`Cache hit for ${domain}`);
        return {
          ...cachedResult,
          queryId,
          sourceIP,
          userAgent,
          cached: true
        };
      }

      // Perform DNS resolution
      const startTime = Date.now();
      let resolvedIPs = [];
      let responseCode = 0;
      let ttl = 0;

      try {
        const addresses = await dns.lookup(domain);
        resolvedIPs = Array.isArray(addresses) ? addresses.map(a => a.address) : [addresses];
        responseCode = 0; // Success
        ttl = 300; // Default TTL
      } catch (dnsError) {
        responseCode = this.getDNSResponseCode(dnsError.code);
        console.warn(`DNS resolution failed for ${domain}:`, dnsError.message);
      }

      const responseTime = Date.now() - startTime;

      // Analyze domain for threats
      const threatAnalysis = await this.performThreatAnalysis(domain);

      // Check against policies
      const policyCheck = await this.checkPolicies(domain, sourceIP, queryType);

      // Determine final action
      const finalResult = this.determineAction(threatAnalysis, policyCheck);

      // Create DNS query record
      const dnsQuery = new DNSQuery({
        queryId,
        domain,
        queryType,
        sourceIP,
        responseCode,
        responseTime,
        resolvedIPs,
        ttl,
        userAgent,
        threatLevel: finalResult.threatLevel,
        blocked: finalResult.blocked,
        blockReason: finalResult.blockReason,
        categories: threatAnalysis.categories,
        reputation: threatAnalysis.reputation,
        geoLocation: await this.getGeoLocation(sourceIP),
        metadata: {
          clientVersion: '1.0.0',
          protocol: 'DNS',
          flags: []
        }
      });

      await dnsQuery.save();

      // Cache the result
      const resultToCache = {
        domain,
        queryType,
        resolvedIPs,
        threatLevel: finalResult.threatLevel,
        blocked: finalResult.blocked,
        categories: threatAnalysis.categories,
        reputation: threatAnalysis.reputation,
        responseTime
      };
      this.cache.set(cacheKey, resultToCache);

      return {
        queryId,
        domain,
        queryType,
        resolvedIPs,
        responseCode,
        responseTime,
        threatLevel: finalResult.threatLevel,
        blocked: finalResult.blocked,
        blockReason: finalResult.blockReason,
        categories: threatAnalysis.categories,
        reputation: threatAnalysis.reputation,
        geoLocation: await this.getGeoLocation(sourceIP),
        cached: false
      };

    } catch (error) {
      console.error('DNS analysis error:', error);
      throw new Error(`DNS analysis failed: ${error.message}`);
    }
  }

  async performThreatAnalysis(domain) {
    const analysisPromises = [];

    // OpenDNS Investigate
    if (this.threatIntelligenceAPIs.opendns.apiKey) {
      analysisPromises.push(
        this.queryOpenDNS(domain).catch(err => ({ source: 'opendns', error: err.message }))
      );
    }

    // Quad9
    if (this.threatIntelligenceAPIs.quad9.apiKey) {
      analysisPromises.push(
        this.queryQuad9(domain).catch(err => ({ source: 'quad9', error: err.message }))
      );
    }

    // VirusTotal
    if (this.threatIntelligenceAPIs.virustotal.apiKey) {
      analysisPromises.push(
        this.queryVirusTotal(domain).catch(err => ({ source: 'virustotal', error: err.message }))
      );
    }

    // AbuseIPDB
    if (this.threatIntelligenceAPIs.abuseipdb.apiKey) {
      analysisPromises.push(
        this.queryAbuseIPDB(domain).catch(err => ({ source: 'abuseipdb', error: err.message }))
      );
    }

    // PhishTank
    if (this.threatIntelligenceAPIs.phishtank.apiKey) {
      analysisPromises.push(
        this.queryPhishTank(domain).catch(err => ({ source: 'phishtank', error: err.message }))
      );
    }

    // Execute all queries in parallel
    const results = await Promise.allSettled(analysisPromises);
    const successfulResults = results.filter(r => r.status === 'fulfilled').map(r => r.value);

    // Aggregate results
    return this.aggregateThreatAnalysis(domain, successfulResults);
  }

  async queryOpenDNS(domain) {
    const response = await axios.get(`${this.threatIntelligenceAPIs.opendns.baseUrl}/domains/categorization/${domain}`, {
      headers: { 'Authorization': `Bearer ${this.threatIntelligenceAPIs.opendns.apiKey}` }
    });

    return {
      source: 'opendns',
      categories: response.data[domain] ? [response.data[domain]] : [],
      malicious: response.data[domain] && response.data[domain] !== ' benign',
      confidence: 80
    };
  }

  async queryQuad9(domain) {
    const response = await axios.get(`${this.threatIntelligenceAPIs.quad9.baseUrl}/v1/threats/${domain}`, {
      headers: { 'X-API-Key': this.threatIntelligenceAPIs.quad9.apiKey }
    });

    return {
      source: 'quad9',
      malicious: response.data.threats && response.data.threats.length > 0,
      categories: response.data.threats || [],
      confidence: response.data.confidence || 0
    };
  }

  async queryVirusTotal(domain) {
    const response = await axios.get(`${this.threatIntelligenceAPIs.virustotal.baseUrl}/domains/${domain}`, {
      headers: { 'x-apikey': this.threatIntelligenceAPIs.virustotal.apiKey }
    });

    const stats = response.data.data.attributes.last_analysis_stats;
    const malicious = stats.malicious > 0;
    const reputation = Math.max(0, 100 - (stats.malicious * 10));

    return {
      source: 'virustotal',
      malicious,
      reputation,
      categories: response.data.data.attributes.categories || [],
      confidence: Math.min(100, stats.malicious * 20)
    };
  }

  async queryAbuseIPDB(domain) {
    const response = await axios.get(`${this.threatIntelligenceAPIs.abuseipdb.baseUrl}/check`, {
      params: { domain },
      headers: { 'Key': this.threatIntelligenceAPIs.abuseipdb.apiKey }
    });

    return {
      source: 'abuseipdb',
      malicious: response.data.data.abuseConfidenceScore > 50,
      reputation: Math.max(0, 100 - response.data.data.abuseConfidenceScore),
      confidence: response.data.data.abuseConfidenceScore
    };
  }

  async queryPhishTank(domain) {
    const response = await axios.get(`${this.threatIntelligenceAPIs.phishtank.baseUrl}/check/${domain}`, {
      headers: { 'User-Agent': 'DNSShield/1.0' }
    });

    return {
      source: 'phishtank',
      malicious: response.data.valid === true,
      categories: ['phishing'],
      confidence: response.data.valid ? 95 : 0
    };
  }

  aggregateThreatAnalysis(domain, results) {
    let totalMalicious = 0;
    let totalConfidence = 0;
    let categories = [];
    let reputationScores = [];
    let sources = [];

    results.forEach(result => {
      if (!result.error) {
        sources.push(result.source);
        if (result.malicious) totalMalicious++;
        if (result.confidence) totalConfidence += result.confidence;
        if (result.categories) categories.push(...result.categories);
        if (result.reputation) reputationScores.push(result.reputation);
      }
    });

    const maliciousRatio = results.length > 0 ? totalMalicious / results.length : 0;
    const averageConfidence = results.length > 0 ? totalConfidence / results.length : 0;
    const averageReputation = reputationScores.length > 0 ?
      reputationScores.reduce((a, b) => a + b, 0) / reputationScores.length : 50;

    let threatLevel = 'safe';
    if (maliciousRatio >= 0.5 || averageConfidence >= 70) {
      threatLevel = 'malicious';
    } else if (maliciousRatio >= 0.2 || averageConfidence >= 40) {
      threatLevel = 'suspicious';
    }

    return {
      domain,
      threatLevel,
      riskScore: Math.min(100, averageConfidence),
      categories: [...new Set(categories)],
      reputation: {
        score: Math.round(averageReputation),
        sources
      },
      analysisSources: sources.length,
      maliciousIndicators: totalMalicious
    };
  }

  async checkPolicies(domain, sourceIP, queryType) {
    try {
      const policies = await DNSPolicy.find({
        enabled: true,
        $or: [
          { 'scope.type': 'global' },
          { 'scope.targets': sourceIP }
        ]
      }).sort({ priority: -1 });

      for (const policy of policies) {
        const match = this.evaluatePolicy(policy, domain, sourceIP, queryType);
        if (match) {
          return {
            matched: true,
            policy: policy.policyId,
            action: policy.actions,
            type: policy.type
          };
        }
      }

      return { matched: false };
    } catch (error) {
      console.error('Policy check error:', error);
      return { matched: false };
    }
  }

  evaluatePolicy(policy, domain, sourceIP, queryType) {
    switch (policy.type) {
      case 'blocklist':
        return policy.rules.blockedDomains.includes(domain);

      case 'allowlist':
        return !policy.rules.allowedDomains.includes(domain);

      case 'category_filter':
        // This would need category matching logic
        return false;

      case 'reputation_filter':
        // This would need reputation checking
        return false;

      default:
        return false;
    }
  }

  determineAction(threatAnalysis, policyCheck) {
    if (policyCheck.matched) {
      return {
        blocked: policyCheck.action.block,
        blockReason: `Policy violation: ${policyCheck.type}`,
        threatLevel: 'blocked'
      };
    }

    return {
      blocked: threatAnalysis.threatLevel === 'malicious',
      blockReason: threatAnalysis.threatLevel === 'malicious' ? 'Malicious domain detected' : null,
      threatLevel: threatAnalysis.threatLevel
    };
  }

  async getGeoLocation(ip) {
    try {
      // This would integrate with a geo-IP service
      // For now, return placeholder
      return {
        country: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown'
      };
    } catch (error) {
      return {
        country: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown'
      };
    }
  }

  getDNSResponseCode(errorCode) {
    const codeMap = {
      'ENOTFOUND': 3,    // NXDOMAIN
      'ETIMEOUT': 2,     // SERVFAIL
      'ECONNREFUSED': 2, // SERVFAIL
      'default': 2       // SERVFAIL
    };
    return codeMap[errorCode] || codeMap.default;
  }

  async analyze(data) {
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, { data });
      return mlResponse.data;
    } catch (error) {
      throw new Error(`ML analysis failed: ${error.message}`);
    }
  }

  async scan(target) {
    try {
      const mlResponse = await axios.post(`${ML_ENGINE_URL}/scan`, { target });
      return mlResponse.data;
    } catch (error) {
      throw new Error(`ML scan failed: ${error.message}`);
    }
  }

  async integrateWithSecurityStack(entityId, data) {
    const connectors = getConnectors();
    const integrationPromises = [];

    // Microsoft Sentinel - Log DNS security events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'DNSShieldEvents',
          data: {
            entityId,
            timestamp: new Date().toISOString(),
            dnsQueries: data.dnsQueries || [],
            suspiciousDomains: data.suspiciousDomains || [],
            blockedResolutions: data.blockedResolutions || [],
            threatLevel: data.threatLevel || 'low',
            queryTypes: data.queryTypes || [],
            sourceIP: data.sourceIP,
            responseCodes: data.responseCodes || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }

    // Cortex XSOAR - Create incidents for DNS-based threats
    if (connectors.xsoar && (data.threatLevel === 'high' || data.threatLevel === 'critical')) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          name: `DNS Shield Alert: ${data.domain || 'Unknown Domain'}`,
          type: 'DNS Security',
          severity: data.threatLevel === 'critical' ? 'Critical' : 'High',
          details: {
            domain: data.domain,
            threatLevel: data.threatLevel,
            riskScore: data.riskScore,
            categories: data.categories,
            sourceIP: data.sourceIP
          }
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }

    // Microsoft Defender - Submit DNS indicators
    if (connectors.defender && data.threatLevel === 'malicious') {
      integrationPromises.push(
        connectors.defender.submitIndicator({
          indicator: data.domain,
          type: 'domain',
          threatType: 'DNSThreat',
          severity: 'High',
          description: `Blocked by DNS Shield: ${data.blockReason || 'High risk domain'}`
        }).catch(err => ({ error: `Defender integration failed: ${err.message}` }))
      );
    }

    // CrowdStrike - Submit DNS detections
    if (connectors.crowdstrike && data.riskScore > 80) {
      integrationPromises.push(
        connectors.crowdstrike.submitDetection({
          type: 'dns_shield',
          severity: data.riskScore > 90 ? 'critical' : 'high',
          description: `DNS Shield detected high-risk domain: ${data.domain}`,
          indicators: [{
            type: 'domain',
            value: data.domain,
            malicious: true
          }]
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }

    // Cloudflare - Update DNS firewall rules
    if (connectors.cloudflare && data.blockedResolutions?.length > 0) {
      integrationPromises.push(
        connectors.cloudflare.updateDNSFirewall({
          action: 'block',
          domains: data.blockedResolutions,
          reason: 'DNS Shield automated blocking',
          priority: data.threatLevel === 'critical' ? 1 : 2
        }).catch(err => ({ error: `Cloudflare integration failed: ${err.message}` }))
      );
    }

    // Kong - DNS-based security routing
    if (connectors.kong && data.sourceIP && data.threatLevel !== 'low') {
      integrationPromises.push(
        connectors.kong.createDNSFilter({
          sourceIP: data.sourceIP,
          blockedDomains: data.suspiciousDomains || [],
          reason: 'DNS Shield suspicious activity',
          ttl: 3600
        }).catch(err => ({ error: `Kong integration failed: ${err.message}` }))
      );
    }

    // Okta - DNS security for authentication flows
    if (connectors.okta && data.dnsQueries) {
      integrationPromises.push(
        connectors.okta.logSecurityEvent({
          eventType: 'dns_security_analysis',
          dnsQueries: data.dnsQueries.length,
          suspiciousDomains: data.suspiciousDomains?.length || 0,
          sourceIP: data.sourceIP,
          severity: data.threatLevel
        }).catch(err => ({ error: `Okta integration failed: ${err.message}` }))
      );
    }

    // OpenCTI - DNS-based threat indicators
    if (connectors.opencti && data.suspiciousDomains?.length > 0) {
      integrationPromises.push(
        connectors.opencti.createIndicators({
          type: 'domain',
          values: data.suspiciousDomains,
          labels: ['dns-shield', 'automated-detection'],
          confidence: data.threatLevel === 'critical' ? 90 : data.threatLevel === 'high' ? 75 : 60,
          description: `DNS analysis detected suspicious domain resolutions from ${data.sourceIP}`
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

  // Additional DNS Shield methods
  async getDNSStats(timeRange = '24h') {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - parseInt(timeRange));

      const stats = await DNSQuery.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            blockedQueries: { $sum: { $cond: ['$blocked', 1, 0] } },
            maliciousQueries: { $sum: { $cond: [{ $eq: ['$threatLevel', 'malicious'] }, 1, 0] } },
            averageResponseTime: { $avg: '$responseTime' },
            uniqueDomains: { $addToSet: '$domain' },
            uniqueIPs: { $addToSet: '$sourceIP' }
          }
        },
        {
          $project: {
            totalQueries: 1,
            blockedQueries: 1,
            maliciousQueries: 1,
            averageResponseTime: { $round: ['$averageResponseTime', 2] },
            uniqueDomainsCount: { $size: '$uniqueDomains' },
            uniqueIPsCount: { $size: '$uniqueIPs' }
          }
        }
      ]);

      return stats[0] || {
        totalQueries: 0,
        blockedQueries: 0,
        maliciousQueries: 0,
        averageResponseTime: 0,
        uniqueDomainsCount: 0,
        uniqueIPsCount: 0
      };
    } catch (error) {
      console.error('Error getting DNS stats:', error);
      throw error;
    }
  }

  async getTopThreats(limit = 10) {
    try {
      return await DNSQuery.aggregate([
        { $match: { threatLevel: { $in: ['suspicious', 'malicious'] } } },
        {
          $group: {
            _id: '$domain',
            count: { $sum: 1 },
            threatLevel: { $first: '$threatLevel' },
            lastSeen: { $max: '$timestamp' },
            categories: { $addToSet: '$categories' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            domain: '$_id',
            count: 1,
            threatLevel: 1,
            lastSeen: 1,
            categories: { $reduce: { input: '$categories', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } }
          }
        }
      ]);
    } catch (error) {
      console.error('Error getting top threats:', error);
      throw error;
    }
  }

  async createAlert(alertData) {
    try {
      const alert = new DNSAlert(alertData);
      await alert.save();

      // Trigger real-time notifications
      this.notifyAlert(alert);

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  async notifyAlert(alert) {
    // Implementation for real-time alert notifications
    // This would integrate with WebSocket, email, Slack, etc.
    console.log(`Alert created: ${alert.title} (Severity: ${alert.severity})`);
  }

  // Advanced DNS Tunneling Detection
  async detectDNSTunneling(domain, queryType, responseData) {
    try {
      const tunnelingIndicators = {
        suspiciousQueryTypes: ['TXT', 'NULL', 'SRV', 'CNAME'],
        highFrequencyDomains: new Map(),
        unusualPatterns: [],
        entropyScore: 0,
        subdomainDepth: 0
      };

      // Check for suspicious query types
      if (tunnelingIndicators.suspiciousQueryTypes.includes(queryType)) {
        tunnelingIndicators.unusualPatterns.push(`Suspicious query type: ${queryType}`);
      }

      // Analyze subdomain depth (DNS tunneling often uses deep subdomains)
      const subdomains = domain.split('.');
      tunnelingIndicators.subdomainDepth = subdomains.length - 2; // Subtract TLD and domain

      if (tunnelingIndicators.subdomainDepth > 5) {
        tunnelingIndicators.unusualPatterns.push(`Unusually deep subdomain depth: ${tunnelingIndicators.subdomainDepth}`);
      }

      // Calculate domain entropy (random-looking domains often indicate tunneling)
      tunnelingIndicators.entropyScore = this.calculateDomainEntropy(domain);

      if (tunnelingIndicators.entropyScore > 4.0) {
        tunnelingIndicators.unusualPatterns.push(`High entropy domain: ${tunnelingIndicators.entropyScore.toFixed(2)}`);
      }

      // Check for base64-like patterns in subdomains
      if (this.containsBase64Patterns(domain)) {
        tunnelingIndicators.unusualPatterns.push('Contains base64-like patterns');
      }

      // Check for hexadecimal patterns
      if (this.containsHexPatterns(domain)) {
        tunnelingIndicators.unusualPatterns.push('Contains hexadecimal patterns');
      }

      // Analyze response data for tunneling indicators
      if (responseData && responseData.answers) {
        const txtRecords = responseData.answers.filter(answer => answer.type === 'TXT');
        txtRecords.forEach(record => {
          if (record.data && record.data.length > 100) {
            tunnelingIndicators.unusualPatterns.push('Large TXT record detected');
          }
        });
      }

      const riskScore = this.calculateTunnelingRiskScore(tunnelingIndicators);

      return {
        isTunneling: riskScore > 0.7,
        riskScore,
        indicators: tunnelingIndicators,
        analysis: {
          subdomainDepth: tunnelingIndicators.subdomainDepth,
          entropyScore: tunnelingIndicators.entropyScore,
          patterns: tunnelingIndicators.unusualPatterns
        }
      };
    } catch (error) {
      console.error('Error detecting DNS tunneling:', error);
      return { isTunneling: false, riskScore: 0, indicators: {}, analysis: {} };
    }
  }

  // Calculate domain entropy for randomness detection
  calculateDomainEntropy(domain) {
    const subdomains = domain.split('.').slice(0, -2); // Exclude TLD
    const subdomainString = subdomains.join('');

    if (!subdomainString) return 0;

    const charCount = {};
    for (const char of subdomainString) {
      charCount[char] = (charCount[char] || 0) + 1;
    }

    let entropy = 0;
    const len = subdomainString.length;

    for (const count of Object.values(charCount)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  // Check for base64-like patterns
  containsBase64Patterns(domain) {
    const base64Regex = /[A-Za-z0-9+/]{4,}/g;
    const subdomains = domain.split('.');
    return subdomains.some(subdomain => base64Regex.test(subdomain));
  }

  // Check for hexadecimal patterns
  containsHexPatterns(domain) {
    const hexRegex = /\b[0-9a-fA-F]{8,}\b/g;
    const subdomains = domain.split('.');
    return subdomains.some(subdomain => hexRegex.test(subdomain));
  }

  // Calculate tunneling risk score
  calculateTunnelingRiskScore(indicators) {
    let score = 0;

    // Subdomain depth scoring
    if (indicators.subdomainDepth > 5) score += 0.3;
    else if (indicators.subdomainDepth > 3) score += 0.1;

    // Entropy scoring
    if (indicators.entropyScore > 4.5) score += 0.4;
    else if (indicators.entropyScore > 4.0) score += 0.2;

    // Pattern scoring
    score += indicators.unusualPatterns.length * 0.1;

    return Math.min(score, 1.0);
  }

  // Advanced Threat Analysis with ML Integration
  async performAdvancedThreatAnalysis(domain, queryData) {
    try {
      const analysis = {
        domain: domain,
        timestamp: new Date(),
        threatScore: 0,
        indicators: [],
        recommendations: [],
        confidence: 0
      };

      // Multi-layered threat detection
      const layers = await Promise.allSettled([
        this.analyzeDomainReputation(domain),
        this.analyzeQueryPatterns(queryData),
        this.checkAgainstThreatFeeds(domain),
        this.performBehavioralAnalysis(domain, queryData),
        this.analyzeGeoLocationAnomalies(queryData)
      ]);

      // Aggregate results from all layers
      layers.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const layerResult = result.value;
          analysis.threatScore += layerResult.score || 0;
          analysis.indicators.push(...(layerResult.indicators || []));
          analysis.recommendations.push(...(layerResult.recommendations || []));
          analysis.confidence = Math.max(analysis.confidence, layerResult.confidence || 0);
        } else {
          console.warn(`Layer ${index} analysis failed:`, result.reason);
        }
      });

      // Normalize threat score
      analysis.threatScore = Math.min(analysis.threatScore / layers.length, 1.0);

      // Determine threat level
      analysis.threatLevel = this.determineThreatLevel(analysis.threatScore);

      // Generate final recommendations
      analysis.recommendations = [...new Set(analysis.recommendations)];
      analysis.finalAction = this.determineAction(analysis.threatScore, analysis.indicators);

      return analysis;
    } catch (error) {
      console.error('Error in advanced threat analysis:', error);
      return {
        domain,
        timestamp: new Date(),
        threatScore: 0,
        threatLevel: 'unknown',
        indicators: [],
        recommendations: ['Analysis failed - manual review required'],
        confidence: 0,
        finalAction: 'monitor'
      };
    }
  }

  // Domain reputation analysis
  async analyzeDomainReputation(domain) {
    try {
      const reputation = { score: 0, indicators: [], recommendations: [], confidence: 0.8 };

      // Check multiple reputation sources
      const sources = [
        { name: 'VirusTotal', api: this.threatAPIs.virustotal },
        { name: 'AbuseIPDB', api: this.threatAPIs.abuseipdb },
        { name: 'Google Safe Browsing', api: this.threatAPIs.googleSafeBrowsing }
      ];

      for (const source of sources) {
        try {
          const result = await this.checkDomainWithAPI(domain, source.api);
          if (result.malicious) {
            reputation.score += 0.3;
            reputation.indicators.push(`${source.name}: Domain flagged as malicious`);
            reputation.recommendations.push(`Block domain based on ${source.name} reputation`);
          }
        } catch (error) {
          console.warn(`Failed to check ${source.name}:`, error.message);
        }
      }

      return reputation;
    } catch (error) {
      console.error('Error analyzing domain reputation:', error);
      return { score: 0, indicators: [], recommendations: [], confidence: 0 };
    }
  }

  // Query pattern analysis
  async analyzeQueryPatterns(queryData) {
    try {
      const patterns = { score: 0, indicators: [], recommendations: [], confidence: 0.7 };

      // Analyze query frequency
      const recentQueries = await DNSQuery.find({
        domain: queryData.domain,
        timestamp: { $gte: new Date(Date.now() - 3600000) } // Last hour
      }).countDocuments();

      if (recentQueries > 100) {
        patterns.score += 0.2;
        patterns.indicators.push(`High query frequency: ${recentQueries} queries/hour`);
        patterns.recommendations.push('Implement rate limiting for this domain');
      }

      // Analyze query types
      const suspiciousTypes = ['TXT', 'NULL'];
      if (suspiciousTypes.includes(queryData.queryType)) {
        patterns.score += 0.1;
        patterns.indicators.push(`Suspicious query type: ${queryData.queryType}`);
      }

      return patterns;
    } catch (error) {
      console.error('Error analyzing query patterns:', error);
      return { score: 0, indicators: [], recommendations: [], confidence: 0 };
    }
  }

  // Threat feed checking
  async checkAgainstThreatFeeds(domain) {
    try {
      const feeds = { score: 0, indicators: [], recommendations: [], confidence: 0.9 };

      // Check AlienVault OTX
      if (this.threatAPIs.alienVaultOTX) {
        try {
          const otxResult = await this.queryAlienVaultOTX(domain);
          if (otxResult.pulses && otxResult.pulses.length > 0) {
            feeds.score += 0.2;
            feeds.indicators.push(`AlienVault OTX: ${otxResult.pulses.length} threat pulses`);
            feeds.recommendations.push('Review AlienVault OTX pulses for detailed threat intelligence');
          }
        } catch (error) {
          console.warn('AlienVault OTX check failed:', error.message);
        }
      }

      // Check IBM X-Force
      if (this.threatAPIs.ibmXForce) {
        try {
          const xforceResult = await this.queryIBMXForce(domain);
          if (xforceResult.score && xforceResult.score > 3) {
            feeds.score += 0.2;
            feeds.indicators.push(`IBM X-Force: Risk score ${xforceResult.score}`);
            feeds.recommendations.push('Review IBM X-Force report for detailed analysis');
          }
        } catch (error) {
          console.warn('IBM X-Force check failed:', error.message);
        }
      }

      return feeds;
    } catch (error) {
      console.error('Error checking threat feeds:', error);
      return { score: 0, indicators: [], recommendations: [], confidence: 0 };
    }
  }

  // Behavioral analysis
  async performBehavioralAnalysis(domain, queryData) {
    try {
      const behavior = { score: 0, indicators: [], recommendations: [], confidence: 0.6 };

      // Check for DGA (Domain Generation Algorithm) patterns
      if (this.isDGADomain(domain)) {
        behavior.score += 0.4;
        behavior.indicators.push('Potential DGA-generated domain detected');
        behavior.recommendations.push('Monitor for botnet activity');
      }

      // Check for fast flux patterns
      const fluxCheck = await this.checkFastFlux(domain);
      if (fluxCheck.isFastFlux) {
        behavior.score += 0.3;
        behavior.indicators.push('Fast flux domain pattern detected');
        behavior.recommendations.push('Block domain and monitor for malware distribution');
      }

      return behavior;
    } catch (error) {
      console.error('Error in behavioral analysis:', error);
      return { score: 0, indicators: [], recommendations: [], confidence: 0 };
    }
  }

  // Geolocation anomaly analysis
  async analyzeGeoLocationAnomalies(queryData) {
    try {
      const geo = { score: 0, indicators: [], recommendations: [], confidence: 0.5 };

      if (queryData.sourceIP) {
        // Check if IP is from high-risk country
        const country = await this.getIPCountry(queryData.sourceIP);
        const highRiskCountries = ['RU', 'CN', 'IR', 'KP', 'SY'];

        if (highRiskCountries.includes(country)) {
          geo.score += 0.1;
          geo.indicators.push(`Query from high-risk country: ${country}`);
          geo.recommendations.push('Apply additional scrutiny for queries from this region');
        }

        // Check for unusual routing
        const routingAnomaly = await this.checkRoutingAnomaly(queryData.sourceIP, queryData.domain);
        if (routingAnomaly) {
          geo.score += 0.1;
          geo.indicators.push('Unusual routing pattern detected');
          geo.recommendations.push('Investigate potential routing manipulation');
        }
      }

      return geo;
    } catch (error) {
      console.error('Error analyzing geolocation:', error);
      return { score: 0, indicators: [], recommendations: [], confidence: 0 };
    }
  }

  // Helper methods for advanced analysis
  determineThreatLevel(score) {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'safe';
  }

  determineAction(score, indicators) {
    if (score >= 0.8) return 'block';
    if (score >= 0.6) return 'quarantine';
    if (score >= 0.4) return 'monitor';
    return 'allow';
  }

  async checkDomainWithAPI(domain, apiConfig) {
    // Placeholder for API-specific domain checking
    // Implementation would vary based on API
    return { malicious: false };
  }

  async queryAlienVaultOTX(domain) {
    // Implementation for AlienVault OTX API
    return { pulses: [] };
  }

  async queryIBMXForce(domain) {
    // Implementation for IBM X-Force API
    return { score: 0 };
  }

  isDGADomain(domain) {
    // Simple DGA detection based on entropy and patterns
    const entropy = this.calculateDomainEntropy(domain);
    return entropy > 4.2;
  }

  async checkFastFlux(domain) {
    // Fast flux detection logic
    return { isFastFlux: false };
  }

  async getIPCountry(ip) {
    // IP geolocation lookup
    return 'US'; // Placeholder
  }

  async checkRoutingAnomaly(ip, domain) {
    // Routing anomaly detection
    return false; // Placeholder
  }

  // Real-time DNS Monitoring and Alerting
  async startRealTimeMonitoring() {
    try {
      console.log('Starting real-time DNS monitoring...');

      // Set up WebSocket connections for real-time updates
      this.setupWebSocketMonitoring();

      // Start periodic threat feed updates
      this.startThreatFeedUpdates();

      // Initialize performance monitoring
      this.startPerformanceMonitoring();

      console.log('Real-time DNS monitoring started successfully');
    } catch (error) {
      console.error('Error starting real-time monitoring:', error);
      throw error;
    }
  }

  setupWebSocketMonitoring() {
    // WebSocket setup for real-time DNS query monitoring
    // This would integrate with Socket.IO for client connections
    this.monitoringActive = true;
  }

  startThreatFeedUpdates() {
    // Periodic updates from threat intelligence feeds
    setInterval(async () => {
      try {
        await this.updateThreatFeeds();
      } catch (error) {
        console.error('Error updating threat feeds:', error);
      }
    }, 300000); // Update every 5 minutes
  }

  startPerformanceMonitoring() {
    // Monitor DNS query performance and system health
    setInterval(async () => {
      try {
        const stats = await this.getDNSStats();
        this.checkPerformanceThresholds(stats);
      } catch (error) {
        console.error('Error in performance monitoring:', error);
      }
    }, 60000); // Check every minute
  }

  async updateThreatFeeds() {
    try {
      // Update local threat intelligence from various feeds
      const feeds = [
        'AlienVault OTX',
        'IBM X-Force',
        'VirusTotal',
        'AbuseIPDB'
      ];

      for (const feed of feeds) {
        console.log(`Updating threat feed: ${feed}`);
        // Implementation for updating each feed
      }
    } catch (error) {
      console.error('Error updating threat feeds:', error);
    }
  }

  checkPerformanceThresholds(stats) {
    const thresholds = {
      maxResponseTime: 1000, // 1 second
      maxErrorRate: 0.05, // 5%
      maxBlockedRate: 0.1 // 10%
    };

    if (stats.averageResponseTime > thresholds.maxResponseTime) {
      this.createAlert({
        title: 'High DNS Response Time',
        description: `Average response time: ${stats.averageResponseTime}ms`,
        severity: 'medium',
        type: 'performance'
      });
    }

    const errorRate = stats.blockedQueries / stats.totalQueries;
    if (errorRate > thresholds.maxErrorRate) {
      this.createAlert({
        title: 'High DNS Error Rate',
        description: `Error rate: ${(errorRate * 100).toFixed(2)}%`,
        severity: 'high',
        type: 'performance'
      });
    }
  }

  // Get Performance Metrics
  async getPerformanceMetrics(timeRange = '1h') {
    try {
      const now = new Date();
      let startTime;

      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
      }

      const metrics = await DNSQuery.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            blockedQueries: { $sum: { $cond: ['$blocked', 1, 0] } },
            maliciousQueries: { $sum: { $cond: [{ $eq: ['$threatLevel', 'malicious'] }, 1, 0] } },
            avgResponseTime: { $avg: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' },
            totalResponseTime: { $sum: '$responseTime' },
            queryCount: { $sum: 1 }
          }
        },
        {
          $project: {
            totalQueries: 1,
            blockedQueries: 1,
            maliciousQueries: 1,
            averageResponseTime: { $round: ['$avgResponseTime', 2] },
            minResponseTime: 1,
            maxResponseTime: 1,
            throughput: {
              $round: [
                { $divide: ['$queryCount', { $divide: [{ $subtract: [now, startTime] }, 1000] }] },
                2
              ]
            },
            blockRate: {
              $round: [
                { $multiply: [{ $divide: ['$blockedQueries', '$totalQueries'] }, 100] },
                2
              ]
            },
            maliciousRate: {
              $round: [
                { $multiply: [{ $divide: ['$maliciousQueries', '$totalQueries'] }, 100] },
                2
              ]
            }
          }
        }
      ]);

      const result = metrics[0] || {
        totalQueries: 0,
        blockedQueries: 0,
        maliciousQueries: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        throughput: 0,
        blockRate: 0,
        maliciousRate: 0
      };

      // Add system health metrics
      result.systemHealth = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        timestamp: now
      };

      return result;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }
}

module.exports = new DNSShieldService();
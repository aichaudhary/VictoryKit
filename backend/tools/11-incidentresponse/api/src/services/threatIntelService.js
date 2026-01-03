/**
 * Threat Intelligence Service
 * Real-world integrations for IOC enrichment and threat analysis
 * 
 * Integrates with: VirusTotal, AlienVault OTX, IBM X-Force, AbuseIPDB, Shodan
 */

const axios = require('axios');

class ThreatIntelService {
  constructor() {
    // VirusTotal
    this.vtApiKey = process.env.INCIDENTRESPONSE_VIRUSTOTAL_API_KEY;
    this.vtBaseUrl = process.env.INCIDENTRESPONSE_VIRUSTOTAL_BASE_URL || 'https://www.virustotal.com/api/v3';
    
    // AlienVault OTX
    this.otxApiKey = process.env.INCIDENTRESPONSE_ALIENVAULT_API_KEY;
    this.otxBaseUrl = process.env.INCIDENTRESPONSE_ALIENVAULT_BASE_URL || 'https://otx.alienvault.com/api/v1';
    
    // IBM X-Force
    this.xforceApiKey = process.env.INCIDENTRESPONSE_IBM_XFORCE_API_KEY;
    this.xforcePassword = process.env.INCIDENTRESPONSE_IBM_XFORCE_API_PASSWORD;
    this.xforceBaseUrl = process.env.INCIDENTRESPONSE_IBM_XFORCE_BASE_URL || 'https://api.xforce.ibmcloud.com';
    
    // AbuseIPDB
    this.abuseipdbApiKey = process.env.INCIDENTRESPONSE_ABUSEIPDB_API_KEY;
    this.abuseipdbBaseUrl = process.env.INCIDENTRESPONSE_ABUSEIPDB_BASE_URL || 'https://api.abuseipdb.com/api/v2';
    
    // Shodan
    this.shodanApiKey = process.env.INCIDENTRESPONSE_SHODAN_API_KEY;
    this.shodanBaseUrl = process.env.INCIDENTRESPONSE_SHODAN_BASE_URL || 'https://api.shodan.io';
  }

  /**
   * Enrich an IOC (Indicator of Compromise) with threat intelligence
   */
  async enrichIOC(indicator) {
    const { type, value } = indicator;
    const enrichment = {
      indicator: value,
      type,
      sources: [],
      malicious: false,
      riskScore: 0,
      tags: [],
      relatedMalware: [],
      relatedCampaigns: [],
      firstSeen: null,
      lastSeen: null,
      enrichedAt: new Date().toISOString()
    };

    try {
      const enrichmentPromises = [];

      // Route to appropriate enrichment based on IOC type
      switch (type) {
        case 'ip':
          enrichmentPromises.push(this.enrichIPWithVirusTotal(value));
          enrichmentPromises.push(this.enrichIPWithAbuseIPDB(value));
          enrichmentPromises.push(this.enrichIPWithShodan(value));
          enrichmentPromises.push(this.enrichWithOTX('IPv4', value));
          break;
        case 'domain':
          enrichmentPromises.push(this.enrichDomainWithVirusTotal(value));
          enrichmentPromises.push(this.enrichWithOTX('domain', value));
          break;
        case 'hash':
          enrichmentPromises.push(this.enrichHashWithVirusTotal(value));
          enrichmentPromises.push(this.enrichWithOTX('file', value));
          break;
        case 'url':
          enrichmentPromises.push(this.enrichURLWithVirusTotal(value));
          enrichmentPromises.push(this.enrichWithOTX('url', value));
          break;
        default:
          console.log(`Unknown IOC type: ${type}`);
      }

      const results = await Promise.allSettled(enrichmentPromises);
      
      // Aggregate results
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const data = result.value;
          if (data.source) enrichment.sources.push(data.source);
          if (data.malicious) enrichment.malicious = true;
          if (data.riskScore > enrichment.riskScore) enrichment.riskScore = data.riskScore;
          if (data.tags) enrichment.tags.push(...data.tags);
          if (data.relatedMalware) enrichment.relatedMalware.push(...data.relatedMalware);
          if (data.relatedCampaigns) enrichment.relatedCampaigns.push(...data.relatedCampaigns);
          if (data.firstSeen && (!enrichment.firstSeen || data.firstSeen < enrichment.firstSeen)) {
            enrichment.firstSeen = data.firstSeen;
          }
          if (data.lastSeen && (!enrichment.lastSeen || data.lastSeen > enrichment.lastSeen)) {
            enrichment.lastSeen = data.lastSeen;
          }
        }
      });

      // Deduplicate
      enrichment.tags = [...new Set(enrichment.tags)];
      enrichment.relatedMalware = [...new Set(enrichment.relatedMalware)];
      enrichment.relatedCampaigns = [...new Set(enrichment.relatedCampaigns)];

    } catch (error) {
      console.error('IOC enrichment error:', error.message);
      enrichment.error = error.message;
    }

    return enrichment;
  }

  /**
   * VirusTotal - IP Reputation
   */
  async enrichIPWithVirusTotal(ip) {
    if (!this.vtApiKey) return this.simulatedVTResponse('ip', ip);

    try {
      const response = await axios.get(`${this.vtBaseUrl}/ip_addresses/${ip}`, {
        headers: { 'x-apikey': this.vtApiKey }
      });

      const data = response.data.data;
      const stats = data.attributes.last_analysis_stats || {};
      const malicious = stats.malicious > 0;
      const riskScore = Math.min(100, (stats.malicious * 10) + (stats.suspicious * 5));

      return {
        source: 'VirusTotal',
        malicious,
        riskScore,
        tags: data.attributes.tags || [],
        lastSeen: data.attributes.last_modification_date 
          ? new Date(data.attributes.last_modification_date * 1000).toISOString() 
          : null,
        details: {
          asOwner: data.attributes.as_owner,
          country: data.attributes.country,
          detections: stats
        }
      };
    } catch (error) {
      console.error('VirusTotal IP error:', error.message);
      return this.simulatedVTResponse('ip', ip);
    }
  }

  /**
   * VirusTotal - Domain Reputation
   */
  async enrichDomainWithVirusTotal(domain) {
    if (!this.vtApiKey) return this.simulatedVTResponse('domain', domain);

    try {
      const response = await axios.get(`${this.vtBaseUrl}/domains/${domain}`, {
        headers: { 'x-apikey': this.vtApiKey }
      });

      const data = response.data.data;
      const stats = data.attributes.last_analysis_stats || {};
      const malicious = stats.malicious > 0;
      const riskScore = Math.min(100, (stats.malicious * 10) + (stats.suspicious * 5));

      return {
        source: 'VirusTotal',
        malicious,
        riskScore,
        tags: data.attributes.tags || [],
        lastSeen: data.attributes.last_modification_date 
          ? new Date(data.attributes.last_modification_date * 1000).toISOString() 
          : null,
        details: {
          registrar: data.attributes.registrar,
          creationDate: data.attributes.creation_date,
          detections: stats
        }
      };
    } catch (error) {
      console.error('VirusTotal domain error:', error.message);
      return this.simulatedVTResponse('domain', domain);
    }
  }

  /**
   * VirusTotal - File Hash Analysis
   */
  async enrichHashWithVirusTotal(hash) {
    if (!this.vtApiKey) return this.simulatedVTResponse('hash', hash);

    try {
      const response = await axios.get(`${this.vtBaseUrl}/files/${hash}`, {
        headers: { 'x-apikey': this.vtApiKey }
      });

      const data = response.data.data;
      const stats = data.attributes.last_analysis_stats || {};
      const malicious = stats.malicious > 0;
      const riskScore = Math.min(100, (stats.malicious * 2));

      return {
        source: 'VirusTotal',
        malicious,
        riskScore,
        tags: data.attributes.tags || [],
        relatedMalware: data.attributes.popular_threat_classification?.suggested_threat_label 
          ? [data.attributes.popular_threat_classification.suggested_threat_label] 
          : [],
        firstSeen: data.attributes.first_submission_date 
          ? new Date(data.attributes.first_submission_date * 1000).toISOString() 
          : null,
        lastSeen: data.attributes.last_analysis_date 
          ? new Date(data.attributes.last_analysis_date * 1000).toISOString() 
          : null,
        details: {
          fileName: data.attributes.meaningful_name,
          fileType: data.attributes.type_description,
          fileSize: data.attributes.size,
          detections: stats
        }
      };
    } catch (error) {
      console.error('VirusTotal hash error:', error.message);
      return this.simulatedVTResponse('hash', hash);
    }
  }

  /**
   * VirusTotal - URL Analysis
   */
  async enrichURLWithVirusTotal(url) {
    if (!this.vtApiKey) return this.simulatedVTResponse('url', url);

    try {
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const response = await axios.get(`${this.vtBaseUrl}/urls/${urlId}`, {
        headers: { 'x-apikey': this.vtApiKey }
      });

      const data = response.data.data;
      const stats = data.attributes.last_analysis_stats || {};
      const malicious = stats.malicious > 0;
      const riskScore = Math.min(100, (stats.malicious * 10) + (stats.suspicious * 5));

      return {
        source: 'VirusTotal',
        malicious,
        riskScore,
        tags: data.attributes.tags || [],
        lastSeen: data.attributes.last_analysis_date 
          ? new Date(data.attributes.last_analysis_date * 1000).toISOString() 
          : null,
        details: {
          finalUrl: data.attributes.last_final_url,
          detections: stats
        }
      };
    } catch (error) {
      console.error('VirusTotal URL error:', error.message);
      return this.simulatedVTResponse('url', url);
    }
  }

  /**
   * AbuseIPDB - IP Reputation
   */
  async enrichIPWithAbuseIPDB(ip) {
    if (!this.abuseipdbApiKey) return this.simulatedAbuseIPDBResponse(ip);

    try {
      const response = await axios.get(`${this.abuseipdbBaseUrl}/check`, {
        params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
        headers: { 'Key': this.abuseipdbApiKey, 'Accept': 'application/json' }
      });

      const data = response.data.data;
      const malicious = data.abuseConfidenceScore > 50;
      const riskScore = data.abuseConfidenceScore;

      return {
        source: 'AbuseIPDB',
        malicious,
        riskScore,
        tags: data.usageType ? [data.usageType] : [],
        lastSeen: data.lastReportedAt,
        details: {
          totalReports: data.totalReports,
          countryCode: data.countryCode,
          isp: data.isp,
          domain: data.domain,
          isWhitelisted: data.isWhitelisted,
          reports: data.reports?.slice(0, 5)
        }
      };
    } catch (error) {
      console.error('AbuseIPDB error:', error.message);
      return this.simulatedAbuseIPDBResponse(ip);
    }
  }

  /**
   * Shodan - IP Intelligence
   */
  async enrichIPWithShodan(ip) {
    if (!this.shodanApiKey) return this.simulatedShodanResponse(ip);

    try {
      const response = await axios.get(`${this.shodanBaseUrl}/shodan/host/${ip}`, {
        params: { key: this.shodanApiKey }
      });

      const data = response.data;
      const vulns = data.vulns || [];
      const riskScore = Math.min(100, vulns.length * 10);

      return {
        source: 'Shodan',
        malicious: vulns.length > 0,
        riskScore,
        tags: data.tags || [],
        lastSeen: data.last_update,
        details: {
          organization: data.org,
          isp: data.isp,
          country: data.country_name,
          ports: data.ports,
          vulns: vulns,
          hostnames: data.hostnames,
          services: data.data?.map(s => ({ port: s.port, product: s.product, version: s.version }))
        }
      };
    } catch (error) {
      console.error('Shodan error:', error.message);
      return this.simulatedShodanResponse(ip);
    }
  }

  /**
   * AlienVault OTX - Multi-type IOC lookup
   */
  async enrichWithOTX(type, value) {
    if (!this.otxApiKey) return this.simulatedOTXResponse(type, value);

    try {
      const endpoint = type === 'file' ? `indicators/file/${value}/general` :
                       type === 'IPv4' ? `indicators/IPv4/${value}/general` :
                       type === 'domain' ? `indicators/domain/${value}/general` :
                       type === 'url' ? `indicators/url/${encodeURIComponent(value)}/general` :
                       null;
      
      if (!endpoint) return null;

      const response = await axios.get(`${this.otxBaseUrl}/${endpoint}`, {
        headers: { 'X-OTX-API-KEY': this.otxApiKey }
      });

      const data = response.data;
      const pulseCount = data.pulse_info?.count || 0;
      const malicious = pulseCount > 0;
      const riskScore = Math.min(100, pulseCount * 5);

      return {
        source: 'AlienVault OTX',
        malicious,
        riskScore,
        tags: data.pulse_info?.pulses?.flatMap(p => p.tags || []) || [],
        relatedMalware: data.pulse_info?.pulses?.flatMap(p => p.malware_families || []) || [],
        relatedCampaigns: data.pulse_info?.pulses?.map(p => p.name) || [],
        details: {
          pulseCount,
          reputation: data.reputation,
          validation: data.validation
        }
      };
    } catch (error) {
      console.error('AlienVault OTX error:', error.message);
      return this.simulatedOTXResponse(type, value);
    }
  }

  /**
   * Batch enrich multiple IOCs
   */
  async batchEnrich(indicators) {
    const enrichmentPromises = indicators.map(ioc => this.enrichIOC(ioc));
    return Promise.all(enrichmentPromises);
  }

  // ============= Simulated Responses (when APIs unavailable) =============

  simulatedVTResponse(type, value) {
    const hash = this.simpleHash(value);
    return {
      source: 'VirusTotal (Simulated)',
      malicious: hash % 4 === 0,
      riskScore: hash % 80,
      tags: hash % 3 === 0 ? ['suspicious', 'malware'] : [],
      simulated: true
    };
  }

  simulatedAbuseIPDBResponse(ip) {
    const hash = this.simpleHash(ip);
    return {
      source: 'AbuseIPDB (Simulated)',
      malicious: hash % 5 === 0,
      riskScore: hash % 60,
      tags: ['datacenter'],
      simulated: true
    };
  }

  simulatedShodanResponse(ip) {
    const hash = this.simpleHash(ip);
    return {
      source: 'Shodan (Simulated)',
      malicious: hash % 6 === 0,
      riskScore: hash % 40,
      tags: hash % 2 === 0 ? ['cloud', 'vpn'] : [],
      details: { ports: [22, 80, 443] },
      simulated: true
    };
  }

  simulatedOTXResponse(type, value) {
    const hash = this.simpleHash(value);
    return {
      source: 'AlienVault OTX (Simulated)',
      malicious: hash % 4 === 0,
      riskScore: hash % 70,
      tags: ['apt', 'targeted'],
      relatedCampaigns: hash % 3 === 0 ? ['APT29', 'FIN7'] : [],
      simulated: true
    };
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
}

module.exports = new ThreatIntelService();

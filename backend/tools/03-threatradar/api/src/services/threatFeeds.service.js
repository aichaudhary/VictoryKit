const axios = require('axios');

class ThreatFeedsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ============================================
  // FREE FEEDS (No API Key Required)
  // ============================================

  /**
   * URLhaus - Malware URL Database
   * https://urlhaus.abuse.ch/
   */
  async getURLhausRecent() {
    try {
      // Use public JSON download endpoint (no auth required)
      const response = await axios.get('https://urlhaus.abuse.ch/downloads/json_recent/', {
        timeout: 15000
      });
      // Convert object format to array
      const data = Object.values(response.data).flat().slice(0, 50).map(item => ({
        url: item.url,
        status: item.url_status,
        threat: item.threat,
        tags: item.tags,
        dateAdded: item.dateadded,
        reporter: item.reporter
      }));
      return {
        source: 'URLhaus',
        type: 'malware_urls',
        count: Object.keys(response.data).length,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('URLhaus fetch error:', error.message);
      return { source: 'URLhaus', error: error.message, data: [] };
    }
  }

  /**
   * ThreatFox - IOC Database
   * https://threatfox.abuse.ch/
   */
  async getThreatFoxRecent() {
    try {
      // Use public download endpoint (hostfile format)
      const response = await axios.get('https://threatfox.abuse.ch/downloads/hostfile/', {
        timeout: 15000
      });
      // Parse hostfile format to extract domains
      const lines = response.data.split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('127.0.0.1'))
        .slice(0, 50);
      const data = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return { domain: parts[1], type: 'malicious_domain' };
      });
      return {
        source: 'ThreatFox',
        type: 'iocs',
        count: lines.length,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('ThreatFox fetch error:', error.message);
      return { source: 'ThreatFox', error: error.message, data: [] };
    }
  }

  /**
   * Feodo Tracker - Botnet C2 Servers
   * https://feodotracker.abuse.ch/
   */
  async getFeodoTrackerC2() {
    try {
      const response = await axios.get('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json', {
        timeout: 10000
      });
      return {
        source: 'Feodo Tracker',
        type: 'botnet_c2',
        count: response.data?.length || 0,
        data: response.data?.slice(0, 50) || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Feodo Tracker fetch error:', error.message);
      return { source: 'Feodo Tracker', error: error.message, data: [] };
    }
  }

  /**
   * SSL Blacklist - Malicious SSL Certificates
   * https://sslbl.abuse.ch/
   */
  async getSSLBlacklist() {
    try {
      // Use CSV endpoint and parse it
      const response = await axios.get('https://sslbl.abuse.ch/blacklist/sslipblacklist.csv', {
        timeout: 10000
      });
      // Parse CSV to JSON
      const lines = response.data.split('\n').filter(l => l && !l.startsWith('#'));
      const data = lines.slice(0, 50).map(line => {
        const [timestamp, ip, port] = line.split(',');
        return { timestamp, ip, port };
      });
      return {
        source: 'SSL Blacklist',
        type: 'malicious_ssl',
        count: lines.length,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('SSL Blacklist fetch error:', error.message);
      return { source: 'SSL Blacklist', error: error.message, data: [] };
    }
  }

  /**
   * MalwareBazaar - Recent Malware Samples
   * https://bazaar.abuse.ch/
   */
  async getMalwareBazaarRecent() {
    try {
      // Use public export endpoint for SHA256 hashes
      const response = await axios.get('https://bazaar.abuse.ch/export/txt/sha256/recent/', {
        timeout: 15000
      });
      // Parse text format to extract hashes
      const lines = response.data.split('\n')
        .filter(l => l && !l.startsWith('#') && l.length === 64)
        .slice(0, 50);
      const data = lines.map(hash => ({
        sha256: hash.trim(),
        type: 'malware_sample',
        source: 'MalwareBazaar'
      }));
      return {
        source: 'MalwareBazaar',
        type: 'malware_samples',
        count: lines.length,
        data: data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MalwareBazaar fetch error:', error.message);
      return { source: 'MalwareBazaar', error: error.message, data: [] };
    }
  }

  // ============================================
  // PAID/FREEMIUM FEEDS (API Key Required)
  // ============================================

  /**
   * VirusTotal - File/URL/IP Analysis
   * https://www.virustotal.com/
   */
  async virusTotalLookup(indicator, type = 'ip') {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey || apiKey === 'YOUR_VIRUSTOTAL_API_KEY') {
      return { source: 'VirusTotal', error: 'API key not configured', data: null };
    }
    try {
      const endpoints = {
        ip: `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`,
        domain: `https://www.virustotal.com/api/v3/domains/${indicator}`,
        hash: `https://www.virustotal.com/api/v3/files/${indicator}`
      };
      const response = await axios.get(endpoints[type], {
        headers: { 'x-apikey': apiKey },
        timeout: 15000
      });
      return {
        source: 'VirusTotal',
        type: type,
        indicator: indicator,
        data: response.data.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'VirusTotal', error: error.message, data: null };
    }
  }

  /**
   * AbuseIPDB - IP Reputation
   * https://www.abuseipdb.com/
   */
  async abuseIPDBCheck(ip) {
    const apiKey = process.env.ABUSEIPDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_ABUSEIPDB_API_KEY') {
      return { source: 'AbuseIPDB', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
        headers: { 
          'Key': apiKey,
          'Accept': 'application/json'
        },
        params: {
          ipAddress: ip,
          maxAgeInDays: 90,
          verbose: true
        },
        timeout: 10000
      });
      return {
        source: 'AbuseIPDB',
        type: 'ip_reputation',
        indicator: ip,
        data: response.data.data,
        abuseScore: response.data.data?.abuseConfidenceScore || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'AbuseIPDB', error: error.message, data: null };
    }
  }

  /**
   * Shodan - Internet Device Search
   * https://www.shodan.io/
   */
  async shodanHostLookup(ip) {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey || apiKey === 'YOUR_SHODAN_API_KEY') {
      return { source: 'Shodan', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}`, {
        params: { key: apiKey },
        timeout: 15000
      });
      return {
        source: 'Shodan',
        type: 'host_info',
        indicator: ip,
        data: response.data,
        ports: response.data.ports || [],
        vulns: response.data.vulns || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'Shodan', error: error.message, data: null };
    }
  }

  /**
   * AlienVault OTX - Threat Intelligence Pulses
   * https://otx.alienvault.com/
   */
  async alienVaultPulses(indicator, type = 'IPv4') {
    const apiKey = process.env.ALIENVAULT_API_KEY;
    if (!apiKey || apiKey === 'YOUR_ALIENVAULT_API_KEY') {
      return { source: 'AlienVault OTX', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/${type}/${indicator}/general`,
        {
          headers: { 'X-OTX-API-KEY': apiKey },
          timeout: 15000
        }
      );
      return {
        source: 'AlienVault OTX',
        type: 'threat_pulses',
        indicator: indicator,
        data: response.data,
        pulseCount: response.data.pulse_info?.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'AlienVault OTX', error: error.message, data: null };
    }
  }

  /**
   * GreyNoise - Internet Scanner Detection
   * https://www.greynoise.io/
   */
  async greyNoiseCheck(ip) {
    const apiKey = process.env.GREYNOISE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GREYNOISE_API_KEY') {
      return { source: 'GreyNoise', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.get(`https://api.greynoise.io/v3/community/${ip}`, {
        headers: { 'key': apiKey },
        timeout: 10000
      });
      return {
        source: 'GreyNoise',
        type: 'scanner_detection',
        indicator: ip,
        data: response.data,
        noise: response.data.noise || false,
        riot: response.data.riot || false,
        classification: response.data.classification,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'GreyNoise', error: error.message, data: null };
    }
  }

  /**
   * CrowdStrike Falcon - EDR/Threat Intel
   * https://www.crowdstrike.com/
   */
  async crowdStrikeIndicator(indicator) {
    const clientId = process.env.CROWDSTRIKE_CLIENT_ID;
    const clientSecret = process.env.CROWDSTRIKE_CLIENT_SECRET;
    if (!clientId || clientId === 'YOUR_CROWDSTRIKE_CLIENT_ID') {
      return { source: 'CrowdStrike', error: 'API credentials not configured', data: null };
    }
    try {
      // First get OAuth token
      const tokenResponse = await axios.post('https://api.crowdstrike.com/oauth2/token', 
        `client_id=${clientId}&client_secret=${clientSecret}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      const token = tokenResponse.data.access_token;
      
      // Then query indicator
      const response = await axios.get('https://api.crowdstrike.com/intel/combined/indicators/v1', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { filter: `indicator:'${indicator}'` },
        timeout: 15000
      });
      return {
        source: 'CrowdStrike',
        type: 'threat_intel',
        indicator: indicator,
        data: response.data.resources,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'CrowdStrike', error: error.message, data: null };
    }
  }

  /**
   * Recorded Future - Threat Intelligence
   * https://www.recordedfuture.com/
   */
  async recordedFutureLookup(indicator) {
    const apiKey = process.env.RECORDED_FUTURE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_RECORDED_FUTURE_API_KEY') {
      return { source: 'Recorded Future', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.get(`https://api.recordedfuture.com/v2/ip/${indicator}`, {
        headers: { 'X-RFToken': apiKey },
        timeout: 15000
      });
      return {
        source: 'Recorded Future',
        type: 'threat_intel',
        indicator: indicator,
        data: response.data.data,
        riskScore: response.data.data?.risk?.score || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'Recorded Future', error: error.message, data: null };
    }
  }

  /**
   * Mandiant/FireEye - Threat Intelligence
   * https://www.mandiant.com/
   */
  async mandiantIndicator(indicator) {
    const apiKey = process.env.MANDIANT_API_KEY;
    const secretKey = process.env.MANDIANT_SECRET_KEY;
    if (!apiKey || apiKey === 'YOUR_MANDIANT_API_KEY') {
      return { source: 'Mandiant', error: 'API key not configured', data: null };
    }
    try {
      // Mandiant requires HMAC authentication
      const response = await axios.get(`https://api.intelligence.mandiant.com/v4/indicator/${indicator}`, {
        headers: { 
          'X-App-Name': apiKey,
          'Authorization': `Bearer ${secretKey}`
        },
        timeout: 15000
      });
      return {
        source: 'Mandiant',
        type: 'threat_intel',
        indicator: indicator,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'Mandiant', error: error.message, data: null };
    }
  }

  /**
   * IBM X-Force Exchange - Threat Intelligence
   * https://exchange.xforce.ibmcloud.com/
   */
  async ibmXForceCheck(indicator, type = 'ip') {
    const apiKey = process.env.IBM_XFORCE_API_KEY;
    const apiPassword = process.env.IBM_XFORCE_API_PASSWORD;
    if (!apiKey || apiKey === 'YOUR_IBM_XFORCE_API_KEY') {
      return { source: 'IBM X-Force', error: 'API key not configured', data: null };
    }
    try {
      const auth = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');
      const endpoints = {
        ip: `https://api.xforce.ibmcloud.com/ipr/${indicator}`,
        url: `https://api.xforce.ibmcloud.com/url/${indicator}`,
        hash: `https://api.xforce.ibmcloud.com/malware/${indicator}`
      };
      const response = await axios.get(endpoints[type], {
        headers: { 'Authorization': `Basic ${auth}` },
        timeout: 15000
      });
      return {
        source: 'IBM X-Force',
        type: type,
        indicator: indicator,
        data: response.data,
        riskScore: response.data.score || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'IBM X-Force', error: error.message, data: null };
    }
  }

  /**
   * Palo Alto AutoFocus - Threat Intelligence
   * https://www.paloaltonetworks.com/cortex/autofocus
   */
  async paloAltoAutoFocus(indicator, type = 'ip') {
    const apiKey = process.env.PALO_ALTO_API_KEY;
    if (!apiKey || apiKey === 'YOUR_PALO_ALTO_API_KEY') {
      return { source: 'Palo Alto AutoFocus', error: 'API key not configured', data: null };
    }
    try {
      const response = await axios.post('https://autofocus.paloaltonetworks.com/api/v1.0/tic', {
        indicatorType: type,
        indicatorValue: indicator,
        includeTags: true
      }, {
        headers: { 'apiKey': apiKey },
        timeout: 15000
      });
      return {
        source: 'Palo Alto AutoFocus',
        type: type,
        indicator: indicator,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { source: 'Palo Alto AutoFocus', error: error.message, data: null };
    }
  }

  // ============================================
  // AGGREGATED FUNCTIONS
  // ============================================

  /**
   * Get all free threat feeds (no API key required)
   */
  async getAllFreeFeeds() {
    const [urlhaus, threatfox, feodo, sslbl, malwarebazaar] = await Promise.all([
      this.getURLhausRecent(),
      this.getThreatFoxRecent(),
      this.getFeodoTrackerC2(),
      this.getSSLBlacklist(),
      this.getMalwareBazaarRecent()
    ]);

    const totalThreats = 
      (urlhaus.count || 0) + 
      (threatfox.count || 0) + 
      (feodo.count || 0) + 
      (sslbl.count || 0) + 
      (malwarebazaar.count || 0);

    return {
      timestamp: new Date().toISOString(),
      totalThreats,
      feeds: {
        urlhaus,
        threatfox,
        feodo,
        sslbl,
        malwarebazaar
      },
      summary: {
        malwareUrls: urlhaus.count || 0,
        iocs: threatfox.count || 0,
        botnetC2: feodo.count || 0,
        maliciousSSL: sslbl.count || 0,
        malwareSamples: malwarebazaar.count || 0
      }
    };
  }

  /**
   * Comprehensive indicator lookup across all sources
   */
  async comprehensiveIndicatorLookup(indicator, type = 'ip') {
    const results = {
      indicator,
      type,
      timestamp: new Date().toISOString(),
      sources: {}
    };

    // Run all lookups in parallel
    const lookups = await Promise.allSettled([
      this.virusTotalLookup(indicator, type),
      this.abuseIPDBCheck(indicator),
      this.shodanHostLookup(indicator),
      this.alienVaultPulses(indicator, type === 'ip' ? 'IPv4' : type),
      this.greyNoiseCheck(indicator),
      this.ibmXForceCheck(indicator, type)
    ]);

    const sources = ['virustotal', 'abuseipdb', 'shodan', 'alienvault', 'greynoise', 'ibmxforce'];
    lookups.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.sources[sources[index]] = result.value;
      } else {
        results.sources[sources[index]] = { error: result.reason?.message };
      }
    });

    // Calculate aggregate risk score
    let riskScore = 0;
    let scoreSources = 0;
    
    if (results.sources.abuseipdb?.abuseScore) {
      riskScore += results.sources.abuseipdb.abuseScore;
      scoreSources++;
    }
    if (results.sources.ibmxforce?.riskScore) {
      riskScore += results.sources.ibmxforce.riskScore;
      scoreSources++;
    }
    
    results.aggregateRiskScore = scoreSources > 0 ? Math.round(riskScore / scoreSources) : 0;
    results.threatLevel = 
      results.aggregateRiskScore >= 80 ? 'CRITICAL' :
      results.aggregateRiskScore >= 60 ? 'HIGH' :
      results.aggregateRiskScore >= 40 ? 'MEDIUM' :
      results.aggregateRiskScore >= 20 ? 'LOW' : 'CLEAN';

    return results;
  }

  /**
   * Get real-time threat statistics
   */
  async getRealTimeStats() {
    const feeds = await this.getAllFreeFeeds();
    
    // Parse threat data for statistics
    const stats = {
      timestamp: new Date().toISOString(),
      totalActiveThreats: feeds.totalThreats,
      threatsByType: {
        malwareUrls: feeds.summary.malwareUrls,
        commandAndControl: feeds.summary.botnetC2,
        iocs: feeds.summary.iocs,
        maliciousSSL: feeds.summary.maliciousSSL,
        malwareSamples: feeds.summary.malwareSamples
      },
      recentThreats: [],
      topThreatCountries: {},
      threatTrend: 'stable'
    };

    // Extract recent threats from URLhaus
    if (feeds.feeds.urlhaus.data) {
      stats.recentThreats = feeds.feeds.urlhaus.data.slice(0, 10).map(t => ({
        id: t.id,
        url: t.url,
        threat: t.threat || 'malware_distribution',
        dateAdded: t.date_added,
        status: t.url_status
      }));
    }

    // Extract C2 servers from Feodo
    if (feeds.feeds.feodo.data) {
      feeds.feeds.feodo.data.forEach(c2 => {
        if (c2.country) {
          stats.topThreatCountries[c2.country] = (stats.topThreatCountries[c2.country] || 0) + 1;
        }
      });
    }

    return stats;
  }
}

module.exports = new ThreatFeedsService();

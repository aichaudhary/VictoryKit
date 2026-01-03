/**
 * Threat Intelligence Service - Tool 18 ThreatModel
 * Integrates with external threat intelligence sources
 */

const axios = require('axios');

class ThreatIntelService {
  constructor() {
    this.nvdApiKey = process.env.NVD_API_KEY;
    this.virustotalApiKey = process.env.VIRUSTOTAL_API_KEY;
    this.otxApiKey = process.env.OTX_API_KEY;
    this.shodanApiKey = process.env.SHODAN_API_KEY;
    
    this.cache = new Map();
    this.cacheTTL = 3600000; // 1 hour
  }

  // ============ CVE/Vulnerability Lookup ============

  // Search NVD for CVEs
  async searchCVEs(query, options = {}) {
    const cacheKey = `cve:${query}:${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        keywordSearch: query,
        resultsPerPage: options.limit || 20,
        ...options
      });

      const headers = this.nvdApiKey ? { 'apiKey': this.nvdApiKey } : {};
      
      const response = await axios.get(
        `${process.env.NVD_API_URL || 'https://services.nvd.nist.gov/rest/json/cves/2.0'}?${params}`,
        { headers, timeout: 10000 }
      );

      const result = {
        success: true,
        totalResults: response.data.totalResults,
        vulnerabilities: (response.data.vulnerabilities || []).map(v => this.formatCVE(v)),
        timestamp: new Date().toISOString()
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('NVD API error:', error.message);
      return this.fallbackCVESearch(query);
    }
  }

  // Get CVE details by ID
  async getCVEById(cveId) {
    const cacheKey = `cve:id:${cveId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const headers = this.nvdApiKey ? { 'apiKey': this.nvdApiKey } : {};
      
      const response = await axios.get(
        `${process.env.NVD_API_URL || 'https://services.nvd.nist.gov/rest/json/cves/2.0'}?cveId=${cveId}`,
        { headers, timeout: 10000 }
      );

      if (response.data.vulnerabilities?.length > 0) {
        const result = {
          success: true,
          cve: this.formatCVE(response.data.vulnerabilities[0]),
          timestamp: new Date().toISOString()
        };
        this.setCache(cacheKey, result);
        return result;
      }

      return { success: false, error: 'CVE not found' };
    } catch (error) {
      console.error('CVE lookup error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Format CVE data
  formatCVE(vuln) {
    const cve = vuln.cve || vuln;
    return {
      id: cve.id,
      sourceIdentifier: cve.sourceIdentifier,
      published: cve.published,
      lastModified: cve.lastModified,
      description: cve.descriptions?.find(d => d.lang === 'en')?.value || '',
      cvss: this.extractCVSS(cve.metrics),
      weaknesses: cve.weaknesses?.map(w => ({
        type: w.type,
        cweId: w.description?.[0]?.value
      })) || [],
      references: cve.references?.map(r => ({
        url: r.url,
        source: r.source,
        tags: r.tags
      })) || []
    };
  }

  // Extract CVSS score
  extractCVSS(metrics) {
    if (!metrics) return null;

    const cvss31 = metrics.cvssMetricV31?.[0];
    const cvss30 = metrics.cvssMetricV30?.[0];
    const cvss2 = metrics.cvssMetricV2?.[0];

    const primary = cvss31 || cvss30 || cvss2;
    if (!primary) return null;

    return {
      version: cvss31 ? '3.1' : cvss30 ? '3.0' : '2.0',
      baseScore: primary.cvssData?.baseScore,
      baseSeverity: primary.cvssData?.baseSeverity,
      vectorString: primary.cvssData?.vectorString,
      exploitabilityScore: primary.exploitabilityScore,
      impactScore: primary.impactScore
    };
  }

  // ============ MITRE ATT&CK ============

  // Get MITRE ATT&CK techniques
  async getMITRETechniques(category = null) {
    const cacheKey = `mitre:techniques:${category || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use MITRE ATT&CK STIX data
      const response = await axios.get(
        'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
        { timeout: 15000 }
      );

      const techniques = response.data.objects
        .filter(obj => obj.type === 'attack-pattern')
        .map(tech => ({
          id: tech.external_references?.find(r => r.source_name === 'mitre-attack')?.external_id,
          name: tech.name,
          description: tech.description,
          tactics: tech.kill_chain_phases?.map(p => p.phase_name) || [],
          platforms: tech.x_mitre_platforms || [],
          dataSources: tech.x_mitre_data_sources || [],
          detection: tech.x_mitre_detection
        }))
        .filter(t => t.id && (!category || t.tactics.includes(category)));

      const result = {
        success: true,
        techniques,
        totalCount: techniques.length,
        timestamp: new Date().toISOString()
      };

      this.setCache(cacheKey, result, 86400000); // 24 hour cache
      return result;
    } catch (error) {
      console.error('MITRE ATT&CK error:', error.message);
      return this.fallbackMITRETechniques();
    }
  }

  // Map threat to MITRE ATT&CK
  async mapThreatToMITRE(threat) {
    const techniques = await this.getMITRETechniques();
    if (!techniques.success) return { success: false, mappings: [] };

    const keywords = [
      threat.name?.toLowerCase(),
      threat.description?.toLowerCase(),
      threat.category?.toLowerCase()
    ].filter(Boolean).join(' ');

    const mappings = techniques.techniques
      .filter(tech => {
        const techText = `${tech.name} ${tech.description}`.toLowerCase();
        return keywords.split(' ').some(kw => kw.length > 3 && techText.includes(kw));
      })
      .slice(0, 10)
      .map(tech => ({
        techniqueId: tech.id,
        techniqueName: tech.name,
        tactics: tech.tactics,
        relevanceScore: this.calculateRelevance(keywords, `${tech.name} ${tech.description}`)
      }));

    return {
      success: true,
      threatId: threat._id || threat.id,
      threatName: threat.name,
      mappings
    };
  }

  // ============ VirusTotal ============

  // Analyze URL for threats
  async analyzeURL(url) {
    if (!this.virustotalApiKey) {
      return { success: false, error: 'VirusTotal API key not configured' };
    }

    try {
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      
      const response = await axios.get(
        `https://www.virustotal.com/api/v3/urls/${urlId}`,
        {
          headers: { 'x-apikey': this.virustotalApiKey },
          timeout: 10000
        }
      );

      const data = response.data.data;
      return {
        success: true,
        url,
        analysis: {
          lastAnalysis: data.attributes.last_analysis_date,
          stats: data.attributes.last_analysis_stats,
          reputation: data.attributes.reputation,
          categories: data.attributes.categories,
          harmless: data.attributes.last_analysis_stats?.harmless || 0,
          malicious: data.attributes.last_analysis_stats?.malicious || 0,
          suspicious: data.attributes.last_analysis_stats?.suspicious || 0
        },
        threatLevel: this.calculateVTThreatLevel(data.attributes.last_analysis_stats)
      };
    } catch (error) {
      console.error('VirusTotal URL analysis error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Analyze domain
  async analyzeDomain(domain) {
    if (!this.virustotalApiKey) {
      return { success: false, error: 'VirusTotal API key not configured' };
    }

    try {
      const response = await axios.get(
        `https://www.virustotal.com/api/v3/domains/${domain}`,
        {
          headers: { 'x-apikey': this.virustotalApiKey },
          timeout: 10000
        }
      );

      const data = response.data.data;
      return {
        success: true,
        domain,
        analysis: {
          lastAnalysis: data.attributes.last_analysis_date,
          stats: data.attributes.last_analysis_stats,
          reputation: data.attributes.reputation,
          registrar: data.attributes.registrar,
          creationDate: data.attributes.creation_date,
          categories: data.attributes.categories
        },
        threatLevel: this.calculateVTThreatLevel(data.attributes.last_analysis_stats)
      };
    } catch (error) {
      console.error('VirusTotal domain analysis error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Calculate VirusTotal threat level
  calculateVTThreatLevel(stats) {
    if (!stats) return 'unknown';
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    if (total === 0) return 'unknown';
    const threatRatio = (malicious + suspicious * 0.5) / total;

    if (threatRatio > 0.5) return 'critical';
    if (threatRatio > 0.3) return 'high';
    if (threatRatio > 0.1) return 'medium';
    if (threatRatio > 0) return 'low';
    return 'clean';
  }

  // ============ AlienVault OTX ============

  // Search OTX for threat indicators
  async searchOTX(query, type = 'general') {
    if (!this.otxApiKey) {
      return { success: false, error: 'OTX API key not configured' };
    }

    const cacheKey = `otx:${type}:${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/search/pulses?q=${encodeURIComponent(query)}`,
        {
          headers: { 'X-OTX-API-KEY': this.otxApiKey },
          timeout: 10000
        }
      );

      const result = {
        success: true,
        query,
        pulses: response.data.results?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          author: p.author_name,
          created: p.created,
          modified: p.modified,
          tags: p.tags,
          indicatorCount: p.indicator_count,
          adversary: p.adversary,
          industries: p.industries
        })) || [],
        count: response.data.count
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('OTX search error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get OTX indicators for IP
  async getOTXIndicatorsForIP(ip) {
    if (!this.otxApiKey) {
      return { success: false, error: 'OTX API key not configured' };
    }

    try {
      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`,
        {
          headers: { 'X-OTX-API-KEY': this.otxApiKey },
          timeout: 10000
        }
      );

      return {
        success: true,
        ip,
        data: {
          reputation: response.data.reputation,
          country: response.data.country_name,
          city: response.data.city,
          asn: response.data.asn,
          pulseInfo: response.data.pulse_info,
          malwareCount: response.data.pulse_info?.count || 0
        }
      };
    } catch (error) {
      console.error('OTX IP lookup error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ============ Shodan ============

  // Search Shodan for infrastructure threats
  async searchShodan(query) {
    if (!this.shodanApiKey) {
      return { success: false, error: 'Shodan API key not configured' };
    }

    try {
      const response = await axios.get(
        `https://api.shodan.io/shodan/host/search?key=${this.shodanApiKey}&query=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );

      return {
        success: true,
        query,
        matches: response.data.matches?.map(m => ({
          ip: m.ip_str,
          port: m.port,
          hostnames: m.hostnames,
          org: m.org,
          os: m.os,
          product: m.product,
          version: m.version,
          vulns: m.vulns,
          location: {
            country: m.location?.country_name,
            city: m.location?.city
          }
        })) || [],
        total: response.data.total
      };
    } catch (error) {
      console.error('Shodan search error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get Shodan host info
  async getShodanHost(ip) {
    if (!this.shodanApiKey) {
      return { success: false, error: 'Shodan API key not configured' };
    }

    try {
      const response = await axios.get(
        `https://api.shodan.io/shodan/host/${ip}?key=${this.shodanApiKey}`,
        { timeout: 10000 }
      );

      return {
        success: true,
        ip,
        host: {
          hostnames: response.data.hostnames,
          org: response.data.org,
          os: response.data.os,
          ports: response.data.ports,
          vulns: response.data.vulns,
          services: response.data.data?.map(s => ({
            port: s.port,
            transport: s.transport,
            product: s.product,
            version: s.version
          })) || []
        }
      };
    } catch (error) {
      console.error('Shodan host lookup error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ============ OWASP ============

  // Get OWASP Top 10 data
  async getOWASPTop10() {
    const cacheKey = 'owasp:top10';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Static data for OWASP Top 10 2021
    const top10 = [
      { id: 'A01:2021', name: 'Broken Access Control', description: 'Restrictions on authenticated users not properly enforced', cwe: ['CWE-200', 'CWE-284'] },
      { id: 'A02:2021', name: 'Cryptographic Failures', description: 'Failures related to cryptography leading to sensitive data exposure', cwe: ['CWE-259', 'CWE-327'] },
      { id: 'A03:2021', name: 'Injection', description: 'Hostile data sent to an interpreter as command or query', cwe: ['CWE-79', 'CWE-89'] },
      { id: 'A04:2021', name: 'Insecure Design', description: 'Missing or ineffective control design', cwe: ['CWE-209', 'CWE-256'] },
      { id: 'A05:2021', name: 'Security Misconfiguration', description: 'Missing security hardening or misconfigured permissions', cwe: ['CWE-16', 'CWE-611'] },
      { id: 'A06:2021', name: 'Vulnerable and Outdated Components', description: 'Using components with known vulnerabilities', cwe: ['CWE-1104'] },
      { id: 'A07:2021', name: 'Identification and Authentication Failures', description: 'Issues with user identity, authentication, session', cwe: ['CWE-287', 'CWE-384'] },
      { id: 'A08:2021', name: 'Software and Data Integrity Failures', description: 'Code and infrastructure without integrity verification', cwe: ['CWE-829', 'CWE-494'] },
      { id: 'A09:2021', name: 'Security Logging and Monitoring Failures', description: 'Insufficient logging and monitoring', cwe: ['CWE-778', 'CWE-223'] },
      { id: 'A10:2021', name: 'Server-Side Request Forgery', description: 'SSRF flaws when fetching remote resources', cwe: ['CWE-918'] }
    ];

    const result = { success: true, version: '2021', top10 };
    this.setCache(cacheKey, result, 86400000 * 30); // 30 day cache
    return result;
  }

  // Map threat to OWASP category
  mapThreatToOWASP(threat) {
    const mappings = {
      spoofing: ['A07:2021'],
      tampering: ['A03:2021', 'A08:2021'],
      repudiation: ['A09:2021'],
      information_disclosure: ['A01:2021', 'A02:2021'],
      denial_of_service: ['A05:2021'],
      elevation_of_privilege: ['A01:2021', 'A04:2021']
    };

    const category = threat.category || 'other';
    return {
      threatId: threat._id || threat.id,
      threatName: threat.name,
      owaspCategories: mappings[category] || [],
      recommendations: this.getOWASPRecommendations(mappings[category] || [])
    };
  }

  getOWASPRecommendations(categories) {
    const recommendations = {
      'A01:2021': 'Implement proper access control mechanisms',
      'A02:2021': 'Use strong encryption for sensitive data',
      'A03:2021': 'Use parameterized queries and input validation',
      'A04:2021': 'Implement secure design patterns',
      'A05:2021': 'Apply security hardening and least privilege',
      'A06:2021': 'Keep components updated and remove unused ones',
      'A07:2021': 'Implement MFA and secure session management',
      'A08:2021': 'Verify software and data integrity',
      'A09:2021': 'Implement comprehensive logging and monitoring',
      'A10:2021': 'Validate and sanitize all URLs from user input'
    };

    return categories.map(cat => recommendations[cat]).filter(Boolean);
  }

  // ============ Aggregated Intelligence ============

  // Get comprehensive threat intelligence
  async getComprehensiveIntel(indicators) {
    const results = {
      cves: [],
      mitre: [],
      otx: [],
      owasp: null,
      timestamp: new Date().toISOString()
    };

    // Search for CVEs based on technology indicators
    if (indicators.technologies) {
      for (const tech of indicators.technologies.slice(0, 3)) {
        const cves = await this.searchCVEs(tech, { limit: 5 });
        if (cves.success) {
          results.cves.push(...cves.vulnerabilities);
        }
      }
    }

    // Get OWASP mappings
    results.owasp = await this.getOWASPTop10();

    // Get relevant MITRE techniques
    if (indicators.threatTypes) {
      const mitre = await this.getMITRETechniques();
      if (mitre.success) {
        results.mitre = mitre.techniques.slice(0, 20);
      }
    }

    return results;
  }

  // ============ Cache Methods ============

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < (cached.ttl || this.cacheTTL)) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data, ttl = null) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.cacheTTL
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // ============ Fallback Methods ============

  fallbackCVESearch(query) {
    return {
      success: true,
      totalResults: 0,
      vulnerabilities: [],
      simulated: true,
      message: 'NVD API unavailable, showing cached/sample data',
      timestamp: new Date().toISOString()
    };
  }

  fallbackMITRETechniques() {
    return {
      success: true,
      techniques: [
        { id: 'T1190', name: 'Exploit Public-Facing Application', tactics: ['initial-access'] },
        { id: 'T1566', name: 'Phishing', tactics: ['initial-access'] },
        { id: 'T1059', name: 'Command and Scripting Interpreter', tactics: ['execution'] },
        { id: 'T1078', name: 'Valid Accounts', tactics: ['persistence', 'privilege-escalation'] },
        { id: 'T1548', name: 'Abuse Elevation Control Mechanism', tactics: ['privilege-escalation'] }
      ],
      simulated: true
    };
  }

  // Calculate relevance score
  calculateRelevance(keywords, text) {
    const kws = keywords.toLowerCase().split(' ').filter(w => w.length > 3);
    const txt = text.toLowerCase();
    const matches = kws.filter(kw => txt.includes(kw)).length;
    return Math.round((matches / Math.max(kws.length, 1)) * 100);
  }
}

module.exports = new ThreatIntelService();

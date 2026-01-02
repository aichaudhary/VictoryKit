const axios = require('axios');
const CVECache = require('../models/CVECache.model');
const logger = require('../../../../../shared/utils/logger');

class CVEService {
  constructor() {
    this.nvdApiKey = process.env.NVD_API_KEY;
    this.nvdBaseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
    this.epssBaseUrl = process.env.EPSS_API_URL || 'https://api.first.org/data/v1/epss';
    this.kevUrl = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
    
    // Rate limiting
    this.lastNvdRequest = 0;
    this.nvdRateLimit = this.nvdApiKey ? 600 : 6000; // 50 req/30s with key, 5 req/30s without
  }

  /**
   * Look up CVE with caching
   */
  async getCVE(cveId) {
    try {
      // Check cache first
      let cached = await CVECache.findOne({ cveId: cveId.toUpperCase() });
      
      if (cached && cached.expiresAt > new Date()) {
        cached.recordLookup();
        return cached;
      }

      // Fetch from NVD
      const nvdData = await this.fetchFromNVD(cveId);
      if (!nvdData) return null;

      // Enrich with EPSS
      const epssData = await this.fetchEPSS(cveId);

      // Build CVE document
      const cveDoc = this.buildCVEDocument(nvdData, epssData);

      // Upsert to cache
      cached = await CVECache.findOneAndUpdate(
        { cveId: cveId.toUpperCase() },
        cveDoc,
        { upsert: true, new: true }
      );

      // Calculate risk score
      cached.calculateRiskScore();
      await cached.save();

      return cached;
    } catch (error) {
      logger.error(`CVE lookup failed for ${cveId}:`, error.message);
      return null;
    }
  }

  /**
   * Bulk CVE lookup
   */
  async getCVEs(cveIds) {
    const results = [];
    
    for (const cveId of cveIds) {
      const cve = await this.getCVE(cveId);
      if (cve) results.push(cve);
      
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 200));
    }
    
    return results;
  }

  /**
   * Search CVEs by keyword
   */
  async searchCVEs(keyword, limit = 20) {
    try {
      await this.respectRateLimit();
      
      const params = {
        keywordSearch: keyword,
        resultsPerPage: limit
      };

      if (this.nvdApiKey) {
        params.apiKey = this.nvdApiKey;
      }

      const response = await axios.get(this.nvdBaseUrl, {
        params,
        timeout: 30000
      });

      this.lastNvdRequest = Date.now();

      const vulnerabilities = response.data?.vulnerabilities || [];
      const results = [];

      for (const vuln of vulnerabilities) {
        const cveDoc = this.buildCVEDocument(vuln.cve);
        results.push(cveDoc);
      }

      return results;
    } catch (error) {
      logger.error('CVE search failed:', error.message);
      return [];
    }
  }

  /**
   * Fetch from NVD API
   */
  async fetchFromNVD(cveId) {
    try {
      await this.respectRateLimit();

      const params = { cveId };
      if (this.nvdApiKey) {
        params.apiKey = this.nvdApiKey;
      }

      const response = await axios.get(this.nvdBaseUrl, {
        params,
        timeout: 30000
      });

      this.lastNvdRequest = Date.now();

      const vulnerabilities = response.data?.vulnerabilities;
      if (!vulnerabilities || vulnerabilities.length === 0) {
        return null;
      }

      return vulnerabilities[0].cve;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetch EPSS score
   */
  async fetchEPSS(cveId) {
    try {
      const response = await axios.get(this.epssBaseUrl, {
        params: { cve: cveId },
        timeout: 10000
      });

      const data = response.data?.data?.[0];
      if (!data) return null;

      return {
        score: parseFloat(data.epss),
        percentile: parseFloat(data.percentile) * 100,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.warn(`EPSS lookup failed for ${cveId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch CISA KEV list
   */
  async fetchKEV() {
    try {
      const response = await axios.get(this.kevUrl, { timeout: 30000 });
      return response.data?.vulnerabilities || [];
    } catch (error) {
      logger.warn('KEV fetch failed:', error.message);
      return [];
    }
  }

  /**
   * Check if CVE is in KEV
   */
  async isKnownExploited(cveId) {
    try {
      const cached = await CVECache.findOne({ 
        cveId: cveId.toUpperCase(),
        'kev.isKnownExploited': true 
      });
      
      if (cached) return true;

      // Fetch KEV and check
      const kevList = await this.fetchKEV();
      const found = kevList.find(k => k.cveID === cveId.toUpperCase());
      
      if (found) {
        // Update cache
        await CVECache.findOneAndUpdate(
          { cveId: cveId.toUpperCase() },
          {
            'kev.isKnownExploited': true,
            'kev.dateAdded': new Date(found.dateAdded),
            'kev.dueDate': new Date(found.dueDate),
            'kev.requiredAction': found.requiredAction,
            'kev.notes': found.notes
          }
        );
        return true;
      }

      return false;
    } catch (error) {
      logger.warn(`KEV check failed for ${cveId}:`, error.message);
      return false;
    }
  }

  /**
   * Build CVE document from NVD data
   */
  buildCVEDocument(nvdData, epssData = null) {
    const doc = {
      cveId: nvdData.id,
      description: nvdData.descriptions?.find(d => d.lang === 'en')?.value || '',
      published: nvdData.published ? new Date(nvdData.published) : null,
      lastModified: nvdData.lastModified ? new Date(nvdData.lastModified) : null,
      source: 'NVD',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    // CVSS v3.1
    const cvssV3 = nvdData.metrics?.cvssMetricV31?.[0]?.cvssData ||
                   nvdData.metrics?.cvssMetricV30?.[0]?.cvssData;
    if (cvssV3) {
      doc.cvssV3 = {
        score: cvssV3.baseScore,
        severity: cvssV3.baseSeverity,
        vectorString: cvssV3.vectorString,
        attackVector: cvssV3.attackVector,
        attackComplexity: cvssV3.attackComplexity,
        privilegesRequired: cvssV3.privilegesRequired,
        userInteraction: cvssV3.userInteraction,
        scope: cvssV3.scope,
        confidentialityImpact: cvssV3.confidentialityImpact,
        integrityImpact: cvssV3.integrityImpact,
        availabilityImpact: cvssV3.availabilityImpact
      };
    }

    // CVSS v2
    const cvssV2 = nvdData.metrics?.cvssMetricV2?.[0]?.cvssData;
    if (cvssV2) {
      doc.cvssV2 = {
        score: cvssV2.baseScore,
        severity: this.getCvssV2Severity(cvssV2.baseScore),
        vectorString: cvssV2.vectorString
      };
    }

    // EPSS
    if (epssData) {
      doc.epss = epssData;
    }

    // Weaknesses (CWE)
    const weaknesses = [];
    if (nvdData.weaknesses) {
      for (const weakness of nvdData.weaknesses) {
        for (const desc of weakness.description || []) {
          if (desc.lang === 'en' && desc.value?.startsWith('CWE-')) {
            weaknesses.push({
              cweId: desc.value,
              name: desc.value
            });
          }
        }
      }
    }
    doc.weaknesses = weaknesses;

    // References
    const references = [];
    if (nvdData.references) {
      for (const ref of nvdData.references) {
        references.push({
          url: ref.url,
          source: ref.source,
          tags: ref.tags || []
        });
      }
    }
    doc.references = references;

    // Affected configurations (CPE)
    const affectedProducts = [];
    if (nvdData.configurations) {
      for (const config of nvdData.configurations) {
        for (const node of config.nodes || []) {
          for (const match of node.cpeMatch || []) {
            if (match.vulnerable) {
              const cpeParts = this.parseCPE(match.criteria);
              if (cpeParts) {
                affectedProducts.push({
                  ...cpeParts,
                  cpe: match.criteria,
                  versionStartIncluding: match.versionStartIncluding,
                  versionEndIncluding: match.versionEndIncluding,
                  versionStartExcluding: match.versionStartExcluding,
                  versionEndExcluding: match.versionEndExcluding
                });
              }
            }
          }
        }
      }
    }
    doc.affectedProducts = affectedProducts;

    // Check for patch/advisory in references
    const hasPatch = references.some(r => r.tags?.includes('Patch'));
    const hasAdvisory = references.some(r => 
      r.tags?.includes('Vendor Advisory') || r.tags?.includes('Third Party Advisory')
    );
    
    doc.remediation = {
      patchAvailable: hasPatch,
      patchUrl: references.find(r => r.tags?.includes('Patch'))?.url,
      vendorAdvisory: references.find(r => r.tags?.includes('Vendor Advisory'))?.url
    };

    // Categories based on CWE
    doc.categories = this.categorizeByCWE(weaknesses);

    return doc;
  }

  /**
   * Parse CPE string
   */
  parseCPE(cpe) {
    // cpe:2.3:a:vendor:product:version:...
    const parts = cpe.split(':');
    if (parts.length < 5) return null;
    
    return {
      vendor: parts[3] !== '*' ? parts[3] : undefined,
      product: parts[4] !== '*' ? parts[4] : undefined,
      version: parts[5] !== '*' ? parts[5] : undefined
    };
  }

  /**
   * Get CVSS v2 severity
   */
  getCvssV2Severity(score) {
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Categorize by CWE
   */
  categorizeByCWE(weaknesses) {
    const categories = [];
    const cweMapping = {
      'CWE-79': 'Cross-Site Scripting (XSS)',
      'CWE-89': 'SQL Injection',
      'CWE-94': 'Code Injection',
      'CWE-78': 'OS Command Injection',
      'CWE-22': 'Path Traversal',
      'CWE-287': 'Authentication Bypass',
      'CWE-306': 'Missing Authentication',
      'CWE-862': 'Missing Authorization',
      'CWE-918': 'Server-Side Request Forgery (SSRF)',
      'CWE-502': 'Deserialization',
      'CWE-611': 'XML External Entity (XXE)',
      'CWE-352': 'Cross-Site Request Forgery (CSRF)',
      'CWE-434': 'Unrestricted File Upload',
      'CWE-77': 'Command Injection',
      'CWE-120': 'Buffer Overflow',
      'CWE-119': 'Memory Corruption'
    };

    for (const weakness of weaknesses) {
      if (cweMapping[weakness.cweId]) {
        categories.push(cweMapping[weakness.cweId]);
      }
    }

    return [...new Set(categories)];
  }

  /**
   * Rate limiting
   */
  async respectRateLimit() {
    const elapsed = Date.now() - this.lastNvdRequest;
    if (elapsed < this.nvdRateLimit) {
      await new Promise(r => setTimeout(r, this.nvdRateLimit - elapsed));
    }
  }

  /**
   * Find CVEs for a product
   */
  async findCVEsForProduct(vendor, product, version = null) {
    // First check cache
    const cached = await CVECache.findByProduct(vendor, product);
    if (cached.length > 0) {
      return cached;
    }

    // Search NVD
    const keyword = version ? `${vendor} ${product} ${version}` : `${vendor} ${product}`;
    return this.searchCVEs(keyword, 50);
  }

  /**
   * Get trending/critical CVEs
   */
  async getTrendingCVEs(limit = 20) {
    return CVECache.getHighRiskCVEs(limit);
  }

  /**
   * Enrich vulnerabilities with CVE data
   */
  async enrichVulnerabilities(vulnerabilities) {
    const enriched = [];
    
    for (const vuln of vulnerabilities) {
      if (vuln.cve) {
        const cveData = await this.getCVE(vuln.cve);
        if (cveData) {
          enriched.push({
            ...vuln,
            cveData: {
              description: cveData.description,
              cvssV3: cveData.cvssV3,
              epss: cveData.epss,
              kev: cveData.kev,
              exploits: cveData.exploits,
              remediation: cveData.remediation,
              categories: cveData.categories,
              riskScore: cveData.riskScore
            }
          });
        } else {
          enriched.push(vuln);
        }
      } else {
        enriched.push(vuln);
      }
    }
    
    return enriched;
  }
}

module.exports = new CVEService();

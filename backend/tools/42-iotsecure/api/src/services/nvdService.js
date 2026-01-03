/**
 * NVD (National Vulnerability Database) Service
 * Handles CVE data retrieval and synchronization
 */

const axios = require('axios');

class NVDService {
  constructor() {
    this.baseUrl = 'https://services.nvd.nist.gov/rest/json';
    this.apiKey = process.env.NVD_API_KEY;
    this.rateLimitDelay = 6000; // 6 seconds between requests (10 per minute)
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Get CVE by ID
   */
  async getCVE(cveId) {
    try {
      await this.rateLimit();

      const url = `${this.baseUrl}/cves/2.0?cveId=${cveId}`;
      const headers = this.apiKey ? { 'apiKey': this.apiKey } : {};

      const response = await axios.get(url, { headers, timeout: 30000 });

      if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
        return response.data.vulnerabilities[0].cve;
      }

      return null;
    } catch (error) {
      console.error('NVD API Error (getCVE):', error.message);
      throw new Error(`Failed to fetch CVE ${cveId}: ${error.message}`);
    }
  }

  /**
   * Search CVEs with filters
   */
  async searchCVEs(params = {}) {
    try {
      await this.rateLimit();

      const queryParams = new URLSearchParams();

      // Add search parameters
      if (params.keywordSearch) queryParams.append('keywordSearch', params.keywordSearch);
      if (params.keywordExactMatch) queryParams.append('keywordExactMatch', 'true');
      if (params.pubStartDate) queryParams.append('pubStartDate', params.pubStartDate);
      if (params.pubEndDate) queryParams.append('pubEndDate', params.pubEndDate);
      if (params.modStartDate) queryParams.append('modStartDate', params.modStartDate);
      if (params.modEndDate) queryParams.append('modEndDate', params.modEndDate);
      if (params.cvssV3Severity) queryParams.append('cvssV3Severity', params.cvssV3Severity);
      if (params.cvssV3Score) queryParams.append('cvssV3Score', params.cvssV3Score);
      if (params.resultsPerPage) queryParams.append('resultsPerPage', params.resultsPerPage.toString());
      if (params.startIndex) queryParams.append('startIndex', params.startIndex.toString());

      const url = `${this.baseUrl}/cves/2.0?${queryParams.toString()}`;
      const headers = this.apiKey ? { 'apiKey': this.apiKey } : {};

      const response = await axios.get(url, { headers, timeout: 30000 });

      return response.data.vulnerabilities || [];
    } catch (error) {
      console.error('NVD API Error (searchCVEs):', error.message);
      throw new Error(`Failed to search CVEs: ${error.message}`);
    }
  }

  /**
   * Get recent CVEs
   */
  async getRecentCVEs(days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await this.searchCVEs({
        pubStartDate: startDate.toISOString(),
        pubEndDate: endDate.toISOString(),
        resultsPerPage: 100
      });
    } catch (error) {
      console.error('NVD API Error (getRecentCVEs):', error.message);
      throw error;
    }
  }

  /**
   * Get CVEs by severity
   */
  async getCVEsBySeverity(severity, limit = 50) {
    try {
      return await this.searchCVEs({
        cvssV3Severity: severity,
        resultsPerPage: limit
      });
    } catch (error) {
      console.error('NVD API Error (getCVEsBySeverity):', error.message);
      throw error;
    }
  }

  /**
   * Get CVEs affecting specific products
   */
  async getCVEsByProduct(productName, limit = 50) {
    try {
      return await this.searchCVEs({
        keywordSearch: productName,
        keywordExactMatch: true,
        resultsPerPage: limit
      });
    } catch (error) {
      console.error('NVD API Error (getCVEsByProduct):', error.message);
      throw error;
    }
  }

  /**
   * Map NVD CVE data to our schema format
   */
  mapToSchema(nvdData) {
    try {
      const cve = nvdData;
      const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0] || cve.metrics?.cvssMetricV2?.[0];

      let severity = 'UNKNOWN';
      let cvssV3Score = 0;

      if (metrics) {
        if (metrics.cvssData.baseScore) {
          cvssV3Score = metrics.cvssData.baseScore;
          if (cvssV3Score >= 9.0) severity = 'CRITICAL';
          else if (cvssV3Score >= 7.0) severity = 'HIGH';
          else if (cvssV3Score >= 4.0) severity = 'MEDIUM';
          else if (cvssV3Score >= 0.1) severity = 'LOW';
        }
      }

      // Extract affected products
      const affectedProducts = [];
      if (cve.configurations) {
        cve.configurations.forEach(config => {
          if (config.nodes) {
            config.nodes.forEach(node => {
              if (node.cpeMatch) {
                node.cpeMatch.forEach(match => {
                  if (match.cpe23Uri) {
                    const cpeParts = match.cpe23Uri.split(':');
                    if (cpeParts.length >= 5) {
                      affectedProducts.push({
                        vendor: cpeParts[2],
                        product: cpeParts[3],
                        version: cpeParts[4],
                        cpeUri: match.cpe23Uri
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }

      // Extract references
      const references = (cve.references || []).map(ref => ({
        url: ref.url,
        source: ref.source,
        tags: ref.tags || []
      }));

      return {
        cveId: cve.id,
        title: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description available',
        description: cve.descriptions?.find(d => d.lang === 'en')?.value || '',
        severity,
        cvssV3Score,
        cvssV3Vector: metrics?.cvssData?.vectorString || '',
        cvssV2Score: cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore || 0,
        cvssV2Vector: cve.metrics?.cvssMetricV2?.[0]?.cvssData?.vectorString || '',
        publishedDate: cve.published,
        lastModifiedDate: cve.lastModified,
        status: 'open',
        exploitAvailable: cve.exploitabilityScore ? true : false,
        patchAvailable: false, // Would need additional logic to determine
        affectedProducts,
        references,
        source: 'NVD',
        rawData: cve
      };
    } catch (error) {
      console.error('Error mapping NVD data:', error);
      throw new Error(`Failed to map CVE data: ${error.message}`);
    }
  }

  /**
   * Get CPE (Common Platform Enumeration) data
   */
  async getCPE(cpeNameId) {
    try {
      await this.rateLimit();

      const url = `${this.baseUrl}/cpes/2.0?cpeNameId=${cpeNameId}`;
      const headers = this.apiKey ? { 'apiKey': this.apiKey } : {};

      const response = await axios.get(url, { headers, timeout: 30000 });
      return response.data.products || [];
    } catch (error) {
      console.error('NVD API Error (getCPE):', error.message);
      throw new Error(`Failed to fetch CPE ${cpeNameId}: ${error.message}`);
    }
  }

  /**
   * Search CPEs
   */
  async searchCPEs(params = {}) {
    try {
      await this.rateLimit();

      const queryParams = new URLSearchParams();

      if (params.cpeMatchString) queryParams.append('cpeMatchString', params.cpeMatchString);
      if (params.keywordSearch) queryParams.append('keywordSearch', params.keywordSearch);
      if (params.resultsPerPage) queryParams.append('resultsPerPage', params.resultsPerPage.toString());

      const url = `${this.baseUrl}/cpes/2.0?${queryParams.toString()}`;
      const headers = this.apiKey ? { 'apiKey': this.apiKey } : {};

      const response = await axios.get(url, { headers, timeout: 30000 });
      return response.data.products || [];
    } catch (error) {
      console.error('NVD API Error (searchCPEs):', error.message);
      throw new Error(`Failed to search CPEs: ${error.message}`);
    }
  }

  /**
   * Get API key status
   */
  getApiKeyStatus() {
    return {
      configured: !!this.apiKey,
      rateLimitDelay: this.rateLimitDelay,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = new NVDService();
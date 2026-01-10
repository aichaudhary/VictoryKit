/**
 * IoTSentinel External API Integrations
 * Real-world API connections for IoT device discovery and security
 */

const axios = require('axios');

// API Configuration from environment
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const CENSYS_API_ID = process.env.CENSYS_API_ID;
const CENSYS_API_SECRET = process.env.CENSYS_API_SECRET;
const BINARYEDGE_API_KEY = process.env.BINARYEDGE_API_KEY;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const GREYNOISE_API_KEY = process.env.GREYNOISE_API_KEY;
const NVD_API_KEY = process.env.NVD_API_KEY;
const OPENCTI_API_URL = process.env.OPENCTI_API_URL;
const OPENCTI_API_KEY = process.env.OPENCTI_API_KEY;

/**
 * Shodan API - IoT Device Discovery
 * https://developer.shodan.io/api
 */
class ShodanAPI {
  constructor() {
    this.baseURL = 'https://api.shodan.io';
    this.apiKey = SHODAN_API_KEY;
  }

  async searchDevices(query, options = {}) {
    if (!this.apiKey) {
      return { success: false, error: 'SHODAN_API_KEY not configured', demo: true, data: this.getDemoData() };
    }

    try {
      const response = await axios.get(`${this.baseURL}/shodan/host/search`, {
        params: {
          key: this.apiKey,
          query,
          page: options.page || 1,
          minify: options.minify || false
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Shodan API error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getHostInfo(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'SHODAN_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/shodan/host/${ip}`, {
        params: { key: this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async scanNetwork(ips) {
    if (!this.apiKey) {
      return { success: false, error: 'SHODAN_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.post(`${this.baseURL}/shodan/scan`, 
        { ips: Array.isArray(ips) ? ips.join(',') : ips },
        { params: { key: this.apiKey } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getVulnerabilities(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'SHODAN_API_KEY not configured', demo: true };
    }

    try {
      const hostInfo = await this.getHostInfo(ip);
      if (!hostInfo.success) return hostInfo;
      
      const vulns = hostInfo.data.vulns || [];
      return { success: true, data: vulns };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getDemoData() {
    return {
      matches: [
        { ip_str: '192.168.1.100', product: 'Hikvision Camera', port: 80, vulns: ['CVE-2021-36260'] },
        { ip_str: '192.168.1.101', product: 'TP-Link Router', port: 443, vulns: [] },
        { ip_str: '192.168.1.102', product: 'Nest Thermostat', port: 8080, vulns: [] }
      ],
      total: 3
    };
  }
}

/**
 * Censys API - Internet Device Discovery
 * https://search.censys.io/api
 */
class CensysAPI {
  constructor() {
    this.baseURL = 'https://search.censys.io/api/v2';
    this.apiId = CENSYS_API_ID;
    this.apiSecret = CENSYS_API_SECRET;
  }

  getAuthHeader() {
    return {
      auth: { username: this.apiId, password: this.apiSecret }
    };
  }

  async searchHosts(query, options = {}) {
    if (!this.apiId || !this.apiSecret) {
      return { success: false, error: 'CENSYS credentials not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/hosts/search`, {
        ...this.getAuthHeader(),
        params: {
          q: query,
          per_page: options.perPage || 25,
          cursor: options.cursor
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getHost(ip) {
    if (!this.apiId || !this.apiSecret) {
      return { success: false, error: 'CENSYS credentials not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/hosts/${ip}`, this.getAuthHeader());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * BinaryEdge API - Threat Intelligence
 * https://docs.binaryedge.io/api-v2/
 */
class BinaryEdgeAPI {
  constructor() {
    this.baseURL = 'https://api.binaryedge.io/v2';
    this.apiKey = BINARYEDGE_API_KEY;
  }

  async queryHost(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'BINARYEDGE_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/query/ip/${ip}`, {
        headers: { 'X-Key': this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchIoT(query, options = {}) {
    if (!this.apiKey) {
      return { success: false, error: 'BINARYEDGE_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/query/search`, {
        headers: { 'X-Key': this.apiKey },
        params: {
          query,
          page: options.page || 1
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * VirusTotal API - Firmware Analysis
 * https://developers.virustotal.com/reference
 */
class VirusTotalAPI {
  constructor() {
    this.baseURL = 'https://www.virustotal.com/api/v3';
    this.apiKey = VIRUSTOTAL_API_KEY;
  }

  async analyzeFirmware(fileHash) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/files/${fileHash}`, {
        headers: { 'x-apikey': this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async scanURL(url) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const encodedUrl = Buffer.from(url).toString('base64').replace(/=/g, '');
      const response = await axios.get(`${this.baseURL}/urls/${encodedUrl}`, {
        headers: { 'x-apikey': this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIPReport(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/ip_addresses/${ip}`, {
        headers: { 'x-apikey': this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * GreyNoise API - Internet Background Noise
 * https://docs.greynoise.io/reference
 */
class GreyNoiseAPI {
  constructor() {
    this.baseURL = 'https://api.greynoise.io/v3';
    this.apiKey = GREYNOISE_API_KEY;
  }

  async checkIP(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'GREYNOISE_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/community/${ip}`, {
        headers: { key: this.apiKey }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchNoise(query) {
    if (!this.apiKey) {
      return { success: false, error: 'GREYNOISE_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${this.baseURL}/gnql`, {
        headers: { key: this.apiKey },
        params: { query }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * NIST NVD API - Vulnerability Database
 * https://nvd.nist.gov/developers/vulnerabilities
 */
class NVDAPI {
  constructor() {
    this.baseURL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
    this.apiKey = NVD_API_KEY;
  }

  async getCVE(cveId) {
    try {
      const response = await axios.get(this.baseURL, {
        params: { cveId },
        headers: this.apiKey ? { apiKey: this.apiKey } : {}
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchCVEs(keyword, options = {}) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          keywordSearch: keyword,
          resultsPerPage: options.limit || 20,
          startIndex: options.offset || 0
        },
        headers: this.apiKey ? { apiKey: this.apiKey } : {}
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getVulnerabilitiesByProduct(vendor, product) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          cpeName: `cpe:2.3:*:${vendor}:${product}:*:*:*:*:*:*:*:*`
        },
        headers: this.apiKey ? { apiKey: this.apiKey } : {}
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * OpenCTI API - Threat Intelligence Platform
 * https://docs.opencti.io/latest/deployment/integrations/
 */
class OpenCTIAPI {
  constructor() {
    this.baseURL = OPENCTI_API_URL;
    this.apiKey = OPENCTI_API_KEY;
  }

  async query(graphqlQuery, variables = {}) {
    if (!this.baseURL || !this.apiKey) {
      return { success: false, error: 'OpenCTI credentials not configured', demo: true };
    }

    try {
      const response = await axios.post(`${this.baseURL}/graphql`, 
        { query: graphqlQuery, variables },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getIndicators(options = {}) {
    const query = `
      query GetIndicators($first: Int, $after: ID) {
        indicators(first: $first, after: $after) {
          edges {
            node {
              id
              name
              pattern
              valid_from
              valid_until
              x_opencti_score
              created_at
            }
          }
        }
      }
    `;
    return this.query(query, { first: options.limit || 50, after: options.cursor });
  }
}

// Export all API clients
module.exports = {
  ShodanAPI,
  CensysAPI,
  BinaryEdgeAPI,
  VirusTotalAPI,
  GreyNoiseAPI,
  NVDAPI,
  OpenCTIAPI,
  
  // Pre-instantiated clients
  shodan: new ShodanAPI(),
  censys: new CensysAPI(),
  binaryEdge: new BinaryEdgeAPI(),
  virusTotal: new VirusTotalAPI(),
  greyNoise: new GreyNoiseAPI(),
  nvd: new NVDAPI(),
  openCTI: new OpenCTIAPI()
};

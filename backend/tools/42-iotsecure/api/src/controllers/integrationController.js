/**
 * Integration Controller
 * Handles external API integrations for IoT security
 */

const axios = require('axios');
const { Device, Vulnerability, Alert, Scan, Firmware } = require('../models');

/**
 * Shodan Integration
 */
class ShodanService {
  constructor() {
    this.apiKey = process.env.SHODAN_API_KEY;
    this.baseUrl = 'https://api.shodan.io';
  }

  async searchDevices(query, limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/shodan/host/search`, {
        params: { key: this.apiKey, query, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  async getDeviceInfo(ip) {
    try {
      const response = await axios.get(`${this.baseUrl}/shodan/host/${ip}`, {
        params: { key: this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }
}

/**
 * Censys Integration
 */
class CensysService {
  constructor() {
    this.apiId = process.env.CENSYS_API_ID;
    this.apiSecret = process.env.CENSYS_API_SECRET;
    this.baseUrl = 'https://search.censys.io/api/v2';
  }

  async searchCertificates(query, limit = 100) {
    try {
      const response = await axios.post(`${this.baseUrl}/certificates/search`, {
        query,
        per_page: limit
      }, {
        auth: { username: this.apiId, password: this.apiSecret }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Censys API error: ${error.message}`);
    }
  }

  async searchHosts(query, limit = 100) {
    try {
      const response = await axios.post(`${this.baseUrl}/hosts/search`, {
        query,
        per_page: limit
      }, {
        auth: { username: this.apiId, password: this.apiSecret }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Censys API error: ${error.message}`);
    }
  }
}

/**
 * NVD Integration
 */
class NVDService {
  constructor() {
    this.apiKey = process.env.NVD_API_KEY;
    this.baseUrl = 'https://services.nvd.nist.gov/rest/json';
  }

  async searchVulnerabilities(keyword, limit = 100) {
    try {
      const response = await axios.get(`${this.baseUrl}/cves/2.0`, {
        params: {
          keywordSearch: keyword,
          resultsPerPage: limit,
          apiKey: this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`NVD API error: ${error.message}`);
    }
  }

  async getVulnerability(cveId) {
    try {
      const response = await axios.get(`${this.baseUrl}/cves/2.0`, {
        params: { cveId, apiKey: this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`NVD API error: ${error.message}`);
    }
  }
}

/**
 * VirusTotal Integration
 */
class VirusTotalService {
  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY;
    this.baseUrl = 'https://www.virustotal.com/api/v3';
  }

  async scanFile(fileBuffer, filename) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, filename);

      const response = await axios.post(`${this.baseUrl}/files`, formData, {
        headers: {
          'x-apikey': this.apiKey,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`VirusTotal API error: ${error.message}`);
    }
  }

  async getFileReport(hash) {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${hash}`, {
        headers: { 'x-apikey': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`VirusTotal API error: ${error.message}`);
    }
  }

  async scanURL(url) {
    try {
      const response = await axios.post(`${this.baseUrl}/urls`, {
        url: url
      }, {
        headers: { 'x-apikey': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`VirusTotal API error: ${error.message}`);
    }
  }
}

/**
 * GreyNoise Integration
 */
class GreyNoiseService {
  constructor() {
    this.apiKey = process.env.GREYNOISE_API_KEY;
    this.baseUrl = 'https://api.greynoise.io/v3';
  }

  async getIPContext(ip) {
    try {
      const response = await axios.get(`${this.baseUrl}/community/${ip}`, {
        headers: { 'key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`GreyNoise API error: ${error.message}`);
    }
  }

  async searchIPs(query, size = 100) {
    try {
      const response = await axios.post(`${this.baseUrl}/experimental/gnql`, {
        query,
        size
      }, {
        headers: { 'key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`GreyNoise API error: ${error.message}`);
    }
  }
}

/**
 * BinaryEdge Integration
 */
class BinaryEdgeService {
  constructor() {
    this.apiKey = process.env.BINARYEDGE_API_KEY;
    this.baseUrl = 'https://api.binaryedge.io/v2';
  }

  async searchHosts(query, page = 1) {
    try {
      const response = await axios.get(`${this.baseUrl}/query/search`, {
        params: { query, page },
        headers: { 'X-Key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`BinaryEdge API error: ${error.message}`);
    }
  }

  async getHostInfo(ip) {
    try {
      const response = await axios.get(`${this.baseUrl}/query/ip/${ip}`, {
        headers: { 'X-Key': this.apiKey }
      });
      return response.data;
    } catch (error) {
      throw new Error(`BinaryEdge API error: ${error.message}`);
    }
  }
}

// Initialize services
const shodan = new ShodanService();
const censys = new CensysService();
const nvd = new NVDService();
const virustotal = new VirusTotalService();
const greynoise = new GreyNoiseService();
const binaryedge = new BinaryEdgeService();

/**
 * Get integration status
 */
exports.getIntegrationStatus = async (req, res) => {
  try {
    const status = {
      shodan: !!process.env.SHODAN_API_KEY,
      censys: !!(process.env.CENSYS_API_ID && process.env.CENSYS_API_SECRET),
      nvd: !!process.env.NVD_API_KEY,
      virustotal: !!process.env.VIRUSTOTAL_API_KEY,
      greynoise: !!process.env.GREYNOISE_API_KEY,
      binaryedge: !!process.env.BINARYEDGE_API_KEY,
      timestamp: new Date()
    };

    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Shodan device search
 */
exports.searchShodanDevices = async (req, res) => {
  try {
    const { query, limit = 100 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await shodan.searchDevices(query, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get Shodan device info
 */
exports.getShodanDeviceInfo = async (req, res) => {
  try {
    const { ip } = req.params;
    const results = await shodan.getDeviceInfo(ip);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Censys certificate search
 */
exports.searchCensysCertificates = async (req, res) => {
  try {
    const { query, limit = 100 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await censys.searchCertificates(query, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Censys host search
 */
exports.searchCensysHosts = async (req, res) => {
  try {
    const { query, limit = 100 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await censys.searchHosts(query, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * NVD vulnerability search
 */
exports.searchNVDVulnerabilities = async (req, res) => {
  try {
    const { keyword, limit = 100 } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword parameter required' });
    }

    const results = await nvd.searchVulnerabilities(keyword, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get NVD vulnerability details
 */
exports.getNVDVulnerability = async (req, res) => {
  try {
    const { cveId } = req.params;
    const results = await nvd.getVulnerability(cveId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * VirusTotal file scan
 */
exports.scanFileVirusTotal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File required' });
    }

    const results = await virustotal.scanFile(req.file.buffer, req.file.originalname);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get VirusTotal file report
 */
exports.getVirusTotalReport = async (req, res) => {
  try {
    const { hash } = req.params;
    const results = await virustotal.getFileReport(hash);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * VirusTotal URL scan
 */
exports.scanURLVirusTotal = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'URL required' });
    }

    const results = await virustotal.scanURL(url);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GreyNoise IP context
 */
exports.getGreyNoiseIPContext = async (req, res) => {
  try {
    const { ip } = req.params;
    const results = await greynoise.getIPContext(ip);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GreyNoise IP search
 */
exports.searchGreyNoiseIPs = async (req, res) => {
  try {
    const { query, size = 100 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await greynoise.searchIPs(query, size);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * BinaryEdge host search
 */
exports.searchBinaryEdgeHosts = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = await binaryedge.searchHosts(query, page);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get BinaryEdge host info
 */
exports.getBinaryEdgeHostInfo = async (req, res) => {
  try {
    const { ip } = req.params;
    const results = await binaryedge.getHostInfo(ip);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Bulk vulnerability check
 */
exports.bulkVulnerabilityCheck = async (req, res) => {
  try {
    const { devices } = req.body;

    if (!Array.isArray(devices)) {
      return res.status(400).json({ success: false, error: 'Devices array required' });
    }

    const results = [];

    for (const device of devices) {
      try {
        // Check Shodan for device info
        const shodanInfo = await shodan.getDeviceInfo(device.ip);

        // Check NVD for vulnerabilities
        const vulnerabilities = await nvd.searchVulnerabilities(device.firmware || device.type);

        // Check GreyNoise for IP reputation
        const ipContext = await greynoise.getIPContext(device.ip);

        results.push({
          device: device.ip,
          shodan: shodanInfo,
          vulnerabilities: vulnerabilities.vulnerabilities || [],
          reputation: ipContext,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          device: device.ip,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Comprehensive device analysis
 */
exports.analyzeDevice = async (req, res) => {
  try {
    const { ip, firmware, type } = req.body;

    if (!ip) {
      return res.status(400).json({ success: false, error: 'IP address required' });
    }

    const analysis = {};

    // Parallel API calls for comprehensive analysis
    const promises = [
      shodan.getDeviceInfo(ip).catch(() => null),
      greynoise.getIPContext(ip).catch(() => null),
      binaryedge.getHostInfo(ip).catch(() => null)
    ];

    if (firmware || type) {
      promises.push(nvd.searchVulnerabilities(firmware || type).catch(() => null));
    }

    const [shodanData, greyNoiseData, binaryEdgeData, nvdData] = await Promise.all(promises);

    analysis.ip = ip;
    analysis.shodan = shodanData;
    analysis.reputation = greyNoiseData;
    analysis.binaryEdge = binaryEdgeData;
    analysis.vulnerabilities = nvdData?.vulnerabilities || [];
    analysis.timestamp = new Date();

    // Calculate risk score based on findings
    let riskScore = 0;
    if (greyNoiseData?.noise) riskScore += 30;
    if (nvdData?.vulnerabilities?.length > 0) riskScore += Math.min(nvdData.vulnerabilities.length * 10, 40);
    if (shodanData?.ports?.length > 10) riskScore += 20;
    if (binaryEdgeData?.events?.length > 0) riskScore += 10;

    analysis.riskScore = Math.min(riskScore, 100);

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get integration statistics
 */
exports.getIntegrationStats = async (req, res) => {
  try {
    const stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      lastUsed: new Date(),
      services: {
        shodan: { calls: 0, success: 0, errors: 0 },
        censys: { calls: 0, success: 0, errors: 0 },
        nvd: { calls: 0, success: 0, errors: 0 },
        virustotal: { calls: 0, success: 0, errors: 0 },
        greynoise: { calls: 0, success: 0, errors: 0 },
        binaryedge: { calls: 0, success: 0, errors: 0 }
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Test integration connectivity
 */
exports.testIntegration = async (req, res) => {
  try {
    const { service } = req.params;
    let result = { connected: false, error: null };

    switch (service) {
      case 'shodan':
        await shodan.searchDevices('test', 1);
        result.connected = true;
        break;
      case 'censys':
        await censys.searchHosts('test', 1);
        result.connected = true;
        break;
      case 'nvd':
        await nvd.searchVulnerabilities('test', 1);
        result.connected = true;
        break;
      case 'virustotal':
        // Test with a known safe hash
        await virustotal.getFileReport('44d88612fea8a8f36de82e1278abb02f');
        result.connected = true;
        break;
      case 'greynoise':
        await greynoise.getIPContext('8.8.8.8');
        result.connected = true;
        break;
      case 'binaryedge':
        await binaryedge.searchHosts('ip:8.8.8.8', 1);
        result.connected = true;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid service' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.json({
      success: true,
      data: {
        connected: false,
        error: error.message
      }
    });
  }
};

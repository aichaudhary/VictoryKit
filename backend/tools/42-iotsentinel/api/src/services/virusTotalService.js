/**
 * VirusTotal API Service for IoTSentinel
 * Firmware and file analysis for IoT devices
 */

const axios = require('axios');
const crypto = require('crypto');

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE_URL = 'https://www.virustotal.com/api/v3';

class VirusTotalService {
  constructor() {
    this.apiKey = VIRUSTOTAL_API_KEY;
    this.headers = {
      'x-apikey': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Analyze a file hash (MD5, SHA1, or SHA256)
   */
  async analyzeHash(hash) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true, data: this.getDemoData(hash) };
    }

    try {
      const response = await axios.get(`${BASE_URL}/files/${hash}`, {
        headers: this.headers
      });
      
      return {
        success: true,
        data: this.parseFileReport(response.data)
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: false, error: 'File not found in VirusTotal database' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload and scan a firmware file
   */
  async uploadFile(fileBuffer, filename) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      // Get upload URL for large files
      const uploadUrl = await this.getUploadUrl(fileBuffer.length);
      
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return {
        success: true,
        data: {
          analysisId: response.data.data.id,
          status: 'queued'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get upload URL for file scanning
   */
  async getUploadUrl(fileSize) {
    if (fileSize > 32 * 1024 * 1024) {
      // For files > 32MB, need special upload URL
      const response = await axios.get(`${BASE_URL}/files/upload_url`, {
        headers: this.headers
      });
      return response.data.data;
    }
    return `${BASE_URL}/files`;
  }

  /**
   * Check analysis status
   */
  async getAnalysisStatus(analysisId) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${BASE_URL}/analyses/${analysisId}`, {
        headers: this.headers
      });

      const data = response.data.data;
      return {
        success: true,
        data: {
          status: data.attributes.status,
          stats: data.attributes.stats,
          results: data.attributes.results
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Scan a URL (for firmware download sources)
   */
  async scanUrl(url) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.post(`${BASE_URL}/urls`, 
        new URLSearchParams({ url }).toString(),
        {
          headers: {
            ...this.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        data: {
          analysisId: response.data.data.id,
          status: 'queued'
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get URL analysis results
   */
  async getUrlReport(url) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      // URL needs to be base64 encoded without padding
      const urlId = Buffer.from(url).toString('base64').replace(/=+$/, '');
      
      const response = await axios.get(`${BASE_URL}/urls/${urlId}`, {
        headers: this.headers
      });

      return {
        success: true,
        data: this.parseUrlReport(response.data)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if an IP is malicious
   */
  async checkIP(ip) {
    if (!this.apiKey) {
      return { success: false, error: 'VIRUSTOTAL_API_KEY not configured', demo: true };
    }

    try {
      const response = await axios.get(`${BASE_URL}/ip_addresses/${ip}`, {
        headers: this.headers
      });

      const data = response.data.data;
      return {
        success: true,
        data: {
          ip,
          reputation: data.attributes.reputation,
          malicious: data.attributes.last_analysis_stats?.malicious || 0,
          suspicious: data.attributes.last_analysis_stats?.suspicious || 0,
          harmless: data.attributes.last_analysis_stats?.harmless || 0,
          country: data.attributes.country,
          asn: data.attributes.asn,
          asOwner: data.attributes.as_owner
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse file analysis report
   */
  parseFileReport(response) {
    const data = response.data;
    const attrs = data.attributes;
    
    return {
      hash: {
        md5: attrs.md5,
        sha1: attrs.sha1,
        sha256: attrs.sha256
      },
      name: attrs.meaningful_name || attrs.names?.[0] || 'Unknown',
      size: attrs.size,
      type: attrs.type_description,
      detections: {
        malicious: attrs.last_analysis_stats?.malicious || 0,
        suspicious: attrs.last_analysis_stats?.suspicious || 0,
        undetected: attrs.last_analysis_stats?.undetected || 0,
        total: Object.values(attrs.last_analysis_stats || {}).reduce((a, b) => a + b, 0)
      },
      reputation: attrs.reputation,
      lastAnalysis: attrs.last_analysis_date,
      tags: attrs.tags || [],
      isMalicious: (attrs.last_analysis_stats?.malicious || 0) > 0
    };
  }

  /**
   * Parse URL analysis report
   */
  parseUrlReport(response) {
    const data = response.data;
    const attrs = data.attributes;

    return {
      url: attrs.url,
      finalUrl: attrs.last_final_url,
      detections: {
        malicious: attrs.last_analysis_stats?.malicious || 0,
        suspicious: attrs.last_analysis_stats?.suspicious || 0,
        harmless: attrs.last_analysis_stats?.harmless || 0
      },
      categories: attrs.categories || {},
      reputation: attrs.reputation,
      lastAnalysis: attrs.last_analysis_date,
      isMalicious: (attrs.last_analysis_stats?.malicious || 0) > 0
    };
  }

  /**
   * Demo data for testing without API key
   */
  getDemoData(hash) {
    return {
      hash: {
        md5: hash?.length === 32 ? hash : 'demo_md5_hash',
        sha1: 'demo_sha1_hash',
        sha256: hash?.length === 64 ? hash : 'demo_sha256_hash'
      },
      name: 'demo_firmware.bin',
      size: 4194304,
      type: 'ELF executable',
      detections: {
        malicious: 0,
        suspicious: 0,
        undetected: 65,
        total: 65
      },
      reputation: 0,
      lastAnalysis: new Date().toISOString(),
      tags: ['elf', 'linux', 'firmware'],
      isMalicious: false
    };
  }

  /**
   * Calculate hash of a buffer
   */
  calculateHash(buffer, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(buffer).digest('hex');
  }
}

module.exports = new VirusTotalService();

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');

class NucleiService {
  constructor() {
    this.nucleiPath = process.env.NUCLEI_PATH || 'nuclei';
    this.templatesPath = process.env.VULNSCAN_NUCLEI_TEMPLATES_PATH || '/opt/nuclei-templates';
    this.rateLimit = parseInt(process.env.VULNSCAN_NUCLEI_RATE_LIMIT) || 150;
    this.bulkSize = parseInt(process.env.VULNSCAN_NUCLEI_BULK_SIZE) || 25;
    this.timeout = 300000; // 5 minutes
  }

  /**
   * Check if nuclei is available
   */
  async isAvailable() {
    return new Promise((resolve) => {
      const child = spawn(this.nucleiPath, ['-version']);
      child.on('error', () => resolve(false));
      child.on('close', (code) => resolve(code === 0));
    });
  }

  /**
   * Check if templates are available
   */
  async templatesAvailable() {
    try {
      await fs.access(this.templatesPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run nuclei scan
   */
  async scan(target, options = {}) {
    const nucleiAvailable = await this.isAvailable();
    
    if (!nucleiAvailable) {
      logger.info('Nuclei not available, using template-based detection');
      return this.templateBasedScan(target, options);
    }

    return this.nucleiScan(target, options);
  }

  /**
   * Full nuclei scan
   */
  async nucleiScan(target, options = {}) {
    const {
      severity = ['critical', 'high', 'medium'],
      tags = [],
      templates = [],
      excludeTags = ['dos', 'fuzz'],
      timeout = this.timeout
    } = options;

    const args = [
      '-target', target,
      '-json',
      '-silent',
      '-rate-limit', this.rateLimit.toString(),
      '-bulk-size', this.bulkSize.toString(),
      '-severity', severity.join(','),
      '-exclude-tags', excludeTags.join(',')
    ];

    // Add templates path
    if (await this.templatesAvailable()) {
      args.push('-templates', this.templatesPath);
    }

    // Add specific tags
    if (tags.length > 0) {
      args.push('-tags', tags.join(','));
    }

    // Add specific templates
    if (templates.length > 0) {
      args.push('-t', templates.join(','));
    }

    return new Promise((resolve, reject) => {
      const results = [];
      let errorOutput = '';

      const child = spawn(this.nucleiPath, args, { timeout });

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(l => l.trim());
        for (const line of lines) {
          try {
            const finding = JSON.parse(line);
            results.push(this.parseFinding(finding));
          } catch {
            // Not JSON, skip
          }
        }
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0 || code === null) {
          resolve({
            target,
            vulnerabilities: results,
            totalFindings: results.length,
            bySeverity: this.groupBySeverity(results),
            method: 'nuclei'
          });
        } else {
          // Nuclei may exit non-zero but still have results
          if (results.length > 0) {
            resolve({
              target,
              vulnerabilities: results,
              totalFindings: results.length,
              bySeverity: this.groupBySeverity(results),
              method: 'nuclei',
              warning: errorOutput
            });
          } else {
            reject(new Error(`Nuclei exited with code ${code}: ${errorOutput}`));
          }
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Nuclei execution failed: ${err.message}`));
      });
    });
  }

  /**
   * Parse nuclei finding
   */
  parseFinding(finding) {
    return {
      id: finding['template-id'] || finding.templateID,
      name: finding.info?.name || finding.name,
      severity: (finding.info?.severity || finding.severity || 'unknown').toUpperCase(),
      type: finding.type,
      host: finding.host,
      matched: finding['matched-at'] || finding.matched,
      ip: finding.ip,
      timestamp: finding.timestamp,
      curl: finding['curl-command'],
      description: finding.info?.description,
      reference: finding.info?.reference,
      tags: finding.info?.tags || [],
      classification: {
        cve: finding.info?.classification?.['cve-id'],
        cwe: finding.info?.classification?.['cwe-id'],
        cvss: finding.info?.classification?.['cvss-metrics']
      },
      matcher: finding['matcher-name'],
      extractedResults: finding['extracted-results']
    };
  }

  /**
   * Group findings by severity
   */
  groupBySeverity(findings) {
    return {
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
      info: findings.filter(f => f.severity === 'INFO' || f.severity === 'UNKNOWN').length
    };
  }

  /**
   * Template-based scan (fallback without nuclei binary)
   */
  async templateBasedScan(target, options = {}) {
    const results = [];
    const checks = this.getBuiltInChecks();

    for (const check of checks) {
      try {
        const finding = await check.run(target);
        if (finding) {
          results.push({
            id: check.id,
            name: check.name,
            severity: check.severity,
            type: check.type,
            host: target,
            matched: finding.matched,
            description: check.description,
            reference: check.reference,
            tags: check.tags
          });
        }
      } catch (error) {
        logger.debug(`Check ${check.id} failed:`, error.message);
      }
    }

    return {
      target,
      vulnerabilities: results,
      totalFindings: results.length,
      bySeverity: this.groupBySeverity(results),
      method: 'builtin-templates'
    };
  }

  /**
   * Built-in vulnerability checks
   */
  getBuiltInChecks() {
    return [
      {
        id: 'http-missing-security-headers',
        name: 'Missing Security Headers',
        severity: 'INFO',
        type: 'http',
        description: 'Important security headers are missing',
        tags: ['headers', 'security'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(url, { timeout: 10000, validateStatus: () => true });
            const headers = response.headers;
            
            const missing = [];
            const requiredHeaders = [
              'strict-transport-security',
              'x-content-type-options',
              'x-frame-options',
              'content-security-policy',
              'x-xss-protection'
            ];
            
            for (const h of requiredHeaders) {
              if (!headers[h]) missing.push(h);
            }
            
            if (missing.length > 0) {
              return { matched: `Missing: ${missing.join(', ')}` };
            }
            return null;
          } catch {
            return null;
          }
        }
      },
      {
        id: 'ssl-weak-cipher',
        name: 'Weak SSL/TLS Configuration',
        severity: 'MEDIUM',
        type: 'ssl',
        description: 'Server supports weak cipher suites',
        tags: ['ssl', 'tls', 'crypto'],
        reference: ['https://owasp.org/www-project-web-security-testing-guide/'],
        run: async (target) => {
          // This would need actual SSL testing - placeholder
          return null;
        }
      },
      {
        id: 'exposed-git-directory',
        name: 'Exposed .git Directory',
        severity: 'HIGH',
        type: 'http',
        description: 'Git repository is publicly accessible',
        tags: ['exposure', 'git'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(`${url}/.git/config`, { 
              timeout: 5000, 
              validateStatus: () => true 
            });
            if (response.status === 200 && response.data.includes('[core]')) {
              return { matched: `${url}/.git/config` };
            }
            return null;
          } catch {
            return null;
          }
        }
      },
      {
        id: 'exposed-env-file',
        name: 'Exposed .env File',
        severity: 'CRITICAL',
        type: 'http',
        description: 'Environment file with credentials is accessible',
        tags: ['exposure', 'env', 'credentials'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(`${url}/.env`, { 
              timeout: 5000, 
              validateStatus: () => true 
            });
            if (response.status === 200 && (
              response.data.includes('=') || 
              response.data.includes('DB_') || 
              response.data.includes('API_')
            )) {
              return { matched: `${url}/.env` };
            }
            return null;
          } catch {
            return null;
          }
        }
      },
      {
        id: 'exposed-backup-files',
        name: 'Exposed Backup Files',
        severity: 'HIGH',
        type: 'http',
        description: 'Backup files are publicly accessible',
        tags: ['exposure', 'backup'],
        run: async (target) => {
          const backupPaths = [
            '/backup.sql', '/database.sql', '/dump.sql',
            '/backup.zip', '/backup.tar.gz', '/site.zip',
            '/wp-config.php.bak', '/config.php.bak'
          ];
          
          for (const p of backupPaths) {
            try {
              const url = target.startsWith('http') ? target : `https://${target}`;
              const response = await axios.head(`${url}${p}`, { 
                timeout: 3000, 
                validateStatus: () => true 
              });
              if (response.status === 200) {
                return { matched: `${url}${p}` };
              }
            } catch {
              continue;
            }
          }
          return null;
        }
      },
      {
        id: 'directory-listing',
        name: 'Directory Listing Enabled',
        severity: 'LOW',
        type: 'http',
        description: 'Directory listing is enabled on the server',
        tags: ['exposure', 'misconfiguration'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(url, { timeout: 5000, validateStatus: () => true });
            if (response.data.includes('Index of /') || 
                response.data.includes('Directory listing for')) {
              return { matched: url };
            }
            return null;
          } catch {
            return null;
          }
        }
      },
      {
        id: 'wordpress-version-disclosure',
        name: 'WordPress Version Disclosure',
        severity: 'INFO',
        type: 'http',
        description: 'WordPress version is disclosed',
        tags: ['wordpress', 'disclosure'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(url, { timeout: 5000, validateStatus: () => true });
            const match = response.data.match(/WordPress\s*([\d.]+)/i);
            if (match) {
              return { matched: `WordPress ${match[1]}` };
            }
            return null;
          } catch {
            return null;
          }
        }
      },
      {
        id: 'server-version-disclosure',
        name: 'Server Version Disclosure',
        severity: 'INFO',
        type: 'http',
        description: 'Server software version is disclosed in headers',
        tags: ['disclosure', 'server'],
        run: async (target) => {
          try {
            const url = target.startsWith('http') ? target : `https://${target}`;
            const response = await axios.get(url, { timeout: 5000, validateStatus: () => true });
            const server = response.headers['server'];
            const powered = response.headers['x-powered-by'];
            
            if (server && /[\d.]+/.test(server)) {
              return { matched: `Server: ${server}` };
            }
            if (powered) {
              return { matched: `X-Powered-By: ${powered}` };
            }
            return null;
          } catch {
            return null;
          }
        }
      }
    ];
  }

  /**
   * Scan for specific vulnerability types
   */
  async scanByTags(target, tags) {
    return this.scan(target, { tags });
  }

  /**
   * CVE-specific scan
   */
  async scanCVE(target, cveId) {
    const nucleiAvailable = await this.isAvailable();
    
    if (!nucleiAvailable) {
      return {
        target,
        cve: cveId,
        vulnerable: false,
        method: 'unavailable'
      };
    }

    const result = await this.nucleiScan(target, {
      tags: [cveId.toLowerCase()]
    });

    return {
      target,
      cve: cveId,
      vulnerable: result.vulnerabilities.length > 0,
      findings: result.vulnerabilities,
      method: 'nuclei'
    };
  }

  /**
   * Technology-specific scans
   */
  async scanTechnology(target, tech) {
    const techTags = {
      wordpress: ['wordpress', 'wp'],
      joomla: ['joomla'],
      drupal: ['drupal'],
      apache: ['apache'],
      nginx: ['nginx'],
      tomcat: ['tomcat'],
      iis: ['iis'],
      jenkins: ['jenkins'],
      gitlab: ['gitlab'],
      grafana: ['grafana'],
      elasticsearch: ['elasticsearch'],
      mongodb: ['mongodb']
    };

    const tags = techTags[tech.toLowerCase()] || [tech.toLowerCase()];
    return this.scanByTags(target, tags);
  }
}

module.exports = new NucleiService();

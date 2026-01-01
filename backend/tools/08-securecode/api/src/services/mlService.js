const axios = require('axios');
const { logger } = require('../../../../../shared');
const { getConnectors } = require('../../../../../shared/connectors');

class MLService {
  constructor() {
    this.baseUrl = process.env.ML_SECURECODE_URL || 'http://localhost:8008';
  }

  async analyzeCode(code, language, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, {
        code,
        language,
        options
      }, { timeout: 120000 });
      return response.data;
    } catch (error) {
      logger.warn('ML service unavailable, using rule-based analysis');
      return this.fallbackAnalysis(code, language);
    }
  }

  async detectSecrets(content, filename) {
    try {
      const response = await axios.post(`${this.baseUrl}/secrets`, {
        content,
        filename
      }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      return this.fallbackSecretDetection(content, filename);
    }
  }

  async checkDependencies(dependencies, ecosystem) {
    try {
      const response = await axios.post(`${this.baseUrl}/dependencies`, {
        dependencies,
        ecosystem
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      return { vulnerabilities: [], outdated: [] };
    }
  }

  fallbackAnalysis(code, language) {
    const issues = [];
    const lines = code.split('\n');
    
    const patterns = {
      'sql-injection': [/execute\s*\(\s*['"]\s*SELECT.*\+/i, /query\s*\(\s*['"]\s*.*\$\{/i],
      'xss': [/innerHTML\s*=/, /document\.write\s*\(/],
      'hardcoded-secret': [/password\s*=\s*['"][^'"]{8,}['"]/i, /api[_-]?key\s*=\s*['"][^'"]+['"]/i],
      'insecure-random': [/Math\.random\s*\(\)/],
      'weak-crypto': [/md5\s*\(/, /sha1\s*\(/i]
    };

    lines.forEach((line, index) => {
      Object.entries(patterns).forEach(([category, regexes]) => {
        regexes.forEach(regex => {
          if (regex.test(line)) {
            issues.push({
              category,
              line: index + 1,
              snippet: line.trim(),
              confidence: 75
            });
          }
        });
      });
    });

    return { issues, analysisType: 'rule-based' };
  }

  fallbackSecretDetection(content, filename) {
    const secrets = [];
    const lines = content.split('\n');
    
    const patterns = [
      { type: 'api-key', regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i },
      { type: 'password', regex: /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{8,})['"]/i },
      { type: 'token', regex: /(?:token|bearer|auth)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]{20,})['"]?/i },
      { type: 'aws-key', regex: /AKIA[0-9A-Z]{16}/i },
      { type: 'private-key', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ }
    ];

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        if (pattern.regex.test(line)) {
          secrets.push({
            type: pattern.type,
            line: index + 1,
            file: filename,
            confidence: 85
          });
        }
      });
    });

    return { secrets, detectionType: 'pattern-based' };
  }

  // Integration with external security stack
  async integrateWithSecurityStack(scanId, scanData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log code analysis results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'CodeAnalysis_CL',
            data: {
              ScanId: scanId,
              Repository: scanData.repository,
              Language: scanData.language,
              CriticalIssues: scanData.criticalCount,
              HighIssues: scanData.highCount,
              SecretsFound: scanData.secretsCount,
              Timestamp: new Date().toISOString(),
              Source: 'SecureCode'
            }
          }).catch(err => logger.warn('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for critical code issues or secrets
      if (connectors.cortexXSOAR && (scanData.criticalCount > 0 || scanData.secretsCount > 0)) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Critical Code Security Issues - ${scanId}`,
            type: 'Code Security',
            severity: scanData.secretsCount > 0 ? 'Critical' : 'High',
            details: {
              scanId,
              repository: scanData.repository,
              language: scanData.language,
              criticalCount: scanData.criticalCount,
              secretsCount: scanData.secretsCount
            }
          }).catch(err => logger.warn('XSOAR integration failed:', err.message))
        );
      }

      // OpenCTI - Check for known code vulnerabilities
      if (connectors.opencti && scanData.vulnerabilities) {
        const vulnPromises = scanData.vulnerabilities.map(vuln =>
          connectors.opencti.searchIndicators({
            pattern: vuln.cve || vuln.title,
            pattern_type: 'cve'
          }).catch(err => logger.warn('OpenCTI CVE lookup failed:', err.message))
        );
        integrationPromises.push(...vulnPromises);
      }

      await Promise.allSettled(integrationPromises);
      logger.info('SecureCode security stack integration completed');

    } catch (error) {
      logger.error('SecureCode integration error:', error);
    }
  }
}

module.exports = new MLService();

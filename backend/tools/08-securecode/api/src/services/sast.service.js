/**
 * SAST Service - Static Application Security Testing
 * Integrates with Semgrep, SonarQube, CodeQL for deep code analysis
 */
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../../../../../shared');

const execAsync = promisify(exec);

class SASTService {
  constructor() {
    // Semgrep configuration
    this.semgrepToken = process.env.SECURECODE_SEMGREP_APP_TOKEN;
    this.semgrepRulesPath = process.env.SECURECODE_SEMGREP_RULES_PATH || '/opt/semgrep-rules';
    
    // SonarQube configuration
    this.sonarUrl = process.env.SECURECODE_SONARQUBE_URL || 'http://localhost:9000';
    this.sonarToken = process.env.SECURECODE_SONARQUBE_TOKEN;
    this.sonarProjectKey = process.env.SECURECODE_SONARQUBE_PROJECT_KEY;
    
    // CodeQL configuration
    this.codeqlPath = process.env.SECURECODE_CODEQL_PATH || '/opt/codeql';
    this.codeqlQueriesPath = process.env.SECURECODE_CODEQL_QUERIES_PATH || '/opt/codeql/queries';
    
    // Rule patterns for fallback analysis
    this.rulePatterns = this.initializeRulePatterns();
  }
  
  /**
   * Run comprehensive SAST analysis
   */
  async analyze(code, options = {}) {
    const { language, filename, scanners = ['semgrep', 'builtin'] } = options;
    const results = {
      findings: [],
      scanners: [],
      metrics: {
        linesAnalyzed: code.split('\n').length,
        duration: 0
      }
    };
    
    const startTime = Date.now();
    
    // Run selected scanners in parallel where possible
    const scanPromises = [];
    
    if (scanners.includes('semgrep')) {
      scanPromises.push(this.runSemgrep(code, language, filename));
    }
    
    if (scanners.includes('sonarqube') && this.sonarToken) {
      scanPromises.push(this.runSonarQube(code, language, filename));
    }
    
    if (scanners.includes('codeql')) {
      scanPromises.push(this.runCodeQL(code, language, filename));
    }
    
    // Always run built-in analysis as fallback
    if (scanners.includes('builtin')) {
      scanPromises.push(this.runBuiltinAnalysis(code, language, filename));
    }
    
    const scanResults = await Promise.allSettled(scanPromises);
    
    // Collect results from all scanners
    scanResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.findings.push(...(result.value.findings || []));
        results.scanners.push({
          name: result.value.scanner,
          duration: result.value.duration,
          findingsCount: result.value.findings?.length || 0,
          status: 'success'
        });
      } else if (result.status === 'rejected') {
        logger.warn(`Scanner failed:`, result.reason);
        results.scanners.push({
          name: scanners[index],
          status: 'failed',
          error: result.reason?.message
        });
      }
    });
    
    // Deduplicate findings
    results.findings = this.deduplicateFindings(results.findings);
    
    results.metrics.duration = Date.now() - startTime;
    
    return results;
  }
  
  /**
   * Run Semgrep analysis
   */
  async runSemgrep(code, language, filename) {
    const startTime = Date.now();
    const findings = [];
    
    try {
      // Create temp file for analysis
      const tempDir = `/tmp/securecode-${Date.now()}`;
      await fs.mkdir(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, filename || `code.${this.getExtension(language)}`);
      await fs.writeFile(tempFile, code);
      
      // Build semgrep command
      const rules = this.getSemgrepRules(language);
      const cmd = [
        'semgrep',
        '--json',
        '--config', rules,
        '--severity', 'INFO',
        tempFile
      ];
      
      if (this.semgrepToken) {
        cmd.push('--metrics', 'on');
      }
      
      const { stdout, stderr } = await execAsync(cmd.join(' '), {
        timeout: 120000,
        env: {
          ...process.env,
          SEMGREP_APP_TOKEN: this.semgrepToken
        }
      });
      
      // Parse Semgrep JSON output
      const result = JSON.parse(stdout);
      
      if (result.results) {
        for (const match of result.results) {
          findings.push({
            findingId: `semgrep-${match.check_id}-${match.start.line}`,
            ruleId: match.check_id,
            ruleName: match.extra?.metadata?.name || match.check_id,
            category: this.mapSemgrepCategory(match.extra?.metadata?.category),
            severity: this.mapSemgrepSeverity(match.extra?.severity || match.severity),
            confidence: match.extra?.metadata?.confidence || 'medium',
            message: match.extra?.message || match.message,
            location: {
              file: filename || tempFile,
              startLine: match.start.line,
              endLine: match.end.line,
              startColumn: match.start.col,
              endColumn: match.end.col,
              snippet: match.extra?.lines || code.split('\n').slice(match.start.line - 1, match.end.line).join('\n')
            },
            standards: {
              cwe: match.extra?.metadata?.cwe?.map(c => ({
                id: parseInt(c.replace('CWE-', '')),
                name: c
              })) || [],
              owasp: match.extra?.metadata?.owasp || []
            },
            remediation: {
              suggestion: match.extra?.fix || match.extra?.metadata?.fix,
              references: match.extra?.metadata?.references?.map(r => ({
                title: r,
                url: r
              })) || []
            },
            scanner: 'semgrep'
          });
        }
      }
      
      // Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true });
      
      return {
        scanner: 'semgrep',
        findings,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('Semgrep analysis failed:', error.message);
      return {
        scanner: 'semgrep',
        findings: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run SonarQube analysis
   */
  async runSonarQube(code, language, filename) {
    const startTime = Date.now();
    const findings = [];
    
    if (!this.sonarToken) {
      return { scanner: 'sonarqube', findings: [], duration: 0 };
    }
    
    try {
      // Create a temp project for analysis
      const projectKey = `temp-scan-${Date.now()}`;
      const tempDir = `/tmp/sonar-${Date.now()}`;
      await fs.mkdir(tempDir, { recursive: true });
      
      const extension = this.getExtension(language);
      const tempFile = path.join(tempDir, filename || `code.${extension}`);
      await fs.writeFile(tempFile, code);
      
      // Run sonar-scanner
      const scannerCmd = [
        'sonar-scanner',
        `-Dsonar.projectKey=${projectKey}`,
        `-Dsonar.sources=${tempDir}`,
        `-Dsonar.host.url=${this.sonarUrl}`,
        `-Dsonar.login=${this.sonarToken}`,
        `-Dsonar.language=${this.mapToSonarLanguage(language)}`
      ];
      
      await execAsync(scannerCmd.join(' '), { timeout: 300000 });
      
      // Wait for analysis to complete
      await this.waitForSonarAnalysis(projectKey);
      
      // Fetch issues
      const response = await axios.get(
        `${this.sonarUrl}/api/issues/search`,
        {
          params: {
            componentKeys: projectKey,
            types: 'VULNERABILITY,BUG,CODE_SMELL',
            resolved: false
          },
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.sonarToken}:`).toString('base64')}`
          }
        }
      );
      
      if (response.data.issues) {
        for (const issue of response.data.issues) {
          findings.push({
            findingId: `sonar-${issue.key}`,
            ruleId: issue.rule,
            ruleName: issue.message,
            category: this.mapSonarType(issue.type),
            severity: this.mapSonarSeverity(issue.severity),
            confidence: 'high',
            message: issue.message,
            location: {
              file: filename,
              startLine: issue.line || 1,
              endLine: issue.textRange?.endLine || issue.line || 1
            },
            standards: {
              cwe: issue.cwe ? [{ id: issue.cwe, name: `CWE-${issue.cwe}` }] : []
            },
            remediation: {
              suggestion: issue.flows?.[0]?.locations?.[0]?.msg
            },
            scanner: 'sonarqube'
          });
        }
      }
      
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
      await this.deleteSonarProject(projectKey);
      
      return {
        scanner: 'sonarqube',
        findings,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('SonarQube analysis failed:', error.message);
      return {
        scanner: 'sonarqube',
        findings: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run CodeQL analysis
   */
  async runCodeQL(code, language, filename) {
    const startTime = Date.now();
    const findings = [];
    
    try {
      const tempDir = `/tmp/codeql-${Date.now()}`;
      const dbDir = path.join(tempDir, 'db');
      const srcDir = path.join(tempDir, 'src');
      
      await fs.mkdir(srcDir, { recursive: true });
      
      const extension = this.getExtension(language);
      const tempFile = path.join(srcDir, filename || `code.${extension}`);
      await fs.writeFile(tempFile, code);
      
      const codeqlLang = this.mapToCodeQLLanguage(language);
      if (!codeqlLang) {
        return { scanner: 'codeql', findings: [], duration: 0 };
      }
      
      // Create CodeQL database
      await execAsync(
        `${this.codeqlPath}/codeql database create ${dbDir} --language=${codeqlLang} --source-root=${srcDir}`,
        { timeout: 300000 }
      );
      
      // Run security queries
      const queryPath = path.join(this.codeqlQueriesPath, codeqlLang, 'ql/src/Security');
      const resultsFile = path.join(tempDir, 'results.sarif');
      
      await execAsync(
        `${this.codeqlPath}/codeql database analyze ${dbDir} ${queryPath} --format=sarif-latest --output=${resultsFile}`,
        { timeout: 600000 }
      );
      
      // Parse SARIF results
      const sarifContent = await fs.readFile(resultsFile, 'utf8');
      const sarif = JSON.parse(sarifContent);
      
      if (sarif.runs?.[0]?.results) {
        for (const result of sarif.runs[0].results) {
          const location = result.locations?.[0]?.physicalLocation;
          findings.push({
            findingId: `codeql-${result.ruleId}-${location?.region?.startLine || 0}`,
            ruleId: result.ruleId,
            ruleName: result.rule?.name || result.ruleId,
            category: this.mapCodeQLCategory(result.ruleId),
            severity: this.mapSarifSeverity(result.level),
            confidence: 'high',
            message: result.message?.text || '',
            location: {
              file: filename,
              startLine: location?.region?.startLine || 1,
              endLine: location?.region?.endLine || location?.region?.startLine || 1,
              snippet: location?.region?.snippet?.text
            },
            dataFlow: result.codeFlows?.[0]?.threadFlows?.[0]?.locations?.map(loc => ({
              file: loc.location?.physicalLocation?.artifactLocation?.uri,
              line: loc.location?.physicalLocation?.region?.startLine,
              description: loc.location?.message?.text,
              type: 'propagator'
            })) || [],
            scanner: 'codeql'
          });
        }
      }
      
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
      
      return {
        scanner: 'codeql',
        findings,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('CodeQL analysis failed:', error.message);
      return {
        scanner: 'codeql',
        findings: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Built-in pattern-based analysis (fallback)
   */
  async runBuiltinAnalysis(code, language, filename) {
    const startTime = Date.now();
    const findings = [];
    const lines = code.split('\n');
    
    const patterns = this.rulePatterns[language] || this.rulePatterns.common;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      for (const rule of patterns) {
        if (rule.pattern.test(line)) {
          findings.push({
            findingId: `builtin-${rule.id}-${lineNum}`,
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            severity: rule.severity,
            confidence: 'medium',
            message: rule.message,
            location: {
              file: filename || 'input',
              startLine: lineNum,
              endLine: lineNum,
              snippet: line.trim()
            },
            standards: {
              cwe: rule.cwe ? [{ id: rule.cwe, name: `CWE-${rule.cwe}` }] : [],
              owasp: rule.owasp || []
            },
            remediation: {
              suggestion: rule.fix,
              references: rule.references || []
            },
            scanner: 'builtin'
          });
        }
      }
    });
    
    return {
      scanner: 'builtin',
      findings,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Initialize built-in rule patterns
   */
  initializeRulePatterns() {
    return {
      common: [
        {
          id: 'SEC001',
          name: 'SQL Injection',
          pattern: /(?:execute|query|raw)\s*\(\s*['"`].*\+|\$\{/i,
          category: 'injection',
          severity: 'critical',
          message: 'Potential SQL injection - user input concatenated in query',
          fix: 'Use parameterized queries or prepared statements',
          cwe: 89,
          owasp: ['A03:2021']
        },
        {
          id: 'SEC002',
          name: 'Hardcoded Secret',
          pattern: /(?:password|secret|api[_-]?key|token|credential)\s*[:=]\s*['"][^'"]{8,}['"]/i,
          category: 'secrets',
          severity: 'critical',
          message: 'Hardcoded secret detected in source code',
          fix: 'Use environment variables or a secrets manager',
          cwe: 798,
          owasp: ['A07:2021']
        },
        {
          id: 'SEC003',
          name: 'Eval Usage',
          pattern: /\beval\s*\(/,
          category: 'injection',
          severity: 'critical',
          message: 'Use of eval() can execute arbitrary code',
          fix: 'Avoid eval(); use safer alternatives',
          cwe: 94,
          owasp: ['A03:2021']
        },
        {
          id: 'SEC004',
          name: 'XSS Risk',
          pattern: /innerHTML\s*=|document\.write\s*\(|\.html\s*\(\s*[^)]*\+/,
          category: 'xss',
          severity: 'high',
          message: 'Potential XSS vulnerability',
          fix: 'Use textContent or sanitize HTML before insertion',
          cwe: 79,
          owasp: ['A03:2021']
        },
        {
          id: 'SEC005',
          name: 'Weak Cryptography',
          pattern: /(?:md5|sha1)\s*\(|createHash\s*\(\s*['"](?:md5|sha1)['"]\)/i,
          category: 'cryptography',
          severity: 'medium',
          message: 'Weak cryptographic algorithm detected',
          fix: 'Use SHA-256 or stronger algorithms',
          cwe: 327,
          owasp: ['A02:2021']
        },
        {
          id: 'SEC006',
          name: 'Insecure HTTP',
          pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/i,
          category: 'configuration',
          severity: 'medium',
          message: 'Using HTTP instead of HTTPS',
          fix: 'Use HTTPS for all external communications',
          cwe: 319,
          owasp: ['A02:2021']
        },
        {
          id: 'SEC007',
          name: 'Command Injection',
          pattern: /(?:exec|spawn|system|popen)\s*\([^)]*\+/,
          category: 'injection',
          severity: 'critical',
          message: 'Potential command injection vulnerability',
          fix: 'Validate and sanitize user input before executing commands',
          cwe: 78,
          owasp: ['A03:2021']
        },
        {
          id: 'SEC008',
          name: 'Path Traversal',
          pattern: /(?:readFile|writeFile|open|include|require)\s*\([^)]*\+.*(?:\.\.\/|\.\.\\)/,
          category: 'injection',
          severity: 'high',
          message: 'Potential path traversal vulnerability',
          fix: 'Validate file paths and use a whitelist approach',
          cwe: 22,
          owasp: ['A01:2021']
        }
      ],
      javascript: [
        {
          id: 'JS001',
          name: 'Prototype Pollution',
          pattern: /\[.*\]\s*=\s*.*__proto__|Object\.assign\s*\([^,]+,\s*(?!{)/,
          category: 'injection',
          severity: 'high',
          message: 'Potential prototype pollution vulnerability',
          fix: 'Validate object keys and avoid using user input for property names',
          cwe: 1321,
          owasp: ['A03:2021']
        },
        {
          id: 'JS002',
          name: 'Insecure Random',
          pattern: /Math\.random\s*\(\)/,
          category: 'cryptography',
          severity: 'low',
          message: 'Math.random() is not cryptographically secure',
          fix: 'Use crypto.randomBytes() for security-sensitive random values',
          cwe: 338,
          owasp: ['A02:2021']
        }
      ],
      python: [
        {
          id: 'PY001',
          name: 'Pickle Deserialization',
          pattern: /pickle\.loads?\s*\(/,
          category: 'deserialization',
          severity: 'high',
          message: 'Pickle deserialization can execute arbitrary code',
          fix: 'Avoid pickle for untrusted data; use JSON instead',
          cwe: 502,
          owasp: ['A08:2021']
        },
        {
          id: 'PY002',
          name: 'Assert in Production',
          pattern: /^\s*assert\s+/,
          category: 'code-quality',
          severity: 'low',
          message: 'Assert statements can be disabled with -O flag',
          fix: 'Use proper validation instead of assert for security checks',
          cwe: 617,
          owasp: []
        }
      ]
    };
  }
  
  // Helper methods
  getSemgrepRules(language) {
    const rulesets = {
      javascript: 'p/javascript',
      typescript: 'p/typescript',
      python: 'p/python',
      java: 'p/java',
      go: 'p/golang',
      ruby: 'p/ruby',
      php: 'p/php',
      csharp: 'p/csharp',
      rust: 'p/rust'
    };
    return rulesets[language] || 'p/security-audit';
  }
  
  getExtension(language) {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      go: 'go',
      ruby: 'rb',
      php: 'php',
      csharp: 'cs',
      rust: 'rs',
      kotlin: 'kt'
    };
    return extensions[language] || 'txt';
  }
  
  mapSemgrepSeverity(severity) {
    const map = { ERROR: 'critical', WARNING: 'high', INFO: 'medium' };
    return map[severity?.toUpperCase()] || 'medium';
  }
  
  mapSemgrepCategory(category) {
    const map = {
      security: 'injection',
      correctness: 'code-quality',
      'best-practice': 'code-quality'
    };
    return map[category] || 'injection';
  }
  
  mapSonarSeverity(severity) {
    const map = { BLOCKER: 'critical', CRITICAL: 'critical', MAJOR: 'high', MINOR: 'medium', INFO: 'low' };
    return map[severity] || 'medium';
  }
  
  mapSonarType(type) {
    const map = { VULNERABILITY: 'injection', BUG: 'code-quality', CODE_SMELL: 'code-quality' };
    return map[type] || 'code-quality';
  }
  
  mapSarifSeverity(level) {
    const map = { error: 'critical', warning: 'high', note: 'medium', none: 'low' };
    return map[level] || 'medium';
  }
  
  mapToSonarLanguage(language) {
    const map = { javascript: 'js', typescript: 'ts', csharp: 'cs' };
    return map[language] || language;
  }
  
  mapToCodeQLLanguage(language) {
    const map = {
      javascript: 'javascript',
      typescript: 'javascript',
      python: 'python',
      java: 'java',
      go: 'go',
      ruby: 'ruby',
      csharp: 'csharp'
    };
    return map[language];
  }
  
  mapCodeQLCategory(ruleId) {
    if (ruleId.includes('sql')) return 'injection';
    if (ruleId.includes('xss')) return 'xss';
    if (ruleId.includes('crypto')) return 'cryptography';
    return 'injection';
  }
  
  async waitForSonarAnalysis(projectKey, maxWait = 120000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await axios.get(
          `${this.sonarUrl}/api/ce/component`,
          {
            params: { component: projectKey },
            headers: {
              Authorization: `Basic ${Buffer.from(`${this.sonarToken}:`).toString('base64')}`
            }
          }
        );
        if (response.data.current?.status === 'SUCCESS') return;
        if (response.data.current?.status === 'FAILED') {
          throw new Error('SonarQube analysis failed');
        }
      } catch (e) {
        // Analysis might not have started yet
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('SonarQube analysis timeout');
  }
  
  async deleteSonarProject(projectKey) {
    try {
      await axios.post(
        `${this.sonarUrl}/api/projects/delete`,
        null,
        {
          params: { project: projectKey },
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.sonarToken}:`).toString('base64')}`
          }
        }
      );
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  deduplicateFindings(findings) {
    const seen = new Set();
    return findings.filter(finding => {
      const key = `${finding.ruleId}-${finding.location?.file}-${finding.location?.startLine}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = new SASTService();

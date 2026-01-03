/**
 * Dependencies Vulnerability Service
 * Integrates with Snyk, npm audit, OWASP Dependency-Check
 */
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../../../../../shared');

const execAsync = promisify(exec);

class DependenciesService {
  constructor() {
    // Snyk configuration
    this.snykToken = process.env.SECURECODE_SNYK_TOKEN;
    this.snykOrgId = process.env.SECURECODE_SNYK_ORG_ID;
    this.snykApiUrl = 'https://snyk.io/api/v1';
    
    // OWASP Dependency-Check
    this.owaspPath = process.env.SECURECODE_OWASP_DC_PATH || '/opt/dependency-check/bin/dependency-check.sh';
    
    // Vulnerability databases
    this.nvdApiKey = process.env.SECURECODE_NVD_API_KEY;
    this.ghsaToken = process.env.SECURECODE_GITHUB_TOKEN;
    
    // Cache for vulnerability data
    this.vulnCache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }
  
  /**
   * Scan dependencies for vulnerabilities
   */
  async scan(options = {}) {
    const {
      manifest,         // package.json, requirements.txt content
      manifestType,     // npm, pip, maven, gradle
      projectPath,      // Path to project for CLI tools
      scanners = ['npm-audit', 'snyk', 'builtin']
    } = options;
    
    const results = {
      vulnerabilities: [],
      dependencies: [],
      scanners: [],
      metrics: {
        totalDependencies: 0,
        vulnerableDependencies: 0,
        duration: 0
      },
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
    
    const startTime = Date.now();
    
    // Detect manifest type if not provided
    const detectedType = manifestType || this.detectManifestType(manifest);
    
    // Parse dependencies from manifest
    const deps = await this.parseDependencies(manifest, detectedType);
    results.dependencies = deps;
    results.metrics.totalDependencies = deps.length;
    
    // Run selected scanners
    const scanPromises = [];
    
    if (scanners.includes('npm-audit') && detectedType === 'npm') {
      scanPromises.push(this.runNpmAudit(manifest, projectPath));
    }
    
    if (scanners.includes('pip-audit') && detectedType === 'pip') {
      scanPromises.push(this.runPipAudit(manifest, projectPath));
    }
    
    if (scanners.includes('snyk') && this.snykToken) {
      scanPromises.push(this.runSnyk(manifest, detectedType, projectPath));
    }
    
    if (scanners.includes('owasp')) {
      scanPromises.push(this.runOwaspDependencyCheck(projectPath, detectedType));
    }
    
    if (scanners.includes('builtin')) {
      scanPromises.push(this.runBuiltinScan(deps, detectedType));
    }
    
    const scanResults = await Promise.allSettled(scanPromises);
    
    scanResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.vulnerabilities.push(...(result.value.vulnerabilities || []));
        results.scanners.push({
          name: result.value.scanner,
          duration: result.value.duration,
          vulnsFound: result.value.vulnerabilities?.length || 0,
          status: 'success'
        });
      } else if (result.status === 'rejected') {
        logger.warn(`Dependency scanner failed:`, result.reason);
        results.scanners.push({
          name: scanners[index],
          status: 'failed',
          error: result.reason?.message
        });
      }
    });
    
    // Deduplicate vulnerabilities
    results.vulnerabilities = this.deduplicateVulnerabilities(results.vulnerabilities);
    
    // Update summary
    results.vulnerabilities.forEach(v => {
      const severity = v.severity?.toLowerCase() || 'medium';
      if (results.summary[severity] !== undefined) {
        results.summary[severity]++;
      }
    });
    
    results.metrics.vulnerableDependencies = new Set(
      results.vulnerabilities.map(v => v.package)
    ).size;
    
    results.metrics.duration = Date.now() - startTime;
    
    return results;
  }
  
  /**
   * Run npm audit
   */
  async runNpmAudit(manifest, projectPath) {
    const startTime = Date.now();
    const vulnerabilities = [];
    
    try {
      let workDir = projectPath;
      let cleanup = false;
      
      // If no project path, create temp directory with manifest
      if (!projectPath && manifest) {
        workDir = `/tmp/npm-audit-${Date.now()}`;
        await fs.mkdir(workDir, { recursive: true });
        await fs.writeFile(path.join(workDir, 'package.json'), manifest);
        cleanup = true;
        
        // Run npm install to create package-lock.json
        try {
          await execAsync('npm install --package-lock-only', { 
            cwd: workDir, 
            timeout: 120000 
          });
        } catch (e) {
          // Continue even if install fails
        }
      }
      
      // Run npm audit
      const { stdout } = await execAsync('npm audit --json', {
        cwd: workDir,
        timeout: 120000
      }).catch(e => ({ stdout: e.stdout || '{}' })); // npm audit returns non-zero on vulnerabilities
      
      const report = JSON.parse(stdout);
      
      // Parse npm audit v7+ format
      if (report.vulnerabilities) {
        for (const [pkgName, vuln] of Object.entries(report.vulnerabilities)) {
          vulnerabilities.push({
            package: pkgName,
            version: vuln.range || vuln.version,
            severity: vuln.severity,
            title: vuln.title || `Vulnerability in ${pkgName}`,
            via: vuln.via?.filter(v => typeof v === 'object').map(v => v.title),
            fixAvailable: !!vuln.fixAvailable,
            fixVersion: vuln.fixAvailable?.version || vuln.fixAvailable?.name,
            isDirect: vuln.isDirect,
            effects: vuln.effects,
            scanner: 'npm-audit'
          });
        }
      }
      
      // Cleanup temp directory
      if (cleanup) {
        await fs.rm(workDir, { recursive: true, force: true });
      }
      
      return {
        scanner: 'npm-audit',
        vulnerabilities,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('npm audit failed:', error.message);
      return {
        scanner: 'npm-audit',
        vulnerabilities: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run pip-audit
   */
  async runPipAudit(manifest, projectPath) {
    const startTime = Date.now();
    const vulnerabilities = [];
    
    try {
      let workDir = projectPath;
      let cleanup = false;
      
      if (!projectPath && manifest) {
        workDir = `/tmp/pip-audit-${Date.now()}`;
        await fs.mkdir(workDir, { recursive: true });
        await fs.writeFile(path.join(workDir, 'requirements.txt'), manifest);
        cleanup = true;
      }
      
      // Run pip-audit
      const { stdout } = await execAsync(
        `pip-audit -r ${path.join(workDir, 'requirements.txt')} --format json`,
        { timeout: 180000 }
      ).catch(e => ({ stdout: e.stdout || '[]' }));
      
      const results = JSON.parse(stdout);
      
      for (const vuln of results) {
        vulnerabilities.push({
          package: vuln.name,
          version: vuln.version,
          severity: this.mapPipAuditSeverity(vuln.severity),
          vulnerabilityId: vuln.id,
          title: vuln.description,
          fixVersion: vuln.fix_versions?.[0],
          aliases: vuln.aliases,
          scanner: 'pip-audit'
        });
      }
      
      if (cleanup) {
        await fs.rm(workDir, { recursive: true, force: true });
      }
      
      return {
        scanner: 'pip-audit',
        vulnerabilities,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('pip-audit failed:', error.message);
      return {
        scanner: 'pip-audit',
        vulnerabilities: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run Snyk vulnerability scan
   */
  async runSnyk(manifest, manifestType, projectPath) {
    const startTime = Date.now();
    const vulnerabilities = [];
    
    if (!this.snykToken) {
      return {
        scanner: 'snyk',
        vulnerabilities: [],
        duration: 0,
        error: 'Snyk token not configured'
      };
    }
    
    try {
      // Parse dependencies for API call
      const deps = await this.parseDependencies(manifest, manifestType);
      
      // Build Snyk test request
      const packageManager = this.mapManifestTypeToSnyk(manifestType);
      const depGraph = this.buildSnykDepGraph(deps, packageManager);
      
      const response = await axios.post(
        `${this.snykApiUrl}/test/depgraph?org=${this.snykOrgId}`,
        { depGraph },
        {
          headers: {
            'Authorization': `token ${this.snykToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
      
      // Parse Snyk response
      if (response.data.result?.vulnerabilities) {
        for (const vuln of response.data.result.vulnerabilities) {
          vulnerabilities.push({
            package: vuln.package,
            version: vuln.version,
            severity: vuln.severity,
            vulnerabilityId: vuln.id,
            title: vuln.title,
            description: vuln.description,
            url: vuln.url,
            cve: vuln.identifiers?.CVE?.[0],
            cwe: vuln.identifiers?.CWE,
            cvssScore: vuln.cvssScore,
            cvssVector: vuln.CVSSv3,
            exploitMaturity: vuln.exploit,
            isPatchable: vuln.isPatchable,
            isUpgradable: vuln.isUpgradable,
            upgradePath: vuln.upgradePath,
            patches: vuln.patches,
            scanner: 'snyk'
          });
        }
      }
      
      return {
        scanner: 'snyk',
        vulnerabilities,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('Snyk scan failed:', error.message);
      return {
        scanner: 'snyk',
        vulnerabilities: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run OWASP Dependency-Check
   */
  async runOwaspDependencyCheck(projectPath, manifestType) {
    const startTime = Date.now();
    const vulnerabilities = [];
    
    if (!projectPath) {
      return {
        scanner: 'owasp-dc',
        vulnerabilities: [],
        duration: 0,
        error: 'Project path required for OWASP Dependency-Check'
      };
    }
    
    try {
      const outputDir = `/tmp/owasp-dc-${Date.now()}`;
      await fs.mkdir(outputDir, { recursive: true });
      
      // Run dependency-check
      const cmd = [
        this.owaspPath,
        '--scan', projectPath,
        '--out', outputDir,
        '--format', 'JSON',
        '--prettyPrint',
        '--failOnCVSS', '11' // Never fail, we handle results
      ];
      
      if (this.nvdApiKey) {
        cmd.push('--nvdApiKey', this.nvdApiKey);
      }
      
      await execAsync(cmd.join(' '), { timeout: 600000 }); // 10 min timeout
      
      // Parse results
      const reportPath = path.join(outputDir, 'dependency-check-report.json');
      if (await this.fileExists(reportPath)) {
        const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
        
        for (const dep of report.dependencies || []) {
          for (const vuln of dep.vulnerabilities || []) {
            vulnerabilities.push({
              package: dep.fileName,
              packagePath: dep.filePath,
              severity: this.mapCvssToSeverity(vuln.cvssv3?.baseScore || vuln.cvssv2?.score),
              vulnerabilityId: vuln.name,
              title: vuln.description?.substring(0, 200),
              description: vuln.description,
              cve: vuln.name.startsWith('CVE') ? vuln.name : null,
              cwe: vuln.cwes?.[0],
              cvssScore: vuln.cvssv3?.baseScore || vuln.cvssv2?.score,
              cvssVector: vuln.cvssv3?.attackVector || vuln.cvssv2?.accessVector,
              references: vuln.references?.map(r => r.url),
              scanner: 'owasp-dc'
            });
          }
        }
      }
      
      // Cleanup
      await fs.rm(outputDir, { recursive: true, force: true });
      
      return {
        scanner: 'owasp-dc',
        vulnerabilities,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('OWASP Dependency-Check failed:', error.message);
      return {
        scanner: 'owasp-dc',
        vulnerabilities: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Built-in vulnerability database check
   */
  async runBuiltinScan(dependencies, manifestType) {
    const startTime = Date.now();
    const vulnerabilities = [];
    
    try {
      // Fetch from GitHub Advisory Database
      for (const dep of dependencies) {
        const cached = this.getFromCache(dep.name, dep.version);
        if (cached) {
          vulnerabilities.push(...cached);
          continue;
        }
        
        const vulns = await this.queryGHSA(dep.name, manifestType);
        
        // Filter vulnerabilities affecting this version
        for (const vuln of vulns) {
          if (this.versionAffected(dep.version, vuln.vulnerableVersionRange)) {
            const entry = {
              package: dep.name,
              version: dep.version,
              severity: vuln.severity,
              vulnerabilityId: vuln.ghsaId,
              title: vuln.summary,
              description: vuln.description,
              cve: vuln.identifiers?.find(i => i.type === 'CVE')?.value,
              fixVersion: vuln.firstPatchedVersion?.identifier,
              publishedAt: vuln.publishedAt,
              url: `https://github.com/advisories/${vuln.ghsaId}`,
              scanner: 'builtin'
            };
            vulnerabilities.push(entry);
          }
        }
        
        // Cache the result
        this.setCache(dep.name, dep.version, vulnerabilities.filter(v => v.package === dep.name));
      }
      
      return {
        scanner: 'builtin',
        vulnerabilities,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('Built-in dependency scan failed:', error.message);
      return {
        scanner: 'builtin',
        vulnerabilities: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Query GitHub Security Advisory Database
   */
  async queryGHSA(packageName, ecosystem) {
    if (!this.ghsaToken) return [];
    
    const ecosystemMap = {
      npm: 'NPM',
      pip: 'PIP',
      maven: 'MAVEN',
      gradle: 'MAVEN',
      nuget: 'NUGET',
      rubygems: 'RUBYGEMS'
    };
    
    const query = `
      query($ecosystem: SecurityAdvisoryEcosystem!, $package: String!) {
        securityVulnerabilities(first: 100, ecosystem: $ecosystem, package: $package) {
          nodes {
            advisory {
              ghsaId
              summary
              description
              severity
              identifiers { type value }
              publishedAt
            }
            vulnerableVersionRange
            firstPatchedVersion { identifier }
          }
        }
      }
    `;
    
    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        {
          query,
          variables: {
            ecosystem: ecosystemMap[ecosystem] || 'NPM',
            package: packageName
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.ghsaToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      return (response.data.data?.securityVulnerabilities?.nodes || []).map(node => ({
        ...node.advisory,
        vulnerableVersionRange: node.vulnerableVersionRange,
        firstPatchedVersion: node.firstPatchedVersion
      }));
      
    } catch (error) {
      logger.debug(`GHSA query failed for ${packageName}:`, error.message);
      return [];
    }
  }
  
  // Helper methods
  detectManifestType(manifest) {
    if (!manifest) return 'npm';
    
    try {
      const parsed = JSON.parse(manifest);
      if (parsed.dependencies || parsed.devDependencies) return 'npm';
    } catch {
      // Not JSON
    }
    
    if (manifest.includes('==') || manifest.includes('>=')) return 'pip';
    if (manifest.includes('<dependency>')) return 'maven';
    if (manifest.includes('implementation') || manifest.includes('compile')) return 'gradle';
    
    return 'npm';
  }
  
  async parseDependencies(manifest, type) {
    const deps = [];
    
    try {
      if (type === 'npm') {
        const pkg = JSON.parse(manifest);
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        for (const [name, version] of Object.entries(allDeps)) {
          deps.push({
            name,
            version: version.replace(/[\^~><=]/g, ''),
            isDev: !!pkg.devDependencies?.[name],
            type: 'npm'
          });
        }
      } else if (type === 'pip') {
        const lines = manifest.split('\n');
        for (const line of lines) {
          const cleaned = line.trim().split('#')[0];
          if (!cleaned) continue;
          
          const match = cleaned.match(/^([a-zA-Z0-9_-]+)(?:[=<>~]+(.+))?$/);
          if (match) {
            deps.push({
              name: match[1],
              version: match[2] || '*',
              type: 'pip'
            });
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to parse dependencies:', error.message);
    }
    
    return deps;
  }
  
  mapManifestTypeToSnyk(type) {
    const map = {
      npm: 'npm',
      pip: 'pip',
      maven: 'maven',
      gradle: 'gradle',
      nuget: 'nuget'
    };
    return map[type] || 'npm';
  }
  
  buildSnykDepGraph(deps, packageManager) {
    // Build a simple dep graph for Snyk API
    const pkgs = deps.map((d, i) => ({
      id: `${d.name}@${d.version}`,
      info: {
        name: d.name,
        version: d.version
      }
    }));
    
    return {
      schemaVersion: '1.2.0',
      pkgManager: { name: packageManager },
      pkgs: [
        { id: 'root@1.0.0', info: { name: 'root', version: '1.0.0' } },
        ...pkgs
      ],
      graph: {
        rootNodeId: 'root@1.0.0',
        nodes: [
          {
            nodeId: 'root@1.0.0',
            pkgId: 'root@1.0.0',
            deps: pkgs.map(p => ({ nodeId: p.id }))
          },
          ...pkgs.map(p => ({
            nodeId: p.id,
            pkgId: p.id,
            deps: []
          }))
        ]
      }
    };
  }
  
  mapPipAuditSeverity(severity) {
    const map = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
      UNKNOWN: 'medium'
    };
    return map[severity] || 'medium';
  }
  
  mapCvssToSeverity(score) {
    if (!score) return 'medium';
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  }
  
  versionAffected(version, range) {
    // Simplified version range check
    if (!range || range === '*') return true;
    
    // Handle common patterns
    // < 1.0.0, >= 1.0.0 < 2.0.0, etc.
    try {
      const [major, minor, patch] = version.split('.').map(v => parseInt(v) || 0);
      
      // Simple check - if range starts with < or >=
      if (range.includes('<')) {
        const upperMatch = range.match(/<\s*(\d+\.\d+\.\d+)/);
        if (upperMatch) {
          const [uMajor, uMinor, uPatch] = upperMatch[1].split('.').map(v => parseInt(v) || 0);
          if (major < uMajor || 
              (major === uMajor && minor < uMinor) ||
              (major === uMajor && minor === uMinor && patch < uPatch)) {
            return true;
          }
        }
      }
      
      return true; // Default to affected if we can't parse
    } catch {
      return true;
    }
  }
  
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  getFromCache(name, version) {
    const key = `${name}@${version}`;
    const cached = this.vulnCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  
  setCache(name, version, data) {
    const key = `${name}@${version}`;
    this.vulnCache.set(key, { data, timestamp: Date.now() });
  }
  
  deduplicateVulnerabilities(vulns) {
    const seen = new Map();
    
    for (const vuln of vulns) {
      const key = `${vuln.package}-${vuln.vulnerabilityId || vuln.cve || vuln.title}`;
      
      if (!seen.has(key)) {
        seen.set(key, vuln);
      } else {
        // Merge scanner info
        const existing = seen.get(key);
        if (!existing.scanners) existing.scanners = [existing.scanner];
        if (!existing.scanners.includes(vuln.scanner)) {
          existing.scanners.push(vuln.scanner);
        }
      }
    }
    
    return Array.from(seen.values());
  }
}

module.exports = new DependenciesService();

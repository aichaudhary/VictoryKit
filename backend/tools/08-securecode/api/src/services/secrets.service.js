/**
 * Secrets Detection Service
 * Integrates with GitLeaks, TruffleHog for secret scanning
 */
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { logger } = require('../../../../../shared');

const execAsync = promisify(exec);

class SecretsService {
  constructor() {
    // GitLeaks configuration
    this.gitleaksPath = process.env.SECURECODE_GITLEAKS_PATH || 'gitleaks';
    this.gitleaksConfig = process.env.SECURECODE_GITLEAKS_CONFIG || '/opt/gitleaks.toml';
    
    // TruffleHog configuration
    this.trufflehogPath = process.env.SECURECODE_TRUFFLEHOG_PATH || 'trufflehog';
    this.trufflehogEnterpriseKey = process.env.SECURECODE_TRUFFLEHOG_ENTERPRISE_KEY;
    
    // Secret patterns for fallback/enhancement
    this.secretPatterns = this.initializeSecretPatterns();
    
    // Known false positive patterns
    this.falsePositivePatterns = [
      /example\.com/i,
      /test[_-]?(?:key|token|password)/i,
      /placeholder/i,
      /your[_-]?(?:key|token|password)/i,
      /xxx+/i,
      /dummy/i,
      /fake/i
    ];
  }
  
  /**
   * Scan for secrets in code
   */
  async scan(code, options = {}) {
    const { filename, scanners = ['gitleaks', 'builtin'] } = options;
    const results = {
      secrets: [],
      scanners: [],
      metrics: {
        linesScanned: code.split('\n').length,
        duration: 0
      }
    };
    
    const startTime = Date.now();
    
    // Run selected scanners
    const scanPromises = [];
    
    if (scanners.includes('gitleaks')) {
      scanPromises.push(this.runGitleaks(code, filename));
    }
    
    if (scanners.includes('trufflehog')) {
      scanPromises.push(this.runTrufflehog(code, filename));
    }
    
    // Always run built-in detection
    if (scanners.includes('builtin')) {
      scanPromises.push(this.runBuiltinDetection(code, filename));
    }
    
    const scanResults = await Promise.allSettled(scanPromises);
    
    scanResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.secrets.push(...(result.value.secrets || []));
        results.scanners.push({
          name: result.value.scanner,
          duration: result.value.duration,
          secretsCount: result.value.secrets?.length || 0,
          status: 'success'
        });
      } else if (result.status === 'rejected') {
        logger.warn(`Secret scanner failed:`, result.reason);
        results.scanners.push({
          name: scanners[index],
          status: 'failed',
          error: result.reason?.message
        });
      }
    });
    
    // Deduplicate and filter false positives
    results.secrets = this.processSecrets(results.secrets);
    
    results.metrics.duration = Date.now() - startTime;
    
    return results;
  }
  
  /**
   * Run GitLeaks detection
   */
  async runGitleaks(code, filename) {
    const startTime = Date.now();
    const secrets = [];
    
    try {
      const tempDir = `/tmp/gitleaks-${Date.now()}`;
      await fs.mkdir(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, filename || 'code.txt');
      await fs.writeFile(tempFile, code);
      
      const outputFile = path.join(tempDir, 'results.json');
      
      // Build gitleaks command
      const cmd = [
        this.gitleaksPath,
        'detect',
        '--source', tempDir,
        '--report-path', outputFile,
        '--report-format', 'json',
        '--no-git',
        '--exit-code', '0'  // Don't fail on findings
      ];
      
      if (await this.fileExists(this.gitleaksConfig)) {
        cmd.push('--config', this.gitleaksConfig);
      }
      
      await execAsync(cmd.join(' '), { timeout: 60000 });
      
      // Parse results
      if (await this.fileExists(outputFile)) {
        const content = await fs.readFile(outputFile, 'utf8');
        const findings = JSON.parse(content);
        
        for (const finding of findings) {
          secrets.push({
            type: this.mapGitleaksRuleToType(finding.RuleID),
            file: filename || finding.File,
            line: finding.StartLine,
            endLine: finding.EndLine,
            match: finding.Match,
            masked: this.maskSecret(finding.Secret || finding.Match),
            severity: this.getSeverityForSecretType(finding.RuleID),
            ruleId: finding.RuleID,
            entropy: finding.Entropy,
            commit: finding.Commit,
            author: finding.Author,
            date: finding.Date,
            scanner: 'gitleaks'
          });
        }
      }
      
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
      
      return {
        scanner: 'gitleaks',
        secrets,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('GitLeaks scan failed:', error.message);
      return {
        scanner: 'gitleaks',
        secrets: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Run TruffleHog detection
   */
  async runTrufflehog(code, filename) {
    const startTime = Date.now();
    const secrets = [];
    
    try {
      const tempDir = `/tmp/trufflehog-${Date.now()}`;
      await fs.mkdir(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, filename || 'code.txt');
      await fs.writeFile(tempFile, code);
      
      // Build trufflehog command
      const cmd = [
        this.trufflehogPath,
        'filesystem',
        tempDir,
        '--json',
        '--no-update'
      ];
      
      if (this.trufflehogEnterpriseKey) {
        cmd.push('--key', this.trufflehogEnterpriseKey);
      }
      
      const { stdout } = await execAsync(cmd.join(' '), { timeout: 120000 });
      
      // Parse JSON lines output
      const lines = stdout.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const finding = JSON.parse(line);
          
          secrets.push({
            type: this.mapTrufflehogDetectorToType(finding.DetectorName || finding.SourceName),
            file: filename,
            line: finding.SourceMetadata?.line || 1,
            match: finding.Raw,
            masked: this.maskSecret(finding.Raw),
            severity: finding.Verified ? 'critical' : 'high',
            verified: finding.Verified,
            detector: finding.DetectorName,
            extraData: finding.ExtraData,
            scanner: 'trufflehog'
          });
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
      
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
      
      return {
        scanner: 'trufflehog',
        secrets,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      logger.warn('TruffleHog scan failed:', error.message);
      return {
        scanner: 'trufflehog',
        secrets: [],
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  /**
   * Built-in secret detection (fallback)
   */
  async runBuiltinDetection(code, filename) {
    const startTime = Date.now();
    const secrets = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      for (const pattern of this.secretPatterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const secret = match[1] || match[0];
          
          // Skip if it's a false positive
          if (this.isFalsePositive(secret, line)) {
            continue;
          }
          
          // Calculate entropy to reduce false positives
          const entropy = this.calculateEntropy(secret);
          if (pattern.minEntropy && entropy < pattern.minEntropy) {
            continue;
          }
          
          secrets.push({
            type: pattern.type,
            file: filename || 'input',
            line: lineNum,
            match: match[0],
            masked: this.maskSecret(secret),
            severity: pattern.severity,
            entropy: entropy,
            patternName: pattern.name,
            scanner: 'builtin'
          });
        }
      }
    });
    
    return {
      scanner: 'builtin',
      secrets,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Verify if a secret is active (API call verification)
   */
  async verifySecret(secret, type) {
    const verifiers = {
      aws_access_key: this.verifyAWSKey.bind(this),
      github_token: this.verifyGitHubToken.bind(this),
      slack_token: this.verifySlackToken.bind(this),
      stripe_key: this.verifyStripeKey.bind(this)
    };
    
    const verifier = verifiers[type];
    if (!verifier) {
      return { verified: null, message: 'No verifier available for this secret type' };
    }
    
    try {
      return await verifier(secret);
    } catch (error) {
      return { verified: false, message: error.message };
    }
  }
  
  // Verification methods
  async verifyAWSKey(accessKey) {
    // AWS STS GetCallerIdentity would verify, but we shouldn't call with found keys
    // Instead, we verify format
    const isValidFormat = /^AKIA[0-9A-Z]{16}$/.test(accessKey);
    return {
      verified: isValidFormat ? null : false,
      message: isValidFormat 
        ? 'Valid AWS Access Key format - manual verification recommended'
        : 'Invalid AWS Access Key format'
    };
  }
  
  async verifyGitHubToken(token) {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        return { verified: true, message: 'Active GitHub token', user: response.data.login };
      }
      return { verified: false, message: 'Invalid or expired token' };
    } catch (error) {
      return { verified: null, message: 'Verification failed' };
    }
  }
  
  async verifySlackToken(token) {
    try {
      const response = await axios.post('https://slack.com/api/auth.test', null, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      return {
        verified: response.data.ok,
        message: response.data.ok ? 'Active Slack token' : 'Invalid token'
      };
    } catch (error) {
      return { verified: null, message: 'Verification failed' };
    }
  }
  
  async verifyStripeKey(key) {
    // Check format only - don't make actual Stripe calls
    const isLiveKey = key.startsWith('sk_live_');
    const isTestKey = key.startsWith('sk_test_');
    
    return {
      verified: null,
      message: isLiveKey 
        ? 'Live Stripe key - CRITICAL: requires immediate rotation'
        : isTestKey 
          ? 'Test Stripe key'
          : 'Unknown Stripe key format'
    };
  }
  
  /**
   * Initialize secret patterns
   */
  initializeSecretPatterns() {
    return [
      // AWS
      {
        name: 'AWS Access Key ID',
        type: 'aws_access_key',
        regex: /\b(AKIA[0-9A-Z]{16})\b/,
        severity: 'critical',
        minEntropy: 3.5
      },
      {
        name: 'AWS Secret Access Key',
        type: 'aws_secret_key',
        regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY|secret[_-]?key)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/i,
        severity: 'critical',
        minEntropy: 4.0
      },
      
      // GitHub
      {
        name: 'GitHub Token',
        type: 'github_token',
        regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/,
        severity: 'critical',
        minEntropy: 4.0
      },
      {
        name: 'GitHub OAuth Token',
        type: 'github_oauth',
        regex: /\b(gho_[a-zA-Z0-9]{36})\b/,
        severity: 'high'
      },
      
      // GitLab
      {
        name: 'GitLab Token',
        type: 'gitlab_token',
        regex: /\b(glpat-[a-zA-Z0-9_-]{20})\b/,
        severity: 'critical'
      },
      
      // Slack
      {
        name: 'Slack Token',
        type: 'slack_token',
        regex: /\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*)\b/,
        severity: 'high'
      },
      {
        name: 'Slack Webhook',
        type: 'slack_webhook',
        regex: /(https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+)/,
        severity: 'high'
      },
      
      // Stripe
      {
        name: 'Stripe Secret Key',
        type: 'stripe_key',
        regex: /\b(sk_live_[0-9a-zA-Z]{24,99})\b/,
        severity: 'critical'
      },
      {
        name: 'Stripe Test Key',
        type: 'stripe_test_key',
        regex: /\b(sk_test_[0-9a-zA-Z]{24,99})\b/,
        severity: 'medium'
      },
      
      // Private Keys
      {
        name: 'RSA Private Key',
        type: 'private_key',
        regex: /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
        severity: 'critical'
      },
      {
        name: 'EC Private Key',
        type: 'private_key',
        regex: /-----BEGIN EC PRIVATE KEY-----/,
        severity: 'critical'
      },
      {
        name: 'PGP Private Key',
        type: 'private_key',
        regex: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
        severity: 'critical'
      },
      
      // Database
      {
        name: 'MongoDB Connection String',
        type: 'database_url',
        regex: /mongodb(?:\+srv)?:\/\/[^:]+:([^@]+)@/,
        severity: 'critical'
      },
      {
        name: 'PostgreSQL/MySQL Connection String',
        type: 'database_url',
        regex: /(?:postgres|mysql|mariadb):\/\/[^:]+:([^@]+)@/,
        severity: 'critical'
      },
      
      // Generic
      {
        name: 'Generic API Key',
        type: 'api_key',
        regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{20,})['"]?/i,
        severity: 'high',
        minEntropy: 3.5
      },
      {
        name: 'Generic Secret',
        type: 'generic_secret',
        regex: /(?:secret|password|passwd|pwd|token)\s*[:=]\s*['"]([^'"]{8,})['"]?/i,
        severity: 'high',
        minEntropy: 3.0
      },
      
      // JWT
      {
        name: 'JWT Token',
        type: 'jwt',
        regex: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/,
        severity: 'medium'
      },
      
      // Google
      {
        name: 'Google API Key',
        type: 'google_api_key',
        regex: /\b(AIza[0-9A-Za-z_-]{35})\b/,
        severity: 'high'
      },
      
      // Firebase
      {
        name: 'Firebase Key',
        type: 'firebase_key',
        regex: /\b([a-zA-Z0-9_-]*:[a-zA-Z0-9_-]+@[a-z0-9-]+\.firebaseio\.com)\b/,
        severity: 'high'
      },
      
      // Twilio
      {
        name: 'Twilio API Key',
        type: 'twilio_key',
        regex: /\b(SK[a-fA-F0-9]{32})\b/,
        severity: 'high'
      },
      
      // SendGrid
      {
        name: 'SendGrid API Key',
        type: 'sendgrid_key',
        regex: /\b(SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43})\b/,
        severity: 'high'
      },
      
      // NPM
      {
        name: 'NPM Token',
        type: 'npm_token',
        regex: /\b(npm_[a-zA-Z0-9]{36})\b/,
        severity: 'high'
      }
    ];
  }
  
  // Helper methods
  maskSecret(secret) {
    if (!secret || secret.length < 8) return '***';
    const visibleLength = Math.min(4, Math.floor(secret.length / 4));
    return secret.substring(0, visibleLength) + '***' + secret.substring(secret.length - visibleLength);
  }
  
  calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }
  
  isFalsePositive(secret, line) {
    for (const pattern of this.falsePositivePatterns) {
      if (pattern.test(secret) || pattern.test(line)) {
        return true;
      }
    }
    return false;
  }
  
  mapGitleaksRuleToType(ruleId) {
    const map = {
      'aws-access-key-id': 'aws_access_key',
      'aws-secret-access-key': 'aws_secret_key',
      'github-pat': 'github_token',
      'gitlab-pat': 'gitlab_token',
      'slack-token': 'slack_token',
      'stripe-api-key': 'stripe_key',
      'private-key': 'private_key',
      'jwt': 'jwt',
      'generic-api-key': 'api_key'
    };
    return map[ruleId] || 'generic_secret';
  }
  
  mapTrufflehogDetectorToType(detector) {
    const map = {
      'AWS': 'aws_access_key',
      'GitHub': 'github_token',
      'GitLab': 'gitlab_token',
      'Slack': 'slack_token',
      'Stripe': 'stripe_key',
      'PrivateKey': 'private_key'
    };
    return map[detector] || 'generic_secret';
  }
  
  getSeverityForSecretType(ruleId) {
    const criticalTypes = ['aws', 'private-key', 'stripe-api-key', 'github-pat'];
    for (const type of criticalTypes) {
      if (ruleId.toLowerCase().includes(type)) return 'critical';
    }
    return 'high';
  }
  
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  processSecrets(secrets) {
    // Deduplicate by file, line, and type
    const seen = new Map();
    const processed = [];
    
    for (const secret of secrets) {
      const key = `${secret.file}-${secret.line}-${secret.type}`;
      
      if (seen.has(key)) {
        // Keep the one with verified status or higher confidence
        const existing = seen.get(key);
        if (secret.verified && !existing.verified) {
          seen.set(key, secret);
        }
      } else {
        // Filter false positives
        if (!this.isFalsePositive(secret.match || '', '')) {
          seen.set(key, secret);
        }
      }
    }
    
    return Array.from(seen.values());
  }
}

module.exports = new SecretsService();

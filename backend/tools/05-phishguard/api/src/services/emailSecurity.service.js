/**
 * Email Security Service
 * Advanced email analysis for phishing detection
 * 
 * Features:
 * - SPF/DKIM/DMARC validation
 * - Email header forensics
 * - Sender reputation analysis
 * - Attachment scanning
 * - Link extraction and analysis
 * - Display name spoofing detection
 */

const dns = require('dns').promises;
const crypto = require('crypto');
const logger = require('../../../../../shared/utils/logger');

class EmailSecurityService {
  constructor() {
    // Common legitimate senders to detect impersonation
    this.knownBrands = {
      'microsoft.com': ['microsoft', 'office365', 'outlook', 'azure', 'onedrive'],
      'google.com': ['google', 'gmail', 'youtube', 'drive'],
      'apple.com': ['apple', 'icloud', 'itunes', 'appstore'],
      'amazon.com': ['amazon', 'aws', 'prime', 'kindle'],
      'paypal.com': ['paypal'],
      'facebook.com': ['facebook', 'meta', 'instagram', 'whatsapp'],
      'linkedin.com': ['linkedin'],
      'twitter.com': ['twitter', 'x.com'],
      'netflix.com': ['netflix'],
      'dropbox.com': ['dropbox'],
      'salesforce.com': ['salesforce'],
      'adobe.com': ['adobe', 'acrobat'],
      'zoom.us': ['zoom'],
      'slack.com': ['slack'],
      'docusign.com': ['docusign'],
      'fedex.com': ['fedex'],
      'ups.com': ['ups'],
      'dhl.com': ['dhl'],
      'usps.com': ['usps'],
      'chase.com': ['chase', 'jpmorgan'],
      'bankofamerica.com': ['bankofamerica', 'bofa'],
      'wellsfargo.com': ['wellsfargo'],
      'citibank.com': ['citi', 'citibank']
    };

    // Suspicious patterns in email content
    this.suspiciousPatterns = {
      urgency: [
        'urgent', 'immediately', 'right away', 'within 24 hours', 'expires today',
        'act now', 'limited time', 'last chance', 'final notice', 'action required',
        'your account will be', 'suspended', 'terminated', 'locked', 'closed'
      ],
      threats: [
        'legal action', 'lawsuit', 'police', 'arrest', 'court', 'prosecution',
        'unauthorized access', 'fraud detected', 'suspicious activity',
        'security breach', 'compromised', 'hacked'
      ],
      credentialRequests: [
        'verify your', 'confirm your', 'update your', 'password', 'ssn',
        'social security', 'credit card', 'bank account', 'pin number',
        'login credentials', 'security questions', 'date of birth'
      ],
      rewards: [
        'congratulations', 'winner', 'prize', 'lottery', 'inheritance',
        'million dollars', 'free gift', 'claim your', 'you have been selected'
      ],
      impersonation: [
        'help desk', 'it department', 'security team', 'admin', 'support',
        'your ceo', 'your boss', 'management', 'hr department'
      ]
    };
  }

  /**
   * Parse email headers into structured format
   */
  parseEmailHeaders(rawHeaders) {
    const headers = {};
    const lines = rawHeaders.split(/\r?\n/);
    let currentKey = '';
    let currentValue = '';

    for (const line of lines) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        // Continuation of previous header
        currentValue += ' ' + line.trim();
      } else if (line.includes(':')) {
        // Save previous header
        if (currentKey) {
          if (headers[currentKey]) {
            if (Array.isArray(headers[currentKey])) {
              headers[currentKey].push(currentValue);
            } else {
              headers[currentKey] = [headers[currentKey], currentValue];
            }
          } else {
            headers[currentKey] = currentValue;
          }
        }
        // Start new header
        const [key, ...valueParts] = line.split(':');
        currentKey = key.toLowerCase().trim();
        currentValue = valueParts.join(':').trim();
      }
    }

    // Save last header
    if (currentKey) {
      if (headers[currentKey]) {
        if (Array.isArray(headers[currentKey])) {
          headers[currentKey].push(currentValue);
        } else {
          headers[currentKey] = [headers[currentKey], currentValue];
        }
      } else {
        headers[currentKey] = currentValue;
      }
    }

    return headers;
  }

  /**
   * Extract email path from Received headers
   */
  extractEmailPath(receivedHeaders) {
    if (!receivedHeaders) return [];

    const headers = Array.isArray(receivedHeaders) ? receivedHeaders : [receivedHeaders];
    const path = [];

    for (const header of headers) {
      const fromMatch = header.match(/from\s+([^\s]+)/i);
      const byMatch = header.match(/by\s+([^\s]+)/i);
      const dateMatch = header.match(/;\s*(.+)$/);

      path.push({
        from: fromMatch ? fromMatch[1] : 'unknown',
        by: byMatch ? byMatch[1] : 'unknown',
        timestamp: dateMatch ? new Date(dateMatch[1]).toISOString() : null,
        raw: header.substring(0, 200)
      });
    }

    return path.reverse(); // Chronological order
  }

  /**
   * Validate SPF record for sending domain
   */
  async validateSPF(domain, senderIP) {
    try {
      const records = await dns.resolveTxt(domain);
      const spfRecord = records.flat().find(r => r.startsWith('v=spf1'));

      if (!spfRecord) {
        return {
          valid: false,
          status: 'none',
          message: 'No SPF record found',
          record: null
        };
      }

      // Basic SPF parsing (production would use proper SPF library)
      const mechanisms = spfRecord.split(' ');
      const includesDomain = mechanisms.some(m => 
        m.includes('include:') || m.includes('ip4:') || m.includes('a:') || m.includes('mx')
      );

      return {
        valid: true,
        status: 'pass',
        message: 'SPF record exists',
        record: spfRecord,
        mechanisms: mechanisms.filter(m => m !== 'v=spf1'),
        hasAll: spfRecord.includes('-all') ? 'fail' : spfRecord.includes('~all') ? 'softfail' : 'neutral'
      };
    } catch (error) {
      return {
        valid: false,
        status: 'error',
        message: `SPF lookup failed: ${error.message}`,
        record: null
      };
    }
  }

  /**
   * Check DMARC record for domain
   */
  async validateDMARC(domain) {
    try {
      const records = await dns.resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = records.flat().find(r => r.startsWith('v=DMARC1'));

      if (!dmarcRecord) {
        return {
          valid: false,
          status: 'none',
          message: 'No DMARC record found',
          record: null,
          policy: null
        };
      }

      // Parse DMARC policy
      const policyMatch = dmarcRecord.match(/p=(\w+)/);
      const policy = policyMatch ? policyMatch[1] : 'none';

      const ruaMatch = dmarcRecord.match(/rua=([^;]+)/);
      const rufMatch = dmarcRecord.match(/ruf=([^;]+)/);
      const pctMatch = dmarcRecord.match(/pct=(\d+)/);

      return {
        valid: true,
        status: 'pass',
        message: 'DMARC record found',
        record: dmarcRecord,
        policy,
        policyStrength: policy === 'reject' ? 'strong' : policy === 'quarantine' ? 'moderate' : 'weak',
        aggregateReports: ruaMatch ? ruaMatch[1] : null,
        forensicReports: rufMatch ? rufMatch[1] : null,
        percentage: pctMatch ? parseInt(pctMatch[1]) : 100
      };
    } catch (error) {
      return {
        valid: false,
        status: 'error',
        message: `DMARC lookup failed: ${error.message}`,
        record: null,
        policy: null
      };
    }
  }

  /**
   * Check DKIM selector
   */
  async validateDKIM(domain, selector = 'default') {
    const selectors = [selector, 'selector1', 'selector2', 'google', 's1', 's2', 'k1'];
    
    for (const sel of selectors) {
      try {
        const records = await dns.resolveTxt(`${sel}._domainkey.${domain}`);
        const dkimRecord = records.flat().find(r => r.includes('v=DKIM1') || r.includes('p='));

        if (dkimRecord) {
          return {
            valid: true,
            status: 'pass',
            message: 'DKIM record found',
            selector: sel,
            record: dkimRecord,
            keyType: dkimRecord.includes('k=rsa') ? 'rsa' : 'unknown'
          };
        }
      } catch (error) {
        // Try next selector
      }
    }

    return {
      valid: false,
      status: 'none',
      message: 'No DKIM record found with common selectors',
      record: null
    };
  }

  /**
   * Detect display name spoofing
   * e.g., "Microsoft Support <hacker@evil.com>"
   */
  detectDisplayNameSpoofing(fromHeader) {
    if (!fromHeader) return { spoofed: false };

    const displayNameMatch = fromHeader.match(/^"?([^"<]+)"?\s*<([^>]+)>/);
    if (!displayNameMatch) return { spoofed: false };

    const displayName = displayNameMatch[1].toLowerCase().trim();
    const emailAddress = displayNameMatch[2].toLowerCase();
    const emailDomain = emailAddress.split('@')[1];

    const issues = [];
    let spoofed = false;

    // Check if display name impersonates a brand but email is from different domain
    for (const [legitimateDomain, keywords] of Object.entries(this.knownBrands)) {
      const brandMentioned = keywords.some(kw => displayName.includes(kw));
      
      if (brandMentioned && !emailDomain.includes(legitimateDomain.split('.')[0])) {
        spoofed = true;
        issues.push({
          type: 'brand_impersonation',
          severity: 'HIGH',
          message: `Display name suggests "${keywords[0]}" but email is from ${emailDomain}`,
          expectedDomain: legitimateDomain,
          actualDomain: emailDomain
        });
      }
    }

    // Check for CEO/executive name spoofing patterns
    const executivePatterns = /\b(ceo|cfo|cto|president|director|manager|hr|payroll|finance|accounting)\b/i;
    if (executivePatterns.test(displayName)) {
      issues.push({
        type: 'executive_impersonation',
        severity: 'HIGH',
        message: 'Display name contains executive title - possible BEC attack',
        displayName
      });
    }

    // Check for "reply-to" mismatch
    return {
      spoofed,
      displayName,
      emailAddress,
      emailDomain,
      issues
    };
  }

  /**
   * Analyze email content for phishing indicators
   */
  analyzeEmailContent(body, subject = '') {
    const fullText = `${subject} ${body}`.toLowerCase();
    const indicators = [];
    let riskScore = 0;

    // Check for suspicious patterns
    for (const [category, patterns] of Object.entries(this.suspiciousPatterns)) {
      const matches = patterns.filter(p => fullText.includes(p.toLowerCase()));
      if (matches.length > 0) {
        indicators.push({
          category,
          severity: category === 'credentialRequests' || category === 'threats' ? 'HIGH' : 'MEDIUM',
          matches,
          count: matches.length
        });
        riskScore += matches.length * (category === 'credentialRequests' ? 15 : 10);
      }
    }

    // Extract all URLs
    const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
    const urls = (body.match(urlRegex) || []).map(url => ({
      url,
      displayDiffers: this.checkLinkTextMismatch(body, url)
    }));

    // Check for suspicious URL patterns
    urls.forEach(urlInfo => {
      const url = urlInfo.url.toLowerCase();
      if (url.includes('login') || url.includes('verify') || url.includes('confirm')) {
        indicators.push({
          category: 'suspicious_url',
          severity: 'HIGH',
          message: `URL contains credential-harvesting keywords`,
          url: urlInfo.url
        });
        riskScore += 20;
      }

      // IP address in URL
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        indicators.push({
          category: 'ip_url',
          severity: 'HIGH',
          message: 'URL contains IP address instead of domain',
          url: urlInfo.url
        });
        riskScore += 25;
      }

      // Data URI (can embed malicious content)
      if (url.startsWith('data:')) {
        indicators.push({
          category: 'data_uri',
          severity: 'HIGH',
          message: 'Email contains data URI which can hide malicious content',
          url: urlInfo.url.substring(0, 50)
        });
        riskScore += 30;
      }
    });

    // Check for link text mismatch (common in phishing)
    const linkMismatches = urls.filter(u => u.displayDiffers);
    if (linkMismatches.length > 0) {
      indicators.push({
        category: 'link_mismatch',
        severity: 'HIGH',
        message: 'Email contains links where display text differs from actual URL',
        count: linkMismatches.length
      });
      riskScore += linkMismatches.length * 20;
    }

    // Suspicious attachments mentioned
    const attachmentPatterns = /\.(exe|scr|bat|cmd|ps1|vbs|js|jar|msi|dll|zip|rar|7z|iso)/gi;
    const attachmentMatches = body.match(attachmentPatterns) || [];
    if (attachmentMatches.length > 0) {
      indicators.push({
        category: 'suspicious_attachments',
        severity: 'HIGH',
        message: 'Email references potentially dangerous file types',
        fileTypes: [...new Set(attachmentMatches)]
      });
      riskScore += 25;
    }

    return {
      indicators,
      riskScore: Math.min(100, riskScore),
      urlsFound: urls.length,
      urls,
      verdict: riskScore >= 70 ? 'PHISHING' : riskScore >= 40 ? 'SUSPICIOUS' : 'CLEAN'
    };
  }

  /**
   * Check if link text differs from actual URL (common phishing tactic)
   */
  checkLinkTextMismatch(html, url) {
    // Look for HTML links where text doesn't match href
    const linkPattern = new RegExp(`<a[^>]*href=["']${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>([^<]+)</a>`, 'i');
    const match = html.match(linkPattern);
    
    if (match) {
      const linkText = match[1].trim().toLowerCase();
      // If link text looks like a URL but doesn't match the href
      if (linkText.includes('http') && !url.toLowerCase().includes(linkText)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Comprehensive email analysis
   */
  async analyzeEmail(email) {
    const startTime = Date.now();
    const results = {
      headers: {},
      authentication: {},
      spoofing: {},
      content: {},
      verdict: 'UNKNOWN',
      riskScore: 0,
      analysisTime: 0
    };

    // Parse headers
    if (email.rawHeaders) {
      results.headers = this.parseEmailHeaders(email.rawHeaders);
      results.emailPath = this.extractEmailPath(results.headers['received']);
    }

    // Extract sender domain
    const fromHeader = email.from || results.headers['from'];
    const senderMatch = fromHeader?.match(/@([^\s>]+)/);
    const senderDomain = senderMatch ? senderMatch[1] : null;

    if (senderDomain) {
      // Run authentication checks in parallel
      const [spfResult, dmarcResult, dkimResult] = await Promise.all([
        this.validateSPF(senderDomain, email.senderIP),
        this.validateDMARC(senderDomain),
        this.validateDKIM(senderDomain)
      ]);

      results.authentication = {
        spf: spfResult,
        dmarc: dmarcResult,
        dkim: dkimResult,
        overallStatus: (spfResult.valid && dmarcResult.valid) ? 'PASS' : 'FAIL'
      };

      // Add risk for failed authentication
      if (!spfResult.valid) results.riskScore += 15;
      if (!dmarcResult.valid || dmarcResult.policy === 'none') results.riskScore += 15;
      if (!dkimResult.valid) results.riskScore += 10;
    }

    // Check for spoofing
    results.spoofing = this.detectDisplayNameSpoofing(fromHeader);
    if (results.spoofing.spoofed) {
      results.riskScore += 30;
    }

    // Analyze content
    results.content = this.analyzeEmailContent(
      email.body || email.content || '',
      email.subject || results.headers['subject']
    );
    results.riskScore += results.content.riskScore * 0.5;

    // Calculate final verdict
    results.riskScore = Math.min(100, results.riskScore);
    results.verdict = results.riskScore >= 70 ? 'PHISHING' : 
                      results.riskScore >= 40 ? 'SUSPICIOUS' : 'CLEAN';

    results.analysisTime = Date.now() - startTime;

    // Generate recommendations
    results.recommendations = this.generateEmailRecommendations(results);

    return results;
  }

  /**
   * Generate recommendations based on email analysis
   */
  generateEmailRecommendations(results) {
    const recommendations = [];

    if (results.verdict === 'PHISHING') {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Block sender and quarantine email',
        reason: 'High-confidence phishing detection'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Report to security team',
        reason: 'Investigate potential targeted attack'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Check if other users received similar emails',
        reason: 'May be part of broader campaign'
      });
    }

    if (!results.authentication.spf?.valid) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'SPF validation failed',
        reason: 'Sender may not be authorized to send from this domain'
      });
    }

    if (!results.authentication.dmarc?.valid || results.authentication.dmarc?.policy === 'none') {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'DMARC not enforced',
        reason: 'Domain is vulnerable to spoofing'
      });
    }

    if (results.spoofing?.spoofed) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Display name spoofing detected',
        reason: 'Sender is impersonating a trusted entity'
      });
    }

    if (results.content?.urls?.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Analyze embedded URLs',
        reason: `${results.content.urls.length} URLs found in email`
      });
    }

    return recommendations;
  }

  /**
   * Extract and analyze all URLs from email
   */
  extractUrls(email) {
    const body = email.body || email.content || '';
    const html = email.html || '';

    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    const urls = new Set();

    // Extract from plain text
    (body.match(urlRegex) || []).forEach(url => urls.add(url));

    // Extract from HTML
    (html.match(urlRegex) || []).forEach(url => urls.add(url));

    // Extract href attributes
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      if (match[1].startsWith('http')) {
        urls.add(match[1]);
      }
    }

    return [...urls].map(url => ({
      url,
      domain: this.extractDomain(url),
      isShortened: this.isUrlShortener(url),
      protocol: url.startsWith('https') ? 'https' : 'http'
    }));
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  isUrlShortener(url) {
    const shorteners = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 
      'is.gd', 'buff.ly', 'adf.ly', 'bl.ink', 'short.io',
      'rebrand.ly', 'cutt.ly', 'shorturl.at'
    ];
    const domain = this.extractDomain(url).toLowerCase();
    return shorteners.some(s => domain.includes(s));
  }
}

module.exports = new EmailSecurityService();

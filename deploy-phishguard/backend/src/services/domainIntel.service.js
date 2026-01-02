/**
 * Domain Intelligence Service
 * Comprehensive domain analysis for phishing detection
 * 
 * Features:
 * - WHOIS lookup (domain age, registrar, registration date)
 * - DNS record analysis
 * - SSL certificate validation
 * - Domain reputation scoring
 * - Subdomain enumeration
 * - Historical DNS data
 */

const dns = require('dns').promises;
const https = require('https');
const tls = require('tls');
const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');

class DomainIntelService {
  constructor() {
    // Suspicious TLDs often used in phishing
    this.suspiciousTLDs = [
      '.tk', '.ml', '.ga', '.cf', '.gq', // Free TLDs
      '.xyz', '.top', '.work', '.click', '.link', '.info',
      '.online', '.site', '.website', '.space', '.buzz',
      '.icu', '.monster', '.rest', '.surf'
    ];

    // Known legitimate hosting providers
    this.legitimateProviders = [
      'cloudflare', 'amazon', 'google', 'microsoft', 'akamai',
      'fastly', 'digitalocean', 'linode', 'vultr', 'godaddy',
      'namecheap', 'bluehost', 'hostgator', 'ovh', 'hetzner'
    ];

    // Phishing-related keywords in domains
    this.suspiciousKeywords = [
      'login', 'signin', 'verify', 'confirm', 'account', 'secure',
      'update', 'banking', 'paypal', 'microsoft', 'apple', 'google',
      'amazon', 'netflix', 'facebook', 'instagram', 'support', 'help',
      'password', 'reset', 'unlock', 'suspended', 'alert', 'security'
    ];
  }

  /**
   * Get WHOIS information for a domain
   */
  async getWhoisInfo(domain) {
    const apiKey = process.env.WHOISXML_API_KEY;
    
    if (!apiKey) {
      return {
        available: false,
        error: 'WHOISXML API key not configured',
        docUrl: 'https://whois.whoisxmlapi.com/'
      };
    }

    try {
      const response = await axios.get(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService`,
        {
          params: {
            apiKey,
            domainName: domain,
            outputFormat: 'JSON'
          },
          timeout: 15000
        }
      );

      const data = response.data.WhoisRecord;
      
      // Calculate domain age
      const createdDate = data.createdDate || data.registryData?.createdDate;
      const expiresDate = data.expiresDate || data.registryData?.expiresDate;
      const updatedDate = data.updatedDate || data.registryData?.updatedDate;

      let domainAge = null;
      if (createdDate) {
        const created = new Date(createdDate);
        const now = new Date();
        domainAge = Math.floor((now - created) / (1000 * 60 * 60 * 24)); // days
      }

      return {
        available: true,
        domainName: data.domainName,
        registrar: data.registrarName || data.registryData?.registrarName,
        registrant: {
          name: data.registrant?.name,
          organization: data.registrant?.organization,
          country: data.registrant?.country,
          email: data.registrant?.email
        },
        createdDate,
        updatedDate,
        expiresDate,
        domainAge,
        domainAgeRisk: this.assessDomainAgeRisk(domainAge),
        nameServers: data.nameServers?.hostNames || [],
        status: data.status,
        dnssec: data.dnssec,
        rawData: data.rawText?.substring(0, 500)
      };
    } catch (error) {
      logger.error('WHOIS lookup error:', error.message);
      return { available: false, error: error.message };
    }
  }

  /**
   * Assess risk based on domain age
   */
  assessDomainAgeRisk(domainAgeDays) {
    if (domainAgeDays === null) return { risk: 'unknown', score: 50 };
    if (domainAgeDays < 7) return { risk: 'CRITICAL', score: 90, message: 'Domain created within last week' };
    if (domainAgeDays < 30) return { risk: 'HIGH', score: 70, message: 'Domain created within last month' };
    if (domainAgeDays < 90) return { risk: 'MEDIUM', score: 50, message: 'Domain created within last 3 months' };
    if (domainAgeDays < 365) return { risk: 'LOW', score: 30, message: 'Domain created within last year' };
    return { risk: 'MINIMAL', score: 10, message: 'Domain is over 1 year old' };
  }

  /**
   * Get comprehensive DNS records
   */
  async getDnsRecords(domain) {
    const records = {
      a: [],
      aaaa: [],
      mx: [],
      txt: [],
      ns: [],
      cname: [],
      soa: null
    };

    const queries = [
      { type: 'A', key: 'a', resolver: 'resolve4' },
      { type: 'AAAA', key: 'aaaa', resolver: 'resolve6' },
      { type: 'MX', key: 'mx', resolver: 'resolveMx' },
      { type: 'TXT', key: 'txt', resolver: 'resolveTxt' },
      { type: 'NS', key: 'ns', resolver: 'resolveNs' },
      { type: 'CNAME', key: 'cname', resolver: 'resolveCname' },
      { type: 'SOA', key: 'soa', resolver: 'resolveSoa' }
    ];

    const results = await Promise.allSettled(
      queries.map(async q => {
        try {
          const result = await dns[q.resolver](domain);
          return { key: q.key, type: q.type, result };
        } catch (error) {
          return { key: q.key, type: q.type, error: error.code || error.message };
        }
      })
    );

    results.forEach(r => {
      if (r.status === 'fulfilled' && !r.value.error) {
        const { key, result } = r.value;
        if (key === 'mx') {
          records[key] = result.map(mx => ({
            priority: mx.priority,
            exchange: mx.exchange
          })).sort((a, b) => a.priority - b.priority);
        } else if (key === 'txt') {
          records[key] = result.flat();
        } else if (key === 'soa') {
          records[key] = result;
        } else {
          records[key] = result;
        }
      }
    });

    // Extract useful info from DNS
    const analysis = this.analyzeDnsRecords(records);

    return {
      records,
      analysis,
      hasMailRecords: records.mx.length > 0,
      hasSPF: records.txt.some(r => r.startsWith('v=spf1')),
      hasDMARC: false, // Need to query _dmarc.domain
      nameServerProvider: this.identifyProvider(records.ns)
    };
  }

  /**
   * Analyze DNS records for suspicious patterns
   */
  analyzeDnsRecords(records) {
    const issues = [];

    // Check for suspicious TXT records
    const suspiciousTxt = records.txt.filter(r => 
      r.includes('v=spf1') && r.includes('+all')
    );
    if (suspiciousTxt.length > 0) {
      issues.push({
        type: 'weak_spf',
        severity: 'MEDIUM',
        message: 'SPF record uses +all which allows any sender'
      });
    }

    // No MX records could indicate throwaway domain
    if (records.mx.length === 0 && records.a.length > 0) {
      issues.push({
        type: 'no_mail',
        severity: 'LOW',
        message: 'Domain has no mail records - may be single-purpose'
      });
    }

    // Check for wildcard DNS (common in phishing infrastructure)
    // This would require additional probing

    return issues;
  }

  /**
   * Identify hosting/DNS provider from nameservers
   */
  identifyProvider(nameservers) {
    if (!nameservers || nameservers.length === 0) return 'unknown';

    const ns = nameservers.join(' ').toLowerCase();
    
    if (ns.includes('cloudflare')) return 'Cloudflare';
    if (ns.includes('awsdns')) return 'AWS Route53';
    if (ns.includes('google')) return 'Google Cloud DNS';
    if (ns.includes('azure')) return 'Azure DNS';
    if (ns.includes('godaddy')) return 'GoDaddy';
    if (ns.includes('namecheap')) return 'Namecheap';
    if (ns.includes('domaincontrol')) return 'GoDaddy';
    if (ns.includes('registrar-servers')) return 'Namecheap';

    return 'Other';
  }

  /**
   * Get SSL certificate information
   */
  async getSslInfo(domain) {
    return new Promise((resolve) => {
      const options = {
        host: domain,
        port: 443,
        servername: domain,
        rejectUnauthorized: false,
        timeout: 10000
      };

      const socket = tls.connect(options, () => {
        try {
          const cert = socket.getPeerCertificate(true);
          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            resolve({ available: false, error: 'No certificate found' });
            return;
          }

          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
          const certAge = Math.floor((now - validFrom) / (1000 * 60 * 60 * 24));

          resolve({
            available: true,
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysUntilExpiry,
            certAge,
            serialNumber: cert.serialNumber,
            fingerprint: cert.fingerprint,
            fingerprint256: cert.fingerprint256,
            subjectAltNames: cert.subjectaltname?.split(', ') || [],
            isValid: now >= validFrom && now <= validTo,
            isExpiringSoon: daysUntilExpiry < 30,
            issuerOrg: cert.issuer?.O,
            isFree: this.isFreeCertificate(cert.issuer?.O),
            certType: this.identifyCertType(cert),
            riskAssessment: this.assessCertRisk(cert, daysUntilExpiry, certAge)
          });
        } catch (error) {
          socket.end();
          resolve({ available: false, error: error.message });
        }
      });

      socket.on('error', (error) => {
        resolve({ available: false, error: error.message });
      });

      socket.on('timeout', () => {
        socket.end();
        resolve({ available: false, error: 'Connection timeout' });
      });
    });
  }

  /**
   * Check if certificate is from free CA
   */
  isFreeCertificate(issuer) {
    if (!issuer) return false;
    const freeIssuers = ["Let's Encrypt", 'ZeroSSL', 'Cloudflare', 'cPanel'];
    return freeIssuers.some(fi => issuer.toLowerCase().includes(fi.toLowerCase()));
  }

  /**
   * Identify certificate type (DV, OV, EV)
   */
  identifyCertType(cert) {
    // EV certificates have organization info in subject
    if (cert.subject?.O && cert.subject?.L && cert.subject?.ST) {
      return 'EV';
    }
    // OV certificates have organization info
    if (cert.subject?.O) {
      return 'OV';
    }
    // DV certificates only have CN
    return 'DV';
  }

  /**
   * Assess SSL certificate risk
   */
  assessCertRisk(cert, daysUntilExpiry, certAge) {
    const issues = [];
    let riskScore = 0;

    // Very new certificate
    if (certAge < 7) {
      issues.push({
        type: 'new_cert',
        severity: 'HIGH',
        message: 'SSL certificate was issued within the last week'
      });
      riskScore += 30;
    } else if (certAge < 30) {
      issues.push({
        type: 'recent_cert',
        severity: 'MEDIUM',
        message: 'SSL certificate was issued within the last month'
      });
      riskScore += 15;
    }

    // Free certificate (not inherently bad but commonly used in phishing)
    if (this.isFreeCertificate(cert.issuer?.O)) {
      issues.push({
        type: 'free_cert',
        severity: 'LOW',
        message: 'Using free SSL certificate (common in phishing)'
      });
      riskScore += 10;
    }

    // DV certificate only
    if (this.identifyCertType(cert) === 'DV') {
      issues.push({
        type: 'dv_only',
        severity: 'LOW',
        message: 'Domain Validation only - no organization verification'
      });
      riskScore += 5;
    }

    return { riskScore, issues };
  }

  /**
   * Analyze domain name for suspicious patterns
   */
  analyzeDomainName(domain) {
    const issues = [];
    let riskScore = 0;

    // Check TLD
    const tld = '.' + domain.split('.').pop();
    if (this.suspiciousTLDs.includes(tld.toLowerCase())) {
      issues.push({
        type: 'suspicious_tld',
        severity: 'HIGH',
        message: `Suspicious TLD: ${tld}`
      });
      riskScore += 25;
    }

    // Check for brand keywords
    const domainLower = domain.toLowerCase();
    const brandKeywords = this.suspiciousKeywords.filter(kw => domainLower.includes(kw));
    if (brandKeywords.length > 0) {
      issues.push({
        type: 'brand_keywords',
        severity: 'HIGH',
        message: `Contains brand/phishing keywords: ${brandKeywords.join(', ')}`
      });
      riskScore += 20;
    }

    // Check for excessive hyphens
    const hyphenCount = (domain.match(/-/g) || []).length;
    if (hyphenCount > 2) {
      issues.push({
        type: 'excessive_hyphens',
        severity: 'MEDIUM',
        message: `Excessive hyphens in domain (${hyphenCount})`
      });
      riskScore += 15;
    }

    // Check for numbers in domain
    const numberCount = (domain.match(/\d/g) || []).length;
    if (numberCount > 3) {
      issues.push({
        type: 'many_numbers',
        severity: 'MEDIUM',
        message: `Many numbers in domain (${numberCount})`
      });
      riskScore += 10;
    }

    // Check domain length
    if (domain.length > 30) {
      issues.push({
        type: 'long_domain',
        severity: 'LOW',
        message: `Unusually long domain (${domain.length} chars)`
      });
      riskScore += 10;
    }

    // Check subdomain depth
    const subdomainDepth = domain.split('.').length - 2;
    if (subdomainDepth > 3) {
      issues.push({
        type: 'deep_subdomains',
        severity: 'MEDIUM',
        message: `Deep subdomain structure (${subdomainDepth} levels)`
      });
      riskScore += 15;
    }

    return {
      domain,
      tld,
      subdomainDepth,
      hyphenCount,
      numberCount,
      length: domain.length,
      issues,
      riskScore: Math.min(100, riskScore)
    };
  }

  /**
   * Check domain against SecurityTrails for historical data
   */
  async getSecurityTrailsData(domain) {
    const apiKey = process.env.SECURITYTRAILS_API_KEY;
    if (!apiKey) {
      return { available: false, error: 'SecurityTrails API key not configured' };
    }

    try {
      const [domainInfo, dnsHistory] = await Promise.all([
        axios.get(
          `https://api.securitytrails.com/v1/domain/${domain}`,
          {
            headers: { 'APIKEY': apiKey },
            timeout: 10000
          }
        ),
        axios.get(
          `https://api.securitytrails.com/v1/history/${domain}/dns/a`,
          {
            headers: { 'APIKEY': apiKey },
            timeout: 10000
          }
        )
      ]);

      return {
        available: true,
        alexa_rank: domainInfo.data.alexa_rank,
        apex_domain: domainInfo.data.apex_domain,
        current_dns: domainInfo.data.current_dns,
        subdomain_count: domainInfo.data.subdomain_count,
        hostname_count: domainInfo.data.hostname_count,
        dnsHistory: {
          totalRecords: dnsHistory.data.record_count,
          records: (dnsHistory.data.records || []).slice(0, 20).map(r => ({
            firstSeen: r.first_seen,
            lastSeen: r.last_seen,
            type: r.type,
            values: r.values
          }))
        }
      };
    } catch (error) {
      logger.error('SecurityTrails error:', error.message);
      return { available: false, error: error.message };
    }
  }

  /**
   * Comprehensive domain analysis
   */
  async analyzeDomain(domain) {
    const startTime = Date.now();

    // Run all analyses in parallel
    const [
      domainAnalysis,
      whoisInfo,
      dnsRecords,
      sslInfo,
      securityTrails
    ] = await Promise.allSettled([
      Promise.resolve(this.analyzeDomainName(domain)),
      this.getWhoisInfo(domain),
      this.getDnsRecords(domain),
      this.getSslInfo(domain),
      this.getSecurityTrailsData(domain)
    ]);

    // Aggregate results
    const results = {
      domain,
      analysisTime: Date.now() - startTime,
      domainAnalysis: domainAnalysis.status === 'fulfilled' ? domainAnalysis.value : null,
      whois: whoisInfo.status === 'fulfilled' ? whoisInfo.value : null,
      dns: dnsRecords.status === 'fulfilled' ? dnsRecords.value : null,
      ssl: sslInfo.status === 'fulfilled' ? sslInfo.value : null,
      securityTrails: securityTrails.status === 'fulfilled' ? securityTrails.value : null
    };

    // Calculate overall risk score
    let totalRiskScore = 0;
    let factors = 0;

    if (results.domainAnalysis?.riskScore) {
      totalRiskScore += results.domainAnalysis.riskScore;
      factors++;
    }

    if (results.whois?.domainAgeRisk?.score) {
      totalRiskScore += results.whois.domainAgeRisk.score;
      factors++;
    }

    if (results.ssl?.riskAssessment?.riskScore) {
      totalRiskScore += results.ssl.riskAssessment.riskScore;
      factors++;
    }

    results.overallRiskScore = factors > 0 ? Math.round(totalRiskScore / factors) : 50;
    results.verdict = results.overallRiskScore >= 70 ? 'HIGH_RISK' :
                      results.overallRiskScore >= 40 ? 'MEDIUM_RISK' : 'LOW_RISK';

    // Compile all issues
    results.allIssues = [
      ...(results.domainAnalysis?.issues || []),
      ...(results.whois?.domainAgeRisk ? [results.whois.domainAgeRisk] : []),
      ...(results.ssl?.riskAssessment?.issues || []),
      ...(results.dns?.analysis || [])
    ];

    return results;
  }
}

module.exports = new DomainIntelService();

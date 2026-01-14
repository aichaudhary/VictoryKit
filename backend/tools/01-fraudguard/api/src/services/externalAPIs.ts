/**
 * External API Client Wrapper
 * Unified interface for all external security APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// API Configuration
const API_CONFIG = {
  virustotal: {
    baseURL: 'https://www.virustotal.com/api/v3',
    key: process.env.VIRUSTOTAL_API_KEY || '',
  },
  googleSafeBrowsing: {
    baseURL: 'https://safebrowsing.googleapis.com/v4',
    key: process.env.GOOGLE_SAFE_BROWSING_KEY || '',
  },
  urlscan: {
    baseURL: 'https://urlscan.io/api/v1',
    key: process.env.URLSCAN_API_KEY || '',
  },
  hibp: {
    baseURL: 'https://haveibeenpwned.com/api/v3',
    key: process.env.HIBP_API_KEY || '',
  },
  abuseipdb: {
    baseURL: 'https://api.abuseipdb.com/api/v2',
    key: process.env.ABUSEIPDB_API_KEY || '',
  },
  ipqualityscore: {
    baseURL: 'https://ipqualityscore.com/api/json',
    key: process.env.IPQS_API_KEY || '',
  },
  numverify: {
    baseURL: 'http://apilayer.net/api',
    key: process.env.NUMVERIFY_API_KEY || '',
  },
};

// Create axios instances for each API
function createClient(config: { baseURL: string; key: string }, headers?: Record<string, string>): AxiosInstance {
  return axios.create({
    baseURL: config.baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// VirusTotal Client
export const virusTotalClient = createClient(API_CONFIG.virustotal, {
  'x-apikey': API_CONFIG.virustotal.key,
});

// Google Safe Browsing Client
export const safeBrowsingClient = createClient(API_CONFIG.googleSafeBrowsing);

// URLScan.io Client
export const urlscanClient = createClient(API_CONFIG.urlscan, {
  'API-Key': API_CONFIG.urlscan.key,
});

// Have I Been Pwned Client
export const hibpClient = createClient(API_CONFIG.hibp, {
  'hibp-api-key': API_CONFIG.hibp.key,
  'user-agent': 'FraudGuard-MaulaAI',
});

// AbuseIPDB Client
export const abuseipdbClient = createClient(API_CONFIG.abuseipdb, {
  'Key': API_CONFIG.abuseipdb.key,
  'Accept': 'application/json',
});

// IPQualityScore Client
export const ipqsClient = createClient(API_CONFIG.ipqualityscore);

// NumVerify Client
export const numverifyClient = createClient(API_CONFIG.numverify);

/**
 * VirusTotal API Functions
 */
export const virusTotal = {
  // Scan a URL
  async scanURL(url: string): Promise<any> {
    try {
      // First, submit URL for scanning
      const encoded = Buffer.from(url).toString('base64').replace(/=/g, '');
      const response = await virusTotalClient.get(`/urls/${encoded}`);
      return {
        success: true,
        data: response.data.data,
        stats: response.data.data.attributes.last_analysis_stats,
        results: response.data.data.attributes.last_analysis_results,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // URL not found, submit for scanning
        const formData = new URLSearchParams();
        formData.append('url', url);
        const submitResponse = await virusTotalClient.post('/urls', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return {
          success: true,
          submitted: true,
          analysisId: submitResponse.data.data.id,
          message: 'URL submitted for analysis',
        };
      }
      logger.error('VirusTotal API error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get URL report
  async getURLReport(urlId: string): Promise<any> {
    try {
      const response = await virusTotalClient.get(`/analyses/${urlId}`);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      logger.error('VirusTotal report error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Google Safe Browsing API Functions
 */
export const googleSafeBrowsing = {
  // Check URLs against Safe Browsing
  async checkURLs(urls: string[]): Promise<any> {
    try {
      const response = await safeBrowsingClient.post(
        `/threatMatches:find?key=${API_CONFIG.googleSafeBrowsing.key}`,
        {
          client: {
            clientId: 'fraudguard-maula',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.map(url => ({ url })),
          },
        }
      );
      
      return {
        success: true,
        threats: response.data.matches || [],
        isSafe: !response.data.matches || response.data.matches.length === 0,
      };
    } catch (error: any) {
      logger.error('Google Safe Browsing error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * URLScan.io API Functions
 */
export const urlscan = {
  // Submit URL for scanning
  async scan(url: string, visibility: 'public' | 'unlisted' | 'private' = 'unlisted'): Promise<any> {
    try {
      const response = await urlscanClient.post('/scan/', {
        url,
        visibility,
      });
      return {
        success: true,
        uuid: response.data.uuid,
        resultUrl: response.data.result,
        apiUrl: response.data.api,
      };
    } catch (error: any) {
      logger.error('URLScan.io error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get scan result
  async getResult(uuid: string): Promise<any> {
    try {
      const response = await urlscanClient.get(`/result/${uuid}/`);
      return { success: true, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: false, pending: true, message: 'Scan still in progress' };
      }
      logger.error('URLScan.io result error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Search for existing scans
  async search(query: string): Promise<any> {
    try {
      const response = await urlscanClient.get(`/search/?q=${encodeURIComponent(query)}`);
      return { success: true, results: response.data.results };
    } catch (error: any) {
      logger.error('URLScan.io search error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Have I Been Pwned API Functions
 */
export const hibp = {
  // Check if email has been in breaches
  async checkBreaches(email: string): Promise<any> {
    try {
      const response = await hibpClient.get(`/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`);
      return {
        success: true,
        breached: true,
        breachCount: response.data.length,
        breaches: response.data.map((breach: any) => ({
          name: breach.Name,
          title: breach.Title,
          domain: breach.Domain,
          date: breach.BreachDate,
          addedDate: breach.AddedDate,
          dataClasses: breach.DataClasses,
          description: breach.Description,
          isVerified: breach.IsVerified,
          isSensitive: breach.IsSensitive,
          pwnCount: breach.PwnCount,
        })),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, breached: false, breachCount: 0, breaches: [] };
      }
      logger.error('HIBP breaches error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Check if email is in pastes
  async checkPastes(email: string): Promise<any> {
    try {
      const response = await hibpClient.get(`/pasteaccount/${encodeURIComponent(email)}`);
      return {
        success: true,
        pasteCount: response.data.length,
        pastes: response.data,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, pasteCount: 0, pastes: [] };
      }
      logger.error('HIBP pastes error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Check password against pwned passwords (k-anonymity)
  async checkPassword(password: string): Promise<any> {
    try {
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split('\n');
      
      for (const line of hashes) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return {
            success: true,
            pwned: true,
            count: parseInt(count.trim(), 10),
            message: `This password has been seen ${count.trim()} times in data breaches`,
          };
        }
      }
      
      return {
        success: true,
        pwned: false,
        count: 0,
        message: 'This password has not been found in known data breaches',
      };
    } catch (error: any) {
      logger.error('HIBP password check error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * AbuseIPDB API Functions
 */
export const abuseIPDB = {
  // Check IP reputation
  async check(ip: string, maxAgeInDays: number = 90): Promise<any> {
    try {
      const response = await abuseipdbClient.get('/check', {
        params: {
          ipAddress: ip,
          maxAgeInDays,
          verbose: true,
        },
      });
      
      const data = response.data.data;
      return {
        success: true,
        ip: data.ipAddress,
        isPublic: data.isPublic,
        abuseConfidenceScore: data.abuseConfidenceScore,
        countryCode: data.countryCode,
        countryName: data.countryName,
        isp: data.isp,
        domain: data.domain,
        usageType: data.usageType,
        hostnames: data.hostnames,
        isTor: data.isTor,
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        reports: data.reports || [],
      };
    } catch (error: any) {
      logger.error('AbuseIPDB check error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Report IP for abuse
  async report(ip: string, categories: number[], comment: string): Promise<any> {
    try {
      const response = await abuseipdbClient.post('/report', {
        ip,
        categories: categories.join(','),
        comment,
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      logger.error('AbuseIPDB report error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * IPQualityScore API Functions
 */
export const ipQualityScore = {
  // Check IP fraud score
  async checkIP(ip: string): Promise<any> {
    try {
      const response = await ipqsClient.get(`/ip/${API_CONFIG.ipqualityscore.key}/${ip}`, {
        params: {
          strictness: 1,
          allow_public_access_points: true,
          lighter_penalties: false,
        },
      });
      
      return {
        success: response.data.success,
        fraudScore: response.data.fraud_score,
        isProxy: response.data.proxy,
        isVPN: response.data.vpn,
        isTor: response.data.tor,
        isBot: response.data.bot_status,
        isCrawler: response.data.is_crawler,
        recentAbuse: response.data.recent_abuse,
        country: response.data.country_code,
        city: response.data.city,
        isp: response.data.ISP,
        organization: response.data.organization,
        asn: response.data.ASN,
        host: response.data.host,
        connectionType: response.data.connection_type,
        abuseVelocity: response.data.abuse_velocity,
      };
    } catch (error: any) {
      logger.error('IPQualityScore error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Check email reputation
  async checkEmail(email: string): Promise<any> {
    try {
      const response = await ipqsClient.get(`/email/${API_CONFIG.ipqualityscore.key}/${encodeURIComponent(email)}`, {
        params: {
          fast: false,
          timeout: 20,
        },
      });
      
      return {
        success: response.data.success,
        valid: response.data.valid,
        disposable: response.data.disposable,
        smtpScore: response.data.smtp_score,
        deliverability: response.data.deliverability,
        catchAll: response.data.catch_all,
        generic: response.data.generic,
        common: response.data.common,
        dnsValid: response.data.dns_valid,
        honeypot: response.data.honeypot,
        spamTrapScore: response.data.spam_trap_score,
        recentAbuse: response.data.recent_abuse,
        fraudScore: response.data.fraud_score,
        leaked: response.data.leaked,
        suggestedDomain: response.data.suggested_domain,
        firstSeen: response.data.first_seen,
        domainAge: response.data.domain_age,
      };
    } catch (error: any) {
      logger.error('IPQualityScore email error:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Check phone number
  async checkPhone(phone: string, country?: string): Promise<any> {
    try {
      const params: any = {};
      if (country) params.country = country;
      
      const response = await ipqsClient.get(`/phone/${API_CONFIG.ipqualityscore.key}/${encodeURIComponent(phone)}`, {
        params,
      });
      
      return {
        success: response.data.success,
        formatted: response.data.formatted,
        localFormat: response.data.local_format,
        valid: response.data.valid,
        fraudScore: response.data.fraud_score,
        recentAbuse: response.data.recent_abuse,
        voip: response.data.VOIP,
        prepaid: response.data.prepaid,
        risky: response.data.risky,
        active: response.data.active,
        carrier: response.data.carrier,
        lineType: response.data.line_type,
        country: response.data.country,
        city: response.data.city,
        zipCode: response.data.zip_code,
        region: response.data.region,
        timezone: response.data.timezone,
        smsMfa: response.data.sms_mfa,
        spamNumberLikelihood: response.data.spam_number_likelihood,
      };
    } catch (error: any) {
      logger.error('IPQualityScore phone error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

/**
 * NumVerify API Functions
 */
export const numVerify = {
  // Validate phone number
  async validate(phone: string, countryCode?: string): Promise<any> {
    try {
      const params: any = {
        access_key: API_CONFIG.numverify.key,
        number: phone,
        format: 1,
      };
      if (countryCode) params.country_code = countryCode;
      
      const response = await numverifyClient.get('/validate', { params });
      
      if (!response.data.valid && response.data.error) {
        return { success: false, error: response.data.error.info };
      }
      
      return {
        success: true,
        valid: response.data.valid,
        number: response.data.number,
        localFormat: response.data.local_format,
        internationalFormat: response.data.international_format,
        countryPrefix: response.data.country_prefix,
        countryCode: response.data.country_code,
        countryName: response.data.country_name,
        location: response.data.location,
        carrier: response.data.carrier,
        lineType: response.data.line_type,
      };
    } catch (error: any) {
      logger.error('NumVerify error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

// Export all APIs
export default {
  virusTotal,
  googleSafeBrowsing,
  urlscan,
  hibp,
  abuseIPDB,
  ipQualityScore,
  numVerify,
};

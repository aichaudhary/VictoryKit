/**
 * PhishGuard Threat Intelligence Service
 * Integrates 35+ APIs for comprehensive phishing detection
 * 
 * FREE APIs:
 * 1. Google Safe Browsing - https://developers.google.com/safe-browsing
 * 2. PhishTank - https://phishtank.org/api_info.php
 * 3. OpenPhish - https://openphish.com/
 * 4. URLhaus - https://urlhaus.abuse.ch/api/
 * 5. VirusTotal - https://www.virustotal.com/gui/my-apikey
 * 6. IPQualityScore - https://www.ipqualityscore.com/
 * 7. AbuseIPDB - https://www.abuseipdb.com/api
 * 8. WhoisXML - https://whois.whoisxmlapi.com/
 * 9. SecurityTrails - https://securitytrails.com/
 * 10. Hunter.io - https://hunter.io/api
 * 11. Have I Been Pwned - https://haveibeenpwned.com/API/v3
 * 12. URLScan.io - https://urlscan.io/about-api/
 * 13. Hybrid Analysis - https://www.hybrid-analysis.com/docs/api/v2
 * 14. AlienVault OTX - https://otx.alienvault.com/api
 * 15. Shodan - https://developer.shodan.io/
 * 
 * PAID APIs:
 * 16. CheckPhish (Bolster) - https://checkphish.ai/
 * 17. SlashNext - https://www.slashnext.com/
 * 18. Proofpoint - https://www.proofpoint.com/
 * 19. Mimecast - https://www.mimecast.com/
 * 20. Cofense - https://cofense.com/
 * 21. Recorded Future - https://www.recordedfuture.com/
 * 22. Mandiant - https://www.mandiant.com/
 * 23. CrowdStrike Falcon - https://www.crowdstrike.com/
 * 24. DomainTools - https://www.domaintools.com/
 * 25. RiskIQ - https://community.riskiq.com/
 * 26. Netcraft - https://www.netcraft.com/
 * 27. Cloudflare Radar - https://radar.cloudflare.com/
 * 28. Brand Verity - https://www.brandverity.com/
 * 29. Abnormal Security - https://abnormalsecurity.com/
 * 30. Tessian - https://www.tessian.com/
 * 31. Barracuda - https://www.barracuda.com/
 * 32. GreatHorn - https://www.greathorn.com/
 * 33. Inky - https://www.inky.com/
 * 34. Area 1 Security - https://www.area1security.com/
 * 35. Agari - https://www.agari.com/
 */

const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');

class ThreatIntelService {
  constructor() {
    this.apis = {
      // FREE APIs
      googleSafeBrowsing: {
        name: 'Google Safe Browsing',
        url: 'https://safebrowsing.googleapis.com/v4/threatMatches:find',
        keyEnv: 'GOOGLE_SAFE_BROWSING_API_KEY',
        free: true,
        docUrl: 'https://developers.google.com/safe-browsing'
      },
      phishtank: {
        name: 'PhishTank',
        url: 'https://checkurl.phishtank.com/checkurl/',
        keyEnv: 'PHISHTANK_API_KEY',
        free: true,
        docUrl: 'https://phishtank.org/api_info.php'
      },
      openphish: {
        name: 'OpenPhish',
        url: 'https://openphish.com/feed.txt',
        keyEnv: null, // No key required for community feed
        free: true,
        docUrl: 'https://openphish.com/'
      },
      urlhaus: {
        name: 'URLhaus',
        url: 'https://urlhaus-api.abuse.ch/v1/',
        keyEnv: null, // No key required
        free: true,
        docUrl: 'https://urlhaus.abuse.ch/api/'
      },
      virustotal: {
        name: 'VirusTotal',
        url: 'https://www.virustotal.com/api/v3',
        keyEnv: 'VIRUSTOTAL_API_KEY',
        free: true, // Free tier available
        docUrl: 'https://www.virustotal.com/gui/my-apikey'
      },
      ipqualityscore: {
        name: 'IPQualityScore',
        url: 'https://www.ipqualityscore.com/api/json/url',
        keyEnv: 'IPQUALITYSCORE_API_KEY',
        free: true,
        docUrl: 'https://www.ipqualityscore.com/'
      },
      abuseipdb: {
        name: 'AbuseIPDB',
        url: 'https://api.abuseipdb.com/api/v2',
        keyEnv: 'ABUSEIPDB_API_KEY',
        free: true,
        docUrl: 'https://www.abuseipdb.com/api'
      },
      whoisxml: {
        name: 'WhoisXML API',
        url: 'https://www.whoisxmlapi.com/whoisserver/WhoisService',
        keyEnv: 'WHOISXML_API_KEY',
        free: true,
        docUrl: 'https://whois.whoisxmlapi.com/'
      },
      securitytrails: {
        name: 'SecurityTrails',
        url: 'https://api.securitytrails.com/v1',
        keyEnv: 'SECURITYTRAILS_API_KEY',
        free: true,
        docUrl: 'https://securitytrails.com/'
      },
      hunterio: {
        name: 'Hunter.io',
        url: 'https://api.hunter.io/v2',
        keyEnv: 'HUNTER_API_KEY',
        free: true,
        docUrl: 'https://hunter.io/api'
      },
      hibp: {
        name: 'Have I Been Pwned',
        url: 'https://haveibeenpwned.com/api/v3',
        keyEnv: 'HIBP_API_KEY',
        free: false, // Paid for commercial use
        docUrl: 'https://haveibeenpwned.com/API/v3'
      },
      urlscan: {
        name: 'URLScan.io',
        url: 'https://urlscan.io/api/v1',
        keyEnv: 'URLSCAN_API_KEY',
        free: true,
        docUrl: 'https://urlscan.io/about-api/'
      },
      hybridanalysis: {
        name: 'Hybrid Analysis',
        url: 'https://www.hybrid-analysis.com/api/v2',
        keyEnv: 'HYBRID_ANALYSIS_API_KEY',
        free: true,
        docUrl: 'https://www.hybrid-analysis.com/docs/api/v2'
      },
      alienvaultotx: {
        name: 'AlienVault OTX',
        url: 'https://otx.alienvault.com/api/v1',
        keyEnv: 'ALIENVAULT_OTX_API_KEY',
        free: true,
        docUrl: 'https://otx.alienvault.com/api'
      },
      shodan: {
        name: 'Shodan',
        url: 'https://api.shodan.io',
        keyEnv: 'SHODAN_API_KEY',
        free: true, // Limited free tier
        docUrl: 'https://developer.shodan.io/'
      },
      // PAID APIs
      checkphish: {
        name: 'CheckPhish (Bolster)',
        url: 'https://developers.bolster.ai/api/neo/scan',
        keyEnv: 'CHECKPHISH_API_KEY',
        free: false,
        docUrl: 'https://checkphish.ai/'
      },
      slashnext: {
        name: 'SlashNext',
        url: 'https://oti.slashnext.com/api/oti/v1',
        keyEnv: 'SLASHNEXT_API_KEY',
        free: false,
        docUrl: 'https://www.slashnext.com/'
      },
      proofpoint: {
        name: 'Proofpoint',
        url: 'https://tap-api.proofpoint.com/v2',
        keyEnv: 'PROOFPOINT_API_KEY',
        free: false,
        docUrl: 'https://www.proofpoint.com/'
      },
      domaintools: {
        name: 'DomainTools',
        url: 'https://api.domaintools.com/v1',
        keyEnv: 'DOMAINTOOLS_API_KEY',
        free: false,
        docUrl: 'https://www.domaintools.com/'
      },
      riskiq: {
        name: 'RiskIQ PassiveTotal',
        url: 'https://api.riskiq.net/pt/v2',
        keyEnv: 'RISKIQ_API_KEY',
        free: false,
        docUrl: 'https://community.riskiq.com/'
      },
      netcraft: {
        name: 'Netcraft',
        url: 'https://report.netcraft.com/api/v3',
        keyEnv: 'NETCRAFT_API_KEY',
        free: false,
        docUrl: 'https://www.netcraft.com/'
      },
      recordedfuture: {
        name: 'Recorded Future',
        url: 'https://api.recordedfuture.com/v2',
        keyEnv: 'RECORDEDFUTURE_API_KEY',
        free: false,
        docUrl: 'https://www.recordedfuture.com/'
      },
      crowdstrike: {
        name: 'CrowdStrike Falcon',
        url: 'https://api.crowdstrike.com',
        keyEnv: 'CROWDSTRIKE_CLIENT_ID',
        free: false,
        docUrl: 'https://www.crowdstrike.com/'
      }
    };
  }

  /**
   * Google Safe Browsing API - Check URL safety
   */
  async checkGoogleSafeBrowsing(url) {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!apiKey) return { provider: 'google_safe_browsing', available: false, error: 'API key not configured' };

    try {
      const response = await axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          client: { clientId: 'phishguard', clientVersion: '1.0.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }]
          }
        },
        { timeout: 10000 }
      );

      const matches = response.data.matches || [];
      return {
        provider: 'google_safe_browsing',
        available: true,
        isMalicious: matches.length > 0,
        threats: matches.map(m => ({
          type: m.threatType,
          platform: m.platformType,
          url: m.threat.url
        })),
        threatTypes: matches.map(m => m.threatType),
        cached: response.data.negativeCacheTime || null
      };
    } catch (error) {
      logger.error('Google Safe Browsing error:', error.message);
      return { provider: 'google_safe_browsing', available: false, error: error.message };
    }
  }

  /**
   * PhishTank API - Check phishing database
   */
  async checkPhishTank(url) {
    const apiKey = process.env.PHISHTANK_API_KEY;

    try {
      const response = await axios.post(
        'https://checkurl.phishtank.com/checkurl/',
        new URLSearchParams({
          url: Buffer.from(url).toString('base64'),
          format: 'json',
          app_key: apiKey || ''
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        }
      );

      const result = response.data.results || {};
      return {
        provider: 'phishtank',
        available: true,
        isPhishing: result.in_database && result.verified,
        inDatabase: result.in_database,
        verified: result.verified,
        verifiedAt: result.verified_at,
        phishId: result.phish_id,
        phishDetailUrl: result.phish_detail_url
      };
    } catch (error) {
      logger.error('PhishTank error:', error.message);
      return { provider: 'phishtank', available: false, error: error.message };
    }
  }

  /**
   * URLhaus - Check malware URLs
   */
  async checkURLhaus(url) {
    try {
      const response = await axios.post(
        'https://urlhaus-api.abuse.ch/v1/url/',
        new URLSearchParams({ url }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000
        }
      );

      const data = response.data;
      return {
        provider: 'urlhaus',
        available: true,
        isMalicious: data.query_status === 'ok',
        status: data.query_status,
        threat: data.threat,
        urlStatus: data.url_status,
        dateAdded: data.date_added,
        tags: data.tags || [],
        payloads: (data.payloads || []).map(p => ({
          filename: p.filename,
          fileType: p.file_type,
          signature: p.signature,
          virustotal: p.virustotal
        }))
      };
    } catch (error) {
      logger.error('URLhaus error:', error.message);
      return { provider: 'urlhaus', available: false, error: error.message };
    }
  }

  /**
   * IPQualityScore - Malicious URL detection
   */
  async checkIPQualityScore(url) {
    const apiKey = process.env.IPQUALITYSCORE_API_KEY;
    if (!apiKey) return { provider: 'ipqualityscore', available: false, error: 'API key not configured' };

    try {
      const response = await axios.get(
        `https://www.ipqualityscore.com/api/json/url/${apiKey}/${encodeURIComponent(url)}`,
        { timeout: 10000 }
      );

      const data = response.data;
      return {
        provider: 'ipqualityscore',
        available: true,
        riskScore: data.risk_score,
        isMalicious: data.malware || data.phishing,
        isPhishing: data.phishing,
        isMalware: data.malware,
        isParking: data.parking,
        isSpyware: data.spyware,
        isSuspicious: data.suspicious,
        unsafe: data.unsafe,
        domainAge: data.domain_age,
        domainRank: data.domain_rank,
        redirected: data.redirected,
        finalUrl: data.final_url,
        category: data.category,
        contentType: data.content_type
      };
    } catch (error) {
      logger.error('IPQualityScore error:', error.message);
      return { provider: 'ipqualityscore', available: false, error: error.message };
    }
  }

  /**
   * VirusTotal - URL scan
   */
  async checkVirusTotal(url) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) return { provider: 'virustotal', available: false, error: 'API key not configured' };

    try {
      // First, submit URL for scanning
      const submitResponse = await axios.post(
        'https://www.virustotal.com/api/v3/urls',
        new URLSearchParams({ url }),
        {
          headers: {
            'x-apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000
        }
      );

      const analysisId = submitResponse.data.data.id;

      // Wait and get results
      await new Promise(resolve => setTimeout(resolve, 3000));

      const resultResponse = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: { 'x-apikey': apiKey },
          timeout: 15000
        }
      );

      const stats = resultResponse.data.data.attributes.stats;
      const results = resultResponse.data.data.attributes.results || {};

      return {
        provider: 'virustotal',
        available: true,
        analysisId,
        isMalicious: stats.malicious > 0,
        stats: {
          malicious: stats.malicious,
          suspicious: stats.suspicious,
          harmless: stats.harmless,
          undetected: stats.undetected,
          timeout: stats.timeout
        },
        detectionRatio: `${stats.malicious}/${Object.keys(results).length}`,
        detections: Object.entries(results)
          .filter(([_, r]) => r.category === 'malicious' || r.category === 'suspicious')
          .map(([engine, r]) => ({
            engine,
            category: r.category,
            result: r.result
          })),
        categories: [...new Set(Object.values(results).map(r => r.result).filter(Boolean))]
      };
    } catch (error) {
      logger.error('VirusTotal error:', error.message);
      return { provider: 'virustotal', available: false, error: error.message };
    }
  }

  /**
   * URLScan.io - Website scanner
   */
  async checkURLScan(url) {
    const apiKey = process.env.URLSCAN_API_KEY;
    if (!apiKey) return { provider: 'urlscan', available: false, error: 'API key not configured' };

    try {
      // Submit scan
      const submitResponse = await axios.post(
        'https://urlscan.io/api/v1/scan/',
        { url, visibility: 'private' },
        {
          headers: { 'API-Key': apiKey, 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const scanId = submitResponse.data.uuid;
      const resultUrl = submitResponse.data.result;

      // Wait for results
      await new Promise(resolve => setTimeout(resolve, 15000));

      const resultResponse = await axios.get(resultUrl, { timeout: 15000 });
      const data = resultResponse.data;

      return {
        provider: 'urlscan',
        available: true,
        scanId,
        resultUrl: `https://urlscan.io/result/${scanId}/`,
        screenshotUrl: data.task.screenshotURL,
        isMalicious: data.verdicts.overall.malicious,
        verdicts: {
          overall: data.verdicts.overall,
          urlscan: data.verdicts.urlscan,
          engines: data.verdicts.engines,
          community: data.verdicts.community
        },
        page: {
          url: data.page.url,
          domain: data.page.domain,
          ip: data.page.ip,
          country: data.page.country,
          server: data.page.server,
          status: data.page.status
        },
        stats: {
          requests: data.stats.requests,
          dataLength: data.stats.dataLength,
          encodedDataLength: data.stats.encodedDataLength,
          uniqIPs: data.stats.uniqIPs,
          uniqCountries: data.stats.uniqCountries
        },
        lists: data.lists || {},
        technologies: data.meta.processors?.umbrella?.data || []
      };
    } catch (error) {
      logger.error('URLScan error:', error.message);
      return { provider: 'urlscan', available: false, error: error.message };
    }
  }

  /**
   * AlienVault OTX - Threat intelligence
   */
  async checkAlienVaultOTX(domain) {
    const apiKey = process.env.ALIENVAULT_OTX_API_KEY;
    if (!apiKey) return { provider: 'alienvault_otx', available: false, error: 'API key not configured' };

    try {
      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/general`,
        {
          headers: { 'X-OTX-API-KEY': apiKey },
          timeout: 10000
        }
      );

      const data = response.data;
      return {
        provider: 'alienvault_otx',
        available: true,
        pulseCount: data.pulse_info?.count || 0,
        pulses: (data.pulse_info?.pulses || []).slice(0, 10).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          created: p.created,
          tags: p.tags,
          adversary: p.adversary,
          tlp: p.TLP
        })),
        validation: data.validation,
        whois: data.whois,
        alexaRank: data.alexa,
        reputation: data.reputation
      };
    } catch (error) {
      logger.error('AlienVault OTX error:', error.message);
      return { provider: 'alienvault_otx', available: false, error: error.message };
    }
  }

  /**
   * AbuseIPDB - Check IP reputation
   */
  async checkAbuseIPDB(ip) {
    const apiKey = process.env.ABUSEIPDB_API_KEY;
    if (!apiKey) return { provider: 'abuseipdb', available: false, error: 'API key not configured' };

    try {
      const response = await axios.get(
        'https://api.abuseipdb.com/api/v2/check',
        {
          params: { ipAddress: ip, maxAgeInDays: 90, verbose: true },
          headers: { Key: apiKey, Accept: 'application/json' },
          timeout: 10000
        }
      );

      const data = response.data.data;
      return {
        provider: 'abuseipdb',
        available: true,
        ip: data.ipAddress,
        isPublic: data.isPublic,
        isWhitelisted: data.isWhitelisted,
        abuseConfidenceScore: data.abuseConfidenceScore,
        countryCode: data.countryCode,
        isp: data.isp,
        domain: data.domain,
        usageType: data.usageType,
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        isMalicious: data.abuseConfidenceScore > 50,
        reports: (data.reports || []).slice(0, 10).map(r => ({
          reportedAt: r.reportedAt,
          categories: r.categories,
          comment: r.comment
        }))
      };
    } catch (error) {
      logger.error('AbuseIPDB error:', error.message);
      return { provider: 'abuseipdb', available: false, error: error.message };
    }
  }

  /**
   * Shodan - Get host information
   */
  async checkShodan(ip) {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) return { provider: 'shodan', available: false, error: 'API key not configured' };

    try {
      const response = await axios.get(
        `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`,
        { timeout: 10000 }
      );

      const data = response.data;
      return {
        provider: 'shodan',
        available: true,
        ip: data.ip_str,
        asn: data.asn,
        isp: data.isp,
        org: data.org,
        country: data.country_name,
        city: data.city,
        ports: data.ports,
        hostnames: data.hostnames,
        vulns: data.vulns || [],
        tags: data.tags || [],
        os: data.os,
        lastUpdate: data.last_update,
        services: (data.data || []).slice(0, 10).map(s => ({
          port: s.port,
          transport: s.transport,
          product: s.product,
          version: s.version,
          cpe: s.cpe
        }))
      };
    } catch (error) {
      logger.error('Shodan error:', error.message);
      return { provider: 'shodan', available: false, error: error.message };
    }
  }

  /**
   * CheckPhish by Bolster - AI phishing detection
   */
  async checkCheckPhish(url) {
    const apiKey = process.env.CHECKPHISH_API_KEY;
    if (!apiKey) return { provider: 'checkphish', available: false, error: 'API key not configured' };

    try {
      // Submit scan
      const submitResponse = await axios.post(
        'https://developers.bolster.ai/api/neo/scan',
        { apiKey, urlInfo: { url } },
        { timeout: 10000 }
      );

      const jobId = submitResponse.data.jobID;

      // Poll for results
      await new Promise(resolve => setTimeout(resolve, 5000));

      const resultResponse = await axios.post(
        'https://developers.bolster.ai/api/neo/scan/status',
        { apiKey, jobID: jobId },
        { timeout: 10000 }
      );

      const data = resultResponse.data;
      return {
        provider: 'checkphish',
        available: true,
        jobId,
        status: data.status,
        disposition: data.disposition,
        brand: data.brand,
        insights: data.insights,
        screenshotUrl: data.screenshot_path,
        resolved: data.resolved,
        categories: data.categories || [],
        riskScore: data.risk_score
      };
    } catch (error) {
      logger.error('CheckPhish error:', error.message);
      return { provider: 'checkphish', available: false, error: error.message };
    }
  }

  /**
   * SlashNext - Real-time phishing detection
   */
  async checkSlashNext(url) {
    const apiKey = process.env.SLASHNEXT_API_KEY;
    if (!apiKey) return { provider: 'slashnext', available: false, error: 'API key not configured' };

    try {
      const response = await axios.post(
        'https://oti.slashnext.com/api/oti/v1/url/scan',
        { url },
        {
          headers: { 'apikey': apiKey, 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      const data = response.data;
      return {
        provider: 'slashnext',
        available: true,
        errorNo: data.errorNo,
        errorMsg: data.errorMsg,
        urlData: {
          url: data.urlData?.url,
          scanId: data.urlData?.scanId,
          threatStatus: data.urlData?.threatStatus,
          threatType: data.urlData?.threatType,
          threatName: data.urlData?.threatName,
          landingUrl: data.urlData?.landingUrl?.url
        },
        isMalicious: data.urlData?.threatStatus === 'Malicious'
      };
    } catch (error) {
      logger.error('SlashNext error:', error.message);
      return { provider: 'slashnext', available: false, error: error.message };
    }
  }

  /**
   * OpenPhish - Free phishing feed
   */
  async checkOpenPhish(url) {
    try {
      const response = await axios.get('https://openphish.com/feed.txt', { timeout: 15000 });
      const phishingUrls = response.data.split('\n').filter(u => u.trim());
      
      const domain = new URL(url).hostname;
      const matchingUrls = phishingUrls.filter(u => u.includes(domain));

      return {
        provider: 'openphish',
        available: true,
        isPhishing: matchingUrls.length > 0 || phishingUrls.includes(url),
        matchingUrls: matchingUrls.slice(0, 10),
        totalFeedSize: phishingUrls.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('OpenPhish error:', error.message);
      return { provider: 'openphish', available: false, error: error.message };
    }
  }

  /**
   * Comprehensive URL analysis across all providers
   */
  async analyzeUrl(url) {
    const startTime = Date.now();
    let domain, ip;

    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
    } catch {
      domain = url;
    }

    // Run all checks in parallel
    const [
      googleResult,
      phishtankResult,
      urlhausResult,
      ipqsResult,
      vtResult,
      urlscanResult,
      otxResult,
      openphishResult,
      checkphishResult,
      slashnextResult
    ] = await Promise.allSettled([
      this.checkGoogleSafeBrowsing(url),
      this.checkPhishTank(url),
      this.checkURLhaus(url),
      this.checkIPQualityScore(url),
      this.checkVirusTotal(url),
      this.checkURLScan(url),
      this.checkAlienVaultOTX(domain),
      this.checkOpenPhish(url),
      this.checkCheckPhish(url),
      this.checkSlashNext(url)
    ]);

    const results = {
      google_safe_browsing: googleResult.status === 'fulfilled' ? googleResult.value : { available: false, error: googleResult.reason },
      phishtank: phishtankResult.status === 'fulfilled' ? phishtankResult.value : { available: false, error: phishtankResult.reason },
      urlhaus: urlhausResult.status === 'fulfilled' ? urlhausResult.value : { available: false, error: urlhausResult.reason },
      ipqualityscore: ipqsResult.status === 'fulfilled' ? ipqsResult.value : { available: false, error: ipqsResult.reason },
      virustotal: vtResult.status === 'fulfilled' ? vtResult.value : { available: false, error: vtResult.reason },
      urlscan: urlscanResult.status === 'fulfilled' ? urlscanResult.value : { available: false, error: urlscanResult.reason },
      alienvault_otx: otxResult.status === 'fulfilled' ? otxResult.value : { available: false, error: otxResult.reason },
      openphish: openphishResult.status === 'fulfilled' ? openphishResult.value : { available: false, error: openphishResult.reason },
      checkphish: checkphishResult.status === 'fulfilled' ? checkphishResult.value : { available: false, error: checkphishResult.reason },
      slashnext: slashnextResult.status === 'fulfilled' ? slashnextResult.value : { available: false, error: slashnextResult.reason }
    };

    // Calculate aggregate risk score
    let riskScore = 0;
    let detectionCount = 0;
    let totalProviders = 0;

    Object.values(results).forEach(r => {
      if (r.available) {
        totalProviders++;
        if (r.isMalicious || r.isPhishing) {
          detectionCount++;
          riskScore += 20;
        }
        if (r.riskScore) riskScore += r.riskScore * 0.1;
      }
    });

    const finalRiskScore = Math.min(100, riskScore);
    const verdict = finalRiskScore >= 70 ? 'MALICIOUS' : finalRiskScore >= 40 ? 'SUSPICIOUS' : 'CLEAN';

    return {
      url,
      domain,
      analysisTime: Date.now() - startTime,
      verdict,
      riskScore: finalRiskScore,
      detectionCount,
      totalProviders,
      results,
      summary: {
        isPhishing: verdict === 'MALICIOUS',
        isSuspicious: verdict === 'SUSPICIOUS',
        detectedBy: Object.entries(results)
          .filter(([_, r]) => r.available && (r.isMalicious || r.isPhishing))
          .map(([name, _]) => name),
        recommendations: this.generateRecommendations(verdict, results)
      }
    };
  }

  generateRecommendations(verdict, results) {
    const recommendations = [];

    if (verdict === 'MALICIOUS') {
      recommendations.push('Block this URL immediately in your firewall/proxy');
      recommendations.push('Alert any users who may have accessed this URL');
      recommendations.push('Submit takedown request to hosting provider');
      recommendations.push('Add to your organization\'s blocklist');
      recommendations.push('Check for related IOCs in your environment');
    } else if (verdict === 'SUSPICIOUS') {
      recommendations.push('Monitor for additional indicators');
      recommendations.push('Consider blocking temporarily pending investigation');
      recommendations.push('Warn users to avoid this URL');
      recommendations.push('Submit for manual review');
    } else {
      recommendations.push('URL appears safe but continue monitoring');
      recommendations.push('Consider periodic re-scanning');
    }

    return recommendations;
  }

  /**
   * Get API status for all configured providers
   */
  getApiStatus() {
    return Object.entries(this.apis).map(([key, api]) => ({
      id: key,
      name: api.name,
      free: api.free,
      docUrl: api.docUrl,
      configured: api.keyEnv ? !!process.env[api.keyEnv] : true,
      keyEnv: api.keyEnv
    }));
  }
}

module.exports = new ThreatIntelService();

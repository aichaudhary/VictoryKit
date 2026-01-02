const threatFeedsService = require('../services/threatFeeds.service');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');

class FeedsController {
  /**
   * Get all free threat feeds (URLhaus, ThreatFox, Feodo, SSL Blacklist, MalwareBazaar)
   */
  async getAllFreeFeeds(req, res, next) {
    try {
      const data = await threatFeedsService.getAllFreeFeeds();
      res.json(ApiResponse.success(data, 'Free threat feeds retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time threat statistics
   */
  async getRealTimeStats(req, res, next) {
    try {
      const stats = await threatFeedsService.getRealTimeStats();
      res.json(ApiResponse.success(stats, 'Real-time statistics retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get URLhaus recent malware URLs
   */
  async getURLhausRecent(req, res, next) {
    try {
      const data = await threatFeedsService.getURLhausRecent();
      res.json(ApiResponse.success(data, 'URLhaus data retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ThreatFox IOCs
   */
  async getThreatFoxRecent(req, res, next) {
    try {
      const data = await threatFeedsService.getThreatFoxRecent();
      res.json(ApiResponse.success(data, 'ThreatFox data retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Feodo Tracker C2 servers
   */
  async getFeodoTrackerC2(req, res, next) {
    try {
      const data = await threatFeedsService.getFeodoTrackerC2();
      res.json(ApiResponse.success(data, 'Feodo Tracker data retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SSL Blacklist
   */
  async getSSLBlacklist(req, res, next) {
    try {
      const data = await threatFeedsService.getSSLBlacklist();
      res.json(ApiResponse.success(data, 'SSL Blacklist data retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get MalwareBazaar recent samples
   */
  async getMalwareBazaarRecent(req, res, next) {
    try {
      const data = await threatFeedsService.getMalwareBazaarRecent();
      res.json(ApiResponse.success(data, 'MalwareBazaar data retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Comprehensive indicator lookup across all configured sources
   */
  async lookupIndicator(req, res, next) {
    try {
      const { indicator } = req.params;
      const { type = 'ip' } = req.query;
      
      if (!indicator) {
        return res.status(400).json(ApiResponse.error('Indicator is required'));
      }

      const data = await threatFeedsService.comprehensiveIndicatorLookup(indicator, type);
      res.json(ApiResponse.success(data, 'Indicator lookup completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * VirusTotal lookup
   */
  async virusTotalLookup(req, res, next) {
    try {
      const { indicator } = req.params;
      const { type = 'ip' } = req.query;
      const data = await threatFeedsService.virusTotalLookup(indicator, type);
      res.json(ApiResponse.success(data, 'VirusTotal lookup completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * AbuseIPDB check
   */
  async abuseIPDBCheck(req, res, next) {
    try {
      const { ip } = req.params;
      const data = await threatFeedsService.abuseIPDBCheck(ip);
      res.json(ApiResponse.success(data, 'AbuseIPDB check completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Shodan host lookup
   */
  async shodanLookup(req, res, next) {
    try {
      const { ip } = req.params;
      const data = await threatFeedsService.shodanHostLookup(ip);
      res.json(ApiResponse.success(data, 'Shodan lookup completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * AlienVault OTX lookup
   */
  async alienVaultLookup(req, res, next) {
    try {
      const { indicator } = req.params;
      const { type = 'IPv4' } = req.query;
      const data = await threatFeedsService.alienVaultPulses(indicator, type);
      res.json(ApiResponse.success(data, 'AlienVault OTX lookup completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GreyNoise check
   */
  async greyNoiseCheck(req, res, next) {
    try {
      const { ip } = req.params;
      const data = await threatFeedsService.greyNoiseCheck(ip);
      res.json(ApiResponse.success(data, 'GreyNoise check completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * IBM X-Force lookup
   */
  async ibmXForceLookup(req, res, next) {
    try {
      const { indicator } = req.params;
      const { type = 'ip' } = req.query;
      const data = await threatFeedsService.ibmXForceCheck(indicator, type);
      res.json(ApiResponse.success(data, 'IBM X-Force lookup completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get API key status (which services are configured)
   */
  async getApiKeyStatus(req, res, next) {
    try {
      const status = {
        freeFeeds: {
          urlhaus: true,
          threatfox: true,
          feodoTracker: true,
          sslBlacklist: true,
          malwareBazaar: true
        },
        paidFeeds: {
          virustotal: process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY !== 'YOUR_VIRUSTOTAL_API_KEY',
          abuseipdb: process.env.ABUSEIPDB_API_KEY && process.env.ABUSEIPDB_API_KEY !== 'YOUR_ABUSEIPDB_API_KEY',
          shodan: process.env.SHODAN_API_KEY && process.env.SHODAN_API_KEY !== 'YOUR_SHODAN_API_KEY',
          alienvault: process.env.ALIENVAULT_API_KEY && process.env.ALIENVAULT_API_KEY !== 'YOUR_ALIENVAULT_API_KEY',
          greynoise: process.env.GREYNOISE_API_KEY && process.env.GREYNOISE_API_KEY !== 'YOUR_GREYNOISE_API_KEY',
          crowdstrike: process.env.CROWDSTRIKE_CLIENT_ID && process.env.CROWDSTRIKE_CLIENT_ID !== 'YOUR_CROWDSTRIKE_CLIENT_ID',
          recordedFuture: process.env.RECORDED_FUTURE_API_KEY && process.env.RECORDED_FUTURE_API_KEY !== 'YOUR_RECORDED_FUTURE_API_KEY',
          mandiant: process.env.MANDIANT_API_KEY && process.env.MANDIANT_API_KEY !== 'YOUR_MANDIANT_API_KEY',
          ibmXforce: process.env.IBM_XFORCE_API_KEY && process.env.IBM_XFORCE_API_KEY !== 'YOUR_IBM_XFORCE_API_KEY',
          paloAlto: process.env.PALO_ALTO_API_KEY && process.env.PALO_ALTO_API_KEY !== 'YOUR_PALO_ALTO_API_KEY'
        }
      };
      res.json(ApiResponse.success(status, 'API key status retrieved'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedsController();

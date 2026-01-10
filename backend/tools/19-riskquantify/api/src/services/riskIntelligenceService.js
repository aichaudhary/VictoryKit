/**
 * Risk Intelligence Service
 * Integrates with threat intelligence feeds and security APIs
 */

const axios = require("axios");
const cron = require("node-cron");
const mongoose = require("mongoose");
const _ = require("lodash");

// Threat Intelligence Feed Schema
const ThreatFeedSchema = new mongoose.Schema({
  source: { type: String, required: true },
  type: { type: String, enum: ["cve", "malware", "threat_actor", "vulnerability"] },
  title: { type: String, required: true },
  description: String,
  severity: { type: String, enum: ["low", "medium", "high", "critical"] },
  cvssScore: Number,
  cveId: String,
  publishedDate: Date,
  lastUpdated: Date,
  affectedSystems: [String],
  mitigation: String,
  references: [String],
  tags: [String],
  rawData: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const ThreatFeed = mongoose.model("ThreatFeed", ThreatFeedSchema);

class RiskIntelligenceService {
  constructor() {
    this.feeds = {
      nvd: {
        url: process.env.NVD_BASE_URL || "https://services.nvd.nist.gov/rest/json",
        apiKey: process.env.NVD_API_KEY,
        enabled: true,
      },
      mitre: {
        url: process.env.MITRE_ATTACK_BASE_URL || "https://attack.mitre.org/api",
        apiKey: process.env.MITRE_ATTACK_API_KEY,
        enabled: true,
      },
      virustotal: {
        url: process.env.VIRUSTOTAL_BASE_URL || "https://www.virustotal.com/api/v3",
        apiKey: process.env.VIRUSTOTAL_API_KEY,
        enabled: true,
      },
      alienvault: {
        url: process.env.ALIENVAULT_BASE_URL || "https://otx.alienvault.com/api/v1",
        apiKey: process.env.ALIENVAULT_API_KEY,
        enabled: true,
      },
      shodan: {
        url: process.env.SHODAN_BASE_URL || "https://api.shodan.io",
        apiKey: process.env.SHODAN_API_KEY,
        enabled: true,
      },
      recordedfuture: {
        url: process.env.RECORDED_FUTURE_BASE_URL || "https://api.recordedfuture.com/v2",
        apiKey: process.env.RECORDED_FUTURE_API_KEY,
        enabled: true,
      },
      crowdstrike: {
        url: process.env.CROWDSTRIKE_BASE_URL || "https://api.crowdstrike.com",
        apiKey: process.env.CROWDSTRIKE_API_KEY,
        enabled: true,
      },
    };

    this.initialized = false;
    this.lastUpdate = null;
    this.updateInterval = "0 */6 * * *"; // Every 6 hours
  }

  async initialize() {
    try {
      // Validate API keys
      await this.validateApiKeys();

      // Start scheduled updates
      this.startScheduledUpdates();

      this.initialized = true;
      console.log("Risk Intelligence Service initialized");
    } catch (error) {
      console.error("Failed to initialize Risk Intelligence Service:", error);
      throw error;
    }
  }

  /**
   * Validate API keys for enabled feeds
   */
  async validateApiKeys() {
    const validations = [];

    for (const [feedName, feedConfig] of Object.entries(this.feeds)) {
      if (feedConfig.enabled && feedConfig.apiKey) {
        try {
          const isValid = await this.testApiKey(feedName, feedConfig);
          validations.push({ feed: feedName, valid: isValid });
        } catch (error) {
          console.warn(`API key validation failed for ${feedName}:`, error.message);
          validations.push({ feed: feedName, valid: false, error: error.message });
        }
      }
    }

    const validFeeds = validations.filter(v => v.valid).length;
    console.log(`Validated ${validFeeds}/${validations.length} threat intelligence feeds`);

    return validations;
  }

  /**
   * Test API key for specific feed
   */
  async testApiKey(feedName, feedConfig) {
    try {
      switch (feedName) {
        case "nvd":
          await axios.get(`${feedConfig.url}/cves/2.0?cveId=CVE-2023-0001`, {
            headers: { "apiKey": feedConfig.apiKey },
            timeout: 10000,
          });
          break;

        case "virustotal":
          await axios.get(`${feedConfig.url}/ip_addresses/8.8.8.8`, {
            headers: { "x-apikey": feedConfig.apiKey },
            timeout: 10000,
          });
          break;

        case "shodan":
          await axios.get(`${feedConfig.url}/api-info?key=${feedConfig.apiKey}`, {
            timeout: 10000,
          });
          break;

        default:
          // For feeds without specific validation, just check if key exists
          return !!feedConfig.apiKey;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update threat feeds
   */
  async updateThreatFeeds() {
    console.log("Starting threat intelligence feed update...");

    const updatePromises = Object.entries(this.feeds)
      .filter(([, config]) => config.enabled)
      .map(([feedName, config]) => this.updateFeed(feedName, config));

    try {
      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      console.log(`Threat feed update complete: ${successful} successful, ${failed} failed`);

      this.lastUpdate = new Date();
      return { successful, failed, timestamp: this.lastUpdate };
    } catch (error) {
      console.error("Threat feed update failed:", error);
      throw error;
    }
  }

  /**
   * Update specific feed
   */
  async updateFeed(feedName, feedConfig) {
    try {
      switch (feedName) {
        case "nvd":
          return await this.updateNVD(feedConfig);

        case "mitre":
          return await this.updateMITRE(feedConfig);

        case "virustotal":
          return await this.updateVirusTotal(feedConfig);

        case "alienvault":
          return await this.updateAlienVault(feedConfig);

        case "shodan":
          return await this.updateShodan(feedConfig);

        case "recordedfuture":
          return await this.updateRecordedFuture(feedConfig);

        case "crowdstrike":
          return await this.updateCrowdStrike(feedConfig);

        default:
          console.warn(`Unknown feed: ${feedName}`);
          return { feed: feedName, status: "unknown" };
      }
    } catch (error) {
      console.error(`Failed to update ${feedName}:`, error);
      throw error;
    }
  }

  /**
   * Update NVD CVE data
   */
  async updateNVD(config) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const params = {
      pubStartDate: yesterday.toISOString(),
      resultsPerPage: 100,
    };

    const response = await axios.get(`${config.url}/cves/2.0`, {
      headers: config.apiKey ? { "apiKey": config.apiKey } : {},
      params,
      timeout: 30000,
    });

    const cves = response.data.vulnerabilities || [];

    for (const vuln of cves) {
      const cve = vuln.cve;
      await ThreatFeed.findOneAndUpdate(
        { cveId: cve.id },
        {
          source: "nvd",
          type: "cve",
          title: cve.id,
          description: cve.descriptions?.find(d => d.lang === "en")?.value,
          severity: this.mapNvdSeverity(cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity),
          cvssScore: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore,
          cveId: cve.id,
          publishedDate: cve.published,
          lastUpdated: cve.lastModified,
          references: cve.references?.map(r => r.url),
          rawData: cve,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "nvd", updated: cves.length };
  }

  /**
   * Update MITRE ATT&CK data
   */
  async updateMITRE(config) {
    // MITRE ATT&CK API structure - simplified example
    const response = await axios.get(`${config.url}/techniques`, {
      headers: config.apiKey ? { "Authorization": `Bearer ${config.apiKey}` } : {},
      timeout: 30000,
    });

    const techniques = response.data || [];

    for (const technique of techniques) {
      await ThreatFeed.findOneAndUpdate(
        { source: "mitre", title: technique.name },
        {
          source: "mitre",
          type: "threat_actor",
          title: technique.name,
          description: technique.description,
          tags: technique.tags || [],
          rawData: technique,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "mitre", updated: techniques.length };
  }

  /**
   * Update VirusTotal data
   */
  async updateVirusTotal(config) {
    // Get recent malicious files (simplified)
    const response = await axios.get(`${config.url}/intelligence/search`, {
      headers: { "x-apikey": config.apiKey },
      params: {
        query: "tag:malware",
        limit: 50,
      },
      timeout: 30000,
    });

    const hashes = response.data?.data || [];

    for (const item of hashes) {
      await ThreatFeed.findOneAndUpdate(
        { source: "virustotal", title: item.id },
        {
          source: "virustotal",
          type: "malware",
          title: item.id,
          description: `Malware hash: ${item.id}`,
          severity: "high",
          rawData: item,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "virustotal", updated: hashes.length };
  }

  /**
   * Update AlienVault OTX data
   */
  async updateAlienVault(config) {
    const response = await axios.get(`${config.url}/pulses/subscribed`, {
      headers: { "X-OTX-API-KEY": config.apiKey },
      timeout: 30000,
    });

    const pulses = response.data?.results || [];

    for (const pulse of pulses) {
      await ThreatFeed.findOneAndUpdate(
        { source: "alienvault", title: pulse.name },
        {
          source: "alienvault",
          type: "threat_actor",
          title: pulse.name,
          description: pulse.description,
          tags: pulse.tags || [],
          publishedDate: pulse.created,
          rawData: pulse,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "alienvault", updated: pulses.length };
  }

  /**
   * Update Shodan data
   */
  async updateShodan(config) {
    // Get recent vulnerable services
    const response = await axios.get(`${config.url}/shodan/host/search`, {
      params: {
        key: config.apiKey,
        query: "port:445 vuln:*",
        limit: 50,
      },
      timeout: 30000,
    });

    const hosts = response.data?.matches || [];

    for (const host of hosts) {
      await ThreatFeed.findOneAndUpdate(
        { source: "shodan", title: `Vulnerable host: ${host.ip_str}` },
        {
          source: "shodan",
          type: "vulnerability",
          title: `Vulnerable host: ${host.ip_str}`,
          description: `Vulnerable service found on ${host.ip_str}:${host.port}`,
          severity: "medium",
          affectedSystems: [host.ip_str],
          rawData: host,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "shodan", updated: hosts.length };
  }

  /**
   * Update Recorded Future data
   */
  async updateRecordedFuture(config) {
    const response = await axios.get(`${config.url}/alerts`, {
      headers: { "X-RFToken": config.apiKey },
      timeout: 30000,
    });

    const alerts = response.data?.data || [];

    for (const alert of alerts) {
      await ThreatFeed.findOneAndUpdate(
        { source: "recordedfuture", title: alert.title },
        {
          source: "recordedfuture",
          type: "threat_actor",
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          rawData: alert,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "recordedfuture", updated: alerts.length };
  }

  /**
   * Update CrowdStrike data
   */
  async updateCrowdStrike(config) {
    const response = await axios.get(`${config.url}/intel/combined/indicators/v1`, {
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    const indicators = response.data?.resources || [];

    for (const indicator of indicators) {
      await ThreatFeed.findOneAndUpdate(
        { source: "crowdstrike", title: indicator.value },
        {
          source: "crowdstrike",
          type: "threat_actor",
          title: indicator.value,
          description: `Threat indicator: ${indicator.type}`,
          severity: indicator.malicious_confidence || "medium",
          rawData: indicator,
        },
        { upsert: true, new: true }
      );
    }

    return { feed: "crowdstrike", updated: indicators.length };
  }

  /**
   * Map NVD severity levels
   */
  mapNvdSeverity(severity) {
    const mapping = {
      "LOW": "low",
      "MEDIUM": "medium",
      "HIGH": "high",
      "CRITICAL": "critical",
    };
    return mapping[severity] || "medium";
  }

  /**
   * Search threat intelligence
   */
  async searchThreats(query, filters = {}) {
    const searchQuery = {
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
        { tags: new RegExp(query, "i") },
      ],
    };

    // Apply filters
    if (filters.source) searchQuery.source = filters.source;
    if (filters.type) searchQuery.type = filters.type;
    if (filters.severity) searchQuery.severity = filters.severity;
    if (filters.minCvssScore) searchQuery.cvssScore = { $gte: filters.minCvssScore };
    if (filters.maxCvssScore) searchQuery.cvssScore = { ...searchQuery.cvssScore, $lte: filters.maxCvssScore };

    const threats = await ThreatFeed.find(searchQuery)
      .sort({ publishedDate: -1 })
      .limit(100);

    return threats;
  }

  /**
   * Get threat statistics
   */
  async getThreatStats() {
    const stats = await ThreatFeed.aggregate([
      {
        $group: {
          _id: {
            source: "$source",
            type: "$type",
            severity: "$severity",
          },
          count: { $sum: 1 },
          avgCvssScore: { $avg: "$cvssScore" },
          latestUpdate: { $max: "$publishedDate" },
        },
      },
      {
        $group: {
          _id: "$_id.source",
          types: {
            $push: {
              type: "$_id.type",
              severity: "$_id.severity",
              count: "$count",
              avgCvssScore: "$avgCvssScore",
              latestUpdate: "$latestUpdate",
            },
          },
          totalCount: { $sum: "$count" },
        },
      },
    ]);

    return stats;
  }

  /**
   * Get relevant threats for risk assessment
   */
  async getRelevantThreats(riskCategory, affectedSystems = []) {
    const query = {
      $or: [
        { tags: new RegExp(riskCategory, "i") },
        { affectedSystems: { $in: affectedSystems } },
        { type: this.mapRiskCategoryToThreatType(riskCategory) },
      ],
    };

    const threats = await ThreatFeed.find(query)
      .sort({ cvssScore: -1, publishedDate: -1 })
      .limit(20);

    return threats;
  }

  /**
   * Map risk category to threat type
   */
  mapRiskCategoryToThreatType(category) {
    const mapping = {
      "security": "cve",
      "cybersecurity": "cve",
      "malware": "malware",
      "phishing": "threat_actor",
      "ddos": "threat_actor",
      "ransomware": "malware",
    };

    return mapping[category.toLowerCase()] || "vulnerability";
  }

  /**
   * Start scheduled updates
   */
  startScheduledUpdates() {
    cron.schedule(this.updateInterval, async () => {
      try {
        await this.updateThreatFeeds();
      } catch (error) {
        console.error("Scheduled threat feed update failed:", error);
      }
    });

    console.log(`Scheduled threat feed updates: ${this.updateInterval}`);
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      initialized: this.initialized,
      feeds: Object.keys(this.feeds).filter(feed => this.feeds[feed].enabled),
      lastUpdate: this.lastUpdate,
      threatCount: null, // Would need to query DB
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RiskIntelligenceService();
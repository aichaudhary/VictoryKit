/**
 * Analytics Controller - Bot defense analytics
 */

const Bot = require("../models/Bot");
const Challenge = require("../models/Challenge");
const Fingerprint = require("../models/Fingerprint");
const Request = require("../models/Request");

const analyticsController = {
  // Get traffic analytics
  async getTraffic(req, res) {
    try {
      const { hours = 24 } = req.query;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const [totalRequests, botRequests, humanRequests, timeline] =
        await Promise.all([
          Request.countDocuments({ createdAt: { $gte: since } }),
          Request.countDocuments({
            createdAt: { $gte: since },
            "detection.isBot": true,
          }),
          Request.countDocuments({
            createdAt: { $gte: since },
            "detection.isBot": false,
          }),
          Request.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
              $group: {
                _id: {
                  hour: { $hour: "$createdAt" },
                  isBot: "$detection.isBot",
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.hour": 1 } },
          ]),
        ]);

      res.json({
        success: true,
        data: {
          period: `${hours} hours`,
          total: totalRequests,
          bot: botRequests,
          human: humanRequests,
          botPercentage:
            totalRequests > 0
              ? ((botRequests / totalRequests) * 100).toFixed(2)
              : 0,
          timeline,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get bot breakdown
  async getBotBreakdown(req, res) {
    try {
      const [byCategory, byAction, byDetectionMethod, topIPs] =
        await Promise.all([
          Bot.aggregate([
            { $match: { "classification.type": "bad" } },
            { $group: { _id: "$classification.category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          Bot.aggregate([
            { $group: { _id: "$action.current", count: { $sum: 1 } } },
          ]),
          Bot.aggregate([
            { $group: { _id: "$detection.method", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          Request.aggregate([
            { $match: { "detection.isBot": true } },
            {
              $group: {
                _id: "$client.ip",
                requests: { $sum: 1 },
                avgScore: { $avg: "$detection.botScore" },
              },
            },
            { $sort: { requests: -1 } },
            { $limit: 10 },
          ]),
        ]);

      res.json({
        success: true,
        data: {
          byCategory,
          byAction: Object.fromEntries(byAction.map((a) => [a._id, a.count])),
          byDetectionMethod,
          topBotIPs: topIPs,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get challenge statistics
  async getChallengeStats(req, res) {
    try {
      const challenges = await Challenge.find({ status: "active" });

      const summary = {
        totalChallenges: challenges.length,
        totalIssued: 0,
        totalPassed: 0,
        totalFailed: 0,
        overallPassRate: 0,
        byType: {},
      };

      challenges.forEach((c) => {
        summary.totalIssued += c.statistics.issued;
        summary.totalPassed += c.statistics.passed;
        summary.totalFailed += c.statistics.failed;

        if (!summary.byType[c.type]) {
          summary.byType[c.type] = { issued: 0, passed: 0, failed: 0 };
        }
        summary.byType[c.type].issued += c.statistics.issued;
        summary.byType[c.type].passed += c.statistics.passed;
        summary.byType[c.type].failed += c.statistics.failed;
      });

      summary.overallPassRate =
        summary.totalIssued > 0
          ? ((summary.totalPassed / summary.totalIssued) * 100).toFixed(2)
          : 0;

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get dashboard
  async getDashboard(req, res) {
    try {
      const now = new Date();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const [
        totalBots,
        activeBots,
        blockedBots,
        totalFingerprints,
        suspiciousFingerprints,
        requests24h,
        botRequests24h,
        challengeStats,
      ] = await Promise.all([
        Bot.countDocuments(),
        Bot.countDocuments({ status: "active" }),
        Bot.countDocuments({ status: "blocked" }),
        Fingerprint.countDocuments(),
        Fingerprint.countDocuments({
          "analysis.riskLevel": { $in: ["high", "critical"] },
        }),
        Request.countDocuments({ createdAt: { $gte: last24h } }),
        Request.countDocuments({
          createdAt: { $gte: last24h },
          "detection.isBot": true,
        }),
        Challenge.aggregate([
          { $match: { status: "active" } },
          {
            $group: {
              _id: null,
              issued: { $sum: "$statistics.issued" },
              passed: { $sum: "$statistics.passed" },
              failed: { $sum: "$statistics.failed" },
            },
          },
        ]),
      ]);

      const challengeSummary = challengeStats[0] || {
        issued: 0,
        passed: 0,
        failed: 0,
      };

      res.json({
        success: true,
        data: {
          overview: {
            totalBots,
            activeBots,
            blockedBots,
            totalFingerprints,
            suspiciousFingerprints,
          },
          traffic: {
            requests24h,
            botRequests24h,
            humanRequests24h: requests24h - botRequests24h,
            botPercentage:
              requests24h > 0
                ? ((botRequests24h / requests24h) * 100).toFixed(2)
                : 0,
          },
          challenges: {
            ...challengeSummary,
            passRate:
              challengeSummary.issued > 0
                ? (
                    (challengeSummary.passed / challengeSummary.issued) *
                    100
                  ).toFixed(2)
                : 0,
          },
          status: "operational",
          lastUpdated: now.toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get trends over time
  async getTrends(req, res) {
    try {
      const { days = 7 } = req.query;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const trends = await Bot.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              type: "$classification.type"
            },
            count: { $sum: 1 },
            avgScore: { $avg: "$detection.score" }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);

      res.json({
        success: true,
        data: {
          period: `${days} days`,
          trends
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get geographic distribution
  async getGeographic(req, res) {
    try {
      const geographic = await Bot.aggregate([
        { $match: { "identification.geo.country": { $exists: true } } },
        {
          $group: {
            _id: "$identification.geo.country",
            total: { $sum: 1 },
            bots: { $sum: { $cond: [{ $eq: ["$classification.type", "bad"] }, 1, 0] } },
            avgScore: { $avg: "$detection.score" }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 20 }
      ]);

      res.json({
        success: true,
        data: geographic
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get real-time stats
  async getRealtime(req, res) {
    try {
      const window = 60; // 1 minute
      const since = new Date(Date.now() - window * 1000);

      const [recent, perSecond] = await Promise.all([
        Bot.countDocuments({ updatedAt: { $gte: since } }),
        Bot.aggregate([
          { $match: { updatedAt: { $gte: since } } },
          {
            $group: {
              _id: { $second: "$updatedAt" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          windowSeconds: window,
          totalInWindow: recent,
          requestsPerSecond: recent / window,
          perSecond,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get threat summary
  async getThreats(req, res) {
    try {
      const threats = await Bot.aggregate([
        { $match: { "classification.type": "bad", "detection.score": { $gte: 70 } } },
        {
          $group: {
            _id: "$classification.category",
            count: { $sum: 1 },
            avgScore: { $avg: "$detection.score" },
            topIPs: { $push: "$identification.ipAddress" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Get unique IPs per category
      threats.forEach(t => {
        t.uniqueIPs = [...new Set(t.topIPs)].length;
        t.topIPs = [...new Set(t.topIPs)].slice(0, 5);
      });

      res.json({
        success: true,
        data: threats
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get settings (mock)
  async getSettings(req, res) {
    try {
      res.json({
        success: true,
        settings: {
          detectionEnabled: true,
          autoBlock: true,
          autoBlockThreshold: 80,
          challengeThreshold: 50,
          monitorThreshold: 20,
          whitelistEnabled: true,
          notificationsEnabled: true,
          webhookUrl: "",
          slackWebhook: ""
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update settings (mock)
  async updateSettings(req, res) {
    try {
      res.json({
        success: true,
        message: "Settings updated successfully",
        settings: req.body
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get integration status
  async getIntegrations(req, res) {
    try {
      const integrations = {
        recaptcha: {
          enabled: !!process.env.RECAPTCHA_SECRET_KEY,
          configured: !!process.env.RECAPTCHA_SITE_KEY
        },
        hcaptcha: {
          enabled: !!process.env.HCAPTCHA_SECRET_KEY,
          configured: !!process.env.HCAPTCHA_SITE_KEY
        },
        turnstile: {
          enabled: !!process.env.TURNSTILE_SECRET_KEY,
          configured: !!process.env.TURNSTILE_SITE_KEY
        },
        ipQualityScore: {
          enabled: !!process.env.IPQUALITYSCORE_API_KEY
        },
        abuseIPDB: {
          enabled: !!process.env.ABUSEIPDB_API_KEY
        },
        greyNoise: {
          enabled: !!process.env.GREYNOISE_API_KEY
        },
        mlEngine: {
          enabled: true,
          url: process.env.ML_ENGINE_URL || "http://localhost:8023"
        }
      };

      res.json({
        success: true,
        integrations
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update integrations (mock)
  async updateIntegrations(req, res) {
    try {
      res.json({
        success: true,
        message: "Integration settings updated",
        integrations: req.body
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = analyticsController;

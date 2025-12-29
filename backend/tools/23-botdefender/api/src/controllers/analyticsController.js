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
};

module.exports = analyticsController;

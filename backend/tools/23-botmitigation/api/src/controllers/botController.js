/**
 * Bot Controller - Bot detection and management
 */

const Bot = require("../models/Bot");
const botService = require("../services/botService");

const botController = {
  // Get all bots
  async getAll(req, res) {
    try {
      const {
        type,
        category,
        action,
        status,
        minScore,
        page = 1,
        limit = 50,
      } = req.query;

      const query = {};

      if (type) query["classification.type"] = type;
      if (category) query["classification.category"] = category;
      if (action) query["action.current"] = action;
      if (status) query.status = status;
      if (minScore) query["detection.score"] = { $gte: parseInt(minScore) };

      const skip = (page - 1) * limit;

      const [bots, total] = await Promise.all([
        Bot.find(query)
          .sort({ "detection.score": -1, updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Bot.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: bots,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get bot by ID
  async getById(req, res) {
    try {
      const bot = await Bot.findOne({
        $or: [{ _id: req.params.id }, { botId: req.params.id }],
      });

      if (!bot) {
        return res.status(404).json({ success: false, error: "Bot not found" });
      }

      res.json({ success: true, data: bot });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Detect bot from request
  async detect(req, res) {
    try {
      const requestData = req.body;

      // Run detection
      const result = await botService.detect(requestData);

      // If bot detected with high confidence, create/update record
      if (result.isBot && result.score >= 50) {
        await botService.recordBot(result, requestData);
      }

      res.json({
        success: true,
        data: {
          isBot: result.isBot,
          score: result.score,
          classification: result.classification,
          action: result.recommendedAction,
          signals: result.signals,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update bot
  async update(req, res) {
    try {
      const bot = await Bot.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { botId: req.params.id }] },
        { $set: req.body },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ success: false, error: "Bot not found" });
      }

      res.json({ success: true, data: bot });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Block bot
  async block(req, res) {
    try {
      const { reason } = req.body;

      const bot = await Bot.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { botId: req.params.id }] },
        {
          $set: {
            "action.current": "block",
            status: "blocked",
          },
          $push: {
            "action.history": {
              action: "block",
              reason: reason || "Manual block",
              timestamp: new Date(),
              performedBy: req.user?.id || "system",
            },
          },
        },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ success: false, error: "Bot not found" });
      }

      res.json({
        success: true,
        data: bot,
        message: "Bot blocked successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Allow bot
  async allow(req, res) {
    try {
      const { reason } = req.body;

      const bot = await Bot.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { botId: req.params.id }] },
        {
          $set: {
            "action.current": "allow",
            status: "allowed",
            "classification.type": "good",
          },
          $push: {
            "action.history": {
              action: "allow",
              reason: reason || "Manual allow",
              timestamp: new Date(),
              performedBy: req.user?.id || "system",
            },
          },
        },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ success: false, error: "Bot not found" });
      }

      res.json({
        success: true,
        data: bot,
        message: "Bot allowed successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get statistics
  async getStatistics(req, res) {
    try {
      const [total, byType, byCategory, byAction, topBots] = await Promise.all([
        Bot.countDocuments(),
        Bot.aggregate([
          { $group: { _id: "$classification.type", count: { $sum: 1 } } },
        ]),
        Bot.aggregate([
          { $group: { _id: "$classification.category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        Bot.aggregate([
          { $group: { _id: "$action.current", count: { $sum: 1 } } },
        ]),
        Bot.find({ "classification.type": "bad" })
          .sort({ "statistics.totalRequests": -1 })
          .limit(10)
          .select("botId classification.category detection.score statistics"),
      ]);

      res.json({
        success: true,
        data: {
          total,
          byType: Object.fromEntries(byType.map((t) => [t._id, t.count])),
          byCategory,
          byAction: Object.fromEntries(byAction.map((a) => [a._id, a.count])),
          topBots,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get live traffic data
  async getLiveTraffic(req, res) {
    try {
      const { window = 60 } = req.query; // seconds
      const since = new Date(Date.now() - window * 1000);
      
      const [recent, stats] = await Promise.all([
        Bot.find({ updatedAt: { $gte: since } })
          .sort({ updatedAt: -1 })
          .limit(100)
          .select("botId classification detection action identification.ipAddress updatedAt"),
        Bot.aggregate([
          { $match: { updatedAt: { $gte: since } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              bots: { $sum: { $cond: [{ $eq: ["$classification.type", "bad"] }, 1, 0] } },
              humans: { $sum: { $cond: [{ $eq: ["$classification.type", "good"] }, 1, 0] } },
              unknown: { $sum: { $cond: [{ $eq: ["$classification.type", "unknown"] }, 1, 0] } },
              blocked: { $sum: { $cond: [{ $eq: ["$action.current", "block"] }, 1, 0] } },
              challenged: { $sum: { $cond: [{ $eq: ["$action.current", "challenge"] }, 1, 0] } },
              avgScore: { $avg: "$detection.score" }
            }
          }
        ])
      ]);
      
      res.json({
        success: true,
        data: {
          window,
          timestamp: new Date().toISOString(),
          traffic: recent,
          stats: stats[0] || { total: 0, bots: 0, humans: 0, unknown: 0, blocked: 0, challenged: 0, avgScore: 0 }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Bulk action on multiple bots
  async bulkAction(req, res) {
    try {
      const { botIds, action, reason } = req.body;
      
      if (!botIds || !Array.isArray(botIds) || botIds.length === 0) {
        return res.status(400).json({ success: false, error: "Bot IDs array is required" });
      }
      
      if (!["block", "allow", "challenge", "monitor"].includes(action)) {
        return res.status(400).json({ success: false, error: "Invalid action" });
      }
      
      const updateData = {
        "action.current": action,
        status: action === "block" ? "blocked" : action === "allow" ? "allowed" : "active"
      };
      
      if (action === "allow") {
        updateData["classification.type"] = "good";
      }
      
      const result = await Bot.updateMany(
        { $or: [{ _id: { $in: botIds } }, { botId: { $in: botIds } }] },
        {
          $set: updateData,
          $push: {
            "action.history": {
              action,
              reason: reason || `Bulk ${action}`,
              timestamp: new Date(),
              performedBy: req.user?.id || "system"
            }
          }
        }
      );
      
      res.json({
        success: true,
        message: `${result.modifiedCount} bots updated`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = botController;

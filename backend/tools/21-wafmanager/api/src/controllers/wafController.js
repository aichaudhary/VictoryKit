const WAFInstance = require("../models/WAFInstance");
const Rule = require("../models/Rule");
const Event = require("../models/Event");
const wafService = require("../services/wafService");

// Create instance
exports.create = async (req, res, next) => {
  try {
    const instance = new WAFInstance(req.body);
    await instance.save();
    res.status(201).json(instance);
  } catch (error) {
    next(error);
  }
};

// Get all instances
exports.getAll = async (req, res, next) => {
  try {
    const { provider, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (provider) filter.provider = provider;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [instances, total] = await Promise.all([
      WAFInstance.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      WAFInstance.countDocuments(filter),
    ]);

    res.json({
      data: instances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get instance by ID
exports.getById = async (req, res, next) => {
  try {
    const instance = await WAFInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({ error: "WAF instance not found" });
    }
    res.json(instance);
  } catch (error) {
    next(error);
  }
};

// Update instance
exports.update = async (req, res, next) => {
  try {
    const instance = await WAFInstance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!instance) {
      return res.status(404).json({ error: "WAF instance not found" });
    }
    res.json(instance);
  } catch (error) {
    next(error);
  }
};

// Delete instance
exports.delete = async (req, res, next) => {
  try {
    const instance = await WAFInstance.findByIdAndDelete(req.params.id);
    if (!instance) {
      return res.status(404).json({ error: "WAF instance not found" });
    }
    // Delete associated rules
    await Rule.deleteMany({ instanceId: req.params.id });
    res.json({ message: "WAF instance deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Sync with provider
exports.sync = async (req, res, next) => {
  try {
    const instance = await WAFInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({ error: "WAF instance not found" });
    }

    instance.status = "syncing";
    await instance.save();

    // Sync with provider
    const syncResult = await wafService.syncWithProvider(instance);

    instance.status = "active";
    instance.lastSyncAt = new Date();
    instance.statistics = syncResult.statistics || instance.statistics;
    await instance.save();

    // Trigger external security integrations
    wafService.integrateWithSecurityStack(instance._id, {
      eventType: 'sync_completed',
      instanceName: instance.name,
      provider: instance.provider,
      blockedRequests: syncResult.statistics?.blockedRequests || 0,
      totalRequests: syncResult.statistics?.totalRequests || 0,
      rulesSynced: syncResult.rules?.synced || 0,
      severity: 'low'
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the sync if integration fails
    });

    res.json({
      instance,
      syncResult,
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [instances, rules, recentEvents] = await Promise.all([
      WAFInstance.find().select("name provider status statistics"),
      Rule.find().select("name type category enabled statistics"),
      Event.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select("eventId request.ip action category timestamp"),
    ]);

    const dashboard = {
      summary: {
        totalInstances: instances.length,
        activeInstances: instances.filter((i) => i.status === "active").length,
        totalRules: rules.length,
        enabledRules: rules.filter((r) => r.enabled).length,
      },
      traffic: {
        totalRequests: instances.reduce(
          (sum, i) => sum + (i.statistics?.totalRequests || 0),
          0
        ),
        blockedRequests: instances.reduce(
          (sum, i) => sum + (i.statistics?.blockedRequests || 0),
          0
        ),
        allowedRequests: instances.reduce(
          (sum, i) => sum + (i.statistics?.allowedRequests || 0),
          0
        ),
      },
      byProvider: instances.reduce((acc, i) => {
        acc[i.provider] = (acc[i.provider] || 0) + 1;
        return acc;
      }, {}),
      rulesByCategory: rules.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {}),
      recentEvents: recentEvents.map((e) => ({
        id: e.eventId,
        ip: e.request?.ip,
        action: e.action,
        category: e.category,
        timestamp: e.timestamp,
      })),
      topBlockedIPs: await getTopBlockedIPs(),
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

async function getTopBlockedIPs() {
  try {
    const result = await Event.aggregate([
      { $match: { action: "blocked" } },
      { $group: { _id: "$request.ip", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    return result.map((r) => ({ ip: r._id, blocks: r.count }));
  } catch (error) {
    return [];
  }
}

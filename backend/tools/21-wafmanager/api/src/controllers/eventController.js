const Event = require("../models/Event");

// Get all events
exports.getAll = async (req, res, next) => {
  try {
    const {
      instanceId,
      action,
      category,
      ip,
      startDate,
      endDate,
      falsePositive,
      reviewed,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};
    if (instanceId) filter.instanceId = instanceId;
    if (action) filter.action = action;
    if (category) filter.category = category;
    if (ip) filter["request.ip"] = ip;
    if (falsePositive !== undefined)
      filter.falsePositive = falsePositive === "true";
    if (reviewed !== undefined) filter.reviewed = reviewed === "true";

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(filter),
    ]);

    res.json({
      data: events,
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

// Get event by ID
exports.getById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("instanceId", "name provider")
      .populate("ruleId", "name category");
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Update event (mark as false positive, reviewed)
exports.update = async (req, res, next) => {
  try {
    const { falsePositive, reviewed, notes } = req.body;

    const update = {};
    if (falsePositive !== undefined) update.falsePositive = falsePositive;
    if (reviewed !== undefined) {
      update.reviewed = reviewed;
      if (reviewed) {
        update.reviewedAt = new Date();
        update.reviewedBy = req.body.reviewedBy || "system";
      }
    }
    if (notes) update.notes = notes;

    const event = await Event.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Get analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, instanceId } = req.query;

    const matchStage = {};
    if (instanceId) matchStage.instanceId = instanceId;
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    const [byAction, byCategory, byCountry, timeline] = await Promise.all([
      Event.aggregate([
        { $match: matchStage },
        { $group: { _id: "$action", count: { $sum: 1 } } },
      ]),
      Event.aggregate([
        { $match: matchStage },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      Event.aggregate([
        { $match: matchStage },
        { $group: { _id: "$request.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            blocked: {
              $sum: { $cond: [{ $eq: ["$action", "blocked"] }, 1, 0] },
            },
            allowed: {
              $sum: { $cond: [{ $eq: ["$action", "allowed"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    res.json({
      byAction: byAction.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topCountries: byCountry.map((item) => ({
        country: item._id,
        count: item.count,
      })),
      timeline: timeline.map((item) => ({
        date: item._id,
        blocked: item.blocked,
        allowed: item.allowed,
      })),
    });
  } catch (error) {
    next(error);
  }
};

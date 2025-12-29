const Metric = require("../models/Metric");

// Create metric
exports.create = async (req, res, next) => {
  try {
    const metric = new Metric(req.body);
    await metric.save();
    res.status(201).json(metric);
  } catch (error) {
    next(error);
  }
};

// Get all metrics
exports.getAll = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter["score.status"] = status;

    const skip = (page - 1) * limit;
    const [metrics, total] = await Promise.all([
      Metric.find(filter)
        .sort({ category: 1, "score.value": -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Metric.countDocuments(filter),
    ]);

    res.json({
      data: metrics,
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

// Get metric by ID
exports.getById = async (req, res, next) => {
  try {
    const metric = await Metric.findById(req.params.id);
    if (!metric) {
      return res.status(404).json({ error: "Metric not found" });
    }
    res.json(metric);
  } catch (error) {
    next(error);
  }
};

// Update metric
exports.update = async (req, res, next) => {
  try {
    const metric = await Metric.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!metric) {
      return res.status(404).json({ error: "Metric not found" });
    }
    res.json(metric);
  } catch (error) {
    next(error);
  }
};

// Delete metric
exports.delete = async (req, res, next) => {
  try {
    const metric = await Metric.findByIdAndDelete(req.params.id);
    if (!metric) {
      return res.status(404).json({ error: "Metric not found" });
    }
    res.json({ message: "Metric deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Collect data for metric
exports.collectData = async (req, res, next) => {
  try {
    const metric = await Metric.findById(req.params.id);
    if (!metric) {
      return res.status(404).json({ error: "Metric not found" });
    }

    const { value, source } = req.body;

    // Store previous value for trend
    const previousValue = metric.value.current;

    // Update current value
    metric.value.current = value;
    metric.source.lastCollected = new Date();
    if (source) metric.source.system = source;

    // Calculate trend
    if (previousValue !== undefined) {
      const change = value - previousValue;
      metric.trend = {
        direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
        change: Math.abs(change),
        period: "last_collection",
      };
    }

    // Add to history
    metric.history.push({
      date: new Date(),
      value: value,
      score: metric.score.value,
    });

    // Keep only last 100 history entries
    if (metric.history.length > 100) {
      metric.history = metric.history.slice(-100);
    }

    await metric.save();

    res.json({
      metric,
      collection: {
        previousValue,
        newValue: value,
        change: value - previousValue,
        collectedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

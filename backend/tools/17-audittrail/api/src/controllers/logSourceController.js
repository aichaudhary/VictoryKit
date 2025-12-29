/**
 * AuditTrail - LogSource Controller
 */

const LogSource = require("../models/LogSource");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [sources, total] = await Promise.all([
      LogSource.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ name: 1 }),
      LogSource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sources,
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
};

exports.getById = async (req, res) => {
  try {
    const source = await LogSource.findById(req.params.id);
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const source = new LogSource({
      ...req.body,
      sourceId: req.body.sourceId || `src-${uuidv4().substring(0, 8)}`,
    });
    await source.save();
    res.status(201).json({ success: true, data: source });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const source = await LogSource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const source = await LogSource.findByIdAndDelete(req.params.id);
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: "Log source not found" });
    }
    res.json({ success: true, message: "Log source deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

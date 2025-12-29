/**
 * Finding Controller
 */

const Finding = require("../models/Finding");
const findingService = require("../services/findingService");

exports.getAll = async (req, res) => {
  try {
    const {
      severity,
      status,
      category,
      account,
      page = 1,
      limit = 50,
    } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (category) query.category = category;
    if (account) query.account = account;

    const findings = await Finding.find(query)
      .populate("account", "name provider")
      .populate("resource", "name type arn")
      .sort({ severity: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Finding.countDocuments(query);

    res.json({
      success: true,
      data: findings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id)
      .populate("account")
      .populate("resource");
    if (!finding) {
      return res
        .status(404)
        .json({ success: false, error: "Finding not found" });
    }
    res.json({ success: true, data: finding });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.remediate = async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id);
    if (!finding) {
      return res
        .status(404)
        .json({ success: false, error: "Finding not found" });
    }

    finding.status = "remediated";
    await finding.save();

    res.json({
      success: true,
      message: "Finding marked as remediated",
      data: finding,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.suppress = async (req, res) => {
  try {
    const finding = await Finding.findById(req.params.id);
    if (!finding) {
      return res
        .status(404)
        .json({ success: false, error: "Finding not found" });
    }

    finding.status = "suppressed";
    finding.suppression = {
      reason: req.body.reason,
      suppressedBy: req.body.user || "system",
      suppressedAt: new Date(),
      expiresAt: req.body.expiresAt,
    };
    await finding.save();

    res.json({ success: true, data: finding });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { findingId, findingData } = req.body;

    let finding;
    if (findingId) {
      finding = await Finding.findById(findingId);
    } else {
      finding = findingData;
    }

    const analysis = await findingService.analyzeFinding(finding);

    if (findingId) {
      await Finding.findByIdAndUpdate(findingId, {
        mlAnalysis: { ...analysis, analyzedAt: new Date() },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [bySeverity, byCategory, byStatus, trend] = await Promise.all([
      Finding.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Finding.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Finding.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Finding.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: { bySeverity, byCategory, byStatus, trend },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

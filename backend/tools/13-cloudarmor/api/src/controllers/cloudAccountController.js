/**
 * CloudAccount Controller
 */

const CloudAccount = require("../models/CloudAccount");
const Finding = require("../models/Finding");
const CloudResource = require("../models/CloudResource");

exports.getAll = async (req, res) => {
  try {
    const { provider, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (provider) query.provider = provider;
    if (status) query.status = status;

    const accounts = await CloudAccount.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CloudAccount.countDocuments(query);

    res.json({
      success: true,
      data: accounts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const account = await CloudAccount.findById(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const account = new CloudAccount(req.body);
    await account.save();
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const account = await CloudAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const account = await CloudAccount.findByIdAndDelete(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    // Clean up related data
    await CloudResource.deleteMany({ account: req.params.id });
    await Finding.deleteMany({ account: req.params.id });

    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.triggerScan = async (req, res) => {
  try {
    const account = await CloudAccount.findById(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    account.scanning.status = "scanning";
    account.scanning.lastScan = new Date();
    await account.save();

    // In production, this would trigger actual cloud scanning
    res.json({
      success: true,
      message: "Scan initiated",
      data: { accountId: account._id, status: "scanning" },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const account = await CloudAccount.findById(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    res.json({
      success: true,
      data: {
        status: account.status,
        scanning: account.scanning,
        statistics: account.statistics,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [
      accountsByProvider,
      totalFindings,
      findingsBySeverity,
      recentFindings,
    ] = await Promise.all([
      CloudAccount.aggregate([
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
      Finding.countDocuments({ status: "open" }),
      Finding.aggregate([
        { $match: { status: "open" } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      Finding.find({ status: "open" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("resource", "name type"),
    ]);

    res.json({
      success: true,
      data: {
        accountsByProvider,
        findings: {
          total: totalFindings,
          bySeverity: findingsBySeverity,
        },
        recentFindings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

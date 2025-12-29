/**
 * AuditTrail - Report Controller
 */

const Report = require("../models/Report");
const auditService = require("../services/auditService");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { type, template, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (template) filter.template = template;

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: reports,
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
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      reportId: req.body.reportId || `rpt-${uuidv4().substring(0, 8)}`,
    });
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { reportId, parameters } = req.body;

    const report = reportId ? await Report.findOne({ reportId }) : null;
    const params = parameters || report?.parameters;

    if (!params) {
      return res
        .status(400)
        .json({ success: false, error: "Report parameters required" });
    }

    const result = await auditService.generateReport(
      params,
      report?.template || "custom"
    );

    if (report) {
      report.lastGenerated = new Date();
      report.lastResult = {
        status: "success",
        recordCount: result.recordCount,
      };
      await report.save();
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

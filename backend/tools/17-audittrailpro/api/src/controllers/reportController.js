/**
 * AuditTrailPro - Report Controller
 * Compliance report generation and management
 */

const Report = require("../models/Report");
const ReportService = require("../services/reportService");
const { v4: uuidv4 } = require("uuid");

exports.getAll = async (req, res) => {
  try {
    const { type, framework, status, page = 1, limit = 20 } = req.query;
    const result = await ReportService.listReports({ 
      framework: framework || type, 
      status, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const report = await ReportService.getReport(req.params.id) || 
                   await Report.findById(req.params.id);
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
      reportId: req.body.reportId || `RPT-${uuidv4().split('-')[0].toUpperCase()}`,
    });
    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { 
      framework, 
      startDate, 
      endDate, 
      format = 'json',
      includeDetails = true 
    } = req.body;

    if (!framework) {
      return res.status(400).json({ 
        success: false, 
        error: "framework is required. Options: SOC2, HIPAA, GDPR, PCI-DSS, ISO27001" 
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: "startDate and endDate are required" 
      });
    }

    const result = await ReportService.generateReport({
      framework,
      startDate,
      endDate,
      format,
      includeDetails
    });

    res.json({ success: true, report: result });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = ReportService.getTemplates();
    res.json({ 
      success: true, 
      templates 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExecutiveSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const summary = await ReportService.generateExecutiveSummary(
      start.toISOString(),
      end.toISOString()
    );

    res.json({ success: true, summary });
  } catch (error) {
    console.error('Executive summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ 
      $or: [
        { _id: req.params.id },
        { reportId: req.params.id }
      ]
    });
    
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }
    
    res.json({ success: true, message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

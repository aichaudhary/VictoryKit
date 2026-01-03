/**
 * Advanced Reporting Service
 * Generates comprehensive risk assessment reports in multiple formats
 */

const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const _ = require("lodash");
const math = require("mathjs");

// Report Template Schema
const ReportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["executive", "technical", "compliance", "trend", "custom"],
    required: true
  },
  description: String,
  sections: [{
    title: String,
    content: String,
    dataSources: [String],
    charts: [{
      type: String,
      data: mongoose.Schema.Types.Mixed,
      config: mongoose.Schema.Types.Mixed,
    }],
  }],
  styling: {
    primaryColor: { type: String, default: "#2563eb" },
    secondaryColor: { type: String, default: "#64748b" },
    fontFamily: { type: String, default: "Helvetica" },
    logo: String,
  },
  isDefault: { type: Boolean, default: false },
  createdBy: String,
}, { timestamps: true });

const ReportTemplate = mongoose.model("ReportTemplate", ReportTemplateSchema);

// Generated Report Schema
const GeneratedReportSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "ReportTemplate" },
  title: { type: String, required: true },
  type: { type: String, required: true },
  format: {
    type: String,
    enum: ["pdf", "xlsx", "json", "html"],
    required: true
  },
  status: {
    type: String,
    enum: ["generating", "completed", "failed"],
    default: "generating"
  },
  filePath: String,
  fileSize: Number,
  generatedAt: Date,
  expiresAt: Date,
  parameters: mongoose.Schema.Types.Mixed,
  metadata: {
    recordCount: Number,
    generationTime: Number,
    dataSources: [String],
  },
  createdBy: String,
  error: String,
}, { timestamps: true });

const GeneratedReport = mongoose.model("GeneratedReport", GeneratedReportSchema);

class AdvancedReportingService {
  constructor() {
    this.templates = {};
    this.outputDir = path.join(__dirname, "../../reports");
    this.initialized = false;

    // Ensure reports directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize() {
    try {
      // Load default report templates
      await this.loadDefaultTemplates();

      this.initialized = true;
      console.log("Advanced Reporting Service initialized");
    } catch (error) {
      console.error("Failed to initialize Advanced Reporting Service:", error);
      throw error;
    }
  }

  /**
   * Load default report templates
   */
  async loadDefaultTemplates() {
    const defaultTemplates = [
      this.createExecutiveSummaryTemplate(),
      this.createTechnicalAssessmentTemplate(),
      this.createComplianceReportTemplate(),
      this.createRiskTrendAnalysisTemplate(),
    ];

    for (const template of defaultTemplates) {
      await ReportTemplate.findOneAndUpdate(
        { name: template.name, isDefault: true },
        template,
        { upsert: true, new: true }
      );
    }

    console.log("Default report templates loaded");
  }

  /**
   * Create executive summary template
   */
  createExecutiveSummaryTemplate() {
    return {
      name: "Executive Risk Summary",
      type: "executive",
      description: "High-level risk assessment summary for executive management",
      sections: [
        {
          title: "Executive Summary",
          content: "This report provides a high-level overview of the organization's risk posture, key findings, and strategic recommendations.",
          dataSources: ["risks", "assessments"],
        },
        {
          title: "Risk Overview",
          content: "Summary of risk distribution and trends",
          dataSources: ["risks"],
          charts: [
            {
              type: "pie",
              data: "riskDistributionByCategory",
              config: { title: "Risk Distribution by Category" },
            },
            {
              type: "bar",
              data: "riskLevels",
              config: { title: "Risk Levels Overview" },
            },
          ],
        },
        {
          title: "Key Findings",
          content: "Most critical risks and their potential impact",
          dataSources: ["risks"],
        },
        {
          title: "Strategic Recommendations",
          content: "Recommended actions to mitigate top risks",
          dataSources: ["assessments"],
        },
      ],
      styling: {
        primaryColor: "#1f2937",
        secondaryColor: "#6b7280",
        fontFamily: "Helvetica-Bold",
      },
      isDefault: true,
    };
  }

  /**
   * Create technical assessment template
   */
  createTechnicalAssessmentTemplate() {
    return {
      name: "Technical Risk Assessment",
      type: "technical",
      description: "Detailed technical analysis of risks and controls",
      sections: [
        {
          title: "Technical Risk Analysis",
          content: "Detailed analysis of technical risks, vulnerabilities, and controls",
          dataSources: ["risks", "controls", "assessments"],
        },
        {
          title: "Vulnerability Assessment",
          content: "Technical vulnerabilities and their mitigation status",
          dataSources: ["risks"],
          charts: [
            {
              type: "heatmap",
              data: "riskHeatmap",
              config: { title: "Risk Heat Map" },
            },
          ],
        },
        {
          title: "Control Effectiveness",
          content: "Analysis of implemented security controls",
          dataSources: ["controls"],
        },
        {
          title: "Technical Recommendations",
          content: "Specific technical measures to reduce risk",
          dataSources: ["assessments"],
        },
      ],
      styling: {
        primaryColor: "#dc2626",
        secondaryColor: "#7f1d1d",
        fontFamily: "Courier",
      },
      isDefault: true,
    };
  }

  /**
   * Create compliance report template
   */
  createComplianceReportTemplate() {
    return {
      name: "Compliance Assessment Report",
      type: "compliance",
      description: "Compliance status against regulatory frameworks",
      sections: [
        {
          title: "Compliance Overview",
          content: "Assessment of compliance with applicable regulatory frameworks",
          dataSources: ["compliance_mappings"],
        },
        {
          title: "Framework Coverage",
          content: "Coverage analysis across different compliance frameworks",
          dataSources: ["compliance_mappings"],
          charts: [
            {
              type: "radar",
              data: "complianceCoverage",
              config: { title: "Compliance Framework Coverage" },
            },
          ],
        },
        {
          title: "Compliance Gaps",
          content: "Identified gaps and remediation requirements",
          dataSources: ["compliance_mappings"],
        },
        {
          title: "Remediation Roadmap",
          content: "Timeline and actions for compliance remediation",
          dataSources: ["assessments"],
        },
      ],
      styling: {
        primaryColor: "#059669",
        secondaryColor: "#047857",
        fontFamily: "Times-Roman",
      },
      isDefault: true,
    };
  }

  /**
   * Create risk trend analysis template
   */
  createRiskTrendAnalysisTemplate() {
    return {
      name: "Risk Trend Analysis",
      type: "trend",
      description: "Analysis of risk trends over time",
      sections: [
        {
          title: "Trend Overview",
          content: "Analysis of risk trends and changes over time",
          dataSources: ["risks", "assessments"],
        },
        {
          title: "Risk Evolution",
          content: "How risks have changed over the reporting period",
          dataSources: ["risks"],
          charts: [
            {
              type: "line",
              data: "riskTrends",
              config: { title: "Risk Trends Over Time" },
            },
          ],
        },
        {
          title: "Emerging Risks",
          content: "New risks that have emerged recently",
          dataSources: ["risks"],
        },
        {
          title: "Risk Mitigation Progress",
          content: "Progress in mitigating identified risks",
          dataSources: ["assessments"],
        },
      ],
      styling: {
        primaryColor: "#7c3aed",
        secondaryColor: "#6d28d9",
        fontFamily: "Helvetica",
      },
      isDefault: true,
    };
  }

  /**
   * Generate report
   */
  async generateReport(templateId, parameters, format = "pdf", userId = null) {
    const startTime = Date.now();

    try {
      // Get template
      const template = await ReportTemplate.findById(templateId);
      if (!template) {
        throw new Error("Report template not found");
      }

      // Create report record
      const report = new GeneratedReport({
        templateId,
        title: parameters.title || `${template.name} - ${new Date().toISOString().split('T')[0]}`,
        type: template.type,
        format,
        parameters,
        createdBy: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await report.save();

      // Generate report data
      const reportData = await this.gatherReportData(template, parameters);

      // Generate report file
      const filePath = await this.generateReportFile(template, reportData, format, report._id);

      // Update report record
      const generationTime = Date.now() - startTime;
      const stats = fs.statSync(filePath);

      report.status = "completed";
      report.filePath = filePath;
      report.fileSize = stats.size;
      report.generatedAt = new Date();
      report.metadata = {
        recordCount: reportData.totalRecords || 0,
        generationTime,
        dataSources: template.sections.flatMap(s => s.dataSources),
      };

      await report.save();

      return {
        reportId: report._id,
        filePath,
        fileSize: stats.size,
        generationTime,
        downloadUrl: `/reports/${path.basename(filePath)}`,
      };

    } catch (error) {
      console.error("Report generation failed:", error);

      // Update report with error
      if (report) {
        report.status = "failed";
        report.error = error.message;
        await report.save();
      }

      throw error;
    }
  }

  /**
   * Gather data for report
   */
  async gatherReportData(template, parameters) {
    const data = {};

    for (const section of template.sections) {
      for (const dataSource of section.dataSources) {
        if (!data[dataSource]) {
          data[dataSource] = await this.fetchDataSource(dataSource, parameters);
        }
      }
    }

    // Process charts data
    for (const section of template.sections) {
      for (const chart of section.charts || []) {
        data[chart.data] = await this.processChartData(chart.type, data, parameters);
      }
    }

    return data;
  }

  /**
   * Fetch data from various sources
   */
  async fetchDataSource(source, parameters) {
    const { Risk } = require("../models/Risk");
    const { Assessment } = require("../models/Assessment");
    const { Control } = require("../models/Control");

    switch (source) {
      case "risks":
        return await Risk.find(this.buildQueryFilter(parameters))
          .populate("assessment")
          .sort({ createdAt: -1 });

      case "assessments":
        return await Assessment.find(this.buildQueryFilter(parameters))
          .populate("risks")
          .sort({ createdAt: -1 });

      case "controls":
        return await Control.find(this.buildQueryFilter(parameters))
          .sort({ createdAt: -1 });

      case "compliance_mappings":
        const RiskComplianceMapping = mongoose.model("RiskComplianceMapping");
        return await RiskComplianceMapping.find(this.buildQueryFilter(parameters))
          .populate("riskId frameworkId")
          .sort({ createdAt: -1 });

      default:
        return [];
    }
  }

  /**
   * Build query filter from parameters
   */
  buildQueryFilter(parameters) {
    const filter = {};

    if (parameters.dateFrom) {
      filter.createdAt = { $gte: new Date(parameters.dateFrom) };
    }

    if (parameters.dateTo) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(parameters.dateTo) };
    }

    if (parameters.categories && parameters.categories.length > 0) {
      filter.category = { $in: parameters.categories };
    }

    if (parameters.severities && parameters.severities.length > 0) {
      filter.severity = { $in: parameters.severities };
    }

    return filter;
  }

  /**
   * Process chart data
   */
  async processChartData(chartType, data, parameters) {
    switch (chartType) {
      case "pie":
        return this.generatePieChartData(data.risks || []);

      case "bar":
        return this.generateBarChartData(data.risks || []);

      case "heatmap":
        return this.generateHeatmapData(data.risks || []);

      case "line":
        return this.generateTrendData(data.risks || [], parameters);

      case "radar":
        return this.generateRadarData(data.compliance_mappings || []);

      default:
        return {};
    }
  }

  /**
   * Generate pie chart data
   */
  generatePieChartData(risks) {
    const categoryCounts = _.countBy(risks, "category");

    return {
      labels: Object.keys(categoryCounts),
      datasets: [{
        data: Object.values(categoryCounts),
        backgroundColor: this.generateColors(Object.keys(categoryCounts).length),
      }],
    };
  }

  /**
   * Generate bar chart data
   */
  generateBarChartData(risks) {
    const severityCounts = _.countBy(risks, "severity");

    return {
      labels: ["Very Low", "Low", "Medium", "High", "Very High"],
      datasets: [{
        label: "Risk Count",
        data: ["Very Low", "Low", "Medium", "High", "Very High"].map(level =>
          severityCounts[level.toLowerCase()] || 0
        ),
        backgroundColor: this.generateColors(5),
      }],
    };
  }

  /**
   * Generate heatmap data
   */
  generateHeatmapData(risks) {
    const heatmap = [];

    // Group by likelihood and impact
    const grouped = _.groupBy(risks, risk => `${risk.likelihood}-${risk.impact}`);

    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const row = [];
      for (let impact = 1; impact <= 5; impact++) {
        const key = `${likelihood}-${impact}`;
        row.push(grouped[key]?.length || 0);
      }
      heatmap.push(row);
    }

    return heatmap;
  }

  /**
   * Generate trend data
   */
  generateTrendData(risks, parameters) {
    const monthlyData = {};

    risks.forEach(risk => {
      const month = risk.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, bySeverity: {} };
      }
      monthlyData[month].total++;
      const severity = risk.severity || "medium";
      monthlyData[month].bySeverity[severity] = (monthlyData[month].bySeverity[severity] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Total Risks",
          data: sortedMonths.map(month => monthlyData[month].total),
          borderColor: "#2563eb",
          fill: false,
        },
        {
          label: "High Severity",
          data: sortedMonths.map(month => monthlyData[month].bySeverity.high || 0),
          borderColor: "#dc2626",
          fill: false,
        },
      ],
    };
  }

  /**
   * Generate radar data for compliance
   */
  generateRadarData(mappings) {
    const frameworkCoverage = {};

    mappings.forEach(mapping => {
      const framework = mapping.frameworkId?.name || "Unknown";
      if (!frameworkCoverage[framework]) {
        frameworkCoverage[framework] = 0;
      }
      frameworkCoverage[framework]++;
    });

    return {
      labels: Object.keys(frameworkCoverage),
      datasets: [{
        label: "Compliance Coverage",
        data: Object.values(frameworkCoverage),
        backgroundColor: "rgba(5, 150, 105, 0.2)",
        borderColor: "#059669",
        pointBackgroundColor: "#059669",
      }],
    };
  }

  /**
   * Generate colors for charts
   */
  generateColors(count) {
    const colors = [
      "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed",
      "#0891b2", "#be123c", "#166534", "#92400e", "#6d28d9",
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }

    return result;
  }

  /**
   * Generate report file
   */
  async generateReportFile(template, data, format, reportId) {
    const filename = `report_${reportId}_${Date.now()}`;
    const filePath = path.join(this.outputDir, `${filename}.${format}`);

    switch (format) {
      case "pdf":
        return await this.generatePDF(template, data, filePath);

      case "xlsx":
        return await this.generateExcel(template, data, filePath);

      case "json":
        return await this.generateJSON(data, filePath);

      case "html":
        return await this.generateHTML(template, data, filePath);

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate PDF report
   */
  async generatePDF(template, data, filePath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Title page
      doc.fontSize(24).text(template.name, { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Generated on ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.addPage();

      // Generate sections
      template.sections.forEach((section, index) => {
        if (index > 0) doc.addPage();

        doc.fontSize(18).text(section.title);
        doc.moveDown();
        doc.fontSize(12).text(section.content);
        doc.moveDown();

        // Add charts placeholder (would need chart library integration)
        if (section.charts && section.charts.length > 0) {
          doc.text("Charts would be displayed here");
          doc.moveDown();
        }
      });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);
    });
  }

  /**
   * Generate Excel report
   */
  async generateExcel(template, data, filePath) {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Report Title", template.name],
      ["Generated", new Date().toISOString()],
      ["Type", template.type],
      ["Total Records", data.totalRecords || 0],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Data sheets
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        const sheet = XLSX.utils.json_to_sheet(data[key]);
        XLSX.utils.book_append_sheet(workbook, sheet, key.substring(0, 31)); // Excel sheet name limit
      }
    });

    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  /**
   * Generate JSON report
   */
  async generateJSON(data, filePath) {
    const jsonData = {
      generatedAt: new Date().toISOString(),
      data: data,
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    return filePath;
  }

  /**
   * Generate HTML report
   */
  async generateHTML(template, data, filePath) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${template.name}</title>
    <style>
        body { font-family: ${template.styling.fontFamily}; margin: 40px; }
        .header { color: ${template.styling.primaryColor}; border-bottom: 2px solid ${template.styling.secondaryColor}; padding-bottom: 10px; }
        .section { margin: 30px 0; }
        .section-title { color: ${template.styling.primaryColor}; font-size: 18px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    ${template.sections.map(section => `
    <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <p>${section.content}</p>
        ${section.charts ? '<p><em>Interactive charts would be displayed here</em></p>' : ''}
    </div>
    `).join("")}

    <div class="section">
        <h2 class="section-title">Raw Data</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html);
    return filePath;
  }

  /**
   * Get report templates
   */
  async getTemplates(type = null) {
    const query = {};
    if (type) query.type = type;

    return await ReportTemplate.find(query).sort({ name: 1 });
  }

  /**
   * Get generated reports
   */
  async getGeneratedReports(userId = null, limit = 50) {
    const query = {};
    if (userId) query.createdBy = userId;

    return await GeneratedReport.find(query)
      .populate("templateId")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Delete expired reports
   */
  async cleanupExpiredReports() {
    const expired = await GeneratedReport.find({
      expiresAt: { $lt: new Date() },
    });

    for (const report of expired) {
      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
      await GeneratedReport.deleteOne({ _id: report._id });
    }

    return expired.length;
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      initialized: this.initialized,
      templatesLoaded: Object.keys(this.templates).length,
      outputDirectory: this.outputDir,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AdvancedReportingService();
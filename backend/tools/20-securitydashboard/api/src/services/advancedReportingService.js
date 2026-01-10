/**
 * Advanced Reporting Service - Multi-format report generation
 * Supports PDF, Excel, JSON, and scheduled reporting
 */

const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class AdvancedReportingService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    this.templates = new Map();
    this.scheduledReports = new Map();
    this.initialized = false;
  }

  async initialize() {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Load report templates
    this.loadTemplates();

    this.initialized = true;
    console.log('Advanced Reporting Service initialized');
  }

  loadTemplates() {
    this.templates.set('executive_summary', {
      name: 'Executive Summary',
      sections: ['overview', 'grade', 'trends', 'recommendations'],
      format: 'pdf'
    });

    this.templates.set('detailed_assessment', {
      name: 'Detailed Assessment Report',
      sections: ['overview', 'categories', 'metrics', 'vulnerabilities', 'compliance', 'recommendations'],
      format: 'pdf'
    });

    this.templates.set('benchmark_comparison', {
      name: 'Benchmark Comparison Report',
      sections: ['overview', 'industry_comparison', 'peer_analysis', 'gap_analysis'],
      format: 'pdf'
    });

    this.templates.set('compliance_mapping', {
      name: 'Compliance Mapping Report',
      sections: ['frameworks', 'controls', 'gaps', 'remediation'],
      format: 'pdf'
    });

    this.templates.set('trend_analysis', {
      name: 'Trend Analysis Report',
      sections: ['historical', 'predictions', 'risk_factors'],
      format: 'excel'
    });
  }

  async generateReport(type, data, options = {}) {
    const reportId = uuidv4();
    const format = options.format || 'pdf';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}_${timestamp}_${reportId.substring(0, 8)}`;

    let report;
    switch (format.toLowerCase()) {
      case 'pdf':
        report = await this.generatePDFReport(type, data, filename);
        break;
      case 'excel':
      case 'xlsx':
        report = await this.generateExcelReport(type, data, filename);
        break;
      case 'json':
        report = await this.generateJSONReport(type, data, filename);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return {
      reportId,
      type,
      format,
      filename: report.filename,
      path: report.path,
      size: report.size,
      generatedAt: new Date().toISOString()
    };
  }

  async generatePDFReport(type, data, filename) {
    return new Promise((resolve, reject) => {
      const filepath = path.join(this.reportsDir, `${filename}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      this.addPDFHeader(doc, type, data);

      // Content based on report type
      switch (type) {
        case 'executive_summary':
          this.addExecutiveSummary(doc, data);
          break;
        case 'detailed_assessment':
          this.addDetailedAssessment(doc, data);
          break;
        case 'benchmark_comparison':
          this.addBenchmarkComparison(doc, data);
          break;
        case 'compliance_mapping':
          this.addComplianceMapping(doc, data);
          break;
        default:
          this.addGenericReport(doc, data);
      }

      // Footer
      this.addPDFFooter(doc);

      doc.end();

      stream.on('finish', () => {
        const stats = fs.statSync(filepath);
        resolve({
          filename: `${filename}.pdf`,
          path: filepath,
          size: stats.size
        });
      });

      stream.on('error', reject);
    });
  }

  addPDFHeader(doc, type, data) {
    // Logo/Title area
    doc.fontSize(24)
       .fillColor('#0891b2')
       .text('SecurityDashboard', 50, 50)
       .fontSize(12)
       .fillColor('#6b7280')
       .text('Enterprise Security Posture Report', 50, 80);

    // Report title
    const template = this.templates.get(type) || { name: 'Security Report' };
    doc.fontSize(18)
       .fillColor('#111827')
       .text(template.name, 50, 120);

    // Date and metadata
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text(`Generated: ${new Date().toLocaleString()}`, 50, 150)
       .text(`Organization: ${data.organization || 'N/A'}`, 50, 165);

    doc.moveDown(2);
  }

  addExecutiveSummary(doc, data) {
    const score = data.score || {};
    
    // Overall Score Section
    doc.fontSize(16)
       .fillColor('#111827')
       .text('Overall Security Score', { underline: true })
       .moveDown();

    doc.fontSize(48)
       .fillColor(this.getScoreColor(score.overall || 0))
       .text(`${score.overall || 0}`, { align: 'center' })
       .fontSize(24)
       .text(`Grade: ${score.grade || 'N/A'}`, { align: 'center' })
       .moveDown(2);

    // Key Metrics
    doc.fontSize(14)
       .fillColor('#111827')
       .text('Key Metrics', { underline: true })
       .moveDown();

    const categories = score.categories || {};
    Object.entries(categories).forEach(([name, value]) => {
      doc.fontSize(11)
         .fillColor('#374151')
         .text(`${this.formatCategoryName(name)}: ${value}`, { continued: false });
    });

    doc.moveDown(2);

    // Recommendations
    doc.fontSize(14)
       .fillColor('#111827')
       .text('Top Recommendations', { underline: true })
       .moveDown();

    const recommendations = data.recommendations || [];
    recommendations.slice(0, 5).forEach((rec, i) => {
      doc.fontSize(10)
         .fillColor('#374151')
         .text(`${i + 1}. ${rec.action || rec}`, { indent: 20 });
    });
  }

  addDetailedAssessment(doc, data) {
    this.addExecutiveSummary(doc, data);
    
    doc.addPage();
    
    // Detailed Category Analysis
    doc.fontSize(16)
       .fillColor('#111827')
       .text('Category Analysis', { underline: true })
       .moveDown();

    const categories = data.categories || [];
    categories.forEach(cat => {
      doc.fontSize(12)
         .fillColor('#0891b2')
         .text(cat.name)
         .fontSize(10)
         .fillColor('#374151')
         .text(`Score: ${cat.score}/100`)
         .text(`Findings: Critical(${cat.findings?.critical || 0}), High(${cat.findings?.high || 0}), Medium(${cat.findings?.medium || 0}), Low(${cat.findings?.low || 0})`)
         .moveDown();
    });

    // Vulnerabilities Section
    if (data.vulnerabilities) {
      doc.addPage();
      doc.fontSize(16)
         .fillColor('#111827')
         .text('Vulnerability Summary', { underline: true })
         .moveDown();

      const vulns = data.vulnerabilities;
      doc.fontSize(11)
         .fillColor('#dc2626')
         .text(`Critical: ${vulns.critical || 0}`)
         .fillColor('#ea580c')
         .text(`High: ${vulns.high || 0}`)
         .fillColor('#ca8a04')
         .text(`Medium: ${vulns.medium || 0}`)
         .fillColor('#16a34a')
         .text(`Low: ${vulns.low || 0}`);
    }
  }

  addBenchmarkComparison(doc, data) {
    doc.fontSize(16)
       .fillColor('#111827')
       .text('Industry Benchmark Comparison', { underline: true })
       .moveDown();

    const benchmarks = data.benchmarks || {};
    
    doc.fontSize(12)
       .fillColor('#374151')
       .text(`Your Score: ${data.score?.overall || 0}`)
       .text(`Industry Average: ${benchmarks.average || 0}`)
       .text(`Industry Median: ${benchmarks.median || 0}`)
       .text(`Top 25%: ${benchmarks.top25 || 0}`)
       .text(`Bottom 25%: ${benchmarks.bottom25 || 0}`)
       .moveDown();

    doc.fontSize(14)
       .fillColor('#111827')
       .text(`Your Percentile: ${benchmarks.percentile || 0}%`, { align: 'center' })
       .moveDown(2);

    // Gap Analysis
    if (data.gaps) {
      doc.fontSize(14)
         .fillColor('#111827')
         .text('Gap Analysis', { underline: true })
         .moveDown();

      data.gaps.forEach(gap => {
        doc.fontSize(10)
           .fillColor('#374151')
           .text(`${gap.category}: ${gap.gap > 0 ? '+' : ''}${gap.gap} points vs industry`);
      });
    }
  }

  addComplianceMapping(doc, data) {
    doc.fontSize(16)
       .fillColor('#111827')
       .text('Compliance Framework Mapping', { underline: true })
       .moveDown();

    const frameworks = data.frameworks || [];
    frameworks.forEach(fw => {
      doc.fontSize(12)
         .fillColor('#0891b2')
         .text(fw.name)
         .fontSize(10)
         .fillColor('#374151')
         .text(`Compliance: ${fw.compliance || 0}%`)
         .text(`Controls Implemented: ${fw.implemented || 0}/${fw.total || 0}`)
         .text(`Gaps: ${fw.gaps || 0}`)
         .moveDown();
    });
  }

  addGenericReport(doc, data) {
    doc.fontSize(12)
       .fillColor('#374151')
       .text(JSON.stringify(data, null, 2));
  }

  addPDFFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Page ${i + 1} of ${pageCount} | SecurityDashboard Report | Confidential`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }
  }

  async generateExcelReport(type, data, filename) {
    const filepath = path.join(this.reportsDir, `${filename}.xlsx`);
    const workbook = XLSX.utils.book_new();

    // Overview Sheet
    const overviewData = [
      ['SecurityDashboard Report'],
      ['Generated', new Date().toISOString()],
      ['Type', type],
      ['Organization', data.organization || 'N/A'],
      [],
      ['Overall Score', data.score?.overall || 0],
      ['Grade', data.score?.grade || 'N/A']
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Categories Sheet
    if (data.categories || data.score?.categories) {
      const categories = data.categories || [];
      const catData = [['Category', 'Score', 'Critical', 'High', 'Medium', 'Low']];
      
      if (Array.isArray(categories)) {
        categories.forEach(cat => {
          catData.push([
            cat.name,
            cat.score,
            cat.findings?.critical || 0,
            cat.findings?.high || 0,
            cat.findings?.medium || 0,
            cat.findings?.low || 0
          ]);
        });
      } else {
        Object.entries(data.score?.categories || {}).forEach(([name, score]) => {
          catData.push([this.formatCategoryName(name), score, 0, 0, 0, 0]);
        });
      }
      
      const catSheet = XLSX.utils.aoa_to_sheet(catData);
      XLSX.utils.book_append_sheet(workbook, catSheet, 'Categories');
    }

    // Trend Sheet
    if (data.trend) {
      const trendData = [['Date', 'Score', 'Change']];
      data.trend.forEach(t => {
        trendData.push([t.date, t.score, t.change || 0]);
      });
      const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(workbook, trendSheet, 'Trend');
    }

    // Recommendations Sheet
    if (data.recommendations) {
      const recData = [['Priority', 'Action', 'Impact', 'Effort', 'Category']];
      data.recommendations.forEach((rec, i) => {
        recData.push([
          i + 1,
          rec.action || rec,
          rec.impact || 'N/A',
          rec.effort || 'N/A',
          rec.category || 'N/A'
        ]);
      });
      const recSheet = XLSX.utils.aoa_to_sheet(recData);
      XLSX.utils.book_append_sheet(workbook, recSheet, 'Recommendations');
    }

    XLSX.writeFile(workbook, filepath);
    const stats = fs.statSync(filepath);

    return {
      filename: `${filename}.xlsx`,
      path: filepath,
      size: stats.size
    };
  }

  async generateJSONReport(type, data, filename) {
    const filepath = path.join(this.reportsDir, `${filename}.json`);
    
    const report = {
      metadata: {
        type,
        generatedAt: new Date().toISOString(),
        organization: data.organization || 'N/A',
        version: '2.0'
      },
      data
    };

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    const stats = fs.statSync(filepath);

    return {
      filename: `${filename}.json`,
      path: filepath,
      size: stats.size
    };
  }

  scheduleReport(schedule, type, options = {}) {
    const scheduleId = uuidv4();
    
    this.scheduledReports.set(scheduleId, {
      id: scheduleId,
      schedule,
      type,
      options,
      createdAt: new Date(),
      lastRun: null,
      nextRun: this.calculateNextRun(schedule)
    });

    return scheduleId;
  }

  calculateNextRun(schedule) {
    // Simple schedule parsing (would use node-cron in production)
    return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: tomorrow
  }

  getAvailableTemplates() {
    return Array.from(this.templates.entries()).map(([id, template]) => ({
      id,
      ...template
    }));
  }

  getScoreColor(score) {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#ca8a04';
    return '#dc2626';
  }

  formatCategoryName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
  }

  async getReport(reportId) {
    const files = fs.readdirSync(this.reportsDir);
    const reportFile = files.find(f => f.includes(reportId));
    
    if (!reportFile) return null;

    const filepath = path.join(this.reportsDir, reportFile);
    return {
      filename: reportFile,
      path: filepath,
      size: fs.statSync(filepath).size
    };
  }

  async deleteReport(reportId) {
    const report = await this.getReport(reportId);
    if (report) {
      fs.unlinkSync(report.path);
      return true;
    }
    return false;
  }
}

module.exports = new AdvancedReportingService();

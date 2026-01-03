/**
 * Report Service - Tool 18 ThreatModel
 * Generate and export threat model reports in various formats
 */

class ReportService {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  // ============ Report Generation ============

  // Generate comprehensive threat model report
  async generateReport(threatModel, options = {}) {
    const {
      format = 'json',
      includeExecutiveSummary = true,
      includeDetailedThreats = true,
      includeMitigations = true,
      includeCompliance = true,
      includeRiskMatrix = true,
      includeAttackTrees = false
    } = options;

    const report = {
      metadata: this.generateMetadata(threatModel),
      executiveSummary: includeExecutiveSummary ? this.generateExecutiveSummary(threatModel) : null,
      scopeAndBoundaries: this.generateScope(threatModel),
      systemArchitecture: this.generateArchitectureSection(threatModel),
      strideAnalysis: this.generateSTRIDESection(threatModel),
      threatDetails: includeDetailedThreats ? this.generateThreatDetails(threatModel) : null,
      riskMatrix: includeRiskMatrix ? this.generateRiskMatrix(threatModel) : null,
      mitigations: includeMitigations ? this.generateMitigationsSection(threatModel) : null,
      complianceMapping: includeCompliance ? this.generateComplianceSection(threatModel) : null,
      attackTrees: includeAttackTrees ? this.generateAttackTreesSection(threatModel) : null,
      recommendations: this.generateRecommendations(threatModel),
      appendices: this.generateAppendices(threatModel)
    };

    return this.formatReport(report, format);
  }

  // Generate metadata
  generateMetadata(threatModel) {
    return {
      reportId: `TM-RPT-${Date.now()}`,
      threatModelId: threatModel._id,
      threatModelName: threatModel.name,
      version: threatModel.version || '1.0.0',
      methodology: threatModel.methodology || 'stride',
      status: threatModel.status || 'draft',
      generatedAt: new Date().toISOString(),
      generatedBy: 'ThreatModel Tool v2.0',
      classification: 'CONFIDENTIAL'
    };
  }

  // Generate executive summary
  generateExecutiveSummary(threatModel) {
    const threats = threatModel.threats || [];
    const mitigations = threatModel.mitigations || [];
    const components = threatModel.components || [];

    const summary = threatModel.riskSummary || {};
    const criticalCount = summary.critical || threats.filter(t => t.riskLevel === 'critical').length;
    const highCount = summary.high || threats.filter(t => t.riskLevel === 'high').length;
    const mitigatedCount = summary.mitigated || threats.filter(t => t.status === 'mitigated').length;

    const riskScore = summary.averageRiskScore || this.calculateRiskScore(threats);
    const riskLevel = riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

    return {
      overview: `This threat model analysis covers ${threatModel.name} with ${components.length} components and ${threats.length} identified threats.`,
      scope: threatModel.scope?.description || 'Full system analysis',
      keyFindings: {
        totalThreats: threats.length,
        criticalThreats: criticalCount,
        highRiskThreats: highCount,
        mitigatedThreats: mitigatedCount,
        openThreats: threats.length - mitigatedCount
      },
      riskAssessment: {
        overallScore: riskScore,
        riskLevel,
        trend: 'stable'
      },
      topPriorities: this.getTopPriorities(threats),
      recommendations: [
        criticalCount > 0 ? 'Address critical threats within 24-48 hours' : null,
        highCount > 0 ? 'Prioritize mitigation of high-risk threats' : null,
        'Conduct regular threat model reviews',
        'Implement continuous monitoring'
      ].filter(Boolean)
    };
  }

  // Generate scope section
  generateScope(threatModel) {
    return {
      description: threatModel.scope?.description || threatModel.description,
      boundaries: threatModel.scope?.boundaries || [],
      assumptions: threatModel.scope?.assumptions || [],
      exclusions: threatModel.scope?.exclusions || [],
      trustBoundaries: threatModel.system?.trustBoundaries?.map(tb => ({
        name: tb.name,
        description: tb.description,
        componentCount: tb.components?.length || 0
      })) || []
    };
  }

  // Generate architecture section
  generateArchitectureSection(threatModel) {
    const system = threatModel.system || {};
    const components = threatModel.components || [];

    return {
      systemName: system.name || threatModel.name,
      systemType: system.type,
      architecture: system.architecture,
      components: components.map(c => ({
        name: c.name,
        type: c.type,
        trustLevel: c.trustLevel,
        technology: c.technology,
        exposedInterfaces: c.exposedInterfaces,
        dataHandled: c.dataHandled?.map(d => d.type) || []
      })),
      dataFlows: system.dataFlows?.map(df => ({
        source: df.source,
        destination: df.destination,
        dataType: df.dataType,
        protocol: df.protocol,
        encrypted: df.encrypted
      })) || [],
      externalDependencies: components.filter(c => c.type === 'external_service').map(c => c.name)
    };
  }

  // Generate STRIDE analysis section
  generateSTRIDESection(threatModel) {
    const strideAnalysis = threatModel.strideAnalysis || {};
    const threats = threatModel.threats || [];

    const categorize = (category) => threats.filter(t => 
      t.category === category || t.strideCategory === category.charAt(0).toUpperCase()
    );

    return {
      methodology: 'STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)',
      categories: {
        spoofing: {
          description: 'Pretending to be someone or something other than yourself',
          threats: strideAnalysis.spoofing || categorize('spoofing').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.spoofing?.length || categorize('spoofing').length
        },
        tampering: {
          description: 'Modifying data or code without authorization',
          threats: strideAnalysis.tampering || categorize('tampering').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.tampering?.length || categorize('tampering').length
        },
        repudiation: {
          description: 'Denying performing an action without way to prove otherwise',
          threats: strideAnalysis.repudiation || categorize('repudiation').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.repudiation?.length || categorize('repudiation').length
        },
        informationDisclosure: {
          description: 'Exposing information to unauthorized individuals',
          threats: strideAnalysis.informationDisclosure || categorize('information_disclosure').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.informationDisclosure?.length || categorize('information_disclosure').length
        },
        denialOfService: {
          description: 'Disrupting or preventing legitimate access to services',
          threats: strideAnalysis.denialOfService || categorize('denial_of_service').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.denialOfService?.length || categorize('denial_of_service').length
        },
        elevationOfPrivilege: {
          description: 'Gaining capabilities without proper authorization',
          threats: strideAnalysis.elevationOfPrivilege || categorize('elevation_of_privilege').map(t => ({
            name: t.name,
            description: t.description,
            risk: t.riskLevel
          })),
          count: strideAnalysis.elevationOfPrivilege?.length || categorize('elevation_of_privilege').length
        }
      }
    };
  }

  // Generate detailed threat section
  generateThreatDetails(threatModel) {
    const threats = threatModel.threats || [];

    return threats.map((threat, index) => ({
      id: threat._id || `T-${index + 1}`,
      name: threat.name,
      description: threat.description,
      category: threat.category,
      strideCategory: threat.strideCategory,
      riskLevel: threat.riskLevel,
      status: threat.status,
      attackVector: threat.attackVector,
      attackComplexity: threat.attackComplexity,
      privilegesRequired: threat.privilegesRequired,
      userInteraction: threat.userInteraction,
      likelihood: threat.likelihood,
      impact: {
        confidentiality: threat.impact?.confidentiality,
        integrity: threat.impact?.integrity,
        availability: threat.impact?.availability
      },
      cvssScore: threat.cvssScore,
      affectedComponents: threat.affectedComponents?.map(c => c.name || c) || [],
      affectedAssets: threat.affectedAssets?.map(a => a.name || a) || [],
      mitigations: threat.mitigations?.map(m => m.name || m) || [],
      references: threat.references || [],
      notes: threat.notes
    }));
  }

  // Generate risk matrix
  generateRiskMatrix(threatModel) {
    const threats = threatModel.threats || [];
    
    const matrix = {
      'critical': { critical: 0, high: 0, medium: 0, low: 0 },
      'high': { critical: 0, high: 0, medium: 0, low: 0 },
      'medium': { critical: 0, high: 0, medium: 0, low: 0 },
      'low': { critical: 0, high: 0, medium: 0, low: 0 }
    };

    threats.forEach(threat => {
      const likelihood = threat.likelihood || 'medium';
      const impact = this.getHighestImpact(threat.impact) || 'medium';
      
      const likelihoodMap = { 'very_high': 'critical', 'high': 'high', 'medium': 'medium', 'low': 'low', 'very_low': 'low' };
      const normalizedLikelihood = likelihoodMap[likelihood] || 'medium';
      
      if (matrix[normalizedLikelihood] && matrix[normalizedLikelihood][impact] !== undefined) {
        matrix[normalizedLikelihood][impact]++;
      }
    });

    return {
      matrix,
      legend: {
        rows: 'Likelihood (Critical to Low)',
        columns: 'Impact (Critical to Low)',
        values: 'Number of threats'
      },
      summary: {
        criticalRisk: matrix.critical.critical + matrix.high.critical,
        highRisk: matrix.critical.high + matrix.high.high + matrix.medium.critical,
        mediumRisk: matrix.medium.medium + matrix.medium.high + matrix.high.medium,
        lowRisk: matrix.low.low + matrix.low.medium + matrix.medium.low
      }
    };
  }

  // Generate mitigations section
  generateMitigationsSection(threatModel) {
    const mitigations = threatModel.mitigations || [];

    const byStatus = {
      implemented: mitigations.filter(m => m.status === 'implemented'),
      in_progress: mitigations.filter(m => m.status === 'in_progress'),
      planned: mitigations.filter(m => m.status === 'planned'),
      not_started: mitigations.filter(m => m.status === 'not_started' || !m.status)
    };

    return {
      summary: {
        total: mitigations.length,
        implemented: byStatus.implemented.length,
        inProgress: byStatus.in_progress.length,
        planned: byStatus.planned.length,
        notStarted: byStatus.not_started.length,
        completionRate: mitigations.length > 0 
          ? Math.round((byStatus.implemented.length / mitigations.length) * 100) 
          : 0
      },
      mitigations: mitigations.map(m => ({
        id: m._id,
        name: m.name,
        description: m.description,
        type: m.type,
        status: m.status,
        priority: m.priority,
        effectiveness: m.effectiveness,
        cost: m.cost,
        owner: m.owner,
        dueDate: m.dueDate,
        addressedThreats: m.threats?.map(t => t.name || t) || []
      })),
      byPriority: {
        critical: mitigations.filter(m => m.priority === 'critical'),
        high: mitigations.filter(m => m.priority === 'high'),
        medium: mitigations.filter(m => m.priority === 'medium'),
        low: mitigations.filter(m => m.priority === 'low')
      }
    };
  }

  // Generate compliance mapping section
  generateComplianceSection(threatModel) {
    const threats = threatModel.threats || [];
    
    return {
      frameworks: ['NIST CSF 2.0', 'CIS Controls v8', 'ISO 27001:2022', 'OWASP Top 10'],
      mappings: {
        nist_csf: {
          identify: threats.filter(t => ['information_disclosure', 'spoofing'].includes(t.category)).length,
          protect: threats.filter(t => ['tampering', 'elevation_of_privilege'].includes(t.category)).length,
          detect: threats.length,
          respond: 0,
          recover: 0
        },
        owasp: this.mapThreatsToOWASP(threats),
        coverage: {
          'Access Control': this.getCoverageForCategory(threats, 'elevation_of_privilege'),
          'Cryptography': this.getCoverageForCategory(threats, 'information_disclosure'),
          'Injection': this.getCoverageForCategory(threats, 'tampering'),
          'Authentication': this.getCoverageForCategory(threats, 'spoofing')
        }
      },
      recommendations: [
        'Ensure all critical threats are mapped to compliance controls',
        'Document mitigation effectiveness for audit purposes',
        'Conduct regular compliance reviews'
      ]
    };
  }

  // Generate attack trees section
  generateAttackTreesSection(threatModel) {
    const criticalThreats = (threatModel.threats || []).filter(t => t.riskLevel === 'critical');
    
    return criticalThreats.map(threat => ({
      threatId: threat._id,
      threatName: threat.name,
      attackTree: {
        goal: `Exploit ${threat.name}`,
        nodes: [
          { id: '1', label: 'Reconnaissance', type: 'step' },
          { id: '2', label: 'Initial Access', type: 'step' },
          { id: '3', label: 'Exploit Vulnerability', type: 'attack' },
          { id: '4', label: 'Achieve Goal', type: 'goal' }
        ],
        edges: [
          { from: '1', to: '2' },
          { from: '2', to: '3' },
          { from: '3', to: '4' }
        ]
      }
    }));
  }

  // Generate recommendations
  generateRecommendations(threatModel) {
    const threats = threatModel.threats || [];
    const mitigations = threatModel.mitigations || [];
    const recommendations = [];

    // Critical threats
    const critical = threats.filter(t => t.riskLevel === 'critical');
    if (critical.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Threat Remediation',
        recommendation: `Address ${critical.length} critical threat(s) immediately`,
        threats: critical.map(t => t.name),
        timeline: '24-48 hours'
      });
    }

    // Unmitigated threats
    const unmitigated = threats.filter(t => t.status !== 'mitigated');
    if (unmitigated.length > threats.length * 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'Mitigation Coverage',
        recommendation: 'Improve mitigation coverage - over 50% of threats are unmitigated',
        timeline: '1-2 weeks'
      });
    }

    // Missing mitigations
    if (mitigations.length < threats.length) {
      recommendations.push({
        priority: 'medium',
        category: 'Mitigation Planning',
        recommendation: 'Define mitigations for all identified threats',
        timeline: '2-4 weeks'
      });
    }

    // Process improvements
    recommendations.push({
      priority: 'low',
      category: 'Process Improvement',
      recommendation: 'Schedule regular threat model reviews (quarterly)',
      timeline: 'Ongoing'
    });

    return recommendations;
  }

  // Generate appendices
  generateAppendices(threatModel) {
    return {
      glossary: this.getGlossary(),
      references: threatModel.references || [],
      revisionHistory: [
        {
          version: threatModel.version,
          date: threatModel.updatedAt || threatModel.createdAt,
          author: threatModel.createdBy || 'System',
          changes: 'Initial version'
        }
      ],
      methodology: {
        name: threatModel.methodology,
        description: this.getMethodologyDescription(threatModel.methodology)
      }
    };
  }

  // ============ Export Formats ============

  // Format report based on requested format
  formatReport(report, format) {
    switch (format.toLowerCase()) {
      case 'html':
        return this.formatAsHTML(report);
      case 'markdown':
      case 'md':
        return this.formatAsMarkdown(report);
      case 'yaml':
        return this.formatAsYAML(report);
      case 'csv':
        return this.formatAsCSV(report);
      case 'json':
      default:
        return { format: 'json', content: report };
    }
  }

  // Format as HTML
  formatAsHTML(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Threat Model Report - ${report.metadata.threatModelName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #eee; }
    h1 { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
    h2 { color: #fb923c; margin-top: 30px; }
    h3 { color: #fdba74; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #444; padding: 10px; text-align: left; }
    th { background: #2d2d4a; }
    tr:nth-child(even) { background: #252542; }
    .critical { color: #ef4444; font-weight: bold; }
    .high { color: #f97316; }
    .medium { color: #eab308; }
    .low { color: #22c55e; }
    .summary-box { background: #2d2d4a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #f97316; }
    .metric-label { color: #888; }
  </style>
</head>
<body>
  <h1>🎯 Threat Model Report</h1>
  <p><strong>Model:</strong> ${report.metadata.threatModelName}</p>
  <p><strong>Version:</strong> ${report.metadata.version}</p>
  <p><strong>Generated:</strong> ${report.metadata.generatedAt}</p>
  <p><strong>Methodology:</strong> ${report.metadata.methodology.toUpperCase()}</p>
  
  <div class="summary-box">
    <h2>Executive Summary</h2>
    <p>${report.executiveSummary?.overview || ''}</p>
    <div>
      <div class="metric">
        <div class="metric-value">${report.executiveSummary?.keyFindings?.totalThreats || 0}</div>
        <div class="metric-label">Total Threats</div>
      </div>
      <div class="metric">
        <div class="metric-value critical">${report.executiveSummary?.keyFindings?.criticalThreats || 0}</div>
        <div class="metric-label">Critical</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.executiveSummary?.keyFindings?.mitigatedThreats || 0}</div>
        <div class="metric-label">Mitigated</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.executiveSummary?.riskAssessment?.overallScore || 0}%</div>
        <div class="metric-label">Risk Score</div>
      </div>
    </div>
  </div>

  <h2>STRIDE Analysis</h2>
  <table>
    <tr><th>Category</th><th>Count</th><th>Description</th></tr>
    ${Object.entries(report.strideAnalysis?.categories || {}).map(([key, val]) => 
      `<tr><td>${key}</td><td>${val.count}</td><td>${val.description}</td></tr>`
    ).join('')}
  </table>

  <h2>Threat Details</h2>
  <table>
    <tr><th>Name</th><th>Category</th><th>Risk</th><th>Status</th></tr>
    ${(report.threatDetails || []).map(t => 
      `<tr><td>${t.name}</td><td>${t.category}</td><td class="${t.riskLevel}">${t.riskLevel}</td><td>${t.status}</td></tr>`
    ).join('')}
  </table>

  <h2>Recommendations</h2>
  <table>
    <tr><th>Priority</th><th>Category</th><th>Recommendation</th><th>Timeline</th></tr>
    ${(report.recommendations || []).map(r => 
      `<tr><td class="${r.priority}">${r.priority}</td><td>${r.category}</td><td>${r.recommendation}</td><td>${r.timeline}</td></tr>`
    ).join('')}
  </table>

  <footer style="margin-top: 40px; color: #666; text-align: center;">
    <p>Generated by ThreatModel Tool - VictoryKit Security Platform</p>
  </footer>
</body>
</html>`;

    return { format: 'html', content: html, mimeType: 'text/html' };
  }

  // Format as Markdown
  formatAsMarkdown(report) {
    const md = `
# 🎯 Threat Model Report: ${report.metadata.threatModelName}

**Version:** ${report.metadata.version}  
**Generated:** ${report.metadata.generatedAt}  
**Methodology:** ${report.metadata.methodology.toUpperCase()}

---

## Executive Summary

${report.executiveSummary?.overview || ''}

### Key Findings

| Metric | Value |
|--------|-------|
| Total Threats | ${report.executiveSummary?.keyFindings?.totalThreats || 0} |
| Critical Threats | ${report.executiveSummary?.keyFindings?.criticalThreats || 0} |
| High-Risk Threats | ${report.executiveSummary?.keyFindings?.highRiskThreats || 0} |
| Mitigated Threats | ${report.executiveSummary?.keyFindings?.mitigatedThreats || 0} |

**Risk Score:** ${report.executiveSummary?.riskAssessment?.overallScore || 0}% (${report.executiveSummary?.riskAssessment?.riskLevel || 'N/A'})

---

## STRIDE Analysis

${Object.entries(report.strideAnalysis?.categories || {}).map(([key, val]) => 
  `### ${key.charAt(0).toUpperCase() + key.slice(1)} (${val.count} threats)\n${val.description}\n`
).join('\n')}

---

## Threat Details

| # | Name | Category | Risk Level | Status |
|---|------|----------|------------|--------|
${(report.threatDetails || []).map((t, i) => 
  `| ${i + 1} | ${t.name} | ${t.category} | ${t.riskLevel} | ${t.status} |`
).join('\n')}

---

## Recommendations

${(report.recommendations || []).map((r, i) => 
  `${i + 1}. **[${r.priority.toUpperCase()}]** ${r.recommendation} *(Timeline: ${r.timeline})*`
).join('\n')}

---

*Generated by ThreatModel Tool - VictoryKit Security Platform*
`;

    return { format: 'markdown', content: md, mimeType: 'text/markdown' };
  }

  // Format as YAML
  formatAsYAML(report) {
    const yaml = this.objectToYAML(report);
    return { format: 'yaml', content: yaml, mimeType: 'text/yaml' };
  }

  // Format as CSV (threats only)
  formatAsCSV(report) {
    const headers = ['ID', 'Name', 'Category', 'Risk Level', 'Status', 'Attack Vector', 'Likelihood'];
    const rows = (report.threatDetails || []).map(t => [
      t.id, t.name, t.category, t.riskLevel, t.status, t.attackVector, t.likelihood
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v || ''}"`).join(','))
    ].join('\n');

    return { format: 'csv', content: csv, mimeType: 'text/csv' };
  }

  // ============ Helper Methods ============

  calculateRiskScore(threats) {
    if (!threats.length) return 0;
    const weights = { critical: 100, high: 75, medium: 50, low: 25 };
    const total = threats.reduce((sum, t) => sum + (weights[t.riskLevel] || 50), 0);
    return Math.round(total / threats.length);
  }

  getTopPriorities(threats) {
    return threats
      .filter(t => t.riskLevel === 'critical' || t.riskLevel === 'high')
      .slice(0, 5)
      .map(t => ({
        name: t.name,
        riskLevel: t.riskLevel,
        status: t.status
      }));
  }

  getHighestImpact(impact) {
    if (!impact) return 'medium';
    const levels = ['none', 'low', 'medium', 'high', 'critical'];
    const values = [
      levels.indexOf(impact.confidentiality || 'none'),
      levels.indexOf(impact.integrity || 'none'),
      levels.indexOf(impact.availability || 'none')
    ];
    return levels[Math.max(...values)] || 'medium';
  }

  mapThreatsToOWASP(threats) {
    const mapping = {
      'A01:2021': 0, 'A02:2021': 0, 'A03:2021': 0, 'A04:2021': 0, 'A05:2021': 0,
      'A06:2021': 0, 'A07:2021': 0, 'A08:2021': 0, 'A09:2021': 0, 'A10:2021': 0
    };

    threats.forEach(t => {
      if (t.category === 'elevation_of_privilege') mapping['A01:2021']++;
      if (t.category === 'information_disclosure') mapping['A02:2021']++;
      if (t.category === 'tampering') mapping['A03:2021']++;
      if (t.category === 'spoofing') mapping['A07:2021']++;
      if (t.category === 'repudiation') mapping['A09:2021']++;
    });

    return mapping;
  }

  getCoverageForCategory(threats, category) {
    const total = threats.filter(t => t.category === category).length;
    const mitigated = threats.filter(t => t.category === category && t.status === 'mitigated').length;
    return total > 0 ? Math.round((mitigated / total) * 100) : 100;
  }

  getGlossary() {
    return {
      'STRIDE': 'Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege',
      'DREAD': 'Damage, Reproducibility, Exploitability, Affected Users, Discoverability',
      'CVSS': 'Common Vulnerability Scoring System',
      'Threat': 'A potential negative action or event facilitated by a vulnerability',
      'Vulnerability': 'A weakness that can be exploited by a threat',
      'Mitigation': 'A control or countermeasure to reduce threat risk'
    };
  }

  getMethodologyDescription(methodology) {
    const descriptions = {
      stride: 'STRIDE is a threat modeling methodology developed by Microsoft that categorizes threats into six categories.',
      pasta: 'PASTA (Process for Attack Simulation and Threat Analysis) is a seven-stage threat modeling methodology.',
      attack_trees: 'Attack Trees model threats as a tree structure with the goal as the root and attack methods as leaves.',
      custom: 'Custom methodology tailored for specific requirements.'
    };
    return descriptions[methodology] || descriptions.stride;
  }

  objectToYAML(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.objectToYAML(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYAML(value, indent + 1);
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }

  initializeTemplates() {
    return {
      executive: 'executive-summary',
      detailed: 'detailed-report',
      compliance: 'compliance-report'
    };
  }
}

module.exports = new ReportService();

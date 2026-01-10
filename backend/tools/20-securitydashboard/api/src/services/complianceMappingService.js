/**
 * Compliance Mapping Service - Security score to compliance framework mapping
 * Maps security metrics to regulatory and industry compliance requirements
 */

class ComplianceMappingService {
  constructor() {
    this.frameworks = new Map();
    this.controlMappings = new Map();
    this.initialized = false;
  }

  async initialize() {
    this.loadFrameworks();
    this.loadControlMappings();
    this.initialized = true;
    console.log('Compliance Mapping Service initialized');
  }

  loadFrameworks() {
    // NIST Cybersecurity Framework
    this.frameworks.set('nist_csf', {
      id: 'nist_csf',
      name: 'NIST Cybersecurity Framework',
      version: '1.1',
      functions: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
      categories: 23,
      subcategories: 108
    });

    // ISO 27001
    this.frameworks.set('iso_27001', {
      id: 'iso_27001',
      name: 'ISO/IEC 27001:2022',
      version: '2022',
      domains: [
        'Information Security Policies',
        'Organization of Information Security',
        'Human Resource Security',
        'Asset Management',
        'Access Control',
        'Cryptography',
        'Physical Security',
        'Operations Security',
        'Communications Security',
        'System Development',
        'Supplier Relationships',
        'Incident Management',
        'Business Continuity',
        'Compliance'
      ],
      controls: 93
    });

    // SOC 2
    this.frameworks.set('soc2', {
      id: 'soc2',
      name: 'SOC 2 Type II',
      version: '2017',
      trustServiceCriteria: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
      controls: 64
    });

    // PCI DSS
    this.frameworks.set('pci_dss', {
      id: 'pci_dss',
      name: 'PCI DSS',
      version: '4.0',
      requirements: [
        'Install and maintain network security controls',
        'Apply secure configurations',
        'Protect stored account data',
        'Protect cardholder data during transmission',
        'Protect from malicious software',
        'Develop and maintain secure systems',
        'Restrict access by business need',
        'Identify users and authenticate access',
        'Restrict physical access',
        'Log and monitor access',
        'Test security systems',
        'Support information security policies'
      ],
      controls: 78
    });

    // HIPAA
    this.frameworks.set('hipaa', {
      id: 'hipaa',
      name: 'HIPAA Security Rule',
      version: '2013',
      safeguards: ['Administrative', 'Physical', 'Technical'],
      standards: 18,
      specifications: 54
    });

    // GDPR
    this.frameworks.set('gdpr', {
      id: 'gdpr',
      name: 'GDPR',
      version: '2018',
      principles: [
        'Lawfulness, fairness, transparency',
        'Purpose limitation',
        'Data minimization',
        'Accuracy',
        'Storage limitation',
        'Integrity and confidentiality',
        'Accountability'
      ],
      articles: 99
    });

    // CIS Controls
    this.frameworks.set('cis_controls', {
      id: 'cis_controls',
      name: 'CIS Controls',
      version: '8.0',
      implementationGroups: ['IG1', 'IG2', 'IG3'],
      controls: 18,
      safeguards: 153
    });

    // CMMC
    this.frameworks.set('cmmc', {
      id: 'cmmc',
      name: 'CMMC 2.0',
      version: '2.0',
      levels: ['Foundational', 'Advanced', 'Expert'],
      domains: 14,
      practices: 171
    });
  }

  loadControlMappings() {
    // Map security score categories to compliance controls
    this.controlMappings.set('network', {
      nist_csf: ['PR.AC-5', 'PR.DS-5', 'DE.AE-1', 'DE.CM-1'],
      iso_27001: ['A.13.1', 'A.13.2'],
      soc2: ['CC6.1', 'CC6.6', 'CC7.1'],
      pci_dss: ['1.1', '1.2', '1.3'],
      hipaa: ['164.312(e)(1)', '164.312(e)(2)'],
      cis_controls: ['12', '13'],
      cmmc: ['SC.1', 'SC.2']
    });

    this.controlMappings.set('endpoint', {
      nist_csf: ['PR.IP-1', 'PR.IP-12', 'DE.CM-4'],
      iso_27001: ['A.8.1', 'A.12.5', 'A.12.6'],
      soc2: ['CC6.8', 'CC7.1'],
      pci_dss: ['5.1', '5.2', '5.3', '6.1', '6.2'],
      hipaa: ['164.308(a)(5)(ii)(B)', '164.310(d)(1)'],
      cis_controls: ['2', '4', '7', '10'],
      cmmc: ['CM.2', 'MP.1']
    });

    this.controlMappings.set('identity', {
      nist_csf: ['PR.AC-1', 'PR.AC-3', 'PR.AC-4', 'PR.AC-6', 'PR.AC-7'],
      iso_27001: ['A.9.1', 'A.9.2', 'A.9.3', 'A.9.4'],
      soc2: ['CC6.1', 'CC6.2', 'CC6.3'],
      pci_dss: ['7.1', '7.2', '8.1', '8.2', '8.3'],
      hipaa: ['164.312(a)(1)', '164.312(d)'],
      cis_controls: ['5', '6'],
      cmmc: ['AC.1', 'AC.2', 'IA.1', 'IA.2']
    });

    this.controlMappings.set('data', {
      nist_csf: ['PR.DS-1', 'PR.DS-2', 'PR.DS-3', 'PR.DS-4', 'PR.DS-5'],
      iso_27001: ['A.8.2', 'A.10.1', 'A.18.1'],
      soc2: ['CC6.1', 'C1.1', 'C1.2'],
      pci_dss: ['3.1', '3.2', '3.3', '3.4', '4.1', '4.2'],
      hipaa: ['164.312(a)(2)(iv)', '164.312(e)(2)(ii)'],
      gdpr: ['Article 5', 'Article 25', 'Article 32'],
      cis_controls: ['3'],
      cmmc: ['MP.2', 'SC.3']
    });

    this.controlMappings.set('application', {
      nist_csf: ['PR.IP-2', 'DE.CM-8'],
      iso_27001: ['A.14.1', 'A.14.2', 'A.14.3'],
      soc2: ['CC8.1'],
      pci_dss: ['6.1', '6.2', '6.3', '6.4', '6.5'],
      cis_controls: ['16'],
      cmmc: ['SA.1', 'SA.2']
    });

    this.controlMappings.set('cloud', {
      nist_csf: ['ID.BE-1', 'PR.AC-4', 'PR.PT-3'],
      iso_27001: ['A.15.1', 'A.15.2'],
      soc2: ['CC9.2'],
      cis_controls: ['15'],
      cmmc: ['CA.3']
    });

    this.controlMappings.set('compliance', {
      nist_csf: ['ID.GV-1', 'ID.GV-2', 'ID.GV-3', 'ID.GV-4'],
      iso_27001: ['A.5.1', 'A.6.1', 'A.18.1', 'A.18.2'],
      soc2: ['CC1.1', 'CC1.2', 'CC1.3', 'CC1.4', 'CC1.5'],
      pci_dss: ['12.1', '12.2', '12.3', '12.4', '12.5'],
      hipaa: ['164.308(a)(1)', '164.316(a)', '164.316(b)'],
      gdpr: ['Article 24', 'Article 35', 'Article 37'],
      cis_controls: ['17'],
      cmmc: ['AT.1', 'AU.1', 'CA.1']
    });
  }

  async getComplianceStatus(securityScore, frameworks = null) {
    const targetFrameworks = frameworks || Array.from(this.frameworks.keys());
    const results = {};

    for (const fwId of targetFrameworks) {
      if (this.frameworks.has(fwId)) {
        results[fwId] = await this.calculateFrameworkCompliance(securityScore, fwId);
      }
    }

    return {
      overallScore: securityScore.overall,
      frameworkCompliance: results,
      summary: this.generateComplianceSummary(results),
      generatedAt: new Date().toISOString()
    };
  }

  async calculateFrameworkCompliance(securityScore, frameworkId) {
    const framework = this.frameworks.get(frameworkId);
    const categoryScores = securityScore.categories || {};
    
    // Calculate compliance based on mapped controls
    let totalControls = 0;
    let satisfiedControls = 0;
    const controlStatus = {};

    for (const [category, mapping] of this.controlMappings.entries()) {
      const categoryScore = categoryScores[category] || 0;
      const controls = mapping[frameworkId] || [];
      
      controls.forEach(control => {
        totalControls++;
        const isCompliant = categoryScore >= 70; // Threshold for compliance
        if (isCompliant) satisfiedControls++;
        
        controlStatus[control] = {
          category,
          score: categoryScore,
          status: isCompliant ? 'Compliant' : (categoryScore >= 50 ? 'Partial' : 'Non-Compliant'),
          gap: Math.max(0, 70 - categoryScore)
        };
      });
    }

    const compliancePercentage = totalControls > 0 
      ? Math.round((satisfiedControls / totalControls) * 100) 
      : 0;

    return {
      framework: framework.name,
      version: framework.version,
      compliancePercentage,
      controlsAssessed: totalControls,
      controlsSatisfied: satisfiedControls,
      controlsPartial: Object.values(controlStatus).filter(c => c.status === 'Partial').length,
      controlsNonCompliant: Object.values(controlStatus).filter(c => c.status === 'Non-Compliant').length,
      status: this.getComplianceStatus2(compliancePercentage),
      controlDetails: controlStatus,
      recommendations: this.generateFrameworkRecommendations(controlStatus, frameworkId)
    };
  }

  getComplianceStatus2(percentage) {
    if (percentage >= 90) return 'Fully Compliant';
    if (percentage >= 70) return 'Substantially Compliant';
    if (percentage >= 50) return 'Partially Compliant';
    return 'Non-Compliant';
  }

  generateFrameworkRecommendations(controlStatus, frameworkId) {
    const recommendations = [];
    const nonCompliantControls = Object.entries(controlStatus)
      .filter(([_, status]) => status.status !== 'Compliant')
      .sort((a, b) => b[1].gap - a[1].gap);

    nonCompliantControls.slice(0, 5).forEach(([control, status]) => {
      recommendations.push({
        control,
        category: status.category,
        currentScore: status.score,
        requiredScore: 70,
        gap: status.gap,
        priority: status.gap > 30 ? 'High' : (status.gap > 15 ? 'Medium' : 'Low'),
        action: `Improve ${status.category} security controls to achieve ${frameworkId} compliance for ${control}`
      });
    });

    return recommendations;
  }

  generateComplianceSummary(results) {
    const frameworks = Object.values(results);
    const avgCompliance = frameworks.length > 0
      ? Math.round(frameworks.reduce((sum, f) => sum + f.compliancePercentage, 0) / frameworks.length)
      : 0;

    return {
      averageCompliance: avgCompliance,
      fullyCompliant: frameworks.filter(f => f.compliancePercentage >= 90).length,
      partiallyCompliant: frameworks.filter(f => f.compliancePercentage >= 50 && f.compliancePercentage < 90).length,
      nonCompliant: frameworks.filter(f => f.compliancePercentage < 50).length,
      topFrameworks: frameworks
        .sort((a, b) => b.compliancePercentage - a.compliancePercentage)
        .slice(0, 3)
        .map(f => ({ name: f.framework, compliance: f.compliancePercentage })),
      priorityGaps: frameworks
        .flatMap(f => f.recommendations)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 10)
    };
  }

  async getFrameworkGaps(securityScore, frameworkId) {
    const compliance = await this.calculateFrameworkCompliance(securityScore, frameworkId);
    
    return {
      framework: compliance.framework,
      gaps: Object.entries(compliance.controlDetails)
        .filter(([_, ctrl]) => ctrl.status !== 'Compliant')
        .map(([control, ctrl]) => ({
          control,
          category: ctrl.category,
          currentScore: ctrl.score,
          targetScore: 70,
          gap: ctrl.gap,
          impact: this.estimateRemediationImpact(ctrl.gap),
          effort: this.estimateRemediationEffort(ctrl.category, ctrl.gap)
        })),
      remediationRoadmap: this.generateRemediationRoadmap(compliance.controlDetails)
    };
  }

  estimateRemediationImpact(gap) {
    if (gap > 30) return 'Critical';
    if (gap > 20) return 'High';
    if (gap > 10) return 'Medium';
    return 'Low';
  }

  estimateRemediationEffort(category, gap) {
    const baseEffort = {
      network: 40,
      endpoint: 30,
      identity: 35,
      data: 45,
      application: 50,
      cloud: 40,
      compliance: 25
    };

    const effort = (baseEffort[category] || 35) + gap;
    if (effort > 70) return 'High';
    if (effort > 40) return 'Medium';
    return 'Low';
  }

  generateRemediationRoadmap(controlDetails) {
    const phases = [
      { name: 'Quick Wins', duration: '0-30 days', controls: [] },
      { name: 'Short Term', duration: '30-90 days', controls: [] },
      { name: 'Medium Term', duration: '90-180 days', controls: [] },
      { name: 'Long Term', duration: '180+ days', controls: [] }
    ];

    Object.entries(controlDetails)
      .filter(([_, ctrl]) => ctrl.status !== 'Compliant')
      .forEach(([control, ctrl]) => {
        const effort = this.estimateRemediationEffort(ctrl.category, ctrl.gap);
        const impact = this.estimateRemediationImpact(ctrl.gap);

        if (effort === 'Low' && impact !== 'Critical') {
          phases[0].controls.push({ control, ...ctrl });
        } else if (effort === 'Medium' || (effort === 'Low' && impact === 'Critical')) {
          phases[1].controls.push({ control, ...ctrl });
        } else if (impact === 'Critical' || impact === 'High') {
          phases[2].controls.push({ control, ...ctrl });
        } else {
          phases[3].controls.push({ control, ...ctrl });
        }
      });

    return phases.map(phase => ({
      ...phase,
      controlCount: phase.controls.length,
      estimatedImprovement: Math.round(phase.controls.reduce((sum, c) => sum + c.gap, 0) / Math.max(phase.controls.length, 1))
    }));
  }

  async getCrossFrameworkMapping(sourceFramework, targetFramework) {
    const source = this.frameworks.get(sourceFramework);
    const target = this.frameworks.get(targetFramework);

    if (!source || !target) {
      throw new Error('Invalid framework specified');
    }

    const mapping = {};
    
    for (const [category, controls] of this.controlMappings.entries()) {
      const sourceControls = controls[sourceFramework] || [];
      const targetControls = controls[targetFramework] || [];
      
      if (sourceControls.length > 0 && targetControls.length > 0) {
        mapping[category] = {
          source: sourceControls,
          target: targetControls,
          relationship: 'Related'
        };
      }
    }

    return {
      sourceFramework: source.name,
      targetFramework: target.name,
      mappings: mapping,
      coverage: Object.keys(mapping).length / this.controlMappings.size
    };
  }

  getAvailableFrameworks() {
    return Array.from(this.frameworks.entries()).map(([id, fw]) => ({
      id,
      name: fw.name,
      version: fw.version
    }));
  }
}

module.exports = new ComplianceMappingService();

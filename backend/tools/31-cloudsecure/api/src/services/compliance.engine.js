/**
 * Compliance Engine Service
 * Evaluates cloud resources against compliance frameworks
 */

const { v4: uuidv4 } = require('uuid');

class ComplianceEngine {
  constructor() {
    this.frameworks = {
      'CIS': this.getCISControls(),
      'SOC2': this.getSOC2Controls(),
      'PCI-DSS': this.getPCIDSSControls(),
      'HIPAA': this.getHIPAAControls(),
      'GDPR': this.getGDPRControls(),
      'NIST': this.getNISTControls(),
      'ISO27001': this.getISO27001Controls()
    };
  }

  /**
   * Evaluate compliance for a set of findings
   */
  async evaluateCompliance(findings, frameworks = []) {
    const results = {};
    const enabledFrameworks = frameworks.length > 0 ? frameworks : Object.keys(this.frameworks);

    for (const framework of enabledFrameworks) {
      results[framework] = await this.evaluateFramework(findings, framework);
    }

    return results;
  }

  /**
   * Evaluate a single framework
   */
  async evaluateFramework(findings, framework) {
    const controls = this.frameworks[framework] || [];
    const controlResults = [];

    for (const control of controls) {
      const relatedFindings = findings.filter(f => 
        f.compliance && f.compliance.some(c => 
          c.framework === framework && c.control === control.id
        )
      );

      const status = relatedFindings.length === 0 ? 'passed' : 
                     relatedFindings.some(f => f.severity === 'critical') ? 'failed' : 
                     relatedFindings.some(f => f.severity === 'high') ? 'failed' : 'warning';

      controlResults.push({
        controlId: control.id,
        controlTitle: control.title,
        description: control.description,
        category: control.category,
        status,
        findingsCount: relatedFindings.length,
        findings: relatedFindings.map(f => f.findingId)
      });
    }

    const passed = controlResults.filter(c => c.status === 'passed').length;
    const failed = controlResults.filter(c => c.status === 'failed').length;
    const warning = controlResults.filter(c => c.status === 'warning').length;

    return {
      framework,
      totalControls: controlResults.length,
      passed,
      failed,
      warning,
      complianceScore: Math.round((passed / controlResults.length) * 100),
      controls: controlResults
    };
  }

  /**
   * Generate compliance report
   */
  async generateReport(findings, frameworks, options = {}) {
    const complianceResults = await this.evaluateCompliance(findings, frameworks);
    
    const report = {
      reportId: uuidv4(),
      generatedAt: new Date(),
      frameworks: complianceResults,
      summary: this.generateSummary(complianceResults),
      recommendations: this.generateRecommendations(complianceResults, findings)
    };

    return report;
  }

  /**
   * Generate summary
   */
  generateSummary(complianceResults) {
    const frameworkScores = Object.entries(complianceResults).map(([name, data]) => ({
      framework: name,
      score: data.complianceScore,
      status: data.complianceScore >= 90 ? 'excellent' :
              data.complianceScore >= 70 ? 'good' :
              data.complianceScore >= 50 ? 'needs-improvement' : 'critical'
    }));

    const overallScore = Math.round(
      frameworkScores.reduce((sum, f) => sum + f.score, 0) / frameworkScores.length
    );

    return {
      overallScore,
      overallStatus: overallScore >= 90 ? 'excellent' :
                     overallScore >= 70 ? 'good' :
                     overallScore >= 50 ? 'needs-improvement' : 'critical',
      frameworkScores
    };
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(complianceResults, findings) {
    const recommendations = [];
    
    // Get failed controls with highest impact
    for (const [framework, data] of Object.entries(complianceResults)) {
      const failedControls = data.controls
        .filter(c => c.status === 'failed')
        .sort((a, b) => b.findingsCount - a.findingsCount)
        .slice(0, 3);

      for (const control of failedControls) {
        recommendations.push({
          priority: 'high',
          framework,
          control: control.controlId,
          title: `Address ${control.controlTitle}`,
          description: control.description,
          findingsCount: control.findingsCount
        });
      }
    }

    return recommendations.sort((a, b) => b.findingsCount - a.findingsCount).slice(0, 10);
  }

  /**
   * CIS Benchmark controls
   */
  getCISControls() {
    return [
      { id: '1.1', title: 'Root account MFA', description: 'Ensure MFA is enabled for root account', category: 'identity-access' },
      { id: '1.2', title: 'User account MFA', description: 'Ensure MFA is enabled for all IAM users', category: 'identity-access' },
      { id: '1.3', title: 'Credentials unused 90 days', description: 'Ensure credentials unused for 90 days are disabled', category: 'identity-access' },
      { id: '1.4', title: 'Access key rotation', description: 'Ensure access keys are rotated every 90 days', category: 'identity-access' },
      { id: '1.5', title: 'Password policy', description: 'Ensure IAM password policy requires minimum length', category: 'identity-access' },
      { id: '2.1.1', title: 'EBS encryption', description: 'Ensure EBS volume encryption is enabled', category: 'encryption' },
      { id: '2.1.5', title: 'S3 bucket public access', description: 'Ensure S3 Bucket Policy is set to deny HTTP requests', category: 'data-protection' },
      { id: '2.2.1', title: 'RDS encryption', description: 'Ensure RDS database instances are encrypted', category: 'encryption' },
      { id: '3.1', title: 'CloudTrail enabled', description: 'Ensure CloudTrail is enabled in all regions', category: 'logging-monitoring' },
      { id: '3.2', title: 'CloudTrail log validation', description: 'Ensure CloudTrail log file validation is enabled', category: 'logging-monitoring' },
      { id: '4.1', title: 'No public SSH', description: 'Ensure no security groups allow 0.0.0.0/0 to SSH', category: 'network-security' },
      { id: '4.2', title: 'No public RDP', description: 'Ensure no security groups allow 0.0.0.0/0 to RDP', category: 'network-security' },
      { id: '4.3', title: 'Default VPC', description: 'Ensure the default VPC is not used', category: 'network-security' },
      { id: '5.1', title: 'VPC flow logs', description: 'Ensure VPC flow logging is enabled', category: 'logging-monitoring' }
    ];
  }

  /**
   * SOC2 controls
   */
  getSOC2Controls() {
    return [
      { id: 'CC1.1', title: 'Control Environment', description: 'Management philosophy and operating style', category: 'governance' },
      { id: 'CC5.1', title: 'Control Activities', description: 'Control activities mitigate risks', category: 'governance' },
      { id: 'CC6.1', title: 'Logical Access', description: 'Logical access security software', category: 'identity-access' },
      { id: 'CC6.2', title: 'Authentication', description: 'Prior to issuing system credentials', category: 'identity-access' },
      { id: 'CC6.3', title: 'Access Removal', description: 'Access to credentials is removed when no longer needed', category: 'identity-access' },
      { id: 'CC6.6', title: 'Boundary Protection', description: 'System boundaries are protected', category: 'network-security' },
      { id: 'CC6.7', title: 'Information Transmission', description: 'Information transmitted is protected', category: 'encryption' },
      { id: 'CC7.1', title: 'Detection', description: 'Security events are detected', category: 'logging-monitoring' },
      { id: 'CC7.2', title: 'Monitoring', description: 'System anomalies are monitored', category: 'logging-monitoring' },
      { id: 'CC7.3', title: 'Incident Response', description: 'Security incidents are evaluated', category: 'incident-response' },
      { id: 'CC8.1', title: 'Change Management', description: 'Changes are authorized, designed, and implemented', category: 'governance' },
      { id: 'CC9.1', title: 'Risk Mitigation', description: 'Risk is identified and mitigated', category: 'governance' }
    ];
  }

  /**
   * PCI-DSS controls
   */
  getPCIDSSControls() {
    return [
      { id: '1.1', title: 'Firewall configuration', description: 'Install and maintain firewall configuration', category: 'network-security' },
      { id: '1.3', title: 'Prohibit direct public access', description: 'Prohibit direct public access between internet and CDE', category: 'network-security' },
      { id: '2.1', title: 'Vendor defaults', description: 'Do not use vendor-supplied defaults', category: 'configuration' },
      { id: '2.2', title: 'Configuration standards', description: 'Develop configuration standards for all components', category: 'configuration' },
      { id: '3.1', title: 'Data retention', description: 'Minimize data storage and retention', category: 'data-protection' },
      { id: '3.4', title: 'Data encryption', description: 'Render PAN unreadable anywhere it is stored', category: 'encryption' },
      { id: '4.1', title: 'Transmission encryption', description: 'Use strong cryptography for transmission', category: 'encryption' },
      { id: '6.5', title: 'Secure development', description: 'Address common coding vulnerabilities', category: 'vulnerability' },
      { id: '7.1', title: 'Access restriction', description: 'Limit access to cardholder data', category: 'identity-access' },
      { id: '8.2', title: 'Unique IDs', description: 'Assign unique ID to each person with access', category: 'identity-access' },
      { id: '10.1', title: 'Audit trails', description: 'Implement audit trails to link access', category: 'logging-monitoring' },
      { id: '11.2', title: 'Vulnerability scans', description: 'Run internal and external network vulnerability scans', category: 'vulnerability' }
    ];
  }

  /**
   * HIPAA controls
   */
  getHIPAAControls() {
    return [
      { id: '164.308(a)(1)', title: 'Security Management', description: 'Implement policies and procedures to prevent violations', category: 'governance' },
      { id: '164.308(a)(3)', title: 'Workforce Security', description: 'Implement policies for access to ePHI', category: 'identity-access' },
      { id: '164.308(a)(4)', title: 'Access Management', description: 'Implement policies for granting access', category: 'identity-access' },
      { id: '164.308(a)(5)', title: 'Security Awareness', description: 'Implement security awareness and training', category: 'governance' },
      { id: '164.308(a)(6)', title: 'Security Incidents', description: 'Identify and respond to security incidents', category: 'incident-response' },
      { id: '164.310(a)(1)', title: 'Facility Access', description: 'Limit physical access to facilities', category: 'physical-security' },
      { id: '164.310(b)', title: 'Workstation Use', description: 'Implement policies for workstation use', category: 'configuration' },
      { id: '164.310(d)(1)', title: 'Device Controls', description: 'Implement policies for device and media controls', category: 'data-protection' },
      { id: '164.312(a)(1)', title: 'Access Control', description: 'Implement technical policies for access control', category: 'identity-access' },
      { id: '164.312(b)', title: 'Audit Controls', description: 'Implement hardware, software audit controls', category: 'logging-monitoring' },
      { id: '164.312(c)(1)', title: 'Integrity', description: 'Implement policies to protect ePHI from alteration', category: 'data-protection' },
      { id: '164.312(e)(1)', title: 'Transmission Security', description: 'Implement measures to guard against unauthorized access during transmission', category: 'encryption' }
    ];
  }

  /**
   * GDPR controls
   */
  getGDPRControls() {
    return [
      { id: 'Art.5', title: 'Data Processing Principles', description: 'Lawful, fair, transparent, purpose limitation, data minimization', category: 'data-protection' },
      { id: 'Art.25', title: 'Data Protection by Design', description: 'Implement appropriate measures for data protection', category: 'data-protection' },
      { id: 'Art.32', title: 'Security of Processing', description: 'Implement appropriate technical and organizational measures', category: 'encryption' },
      { id: 'Art.33', title: 'Breach Notification', description: 'Notify supervisory authority within 72 hours', category: 'incident-response' },
      { id: 'Art.34', title: 'Data Subject Notification', description: 'Communicate breach to data subjects', category: 'incident-response' },
      { id: 'Art.35', title: 'Impact Assessment', description: 'Conduct data protection impact assessments', category: 'governance' },
      { id: 'Art.37', title: 'Data Protection Officer', description: 'Designate a data protection officer', category: 'governance' },
      { id: 'Art.44', title: 'Transfer Principles', description: 'Transfer to third countries with adequate protection', category: 'data-protection' }
    ];
  }

  /**
   * NIST controls
   */
  getNISTControls() {
    return [
      { id: 'AC-2', title: 'Account Management', description: 'Manage system accounts', category: 'identity-access' },
      { id: 'AC-3', title: 'Access Enforcement', description: 'Enforce approved authorizations', category: 'identity-access' },
      { id: 'AC-6', title: 'Least Privilege', description: 'Employ principle of least privilege', category: 'identity-access' },
      { id: 'AU-2', title: 'Audit Events', description: 'Determine auditable events', category: 'logging-monitoring' },
      { id: 'AU-6', title: 'Audit Review', description: 'Review and analyze audit records', category: 'logging-monitoring' },
      { id: 'CM-2', title: 'Baseline Configuration', description: 'Develop and maintain baseline configurations', category: 'configuration' },
      { id: 'CM-6', title: 'Configuration Settings', description: 'Establish and document configuration settings', category: 'configuration' },
      { id: 'IA-2', title: 'Identification', description: 'Uniquely identify and authenticate users', category: 'identity-access' },
      { id: 'IR-4', title: 'Incident Handling', description: 'Implement incident handling capability', category: 'incident-response' },
      { id: 'RA-5', title: 'Vulnerability Scanning', description: 'Scan for vulnerabilities', category: 'vulnerability' },
      { id: 'SC-7', title: 'Boundary Protection', description: 'Monitor and control communications', category: 'network-security' },
      { id: 'SC-8', title: 'Transmission Confidentiality', description: 'Protect transmission confidentiality', category: 'encryption' },
      { id: 'SC-28', title: 'Protection at Rest', description: 'Protect information at rest', category: 'encryption' },
      { id: 'SI-4', title: 'System Monitoring', description: 'Monitor system to detect attacks', category: 'logging-monitoring' }
    ];
  }

  /**
   * ISO 27001 controls
   */
  getISO27001Controls() {
    return [
      { id: 'A.5.1', title: 'Information Security Policies', description: 'Policies for information security', category: 'governance' },
      { id: 'A.6.1', title: 'Internal Organization', description: 'Management direction for information security', category: 'governance' },
      { id: 'A.8.1', title: 'Asset Management', description: 'Responsibility for assets', category: 'data-protection' },
      { id: 'A.9.1', title: 'Access Control', description: 'Business requirements of access control', category: 'identity-access' },
      { id: 'A.9.2', title: 'User Access Management', description: 'Ensure authorized user access', category: 'identity-access' },
      { id: 'A.9.4', title: 'System Access Control', description: 'Prevent unauthorized access to systems', category: 'identity-access' },
      { id: 'A.10.1', title: 'Cryptographic Controls', description: 'Policy on use of cryptographic controls', category: 'encryption' },
      { id: 'A.12.1', title: 'Operational Procedures', description: 'Documented operating procedures', category: 'configuration' },
      { id: 'A.12.4', title: 'Logging and Monitoring', description: 'Event logging', category: 'logging-monitoring' },
      { id: 'A.12.6', title: 'Vulnerability Management', description: 'Management of technical vulnerabilities', category: 'vulnerability' },
      { id: 'A.13.1', title: 'Network Security', description: 'Network controls', category: 'network-security' },
      { id: 'A.14.1', title: 'Secure Development', description: 'Security requirements in development', category: 'vulnerability' },
      { id: 'A.16.1', title: 'Incident Management', description: 'Management of security incidents', category: 'incident-response' },
      { id: 'A.18.1', title: 'Legal Compliance', description: 'Identification of applicable requirements', category: 'governance' }
    ];
  }
}

module.exports = new ComplianceEngine();

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
// Connectors are loaded dynamically if available
let sharedConnectors = null;
try {
  sharedConnectors = require('../../../../../../shared/connectors');
} catch (e) {
  console.log('Shared connectors not available, using standalone mode');
}
const {
  SensitivePattern,
  DLPPolicy,
  DataClassification,
  DLPIncident,
  EndpointActivity,
  ScanResult
} = require('../models');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8041';

// Built-in sensitive data patterns (Real-world patterns)
const BUILTIN_PATTERNS = {
  // Personal Identifiable Information (PII)
  SSN: {
    name: 'Social Security Number (US)',
    type: 'pii',
    pattern: '\\b(?!000|666|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0000)\\d{4}\\b',
    severity: 'critical'
  },
  SSN_UNFORMATTED: {
    name: 'SSN Unformatted',
    type: 'pii',
    pattern: '\\b(?!000|666|9\\d{2})\\d{9}\\b',
    severity: 'critical'
  },
  PASSPORT_US: {
    name: 'US Passport Number',
    type: 'pii',
    pattern: '\\b[A-Z]\\d{8}\\b',
    severity: 'high'
  },
  DRIVERS_LICENSE: {
    name: 'Drivers License (Generic)',
    type: 'pii',
    pattern: '\\b[A-Z]{1,2}\\d{4,8}\\b',
    severity: 'high'
  },
  
  // Financial Data
  CREDIT_CARD_VISA: {
    name: 'Visa Credit Card',
    type: 'financial',
    pattern: '\\b4[0-9]{12}(?:[0-9]{3})?\\b',
    severity: 'critical'
  },
  CREDIT_CARD_MASTERCARD: {
    name: 'Mastercard',
    type: 'financial',
    pattern: '\\b(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}\\b',
    severity: 'critical'
  },
  CREDIT_CARD_AMEX: {
    name: 'American Express',
    type: 'financial',
    pattern: '\\b3[47][0-9]{13}\\b',
    severity: 'critical'
  },
  BANK_ACCOUNT_US: {
    name: 'US Bank Account',
    type: 'financial',
    pattern: '\\b\\d{8,17}\\b',
    severity: 'high'
  },
  ROUTING_NUMBER: {
    name: 'ABA Routing Number',
    type: 'financial',
    pattern: '\\b((0[0-9])|(1[0-2])|(2[1-9])|(3[0-2])|(6[1-9])|(7[0-2])|80)([0-9]{7})\\b',
    severity: 'high'
  },
  IBAN: {
    name: 'IBAN',
    type: 'financial',
    pattern: '\\b[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}\\b',
    severity: 'high'
  },
  
  // Healthcare (PHI)
  MEDICAL_RECORD: {
    name: 'Medical Record Number',
    type: 'health',
    pattern: '\\b(MRN|mrn)[:\\s]?\\d{6,10}\\b',
    severity: 'critical'
  },
  DEA_NUMBER: {
    name: 'DEA Number',
    type: 'health',
    pattern: '\\b[A-Z]{2}\\d{7}\\b',
    severity: 'high'
  },
  NPI: {
    name: 'National Provider Identifier',
    type: 'health',
    pattern: '\\b\\d{10}\\b',
    severity: 'high'
  },
  
  // Credentials
  API_KEY: {
    name: 'API Key (Generic)',
    type: 'credentials',
    pattern: '\\b(api[_-]?key|apikey)[\\s]*[:=][\\s]*["\']?([a-zA-Z0-9-_]{20,})["\'\\s]?',
    severity: 'critical'
  },
  AWS_ACCESS_KEY: {
    name: 'AWS Access Key',
    type: 'credentials',
    pattern: '\\b(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\\b',
    severity: 'critical'
  },
  AWS_SECRET_KEY: {
    name: 'AWS Secret Key',
    type: 'credentials',
    pattern: '\\b[A-Za-z0-9/+=]{40}\\b',
    severity: 'critical'
  },
  GITHUB_TOKEN: {
    name: 'GitHub Token',
    type: 'credentials',
    pattern: '\\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\\b',
    severity: 'critical'
  },
  PRIVATE_KEY: {
    name: 'Private Key',
    type: 'credentials',
    pattern: '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----',
    severity: 'critical'
  },
  JWT_TOKEN: {
    name: 'JWT Token',
    type: 'credentials',
    pattern: '\\beyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*\\b',
    severity: 'high'
  },
  
  // Contact Information
  EMAIL: {
    name: 'Email Address',
    type: 'pii',
    pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    severity: 'medium'
  },
  PHONE_US: {
    name: 'US Phone Number',
    type: 'pii',
    pattern: '\\b(\\+1[-.\\s]?)?\\(?[2-9]\\d{2}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b',
    severity: 'medium'
  },
  
  // Address
  STREET_ADDRESS: {
    name: 'Street Address',
    type: 'pii',
    pattern: '\\b\\d{1,5}\\s+[A-Za-z]+\\s+(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct)\\b',
    severity: 'medium'
  },
  ZIP_CODE: {
    name: 'US ZIP Code',
    type: 'pii',
    pattern: '\\b\\d{5}(-\\d{4})?\\b',
    severity: 'low'
  },
  
  // International IDs
  UK_NINO: {
    name: 'UK National Insurance Number',
    type: 'pii',
    pattern: '\\b[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]?\\b',
    severity: 'critical'
  },
  CANADA_SIN: {
    name: 'Canadian SIN',
    type: 'pii',
    pattern: '\\b\\d{3}[- ]?\\d{3}[- ]?\\d{3}\\b',
    severity: 'critical'
  },
  GERMAN_ID: {
    name: 'German ID Number',
    type: 'pii',
    pattern: '\\b[CFGHJKLMNPRTVWXYZ0-9]{9}[0-9]([D<]|<<)[A-Z<]{3}[0-9]{7}[MF<][0-9]{7}\\b',
    severity: 'critical'
  }
};

class DataLossPreventionService {
  
  // ============================================
  // CONTENT INSPECTION & SCANNING
  // ============================================
  
  /**
   * Scan content for sensitive data patterns
   * @param {string} content - Text content to scan
   * @param {Object} options - Scan options
   */
  async scanContent(content, options = {}) {
    const {
      patterns = Object.keys(BUILTIN_PATTERNS),
      customPatterns = [],
      includeContext = true,
      contextLength = 50
    } = options;
    
    const findings = [];
    
    // Combine built-in and custom patterns
    const allPatterns = [
      ...patterns.map(p => ({ ...BUILTIN_PATTERNS[p], key: p })),
      ...customPatterns
    ];
    
    for (const patternDef of allPatterns) {
      if (!patternDef?.pattern) continue;
      
      try {
        const regex = new RegExp(patternDef.pattern, 'gi');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          const finding = {
            type: patternDef.name || patternDef.key,
            category: patternDef.type,
            severity: patternDef.severity,
            matchedValue: this.redactSensitiveValue(match[0]),
            position: {
              start: match.index,
              end: match.index + match[0].length
            }
          };
          
          if (includeContext) {
            finding.context = this.extractContext(content, match.index, contextLength);
          }
          
          findings.push(finding);
        }
      } catch (err) {
        console.error(`Pattern error for ${patternDef.name}:`, err.message);
      }
    }
    
    // ML-based classification for enhanced detection
    if (process.env.ENABLE_ML_CLASSIFICATION === 'true') {
      try {
        const mlFindings = await this.mlClassifyContent(content);
        findings.push(...mlFindings);
      } catch (err) {
        console.error('ML classification error:', err.message);
      }
    }
    
    return {
      totalFindings: findings.length,
      findings: this.deduplicateFindings(findings),
      summary: this.summarizeFindings(findings),
      riskScore: this.calculateRiskScore(findings)
    };
  }
  
  /**
   * Scan a file for sensitive data
   */
  async scanFile(fileBuffer, fileName, mimeType, options = {}) {
    const scanId = uuidv4();
    
    try {
      // Extract text content based on file type
      const content = await this.extractFileContent(fileBuffer, mimeType);
      
      // Scan the extracted content
      const scanResult = await this.scanContent(content, options);
      
      // Classify the file
      const classification = this.classifyData(scanResult);
      
      // Store scan result
      const result = await ScanResult.create({
        scanId,
        target: {
          type: 'file',
          location: fileName
        },
        status: 'completed',
        results: {
          filesScanned: 1,
          sensitivFilesFound: scanResult.totalFindings > 0 ? 1 : 0,
          violations: scanResult.findings.map(f => ({
            resourceId: fileName,
            resourceType: mimeType,
            fileName,
            dataTypes: [f.type],
            matchCount: 1,
            severity: f.severity,
            details: f
          })),
          summary: scanResult.summary
        },
        timing: {
          startedAt: new Date(),
          completedAt: new Date()
        }
      });
      
      return {
        scanId,
        fileName,
        mimeType,
        classification,
        ...scanResult,
        result
      };
    } catch (error) {
      throw new Error(`File scan failed: ${error.message}`);
    }
  }
  
  /**
   * Scan email content and attachments
   */
  async scanEmail(emailData) {
    const { subject, body, from, to, cc, bcc, attachments = [] } = emailData;
    
    const results = {
      emailId: uuidv4(),
      scanTime: new Date(),
      findings: [],
      attachmentFindings: [],
      overallRisk: 'low'
    };
    
    // Scan email metadata
    const recipientScan = await this.checkExternalRecipients([...to, ...(cc || []), ...(bcc || [])]);
    if (recipientScan.hasExternal) {
      results.findings.push({
        type: 'external_recipient',
        severity: 'medium',
        details: recipientScan
      });
    }
    
    // Scan subject and body
    const bodyResults = await this.scanContent(`${subject}\n${body}`);
    results.findings.push(...bodyResults.findings);
    
    // Scan attachments
    for (const attachment of attachments) {
      const attachmentResult = await this.scanFile(
        attachment.buffer,
        attachment.filename,
        attachment.contentType
      );
      results.attachmentFindings.push(attachmentResult);
    }
    
    // Calculate overall risk
    results.overallRisk = this.calculateEmailRisk(results);
    
    return results;
  }
  
  /**
   * Real-time endpoint activity monitoring
   */
  async monitorEndpointActivity(activityData) {
    const {
      deviceId,
      userId,
      activityType,
      application,
      file,
      destination,
      ipAddress,
      networkType
    } = activityData;
    
    // Create activity record
    const activity = await EndpointActivity.create({
      deviceId,
      userId,
      activity: {
        type: activityType,
        application
      },
      file,
      destination,
      context: {
        ipAddress,
        networkType,
        timestamp: new Date()
      }
    });
    
    // Evaluate against policies
    const policyResult = await this.evaluatePolicies(activityData);
    
    // Update risk score
    activity.risk = {
      score: policyResult.riskScore,
      flags: policyResult.flags,
      blocked: policyResult.blocked
    };
    await activity.save();
    
    // If blocked or high-risk, create incident
    if (policyResult.blocked || policyResult.riskScore >= 80) {
      await this.createIncident({
        type: 'policy_violation',
        severity: policyResult.riskScore >= 90 ? 'critical' : 'high',
        source: { userId, deviceId, ipAddress },
        destination,
        content: { fileName: file?.name, fileType: file?.type },
        policyViolated: policyResult.violatedPolicy
      });
    }
    
    return {
      activityId: activity._id,
      allowed: !policyResult.blocked,
      riskScore: policyResult.riskScore,
      flags: policyResult.flags,
      message: policyResult.message
    };
  }
  
  // ============================================
  // DATA CLASSIFICATION
  // ============================================
  
  /**
   * Classify data based on scan results
   */
  classifyData(scanResult) {
    const { findings, riskScore } = scanResult;
    
    if (riskScore >= 90 || findings.some(f => f.severity === 'critical')) {
      return 'restricted';
    } else if (riskScore >= 70 || findings.some(f => f.severity === 'high')) {
      return 'confidential';
    } else if (riskScore >= 40 || findings.some(f => f.severity === 'medium')) {
      return 'internal';
    }
    return 'public';
  }
  
  /**
   * Auto-classify and tag resources
   */
  async autoClassify(resourceId, resourceType, content) {
    const scanResult = await this.scanContent(content);
    const classification = this.classifyData(scanResult);
    
    // Store classification
    const classificationRecord = await DataClassification.findOneAndUpdate(
      { resourceId },
      {
        resourceId,
        resourceType,
        classification: {
          level: classification,
          confidence: scanResult.riskScore,
          method: 'auto_content',
          classifiedAt: new Date()
        },
        sensitiveData: scanResult.findings.map(f => ({
          type: f.type,
          count: 1,
          confidence: 100
        })),
        labels: this.generateLabels(scanResult)
      },
      { upsert: true, new: true }
    );
    
    return classificationRecord;
  }
  
  // ============================================
  // POLICY MANAGEMENT
  // ============================================
  
  /**
   * Create DLP policy
   */
  async createPolicy(policyData) {
    const policy = await DLPPolicy.create(policyData);
    return policy;
  }
  
  /**
   * Evaluate activity against policies
   */
  async evaluatePolicies(activityData) {
    const policies = await DLPPolicy.find({ enabled: true }).sort({ priority: -1 });
    
    let blocked = false;
    let riskScore = 0;
    let flags = [];
    let violatedPolicy = null;
    let message = 'Activity allowed';
    
    for (const policy of policies) {
      const match = this.checkPolicyMatch(policy, activityData);
      
      if (match.matches) {
        // Check exceptions
        if (this.isExcepted(policy, activityData)) {
          continue;
        }
        
        violatedPolicy = policy._id;
        
        switch (policy.actions.primary) {
          case 'block':
            blocked = true;
            riskScore = 100;
            message = `Blocked by policy: ${policy.name}`;
            break;
          case 'quarantine':
            blocked = true;
            riskScore = 90;
            message = `Quarantined by policy: ${policy.name}`;
            break;
          case 'warn':
            riskScore = Math.max(riskScore, 70);
            flags.push(`Warning: ${policy.name}`);
            break;
          case 'audit':
            riskScore = Math.max(riskScore, 50);
            flags.push(`Audit: ${policy.name}`);
            break;
          case 'encrypt':
            flags.push('Auto-encryption required');
            break;
        }
        
        if (blocked) break;
      }
    }
    
    return { blocked, riskScore, flags, violatedPolicy, message };
  }
  
  checkPolicyMatch(policy, activityData) {
    const { conditions } = policy;
    const matches = {
      dataTypes: true,
      destinations: true,
      fileTypes: true,
      sensitivityLevels: true
    };
    
    // Check data types
    if (conditions.dataTypes?.length > 0) {
      matches.dataTypes = conditions.dataTypes.some(dt => 
        activityData.detectedDataTypes?.includes(dt)
      );
    }
    
    // Check destinations
    if (conditions.destinations?.length > 0) {
      matches.destinations = conditions.destinations.includes(activityData.destination?.type);
    }
    
    // Check file types
    if (conditions.fileTypes?.length > 0 && activityData.file?.type) {
      matches.fileTypes = conditions.fileTypes.includes(activityData.file.type);
    }
    
    return {
      matches: Object.values(matches).every(m => m),
      matchDetails: matches
    };
  }
  
  isExcepted(policy, activityData) {
    const { exceptions } = policy;
    
    if (exceptions.users?.includes(activityData.userId)) return true;
    if (exceptions.domains?.some(d => activityData.destination?.address?.includes(d))) return true;
    if (exceptions.applications?.includes(activityData.application)) return true;
    
    return false;
  }
  
  // ============================================
  // INCIDENT MANAGEMENT
  // ============================================
  
  /**
   * Create DLP incident
   */
  async createIncident(incidentData) {
    const incidentId = `DLP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const incident = await DLPIncident.create({
      incidentId,
      type: incidentData.type,
      severity: incidentData.severity,
      status: 'open',
      source: incidentData.source,
      destination: incidentData.destination,
      content: incidentData.content,
      details: {
        policyViolated: incidentData.policyViolated
      },
      actionsTaken: [{
        action: 'detected',
        timestamp: new Date(),
        automated: true,
        result: 'Incident created'
      }],
      detectedAt: new Date()
    });
    
    // Emit real-time alert
    if (this.io) {
      this.io.to(`alerts-${incidentData.source.userId}`).emit('dlp-incident', {
        incidentId,
        severity: incidentData.severity,
        message: `DLP incident detected: ${incidentData.type}`
      });
    }
    
    // Integrate with security stack
    await this.integrateWithSecurityStack(incident);
    
    return incident;
  }
  
  /**
   * Get incidents with filters
   */
  async getIncidents(filters = {}) {
    const query = {};
    
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.fromDate) query.detectedAt = { $gte: new Date(filters.fromDate) };
    
    return DLPIncident.find(query)
      .sort({ detectedAt: -1 })
      .limit(filters.limit || 100);
  }
  
  /**
   * Update incident status
   */
  async updateIncident(incidentId, updates) {
    const incident = await DLPIncident.findOneAndUpdate(
      { incidentId },
      { 
        ...updates,
        $push: {
          actionsTaken: {
            action: 'status_updated',
            timestamp: new Date(),
            automated: false,
            result: `Status changed to ${updates.status}`
          }
        }
      },
      { new: true }
    );
    
    if (updates.status === 'resolved' || updates.status === 'closed') {
      incident.resolvedAt = new Date();
      await incident.save();
    }
    
    return incident;
  }
  
  // ============================================
  // CLOUD DLP INTEGRATIONS
  // ============================================
  
  /**
   * Scan cloud storage (Google Drive, OneDrive, Dropbox, etc.)
   */
  async scanCloudStorage(provider, credentials, path = '/') {
    const scanId = uuidv4();
    
    // Create scan record
    const scan = await ScanResult.create({
      scanId,
      target: {
        type: 'cloud_storage',
        location: `${provider}:${path}`,
        scope: path
      },
      status: 'scanning',
      progress: { totalItems: 0, scannedItems: 0, percentage: 0 }
    });
    
    // This would integrate with cloud provider APIs
    // For now, return placeholder
    return {
      scanId,
      provider,
      path,
      status: 'initiated',
      message: 'Cloud scan initiated. Results will be available via webhook or polling.'
    };
  }
  
  /**
   * Monitor SaaS applications (Slack, Teams, etc.)
   */
  async monitorSaaSApp(app, eventData) {
    // Real-time monitoring of SaaS communications
    const scanResult = await this.scanContent(eventData.content);
    
    if (scanResult.riskScore > 70) {
      await this.createIncident({
        type: 'sensitive_data_exposure',
        severity: scanResult.riskScore >= 90 ? 'critical' : 'high',
        source: {
          application: app,
          userId: eventData.userId,
          channel: eventData.channel
        },
        content: {
          resourceType: 'message',
          matchedPatterns: scanResult.findings
        }
      });
    }
    
    return {
      app,
      scanned: true,
      riskScore: scanResult.riskScore,
      findings: scanResult.findings.length,
      action: scanResult.riskScore > 70 ? 'flagged' : 'allowed'
    };
  }
  
  // ============================================
  // SECURITY STACK INTEGRATION
  // ============================================
  
  async integrateWithSecurityStack(incident) {
    const connectors = getConnectors();
    const integrationPromises = [];
    
    // Microsoft Sentinel - Log DLP events
    if (connectors.sentinel) {
      integrationPromises.push(
        connectors.sentinel.ingestData({
          table: 'DLPIncidents',
          data: {
            incidentId: incident.incidentId,
            timestamp: incident.detectedAt,
            severity: incident.severity,
            type: incident.type,
            source: incident.source,
            destination: incident.destination,
            dataTypes: incident.content?.matchedPatterns?.map(p => p.type) || []
          }
        }).catch(err => ({ error: `Sentinel integration failed: ${err.message}` }))
      );
    }
    
    // Cortex XSOAR - Create incident for severe violations
    if (connectors.xsoar && ['critical', 'high'].includes(incident.severity)) {
      integrationPromises.push(
        connectors.xsoar.createIncident({
          type: 'DLPViolation',
          severity: incident.severity === 'critical' ? 'high' : 'medium',
          title: `DLP Alert: ${incident.type}`,
          description: `Data Loss Prevention system detected potential data exposure`,
          labels: ['dlp', 'data-protection', incident.type],
          details: incident
        }).catch(err => ({ error: `XSOAR integration failed: ${err.message}` }))
      );
    }
    
    // CrowdStrike - Endpoint response for critical incidents
    if (connectors.crowdstrike && incident.severity === 'critical' && incident.source?.deviceId) {
      integrationPromises.push(
        connectors.crowdstrike.respondToThreat({
          action: 'quarantine_device',
          deviceId: incident.source.deviceId,
          reason: 'DLP critical violation - potential data exfiltration',
          severity: 'critical'
        }).catch(err => ({ error: `CrowdStrike integration failed: ${err.message}` }))
      );
    }
    
    const results = await Promise.all(integrationPromises);
    return results;
  }
  
  // ============================================
  // HELPER METHODS
  // ============================================
  
  redactSensitiveValue(value) {
    if (value.length <= 4) return '****';
    return value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2);
  }
  
  extractContext(content, position, length) {
    const start = Math.max(0, position - length);
    const end = Math.min(content.length, position + length);
    return content.slice(start, end);
  }
  
  deduplicateFindings(findings) {
    const seen = new Set();
    return findings.filter(f => {
      const key = `${f.type}-${f.position?.start}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  summarizeFindings(findings) {
    const summary = {
      byType: {},
      bySeverity: {},
      byCategory: {}
    };
    
    for (const finding of findings) {
      summary.byType[finding.type] = (summary.byType[finding.type] || 0) + 1;
      summary.bySeverity[finding.severity] = (summary.bySeverity[finding.severity] || 0) + 1;
      summary.byCategory[finding.category] = (summary.byCategory[finding.category] || 0) + 1;
    }
    
    return summary;
  }
  
  calculateRiskScore(findings) {
    if (findings.length === 0) return 0;
    
    const severityWeights = {
      critical: 40,
      high: 25,
      medium: 15,
      low: 5
    };
    
    let totalScore = 0;
    for (const finding of findings) {
      totalScore += severityWeights[finding.severity] || 10;
    }
    
    return Math.min(100, totalScore);
  }
  
  calculateEmailRisk(results) {
    const { findings, attachmentFindings } = results;
    
    let maxSeverity = 'low';
    const allFindings = [...findings, ...attachmentFindings.flatMap(a => a.findings || [])];
    
    for (const finding of allFindings) {
      if (finding.severity === 'critical') return 'critical';
      if (finding.severity === 'high') maxSeverity = 'high';
      else if (finding.severity === 'medium' && maxSeverity !== 'high') maxSeverity = 'medium';
    }
    
    return maxSeverity;
  }
  
  async checkExternalRecipients(recipients) {
    const internalDomains = process.env.INTERNAL_DOMAINS?.split(',') || [];
    const external = recipients.filter(r => {
      const domain = r.split('@')[1];
      return !internalDomains.some(d => domain?.includes(d));
    });
    
    return {
      hasExternal: external.length > 0,
      externalCount: external.length,
      external
    };
  }
  
  generateLabels(scanResult) {
    const labels = [];
    
    if (scanResult.findings.some(f => f.category === 'pii')) labels.push('contains-pii');
    if (scanResult.findings.some(f => f.category === 'financial')) labels.push('contains-financial');
    if (scanResult.findings.some(f => f.category === 'health')) labels.push('contains-phi');
    if (scanResult.findings.some(f => f.category === 'credentials')) labels.push('contains-credentials');
    if (scanResult.riskScore >= 80) labels.push('high-risk');
    
    return labels;
  }
  
  async extractFileContent(buffer, mimeType) {
    // In production, use proper parsers
    // This is a simplified version
    if (mimeType.includes('text')) {
      return buffer.toString('utf-8');
    }
    
    // For binary files, would use pdf-parse, mammoth, xlsx, etc.
    return buffer.toString('utf-8');
  }
  
  async mlClassifyContent(content) {
    // ML-based classification would call the ML engine
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/classify`, { content });
      return response.data.findings || [];
    } catch {
      return [];
    }
  }
  
  setIO(io) {
    this.io = io;
  }
}

module.exports = new DataLossPreventionService();

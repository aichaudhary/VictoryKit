const axios = require("axios");
let getConnectors;
try {
  ({ getConnectors } = require("../../../../../shared/connectors"));
} catch (error) {
  console.warn('Connectors not available, security stack integration disabled');
  getConnectors = () => ({});
}
const {
  Email,
  EmailAnalysis,
  Quarantine,
  EmailPolicy,
  EmailUser,
  EmailAlert
} = require('../models');

const ML_ENGINE_URL = process.env.EMAILGUARD_ML_ENGINE_URL || "http://localhost:8035";

class EmailGuardService {
  constructor() {
    this.threatIntelligenceAPIs = {
      virustotal: {
        apiKey: process.env.EMAILGUARD_VIRUSTOTAL_API_KEY,
        baseURL: process.env.EMAILGUARD_VIRUSTOTAL_BASE_URL || 'https://www.virustotal.com/api/v3/'
      },
      abuseipdb: {
        apiKey: process.env.EMAILGUARD_ABUSEIPDB_API_KEY,
        baseURL: process.env.EMAILGUARD_ABUSEIPDB_BASE_URL || 'https://api.abuseipdb.com/api/v2/'
      },
      phishtank: {
        apiKey: process.env.EMAILGUARD_PHISHTANK_API_KEY,
        baseURL: process.env.EMAILGUARD_PHISHTANK_BASE_URL || 'https://phishtank.com/api/'
      },
      urlscan: {
        apiKey: process.env.EMAILGUARD_URLSCAN_API_KEY,
        baseURL: process.env.EMAILGUARD_URLSCAN_BASE_URL || 'https://urlscan.io/api/v1/'
      }
    };

    this.emailSecurityAPIs = {
      proofpoint: {
        apiKey: process.env.EMAILGUARD_PROOFPOINT_API_KEY,
        baseURL: process.env.EMAILGUARD_PROOFPOINT_BASE_URL || 'https://tap-api-v2.proofpoint.com/'
      },
      mimecast: {
        apiKey: process.env.EMAILGUARD_MIMECAST_API_KEY,
        baseURL: process.env.EMAILGUARD_MIMECAST_BASE_URL || 'https://api.mimecast.com/'
      },
      barracuda: {
        apiKey: process.env.EMAILGUARD_BARRACUDA_API_KEY,
        baseURL: process.env.EMAILGUARD_BARRACUDA_BASE_URL || 'https://api.barracuda.com/'
      }
    };

    this.complianceAPIs = {
      microsoftPurview: {
        clientId: process.env.EMAILGUARD_MICROSOFT_PURVIEW_CLIENT_ID,
        clientSecret: process.env.EMAILGUARD_MICROSOFT_PURVIEW_CLIENT_SECRET,
        tenantId: process.env.EMAILGUARD_MICROSOFT_PURVIEW_TENANT_ID,
        baseURL: process.env.EMAILGUARD_MICROSOFT_PURVIEW_BASE_URL || 'https://purview.azure.com'
      }
    };

    this.deliveryAPIs = {
      sendgrid: {
        apiKey: process.env.EMAILGUARD_SENDGRID_API_KEY,
        baseURL: process.env.EMAILGUARD_SENDGRID_BASE_URL || 'https://api.sendgrid.com/v3'
      },
      mailgun: {
        apiKey: process.env.EMAILGUARD_MAILGUN_API_KEY,
        domain: process.env.EMAILGUARD_MAILGUN_DOMAIN,
        baseURL: process.env.EMAILGUARD_MAILGUN_BASE_URL || 'https://api.mailgun.net/v3'
      },
      awsSes: {
        accessKeyId: process.env.EMAILGUARD_AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.EMAILGUARD_AWS_SES_SECRET_ACCESS_KEY,
        region: process.env.EMAILGUARD_AWS_SES_REGION || 'us-east-1'
      }
    };

    this.ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8035';
  }

  // Process incoming email
  async processEmail(emailData) {
    try {
      const startTime = Date.now();

      // 1. Save email to database
      const email = new Email({
        messageId: emailData.messageId,
        from: this.parseEmailAddress(emailData.from),
        to: emailData.to.map(addr => this.parseEmailAddress(addr)),
        cc: emailData.cc?.map(addr => this.parseEmailAddress(addr)) || [],
        bcc: emailData.bcc?.map(addr => this.parseEmailAddress(addr)) || [],
        subject: emailData.subject,
        body: {
          text: emailData.text,
          html: emailData.html
        },
        attachments: emailData.attachments || [],
        headers: emailData.headers,
        size: emailData.size,
        priority: emailData.priority || 'normal'
      });

      await email.save();

      // 2. Perform comprehensive security analysis
      const analysis = await this.performSecurityAnalysis(email);

      // 3. Apply security policies
      const policyResult = await this.applySecurityPolicies(email, analysis);

      // 4. Handle email based on policy result
      const result = await this.handleEmailBasedOnPolicy(email, analysis, policyResult);

      // 5. Update processing time
      analysis.processingTime = Date.now() - startTime;
      await analysis.save();

      // 6. Send real-time alerts if needed
      if (result.action === 'quarantine' || result.action === 'block') {
        await this.createAlert('threat_detected', result.severity, {
          emailId: email._id,
          analysisId: analysis._id,
          threatType: result.threatType,
          action: result.action
        });
      }

      return {
        emailId: email._id,
        analysisId: analysis._id,
        action: result.action,
        threatScore: analysis.threatScore,
        processingTime: analysis.processingTime
      };

    } catch (error) {
      console.error('Email processing error:', error);
      throw new Error(`Email processing failed: ${error.message}`);
    }
  }

  // Perform comprehensive security analysis
  async performSecurityAnalysis(email) {
    const analysis = new EmailAnalysis({
      emailId: email._id,
      messageId: email.messageId
    });

    // 1. Content analysis using ML engine
    const contentAnalysis = await this.analyzeContent(email);
    analysis.contentAnalysis = contentAnalysis;

    // 2. URL analysis
    const urlAnalysis = await this.analyzeURLs(email);
    analysis.urls = urlAnalysis;

    // 3. Attachment analysis
    const attachmentAnalysis = await this.analyzeAttachments(email);

    // 4. Sender reputation analysis
    const senderAnalysis = await this.analyzeSender(email.from);

    // 5. Threat intelligence lookup
    const threatIntel = await this.checkThreatIntelligence(email);

    // 6. Calculate overall threat score
    analysis.threatScore = this.calculateThreatScore({
      content: contentAnalysis,
      urls: urlAnalysis,
      attachments: attachmentAnalysis,
      sender: senderAnalysis,
      threatIntel: threatIntel
    });

    analysis.threatLevel = this.getThreatLevel(analysis.threatScore);

    // 7. Identify specific threats
    analysis.threats = this.identifyThreats({
      content: contentAnalysis,
      urls: urlAnalysis,
      attachments: attachmentAnalysis,
      sender: senderAnalysis,
      threatIntel: threatIntel
    });

    // 8. Compliance analysis
    analysis.compliance = await this.performComplianceAnalysis(email);

    // 9. Record analysis engines used
    analysis.engines = [
      { name: 'ML Engine', version: '1.0', processingTime: contentAnalysis.processingTime },
      { name: 'URL Scanner', version: '1.0', processingTime: urlAnalysis.processingTime || 0 },
      { name: 'Attachment Scanner', version: '1.0', processingTime: attachmentAnalysis.processingTime || 0 }
    ];

    await analysis.save();
    return analysis;
  }

  // Analyze email content using ML
  async analyzeContent(email) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze-content`,
        {
          subject: email.subject,
          body: email.body.text || email.body.html,
          headers: email.headers
        },
        { timeout: 30000 }
      );

      return {
        language: response.data.language,
        sentiment: response.data.sentiment,
        topics: response.data.topics || [],
        keywords: response.data.keywords || [],
        entities: response.data.entities || [],
        threatIndicators: response.data.threatIndicators || [],
        processingTime: response.data.processingTime || 0
      };
    } catch (error) {
      console.error('Content analysis failed:', error);
      return this.fallbackContentAnalysis(email);
    }
  }

  // Analyze URLs in email
  async analyzeURLs(email) {
    const urls = this.extractURLs(email.body.text || email.body.html);
    const urlAnalysis = [];

    for (const url of urls) {
      const analysis = await this.analyzeSingleURL(url);
      urlAnalysis.push(analysis);
    }

    return urlAnalysis;
  }

  // Analyze single URL
  async analyzeSingleURL(url) {
    try {
      // Check VirusTotal
      let vtResult = null;
      if (this.threatIntelligenceAPIs.virustotal.apiKey) {
        vtResult = await this.checkVirusTotal(url);
      }

      // Check URLScan.io
      let urlscanResult = null;
      if (this.threatIntelligenceAPIs.urlscan.apiKey) {
        urlscanResult = await this.checkURLScan(url);
      }

      // Check PhishTank
      let phishtankResult = null;
      if (this.threatIntelligenceAPIs.phishtank.apiKey) {
        phishtankResult = await this.checkPhishTank(url);
      }

      const isMalicious = (vtResult?.malicious || urlscanResult?.malicious || phishtankResult?.malicious) || false;
      const threatScore = Math.max(
        vtResult?.score || 0,
        urlscanResult?.score || 0,
        phishtankResult?.score || 0
      );

      return {
        url,
        domain: new URL(url).hostname,
        isMalicious,
        threatScore,
        categories: vtResult?.categories || [],
        redirectChain: urlscanResult?.redirectChain || [],
        processingTime: Date.now()
      };
    } catch (error) {
      console.error(`URL analysis failed for ${url}:`, error);
      return {
        url,
        domain: 'unknown',
        isMalicious: false,
        threatScore: 0,
        categories: [],
        redirectChain: [],
        error: error.message
      };
    }
  }

  // Analyze attachments
  async analyzeAttachments(email) {
    const results = [];

    for (const attachment of email.attachments) {
      const analysis = await this.analyzeSingleAttachment(attachment);
      results.push(analysis);
    }

    return results;
  }

  // Analyze single attachment
  async analyzeSingleAttachment(attachment) {
    try {
      // Check file hash against threat intelligence
      const hashCheck = await this.checkFileHash(attachment.hash);

      // Additional analysis based on file type and content
      const contentAnalysis = await this.analyzeFileContent(attachment);

      return {
        filename: attachment.filename,
        contentType: attachment.contentType,
        size: attachment.size,
        hash: attachment.hash,
        isMalicious: hashCheck.isMalicious || contentAnalysis.isMalicious,
        threatScore: Math.max(hashCheck.score, contentAnalysis.score),
        threats: [...(hashCheck.threats || []), ...(contentAnalysis.threats || [])],
        processingTime: Date.now()
      };
    } catch (error) {
      console.error(`Attachment analysis failed for ${attachment.filename}:`, error);
      return {
        filename: attachment.filename,
        isMalicious: false,
        threatScore: 0,
        threats: [],
        error: error.message
      };
    }
  }

  // Analyze sender reputation
  async analyzeSender(sender) {
    try {
      // Check sender domain reputation
      const domainCheck = await this.checkDomainReputation(sender.domain);

      // Check sender IP reputation (if available)
      const ipCheck = sender.ip ? await this.checkIPReputation(sender.ip) : null;

      // Check sender behavior patterns
      const behaviorCheck = await this.checkSenderBehavior(sender.email);

      return {
        email: sender.email,
        domain: sender.domain,
        reputation: domainCheck.reputation,
        isSuspicious: domainCheck.isSuspicious || ipCheck?.isSuspicious || behaviorCheck.isSuspicious,
        riskFactors: [
          ...(domainCheck.riskFactors || []),
          ...(ipCheck?.riskFactors || []),
          ...(behaviorCheck.riskFactors || [])
        ],
        processingTime: Date.now()
      };
    } catch (error) {
      console.error('Sender analysis failed:', error);
      return {
        email: sender.email,
        domain: sender.domain,
        reputation: 'unknown',
        isSuspicious: false,
        riskFactors: [],
        error: error.message
      };
    }
  }

  // Check threat intelligence
  async checkThreatIntelligence(email) {
    const results = {};

    // Check sender domain
    if (this.threatIntelligenceAPIs.abuseipdb.apiKey) {
      results.domainCheck = await this.checkAbuseIPDB(email.from.domain);
    }

    // Check URLs
    const urls = this.extractURLs(email.body.text || email.body.html);
    results.urlChecks = [];
    for (const url of urls.slice(0, 5)) { // Limit to first 5 URLs
      results.urlChecks.push(await this.analyzeSingleURL(url));
    }

    return results;
  }

  // Calculate overall threat score
  calculateThreatScore(analyses) {
    let score = 0;
    let weights = {
      content: 0.3,
      urls: 0.3,
      attachments: 0.2,
      sender: 0.15,
      threatIntel: 0.05
    };

    // Content analysis score
    if (analyses.content.threatIndicators?.length > 0) {
      score += weights.content * Math.min(analyses.content.threatIndicators.length * 20, 100);
    }

    // URL analysis score
    const maliciousUrls = analyses.urls.filter(url => url.isMalicious).length;
    if (maliciousUrls > 0) {
      score += weights.urls * Math.min(maliciousUrls * 25, 100);
    }

    // Attachment analysis score
    const maliciousAttachments = analyses.attachments.filter(att => att.isMalicious).length;
    if (maliciousAttachments > 0) {
      score += weights.attachments * Math.min(maliciousAttachments * 50, 100);
    }

    // Sender analysis score
    if (analyses.sender.isSuspicious) {
      score += weights.sender * 80;
    }

    // Threat intelligence score
    if (analyses.threatIntel.domainCheck?.isAbusive) {
      score += weights.threatIntel * 100;
    }

    return Math.min(Math.round(score), 100);
  }

  // Get threat level from score
  getThreatLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'clean';
  }

  // Identify specific threats
  identifyThreats(analyses) {
    const threats = [];

    // Phishing detection
    if (analyses.content.entities?.some(e => e.type === 'url' && analyses.urls.some(u => u.isMalicious))) {
      threats.push({
        type: 'phishing',
        confidence: 85,
        description: 'Email contains malicious URLs commonly used in phishing attacks',
        indicators: analyses.urls.filter(u => u.isMalicious).map(u => u.url)
      });
    }

    // Malware detection
    if (analyses.attachments.some(att => att.isMalicious)) {
      threats.push({
        type: 'malware',
        confidence: 95,
        description: 'Email contains malicious attachments',
        indicators: analyses.attachments.filter(att => att.isMalicious).map(att => att.filename)
      });
    }

    // Spam detection
    if (analyses.content.sentiment === 'negative' && analyses.content.keywords?.includes('urgent')) {
      threats.push({
        type: 'spam',
        confidence: 70,
        description: 'Email exhibits spam characteristics',
        indicators: ['Urgent language', 'Negative sentiment']
      });
    }

    // Suspicious links
    if (analyses.urls.some(url => url.threatScore > 50)) {
      threats.push({
        type: 'suspicious_links',
        confidence: 75,
        description: 'Email contains links to suspicious domains',
        indicators: analyses.urls.filter(u => u.threatScore > 50).map(u => u.url)
      });
    }

    return threats;
  }

  // Apply security policies
  async applySecurityPolicies(email, analysis) {
    const policies = await EmailPolicy.find({ enabled: true }).sort({ priority: -1 });

    for (const policy of policies) {
      if (await this.checkPolicyMatch(email, analysis, policy)) {
        return {
          policyId: policy._id,
          policyName: policy.name,
          actions: policy.actions
        };
      }
    }

    return null; // No policy matched
  }

  // Check if email matches policy conditions
  async checkPolicyMatch(email, analysis, policy) {
    const conditions = policy.conditions;

    // Check sender domains
    if (conditions.senderDomains?.length > 0) {
      if (!conditions.senderDomains.includes(email.from.domain)) {
        return false;
      }
    }

    // Check recipient domains
    if (conditions.recipientDomains?.length > 0) {
      const recipientDomains = email.to.map(r => r.domain);
      if (!recipientDomains.some(domain => conditions.recipientDomains.includes(domain))) {
        return false;
      }
    }

    // Check keywords
    if (conditions.keywords?.length > 0) {
      const content = `${email.subject} ${email.body.text || email.body.html}`;
      if (!conditions.keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))) {
        return false;
      }
    }

    // Check file types
    if (conditions.fileTypes?.length > 0) {
      const attachmentTypes = email.attachments.map(att => att.contentType);
      if (!attachmentTypes.some(type => conditions.fileTypes.includes(type))) {
        return false;
      }
    }

    // Check file size
    if (conditions.fileSize) {
      const totalSize = email.attachments.reduce((sum, att) => sum + att.size, 0);
      if (conditions.fileSize.min && totalSize < conditions.fileSize.min) return false;
      if (conditions.fileSize.max && totalSize > conditions.fileSize.max) return false;
    }

    // Check threat score
    if (conditions.threatScore) {
      if (conditions.threatScore.min && analysis.threatScore < conditions.threatScore.min) return false;
      if (conditions.threatScore.max && analysis.threatScore > conditions.threatScore.max) return false;
    }

    return true;
  }

  // Handle email based on policy result
  async handleEmailBasedOnPolicy(email, analysis, policyResult) {
    if (!policyResult) {
      // Default action for clean emails
      return { action: 'deliver', severity: 'low' };
    }

    const actions = policyResult.actions;

    if (actions.block) {
      return {
        action: 'block',
        severity: 'high',
        reason: `Blocked by policy: ${policyResult.policyName}`,
        policyId: policyResult.policyId
      };
    }

    if (actions.quarantine) {
      // Create quarantine record
      const quarantine = new Quarantine({
        emailId: email._id,
        analysisId: analysis._id,
        reason: 'policy_violation',
        severity: analysis.threatLevel,
        quarantinedBy: 'system'
      });
      await quarantine.save();

      return {
        action: 'quarantine',
        severity: analysis.threatLevel,
        reason: `Quarantined by policy: ${policyResult.policyName}`,
        quarantineId: quarantine._id,
        policyId: policyResult.policyId
      };
    }

    if (actions.tag) {
      email.tags = email.tags || [];
      email.tags.push(actions.tag);
      await email.save();
    }

    if (actions.encrypt) {
      // Implement encryption logic
      await this.encryptEmail(email);
    }

    return {
      action: 'deliver',
      severity: 'low',
      modifications: {
        tagged: actions.tag,
        encrypted: actions.encrypt
      }
    };
  }

  // Create security alert
  async createAlert(type, severity, metadata) {
    const alert = new EmailAlert({
      type,
      severity,
      title: this.getAlertTitle(type, metadata),
      description: this.getAlertDescription(type, metadata),
      ...metadata
    });

    await alert.save();

    // Send real-time notification
    this.sendRealTimeAlert(alert);

    return alert;
  }

  // Send real-time alert via WebSocket
  sendRealTimeAlert(alert) {
    // Implementation for WebSocket notification
    // This would be called from the server.js WebSocket handler
  }

  // Compliance analysis
  async performComplianceAnalysis(email) {
    return {
      gdpr: await this.checkGDPRCompliance(email),
      hipaa: await this.checkHIPAACompliance(email),
      pci: await this.checkPCICompliance(email)
    };
  }

  // Helper methods for threat intelligence APIs
  async checkVirusTotal(url) {
    try {
      const response = await axios.get(
        `${this.threatIntelligenceAPIs.virustotal.baseURL}urls/${Buffer.from(url).toString('base64')}`,
        {
          headers: { 'x-apikey': this.threatIntelligenceAPIs.virustotal.apiKey }
        }
      );

      const stats = response.data.data.attributes.last_analysis_stats;
      const malicious = stats.malicious > 0;
      const score = malicious ? Math.min(stats.malicious * 20, 100) : 0;

      return { malicious, score, categories: response.data.data.attributes.categories || [] };
    } catch (error) {
      console.error('VirusTotal check failed:', error);
      return { malicious: false, score: 0, categories: [] };
    }
  }

  async checkAbuseIPDB(domain) {
    try {
      const response = await axios.get(
        `${this.threatIntelligenceAPIs.abuseipdb.baseURL}check`,
        {
          params: { domain },
          headers: { 'Key': this.threatIntelligenceAPIs.abuseipdb.apiKey }
        }
      );

      return {
        isAbusive: response.data.data.abuseConfidenceScore > 50,
        score: response.data.data.abuseConfidenceScore,
        categories: response.data.data.category || []
      };
    } catch (error) {
      console.error('AbuseIPDB check failed:', error);
      return { isAbusive: false, score: 0, categories: [] };
    }
  }

  // Utility methods
  parseEmailAddress(emailString) {
    const match = emailString.match(/^([^<]+)<([^>]+)>$/) || [null, emailString, emailString];
    const name = match[1]?.trim() || '';
    const email = match[2]?.trim() || emailString;
    const domain = email.split('@')[1] || '';

    return { email, name, domain };
  }

  extractURLs(text) {
    const urlRegex = /https?:\/\/[^\s<>"']+/g;
    return text.match(urlRegex) || [];
  }

  getAlertTitle(type, metadata) {
    const titles = {
      threat_detected: 'Security Threat Detected',
      policy_violation: 'Policy Violation',
      system_error: 'System Error',
      compliance_issue: 'Compliance Issue',
      performance_alert: 'Performance Alert'
    };
    return titles[type] || 'Security Alert';
  }

  getAlertDescription(type, metadata) {
    // Generate descriptive alert messages based on type and metadata
    return `A ${type} alert has been generated for email ${metadata.emailId || 'unknown'}`;
  }

  // Fallback methods
  fallbackContentAnalysis(email) {
    return {
      language: 'unknown',
      sentiment: 'neutral',
      topics: [],
      keywords: [],
      entities: [],
      threatIndicators: [],
      processingTime: 0
    };
  }

  async fallbackScan(target) {
    return {
      status: 'completed',
      threats: [],
      recommendations: ['Enable ML engine for better analysis'],
      totalEmails: 0,
      threatCount: 0,
      criticalThreats: 0
    };
  }

  async checkFileHash(hash) {
    // Implement file hash checking against threat databases
    return { isMalicious: false, score: 0, threats: [] };
  }

  async analyzeFileContent(attachment) {
    // Implement file content analysis
    return { isMalicious: false, score: 0, threats: [] };
  }

  async checkDomainReputation(domain) {
    // Implement domain reputation checking
    return { reputation: 'unknown', isSuspicious: false, riskFactors: [] };
  }

  async checkIPReputation(ip) {
    // Implement IP reputation checking
    return { isSuspicious: false, riskFactors: [] };
  }

  async checkSenderBehavior(email) {
    // Implement sender behavior analysis
    return { isSuspicious: false, riskFactors: [] };
  }

  async checkURLScan(url) {
    // Implement URLScan.io checking
    return { malicious: false, score: 0, redirectChain: [] };
  }

  async checkPhishTank(url) {
    // Implement PhishTank checking
    return { malicious: false, score: 0 };
  }

  async checkGDPRCompliance(email) {
    // Implement GDPR compliance checking
    return { score: 85, issues: [], recommendations: [] };
  }

  async checkHIPAACompliance(email) {
    // Implement HIPAA compliance checking
    return { score: 90, issues: [], recommendations: [] };
  }

  async checkPCICompliance(email) {
    // Implement PCI compliance checking
    return { score: 88, issues: [], recommendations: [] };
  }

  async encryptEmail(email) {
    // Implement email encryption
    console.log('Email encryption not yet implemented');
  }

  // Integration with security stack
  async integrateWithSecurityStack(scanId, data) {
    try {
      const connectors = getConnectors();
      // Implement integration with SIEM, threat intelligence, etc.
      console.log('Security stack integration:', scanId, data);
    } catch (error) {
      console.error('Security stack integration failed:', error);
    }
  }
}

module.exports = new EmailGuardService();
/**
 * Compliance Mapping Service
 * Maps risks to compliance frameworks and regulatory requirements
 */

const axios = require("axios");
const mongoose = require("mongoose");
const _ = require("lodash");

// Compliance Framework Schema
const ComplianceFrameworkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: String,
  description: String,
  category: {
    type: String,
    enum: ["security", "privacy", "financial", "operational", "regulatory"]
  },
  controls: [{
    id: String,
    title: String,
    description: String,
    requirements: [String],
    riskCategories: [String],
    implementationGuidance: String,
    testingProcedures: String,
  }],
  lastUpdated: Date,
  source: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const ComplianceFramework = mongoose.model("ComplianceFramework", ComplianceFrameworkSchema);

// Risk-Compliance Mapping Schema
const RiskComplianceMappingSchema = new mongoose.Schema({
  riskId: { type: mongoose.Schema.Types.ObjectId, ref: "Risk", required: true },
  frameworkId: { type: mongoose.Schema.Types.ObjectId, ref: "ComplianceFramework", required: true },
  controlIds: [String],
  mappingStrength: {
    type: String,
    enum: ["direct", "partial", "indirect", "none"],
    default: "partial"
  },
  rationale: String,
  evidence: String,
  complianceStatus: {
    type: String,
    enum: ["compliant", "non-compliant", "compensating-control", "not-applicable"],
    default: "not-applicable"
  },
  remediationPlan: String,
  reviewDate: Date,
  reviewedBy: String,
}, { timestamps: true });

const RiskComplianceMapping = mongoose.model("RiskComplianceMapping", RiskComplianceMappingSchema);

class ComplianceMappingService {
  constructor() {
    this.frameworks = {
      nist: {
        name: "NIST Cybersecurity Framework",
        url: process.env.NIST_BASE_URL || "https://csrc.nist.gov",
        apiKey: process.env.NIST_API_KEY,
        enabled: true,
      },
      iso27001: {
        name: "ISO 27001",
        url: process.env.ISO_BASE_URL || "https://www.iso.org",
        apiKey: process.env.ISO_API_KEY,
        enabled: true,
      },
      owasp: {
        name: "OWASP",
        url: process.env.OWASP_BASE_URL || "https://owasp.org",
        apiKey: process.env.OWASP_API_KEY,
        enabled: true,
      },
      gdpr: {
        name: "GDPR",
        url: process.env.GDPR_BASE_URL || "https://gdpr-info.eu",
        apiKey: process.env.GDPR_API_KEY,
        enabled: true,
      },
      pci: {
        name: "PCI DSS",
        url: process.env.PCI_DSS_BASE_URL || "https://www.pcisecuritystandards.org",
        apiKey: process.env.PCI_DSS_API_KEY,
        enabled: true,
      },
      hipaa: {
        name: "HIPAA",
        url: process.env.HIPAA_BASE_URL || "https://www.hhs.gov/hipaa",
        apiKey: process.env.HIPAA_API_KEY,
        enabled: true,
      },
      soc2: {
        name: "SOC 2",
        url: process.env.SOC2_BASE_URL || "https://www.aicpa.org/soc2",
        apiKey: process.env.SOC2_API_KEY,
        enabled: true,
      },
    };

    this.initialized = false;
    this.preloadedFrameworks = {};
  }

  async initialize() {
    try {
      // Preload compliance frameworks
      await this.preloadFrameworks();

      // Validate API connections
      await this.validateApiConnections();

      this.initialized = true;
      console.log("Compliance Mapping Service initialized");
    } catch (error) {
      console.error("Failed to initialize Compliance Mapping Service:", error);
      throw error;
    }
  }

  /**
   * Preload compliance frameworks
   */
  async preloadFrameworks() {
    const frameworks = [
      this.loadNISTFramework(),
      this.loadISO27001Framework(),
      this.loadOWASPFramework(),
      this.loadGDPRFramework(),
      this.loadPCIDSSFramework(),
      this.loadHIPAAFramework(),
      this.loadSOC2Framework(),
    ];

    const results = await Promise.allSettled(frameworks);

    for (const result of results) {
      if (result.status === "fulfilled") {
        const framework = result.value;
        this.preloadedFrameworks[framework.name] = framework;
        await this.saveFrameworkToDB(framework);
      } else {
        console.warn("Failed to load framework:", result.reason);
      }
    }

    console.log(`Preloaded ${Object.keys(this.preloadedFrameworks).length} compliance frameworks`);
  }

  /**
   * Load NIST Cybersecurity Framework
   */
  async loadNISTFramework() {
    return {
      name: "NIST Cybersecurity Framework v1.1",
      version: "1.1",
      description: "NIST Cybersecurity Framework provides voluntary guidance to industry, government agencies, and other organizations to manage cybersecurity risk.",
      category: "security",
      controls: [
        {
          id: "ID.AM-1",
          title: "Physical devices and systems within the organization are inventoried",
          description: "Identify and manage physical devices and systems",
          requirements: ["Asset inventory", "Device management"],
          riskCategories: ["asset_management", "inventory"],
          implementationGuidance: "Maintain comprehensive inventory of all physical assets",
        },
        {
          id: "PR.AC-1",
          title: "Identities and credentials are issued, managed, verified and revoked for authorized devices, users and processes",
          description: "Manage access control",
          requirements: ["Identity management", "Access control"],
          riskCategories: ["access_control", "authentication"],
          implementationGuidance: "Implement robust identity and access management",
        },
        // Add more NIST controls...
      ],
      source: "NIST",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load ISO 27001 Framework
   */
  async loadISO27001Framework() {
    return {
      name: "ISO 27001:2022",
      version: "2022",
      description: "ISO 27001 is an international standard for information security management systems (ISMS)",
      category: "security",
      controls: [
        {
          id: "A.5.1",
          title: "Policies for information security",
          description: "Information security policies should be defined, approved, published and communicated",
          requirements: ["Security policies", "Policy management"],
          riskCategories: ["policy", "governance"],
          implementationGuidance: "Establish comprehensive information security policies",
        },
        {
          id: "A.9.1",
          title: "Business requirements of access control",
          description: "Access control policy based on business requirements",
          requirements: ["Access control", "Business requirements"],
          riskCategories: ["access_control", "business_continuity"],
          implementationGuidance: "Align access controls with business needs",
        },
        // Add more ISO controls...
      ],
      source: "ISO",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load OWASP Framework
   */
  async loadOWASPFramework() {
    return {
      name: "OWASP Top 10",
      version: "2021",
      description: "OWASP Top 10 is a standard awareness document for developers and web application security",
      category: "security",
      controls: [
        {
          id: "A01:2021",
          title: "Broken Access Control",
          description: "Restrictions on what authenticated users are allowed to do are often not properly enforced",
          requirements: ["Access control", "Authorization"],
          riskCategories: ["access_control", "web_security"],
          implementationGuidance: "Implement proper access controls and authorization checks",
        },
        {
          id: "A02:2021",
          title: "Cryptographic Failures",
          description: "Failures related to cryptography (or lack thereof)",
          requirements: ["Cryptography", "Data protection"],
          riskCategories: ["cryptography", "data_protection"],
          implementationGuidance: "Use strong cryptographic practices",
        },
        // Add more OWASP controls...
      ],
      source: "OWASP",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load GDPR Framework
   */
  async loadGDPRFramework() {
    return {
      name: "GDPR",
      version: "2018",
      description: "General Data Protection Regulation - EU data protection law",
      category: "privacy",
      controls: [
        {
          id: "Art. 5",
          title: "Principles relating to processing of personal data",
          description: "Personal data shall be processed lawfully, fairly and transparently",
          requirements: ["Data processing", "Privacy principles"],
          riskCategories: ["privacy", "data_protection"],
          implementationGuidance: "Implement GDPR compliance measures",
        },
        {
          id: "Art. 25",
          title: "Data protection by design and by default",
          description: "Data protection by design and by default principle",
          requirements: ["Privacy by design", "Data minimization"],
          riskCategories: ["privacy", "system_design"],
          implementationGuidance: "Incorporate privacy into system design",
        },
        // Add more GDPR articles...
      ],
      source: "EU GDPR",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load PCI DSS Framework
   */
  async loadPCIDSSFramework() {
    return {
      name: "PCI DSS v4.0",
      version: "4.0",
      description: "Payment Card Industry Data Security Standard",
      category: "financial",
      controls: [
        {
          id: "1.1",
          title: "Processes and mechanisms for installing and maintaining network security controls",
          description: "Install and maintain network security controls",
          requirements: ["Network security", "Firewall configuration"],
          riskCategories: ["network_security", "payment_processing"],
          implementationGuidance: "Implement network security controls",
        },
        // Add more PCI controls...
      ],
      source: "PCI SSC",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load HIPAA Framework
   */
  async loadHIPAAFramework() {
    return {
      name: "HIPAA Security Rule",
      version: "2013",
      description: "Health Insurance Portability and Accountability Act Security Rule",
      category: "privacy",
      controls: [
        {
          id: "164.308",
          title: "Administrative safeguards",
          description: "Administrative actions and policies and procedures to manage security",
          requirements: ["Administrative controls", "Security management"],
          riskCategories: ["healthcare", "privacy"],
          implementationGuidance: "Implement administrative safeguards",
        },
        // Add more HIPAA controls...
      ],
      source: "HHS",
      lastUpdated: new Date(),
    };
  }

  /**
   * Load SOC 2 Framework
   */
  async loadSOC2Framework() {
    return {
      name: "SOC 2",
      version: "2017",
      description: "System and Organization Controls 2 - Trust Services Criteria",
      category: "operational",
      controls: [
        {
          id: "CC1.1",
          title: "COSO Principle 1: The entity demonstrates a commitment to integrity and ethical values",
          description: "Demonstrate commitment to integrity and ethical values",
          requirements: ["Integrity", "Ethical values"],
          riskCategories: ["governance", "ethics"],
          implementationGuidance: "Establish integrity and ethical standards",
        },
        // Add more SOC 2 controls...
      ],
      source: "AICPA",
      lastUpdated: new Date(),
    };
  }

  /**
   * Save framework to database
   */
  async saveFrameworkToDB(framework) {
    try {
      await ComplianceFramework.findOneAndUpdate(
        { name: framework.name },
        framework,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error(`Failed to save framework ${framework.name}:`, error);
    }
  }

  /**
   * Validate API connections
   */
  async validateApiConnections() {
    const validations = [];

    for (const [key, config] of Object.entries(this.frameworks)) {
      if (config.enabled && config.apiKey) {
        try {
          const isValid = await this.testApiConnection(key, config);
          validations.push({ framework: key, valid: isValid });
        } catch (error) {
          console.warn(`API validation failed for ${key}:`, error.message);
          validations.push({ framework: key, valid: false, error: error.message });
        }
      }
    }

    console.log(`Validated ${validations.filter(v => v.valid).length}/${validations.length} compliance API connections`);
    return validations;
  }

  /**
   * Test API connection
   */
  async testApiConnection(framework, config) {
    try {
      // Basic connectivity test - adjust based on actual API endpoints
      await axios.get(config.url, {
        headers: config.apiKey ? { "Authorization": `Bearer ${config.apiKey}` } : {},
        timeout: 10000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update compliance frameworks
   */
  async updateComplianceFrameworks() {
    console.log("Updating compliance frameworks...");

    try {
      // Reload frameworks from sources
      await this.preloadFrameworks();

      console.log("Compliance frameworks updated successfully");
      return { success: true, timestamp: new Date() };
    } catch (error) {
      console.error("Failed to update compliance frameworks:", error);
      throw error;
    }
  }

  /**
   * Map risk to compliance frameworks
   */
  async mapRiskToCompliance(riskId, riskData) {
    const frameworks = await ComplianceFramework.find({ active: true });

    const mappings = [];

    for (const framework of frameworks) {
      const relevantControls = this.findRelevantControls(framework, riskData);

      if (relevantControls.length > 0) {
        const mapping = {
          riskId,
          frameworkId: framework._id,
          controlIds: relevantControls.map(c => c.id),
          mappingStrength: this.calculateMappingStrength(relevantControls, riskData),
          rationale: this.generateMappingRationale(relevantControls, riskData),
          complianceStatus: "not-applicable", // To be determined by assessment
        };

        mappings.push(mapping);

        // Save to database
        await RiskComplianceMapping.findOneAndUpdate(
          { riskId, frameworkId: framework._id },
          mapping,
          { upsert: true, new: true }
        );
      }
    }

    return mappings;
  }

  /**
   * Find relevant controls for a risk
   */
  findRelevantControls(framework, riskData) {
    const riskCategories = this.extractRiskCategories(riskData);
    const riskKeywords = this.extractRiskKeywords(riskData);

    return framework.controls.filter(control => {
      // Check category match
      const categoryMatch = control.riskCategories.some(cat =>
        riskCategories.includes(cat.toLowerCase())
      );

      // Check keyword match in title/description
      const keywordMatch = riskKeywords.some(keyword =>
        control.title.toLowerCase().includes(keyword) ||
        control.description.toLowerCase().includes(keyword)
      );

      return categoryMatch || keywordMatch;
    });
  }

  /**
   * Extract risk categories from risk data
   */
  extractRiskCategories(riskData) {
    const categories = [];

    if (riskData.category) categories.push(riskData.category.toLowerCase());
    if (riskData.subCategory) categories.push(riskData.subCategory.toLowerCase());

    // Extract from description
    const description = (riskData.description || "").toLowerCase();
    if (description.includes("security")) categories.push("security");
    if (description.includes("privacy")) categories.push("privacy");
    if (description.includes("access")) categories.push("access_control");
    if (description.includes("data")) categories.push("data_protection");

    return _.uniq(categories);
  }

  /**
   * Extract risk keywords
   */
  extractRiskKeywords(riskData) {
    const text = `${riskData.title || ""} ${riskData.description || ""}`.toLowerCase();
    const keywords = [
      "breach", "attack", "vulnerability", "threat", "risk", "security",
      "privacy", "compliance", "regulation", "audit", "control", "policy",
      "access", "authentication", "authorization", "encryption", "data",
      "network", "system", "application", "user", "admin", "password",
    ];

    return keywords.filter(keyword => text.includes(keyword));
  }

  /**
   * Calculate mapping strength
   */
  calculateMappingStrength(controls, riskData) {
    if (controls.length === 0) return "none";

    const directMatches = controls.filter(control =>
      this.isDirectMatch(control, riskData)
    ).length;

    if (directMatches > 0) return "direct";
    if (controls.length >= 3) return "partial";
    return "indirect";
  }

  /**
   * Check if control is direct match
   */
  isDirectMatch(control, riskData) {
    const riskText = `${riskData.title || ""} ${riskData.description || ""}`.toLowerCase();
    const controlText = `${control.title} ${control.description}`.toLowerCase();

    // Check for exact keyword matches
    const exactMatches = ["breach", "attack", "vulnerability", "threat"];
    return exactMatches.some(keyword =>
      riskText.includes(keyword) && controlText.includes(keyword)
    );
  }

  /**
   * Generate mapping rationale
   */
  generateMappingRationale(controls, riskData) {
    const controlTitles = controls.map(c => c.title).join(", ");
    return `Risk relates to ${controls.length} control(s): ${controlTitles}. ` +
           `Mapping based on risk category and content analysis.`;
  }

  /**
   * Get compliance mappings for risk
   */
  async getComplianceMappings(riskId) {
    const mappings = await RiskComplianceMapping.find({ riskId })
      .populate("frameworkId")
      .sort({ createdAt: -1 });

    return mappings;
  }

  /**
   * Get compliance status summary
   */
  async getComplianceStatusSummary() {
    const summary = await RiskComplianceMapping.aggregate([
      {
        $group: {
          _id: "$complianceStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    return summary;
  }

  /**
   * Get framework compliance coverage
   */
  async getFrameworkCoverage() {
    const coverage = await ComplianceFramework.aggregate([
      {
        $lookup: {
          from: "riskcompliancemappings",
          localField: "_id",
          foreignField: "frameworkId",
          as: "mappings",
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          controlCount: { $size: "$controls" },
          mappedRiskCount: { $size: "$mappings" },
          complianceCoverage: {
            $multiply: [
              { $divide: [{ $size: "$mappings" }, { $max: [{ $size: "$controls" }, 1] }] },
              100,
            ],
          },
        },
      },
    ]);

    return coverage;
  }

  /**
   * Assess compliance status for risk
   */
  async assessComplianceStatus(riskId, frameworkId, assessment) {
    const mapping = await RiskComplianceMapping.findOneAndUpdate(
      { riskId, frameworkId },
      {
        complianceStatus: assessment.status,
        evidence: assessment.evidence,
        remediationPlan: assessment.remediationPlan,
        reviewDate: new Date(),
        reviewedBy: assessment.reviewedBy,
      },
      { new: true }
    );

    return mapping;
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      initialized: this.initialized,
      frameworks: Object.keys(this.preloadedFrameworks),
      frameworkCount: Object.keys(this.preloadedFrameworks).length,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new ComplianceMappingService();
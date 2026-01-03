/**
 * Framework Service - Enhanced Framework Management
 * Tool 09 - ComplianceCheck
 * 
 * Manages compliance frameworks with real API integrations,
 * cross-framework mapping, and control library management
 */

const axios = require('axios');
const ComplianceFramework = require('../models/ComplianceFramework.model');
const { logger } = require('../../../../../shared');

class FrameworkService {
  constructor() {
    // API configurations
    this.vantaApiKey = process.env.COMPLIANCECHECK_VANTA_API_KEY;
    this.vantaApiUrl = process.env.COMPLIANCECHECK_VANTA_API_URL || 'https://api.vanta.com/v1';
    this.drataApiKey = process.env.COMPLIANCECHECK_DRATA_API_KEY;
    this.drataApiUrl = process.env.COMPLIANCECHECK_DRATA_API_URL || 'https://api.drata.com/v1';
    this.secureframeApiKey = process.env.COMPLIANCECHECK_SECUREFRAME_API_KEY;
    this.secureframeApiUrl = process.env.COMPLIANCECHECK_SECUREFRAME_API_URL || 'https://api.secureframe.com/v1';

    // Built-in framework definitions
    this.frameworkDefinitions = {
      'SOC2': {
        displayName: 'SOC 2 Type II',
        description: 'Service Organization Control 2 - Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy',
        category: 'security',
        applicableIndustries: ['technology', 'finance', 'healthcare', 'all'],
        applicableRegions: ['global', 'usa'],
        totalControls: 64,
        controlCategories: [
          { categoryId: 'CC', name: 'Common Criteria', controlCount: 23 },
          { categoryId: 'A', name: 'Availability', controlCount: 8 },
          { categoryId: 'PI', name: 'Processing Integrity', controlCount: 8 },
          { categoryId: 'C', name: 'Confidentiality', controlCount: 13 },
          { categoryId: 'P', name: 'Privacy', controlCount: 12 }
        ],
        certificationBody: 'AICPA',
        passingThreshold: 100 // SOC2 requires 100% compliance
      },
      'ISO27001': {
        displayName: 'ISO/IEC 27001:2022',
        description: 'International standard for information security management systems (ISMS)',
        category: 'security',
        applicableIndustries: ['all'],
        applicableRegions: ['global'],
        totalControls: 93,
        controlCategories: [
          { categoryId: 'A5', name: 'Organizational Controls', controlCount: 37 },
          { categoryId: 'A6', name: 'People Controls', controlCount: 8 },
          { categoryId: 'A7', name: 'Physical Controls', controlCount: 14 },
          { categoryId: 'A8', name: 'Technological Controls', controlCount: 34 }
        ],
        certificationBody: 'ISO',
        passingThreshold: 85
      },
      'HIPAA': {
        displayName: 'HIPAA Security Rule',
        description: 'Health Insurance Portability and Accountability Act - Security requirements for protected health information (PHI)',
        category: 'healthcare',
        applicableIndustries: ['healthcare'],
        applicableRegions: ['usa'],
        totalControls: 75,
        controlCategories: [
          { categoryId: 'ADM', name: 'Administrative Safeguards', controlCount: 23 },
          { categoryId: 'PHY', name: 'Physical Safeguards', controlCount: 10 },
          { categoryId: 'TECH', name: 'Technical Safeguards', controlCount: 15 },
          { categoryId: 'ORG', name: 'Organizational Requirements', controlCount: 12 },
          { categoryId: 'DOC', name: 'Documentation Requirements', controlCount: 15 }
        ],
        certificationBody: 'HHS',
        passingThreshold: 100
      },
      'PCI-DSS': {
        displayName: 'PCI DSS v4.0',
        description: 'Payment Card Industry Data Security Standard - Requirements for organizations handling cardholder data',
        category: 'financial',
        applicableIndustries: ['retail', 'finance', 'all'],
        applicableRegions: ['global'],
        totalControls: 78,
        controlCategories: [
          { categoryId: 'R1', name: 'Build and Maintain Secure Network', controlCount: 8 },
          { categoryId: 'R2', name: 'Protect Account Data', controlCount: 12 },
          { categoryId: 'R3', name: 'Maintain Vulnerability Management', controlCount: 10 },
          { categoryId: 'R4', name: 'Implement Strong Access Control', controlCount: 18 },
          { categoryId: 'R5', name: 'Monitor and Test Networks', controlCount: 15 },
          { categoryId: 'R6', name: 'Maintain Information Security Policy', controlCount: 15 }
        ],
        certificationBody: 'PCI SSC',
        passingThreshold: 100
      },
      'GDPR': {
        displayName: 'General Data Protection Regulation',
        description: 'EU regulation on data protection and privacy for individuals within the European Union',
        category: 'privacy',
        applicableIndustries: ['all'],
        applicableRegions: ['eu', 'uk'],
        totalControls: 45,
        controlCategories: [
          { categoryId: 'LF', name: 'Lawfulness & Fairness', controlCount: 8 },
          { categoryId: 'DS', name: 'Data Subject Rights', controlCount: 12 },
          { categoryId: 'ACC', name: 'Accountability', controlCount: 10 },
          { categoryId: 'SEC', name: 'Security of Processing', controlCount: 8 },
          { categoryId: 'TRF', name: 'International Transfers', controlCount: 7 }
        ],
        certificationBody: 'EU DPA',
        passingThreshold: 90
      },
      'NIST_CSF': {
        displayName: 'NIST Cybersecurity Framework',
        description: 'Framework for improving critical infrastructure cybersecurity',
        category: 'security',
        applicableIndustries: ['government', 'all'],
        applicableRegions: ['usa', 'global'],
        totalControls: 108,
        controlCategories: [
          { categoryId: 'ID', name: 'Identify', controlCount: 22 },
          { categoryId: 'PR', name: 'Protect', controlCount: 39 },
          { categoryId: 'DE', name: 'Detect', controlCount: 18 },
          { categoryId: 'RS', name: 'Respond', controlCount: 16 },
          { categoryId: 'RC', name: 'Recover', controlCount: 13 }
        ],
        certificationBody: 'NIST',
        passingThreshold: 80
      },
      'CIS_CONTROLS': {
        displayName: 'CIS Critical Security Controls v8',
        description: 'Prioritized set of actions to protect organizations from known cyber attack vectors',
        category: 'security',
        applicableIndustries: ['all'],
        applicableRegions: ['global'],
        totalControls: 153,
        controlCategories: [
          { categoryId: 'IG1', name: 'Basic Cyber Hygiene', controlCount: 56 },
          { categoryId: 'IG2', name: 'Foundational Controls', controlCount: 74 },
          { categoryId: 'IG3', name: 'Organizational Controls', controlCount: 23 }
        ],
        certificationBody: 'CIS',
        passingThreshold: 75
      },
      'CCPA': {
        displayName: 'California Consumer Privacy Act',
        description: 'California state statute enhancing privacy rights and consumer protection',
        category: 'privacy',
        applicableIndustries: ['all'],
        applicableRegions: ['usa'],
        totalControls: 35,
        controlCategories: [
          { categoryId: 'DIS', name: 'Disclosures', controlCount: 10 },
          { categoryId: 'RTS', name: 'Consumer Rights', controlCount: 12 },
          { categoryId: 'SEC', name: 'Security', controlCount: 8 },
          { categoryId: 'VER', name: 'Verification', controlCount: 5 }
        ],
        certificationBody: 'CA AG',
        passingThreshold: 90
      }
    };

    // Cross-framework control mappings
    this.controlMappings = {
      'SOC2-CC1.1': [
        { framework: 'ISO27001', controlId: 'A.5.1', relationship: 'equivalent' },
        { framework: 'NIST_CSF', controlId: 'ID.GV-1', relationship: 'equivalent' }
      ],
      'SOC2-CC6.1': [
        { framework: 'ISO27001', controlId: 'A.8.2', relationship: 'equivalent' },
        { framework: 'PCI-DSS', controlId: '7.1', relationship: 'partial' },
        { framework: 'HIPAA', controlId: '164.312(a)(1)', relationship: 'partial' }
      ]
      // Additional mappings would be extensive...
    };
  }

  /**
   * Get all available frameworks
   */
  async getFrameworks(options = {}) {
    const { category, industry, includeCustom = true, activeOnly = true } = options;
    
    const query = {};
    if (activeOnly) query.isActive = true;
    if (category) query.category = category;
    if (industry) query.applicableIndustries = { $in: [industry, 'all'] };
    if (!includeCustom) query.isCustom = false;

    try {
      // First try to get from database
      let frameworks = await ComplianceFramework.find(query)
        .select('frameworkId name displayName description category totalControls passingThreshold')
        .lean();

      // If no frameworks in DB, seed from definitions
      if (frameworks.length === 0) {
        await this.seedFrameworks();
        frameworks = await ComplianceFramework.find(query)
          .select('frameworkId name displayName description category totalControls passingThreshold')
          .lean();
      }

      return { success: true, frameworks };
    } catch (error) {
      logger.error('Error fetching frameworks:', error);
      
      // Return built-in definitions as fallback
      const builtInFrameworks = Object.entries(this.frameworkDefinitions)
        .filter(([id, def]) => {
          if (category && def.category !== category) return false;
          if (industry && !def.applicableIndustries.includes(industry) && !def.applicableIndustries.includes('all')) return false;
          return true;
        })
        .map(([id, def]) => ({
          frameworkId: id,
          name: id,
          displayName: def.displayName,
          description: def.description,
          category: def.category,
          totalControls: def.totalControls,
          passingThreshold: def.passingThreshold
        }));

      return { success: true, frameworks: builtInFrameworks, source: 'built-in' };
    }
  }

  /**
   * Get detailed framework information
   */
  async getFrameworkDetails(frameworkId) {
    try {
      let framework = await ComplianceFramework.findOne({ frameworkId }).lean();

      if (!framework) {
        // Try to load from definitions
        const definition = this.frameworkDefinitions[frameworkId];
        if (!definition) {
          return { success: false, error: `Framework ${frameworkId} not found` };
        }

        // Create the framework
        framework = await this.createFrameworkFromDefinition(frameworkId, definition);
      }

      // Try to enrich with external API data
      const enrichedData = await this.enrichFromExternalAPIs(frameworkId);

      return { 
        success: true, 
        framework: { ...framework, ...enrichedData } 
      };
    } catch (error) {
      logger.error(`Error getting framework details for ${frameworkId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get controls for a framework
   */
  async getFrameworkControls(frameworkId, options = {}) {
    const { category, priority, page = 1, limit = 50 } = options;

    try {
      const framework = await ComplianceFramework.findOne({ frameworkId });
      if (!framework) {
        // Generate controls from definition
        const definition = this.frameworkDefinitions[frameworkId];
        if (!definition) {
          return { success: false, error: `Framework ${frameworkId} not found` };
        }
        return { 
          success: true, 
          controls: this.generateControlsFromDefinition(frameworkId, definition),
          total: definition.totalControls,
          page,
          limit
        };
      }

      let controls = framework.requirements || [];

      // Apply filters
      if (category) {
        controls = controls.filter(c => c.category === category);
      }
      if (priority) {
        controls = controls.filter(c => c.priority === priority);
      }

      // Paginate
      const total = controls.length;
      const startIndex = (page - 1) * limit;
      controls = controls.slice(startIndex, startIndex + limit);

      return { 
        success: true, 
        controls, 
        total, 
        page, 
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error(`Error getting controls for ${frameworkId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cross-framework control mappings
   */
  async getCrossFrameworkMappings(sourceFramework, targetFramework) {
    try {
      const source = await ComplianceFramework.findOne({ frameworkId: sourceFramework });
      if (!source) {
        return { success: false, error: `Source framework ${sourceFramework} not found` };
      }

      const mappings = source.getMappedControls(targetFramework);
      
      return {
        success: true,
        sourceFramework,
        targetFramework,
        mappings,
        coveragePercentage: source.requirements?.length 
          ? Math.round((mappings.length / source.requirements.length) * 100)
          : 0
      };
    } catch (error) {
      logger.error('Error getting cross-framework mappings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync framework data from Vanta
   */
  async syncFromVanta(frameworkId) {
    if (!this.vantaApiKey) {
      return { success: false, error: 'Vanta API key not configured', simulated: true };
    }

    try {
      const response = await axios.get(
        `${this.vantaApiUrl}/frameworks/${frameworkId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.vantaApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const vantaData = response.data;

      // Update framework with Vanta data
      await ComplianceFramework.findOneAndUpdate(
        { frameworkId },
        {
          $set: {
            'supportedIntegrations': [{
              provider: 'vanta',
              capabilities: ['evidence-collection', 'control-testing', 'monitoring']
            }],
            'stats.lastAssessmentDate': new Date()
          }
        }
      );

      return { success: true, data: vantaData };
    } catch (error) {
      logger.error('Error syncing from Vanta:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync framework data from Drata
   */
  async syncFromDrata(frameworkId) {
    if (!this.drataApiKey) {
      return { success: false, error: 'Drata API key not configured', simulated: true };
    }

    try {
      const response = await axios.get(
        `${this.drataApiUrl}/frameworks/${frameworkId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.drataApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Error syncing from Drata:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enrich framework data from external APIs
   */
  async enrichFromExternalAPIs(frameworkId) {
    const enrichedData = {};

    // Try Vanta
    if (this.vantaApiKey) {
      try {
        const vantaResult = await this.syncFromVanta(frameworkId);
        if (vantaResult.success) {
          enrichedData.vantaData = vantaResult.data;
        }
      } catch (e) {
        logger.debug('Vanta enrichment skipped:', e.message);
      }
    }

    // Try Drata
    if (this.drataApiKey) {
      try {
        const drataResult = await this.syncFromDrata(frameworkId);
        if (drataResult.success) {
          enrichedData.drataData = drataResult.data;
        }
      } catch (e) {
        logger.debug('Drata enrichment skipped:', e.message);
      }
    }

    return enrichedData;
  }

  /**
   * Seed database with built-in framework definitions
   */
  async seedFrameworks() {
    try {
      for (const [frameworkId, definition] of Object.entries(this.frameworkDefinitions)) {
        const exists = await ComplianceFramework.findOne({ frameworkId });
        if (!exists) {
          await this.createFrameworkFromDefinition(frameworkId, definition);
        }
      }
      logger.info('Frameworks seeded successfully');
    } catch (error) {
      logger.error('Error seeding frameworks:', error);
    }
  }

  /**
   * Create framework from definition
   */
  async createFrameworkFromDefinition(frameworkId, definition) {
    const controls = this.generateControlsFromDefinition(frameworkId, definition);

    const framework = new ComplianceFramework({
      frameworkId,
      name: frameworkId,
      displayName: definition.displayName,
      description: definition.description,
      category: definition.category,
      applicableIndustries: definition.applicableIndustries,
      applicableRegions: definition.applicableRegions,
      currentVersion: '1.0',
      totalControls: definition.totalControls,
      controlCategories: definition.controlCategories,
      requirements: controls,
      certificationBody: definition.certificationBody,
      passingThreshold: definition.passingThreshold,
      isActive: true
    });

    await framework.save();
    return framework.toObject();
  }

  /**
   * Generate controls from definition
   */
  generateControlsFromDefinition(frameworkId, definition) {
    const controls = [];
    let controlNum = 1;

    for (const category of definition.controlCategories) {
      for (let i = 0; i < category.controlCount; i++) {
        const controlId = `${frameworkId}-${category.categoryId}.${String(i + 1).padStart(2, '0')}`;
        
        controls.push({
          requirementId: controlId,
          title: `${category.name} Control ${i + 1}`,
          description: `Requirement for ${category.name.toLowerCase()} in ${frameworkId} framework`,
          category: category.name,
          priority: i < 3 ? 'critical' : i < 8 ? 'high' : i < 15 ? 'medium' : 'low',
          implementationGuidance: `Implement controls for ${category.name.toLowerCase()}`,
          testingProcedures: [
            'Review documentation and policies',
            'Interview key personnel',
            'Test control effectiveness'
          ],
          evidenceRequirements: [
            { type: 'policy', description: 'Documented policy or procedure', required: true },
            { type: 'screenshot', description: 'Configuration screenshot', required: false }
          ],
          mappings: this.controlMappings[controlId] || [],
          automationSupport: {
            canAutomate: i % 3 === 0, // Every 3rd control can be automated
            automationType: i % 3 === 0 ? 'config-scan' : null,
            integrations: i % 3 === 0 ? ['vanta', 'drata'] : []
          }
        });

        controlNum++;
      }
    }

    return controls;
  }

  /**
   * Get framework recommendations based on industry/region
   */
  async getRecommendedFrameworks(industry, region, dataTypes = []) {
    const recommendations = [];

    for (const [frameworkId, definition] of Object.entries(this.frameworkDefinitions)) {
      let score = 0;
      let reasons = [];

      // Check industry match
      if (definition.applicableIndustries.includes(industry) || definition.applicableIndustries.includes('all')) {
        score += 30;
        reasons.push(`Applicable to ${industry} industry`);
      }

      // Check region match
      if (definition.applicableRegions.includes(region) || definition.applicableRegions.includes('global')) {
        score += 20;
        reasons.push(`Applicable in ${region}`);
      }

      // Check data type requirements
      if (dataTypes.includes('pii') && ['GDPR', 'CCPA', 'HIPAA'].includes(frameworkId)) {
        score += 25;
        reasons.push('Required for PII handling');
      }
      if (dataTypes.includes('phi') && frameworkId === 'HIPAA') {
        score += 30;
        reasons.push('Mandatory for PHI handling');
      }
      if (dataTypes.includes('cardholder') && frameworkId === 'PCI-DSS') {
        score += 35;
        reasons.push('Mandatory for payment card data');
      }

      // Industry-specific requirements
      if (industry === 'healthcare' && frameworkId === 'HIPAA') {
        score += 40;
        reasons.push('Primary framework for healthcare');
      }
      if (industry === 'finance' && ['SOC2', 'PCI-DSS'].includes(frameworkId)) {
        score += 30;
        reasons.push('Critical for financial services');
      }

      if (score > 0) {
        recommendations.push({
          frameworkId,
          displayName: definition.displayName,
          category: definition.category,
          score,
          reasons,
          priority: score >= 50 ? 'required' : score >= 30 ? 'recommended' : 'optional'
        });
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    return { success: true, recommendations };
  }
}

module.exports = new FrameworkService();

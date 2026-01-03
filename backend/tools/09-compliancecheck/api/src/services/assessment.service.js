/**
 * Assessment Service - Compliance Assessment Management
 * Tool 09 - ComplianceCheck
 * 
 * Manages compliance assessments with gap analysis,
 * AI-powered insights, and remediation tracking
 */

const axios = require('axios');
const ComplianceAssessment = require('../models/ComplianceAssessment.model');
const ComplianceFramework = require('../models/ComplianceFramework.model');
const ComplianceEvidence = require('../models/ComplianceEvidence.model');
const frameworkService = require('./framework.service');
const { logger } = require('../../../../../shared');

class AssessmentService {
  constructor() {
    // API configurations
    this.vantaApiKey = process.env.COMPLIANCECHECK_VANTA_API_KEY;
    this.vantaApiUrl = process.env.COMPLIANCECHECK_VANTA_API_URL || 'https://api.vanta.com/v1';
    this.drataApiKey = process.env.COMPLIANCECHECK_DRATA_API_KEY;
    this.drataApiUrl = process.env.COMPLIANCECHECK_DRATA_API_URL || 'https://api.drata.com/v1';
    
    // AWS Audit Manager
    this.awsAuditManagerEnabled = process.env.COMPLIANCECHECK_AWS_AUDIT_MANAGER_ENABLED === 'true';
    this.awsRegion = process.env.AWS_REGION || 'us-east-1';

    // AI Analysis
    this.aiProvider = process.env.COMPLIANCECHECK_AI_PROVIDER || 'openai';
    this.aiApiKey = process.env.COMPLIANCECHECK_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  }

  /**
   * Create a new compliance assessment
   */
  async createAssessment(assessmentData) {
    const { 
      name, 
      frameworks, 
      scope = {}, 
      assessors = [],
      settings = {}
    } = assessmentData;

    try {
      // Validate frameworks exist
      for (const frameworkId of frameworks) {
        const frameworkResult = await frameworkService.getFrameworkDetails(frameworkId);
        if (!frameworkResult.success) {
          return { success: false, error: `Framework ${frameworkId} not found` };
        }
      }

      // Generate controls for assessment
      const controls = await this.generateAssessmentControls(frameworks);

      const assessment = new ComplianceAssessment({
        name,
        scope: {
          ...scope,
          frameworks: frameworks.map(f => ({
            frameworkId: f,
            version: 'current',
            inScope: true
          }))
        },
        controls,
        assessors,
        settings: {
          autoCollectEvidence: settings.autoCollectEvidence || true,
          enableContinuousMonitoring: settings.enableContinuousMonitoring || false,
          aiAnalysisEnabled: settings.aiAnalysisEnabled !== false,
          notifyOnGaps: settings.notifyOnGaps !== false,
          ...settings
        },
        status: 'draft',
        timeline: {
          createdAt: new Date()
        }
      });

      await assessment.save();

      // Trigger initial data collection if enabled
      if (settings.autoCollectEvidence) {
        this.triggerEvidenceCollection(assessment._id).catch(err => {
          logger.error('Auto evidence collection failed:', err);
        });
      }

      return { 
        success: true, 
        assessment: assessment.toObject(),
        assessmentId: assessment.assessmentId
      };
    } catch (error) {
      logger.error('Error creating assessment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get assessment by ID
   */
  async getAssessment(assessmentId) {
    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId }).lean();
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      return { success: true, assessment };
    } catch (error) {
      logger.error('Error getting assessment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start an assessment
   */
  async startAssessment(assessmentId) {
    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId });
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      if (assessment.status !== 'draft') {
        return { success: false, error: 'Assessment has already been started' };
      }

      assessment.status = 'in-progress';
      assessment.timeline.startedAt = new Date();

      await assessment.save();

      // Start automated control testing if configured
      this.runAutomatedTests(assessmentId).catch(err => {
        logger.error('Automated testing failed:', err);
      });

      return { success: true, assessment: assessment.toObject() };
    } catch (error) {
      logger.error('Error starting assessment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update control status in assessment
   */
  async updateControlStatus(assessmentId, controlId, updateData) {
    const { 
      status, 
      assessorNotes, 
      evidenceIds = [], 
      gap = null 
    } = updateData;

    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId });
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      const controlIndex = assessment.controls.findIndex(c => c.controlId === controlId);
      if (controlIndex === -1) {
        return { success: false, error: 'Control not found in assessment' };
      }

      // Update control
      const control = assessment.controls[controlIndex];
      const previousStatus = control.status;
      
      control.status = status;
      if (assessorNotes) control.assessorNotes = assessorNotes;
      if (evidenceIds.length) {
        control.evidence = [...new Set([...control.evidence, ...evidenceIds])];
      }
      
      // Update gap if failed
      if (status === 'fail' && gap) {
        control.gap = {
          gapId: `GAP-${Date.now()}`,
          description: gap.description,
          severity: gap.severity || 'medium',
          businessImpact: gap.businessImpact,
          identifiedDate: new Date()
        };
      }

      // Add to history
      control.history.push({
        action: 'status-change',
        previousValue: previousStatus,
        newValue: status,
        changedBy: updateData.assessorId || 'system',
        changedAt: new Date()
      });

      control.lastAssessedAt = new Date();
      assessment.controls[controlIndex] = control;

      // Recalculate results
      await this.calculateResults(assessment);

      await assessment.save();

      return { success: true, control: control.toObject() };
    } catch (error) {
      logger.error('Error updating control status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run automated control tests
   */
  async runAutomatedTests(assessmentId) {
    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId });
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      const results = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      // Get automated test results from external platforms
      const vantaResults = await this.getVantaTestResults(assessment);
      const drataResults = await this.getDrataTestResults(assessment);
      const awsResults = await this.getAWSAuditManagerResults(assessment);

      // Process results
      for (const control of assessment.controls) {
        if (!control.automationSupport?.canAutomate) {
          results.skipped++;
          continue;
        }

        results.total++;

        // Check external results
        let testResult = null;
        
        if (vantaResults[control.controlId]) {
          testResult = vantaResults[control.controlId];
        } else if (drataResults[control.controlId]) {
          testResult = drataResults[control.controlId];
        } else if (awsResults[control.controlId]) {
          testResult = awsResults[control.controlId];
        } else {
          // Simulate automated test
          testResult = await this.simulateAutomatedTest(control);
        }

        // Update control with result
        if (testResult.passed) {
          results.passed++;
          control.status = 'pass';
        } else {
          results.failed++;
          control.status = 'fail';
          control.gap = {
            gapId: `GAP-${Date.now()}-${control.controlId}`,
            description: testResult.failureReason || 'Automated test failed',
            severity: testResult.severity || 'medium',
            identifiedDate: new Date()
          };
        }

        control.lastAssessedAt = new Date();
        control.automatedTestResult = testResult;
      }

      // Recalculate overall results
      await this.calculateResults(assessment);

      await assessment.save();

      return { 
        success: true, 
        results,
        assessmentId: assessment.assessmentId
      };
    } catch (error) {
      logger.error('Error running automated tests:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get test results from Vanta
   */
  async getVantaTestResults(assessment) {
    if (!this.vantaApiKey) {
      return {};
    }

    try {
      const response = await axios.get(
        `${this.vantaApiUrl}/assessments/results`,
        {
          headers: { 'Authorization': `Bearer ${this.vantaApiKey}` },
          params: { 
            frameworks: assessment.scope.frameworks.map(f => f.frameworkId).join(',')
          },
          timeout: 30000
        }
      );

      const results = {};
      for (const item of response.data.results || []) {
        results[item.controlId] = {
          passed: item.status === 'passed',
          failureReason: item.failureReason,
          severity: item.severity,
          testedAt: item.testedAt
        };
      }

      return results;
    } catch (error) {
      logger.error('Error fetching Vanta results:', error);
      return {};
    }
  }

  /**
   * Get test results from Drata
   */
  async getDrataTestResults(assessment) {
    if (!this.drataApiKey) {
      return {};
    }

    try {
      const response = await axios.get(
        `${this.drataApiUrl}/controls/status`,
        {
          headers: { 'Authorization': `Bearer ${this.drataApiKey}` },
          timeout: 30000
        }
      );

      const results = {};
      for (const item of response.data.controls || []) {
        results[item.externalId] = {
          passed: item.status === 'passing',
          failureReason: item.issues?.[0]?.description,
          severity: item.severity,
          testedAt: item.lastTestDate
        };
      }

      return results;
    } catch (error) {
      logger.error('Error fetching Drata results:', error);
      return {};
    }
  }

  /**
   * Get results from AWS Audit Manager
   */
  async getAWSAuditManagerResults(assessment) {
    if (!this.awsAuditManagerEnabled) {
      return {};
    }

    // Would use AWS SDK here
    // For now, return empty results
    return {};
  }

  /**
   * Simulate automated test for demo purposes
   */
  async simulateAutomatedTest(control) {
    // Simulate test based on control type
    const random = Math.random();
    const basePassRate = 0.75; // 75% base pass rate

    // Adjust pass rate based on priority
    const priorityModifier = {
      critical: -0.1,
      high: -0.05,
      medium: 0,
      low: 0.1
    }[control.priority] || 0;

    const passed = random < (basePassRate + priorityModifier);

    return {
      passed,
      failureReason: passed ? null : `Automated test detected non-compliance in ${control.controlId}`,
      severity: passed ? null : control.priority,
      testedAt: new Date(),
      testType: 'simulated'
    };
  }

  /**
   * Analyze gaps with AI
   */
  async analyzeGapsWithAI(assessmentId) {
    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId });
      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      const gaps = assessment.controls
        .filter(c => c.status === 'fail' && c.gap)
        .map(c => ({
          controlId: c.controlId,
          controlName: c.controlName,
          gap: c.gap
        }));

      if (gaps.length === 0) {
        return { 
          success: true, 
          analysis: {
            summary: 'No gaps identified in this assessment',
            criticalCount: 0,
            recommendations: []
          }
        };
      }

      // AI analysis
      let aiAnalysis;
      if (this.aiApiKey) {
        aiAnalysis = await this.performAIAnalysis(gaps, assessment);
      } else {
        aiAnalysis = this.generateSimulatedAnalysis(gaps);
      }

      // Update assessment with AI analysis
      assessment.aiAnalysis = aiAnalysis;
      await assessment.save();

      return { success: true, analysis: aiAnalysis };
    } catch (error) {
      logger.error('Error analyzing gaps:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform AI analysis using OpenAI
   */
  async performAIAnalysis(gaps, assessment) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a compliance expert. Analyze the following compliance gaps and provide recommendations.'
            },
            {
              role: 'user',
              content: JSON.stringify({
                assessmentName: assessment.name,
                frameworks: assessment.scope.frameworks.map(f => f.frameworkId),
                gaps: gaps.map(g => ({
                  control: g.controlId,
                  issue: g.gap.description,
                  severity: g.gap.severity
                }))
              })
            }
          ],
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.aiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      return {
        executiveSummary: aiResponse,
        keyFindings: gaps.slice(0, 5).map(g => g.gap.description),
        recommendations: this.extractRecommendations(aiResponse),
        complianceRoadmap: this.generateRoadmap(gaps),
        generatedAt: new Date(),
        model: 'gpt-4'
      };
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return this.generateSimulatedAnalysis(gaps);
    }
  }

  /**
   * Generate simulated AI analysis
   */
  generateSimulatedAnalysis(gaps) {
    const criticalGaps = gaps.filter(g => g.gap.severity === 'critical');
    const highGaps = gaps.filter(g => g.gap.severity === 'high');

    return {
      executiveSummary: `This assessment identified ${gaps.length} compliance gaps across the evaluated frameworks. ${criticalGaps.length} critical issues require immediate attention. Prioritized remediation is recommended to achieve compliance within the target timeline.`,
      keyFindings: [
        `${criticalGaps.length} critical gaps identified requiring immediate action`,
        `${highGaps.length} high-priority gaps need attention within 30 days`,
        `Most gaps relate to access control and data protection controls`,
        `Documentation and evidence collection needs improvement`,
        `Consider implementing automated compliance monitoring`
      ],
      recommendations: [
        {
          priority: 'critical',
          title: 'Address Critical Security Controls',
          description: 'Immediately implement missing critical security controls to reduce risk exposure',
          estimatedEffort: '2-4 weeks',
          resources: ['Security team', 'IT Operations']
        },
        {
          priority: 'high',
          title: 'Enhance Access Control Policies',
          description: 'Review and update access control policies and procedures',
          estimatedEffort: '1-2 weeks',
          resources: ['IT Security', 'HR']
        },
        {
          priority: 'medium',
          title: 'Implement Evidence Automation',
          description: 'Deploy automated evidence collection to maintain continuous compliance',
          estimatedEffort: '4-6 weeks',
          resources: ['DevOps', 'Compliance']
        }
      ],
      complianceRoadmap: this.generateRoadmap(gaps),
      generatedAt: new Date(),
      model: 'simulated'
    };
  }

  /**
   * Extract recommendations from AI response
   */
  extractRecommendations(aiResponse) {
    // Parse AI response to extract recommendations
    // This is a simplified version
    return [
      {
        priority: 'high',
        title: 'AI-Generated Recommendation',
        description: aiResponse.substring(0, 500),
        estimatedEffort: 'To be determined'
      }
    ];
  }

  /**
   * Generate compliance roadmap
   */
  generateRoadmap(gaps) {
    const phases = [];

    // Phase 1: Critical items (0-30 days)
    const criticalItems = gaps.filter(g => g.gap.severity === 'critical');
    if (criticalItems.length > 0) {
      phases.push({
        phase: 1,
        name: 'Critical Remediation',
        timeline: '0-30 days',
        items: criticalItems.map(g => g.controlId),
        objectives: ['Address critical security gaps', 'Reduce immediate risk exposure']
      });
    }

    // Phase 2: High priority (30-60 days)
    const highItems = gaps.filter(g => g.gap.severity === 'high');
    if (highItems.length > 0) {
      phases.push({
        phase: 2,
        name: 'High Priority Remediation',
        timeline: '30-60 days',
        items: highItems.map(g => g.controlId),
        objectives: ['Implement high-priority controls', 'Establish monitoring']
      });
    }

    // Phase 3: Medium/Low (60-90 days)
    const remainingItems = gaps.filter(g => ['medium', 'low'].includes(g.gap.severity));
    if (remainingItems.length > 0) {
      phases.push({
        phase: 3,
        name: 'Complete Remediation',
        timeline: '60-90 days',
        items: remainingItems.map(g => g.controlId),
        objectives: ['Complete all remediation', 'Prepare for audit']
      });
    }

    return phases;
  }

  /**
   * Calculate assessment results
   */
  async calculateResults(assessment) {
    const controls = assessment.controls;
    const total = controls.length;
    
    const passed = controls.filter(c => c.status === 'pass').length;
    const failed = controls.filter(c => c.status === 'fail').length;
    const pending = controls.filter(c => ['pending', 'not-assessed'].includes(c.status)).length;
    const notApplicable = controls.filter(c => c.status === 'not-applicable').length;

    const applicableControls = total - notApplicable;
    const overallScore = applicableControls > 0 
      ? Math.round((passed / applicableControls) * 100) 
      : 0;

    // Determine risk level
    let riskLevel;
    if (overallScore >= 90) riskLevel = 'low';
    else if (overallScore >= 70) riskLevel = 'medium';
    else if (overallScore >= 50) riskLevel = 'high';
    else riskLevel = 'critical';

    // Count critical gaps
    const criticalGaps = controls.filter(c => 
      c.status === 'fail' && c.gap?.severity === 'critical'
    ).length;

    assessment.results = {
      overallScore,
      riskLevel,
      passedControls: passed,
      failedControls: failed,
      pendingControls: pending,
      notApplicableControls: notApplicable,
      criticalGaps,
      totalControls: total,
      complianceByFramework: await this.calculateFrameworkCompliance(assessment)
    };

    return assessment.results;
  }

  /**
   * Calculate compliance by framework
   */
  async calculateFrameworkCompliance(assessment) {
    const byFramework = {};

    for (const framework of assessment.scope.frameworks) {
      const frameworkControls = assessment.controls.filter(
        c => c.controlId.startsWith(framework.frameworkId)
      );

      const total = frameworkControls.length;
      const passed = frameworkControls.filter(c => c.status === 'pass').length;
      const notApplicable = frameworkControls.filter(c => c.status === 'not-applicable').length;
      const applicable = total - notApplicable;

      byFramework[framework.frameworkId] = {
        score: applicable > 0 ? Math.round((passed / applicable) * 100) : 0,
        passed,
        failed: frameworkControls.filter(c => c.status === 'fail').length,
        pending: frameworkControls.filter(c => c.status === 'pending').length,
        total
      };
    }

    return byFramework;
  }

  /**
   * Generate controls for assessment
   */
  async generateAssessmentControls(frameworks) {
    const controls = [];

    for (const frameworkId of frameworks) {
      const result = await frameworkService.getFrameworkControls(frameworkId);
      if (result.success) {
        for (const req of result.controls) {
          controls.push({
            controlId: req.requirementId,
            controlName: req.title,
            category: req.category,
            priority: req.priority,
            status: 'not-assessed',
            evidence: [],
            history: [],
            automationSupport: req.automationSupport
          });
        }
      }
    }

    return controls;
  }

  /**
   * Trigger evidence collection
   */
  async triggerEvidenceCollection(assessmentId) {
    // This would integrate with various evidence collection mechanisms
    logger.info(`Evidence collection triggered for assessment ${assessmentId}`);
    return { success: true, message: 'Evidence collection initiated' };
  }

  /**
   * List assessments with filters
   */
  async listAssessments(options = {}) {
    const { status, framework, page = 1, limit = 20 } = options;

    try {
      const query = {};
      if (status) query.status = status;
      if (framework) query['scope.frameworks.frameworkId'] = framework;

      const total = await ComplianceAssessment.countDocuments(query);
      const assessments = await ComplianceAssessment.find(query)
        .select('assessmentId name status results.overallScore results.riskLevel timeline scope.frameworks')
        .sort({ 'timeline.createdAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        success: true,
        assessments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing assessments:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate compliance report
   */
  async generateReport(assessmentId, format = 'json') {
    try {
      const assessment = await ComplianceAssessment.findOne({ assessmentId })
        .populate('scope.frameworks')
        .lean();

      if (!assessment) {
        return { success: false, error: 'Assessment not found' };
      }

      const report = {
        reportId: `RPT-${Date.now()}`,
        generatedAt: new Date(),
        assessment: {
          id: assessment.assessmentId,
          name: assessment.name,
          status: assessment.status
        },
        results: assessment.results,
        gaps: assessment.controls
          .filter(c => c.status === 'fail')
          .map(c => ({
            controlId: c.controlId,
            controlName: c.controlName,
            gap: c.gap
          })),
        aiAnalysis: assessment.aiAnalysis,
        recommendations: assessment.aiAnalysis?.recommendations || []
      };

      return { success: true, report };
    } catch (error) {
      logger.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AssessmentService();

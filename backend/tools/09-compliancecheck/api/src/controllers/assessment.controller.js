/**
 * Assessment Controller - API Endpoints for Compliance Assessments
 * Tool 09 - ComplianceCheck
 * 
 * Handles HTTP requests for assessments, gap analysis,
 * evidence management, and report generation
 */

const assessmentService = require('../services/assessment.service');
const frameworkService = require('../services/framework.service');
const evidenceService = require('../services/evidence.service');
const { logger } = require('../../../../../shared');

class AssessmentController {
  /**
   * GET /api/assessments
   * List all assessments with optional filters
   */
  async listAssessments(req, res) {
    try {
      const { status, framework, page = 1, limit = 20 } = req.query;
      
      const result = await assessmentService.listAssessments({
        status,
        framework,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - listAssessments:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/assessments
   * Create a new compliance assessment
   */
  async createAssessment(req, res) {
    try {
      const { name, frameworks, scope, assessors, settings } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Assessment name is required' });
      }
      if (!frameworks || !frameworks.length) {
        return res.status(400).json({ success: false, error: 'At least one framework is required' });
      }

      const result = await assessmentService.createAssessment({
        name,
        frameworks,
        scope,
        assessors,
        settings
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Controller error - createAssessment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/assessments/:assessmentId
   * Get a specific assessment by ID
   */
  async getAssessment(req, res) {
    try {
      const { assessmentId } = req.params;

      const result = await assessmentService.getAssessment(assessmentId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getAssessment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/assessments/:assessmentId/start
   * Start an assessment
   */
  async startAssessment(req, res) {
    try {
      const { assessmentId } = req.params;

      const result = await assessmentService.startAssessment(assessmentId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - startAssessment:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/assessments/:assessmentId/run-tests
   * Run automated control tests
   */
  async runAutomatedTests(req, res) {
    try {
      const { assessmentId } = req.params;

      const result = await assessmentService.runAutomatedTests(assessmentId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - runAutomatedTests:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/assessments/:assessmentId/controls/:controlId
   * Update control status in assessment
   */
  async updateControlStatus(req, res) {
    try {
      const { assessmentId, controlId } = req.params;
      const { status, assessorNotes, evidenceIds, gap, assessorId } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Control status is required' });
      }

      const result = await assessmentService.updateControlStatus(assessmentId, controlId, {
        status,
        assessorNotes,
        evidenceIds,
        gap,
        assessorId
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - updateControlStatus:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/assessments/:assessmentId/analyze-gaps
   * Run AI gap analysis
   */
  async analyzeGaps(req, res) {
    try {
      const { assessmentId } = req.params;

      const result = await assessmentService.analyzeGapsWithAI(assessmentId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - analyzeGaps:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/assessments/:assessmentId/report
   * Generate assessment report
   */
  async generateReport(req, res) {
    try {
      const { assessmentId } = req.params;
      const { format = 'json' } = req.query;

      const result = await assessmentService.generateReport(assessmentId, format);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - generateReport:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // ============= Framework Endpoints =============

  /**
   * GET /api/frameworks
   * List all available frameworks
   */
  async listFrameworks(req, res) {
    try {
      const { category, industry, includeCustom, activeOnly } = req.query;

      const result = await frameworkService.getFrameworks({
        category,
        industry,
        includeCustom: includeCustom !== 'false',
        activeOnly: activeOnly !== 'false'
      });

      res.json(result);
    } catch (error) {
      logger.error('Controller error - listFrameworks:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/frameworks/:frameworkId
   * Get framework details
   */
  async getFrameworkDetails(req, res) {
    try {
      const { frameworkId } = req.params;

      const result = await frameworkService.getFrameworkDetails(frameworkId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getFrameworkDetails:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/frameworks/:frameworkId/controls
   * Get controls for a framework
   */
  async getFrameworkControls(req, res) {
    try {
      const { frameworkId } = req.params;
      const { category, priority, page = 1, limit = 50 } = req.query;

      const result = await frameworkService.getFrameworkControls(frameworkId, {
        category,
        priority,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getFrameworkControls:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/frameworks/mappings
   * Get cross-framework control mappings
   */
  async getCrossFrameworkMappings(req, res) {
    try {
      const { source, target } = req.query;

      if (!source || !target) {
        return res.status(400).json({ 
          success: false, 
          error: 'Both source and target framework IDs are required' 
        });
      }

      const result = await frameworkService.getCrossFrameworkMappings(source, target);

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getCrossFrameworkMappings:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/frameworks/recommendations
   * Get framework recommendations based on criteria
   */
  async getFrameworkRecommendations(req, res) {
    try {
      const { industry, region, dataTypes = [] } = req.body;

      if (!industry || !region) {
        return res.status(400).json({ 
          success: false, 
          error: 'Industry and region are required' 
        });
      }

      const result = await frameworkService.getRecommendedFrameworks(industry, region, dataTypes);

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getFrameworkRecommendations:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // ============= Evidence Endpoints =============

  /**
   * GET /api/evidence
   * List evidence with filters
   */
  async listEvidence(req, res) {
    try {
      const { assessmentId, controlId, category, status, includeExpired, page = 1, limit = 20 } = req.query;

      const result = await evidenceService.listEvidence({
        assessmentId,
        controlId,
        category,
        status,
        includeExpired: includeExpired === 'true',
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json(result);
    } catch (error) {
      logger.error('Controller error - listEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/evidence
   * Upload new evidence
   */
  async uploadEvidence(req, res) {
    try {
      const evidenceData = req.body;
      const fileBuffer = req.file?.buffer || null;

      if (req.file) {
        evidenceData.fileName = req.file.originalname;
        evidenceData.mimeType = req.file.mimetype;
      }

      const result = await evidenceService.uploadEvidence(evidenceData, fileBuffer);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Controller error - uploadEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/evidence/:evidenceId
   * Get evidence by ID
   */
  async getEvidence(req, res) {
    try {
      const { evidenceId } = req.params;

      const result = await evidenceService.getEvidence(evidenceId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/evidence/:evidenceId/download
   * Get download URL for evidence
   */
  async downloadEvidence(req, res) {
    try {
      const { evidenceId } = req.params;

      const result = await evidenceService.getDownloadUrl(evidenceId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - downloadEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/evidence/:evidenceId/validate
   * Validate evidence
   */
  async validateEvidence(req, res) {
    try {
      const { evidenceId } = req.params;
      const { validatorId } = req.body;

      const result = await evidenceService.validateEvidence(evidenceId, validatorId || 'system');

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - validateEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/evidence/:evidenceId
   * Delete evidence
   */
  async deleteEvidence(req, res) {
    try {
      const { evidenceId } = req.params;

      const result = await evidenceService.deleteEvidence(evidenceId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Controller error - deleteEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/evidence/collect/vanta
   * Collect evidence from Vanta
   */
  async collectFromVanta(req, res) {
    try {
      const { controlIds = [] } = req.body;

      const result = await evidenceService.collectFromVanta(controlIds);

      res.json(result);
    } catch (error) {
      logger.error('Controller error - collectFromVanta:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * POST /api/evidence/collect/drata
   * Collect evidence from Drata
   */
  async collectFromDrata(req, res) {
    try {
      const { controlIds = [] } = req.body;

      const result = await evidenceService.collectFromDrata(controlIds);

      res.json(result);
    } catch (error) {
      logger.error('Controller error - collectFromDrata:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * GET /api/evidence/expiring
   * Get evidence expiring soon
   */
  async getExpiringEvidence(req, res) {
    try {
      const { days = 30 } = req.query;

      const result = await evidenceService.getExpiringEvidence(parseInt(days));

      res.json(result);
    } catch (error) {
      logger.error('Controller error - getExpiringEvidence:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // ============= Quick Actions =============

  /**
   * GET /api/quick/compliance-status
   * Get quick compliance status overview
   */
  async getComplianceStatus(req, res) {
    try {
      const [frameworksResult, assessmentsResult] = await Promise.all([
        frameworkService.getFrameworks({ activeOnly: true }),
        assessmentService.listAssessments({ limit: 5 })
      ]);

      const status = {
        frameworks: {
          total: frameworksResult.frameworks?.length || 0,
          list: frameworksResult.frameworks?.slice(0, 5) || []
        },
        recentAssessments: assessmentsResult.assessments || [],
        overallHealth: this.calculateOverallHealth(assessmentsResult.assessments || [])
      };

      res.json({ success: true, status });
    } catch (error) {
      logger.error('Controller error - getComplianceStatus:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Calculate overall compliance health
   */
  calculateOverallHealth(assessments) {
    if (!assessments.length) {
      return { score: 0, status: 'no-data', message: 'No assessments available' };
    }

    const completedAssessments = assessments.filter(a => a.status === 'completed');
    if (!completedAssessments.length) {
      return { score: 0, status: 'in-progress', message: 'Assessments in progress' };
    }

    const avgScore = completedAssessments.reduce((sum, a) => sum + (a.results?.overallScore || 0), 0) / completedAssessments.length;

    let status;
    if (avgScore >= 90) status = 'excellent';
    else if (avgScore >= 75) status = 'good';
    else if (avgScore >= 50) status = 'needs-improvement';
    else status = 'critical';

    return { 
      score: Math.round(avgScore), 
      status, 
      assessmentCount: completedAssessments.length 
    };
  }
}

module.exports = new AssessmentController();

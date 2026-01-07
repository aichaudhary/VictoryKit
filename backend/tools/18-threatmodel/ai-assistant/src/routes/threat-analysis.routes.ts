import { Router, Request, Response } from 'express';
import { ThreatAnalysisService } from '../services/threat-analysis.service.js';
import { SessionService } from '../services/session.service.js';
import { asyncHandler, requestTimer } from '../middleware/error.middleware.js';
import { strictRateLimitMiddleware } from '../middleware/rate-limit.middleware.js';
import { APIResponse } from '../types.js';

const router = Router();

// Apply common middleware
router.use(requestTimer);
router.use(strictRateLimitMiddleware);

/**
 * POST /api/threat-analysis/analyze
 * Perform threat analysis on components or models
 */
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, analysisType, componentId, context } = req.body;

  if (!sessionId || !analysisType) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sessionId and analysisType are required'
      }
    };
    res.status(400).json(response);
    return;
  }

  // Get services from app locals
  const threatAnalysisService = req.app.locals.threatAnalysisService as ThreatAnalysisService;

  const result = await threatAnalysisService.analyzeThreats({
    type: 'threat_analysis_request',
    sessionId,
    componentId,
    analysisType,
    context: context || {},
    userPrompt: req.body.userPrompt
  });

  const response: APIResponse = {
    success: true,
    data: result,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * POST /api/threat-analysis/component/:componentId
 * Analyze a specific component
 */
router.post('/component/:componentId', asyncHandler(async (req: Request, res: Response) => {
  const { componentId } = req.params;
  const { analysisType } = req.body;

  if (!analysisType) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'analysisType is required'
      }
    };
    res.status(400).json(response);
    return;
  }

  const threatAnalysisService = req.app.locals.threatAnalysisService as ThreatAnalysisService;

  const analysis = await threatAnalysisService.analyzeComponent(componentId, analysisType);

  const response: APIResponse = {
    success: true,
    data: {
      componentId,
      analysis
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * POST /api/threat-analysis/mitigations/:threatId
 * Generate mitigation recommendations for a threat
 */
router.post('/mitigations/:threatId', asyncHandler(async (req: Request, res: Response) => {
  const { threatId } = req.params;

  const threatAnalysisService = req.app.locals.threatAnalysisService as ThreatAnalysisService;

  const recommendations = await threatAnalysisService.generateMitigations(threatId);

  const response: APIResponse = {
    success: true,
    data: {
      threatId,
      recommendations
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * POST /api/threat-analysis/risk
 * Calculate risk assessment
 */
router.post('/risk', asyncHandler(async (req: Request, res: Response) => {
  const { componentIds, threatIds } = req.body;

  const threatAnalysisService = req.app.locals.threatAnalysisService as ThreatAnalysisService;

  const riskAssessment = await threatAnalysisService.calculateRisk(componentIds, threatIds);

  const response: APIResponse = {
    success: true,
    data: riskAssessment,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * POST /api/threat-analysis/chat
 * Process a chat message
 */
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, message, context } = req.body;

  if (!sessionId || !message) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sessionId and message are required'
      }
    };
    res.status(400).json(response);
    return;
  }

  const threatAnalysisService = req.app.locals.threatAnalysisService as ThreatAnalysisService;

  const chatResponse = await threatAnalysisService.processChatMessage(sessionId, message, context);

  const response: APIResponse = {
    success: true,
    data: chatResponse,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * GET /api/threat-analysis/models
 * Get available analysis models
 */
router.get('/models', asyncHandler(async (req: Request, res: Response) => {
  const models = [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      capabilities: ['threat_analysis', 'risk_assessment', 'mitigation_suggestions', 'architecture_review'],
      maxTokens: 4096,
      contextWindow: 200000
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      provider: 'Anthropic',
      capabilities: ['threat_analysis', 'basic_risk_assessment'],
      maxTokens: 4096,
      contextWindow: 200000
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      capabilities: ['threat_analysis', 'risk_assessment', 'mitigation_suggestions', 'architecture_review', 'compliance_check'],
      maxTokens: 4096,
      contextWindow: 200000
    }
  ];

  const response: APIResponse = {
    success: true,
    data: { models },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * GET /api/threat-analysis/frameworks
 * Get available threat modeling frameworks
 */
router.get('/frameworks', asyncHandler(async (req: Request, res: Response) => {
  const frameworks = [
    {
      id: 'stride',
      name: 'STRIDE',
      description: 'Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege',
      categories: ['Spoofing', 'Tampering', 'Repudiation', 'Information_Disclosure', 'Denial_of_Service', 'Elevation_of_Privilege']
    },
    {
      id: 'pasta',
      name: 'PASTA',
      description: 'Process for Attack Simulation and Threat Analysis',
      categories: ['Broken_Access_Control', 'Broken_Authentication', 'Injection', 'Insecure_Design', 'Security_Misconfiguration', 'Insecure_Cryptography', 'Insecure_Communication', 'Insecure_Data_Handling']
    },
    {
      id: 'octave',
      name: 'OCTAVE',
      description: 'Operationally Critical Threat, Asset, and Vulnerability Evaluation',
      categories: ['Information_Asset', 'Process', 'Personnel', 'Technology', 'Physical']
    }
  ];

  const response: APIResponse = {
    success: true,
    data: { frameworks },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

export { router as threatAnalysisRoutes };
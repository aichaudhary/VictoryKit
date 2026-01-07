import { Router, Request, Response } from 'express';
import { SessionService } from '../services/session.service.js';
import { asyncHandler, requestTimer } from '../middleware/error.middleware.js';
import { APIResponse } from '../types.js';

const router = Router();

// Apply common middleware
router.use(requestTimer);

/**
 * POST /api/sessions
 * Create a new AI session
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { modelId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.createOrGetSession(userId, modelId);

  const response: APIResponse = {
    success: true,
    data: {
      session: {
        id: session.id,
        userId: session.userId,
        modelId: session.modelId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        context: {
          preferences: session.context.preferences
        }
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.status(201).json(response);
}));

/**
 * GET /api/sessions
 * Get user's active sessions
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const sessions = await sessionService.getUserSessions(userId);

  const response: APIResponse = {
    success: true,
    data: {
      sessions: sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        modelId: session.modelId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        context: {
          preferences: session.context.preferences,
          messageCount: session.context.conversationHistory?.length || 0
        }
      }))
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
router.get('/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found or expired'
      }
    };
    res.status(404).json(response);
    return;
  }

  if (session.userId !== userId && req.user?.role !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to access this session'
      }
    };
    res.status(403).json(response);
    return;
  }

  const response: APIResponse = {
    success: true,
    data: {
      session: {
        id: session.id,
        userId: session.userId,
        modelId: session.modelId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        context: {
          preferences: session.context.preferences,
          messageCount: session.context.conversationHistory?.length || 0,
          hasModelData: !!session.context.modelData
        }
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * PUT /api/sessions/:sessionId/context
 * Update session context
 */
router.put('/:sessionId/context', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { context } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found or expired'
      }
    };
    res.status(404).json(response);
    return;
  }

  if (session.userId !== userId && req.user?.role !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to modify this session'
      }
    };
    res.status(403).json(response);
    return;
  }

  await sessionService.updateSessionContext(sessionId, context);

  const response: APIResponse = {
    success: true,
    data: {
      message: 'Session context updated successfully'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * GET /api/sessions/:sessionId/history
 * Get conversation history
 */
router.get('/:sessionId/history', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;
  const { limit = 50, offset = 0 } = req.query;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found or expired'
      }
    };
    res.status(404).json(response);
    return;
  }

  if (session.userId !== userId && req.user?.role !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to access this session history'
      }
    };
    res.status(403).json(response);
    return;
  }

  const history = await sessionService.getConversationHistory(sessionId);
  const paginatedHistory = history.slice(
    parseInt(offset as string),
    parseInt(offset as string) + parseInt(limit as string)
  );

  const response: APIResponse = {
    success: true,
    data: {
      sessionId,
      history: paginatedHistory,
      pagination: {
        total: history.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < history.length
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * DELETE /api/sessions/:sessionId/history
 * Clear conversation history
 */
router.delete('/:sessionId/history', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found or expired'
      }
    };
    res.status(404).json(response);
    return;
  }

  if (session.userId !== userId && req.user?.role !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to modify this session'
      }
    };
    res.status(403).json(response);
    return;
  }

  await sessionService.clearConversationHistory(sessionId);

  const response: APIResponse = {
    success: true,
    data: {
      message: 'Conversation history cleared successfully'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * DELETE /api/sessions/:sessionId
 * Delete a session
 */
router.delete('/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      }
    };
    res.status(401).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session not found or expired'
      }
    };
    res.status(404).json(response);
    return;
  }

  if (session.userId !== userId && req.user?.role !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to delete this session'
      }
    };
    res.status(403).json(response);
    return;
  }

  await sessionService.deleteSession(sessionId);

  const response: APIResponse = {
    success: true,
    data: {
      message: 'Session deleted successfully'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

/**
 * GET /api/sessions/stats
 * Get session statistics (admin only)
 */
router.get('/admin/stats', asyncHandler(async (req: Request, res: Response) => {
  const userRole = req.user?.role;

  if (userRole !== 'admin') {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Admin access required'
      }
    };
    res.status(403).json(response);
    return;
  }

  const sessionService = req.app.locals.sessionService as SessionService;

  const stats = sessionService.getSessionStats();

  const response: APIResponse = {
    success: true,
    data: { stats },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown'
    }
  };

  res.json(response);
}));

export { router as sessionRoutes };
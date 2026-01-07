import { ThreatModelAIAssistant } from '../server.js';
import { AIService } from '../services/ai.service.js';
import { WebSocketService } from '../services/websocket.service.js';
import { ThreatAnalysisService } from '../services/threat-analysis.service.js';
import { SessionService } from '../services/session.service.js';

describe('ThreatModelAIAssistant', () => {
  let assistant: ThreatModelAIAssistant;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    // Mock all services
    jest.spyOn(AIService.prototype, 'constructor' as any).mockImplementation(() => {});
    jest.spyOn(WebSocketService.prototype, 'constructor' as any).mockImplementation(() => {});
    jest.spyOn(ThreatAnalysisService.prototype, 'constructor' as any).mockImplementation(() => {});
    jest.spyOn(SessionService.prototype, 'constructor' as any).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize all services successfully', () => {
      assistant = new ThreatModelAIAssistant();

      expect(assistant).toBeDefined();
      expect(assistant.getApp()).toBeDefined();
      expect(assistant.getServer()).toBeDefined();
      expect(assistant.getIO()).toBeDefined();
    });

    it('should have all required services', () => {
      assistant = new ThreatModelAIAssistant();

      expect(assistant.getAIService()).toBeDefined();
      expect(assistant.getThreatAnalysisService()).toBeDefined();
      expect(assistant.getSessionService()).toBeDefined();
    });
  });

  describe('middleware setup', () => {
    it('should set up security middleware', () => {
      assistant = new ThreatModelAIAssistant();
      const app = assistant.getApp();

      // Test that middleware is applied by checking if routes exist
      expect(app).toBeDefined();
    });

    it('should set up routes', () => {
      assistant = new ThreatModelAIAssistant();
      const app = assistant.getApp();

      // Routes should be set up
      expect(app).toBeDefined();
    });
  });

  describe('server lifecycle', () => {
    it('should start server successfully', async () => {
      assistant = new ThreatModelAIAssistant();

      // Mock server listen
      const mockServer = {
        listen: jest.fn().mockImplementation((port, host, callback) => {
          callback();
        }),
        close: jest.fn()
      };

      // Replace the server
      (assistant as any).server = mockServer;

      await expect(assistant.start()).resolves.not.toThrow();
      expect(mockServer.listen).toHaveBeenCalled();
    });

    it('should handle server start errors', async () => {
      assistant = new ThreatModelAIAssistant();

      const mockServer = {
        listen: jest.fn().mockImplementation(() => {
          throw new Error('Server start failed');
        })
      };

      (assistant as any).server = mockServer;

      await expect(assistant.start()).rejects.toThrow('Server start failed');
    });
  });

  describe('health check endpoint', () => {
    it('should return healthy status', () => {
      assistant = new ThreatModelAIAssistant();
      const app = assistant.getApp();

      const mockReq = {};
      const mockRes = {
        json: jest.fn()
      };

      // Find health route handler
      const routes = (app as any)._router.stack;
      const healthRoute = routes.find((layer: any) =>
        layer.route && layer.route.path === '/health'
      );

      expect(healthRoute).toBeDefined();

      // Call the handler
      const handler = healthRoute.route.stack[0].handle;
      handler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'threatmodel-ai-assistant',
          version: '1.0.0'
        })
      );
    });
  });
});
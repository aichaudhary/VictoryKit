import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import {
  WebSocketMessage,
  AISession,
  ThreatAnalysisRequestSchema,
  ThreatAnalysisResponseSchema,
  APIResponse
} from '../types.js';
import { ThreatAnalysisService } from './threat-analysis.service.js';
import { SessionService } from './session.service.js';

export class WebSocketService {
  private io: SocketIOServer;
  private threatAnalysisService: ThreatAnalysisService;
  private sessionService: SessionService;
  private logger: Logger;
  private activeConnections: Map<string, { socket: Socket; session: AISession }> = new Map();

  constructor(
    io: SocketIOServer,
    threatAnalysisService: ThreatAnalysisService,
    sessionService: SessionService,
    logger: Logger
  ) {
    this.io = io;
    this.threatAnalysisService = threatAnalysisService;
    this.sessionService = sessionService;
    this.logger = logger;
  }

  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      this.logger.info('New WebSocket connection', {
        socketId: socket.id,
        ip: socket.handshake.address
      });

      this.handleConnection(socket);
    });

    this.logger.info('WebSocket service initialized');
  }

  private async handleConnection(socket: Socket): Promise<void> {
    try {
      // Authenticate the connection
      const authToken = socket.handshake.auth.token || socket.handshake.query.token;
      if (!authToken || typeof authToken !== 'string') {
        this.logger.warn('WebSocket connection rejected: missing token', {
          socketId: socket.id
        });
        socket.emit('error', {
          type: 'error',
          sessionId: null,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Missing or invalid authentication token'
          }
        });
        socket.disconnect();
        return;
      }

      // Verify JWT token
      const decoded = await this.verifyToken(authToken);
      if (!decoded) {
        socket.emit('error', {
          type: 'error',
          sessionId: null,
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'Invalid authentication token'
          }
        });
        socket.disconnect();
        return;
      }

      // Create or get session
      const session = await this.sessionService.createOrGetSession(decoded.userId);
      this.activeConnections.set(socket.id, { socket, session });

      this.logger.info('WebSocket connection authenticated', {
        socketId: socket.id,
        userId: decoded.userId,
        sessionId: session.id
      });

      // Set up event handlers
      this.setupSocketEventHandlers(socket, session);

      // Send welcome message
      socket.emit('session_sync', {
        type: 'session_sync',
        sessionId: session.id,
        data: {
          message: 'Connected to ThreatModel AI Assistant',
          session: session,
          capabilities: [
            'threat_analysis',
            'mitigation_recommendations',
            'risk_assessment',
            'architecture_review',
            'general_chat'
          ]
        }
      });

    } catch (error) {
      this.logger.error('Error handling WebSocket connection', {
        socketId: socket.id,
        error: error.message
      });
      socket.emit('error', {
        type: 'error',
        sessionId: null,
        error: {
          code: 'CONNECTION_ERROR',
          message: 'Failed to establish connection'
        }
      });
      socket.disconnect();
    }
  }

  private setupSocketEventHandlers(socket: Socket, session: AISession): void {
    // Handle threat analysis requests
    socket.on('threat_analysis_request', async (data: any) => {
      await this.handleThreatAnalysisRequest(socket, session, data);
    });

    // Handle model updates
    socket.on('model_update', async (data: any) => {
      await this.handleModelUpdate(socket, session, data);
    });

    // Handle component analysis requests
    socket.on('component_analysis', async (data: any) => {
      await this.handleComponentAnalysis(socket, session, data);
    });

    // Handle mitigation recommendation requests
    socket.on('mitigation_recommendation', async (data: any) => {
      await this.handleMitigationRecommendation(socket, session, data);
    });

    // Handle risk calculation requests
    socket.on('risk_calculation', async (data: any) => {
      await this.handleRiskCalculation(socket, session, data);
    });

    // Handle general chat messages
    socket.on('chat', async (data: any) => {
      await this.handleChatMessage(socket, session, data);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, session, reason);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      this.logger.error('WebSocket error', {
        socketId: socket.id,
        sessionId: session.id,
        error: error.message
      });
    });
  }

  private async handleThreatAnalysisRequest(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      const request = ThreatAnalysisRequestSchema.parse(data);

      this.logger.info('Processing threat analysis request', {
        sessionId: session.id,
        analysisType: request.analysisType
      });

      // Update session activity
      await this.sessionService.updateSessionActivity(session.id);

      // Process the analysis request
      const result = await this.threatAnalysisService.analyzeThreats(request);

      // Send response
      const response: WebSocketMessage = {
        type: 'threat_analysis_response',
        sessionId: session.id,
        analysisId: uuidv4(),
        results: result.results,
        metadata: result.metadata
      };

      socket.emit('threat_analysis_response', response);

    } catch (error) {
      this.logger.error('Error processing threat analysis request', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'THREAT_ANALYSIS_FAILED',
          message: 'Failed to analyze threats',
          details: error.message
        }
      });
    }
  }

  private async handleModelUpdate(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      // Update session context with model data
      await this.sessionService.updateSessionContext(session.id, {
        modelData: data.modelData,
        lastModelUpdate: new Date()
      });

      this.logger.info('Model data updated in session', {
        sessionId: session.id
      });

      // Acknowledge the update
      socket.emit('model_update_ack', {
        type: 'model_update_ack',
        sessionId: session.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error updating model data', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'MODEL_UPDATE_FAILED',
          message: 'Failed to update model data'
        }
      });
    }
  }

  private async handleComponentAnalysis(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      const { componentId, analysisType } = data;

      this.logger.info('Processing component analysis request', {
        sessionId: session.id,
        componentId,
        analysisType
      });

      // Perform component-specific analysis
      const analysis = await this.threatAnalysisService.analyzeComponent(componentId, analysisType);

      socket.emit('component_analysis_response', {
        type: 'component_analysis_response',
        sessionId: session.id,
        componentId,
        analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error analyzing component', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'COMPONENT_ANALYSIS_FAILED',
          message: 'Failed to analyze component'
        }
      });
    }
  }

  private async handleMitigationRecommendation(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      const { threatId } = data;

      this.logger.info('Processing mitigation recommendation request', {
        sessionId: session.id,
        threatId
      });

      const recommendations = await this.threatAnalysisService.generateMitigations(threatId);

      socket.emit('mitigation_recommendation_response', {
        type: 'mitigation_recommendation_response',
        sessionId: session.id,
        threatId,
        recommendations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error generating mitigation recommendations', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'MITIGATION_RECOMMENDATION_FAILED',
          message: 'Failed to generate mitigation recommendations'
        }
      });
    }
  }

  private async handleRiskCalculation(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      const { componentIds, threatIds } = data;

      this.logger.info('Processing risk calculation request', {
        sessionId: session.id,
        componentIds: componentIds?.length,
        threatIds: threatIds?.length
      });

      const riskAssessment = await this.threatAnalysisService.calculateRisk(componentIds, threatIds);

      socket.emit('risk_calculation_response', {
        type: 'risk_calculation_response',
        sessionId: session.id,
        riskScore: riskAssessment.overallRiskScore,
        breakdown: riskAssessment.riskBreakdown,
        recommendations: riskAssessment.recommendations,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error calculating risk', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'RISK_CALCULATION_FAILED',
          message: 'Failed to calculate risk'
        }
      });
    }
  }

  private async handleChatMessage(
    socket: Socket,
    session: AISession,
    data: any
  ): Promise<void> {
    try {
      const { message, context } = data;

      this.logger.info('Processing chat message', {
        sessionId: session.id,
        messageLength: message?.length
      });

      const response = await this.threatAnalysisService.processChatMessage(session.id, message, context);

      socket.emit('chat_response', {
        type: 'chat_response',
        sessionId: session.id,
        response: response.response,
        suggestions: response.suggestions,
        followUpQuestions: response.followUpQuestions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error processing chat message', {
        sessionId: session.id,
        error: error.message
      });

      socket.emit('error', {
        type: 'error',
        sessionId: session.id,
        error: {
          code: 'CHAT_ERROR',
          message: 'Failed to process chat message'
        }
      });
    }
  }

  private handleDisconnection(socket: Socket, session: AISession, reason: string): void {
    this.logger.info('WebSocket disconnection', {
      socketId: socket.id,
      sessionId: session.id,
      reason
    });

    // Remove from active connections
    this.activeConnections.delete(socket.id);

    // Update session activity
    this.sessionService.updateSessionActivity(session.id, false).catch(error => {
      this.logger.error('Error updating session on disconnect', {
        sessionId: session.id,
        error: error.message
      });
    });
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return decoded;
    } catch (error) {
      this.logger.warn('Token verification failed', { error: error.message });
      return null;
    }
  }

  // Public methods for broadcasting and management
  public broadcastToSession(sessionId: string, event: string, data: any): void {
    // Find all sockets connected to this session
    for (const [socketId, connection] of this.activeConnections) {
      if (connection.session.id === sessionId) {
        connection.socket.emit(event, data);
      }
    }
  }

  public getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }

  public getConnectionsForSession(sessionId: string): Socket[] {
    const connections: Socket[] = [];
    for (const [socketId, connection] of this.activeConnections) {
      if (connection.session.id === sessionId) {
        connections.push(connection.socket);
      }
    }
    return connections;
  }

  // Cleanup method
  public async cleanup(): Promise<void> {
    this.logger.info('Cleaning up WebSocket service');

    // Disconnect all active connections
    for (const [socketId, connection] of this.activeConnections) {
      connection.socket.disconnect(true);
    }

    this.activeConnections.clear();
  }
}
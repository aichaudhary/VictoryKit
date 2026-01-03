/**
 * WebSocket Service for Real-Time Incident Updates
 * Provides live updates for incident management
 */

const socketIO = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.clients = new Map(); // userId -> Set of socket ids
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      console.log(`WebSocket connected: ${socket.id}`);

      // Authenticate and associate with user
      socket.on('authenticate', (data) => {
        const { userId, token } = data;
        // In production, verify token here
        socket.userId = userId;
        
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(socket.id);
        
        socket.join(`user:${userId}`);
        socket.emit('authenticated', { success: true });
      });

      // Join incident room for real-time updates
      socket.on('join-incident', (incidentId) => {
        socket.join(`incident:${incidentId}`);
        socket.emit('joined-incident', { incidentId });
      });

      // Leave incident room
      socket.on('leave-incident', (incidentId) => {
        socket.leave(`incident:${incidentId}`);
      });

      // Subscribe to dashboard updates
      socket.on('subscribe-dashboard', () => {
        if (socket.userId) {
          socket.join(`dashboard:${socket.userId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket disconnected: ${socket.id}`);
        if (socket.userId && this.clients.has(socket.userId)) {
          this.clients.get(socket.userId).delete(socket.id);
          if (this.clients.get(socket.userId).size === 0) {
            this.clients.delete(socket.userId);
          }
        }
      });
    });

    console.log('WebSocket service initialized');
  }

  /**
   * Emit incident created event
   */
  emitIncidentCreated(incident) {
    if (!this.io) return;
    
    // Emit to user's dashboard
    this.io.to(`user:${incident.userId}`).emit('incident:created', {
      type: 'created',
      incident: {
        _id: incident._id,
        incidentId: incident.incidentId,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        createdAt: incident.createdAt
      }
    });

    // Emit to all users for global dashboard (if applicable)
    this.io.emit('incident:new', {
      incidentId: incident.incidentId,
      severity: incident.severity,
      title: incident.title
    });
  }

  /**
   * Emit incident updated event
   */
  emitIncidentUpdated(incident, changes = {}) {
    if (!this.io) return;

    // Emit to incident room
    this.io.to(`incident:${incident._id}`).emit('incident:updated', {
      type: 'updated',
      incidentId: incident.incidentId,
      changes,
      incident: {
        _id: incident._id,
        incidentId: incident.incidentId,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        updatedAt: incident.updatedAt
      }
    });

    // Emit to user's dashboard
    this.io.to(`dashboard:${incident.userId}`).emit('dashboard:update', {
      type: 'incident_updated',
      incidentId: incident.incidentId
    });
  }

  /**
   * Emit timeline event added
   */
  emitTimelineEvent(incidentId, event) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:timeline', {
      type: 'timeline_event',
      event
    });
  }

  /**
   * Emit IOC enrichment results
   */
  emitEnrichmentComplete(incidentId, results) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:enrichment', {
      type: 'enrichment_complete',
      results: {
        enrichedCount: results.length,
        maliciousCount: results.filter(r => r.malicious).length
      }
    });
  }

  /**
   * Emit SIEM search results
   */
  emitSIEMResults(incidentId, results) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:siem', {
      type: 'siem_results',
      eventsFound: results.events?.length || 0,
      sources: results.sources
    });
  }

  /**
   * Emit EDR search results
   */
  emitEDRResults(incidentId, results) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:edr', {
      type: 'edr_results',
      matchCount: results.matches?.length || 0,
      endpointsAffected: results.affectedEndpoints?.length || 0
    });
  }

  /**
   * Emit AI analysis complete
   */
  emitAnalysisComplete(incidentId, analysis) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:analysis', {
      type: 'analysis_complete',
      provider: analysis.provider,
      riskScore: analysis.analysis?.risk_score,
      confidence: analysis.analysis?.confidence
    });
  }

  /**
   * Emit notification sent
   */
  emitNotificationSent(incidentId, channels) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:notification', {
      type: 'notifications_sent',
      channels
    });
  }

  /**
   * Emit containment action
   */
  emitContainmentAction(incidentId, action) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:containment', {
      type: 'containment_action',
      action
    });
  }

  /**
   * Emit ticket created
   */
  emitTicketCreated(incidentId, ticket) {
    if (!this.io) return;

    this.io.to(`incident:${incidentId}`).emit('incident:ticket', {
      type: 'ticket_created',
      system: ticket.system,
      ticketId: ticket.ticketId,
      url: ticket.url
    });
  }

  /**
   * Emit critical alert to all connected users
   */
  emitCriticalAlert(alert) {
    if (!this.io) return;

    this.io.emit('alert:critical', {
      type: 'critical_alert',
      ...alert
    });
  }

  /**
   * Emit dashboard metrics update
   */
  emitDashboardUpdate(userId, metrics) {
    if (!this.io) return;

    this.io.to(`dashboard:${userId}`).emit('dashboard:metrics', {
      type: 'metrics_update',
      metrics
    });
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      totalSockets: Array.from(this.clients.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }
}

module.exports = new WebSocketService();

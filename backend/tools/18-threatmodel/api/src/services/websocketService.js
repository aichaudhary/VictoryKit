/**
 * WebSocket Service - Tool 18 ThreatModel
 * Real-time threat model updates, collaboration, and notifications
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.wss = null;
    this.clients = new Map(); // clientId -> { ws, userId, modelId, rooms }
    this.rooms = new Map(); // roomId -> Set of clientIds
    this.threatModelSubscriptions = new Map(); // modelId -> Set of clientIds
    this.heartbeatInterval = parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000;
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0
    };
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws/threatmodel'
    });

    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));

    // Heartbeat to detect stale connections
    this.startHeartbeat();

    console.log('🔌 ThreatModel WebSocket server initialized');
    return this.wss;
  }

  // Initialize standalone WebSocket server
  initializeStandalone(port = 4118) {
    this.wss = new WebSocket.Server({ port });

    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    this.startHeartbeat();

    console.log(`🔌 ThreatModel WebSocket server running on port ${port}`);
    return this.wss;
  }

  // Handle new WebSocket connection
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const userId = urlParams.get('userId') || 'anonymous';
    const modelId = urlParams.get('modelId');

    // Store client
    this.clients.set(clientId, {
      ws,
      userId,
      modelId,
      rooms: new Set(),
      isAlive: true,
      connectedAt: new Date()
    });

    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    // Auto-subscribe to threat model if modelId provided
    if (modelId) {
      this.subscribeToModel(clientId, modelId);
    }

    // Handle messages
    ws.on('message', (data) => this.handleMessage(clientId, data));

    // Handle pong for heartbeat
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) client.isAlive = true;
    });

    // Handle close
    ws.on('close', () => this.handleDisconnect(clientId));

    // Handle error
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
      this.metrics.errors++;
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to ThreatModel real-time service'
    });

    console.log(`🔗 Client ${clientId} connected (user: ${userId})`);
  }

  // Handle incoming messages
  handleMessage(clientId, data) {
    this.metrics.messagesReceived++;
    
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message);
          break;

        case 'threat_update':
          this.handleThreatUpdate(clientId, message);
          break;

        case 'model_update':
          this.handleModelUpdate(clientId, message);
          break;

        case 'component_update':
          this.handleComponentUpdate(clientId, message);
          break;

        case 'mitigation_update':
          this.handleMitigationUpdate(clientId, message);
          break;

        case 'collaboration_cursor':
          this.handleCollaborationCursor(clientId, message);
          break;

        case 'collaboration_selection':
          this.handleCollaborationSelection(clientId, message);
          break;

        case 'chat_message':
          this.handleChatMessage(clientId, message);
          break;

        case 'analysis_start':
          this.handleAnalysisStart(clientId, message);
          break;

        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
          break;

        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.sendToClient(clientId, {
        type: 'error',
        error: 'Invalid message format'
      });
    }
  }

  // Handle subscription requests
  handleSubscribe(clientId, message) {
    const { modelId, room } = message;

    if (modelId) {
      this.subscribeToModel(clientId, modelId);
    }

    if (room) {
      this.joinRoom(clientId, room);
    }

    this.sendToClient(clientId, {
      type: 'subscribed',
      modelId,
      room,
      timestamp: new Date().toISOString()
    });
  }

  // Handle unsubscription
  handleUnsubscribe(clientId, message) {
    const { modelId, room } = message;

    if (modelId) {
      this.unsubscribeFromModel(clientId, modelId);
    }

    if (room) {
      this.leaveRoom(clientId, room);
    }
  }

  // Subscribe to threat model updates
  subscribeToModel(clientId, modelId) {
    if (!this.threatModelSubscriptions.has(modelId)) {
      this.threatModelSubscriptions.set(modelId, new Set());
    }
    this.threatModelSubscriptions.get(modelId).add(clientId);

    const client = this.clients.get(clientId);
    if (client) {
      client.modelId = modelId;
    }

    console.log(`📌 Client ${clientId} subscribed to model ${modelId}`);
  }

  // Unsubscribe from threat model
  unsubscribeFromModel(clientId, modelId) {
    const subscribers = this.threatModelSubscriptions.get(modelId);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.threatModelSubscriptions.delete(modelId);
      }
    }
  }

  // Join collaboration room
  joinRoom(clientId, roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(clientId);

    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.add(roomId);
    }

    // Notify room members
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      clientId,
      userId: client?.userId,
      roomId,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  // Leave room
  leaveRoom(clientId, roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    const client = this.clients.get(clientId);
    if (client) {
      client.rooms.delete(roomId);

      // Notify room members
      this.broadcastToRoom(roomId, {
        type: 'user_left',
        clientId,
        userId: client.userId,
        roomId,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Handle threat updates
  handleThreatUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, threatId, action, data } = message;

    // Broadcast to all subscribers of this model
    this.broadcastToModelSubscribers(modelId, {
      type: 'threat_updated',
      modelId,
      threatId,
      action, // 'create', 'update', 'delete'
      data,
      updatedBy: client?.userId,
      timestamp: new Date().toISOString()
    }, clientId);

    this.emit('threat:update', { modelId, threatId, action, data, userId: client?.userId });
  }

  // Handle model updates
  handleModelUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, action, data } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'model_updated',
      modelId,
      action,
      data,
      updatedBy: client?.userId,
      timestamp: new Date().toISOString()
    }, clientId);

    this.emit('model:update', { modelId, action, data, userId: client?.userId });
  }

  // Handle component updates
  handleComponentUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, componentId, action, data } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'component_updated',
      modelId,
      componentId,
      action,
      data,
      updatedBy: client?.userId,
      timestamp: new Date().toISOString()
    }, clientId);

    this.emit('component:update', { modelId, componentId, action, data, userId: client?.userId });
  }

  // Handle mitigation updates
  handleMitigationUpdate(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, mitigationId, action, data } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'mitigation_updated',
      modelId,
      mitigationId,
      action,
      data,
      updatedBy: client?.userId,
      timestamp: new Date().toISOString()
    }, clientId);

    this.emit('mitigation:update', { modelId, mitigationId, action, data, userId: client?.userId });
  }

  // Handle real-time collaboration cursor
  handleCollaborationCursor(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, position, element } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'cursor_moved',
      clientId,
      userId: client?.userId,
      position,
      element,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  // Handle collaboration selection
  handleCollaborationSelection(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, selection } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'selection_changed',
      clientId,
      userId: client?.userId,
      selection,
      timestamp: new Date().toISOString()
    }, clientId);
  }

  // Handle chat messages
  handleChatMessage(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, text } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'chat_message',
      clientId,
      userId: client?.userId,
      text,
      timestamp: new Date().toISOString()
    });
  }

  // Handle analysis start notification
  handleAnalysisStart(clientId, message) {
    const client = this.clients.get(clientId);
    const { modelId, analysisType } = message;

    this.broadcastToModelSubscribers(modelId, {
      type: 'analysis_started',
      modelId,
      analysisType,
      startedBy: client?.userId,
      timestamp: new Date().toISOString()
    });

    this.emit('analysis:start', { modelId, analysisType, userId: client?.userId });
  }

  // Handle client disconnect
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);

    if (client) {
      // Leave all rooms
      for (const roomId of client.rooms) {
        this.leaveRoom(clientId, roomId);
      }

      // Unsubscribe from all models
      for (const [modelId, subscribers] of this.threatModelSubscriptions) {
        subscribers.delete(clientId);
      }

      // Notify collaborators
      if (client.modelId) {
        this.broadcastToModelSubscribers(client.modelId, {
          type: 'user_disconnected',
          clientId,
          userId: client.userId,
          timestamp: new Date().toISOString()
        });
      }

      this.clients.delete(clientId);
      this.metrics.activeConnections--;

      console.log(`🔌 Client ${clientId} disconnected`);
    }
  }

  // ============ Broadcasting Methods ============

  // Send to specific client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      this.metrics.messagesSent++;
    }
  }

  // Broadcast to all model subscribers
  broadcastToModelSubscribers(modelId, message, excludeClientId = null) {
    const subscribers = this.threatModelSubscriptions.get(modelId);
    if (subscribers) {
      for (const clientId of subscribers) {
        if (clientId !== excludeClientId) {
          this.sendToClient(clientId, message);
        }
      }
    }
  }

  // Broadcast to room
  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    if (room) {
      for (const clientId of room) {
        if (clientId !== excludeClientId) {
          this.sendToClient(clientId, message);
        }
      }
    }
  }

  // Broadcast to all clients
  broadcastToAll(message, excludeClientId = null) {
    for (const [clientId] of this.clients) {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    }
  }

  // ============ Notification Methods ============

  // Notify new threat detected
  notifyNewThreat(modelId, threat) {
    this.broadcastToModelSubscribers(modelId, {
      type: 'new_threat_detected',
      modelId,
      threat: {
        id: threat._id,
        name: threat.name,
        category: threat.category,
        riskLevel: threat.riskLevel,
        severity: threat.severity
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notify critical threat
  notifyCriticalThreat(modelId, threat) {
    this.broadcastToModelSubscribers(modelId, {
      type: 'critical_threat_alert',
      priority: 'critical',
      modelId,
      threat: {
        id: threat._id,
        name: threat.name,
        category: threat.category,
        description: threat.description
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notify analysis complete
  notifyAnalysisComplete(modelId, analysisType, results) {
    this.broadcastToModelSubscribers(modelId, {
      type: 'analysis_complete',
      modelId,
      analysisType,
      summary: {
        totalThreats: results.totalThreats || 0,
        criticalThreats: results.criticalThreats || 0,
        riskScore: results.riskScore || 0,
        recommendations: results.recommendations?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notify mitigation status change
  notifyMitigationStatus(modelId, mitigation, newStatus) {
    this.broadcastToModelSubscribers(modelId, {
      type: 'mitigation_status_changed',
      modelId,
      mitigation: {
        id: mitigation._id,
        name: mitigation.name,
        status: newStatus
      },
      timestamp: new Date().toISOString()
    });
  }

  // ============ Utility Methods ============

  // Generate unique client ID
  generateClientId() {
    return `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start heartbeat to detect stale connections
  startHeartbeat() {
    setInterval(() => {
      for (const [clientId, client] of this.clients) {
        if (!client.isAlive) {
          console.log(`💔 Client ${clientId} timed out`);
          client.ws.terminate();
          this.handleDisconnect(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      }
    }, this.heartbeatInterval);
  }

  // Get connection metrics
  getMetrics() {
    return {
      ...this.metrics,
      currentClients: this.clients.size,
      activeRooms: this.rooms.size,
      modelSubscriptions: this.threatModelSubscriptions.size
    };
  }

  // Get clients for a model
  getModelClients(modelId) {
    const subscribers = this.threatModelSubscriptions.get(modelId);
    if (!subscribers) return [];

    return Array.from(subscribers).map(clientId => {
      const client = this.clients.get(clientId);
      return {
        clientId,
        userId: client?.userId,
        connectedAt: client?.connectedAt
      };
    });
  }

  // Close WebSocket server
  close() {
    if (this.wss) {
      for (const [clientId, client] of this.clients) {
        client.ws.close(1000, 'Server shutting down');
      }
      this.wss.close();
      console.log('🔌 ThreatModel WebSocket server closed');
    }
  }
}

// Singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;

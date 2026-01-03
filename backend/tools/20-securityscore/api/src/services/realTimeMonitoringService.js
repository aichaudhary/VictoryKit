/**
 * Real-time Monitoring Service - WebSocket-based live score updates
 * Manages live connections, score alerts, and collaborative sessions
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class RealTimeMonitoringService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.sessions = new Map();
    this.scoreSubscriptions = new Map();
    this.alertThresholds = new Map();
    this.initialized = false;
  }

  initialize(server) {
    const wsPort = parseInt(process.env.WEBSOCKET_PORT) || 4120;
    const wsPath = process.env.WEBSOCKET_PATH || '/ws';

    this.wss = new WebSocket.Server({
      server,
      path: wsPath,
      maxPayload: parseInt(process.env.WEBSOCKET_MESSAGE_SIZE_LIMIT) || 1048576
    });

    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    
    // Start heartbeat check
    this.startHeartbeat();
    
    // Start score monitoring
    this.startScoreMonitoring();

    this.initialized = true;
    console.log('Real-time Monitoring Service initialized');
  }

  handleConnection(ws, req) {
    const clientId = uuidv4();
    const clientInfo = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      alerts: new Set(),
      connectedAt: new Date(),
      lastActivity: new Date(),
      isAlive: true
    };

    this.clients.set(clientId, clientInfo);
    console.log(`Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
      features: {
        scoreUpdates: true,
        alerts: true,
        collaboration: true,
        benchmarks: true
      }
    });

    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnect(clientId));
    ws.on('error', (error) => console.error(`Client ${clientId} error:`, error.message));
    ws.on('pong', () => { clientInfo.isAlive = true; });
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe_score':
          this.subscribeToScore(clientId, message.data);
          break;
        case 'unsubscribe_score':
          this.unsubscribeFromScore(clientId, message.data);
          break;
        case 'set_alert':
          this.setAlert(clientId, message.data);
          break;
        case 'remove_alert':
          this.removeAlert(clientId, message.data);
          break;
        case 'join_session':
          this.joinSession(clientId, message.data);
          break;
        case 'leave_session':
          this.leaveSession(clientId, message.data);
          break;
        case 'session_message':
          this.broadcastToSession(clientId, message.data);
          break;
        case 'request_score_update':
          this.sendScoreUpdate(clientId);
          break;
        case 'request_benchmarks':
          this.sendBenchmarkUpdate(clientId, message.data);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error.message);
      this.sendToClient(clientId, { type: 'error', message: 'Invalid message format' });
    }
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.participants.has(clientId)) {
        this.leaveSession(clientId, { sessionId });
      }
    });

    // Remove subscriptions
    client.subscriptions.forEach(sub => {
      const subs = this.scoreSubscriptions.get(sub);
      if (subs) subs.delete(clientId);
    });

    // Remove alerts
    client.alerts.forEach(alertId => {
      this.alertThresholds.delete(alertId);
    });

    this.clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }

  subscribeToScore(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { scoreId, entityType = 'organization' } = data;
    const subscriptionKey = `${entityType}:${scoreId || 'default'}`;

    if (!this.scoreSubscriptions.has(subscriptionKey)) {
      this.scoreSubscriptions.set(subscriptionKey, new Set());
    }
    this.scoreSubscriptions.get(subscriptionKey).add(clientId);
    client.subscriptions.add(subscriptionKey);

    this.sendToClient(clientId, {
      type: 'subscribed',
      subscription: subscriptionKey,
      timestamp: new Date().toISOString()
    });

    // Send initial score data
    this.sendScoreUpdate(clientId);
  }

  unsubscribeFromScore(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { scoreId, entityType = 'organization' } = data;
    const subscriptionKey = `${entityType}:${scoreId || 'default'}`;

    const subs = this.scoreSubscriptions.get(subscriptionKey);
    if (subs) subs.delete(clientId);
    client.subscriptions.delete(subscriptionKey);

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      subscription: subscriptionKey,
      timestamp: new Date().toISOString()
    });
  }

  setAlert(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { scoreId, threshold, condition = 'below', category = 'overall' } = data;
    const alertId = uuidv4();

    this.alertThresholds.set(alertId, {
      clientId,
      scoreId,
      threshold,
      condition,
      category,
      createdAt: new Date()
    });

    client.alerts.add(alertId);

    this.sendToClient(clientId, {
      type: 'alert_set',
      alertId,
      threshold,
      condition,
      category,
      timestamp: new Date().toISOString()
    });
  }

  removeAlert(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { alertId } = data;
    this.alertThresholds.delete(alertId);
    client.alerts.delete(alertId);

    this.sendToClient(clientId, {
      type: 'alert_removed',
      alertId,
      timestamp: new Date().toISOString()
    });
  }

  joinSession(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { sessionId, userName = 'Anonymous' } = data;
    
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        participants: new Map(),
        createdAt: new Date(),
        messages: []
      });
    }

    const session = this.sessions.get(sessionId);
    session.participants.set(clientId, { userName, joinedAt: new Date() });

    // Notify all participants
    this.broadcastToSession(clientId, {
      type: 'user_joined',
      sessionId,
      userId: clientId,
      userName,
      participants: Array.from(session.participants.entries()).map(([id, info]) => ({
        id,
        userName: info.userName
      }))
    }, true);
  }

  leaveSession(clientId, data) {
    const { sessionId } = data;
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(clientId);
    session.participants.delete(clientId);

    // Notify remaining participants
    session.participants.forEach((_, participantId) => {
      this.sendToClient(participantId, {
        type: 'user_left',
        sessionId,
        userId: clientId,
        userName: participant?.userName,
        timestamp: new Date().toISOString()
      });
    });

    // Clean up empty sessions
    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
    }
  }

  broadcastToSession(clientId, data, includeSender = false) {
    const { sessionId, message, type = 'session_message' } = data;
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const client = this.clients.get(clientId);
    const senderName = session.participants.get(clientId)?.userName || 'Unknown';

    const broadcastMessage = {
      type,
      sessionId,
      senderId: clientId,
      senderName,
      message,
      timestamp: new Date().toISOString()
    };

    session.messages.push(broadcastMessage);

    session.participants.forEach((_, participantId) => {
      if (includeSender || participantId !== clientId) {
        this.sendToClient(participantId, broadcastMessage);
      }
    });
  }

  async sendScoreUpdate(clientId) {
    // Simulated score data (would come from database)
    const scoreData = {
      type: 'score_update',
      score: {
        overall: Math.floor(Math.random() * 20) + 70,
        grade: 'B',
        categories: {
          network: Math.floor(Math.random() * 15) + 75,
          endpoint: Math.floor(Math.random() * 15) + 70,
          identity: Math.floor(Math.random() * 15) + 72,
          data: Math.floor(Math.random() * 15) + 68,
          application: Math.floor(Math.random() * 15) + 73,
          cloud: Math.floor(Math.random() * 15) + 65,
          compliance: Math.floor(Math.random() * 15) + 78
        },
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.sendToClient(clientId, scoreData);
  }

  async sendBenchmarkUpdate(clientId, data) {
    const { industry = 'technology' } = data || {};
    
    const benchmarkData = {
      type: 'benchmark_update',
      industry,
      benchmarks: {
        average: 72,
        median: 70,
        top25: 85,
        bottom25: 58,
        yourPercentile: 68
      },
      timestamp: new Date().toISOString()
    };

    this.sendToClient(clientId, benchmarkData);
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error.message);
    }
  }

  broadcastScoreChange(scoreData) {
    const { entityType = 'organization', scoreId = 'default' } = scoreData;
    const subscriptionKey = `${entityType}:${scoreId}`;

    const subscribers = this.scoreSubscriptions.get(subscriptionKey);
    if (!subscribers) return;

    const message = {
      type: 'score_changed',
      ...scoreData,
      timestamp: new Date().toISOString()
    };

    subscribers.forEach(clientId => {
      this.sendToClient(clientId, message);
    });

    // Check alerts
    this.checkAlerts(scoreData);
  }

  checkAlerts(scoreData) {
    this.alertThresholds.forEach((alert, alertId) => {
      const value = alert.category === 'overall' 
        ? scoreData.score 
        : scoreData.categories?.[alert.category];

      if (value === undefined) return;

      let triggered = false;
      if (alert.condition === 'below' && value < alert.threshold) triggered = true;
      if (alert.condition === 'above' && value > alert.threshold) triggered = true;
      if (alert.condition === 'equals' && value === alert.threshold) triggered = true;

      if (triggered) {
        this.sendToClient(alert.clientId, {
          type: 'alert_triggered',
          alertId,
          category: alert.category,
          threshold: alert.threshold,
          condition: alert.condition,
          currentValue: value,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  startHeartbeat() {
    setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          client.ws.terminate();
          this.handleDisconnect(clientId);
          return;
        }
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000);
  }

  startScoreMonitoring() {
    // Simulate periodic score updates
    setInterval(() => {
      this.scoreSubscriptions.forEach((subscribers, subscriptionKey) => {
        if (subscribers.size > 0) {
          const [entityType, scoreId] = subscriptionKey.split(':');
          this.broadcastScoreChange({
            entityType,
            scoreId,
            score: Math.floor(Math.random() * 20) + 70,
            change: (Math.random() - 0.5) * 2
          });
        }
      });
    }, 60000); // Every minute
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      activeSessions: this.sessions.size,
      activeSubscriptions: this.scoreSubscriptions.size,
      activeAlerts: this.alertThresholds.size,
      uptime: process.uptime()
    };
  }

  shutdown() {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, {
        type: 'server_shutdown',
        message: 'Server is shutting down',
        timestamp: new Date().toISOString()
      });
      client.ws.close();
    });
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = new RealTimeMonitoringService();

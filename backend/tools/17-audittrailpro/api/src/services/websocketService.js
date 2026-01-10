/**
 * AuditTrailPro - WebSocket Service
 * Real-time audit event streaming
 */

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // clientId -> { ws, subscriptions }
  }

  initialize(server) {
    const WebSocket = require('ws');
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      this.clients.set(clientId, {
        ws,
        subscriptions: new Set(['all']),
        connectedAt: new Date(),
        ip: req.socket.remoteAddress
      });

      console.log(`📡 WebSocket client connected: ${clientId}`);

      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      }));

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (e) {
          console.error('WS message parse error:', e.message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`📡 WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WS error for ${clientId}:`, error.message);
      });
    });

    console.log('✅ WebSocket server initialized');
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.action) {
      case 'subscribe':
        if (data.topic) {
          client.subscriptions.add(data.topic);
          client.ws.send(JSON.stringify({
            type: 'subscribed',
            topic: data.topic
          }));
        }
        break;

      case 'unsubscribe':
        if (data.topic) {
          client.subscriptions.delete(data.topic);
          client.ws.send(JSON.stringify({
            type: 'unsubscribed',
            topic: data.topic
          }));
        }
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }

  // Broadcast new audit event to all subscribers
  broadcastEvent(event) {
    const message = JSON.stringify({
      type: 'audit-event',
      topic: 'events',
      data: event,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.subscriptions.has('all') || client.subscriptions.has('events') || 
          client.subscriptions.has(event.eventType)) {
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          client.ws.send(message);
        }
      }
    });
  }

  // Broadcast alert to subscribers
  broadcastAlert(alert) {
    const message = JSON.stringify({
      type: 'alert',
      topic: 'alerts',
      data: alert,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.subscriptions.has('all') || client.subscriptions.has('alerts')) {
        if (client.ws.readyState === 1) {
          client.ws.send(message);
        }
      }
    });
  }

  // Broadcast stats update
  broadcastStats(stats) {
    const message = JSON.stringify({
      type: 'stats-update',
      topic: 'stats',
      data: stats,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client) => {
      if (client.subscriptions.has('all') || client.subscriptions.has('stats')) {
        if (client.ws.readyState === 1) {
          client.ws.send(message);
        }
      }
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  getClientInfo() {
    const info = [];
    this.clients.forEach((client, id) => {
      info.push({
        id,
        subscriptions: Array.from(client.subscriptions),
        connectedAt: client.connectedAt,
        ip: client.ip
      });
    });
    return info;
  }
}

module.exports = new WebSocketService();

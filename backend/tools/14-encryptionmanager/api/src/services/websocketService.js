/**
 * WebSocket Service
 * Real-time updates for encryption operations and key events
 */

const WebSocket = require("ws");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.stats = {
      totalConnections: 0,
      currentConnections: 0,
      messagesSent: 0,
      startedAt: null
    };
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: "/ws" });
    this.stats.startedAt = new Date().toISOString();

    this.wss.on("connection", (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, { ws, connectedAt: new Date(), subscriptions: new Set() });
      this.stats.totalConnections++;
      this.stats.currentConnections++;

      console.log(`[WebSocket] Client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: "connection",
        status: "connected",
        clientId,
        timestamp: new Date().toISOString()
      });

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error("[WebSocket] Invalid message:", error.message);
        }
      });

      ws.on("close", () => {
        this.clients.delete(clientId);
        this.stats.currentConnections--;
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      ws.on("error", (error) => {
        console.error(`[WebSocket] Error for ${clientId}:`, error.message);
      });
    });

    console.log("[WebSocket] Service initialized on /ws");
  }

  generateClientId() {
    return `enc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case "subscribe":
        if (message.channel) {
          client.subscriptions.add(message.channel);
          this.sendToClient(clientId, {
            type: "subscribed",
            channel: message.channel,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case "unsubscribe":
        if (message.channel) {
          client.subscriptions.delete(message.channel);
          this.sendToClient(clientId, {
            type: "unsubscribed",
            channel: message.channel,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case "ping":
        this.sendToClient(clientId, { type: "pong", timestamp: new Date().toISOString() });
        break;
    }
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
      this.stats.messagesSent++;
    }
  }

  broadcast(data, channel = null) {
    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (!channel || client.subscriptions.has(channel)) {
          client.ws.send(message);
          this.stats.messagesSent++;
        }
      }
    });
  }

  // ==========================================
  // Event Emitters
  // ==========================================
  
  emitKeyCreated(key) {
    this.broadcast({
      type: "key.created",
      data: {
        id: key._id,
        name: key.name,
        algorithm: key.algorithm,
        provider: key.provider,
        status: key.status
      }
    }, "keys");
  }

  emitKeyRotated(key) {
    this.broadcast({
      type: "key.rotated",
      data: {
        id: key._id,
        name: key.name,
        version: key.version,
        rotatedAt: key.lastRotatedAt
      }
    }, "keys");
  }

  emitKeyDeleted(keyId, keyName) {
    this.broadcast({
      type: "key.deleted",
      data: { id: keyId, name: keyName }
    }, "keys");
  }

  emitKeyStatusChanged(key) {
    this.broadcast({
      type: "key.statusChanged",
      data: {
        id: key._id,
        name: key.name,
        status: key.status,
        previousStatus: key._previousStatus
      }
    }, "keys");
  }

  emitEncryptionOperation(operation, keyId, keyName, success) {
    this.broadcast({
      type: "encryption.operation",
      data: {
        operation,
        keyId,
        keyName,
        success,
        timestamp: new Date().toISOString()
      }
    }, "operations");
  }

  emitCertificateCreated(cert) {
    this.broadcast({
      type: "certificate.created",
      data: {
        id: cert._id,
        name: cert.name,
        commonName: cert.commonName,
        provider: cert.provider,
        validTo: cert.validTo
      }
    }, "certificates");
  }

  emitCertificateExpiring(cert, daysUntilExpiry) {
    this.broadcast({
      type: "certificate.expiring",
      data: {
        id: cert._id,
        name: cert.name,
        commonName: cert.commonName,
        daysUntilExpiry,
        validTo: cert.validTo
      }
    }, "certificates");
  }

  emitAlert(alert) {
    this.broadcast({
      type: "alert",
      data: alert
    }, "alerts");
  }

  emitDashboardUpdate(stats) {
    this.broadcast({
      type: "dashboard.update",
      data: stats
    }, "dashboard");
  }

  // ==========================================
  // Stats
  // ==========================================
  
  getStats() {
    return {
      ...this.stats,
      uptime: this.stats.startedAt 
        ? Math.floor((Date.now() - new Date(this.stats.startedAt).getTime()) / 1000)
        : 0
    };
  }

  getConnectedClients() {
    const clients = [];
    this.clients.forEach((client, id) => {
      clients.push({
        id,
        connectedAt: client.connectedAt,
        subscriptions: Array.from(client.subscriptions)
      });
    });
    return clients;
  }
}

module.exports = new WebSocketService();

/**
 * WebSocket Service
 * Handles real-time communication for network monitoring
 */

const WebSocket = require("ws");
const { NetworkDevice, NetworkAlert, TrafficLog } = require("../models");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of clientId -> ws
    this.subscriptions = new Map(); // Map of topic -> Set of clientIds
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: "/ws" });

    this.wss.on("connection", (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.send(ws, {
        type: "connected",
        clientId,
        message: "Connected to NetworkForensics WebSocket"
      });

      // Handle incoming messages
      ws.on("message", (data) => {
        this.handleMessage(clientId, ws, data);
      });

      // Handle disconnect
      ws.on("close", () => {
        this.handleDisconnect(clientId);
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error(`WebSocket error for ${clientId}:`, error.message);
      });
    });

    console.log("WebSocket server initialized");
  }

  // Generate unique client ID
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Handle incoming messages
  handleMessage(clientId, ws, data) {
    try {
      const message = JSON.parse(data);

      switch (message.action) {
        case "subscribe":
          this.subscribe(clientId, message.topic);
          this.send(ws, { type: "subscribed", topic: message.topic });
          break;

        case "unsubscribe":
          this.unsubscribe(clientId, message.topic);
          this.send(ws, { type: "unsubscribed", topic: message.topic });
          break;

        case "ping":
          this.send(ws, { type: "pong", timestamp: Date.now() });
          break;

        case "getStatus":
          this.sendStatus(ws);
          break;

        default:
          this.send(ws, { type: "error", message: "Unknown action" });
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error.message);
      this.send(ws, { type: "error", message: "Invalid message format" });
    }
  }

  // Handle client disconnect
  handleDisconnect(clientId) {
    console.log(`WebSocket client disconnected: ${clientId}`);
    
    // Remove from clients
    this.clients.delete(clientId);

    // Remove from all subscriptions
    this.subscriptions.forEach((clients, topic) => {
      clients.delete(clientId);
    });
  }

  // Subscribe client to topic
  subscribe(clientId, topic) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic).add(clientId);
  }

  // Unsubscribe client from topic
  unsubscribe(clientId, topic) {
    const subscribers = this.subscriptions.get(topic);
    if (subscribers) {
      subscribers.delete(clientId);
    }
  }

  // Send message to specific client
  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Broadcast to all clients
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Broadcast to topic subscribers
  broadcastToTopic(topic, data) {
    const subscribers = this.subscriptions.get(topic);
    if (!subscribers) return;

    const message = JSON.stringify({ topic, ...data });
    subscribers.forEach((clientId) => {
      const ws = this.clients.get(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Send current status
  async sendStatus(ws) {
    const [deviceCount, alertCount] = await Promise.all([
      NetworkDevice.countDocuments({ status: { $ne: "decommissioned" } }),
      NetworkAlert.countDocuments({ resolved: false })
    ]);

    this.send(ws, {
      type: "status",
      data: {
        devices: deviceCount,
        openAlerts: alertCount,
        timestamp: new Date()
      }
    });
  }

  // Notify device status change
  notifyDeviceStatusChange(device) {
    this.broadcastToTopic("devices", {
      type: "deviceStatus",
      data: {
        deviceId: device._id,
        name: device.name,
        ip: device.ip,
        status: device.status,
        timestamp: new Date()
      }
    });
  }

  // Notify new alert
  notifyNewAlert(alert) {
    this.broadcastToTopic("alerts", {
      type: "newAlert",
      data: {
        alertId: alert._id,
        title: alert.title,
        severity: alert.severity,
        type: alert.type,
        source: alert.source,
        timestamp: alert.timestamp
      }
    });

    // Also broadcast to all for critical alerts
    if (["high", "critical"].includes(alert.severity)) {
      this.broadcast({
        type: "criticalAlert",
        data: {
          alertId: alert._id,
          title: alert.title,
          severity: alert.severity
        }
      });
    }
  }

  // Notify alert update
  notifyAlertUpdate(alert) {
    this.broadcastToTopic("alerts", {
      type: "alertUpdate",
      data: {
        alertId: alert._id,
        status: alert.status,
        resolved: alert.resolved,
        timestamp: new Date()
      }
    });
  }

  // Send metrics update
  sendMetricsUpdate(deviceId, metrics) {
    this.broadcastToTopic("metrics", {
      type: "metricsUpdate",
      data: {
        deviceId,
        metrics,
        timestamp: new Date()
      }
    });
  }

  // Send traffic update
  sendTrafficUpdate(trafficData) {
    this.broadcastToTopic("traffic", {
      type: "trafficUpdate",
      data: trafficData
    });
  }

  // Send bandwidth summary
  sendBandwidthSummary(bandwidth) {
    this.broadcastToTopic("bandwidth", {
      type: "bandwidthSummary",
      data: bandwidth
    });
  }

  // Get connected clients count
  getClientCount() {
    return this.clients.size;
  }

  // Get subscription info
  getSubscriptionInfo() {
    const info = {};
    this.subscriptions.forEach((clients, topic) => {
      info[topic] = clients.size;
    });
    return info;
  }

  // Cleanup
  cleanup() {
    if (this.wss) {
      this.wss.clients.forEach((ws) => {
        ws.close();
      });
      this.wss.close();
    }
    this.clients.clear();
    this.subscriptions.clear();
  }
}

module.exports = new WebSocketService();

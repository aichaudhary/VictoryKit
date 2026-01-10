/**
 * BotMitigation WebSocket Server
 * Real-time bot detection events and monitoring
 */

const WebSocket = require("ws");

let wss = null;

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(server) {
  wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("🔌 New WebSocket client connected");

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to BotMitigation real-time monitoring",
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(ws, data);
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          })
        );
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      console.log("🔌 WebSocket client disconnected");
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Heartbeat to keep connections alive
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

/**
 * Handle messages from clients
 */
function handleClientMessage(ws, data) {
  switch (data.type) {
    case "subscribe":
      ws.subscriptions = ws.subscriptions || new Set();
      ws.subscriptions.add(data.channel);
      ws.send(
        JSON.stringify({
          type: "subscribed",
          channel: data.channel,
          timestamp: new Date().toISOString(),
        })
      );
      break;

    case "unsubscribe":
      if (ws.subscriptions) {
        ws.subscriptions.delete(data.channel);
      }
      ws.send(
        JSON.stringify({
          type: "unsubscribed",
          channel: data.channel,
          timestamp: new Date().toISOString(),
        })
      );
      break;

    case "ping":
      ws.send(
        JSON.stringify({
          type: "pong",
          timestamp: new Date().toISOString(),
        })
      );
      break;

    default:
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Unknown message type: ${data.type}`,
        })
      );
  }
}

/**
 * Broadcast event to all connected clients
 */
function broadcast(event) {
  if (!wss) return;

  const message = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Check if client is subscribed to this channel
      if (event.channel && client.subscriptions) {
        if (client.subscriptions.has(event.channel) || client.subscriptions.has("all")) {
          client.send(message);
        }
      } else {
        client.send(message);
      }
    }
  });
}

/**
 * Broadcast bot detection event
 */
function broadcastBotDetection(detection) {
  broadcast({
    type: "bot_detected",
    channel: "detections",
    data: {
      id: detection._id || detection.id,
      ipAddress: detection.identification?.ipAddress,
      userAgent: detection.identification?.userAgent,
      classification: detection.classification?.type,
      category: detection.classification?.category,
      confidence: detection.classification?.confidence,
      botScore: detection.detection?.score,
      action: detection.action?.current,
      method: detection.detection?.method,
      country: detection.identification?.geo?.country,
    },
  });
}

/**
 * Broadcast traffic update
 */
function broadcastTrafficUpdate(stats) {
  broadcast({
    type: "traffic_update",
    channel: "traffic",
    data: stats,
  });
}

/**
 * Broadcast challenge event
 */
function broadcastChallengeEvent(challenge) {
  broadcast({
    type: "challenge_event",
    channel: "challenges",
    data: {
      id: challenge._id || challenge.id,
      type: challenge.type,
      status: challenge.status,
      ipAddress: challenge.ipAddress,
      result: challenge.result,
    },
  });
}

/**
 * Broadcast alert
 */
function broadcastAlert(alert) {
  broadcast({
    type: "alert",
    channel: "alerts",
    data: alert,
  });
}

/**
 * Broadcast real-time stats update
 */
function broadcastStats(stats) {
  broadcast({
    type: "stats_update",
    channel: "stats",
    data: stats,
  });
}

/**
 * Get WebSocket server instance
 */
function getWSS() {
  return wss;
}

module.exports = {
  initializeWebSocket,
  getWSS,
  broadcast,
  broadcastBotDetection,
  broadcastTrafficUpdate,
  broadcastChallengeEvent,
  broadcastAlert,
  broadcastStats,
};

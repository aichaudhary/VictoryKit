/**
 * Real-time Collaboration Service
 * Enables real-time collaborative risk assessment and editing
 */

const WebSocket = require("ws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

// Collaboration Session Schema
const CollaborationSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["assessment", "review", "planning", "incident"],
    default: "assessment"
  },
  riskId: { type: mongoose.Schema.Types.ObjectId, ref: "Risk" },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
  status: {
    type: String,
    enum: ["active", "paused", "completed", "archived"],
    default: "active"
  },
  participants: [{
    userId: String,
    username: String,
    role: {
      type: String,
      enum: ["owner", "editor", "viewer"],
      default: "viewer"
    },
    joinedAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    cursor: {
      x: Number,
      y: Number,
      visible: { type: Boolean, default: false }
    },
  }],
  settings: {
    allowAnonymous: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 10 },
    autoSave: { type: Boolean, default: true },
    realTimeEditing: { type: Boolean, default: true },
  },
  activity: [{
    userId: String,
    username: String,
    action: String,
    details: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  }],
  createdBy: String,
  expiresAt: Date,
}, { timestamps: true });

const CollaborationSession = mongoose.model("CollaborationSession", CollaborationSessionSchema);

// Message Schema for chat and notifications
const CollaborationMessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "CollaborationSession", required: true },
  userId: String,
  username: String,
  type: {
    type: String,
    enum: ["chat", "system", "notification", "action"],
    default: "chat"
  },
  content: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const CollaborationMessage = mongoose.model("CollaborationMessage", CollaborationMessageSchema);

class RealTimeCollaborationService {
  constructor() {
    this.wss = null;
    this.sessions = new Map(); // sessionId -> Set of WebSocket connections
    this.userSessions = new Map(); // userId -> Set of sessionIds
    this.heartbeatInterval = null;
    this.initialized = false;
  }

  async initialize(server) {
    try {
      // Initialize WebSocket server
      this.wss = new WebSocket.Server({
        server,
        path: "/ws/collaboration",
        perMessageDeflate: false,
      });

      // Set up WebSocket event handlers
      this.wss.on("connection", this.handleConnection.bind(this));

      // Start heartbeat monitoring
      this.startHeartbeat();

      // Clean up expired sessions periodically
      this.startSessionCleanup();

      this.initialized = true;
      console.log("Real-time Collaboration Service initialized");
    } catch (error) {
      console.error("Failed to initialize Real-time Collaboration Service:", error);
      throw error;
    }
  }

  /**
   * Handle WebSocket connection
   */
  async handleConnection(ws, req) {
    try {
      // Extract token from query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");
      const sessionId = url.searchParams.get("sessionId");

      if (!token || !sessionId) {
        ws.close(1008, "Missing authentication token or session ID");
        return;
      }

      // Verify token and get user info
      const user = await this.authenticateUser(token);
      if (!user) {
        ws.close(1008, "Invalid authentication token");
        return;
      }

      // Verify session access
      const session = await this.verifySessionAccess(sessionId, user.id);
      if (!session) {
        ws.close(1008, "Invalid session or access denied");
        return;
      }

      // Add connection to session
      this.addConnection(sessionId, ws, user);

      // Set up message handler
      ws.on("message", (data) => this.handleMessage(sessionId, user, data));

      // Set up close handler
      ws.on("close", () => this.removeConnection(sessionId, ws, user));

      // Set up error handler
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.removeConnection(sessionId, ws, user);
      });

      // Send welcome message
      this.sendToConnection(ws, {
        type: "welcome",
        session: {
          id: session._id,
          name: session.name,
          participants: session.participants.length,
        },
        user: {
          id: user.id,
          username: user.username,
          role: this.getUserRole(session, user.id),
        },
      });

      // Notify other participants
      this.broadcastToSession(sessionId, {
        type: "user_joined",
        user: {
          id: user.id,
          username: user.username,
        },
        timestamp: new Date(),
      }, ws);

    } catch (error) {
      console.error("Connection handling error:", error);
      ws.close(1011, "Internal server error");
    }
  }

  /**
   * Authenticate user from token
   */
  async authenticateUser(token) {
    try {
      // Verify JWT token (implement based on your auth system)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
      return {
        id: decoded.userId,
        username: decoded.username || decoded.userId,
      };
    } catch (error) {
      console.error("Token authentication failed:", error);
      return null;
    }
  }

  /**
   * Verify session access
   */
  async verifySessionAccess(sessionId, userId) {
    try {
      const session = await CollaborationSession.findById(sessionId);
      if (!session || session.status !== "active") {
        return null;
      }

      // Check if user is a participant
      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        return null;
      }

      return session;
    } catch (error) {
      console.error("Session access verification failed:", error);
      return null;
    }
  }

  /**
   * Add connection to session
   */
  addConnection(sessionId, ws, user) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId).add(ws);

    if (!this.userSessions.has(user.id)) {
      this.userSessions.set(user.id, new Set());
    }
    this.userSessions.get(user.id).add(sessionId);

    // Update participant last activity
    this.updateParticipantActivity(sessionId, user.id);
  }

  /**
   * Remove connection from session
   */
  removeConnection(sessionId, ws, user) {
    const sessionConnections = this.sessions.get(sessionId);
    if (sessionConnections) {
      sessionConnections.delete(ws);
      if (sessionConnections.size === 0) {
        this.sessions.delete(sessionId);
      }
    }

    const userSessions = this.userSessions.get(user.id);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(user.id);
      }
    }

    // Notify other participants
    this.broadcastToSession(sessionId, {
      type: "user_left",
      user: {
        id: user.id,
        username: user.username,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(sessionId, user, data) {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "chat":
          await this.handleChatMessage(sessionId, user, message);
          break;

        case "cursor":
          await this.handleCursorUpdate(sessionId, user, message);
          break;

        case "edit":
          await this.handleEditMessage(sessionId, user, message);
          break;

        case "ping":
          this.sendToUser(user.id, { type: "pong", timestamp: new Date() });
          break;

        default:
          console.log("Unknown message type:", message.type);
      }

      // Update participant activity
      this.updateParticipantActivity(sessionId, user.id);

    } catch (error) {
      console.error("Message handling error:", error);
    }
  }

  /**
   * Handle chat messages
   */
  async handleChatMessage(sessionId, user, message) {
    try {
      // Save message to database
      const chatMessage = new CollaborationMessage({
        sessionId,
        userId: user.id,
        username: user.username,
        type: "chat",
        content: message.content,
        metadata: message.metadata,
      });

      await chatMessage.save();

      // Broadcast to all participants in session
      this.broadcastToSession(sessionId, {
        type: "chat",
        messageId: chatMessage._id,
        user: {
          id: user.id,
          username: user.username,
        },
        content: message.content,
        metadata: message.metadata,
        timestamp: chatMessage.timestamp,
      });

    } catch (error) {
      console.error("Chat message handling failed:", error);
    }
  }

  /**
   * Handle cursor updates
   */
  async handleCursorUpdate(sessionId, user, message) {
    try {
      // Update cursor position in session
      await CollaborationSession.updateOne(
        { _id: sessionId, "participants.userId": user.id },
        {
          $set: {
            "participants.$.cursor": {
              x: message.x,
              y: message.y,
              visible: message.visible,
            },
            "participants.$.lastActivity": new Date(),
          },
        }
      );

      // Broadcast cursor update to other participants
      this.broadcastToSession(sessionId, {
        type: "cursor_update",
        user: {
          id: user.id,
          username: user.username,
        },
        cursor: {
          x: message.x,
          y: message.y,
          visible: message.visible,
        },
      }, null, user.id); // Exclude sender

    } catch (error) {
      console.error("Cursor update handling failed:", error);
    }
  }

  /**
   * Handle edit messages
   */
  async handleEditMessage(sessionId, user, message) {
    try {
      // Verify user has edit permissions
      const session = await CollaborationSession.findById(sessionId);
      const participant = session.participants.find(p => p.userId === user.id);

      if (!participant || participant.role === "viewer") {
        this.sendToUser(user.id, {
          type: "error",
          message: "You don't have permission to edit",
        });
        return;
      }

      // Log activity
      await this.logActivity(sessionId, user.id, user.username, "edit", {
        field: message.field,
        oldValue: message.oldValue,
        newValue: message.newValue,
      });

      // Broadcast edit to all participants
      this.broadcastToSession(sessionId, {
        type: "edit",
        user: {
          id: user.id,
          username: user.username,
        },
        edit: {
          field: message.field,
          oldValue: message.oldValue,
          newValue: message.newValue,
          timestamp: new Date(),
        },
      });

    } catch (error) {
      console.error("Edit message handling failed:", error);
    }
  }

  /**
   * Create collaboration session
   */
  async createSession(sessionData) {
    try {
      const session = new CollaborationSession({
        name: sessionData.name,
        description: sessionData.description,
        type: sessionData.type || "assessment",
        riskId: sessionData.riskId,
        assessmentId: sessionData.assessmentId,
        settings: {
          allowAnonymous: sessionData.allowAnonymous || false,
          maxParticipants: sessionData.maxParticipants || 10,
          autoSave: sessionData.autoSave !== false,
          realTimeEditing: sessionData.realTimeEditing !== false,
        },
        participants: [{
          userId: sessionData.createdBy,
          username: sessionData.creatorUsername || sessionData.createdBy,
          role: "owner",
        }],
        createdBy: sessionData.createdBy,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      await session.save();

      // Log activity
      await this.logActivity(session._id, sessionData.createdBy, sessionData.creatorUsername, "created", {
        sessionName: session.name,
      });

      return {
        sessionId: session._id,
        name: session.name,
        status: session.status,
        participants: session.participants.length,
        settings: session.settings,
      };

    } catch (error) {
      console.error("Session creation failed:", error);
      throw error;
    }
  }

  /**
   * Join collaboration session
   */
  async joinSession(sessionId, userId, username = null) {
    try {
      const session = await CollaborationSession.findById(sessionId);
      if (!session || session.status !== "active") {
        throw new Error("Session not found or inactive");
      }

      // Check if user is already a participant
      const existingParticipant = session.participants.find(p => p.userId === userId);
      if (existingParticipant) {
        return { alreadyJoined: true };
      }

      // Check participant limit
      if (session.participants.length >= session.settings.maxParticipants) {
        throw new Error("Session is full");
      }

      // Add participant
      session.participants.push({
        userId,
        username: username || userId,
        role: "viewer", // Default role
        joinedAt: new Date(),
      });

      await session.save();

      // Log activity
      await this.logActivity(sessionId, userId, username, "joined", {});

      return {
        sessionId: session._id,
        role: "viewer",
        participants: session.participants.length,
      };

    } catch (error) {
      console.error("Session join failed:", error);
      throw error;
    }
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(sessionId, userId) {
    try {
      const session = await CollaborationSession.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Remove participant
      session.participants = session.participants.filter(p => p.userId !== userId);

      // If no participants left, mark as completed
      if (session.participants.length === 0) {
        session.status = "completed";
      }

      await session.save();

      // Log activity
      await this.logActivity(sessionId, userId, "Unknown", "left", {});

      return { success: true };

    } catch (error) {
      console.error("Session leave failed:", error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    try {
      const sessions = await CollaborationSession.find({
        status: "active",
        expiresAt: { $gt: new Date() },
      }).select("_id name description type participants createdAt");

      return sessions.map(session => ({
        id: session._id,
        name: session.name,
        description: session.description,
        type: session.type,
        participants: session.participants.length,
        createdAt: session.createdAt,
      }));

    } catch (error) {
      console.error("Get active sessions failed:", error);
      throw error;
    }
  }

  /**
   * Get session users
   */
  async getSessionUsers(sessionId) {
    try {
      const session = await CollaborationSession.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      return session.participants.map(p => ({
        userId: p.userId,
        username: p.username,
        role: p.role,
        joinedAt: p.joinedAt,
        lastActivity: p.lastActivity,
        cursor: p.cursor,
      }));

    } catch (error) {
      console.error("Get session users failed:", error);
      throw error;
    }
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId, limit = 50) {
    try {
      const messages = await CollaborationMessage.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(limit);

      return messages.reverse().map(msg => ({
        id: msg._id,
        userId: msg.userId,
        username: msg.username,
        type: msg.type,
        content: msg.content,
        metadata: msg.metadata,
        timestamp: msg.timestamp,
      }));

    } catch (error) {
      console.error("Get session messages failed:", error);
      throw error;
    }
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, message) {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return;

    for (const sessionId of userSessions) {
      const sessionConnections = this.sessions.get(sessionId);
      if (sessionConnections) {
        for (const ws of sessionConnections) {
          this.sendToConnection(ws, message);
        }
      }
    }
  }

  /**
   * Broadcast message to all connections in session
   */
  broadcastToSession(sessionId, message, excludeWs = null, excludeUserId = null) {
    const sessionConnections = this.sessions.get(sessionId);
    if (!sessionConnections) return;

    for (const ws of sessionConnections) {
      if (ws !== excludeWs) {
        // If excludeUserId is provided, we need to check which connection belongs to which user
        // For now, send to all (this could be optimized)
        this.sendToConnection(ws, message);
      }
    }
  }

  /**
   * Update participant activity
   */
  async updateParticipantActivity(sessionId, userId) {
    try {
      await CollaborationSession.updateOne(
        { _id: sessionId, "participants.userId": userId },
        { $set: { "participants.$.lastActivity": new Date() } }
      );
    } catch (error) {
      console.error("Update participant activity failed:", error);
    }
  }

  /**
   * Log activity
   */
  async logActivity(sessionId, userId, username, action, details) {
    try {
      await CollaborationSession.updateOne(
        { _id: sessionId },
        {
          $push: {
            activity: {
              userId,
              username,
              action,
              details,
              timestamp: new Date(),
            },
          },
        }
      );
    } catch (error) {
      console.error("Activity logging failed:", error);
    }
  }

  /**
   * Get user role in session
   */
  getUserRole(session, userId) {
    const participant = session.participants.find(p => p.userId === userId);
    return participant ? participant.role : "viewer";
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      // Send ping to all connections
      for (const [sessionId, connections] of this.sessions) {
        for (const ws of connections) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
          }
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start session cleanup
   */
  startSessionCleanup() {
    setInterval(async () => {
      try {
        // Mark expired sessions as completed
        await CollaborationSession.updateMany(
          {
            status: "active",
            expiresAt: { $lt: new Date() },
          },
          { status: "completed" }
        );

        // Clean up old completed sessions (older than 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await CollaborationSession.deleteMany({
          status: "completed",
          updatedAt: { $lt: thirtyDaysAgo },
        });

      } catch (error) {
        console.error("Session cleanup failed:", error);
      }
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      initialized: this.initialized,
      activeSessions: this.sessions.size,
      totalConnections: Array.from(this.sessions.values()).reduce((sum, conns) => sum + conns.size, 0),
      activeUsers: this.userSessions.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup on shutdown
   */
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log("Real-time Collaboration Service cleaned up");
  }
}

module.exports = new RealTimeCollaborationService();
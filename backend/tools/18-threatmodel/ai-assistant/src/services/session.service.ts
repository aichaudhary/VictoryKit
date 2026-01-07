import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import {
  AISession,
  AIMessage
} from '../types.js';

export class SessionService {
  private logger: Logger;
  private sessions: Map<string, AISession> = new Map();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor(logger: Logger) {
    this.logger = logger;

    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  /**
   * Create a new session or get existing one for a user
   */
  async createOrGetSession(userId: string, modelId?: string): Promise<AISession> {
    // Check if user already has an active session
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId && this.isSessionActive(session)) {
        this.logger.info('Reusing existing active session', {
          userId,
          sessionId: session.id
        });
        return session;
      }
    }

    // Create new session
    const session: AISession = {
      id: uuidv4(),
      userId,
      modelId,
      createdAt: new Date(),
      lastActivity: new Date(),
      context: {
        conversationHistory: [],
        modelData: null,
        preferences: {
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 4096,
          temperature: 0.7
        }
      }
    };

    this.sessions.set(session.id, session);

    this.logger.info('Created new AI session', {
      userId,
      sessionId: session.id,
      modelId
    });

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<AISession | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Session not found', { sessionId });
      return null;
    }

    if (!this.isSessionActive(session)) {
      this.logger.warn('Session expired', { sessionId });
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(sessionId: string, active: boolean = true): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot update activity for non-existent session', { sessionId });
      return;
    }

    session.lastActivity = new Date();

    this.logger.debug('Updated session activity', {
      sessionId,
      active,
      lastActivity: session.lastActivity
    });
  }

  /**
   * Update session context
   */
  async updateSessionContext(sessionId: string, updates: Partial<AISession['context']>): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot update context for non-existent session', { sessionId });
      return;
    }

    // Deep merge the context updates
    session.context = {
      ...session.context,
      ...updates,
      // Special handling for conversation history to avoid overwriting
      conversationHistory: updates.conversationHistory || session.context.conversationHistory
    };

    session.lastActivity = new Date();

    this.logger.debug('Updated session context', {
      sessionId,
      contextKeys: Object.keys(updates)
    });
  }

  /**
   * Add message to session conversation history
   */
  async addMessageToHistory(sessionId: string, message: AIMessage): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot add message to non-existent session', { sessionId });
      return;
    }

    if (!session.context.conversationHistory) {
      session.context.conversationHistory = [];
    }

    session.context.conversationHistory.push(message);

    // Keep only last 50 messages to prevent memory issues
    if (session.context.conversationHistory.length > 50) {
      session.context.conversationHistory = session.context.conversationHistory.slice(-50);
    }

    session.lastActivity = new Date();

    this.logger.debug('Added message to session history', {
      sessionId,
      messageId: message.id,
      role: message.role,
      messageLength: message.content.length
    });
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string): Promise<AIMessage[]> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot get history for non-existent session', { sessionId });
      return [];
    }

    return session.context.conversationHistory || [];
  }

  /**
   * Clear conversation history for a session
   */
  async clearConversationHistory(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot clear history for non-existent session', { sessionId });
      return;
    }

    session.context.conversationHistory = [];
    session.lastActivity = new Date();

    this.logger.info('Cleared conversation history', { sessionId });
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      this.logger.warn('Cannot delete non-existent session', { sessionId });
      return;
    }

    this.sessions.delete(sessionId);

    this.logger.info('Deleted session', {
      sessionId,
      userId: session.userId,
      duration: Date.now() - session.createdAt.getTime()
    });
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<AISession[]> {
    const userSessions: AISession[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId && this.isSessionActive(session)) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  } {
    let activeSessions = 0;
    let expiredSessions = 0;

    for (const [sessionId, session] of this.sessions) {
      if (this.isSessionActive(session)) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions
    };
  }

  /**
   * Check if a session is still active
   */
  private isSessionActive(session: AISession): boolean {
    const now = Date.now();
    const lastActivity = session.lastActivity.getTime();
    return (now - lastActivity) < this.SESSION_TIMEOUT;
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const expiredSessionIds: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (!this.isSessionActive(session)) {
        expiredSessionIds.push(sessionId);
      }
    }

    for (const sessionId of expiredSessionIds) {
      this.sessions.delete(sessionId);
    }

    if (expiredSessionIds.length > 0) {
      this.logger.info('Cleaned up expired sessions', {
        count: expiredSessionIds.length
      });
    }
  }

  /**
   * Close the session service (for cleanup)
   */
  async close(): Promise<void> {
    this.logger.info('Closing session service');

    // Clear all sessions
    this.sessions.clear();

    this.logger.info('Session service closed');
  }

  /**
   * Export session data (for debugging/admin purposes)
   */
  exportSessionData(sessionId: string): AISession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Import session data (for testing/recovery)
   */
  importSessionData(session: AISession): void {
    this.sessions.set(session.id, session);
    this.logger.debug('Imported session data', { sessionId: session.id });
  }
}
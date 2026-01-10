/**
 * DarkWebMonitor - Real-time WebSocket Service
 * Live threat alerts, analysis updates, and collaborative features
 */

import { API_ENDPOINTS } from "../constants";

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type AlertType = 
  | "new_threat"
  | "ioc_match"
  | "campaign_update"
  | "apt_activity"
  | "breach_detected"
  | "darkweb_mention"
  | "vulnerability"
  | "analysis_complete";

export interface ThreatAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  indicator?: string;
  indicatorType?: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
  actions?: string[];
}

export interface AnalysisUpdate {
  analysisId: string;
  step: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number;
  result?: any;
  timestamp: string;
}

export interface LiveStats {
  activeThreats: number;
  criticalAlerts: number;
  sourcesOnline: number;
  queriesPerMinute: number;
  avgResponseTime: number;
  topThreatTypes: { type: string; count: number }[];
  recentAlerts: ThreatAlert[];
}

type EventHandler<T> = (data: T) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, Set<EventHandler<any>>> = new Map();
  private isConnected = false;
  private pendingMessages: string[] = [];

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = API_ENDPOINTS.WS_URL;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log("[WS] Connected to DarkWebMonitor real-time service");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          // Send any pending messages
          this.pendingMessages.forEach(msg => this.ws?.send(msg));
          this.pendingMessages = [];
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("[WS] Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("[WS] WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log("[WS] Connection closed:", event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this.isConnected = false;
    this.subscriptions.clear();
  }

  /**
   * Subscribe to threat alerts
   */
  subscribeToAlerts(
    handler: EventHandler<ThreatAlert>,
    filters?: {
      severities?: AlertSeverity[];
      types?: AlertType[];
      indicators?: string[];
    }
  ): () => void {
    this.addSubscription("alert", handler);
    
    this.send({
      type: "subscribe",
      channel: "alerts",
      filters: filters || {},
    });

    return () => {
      this.removeSubscription("alert", handler);
      this.send({ type: "unsubscribe", channel: "alerts" });
    };
  }

  /**
   * Subscribe to analysis progress updates
   */
  subscribeToAnalysis(
    analysisId: string,
    handler: EventHandler<AnalysisUpdate>
  ): () => void {
    const channel = `analysis:${analysisId}`;
    this.addSubscription(channel, handler);
    
    this.send({
      type: "subscribe",
      channel: "analysis",
      analysisId,
    });

    return () => {
      this.removeSubscription(channel, handler);
      this.send({ type: "unsubscribe", channel: "analysis", analysisId });
    };
  }

  /**
   * Subscribe to live statistics
   */
  subscribeToStats(handler: EventHandler<LiveStats>): () => void {
    this.addSubscription("stats", handler);
    
    this.send({
      type: "subscribe",
      channel: "stats",
    });

    return () => {
      this.removeSubscription("stats", handler);
      this.send({ type: "unsubscribe", channel: "stats" });
    };
  }

  /**
   * Subscribe to indicator watch list
   */
  watchIndicators(
    indicators: string[],
    handler: EventHandler<ThreatAlert>
  ): () => void {
    const channel = "indicator_watch";
    this.addSubscription(channel, handler);
    
    this.send({
      type: "subscribe",
      channel: "indicator_watch",
      indicators,
    });

    return () => {
      this.removeSubscription(channel, handler);
      this.send({ type: "unsubscribe", channel: "indicator_watch" });
    };
  }

  /**
   * Subscribe to dark web mentions
   */
  subscribeToDarkWebAlerts(
    keywords: string[],
    handler: EventHandler<ThreatAlert>
  ): () => void {
    const channel = "darkweb";
    this.addSubscription(channel, handler);
    
    this.send({
      type: "subscribe",
      channel: "darkweb",
      keywords,
    });

    return () => {
      this.removeSubscription(channel, handler);
      this.send({ type: "unsubscribe", channel: "darkweb" });
    };
  }

  /**
   * Request immediate indicator check
   */
  requestCheck(indicator: string, options?: { priority?: boolean }): void {
    this.send({
      type: "check_request",
      indicator,
      priority: options?.priority || false,
    });
  }

  /**
   * Send message through WebSocket
   */
  private send(data: object): void {
    const message = JSON.stringify(data);
    
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for when connection is established
      this.pendingMessages.push(message);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case "alert":
        this.notifySubscribers("alert", data.payload);
        break;
      
      case "analysis_update":
        this.notifySubscribers(`analysis:${data.analysisId}`, data.payload);
        break;
      
      case "stats":
        this.notifySubscribers("stats", data.payload);
        break;
      
      case "indicator_match":
        this.notifySubscribers("indicator_watch", data.payload);
        break;
      
      case "darkweb_alert":
        this.notifySubscribers("darkweb", data.payload);
        break;
      
      case "pong":
        // Heartbeat response
        break;
      
      case "error":
        console.error("[WS] Server error:", data.message);
        break;
      
      default:
        console.log("[WS] Unknown message type:", data.type);
    }
  }

  /**
   * Add subscription handler
   */
  private addSubscription(channel: string, handler: EventHandler<any>): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(handler);
  }

  /**
   * Remove subscription handler
   */
  private removeSubscription(channel: string, handler: EventHandler<any>): void {
    this.subscriptions.get(channel)?.delete(handler);
  }

  /**
   * Notify all subscribers for a channel
   */
  private notifySubscribers(channel: string, data: any): void {
    this.subscriptions.get(channel)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error("[WS] Subscription handler error:", error);
      }
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: "ping" });
      }
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect on disconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WS] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error("[WS] Reconnect failed:", error);
      });
    }, delay);
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();

// Auto-connect on import (optional)
// wsService.connect().catch(console.error);

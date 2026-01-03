/**
 * WebSocket Service for Real-time DLP Updates
 * Connects to the DLP backend via Socket.io
 */

import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041';

class DLPWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to DLP WebSocket');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to WebSocket server'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      // Real-time event handlers
      this.socket.on('new-incident', (data) => {
        this.emit('incident', data);
      });

      this.socket.on('scan-complete', (data) => {
        this.emit('scan', data);
      });

      this.socket.on('policy-violation', (data) => {
        this.emit('violation', data);
      });

      this.socket.on('endpoint-alert', (data) => {
        this.emit('endpoint', data);
      });

      this.socket.on('cloud-sync', (data) => {
        this.emit('cloud', data);
      });
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Subscribe to alerts for a user
  subscribeToAlerts(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-alerts', userId);
    }
  }

  // Subscribe to scan updates for an organization
  subscribeToScans(organizationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-scans', organizationId);
    }
  }

  // Subscribe to all DLP events
  subscribeToAll(userId: string, organizationId: string): void {
    this.subscribeToAlerts(userId);
    this.subscribeToScans(organizationId);
  }

  // Add event listener
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Remove event listener
  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  // Emit event to listeners
  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const dlpWebSocket = new DLPWebSocketService();

// React hook for WebSocket
import { useEffect, useState, useCallback } from 'react';

export interface WebSocketState {
  isConnected: boolean;
  incidents: any[];
  scans: any[];
  violations: any[];
}

export const useDLPWebSocket = (userId?: string, organizationId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    dlpWebSocket.connect()
      .then(() => {
        setIsConnected(true);
        if (userId && organizationId) {
          dlpWebSocket.subscribeToAll(userId, organizationId);
        }
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      });

    // Set up listeners
    const handleIncident = (data: any) => {
      setIncidents((prev) => [data, ...prev].slice(0, 50));
    };

    const handleScan = (data: any) => {
      setScans((prev) => [data, ...prev].slice(0, 50));
    };

    const handleViolation = (data: any) => {
      setViolations((prev) => [data, ...prev].slice(0, 50));
    };

    dlpWebSocket.on('incident', handleIncident);
    dlpWebSocket.on('scan', handleScan);
    dlpWebSocket.on('violation', handleViolation);

    // Cleanup on unmount
    return () => {
      dlpWebSocket.off('incident', handleIncident);
      dlpWebSocket.off('scan', handleScan);
      dlpWebSocket.off('violation', handleViolation);
    };
  }, [userId, organizationId]);

  const clearIncidents = useCallback(() => setIncidents([]), []);
  const clearScans = useCallback(() => setScans([]), []);
  const clearViolations = useCallback(() => setViolations([]), []);

  return {
    isConnected,
    incidents,
    scans,
    violations,
    clearIncidents,
    clearScans,
    clearViolations,
  };
};

export default dlpWebSocket;

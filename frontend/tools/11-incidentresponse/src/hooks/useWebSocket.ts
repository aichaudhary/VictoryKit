/**
 * WebSocket Hook for Real-Time Incident Updates
 * Connects to incidentcommand backend WebSocket
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_incidentcommand_WS_URL || 'http://localhost:4011';

export interface WebSocketEvent {
  type: string;
  [key: string]: unknown;
}

export interface UseWebSocketOptions {
  userId?: string;
  incidentId?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
}

export const useIncidentWebSocket = (options: UseWebSocketOptions = {}) => {
  const { userId, incidentId, autoConnect = true, onConnect, onDisconnect, onError } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [events, setEvents] = useState<WebSocketEvent[]>([]);

  // Event handlers
  const eventHandlersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState((prev) => ({ ...prev, connecting: true }));

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setState({ connected: true, connecting: false, error: null });
      onConnect?.();

      // Authenticate if userId provided
      if (userId) {
        socket.emit('authenticate', { userId });
      }

      // Join incident room if incidentId provided
      if (incidentId) {
        socket.emit('join-incident', incidentId);
      }
    });

    socket.on('disconnect', () => {
      setState((prev) => ({ ...prev, connected: false }));
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      setState({ connected: false, connecting: false, error });
      onError?.(error);
    });

    // Event listeners for incident updates
    const eventTypes = [
      'incident:created',
      'incident:updated',
      'incident:timeline',
      'incident:enrichment',
      'incident:siem',
      'incident:edr',
      'incident:analysis',
      'incident:notification',
      'incident:containment',
      'incident:ticket',
      'alert:critical',
      'dashboard:update',
      'dashboard:metrics',
    ];

    eventTypes.forEach((eventType) => {
      socket.on(eventType, (data) => {
        const event = { type: eventType, ...data, receivedAt: new Date().toISOString() };
        setLastEvent(event);
        setEvents((prev) => [event, ...prev].slice(0, 100)); // Keep last 100 events

        // Trigger registered handlers
        const handlers = eventHandlersRef.current.get(eventType);
        handlers?.forEach((handler) => handler(data));
      });
    });

    socketRef.current = socket;
  }, [userId, incidentId, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setState({ connected: false, connecting: false, error: null });
  }, []);

  const joinIncident = useCallback((id: string) => {
    socketRef.current?.emit('join-incident', id);
  }, []);

  const leaveIncident = useCallback((id: string) => {
    socketRef.current?.emit('leave-incident', id);
  }, []);

  const subscribeDashboard = useCallback(() => {
    socketRef.current?.emit('subscribe-dashboard');
  }, []);

  const on = useCallback((eventType: string, handler: (data: unknown) => void) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      eventHandlersRef.current.get(eventType)?.delete(handler);
    };
  }, []);

  const off = useCallback((eventType: string, handler: (data: unknown) => void) => {
    eventHandlersRef.current.get(eventType)?.delete(handler);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Rejoin incident room when incidentId changes
  useEffect(() => {
    if (state.connected && incidentId) {
      joinIncident(incidentId);
    }
  }, [state.connected, incidentId, joinIncident]);

  return {
    ...state,
    socket: socketRef.current,
    lastEvent,
    events,
    connect,
    disconnect,
    joinIncident,
    leaveIncident,
    subscribeDashboard,
    on,
    off,
  };
};

export default useIncidentWebSocket;

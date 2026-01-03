import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import type { BotDetectionEvent, WSEvent, TrafficUpdate } from '../types';

interface WebSocketState {
  connected: boolean;
  events: WSEvent[];
  botDetections: BotDetectionEvent[];
  trafficUpdates: TrafficUpdate[];
  addEvent: (event: WSEvent) => void;
  addBotDetection: (detection: BotDetectionEvent) => void;
  addTrafficUpdate: (update: TrafficUpdate) => void;
  setConnected: (connected: boolean) => void;
  clearEvents: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  events: [],
  botDetections: [],
  trafficUpdates: [],
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 100),
    })),
  addBotDetection: (detection) =>
    set((state) => ({
      botDetections: [detection, ...state.botDetections].slice(0, 50),
    })),
  addTrafficUpdate: (update) =>
    set((state) => ({
      trafficUpdates: [update, ...state.trafficUpdates].slice(0, 100),
    })),
  setConnected: (connected) => set({ connected }),
  clearEvents: () => set({ events: [], botDetections: [], trafficUpdates: [] }),
}));

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { setConnected, addEvent, addBotDetection, addTrafficUpdate } = useWebSocketStore();

  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:4023/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Subscribe to all channels
        wsRef.current?.send(JSON.stringify({ type: 'subscribe', channel: 'all' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSEvent;
          addEvent(data);
          
          if (data.type === 'bot_detected') {
            addBotDetection(data as BotDetectionEvent);
          }
          
          if (data.type === 'traffic_update') {
            addTrafficUpdate(data as unknown as TrafficUpdate);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [setConnected, addEvent, addBotDetection]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected: useWebSocketStore((state) => state.connected),
    events: useWebSocketStore((state) => state.events),
    botDetections: useWebSocketStore((state) => state.botDetections),
    trafficUpdates: useWebSocketStore((state) => state.trafficUpdates),
  };
}

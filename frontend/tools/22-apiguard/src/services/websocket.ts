import { io, Socket } from 'socket.io-client';
import { useAPIGuardStore } from '../stores/apiGuardStore';
import type { RealTimeEvent, Anomaly } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4122';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      path: '/ws/apiguard',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      useAPIGuardStore.getState().setConnectionStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      useAPIGuardStore.getState().setConnectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      useAPIGuardStore.getState().setConnectionStatus('error');
    });

    // Real-time API request events
    this.socket.on('api_request', (data: RealTimeEvent) => {
      useAPIGuardStore.getState().addRealTimeEvent({
        ...data,
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'request',
        timestamp: new Date(),
      });
    });

    // Anomaly detected
    this.socket.on('anomaly_detected', (data: Anomaly) => {
      const store = useAPIGuardStore.getState();
      store.addRealTimeEvent({
        id: data.anomalyId || data.id || `anomaly-${Date.now()}`,
        type: 'anomaly',
        timestamp: new Date(data.createdAt || Date.now()),
        severity: data.severity,
        message: data.description || `${data.type} anomaly detected`,
        apiId: (data.apiId as string) || undefined,
        data: { anomaly: data },
      });
      store.incrementAnomalyCount();
    });

    // Policy violation
    this.socket.on('policy_violation', (data: { policyId: string; apiId: string; endpoint: string; message: string; severity: string }) => {
      useAPIGuardStore.getState().addRealTimeEvent({
        id: `viol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'policy_violation',
        timestamp: new Date(),
        severity: data.severity as 'critical' | 'high' | 'medium' | 'low',
        message: data.message,
        apiId: data.apiId,
        data,
      });
    });

    // Rate limit exceeded
    this.socket.on('rate_limit_exceeded', (data: { apiId: string; endpoint: string; clientIp: string; limit: number }) => {
      useAPIGuardStore.getState().addRealTimeEvent({
        id: `rate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'rate_limit',
        timestamp: new Date(),
        severity: 'medium',
        message: `Rate limit exceeded: ${data.limit} requests from ${data.clientIp}`,
        apiId: data.apiId,
        data,
      });
    });

    // Security scan complete
    this.socket.on('scan_complete', (data: { scanId: string; apiId: string; score: number; grade: string; findings: number }) => {
      useAPIGuardStore.getState().addRealTimeEvent({
        id: `scan-${data.scanId}`,
        type: 'scan_complete',
        timestamp: new Date(),
        severity: data.score >= 80 ? 'info' : data.score >= 60 ? 'medium' : 'high',
        message: `Security scan complete: Grade ${data.grade} (${data.findings} findings)`,
        apiId: data.apiId,
        data,
      });
    });

    // API metrics update
    this.socket.on('metrics_update', (data: { apiId: string; requests: number; errors: number; latency: number }) => {
      useAPIGuardStore.getState().updateAPIMetrics(data.apiId, {
        requests: data.requests,
        errors: data.errors,
        latency: data.latency,
      });
    });

    // Security score update
    this.socket.on('score_update', (data: { apiId: string; score: number; grade: string }) => {
      useAPIGuardStore.getState().updateAPIScore(data.apiId, data.score, data.grade);
    });
  }

  subscribeToAPI(apiId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_api', { apiId });
    }
  }

  unsubscribeFromAPI(apiId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_api', { apiId });
    }
  }

  subscribeToAllAPIs() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_all');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      useAPIGuardStore.getState().setConnectionStatus('disconnected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();

// Auto-connect simulation for demo
if (typeof window !== 'undefined') {
  // Simulate connection for demo
  setTimeout(() => {
    useAPIGuardStore.getState().setConnectionStatus('connected');
    
    // Simulate real-time events
    setInterval(() => {
      const store = useAPIGuardStore.getState();
      if (!store.liveMode) return;

      const eventTypes = ['request', 'anomaly', 'policy_violation', 'rate_limit'] as const;
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severities = ['critical', 'high', 'medium', 'low', 'info'] as const;

      const event: RealTimeEvent = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: new Date(),
        severity: type === 'request' ? undefined : severities[Math.floor(Math.random() * 4)],
        message: getEventMessage(type),
        apiId: `API-${Math.floor(Math.random() * 10)}`,
      };

      store.addRealTimeEvent(event);
    }, 2000 + Math.random() * 3000);
  }, 1000);
}

function getEventMessage(type: string): string {
  const messages: Record<string, string[]> = {
    request: [
      'GET /api/users - 200 OK (45ms)',
      'POST /api/orders - 201 Created (120ms)',
      'GET /api/products - 200 OK (32ms)',
      'PUT /api/users/123 - 200 OK (89ms)',
      'DELETE /api/sessions - 204 No Content (15ms)',
    ],
    anomaly: [
      'Unusual traffic spike detected',
      'Error rate exceeds threshold',
      'Latency anomaly detected',
      'Schema violation in request body',
      'Multiple authentication failures',
    ],
    policy_violation: [
      'Missing authentication header',
      'CORS policy violation',
      'Invalid request schema',
      'Blocked suspicious payload',
      'Rate limit policy exceeded',
    ],
    rate_limit: [
      'Rate limit exceeded: 1000 req/min',
      'Client throttled: burst limit reached',
      'API quota exhausted for consumer',
      'Emergency rate limit activated',
    ],
  };

  const typeMessages = messages[type] || messages.request;
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

export default wsService;

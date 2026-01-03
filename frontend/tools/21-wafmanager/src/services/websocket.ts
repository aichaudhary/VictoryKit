import { io, Socket } from 'socket.io-client';
import { useWAFStore } from '../stores/wafStore';
import type { RealTimeEvent, AttackLog } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    if (this.socket?.connected) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4121';
    
    this.socket = io(wsUrl, {
      path: '/ws/waf',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    const store = useWAFStore.getState();

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 WAF WebSocket connected');
      this.reconnectAttempts = 0;
      store.setConnectionStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WAF WebSocket disconnected:', reason);
      store.setConnectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WAF WebSocket connection error:', error);
      this.reconnectAttempts++;
      store.setConnectionStatus('error');
    });

    // Real-time attack events
    this.socket.on('attack', (data: AttackLog) => {
      console.log('🚨 Attack detected:', data);
      store.addRealtimeAttack(data);
      store.incrementAttackCount();
    });

    // Rule trigger events
    this.socket.on('rule_trigger', (data: RealTimeEvent) => {
      console.log('📋 Rule triggered:', data);
      store.addRealtimeEvent(data);
    });

    // Rate limit events
    this.socket.on('rate_limit', (data: RealTimeEvent) => {
      console.log('⏱️ Rate limit triggered:', data);
      store.addRealtimeEvent(data);
    });

    // Geo-blocking events
    this.socket.on('geo_block', (data: RealTimeEvent) => {
      console.log('🌍 Geo-block triggered:', data);
      store.addRealtimeEvent(data);
    });

    // Bot detection events
    this.socket.on('bot_detect', (data: RealTimeEvent) => {
      console.log('🤖 Bot detected:', data);
      store.addRealtimeEvent(data);
    });

    // Traffic stats update
    this.socket.on('traffic_stats', (data: {
      requestsPerSecond: number;
      blockedPerSecond: number;
      avgLatency: number;
    }) => {
      store.updateTrafficStats(data);
    });

    // Instance health update
    this.socket.on('instance_health', (data: {
      instanceId: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
    }) => {
      store.updateInstanceHealth(data);
    });

    // Threat intelligence update
    this.socket.on('threat_intel', (data: {
      type: 'new_indicator' | 'updated_indicator';
      indicator: any;
    }) => {
      console.log('🎯 Threat intel update:', data);
      store.addThreatIndicator(data.indicator);
    });
  }

  // Subscribe to specific instance events
  subscribeToInstance(instanceId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_instance', { instanceId });
    }
  }

  // Unsubscribe from instance events
  unsubscribeFromInstance(instanceId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_instance', { instanceId });
    }
  }

  // Subscribe to live attack feed
  subscribeToAttackFeed() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_attacks');
    }
  }

  // Unsubscribe from attack feed
  unsubscribeFromAttackFeed() {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_attacks');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
export default wsService;

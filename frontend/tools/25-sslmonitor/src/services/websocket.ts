import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(url: string = 'http://localhost:4125'): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      auth: {
        token: localStorage.getItem('sslmonitor_token'),
      },
    });

    this.socket.on('connect', () => {
      console.log('🔗 SSLMonitor WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 SSLMonitor WebSocket disconnected:', reason);
      this.emit('disconnected', { reason, timestamp: new Date() });

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔗 SSLMonitor WebSocket connection error:', error);
      this.emit('connection_error', { error: error.message, timestamp: new Date() });
      this.attemptReconnect();
    });

    // Listen for SSLMonitor-specific events
    this.socket.on('scan_started', (data) => {
      this.emit('scan_started', data);
    });

    this.socket.on('scan_completed', (data) => {
      this.emit('scan_completed', data);
    });

    this.socket.on('scan_failed', (data) => {
      this.emit('scan_failed', data);
    });

    this.socket.on('alert_created', (data) => {
      this.emit('alert_created', data);
    });

    this.socket.on('certificate_updated', (data) => {
      this.emit('certificate_updated', data);
    });

    this.socket.on('system_status', (data) => {
      this.emit('system_status', data);
    });

    this.socket.on('scan_progress', (data) => {
      this.emit('scan_progress', data);
    });

    this.socket.on('alert_acknowledged', (data) => {
      this.emit('alert_acknowledged', data);
    });

    this.socket.on('domain_added', (data) => {
      this.emit('domain_added', data);
    });

    this.socket.on('certificate_expired', (data) => {
      this.emit('certificate_expired', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached', { timestamp: new Date() });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Event subscription methods
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      return;
    }

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Send messages to server
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot send message:', event, data);
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionId(): string | undefined {
    return this.socket?.id;
  }

  // SSLMonitor-specific methods
  subscribeToDomain(domainId: string): void {
    this.send('subscribe_domain', { domainId });
  }

  unsubscribeFromDomain(domainId: string): void {
    this.send('unsubscribe_domain', { domainId });
  }

  subscribeToCertificate(certificateId: string): void {
    this.send('subscribe_certificate', { certificateId });
  }

  unsubscribeFromCertificate(certificateId: string): void {
    this.send('unsubscribe_certificate', { certificateId });
  }

  requestSystemStatus(): void {
    this.send('get_system_status', {});
  }

  requestScanStatus(scanId: string): void {
    this.send('get_scan_status', { scanId });
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;
export { WebSocketService };
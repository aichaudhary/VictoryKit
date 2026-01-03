/**
 * WebSocket Server for SSLMonitor
 * Real-time certificate monitoring and updates
 * Port: 4125
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const { EventEmitter } = require('events');

class WebSocketServer extends EventEmitter {
    constructor(server) {
        super();
        this.wss = null;
        this.clients = new Map();
        this.heartbeatInterval = null;
        this.init(server);
    }

    init(server) {
        const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 4125;
        const WEBSOCKET_PATH = process.env.WEBSOCKET_PATH || '/ws';

        // Create WebSocket server
        this.wss = new WebSocket.Server({
            server,
            path: WEBSOCKET_PATH,
            perMessageDeflate: false,
            maxPayload: 1024 * 1024 // 1MB max payload
        });

        console.log(`🔌 WebSocket server initialized on port ${WEBSOCKET_PORT}, path: ${WEBSOCKET_PATH}`);

        // Setup event handlers
        this.setupEventHandlers();

        // Start heartbeat
        this.startHeartbeat();
    }

    setupEventHandlers() {
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
            this.emit('error', error);
        });
    }

    async handleConnection(ws, req) {
        try {
            const queryParams = url.parse(req.url, true).query;
            const token = queryParams.token || req.headers.authorization?.replace('Bearer ', '');

            // Authenticate user
            let user = null;
            if (token) {
                try {
                    user = jwt.verify(token, process.env.JWT_SECRET);
                } catch (err) {
                    console.warn('WebSocket authentication failed:', err.message);
                }
            }

            const clientId = this.generateClientId();
            const client = {
                id: clientId,
                ws,
                user,
                connectedAt: new Date(),
                lastHeartbeat: Date.now(),
                subscriptions: new Set(),
                isAlive: true
            };

            this.clients.set(clientId, client);

            console.log(`🔌 WebSocket client connected: ${clientId}, User: ${user?.id || 'anonymous'}`);

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connection_established',
                clientId,
                timestamp: new Date().toISOString(),
                user: user ? { id: user.id, email: user.email } : null
            });

            // Setup client event handlers
            this.setupClientHandlers(client);

            this.emit('client_connected', client);

        } catch (error) {
            console.error('Error handling WebSocket connection:', error);
            ws.close(1011, 'Internal server error');
        }
    }

    setupClientHandlers(client) {
        const { id, ws } = client;

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleClientMessage(id, message);
            } catch (error) {
                console.error(`Error parsing message from client ${id}:`, error);
                this.sendToClient(id, {
                    type: 'error',
                    message: 'Invalid message format',
                    timestamp: new Date().toISOString()
                });
            }
        });

        ws.on('pong', () => {
            client.lastHeartbeat = Date.now();
            client.isAlive = true;
        });

        ws.on('close', (code, reason) => {
            console.log(`🔌 WebSocket client disconnected: ${id}, Code: ${code}, Reason: ${reason}`);
            this.clients.delete(id);
            this.emit('client_disconnected', client);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket client error ${id}:`, error);
            this.clients.delete(id);
        });
    }

    handleClientMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client) return;

        const { type, data } = message;

        switch (type) {
            case 'subscribe':
                this.handleSubscription(client, data);
                break;

            case 'unsubscribe':
                this.handleUnsubscription(client, data);
                break;

            case 'ping':
                this.sendToClient(clientId, {
                    type: 'pong',
                    timestamp: new Date().toISOString()
                });
                break;

            case 'get_status':
                this.sendSystemStatus(clientId);
                break;

            default:
                console.warn(`Unknown message type from client ${clientId}:`, type);
                this.sendToClient(clientId, {
                    type: 'error',
                    message: `Unknown message type: ${type}`,
                    timestamp: new Date().toISOString()
                });
        }
    }

    handleSubscription(client, data) {
        const { channels } = data;

        if (Array.isArray(channels)) {
            channels.forEach(channel => {
                client.subscriptions.add(channel);
            });
        } else if (typeof channels === 'string') {
            client.subscriptions.add(channels);
        }

        this.sendToClient(client.id, {
            type: 'subscription_confirmed',
            channels: Array.from(client.subscriptions),
            timestamp: new Date().toISOString()
        });

        console.log(`📡 Client ${client.id} subscribed to:`, Array.from(client.subscriptions));
    }

    handleUnsubscription(client, data) {
        const { channels } = data;

        if (Array.isArray(channels)) {
            channels.forEach(channel => {
                client.subscriptions.delete(channel);
            });
        } else if (typeof channels === 'string') {
            client.subscriptions.delete(channels);
        }

        this.sendToClient(client.id, {
            type: 'unsubscription_confirmed',
            channels: Array.from(client.subscriptions),
            timestamp: new Date().toISOString()
        });
    }

    // Real-time broadcasting methods
    broadcastToChannel(channel, message, excludeClientId = null) {
        const clients = Array.from(this.clients.values()).filter(client =>
            client.subscriptions.has(channel) &&
            client.id !== excludeClientId &&
            client.ws.readyState === WebSocket.OPEN
        );

        clients.forEach(client => {
            try {
                client.ws.send(JSON.stringify({
                    ...message,
                    channel,
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error(`Error sending to client ${client.id}:`, error);
            }
        });

        if (clients.length > 0) {
            console.log(`📡 Broadcasted to ${clients.length} clients on channel '${channel}':`, message.type);
        }
    }

    broadcastToAll(message, excludeClientId = null) {
        const clients = Array.from(this.clients.values()).filter(client =>
            client.id !== excludeClientId &&
            client.ws.readyState === WebSocket.OPEN
        );

        clients.forEach(client => {
            try {
                client.ws.send(JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error(`Error sending to client ${client.id}:`, error);
            }
        });

        if (clients.length > 0) {
            console.log(`📡 Broadcasted to ${clients.length} clients:`, message.type);
        }
    }

    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            client.ws.send(JSON.stringify({
                ...message,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error(`Error sending to client ${clientId}:`, error);
            return false;
        }
    }

    // Certificate monitoring events
    notifyCertificateUpdate(certificate) {
        this.broadcastToChannel('certificates', {
            type: 'certificate_updated',
            data: certificate
        });
    }

    notifyCertificateExpiry(certificate) {
        this.broadcastToChannel('alerts', {
            type: 'certificate_expiring',
            data: certificate,
            severity: 'warning'
        });
    }

    notifyScanStarted(scanId, domain) {
        this.broadcastToChannel('scans', {
            type: 'scan_started',
            data: { scanId, domain }
        });
    }

    notifyScanProgress(scanId, progress, status) {
        this.broadcastToChannel('scans', {
            type: 'scan_progress',
            data: { scanId, progress, status }
        });
    }

    notifyScanCompleted(scanId, results) {
        this.broadcastToChannel('scans', {
            type: 'scan_completed',
            data: { scanId, results }
        });
    }

    notifyAlertTriggered(alert) {
        this.broadcastToChannel('alerts', {
            type: 'alert_triggered',
            data: alert
        });
    }

    notifySystemStatus(status) {
        this.broadcastToAll({
            type: 'system_status',
            data: status
        });
    }

    // System status methods
    async sendSystemStatus(clientId) {
        const status = await this.getSystemStatus();
        this.sendToClient(clientId, {
            type: 'system_status',
            data: status
        });
    }

    async getSystemStatus() {
        // This would integrate with actual system monitoring
        return {
            server: 'online',
            database: 'connected',
            websocket: 'active',
            clients: this.clients.size,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    // Heartbeat management
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.clients.forEach((client, clientId) => {
                if (!client.isAlive) {
                    console.log(`💔 Client ${clientId} failed heartbeat, terminating`);
                    client.ws.terminate();
                    this.clients.delete(clientId);
                    return;
                }

                client.isAlive = false;
                try {
                    client.ws.ping();
                } catch (error) {
                    console.error(`Error pinging client ${clientId}:`, error);
                    this.clients.delete(clientId);
                }
            });
        }, 30000); // 30 second heartbeat
    }

    // Utility methods
    generateClientId() {
        return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getConnectedClients() {
        return Array.from(this.clients.values()).map(client => ({
            id: client.id,
            user: client.user?.id || 'anonymous',
            connectedAt: client.connectedAt,
            subscriptions: Array.from(client.subscriptions)
        }));
    }

    getClientCount() {
        return this.clients.size;
    }

    // Cleanup
    close() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.clients.forEach(client => {
            client.ws.close(1001, 'Server shutdown');
        });

        this.clients.clear();

        if (this.wss) {
            this.wss.close();
        }

        console.log('🔌 WebSocket server closed');
    }
}

module.exports = WebSocketServer;
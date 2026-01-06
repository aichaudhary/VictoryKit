class SOAREngineAI {
  private ws: WebSocket | null = null;
  private messageQueue: any[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private onMessageCallback: ((data: any) => void) | null = null;
  private currentProvider: string = 'gemini';

  connect(onMessage: (data: any) => void) {
    this.onMessageCallback = onMessage;
    const wsUrl = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:6028/maula-ai';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to SOAREngine AI Assistant');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ Disconnected from SOAREngine AI Assistant');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.onMessageCallback) {
          this.connect(this.onMessageCallback);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      if (this.onMessageCallback) {
        this.onMessageCallback({
          type: 'error',
          error: 'Failed to connect to AI Assistant after multiple attempts'
        });
      }
    }
  }

  send(message: any) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not ready, queuing message');
      this.messageQueue.push(message);
      
      // Try to connect if not connected
      if (!this.isConnected && this.onMessageCallback) {
        this.connect(this.onMessageCallback);
      }
    }
  }

  sendChat(message: string, systemPrompt: string, functions: any[]) {
    this.send({
      type: 'chat',
      content: message,
      systemPrompt,
      functions,
      timestamp: new Date().toISOString()
    });
  }

  switchProvider(provider: 'gemini' | 'claude' | 'gpt' | 'grok') {
    this.currentProvider = provider;
    this.send({
      type: 'switchProvider',
      provider,
      timestamp: new Date().toISOString()
    });
  }

  callFunction(functionName: string, args: any) {
    this.send({
      type: 'functionCall',
      functionName,
      arguments: args,
      timestamp: new Date().toISOString()
    });
  }

  clearHistory() {
    this.send({
      type: 'clearHistory',
      timestamp: new Date().toISOString()
    });
  }

  disconnect() {
    if (this.ws) {
      this.isConnected = false;
      this.ws.close();
      this.ws = null;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentProvider: this.currentProvider,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default new SOAREngineAI();

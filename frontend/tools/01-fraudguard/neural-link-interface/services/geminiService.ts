import { SettingsState, CanvasState, NeuralConfig } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class VictoryKitAIService {
  private ws: WebSocket | null = null;
  private config: NeuralConfig;
  private onMessage: (data: any) => void;
  private onError: (error: any) => void;

  constructor(config: NeuralConfig, onMessage: (data: any) => void, onError: (error: any) => void) {
    this.config = config;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(): void {
    if (this.ws) return;

    this.ws = new WebSocket(this.config.wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to VictoryKit AI Assistant');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        this.onError(error);
      }
    };

    this.ws.onerror = (error) => {
      this.onError(error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from VictoryKit AI Assistant');
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: string, settings: SettingsState): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'chat',
        content: message,
        provider: settings.provider || 'claude-3-5-sonnet-20241022',
        conversationId: uuidv4(),
        tools: true, // Enable function calling
        settings: settings, // Include settings for context
        config: this.config // Include config for tool-specific context
      };
      this.ws.send(JSON.stringify(payload));
    }
  }
}

export const callVictoryKitAI = async (
  prompt: string,
  settings: SettingsState,
  config: NeuralConfig,
  onMessage: (data: any) => void,
  onError: (error: any) => void
): Promise<VictoryKitAIService> => {
  const service = new VictoryKitAIService(config, onMessage, onError);
  service.connect();
  service.sendMessage(prompt, settings);
  return service;
};
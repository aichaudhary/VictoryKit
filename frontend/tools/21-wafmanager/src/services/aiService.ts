/**
 * WAFManager AI Service
 * Tool #21 - WebSocket client for AI-powered WAF management
 */

import { getWsUrl, getSystemPrompt, getAIFunctions } from './config';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  functionCall?: { name: string; parameters: Record<string, unknown> };
  functionResult?: { success: boolean; data: unknown; error?: string };
}

export interface AISession {
  sessionId: string;
  clientId: string;
  connected: boolean;
  messages: AIMessage[];
}

type MessageHandler = (message: AIMessage) => void;
type ConnectionHandler = (session: AISession) => void;
type ErrorHandler = (error: Error) => void;

class WAFManagerAIService {
  private ws: WebSocket | null = null;
  private session: AISession | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<AISession> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(getWsUrl());
        this.ws.onopen = () => { this.reconnectAttempts = 0; };
        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleMessage(message, resolve);
        };
        this.ws.onerror = () => reject(new Error('WebSocket error'));
        this.ws.onclose = () => this.attemptReconnect();
      } catch (error) { reject(error); }
    });
  }

  private handleMessage(message: { type: string; payload?: Record<string, unknown>; clientId?: string }, resolve?: (s: AISession) => void) {
    if (message.type === 'connected') {
      this.session = { sessionId: crypto.randomUUID(), clientId: message.clientId || '', connected: true, messages: [] };
      this.connectionHandlers.forEach(h => h(this.session!));
      resolve?.(this.session);
    } else if (message.type === 'response') {
      const aiMsg: AIMessage = { id: crypto.randomUUID(), role: 'assistant', content: (message.payload?.content as string) || '', timestamp: new Date() };
      this.session?.messages.push(aiMsg);
      this.messageHandlers.forEach(h => h(aiMsg));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts++ < this.maxReconnectAttempts) {
      setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts - 1));
    }
  }

  disconnect() { this.ws?.close(); this.ws = null; this.session = null; }

  sendMessage(content: string): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error('Not connected');
    const id = crypto.randomUUID();
    this.session?.messages.push({ id, role: 'user', content, timestamp: new Date() });
    this.ws.send(JSON.stringify({ type: 'chat', content, conversationId: this.session?.sessionId }));
    return id;
  }

  callFunction(functionName: string, parameters: Record<string, unknown>): string {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error('Not connected');
    const id = crypto.randomUUID();
    this.ws.send(JSON.stringify({ type: 'function_call', requestId: id, functionName, parameters }));
    return id;
  }

  onMessage(h: MessageHandler) { this.messageHandlers.add(h); return () => this.messageHandlers.delete(h); }
  onConnection(h: ConnectionHandler) { this.connectionHandlers.add(h); return () => this.connectionHandlers.delete(h); }
  onError(h: ErrorHandler) { this.errorHandlers.add(h); return () => this.errorHandlers.delete(h); }
  getSession() { return this.session; }
  isConnected() { return this.session?.connected || false; }
  getAvailableFunctions() { return getAIFunctions(); }

  // Convenience methods
  async analyzeTraffic(p: { timeRange: string; endpoint?: string; includeBlocked?: boolean; groupBy?: string }) {
    return this.callFunction('analyze_traffic', p);
  }
  async createRule(p: { ruleName: string; ruleType: string; conditions: Record<string, unknown>; action: string }) {
    return this.callFunction('create_rule', p);
  }
  async detectAttacks(p: { timeRange: string; attackTypes?: string[]; severity?: string; autoBlock?: boolean }) {
    return this.callFunction('detect_attacks', p);
  }
  async optimizeRules(p: { targetMetric?: string; analyzeEffectiveness?: boolean; removeDuplicates?: boolean; suggestNew?: boolean }) {
    return this.callFunction('optimize_rules', p);
  }
  async manageBlocklist(p: { action: string; entries?: string[]; reason?: string; duration?: string }) {
    return this.callFunction('manage_blocklist', p);
  }
  async analyzeAttackPatterns(p: { timeRange: string; groupBy?: string; includeGeo?: boolean; predictTrends?: boolean }) {
    return this.callFunction('analyze_attack_patterns', p);
  }
  async testRule(p: { ruleId: string; testPayloads?: string[]; includeOwasp?: boolean; reportFalsePositives?: boolean }) {
    return this.callFunction('test_rule', p);
  }
  async configureProtection(p: { protectionLevel: string; owaspRules?: boolean; customRules?: string[]; exceptions?: string[] }) {
    return this.callFunction('configure_protection', p);
  }
  async investigateIncident(p: { incidentId: string; includePayloads?: boolean; traceSource?: boolean; generateReport?: boolean }) {
    return this.callFunction('investigate_incident', p);
  }
  async generateReport(p: { reportType: string; timeRange: string; format?: string; includeRecommendations?: boolean }) {
    return this.callFunction('generate_report', p);
  }
}

export const wafManagerAI = new WAFManagerAIService();
export default wafManagerAI;

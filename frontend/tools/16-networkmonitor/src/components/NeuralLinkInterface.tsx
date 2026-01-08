/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for NetworkMonitor Tool
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function NeuralLinkInterface() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to NetworkMonitor AI Assistant. I can help you with traffic analysis, threat detection, network topology, and performance optimization. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('traffic') || input.includes('bandwidth')) {
      return 'Current Network Traffic:\n\n📊 **Bandwidth Usage**:\n• Inbound: 847 Mbps (42% capacity)\n• Outbound: 523 Mbps (26% capacity)\n\n🔝 **Top Talkers**:\n1. 10.0.1.45 → 234 Mbps (Database sync)\n2. 10.0.2.12 → 156 Mbps (API traffic)\n3. 10.0.3.78 → 98 Mbps (File transfer)\n\nNo bandwidth anomalies detected.';
    }

    if (input.includes('anomaly') || input.includes('threat')) {
      return '⚠️ **Recent Anomalies Detected**:\n\n1. **Port Scan** (5 min ago)\n   • Source: 45.33.32.156\n   • Target: 10.0.0.0/24\n   • Status: Blocked\n\n2. **Unusual DNS** (23 min ago)\n   • High volume queries to unknown domain\n   • Status: Under investigation\n\n3. **Traffic Spike** (1 hour ago)\n   • 300% increase from normal\n   • Status: Identified as backup job';
    }

    if (input.includes('device') || input.includes('topology')) {
      return 'Network Topology Summary:\n\n🖥️ **Active Devices**: 247\n• Servers: 34\n• Workstations: 156\n• Network devices: 28\n• IoT devices: 29\n\n🔗 **Segments**:\n• Production: 10.0.1.0/24\n• Development: 10.0.2.0/24\n• Management: 10.0.3.0/24\n\nAll core switches healthy ✅';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your NetworkMonitor AI assistant, I can help with:\n\n📡 **Traffic Analysis**: Monitor bandwidth and flows\n🚨 **Threat Detection**: Identify anomalies and attacks\n🗺️ **Network Topology**: Visualize your infrastructure\n📈 **Performance**: Latency and throughput metrics\n🔍 **Investigation**: Deep dive into specific events\n\nWhat specific aspect would you like to explore?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-blue-200 text-sm">AI Realtime Assistant - NetworkMonitor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-xl ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 border border-blue-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-blue-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-blue-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about network traffic, security, or performance..."
            className="flex-1 p-3 bg-gray-800 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send • AI responses powered by Claude Opus/Sonnet 4.5
        </div>
      </div>
    </div>
  );
}

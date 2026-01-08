/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for VPNGuardian Tool
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
      content: 'Welcome to VPNGuardian AI Assistant. I can help you with VPN connection monitoring, session management, anomaly detection, and security policies. How can I assist you today?',
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

    if (input.includes('connection') || input.includes('session')) {
      return 'VPN Connections:\n\n• Active sessions: 234\n• Unique users: 189\n• Locations: 15 countries\n• Avg duration: 4.2 hours\n\nAll connections are secure and authenticated.';
    }

    if (input.includes('anomaly') || input.includes('suspicious')) {
      return 'Anomaly Detection:\n\n• Alerts today: 7\n• High risk: 1\n• Medium risk: 3\n• Low risk: 3\n\nOne unusual location login detected for user "jsmith".';
    }

    if (input.includes('usage') || input.includes('bandwidth')) {
      return 'VPN Usage Analytics:\n\n• Total bandwidth: 2.4 TB today\n• Peak users: 312 (2 PM)\n• Avg latency: 45ms\n• Uptime: 99.97%\n\nNetwork performance is optimal.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your VPNGuardian AI assistant, I can help with:\n\n👥 **Sessions**: Monitor active connections\n🔍 **Anomalies**: Detect suspicious activity\n📊 **Analytics**: Usage and performance stats\n🔐 **Security**: Connection policies\n⚙️ **Config**: VPN server management\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-violet-900 p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-purple-200 text-sm">AI Realtime Assistant - VPNGuardian</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Tool
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl rounded-xl p-4 ${
              msg.type === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-100 border border-purple-500/20'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-50 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl p-4 border border-purple-500/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-purple-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about VPN connections, sessions, or security..."
            className="flex-1 bg-gray-800 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

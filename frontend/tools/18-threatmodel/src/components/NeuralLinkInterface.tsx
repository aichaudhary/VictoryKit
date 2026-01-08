/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for ThreatModel Tool
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
      content: 'Welcome to ThreatModel AI Assistant. I can help you with threat modeling, attack surface analysis, STRIDE methodology, and mitigation strategies. How can I assist you today?',
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

    if (input.includes('stride')) {
      return 'STRIDE Threat Categories:\n\n🎭 **S**poofing - Identity attacks\n🔧 **T**ampering - Data modification\n🙈 **R**epudiation - Denying actions\n📢 **I**nformation Disclosure - Data leaks\n🚫 **D**enial of Service - Availability attacks\n⬆️ **E**levation of Privilege - Unauthorized access\n\nI can help analyze your system against each category. What component would you like to assess?';
    }

    if (input.includes('attack surface') || input.includes('entry point')) {
      return 'Attack Surface Analysis:\n\n🌐 **External Entry Points**:\n• Web applications (12 endpoints)\n• APIs (34 routes)\n• VPN access points\n\n🏠 **Internal Attack Vectors**:\n• Service accounts (23)\n• Inter-service communication\n• Database connections\n\n📱 **Mobile/Remote**:\n• Mobile apps (2)\n• Remote access tools\n\nWould you like to deep-dive into any category?';
    }

    if (input.includes('mitigat') || input.includes('fix') || input.includes('recommend')) {
      return 'Mitigation Recommendations:\n\n🔴 **Critical Priority**:\n1. SQL Injection in /api/users\n   → Implement parameterized queries\n2. Missing authentication on admin panel\n   → Add MFA requirement\n\n🟠 **High Priority**:\n3. Outdated TLS version\n   → Upgrade to TLS 1.3\n\n🟡 **Medium Priority**:\n4. Verbose error messages\n   → Implement generic error responses';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your ThreatModel AI assistant, I can help with:\n\n🎯 **STRIDE Analysis**: Systematic threat identification\n🗺️ **Attack Surface**: Map entry points and vectors\n🔍 **Vulnerability Assessment**: Identify weaknesses\n📋 **Mitigation Plans**: Prioritized remediation\n📊 **Risk Scoring**: Quantify threat impact\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-900 p-4 border-b border-rose-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-rose-200 text-sm">AI Realtime Assistant - ThreatModel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
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
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-800/50 border border-rose-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-rose-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-rose-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-rose-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about threat modeling, STRIDE, or attack surface analysis..."
            className="flex-1 p-3 bg-gray-800 border border-rose-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-rose-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

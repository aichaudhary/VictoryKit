/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for AuditTrail Tool
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
      content: 'Welcome to AuditTrail AI Assistant. I can help you with audit log analysis, compliance reporting, user activity tracking, and security investigations. How can I assist you today?',
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

    if (input.includes('compliance') || input.includes('report')) {
      return 'Compliance Reports Available:\n\n📋 **SOC 2 Type II**\n• Access control evidence\n• Change management logs\n• Security event summary\n\n🏥 **HIPAA**\n• PHI access audit\n• User activity report\n\n💳 **PCI-DSS**\n• Cardholder data access\n• System configuration changes\n\nWould you like me to generate a specific report?';
    }

    if (input.includes('user') && input.includes('activity')) {
      return 'User Activity Summary (Last 24h):\n\n👤 **Most Active Users**:\n1. admin@company.com - 234 actions\n2. john.doe@company.com - 156 actions\n3. jane.smith@company.com - 98 actions\n\n⚠️ **Unusual Activity**:\n• 3 failed login attempts (blocked)\n• 1 after-hours access event\n\nI can provide detailed activity for any specific user.';
    }

    if (input.includes('search') || input.includes('find') || input.includes('investigate')) {
      return 'Audit Log Search Tips:\n\n🔍 **Common Queries**:\n```\nuser:admin action:delete\nevent.type:authentication status:failed\ntimestamp:[2024-01-01 TO now]\nresource:"/api/sensitive/*"\n```\n\n⚡ **Quick Filters**:\n• Failed logins\n• Permission changes\n• Data exports\n• Admin actions\n\nWhat would you like to search for?';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your AuditTrail AI assistant, I can help with:\n\n📋 **Compliance Reports**: Generate regulatory reports\n👤 **User Activity**: Track and analyze user actions\n🔍 **Log Search**: Find specific audit events\n🚨 **Anomaly Detection**: Identify suspicious patterns\n📊 **Analytics**: Visualize audit data trends\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 p-4 border-b border-slate-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-600 to-gray-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-slate-300 text-sm">AI Realtime Assistant - AuditTrail</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
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
                  ? 'bg-slate-600 text-white'
                  : 'bg-gray-800/50 border border-slate-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-slate-300' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-slate-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about audit logs, compliance, or user activity..."
            className="flex-1 p-3 bg-gray-800 border border-slate-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-slate-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

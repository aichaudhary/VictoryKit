/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for AccessControl Tool
 */

import { useState, useEffect, useRef } from 'react';

interface NeuralLinkInterfaceProps {
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function NeuralLinkInterface({ onClose }: NeuralLinkInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to AccessControl AI Assistant. I can help you with role management, permission analysis, policy creation, and security insights. How can I assist you today?',
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

    // Simulate AI response (replace with actual Claude API integration)
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

    if (input.includes('role') && input.includes('create')) {
      return 'To create a new role in AccessControl:\n\n1. Navigate to the Roles tab\n2. Click "Create Role"\n3. Define role name and description\n4. Assign appropriate permissions\n5. Set role hierarchy if needed\n6. Save the role\n\nWould you like me to guide you through creating a specific role?';
    }

    if (input.includes('permission') && input.includes('user')) {
      return 'For user permission analysis:\n\n• Check the user\'s assigned roles\n• Review role permissions and inheritance\n• Evaluate active policies\n• Consider attribute-based conditions\n\nI can help analyze specific user permissions if you provide their username or email.';
    }

    if (input.includes('policy') || input.includes('abac')) {
      return 'AccessControl supports Attribute-Based Access Control (ABAC) policies:\n\n• Define conditions based on user attributes\n• Set resource-specific rules\n• Configure time-based restrictions\n• Enable risk-based evaluations\n\nABAC provides more granular control than traditional RBAC. Would you like to create a policy?';
    }

    if (input.includes('audit') || input.includes('log')) {
      return 'The audit system tracks all access control events:\n\n• User authentication attempts\n• Permission evaluations\n• Role assignments\n• Policy changes\n• Security incidents\n\nAll logs are immutable and searchable. I can help you analyze specific audit patterns.';
    }

    if (input.includes('security') || input.includes('risk')) {
      return 'Security insights from your AccessControl system:\n\n• Current risk score: Low\n• MFA adoption: 85%\n• Failed login attempts: 12 (last 24h)\n• Policy violations: 3 (last week)\n\nI recommend reviewing the recent permission denials and considering additional MFA requirements.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your AccessControl AI assistant, I can help with:\n\n🔐 **Role Management**: Create, modify, and organize roles\n👥 **User Permissions**: Analyze and optimize user access\n📋 **Policy Creation**: Design ABAC policies and rules\n📊 **Security Insights**: Risk assessment and recommendations\n📝 **Audit Analysis**: Review access patterns and anomalies\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-purple-200 text-sm">AI Realtime Assistant - AccessControl</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
                  : 'bg-gray-800/50 border border-purple-500/30 text-gray-100'
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
            <div className="bg-gray-800/50 border border-purple-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about AccessControl, roles, permissions, or security..."
            className="flex-1 p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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
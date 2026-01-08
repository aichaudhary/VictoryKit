/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for BiometricAI Tool
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
      content: 'Welcome to BiometricAI Assistant. I can help you with facial recognition, fingerprint analysis, behavioral biometrics, and identity verification. How can I assist you today?',
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

    if (input.includes('face') || input.includes('facial')) {
      return 'Facial recognition status:\n\n• Recognition accuracy: 99.97%\n• Liveness detection: Active\n• 3D depth analysis: Enabled\n• Enrolled faces: 1,247\n\nI can help you enroll new users or analyze recognition patterns.';
    }

    if (input.includes('fingerprint')) {
      return 'Fingerprint analysis:\n\n• Scanners active: 12\n• Match threshold: 0.001% FAR\n• Spoof detection: Enabled\n• Templates stored: 3,892\n\nAll scanners are operating normally.';
    }

    if (input.includes('behavior') || input.includes('typing')) {
      return 'Behavioral biometrics:\n\n• Active monitoring: 847 users\n• Anomaly detection: 3 alerts today\n• Typing pattern accuracy: 98.2%\n• Mouse dynamics: Enabled\n\nContinuous authentication is protecting your users.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your BiometricAI assistant, I can help with:\n\n📷 **Facial Recognition**: Enrollment and matching\n👆 **Fingerprint**: Analysis and management\n🧠 **Behavioral**: Continuous authentication\n🔐 **Identity Verification**: Multi-factor biometrics\n📊 **Analytics**: Usage patterns and insights\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-fuchsia-900 p-4 border-b border-violet-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-violet-200 text-sm">AI Realtime Assistant - BiometricAI</p>
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
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-800 text-gray-100 border border-violet-500/20'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-50 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl p-4 border border-violet-500/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-violet-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about biometrics, facial recognition, or identity..."
            className="flex-1 bg-gray-800 border border-violet-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

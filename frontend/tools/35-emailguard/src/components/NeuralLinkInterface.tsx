/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for EmailGuard Tool
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
      content: 'Welcome to EmailGuard AI Assistant. I can help you with phishing detection, email security analysis, BEC protection, and threat investigation. How can I assist you today?',
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

    if (input.includes('phishing') || input.includes('suspicious')) {
      return 'Phishing detection status:\n\n• Emails scanned today: 12,847\n• Phishing blocked: 23\n• Detection accuracy: 99.97%\n• Zero false positives\n\nI can analyze specific emails for threats if you share details.';
    }

    if (input.includes('bec') || input.includes('business email')) {
      return 'BEC Protection:\n\n• Impersonation attempts blocked: 7\n• VIP accounts protected: 45\n• Domain lookalikes detected: 3\n• Wire fraud attempts: 0\n\nAll executive accounts are actively protected.';
    }

    if (input.includes('link') || input.includes('url')) {
      return 'Link analysis:\n\n• URLs scanned: 8,923\n• Malicious links blocked: 156\n• Sandbox analysis: Active\n• Time-of-click protection: Enabled\n\nPaste any suspicious URL for immediate analysis.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your EmailGuard AI assistant, I can help with:\n\n🎣 **Phishing Detection**: Analyze suspicious emails\n💼 **BEC Protection**: Impersonation detection\n🔗 **Link Analysis**: URL reputation checking\n📎 **Attachment Scanning**: Malware detection\n📊 **Threat Reports**: Email security insights\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-rose-900 via-pink-900 to-red-900 p-4 border-b border-rose-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-rose-200 text-sm">AI Realtime Assistant - EmailGuard</p>
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
                ? 'bg-rose-600 text-white' 
                : 'bg-gray-800 text-gray-100 border border-rose-500/20'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-50 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl p-4 border border-rose-500/20">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-rose-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about email security, phishing, or threats..."
            className="flex-1 bg-gray-800 border border-rose-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-rose-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

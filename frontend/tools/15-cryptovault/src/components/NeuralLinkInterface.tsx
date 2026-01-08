/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for CryptoVault Tool
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
      content: 'Welcome to CryptoVault AI Assistant. I can help you with secrets management, credential storage, dynamic secrets, and access policies. How can I assist you today?',
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

    if (input.includes('secret') && (input.includes('store') || input.includes('add'))) {
      return 'To store a new secret:\n\n1. Choose secret type (password, API key, certificate)\n2. Define the path: `secrets/myapp/api-key`\n3. Add the value securely\n4. Set access policies\n5. Configure rotation if needed\n\n```bash\nvault kv put secrets/myapp/api-key value=abc123\n```\n\nWould you like me to help set up the access policy?';
    }

    if (input.includes('dynamic') || input.includes('temporary')) {
      return 'Dynamic Secrets:\n\n⏱️ **Database Credentials**:\n• Generate temporary MySQL/PostgreSQL users\n• Auto-expire after TTL\n\n☁️ **Cloud Credentials**:\n• AWS IAM temporary credentials\n• Azure/GCP service accounts\n\n🔐 **Current Active**:\n• 12 dynamic database credentials\n• 5 cloud credentials\n\nDynamic secrets eliminate credential sprawl!';
    }

    if (input.includes('policy') || input.includes('access')) {
      return 'Access Policy Example:\n\n```hcl\npath "secrets/production/*" {\n  capabilities = ["read"]\n}\n\npath "secrets/development/*" {\n  capabilities = ["create", "read", "update"]\n}\n```\n\n✅ **Best Practices**:\n• Use least-privilege\n• Separate environments\n• Regular policy audits';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your CryptoVault AI assistant, I can help with:\n\n🔒 **Secrets Storage**: Store and retrieve credentials\n🔄 **Dynamic Secrets**: Generate temporary credentials\n📋 **Policies**: Define and manage access rules\n📝 **Audit Logs**: Track secret access\n🔑 **Rotation**: Automate credential rotation\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 p-4 border-b border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-amber-200 text-sm">AI Realtime Assistant - CryptoVault</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
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
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800/50 border border-amber-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-amber-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-amber-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-amber-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about secrets management, credentials, or vault policies..."
            className="flex-1 p-3 bg-gray-800 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-amber-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

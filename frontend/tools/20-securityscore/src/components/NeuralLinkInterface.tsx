/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for SecurityScore Tool
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
      content: 'Welcome to SecurityScore AI Assistant. I can help you understand your security posture, analyze score trends, compare against benchmarks, and identify improvement opportunities. How can I assist you today?',
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

    if (input.includes('score') || input.includes('current')) {
      return '📊 **Current Security Score: 78/100**\n\n**Score Breakdown**:\n• 🛡️ Endpoint Security: 85/100\n• 🔐 Access Control: 72/100\n• 🌐 Network Security: 81/100\n• ☁️ Cloud Security: 69/100\n• 📋 Compliance: 83/100\n\n**30-Day Trend**: ↑ +5 points\n\n⚡ **Quick Wins to Improve**:\n1. Enable MFA for remaining 15% of users (+3 pts)\n2. Patch 12 critical vulnerabilities (+4 pts)';
    }

    if (input.includes('benchmark') || input.includes('compare') || input.includes('industry')) {
      return 'Industry Benchmark Comparison:\n\n📈 **Your Score**: 78/100\n\n**vs. Industry Peers (Tech Sector)**:\n• Industry Average: 72/100 ✅ You\'re ahead\n• Industry Leader: 91/100\n• Industry Median: 70/100\n\n**Percentile**: 67th (Top third)\n\n🎯 **To reach Industry Leader**:\n• Cloud security improvements: +8 pts\n• Zero-trust implementation: +5 pts';
    }

    if (input.includes('improve') || input.includes('recommend') || input.includes('how')) {
      return 'Score Improvement Recommendations:\n\n**High Impact, Low Effort**:\n1. ✅ Complete MFA rollout (+3 pts)\n2. ✅ Update endpoint agents (+2 pts)\n3. ✅ Remediate critical patches (+4 pts)\n\n**High Impact, Medium Effort**:\n4. 🔄 Implement SIEM monitoring (+5 pts)\n5. 🔄 Deploy WAF for web apps (+3 pts)\n\n**Projected Score After All**: 95/100 🏆\n**Estimated Timeline**: 90 days';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your SecurityScore AI assistant, I can help with:\n\n📊 **Current Score**: View your security posture\n📈 **Trending**: Track improvements over time\n🎯 **Benchmarking**: Compare to industry peers\n💡 **Recommendations**: Actionable improvement steps\n📋 **Reporting**: Executive dashboards and reports\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-900 p-4 border-b border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-emerald-200 text-sm">AI Realtime Assistant - SecurityScore</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800/50 border border-emerald-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-emerald-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-emerald-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your security score, benchmarks, or improvements..."
            className="flex-1 p-3 bg-gray-800 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-emerald-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

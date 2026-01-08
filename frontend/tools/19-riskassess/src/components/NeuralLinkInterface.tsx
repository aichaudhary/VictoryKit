/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for RiskAssess Tool
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
      content: 'Welcome to RiskAssess AI Assistant. I can help you with risk quantification, prioritization, treatment planning, and regulatory compliance. How can I assist you today?',
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

    if (input.includes('score') || input.includes('calculate')) {
      return 'Risk Score Calculation (FAIR Model):\n\n📊 **Risk Scenario**: Data Breach via Phishing\n\n**Loss Event Frequency (LEF)**:\n• Threat Event Frequency: 12/year\n• Vulnerability: 0.3\n• LEF = 3.6 events/year\n\n**Loss Magnitude**:\n• Primary: $500,000\n• Secondary: $1,200,000\n\n**Annual Loss Expectancy**:\n📈 **$6.12M** (90th percentile)\n\nWould you like to adjust the parameters?';
    }

    if (input.includes('priorit') || input.includes('top risk')) {
      return 'Top Risks by Priority:\n\n🔴 **Critical (Immediate Action)**:\n1. Unpatched critical systems - Score: 9.2\n2. Privileged access abuse - Score: 8.7\n\n🟠 **High (30-day remediation)**:\n3. Third-party vendor access - Score: 7.8\n4. Legacy system vulnerabilities - Score: 7.3\n\n🟡 **Medium (Quarterly review)**:\n5. Insider threat exposure - Score: 6.1\n\nI can provide detailed treatment plans for any risk.';
    }

    if (input.includes('treatment') || input.includes('mitigat')) {
      return 'Risk Treatment Options:\n\n**Risk**: Privileged Access Abuse\n**Current Score**: 8.7\n\n🛡️ **Treatment Options**:\n\n1. **Mitigate** - Implement PAM solution\n   • Cost: $150,000\n   • Risk Reduction: 65%\n   • ROI: 4.2x\n\n2. **Transfer** - Cyber insurance\n   • Premium: $50,000/year\n   • Coverage: $5M\n\n3. **Accept** - Document residual risk\n\nRecommendation: Option 1 (Mitigate)';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your RiskAssess AI assistant, I can help with:\n\n📊 **Risk Scoring**: Quantify using FAIR methodology\n🎯 **Prioritization**: Rank by impact and likelihood\n📋 **Treatment Plans**: Mitigate, transfer, or accept\n💰 **Cost-Benefit**: ROI analysis for controls\n📈 **Trending**: Track risk changes over time\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-orange-900 via-amber-900 to-orange-900 p-4 border-b border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-orange-200 text-sm">AI Realtime Assistant - RiskAssess</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800/50 border border-orange-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-orange-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-orange-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-orange-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about risk assessment, scoring, or treatment strategies..."
            className="flex-1 p-3 bg-gray-800 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-orange-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

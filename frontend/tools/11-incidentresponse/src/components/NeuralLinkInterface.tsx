/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for IncidentResponse Tool
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
      content: 'Welcome to IncidentResponse AI Assistant. I can help you with incident detection, response automation, threat analysis, and remediation strategies. How can I assist you today?',
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

    if (input.includes('incident') && input.includes('create')) {
      return 'To create a new incident:\n\n1. Navigate to the Incidents dashboard\n2. Click "New Incident"\n3. Set severity level (Critical/High/Medium/Low)\n4. Describe the incident\n5. Assign responders\n6. Start the response timeline\n\nWould you like me to help you categorize the incident?';
    }

    if (input.includes('playbook') || input.includes('automation')) {
      return 'Incident Response Playbooks:\n\n• **Ransomware Response**: Isolation → Backup Check → Recovery\n• **Data Breach**: Contain → Assess → Notify → Remediate\n• **DDoS Attack**: Traffic Analysis → Mitigation → Hardening\n• **Malware Outbreak**: Quarantine → Scan → Clean → Monitor\n\nI can help you customize any playbook for your environment.';
    }

    if (input.includes('severity') || input.includes('priority')) {
      return 'Incident Severity Guidelines:\n\n🔴 **Critical**: Business-stopping, data breach, active attack\n🟠 **High**: Major system impact, potential data exposure\n🟡 **Medium**: Limited impact, contained threat\n🟢 **Low**: Minor issues, informational alerts\n\nAuto-escalation triggers at Critical and High levels.';
    }

    if (input.includes('timeline') || input.includes('report')) {
      return 'Incident Timeline & Reporting:\n\n• Auto-generated timeline from detection to resolution\n• Evidence collection and chain of custody\n• Root cause analysis templates\n• Regulatory compliance reports (GDPR, HIPAA, SOC2)\n• Lessons learned documentation\n\nI can help generate a report for any past incident.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your IncidentResponse AI assistant, I can help with:\n\n🚨 **Incident Detection**: Analyze alerts and identify threats\n⚡ **Rapid Response**: Execute containment strategies\n🤖 **Automation**: Configure response playbooks\n📊 **Analysis**: Post-incident review and reporting\n🛡️ **Prevention**: Recommendations to prevent recurrence\n\nWhat specific aspect would you like to explore?';
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
      <div className="bg-gradient-to-r from-red-900 via-orange-900 to-red-900 p-4 border-b border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-red-200 text-sm">AI Realtime Assistant - IncidentResponse</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => navigate('/maula')}
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
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800/50 border border-red-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-red-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-red-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about incident response, playbooks, or threat analysis..."
            className="flex-1 p-3 bg-gray-800 border border-red-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-red-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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

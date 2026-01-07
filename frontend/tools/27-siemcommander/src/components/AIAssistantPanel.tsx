import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Sparkles, Shield, AlertTriangle,
  Search, FileText, Zap, Target, RefreshCw, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import type { ChatMessage } from '../types';
import { AI_SUGGESTIONS } from '../constants';

// Mock conversation history
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm the SIEMCommander AI Assistant. I can help you with threat analysis, investigation assistance, playbook recommendations, and query generation. How can I assist you today?",
    timestamp: new Date(Date.now() - 600000),
  },
];

const AIAssistantPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (query: string): string => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('brute force') || queryLower.includes('failed login')) {
      return `Based on my analysis, I've identified potential brute force activity. Here's what I found:

**Detection Summary:**
- 15 failed login attempts detected from IP 192.168.1.100
- Target: admin@company.com
- Timeframe: Last 10 minutes

**Recommended Actions:**
1. Block the source IP at the firewall
2. Force password reset for the targeted account
3. Enable MFA if not already active
4. Run the "Brute Force Mitigation" playbook

**KQL Query to investigate:**
\`\`\`
SecurityEvent
| where EventID == 4625
| where TargetAccount == "admin@company.com"
| summarize Attempts = count() by SourceIP, bin(TimeGenerated, 1m)
\`\`\`

Would you like me to execute the playbook or generate a detailed incident report?`;
    }
    
    if (queryLower.includes('ioc') || queryLower.includes('indicator')) {
      return `I'll help you analyze IOCs. Here's my assessment:

**IOC Analysis Results:**

| IOC | Type | Reputation | Confidence |
|-----|------|------------|------------|
| 45.33.32.156 | IP | Malicious | 95% |
| evil-domain.com | Domain | Malicious | 92% |
| a1b2c3d4e5f6... | Hash | Unknown | - |

**Threat Intelligence:**
- IP 45.33.32.156 is associated with APT29 C2 infrastructure
- Domain registered recently (7 days ago) with privacy protection
- Hash not found in VirusTotal or internal threat intel

**Recommended Actions:**
1. Block IOCs at perimeter
2. Search historical logs for any prior communication
3. Identify affected assets

Would you like me to add these to the blocklist?`;
    }
    
    if (queryLower.includes('playbook') || queryLower.includes('automat')) {
      return `Based on the current alert context, I recommend the following playbooks:

**Best Match: Malware Containment (PB-001)**
- Success Rate: 94.5%
- Avg Duration: 7 minutes
- Steps: Isolate → Collect Evidence → Terminate → Notify

**Alternative Options:**
1. **Phishing Response** - If email-based attack vector
2. **Data Exfiltration Response** - If data loss detected
3. **Credential Compromise** - If credentials at risk

Would you like me to:
- Execute the Malware Containment playbook
- Show detailed steps for any playbook
- Create a custom response workflow`;
    }
    
    return `I've analyzed your query and here's what I can help with:

**Understanding:** You're asking about "${query}"

**Available Actions:**
1. **Search Events** - Query logs for related activity
2. **Threat Analysis** - Assess indicators and risks
3. **Generate Report** - Create incident documentation
4. **Run Playbook** - Automate response actions

**Quick Insights:**
- No critical alerts matching this query in the last 24h
- Related detection rules are functioning normally
- System health is optimal

How would you like me to proceed? I can dive deeper into any of these areas.`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-gray-400 text-sm mt-1">Intelligent security analysis and response</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: Search, label: 'Search Events', color: 'text-blue-400' },
          { icon: AlertTriangle, label: 'Analyze Threat', color: 'text-red-400' },
          { icon: Zap, label: 'Run Playbook', color: 'text-yellow-400' },
          { icon: FileText, label: 'Generate Report', color: 'text-green-400' },
        ].map((action, i) => (
          <button
            key={i}
            className="flex items-center gap-2 p-3 bg-[#1E293B] border border-[#334155] rounded-lg hover:border-violet-500 transition-colors"
          >
            <action.icon className={`w-5 h-5 ${action.color}`} />
            <span className="text-gray-300 text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#1E293B] rounded-xl border border-[#334155] flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' ? 'bg-violet-500/20' : 'bg-blue-500/20'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-violet-400" />
                ) : (
                  <User className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.role === 'assistant' 
                    ? 'bg-[#0F172A] text-gray-300' 
                    : 'bg-violet-600 text-white'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-1 hover:bg-[#334155] rounded transition-colors">
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-[#334155] rounded transition-colors">
                      <ThumbsUp className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-[#334155] rounded transition-colors">
                      <ThumbsDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <div className="bg-[#0F172A] rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-gray-400 text-xs">Suggested prompts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 bg-[#0F172A] border border-[#334155] rounded-lg text-gray-300 text-xs hover:border-violet-500 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#334155]">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about security events, threats, or investigations..."
              className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;

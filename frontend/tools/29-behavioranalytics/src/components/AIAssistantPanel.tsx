import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Shield,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
} from 'lucide-react';
import type { ChatMessage } from '../types';
import { AI_SUGGESTIONS } from '../constants';

// Mock responses
const mockResponses: Record<string, string> = {
  'What is my current security posture?': `Based on the latest assessment, your organization's security posture shows:

**Overall Score: 78/100 (Grade C)**

**Key Strengths:**
- DNS Health: 91/100 - Excellent configuration
- Hacker Chatter: 95/100 - Minimal dark web exposure
- Information Disclosure: 88/100 - Good data handling practices

**Areas for Improvement:**
- Patching Cadence: 58/100 - Critical patches are overdue
- Leaked Credentials: 65/100 - 15 credentials found in recent breaches
- Application Security: 68/100 - OWASP vulnerabilities detected

**Recommendation:** Focus on patching the critical Apache vulnerability (CVE-2024-1234) and enforce MFA for all compromised accounts.`,

  'Which vendors pose the highest risk?': `I've identified the following high-risk vendors:

**🔴 Critical Risk:**
1. **PaySecure Inc** (Score: 58/F)
   - PCI DSS compliance concerns
   - Declining security trend
   - Status: Under Review

2. **CloudCore Services** (Score: 62/D)
   - Tier 1 critical vendor
   - 5-point score decline in 30 days
   - Open vulnerabilities in their infrastructure

**Recommended Actions:**
- Schedule immediate security review with PaySecure
- Require remediation plan from CloudCore within 30 days
- Consider backup payment processor options`,

  'What should I prioritize for remediation?': `Based on impact analysis, here are your top remediation priorities:

**Priority 1: Critical (Immediate Action)**
1. **Patch Apache Servers** (+15 pts impact)
   - CVE-2024-1234 RCE vulnerability
   - Due: Within 48 hours

2. **Disable TLS 1.0/1.1** (+8 pts impact)
   - PCI DSS compliance requirement
   - Status: In Progress (50% complete)

**Priority 2: High (This Week)**
3. **Close RDP Ports** (+12 pts impact)
   - Implement VPN-only access
   - Affected hosts: 2

4. **Credential Reset** (+10 pts impact)
   - 15 accounts compromised
   - Enable MFA enforcement

**Total Potential Impact:** +45 points (Score: 78 → 123 normalized)`,

  'How do I compare to industry peers?': `Here's your industry benchmark comparison:

**Your Position:**
- Score: 78 (68th percentile)
- Above average by 6 points
- Peer group: 1,247 organizations

**Comparison to Technology Industry:**
| Factor | You | Average | Status |
|--------|-----|---------|--------|
| DNS Health | 91 | 82 | ✅ Above |
| Endpoint Security | 85 | 70 | ✅ Above |
| Patching Cadence | 58 | 65 | ❌ Below |
| App Security | 68 | 66 | ✅ Above |

**To Reach Top 25%:**
- Need 7 more points (target: 85)
- Focus on patching cadence (+7 potential)
- Improve leaked credentials (+5 potential)`,

  'Calculate financial risk exposure': `**Financial Risk Quantification Report**

Based on your current risk profile and $50M annual revenue:

**Annualized Loss Expectancy (ALE):**
- Conservative: $1.2M
- Expected: $2.8M
- Worst Case (95%): $5.4M

**Breach Probability (12-month):**
- Current: 12.3%
- After remediation: ~6.1%

**ROI of Remediation:**
- Investment needed: ~$150K
- Risk reduction: $1.4M
- **ROI: 833%**

**Key Risk Factors Contributing:**
1. Patching delays: $800K exposure
2. Credential breaches: $600K exposure
3. RDP exposure: $400K exposure

Would you like me to generate a detailed financial risk report?`,

  'Show compliance gaps for SOC 2': `**SOC 2 Compliance Gap Analysis**

**Overall Compliance Status: 78%**

**Trust Service Criteria Coverage:**

✅ **Security (CC)** - 82%
- CC6.1: Logical Access ⚠️ (RDP exposure)
- CC6.7: Transmission Encryption ⚠️ (TLS 1.0)
- CC7.1: Vulnerability Management ❌ (Patching)

✅ **Availability (A)** - 85%
- A1.1: Capacity Management ✅
- A1.2: Recovery Objectives ✅

⚠️ **Processing Integrity (PI)** - 75%
- PI1.1: Completeness ✅
- PI1.4: Output Review ⚠️

⚠️ **Confidentiality (C)** - 72%
- C1.1: Identification ⚠️ (Leaked creds)
- C1.2: Protection ✅

**Remediation to Full Compliance:**
1. Close RDP ports → CC6.1
2. Disable TLS 1.0 → CC6.7
3. Patch critical vulns → CC7.1
4. Credential reset → C1.1`,
};

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI security assistant. I can help you analyze your risk posture, identify vulnerabilities, assess vendor risks, and provide remediation recommendations. What would you like to know?",
      timestamp: new Date(),
      suggestions: AI_SUGGESTIONS.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = mockResponses[text] || 
        `I understand you're asking about "${text}". Let me analyze your security data...\n\nBased on your current risk profile (Score: 78/100), I can provide insights on this topic. Could you please specify if you want me to focus on:\n\n1. Risk factors analysis\n2. Vendor assessment\n3. Remediation recommendations\n4. Compliance mapping\n5. Financial risk quantification`;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: AI_SUGGESTIONS.slice(0, 3),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Shield, label: 'Security Posture', query: 'What is my current security posture?' },
    { icon: Users, label: 'Vendor Risks', query: 'Which vendors pose the highest risk?' },
    { icon: AlertTriangle, label: 'Remediation', query: 'What should I prioritize for remediation?' },
    { icon: TrendingUp, label: 'Benchmarks', query: 'How do I compare to industry peers?' },
    { icon: DollarSign, label: 'Financial Risk', query: 'Calculate financial risk exposure' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-amber-500" />
            AI Assistant
          </h1>
          <p className="text-gray-400 mt-1">Get AI-powered security insights and recommendations</p>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-2 px-4 py-2 border border-[#2A2A2F] rounded-lg text-gray-400 hover:text-white hover:bg-[#252529] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.query)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg text-gray-400 hover:text-white hover:border-amber-500/30 transition-colors whitespace-nowrap"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-amber-500/20'
                      : 'bg-blue-500/20'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  ) : (
                    <User className="w-4 h-4 text-blue-500" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block rounded-xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-amber-500/20 text-white'
                        : 'bg-[#252529] text-gray-300'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>

                  {/* Actions for assistant messages */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="p-1 hover:bg-[#252529] rounded transition-colors">
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-[#252529] rounded transition-colors">
                        <ThumbsUp className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-[#252529] rounded transition-colors">
                        <ThumbsDown className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {message.role === 'assistant' && message.suggestions && (
                <div className="ml-11 mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(suggestion)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#252529] hover:bg-[#2A2A2F] rounded-lg text-gray-400 text-sm transition-colors"
                    >
                      <Lightbulb className="w-3 h-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="bg-[#252529] rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your security posture, risks, or get recommendations..."
          className="flex-1 bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed rounded-xl text-black font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send
        </button>
      </div>
    </div>
  );
}

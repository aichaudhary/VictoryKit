import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, User, Copy, ThumbsUp, ThumbsDown, 
  AlertCircle, Briefcase, Play, Search, Lightbulb 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  onCreateCase: (data: any) => void;
  onRunPlaybook: (id: string) => void;
  onEnrichIOC: (ioc: string, type: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  onCreateCase,
  onRunPlaybook,
  onEnrichIOC,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm SOAR AI, your security operations assistant. I can help you:\n\n• **Investigate threats** - Analyze IOCs and threat intelligence\n• **Manage cases** - Create, update, and escalate security incidents\n• **Run playbooks** - Execute automated response workflows\n• **Generate reports** - Create compliance and incident reports\n\nHow can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        'Analyze suspicious IP 192.168.1.100',
        'Show open critical cases',
        'Run malware containment playbook',
        'Create incident for phishing attempt'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('ip') || lowerQuery.includes('analyze') || lowerQuery.includes('investigate')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**IOC Analysis Results**\n\nI've analyzed the indicator. Here's what I found:\n\n🔴 **Threat Score:** 85/100 (High Risk)\n\n**Details:**\n• First seen: 3 days ago\n• Location: Eastern Europe\n• Associated malware: TrickBot\n• Known campaigns: 12\n\n**Recommendations:**\n1. Block at perimeter firewall\n2. Scan all endpoints for connections\n3. Review related network traffic\n\nWould you like me to create a case for this threat?`,
        timestamp: new Date(),
        suggestions: ['Create case for this threat', 'Run IOC sweep playbook', 'Check related indicators']
      };
    }

    if (lowerQuery.includes('case') || lowerQuery.includes('incident')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Open Cases Summary**\n\n🔴 **Critical (3):**\n• CASE-001: Ransomware detected on PROD-DB\n• CASE-002: Data exfiltration attempt\n• CASE-003: Compromised admin credentials\n\n🟠 **High (7):**\n• Various malware and phishing incidents\n\n🟡 **Medium (15):**\n• Suspicious activity requiring review\n\nWould you like details on any specific case?`,
        timestamp: new Date(),
        suggestions: ['Show CASE-001 details', 'Escalate critical cases', 'Assign cases to team']
      };
    }

    if (lowerQuery.includes('playbook') || lowerQuery.includes('run')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Available Playbooks**\n\nI can execute these automated workflows:\n\n1. 🛡️ **Malware Containment**\n   Isolate host, collect artifacts, scan network\n\n2. 🎣 **Phishing Response**\n   Block sender, remove emails, notify users\n\n3. 🔐 **Credential Compromise**\n   Reset passwords, revoke sessions, audit access\n\n4. 📊 **Threat Intel Enrichment**\n   Query all threat feeds, compile report\n\nWhich playbook should I run?`,
        timestamp: new Date(),
        suggestions: ['Run Malware Containment', 'Run Phishing Response', 'Create custom playbook']
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I understand you're asking about "${query}". Let me help you with that.\n\nI can assist with:\n• **Investigation** - Analyze threats and IOCs\n• **Response** - Execute playbooks and containment\n• **Reporting** - Generate security reports\n• **Management** - Handle cases and alerts\n\nCould you provide more details about what you'd like to accomplish?`,
      timestamp: new Date(),
      suggestions: ['Investigate a threat', 'Show open cases', 'Run a playbook', 'Generate report']
    };
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">SOAR AI Assistant</h3>
          <p className="text-sm text-gray-400">Powered by AI • Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' ? 'bg-blue-500/20' : 'bg-purple-500/20'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-blue-400" />
              ) : (
                <Bot className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'bg-slate-900/50 border border-slate-700'
              }`}>
                <div className="text-sm text-white whitespace-pre-wrap" style={{ textAlign: 'left' }}>
                  {message.content.split('\n').map((line, idx) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <div key={idx} className="font-bold text-purple-300">{line.replace(/\*\*/g, '')}</div>;
                    }
                    if (line.startsWith('•')) {
                      return <div key={idx} className="ml-2">{line}</div>;
                    }
                    return <div key={idx}>{line}</div>;
                  })}
                </div>
              </div>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-green-400 transition-colors" title="Helpful">
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-red-400 transition-colors" title="Not helpful">
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              )}
              {message.suggestions && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(suggestion)}
                      className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-full text-gray-300 transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3 text-yellow-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleSuggestion('Investigate suspicious activity')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-gray-400 transition-colors"
        >
          <Search className="w-3 h-3" /> Investigate
        </button>
        <button
          onClick={() => handleSuggestion('Create a new case')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-gray-400 transition-colors"
        >
          <Briefcase className="w-3 h-3" /> New Case
        </button>
        <button
          onClick={() => handleSuggestion('Run a playbook')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-gray-400 transition-colors"
        >
          <Play className="w-3 h-3" /> Run Playbook
        </button>
        <button
          onClick={() => handleSuggestion('Show critical alerts')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-gray-400 transition-colors"
        >
          <AlertCircle className="w-3 h-3" /> Alerts
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask SOAR AI anything..."
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'info' | 'warning' | 'error' | 'success';
}

const NeuralLinkInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to DLP Neural Link Interface. I can help you with data loss prevention tasks, policy management, incident investigation, and compliance reporting.',
      timestamp: new Date(),
      type: 'info'
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

    try {
      // Process command locally or send to AI
      const response = await processCommand(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: response.type
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processCommand = async (command: string): Promise<{ content: string; type?: 'info' | 'warning' | 'error' | 'success' }> => {
    const lowerCommand = command.toLowerCase();

    // Scan commands
    if (lowerCommand.includes('scan') && lowerCommand.includes('content')) {
      return {
        content: 'To scan content for sensitive data, go to the Content Scanner tab or use the API endpoint POST /api/v1/dlp/scan/content with your text content.',
        type: 'info'
      };
    }

    if (lowerCommand.includes('incident') || lowerCommand.includes('alert')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4041'}/api/v1/dlp/incidents?limit=5`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            return {
              content: `Found ${data.pagination.total} incidents. Latest: ${data.data.map((i: { incidentId: string; severity: string; status: string }) => `\n• ${i.incidentId} (${i.severity}) - ${i.status}`).join('')}`,
              type: 'warning'
            };
          }
          return { content: 'No incidents found. Your data is secure!', type: 'success' };
        }
      } catch {
        return { content: 'Could not fetch incidents. API may be offline.', type: 'error' };
      }
    }

    if (lowerCommand.includes('policy') || lowerCommand.includes('policies')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4041'}/api/v1/dlp/policies`);
        if (response.ok) {
          const data = await response.json();
          return {
            content: `You have ${data.pagination?.total || 0} DLP policies configured. Go to the Policies tab to manage them.`,
            type: 'info'
          };
        }
      } catch {
        return { content: 'Could not fetch policies. API may be offline.', type: 'error' };
      }
    }

    if (lowerCommand.includes('status') || lowerCommand.includes('health')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4041'}/health`);
        if (response.ok) {
          return { content: '✅ DLP API is healthy and running on port 4041.', type: 'success' };
        }
      } catch {
        return { content: '❌ DLP API is not responding. Please check if the server is running.', type: 'error' };
      }
    }

    if (lowerCommand.includes('integration') || lowerCommand.includes('connect')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4041'}/api/v1/dlp/integrations/status`);
        if (response.ok) {
          const data = await response.json();
          const integrations = data.data;
          const configured = Object.entries(integrations)
            .filter(([, v]) => (v as { configured?: boolean }).configured)
            .map(([k]) => k);
          return {
            content: configured.length > 0 
              ? `Connected integrations: ${configured.join(', ')}` 
              : 'No integrations configured yet. Add API keys in your .env file.',
            type: configured.length > 0 ? 'success' : 'info'
          };
        }
      } catch {
        return { content: 'Could not check integrations status.', type: 'error' };
      }
    }

    if (lowerCommand.includes('help')) {
      return {
        content: `Available commands:
• "scan content" - Learn about content scanning
• "show incidents" - View recent DLP incidents  
• "list policies" - View configured policies
• "check status" - Check API health
• "show integrations" - View connected services
• "generate report" - Create compliance report`,
        type: 'info'
      };
    }

    // Default response
    return {
      content: 'I understand you\'re asking about DLP. Try commands like "help", "show incidents", "check status", or "list policies".',
      type: 'info'
    };
  };

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') return <User size={16} />;
    if (message.type === 'warning') return <AlertTriangle size={16} className="text-yellow-400" />;
    if (message.type === 'error') return <AlertTriangle size={16} className="text-red-400" />;
    if (message.type === 'success') return <CheckCircle size={16} className="text-green-400" />;
    if (message.type === 'info') return <Info size={16} className="text-blue-400" />;
    return <Bot size={16} className="text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Neural Link Interface</h1>
            <p className="text-sm text-gray-400">DLP AI Assistant</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                {getMessageIcon(message)}
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600'
                  : message.type === 'error'
                  ? 'bg-red-900/50 border border-red-700'
                  : message.type === 'warning'
                  ? 'bg-yellow-900/50 border border-yellow-700'
                  : message.type === 'success'
                  ? 'bg-green-900/50 border border-green-700'
                  : 'bg-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-purple-400" />
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-400">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about DLP policies, incidents, or scans..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralLinkInterface;

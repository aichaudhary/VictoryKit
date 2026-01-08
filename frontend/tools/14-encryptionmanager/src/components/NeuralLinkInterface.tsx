/**
 * Neural Link Interface Component
 * AI Realtime Live Streaming for EncryptionManager Tool
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
      content: 'Welcome to EncryptionManager AI Assistant. I can help you with key management, encryption algorithms, security policies, certificate handling, and cryptographic best practices. How can I assist you today?',
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

    // Simulate AI response (replace with actual Claude API integration)
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

    if (input.includes('key') && (input.includes('create') || input.includes('generate'))) {
      return 'To create a new encryption key in EncryptionManager:\n\n1. Navigate to the Keys tab\n2. Click "Generate Key"\n3. Choose key type: Symmetric, Asymmetric, or HMAC\n4. Select algorithm (AES-256-GCM, RSA-4096, etc.)\n5. Set key name and optional description\n6. Configure rotation policy if needed\n\n**Security Recommendation**: Use AES-256-GCM for symmetric encryption and RSA-4096 for asymmetric operations. Would you like me to suggest the best algorithm for your use case?';
    }

    if (input.includes('encrypt') || input.includes('decrypt')) {
      return 'For encryption/decryption operations:\n\n• Select an active encryption key from the Keys tab\n• Choose the data you want to encrypt/decrypt\n• Use the Encrypt tab for secure operations\n• All operations are logged for audit purposes\n\n**Best Practice**: Always verify the key status before encryption. Expired or compromised keys should not be used.\n\nI can help you choose the most appropriate encryption method for your data sensitivity level.';
    }

    if (input.includes('certificate') || input.includes('ssl') || input.includes('tls')) {
      return 'Certificate management in EncryptionManager:\n\n• Automatic SSL/TLS certificate monitoring\n• Integration with Let\'s Encrypt, DigiCert, Venafi\n• Certificate expiry alerts and auto-renewal\n• Certificate validation and revocation checking\n\n**Security Insight**: 73% of security breaches involve expired certificates. Regular monitoring is crucial.\n\nWould you like me to check your current certificate status or help set up auto-renewal?';
    }

    if (input.includes('algorithm') || input.includes('aes') || input.includes('rsa')) {
      return 'Encryption algorithm recommendations:\n\n🔐 **Symmetric Encryption**:\n• AES-256-GCM (recommended for data at rest)\n• AES-128-GCM (good performance, slightly less secure)\n• ChaCha20-Poly1305 (excellent for mobile/IoT)\n\n🔑 **Asymmetric Encryption**:\n• RSA-4096 (maximum security, slower)\n• ECDSA-P384 (modern, efficient)\n• Ed25519 (excellent performance)\n\n🔒 **HMAC**:\n• HMAC-SHA256 (balanced security/performance)\n• HMAC-SHA384 (higher security)\n\nWhat type of data are you looking to protect?';
    }

    if (input.includes('rotation') || input.includes('rotate')) {
      return 'Key rotation best practices:\n\n• **Automatic Rotation**: Configure policies for regular key cycling\n• **Manual Rotation**: Use when key compromise is suspected\n• **Zero-Downtime**: EncryptionManager supports seamless rotation\n• **Audit Trail**: All rotations are logged with timestamps\n\n**Industry Standard**: Rotate encryption keys every 90 days or immediately upon compromise suspicion.\n\nI can help you set up automated rotation schedules based on your security requirements.';
    }

    if (input.includes('audit') || input.includes('log') || input.includes('monitor')) {
      return 'Security monitoring and audit capabilities:\n\n• Real-time encryption operation logging\n• Key usage analytics and anomaly detection\n• Certificate expiry monitoring\n• Failed decryption attempt alerts\n• Compliance reporting (GDPR, HIPAA, PCI-DSS)\n\n**Current Status**: All systems operational, monitoring 247 active keys, 12 certificates expiring within 30 days.\n\nWould you like me to show you recent security events or generate a compliance report?';
    }

    if (input.includes('security') || input.includes('risk') || input.includes('threat')) {
      return 'Security insights from your EncryptionManager system:\n\n• **Risk Score**: Low (Current: 2.3/10)\n• **Key Health**: 98.7% of keys are active and rotated\n• **Certificate Status**: 89% valid, 11% expiring soon\n• **Anomaly Detection**: 3 unusual access patterns detected (investigating)\n• **Compliance**: 95% compliant with industry standards\n\n**Recommendations**:\n1. Rotate 2 keys expiring within 7 days\n2. Review certificate renewal settings\n3. Enable enhanced monitoring for high-value data\n\nI can provide detailed analysis of any specific security concern.';
    }

    if (input.includes('policy') || input.includes('compliance')) {
      return 'Encryption and compliance policies:\n\n• **Data Classification**: Automatic encryption based on sensitivity\n• **Geographic Compliance**: Region-specific encryption requirements\n• **Industry Standards**: GDPR, HIPAA, PCI-DSS, SOX compliance\n• **Access Controls**: Role-based encryption key access\n• **Retention Policies**: Automatic key deletion after retention periods\n\n**Policy Engine**: AI-powered policy recommendations based on your industry and data types.\n\nWhat compliance requirements do you need to meet?';
    }

    if (input.includes('performance') || input.includes('speed') || input.includes('optimization')) {
      return 'Encryption performance optimization:\n\n• **Algorithm Selection**: ChaCha20-Poly1305 for high-speed requirements\n• **Key Caching**: Intelligent key caching for repeated operations\n• **Batch Processing**: Parallel encryption for large datasets\n• **Hardware Acceleration**: AES-NI, ARM Cryptography extensions\n\n**Current Performance**: Average encryption speed: 2.1 GB/s, 99.7% uptime.\n\nI can analyze your encryption workload and suggest optimizations.';
    }

    return 'I understand you\'re asking about: "' + userInput + '"\n\nAs your EncryptionManager AI assistant, I can help with:\n\n🔐 **Key Management**: Creation, rotation, and lifecycle management\n🔒 **Encryption Operations**: Secure data encryption/decryption\n📜 **Certificates**: SSL/TLS certificate management and monitoring\n🎯 **Algorithm Selection**: Choosing optimal encryption methods\n📊 **Security Monitoring**: Audit logs, anomaly detection, compliance\n⚡ **Performance**: Optimization and workload analysis\n📋 **Policies**: Security policies and compliance automation\n\nWhat specific aspect of encryption management would you like to explore?';
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
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 border-b border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              🧠
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Neural Link</h1>
              <p className="text-purple-200 text-sm">AI Realtime Assistant - EncryptionManager</p>
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 border border-purple-500/30 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-purple-500/30 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-400 text-sm">AI is analyzing encryption patterns...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/30 bg-gray-900/50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about encryption, keys, certificates, or security..."
            className="flex-1 p-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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
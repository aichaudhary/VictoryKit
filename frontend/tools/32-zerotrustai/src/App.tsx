import React, { useState } from 'react';
import { 
  Shield, Lock, UserCheck, Network, Laptop, Server,
  AlertTriangle, CheckCircle, XCircle, Activity, Eye,
  Key, Fingerprint, Globe, Cloud, Database, Settings,
  MessageSquare, Send, RefreshCw, FileText, Zap
} from 'lucide-react';
import ZeroTrustDashboard from './components/ZeroTrustDashboard';
import IdentityVerification from './components/IdentityVerification';
import AccessPolicies from './components/AccessPolicies';
import DeviceTrust from './components/DeviceTrust';
import MicroSegmentation from './components/MicroSegmentation';
import ZeroTrustSettings from './components/ZeroTrustSettings';

interface TrustSession {
  id: string;
  user: string;
  device: string;
  location: string;
  trustScore: number;
  status: string;
  riskLevel: string;
  lastVerified: Date;
  factors: string[];
}

interface AccessPolicy {
  id: string;
  name: string;
  resource: string;
  conditions: string[];
  action: string;
  enabled: boolean;
}

type Tab = 'dashboard' | 'identity' | 'policies' | 'devices' | 'segments' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'assistant', content: 'Hello! I\'m your Zero Trust AI assistant. I can help you with identity verification policies, access controls, device trust scoring, and micro-segmentation strategies. What would you like to know?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const [sessions] = useState<TrustSession[]>([
    {
      id: 'SES-001',
      user: 'john.doe@company.com',
      device: 'MacBook Pro M2',
      location: 'San Francisco, CA',
      trustScore: 92,
      status: 'active',
      riskLevel: 'low',
      lastVerified: new Date(Date.now() - 5 * 60000),
      factors: ['password', 'mfa', 'device', 'location']
    },
    {
      id: 'SES-002',
      user: 'jane.smith@company.com',
      device: 'Windows 11 Desktop',
      location: 'New York, NY',
      trustScore: 78,
      status: 'active',
      riskLevel: 'medium',
      lastVerified: new Date(Date.now() - 15 * 60000),
      factors: ['password', 'mfa', 'device']
    },
    {
      id: 'SES-003',
      user: 'bob.wilson@company.com',
      device: 'iPhone 15 Pro',
      location: 'Unknown VPN',
      trustScore: 45,
      status: 'challenged',
      riskLevel: 'high',
      lastVerified: new Date(Date.now() - 60 * 60000),
      factors: ['password']
    },
    {
      id: 'SES-004',
      user: 'alice.johnson@company.com',
      device: 'Ubuntu Laptop',
      location: 'Austin, TX',
      trustScore: 88,
      status: 'active',
      riskLevel: 'low',
      lastVerified: new Date(Date.now() - 10 * 60000),
      factors: ['password', 'mfa', 'device', 'biometric']
    },
    {
      id: 'SES-005',
      user: 'external.vendor@partner.com',
      device: 'Windows 10 VM',
      location: 'Remote',
      trustScore: 35,
      status: 'blocked',
      riskLevel: 'critical',
      lastVerified: new Date(Date.now() - 120 * 60000),
      factors: ['password']
    }
  ]);

  const [policies] = useState<AccessPolicy[]>([
    { id: 'POL-001', name: 'Admin Console Access', resource: '/admin/*', conditions: ['trustScore >= 90', 'mfa = true', 'managedDevice = true'], action: 'allow', enabled: true },
    { id: 'POL-002', name: 'Customer Data API', resource: '/api/customers/*', conditions: ['trustScore >= 75', 'role = customer-support'], action: 'allow', enabled: true },
    { id: 'POL-003', name: 'Financial Reports', resource: '/reports/financial/*', conditions: ['trustScore >= 85', 'department = finance', 'location = office'], action: 'allow', enabled: true },
    { id: 'POL-004', name: 'Development Environment', resource: '/dev/*', conditions: ['role = developer', 'deviceCompliant = true'], action: 'allow', enabled: true },
    { id: 'POL-005', name: 'External Partner Portal', resource: '/partner/*', conditions: ['userType = external', 'mfa = true', 'ipWhitelisted = true'], action: 'allow', enabled: false },
  ]);

  const stats = {
    activeSessions: 1247,
    trustedDevices: 892,
    policiesEnforced: 156,
    blockedAttempts: 89,
    avgTrustScore: 78,
    verificationRate: 99.2
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    
    setTimeout(() => {
      let response = '';
      const lowerInput = inputMessage.toLowerCase();
      
      if (lowerInput.includes('trust score') || lowerInput.includes('trust level')) {
        response = 'Trust scores are calculated based on multiple factors:\n\n• **Identity Verification** (25%): Password strength, MFA status\n• **Device Compliance** (25%): Patch level, encryption, security software\n• **Location Context** (20%): Known locations, VPN usage, geofencing\n• **Behavior Analytics** (20%): Access patterns, anomaly detection\n• **Session Risk** (10%): Time of access, concurrent sessions\n\nScores range from 0-100. Sessions below 50 trigger additional verification.';
      } else if (lowerInput.includes('policy') || lowerInput.includes('access')) {
        response = 'Zero Trust access policies follow the principle of "never trust, always verify." Each policy defines:\n\n• **Resource**: What\'s being protected\n• **Conditions**: Required trust factors\n• **Action**: Allow, deny, or challenge\n• **Continuous Evaluation**: Real-time policy enforcement\n\nI can help you create or modify policies for specific resources.';
      } else if (lowerInput.includes('device') || lowerInput.includes('endpoint')) {
        response = 'Device trust is a critical component of Zero Trust architecture. We evaluate:\n\n• **Compliance Status**: OS updates, security patches\n• **Encryption**: Full disk encryption enabled\n• **Security Software**: EDR/Antivirus active\n• **Management**: MDM enrollment status\n• **Certificate**: Valid device certificates\n\nNon-compliant devices receive reduced trust scores and limited access.';
      } else if (lowerInput.includes('mfa') || lowerInput.includes('authentication')) {
        response = 'Multi-factor authentication (MFA) is mandatory in our Zero Trust model. Supported factors:\n\n• **Something You Know**: Password, PIN\n• **Something You Have**: TOTP, hardware key, push notification\n• **Something You Are**: Biometrics (fingerprint, face)\n• **Somewhere You Are**: Location-based verification\n\nAdaptive MFA adjusts requirements based on risk level.';
      } else {
        response = 'I can help you with various Zero Trust security topics:\n\n• Trust score calculations and thresholds\n• Access policy configuration\n• Device compliance requirements\n• MFA and authentication factors\n• Micro-segmentation strategies\n• Identity verification workflows\n\nWhat specific aspect would you like to explore?';
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
    
    setInputMessage('');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'identity', label: 'Identity', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'policies', label: 'Policies', icon: <FileText className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Laptop className="w-4 h-4" /> },
    { id: 'segments', label: 'Segments', icon: <Network className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ZeroTrustDashboard sessions={sessions} stats={stats} />;
      case 'identity':
        return <IdentityVerification sessions={sessions} />;
      case 'policies':
        return <AccessPolicies policies={policies} />;
      case 'devices':
        return <DeviceTrust />;
      case 'segments':
        return <MicroSegmentation />;
      case 'settings':
        return <ZeroTrustSettings />;
      default:
        return <ZeroTrustDashboard sessions={sessions} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ZeroTrustAI</h1>
                <p className="text-xs text-gray-400">Never Trust, Always Verify</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Zero Trust Active</span>
              </div>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] border-r border-gray-700">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Trust Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Avg Trust Score</span>
                <span className="text-sm font-bold text-emerald-400">{stats.avgTrustScore}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${stats.avgTrustScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {sessions.filter(s => s.status === 'active').length} Trusted
                </span>
                <span className="text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {sessions.filter(s => s.status === 'blocked').length} Blocked
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <aside className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Zero Trust AI</h3>
                    <p className="text-xs text-gray-400">Security Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([{ role: 'assistant', content: 'Hello! I\'m your Zero Trust AI assistant. How can I help you today?' }])}
                  className="p-1.5 hover:bg-gray-700 rounded"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about Zero Trust..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;

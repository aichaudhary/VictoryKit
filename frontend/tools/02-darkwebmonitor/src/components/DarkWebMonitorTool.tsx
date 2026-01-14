import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Search,
  Globe,
  AlertTriangle,
  Activity,
  BarChart3,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Target,
  Layers,
  Database,
  Shield,
  FileText,
  Radio,
  Radar,
  Network,
  Bug,
  Hash,
  Mail,
  Link2,
  Server,
  Key,
  Lock,
  Gauge,
  MonitorCheck,
  Zap,
  Home,
} from 'lucide-react';
import { ThreatIntelForm } from './ThreatIntelForm';
import { LiveThreatPanel } from './LiveThreatPanel';
import { AnimatedThreatCard, ThreatResult } from './AnimatedThreatCard';
import { RealTimeThreatDashboard } from './RealTimeThreatDashboard';
import { AssetMonitoring } from './AssetMonitoring';
import { BreachDetection } from './BreachDetection';
import { CredentialLeakScanner } from './CredentialLeakScanner';
import { SecurityScoreDashboard } from './SecurityScoreDashboard';
import { threatIntelAPI } from '../services/darkwebmonitorAPI';
import { ThreatIntel, IntelStatistics } from '../types';

type ViewType = 'dashboard' | 'monitor' | 'breach' | 'credentials' | 'gather' | 'search' | 'score';

const DarkWebMonitorTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [lastIntel, setLastIntel] = useState<ThreatIntel | null>(null);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [statistics, setStatistics] = useState<IntelStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadThreats();
    loadStatistics();
  }, []);

  const loadThreats = async () => {
    try {
      setLoading(true);
      const response = await threatIntelAPI.getAll({ limit: 50 });
      setThreats(response.data);
    } catch (error) {
      console.error('Failed to load threat intel:', error);
      // Use mock data for demo
      setThreats([
        {
          intelId: 'TI-001',
          sourceType: 'osint',
          threatType: 'malware',
          severity: 'HIGH',
          confidenceScore: 85,
          title: 'New Ransomware Variant Detected',
          description: 'Novel ransomware strain targeting healthcare sector',
          indicators: {
            ips: ['192.168.1.100', '10.0.0.50'],
            domains: ['malicious-domain.com'],
            urls: [],
            hashes: ['a1b2c3d4e5f6g7h8i9j0'],
            emails: [],
            fileNames: ['payload.exe'],
          },
          targetSectors: ['Healthcare'],
          targetCountries: ['US', 'UK'],
          attackVectors: ['Phishing'],
          mitreTactics: ['Initial Access', 'Execution'],
          mitreTechniques: ['T1566', 'T1059'],
          sources: [],
          relatedThreats: [],
          status: 'active',
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await threatIntelAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Use mock data
      setStatistics({
        totalThreats: 127,
        activeThreats: 43,
        resolvedThreats: 84,
        criticalCount: 12,
        highCount: 31,
        mediumCount: 48,
        lowCount: 36,
        threatsByType: {} as any,
        threatsBySource: {} as any,
        recentActivity: [],
        topIndicators: [],
      });
    }
  };

  const handleIntelSubmit = async (intel: Partial<ThreatIntel>) => {
    try {
      setLoading(true);
      const response = await threatIntelAPI.create(intel);
      setLastIntel(response.data);
      await loadThreats();
    } catch (error) {
      console.error('Failed to submit intel:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    {
      view: 'dashboard' as ViewType,
      icon: <Activity className="w-4 h-4" />,
      label: 'Live Threats',
    },
    {
      view: 'monitor' as ViewType,
      icon: <MonitorCheck className="w-4 h-4" />,
      label: 'Asset Monitor',
    },
    { view: 'breach' as ViewType, icon: <Database className="w-4 h-4" />, label: 'Breach Check' },
    { view: 'credentials' as ViewType, icon: <Key className="w-4 h-4" />, label: 'Leak Scanner' },
    { view: 'gather' as ViewType, icon: <Target className="w-4 h-4" />, label: 'Intel Gather' },
    { view: 'search' as ViewType, icon: <Search className="w-4 h-4" />, label: 'OSINT Search' },
    { view: 'score' as ViewType, icon: <Gauge className="w-4 h-4" />, label: 'Security Score' },
  ];

  const renderNavButton = (view: ViewType, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        currentView === view
          ? 'bg-green-500/20 border border-green-500/50 text-green-400'
          : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600/50'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center glow-green">
                <Radar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text-intel">DarkWebMonitor</h1>
                <p className="text-xs text-gray-400">Advanced Threat Intelligence Platform</p>
              </div>
            </div>

            {/* Quick Stats */}
            {statistics && (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    {statistics.criticalCount} Critical
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">
                    {statistics.activeThreats} Active
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href="https://maula.ai/#tool-section-2"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Back to Maula</span>
              </a>
              <a
                href="/neural-link/"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
            {navItems.map(({ view, icon, label }) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  currentView === view
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600/50'
                }`}
              >
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && <RealTimeThreatDashboard />}

        {currentView === 'monitor' && <AssetMonitoring />}

        {currentView === 'breach' && <BreachDetection />}

        {currentView === 'credentials' && <CredentialLeakScanner />}

        {currentView === 'score' && <SecurityScoreDashboard />}

        {currentView === 'gather' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ThreatIntelForm onSubmit={handleIntelSubmit} loading={loading} />
            </div>
            <div>
              {lastIntel ? (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Latest Intel</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Title:</span>
                      <p className="text-white">{lastIntel.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Type:</span>
                      <p className="text-white capitalize">{lastIntel.threatType}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Severity:</span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          lastIntel.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400'
                            : lastIntel.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {lastIntel.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center">
                  <Radar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400">No Intel Gathered</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Submit threat intelligence to see analysis results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'search' && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">OSINT Search</h2>
                <p className="text-gray-400 mt-2">
                  Search across open-source intelligence databases
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search domains, IPs, emails, hashes..."
                  className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-medium hover:from-cyan-500 hover:to-blue-500 transition-all">
                  Search
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {[
                  { icon: <Globe className="w-5 h-5" />, label: 'Domains', count: '2.3M' },
                  { icon: <Server className="w-5 h-5" />, label: 'IPs', count: '15M' },
                  { icon: <Mail className="w-5 h-5" />, label: 'Emails', count: '8.7M' },
                  { icon: <Hash className="w-5 h-5" />, label: 'Hashes', count: '45M' },
                ].map(({ icon, label, count }) => (
                  <div key={label} className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 mb-2">
                      {icon}
                    </div>
                    <div className="text-lg font-bold text-white">{count}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Powered by Maula.ai Security Platform</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Last updated: {new Date().toLocaleString()}</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DarkWebMonitorTool;

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Globe,
  Users,
  FileWarning
} from 'lucide-react';
import { phishGuardAPI } from '../services/api';

interface DashboardStats {
  totalEmailsScanned: number;
  phishingDetected: number;
  phishingBlocked: number;
  urlsAnalyzed: number;
  safeDomains: number;
  suspiciousLinks: number;
  detectionRate: number;
  lastScanTime: string;
}

interface RecentDetection {
  _id: string;
  subject: string;
  sender: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  detectedAt: string;
}

interface PhishingCampaign {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [detections, setDetections] = useState<RecentDetection[]>([]);
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, detectionsData, campaignsData] = await Promise.all([
        phishGuardAPI.dashboard.getStats(),
        phishGuardAPI.detections.list({ limit: 5, status: 'detected' }),
        phishGuardAPI.analytics.getCampaigns()
      ]);

      setStats(statsData.data);
      setDetections(detectionsData.data.detections || []);
      setCampaigns(campaignsData.data.campaigns || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'text-red-500 bg-red-500/10',
      high: 'text-orange-500 bg-orange-500/10',
      medium: 'text-yellow-500 bg-yellow-500/10',
      low: 'text-green-500 bg-green-500/10'
    };
    return colors[severity] || 'text-gray-500 bg-gray-500/10';
  };

  const getSeverityBadge = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <Mail className="w-16 h-16 text-phish-primary animate-phish-hook" />
          <div className="absolute inset-0 rounded-full border-2 border-phish-primary/30 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">PhishGuard</h1>
          <p className="text-gray-400">AI-powered phishing detection & email security</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last scan: {stats?.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString() : 'Never'}</span>
          </div>
          <button className="px-4 py-2 bg-phish-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-phish-primary/30 transition-all flex items-center space-x-2 animate-glow">
            <Mail className="w-4 h-4" />
            <span>Analyze Email</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phishing Detected */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-gradient rounded-xl flex items-center justify-center shadow-glow-warning group-hover:animate-warning-flash">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">THREATS</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.phishingDetected || 0}</h3>
          <p className="text-sm text-gray-400">Phishing detected</p>
          <div className="mt-3 flex items-center text-xs text-red-500">
            <FileWarning className="w-4 h-4 mr-1" />
            Review recommended
          </div>
        </div>

        {/* Emails Blocked */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">BLOCKED</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.phishingBlocked || 0}</h3>
          <p className="text-sm text-gray-400">Auto-blocked</p>
          <div className="mt-3 flex items-center text-xs text-green-500">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Real-time protection
          </div>
        </div>

        {/* URLs Analyzed */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-phish-primary/20 hover:border-phish-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-phish-gradient rounded-xl flex items-center justify-center shadow-glow-orange">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">URLs</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.urlsAnalyzed || 0}</h3>
          <p className="text-sm text-gray-400">URLs analyzed</p>
          <div className="mt-3 flex items-center text-xs text-phish-accent">
            <Globe className="w-4 h-4 mr-1" />
            {stats?.suspiciousLinks || 0} suspicious
          </div>
        </div>

        {/* Detection Rate */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">ACCURACY</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.detectionRate || 99.5}%</h3>
          <p className="text-sm text-gray-400">Detection rate</p>
          <div className="mt-3 w-full bg-phish-darker h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-phish-gradient"
              style={{ width: `${stats?.detectionRate || 99.5}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Detections & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Phishing Attempts */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-phish-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Phishing Attempts</h2>
            <a href="/detections" className="text-sm text-phish-primary hover:text-phish-accent flex items-center">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="space-y-4">
            {detections.map((detection) => (
              <div key={detection._id} className="p-4 bg-phish-darker rounded-xl border border-phish-primary/10 hover:border-phish-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${getSeverityBadge(detection.severity)} animate-pulse`}></span>
                    <h3 className="font-medium text-white truncate max-w-[200px] group-hover:text-phish-accent transition-colors">
                      {detection.subject}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(detection.severity)}`}>
                    {detection.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="text-phish-accent truncate max-w-[150px]">{detection.sender}</span>
                  <span>{new Date(detection.detectedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {detections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No phishing attempts detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Phishing Campaigns */}
        <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-phish-primary/20">
          <h2 className="text-xl font-bold text-white mb-6">Active Phishing Campaigns</h2>
          <div className="space-y-4">
            {campaigns.length > 0 ? campaigns.map((campaign, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{campaign.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{campaign.count}</span>
                    <span className={`text-xs ${
                      campaign.trend === 'up' ? 'text-red-500' : 
                      campaign.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {campaign.trend === 'up' ? '↑' : campaign.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-phish-darker h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-phish-gradient transition-all duration-500"
                    style={{ width: `${campaign.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="space-y-4">
                {['Credential Harvest', 'Invoice Fraud', 'CEO Impersonation', 'Password Reset', 'Delivery Scam'].map((name, i) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{name}</span>
                      <span className="text-white font-medium">{Math.floor(Math.random() * 100) + 20}</span>
                    </div>
                    <div className="w-full bg-phish-darker h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-phish-gradient"
                        style={{ width: `${90 - i * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-phish-dark to-phish-darker p-6 rounded-2xl border border-phish-primary/20">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-phish-gradient text-white rounded-xl font-medium hover:shadow-lg hover:shadow-phish-primary/30 transition-all flex flex-col items-center space-y-2">
            <Mail className="w-6 h-6" />
            <span>Analyze Email</span>
          </button>
          <button className="p-4 bg-phish-primary/10 text-phish-primary border border-phish-primary/20 rounded-xl font-medium hover:bg-phish-primary/20 transition-all flex flex-col items-center space-y-2">
            <Link2 className="w-6 h-6" />
            <span>Check URL</span>
          </button>
          <button className="p-4 bg-phish-primary/10 text-phish-primary border border-phish-primary/20 rounded-xl font-medium hover:bg-phish-primary/20 transition-all flex flex-col items-center space-y-2">
            <Users className="w-6 h-6" />
            <span>Train Users</span>
          </button>
          <button className="p-4 bg-phish-primary/10 text-phish-primary border border-phish-primary/20 rounded-xl font-medium hover:bg-phish-primary/20 transition-all flex flex-col items-center space-y-2">
            <Zap className="w-6 h-6" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Email Protection Status */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 font-medium">Email Protection Active</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{stats?.totalEmailsScanned || 0} emails scanned today</span>
          <span>•</span>
          <span>{stats?.safeDomains || 0} trusted domains</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

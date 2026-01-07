import React, { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  Lock,
  Eye,
  FileSearch,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  FileText,
  Users,
  Key,
} from 'lucide-react';

interface DashboardStats {
  totalDataAssets: number;
  protectedAssets: number;
  sensitiveRecords: number;
  accessEvents: number;
}

interface RecentDiscovery {
  id: string;
  source: string;
  type: string;
  status: 'completed' | 'in-progress' | 'pending';
  sensitiveData: { pii: number; pci: number; phi: number };
  timestamp: string;
}

interface DataCategory {
  name: string;
  count: number;
  protected: number;
  icon: React.ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDataAssets: 2847,
    protectedAssets: 2654,
    sensitiveRecords: 1.2, // millions
    accessEvents: 45892,
  });

  const [recentDiscoveries, setRecentDiscoveries] = useState<RecentDiscovery[]>([
    { id: '1', source: 'Production DB', type: 'PostgreSQL', status: 'completed', sensitiveData: { pii: 12450, pci: 3200, phi: 890 }, timestamp: '10 mins ago' },
    { id: '2', source: 'S3 Bucket', type: 'AWS S3', status: 'in-progress', sensitiveData: { pii: 0, pci: 0, phi: 0 }, timestamp: '25 mins ago' },
    { id: '3', source: 'User Service', type: 'MongoDB', status: 'completed', sensitiveData: { pii: 8900, pci: 0, phi: 450 }, timestamp: '1 hour ago' },
    { id: '4', source: 'Analytics DB', type: 'BigQuery', status: 'pending', sensitiveData: { pii: 0, pci: 0, phi: 0 }, timestamp: 'Scheduled' },
    { id: '5', source: 'Legacy System', type: 'MySQL', status: 'completed', sensitiveData: { pii: 5600, pci: 1200, phi: 0 }, timestamp: '3 hours ago' },
  ]);

  const dataCategories: DataCategory[] = [
    { name: 'PII (Personal)', count: 45230, protected: 42100, icon: <Users size={18} />, color: 'text-blue-400' },
    { name: 'PCI (Payment)', count: 12500, protected: 12500, icon: <Key size={18} />, color: 'text-purple-400' },
    { name: 'PHI (Health)', count: 8900, protected: 8200, icon: <FileText size={18} />, color: 'text-pink-400' },
    { name: 'Credentials', count: 3400, protected: 3400, icon: <Lock size={18} />, color: 'text-red-400' },
    { name: 'API Keys', count: 890, protected: 890, icon: <Key size={18} />, color: 'text-orange-400' },
    { name: 'Internal Docs', count: 15600, protected: 14200, icon: <FileText size={18} />, color: 'text-cyan-400' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-guardian-accent" />;
      case 'in-progress': return <Clock size={16} className="text-blue-400 animate-pulse" />;
      case 'pending': return <Clock size={16} className="text-gray-400" />;
      default: return null;
    }
  };

  const getProtectionPercentage = (count: number, protected_: number) => {
    return Math.round((protected_ / count) * 100);
  };

  return (
    <div className="min-h-screen bg-guardian-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Data Protection Dashboard</h1>
        <p className="text-gray-400">Comprehensive data discovery, classification, and protection</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-guardian-dark/50 rounded-xl p-6 border border-guardian-800/50 hover:border-guardian-primary/50 transition-all hover:shadow-glow-emerald">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-guardian-primary/20 rounded-lg">
              <Database size={24} className="text-guardian-accent" />
            </div>
            <span className="text-xs text-guardian-accent font-semibold bg-guardian-primary/20 px-2 py-1 rounded">+8%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Data Assets</h3>
          <p className="text-3xl font-bold text-white">{stats.totalDataAssets.toLocaleString()}</p>
        </div>

        <div className="bg-guardian-dark/50 rounded-xl p-6 border border-guardian-800/50 hover:border-green-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield size={24} className="text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-semibold bg-green-500/20 px-2 py-1 rounded">93%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Protected Assets</h3>
          <p className="text-3xl font-bold text-white">{stats.protectedAssets.toLocaleString()}</p>
        </div>

        <div className="bg-guardian-dark/50 rounded-xl p-6 border border-guardian-800/50 hover:border-yellow-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-400" />
            </div>
            <span className="text-xs text-yellow-400 font-semibold bg-yellow-500/20 px-2 py-1 rounded">Sensitive</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Sensitive Records</h3>
          <p className="text-3xl font-bold text-white">{stats.sensitiveRecords}M</p>
        </div>

        <div className="bg-guardian-dark/50 rounded-xl p-6 border border-guardian-800/50 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Eye size={24} className="text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-semibold bg-blue-500/20 px-2 py-1 rounded">24h</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Access Events</h3>
          <p className="text-3xl font-bold text-white">{stats.accessEvents.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Discoveries */}
        <div className="lg:col-span-2 bg-guardian-dark/50 rounded-xl border border-guardian-800/50">
          <div className="p-6 border-b border-guardian-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Data Discoveries</h2>
              <button className="text-sm text-guardian-accent hover:text-guardian-300 transition-colors">View All</button>
            </div>
          </div>
          <div className="divide-y divide-guardian-800/50">
            {recentDiscoveries.map((discovery) => (
              <div key={discovery.id} className="p-4 hover:bg-guardian-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(discovery.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{discovery.source}</span>
                        <span className="text-xs text-gray-500 bg-guardian-800/50 px-2 py-0.5 rounded">{discovery.type}</span>
                      </div>
                      <span className="text-xs text-gray-500">{discovery.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {discovery.status === 'completed' && (
                      <div className="flex items-center gap-2 text-xs">
                        {discovery.sensitiveData.pii > 0 && <span className="text-blue-400 font-semibold">{discovery.sensitiveData.pii.toLocaleString()} PII</span>}
                        {discovery.sensitiveData.pci > 0 && <span className="text-purple-400 font-semibold">{discovery.sensitiveData.pci.toLocaleString()} PCI</span>}
                        {discovery.sensitiveData.phi > 0 && <span className="text-pink-400">{discovery.sensitiveData.phi.toLocaleString()} PHI</span>}
                      </div>
                    )}
                    <button className="p-2 hover:bg-guardian-700/30 rounded-lg text-gray-400 hover:text-guardian-accent transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Categories */}
        <div className="bg-guardian-dark/50 rounded-xl border border-guardian-800/50">
          <div className="p-6 border-b border-guardian-800/50">
            <h2 className="text-xl font-semibold text-white">Data Categories</h2>
          </div>
          <div className="p-4 space-y-3">
            {dataCategories.map((category, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-guardian-800/20 hover:bg-guardian-800/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={category.color}>{category.icon}</span>
                    <span className="text-sm text-gray-300">{category.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${getProtectionPercentage(category.count, category.protected) === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {getProtectionPercentage(category.count, category.protected)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getProtectionPercentage(category.count, category.protected) === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${getProtectionPercentage(category.count, category.protected)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{category.protected.toLocaleString()} protected</span>
                  <span>{category.count.toLocaleString()} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-guardian-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow-emerald transition-all">
          <FileSearch size={20} />
          Start Discovery Scan
        </button>
        <button className="p-4 bg-guardian-dark/50 border border-guardian-primary/50 rounded-xl text-guardian-accent font-semibold flex items-center justify-center gap-2 hover:bg-guardian-800/30 transition-all">
          <Lock size={20} />
          Apply Protection Policy
        </button>
        <button className="p-4 bg-guardian-dark/50 border border-guardian-primary/50 rounded-xl text-guardian-accent font-semibold flex items-center justify-center gap-2 hover:bg-guardian-800/30 transition-all">
          <Eye size={20} />
          View Access Logs
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

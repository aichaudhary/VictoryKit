import React, { useState, useEffect } from 'react';
import {
  Globe2,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  MapPin,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  Flame,
  Skull,
  Bug,
  Lock,
  Unlock,
  Database,
  Server,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface ThreatEvent {
  id: string;
  type: 'malware' | 'phishing' | 'ransomware' | 'ddos' | 'breach' | 'apt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  location: { country: string; city: string; lat: number; lng: number };
  timestamp: Date;
  description: string;
}

interface GlobalStats {
  totalThreats24h: number;
  activeAttacks: number;
  compromisedSystems: number;
  dataBreaches: number;
  trendPercent: number;
}

// Simulated real-time data generator
const generateThreatEvent = (): ThreatEvent => {
  const types: ThreatEvent['type'][] = [
    'malware',
    'phishing',
    'ransomware',
    'ddos',
    'breach',
    'apt',
  ];
  const severities: ThreatEvent['severity'][] = ['low', 'medium', 'high', 'critical'];
  const locations = [
    { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
    { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.006 },
    { country: 'Iran', city: 'Tehran', lat: 35.6892, lng: 51.389 },
    { country: 'North Korea', city: 'Pyongyang', lat: 39.0392, lng: 125.7625 },
    { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.405 },
    { country: 'India', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { country: 'Ukraine', city: 'Kyiv', lat: 50.4501, lng: 30.5234 },
    { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 },
  ];
  const targets = [
    'Financial Institution',
    'Healthcare Network',
    'Government Agency',
    'Critical Infrastructure',
    'E-commerce Platform',
    'Energy Grid',
    'Telecom Provider',
    'Education System',
    'Manufacturing Plant',
    'Defense Contractor',
  ];
  const descriptions = [
    'APT group deploying custom malware via spear-phishing',
    'Ransomware encryption detected on critical systems',
    'DDoS attack targeting core infrastructure',
    'Data exfiltration attempt blocked',
    'Credential stuffing attack in progress',
    'Zero-day exploit being actively exploited',
    'Supply chain compromise detected',
    'Brute force attack on admin panels',
    'SQL injection attempt detected',
    'Cryptominer deployment blocked',
  ];

  return {
    id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    source: locations[Math.floor(Math.random() * locations.length)].country,
    target: targets[Math.floor(Math.random() * targets.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
  };
};

const ThreatIcon: React.FC<{ type: ThreatEvent['type']; className?: string }> = ({
  type,
  className = 'w-4 h-4',
}) => {
  switch (type) {
    case 'malware':
      return <Bug className={className} />;
    case 'phishing':
      return <Eye className={className} />;
    case 'ransomware':
      return <Lock className={className} />;
    case 'ddos':
      return <Wifi className={className} />;
    case 'breach':
      return <Unlock className={className} />;
    case 'apt':
      return <Skull className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
};

const SeverityBadge: React.FC<{ severity: ThreatEvent['severity'] }> = ({ severity }) => {
  const colors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
};

export const RealTimeThreatDashboard: React.FC = () => {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [stats, setStats] = useState<GlobalStats>({
    totalThreats24h: 847293,
    activeAttacks: 12847,
    compromisedSystems: 3421,
    dataBreaches: 127,
    trendPercent: 12.5,
  });
  const [isLive, setIsLive] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);

  // Simulate real-time threat feed
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newThreat = generateThreatEvent();
      setThreats((prev) => [newThreat, ...prev.slice(0, 49)]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalThreats24h: prev.totalThreats24h + 1,
        activeAttacks: Math.max(0, prev.activeAttacks + (Math.random() > 0.5 ? 1 : -1)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Initialize with some threats
  useEffect(() => {
    const initialThreats = Array.from({ length: 10 }, () => generateThreatEvent());
    setThreats(initialThreats);
  }, []);

  const threatTypeCounts = threats.reduce(
    (acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Live Status Bar */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
          />
          <span className="text-sm font-medium text-gray-300">
            {isLive ? 'LIVE THREAT FEED' : 'PAUSED'}
          </span>
          <span className="text-xs text-gray-500">
            Last update: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isLive
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {isLive ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          {isLive ? 'Pause Feed' : 'Resume Feed'}
        </button>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl" />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {stats.totalThreats24h.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Global Threats (24h)</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>+{stats.trendPercent}% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-red-500/30 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl animate-pulse" />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400 font-mono">
                {stats.activeAttacks.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Active Attacks</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-red-400">
            <Activity className="w-3 h-3" />
            <span>Real-time monitoring</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-orange-500/30 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-xl" />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400 font-mono">
                {stats.compromisedSystems.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Compromised Systems</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-orange-400">
            <TrendingDown className="w-3 h-3" />
            <span>-8% from last hour</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl" />
          <div className="flex items-center gap-3 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {stats.dataBreaches.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Data Breaches (Today)</div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-purple-400">
            <Eye className="w-3 h-3" />
            <span>Monitoring 2.4M records</span>
          </div>
        </div>
      </div>

      {/* Threat Type Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Live Threat Feed</h3>
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLive ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {threats.map((threat) => (
              <div
                key={threat.id}
                onClick={() => setSelectedThreat(threat)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  threat.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                    : threat.severity === 'high'
                      ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
                      : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        threat.severity === 'critical'
                          ? 'bg-red-500/20'
                          : threat.severity === 'high'
                            ? 'bg-orange-500/20'
                            : threat.severity === 'medium'
                              ? 'bg-yellow-500/20'
                              : 'bg-blue-500/20'
                      }`}
                    >
                      <ThreatIcon
                        type={threat.type}
                        className={`w-4 h-4 ${
                          threat.severity === 'critical'
                            ? 'text-red-400'
                            : threat.severity === 'high'
                              ? 'text-orange-400'
                              : threat.severity === 'medium'
                                ? 'text-yellow-400'
                                : 'text-blue-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white capitalize">
                          {threat.type}
                        </span>
                        <SeverityBadge severity={threat.severity} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{threat.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {threat.location.country}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {threat.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-gray-500">Target:</span>
                  <span className="text-cyan-400">{threat.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Distribution</h3>
          <div className="space-y-3">
            {Object.entries(threatTypeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <ThreatIcon
                      type={type as ThreatEvent['type']}
                      className="w-4 h-4 text-green-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300 capitalize">{type}</span>
                      <span className="text-sm text-gray-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${(count / Math.max(...Object.values(threatTypeCounts))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Top Attack Sources */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Top Attack Sources</h4>
            <div className="space-y-2">
              {['Russia', 'China', 'USA', 'Iran', 'North Korea'].map((country, i) => (
                <div key={country} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{i + 1}.</span>
                    <span className="text-gray-300">{country}</span>
                  </div>
                  <span className="text-green-400 font-mono">
                    {Math.floor(Math.random() * 10000 + 1000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Threat Details Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedThreat.severity === 'critical' ? 'bg-red-500/20' : 'bg-orange-500/20'
                    }`}
                  >
                    <ThreatIcon type={selectedThreat.type} className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">
                      {selectedThreat.type} Attack
                    </h3>
                    <SeverityBadge severity={selectedThreat.severity} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Source Location</div>
                    <div className="text-white">
                      {selectedThreat.location.country}, {selectedThreat.location.city}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Target</div>
                    <div className="text-white">{selectedThreat.target}</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Description</div>
                  <div className="text-white">{selectedThreat.description}</div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-2">Recommended Actions</div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      Block source IP at firewall level
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      Update threat intelligence feeds
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      Enable enhanced monitoring for target sector
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeThreatDashboard;

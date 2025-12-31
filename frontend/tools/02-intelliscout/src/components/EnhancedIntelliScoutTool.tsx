import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Filter,
  MoreVertical,
  Bell,
  PieChart,
  MapPin,
  Users,
  Skull,
  AlertOctagon,
  Crosshair,
} from "lucide-react";
import ThreatIntelForm from "./ThreatIntelForm";
import ThreatIntelCard from "./ThreatIntelCard";
import ThreatIntelHistory from "./ThreatIntelHistory";
import CorrelationPanel from "./CorrelationPanel";
import IOCSearch from "./IOCSearch";
import { threatIntelAPI, dashboardAPI } from "../services/intelliscoutAPI";
import { ThreatIntel, IntelStatistics, SeverityLevel } from "../types";

// Stats Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "neutral";
}> = ({ title, value, change, icon, color, trend }) => (
  <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 hover:border-slate-600/50 transition-all group">
    <div className="flex items-start justify-between">
      <div
        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
      >
        {icon}
      </div>
      {change !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            trend === "up"
              ? "bg-green-500/20 text-green-400"
              : trend === "down"
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : trend === "down" ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : null}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  </div>
);

// Live Pulse Indicator
const LivePulse: React.FC = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
    <div className="relative">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
    </div>
    <span className="text-xs font-medium text-green-400">LIVE MONITORING</span>
  </div>
);

// Quick Action Button
const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active
        ? "bg-green-500/20 border border-green-500/50 text-green-400"
        : "bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white hover:border-slate-600/50"
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Threat Badge
const ThreatBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const styles = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    LOW: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};

const EnhancedIntelliScoutTool: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "gather" | "history" | "correlate" | "search" | "analytics"
  >("dashboard");
  const [lastIntel, setLastIntel] = useState<ThreatIntel | null>(null);
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [statistics, setStatistics] = useState<IntelStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showIntelForm, setShowIntelForm] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 847,
    activeThreats: 43,
    iocCorrelated: 234,
    sourcesMonitored: 12,
  });

  // Load initial data
  useEffect(() => {
    loadThreats();
    loadStatistics();
    // Simulate live updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        totalScans: prev.totalScans + Math.floor(Math.random() * 2),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadThreats = async () => {
    try {
      setLoading(true);
      const response = await threatIntelAPI.getAll({ limit: 50 });
      setThreats(response.data);
    } catch (error) {
      console.error("Failed to load threat intel:", error);
      // Use mock data for demo
      setThreats([
        {
          intelId: "TI-001",
          sourceType: "osint",
          threatType: "ransomware",
          severity: "CRITICAL",
          confidenceScore: 92,
          title: "BlackCat Ransomware Campaign Targeting Healthcare",
          description:
            "Active ransomware campaign leveraging novel encryption techniques. Multiple hospitals affected across US and UK.",
          indicators: {
            ips: ["185.220.101.33", "91.219.236.166"],
            domains: ["mal-update.com", "secure-download.xyz"],
            urls: ["https://mal-update.com/payload"],
            hashes: ["a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8"],
            emails: ["ransom@protonmail.com"],
            fileNames: ["update.exe", "payload.dll"],
          },
          targetSectors: ["Healthcare", "Finance"],
          targetCountries: ["US", "UK", "DE"],
          attackVectors: ["Phishing", "Exploit Kit"],
          mitreTactics: ["Initial Access", "Execution", "Impact"],
          mitreTechniques: ["T1566", "T1059", "T1486"],
          sources: [
            {
              name: "VirusTotal",
              url: "https://virustotal.com",
              reliability: "HIGH",
              timestamp: new Date().toISOString(),
            },
          ],
          relatedThreats: [],
          status: "active",
          firstSeen: new Date(Date.now() - 86400000).toISOString(),
          lastSeen: new Date().toISOString(),
        },
        {
          intelId: "TI-002",
          sourceType: "threat_feed",
          threatType: "apt",
          severity: "HIGH",
          confidenceScore: 78,
          title: "APT29 Infrastructure Detected",
          description:
            "C2 infrastructure matching APT29 patterns identified. Potential government espionage campaign.",
          indicators: {
            ips: ["45.83.122.10"],
            domains: ["update-service.net"],
            urls: [],
            hashes: [],
            emails: [],
            fileNames: [],
          },
          targetSectors: ["Government"],
          targetCountries: ["EU"],
          attackVectors: ["Spear Phishing"],
          mitreTactics: ["Command and Control"],
          mitreTechniques: ["T1071"],
          sources: [],
          relatedThreats: [],
          status: "monitoring",
          firstSeen: new Date(Date.now() - 172800000).toISOString(),
          lastSeen: new Date().toISOString(),
        },
        {
          intelId: "TI-003",
          sourceType: "darkweb",
          threatType: "data_leak",
          severity: "MEDIUM",
          confidenceScore: 65,
          title: "Corporate Database Leak on Dark Web",
          description:
            "Employee credentials database discovered on dark web forum. Source appears to be compromised third-party vendor.",
          indicators: {
            ips: [],
            domains: [],
            urls: [],
            hashes: [],
            emails: ["admin@company.com", "hr@company.com"],
            fileNames: ["employees_2024.csv"],
          },
          targetSectors: ["Technology"],
          targetCountries: ["US"],
          attackVectors: ["Third-Party Compromise"],
          mitreTactics: ["Resource Development"],
          mitreTechniques: ["T1586"],
          sources: [],
          relatedThreats: [],
          status: "active",
          firstSeen: new Date(Date.now() - 259200000).toISOString(),
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
      console.error("Failed to load statistics:", error);
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
      setShowIntelForm(false);
    } catch (error) {
      console.error("Failed to submit intel:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center glow-green">
                <Radar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-intel">
                  IntelliScout
                </h1>
                <p className="text-xs text-gray-400">
                  AI-Powered Threat Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LivePulse />

              {/* Neural Link Button */}
              <Link
                to="/maula-ai"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
              >
                <Bot className="w-5 h-5" />
                <span className="font-medium">Neural Link</span>
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            <QuickAction
              icon={<Layers className="w-4 h-4" />}
              label="Dashboard"
              onClick={() => setCurrentView("dashboard")}
              active={currentView === "dashboard"}
            />
            <QuickAction
              icon={<Target className="w-4 h-4" />}
              label="Gather Intel"
              onClick={() => setCurrentView("gather")}
              active={currentView === "gather"}
            />
            <QuickAction
              icon={<Database className="w-4 h-4" />}
              label="Intel Database"
              onClick={() => setCurrentView("history")}
              active={currentView === "history"}
            />
            <QuickAction
              icon={<Network className="w-4 h-4" />}
              label="Correlate IOCs"
              onClick={() => setCurrentView("correlate")}
              active={currentView === "correlate"}
            />
            <QuickAction
              icon={<Search className="w-4 h-4" />}
              label="OSINT Search"
              onClick={() => setCurrentView("search")}
              active={currentView === "search"}
            />
            <QuickAction
              icon={<BarChart3 className="w-4 h-4" />}
              label="Analytics"
              onClick={() => setCurrentView("analytics")}
              active={currentView === "analytics"}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard View */}
        {currentView === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Scans"
                value={stats.totalScans}
                change={12}
                trend="up"
                icon={<Radar className="w-5 h-5 text-white" />}
                color="from-green-500 to-emerald-600"
              />
              <StatCard
                title="Active Threats"
                value={statistics?.activeThreats || 43}
                change={8}
                trend="up"
                icon={<AlertOctagon className="w-5 h-5 text-white" />}
                color="from-red-500 to-orange-600"
              />
              <StatCard
                title="IOCs Correlated"
                value={stats.iocCorrelated}
                change={15}
                trend="up"
                icon={<Network className="w-5 h-5 text-white" />}
                color="from-cyan-500 to-blue-600"
              />
              <StatCard
                title="Sources Monitored"
                value={stats.sourcesMonitored}
                icon={<Globe className="w-5 h-5 text-white" />}
                color="from-purple-500 to-pink-600"
              />
            </div>

            {/* Quick Actions & Recent Threats */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentView("gather")}
                    className="w-full flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">
                        New Threat Intel
                      </div>
                      <div className="text-xs text-gray-400">
                        Report new intelligence
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
                  </button>

                  <button
                    onClick={() => setCurrentView("search")}
                    className="w-full flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
                      <Search className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">OSINT Search</div>
                      <div className="text-xs text-gray-400">
                        Search IOCs & indicators
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
                  </button>

                  <button
                    onClick={() => setCurrentView("correlate")}
                    className="w-full flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
                      <Network className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">
                        Correlate IOCs
                      </div>
                      <div className="text-xs text-gray-400">
                        Find related threats
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 ml-auto" />
                  </button>
                </div>

                {/* Threat Distribution */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 mt-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-4">
                    Threat Distribution
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-400">Critical</span>
                        <span className="text-gray-400">
                          {statistics?.criticalCount || 12}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: "10%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-orange-400">High</span>
                        <span className="text-gray-400">
                          {statistics?.highCount || 31}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: "24%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-yellow-400">Medium</span>
                        <span className="text-gray-400">
                          {statistics?.mediumCount || 48}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: "38%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-400">Low</span>
                        <span className="text-gray-400">
                          {statistics?.lowCount || 36}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: "28%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Threats */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Recent Threat Intelligence
                  </h3>
                  <button
                    onClick={loadThreats}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>

                <div className="space-y-4">
                  {threats.slice(0, 5).map((threat) => (
                    <div
                      key={threat.intelId}
                      className={`bg-slate-800/50 rounded-xl border p-4 hover:border-opacity-75 transition-all cursor-pointer ${
                        threat.severity === "CRITICAL"
                          ? "border-red-500/30 hover:border-red-500/50"
                          : threat.severity === "HIGH"
                          ? "border-orange-500/30 hover:border-orange-500/50"
                          : threat.severity === "MEDIUM"
                          ? "border-yellow-500/30 hover:border-yellow-500/50"
                          : "border-green-500/30 hover:border-green-500/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ThreatBadge severity={threat.severity} />
                            <span className="text-xs text-gray-500 bg-slate-700/50 px-2 py-0.5 rounded">
                              {threat.threatType.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {threat.intelId}
                            </span>
                          </div>
                          <h4 className="font-medium text-white mb-1">
                            {threat.title}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {threat.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(threat.lastSeen).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {threat.targetSectors.join(", ")}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {threat.targetCountries.join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-white">
                            {threat.confidenceScore}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentView("history")}
                  className="w-full mt-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white hover:border-slate-600/50 transition-all flex items-center justify-center gap-2"
                >
                  View All Threats
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gather View */}
        {currentView === "gather" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ThreatIntelForm onSubmit={handleIntelSubmit} loading={loading} />
            </div>
            <div>
              {lastIntel ? (
                <ThreatIntelCard intel={lastIntel} />
              ) : (
                <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center">
                  <Radar className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-semibold text-gray-400">
                    Ready for Intelligence
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Submit threat intelligence to see analysis results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {currentView === "history" && (
          <ThreatIntelHistory
            threats={threats}
            onRefresh={loadThreats}
            loading={loading}
          />
        )}

        {/* Correlate View */}
        {currentView === "correlate" && <CorrelationPanel threats={threats} />}

        {/* Search View */}
        {currentView === "search" && <IOCSearch />}

        {/* Analytics View */}
        {currentView === "analytics" && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">
              Analytics Dashboard
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Advanced threat analytics and intelligence reports coming soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnhancedIntelliScoutTool;

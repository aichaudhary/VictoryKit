import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Zap,
  Shield,
  Lock,
  ShieldOff,
  Search,
  Skull,
  AlertTriangle,
  CheckCircle2,
  Binary,
  FileWarning,
  HardDrive,
  Database,
  Server,
  Cpu,
  Activity,
  Eye,
  Target,
  Crosshair,
  LayoutDashboard,
  Monitor,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity as Pulse,
  Radio,
  Globe,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - SECURITY DASHBOARD
// ============================================================================

// 1. UnifiedMetricsAggregator - Real-time security metrics collection and display
const UnifiedMetricsAggregator: React.FC = () => {
  const [metrics, setMetrics] = useState<
    { id: number; source: string; metric: string; value: number; trend: string; status: string }[]
  >([]);

  useEffect(() => {
    const sources = ['SIEM', 'EDR', 'Firewall', 'WAF', 'IDS', 'Vulnerability Scanner'];
    const metricTypes = ['Alerts/Hour', 'Blocked Attacks', 'Response Time', 'Uptime %', 'False Positives'];

    const generateMetrics = () => {
      const newMetrics = Array.from({ length: 6 }, (_, i) => {
        const value = Math.floor(Math.random() * 1000) + 100;
        const trend = Math.random() > 0.5 ? 'up' : 'down';
        const status = value > 500 ? 'Good' : value > 200 ? 'Warning' : 'Critical';

        return {
          id: i,
          source: sources[Math.floor(Math.random() * sources.length)],
          metric: metricTypes[Math.floor(Math.random() * metricTypes.length)],
          value,
          trend,
          status,
        };
      });
      setMetrics(newMetrics);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZGFzaGJvYXJkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9IiMwNmI2ZDEiIG9wYWNpdHk9IjAuMyIvPjxsaW5lIHgxPSIwIiB5MT0iMTAiIHgyPSIyMCIgeTI9IjEwIiBzdHJva2U9IiMwNmI2ZDEiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjIiLz48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkYXNoYm9hcmQpIi8+PC9zdmc+')] opacity-30" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-cyan-400">
        Unified Metrics Aggregator - Real-Time Security Data Collection
      </div>

      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {metrics.map((metric, index) => (
            <div key={metric.id} className="bg-black/20 rounded-lg p-3 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 text-xs font-mono">
                  <span className={`px-2 py-1 rounded text-xs ${
                    metric.status === 'Good' ? 'bg-green-500/20 text-green-400' :
                    metric.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {metric.status}
                  </span>
                  <span className="text-blue-400">{metric.source}</span>
                </div>
                <div className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                  {metric.trend === 'up' ? '↗' : '↘'}
                </div>
              </div>
              <div className="text-sm font-bold text-cyan-300 mb-1">{metric.metric}</div>
              <div className="text-lg font-mono text-cyan-200">{metric.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-cyan-300">
        <span>Data Aggregation Active</span>
        <span>{metrics.length} Sources Connected</span>
      </div>
    </div>
  );
};

// 2. AlertCorrelationEngine - Cross-source alert analysis and correlation
const AlertCorrelationEngine: React.FC = () => {
  const [alerts, setAlerts] = useState<
    { id: number; sources: string[]; severity: string; correlation: number; description: string; status: string }[]
  >([]);

  useEffect(() => {
    const sources = ['SIEM', 'EDR', 'Firewall', 'WAF', 'IDS'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];

    const generateAlerts = () => {
      const newAlerts = Array.from({ length: 4 }, (_, i) => {
        const numSources = Math.floor(Math.random() * 3) + 2;
        const alertSources = sources.sort(() => 0.5 - Math.random()).slice(0, numSources);
        const correlation = Math.floor(Math.random() * 40) + 60; // 60-100%
        const severity = severities[Math.floor(Math.random() * severities.length)];

        return {
          id: i,
          sources: alertSources,
          severity,
          correlation,
          description: `${severity} severity alert correlated across ${numSources} sources`,
          status: correlation > 80 ? 'Correlated' : 'Analyzing',
        };
      });
      setAlerts(newAlerts);
    };

    generateAlerts();
    const interval = setInterval(generateAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-3xl border border-blue-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Correlation Network Visualization */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <radialGradient id="correlation" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Correlation nodes and connections */}
          {alerts.map((alert, index) => (
            <g key={alert.id}>
              <circle
                cx={80 + index * 80}
                cy={120 + (index % 2) * 60}
                r="15"
                fill={
                  alert.severity === 'Critical' ? '#ef4444' :
                  alert.severity === 'High' ? '#f97316' :
                  alert.severity === 'Medium' ? '#eab308' : '#22c55e'
                }
                opacity="0.7"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
              {/* Connection lines */}
              {index > 0 && (
                <line
                  x1={80 + (index - 1) * 80}
                  y1={120 + ((index - 1) % 2) * 60}
                  x2={80 + index * 80}
                  y2={120 + (index % 2) * 60}
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${index * 0.3}s` }}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-blue-400">
        Alert Correlation Engine - Cross-Source Analysis
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20">
          {alerts.map((alert, index) => (
            <div key={alert.id} className="bg-black/20 rounded-lg p-3 border border-blue-500/10 hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-blue-300 font-bold">{alert.sources.join(' + ')}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    alert.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.status === 'Correlated' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-blue-400">
                  {alert.correlation}% correlation
                </div>
              </div>
              <div className="text-xs font-mono text-blue-200">{alert.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-blue-300">
        <span>Correlation Analysis</span>
        <span>{alerts.filter(a => a.status === 'Correlated').length} Correlated Alerts</span>
      </div>
    </div>
  );
};

// 3. KPITrackingSystem - Security KPI monitoring and trend analysis
const KPITrackingSystem: React.FC = () => {
  const [kpis, setKpis] = useState<
    { id: number; name: string; current: number; target: number; trend: number; status: string }[]
  >([]);

  useEffect(() => {
    const kpiNames = ['MTTR', 'MTTD', 'False Positive Rate', 'Coverage %', 'Compliance Score'];

    const generateKPIs = () => {
      const newKPIs = Array.from({ length: 5 }, (_, i) => {
        const target = Math.floor(Math.random() * 100) + 50;
        const current = Math.floor(target * (0.7 + Math.random() * 0.6)); // 70-130% of target
        const trend = Math.floor(Math.random() * 20) - 10; // -10% to +10%
        const status = current >= target ? 'On Track' : current >= target * 0.8 ? 'Warning' : 'Off Track';

        return {
          id: i,
          name: kpiNames[i],
          current,
          target,
          trend,
          status,
        };
      });
      setKPIs(newKPIs);
    };

    generateKPIs();
    const interval = setInterval(generateKPIs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* KPI Trend Charts */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="kpi" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* KPI progress bars */}
          {kpis.slice(0, 4).map((kpi, index) => {
            const progress = Math.min((kpi.current / kpi.target) * 100, 100);
            return (
              <g key={kpi.id}>
                <rect
                  x="50"
                  y={60 + index * 50}
                  width="250"
                  height="8"
                  fill="#374151"
                  opacity="0.3"
                  rx="4"
                />
                <rect
                  x="50"
                  y={60 + index * 50}
                  width={250 * (progress / 100)}
                  height="8"
                  fill={
                    kpi.status === 'On Track' ? '#22c55e' :
                    kpi.status === 'Warning' ? '#eab308' : '#ef4444'
                  }
                  opacity="0.8"
                  rx="4"
                  className="animate-pulse"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
                <text
                  x="320"
                  y={68 + index * 50}
                  fontSize="8"
                  fill="#6366f1"
                  fontFamily="monospace"
                >
                  {progress.toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-indigo-400">
        KPI Tracking System - Security Performance Monitoring
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20">
          {kpis.map((kpi, index) => (
            <div key={kpi.id} className="bg-black/20 rounded-lg p-3 border border-indigo-500/10 hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-indigo-300 font-bold">{kpi.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    kpi.status === 'On Track' ? 'bg-green-500/20 text-green-400' :
                    kpi.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {kpi.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                  {kpi.trend > 0 ? '↗' : '↘'} {Math.abs(kpi.trend)}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-indigo-200">
                <div>
                  <div className="text-indigo-300 font-bold">{kpi.current}</div>
                  <div className="text-indigo-400/60">Current</div>
                </div>
                <div>
                  <div className="text-purple-300 font-bold">{kpi.target}</div>
                  <div className="text-purple-400/60">Target</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-indigo-300">
        <span>KPI Monitoring</span>
        <span>{kpis.filter(k => k.status === 'On Track').length} On Track</span>
      </div>
    </div>
  );
};

// 4. ThreatIntelligenceFeed - Real-time threat intelligence integration
const ThreatIntelligenceFeed: React.FC = () => {
  const [threats, setThreats] = useState<
    { id: number; type: string; source: string; confidence: number; impact: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    const types = ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Zero-day'];
    const sources = ['Mandiant', 'CrowdStrike', 'FireEye', 'Recorded Future', 'Darktrace'];
    const impacts = ['Low', 'Medium', 'High', 'Critical'];

    const generateThreats = () => {
      const newThreats = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        confidence: Math.floor(Math.random() * 30) + 70,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
      }));
      setThreats(newThreats);
    };

    generateThreats();
    const interval = setInterval(generateThreats, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Threat Intelligence Stream */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="threatfeed" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#a855f7" opacity="0.3"/>
              <path d="M20 10 L30 20 L20 30 L10 20 Z" fill="none" stroke="#a855f7" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#threatfeed)" />

          {/* Threat data points */}
          {threats.map((threat, index) => (
            <circle
              key={threat.id}
              cx={60 + index * 60}
              cy={100 + (index % 2) * 80}
              r="8"
              fill={
                threat.impact === 'Critical' ? '#ef4444' :
                threat.impact === 'High' ? '#f97316' :
                threat.impact === 'Medium' ? '#eab308' : '#22c55e'
              }
              opacity="0.7"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-purple-400">
        Threat Intelligence Feed - Real-Time Global Threat Data
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
          {threats.map((threat, index) => (
            <div key={threat.id} className="bg-black/20 rounded-lg p-3 border border-purple-500/10 hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-purple-300 font-bold">{threat.type}</span>
                  <span className="text-pink-400">from {threat.source}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    threat.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    threat.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    threat.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {threat.impact}
                  </span>
                </div>
                <div className="text-xs font-mono text-purple-400">
                  {threat.confidence}% confidence
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-purple-200">
                <span>Real-time intelligence</span>
                <span>{threat.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-purple-300">
        <span>Intelligence Feed</span>
        <span>{threats.length} Active Threats</span>
      </div>
    </div>
  );
};

// 5. ExecutiveSummaryGenerator - Automated executive reporting and insights
const ExecutiveSummaryGenerator: React.FC = () => {
  const [insights, setInsights] = useState<
    { id: number; category: string; insight: string; impact: string; recommendation: string; priority: string }[]
  >([]);

  useEffect(() => {
    const categories = ['Risk', 'Compliance', 'Performance', 'Threats', 'Operations'];
    const impacts = ['High', 'Medium', 'Low'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];

    const generateInsights = () => {
      const newInsights = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        category: categories[Math.floor(Math.random() * categories.length)],
        insight: `Automated analysis detected ${impacts[Math.floor(Math.random() * impacts.length)].toLowerCase()} impact security trend`,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        recommendation: 'Implement immediate mitigation strategy',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
      }));
      setInsights(newInsights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-3xl border border-pink-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Executive Summary Layout */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="executive" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="45" height="45" fill="none" stroke="#ec4899" strokeWidth="0.5" opacity="0.1"/>
              <circle cx="25" cy="25" r="1" fill="#ec4899" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#executive)" />

          {/* Priority indicators */}
          {insights.map((insight, index) => (
            <rect
              key={insight.id}
              x={40 + index * 80}
              y={120 + (index % 2) * 60}
              width="20"
              height="20"
              fill={
                insight.priority === 'Critical' ? '#ef4444' :
                insight.priority === 'High' ? '#f97316' :
                insight.priority === 'Medium' ? '#eab308' : '#22c55e'
              }
              opacity="0.6"
              rx="2"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-pink-400">
        Executive Summary Generator - Automated C-Level Reporting
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20">
          {insights.map((insight, index) => (
            <div key={insight.id} className="bg-black/20 rounded-lg p-3 border border-pink-500/10 hover:border-pink-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-pink-300 font-bold">{insight.category}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    insight.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    insight.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <div className="text-xs font-mono text-pink-400">
                  {insight.impact} Impact
                </div>
              </div>
              <div className="text-xs font-mono text-pink-200 mb-1">{insight.insight}</div>
              <div className="text-xs font-mono text-rose-300">{insight.recommendation}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-pink-300">
        <span>Executive Insights</span>
        <span>{insights.filter(i => i.priority === 'Critical').length} Critical Actions</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SecurityDashboardDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live metrics state
  const [dataSources, setDataSources] = useState(520);
  const [activeAlerts, setActiveAlerts] = useState(1247);
  const [kpiScore, setKpiScore] = useState(94.2);
  const [uptimePercent, setUptimePercent] = useState(99.97);

  useEffect(() => {
    // Live metrics simulation
    const sourcesInterval = setInterval(() => {
      setDataSources(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 2000);

    const alertsInterval = setInterval(() => {
      setActiveAlerts(prev => prev + Math.floor(Math.random() * 100) - 50);
    }, 3000);

    const kpiInterval = setInterval(() => {
      setKpiScore(prev => Math.max(85, Math.min(98, prev + (Math.random() - 0.5) * 0.5)));
    }, 4000);

    const uptimeInterval = setInterval(() => {
      setUptimePercent(prev => Math.max(99.5, Math.min(99.99, prev + (Math.random() - 0.5) * 0.01)));
    }, 5000);

    return () => {
      clearInterval(sourcesInterval);
      clearInterval(alertsInterval);
      clearInterval(kpiInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      // Content animations
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Floating background elements
      gsap.to('.floating-bg-1', {
        y: '+=20',
        duration: 4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.floating-bg-2', {
        y: '+=30',
        duration: 6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1,
      });

      gsap.to('.floating-bg-3', {
        x: '+=15',
        duration: 5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030d0d] text-white selection:bg-cyan-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-indigo-900/20" />

        {/* Animated floating elements */}
        <div className="floating-bg-1 absolute top-[10%] left-[5%] w-96 h-96 bg-cyan-600/5 blur-[100px] rounded-full" />
        <div className="floating-bg-2 absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="floating-bg-3 absolute bottom-[20%] left-[50%] w-80 h-80 bg-indigo-600/5 blur-[80px] rounded-full" />

        {/* Data stream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDZiNmQxIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-30" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            SecurityDashboard v6.2
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-cyan-500/20 backdrop-blur-3xl">
              <LayoutDashboard className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-500">
                Unified Visibility Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              SECURITY <span className="text-cyan-500">DASHBOARD</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Unified security visibility platform aggregating all security metrics, alerts, and
              KPIs in a single executive dashboard with real-time correlation and automated
              threat intelligence integration.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://securitydashboard.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-cyan-500/20"
              >
                View Dashboard
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Visibility: 100%
              </div>
            </div>
          </div>

          {/* Hero Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <UnifiedMetricsAggregator />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Live Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-cyan-500">
                {dataSources}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Data Sources
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {(activeAlerts / 1000).toFixed(1)}K+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Active Alerts
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {kpiScore.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                KPI Score
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {uptimePercent.toFixed(2)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Uptime
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Unified Metrics</h3>
              <p className="text-white/50 leading-relaxed">
                Aggregate security metrics from all tools into a single pane of glass for
                executive-level visibility and real-time monitoring across the entire security stack.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Alert Correlation</h3>
              <p className="text-white/50 leading-relaxed">
                Cross-reference alerts from multiple sources to identify patterns, reduce noise,
                and provide contextual threat intelligence with automated correlation scoring.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">KPI Tracking</h3>
              <p className="text-white/50 leading-relaxed">
                Track security KPIs and SLAs with automated reporting, trend analysis,
                and predictive insights to ensure continuous security posture improvement.
              </p>
            </div>
          </div>

          {/* Security Dashboard Engine Visualization */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
                Security Dashboard <span className="text-cyan-500">Engine</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Comprehensive security visibility platform with real-time data aggregation,
                intelligent alert correlation, and automated executive reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Engine Components */}
              <div className="space-y-8">
                <AlertCorrelationEngine />
                <KPITrackingSystem />
              </div>
              <div className="space-y-8">
                <ThreatIntelligenceFeed />
                <ExecutiveSummaryGenerator />
              </div>
            </div>

            {/* Capability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-cyan-500/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Radio className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="text-3xl font-black text-cyan-500">Real-Time</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Data Flow</div>
                <div className="text-xs text-white/40">Live metric updates</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Globe className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="text-3xl font-black text-cyan-500">500+</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Integrations</div>
                <div className="text-xs text-white/40">Security tool connectors</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Pulse className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="text-3xl font-black text-cyan-500">99.9%</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Uptime</div>
                <div className="text-xs text-white/40">Platform reliability</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-cyan-500" />
                </div>
                <div className="text-3xl font-black text-cyan-500">AI</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Insights</div>
                <div className="text-xs text-white/40">Automated analysis</div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="glass rounded-[3rem] border border-white/5 p-12">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Unified Security Dashboard</h3>
                <p className="text-white/60">Real-time security monitoring and executive visibility</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-cyan-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-cyan-500">1,247</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Active Alerts</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Correlated</span>
                      <span className="text-cyan-400">87%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-cyan-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-500">94.2%</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">KPI Compliance</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">All critical metrics met</div>
                    <div className="text-xs text-green-400">Board-ready reporting</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-cyan-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-500">520</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Data Sources</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Global threat intelligence</div>
                    <div className="text-xs text-blue-400">Real-time integration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://securitydashboard.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-cyan-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-cyan-500/20 flex items-center gap-4">
            Open Dashboard <LayoutDashboard className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboardDetail;

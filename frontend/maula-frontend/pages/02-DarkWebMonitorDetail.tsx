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
  Globe,
  Network,
  Wifi,
  Radio,
} from 'lucide-react';
import {
  RadarSweep,
  ParticleNetwork,
  DataStream,
  HexGrid,
  PulseRings,
  FloatingIcons,
} from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - DARK WEB MONITOR
// ============================================================================

// 1. DarkWebScanner - Scanning radar for dark web threats
const DarkWebScanner: React.FC = () => {
  const [threats, setThreats] = useState<
    { id: number; x: number; y: number; type: string; severity: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newThreat = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          type: ['data_breach', 'credential_dump', 'ransomware', 'zero_day'][
            Math.floor(Math.random() * 4)
          ],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        };
        setThreats((prev) => [...prev.slice(-8), newThreat]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="darkWebGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </radialGradient>
          <filter id="darkWebGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#ef4444"
          strokeWidth="0.2"
          opacity="0.4"
        />
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="#eab308"
          strokeWidth="0.2"
          opacity="0.5"
        />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 5s linear infinite' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#darkWebGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#7c3aed"
            strokeWidth="0.8"
            filter="url(#darkWebGlow)"
          />
        </g>

        <line x1="5" y1="50" x2="95" y2="50" stroke="#7c3aed" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#7c3aed" strokeWidth="0.1" opacity="0.3" />

        {threats.map((threat) => (
          <g key={threat.id}>
            <circle
              cx={threat.x}
              cy={threat.y}
              r="1.5"
              fill={severityColors[threat.severity as keyof typeof severityColors]}
              opacity="0.8"
            >
              <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={threat.x}
              cy={threat.y}
              r="4"
              fill="none"
              stroke={severityColors[threat.severity as keyof typeof severityColors]}
              strokeWidth="0.5"
              opacity="0.4"
            >
              <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.4;0;0.4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. DataLeakStream - Flowing data leak indicators
const DataLeakStream: React.FC = () => {
  const streams = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 4,
        chars: Array.from({ length: 10 }, () => (Math.random() > 0.5 ? '1' : '0')).join(''),
        leak: ['PII', 'Credentials', 'Financial', 'Medical'][Math.floor(Math.random() * 4)],
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute text-red-400 font-mono text-[8px] whitespace-nowrap flex items-center gap-1"
          style={{
            left: `${stream.x}%`,
            animation: `dataLeakFlow ${stream.duration}s linear ${stream.delay}s infinite`,
          }}
        >
          <Skull className="w-2 h-2" />
          <span>{stream.leak}</span>
          <span className="text-purple-400">{stream.chars}</span>
        </div>
      ))}
      <style>{`
        @keyframes dataLeakFlow {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 3. ThreatNetwork - Connected threat actor nodes
const ThreatNetwork: React.FC = () => {
  const nodes = useMemo(
    () => [
      { id: 1, x: 50, y: 20, type: 'forum', label: 'Dark Forums' },
      { id: 2, x: 20, y: 40, type: 'market', label: 'Markets' },
      { id: 3, x: 80, y: 40, type: 'leak', label: 'Data Leaks' },
      { id: 4, x: 35, y: 70, type: 'ransomware', label: 'Ransomware' },
      { id: 5, x: 65, y: 70, type: 'exploit', label: 'Exploits' },
      { id: 6, x: 50, y: 50, type: 'monitor', label: 'Monitor' },
    ],
    []
  );

  const connections = useMemo(
    () => [
      [1, 6],
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
      [1, 3],
      [2, 4],
      [3, 5],
    ],
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="threatConnection" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {connections.map(([from, to], i) => {
          const fromNode = nodes.find((n) => n.id === from);
          const toNode = nodes.find((n) => n.id === to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="url(#threatConnection)"
              strokeWidth="0.5"
              opacity="0.4"
            >
              <animate
                attributeName="opacity"
                values="0.4;0.8;0.4"
                dur="3s"
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill={node.type === 'monitor' ? '#ef4444' : '#7c3aed'}
              opacity="0.8"
            >
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            </circle>
            <text
              x={node.x}
              y={node.y - 6}
              textAnchor="middle"
              className="text-[6px] font-mono fill-purple-400"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 4. BreachAlertWaveform - Real-time breach alert visualization
const BreachAlertWaveform: React.FC = () => {
  const [points, setPoints] = useState<number[]>(Array(50).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => {
        const newPoints = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1];
        const spike = Math.random() > 0.85 ? (Math.random() > 0.5 ? 25 : -25) : 0;
        const newValue = Math.max(25, Math.min(75, lastValue + (Math.random() - 0.5) * 10 + spike));
        newPoints.push(newValue);
        return newPoints;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 2} ${p}`).join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="breachWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d={pathData + ' L 100 100 L 0 100 Z'} fill="url(#breachWaveGradient)" />
        <path d={pathData} fill="none" stroke="#7c3aed" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

// 5. OnionNetworkGrid - Tor network visualization
const OnionNetworkGrid: React.FC = () => {
  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const newActive = new Set<number>();
      for (let i = 0; i < 15; i++) {
        if (Math.random() > 0.7) {
          newActive.add(Math.floor(Math.random() * 64));
        }
      }
      setActiveNodes(newActive);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const nodes = useMemo(() => {
    const grid = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        grid.push({
          id: row * 8 + col,
          x: col * 12.5 + 6.25,
          y: row * 12.5 + 6.25,
        });
      }
    }
    return grid;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="1.5"
            fill={activeNodes.has(node.id) ? '#7c3aed' : '#374151'}
            opacity={activeNodes.has(node.id) ? 0.8 : 0.3}
          >
            {activeNodes.has(node.id) && (
              <animate attributeName="r" values="1.5;3;1.5" dur="1s" repeatCount="indefinite" />
            )}
          </circle>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DarkWebMonitorDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'monitoring' | 'intelligence' | 'response'
  >('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    sitesMonitored: 284739,
    threatsDetected: 15684,
    dataLeaks: 2341,
    alertsSent: 892,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        sitesMonitored: prev.sitesMonitored + Math.floor(Math.random() * 50),
        threatsDetected: prev.threatsDetected + Math.floor((Math.random() - 0.9) * 20),
        dataLeaks: prev.dataLeaks + Math.floor((Math.random() - 0.95) * 10),
        alertsSent: prev.alertsSent + Math.floor((Math.random() - 0.8) * 5),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0208] text-white selection:bg-purple-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-purple-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-red-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <ParticleNetwork color="#a855f7" />
        <DataStream color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <DataStream color="#a855f7" />
        <DarkWebScanner />
        <DataLeakStream />
        <OnionNetworkGrid />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            DarkWebMonitor Enterprise v5.1
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
              <Eye className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">
                Dark Web Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              DARK WEB <span className="text-purple-500">MONITOR</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Illuminate the shadows. Advanced dark web monitoring that scans hidden networks,
              identifies threats targeting your organization, and provides actionable intelligence.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://darkwebmonitor.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Deep Scan
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                284K+ Sites Monitored
              </div>
            </div>
          </div>

          {/* Dark Web Monitor Tool Preview Visualization */}
          <div className="relative group rounded-[2rem] overflow-hidden border border-purple-500/30 shadow-2xl bg-[#0d1117] backdrop-blur-sm">
            {/* Tool Header Preview */}
            <div className="bg-[#161b22] border-b border-purple-500/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">DarkWebMonitor</div>
                    <div className="text-xs text-gray-500">Advanced Threat Intelligence</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                    12 Critical
                  </span>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                    43 Active
                  </span>
                </div>
              </div>

              {/* Tool Navigation Tabs */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                {[
                  { name: 'Live Threats', active: true },
                  { name: 'Asset Monitor', active: false },
                  { name: 'Breach Check', active: false },
                  { name: 'Intel Gather', active: false },
                  { name: 'OSINT', active: false },
                ].map((tab, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      tab.active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
                    }`}
                  >
                    {tab.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stats Preview */}
            <div className="p-6 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    value: '847K',
                    label: 'Global Threats',
                    color: 'text-white',
                    trend: '+12.5%',
                    trendColor: 'text-green-400',
                  },
                  {
                    value: '12.8K',
                    label: 'Active Attacks',
                    color: 'text-orange-400',
                    trend: 'Real-time',
                    trendColor: 'text-orange-400',
                  },
                  {
                    value: '3,421',
                    label: 'Compromised',
                    color: 'text-yellow-400',
                    trend: '-8%',
                    trendColor: 'text-red-400',
                  },
                  {
                    value: '127',
                    label: 'Data Breaches',
                    color: 'text-purple-400',
                    trend: 'Today',
                    trendColor: 'text-purple-400',
                  },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#1c2128] rounded-xl p-3 border border-gray-800/50">
                    <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                    <div className="text-[9px] text-gray-500 mt-1">{stat.label}</div>
                    <div className={`text-[8px] mt-1 ${stat.trendColor}`}>{stat.trend}</div>
                  </div>
                ))}
              </div>

              {/* Live Threat Feed Preview */}
              <div className="bg-[#1c2128] rounded-xl border border-gray-800/50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live Threat Feed
                  </span>
                </div>
                <div className="divide-y divide-gray-800/30">
                  {[
                    {
                      type: 'Malware',
                      severity: 'HIGH',
                      target: 'Financial Institution',
                      location: 'Brazil',
                    },
                    { type: 'Breach', severity: 'CRITICAL', target: 'Healthcare', location: 'USA' },
                    {
                      type: 'Phishing',
                      severity: 'MEDIUM',
                      target: 'E-commerce',
                      location: 'Germany',
                    },
                  ].map((threat, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            threat.severity === 'CRITICAL'
                              ? 'bg-red-500/20'
                              : threat.severity === 'HIGH'
                                ? 'bg-orange-500/20'
                                : 'bg-yellow-500/20'
                          }`}
                        >
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              threat.severity === 'CRITICAL'
                                ? 'text-red-400'
                                : threat.severity === 'HIGH'
                                  ? 'text-orange-400'
                                  : 'text-yellow-400'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{threat.type}</span>
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                                threat.severity === 'CRITICAL'
                                  ? 'bg-red-500/20 text-red-400'
                                  : threat.severity === 'HIGH'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {threat.severity}
                            </span>
                          </div>
                          <div className="text-[9px] text-green-400">Target: {threat.target}</div>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-500">● {threat.location}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Distribution Mini Chart */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1c2128] rounded-xl p-4 border border-gray-800/50">
                  <div className="text-xs font-bold text-white mb-3">Threat Distribution</div>
                  {[
                    { name: 'Ransomware', count: 42, color: 'bg-red-500' },
                    { name: 'Phishing', count: 38, color: 'bg-orange-500' },
                    { name: 'Malware', count: 31, color: 'bg-yellow-500' },
                    { name: 'APT', count: 15, color: 'bg-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] text-gray-400 w-16">{item.name}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div
                          className={`${item.color} h-1.5 rounded-full`}
                          style={{ width: `${item.count}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-gray-500 w-6">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#1c2128] rounded-xl p-4 border border-gray-800/50">
                  <div className="text-xs font-bold text-white mb-3">Intel Sources</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'MISP', count: 12 },
                      { name: 'VirusTotal', count: 8 },
                      { name: 'AlienVault', count: 15 },
                      { name: 'Shodan', count: 4 },
                    ].map((source, i) => (
                      <div
                        key={i}
                        className="bg-gray-800/50 rounded-lg px-2 py-1.5 flex items-center justify-between"
                      >
                        <span className="text-[9px] text-gray-400">{source.name}</span>
                        <span className="text-[9px] text-green-400 font-bold">{source.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="bg-[#161b22] border-t border-purple-500/20 px-6 py-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  MONITORING: ACTIVE
                </span>
                <span className="text-gray-500">284K+ Sites Indexed</span>
                <span className="text-green-400">● TOR NETWORK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-purple-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500 tabular-nums">
                {liveMetrics.sitesMonitored.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Sites Monitored
              </div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div
                  className="bg-purple-500 h-1 rounded-full animate-pulse"
                  style={{ width: '89%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white tabular-nums">
                {liveMetrics.threatsDetected.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Threats Detected
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full animate-pulse"
                  style={{ width: '94%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.dataLeaks.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Data Leaks Found
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="correlation-bar bg-orange-500 h-1 rounded-full"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500">
                {liveMetrics.alertsSent.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Alerts Sent
              </div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div
                  className="bg-purple-500 h-1 rounded-full animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Deep Web Scanning</h3>
              <p className="text-white/50 leading-relaxed">
                Advanced crawlers navigate hidden networks, scanning dark web forums, marketplaces,
                and data dumps for mentions of your organization.
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                284K sites scanned daily
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Threat Intelligence</h3>
              <p className="text-white/50 leading-relaxed">
                AI-powered analysis of dark web chatter, correlating multiple signals to identify
                credible threats and emerging attack campaigns.
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                15K threats analyzed
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Instant Alerts</h3>
              <p className="text-white/50 leading-relaxed">
                Real-time notifications when your data appears on dark web markets or when threats
                targeting your organization are detected.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                Sub-second alerts
              </div>
            </div>
          </div>

          {/* Monitoring Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-purple-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Dark Web Intelligence Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">
                Multi-layered monitoring combining automated scanning, AI analysis, and human
                intelligence for comprehensive dark web visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Monitoring capabilities */}
                {[
                  {
                    capability: 'Onion Site Crawling',
                    coverage: 99.1,
                    icon: Globe,
                    color: 'text-purple-400',
                  },
                  {
                    capability: 'Forum Analysis',
                    coverage: 97.8,
                    icon: Network,
                    color: 'text-blue-400',
                  },
                  {
                    capability: 'Market Monitoring',
                    coverage: 98.5,
                    icon: Database,
                    color: 'text-green-400',
                  },
                  {
                    capability: 'Credential Detection',
                    coverage: 99.3,
                    icon: Lock,
                    color: 'text-yellow-400',
                  },
                  {
                    capability: 'Threat Correlation',
                    coverage: 96.9,
                    icon: Target,
                    color: 'text-red-400',
                  },
                  {
                    capability: 'Real-time Alerts',
                    coverage: 99.8,
                    icon: Zap,
                    color: 'text-cyan-400',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-purple-400 font-mono text-sm">
                        {item.coverage}% coverage
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-purple-500/20 rounded-full">
                      <div
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${item.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Intelligence dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-purple-500/10 p-8">
                <div className="space-y-6">
                  {/* Intelligence metrics */}
                  {[
                    { metric: 'Sites Indexed', value: 284739, status: 'comprehensive' },
                    { metric: 'Daily Scans', value: 15000, status: 'continuous' },
                    { metric: 'False Positives', value: 0.2, status: 'minimal' },
                    { metric: 'Response Time', value: 0.3, status: 'instant' },
                    { metric: 'Intelligence Quality', value: 98, status: 'excellent' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-purple-400">{item.metric}</div>
                      <div className="flex-1 bg-purple-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'comprehensive'
                              ? 'bg-blue-500'
                              : item.status === 'continuous'
                                ? 'bg-green-500'
                                : item.status === 'minimal'
                                  ? 'bg-yellow-500'
                                  : item.status === 'instant'
                                    ? 'bg-purple-500'
                                    : 'bg-red-500'
                          } transition-all duration-1000`}
                          style={{
                            width: `${typeof item.value === 'number' && item.value > 10 ? (item.value / 300000) * 100 : item.value}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">
                        {item.value}
                        {typeof item.value === 'number' && item.value > 10 ? '' : '%'}
                      </div>
                      <div className="w-20 text-xs font-mono text-purple-400 text-right capitalize">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-purple-400">
                  <span>Intelligence Engine Status</span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-purple-500/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://darkwebmonitor.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4"
          >
            Shadow Intelligence <Eye className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DarkWebMonitorDetail;

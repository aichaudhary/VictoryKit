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
  Radar,
  Layers,
  Signal,
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
// EPIC ANIMATED VISUAL COMPONENTS - ZERO DAY DETECTION
// ============================================================================

// 1. ZeroDayScanner - Advanced vulnerability scanning radar
const ZeroDayScanner: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<
    { id: number; x: number; y: number; severity: string; type: string; confidence: number }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newVuln = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
          type: ['RCE', 'SQLi', 'XSS', 'Buffer Overflow', 'Logic Flaw'][
            Math.floor(Math.random() * 5)
          ],
          confidence: 70 + Math.random() * 30,
        };
        setVulnerabilities((prev) => [...prev.slice(-6), newVuln]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="zeroDayGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </radialGradient>
          <filter id="zeroDayGlow">
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
          stroke="#ef4444"
          strokeWidth="0.3"
          opacity="0.3"
        />
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#f97316"
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

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 6s linear infinite' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#zeroDayGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#ef4444"
            strokeWidth="0.8"
            filter="url(#zeroDayGlow)"
          />
        </g>

        <line x1="5" y1="50" x2="95" y2="50" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />

        {vulnerabilities.map((vuln) => (
          <g key={vuln.id}>
            <circle
              cx={vuln.x}
              cy={vuln.y}
              r="2"
              fill={severityColors[vuln.severity as keyof typeof severityColors]}
              opacity="0.9"
            >
              <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={vuln.x}
              cy={vuln.y}
              r="5"
              fill="none"
              stroke={severityColors[vuln.severity as keyof typeof severityColors]}
              strokeWidth="0.5"
              opacity="0.5"
            >
              <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur="1.5s"
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

// 2. ExploitDetection - Real-time exploit pattern recognition
const ExploitDetection: React.FC = () => {
  const [patterns, setPatterns] = useState<
    { id: number; pattern: string; confidence: number; detected: boolean }[]
  >([]);

  useEffect(() => {
    const exploitPatterns = [
      'Buffer Overflow',
      'SQL Injection',
      'XSS Attack',
      'RCE Exploit',
      'Privilege Escalation',
      'Memory Corruption',
      'Format String',
      'Race Condition',
      'Logic Flaw',
      'Zero Day',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const randomPattern = exploitPatterns[Math.floor(Math.random() * exploitPatterns.length)];
        const newPattern = {
          id: Date.now(),
          pattern: randomPattern,
          confidence: 60 + Math.random() * 40,
          detected: Math.random() > 0.5,
        };
        setPatterns((prev) => [...prev.slice(-8), newPattern]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {patterns.map((pattern, i) => (
        <div
          key={pattern.id}
          className={`absolute text-xs font-mono whitespace-nowrap flex items-center gap-2 ${
            pattern.detected ? 'text-red-400' : 'text-orange-400'
          }`}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `exploitFloat ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
          }}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>{pattern.pattern}</span>
          <span className="text-white/50">{pattern.confidence.toFixed(0)}%</span>
        </div>
      ))}
      <style>{`
        @keyframes exploitFloat {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 3. VulnerabilityRadar - Multi-layered vulnerability detection
const VulnerabilityRadar: React.FC = () => {
  const [layers, setLayers] = useState([
    { name: 'Network Layer', threats: 12, color: '#ef4444' },
    { name: 'Application Layer', threats: 8, color: '#f97316' },
    { name: 'System Layer', threats: 15, color: '#eab308' },
    { name: 'Data Layer', threats: 6, color: '#22c55e' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayers((prev) =>
        prev.map((layer) => ({
          ...layer,
          threats: Math.max(0, layer.threats + (Math.random() - 0.5) * 4),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {layers.map((layer, i) => {
          const radius = 20 + i * 15;
          const circumference = 2 * Math.PI * radius;
          const strokeDasharray = circumference;
          const strokeDashoffset = circumference - (layer.threats / 20) * circumference;

          return (
            <g key={layer.name}>
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={layer.color}
                strokeWidth="0.5"
                opacity="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={layer.color}
                strokeWidth="2"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                opacity="0.8"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values={`${circumference};${strokeDashoffset}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x="50"
                y={50 - radius - 3}
                textAnchor="middle"
                className="text-[4px] font-mono fill-white"
              >
                {layer.name}: {layer.threats}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 4. CodeAnalysisGrid - Binary code analysis visualization
const CodeAnalysisGrid: React.FC = () => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(16)
      .fill(null)
      .map(() => Array(16).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prev) => prev.map((row) => row.map(() => Math.random() > 0.85)));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <div className="grid grid-cols-16 gap-0.5 w-full h-full">
        {grid.flat().map((active, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-300 ${
              active ? 'bg-red-500/60' : 'bg-red-500/10'
            }`}
          >
            {active && <div className="w-full h-full bg-red-400/40 animate-pulse rounded-sm"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. ThreatSignature - Dynamic threat signature matching
const ThreatSignature: React.FC = () => {
  const [signatures, setSignatures] = useState<
    { id: number; signature: string; match: number; type: string }[]
  >([]);

  useEffect(() => {
    const signatureTypes = ['Shellcode', 'ROP Chain', 'Heap Spray', 'Format String', 'SQL Payload'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newSig = {
          id: Date.now(),
          signature: signatureTypes[Math.floor(Math.random() * signatureTypes.length)],
          match: 80 + Math.random() * 20,
          type: ['malware', 'exploit', 'backdoor'][Math.floor(Math.random() * 3)],
        };
        setSignatures((prev) => [...prev.slice(-5), newSig]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {signatures.map((sig, i) => (
        <div
          key={sig.id}
          className="absolute bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `signaturePulse ${2 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-red-400 font-bold">{sig.signature}</div>
          <div className="text-white/70">{sig.match.toFixed(1)}% match</div>
          <div className="text-orange-400">{sig.type}</div>
        </div>
      ))}
      <style>{`
        @keyframes signaturePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ZeroDayDetectDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'analysis' | 'response'>(
    'overview'
  );
  const [liveMetrics, setLiveMetrics] = useState({
    vulnerabilitiesFound: 1247,
    zeroDaysDetected: 23,
    exploitsBlocked: 1894,
    scanCoverage: 99.7,
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
        vulnerabilitiesFound: prev.vulnerabilitiesFound + Math.floor((Math.random() - 0.8) * 10),
        zeroDaysDetected: prev.zeroDaysDetected + Math.floor((Math.random() - 0.95) * 2),
        exploitsBlocked: prev.exploitsBlocked + Math.floor((Math.random() - 0.7) * 15),
        scanCoverage: Math.min(100, prev.scanCoverage + (Math.random() - 0.5) * 0.1),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0208] text-white selection:bg-red-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Unique gradient blobs for Zero-Day theme - red/orange spectrum */}
        <div className="absolute top-[-25%] right-[-10%] w-[900px] h-[900px] bg-gradient-radial from-red-600/10 via-orange-600/5 to-transparent blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[1000px] h-[1000px] bg-gradient-radial from-orange-500/8 via-yellow-600/4 to-transparent blur-[220px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-gradient-radial from-red-500/6 via-transparent to-transparent blur-[150px] rounded-full animate-pulse" style={{animationDuration: '8s'}} />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        
        {/* Animated scan lines for tech feel */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan-vertical" style={{animationDuration: '4s'}} />
          <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-scan-horizontal" style={{animationDuration: '5s'}} />
        </div>
        
        {/* Custom background animations */}
        <VulnerabilityRadar />
        <ExploitDetection />
        <ThreatSignature />
        <CodeAnalysisGrid />
        
        {/* Subtle floating particles for depth */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {Array.from({length: 20}).map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-red-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        <style>{`
          @keyframes scan-vertical {
            0%, 100% { top: -2%; }
            50% { top: 102%; }
          }
          @keyframes scan-horizontal {
            0%, 100% { left: -2%; }
            50% { left: 102%; }
          }
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
            25% { transform: translate(10px, -20px) scale(1.2); opacity: 0.4; }
            50% { transform: translate(-10px, -40px) scale(0.8); opacity: 0.3; }
            75% { transform: translate(15px, -60px) scale(1.1); opacity: 0.5; }
          }
        `}</style>
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
            ZeroDayDetect Enterprise v6.1
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
              <Radar className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500">
                Zero Day Detection
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              ZERO DAY <span className="text-red-500">DETECT</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Uncover hidden vulnerabilities before attackers do. Advanced zero-day detection using
              behavioral analysis, signature matching, and AI-powered threat hunting.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://zerodaydetect.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/20 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Deep Scan
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                99.7% Coverage
              </div>
            </div>
          </div>

          {/* Zero Day Detection Tool Preview - Realistic Dashboard */}
          <div className="relative group rounded-[2rem] overflow-hidden border border-red-500/30 shadow-2xl bg-[#0a0a0a]">
            {/* Tool Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-red-500/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-red-500/30">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">ZeroDayDetect</div>
                    <div className="text-[10px] text-gray-400">
                      Zero-Day Threat Intelligence Platform
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 backdrop-blur-sm">
                    <span className="text-[11px] font-bold text-red-400">● LIVE FEED</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                    <span className="text-[11px] font-bold text-green-400">MONITORING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row - 5 Stats Across */}
            <div className="bg-slate-900/50 border-b border-red-500/10 px-6 py-4 grid grid-cols-5 gap-4">
              {[
                { label: 'TOTAL ZERO-DAYS', value: '20', trend: '+3', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
                { label: 'CRITICAL', value: '3', trend: '+1', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
                { label: 'IN THE WILD', value: '12', trend: '+2', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                { label: 'UNPATCHED', value: '13', trend: '+4', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
                { label: 'LAST UPDATE', value: '2m', trend: 'ago', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} border ${stat.border} rounded-xl p-3 text-center`}>
                  <div className="text-[9px] text-gray-400 mb-1 font-medium">{stat.label}</div>
                  <div className={`text-2xl font-black ${stat.color} tabular-nums`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{stat.trend}</div>
                </div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-900/30 border-b border-red-500/10 px-6 flex gap-2">
              {[
                { name: 'Zero-Day Feed', active: true },
                { name: 'Exploit DB', active: false },
                { name: 'Vuln Scanner', active: false },
                { name: 'Attack Surface', active: false },
                { name: 'Threat Hunt', active: false },
              ].map((tab, i) => (
                <button
                  key={i}
                  className={`px-5 py-3 text-[11px] font-semibold transition-all rounded-t-lg ${
                    tab.active
                      ? 'text-red-400 bg-gradient-to-b from-red-500/10 to-transparent border-t-2 border-red-500 shadow-lg'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-slate-800/30'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Main Content Area - Zero-Day Feed */}
            <div className="p-6 space-y-4">
              {/* Stats Cards Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Zero-Days', value: '20', icon: Target, color: 'red' },
                  { label: 'Critical Severity', value: '3', icon: AlertTriangle, color: 'red' },
                  { label: 'In The Wild', value: '12', icon: Activity, color: 'orange' },
                  { label: 'Unpatched', value: '13', icon: Shield, color: 'yellow' },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`bg-slate-800/40 border border-${card.color}-500/20 rounded-xl p-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <card.icon className={`w-5 h-5 text-${card.color}-400`} />
                      <div className={`text-2xl font-black text-${card.color}-400 tabular-nums`}>
                        {card.value}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400">{card.label}</div>
                  </div>
                ))}
              </div>

              {/* Vulnerability Feed List */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden">
                <div className="bg-slate-900/50 border-b border-slate-700/30 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white">Live Zero-Day Feed</span>
                    <span className="text-[10px] text-gray-500">(Last 24 hours)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded-lg bg-slate-700/50 text-[10px] text-gray-400 hover:bg-slate-600/50 transition">
                      Filter
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-red-500/20 text-[10px] text-red-400 border border-red-500/30 hover:bg-red-500/30 transition">
                      Export
                    </button>
                  </div>
                </div>

                {/* Vulnerability Items */}
                <div className="divide-y divide-slate-700/30">
                  {[
                    {
                      cve: 'CVE-2024-9680',
                      title: 'Remote Code Execution in Firefox',
                      severity: 'CRITICAL',
                      severityColor: 'red',
                      score: '9.8',
                      status: 'In Wild',
                      statusColor: 'red',
                      vendor: 'Mozilla',
                      published: '2 hours ago',
                    },
                    {
                      cve: 'CVE-2024-43451',
                      title: 'Windows NTLM Hash Disclosure',
                      severity: 'HIGH',
                      severityColor: 'orange',
                      score: '7.5',
                      status: 'Unpatched',
                      statusColor: 'yellow',
                      vendor: 'Microsoft',
                      published: '5 hours ago',
                    },
                    {
                      cve: 'CVE-2024-8190',
                      title: 'Ivanti Cloud Service Appliance Command Injection',
                      severity: 'CRITICAL',
                      severityColor: 'red',
                      score: '9.4',
                      status: 'In Wild',
                      statusColor: 'red',
                      vendor: 'Ivanti',
                      published: '8 hours ago',
                    },
                  ].map((vuln, i) => (
                    <div
                      key={i}
                      className="p-4 hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono font-bold text-blue-400">
                              {vuln.cve}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold bg-${vuln.severityColor}-500/20 text-${vuln.severityColor}-400 border border-${vuln.severityColor}-500/30`}
                            >
                              {vuln.severity}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold bg-${vuln.statusColor}-500/10 text-${vuln.statusColor}-400 border border-${vuln.statusColor}-500/30`}
                            >
                              {vuln.status}
                            </span>
                          </div>
                          <div className="text-sm text-white group-hover:text-red-400 transition font-medium">
                            {vuln.title}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                            <span>Vendor: {vuln.vendor}</span>
                            <span>•</span>
                            <span>Published: {vuln.published}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-[9px] text-gray-500">CVSS Score</div>
                            <div className={`text-xl font-black text-${vuln.severityColor}-400 tabular-nums`}>
                              {vuln.score}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                <div className="bg-slate-900/30 border-t border-slate-700/30 px-4 py-3 text-center">
                  <button className="text-[11px] text-gray-400 hover:text-red-400 transition font-medium">
                    Load More Vulnerabilities →
                  </button>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-red-500/20 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-mono font-bold text-red-400">THREAT FEED: ACTIVE</span>
                </div>
                <div className="w-32 h-1.5 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="text-gray-500">Intelligence Engine: <span className="text-green-400">Online</span></span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">Last Scan: <span className="text-blue-400">2m ago</span></span>
                <span className="text-gray-500">•</span>
                <span className="text-green-400 animate-pulse">● MONITORING 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-red-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500 tabular-nums">
                {liveMetrics.vulnerabilitiesFound.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Vulnerabilities Found
              </div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full animate-pulse"
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white tabular-nums">
                {liveMetrics.zeroDaysDetected.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Zero Days Detected
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-orange-500 h-1 rounded-full animate-pulse"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.exploitsBlocked.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Exploits Blocked
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500">
                {liveMetrics.scanCoverage.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Scan Coverage
              </div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full animate-pulse"
                  style={{ width: `${liveMetrics.scanCoverage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Binary className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Binary Analysis</h3>
              <p className="text-white/50 leading-relaxed">
                Deep static and dynamic analysis of binaries to identify unknown vulnerabilities and
                zero-day exploits before they can be weaponized.
              </p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                1.2M binaries analyzed
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Behavioral Detection</h3>
              <p className="text-white/50 leading-relaxed">
                AI-powered behavioral analysis that identifies anomalous patterns and zero-day
                attacks by learning normal system behavior.
              </p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                99.7% accuracy rate
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Instant Response</h3>
              <p className="text-white/50 leading-relaxed">
                Automated response mechanisms that isolate affected systems and block zero-day
                exploits in real-time, minimizing breach impact.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                Sub-100ms response
              </div>
            </div>
          </div>

          {/* Detection Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-red-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Zero Day Detection Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">
                Multi-layered detection combining signature analysis, behavioral monitoring, and
                AI-driven threat hunting for comprehensive zero-day protection.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Detection capabilities */}
                {[
                  {
                    capability: 'Signature Matching',
                    coverage: 98.3,
                    icon: Search,
                    color: 'text-red-400',
                  },
                  {
                    capability: 'Behavioral Analysis',
                    coverage: 97.1,
                    icon: Activity,
                    color: 'text-orange-400',
                  },
                  {
                    capability: 'Binary Analysis',
                    coverage: 99.2,
                    icon: Binary,
                    color: 'text-yellow-400',
                  },
                  {
                    capability: 'Anomaly Detection',
                    coverage: 96.8,
                    icon: AlertTriangle,
                    color: 'text-purple-400',
                  },
                  {
                    capability: 'Exploit Prevention',
                    coverage: 98.9,
                    icon: Shield,
                    color: 'text-blue-400',
                  },
                  {
                    capability: 'Real-time Response',
                    coverage: 99.5,
                    icon: Zap,
                    color: 'text-green-400',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-4 bg-red-500/5 rounded-2xl border border-red-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-red-400 font-mono text-sm">
                        {item.coverage}% coverage
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-red-500/20 rounded-full">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${item.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detection dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-red-500/10 p-8">
                <div className="space-y-6">
                  {/* Detection metrics */}
                  {[
                    { metric: 'Scan Rate', value: 1500000, status: 'high' },
                    { metric: 'False Positives', value: 0.3, status: 'low' },
                    { metric: 'Detection Speed', value: 0.05, status: 'fast' },
                    { metric: 'Coverage Depth', value: 99, status: 'comprehensive' },
                    { metric: 'AI Confidence', value: 97, status: 'excellent' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-red-400">{item.metric}</div>
                      <div className="flex-1 bg-red-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'high'
                              ? 'bg-green-500'
                              : item.status === 'low'
                                ? 'bg-blue-500'
                                : item.status === 'fast'
                                  ? 'bg-purple-500'
                                  : item.status === 'comprehensive'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{
                            width: `${typeof item.value === 'number' && item.value > 10 ? (item.value / 2000000) * 100 : item.value}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">
                        {item.value}
                        {typeof item.value === 'number' && item.value > 10 ? '/sec' : '%'}
                      </div>
                      <div className="w-20 text-xs font-mono text-red-400 text-right capitalize">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-400">
                  <span>Detection Engine Status</span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-red-500/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://zerodaydetect.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/20 flex items-center gap-4"
          >
            Zero Day Shield <Radar className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ZeroDayDetectDetail;

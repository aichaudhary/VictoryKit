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
  CreditCard,
  DollarSign,
  TrendingDown,
  BarChart3,
  Fingerprint,
  Globe,
  Mail,
  Phone,
  Key,
  Link,
  Wifi,
  ShieldCheck,
  Scan,
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
// EPIC ANIMATED VISUAL COMPONENTS - FRAUD GUARD
// ============================================================================

// 1. FraudDetectionRadar - Rotating radar with fraud pattern detection
const FraudDetectionRadar: React.FC = () => {
  const [fraudAlerts, setFraudAlerts] = useState<
    { id: number; x: number; y: number; type: string; severity: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          type: ['card_fraud', 'identity_theft', 'money_laundering', 'phishing'][
            Math.floor(Math.random() * 4)
          ],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        };
        setFraudAlerts((prev) => [...prev.slice(-6), newAlert]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <style>{`
            @keyframes spin-radar {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <radialGradient id="fraudRadarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </radialGradient>
          <filter id="fraudRadarGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
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
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#fraudRadarGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#ef4444"
            strokeWidth="0.8"
            filter="url(#fraudRadarGlow)"
          />
        </g>

        <line x1="5" y1="50" x2="95" y2="50" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />

        {fraudAlerts.map((alert) => (
          <g key={alert.id}>
            <circle
              cx={alert.x}
              cy={alert.y}
              r="1.5"
              fill={severityColors[alert.severity as keyof typeof severityColors]}
              opacity="0.8"
            >
              <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={alert.x}
              cy={alert.y}
              r="4"
              fill="none"
              stroke={severityColors[alert.severity as keyof typeof severityColors]}
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

// 2. TransactionFlow - Flowing transaction data streams
const TransactionFlow: React.FC = () => {
  const streams = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 3,
        chars: Array.from({ length: 12 }, () => (Math.random() > 0.5 ? '1' : '0')).join(''),
        amount: `$${(Math.random() * 10000).toFixed(2)}`,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute text-green-400 font-mono text-[10px] whitespace-nowrap flex items-center gap-2"
          style={{
            left: `${stream.x}%`,
            animation: `transactionFlow ${stream.duration}s linear ${stream.delay}s infinite`,
          }}
        >
          <DollarSign className="w-3 h-3" />
          <span>{stream.amount}</span>
          <span className="text-blue-400">{stream.chars}</span>
        </div>
      ))}
      <style>{`
        @keyframes transactionFlow {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 3. RiskHeatmap - Geographic fraud risk visualization
const RiskHeatmap: React.FC = () => {
  const [hotspots, setHotspots] = useState<
    { id: number; x: number; y: number; intensity: number; region: string }[]
  >([]);

  useEffect(() => {
    setHotspots([
      { id: 1, x: 30, y: 25, intensity: 0.9, region: 'North America' },
      { id: 2, x: 60, y: 20, intensity: 0.7, region: 'Europe' },
      { id: 3, x: 80, y: 40, intensity: 0.8, region: 'Asia Pacific' },
      { id: 4, x: 20, y: 60, intensity: 0.6, region: 'South America' },
      { id: 5, x: 70, y: 65, intensity: 0.5, region: 'Africa' },
    ]);

    const interval = setInterval(() => {
      setHotspots((prev) =>
        prev.map((h) => ({
          ...h,
          intensity: Math.max(0.3, Math.min(1, h.intensity + (Math.random() - 0.5) * 0.2)),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="riskHeatmapGradient">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        {hotspots.map((spot) => (
          <g key={spot.id}>
            <circle cx={spot.x} cy={spot.y} r={spot.intensity * 8} fill="url(#riskHeatmapGradient)">
              <animate
                attributeName="r"
                values={`${spot.intensity * 8};${spot.intensity * 12};${spot.intensity * 8}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={spot.x}
              y={spot.y - spot.intensity * 10}
              textAnchor="middle"
              className="text-xs font-mono fill-red-400"
              opacity={spot.intensity}
            >
              {spot.region}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 4. FraudAlertWaveform - Real-time fraud alert visualization
const FraudAlertWaveform: React.FC = () => {
  const [points, setPoints] = useState<number[]>(Array(40).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => {
        const newPoints = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1];
        const spike = Math.random() > 0.8 ? (Math.random() > 0.5 ? 20 : -20) : 0;
        const newValue = Math.max(30, Math.min(70, lastValue + (Math.random() - 0.5) * 8 + spike));
        newPoints.push(newValue);
        return newPoints;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 2.5} ${p}`).join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="fraudWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d={pathData + ' L 100 100 L 0 100 Z'} fill="url(#fraudWaveGradient)" />
        <path d={pathData} fill="none" stroke="#ef4444" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

// 5. SecurityHexGrid - Hexagonal security grid
const SecurityHexGrid: React.FC = () => {
  const hexagons = useMemo(() => {
    const hexes = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 10; col++) {
        hexes.push({
          id: `${row}-${col}`,
          x: col * 10 + (row % 2) * 5,
          y: row * 8.5,
          active: Math.random() > 0.75,
          threat: Math.random() > 0.9,
        });
      }
    }
    return hexes;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice">
        {hexagons.map((hex) => (
          <polygon
            key={hex.id}
            points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5"
            fill={hex.threat ? '#ef4444' : hex.active ? '#22c55e' : '#374151'}
            opacity={hex.active ? 0.6 : 0.3}
            transform={`translate(${hex.x}, ${hex.y})`}
          >
            {hex.active && (
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </polygon>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// SECURITY SCANNER VISUAL - Animated tool showcase
// ============================================================================

const SecurityScannerVisual: React.FC = () => {
  const [activeScanner, setActiveScanner] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<{ safe: number; threats: number }>({
    safe: 0,
    threats: 0,
  });

  const scanners = [
    {
      id: 'url',
      name: 'URL Scanner',
      icon: Globe,
      description: 'Check URLs for malware & phishing',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-400',
      example: 'https://example.com/login',
    },
    {
      id: 'email',
      name: 'Email Breach',
      icon: Mail,
      description: 'Check email breach exposure',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      example: 'user@company.com',
    },
    {
      id: 'phone',
      name: 'Phone Validator',
      icon: Phone,
      description: 'Validate & check phone numbers',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      example: '+1 (555) 123-4567',
    },
    {
      id: 'ip',
      name: 'IP Checker',
      icon: Wifi,
      description: 'Check IP reputation & threats',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      example: '192.168.1.1',
    },
    {
      id: 'password',
      name: 'Password Check',
      icon: Key,
      description: 'Check if password is compromised',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      example: '••••••••••••',
    },
  ];

  // Auto-cycle through scanners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScanner((prev) => (prev + 1) % scanners.length);
      setScanProgress(0);
      setScanResults({ safe: 0, threats: 0 });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate scanning progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setScanResults({
            safe: Math.floor(Math.random() * 50) + 950,
            threats: Math.floor(Math.random() * 5),
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, [activeScanner]);

  const currentScanner = scanners[activeScanner];
  const CurrentIcon = currentScanner.icon;

  return (
    <div className="relative group rounded-[3rem] overflow-hidden border border-red-500/20 shadow-2xl bg-gradient-to-br from-[#0a0a0a] to-[#1a0a0a] backdrop-blur-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-400">
            Free Security Tools
          </span>
        </div>
        <div className="text-[10px] font-mono text-white/40">LIVE</div>
      </div>

      {/* Scanner Title */}
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6">Security Scanner Suite</h3>

      {/* Scanner Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {scanners.map((scanner, index) => {
          const Icon = scanner.icon;
          return (
            <button
              key={scanner.id}
              onClick={() => {
                setActiveScanner(index);
                setScanProgress(0);
                setScanResults({ safe: 0, threats: 0 });
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeScanner === index
                  ? `bg-gradient-to-r ${scanner.color} text-white shadow-lg`
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{scanner.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Scanner Display */}
      <div
        className={`relative p-6 rounded-2xl ${currentScanner.bgColor} border ${currentScanner.borderColor} mb-6`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentScanner.color} flex items-center justify-center`}
          >
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg">{currentScanner.name}</div>
            <div className="text-white/60 text-sm">{currentScanner.description}</div>
          </div>
        </div>

        {/* Scan Input Simulation */}
        <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3 mb-4">
          <Link className="w-4 h-4 text-white/40" />
          <span className="font-mono text-sm text-white/60 flex-1 truncate">
            {currentScanner.example}
          </span>
          <button
            className={`px-4 py-1.5 rounded-lg bg-gradient-to-r ${currentScanner.color} text-white text-xs font-bold flex items-center gap-2`}
          >
            <Scan className="w-3 h-3" />
            Scan
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className={currentScanner.textColor}>Scanning...</span>
            <span className="text-white/60">{scanProgress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${currentScanner.color} transition-all duration-200`}
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Results */}
        {scanProgress === 100 && (
          <div className="flex items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">{scanResults.safe} Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-mono text-sm">{scanResults.threats} Threats</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-white/40">Powered by VirusTotal, Google Safe Browsing</span>
        <span className="text-green-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Online
        </span>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-2xl" />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FraudGuardDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'prevention' | 'analytics'>(
    'overview'
  );
  const [liveMetrics, setLiveMetrics] = useState({
    transactionsScanned: 2847392,
    fraudPrevented: 15684,
    accuracy: 99.7,
    responseTime: 0.3,
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
        transactionsScanned: prev.transactionsScanned + Math.floor(Math.random() * 1000),
        fraudPrevented: prev.fraudPrevented + Math.floor((Math.random() - 0.95) * 10),
        accuracy: Math.max(99, +(prev.accuracy + (Math.random() - 0.5) * 0.1).toFixed(1)),
        responseTime: Math.max(0.1, +(prev.responseTime + (Math.random() - 0.5) * 0.05).toFixed(1)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0404] text-white selection:bg-red-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-red-600/8 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[900px] h-[900px] bg-orange-600/6 blur-[220px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <FloatingIcons icons={[Shield, AlertTriangle, Lock, Eye]} color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <FloatingIcons icons={[Shield, AlertTriangle, Lock, Eye]} color="#a855f7" />
        <FraudDetectionRadar />
        <TransactionFlow />
        <SecurityHexGrid />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-12">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <div className="flex items-center gap-4">
            <a
              href="https://maula.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-black tracking-[0.3em] uppercase text-red-400 hover:bg-red-500/30 transition-all"
            >
              ← Back to Maula.AI
            </a>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
              FraudGuard v4.2
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
              <Shield className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
                Advanced Fraud Detection
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              FRAUD <span className="text-red-500">GUARD</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              <strong className="text-white">What is FraudGuard?</strong> Your free,
              professional-grade security scanner suite. Check URLs for malware & phishing, verify
              email breach exposure, validate phone numbers, check IP reputation, and test password
              security.
            </p>
            <p className="text-lg text-white/40 leading-relaxed max-w-xl">
              <strong className="text-red-400">How to use:</strong> Click "Launch FraudGuard" to
              access all 5 scanners with AI Assistant. Enter a URL, email, phone number, IP address,
              or password to instantly check for threats and vulnerabilities.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://fraudguard.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/30 flex items-center gap-3"
              >
                <Zap className="w-4 h-4 fill-current" /> Launch FraudGuard
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase">
                <span className="text-green-400">●</span> 99.7% Accuracy
              </div>
            </div>
          </div>

          {/* Security Scanner Suite Visualization */}
          <SecurityScannerVisual />
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-red-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500 tabular-nums">
                {liveMetrics.transactionsScanned.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Transactions Scanned
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
                {liveMetrics.fraudPrevented.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Fraud Prevented
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full animate-pulse"
                  style={{ width: '96%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.accuracy}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Detection Accuracy
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="correlation-bar bg-blue-500 h-1 rounded-full"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500">{liveMetrics.responseTime}s</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Response Time
              </div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid - 5 Security Scanners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-6 glass p-8 rounded-[2rem] border border-cyan-500/20 hover:border-cyan-500/40 transition-all group hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">URL Scanner</h3>
              <p className="text-white/50 leading-relaxed">
                Analyze any website URL for malware, phishing attempts, and security threats using
                VirusTotal, Google Safe Browsing, and URLScan.io.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                Multi-engine scanning
              </div>
            </div>

            <div className="space-y-6 glass p-8 rounded-[2rem] border border-purple-500/20 hover:border-purple-500/40 transition-all group hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Email Breach</h3>
              <p className="text-white/50 leading-relaxed">
                Check if your email has been exposed in data breaches. Find out which breaches
                affected your accounts and when.
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Database className="w-4 h-4 animate-pulse" />
                10B+ breach records
              </div>
            </div>

            <div className="space-y-6 glass p-8 rounded-[2rem] border border-green-500/20 hover:border-green-500/40 transition-all group hover:shadow-2xl hover:shadow-green-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Phone Validator</h3>
              <p className="text-white/50 leading-relaxed">
                Validate phone numbers, check carrier information, and verify if numbers are
                legitimate or potentially fraudulent.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                Global coverage
              </div>
            </div>

            <div className="space-y-6 glass p-8 rounded-[2rem] border border-orange-500/20 hover:border-orange-500/40 transition-all group hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wifi className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">IP Checker</h3>
              <p className="text-white/50 leading-relaxed">
                Check IP address reputation, geolocation, and threat level. Identify VPNs, proxies,
                and malicious actors.
              </p>
              <div className="flex items-center gap-2 text-orange-400 text-sm font-mono">
                <Target className="w-4 h-4 animate-pulse" />
                Real-time threat intel
              </div>
            </div>

            <div className="space-y-6 glass p-8 rounded-[2rem] border border-red-500/20 hover:border-red-500/40 transition-all group hover:shadow-2xl hover:shadow-red-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Password Check</h3>
              <p className="text-white/50 leading-relaxed">
                Check if your password has been compromised in data breaches. Uses secure
                k-anonymity to protect your password.
              </p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <Lock className="w-4 h-4 animate-pulse" />
                Secure checking
              </div>
            </div>

            <div className="space-y-6 glass p-8 rounded-[2rem] border border-blue-500/20 hover:border-blue-500/40 transition-all group hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">AI Assistant</h3>
              <p className="text-white/50 leading-relaxed">
                Get instant help from our AI security expert. Ask questions about threats, get
                recommendations, and understand your scan results.
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                24/7 available
              </div>
            </div>
          </div>

          {/* Security Tools Overview */}
          <div className="glass p-8 sm:p-12 md:p-16 rounded-[3rem] border border-red-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                Security Scanner Suite
              </h2>
              <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto">
                Professional-grade security tools powered by industry-leading threat intelligence
                APIs. Free to use, no registration required.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {/* Scanner capabilities */}
                {[
                  {
                    scanner: 'URL Scanner',
                    description: 'VirusTotal + Google Safe Browsing',
                    icon: Globe,
                    color: 'text-cyan-400',
                    bgColor: 'bg-cyan-500/10',
                  },
                  {
                    scanner: 'Email Breach Check',
                    description: 'HaveIBeenPwned Database',
                    icon: Mail,
                    color: 'text-purple-400',
                    bgColor: 'bg-purple-500/10',
                  },
                  {
                    scanner: 'Phone Validator',
                    description: 'Global carrier validation',
                    icon: Phone,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/10',
                  },
                  {
                    scanner: 'IP Reputation',
                    description: 'AbuseIPDB + Threat intel',
                    icon: Wifi,
                    color: 'text-orange-400',
                    bgColor: 'bg-orange-500/10',
                  },
                  {
                    scanner: 'Password Security',
                    description: 'k-anonymity protected check',
                    icon: Key,
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/10',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 ${item.bgColor} rounded-2xl border border-white/5`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-white">{item.scanner}</div>
                      <div className={`${item.color} font-mono text-sm`}>{item.description}</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                ))}
              </div>

              {/* API integrations visualization */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-white/10 p-8">
                <h3 className="text-xl font-bold mb-6">Powered By</h3>
                <div className="space-y-4">
                  {[
                    { api: 'VirusTotal', coverage: '90+ engines', status: 'active' },
                    { api: 'Google Safe Browsing', coverage: 'Global coverage', status: 'active' },
                    { api: 'URLScan.io', coverage: 'Deep scanning', status: 'active' },
                    { api: 'HaveIBeenPwned', coverage: '10B+ records', status: 'active' },
                    { api: 'AbuseIPDB', coverage: 'IP reputation', status: 'active' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-white">{item.api}</div>
                        <div className="text-white/40 text-xs">{item.coverage}</div>
                      </div>
                      <span className="text-green-400 text-xs font-mono uppercase">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono">
                  <span className="text-white/40">All APIs operational</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    99.9% uptime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-20 border-t border-red-500/10">
          <button
            onClick={() => setView('home')}
            className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://fraudguard.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/30 flex items-center gap-4 text-center"
          >
            Launch FraudGuard <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FraudGuardDetail;

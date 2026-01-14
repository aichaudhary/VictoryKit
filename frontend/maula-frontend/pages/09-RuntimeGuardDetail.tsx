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
  Play,
  ShieldCheck,
  FileText,
  Brain,
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
// EPIC ANIMATED VISUAL COMPONENTS - RUNTIME APPLICATION SECURITY
// ============================================================================

// 1. RuntimeProtectionMatrix - Real-time protection visualization
const RuntimeProtectionMatrix: React.FC = () => {
  const [attacks, setAttacks] = useState<
    { id: number; type: string; blocked: boolean; severity: string; responseTime: number }[]
  >([]);

  useEffect(() => {
    const attackTypes = [
      'SQL Injection',
      'XSS',
      'RCE',
      'CSRF',
      'Path Traversal',
      'Command Injection',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newAttack = {
          id: Date.now(),
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          blocked: Math.random() > 0.8,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          responseTime: Math.random() * 5 + 0.1,
        };
        setAttacks((prev) => [...prev.slice(-6), newAttack]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="runtimeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0891b2" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.2" />
          </radialGradient>
          <filter id="runtimeGlow">
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
          r="40"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#0891b2"
          strokeWidth="0.2"
          opacity="0.5"
        />
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="#0e7490"
          strokeWidth="0.2"
          opacity="0.6"
        />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 4s linear infinite' }}>
          <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="url(#runtimeGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#06b6d4"
            strokeWidth="0.8"
            filter="url(#runtimeGlow)"
          />
        </g>

        {attacks.map((attack, i) => (
          <g key={attack.id}>
            <circle
              cx={20 + Math.random() * 60}
              cy={20 + Math.random() * 60}
              r="2"
              fill={attack.blocked ? '#22c55e' : '#ef4444'}
              opacity="0.9"
            >
              <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {attack.blocked && (
              <circle
                cx={20 + Math.random() * 60}
                cy={20 + Math.random() * 60}
                r="5"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                opacity="0.6"
              >
                <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. AttackDetectionEngine - Attack pattern detection
const AttackDetectionEngine: React.FC = () => {
  const [detections, setDetections] = useState<
    { id: number; pattern: string; confidence: number; blocked: boolean; timestamp: number }[]
  >([]);

  useEffect(() => {
    const patterns = [
      'Injection Attack',
      'XSS Attempt',
      'Path Traversal',
      'Command Execution',
      'Data Exfiltration',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newDetection = {
          id: Date.now(),
          pattern: patterns[Math.floor(Math.random() * patterns.length)],
          confidence: 70 + Math.random() * 30,
          blocked: Math.random() > 0.9,
          timestamp: Date.now(),
        };
        setDetections((prev) => [...prev.slice(-5), newDetection]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {detections.map((detection, i) => (
        <div
          key={detection.id}
          className={`absolute bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-[7px] font-mono ${
            detection.blocked ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `detectionAlert ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-2 h-2 text-cyan-400" />
            <span className="text-cyan-400 font-bold">{detection.pattern}</span>
          </div>
          <div className="text-white/70">Confidence: {detection.confidence.toFixed(0)}%</div>
          <div
            className={`text-xs font-bold ${detection.blocked ? 'text-green-400 animate-pulse' : 'text-orange-400'}`}
          >
            {detection.blocked ? 'BLOCKED' : 'DETECTED'}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes detectionAlert {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. BehaviorAnomalyDetector - Behavioral analysis
const BehaviorAnomalyDetector: React.FC = () => {
  const [anomalies, setAnomalies] = useState<
    { id: number; behavior: string; deviation: number; risk: string; monitoring: boolean }[]
  >([]);

  useEffect(() => {
    const behaviors = [
      'Memory Usage',
      'CPU Load',
      'Network Traffic',
      'Database Queries',
      'API Calls',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAnomaly = {
          id: Date.now(),
          behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
          deviation: Math.random() * 200 + 50,
          risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          monitoring: true,
        };
        setAnomalies((prev) => [...prev.slice(-4), newAnomaly]);

        // Simulate monitoring completion
        setTimeout(
          () => {
            setAnomalies((prev) =>
              prev.map((a) => (a.id === newAnomaly.id ? { ...a, monitoring: false } : a))
            );
          },
          2000 + Math.random() * 3000
        );
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {anomalies.map((anomaly, i) => (
        <div
          key={anomaly.id}
          className="absolute bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `anomalyDetect ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-blue-400 font-bold">{anomaly.behavior}</div>
          <div className="text-white/70">Deviation: {anomaly.deviation.toFixed(0)}%</div>
          {anomaly.monitoring ? (
            <div className="text-cyan-400 animate-pulse">MONITORING...</div>
          ) : (
            <div
              className={`text-xs font-bold ${
                anomaly.risk === 'high'
                  ? 'text-red-400'
                  : anomaly.risk === 'medium'
                    ? 'text-orange-400'
                    : 'text-yellow-400'
              }`}
            >
              {anomaly.risk.toUpperCase()} RISK
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes anomalyDetect {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. ZeroDayDefenseSystem - Zero-day protection
const ZeroDayDefenseSystem: React.FC = () => {
  const [defenses, setDefenses] = useState<
    { id: number; exploit: string; signature: string; blocked: boolean; learning: boolean }[]
  >([]);

  useEffect(() => {
    const exploits = [
      'Unknown RCE',
      'Novel Injection',
      'Zero-Day XSS',
      'Unseen Malware',
      'Advanced Persistence',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const newDefense = {
          id: Date.now(),
          exploit: exploits[Math.floor(Math.random() * exploits.length)],
          signature: `SIG-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`,
          blocked: Math.random() > 0.7,
          learning: true,
        };
        setDefenses((prev) => [...prev.slice(-3), newDefense]);

        // Simulate learning completion
        setTimeout(
          () => {
            setDefenses((prev) =>
              prev.map((d) => (d.id === newDefense.id ? { ...d, learning: false } : d))
            );
          },
          3000 + Math.random() * 4000
        );
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {defenses.map((defense, i) => (
        <div
          key={defense.id}
          className="absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[6px] font-mono max-w-36"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `zeroDayDefense ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Shield className="w-2 h-2 text-purple-400" />
            <span className="text-purple-400 font-bold">{defense.exploit}</span>
          </div>
          <div className="text-white/70">{defense.signature}</div>
          {defense.learning ? (
            <div className="text-cyan-400 animate-pulse">LEARNING...</div>
          ) : (
            <div
              className={`text-xs font-bold ${defense.blocked ? 'text-green-400' : 'text-red-400 animate-pulse'}`}
            >
              {defense.blocked ? 'BLOCKED' : 'THREAT DETECTED'}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes zeroDayDefense {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. ResponseTimeMonitor - Performance monitoring
const ResponseTimeMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<boolean[][]>(
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => prev.map((row) => row.map(() => Math.random() > 0.8)));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-8">
      <div className="grid grid-cols-5 gap-2 w-full h-full p-8">
        {metrics.flat().map((alert, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-150 ${
              alert ? 'bg-cyan-500/60 animate-pulse' : 'bg-cyan-500/10'
            }`}
          >
            {alert && <div className="w-full h-full bg-cyan-400/40 animate-ping rounded-sm"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RuntimeGuardDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>(
    'overview'
  );
  const [liveMetrics, setLiveMetrics] = useState({
    attacksBlocked: 124739,
    responseTime: 0.3,
    frameworksProtected: 24,
    uptime: 99.97,
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
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 50),
        responseTime: Math.max(0.1, prev.responseTime + (Math.random() - 0.5) * 0.1),
        frameworksProtected: prev.frameworksProtected,
        uptime: Math.max(99.9, prev.uptime + (Math.random() - 0.99) * 0.01),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#040a0f] text-white selection:bg-cyan-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-cyan-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-blue-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RuntimeProtectionMatrix />
        <AttackDetectionEngine />
        <BehaviorAnomalyDetector />
        <ZeroDayDefenseSystem />
        <ResponseTimeMonitor />
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
            RuntimeGuard Enterprise v3.1
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-cyan-500/20 backdrop-blur-3xl">
              <Play className="w-4 h-4 text-cyan-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-500">
                Runtime Application Security
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              RUNTIME <span className="text-cyan-500">GUARD</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Runtime application protection. Real-time application security monitoring and
              protection that detects and blocks attacks during execution.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://runtimeguard.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-cyan-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-cyan-500/20 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Protection: Active
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Response: &lt;{liveMetrics.responseTime.toFixed(1)}ms
              </div>
            </div>
          </div>

          {/* Runtime Protection Matrix Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-cyan-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central runtime protection engine */}
              <div className="relative w-80 h-80">
                {/* Central protection engine */}
                <div className="absolute inset-0 border-4 border-cyan-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-cyan-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-cyan-300/30 rounded-full flex items-center justify-center">
                      {/* Core runtime engine */}
                      <div className="w-32 h-32 bg-cyan-500/20 rounded-full flex items-center justify-center relative">
                        <Shield className="w-16 h-16 text-cyan-400" />

                        {/* Protection modules orbiting */}
                        {[
                          { icon: Target, label: 'Attack Detection' },
                          { icon: Activity, label: 'Behavior Monitor' },
                          { icon: ShieldOff, label: 'Zero-Day Defense' },
                          { icon: Zap, label: 'Instant Response' },
                          { icon: Eye, label: 'Real-time Analysis' },
                          { icon: Binary, label: 'Pattern Learning' },
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-cyan-400/15 rounded-full flex items-center justify-center border border-cyan-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`,
                            }}
                          >
                            <module.icon className="w-5 h-5 text-cyan-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protection rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-cyan-500/20 rounded-full animate-pulse"
                    style={{
                      top: `${50 - (i + 1) * 12}%`,
                      left: `${50 - (i + 1) * 12}%`,
                      width: `${(i + 1) * 24}%`,
                      height: `${(i + 1) * 24}%`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400">PROTECTION: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● RUNTIME GUARD</span>
              </div>
              <div className="mt-2 w-full bg-cyan-500/10 rounded-full h-1">
                <div
                  className="bg-cyan-500 h-1 rounded-full animate-pulse"
                  style={{ width: '95%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-cyan-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-cyan-500 tabular-nums">
                {liveMetrics.attacksBlocked.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Attacks Blocked
              </div>
              <div className="w-full bg-cyan-500/10 rounded-full h-1">
                <div
                  className="bg-cyan-500 h-1 rounded-full animate-pulse"
                  style={{ width: '97%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.responseTime.toFixed(1)}ms
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Response Time
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full animate-pulse"
                  style={{ width: '99%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.frameworksProtected}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Frameworks Protected
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-cyan-500">
                {liveMetrics.uptime.toFixed(2)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Uptime
              </div>
              <div className="w-full bg-cyan-500/10 rounded-full h-1">
                <div
                  className="bg-cyan-500 h-1 rounded-full animate-pulse"
                  style={{ width: `${liveMetrics.uptime}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group hover:shadow-2xl hover:shadow-cyan-500/5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">RASP Protection</h3>
              <p className="text-white/50 leading-relaxed">
                Runtime Application Self-Protection that blocks attacks from within the application
                context.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                124K attacks blocked today
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group hover:shadow-2xl hover:shadow-cyan-500/5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Behavior Monitoring</h3>
              <p className="text-white/50 leading-relaxed">
                Continuous monitoring of application behavior to detect anomalies and exploitation
                attempts.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono">
                <Eye className="w-4 h-4 animate-pulse" />
                24/7 behavioral analysis
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group hover:shadow-2xl hover:shadow-cyan-500/5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Zero-Day Defense</h3>
              <p className="text-white/50 leading-relaxed">
                Block zero-day exploits in real-time without requiring signature updates or patches.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                99.8% zero-day coverage
              </div>
            </div>
          </div>

          {/* Runtime Protection Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-cyan-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Runtime Protection Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">
                Advanced Runtime Application Self-Protection (RASP) with behavioral analysis, attack
                pattern recognition, and instant response capabilities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Protection capabilities */}
                {[
                  {
                    capability: 'Attack Pattern Recognition',
                    coverage: 99.2,
                    icon: Target,
                    color: 'text-cyan-400',
                  },
                  {
                    capability: 'Behavioral Analysis',
                    coverage: 97.8,
                    icon: Activity,
                    color: 'text-blue-400',
                  },
                  {
                    capability: 'Zero-Day Detection',
                    coverage: 96.5,
                    icon: ShieldOff,
                    color: 'text-purple-400',
                  },
                  {
                    capability: 'Instant Response',
                    coverage: 99.9,
                    icon: Zap,
                    color: 'text-yellow-400',
                  },
                  {
                    capability: 'Performance Monitoring',
                    coverage: 98.7,
                    icon: Cpu,
                    color: 'text-green-400',
                  },
                  {
                    capability: 'Adaptive Learning',
                    coverage: 95.3,
                    icon: Brain,
                    color: 'text-red-400',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-cyan-400 font-mono text-sm">
                        {item.coverage}% coverage
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-cyan-500/20 rounded-full">
                      <div
                        className="h-2 bg-cyan-500 rounded-full"
                        style={{ width: `${item.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Protection dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-cyan-500/10 p-8">
                <div className="space-y-6">
                  {/* Protection metrics */}
                  {[
                    { metric: 'Attack Detection Rate', value: 99.7, status: 'excellent' },
                    { metric: 'False Positive Rate', value: 0.3, status: 'minimal' },
                    { metric: 'Response Latency', value: 0.3, status: 'instant' },
                    { metric: 'Coverage Uptime', value: 99.97, status: 'reliable' },
                    { metric: 'Learning Accuracy', value: 98.5, status: 'adaptive' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-cyan-400">{item.metric}</div>
                      <div className="flex-1 bg-cyan-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent'
                              ? 'bg-green-500'
                              : item.status === 'minimal'
                                ? 'bg-blue-500'
                                : item.status === 'instant'
                                  ? 'bg-cyan-500'
                                  : item.status === 'reliable'
                                    ? 'bg-purple-500'
                                    : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{ width: `${item.value > 10 ? item.value : item.value * 10}%` }}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">
                        {item.value}
                        {item.value < 10 ? 'ms' : '%'}
                      </div>
                      <div className="w-20 text-xs font-mono text-cyan-400 text-right capitalize">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-cyan-400">
                  <span>Runtime Protection Status</span>
                  <span>All Systems Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-cyan-500/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://runtimeguard.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-cyan-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-cyan-500/20 flex items-center gap-4"
          >
            Enable Protection <Shield className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RuntimeGuardDetail;

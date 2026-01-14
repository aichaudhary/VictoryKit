
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
  UserCheck,
  Key,
  Clock,
  Users,
  ShieldCheck,
  FileText,
  EyeOff,
  Fingerprint,
  Monitor,
  Timer,
  BarChart3,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - PRIVILEGED ACCESS MANAGEMENT
// ============================================================================

// 1. PrivilegeMatrix - User privilege monitoring and access control
const PrivilegeMatrix: React.FC = () => {
  const [privileges, setPrivileges] = useState<
    { id: number; user: string; role: string; access: string; risk: string; approved: boolean }[]
  >([]);

  useEffect(() => {
    const roles = ['Admin', 'Manager', 'Operator', 'Auditor', 'Developer'];
    const accessLevels = ['Full', 'Elevated', 'Standard', 'Read-Only'];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newPrivilege = {
          id: Date.now(),
          user: roles[Math.floor(Math.random() * roles.length)] + '-' + Math.floor(Math.random() * 1000),
          role: roles[Math.floor(Math.random() * roles.length)],
          access: accessLevels[Math.floor(Math.random() * accessLevels.length)],
          risk: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          approved: Math.random() > 0.8,
        };
        setPrivileges((prev) => [...prev.slice(-6), newPrivilege]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const riskColors: Record<string, string> = {
    Low: '#22c55e',
    Medium: '#eab308',
    High: '#f97316',
    Critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="privilegeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
          </radialGradient>
          <filter id="privilegeGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect x="15" y="15" width="70" height="70" fill="none" stroke="#a855f7" strokeWidth="0.3" opacity="0.4" />
        <rect x="25" y="25" width="50" height="50" fill="none" stroke="#8b5cf6" strokeWidth="0.2" opacity="0.5" />
        <rect x="35" y="35" width="30" height="30" fill="none" stroke="#7c3aed" strokeWidth="0.2" opacity="0.6" />

        <g style={{ transformOrigin: '50px 50px', animation: 'privilegeScan 5s linear infinite' }}>
          <line x1="50" y1="15" x2="50" y2="85" stroke="#a855f7" strokeWidth="0.5" opacity="0.8" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#a855f7" strokeWidth="0.5" opacity="0.8" />
        </g>

        {privileges.map((privilege, i) => (
          <g key={privilege.id}>
            <circle
              cx={20 + Math.random() * 60}
              cy={20 + Math.random() * 60}
              r="3"
              fill={privilege.approved ? '#22c55e' : '#a855f7'}
              opacity="0.9"
            >
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {privilege.approved && (
              <circle
                cx={20 + Math.random() * 60}
                cy={20 + Math.random() * 60}
                r="6"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                opacity="0.6"
              >
                <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes privilegeScan { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. SessionMonitor - Real-time session recording and monitoring
const SessionMonitor: React.FC = () => {
  const [sessions, setSessions] = useState<
    { id: number; user: string; system: string; duration: string; status: string; recorded: boolean }[]
  >([]);

  useEffect(() => {
    const systems = ['Database', 'Server', 'Network', 'Application', 'Cloud'];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newSession = {
          id: Date.now(),
          user: 'User-' + Math.floor(Math.random() * 1000),
          system: systems[Math.floor(Math.random() * systems.length)],
          duration: Math.floor(Math.random() * 120) + 'm',
          status: ['Active', 'Completed', 'Suspended'][Math.floor(Math.random() * 3)],
          recorded: Math.random() > 0.7,
        };
        setSessions((prev) => [...prev.slice(-5), newSession]);

        // Simulate session completion
        setTimeout(() => {
          setSessions((prev) =>
            prev.map((s) => (s.id === newSession.id ? { ...s, status: 'Completed' } : s))
          );
        }, 3000 + Math.random() * 5000);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {sessions.map((session, i) => (
        <div
          key={session.id}
          className={`absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[7px] font-mono ${
            session.status === 'Completed' ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `sessionMonitor ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Monitor className={`w-2 h-2 text-purple-400 ${session.status === 'Active' ? 'animate-pulse' : ''}`} />
            <span className="text-purple-400 font-bold">{session.user}</span>
          </div>
          <div className="text-white/70">{session.system} Session</div>
          <div className={`text-xs font-bold ${
            session.status === 'Completed' ? 'text-green-400' :
            session.status === 'Active' ? 'text-blue-400' : 'text-yellow-400'
          }`}>
            {session.status}
          </div>
          {session.recorded && (
            <div className="text-red-400 animate-pulse">RECORDED</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes sessionMonitor {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. JustInTimeEngine - Just-in-time access provisioning
const JustInTimeEngine: React.FC = () => {
  const [jitRequests, setJitRequests] = useState<
    { id: number; request: string; duration: string; approval: string; granted: boolean; timeLeft: number }[]
  >([]);

  useEffect(() => {
    const requests = ['Admin Access', 'Root Privileges', 'DB Admin', 'Network Config', 'Security Override'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newRequest = {
          id: Date.now(),
          request: requests[Math.floor(Math.random() * requests.length)],
          duration: Math.floor(Math.random() * 8) + 1 + 'h',
          approval: ['Auto-Approved', 'Manager Review', 'Pending'][Math.floor(Math.random() * 3)],
          granted: Math.random() > 0.6,
          timeLeft: Math.floor(Math.random() * 3600),
        };
        setJitRequests((prev) => [...prev.slice(-4), newRequest]);

        // Simulate time countdown
        const countdownInterval = setInterval(() => {
          setJitRequests((prev) =>
            prev.map((r) =>
              r.id === newRequest.id && r.timeLeft > 0
                ? { ...r, timeLeft: r.timeLeft - 1 }
                : r
            )
          );
        }, 1000);

        setTimeout(() => clearInterval(countdownInterval), 3600000);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {jitRequests.map((jit, i) => (
        <div
          key={jit.id}
          className="absolute bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `jitEngine ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-cyan-400 font-bold">{jit.request}</div>
          <div className="text-white/70">{jit.duration}</div>
          {jit.granted ? (
            <div className="text-green-400 animate-pulse">GRANTED</div>
          ) : (
            <div className="text-yellow-400 animate-pulse">PENDING</div>
          )}
          <div className="text-xs text-purple-400">
            {Math.floor(jit.timeLeft / 60)}:{(jit.timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes jitEngine {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. AccessAnalytics - Privilege usage analytics and reporting
const AccessAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<
    { id: number; metric: string; value: number; trend: string; alert: boolean }[]
  >([]);

  useEffect(() => {
    const metrics = ['Privileged Sessions', 'Access Requests', 'Policy Violations', 'Audit Events'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newMetric = {
          id: Date.now(),
          metric: metrics[Math.floor(Math.random() * metrics.length)],
          value: Math.floor(Math.random() * 1000) + 100,
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
          alert: Math.random() > 0.85,
        };
        setAnalytics((prev) => [...prev.slice(-3), newMetric]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {analytics.map((metric, i) => (
        <div
          key={metric.id}
          className="absolute bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-[6px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `accessAnalytics ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <BarChart3 className="w-2 h-2 text-indigo-400" />
            <span className="text-indigo-400 font-bold">{metric.metric}</span>
          </div>
          <div className="text-white/70">{metric.value}</div>
          {metric.alert ? (
            <div className="text-red-400 animate-pulse">ALERT</div>
          ) : (
            <div className={`text-xs font-bold ${
              metric.trend === 'up' ? 'text-green-400' :
              metric.trend === 'down' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {metric.trend.toUpperCase()}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes accessAnalytics {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. SecurityEnforcement - Automated security policy enforcement
const SecurityEnforcement: React.FC = () => {
  const [policies, setPolicies] = useState<boolean[][]>(
    Array(6).fill(null).map(() => Array(6).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPolicies((prev) =>
        prev.map((row) =>
          row.map(() => Math.random() > 0.85)
        )
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-8">
      <div className="grid grid-cols-6 gap-1 w-full h-full p-8">
        {policies.flat().map((policy, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-200 ${
              policy ? 'bg-purple-500/60 animate-pulse' : 'bg-purple-500/10'
            }`}
          >
            {policy && (
              <div className="w-full h-full bg-purple-400/40 animate-ping rounded-sm"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PrivilegeGuardDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    accountsManaged: 52749,
    sessionsMonitored: 18432,
    jitRequests: 8921,
    complianceScore: 98.3,
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
        accountsManaged: prev.accountsManaged + Math.floor(Math.random() * 20),
        sessionsMonitored: prev.sessionsMonitored + Math.floor(Math.random() * 30),
        jitRequests: prev.jitRequests + Math.floor(Math.random() * 10),
        complianceScore: Math.max(95.0, prev.complianceScore + (Math.random() - 0.99) * 0.1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#040412] text-white selection:bg-purple-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-purple-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-indigo-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <PrivilegeMatrix />
        <SessionMonitor />
        <JustInTimeEngine />
        <AccessAnalytics />
        <SecurityEnforcement />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">PrivilegeGuard Enterprise v4.1</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
              <UserCheck className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">Privileged Access Management</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              PRIVILEGE <span className="text-purple-500">GUARD</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Privileged access management. Secure, monitor, and control privileged accounts with just-in-time access and session recording.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://privilegeguard.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Secure Access
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Accounts: {liveMetrics.accountsManaged.toLocaleString()}+
              </div>
            </div>
          </div>

          {/* Privilege Guard Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-purple-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central privilege guard core */}
              <div className="relative w-80 h-80">
                {/* Privilege security rings */}
                <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-purple-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-purple-300/30 rounded-full flex items-center justify-center">
                      {/* Core privilege guard */}
                      <div className="w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center relative">
                        <ShieldCheck className="w-16 h-16 text-purple-400" />

                        {/* Security modules orbiting */}
                        {[
                          { icon: UserCheck, label: 'Access Control' },
                          { icon: Monitor, label: 'Session Monitor' },
                          { icon: Timer, label: 'Just-in-Time' },
                          { icon: BarChart3, label: 'Analytics' },
                          { icon: Shield, label: 'Enforcement' },
                          { icon: Key, label: 'Privileges' }
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-purple-400/15 rounded-full flex items-center justify-center border border-purple-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60) * Math.PI / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60) * Math.PI / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`
                            }}
                          >
                            <module.icon className="w-5 h-5 text-purple-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access control rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-purple-500/20 rounded-full animate-pulse"
                    style={{
                      top: `${50 - (i + 1) * 12}%`,
                      left: `${50 - (i + 1) * 12}%`,
                      width: `${(i + 1) * 24}%`,
                      height: `${(i + 1) * 24}%`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400">PRIVILEGE: SECURE</span>
                <span className="text-green-400 animate-pulse">● GUARD ACTIVE</span>
              </div>
              <div className="mt-2 w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-purple-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500 tabular-nums">{liveMetrics.accountsManaged.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Accounts Managed</div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.sessionsMonitored.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Sessions Monitored</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{width: '94%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.jitRequests.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">JIT Requests</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{width: '89%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500">{liveMetrics.complianceScore.toFixed(1)}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Compliance Score</div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: `${liveMetrics.complianceScore}%`}}></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Timer className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Just-in-Time Access</h3>
              <p className="text-white/50 leading-relaxed">Grant temporary elevated privileges only when needed, automatically revoked after time expires.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                8.9K requests/month
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Session Recording</h3>
              <p className="text-white/50 leading-relaxed">Complete session recording and playback for all privileged access with searchable audit trails.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                100% coverage
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Access Analytics</h3>
              <p className="text-white/50 leading-relaxed">Advanced analytics and reporting on privileged access patterns, anomalies, and compliance status.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <FileText className="w-4 h-4 animate-pulse" />
                Real-time insights
              </div>
            </div>
          </div>

          {/* Privilege Guard Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-purple-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Privilege Guard Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Enterprise-grade privileged access management with just-in-time provisioning, comprehensive session monitoring, and advanced analytics for complete access security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* PAM capabilities */}
                {[
                  { capability: 'Privileged Accounts', coverage: 99.8, icon: Users, color: 'text-purple-400' },
                  { capability: 'Session Recording', coverage: 100.0, icon: Monitor, color: 'text-cyan-400' },
                  { capability: 'Just-in-Time Access', coverage: 99.7, icon: Timer, color: 'text-green-400' },
                  { capability: 'Access Analytics', coverage: 98.9, icon: BarChart3, color: 'text-yellow-400' },
                  { capability: 'Policy Enforcement', coverage: 99.5, icon: Shield, color: 'text-blue-400' },
                  { capability: 'Compliance Automation', coverage: 99.2, icon: FileText, color: 'text-red-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-purple-400 font-mono text-sm">{item.coverage}% coverage</div>
                    </div>
                    <div className="w-16 h-2 bg-purple-500/20 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{width: `${item.coverage}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAM security dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-purple-500/10 p-8">
                <div className="space-y-6">
                  {/* Security metrics */}
                  {[
                    { metric: 'Account Coverage', value: 99.8, status: 'comprehensive' },
                    { metric: 'Session Recording', value: 100.0, status: 'complete' },
                    { metric: 'JIT Success Rate', value: 99.7, status: 'excellent' },
                    { metric: 'Policy Compliance', value: 99.5, status: 'optimal' },
                    { metric: 'Audit Completeness', value: 99.9, status: 'exceptional' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-purple-400">{item.metric}</div>
                      <div className="flex-1 bg-purple-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'comprehensive' ? 'bg-green-500' :
                            item.status === 'complete' ? 'bg-blue-500' :
                            item.status === 'excellent' ? 'bg-cyan-500' :
                            item.status === 'optimal' ? 'bg-purple-500' : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{width: `${item.value > 10 ? item.value : item.value * 10}%`}}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">{item.value}{item.value < 10 ? '%' : '%'}</div>
                      <div className="w-20 text-xs font-mono text-purple-400 text-right capitalize">{item.status}</div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-purple-400">
                  <span>Privilege Security Status</span>
                  <span>All Access Controlled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-purple-500/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://privilegeguard.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
            Control Access <UserCheck className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivilegeGuardDetail;

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
  Fingerprint,
  Users,
  Key,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - IDENTITY GOVERNANCE
// ============================================================================

// 1. IdentityRadar - User and access monitoring
const IdentityRadar: React.FC = () => {
  const [identities, setIdentities] = useState<
    { id: number; user: string; access: string; risk: string; certified: boolean }[]
  >([]);

  useEffect(() => {
    const userTypes = ['Admin', 'Manager', 'Developer', 'Analyst', 'Contractor'];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newIdentity = {
          id: Date.now(),
          user: userTypes[Math.floor(Math.random() * userTypes.length)] + '-' + Math.floor(Math.random() * 1000),
          access: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          risk: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          certified: Math.random() > 0.8,
        };
        setIdentities((prev) => [...prev.slice(-6), newIdentity]);
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
          <radialGradient id="identityGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
          </radialGradient>
          <filter id="identityGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="0.3" opacity="0.4" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#8b5cf6" strokeWidth="0.2" opacity="0.5" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="#7c3aed" strokeWidth="0.2" opacity="0.6" />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 6s linear infinite' }}>
          <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="url(#identityGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#a855f7"
            strokeWidth="0.8"
            filter="url(#identityGlow)"
          />
        </g>

        {identities.map((identity, i) => (
          <g key={identity.id}>
            <circle
              cx={20 + Math.random() * 60}
              cy={20 + Math.random() * 60}
              r="2"
              fill={identity.certified ? '#22c55e' : '#a855f7'}
              opacity="0.9"
            >
              <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {identity.certified && (
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
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
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

// 2. AccessCertificationEngine - Access review and certification
const AccessCertificationEngine: React.FC = () => {
  const [certifications, setCertifications] = useState<
    { id: number; reviewer: string; access: string; decision: string; completed: boolean }[]
  >([]);

  useEffect(() => {
    const reviewers = ['Manager', 'Supervisor', 'Security Team', 'Compliance Officer'];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newCertification = {
          id: Date.now(),
          reviewer: reviewers[Math.floor(Math.random() * reviewers.length)],
          access: ['Admin', 'Read-Only', 'Write', 'Execute'][Math.floor(Math.random() * 4)],
          decision: ['Approved', 'Revoked', 'Pending'][Math.floor(Math.random() * 3)],
          completed: Math.random() > 0.9,
        };
        setCertifications((prev) => [...prev.slice(-5), newCertification]);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {certifications.map((cert, i) => (
        <div
          key={cert.id}
          className={`absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[7px] font-mono ${
            cert.completed ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `certAlert ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <UserCheck className="w-2 h-2 text-purple-400" />
            <span className="text-purple-400 font-bold">{cert.reviewer}</span>
          </div>
          <div className="text-white/70">{cert.access} Access</div>
          <div className={`text-xs font-bold ${
            cert.decision === 'Approved' ? 'text-green-400' :
            cert.decision === 'Revoked' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {cert.decision}
          </div>
          {cert.completed && (
            <div className="text-green-400 animate-pulse">COMPLETED</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes certAlert {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. RoleMiningMatrix - Role discovery and optimization
const RoleMiningMatrix: React.FC = () => {
  const [roles, setRoles] = useState<
    { id: number; role: string; users: number; permissions: number; optimized: boolean }[]
  >([]);

  useEffect(() => {
    const roleTypes = ['Developer', 'Manager', 'Analyst', 'Admin', 'Auditor'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newRole = {
          id: Date.now(),
          role: roleTypes[Math.floor(Math.random() * roleTypes.length)],
          users: Math.floor(Math.random() * 50) + 5,
          permissions: Math.floor(Math.random() * 20) + 5,
          optimized: Math.random() > 0.7,
        };
        setRoles((prev) => [...prev.slice(-4), newRole]);

        // Simulate optimization completion
        setTimeout(() => {
          setRoles((prev) =>
            prev.map((r) => (r.id === newRole.id ? { ...r, optimized: true } : r))
          );
        }, 2500 + Math.random() * 3500);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {roles.map((role, i) => (
        <div
          key={role.id}
          className="absolute bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `roleMatrix ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-indigo-400 font-bold">{role.role}</div>
          <div className="text-white/70">{role.users} users</div>
          {role.optimized ? (
            <div className="text-green-400 animate-pulse">OPTIMIZED</div>
          ) : (
            <div className="text-indigo-400 animate-pulse">MINING...</div>
          )}
          <div className="text-xs text-cyan-400">{role.permissions} perms</div>
        </div>
      ))}
      <style>{`
        @keyframes roleMatrix {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. LifecycleAutomationFlow - Automated identity lifecycle
const LifecycleAutomationFlow: React.FC = () => {
  const [lifecycle, setLifecycle] = useState<
    { id: number; event: string; user: string; automated: boolean; completed: boolean }[]
  >([]);

  useEffect(() => {
    const events = ['Joiner', 'Mover', 'Leaver', 'Role Change', 'Access Review'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newEvent = {
          id: Date.now(),
          event: events[Math.floor(Math.random() * events.length)],
          user: 'User-' + Math.floor(Math.random() * 10000),
          automated: Math.random() > 0.6,
          completed: Math.random() > 0.8,
        };
        setLifecycle((prev) => [...prev.slice(-3), newEvent]);

        // Simulate completion
        setTimeout(() => {
          setLifecycle((prev) =>
            prev.map((e) => (e.id === newEvent.id ? { ...e, completed: true } : e))
          );
        }, 3000 + Math.random() * 4000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {lifecycle.map((event, i) => (
        <div
          key={event.id}
          className="absolute bg-pink-500/10 border border-pink-500/20 rounded-lg p-2 text-[6px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `lifecycleFlow ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <User className="w-2 h-2 text-pink-400" />
            <span className="text-pink-400 font-bold">{event.event}</span>
          </div>
          <div className="text-white/70">{event.user}</div>
          {event.completed ? (
            <div className="text-green-400 animate-pulse">COMPLETED</div>
          ) : (
            <div className={`text-xs font-bold ${event.automated ? 'text-cyan-400' : 'text-orange-400'}`}>
              {event.automated ? 'AUTO' : 'MANUAL'}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes lifecycleFlow {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. ComplianceDashboard - Governance and compliance monitoring
const ComplianceDashboard: React.FC = () => {
  const [compliance, setCompliance] = useState<boolean[][]>(
    Array(6).fill(null).map(() => Array(6).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCompliance((prev) =>
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
        {compliance.flat().map((check, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-200 ${
              check ? 'bg-purple-500/60 animate-pulse' : 'bg-purple-500/10'
            }`}
          >
            {check && (
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

const IdentityForgeDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    usersManaged: 124739,
    certificationsCompleted: 8924,
    rolesOptimized: 156,
    complianceScore: 98.7,
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
        usersManaged: prev.usersManaged + Math.floor(Math.random() * 50),
        certificationsCompleted: prev.certificationsCompleted + Math.floor(Math.random() * 20),
        rolesOptimized: prev.rolesOptimized + Math.floor(Math.random() * 2),
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
        <IdentityRadar />
        <AccessCertificationEngine />
        <RoleMiningMatrix />
        <LifecycleAutomationFlow />
        <ComplianceDashboard />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">IdentityForge Enterprise v3.1</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
              <UserCheck className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">Identity Governance Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              IDENTITY <span className="text-purple-500">FORGE</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Identity governance platform. Complete identity lifecycle management with access certification, role mining, and compliance automation.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://identityforge.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" /> Start Governance
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Users: {liveMetrics.usersManaged.toLocaleString()}+
              </div>
            </div>
          </div>

          {/* Identity Governance Forge Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-purple-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central identity governance forge */}
              <div className="relative w-80 h-80">
                {/* Central governance forge */}
                <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-purple-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-purple-300/30 rounded-full flex items-center justify-center">
                      {/* Core identity forge */}
                      <div className="w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center relative">
                        <Fingerprint className="w-16 h-16 text-purple-400" />

                        {/* Governance modules orbiting */}
                        {[
                          { icon: UserCheck, label: 'Certification' },
                          { icon: Users, label: 'Role Mining' },
                          { icon: Key, label: 'Lifecycle' },
                          { icon: ShieldCheck, label: 'Compliance' },
                          { icon: Search, label: 'Access Review' },
                          { icon: User, label: 'Identity Mgmt' }
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

                {/* Governance rings */}
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
                <span className="text-purple-400">GOVERNANCE: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● IDENTITY FORGE</span>
              </div>
              <div className="mt-2 w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '97%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-purple-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500 tabular-nums">{liveMetrics.usersManaged.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Users Managed</div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.certificationsCompleted.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Certifications Completed</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{width: '92%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.rolesOptimized}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Roles Optimized</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{width: '85%'}}></div>
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
                <Fingerprint className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Access Certification</h3>
              <p className="text-white/50 leading-relaxed">Automated access reviews with intelligent recommendations to ensure least-privilege compliance.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                8.9K reviews/month
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Role Mining</h3>
              <p className="text-white/50 leading-relaxed">AI-powered role discovery and optimization to reduce access sprawl and simplify governance.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                156 roles optimized
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Lifecycle Automation</h3>
              <p className="text-white/50 leading-relaxed">Automated joiner, mover, leaver workflows synchronized with HR systems and directories.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <User className="w-4 h-4 animate-pulse" />
                99.7% automated
              </div>
            </div>
          </div>

          {/* Identity Governance Forge Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-purple-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Identity Governance Forge</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Advanced identity governance platform with automated lifecycle management, intelligent role mining, and comprehensive access certification for enterprise-scale identity security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Governance capabilities */}
                {[
                  { capability: 'Access Certification', coverage: 99.2, icon: UserCheck, color: 'text-purple-400' },
                  { capability: 'Role Mining & Optimization', coverage: 97.8, icon: Users, color: 'text-cyan-400' },
                  { capability: 'Lifecycle Automation', coverage: 99.7, icon: Key, color: 'text-green-400' },
                  { capability: 'Compliance Monitoring', coverage: 98.9, icon: ShieldCheck, color: 'text-yellow-400' },
                  { capability: 'Identity Analytics', coverage: 96.5, icon: Activity, color: 'text-blue-400' },
                  { capability: 'Governance Automation', coverage: 99.1, icon: FileText, color: 'text-red-400' }
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

              {/* Governance dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-purple-500/10 p-8">
                <div className="space-y-6">
                  {/* Governance metrics */}
                  {[
                    { metric: 'Identity Coverage', value: 99.8, status: 'comprehensive' },
                    { metric: 'Certification Rate', value: 97.3, status: 'excellent' },
                    { metric: 'Automation Level', value: 99.1, status: 'advanced' },
                    { metric: 'Compliance Score', value: 98.7, status: 'optimal' },
                    { metric: 'Role Optimization', value: 94.2, status: 'effective' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-purple-400">{item.metric}</div>
                      <div className="flex-1 bg-purple-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'comprehensive' ? 'bg-green-500' :
                            item.status === 'excellent' ? 'bg-blue-500' :
                            item.status === 'advanced' ? 'bg-cyan-500' :
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
                  <span>Identity Governance Status</span>
                  <span>All Identities Secured</span>
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
          <a href="https://identityforge.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
            Manage Identities <Fingerprint className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default IdentityForgeDetail;

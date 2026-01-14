
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
  Key,
  RotateCcw,
  FileText,
  ShieldCheck,
  LockIcon,
  EyeOff,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - SECRETS MANAGEMENT
// ============================================================================

// 1. SecretVaultMatrix - Secrets storage and access monitoring
const SecretVaultMatrix: React.FC = () => {
  const [secrets, setSecrets] = useState<
    { id: number; type: string; access: string; lastRotated: string; secure: boolean }[]
  >([]);

  useEffect(() => {
    const secretTypes = ['API Key', 'Database Cred', 'SSL Cert', 'Token', 'Password'];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newSecret = {
          id: Date.now(),
          type: secretTypes[Math.floor(Math.random() * secretTypes.length)],
          access: ['Read', 'Write', 'Admin'][Math.floor(Math.random() * 3)],
          lastRotated: new Date().toLocaleTimeString(),
          secure: Math.random() > 0.9,
        };
        setSecrets((prev) => [...prev.slice(-6), newSecret]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="vaultGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.2" />
          </radialGradient>
          <filter id="vaultGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.4" />
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="#1d4ed8" strokeWidth="0.2" opacity="0.5" />
        <rect x="30" y="30" width="40" height="40" fill="none" stroke="#1e40af" strokeWidth="0.2" opacity="0.6" />

        <g style={{ transformOrigin: '50px 50px', animation: 'vaultScan 4s linear infinite' }}>
          <line x1="50" y1="10" x2="50" y2="90" stroke="#3b82f6" strokeWidth="0.5" opacity="0.8" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#3b82f6" strokeWidth="0.5" opacity="0.8" />
        </g>

        {secrets.map((secret, i) => (
          <g key={secret.id}>
            <rect
              x={15 + Math.random() * 70}
              y={15 + Math.random() * 70}
              width="8"
              height="4"
              fill={secret.secure ? '#22c55e' : '#3b82f6'}
              opacity="0.9"
              rx="1"
            >
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
            </rect>
            {secret.secure && (
              <circle
                cx={15 + Math.random() * 70 + 4}
                cy={15 + Math.random() * 70 + 2}
                r="3"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                opacity="0.6"
              >
                <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes vaultScan { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. RotationEngine - Automatic credential rotation
const RotationEngine: React.FC = () => {
  const [rotations, setRotations] = useState<
    { id: number; secret: string; status: string; nextRotation: string; automated: boolean }[]
  >([]);

  useEffect(() => {
    const secretNames = ['DB-Prod', 'API-Gateway', 'SSL-Wildcard', 'Service-Token', 'Admin-Key'];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newRotation = {
          id: Date.now(),
          secret: secretNames[Math.floor(Math.random() * secretNames.length)],
          status: ['Scheduled', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)],
          nextRotation: new Date(Date.now() + Math.random() * 86400000).toLocaleTimeString(),
          automated: Math.random() > 0.7,
        };
        setRotations((prev) => [...prev.slice(-5), newRotation]);

        // Simulate completion
        setTimeout(() => {
          setRotations((prev) =>
            prev.map((r) => (r.id === newRotation.id ? { ...r, status: 'Completed' } : r))
          );
        }, 2000 + Math.random() * 3000);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {rotations.map((rotation, i) => (
        <div
          key={rotation.id}
          className={`absolute bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[7px] font-mono ${
            rotation.status === 'Completed' ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `rotationAlert ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <RefreshCw className={`w-2 h-2 text-blue-400 ${rotation.status === 'In Progress' ? 'animate-spin' : ''}`} />
            <span className="text-blue-400 font-bold">{rotation.secret}</span>
          </div>
          <div className="text-white/70">{rotation.status}</div>
          <div className={`text-xs font-bold ${
            rotation.status === 'Completed' ? 'text-green-400' :
            rotation.status === 'In Progress' ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            {rotation.automated ? 'AUTO' : 'MANUAL'}
          </div>
          {rotation.status === 'Completed' && (
            <div className="text-green-400 animate-pulse">SECURE</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes rotationAlert {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. AccessAuditTrail - Real-time access logging and monitoring
const AccessAuditTrail: React.FC = () => {
  const [accesses, setAccesses] = useState<
    { id: number; user: string; secret: string; action: string; timestamp: string; authorized: boolean }[]
  >([]);

  useEffect(() => {
    const users = ['Dev-Team', 'Ops-Admin', 'Security', 'Auditor', 'Service-Account'];
    const actions = ['Read', 'Write', 'Rotate', 'Delete', 'Access'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAccess = {
          id: Date.now(),
          user: users[Math.floor(Math.random() * users.length)],
          secret: 'Secret-' + Math.floor(Math.random() * 1000),
          action: actions[Math.floor(Math.random() * actions.length)],
          timestamp: new Date().toLocaleTimeString(),
          authorized: Math.random() > 0.95,
        };
        setAccesses((prev) => [...prev.slice(-4), newAccess]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {accesses.map((access, i) => (
        <div
          key={access.id}
          className="absolute bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `auditTrail ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-cyan-400 font-bold">{access.user}</div>
          <div className="text-white/70">{access.action} {access.secret}</div>
          {access.authorized ? (
            <div className="text-green-400 animate-pulse">AUTHORIZED</div>
          ) : (
            <div className="text-red-400 animate-pulse">DENIED</div>
          )}
          <div className="text-xs text-blue-400">{access.timestamp}</div>
        </div>
      ))}
      <style>{`
        @keyframes auditTrail {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. EncryptionMatrix - Multi-layer encryption visualization
const EncryptionMatrix: React.FC = () => {
  const [encryption, setEncryption] = useState<
    { id: number; layer: string; algorithm: string; strength: number; active: boolean }[]
  >([]);

  useEffect(() => {
    const layers = ['Transport', 'Application', 'Database', 'File', 'Network'];
    const algorithms = ['AES-256', 'RSA-4096', 'ChaCha20', 'ECC', 'PBKDF2'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newLayer = {
          id: Date.now(),
          layer: layers[Math.floor(Math.random() * layers.length)],
          algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
          strength: Math.floor(Math.random() * 40) + 60,
          active: Math.random() > 0.8,
        };
        setEncryption((prev) => [...prev.slice(-3), newLayer]);

        // Simulate activation
        setTimeout(() => {
          setEncryption((prev) =>
            prev.map((e) => (e.id === newLayer.id ? { ...e, active: true } : e))
          );
        }, 2500 + Math.random() * 3500);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {encryption.map((layer, i) => (
        <div
          key={layer.id}
          className="absolute bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-[6px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `encryptionMatrix ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <LockIcon className="w-2 h-2 text-indigo-400" />
            <span className="text-indigo-400 font-bold">{layer.layer}</span>
          </div>
          <div className="text-white/70">{layer.algorithm}</div>
          {layer.active ? (
            <div className="text-green-400 animate-pulse">ENCRYPTED</div>
          ) : (
            <div className={`text-xs font-bold text-indigo-400`}>
              {layer.strength}% SECURE
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes encryptionMatrix {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. SecurityBoundary - Vault security perimeter and access controls
const SecurityBoundary: React.FC = () => {
  const [boundaries, setBoundaries] = useState<boolean[][]>(
    Array(6).fill(null).map(() => Array(6).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBoundaries((prev) =>
        prev.map((row) =>
          row.map(() => Math.random() > 0.88)
        )
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-8">
      <div className="grid grid-cols-6 gap-1 w-full h-full p-8">
        {boundaries.flat().map((boundary, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-200 ${
              boundary ? 'bg-blue-500/60 animate-pulse' : 'bg-blue-500/10'
            }`}
          >
            {boundary && (
              <div className="w-full h-full bg-blue-400/40 animate-ping rounded-sm"></div>
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

const SecretVaultDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    secretsManaged: 10284739,
    rotationsCompleted: 45623,
    accessRequests: 89241,
    securityScore: 99.8,
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
        secretsManaged: prev.secretsManaged + Math.floor(Math.random() * 100),
        rotationsCompleted: prev.rotationsCompleted + Math.floor(Math.random() * 50),
        accessRequests: prev.accessRequests + Math.floor(Math.random() * 20),
        securityScore: Math.max(98.0, prev.securityScore + (Math.random() - 0.99) * 0.1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#04080d] text-white selection:bg-blue-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-blue-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-cyan-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <HexGrid color="#a855f7" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#a855f7" />
        <HexGrid color="#a855f7" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#a855f7" />
        <SecretVaultMatrix />
        <RotationEngine />
        <AccessAuditTrail />
        <EncryptionMatrix />
        <SecurityBoundary />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">SecretVault Enterprise v4.2</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-blue-500/20 backdrop-blur-3xl">
              <Key className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500">Secrets Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              SECRET <span className="text-blue-500">VAULT</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Secrets management solution. Centralized vault for API keys, credentials, and certificates with automatic rotation and audit logging.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://secretvault.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2">
                <LockIcon className="w-4 h-4" /> Secure Secrets
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Secrets: {liveMetrics.secretsManaged.toLocaleString()}+
              </div>
            </div>
          </div>

          {/* Secret Vault Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-blue-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central vault core */}
              <div className="relative w-80 h-80">
                {/* Vault security rings */}
                <div className="absolute inset-0 border-4 border-blue-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-blue-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-blue-300/30 rounded-full flex items-center justify-center">
                      {/* Core vault */}
                      <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center relative">
                        <LockIcon className="w-16 h-16 text-blue-400" />

                        {/* Security modules orbiting */}
                        {[
                          { icon: Key, label: 'Keys' },
                          { icon: RotateCcw, label: 'Rotation' },
                          { icon: FileText, label: 'Audit' },
                          { icon: ShieldCheck, label: 'Security' },
                          { icon: EyeOff, label: 'Encryption' },
                          { icon: Fingerprint, label: 'Access' }
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-blue-400/15 rounded-full flex items-center justify-center border border-blue-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60) * Math.PI / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60) * Math.PI / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`
                            }}
                          >
                            <module.icon className="w-5 h-5 text-blue-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vault access rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-blue-500/20 rounded-full animate-pulse"
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
                <span className="text-blue-400">VAULT: SECURE</span>
                <span className="text-green-400 animate-pulse">● SECRET VAULT</span>
              </div>
              <div className="mt-2 w-full bg-blue-500/10 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '99%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-blue-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-blue-500 tabular-nums">{liveMetrics.secretsManaged.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Secrets Managed</div>
              <div className="w-full bg-blue-500/10 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '99%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.rotationsCompleted.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Rotations Completed</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{width: '95%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.accessRequests.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Access Requests</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{width: '87%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-blue-500">{liveMetrics.securityScore.toFixed(1)}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Security Score</div>
              <div className="w-full bg-blue-500/10 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: `${liveMetrics.securityScore}%`}}></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Automatic Rotation</h3>
              <p className="text-white/50 leading-relaxed">Automated credential rotation with zero-downtime secret updates and comprehensive audit trails.</p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                45K rotations/month
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Audit Logging</h3>
              <p className="text-white/50 leading-relaxed">Comprehensive audit trails for all secret access, modifications, and system events with real-time monitoring.</p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                100% coverage
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <LockIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Multi-Layer Encryption</h3>
              <p className="text-white/50 leading-relaxed">End-to-end encryption with AES-256, envelope encryption, and hardware security module integration.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <EyeOff className="w-4 h-4 animate-pulse" />
                FIPS 140-2 Level 3
              </div>
            </div>
          </div>

          {/* Secret Vault Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-blue-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Secret Vault Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Enterprise-grade secrets management with automated rotation, comprehensive audit logging, and military-grade encryption for complete secret lifecycle security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Vault capabilities */}
                {[
                  { capability: 'Secret Storage', coverage: 99.9, icon: Database, color: 'text-blue-400' },
                  { capability: 'Automatic Rotation', coverage: 99.7, icon: RotateCcw, color: 'text-cyan-400' },
                  { capability: 'Audit Logging', coverage: 100.0, icon: FileText, color: 'text-green-400' },
                  { capability: 'Access Control', coverage: 99.8, icon: ShieldCheck, color: 'text-yellow-400' },
                  { capability: 'Encryption Strength', coverage: 99.9, icon: LockIcon, color: 'text-purple-400' },
                  { capability: 'Compliance Coverage', coverage: 98.5, icon: EyeOff, color: 'text-red-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-blue-400 font-mono text-sm">{item.coverage}% coverage</div>
                    </div>
                    <div className="w-16 h-2 bg-blue-500/20 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{width: `${item.coverage}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vault security dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-blue-500/10 p-8">
                <div className="space-y-6">
                  {/* Security metrics */}
                  {[
                    { metric: 'Vault Uptime', value: 99.99, status: 'excellent' },
                    { metric: 'Encryption Coverage', value: 100.0, status: 'complete' },
                    { metric: 'Audit Completeness', value: 99.95, status: 'comprehensive' },
                    { metric: 'Access Latency', value: 99.8, status: 'optimal' },
                    { metric: 'Security Score', value: 99.8, status: 'exceptional' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-blue-400">{item.metric}</div>
                      <div className="flex-1 bg-blue-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent' ? 'bg-green-500' :
                            item.status === 'complete' ? 'bg-blue-500' :
                            item.status === 'comprehensive' ? 'bg-cyan-500' :
                            item.status === 'optimal' ? 'bg-purple-500' : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{width: `${item.value > 10 ? item.value : item.value * 10}%`}}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">{item.value}{item.value < 10 ? '%' : '%'}</div>
                      <div className="w-20 text-xs font-mono text-blue-400 text-right capitalize">{item.status}</div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-blue-400">
                  <span>Vault Security Status</span>
                  <span>All Secrets Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-blue-500/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://secretvault.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-blue-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-blue-500/20 flex items-center gap-4">
            Manage Secrets <Key className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SecretVaultDetail;

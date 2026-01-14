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
  Unlock,
  FileText,
  FolderOpen,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - RANSOM SHIELD
// ============================================================================

// 1. RansomDetectionRadar - Advanced ransomware detection radar
const RansomDetectionRadar: React.FC = () => {
  const [ransomIncidents, setRansomIncidents] = useState<
    { id: number; x: number; y: number; severity: string; type: string; encrypted: number }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newIncident = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
          type: ['file_encryption', 'data_exfiltration', 'ransom_note'][Math.floor(Math.random() * 3)],
          encrypted: Math.floor(Math.random() * 1000) + 100,
        };
        setRansomIncidents((prev) => [...prev.slice(-8), newIncident]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="ransomGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </radialGradient>
          <filter id="ransomGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="0.3" opacity="0.3" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="0.2" opacity="0.4" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#eab308" strokeWidth="0.2" opacity="0.5" />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 5s linear infinite' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#ransomGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#ef4444"
            strokeWidth="0.8"
            filter="url(#ransomGlow)"
          />
        </g>

        <line x1="5" y1="50" x2="95" y2="50" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#ef4444" strokeWidth="0.1" opacity="0.3" />

        {ransomIncidents.map((incident) => (
          <g key={incident.id}>
            <circle
              cx={incident.x}
              cy={incident.y}
              r="1.5"
              fill={severityColors[incident.severity as keyof typeof severityColors]}
              opacity="0.8"
            >
              <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={incident.x}
              cy={incident.y}
              r="4"
              fill="none"
              stroke={severityColors[incident.severity as keyof typeof severityColors]}
              strokeWidth="0.5"
              opacity="0.4"
            >
              <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
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

// 2. EncryptionBreaker - Real-time encryption analysis
const EncryptionBreaker: React.FC = () => {
  const [breakAttempts, setBreakAttempts] = useState<
    { id: number; algorithm: string; progress: number; status: string }[]
  >([]);

  useEffect(() => {
    const algorithms = ['AES-256', 'RSA-4096', 'ChaCha20', 'Triple-DES', 'Blowfish'];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAttempt = {
          id: Date.now(),
          algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
          progress: 0,
          status: 'analyzing',
        };
        setBreakAttempts((prev) => [...prev.slice(-6), newAttempt]);
      }

      setBreakAttempts((prev) =>
        prev.map((attempt) => ({
          ...attempt,
          progress: attempt.progress < 100 ? attempt.progress + Math.random() * 5 : 100,
          status: attempt.progress >= 100 ? 'broken' : attempt.status,
        }))
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {breakAttempts.map((attempt, i) => (
        <div
          key={attempt.id}
          className="absolute bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `breakPulse ${2 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-red-400 font-bold">{attempt.algorithm}</div>
          <div className="text-white/70">{attempt.progress.toFixed(0)}% complete</div>
          <div className="text-orange-400">{attempt.status}</div>
          <div className="w-12 h-1 bg-red-500/20 rounded-full mt-1">
            <div
              className="h-1 bg-red-500 rounded-full transition-all duration-300"
              style={{width: `${attempt.progress}%`}}
            ></div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes breakPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. FileRecoveryEngine - File recovery visualization
const FileRecoveryEngine: React.FC = () => {
  const [recoveredFiles, setRecoveredFiles] = useState<
    { id: number; name: string; size: string; status: string; progress: number }[]
  >([]);

  useEffect(() => {
    const fileTypes = ['document.pdf', 'spreadsheet.xlsx', 'database.db', 'image.jpg', 'video.mp4'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newFile = {
          id: Date.now(),
          name: fileTypes[Math.floor(Math.random() * fileTypes.length)],
          size: `${Math.floor(Math.random() * 100) + 1}MB`,
          status: 'recovering',
          progress: 0,
        };
        setRecoveredFiles((prev) => [...prev.slice(-8), newFile]);
      }

      setRecoveredFiles((prev) =>
        prev.map((file) => ({
          ...file,
          progress: file.progress < 100 ? file.progress + Math.random() * 8 : 100,
          status: file.progress >= 100 ? 'recovered' : file.status,
        }))
      );
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {recoveredFiles.map((file, i) => (
        <div
          key={file.id}
          className="absolute bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-[7px] font-mono flex items-center gap-1"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `recoveryFloat ${3 + Math.random() * 2}s linear infinite`,
          }}
        >
          <FileText className="w-2 h-2 text-green-400" />
          <div>
            <div className="text-green-400 font-bold">{file.name}</div>
            <div className="text-white/60">{file.size}</div>
            <div className="w-8 h-0.5 bg-green-500/20 rounded-full mt-0.5">
              <div
                className="h-0.5 bg-green-500 rounded-full transition-all duration-300"
                style={{width: `${file.progress}%`}}
              ></div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes recoveryFloat {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 4. RansomNoteAnalyzer - Ransom note pattern recognition
const RansomNoteAnalyzer: React.FC = () => {
  const [notes, setNotes] = useState<
    { id: number; language: string; demands: string; confidence: number }[]
  >([]);

  useEffect(() => {
    const languages = ['English', 'Russian', 'Chinese', 'Spanish', 'Korean'];
    const demands = ['$5000 BTC', '$10000 ETH', '$25000 XMR', 'Contact Us', 'Pay Now'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newNote = {
          id: Date.now(),
          language: languages[Math.floor(Math.random() * languages.length)],
          demands: demands[Math.floor(Math.random() * demands.length)],
          confidence: 70 + Math.random() * 30,
        };
        setNotes((prev) => [...prev.slice(-5), newNote]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {notes.map((note, i) => (
        <div
          key={note.id}
          className="absolute bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `noteDrift ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="text-red-400 font-bold">RANSOM NOTE</div>
          <div className="text-white/70">{note.language}</div>
          <div className="text-yellow-400">{note.demands}</div>
          <div className="text-green-400">{note.confidence.toFixed(0)}% match</div>
        </div>
      ))}
      <style>{`
        @keyframes noteDrift {
          0% { transform: translateX(0px) translateY(0px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(50px) translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. BackupIntegrityGrid - Backup integrity monitoring
const BackupIntegrityGrid: React.FC = () => {
  const [backups, setBackups] = useState<boolean[][]>(
    Array(12).fill(null).map(() => Array(12).fill(true))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBackups((prev) =>
        prev.map((row) =>
          row.map(() => Math.random() > 0.95 ? false : true)
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <div className="grid grid-cols-12 gap-0.5 w-full h-full p-4">
        {backups.flat().map((intact, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-300 ${
              intact ? 'bg-green-500/40' : 'bg-red-500/60 animate-pulse'
            }`}
          >
            {!intact && (
              <div className="w-full h-full bg-red-400/60 animate-pulse rounded-sm"></div>
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

const RansomShieldDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prevention' | 'recovery' | 'intelligence'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    attacksBlocked: 284739,
    filesRecovered: 15684,
    ransomPaid: 2341,
    backupIntegrity: 99.7,
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
        filesRecovered: prev.filesRecovered + Math.floor((Math.random() - 0.9) * 20),
        ransomPaid: prev.ransomPaid + Math.floor((Math.random() - 0.98) * 5),
        backupIntegrity: Math.max(95, prev.backupIntegrity + (Math.random() - 0.5) * 0.1),
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
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-red-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-orange-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RansomDetectionRadar />
        <EncryptionBreaker />
        <FileRecoveryEngine />
        <RansomNoteAnalyzer />
        <BackupIntegrityGrid />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">RansomShield Enterprise v7.1</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
              <Shield className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500">Ransomware Protection</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              RANSOM <span className="text-red-500">SHIELD</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Advanced ransomware detection and prevention. Stop attacks before they encrypt, recover data instantly, and protect against all known and unknown ransomware variants.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://ransomshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/20 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Activate Shield
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                99.7% Success Rate
              </div>
            </div>
          </div>

          {/* Ransom Shield Protection Matrix Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-red-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central protection engine */}
              <div className="relative w-80 h-80">
                {/* Central protection engine */}
                <div className="absolute inset-0 border-4 border-red-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-red-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-red-300/30 rounded-full flex items-center justify-center">
                      {/* Core protection engine */}
                      <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center relative">
                        <Shield className="w-16 h-16 text-red-400" />

                        {/* Protection modules orbiting */}
                        {[
                          { icon: Lock, label: 'Encryption Block' },
                          { icon: Key, label: 'Key Recovery' },
                          { icon: FileText, label: 'File Protection' },
                          { icon: Database, label: 'Backup Secure' },
                          { icon: Activity, label: 'Behavior Analysis' },
                          { icon: Target, label: 'Threat Detection' }
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-red-400/15 rounded-full flex items-center justify-center border border-red-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60) * Math.PI / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60) * Math.PI / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`
                            }}
                          >
                            <module.icon className="w-5 h-5 text-red-300" />
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
                    className="absolute border border-red-500/20 rounded-full animate-pulse"
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
                <span className="text-red-400">PROTECTION: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● RANSOM SHIELD</span>
              </div>
              <div className="mt-2 w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: '99%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-red-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500 tabular-nums">{liveMetrics.attacksBlocked.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Attacks Blocked</div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: '96%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white tabular-nums">{liveMetrics.filesRecovered.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Files Recovered</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.ransomPaid.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Ransom Payments</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{width: '2%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500">{liveMetrics.backupIntegrity.toFixed(1)}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Backup Integrity</div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: `${liveMetrics.backupIntegrity}%`}}></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Attack Prevention</h3>
              <p className="text-white/50 leading-relaxed">Advanced behavioral analysis and signature detection to stop ransomware before it can execute encryption routines.</p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                284K attacks prevented
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Unlock className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Instant Recovery</h3>
              <p className="text-white/50 leading-relaxed">Automated decryption and file recovery using secure backups and advanced cryptographic techniques.</p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                Sub-5 minute recovery
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Threat Intelligence</h3>
              <p className="text-white/50 leading-relaxed">Global threat intelligence network sharing ransomware signatures, attack patterns, and emerging threats in real-time.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <Target className="w-4 h-4 animate-pulse" />
                15K+ threat signatures
              </div>
            </div>
          </div>

          {/* Protection Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-red-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Ransomware Protection Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Multi-layered ransomware defense combining prevention, detection, and recovery capabilities for comprehensive protection against all ransomware variants.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Protection capabilities */}
                {[
                  { capability: 'Attack Prevention', coverage: 99.1, icon: Shield, color: 'text-red-400' },
                  { capability: 'File Encryption Block', coverage: 98.7, icon: Lock, color: 'text-orange-400' },
                  { capability: 'Instant Recovery', coverage: 97.3, icon: Unlock, color: 'text-yellow-400' },
                  { capability: 'Backup Integrity', coverage: 99.5, icon: Database, color: 'text-green-400' },
                  { capability: 'Threat Intelligence', coverage: 96.8, icon: Eye, color: 'text-blue-400' },
                  { capability: 'Zero-Day Detection', coverage: 98.2, icon: Target, color: 'text-purple-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-red-400 font-mono text-sm">{item.coverage}% effectiveness</div>
                    </div>
                    <div className="w-16 h-2 bg-red-500/20 rounded-full">
                      <div className="h-2 bg-red-500 rounded-full" style={{width: `${item.coverage}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Protection dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-red-500/10 p-8">
                <div className="space-y-6">
                  {/* Protection metrics */}
                  {[
                    { metric: 'Protection Uptime', value: 99.9, status: 'excellent' },
                    { metric: 'Detection Accuracy', value: 98.5, status: 'high' },
                    { metric: 'Recovery Speed', value: 4.2, status: 'fast' },
                    { metric: 'False Positives', value: 0.1, status: 'minimal' },
                    { metric: 'Threat Coverage', value: 99.7, status: 'comprehensive' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-red-400">{item.metric}</div>
                      <div className="flex-1 bg-red-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent' ? 'bg-green-500' :
                            item.status === 'high' ? 'bg-blue-500' :
                            item.status === 'fast' ? 'bg-purple-500' :
                            item.status === 'minimal' ? 'bg-yellow-500' : 'bg-red-500'
                          } transition-all duration-1000`}
                          style={{width: `${typeof item.value === 'number' && item.value > 10 ? (item.value / 100) * 100 : item.value}%`}}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">{item.value}{typeof item.value === 'number' && item.value > 10 ? '%' : typeof item.value === 'number' && item.value < 10 ? 'min' : '%'}</div>
                      <div className="w-20 text-xs font-mono text-red-400 text-right capitalize">{item.status}</div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-400">
                  <span>Protection Engine Status</span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-red-500/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://ransomshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/20 flex items-center gap-4">
            Deploy Protection <Shield className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RansomShieldDetail;

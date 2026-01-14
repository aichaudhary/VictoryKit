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
  EyeOff,
  FileText,
  Key,
  ShieldCheck,
  FileSearch,
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
// EPIC ANIMATED VISUAL COMPONENTS - DATA LOSS PREVENTION
// ============================================================================

// 1. DataDiscoveryRadar - Asset discovery and classification
const DataDiscoveryRadar: React.FC = () => {
  const [assets, setAssets] = useState<
    { id: number; type: string; sensitivity: string; location: string; classified: boolean }[]
  >([]);

  useEffect(() => {
    const assetTypes = [
      'Database',
      'File Server',
      'Cloud Storage',
      'Email Server',
      'Web App',
      'API Gateway',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAsset = {
          id: Date.now(),
          type: assetTypes[Math.floor(Math.random() * assetTypes.length)],
          sensitivity: ['Public', 'Internal', 'Confidential', 'Restricted'][
            Math.floor(Math.random() * 4)
          ],
          location: ['AWS', 'Azure', 'On-Prem', 'GCP'][Math.floor(Math.random() * 4)],
          classified: Math.random() > 0.8,
        };
        setAssets((prev) => [...prev.slice(-8), newAsset]);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const sensitivityColors: Record<string, string> = {
    Public: '#22c55e',
    Internal: '#eab308',
    Confidential: '#f97316',
    Restricted: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="dataGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.2" />
          </radialGradient>
          <filter id="dataGlow">
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
          stroke="#3b82f6"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="0.2"
          opacity="0.5"
        />
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke="#1e40af"
          strokeWidth="0.2"
          opacity="0.6"
        />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 6s linear infinite' }}>
          <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="url(#dataGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#3b82f6"
            strokeWidth="0.8"
            filter="url(#dataGlow)"
          />
        </g>

        {assets.map((asset, i) => (
          <g key={asset.id}>
            <circle
              cx={20 + Math.random() * 60}
              cy={20 + Math.random() * 60}
              r="2"
              fill={asset.classified ? '#22c55e' : '#3b82f6'}
              opacity="0.9"
            >
              <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {asset.classified && (
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

// 2. ContentInspectionEngine - Deep content scanning
const ContentInspectionEngine: React.FC = () => {
  const [scans, setScans] = useState<
    { id: number; fileType: string; sensitivity: string; threats: number; processed: boolean }[]
  >([]);

  useEffect(() => {
    const fileTypes = ['PDF', 'DOCX', 'XLSX', 'TXT', 'JSON', 'XML', 'CSV'];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newScan = {
          id: Date.now(),
          fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
          sensitivity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          threats: Math.floor(Math.random() * 5),
          processed: Math.random() > 0.9,
        };
        setScans((prev) => [...prev.slice(-6), newScan]);
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {scans.map((scan, i) => (
        <div
          key={scan.id}
          className={`absolute bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[7px] font-mono ${
            scan.processed ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `scanAlert ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <FileText className="w-2 h-2 text-blue-400" />
            <span className="text-blue-400 font-bold">{scan.fileType}</span>
          </div>
          <div className="text-white/70">Sensitivity: {scan.sensitivity}</div>
          <div
            className={`text-xs font-bold ${scan.threats > 0 ? 'text-orange-400' : 'text-green-400'}`}
          >
            {scan.threats > 0 ? `${scan.threats} threats` : 'CLEAN'}
          </div>
          {scan.processed && <div className="text-green-400 animate-pulse">PROCESSED</div>}
        </div>
      ))}
      <style>{`
        @keyframes scanAlert {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. EncryptionMatrix - Encryption and key management
const EncryptionMatrix: React.FC = () => {
  const [keys, setKeys] = useState<
    { id: number; algorithm: string; strength: string; rotated: boolean; active: boolean }[]
  >([]);

  useEffect(() => {
    const algorithms = ['AES-256', 'RSA-4096', 'ECC-P384', 'ChaCha20', 'Triple-DES'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newKey = {
          id: Date.now(),
          algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
          strength: ['128-bit', '256-bit', '384-bit', '4096-bit'][Math.floor(Math.random() * 4)],
          rotated: Math.random() > 0.7,
          active: true,
        };
        setKeys((prev) => [...prev.slice(-5), newKey]);

        // Simulate key rotation
        setTimeout(
          () => {
            setKeys((prev) => prev.map((k) => (k.id === newKey.id ? { ...k, rotated: false } : k)));
          },
          3000 + Math.random() * 4000
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {keys.map((key, i) => (
        <div
          key={key.id}
          className="absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `keyMatrix ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-purple-400 font-bold">{key.algorithm}</div>
          <div className="text-white/70">{key.strength}</div>
          {key.rotated ? (
            <div className="text-cyan-400 animate-pulse">ROTATING...</div>
          ) : (
            <div className={`text-xs font-bold ${key.active ? 'text-green-400' : 'text-red-400'}`}>
              {key.active ? 'ACTIVE' : 'INACTIVE'}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes keyMatrix {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. DataFlowMonitor - Data movement tracking
const DataFlowMonitor: React.FC = () => {
  const [flows, setFlows] = useState<
    {
      id: number;
      source: string;
      destination: string;
      volume: number;
      encrypted: boolean;
      monitored: boolean;
    }[]
  >([]);

  useEffect(() => {
    const locations = ['Database', 'API', 'File Server', 'Cloud', 'Email', 'Web App'];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newFlow = {
          id: Date.now(),
          source: locations[Math.floor(Math.random() * locations.length)],
          destination: locations[Math.floor(Math.random() * locations.length)],
          volume: Math.floor(Math.random() * 1000) + 100,
          encrypted: Math.random() > 0.8,
          monitored: true,
        };
        setFlows((prev) => [...prev.slice(-4), newFlow]);

        // Simulate monitoring completion
        setTimeout(
          () => {
            setFlows((prev) =>
              prev.map((f) => (f.id === newFlow.id ? { ...f, monitored: false } : f))
            );
          },
          2500 + Math.random() * 3500
        );
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {flows.map((flow, i) => (
        <div
          key={flow.id}
          className="absolute bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 text-[6px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `dataFlow ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Activity className="w-2 h-2 text-indigo-400" />
            <span className="text-indigo-400 font-bold">
              {flow.source} → {flow.destination}
            </span>
          </div>
          <div className="text-white/70">{flow.volume}MB</div>
          {flow.monitored ? (
            <div className="text-cyan-400 animate-pulse">MONITORING...</div>
          ) : (
            <div
              className={`text-xs font-bold ${flow.encrypted ? 'text-green-400' : 'text-orange-400'}`}
            >
              {flow.encrypted ? 'ENCRYPTED' : 'UNENCRYPTED'}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes dataFlow {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. ComplianceDashboard - Compliance monitoring
const ComplianceDashboard: React.FC = () => {
  const [compliance, setCompliance] = useState<boolean[][]>(
    Array(6)
      .fill(null)
      .map(() => Array(6).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCompliance((prev) => prev.map((row) => row.map(() => Math.random() > 0.85)));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-8">
      <div className="grid grid-cols-6 gap-1 w-full h-full p-6">
        {compliance.flat().map((check, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-200 ${
              check ? 'bg-blue-500/60 animate-pulse' : 'bg-blue-500/10'
            }`}
          >
            {check && <div className="w-full h-full bg-blue-400/40 animate-ping rounded-sm"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DataGuardianDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>(
    'overview'
  );
  const [liveMetrics, setLiveMetrics] = useState({
    assetsDiscovered: 247839,
    dataTypes: 127,
    encryptionRate: 99.8,
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
        assetsDiscovered: prev.assetsDiscovered + Math.floor(Math.random() * 100),
        dataTypes: prev.dataTypes,
        encryptionRate: Math.max(99.0, prev.encryptionRate + (Math.random() - 0.99) * 0.1),
        complianceScore: Math.max(95.0, prev.complianceScore + (Math.random() - 0.98) * 0.1),
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
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-indigo-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <HexGrid color="#a855f7" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#a855f7" />
        <HexGrid color="#a855f7" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#a855f7" />
        <DataDiscoveryRadar />
        <ContentInspectionEngine />
        <EncryptionMatrix />
        <DataFlowMonitor />
        <ComplianceDashboard />
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
            DataGuardian Enterprise v5.2
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-blue-500/20 backdrop-blur-3xl">
              <Database className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500">
                Asset Discovery & DLP
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              DATA <span className="text-blue-500">GUARDIAN</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Protect what matters most. Enterprise DLP with intelligent content inspection
              identifying sensitive data across your entire organization.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://dataguardian.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Analyze Store
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Types: {liveMetrics.dataTypes}+
              </div>
            </div>
          </div>

          {/* Data Protection Matrix Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-blue-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central data protection engine */}
              <div className="relative w-80 h-80">
                {/* Central protection engine */}
                <div className="absolute inset-0 border-4 border-blue-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-blue-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-blue-300/30 rounded-full flex items-center justify-center">
                      {/* Core data guardian */}
                      <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center relative">
                        <Database className="w-16 h-16 text-blue-400" />

                        {/* Protection modules orbiting */}
                        {[
                          { icon: Search, label: 'Discovery' },
                          { icon: EyeOff, label: 'Redaction' },
                          { icon: Key, label: 'Encryption' },
                          { icon: Activity, label: 'Monitoring' },
                          { icon: ShieldCheck, label: 'Compliance' },
                          { icon: Lock, label: 'Protection' },
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-blue-400/15 rounded-full flex items-center justify-center border border-blue-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`,
                            }}
                          >
                            <module.icon className="w-5 h-5 text-blue-300" />
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
                    className="absolute border border-blue-500/20 rounded-full animate-pulse"
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
                <span className="text-blue-400">PROTECTION: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● DATA GUARDIAN</span>
              </div>
              <div className="mt-2 w-full bg-blue-500/10 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full animate-pulse"
                  style={{ width: '96%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-blue-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-blue-500 tabular-nums">
                {liveMetrics.assetsDiscovered.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Assets Discovered
              </div>
              <div className="w-full bg-blue-500/10 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full animate-pulse"
                  style={{ width: '98%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.dataTypes}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Data Types
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full animate-pulse"
                  style={{ width: '92%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.encryptionRate.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Encryption Rate
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{ width: `${liveMetrics.encryptionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-blue-500">
                {liveMetrics.complianceScore.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Compliance Score
              </div>
              <div className="w-full bg-blue-500/10 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full animate-pulse"
                  style={{ width: `${liveMetrics.complianceScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Deep Content Scan</h3>
              <p className="text-white/50 leading-relaxed">
                Uses OCR and NLP to identify PII, PCI, and proprietary secrets inside images, PDFs,
                and unstructured logs.
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                Scanning 2.4TB data/min
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <EyeOff className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Auto-Redaction</h3>
              <p className="text-white/50 leading-relaxed">
                Dynamically masks sensitive data in transit to ensure compliance without
                interrupting business workflows.
              </p>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                99.8% redaction accuracy
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Encryption Guard</h3>
              <p className="text-white/50 leading-relaxed">
                Automated key rotation and certificate management to keep data encrypted both at
                rest and in transit.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <Lock className="w-4 h-4 animate-pulse" />
                AES-256 encryption
              </div>
            </div>
          </div>

          {/* Data Protection Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-blue-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Data Protection Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">
                Advanced Data Loss Prevention with intelligent asset discovery, content inspection,
                and automated protection across your entire data landscape.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Protection capabilities */}
                {[
                  {
                    capability: 'Asset Discovery',
                    coverage: 99.7,
                    icon: Search,
                    color: 'text-blue-400',
                  },
                  {
                    capability: 'Content Classification',
                    coverage: 98.3,
                    icon: FileText,
                    color: 'text-cyan-400',
                  },
                  {
                    capability: 'Encryption Management',
                    coverage: 99.9,
                    icon: Key,
                    color: 'text-purple-400',
                  },
                  {
                    capability: 'Data Flow Monitoring',
                    coverage: 97.8,
                    icon: Activity,
                    color: 'text-green-400',
                  },
                  {
                    capability: 'Compliance Automation',
                    coverage: 96.5,
                    icon: ShieldCheck,
                    color: 'text-yellow-400',
                  },
                  {
                    capability: 'Real-time Protection',
                    coverage: 99.2,
                    icon: Shield,
                    color: 'text-red-400',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-blue-400 font-mono text-sm">
                        {item.coverage}% coverage
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-blue-500/20 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${item.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Protection dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-blue-500/10 p-8">
                <div className="space-y-6">
                  {/* Protection metrics */}
                  {[
                    { metric: 'Data Classification Rate', value: 99.5, status: 'excellent' },
                    { metric: 'False Positive Rate', value: 0.8, status: 'minimal' },
                    { metric: 'Encryption Coverage', value: 99.8, status: 'comprehensive' },
                    { metric: 'Compliance Violations', value: 0.2, status: 'negligible' },
                    { metric: 'Response Time', value: 0.3, status: 'instant' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-blue-400">{item.metric}</div>
                      <div className="flex-1 bg-blue-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent'
                              ? 'bg-green-500'
                              : item.status === 'minimal'
                                ? 'bg-blue-500'
                                : item.status === 'comprehensive'
                                  ? 'bg-cyan-500'
                                  : item.status === 'negligible'
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
                      <div className="w-20 text-xs font-mono text-blue-400 text-right capitalize">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-blue-400">
                  <span>Data Protection Status</span>
                  <span>All Assets Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-blue-500/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://dataguardian.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-blue-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-blue-500/20 flex items-center gap-4"
          >
            Secure Assets <Database className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataGuardianDetail;

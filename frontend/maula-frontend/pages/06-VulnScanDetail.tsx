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
  Layers,
  Radar,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - VULNERABILITY SCANNING
// ============================================================================

// 1. VulnerabilityRadar - Advanced vulnerability detection radar
const VulnerabilityRadar: React.FC = () => {
  const [vulnerabilities, setVulnerabilities] = useState<
    { id: number; x: number; y: number; severity: string; type: string; cve: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newVuln = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
          type: ['RCE', 'SQL Injection', 'XSS', 'Misconfig', 'Weak Crypto'][
            Math.floor(Math.random() * 5)
          ],
          cve: `CVE-2024-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`,
        };
        setVulnerabilities((prev) => [...prev.slice(-8), newVuln]);
      }
    }, 1000);
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
          <radialGradient id="vulnGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </radialGradient>
          <filter id="vulnGlow">
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
          stroke="#f59e0b"
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
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#vulnGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#f59e0b"
            strokeWidth="0.8"
            filter="url(#vulnGlow)"
          />
        </g>

        <line x1="5" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#f59e0b" strokeWidth="0.1" opacity="0.3" />

        {vulnerabilities.map((vuln) => (
          <g key={vuln.id}>
            <circle
              cx={vuln.x}
              cy={vuln.y}
              r="1.5"
              fill={severityColors[vuln.severity as keyof typeof severityColors]}
              opacity="0.8"
            >
              <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={vuln.x}
              cy={vuln.y}
              r="4"
              fill="none"
              stroke={severityColors[vuln.severity as keyof typeof severityColors]}
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

// 2. AttackSurfaceMapper - Attack surface visualization
const AttackSurfaceMapper: React.FC = () => {
  const [surfaces, setSurfaces] = useState<
    { id: number; type: string; exposed: boolean; risk: string; endpoints: number }[]
  >([]);

  useEffect(() => {
    const surfaceTypes = [
      'Web Apps',
      'APIs',
      'Databases',
      'Cloud Storage',
      'IoT Devices',
      'Mobile Apps',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newSurface = {
          id: Date.now(),
          type: surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)],
          exposed: Math.random() > 0.6,
          risk: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          endpoints: Math.floor(Math.random() * 100) + 10,
        };
        setSurfaces((prev) => [...prev.slice(-6), newSurface]);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {surfaces.map((surface, i) => (
        <div
          key={surface.id}
          className={`absolute bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-[8px] font-mono ${
            surface.exposed ? 'border-red-500/40 bg-red-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `surfaceMap ${3 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="text-amber-400 font-bold">{surface.type}</div>
          <div className="text-white/70">{surface.endpoints} endpoints</div>
          <div
            className={`text-xs ${surface.risk === 'high' ? 'text-red-400' : surface.risk === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}
          >
            {surface.risk.toUpperCase()} RISK
          </div>
          {surface.exposed && (
            <div className="text-red-400 text-xs font-bold animate-pulse">EXPOSED</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes surfaceMap {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. CVEDetector - CVE identification and analysis
const CVEDetector: React.FC = () => {
  const [cves, setCves] = useState<
    { id: number; cve: string; cvss: number; status: string; affected: string }[]
  >([]);

  useEffect(() => {
    const affectedSystems = [
      'Web Server',
      'Database',
      'API Gateway',
      'Load Balancer',
      'Application',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newCVE = {
          id: Date.now(),
          cve: `CVE-2024-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`,
          cvss: 4 + Math.random() * 6,
          status: Math.random() > 0.7 ? 'exploitable' : 'patched',
          affected: affectedSystems[Math.floor(Math.random() * affectedSystems.length)],
        };
        setCves((prev) => [...prev.slice(-5), newCVE]);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {cves.map((cve, i) => (
        <div
          key={cve.id}
          className="absolute bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-[7px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `cveDetect ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-2 h-2 text-orange-400" />
            <span className="text-orange-400 font-bold">{cve.cve}</span>
          </div>
          <div className="text-white/70">{cve.affected}</div>
          <div className="text-xs">
            CVSS:{' '}
            <span
              className={
                cve.cvss >= 7
                  ? 'text-red-400'
                  : cve.cvss >= 4
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }
            >
              {cve.cvss.toFixed(1)}
            </span>
          </div>
          <div
            className={`text-xs font-bold ${cve.status === 'exploitable' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}
          >
            {cve.status.toUpperCase()}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes cveDetect {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 4. ConfigurationScanner - Configuration vulnerability detection
const ConfigurationScanner: React.FC = () => {
  const [configs, setConfigs] = useState<
    { id: number; service: string; issue: string; severity: string; scanning: boolean }[]
  >([]);

  useEffect(() => {
    const services = ['Apache', 'Nginx', 'MySQL', 'PostgreSQL', 'Redis', 'Docker'];
    const issues = [
      'Weak Passwords',
      'Open Ports',
      'Default Configs',
      'Missing Updates',
      'Privilege Escalation',
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newConfig = {
          id: Date.now(),
          service: services[Math.floor(Math.random() * services.length)],
          issue: issues[Math.floor(Math.random() * issues.length)],
          severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
          scanning: true,
        };
        setConfigs((prev) => [...prev.slice(-4), newConfig]);

        // Simulate scan completion
        setTimeout(
          () => {
            setConfigs((prev) =>
              prev.map((c) => (c.id === newConfig.id ? { ...c, scanning: false } : c))
            );
          },
          2000 + Math.random() * 3000
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {configs.map((config, i) => (
        <div
          key={config.id}
          className="absolute bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `configScan ${2.5 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-yellow-400 font-bold">{config.service}</div>
          <div className="text-white/70 truncate">{config.issue}</div>
          {config.scanning ? (
            <div className="text-cyan-400 animate-pulse">SCANNING...</div>
          ) : (
            <div
              className={`text-xs font-bold ${
                config.severity === 'critical'
                  ? 'text-red-400'
                  : config.severity === 'high'
                    ? 'text-orange-400'
                    : 'text-yellow-400'
              }`}
            >
              {config.severity.toUpperCase()}
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes configScan {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 5. RiskAssessmentEngine - Risk scoring and prioritization
const RiskAssessmentEngine: React.FC = () => {
  const [assessments, setAssessments] = useState<boolean[][]>(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAssessments((prev) => prev.map((row) => row.map(() => Math.random() > 0.9)));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <div className="grid grid-cols-8 gap-0.5 w-full h-full p-4">
        {assessments.flat().map((highRisk, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-300 ${
              highRisk ? 'bg-red-500/60 animate-pulse' : 'bg-amber-500/20'
            }`}
          >
            {highRisk && (
              <div className="w-full h-full bg-red-400/40 animate-ping rounded-sm"></div>
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

const VulnScanDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'scanning' | 'assessment' | 'remediation'
  >('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    assetsScanned: 284739,
    vulnerabilitiesFound: 15684,
    criticalIssues: 892,
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
        assetsScanned: prev.assetsScanned + Math.floor(Math.random() * 100),
        vulnerabilitiesFound: prev.vulnerabilitiesFound + Math.floor((Math.random() - 0.9) * 20),
        criticalIssues: prev.criticalIssues + Math.floor((Math.random() - 0.95) * 5),
        scanCoverage: Math.max(95, prev.scanCoverage + (Math.random() - 0.5) * 0.1),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0802] text-white selection:bg-amber-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-amber-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-orange-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <VulnerabilityRadar />
        <AttackSurfaceMapper />
        <CVEDetector />
        <ConfigurationScanner />
        <RiskAssessmentEngine />
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
            VulnScan Enterprise v6.1
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
              <Search className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500">
                Attack Surface Mapping
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              VULN <span className="text-amber-500">SCAN</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              See what attackers see. Continuous vulnerability scanning that maps your entire attack
              surface, identifies CVEs, and prioritizes risks before they can be exploited.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://vulnscan.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-amber-500/20 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Deep Scan
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Coverage: {liveMetrics.scanCoverage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Vulnerability Scanning Matrix Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-amber-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central scanning engine */}
              <div className="relative w-80 h-80">
                {/* Central scanning engine */}
                <div className="absolute inset-0 border-4 border-amber-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-amber-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-amber-300/30 rounded-full flex items-center justify-center">
                      {/* Core scanning engine */}
                      <div className="w-32 h-32 bg-amber-500/20 rounded-full flex items-center justify-center relative">
                        <Search className="w-16 h-16 text-amber-400" />

                        {/* Scanning modules orbiting */}
                        {[
                          { icon: Server, label: 'Asset Discovery' },
                          { icon: Database, label: 'Vuln Database' },
                          { icon: Cpu, label: 'Config Scan' },
                          { icon: Layers, label: 'Risk Assessment' },
                          { icon: Activity, label: 'Continuous Monitor' },
                          { icon: Target, label: 'Attack Surface' },
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-amber-400/15 rounded-full flex items-center justify-center border border-amber-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`,
                            }}
                          >
                            <module.icon className="w-5 h-5 text-amber-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanning rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-amber-500/20 rounded-full animate-pulse"
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
                <span className="text-amber-400">SCANNING: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● VULN DETECTOR</span>
              </div>
              <div className="mt-2 w-full bg-amber-500/10 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full animate-pulse"
                  style={{ width: '96%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-amber-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-amber-500 tabular-nums">
                {liveMetrics.assetsScanned.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Assets Scanned
              </div>
              <div className="w-full bg-amber-500/10 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full animate-pulse"
                  style={{ width: '94%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white tabular-nums">
                {liveMetrics.vulnerabilitiesFound.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Vulnerabilities Found
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="bg-red-500 h-1 rounded-full animate-pulse"
                  style={{ width: '98%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">
                {liveMetrics.criticalIssues.toLocaleString()}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Critical Issues
              </div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-orange-500 h-1 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-amber-500">
                {liveMetrics.scanCoverage.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Scan Coverage
              </div>
              <div className="w-full bg-amber-500/10 rounded-full h-1">
                <div
                  className="bg-amber-500 h-1 rounded-full animate-pulse"
                  style={{ width: `${liveMetrics.scanCoverage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group hover:shadow-2xl hover:shadow-amber-500/5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Radar className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Attack Surface Mapping</h3>
              <p className="text-white/50 leading-relaxed">
                Comprehensive discovery and mapping of all attack surfaces including shadow IT,
                misconfigured assets, and forgotten systems.
              </p>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                284K assets mapped daily
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group hover:shadow-2xl hover:shadow-amber-500/5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">CVE Intelligence</h3>
              <p className="text-white/50 leading-relaxed">
                Real-time CVE database integration with exploitability analysis and prioritization
                based on your specific environment.
              </p>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-mono">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                15K+ CVEs tracked
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group hover:shadow-2xl hover:shadow-amber-500/5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Risk Prioritization</h3>
              <p className="text-white/50 leading-relaxed">
                AI-powered risk scoring that considers exploitability, business impact, and threat
                intelligence to focus remediation efforts.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                99.7% accuracy rate
              </div>
            </div>
          </div>

          {/* Scanning Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-amber-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Vulnerability Scanning Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">
                Multi-layered vulnerability assessment combining automated scanning, configuration
                analysis, and risk-based prioritization for comprehensive security coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Scanning capabilities */}
                {[
                  {
                    capability: 'Asset Discovery',
                    coverage: 99.1,
                    icon: Server,
                    color: 'text-amber-400',
                  },
                  {
                    capability: 'Vulnerability Scanning',
                    coverage: 98.7,
                    icon: Search,
                    color: 'text-orange-400',
                  },
                  {
                    capability: 'Configuration Analysis',
                    coverage: 97.3,
                    icon: Cpu,
                    color: 'text-yellow-400',
                  },
                  {
                    capability: 'CVE Correlation',
                    coverage: 96.9,
                    icon: Database,
                    color: 'text-red-400',
                  },
                  {
                    capability: 'Risk Assessment',
                    coverage: 99.5,
                    icon: Target,
                    color: 'text-green-400',
                  },
                  {
                    capability: 'Continuous Monitoring',
                    coverage: 98.2,
                    icon: Activity,
                    color: 'text-blue-400',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-amber-400 font-mono text-sm">
                        {item.coverage}% coverage
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-amber-500/20 rounded-full">
                      <div
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: `${item.coverage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scanning dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-amber-500/10 p-8">
                <div className="space-y-6">
                  {/* Scanning metrics */}
                  {[
                    { metric: 'Scan Performance', value: 10000, status: 'high' },
                    { metric: 'False Positive Rate', value: 1.2, status: 'low' },
                    { metric: 'Coverage Depth', value: 99.7, status: 'comprehensive' },
                    { metric: 'Response Time', value: 0.3, status: 'fast' },
                    { metric: 'Intelligence Quality', value: 98, status: 'excellent' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-amber-400">{item.metric}</div>
                      <div className="flex-1 bg-amber-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'high'
                              ? 'bg-green-500'
                              : item.status === 'low'
                                ? 'bg-blue-500'
                                : item.status === 'comprehensive'
                                  ? 'bg-purple-500'
                                  : item.status === 'fast'
                                    ? 'bg-cyan-500'
                                    : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{
                            width: `${typeof item.value === 'number' && item.value > 100 ? (item.value / 10000) * 100 : item.value}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">
                        {item.value}
                        {typeof item.value === 'number' && item.value > 100 ? '/hr' : '%'}
                      </div>
                      <div className="w-20 text-xs font-mono text-amber-400 text-right capitalize">
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-amber-400">
                  <span>Scanning Engine Status</span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-amber-500/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://vulnscan.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-amber-500/20 flex items-center gap-4"
          >
            Start Scanning <Search className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VulnScanDetail;

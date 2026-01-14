import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Eye,
  Globe,
  Database,
  Search,
  ShieldAlert,
  Cpu,
  Network,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Activity,
  TrendingUp,
  Users,
  FileWarning,
} from 'lucide-react';

// ============================================================================
// DARK WEB MONITORING VISUAL - Animated tool showcase
// ============================================================================

const DarkWebMonitoringVisual: React.FC = () => {
  const [activeMonitor, setActiveMonitor] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [monitorResults, setMonitorResults] = useState<{ threats: number; sources: number }>({
    threats: 0,
    sources: 0,
  });

  const monitors = [
    {
      id: 'live-threats',
      name: 'Live Threats',
      icon: ShieldAlert,
      description: 'Real-time threat monitoring',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-400',
      stats: { label: 'Active Threats', value: '847K' },
    },
    {
      id: 'asset-monitor',
      name: 'Asset Monitor',
      icon: Database,
      description: 'Monitor exposed assets',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-400',
      stats: { label: 'Assets Tracked', value: '12.8K' },
    },
    {
      id: 'breach-check',
      name: 'Breach Check',
      icon: AlertTriangle,
      description: 'Detect data breaches',
      color: 'from-orange-500 to-yellow-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-400',
      stats: { label: 'Breaches Found', value: '3.4K' },
    },
    {
      id: 'intel-gather',
      name: 'Intel Gather',
      icon: Eye,
      description: 'Gather threat intelligence',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-400',
      stats: { label: 'Intel Sources', value: '50K+' },
    },
    {
      id: 'osint-search',
      name: 'OSINT Search',
      icon: Search,
      description: 'Open source intelligence',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      textColor: 'text-green-400',
      stats: { label: 'OSINT Queries', value: '127' },
    },
  ];

  // Auto-cycle through monitors
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMonitor((prev) => (prev + 1) % monitors.length);
      setScanProgress(0);
      setMonitorResults({ threats: 0, sources: 0 });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate monitoring progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setMonitorResults({
            threats: Math.floor(Math.random() * 50) + 10,
            sources: Math.floor(Math.random() * 100) + 200,
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(progressInterval);
  }, [activeMonitor]);

  const currentMonitor = monitors[activeMonitor];
  const CurrentIcon = currentMonitor.icon;

  return (
    <div className="relative group rounded-[3rem] overflow-hidden border border-purple-500/20 shadow-2xl bg-gradient-to-br from-[#18132a] to-[#0d0414] backdrop-blur-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-400">
            Dark Web Intelligence
          </span>
        </div>
        <div className="text-[10px] font-mono text-white/40">MONITORING</div>
      </div>

      {/* Monitor Title */}
      <h3 className="text-xl sm:text-2xl font-black text-white mb-6">Threat Intelligence Suite</h3>

      {/* Monitor Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {monitors.map((monitor, index) => {
          const Icon = monitor.icon;
          return (
            <button
              key={monitor.id}
              onClick={() => {
                setActiveMonitor(index);
                setScanProgress(0);
                setMonitorResults({ threats: 0, sources: 0 });
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeMonitor === index
                  ? `bg-gradient-to-r ${monitor.color} text-white shadow-lg`
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{monitor.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Monitor Display */}
      <div
        className={`relative p-6 rounded-2xl ${currentMonitor.bgColor} border ${currentMonitor.borderColor} mb-6`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentMonitor.color} flex items-center justify-center`}
          >
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg">{currentMonitor.name}</div>
            <div className="text-white/60 text-sm">{currentMonitor.description}</div>
          </div>
        </div>

        {/* Monitor Status */}
        <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3 mb-4">
          <Activity className="w-4 h-4 text-white/40" />
          <span className="font-mono text-sm text-white/60 flex-1">
            Monitoring {currentMonitor.stats.label}...
          </span>
          <div
            className={`px-3 py-1 rounded-lg bg-gradient-to-r ${currentMonitor.color} text-white text-xs font-bold flex items-center gap-2`}
          >
            <span>{currentMonitor.stats.value}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className={currentMonitor.textColor}>Scanning...</span>
            <span className="text-white/60">{scanProgress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${currentMonitor.color} transition-all duration-200`}
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Results */}
        {scanProgress === 100 && (
          <div className="flex items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-mono text-sm">
                {monitorResults.threats} Threats
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm">
                {monitorResults.sources} Sources
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-white/40">TOR Network • I2P • Dark Markets</span>
        <span className="text-purple-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Monitoring
        </span>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-2xl" />
    </div>
  );
};

const DarkWebMonitorDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0404] text-white selection:bg-red-500/30 font-sans"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            DarkWebMonitor v4.2.0
          </span>
        </div>

        {/* Hero Section with Animated Monitoring Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
              <Eye className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-400">
                Dark Web Intelligence
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              DARKWEB <span className="text-purple-500">MONITOR</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Intelligence that sees everything. Advanced threat intelligence platform that monitors
              dark web markets, forums, and encrypted channels for stolen credentials and data.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://darkwebmonitor.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/30 flex items-center gap-3"
              >
                <Eye className="w-4 h-4" /> Launch Monitor
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase">
                50K+ Sources
              </div>
            </div>
          </div>

          {/* Animated Dark Web Monitoring Visual */}
          <DarkWebMonitoringVisual />
        </div>

        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-red-500 tracking-tighter">50K+</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Data Sources
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">Global</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Network Coverage
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">Real-time</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Threat Alerts
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">24/7</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Monitoring
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Credential Monitoring</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Detect stolen credentials and compromised accounts before they're exploited by
                threat actors.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Network className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Forum Intelligence</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Monitor underground forums and encrypted channels for threat actor discussions
                targeting your organization.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Data Leak Detection</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Identify exposed sensitive data and intellectual property on dark web marketplaces
                instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
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
            className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center"
          >
            Start Monitoring <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DarkWebMonitorDetail;

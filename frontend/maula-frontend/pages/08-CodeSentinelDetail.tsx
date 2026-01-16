import React, { useEffect, useRef, useState } from 'react';
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
  Code,
  Terminal,
  Layers,
  GitBranch,
  Bug,
  ShieldCheck,
  FileSearch,
  Globe,
  FileCode,
  Package,
  Clock,
} from 'lucide-react';
import { HexGrid, FloatingIcons } from '../components/AnimatedBackground';

const CodeAnalysisRadar: React.FC = () => {
  const radarRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.radar-sweep', {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.vulnerability-dot', {
        scale: 1.5,
        opacity: 0.8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });
    }, radarRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <svg ref={radarRef} viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Radar circles */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          opacity="0.2"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx="200"
          cy="200"
          r="50"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Radar sweep */}
        <g className="radar-sweep" style={{ transformOrigin: '200px 200px' }}>
          <path
            d="M200,200 L350,200 A150,150 0 0,1 200,50 Z"
            fill="url(#radarGradient)"
            opacity="0.6"
          />
        </g>

        {/* Vulnerability detection points */}
        <circle
          cx="280"
          cy="150"
          r="4"
          className="vulnerability-dot"
          fill="#ef4444"
          filter="url(#glow)"
        />
        <circle
          cx="320"
          cy="220"
          r="3"
          className="vulnerability-dot"
          fill="#f97316"
          filter="url(#glow)"
        />
        <circle
          cx="150"
          cy="280"
          r="5"
          className="vulnerability-dot"
          fill="#eab308"
          filter="url(#glow)"
        />
        <circle
          cx="180"
          cy="120"
          r="3"
          className="vulnerability-dot"
          fill="#22c55e"
          filter="url(#glow)"
        />

        {/* Code analysis grid */}
        <g opacity="0.3">
          <rect
            x="50"
            y="50"
            width="300"
            height="300"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="0.5"
          />
          <line x1="50" y1="125" x2="350" y2="125" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="50" y1="200" x2="350" y2="200" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="50" y1="275" x2="350" y2="275" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="125" y1="50" x2="125" y2="350" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="200" y1="50" x2="200" y2="350" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="275" y1="50" x2="275" y2="350" stroke="#06b6d4" strokeWidth="0.5" />
        </g>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black text-cyan-500 mb-2">ANALYZING</div>
          <div className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Real-time Code Security
          </div>
        </div>
      </div>
    </div>
  );
};

const VulnerabilityScanner: React.FC = () => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.scan-line', {
        x: '100%',
        duration: 2,
        repeat: -1,
        ease: 'power2.inOut',
      });

      gsap.to('.code-block', {
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        duration: 1,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });
    }, scannerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={scannerRef}
      className="relative w-full h-80 bg-black/20 rounded-3xl border border-cyan-500/20 overflow-hidden"
    >
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-bold text-cyan-500 uppercase tracking-wider">
        <span>Code Vulnerability Scanner</span>
        <span>STATUS: ACTIVE</span>
      </div>

      <div className="p-6 space-y-3">
        <div className="code-block p-3 rounded-lg border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-500">SQL INJECTION DETECTED</span>
          </div>
          <code className="text-xs text-white/70">
            query = "SELECT * FROM users WHERE id = '" + userId + "'"
          </code>
        </div>

        <div className="code-block p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">WEAK ENCRYPTION</span>
          </div>
          <code className="text-xs text-white/70">const hash = md5(password);</code>
        </div>

        <div className="code-block p-3 rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-500">SECURE PATTERN</span>
          </div>
          <code className="text-xs text-white/70">
            const hash = await bcrypt.hash(password, 12);
          </code>
        </div>
      </div>

      <div className="scan-line absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 to-transparent opacity-60"></div>
    </div>
  );
};

const SecurityCodeGrid: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.grid-cell', {
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        stagger: 0.1,
      });

      gsap.to('.pulse-dot', {
        scale: 1.2,
        opacity: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={gridRef} className="relative w-full h-96">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>

        <rect width="400" height="300" fill="url(#grid)" />

        {/* Code security nodes */}
        <g className="grid-cell">
          <rect x="80" y="60" width="30" height="30" fill="#06b6d4" opacity="0.2" rx="4" />
          <text x="95" y="78" textAnchor="middle" className="text-xs fill-cyan-500 font-bold">
            SAST
          </text>
        </g>

        <g className="grid-cell">
          <rect x="160" y="100" width="30" height="30" fill="#06b6d4" opacity="0.2" rx="4" />
          <text x="175" y="118" textAnchor="middle" className="text-xs fill-cyan-500 font-bold">
            DAST
          </text>
        </g>

        <g className="grid-cell">
          <rect x="240" y="80" width="30" height="30" fill="#06b6d4" opacity="0.2" rx="4" />
          <text x="255" y="98" textAnchor="middle" className="text-xs fill-cyan-500 font-bold">
            IAST
          </text>
        </g>

        <g className="grid-cell">
          <rect x="120" y="160" width="30" height="30" fill="#06b6d4" opacity="0.2" rx="4" />
          <text x="135" y="178" textAnchor="middle" className="text-xs fill-cyan-500 font-bold">
            SCA
          </text>
        </g>

        <g className="grid-cell">
          <rect x="200" y="140" width="30" height="30" fill="#06b6d4" opacity="0.2" rx="4" />
          <text x="215" y="158" textAnchor="middle" className="text-xs fill-cyan-500 font-bold">
            SECRETS
          </text>
        </g>

        {/* Connection lines */}
        <line x1="95" y1="90" x2="175" y2="100" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <line x1="175" y1="130" x2="255" y2="80" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <line x1="135" y1="160" x2="215" y2="170" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />

        {/* Pulse dots */}
        <circle cx="95" cy="90" r="3" className="pulse-dot" fill="#06b6d4" />
        <circle cx="175" cy="130" r="3" className="pulse-dot" fill="#06b6d4" />
        <circle cx="255" cy="110" r="3" className="pulse-dot" fill="#06b6d4" />
      </svg>
    </div>
  );
};

const ThreatDetectionWaveform: React.FC = () => {
  const waveformRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.waveform-line', {
        strokeDashoffset: -100,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.threat-pulse', {
        scale: 1.5,
        opacity: 0,
        duration: 1,
        repeat: -1,
        stagger: 0.5,
      });
    }, waveformRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full h-64">
      <svg ref={waveformRef} viewBox="0 0 400 200" className="w-full h-full">
        <defs>
          <style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Waveform background */}
        <rect width="400" height="200" fill="#000000" opacity="0.2" />

        {/* Threat detection waveform */}
        <path
          d="M0,100 Q50,50 100,100 T200,100 Q250,150 300,100 T400,100"
          stroke="url(#waveGradient)"
          strokeWidth="3"
          fill="none"
          className="waveform-line"
          style={{ strokeDasharray: '10,5' }}
        />

        {/* Threat indicators */}
        <circle cx="120" cy="80" r="6" className="threat-pulse" fill="#ef4444" />
        <circle cx="280" cy="120" r="4" className="threat-pulse" fill="#f97316" />

        {/* Detection labels */}
        <text x="120" y="60" textAnchor="middle" className="text-xs fill-red-500 font-bold">
          VULNERABILITY
        </text>
        <text x="280" y="140" textAnchor="middle" className="text-xs fill-orange-500 font-bold">
          WEAKNESS
        </text>
      </svg>
    </div>
  );
};

const CodeSentinelDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [liveStats, setLiveStats] = useState({
    vulnerabilitiesFound: 1247,
    codeScanned: 89234,
    threatsBlocked: 89,
    scanCoverage: 97.3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        vulnerabilitiesFound: prev.vulnerabilitiesFound + Math.floor(Math.random() * 3),
        codeScanned: prev.codeScanned + Math.floor(Math.random() * 50),
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 2),
        scanCoverage: Math.min(99.9, prev.scanCoverage + Math.random() * 0.1),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(heroRef.current?.querySelectorAll('.hero-element'), {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      // Stats counter animations
      gsap.from(statsRef.current?.querySelectorAll('.stat-number'), {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        stagger: 0.2,
        delay: 0.5,
      });

      // Features stagger animation
      gsap.from(featuresRef.current?.querySelectorAll('.feature-card'), {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Engine visualization
      gsap.from(engineRef.current?.querySelectorAll('.engine-element'), {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        stagger: 0.3,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: engineRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      // CTA animation
      gsap.from(ctaRef.current?.querySelectorAll('.cta-element'), {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Floating background elements
      gsap.to('.floating-bg', {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#040d12] text-white selection:bg-cyan-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="floating-bg absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="floating-bg absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full" />
        <div className="floating-bg absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <HexGrid color="#a855f7" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#a855f7" />

        {/* Particle System */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-500/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Data Stream Effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px bg-gradient-to-b from-cyan-500 to-transparent animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  height: `${Math.random() * 100 + 50}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            CodeSentinel v4.0
          </span>
        </div>

        {/* Hero Section */}
        <div
          ref={heroRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40"
        >
          <div className="space-y-10">
            <div className="hero-element inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-cyan-500/20 backdrop-blur-3xl">
              <Code className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-500">
                Intelligent Code Analysis
              </span>
            </div>
            <h1 className="hero-element text-5xl sm:text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              CODE <span className="text-cyan-500">SENTINEL</span>
            </h1>
            <p className="hero-element text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Code security from the start. Static and dynamic application security testing
              integrated into your CI/CD pipeline with intelligent code analysis.
            </p>
            <div className="hero-element flex gap-6 pt-4">
              <a
                href="https://codesentinel.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-cyan-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-cyan-500/20"
              >
                Analyze Pipeline
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Languages: 30+
              </div>
            </div>
          </div>
          <div className="hero-element relative group">
            {/* CodeSentinel Tool Preview - Realistic Dashboard */}
            <div className="rounded-[2rem] overflow-hidden border border-emerald-500/30 shadow-2xl bg-[#0a0f0d]">
              {/* Tool Header */}
              <div className="bg-slate-900/90 border-b border-emerald-500/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">CodeSentinel</div>
                      <div className="text-[10px] text-gray-500">AI-Powered Code Security Analysis Fortress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-yellow-500/20 rounded text-[9px] font-mono text-yellow-400 border border-yellow-500/30">
                      SAST ENGINE
                    </div>
                    <div className="px-2 py-1 bg-emerald-500/20 rounded text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Engine Active
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
                  {[
                    { label: 'Security Rules', value: '50+' },
                    { label: 'CVE Patterns', value: '100+', color: 'text-orange-400' },
                    { label: 'Secret Types', value: '200+' },
                    { label: 'Scan Speed', value: '<1s', color: 'text-yellow-400' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <div>
                        <div className="text-[9px] text-gray-500">{stat.label}</div>
                        <div className={`text-xs font-bold ${stat.color || 'text-white'}`}>{stat.value}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <div className="text-[9px] text-gray-500">Powered by</div>
                    <div className="text-xs font-bold text-cyan-400">VictoryKit AI</div>
                  </div>
                </div>
              </div>

              {/* Main Content - 3 Column Layout */}
              <div className="p-3 grid grid-cols-3 gap-3">
                {/* Code Analysis Panel */}
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Code className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Code Analysis</div>
                      <div className="text-[8px] text-gray-500">Scan for security vulnerabilities</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 mb-2">Source Type</div>
                  <div className="flex gap-1.5 mb-3">
                    {[
                      { icon: FileCode, label: 'Paste Code', active: false },
                      { icon: Globe, label: 'File URL', active: false },
                      { icon: GitBranch, label: 'Repository', active: true },
                    ].map((type, i) => (
                      <div key={i} className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[8px] ${type.active ? 'bg-emerald-500 text-white' : 'bg-slate-700/30 text-gray-500'}`}>
                        <type.icon className="w-3 h-3" />
                        {type.label}
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] text-gray-400 mb-1">Repository URL</div>
                  <div className="bg-slate-900/50 rounded px-2 py-1.5 text-[9px] font-mono text-gray-400 mb-2">
                    https://codesentinel.maula.ai/
                  </div>
                  <div className="text-[9px] text-gray-400 mb-1">Branch</div>
                  <div className="bg-slate-900/50 rounded px-2 py-1.5 text-[9px] font-mono text-white mb-2">
                    main
                  </div>
                  <div className="text-[9px] text-gray-400 mb-1">Language</div>
                  <div className="bg-slate-900/50 rounded px-2 py-1.5 text-[9px] text-gray-400">
                    Auto-detect
                  </div>
                </div>

                {/* Live Analysis Panel */}
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Eye className="w-3 h-3 text-red-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Live Analysis</div>
                        <div className="text-[8px] text-gray-500">javascript • 1 lines</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-[8px]">
                    <span className="text-gray-400">📄 5 files</span>
                    <span className="text-gray-400">📦 5 deps</span>
                    <span className="text-emerald-400">⚠️ 0 issues</span>
                  </div>
                  {/* Analysis Stages */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {['Parsing', 'SAST', 'Secrets', 'Dependencies', 'Reporting'].map((stage, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-[8px] text-gray-300 border border-slate-600/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {stage}
                      </div>
                    ))}
                  </div>
                  {/* Code Editor */}
                  <div className="bg-slate-900/80 rounded p-2 font-mono text-[8px] mb-3 h-16">
                    <span className="text-gray-500">1</span>
                    <span className="text-gray-400 ml-2">// Paste code and start analysis to see...</span>
                  </div>
                  {/* Live Events */}
                  <div className="text-[9px] text-gray-400 mb-2">Live Events</div>
                  <div className="space-y-1">
                    {[
                      { icon: Zap, label: 'Reporting', color: 'yellow' },
                      { icon: Package, label: 'jsonwebtoken', color: 'gray' },
                      { icon: Package, label: 'axios', color: 'gray' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center gap-2 text-[8px] text-gray-400">
                        <event.icon className={`w-3 h-3 text-${event.color}-400`} />
                        {event.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Panel */}
                <div className="bg-slate-800/30 rounded-xl p-3 border border-emerald-500/20">
                  {/* Score Circle */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="176" strokeDashoffset="0" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-emerald-400">100</span>
                        <span className="text-[7px] text-gray-500">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-bold text-emerald-400 mb-1">
                        Grade A
                      </div>
                      <div className="text-[8px] text-gray-400">Excellent security posture</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Files Scanned', value: '5' },
                      { label: 'Lines Analyzed', value: '1' },
                      { label: 'Issues Found', value: '0', color: 'emerald' },
                      { label: 'Analysis Time', value: '3.2s' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <div className={`text-sm font-bold ${stat.color ? `text-${stat.color}-400` : 'text-white'}`}>{stat.value}</div>
                        <div className="text-[7px] text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Issues by Severity */}
                  <div className="text-[9px] text-gray-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Issues by Severity
                  </div>
                  <div className="grid grid-cols-4 gap-1 mb-3">
                    {[
                      { level: 'Critical', count: 0, color: 'red' },
                      { level: 'High', count: 0, color: 'orange' },
                      { level: 'Medium', count: 0, color: 'yellow' },
                      { level: 'Low', count: 0, color: 'blue' },
                    ].map((sev, i) => (
                      <div key={i} className="bg-slate-900/50 rounded p-1.5 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${sev.color}-500`} />
                          <span className="text-[7px] text-gray-500">{sev.level}</span>
                        </div>
                        <div className="text-sm font-bold text-gray-400">{sev.count}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vulnerable Dependencies */}
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Package className="w-3 h-3" /> Vulnerable Dependencies
                    </div>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[8px]">2</span>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700/30 flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Static Application Security Testing</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-mono">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stats Section */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center mb-40"
        >
          <div className="space-y-4">
            <div className="text-5xl font-black text-cyan-500 stat-number">
              {liveStats.vulnerabilitiesFound.toLocaleString()}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Vulnerabilities Found
            </div>
            <div className="flex justify-center">
              <Activity className="w-6 h-6 text-cyan-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-black text-white stat-number">
              {liveStats.codeScanned.toLocaleString()}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Lines Scanned
            </div>
            <div className="flex justify-center">
              <Binary className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-black text-white stat-number">
              {liveStats.threatsBlocked}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Threats Blocked
            </div>
            <div className="flex justify-center">
              <Shield className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-black text-white stat-number">
              {liveStats.scanCoverage.toFixed(1)}%
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              Scan Coverage
            </div>
            <div className="flex justify-center">
              <Target className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="space-y-24 mb-40">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6">
              Security <span className="text-cyan-500">Capabilities</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Comprehensive code security analysis with AI-powered detection and automated
              remediation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="feature-card space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Terminal className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">SAST / DAST</h3>
              <p className="text-white/50 leading-relaxed">
                Simultaneous static and dynamic analysis to catch logical vulnerabilities and
                runtime exploits.
              </p>
            </div>
            <div className="feature-card space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Cpu className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">AI-Powered Fixes</h3>
              <p className="text-white/50 leading-relaxed">
                Automatically suggests secure code replacements for detected vulnerabilities based
                on best practices.
              </p>
            </div>
            <div className="feature-card space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-cyan-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Secrets Detection</h3>
              <p className="text-white/50 leading-relaxed">
                Detect hardcoded credentials, API keys, and sensitive data before they reach
                production.
              </p>
            </div>
          </div>
        </div>

        {/* Engine Visualization Section */}
        <div ref={engineRef} className="space-y-24 mb-40">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6">
              Analysis <span className="text-cyan-500">Engine</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Real-time code security analysis with advanced threat detection and automated
              remediation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="engine-element space-y-8">
              <h3 className="text-4xl font-bold">Vulnerability Scanner</h3>
              <p className="text-white/60 leading-relaxed">
                Advanced static analysis engine that scans code for security vulnerabilities,
                injection flaws, and insecure patterns.
              </p>
              <VulnerabilityScanner />
            </div>

            <div className="engine-element space-y-8">
              <h3 className="text-4xl font-bold">Security Code Grid</h3>
              <p className="text-white/60 leading-relaxed">
                Multi-layered security analysis framework integrating SAST, DAST, IAST, SCA, and
                secrets detection.
              </p>
              <SecurityCodeGrid />
            </div>
          </div>

          <div className="engine-element text-center">
            <h3 className="text-4xl font-bold mb-8">Threat Detection Waveform</h3>
            <p className="text-white/60 leading-relaxed mb-6 sm:mb-8 md:mb-12 max-w-2xl mx-auto">
              Real-time monitoring of code security threats with continuous analysis and instant
              alerts.
            </p>
            <ThreatDetectionWaveform />
          </div>

          {/* Capability Metrics Dashboard */}
          <div className="engine-element grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-green-500 mb-2">99.7%</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">
                Detection Accuracy
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-yellow-500 mb-2">&lt;2s</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">
                Scan Speed
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <GitBranch className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-blue-500 mb-2">50+</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">
                Framework Support
              </div>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 text-center">
              <Bug className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <div className="text-3xl font-black text-red-500 mb-2">5000+</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-wider">
                Security Rules
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          ref={ctaRef}
          className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10"
        >
          <button
            onClick={() => setView('home')}
            className="cta-element px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://codesentinel.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-element px-16 py-8 bg-cyan-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center"
          >
            Deploy Sentinel <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CodeSentinelDetail;

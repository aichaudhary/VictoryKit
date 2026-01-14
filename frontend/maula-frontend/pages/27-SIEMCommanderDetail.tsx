
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Database,
  Signal,
  Layers,
  Search,
  Activity,
  Zap,
  Shield,
  Cpu,
  Network,
  AlertTriangle,
  Eye,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Wifi,
  Radar,
  Target,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cloud,
  Code,
  FileText,
  Key,
  User,
  Users,
  Building,
  MapPin,
  Calendar,
  Timer,
  Gauge,
  Thermometer,
  CloudIcon,
  CodeIcon,
  Document,
  KeyIcon,
  Person,
  Team,
  Office,
  Location,
  Time,
  Meter,
  Temp
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for SIEM Commander
const DataIngestStream = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const sources = ['AWS CloudWatch', 'Azure Sentinel', 'On-Prem Server', 'Endpoint', 'Firewall'];
    const interval = setInterval(() => {
      setStreams(prev => {
        const newStreams = [...prev];
        if (newStreams.length > 20) newStreams.shift();
        newStreams.push({
          id: Date.now(),
          source: sources[Math.floor(Math.random() * sources.length)],
          eps: Math.floor(Math.random() * 5000) + 1000,
          yPos: Math.random() * 250 + 25,
          color: ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)]
        });
        return newStreams;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.stream-node'),
      { x: 0, opacity: 0 },
      { x: 400, opacity: 1, duration: 1.5, ease: "none" }
    );
  }, [isVisible, streams]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <filter id="streamGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central data repository */}
        <rect x="350" y="50" width="30" height="200" rx="15" fill="#8b5cf6" opacity="0.4" className="animate-pulse" />
        <text x="365" y="155" textAnchor="middle" fill="white" fontSize="8" transform="rotate(90, 365, 155)">REPOSITORY</text>

        {/* Streams */}
        {streams.map((stream) => (
          <g key={stream.id} className="stream-node">
            <circle cx="0" cy={stream.yPos} r="3" fill={stream.color} filter="url(#streamGlow)" />
            <line x1="0" y1={stream.yPos} x2="-20" y2={stream.yPos} stroke={stream.color} strokeWidth="1" opacity="0.3" />
          </g>
        ))}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Ingestion Stream</h3>
        <div className="text-sm opacity-70">Petabyte-scale data ingestion</div>
      </div>
    </div>
  );
};

const CorrelationEngine = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [correlations, setCorrelations] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const threats = ['Brute Force', 'Lateral Movement', 'Data Exfiltration', 'Malicious C2', 'Privilege Escalation'];
    const interval = setInterval(() => {
      setCorrelations(prev => {
        const newCorrelations = [...prev];
        if (newCorrelations.length > 8) newCorrelations.shift();
        newCorrelations.push({
          id: Date.now(),
          threat: threats[Math.floor(Math.random() * threats.length)],
          confidence: Math.floor(Math.random() * 20) + 80,
          nodes: Math.floor(Math.random() * 50) + 10,
          status: Math.random() > 0.8 ? 'Critical' : 'High'
        });
        return newCorrelations;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.correlation-item'),
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, correlations]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Neural Correlation Engine</h3>
        <div className="space-y-3">
          {correlations.map((corr) => (
            <div key={corr.id} className="correlation-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Shield className={`w-4 h-4 ${corr.status === 'Critical' ? 'text-red-500' : 'text-purple-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block text-sm">{corr.threat}</span>
                  <span className="text-xs text-white/50">{corr.nodes} data points correlated</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{corr.confidence}%</div>
                <div className="text-[10px] text-white/40">CONFIDENCE</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>
    </div>
  );
};

const SearchPerformance = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setQueries(prev => {
        const newQueries = [...prev];
        if (newQueries.length > 5) newQueries.shift();
        newQueries.push({
          id: Date.now(),
          size: (Math.random() * 500).toFixed(1),
          time: (Math.random() * 2 + 0.5).toFixed(2),
        });
        return newQueries;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.query-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.8, ease: "elastic.out(1.2, 0.5)", transformOrigin: "bottom" }
    );
  }, [isVisible, queries]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-indigo-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-2">Ultra-Search Performance</h3>
        <p className="text-xs text-white/50 mb-4">Search across petabytes in real-time</p>
        
        <svg ref={svgRef} className="w-full h-48" viewBox="0 0 400 200">
          <line x1="30" y1="180" x2="370" y2="180" stroke="white" strokeWidth="0.5" opacity="0.2" />
          {queries.map((q, i) => (
            <g key={q.id}>
              <rect 
                x={50 + i * 65} 
                y={180 - (parseFloat(q.size) / 3)} 
                width="40" 
                height={parseFloat(q.size) / 3} 
                fill="#06b6d4" 
                opacity="0.8"
                className="query-bar"
              />
              <text x={70 + i * 65} y="195" textAnchor="middle" fill="white" fontSize="8" opacity="0.6">
                {q.time}s
              </text>
              <text x={70 + i * 65} y={170 - (parseFloat(q.size) / 3)} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                {q.size} PB
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white/70">Avg Query Speed</span>
        </div>
        <span className="text-sm font-bold text-white">1.34s / PB</span>
      </div>
    </div>
  );
};

const EPSMonitor = ({ isVisible }) => {
  const [eps, setEps] = useState(750000);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setEps(prev => prev + Math.floor(Math.random() * 20000) - 8000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden flex flex-col justify-center items-center p-8">
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">EPS Real-time Monitor</h3>
      </div>
      
      <div className="relative">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="212 71" opacity="0.2" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${(eps / 2000000) * 282} 282`} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black text-white">{eps.toLocaleString()}</div>
          <div className="text-[10px] text-white/50 tracking-widest font-bold">EVENTS / SEC</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-8 w-full">
        <div className="text-center">
          <div className="text-sm font-bold text-white">99%</div>
          <div className="text-[8px] text-white/40 uppercase">UPTIME</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">1.2M</div>
          <div className="text-[8px] text-white/40 uppercase">PEAK</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">2.1PB</div>
          <div className="text-[8px] text-white/40 uppercase">STORAGE</div>
        </div>
      </div>
    </div>
  );
};

const SecuritySchemaMapper = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const sources = ['Syslog', 'Netflow', 'EventLog', 'JSON', 'KVP'];
    const interval = setInterval(() => {
      setMappings(prev => {
        const newMappings = [...prev];
        if (newMappings.length > 10) newMappings.shift();
        newMappings.push({
          id: Date.now(),
          source: sources[Math.floor(Math.random() * sources.length)],
          target: 'OCSF Security Event',
          time: 0.1
        });
        return newMappings;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.mapping-node'),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }
    );
  }, [isVisible, mappings]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden p-6">
      <h3 className="text-lg font-bold text-white mb-4">OCSF Schema Mapping</h3>
      <div className="space-y-2">
        {mappings.map((m) => (
          <div key={m.id} className="mapping-node flex items-center gap-4 text-[10px] font-mono">
            <span className="text-indigo-400 w-16 px-2 py-1 bg-indigo-500/10 rounded">{m.source}</span>
            <ArrowRight className="w-3 h-3 text-white/20" />
            <span className="text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded">{m.target}</span>
            <span className="text-white/20 ml-auto">{m.time}ms</span>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};

const SIEMCommanderDetail = ({ setView }) => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(heroRef.current.querySelectorAll('.hero-element'),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
      );

      // Background floating elements
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 6)',
        ease: "none",
        repeat: -1,
        yoyo: true,
        stagger: 0.5
      });

      // Scroll trigger simulation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              gsap.fromTo(entry.target.querySelectorAll('.animate-on-scroll'),
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
              );
            }
          });
        },
        { threshold: 0.1 }
      );

      if (contentRef.current) {
        observer.observe(contentRef.current);
      }

      return () => observer.disconnect();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bg-element"></div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="siem-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#siem-grid)" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors uppercase tracking-widest text-xs font-black">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Ecosystem
          </button>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-500" />
            <span className="font-black text-lg">SIEM Commander</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center">
            <div className="space-y-10">
              <div className="hero-element">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 text-purple-400 text-[10px] font-black tracking-[0.4em] mb-8">
                  <Database className="w-4 h-4" />
                  PETABYTE-SCALE INGESTION ENGINE
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                  SIEM <span className="text-purple-500">COMMANDER</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed mt-10 max-w-xl">
                  Your data, weaponized. A next-generation SIEM that combines unlimited cloud-native ingestion with neural correlation rules that find threats in milliseconds.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-6 pt-4">
                <a href="https://siemcommander.maula.ai" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-110 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-3">
                  Activate Console
                  <ArrowRight className="w-5 h-5" />
                </a>
                <div className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase">
                  EPS: 1M+ READY
                </div>
              </div>
            </div>

            <div className="hero-element">
              <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://picsum.photos/seed/siem/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="SIEM Commander" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="relative z-10 px-8 py-24 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {['1M+', '500+', 'CLOUD', 'REAL'].map((val, i) => (
              <div key={i} className="animate-on-scroll">
                <div className="text-6xl font-black text-purple-500 mb-2">{val}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{['EPS Capacity','Active Rules','Native Ingest','Time Correlation'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="animate-on-scroll glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8"><Layers className="w-8 h-8" /></div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Data Normalization</h3>
              <p className="text-white/50 leading-relaxed text-lg">Automatically maps logs from over 300 different vendors into a unified security schema (OCSF) for easy searching.</p>
            </div>
            <div className="animate-on-scroll glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8"><Signal className="w-8 h-8" /></div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Neural Correlation</h3>
              <p className="text-white/50 leading-relaxed text-lg">Uses vectorized indexes to find patterns across terabytes of data that traditional SQL-based SIEMs miss completely.</p>
            </div>
            <div className="animate-on-scroll glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8"><Search className="w-8 h-8" /></div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Ultra-Search</h3>
              <p className="text-white/50 leading-relaxed text-lg">Execute complex threat hunting queries across petabytes of historical data in seconds, not hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engine Visualizations */}
      <section ref={contentRef} className="relative z-10 px-8 py-32 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black mb-8">THE COMMANDER <span className="text-purple-500">ENGINE</span></h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">Advanced data processing, neural correlation, and ultra-speed search components that power next-gen security operations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <DataIngestStream isVisible={isVisible} />
            <CorrelationEngine isVisible={isVisible} />
            <SearchPerformance isVisible={isVisible} />
            <SecuritySchemaMapper isVisible={isVisible} />
          </div>

          <div className="mt-12">
            <EPSMonitor isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-8 py-48 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl font-black mb-8 sm:mb-12 md:mb-16 tracking-tighter">WEAPONIZE YOUR <span className="text-purple-500">DATA</span></h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
              Return Home
            </button>
            <a href="https://siemcommander.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
              Access Console <Database className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SIEMCommanderDetail;

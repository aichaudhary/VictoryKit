
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Brain,
  UserSearch,
  Activity,
  AlertTriangle,
  Zap,
  ArrowRight,
  ChevronRight,
  Shield,
  Eye,
  Target,
  Users,
  UserCheck,
  UserX,
  Fingerprint,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Radar,
  Network,
  Lock,
  Search,
  Timer,
  Compass,
  Link2,
  Share2,
  Cpu,
  Monitor
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Behavior Analytics
const UserRiskProfile = ({ isVisible }) => {
  const [risk, setRisk] = useState(25);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setRisk(prev => {
        const next = prev + (Math.random() > 0.5 ? 5 : -5);
        return Math.min(Math.max(next, 10), 95);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const getColor = (r) => {
    if (r > 70) return '#ef4444';
    if (r > 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-1000" style={{ boxShadow: `0 0 40px ${getColor(risk)}40` }}>
          <UserSearch className="w-12 h-12" style={{ color: getColor(risk) }} />
        </div>
        <svg className="absolute inset-0 w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="60" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" />
          <circle cx="64" cy="64" r="60" fill="none" stroke={getColor(risk)} strokeWidth="4" strokeDasharray="377" strokeDashoffset={377 - (risk / 100) * 377} className="transition-all duration-1000" />
        </svg>
      </div>
      
      <div className="mt-8 text-center">
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{risk}</div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Dynamic Risk Score</div>
      </div>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">Entity Profiler</h3>
      </div>
    </div>
  );
};

const AnomalyHeatmap = ({ isVisible }) => {
  const [hotCells, setHotCells] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 5);
      const cells = Array.from({ length: count }, () => Math.floor(Math.random() * 48));
      setHotCells(cells);
    }, 800);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-crimson-900/20 to-red-900/20 rounded-3xl border border-red-500/20 overflow-hidden p-8">
      <div className="grid grid-cols-8 grid-rows-6 gap-2 h-full">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className={`rounded-sm transition-all duration-500 ${hotCells.includes(i) ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50' : 'bg-white/5'}`} />
        ))}
      </div>
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">Activity Baseline</h3>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-white/40 uppercase font-black">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        Anomalies Detected
      </div>
    </div>
  );
};

const RelationshipGraph = ({ isVisible }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;
    
    gsap.fromTo(svgRef.current.querySelectorAll('.node'), {
      scale: 0,
      opacity: 0
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      stagger: {
        amount: 1,
        grid: [5, 5],
        from: "center"
      },
      ease: "back.out(1.7)"
    });

    gsap.to(svgRef.current.querySelectorAll('.pulse'), {
      scale: 1.5,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: "power2.out"
    });
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" viewBox="0 0 400 300">
        <g stroke="white" strokeWidth="0.5" strokeOpacity="0.1">
          <line x1="200" y1="150" x2="100" y2="80" />
          <line x1="200" y1="150" x2="300" y2="80" />
          <line x1="200" y1="150" x2="100" y2="220" />
          <line x1="200" y1="150" x2="300" y2="220" />
        </g>
        
        {/* Central Entity */}
        <g className="node">
          <circle cx="200" cy="150" r="10" fill="#ef4444" className="pulse" />
          <circle cx="200" cy="150" r="10" fill="#ef4444" />
          <text x="200" y="175" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">JSMITH_ADMIN</text>
        </g>

        {/* Connections */}
        {[
          { x: 100, y: 80, label: 'Workstation-04' },
          { x: 300, y: 80, label: 'Prod-DB-01' },
          { x: 100, y: 220, label: 'VPN-Austin' },
          { x: 300, y: 220, label: 'S3-Bucket-Exfil' }
        ].map((node, i) => (
          <g key={i} className="node">
            <circle cx={node.x} cy={node.y} r="6" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
            <text x={node.x} y={node.y + 20} textAnchor="middle" fill="white" fontSize="6" opacity="0.4">{node.label}</text>
          </g>
        ))}
      </svg>
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">Entity Blast Radius</h3>
      </div>
    </div>
  );
};

const BaselineDrift = ({ isVisible }) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev];
        if (next.length > 20) next.shift();
        next.push({ id: Date.now(), val: Math.random() * 50 + 25 });
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/10 to-transparent rounded-3xl border border-white/5 overflow-hidden flex flex-col p-8">
      <div className="text-white mb-8">
        <h3 className="text-lg font-bold">Baseline Deviation</h3>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Real-time Entropy Analysis</p>
      </div>
      
      <div className="flex-1 flex items-end gap-1">
        {points.map((p, i) => (
          <div key={p.id} className="flex-1 bg-red-500/40 rounded-t-sm transition-all duration-500" style={{ height: `${p.val}%` }} />
        ))}
      </div>
      
      <div className="h-[1px] bg-white/20 w-full mt-4" />
      <div className="flex justify-between text-[8px] text-white/20 mt-4 font-mono">
        <span>T-60M</span>
        <span>BASELINE_STABLE</span>
        <span>CURRENT</span>
      </div>
    </div>
  );
};

const BehaviorAnalyticsDetail = ({ setView }) => {
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-100, 100)',
        x: 'random(-100, 100)',
        duration: 'random(5, 10)',
        repeat: -1,
        yoyo: true,
        ease: "none"
      });

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          gsap.to(entry.target.querySelectorAll('.animate-on-scroll'), {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out"
          });
        }
      }, { threshold: 0.1 });

      if (contentRef.current) observer.observe(contentRef.current);
      return () => observer.disconnect();
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] bg-element" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <DataStream color="#ef4444" />
        <HexGrid color="#ef4444" />
        <DataStream color="#ef4444" />
        <HexGrid color="#ef4444" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 p-8 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-all">
          <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
          System Grid
        </button>
        <div className="flex gap-4 items-center">
          <div className="px-4 py-1.5 rounded-full border border-red-500/50 bg-red-500/10 text-[10px] font-black text-red-400 uppercase tracking-widest">
            UEBA Live
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-red-500/20 mb-6 sm:mb-8 md:mb-12">
          <Brain className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">Neural Behavior Intelligence</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16 italic">
          BEHAVIOR<br /><span className="text-red-600">ANALYTICS</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Advanced user and entity behavior analytics (UEBA) detecting insider threats, compromised accounts, and anomalous activity patterns before they become breaches.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://behavioranalytics.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-red-600 text-white rounded-2xl font-black text-xs tracking-[0.4em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-red-600/40">
            Start Tracking
          </a>
          <button className="px-12 py-6 glass rounded-2xl font-black text-xs tracking-[0.4em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/5 transition-colors">
            View Alerts <Activity className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 bg-white/5 backdrop-blur-3xl border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Models Active', val: '50+' },
            { label: 'Latency', val: '<1HR' },
            { label: 'Accuracy', val: '98%' },
            { label: 'Baseline Data', val: '2.5PB' }
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <div className="text-6xl text-white group-hover:text-red-500 transition-colors uppercase">{s.val}</div>
              <div className="text-[8px] tracking-[0.4em] text-white/20 mt-2 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <UserRiskProfile isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AnomalyHeatmap isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RelationshipGraph isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <BaselineDrift isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {[
            { title: 'Insider Threat', icon: UserX, desc: 'Detect data exfiltration attempts and unusual access patterns from internal users.', color: 'red' },
            { title: 'Adaptive Baseline', icon: Target, desc: 'Continuously learns normal behavior patterns for every user and entity to detect deviations.', color: 'orange' },
            { title: 'Dynamic Risk', icon: AlertTriangle, desc: 'Assign dynamic risk scores to users and entities based on cumulative behavior analysis.', color: 'crimson' }
          ].map((f, i) => (
            <div key={i} className="group relative border-l border-white/10 pl-10 hover:border-red-500 transition-colors">
              <div className="mb-8 w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black italic uppercase mb-6 tracking-tight">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-lg font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="relative z-10 px-4 sm:px-6 md:px-8 py-32 sm:px-40 md:py-60 border-t border-white/5 flex flex-col items-center text-center">
        <h2 className="text-[8rem] md:text-[12rem] font-black italic tracking-tighter leading-none uppercase mb-10 sm:mb-16 md:mb-20">
          FIND THE<br /><span className="text-red-600">UNKNOWN</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center pt-20">
           <button onClick={() => setView('home')} className="px-20 py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
             Return Home
           </button>
           <a href="https://behavioranalytics.maula.ai" target="_blank" rel="noopener noreferrer" className="px-20 py-10 bg-red-600 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
             Analyze Now <ArrowRight className="w-6 h-6" />
           </a>
        </div>
      </footer>
    </div>
  );
};

export default BehaviorAnalyticsDetail;

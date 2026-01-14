
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Package,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Activity,
  Zap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Layers,
  Database,
  Server,
  Cpu,
  Workflow,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Radar,
  Box,
  Binary,
  GitBranch,
  ArrowUpCircle
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Container Scan
const LayerScannerVisual = ({ isVisible }) => {
  const [activeLayer, setActiveLayer] = useState(0);
  const layers = ['Base OS: Alpine', 'Library: OpenSSL', 'Code: App.js', 'Config: .env'];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveLayer(prev => (prev + 1) % layers.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible, layers.length]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-black rounded-3xl border border-blue-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="space-y-4 w-full max-w-xs relative">
        {layers.map((l, i) => (
          <div key={i} className={`relative h-12 border rounded-xl flex items-center px-4 transition-all duration-500 ${activeLayer === i ? 'bg-blue-500/20 border-blue-400 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10 opacity-30'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{l}</span>
            {activeLayer === i && <div className="ml-auto"><Search className="w-4 h-4 text-blue-400 animate-pulse" /></div>}
          </div>
        ))}
        {/* Scanning Line */}
        <div className="absolute inset-x-[-20px] top-0 h-1 bg-blue-400/50 blur-sm animate-scan pointer-events-none" />
      </div>
      <div className="absolute top-4 left-4">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white">Deep Layer Audit</h3>
      </div>
    </div>
  );
};

const SBOMTreeVisual = ({ isVisible }) => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const deps = ['lodash@4.17.21', 'express@4.18.2', 'react@18.2.0', 'openssl@1.1.1', 'curl@7.88.1'];
    const interval = setInterval(() => {
      setPackages(prev => {
        const next = [...prev];
        if (next.length > 5) next.shift();
        next.push({ id: Date.now(), name: deps[Math.floor(Math.random() * deps.length)] });
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-blue-500/20 overflow-hidden p-8 font-mono">
      <div className="text-blue-500/50 text-[10px] mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
        <Binary className="w-4 h-4" />
        SBOM_GENERATOR.LOG
      </div>
      <div className="space-y-3">
        {packages.map(p => (
           <div key={p.id} className="text-[10px] text-white/40 animate-in slide-in-from-left duration-500 flex items-center gap-3">
             <div className="w-1 h-3 bg-blue-500/30" />
             <span className="text-white/80">{p.name}</span>
             <span className="ml-auto text-blue-500/20 italic">Vulnerability: 0</span>
           </div>
        ))}
      </div>
      <div className="absolute bottom-4 right-4 text-[8px] text-blue-500/20 uppercase font-black">Supply Chain Verified</div>
    </div>
  );
};

const CVEHeatmap = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#050a1a] to-black rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex flex-col justify-center items-center">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className={`w-12 h-12 rounded-lg border border-white/5 transition-all duration-1000 ${
            isVisible ? (i % 5 === 0 ? 'bg-red-500/20 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-blue-500/5') : 'bg-transparent'
          }`} />
        ))}
      </div>
      <div className="mt-8 flex gap-6 text-[10px] font-black uppercase italic tracking-widest">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /> CRITICAL</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full" /> SECURE</div>
      </div>
      <div className="absolute top-4 right-4">
        <Radar className="w-6 h-6 text-blue-500/20 animate-pulse" />
      </div>
    </div>
  );
};

const PipelineGateVisual = ({ isVisible }) => {
  const [status, setStatus] = useState('Checking');

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setStatus(prev => prev === 'Checking' ? (Math.random() > 0.3 ? 'Passed' : 'Failed') : 'Checking');
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="flex items-center gap-8 mb-6 sm:mb-8 md:mb-12">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10"><GitBranch className="w-8 h-8 text-white/40" /></div>
        <div className="h-[2px] w-24 bg-gradient-to-r from-blue-500 to-transparent relative overflow-hidden">
           <div className="absolute inset-0 bg-blue-400 animate-shimmer" />
        </div>
        <div className={`p-8 rounded-full border-2 transition-all duration-700 ${
          status === 'Passed' ? 'border-blue-500 bg-blue-500/10 scale-110' : 
          status === 'Failed' ? 'border-red-500 bg-red-500/10 scale-110' : 
          'border-white/10 bg-white/5 scale-100'
        }`}>
          {status === 'Passed' ? <ShieldCheck className="w-12 h-12 text-blue-500" /> : 
           status === 'Failed' ? <ShieldAlert className="w-12 h-12 text-red-500" /> : 
           <RefreshCw className="w-12 h-12 text-white/20 animate-spin" />}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">CI/CD Gate Status</div>
        <div className={`text-2xl sm:text-3xl md:text-4xl font-black italic uppercase ${
          status === 'Passed' ? 'text-blue-500' : 
          status === 'Failed' ? 'text-red-500' : 
          'text-white/40'
        }`}>
          {status}
        </div>
      </div>
    </div>
  );
};

const ContainerScanDetail = ({ setView }) => {
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-80, 80)',
        rotation: 'random(-15, 15)',
        duration: 'random(6, 12)',
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          gsap.to(entry.target.querySelectorAll('.animate-on-scroll'), {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "expo.out"
          });
        }
      }, { threshold: 0.1 });

      if (contentRef.current) observer.observe(contentRef.current);
      return () => observer.disconnect();
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#020508] text-white relative overflow-hidden font-sans italic selection:bg-blue-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <PulseRings color="#3b82f6" />
        <DataStream color="#3b82f6" />
        <PulseRings color="#3b82f6" />
        <DataStream color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-blue-500/20 px-4 py-1.5 rounded-full bg-blue-500/5">
          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Scanner Engine v5.0</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-blue-500/20 mb-6 sm:mb-8 md:mb-12">
          <Package className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Advanced Container Security</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          CONTAINER<br /><span className="text-blue-500">SCAN</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Zero-trust container image scanning. Analyze layers, generate complete SBOMs, and block vulnerable code before it ever reaches production.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://containerscan.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-blue-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-500/40">
            Scan Registry
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Vulnerability DB <Database className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Scan Speed', val: '<20s' },
            { label: 'CVE Database', val: '200K+' },
            { label: 'Registry Sync', val: 'AUTO' },
            { label: 'Layer Depth', val: 'FULL' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-blue-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <LayerScannerVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SBOMTreeVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <CVEHeatmap isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PipelineGateVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'SBOM Generator', icon: Binary, desc: 'Automatically generate detailed Software Bill of Materials (SBOM) for complete supply chain transparency.' },
            { title: 'Shift Left', icon: Workflow, desc: 'Integrate security scans directly into CI/CD pipelines. Block deployments based on custom severity policy gates.' },
            { title: 'Deep Layer Audit', icon: Layers, desc: 'Go beyond the manifest. Scan every hidden layer of your container images for malware and secret keys.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-10 group-hover:scale-110 transition-transform">
                <f.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-8 italic tracking-tighter leading-none border-b border-white/5 pb-6">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-xl font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="relative z-10 px-4 sm:px-6 md:px-8 py-32 sm:px-40 md:py-60 border-t border-white/5 flex flex-col items-center text-center">
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-none uppercase mb-10 sm:mb-16 md:mb-20 italic">
          SECURE YOUR<br /><span className="text-blue-500">PIPELINE</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://containerscan.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-blue-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Start Scanning <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ContainerScanDetail;

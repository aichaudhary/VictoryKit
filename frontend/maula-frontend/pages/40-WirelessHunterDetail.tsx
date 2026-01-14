
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Wifi,
  Signal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Network,
  Maximize,
  Layout,
  FileCode,
  CheckCircle,
  XCircle,
  Radio,
  Radar,
  Crosshair,
  Map,
  Compass,
  Cpu,
  Terminal
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Wireless Hunter
const SpectralAnalysisVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-amber-500/20 overflow-hidden p-8 flex flex-col justify-end">
      <div className="flex items-end justify-between h-64 gap-1">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="flex-1 bg-amber-500/20 relative group">
             <div className={`absolute bottom-0 inset-x-0 bg-amber-500 transition-all duration-700 ${isVisible ? 'h-[' + (Math.random() * 80 + 20) + '%]' : 'h-0'}`} 
                  style={{ transitionDelay: `${i * 0.05}s` }} />
             {i === 15 && <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-red-500 animate-pulse whitespace-nowrap">ROGUE_PEAK</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-500/40 border-t border-white/5 pt-4">
         <span>2.4 GHz</span>
         <span className="text-white/20 italic">Spectrum Waterfall</span>
         <span>5.8 GHz</span>
      </div>
      <Radio className="absolute top-4 right-4 w-6 h-6 text-amber-500/10" />
    </div>
  );
};

const EvilTwinRadarVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#1a1205] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
         <div className="absolute inset-0 border border-amber-500/20 rounded-full" />
         <div className="absolute inset-10 border border-amber-500/10 rounded-full" />
         <div className="absolute inset-20 border border-amber-500/5 rounded-full" />
         <div className="absolute inset-0 border-r-2 border-amber-500/40 rounded-full animate-spin-slow" />
         
         {/* APs */}
         <div className="absolute top-1/4 left-1/4 group cursor-help">
            <Wifi className="w-6 h-6 text-emerald-500 animate-pulse" />
            <div className="absolute top-full mt-2 text-[8px] bg-black/80 p-1 opacity-0 group-hover:opacity-100 uppercase font-black text-emerald-400">CORP_SECURE</div>
         </div>
         <div className="absolute top-1/2 right-1/4 group cursor-help">
            <Wifi className="w-6 h-6 text-red-500 animate-bounce" />
            <div className="absolute top-full mt-2 text-[8px] bg-black/80 p-1 opacity-0 group-hover:opacity-100 uppercase font-black text-red-400">CORP_SECURE (CLONE)</div>
         </div>
      </div>
      <div className="mt-8 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">SSID Comparison Engine</div>
         <div className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase text-red-500 animate-pulse">EVIL_TWIN_DETECTED</div>
      </div>
      <Radar className="absolute bottom-4 right-4 w-12 h-12 text-white/5" />
    </div>
  );
};

const RfFingerprintVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-slate-950/40 rounded-3xl border border-amber-500/20 overflow-hidden p-8 flex flex-col items-center justify-center font-mono">
       <div className="w-full h-32 relative mb-6 sm:mb-8 md:mb-12">
          <div className="absolute inset-0 flex items-center">
             <div className="w-full h-[1px] bg-amber-500/20" />
          </div>
          <div className="absolute inset-0 overflow-hidden">
             <div className="w-full h-full flex items-center">
                <div className="w-[1000px] h-20 border-y border-amber-500/40 animate-oscilloscope opacity-30" />
             </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 bg-black/80 px-4 py-2 border border-amber-500 shadow-[0_0_20px_#f59e0b20]">FINGERPRINT_MATCH: 98.4%</div>
          </div>
       </div>
       <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-2">
             <span className="text-[8px] font-black uppercase text-white/20">Modulation Delta</span>
             <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-amber-500 w-3/4" /></div>
          </div>
          <div className="flex flex-col gap-2">
             <span className="text-[8px] font-black uppercase text-white/20">Jitter Variance</span>
             <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-amber-500 w-1/4" /></div>
          </div>
       </div>
       <div className="absolute top-4 left-4 text-[10px] text-white/10 uppercase">Signature Analysis Mode</div>
    </div>
  );
};

const TriangulationMapVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-full h-full max-w-sm opacity-20">
         <div className="absolute inset-0 border border-white/10 grid grid-cols-6 grid-rows-6">
            {[...Array(36)].map((_, i) => <div key={i} className="border border-white/5" />)}
         </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="relative w-full h-full max-w-sm flex items-center justify-center">
            {/* APs */}
            <div className="absolute top-10 left-10 p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg">
               <Radio className="w-4 h-4 text-amber-500" />
            </div>
            <div className="absolute bottom-10 left-20 p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg">
               <Radio className="w-4 h-4 text-amber-500" />
            </div>
            <div className="absolute top-20 right-10 p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg">
               <Radio className="w-4 h-4 text-amber-500" />
            </div>
            
            {/* Rogue */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
               <div className="w-32 h-32 rounded-full border border-red-500/20 animate-ping absolute -top-12 -left-12" />
               <Crosshair className="w-8 h-8 text-red-500 animate-pulse" />
               <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[8px] font-black bg-red-500 px-2 py-1 text-black whitespace-nowrap">ROOM_304_ROGUE</div>
            </div>
         </div>
      </div>
      <Compass className="absolute top-4 left-4 w-6 h-6 text-white/10" />
    </div>
  );
};

const WirelessHunterDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#050302] text-white relative overflow-hidden font-sans italic selection:bg-amber-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-amber-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <ParticleNetwork color="#10b981" />
        <DataStream color="#10b981" />
        <ParticleNetwork color="#10b981" />
        <DataStream color="#10b981" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-amber-500/20 px-4 py-1.5 rounded-full bg-amber-500/5">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-400">Spectrum Guard Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-amber-500/20 mb-6 sm:mb-8 md:mb-12">
          <Wifi className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-400">Rogue RF Intelligence</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          WIRELESS<br /><span className="text-amber-500">HUNTER</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Hunt hidden threats in the airwaves. Detect Evil Twins, identify rogue RF signatures, and triangulate unauthorized emitters with centimeter-grade accuracy.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://wirelesshunter.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-amber-500/40">
            Start Hunt
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            RF Topology <Compass className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Rogue Detect', val: '0.2ms' },
            { label: 'Map Accuracy', val: '5cm' },
            { label: 'Containment', val: 'AUTO' },
            { label: 'Spectrum', val: 'ALL' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-amber-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SpectralAnalysisVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <EvilTwinRadarVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RfFingerprintVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <TriangulationMapVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Spectral Analysis', icon: Radio, desc: 'Full spectrum waterfall analysis to identify non-802.11 interference and hidden surveillance devices.' },
            { title: 'Evil Twin Deflection', icon: ShieldAlert, desc: 'Real-time SSID cloning identification that triggers automatic deauthentication of malicious rogue APs.' },
            { title: 'RF Fingerprinting', icon: Cpu, desc: 'Go beyond MAC addresses. Identify individual radio transmitters by their unique physical frequency signatures.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-10 group-hover:scale-110 transition-transform">
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
          CLEAR THE<br /><span className="text-amber-500">AIRWAVES</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://wirelesshunter.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Initialize Hunt <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default WirelessHunterDetail;

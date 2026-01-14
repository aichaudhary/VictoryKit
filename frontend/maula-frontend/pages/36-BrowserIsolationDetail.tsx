import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Monitor,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cloud,
  Cpu,
  Zap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Lock,
  Eye,
  EyeOff,
  MousePointer2,
  Maximize,
  Layout,
  FileCode,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Browser Isolation
const PixelStreamVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-black rounded-3xl border border-indigo-500/20 overflow-hidden flex items-center justify-center p-8">
      <div className="flex items-center gap-12">
        <div className="relative group">
           <Cloud className="w-16 h-16 text-indigo-400 animate-pulse" />
           <div className="absolute -top-2 -left-2 text-[8px] font-black uppercase text-indigo-400/40">Remote Node</div>
        </div>
        <div className="h-[2px] w-32 bg-indigo-500/20 relative">
           <div className="absolute inset-0 bg-indigo-400 animate-pixel-stream shadow-[0_0_10px_#818cf8]" />
        </div>
        <div className="relative group">
           <Monitor className="w-20 h-20 text-white" />
           <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
           </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white">Safe Pixel Streaming</h3>
      </div>
      <div className="absolute top-4 right-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400/40 flex items-center gap-2">
           <Activity className="w-3 h-3" /> LATENCY: 24ms
        </div>
      </div>
    </div>
  );
};

const ContentStripperVisual = ({ isVisible }) => {
  const [items, setItems] = useState(['JS', 'HTML', 'CSS', 'COOKIE']);

  useEffect(() => {
    if (!isVisible) return;
    const codes = ['eval()', '<script>', 'xss_payload', 'track.js'];
    const interval = setInterval(() => {
       setItems(prev => {
         const next = [...prev];
         if (next.length > 5) next.shift();
         next.push(codes[Math.floor(Math.random() * codes.length)]);
         return next;
       });
    }, 1200);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-indigo-500/20 overflow-hidden p-8 font-mono flex">
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {items.map((item, i) => (
          <div key={i} className="text-[10px] text-red-500/50 animate-in slide-in-from-left duration-500 flex items-center gap-2">
            <XCircle className="w-3 h-3" /> {item}
          </div>
        ))}
      </div>
      <div className="w-[1px] bg-white/10 mx-8 relative">
         <div className="absolute top-0 bottom-0 left-[-4px] w-2 bg-indigo-500/10 blur-md" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
         <div className="text-[10px] text-indigo-400 flex items-center gap-2 animate-pulse">
            <CheckCircle className="w-4 h-4" /> RENDER_STRIPPED
         </div>
      </div>
      <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest text-white/20">Dom-Filtering Engine</div>
    </div>
  );
};

const IsolationVaultVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0a051a] to-black rounded-3xl border border-indigo-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-64 h-40 glass rounded-2xl border border-white/10 flex flex-col shadow-2xl">
         <div className="h-6 border-b border-white/5 bg-white/5 flex items-center px-3 gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
         </div>
         <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            <Globe className="w-12 h-12 text-white/5" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-full border-[10px] border-indigo-500/20 animate-pulse" />
            </div>
         </div>
      </div>
      <div className="mt-8 flex gap-4">
        <div className="px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest text-indigo-400">Isolated</div>
        <div className="px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-400">Hardened</div>
      </div>
      <Shield className="absolute bottom-4 right-4 w-12 h-12 text-white/5" />
    </div>
  );
};

const DisposableSessionVisual = ({ isVisible }) => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
       setActive(false);
       setTimeout(() => setActive(true), 1500);
    }, 4500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className={`transition-all duration-700 p-10 rounded-full border-2 flex items-center justify-center ${active ? 'bg-indigo-500/10 border-indigo-500 scale-100 shadow-[0_0_30px_#818cf810]' : 'bg-red-500/10 border-red-500 scale-90 rotate-12 blur-sm'}`}>
         {active ? <Layers className="w-16 h-16 text-indigo-400" /> : <Trash2 className="w-16 h-16 text-red-500" />}
      </div>
      <div className="mt-10 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Session Integrity</div>
         <div className={`text-2xl sm:text-3xl md:text-4xl font-black italic uppercase transition-colors ${active ? 'text-indigo-400' : 'text-red-500'}`}>
           {active ? 'ACTIVE' : 'DESTROYED'}
         </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[8px] font-black uppercase text-white/10 tracking-[0.5em]">
         Ephemeral Container Instance
      </div>
    </div>
  );
};

const BrowserIsolationDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020308] text-white relative overflow-hidden font-sans italic selection:bg-indigo-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <ParticleNetwork color="#3b82f6" />
        <DataStream color="#3b82f6" />
        <ParticleNetwork color="#3b82f6" />
        <DataStream color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-indigo-500/20 px-4 py-1.5 rounded-full bg-indigo-500/5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Isolation Layer Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-indigo-500/20 mb-6 sm:mb-8 md:mb-12">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Zero-Trust Web Access</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          BROWSER<br /><span className="text-indigo-500">ISOLATION</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Render risky websites in remote cloud containers. Stream safe visuals to your users. Eliminate 100% of browser-borne attacks.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://browserisolation.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-indigo-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/40">
            Isolate Session
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Node Topology <Globe className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Attack Protection', val: '100%' },
            { label: 'Latency', val: '<30ms' },
            { label: 'Cloud Render', val: 'GPU' },
            { label: 'Persistence', val: 'NONE' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-indigo-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PixelStreamVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ContentStripperVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <IsolationVaultVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DisposableSessionVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Pixel Streaming', icon: MousePointer2, desc: 'Users interact with an interactive image stream while the original website is rendered and contained in a secure remote node.' },
            { title: 'Disposable Node', icon: Trash2, desc: 'Every browsing session creates a unique, ephemeral container that is completely destroyed after use, leaving no trace for persistence.' },
            { title: 'DOM Stripping', icon: Layers, desc: 'Sanitize risky JS, CSS, and HTML elements before they reach the renderer for ultimate client-side protection.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-10 group-hover:scale-110 transition-transform">
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
          CONTAIN THE<br /><span className="text-indigo-500">RISK</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://browserisolation.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-indigo-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Browsing <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default BrowserIsolationDetail;


import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Eye,
  FileText,
  FileSearch,
  Layout,
  FileCode,
  CheckCircle,
  XCircle,
  Cloud,
  Mail,
  HardDrive,
  Usb,
  Share2,
  Cpu,
  Monitor
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for DLP Advanced
const SensitiveDataScanner = ({ isVisible }) => {
  const [items, setItems] = useState([
    { label: 'NAME', val: 'JOHN DOE', sensitive: false },
    { label: 'SSN', val: 'XXX-XX-1234', sensitive: true },
    { label: 'CREDIT_CARD', val: '4111-XXXX-XXXX', sensitive: true },
    { label: 'EMAIL', val: 'john@example.com', sensitive: false }
  ]);

  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex flex-col justify-center">
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] animate-scanner-move" />
      <div className="space-y-6 max-w-lg mx-auto w-full">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{item.label}</span>
               <span className={`text-xs font-mono transition-all duration-1000 ${item.sensitive && isVisible ? 'blur-sm bg-red-500/10 text-red-400' : 'text-blue-400'}`}>
                 {item.val}
               </span>
            </div>
            {item.sensitive && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-blue-500/20">Regex / ML Inspection Engine</div>
    </div>
  );
};

const ExfiltrationBlockerVisual = ({ isVisible }) => {
  const channels = [
    { icon: Usb, label: 'USB' },
    { icon: Mail, label: 'EMAIL' },
    { icon: Cloud, label: 'CLOUD' },
    { icon: Share2, label: 'BT/SEND' }
  ];
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#050a1a] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-full flex justify-around items-center h-40">
         <div className="p-6 rounded-3xl bg-blue-500 shadow-[0_0_40px_#3b82f620] relative group">
            <FileText className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full border-2 border-black">
               <Lock className="w-3 h-3 text-white" />
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            {channels.map((c, i) => (
              <div key={i} className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-40 hover:opacity-100 transition-all">
                 <c.icon className="w-5 h-5 text-red-500" />
                 <XCircle className="absolute -top-1 -right-1 w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{c.label}</span>
              </div>
            ))}
         </div>
         <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </div>
      <div className="mt-8 text-center animate-pulse">
         <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Policy Enforcement</div>
         <div className="text-3xl font-black italic uppercase text-red-500 tracking-tighter">DATA_EGRESS_BLOCKED</div>
      </div>
    </div>
  );
};

const MlClassificationVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
         <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="w-16 h-16 text-blue-500/20 animate-pulse" />
         </div>
         {[...Array(8)].map((_, i) => (
           <div key={i} className="absolute inset-0 animate-spin-slow" style={{ animationDuration: `${i + 4}s` }}>
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" style={{ marginLeft: `${i * 10}%` }} />
           </div>
         ))}
      </div>
      <div className="mt-6 flex gap-6">
         <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase text-blue-400">Financial</div>
         <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase text-blue-400">PHI</div>
         <div className="px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase text-blue-400">Confidential</div>
      </div>
      <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-white/10 tracking-widest">Autonomous Classification Matrix</div>
    </div>
  );
};

const EndpointMonitorVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="flex gap-8 relative h-32 items-center">
         {[1, 2, 3].map((i) => (
           <div key={i} className={`p-6 rounded-2xl border transition-all duration-1000 ${i === 2 && isVisible ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_#ef444420] animate-bounce' : 'bg-white/5 border-white/10'}`}>
              <Monitor className={`w-8 h-8 ${i === 2 && isVisible ? 'text-red-500' : 'text-white/20'}`} />
           </div>
         ))}
      </div>
      <div className="mt-12 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Global Endpoint Guard</div>
         <div className={`text-2xl sm:text-3xl md:text-4xl font-black italic uppercase transition-colors duration-1000 ${isVisible ? 'text-red-500' : 'text-white/20'}`}>
            {isVisible ? 'LEAK_DETECTED: WORKSTATION_04' : 'STATUS: NORMAL'}
         </div>
      </div>
      <Activity className="absolute bottom-4 right-4 w-6 h-6 text-white/5" />
    </div>
  );
};

const DLPAdvancedDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020308] text-white relative overflow-hidden font-sans italic selection:bg-blue-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <HexGrid color="#3b82f6" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#3b82f6" />
        <HexGrid color="#3b82f6" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-blue-500/20 px-4 py-1.5 rounded-full bg-blue-500/5">
          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">DLP Enforcement Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-blue-500/20 mb-6 sm:mb-8 md:mb-12">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Content-Aware Protection</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          DLP<br /><span className="text-blue-500">ADVANCED</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Stop leaks before they happen. ML-driven data discovery, real-time exfiltration blocking, and cross-channel policy enforcement for the modern enterprise.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://dlpadvanced.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-blue-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-500/40">
            Secure Data
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Classification Matrix <Layers className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Data Protected', val: '4.2PB' },
            { label: 'Classification', val: 'ML 2.0' },
            { label: 'Leak Prevention', val: '100%' },
            { label: 'Inspection Time', val: '<24ms' }
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
            <SensitiveDataScanner isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ExfiltrationBlockerVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <MlClassificationVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <EndpointMonitorVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'ML Classification', icon: Cpu, desc: 'Advanced natural language processing to automatically categorize and label sensitive data with 99.9% accuracy.' },
            { title: 'Multi-Channel Watch', icon: Share2, desc: 'Protect data across all egress points: Email, Web, USB, Cloud Storage, and even Clipboard operations.' },
            { title: 'Insider Threat Det.', icon: Eye, desc: 'Behavioral analytics to identify risky data handling patterns and potential insider exfiltration attempts.' }
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
          LOCK DOWN THE<br /><span className="text-blue-500">DATA</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://dlpadvanced.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-blue-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Enterprise <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DLPAdvancedDetail;


import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Network,
  Lock,
  Globe,
  Activity,
  Zap,
  ArrowRight,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  Layers,
  Search,
  Maximize,
  Layout,
  FileCode,
  CheckCircle,
  Database,
  Eye,
  Settings,
  XCircle,
  Hash,
  Share2,
  Server,
  CloudYail
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for VPN Analyzer
const TunnelEncryptionVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-indigo-500/20 overflow-hidden p-8 flex items-center justify-center">
      <div className="flex items-center gap-12 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-2 group">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group-hover:border-indigo-400 transition-all">
             <Terminal className="w-10 h-10 text-white/40" />
          </div>
          <span className="text-[8px] font-black uppercase text-white/20">Client Data</span>
        </div>
        <div className="flex-1 h-32 relative group">
           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 bg-indigo-500/5 border-y border-indigo-500/20 rounded-full" />
           <div className="absolute inset-0 flex items-center justify-around">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-1 items-center animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                   <div className="text-[10px] text-indigo-400 font-mono italic">0x{i}F</div>
                   <Lock className="w-3 h-3 text-indigo-400/40" />
                </div>
              ))}
           </div>
           <div className="absolute top-0 left-0 right-0 text-center -top-6">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-indigo-400">AES-256-GCM Tunnel</span>
           </div>
        </div>
        <div className="flex flex-col items-center gap-2 group">
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 group-hover:shadow-[0_0_30px_#6366f120] transition-all">
             <Server className="w-10 h-10 text-indigo-400" />
          </div>
          <span className="text-[8px] font-black uppercase text-indigo-400">Protected Node</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 text-[10px] font-black uppercase tracking-widest text-white/20 italic">Deep Packet Inspection In-Transit</div>
    </div>
  );
};

const SplitTunnelMonitorVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0a0c1a] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="flex w-full justify-between items-center px-12 relative">
        <div className="absolute inset-0 border-t border-dashed border-white/10 top-1/2" />
        <div className="z-10 p-6 rounded-3xl bg-slate-900 border border-white/10">
           <Layout className="w-12 h-12 text-white" />
        </div>
        <div className="z-10 flex flex-col gap-12">
           <div className="flex items-center gap-4 group">
              <div className="w-24 h-1 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-pulse" />
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Secure Path</div>
           </div>
           <div className="flex items-center gap-4 group">
              <div className="w-24 h-1 bg-red-500/20" />
              <ShieldAlert className="w-6 h-6 text-red-500/40" />
              <div className="text-[8px] font-black uppercase tracking-widest text-red-500/20">Direct (Leak)</div>
           </div>
        </div>
      </div>
      <div className="mt-12 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Policy Enforcement</div>
         <div className="text-3xl font-black italic uppercase text-indigo-400">LEAK_PREVENTION_ENABLED</div>
      </div>
    </div>
  );
};

const HandshakeSequenceVisual = ({ isVisible }) => {
  const [step, setStep] = useState(0);
  const steps = ['KEY_EXCHANGE', 'DH_CALC', 'AUTH_CHECK', 'ESTABLISHED'];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
       setStep(s => (s + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-indigo-500/20 overflow-hidden p-8 font-mono">
       <div className="flex flex-col gap-6">
          {steps.map((s, i) => (
            <div key={s} className={`flex items-center gap-4 transition-all duration-500 ${i <= step ? 'opacity-100 translate-x-0' : 'opacity-20 translate-x-8'}`}>
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${i === step ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_15px_#6366f1]' : 'border-white/10'}`}>
                  {i < step ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-[10px] font-black text-white">{i + 1}</span>}
               </div>
               <div className="flex flex-col">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${i === step ? 'text-indigo-400' : 'text-white/40'}`}>{s}</span>
                  {i === step && <div className="text-[8px] text-white/20 animate-pulse">PROTOTYPE_IKEv2_INIT..</div>}
               </div>
            </div>
          ))}
       </div>
       <Zap className="absolute bottom-8 right-8 w-16 h-16 text-indigo-500/10 animate-pulse" />
    </div>
  );
};

const LatencyMonitorVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="w-full h-40 flex items-end justify-center gap-4">
         {[40, 70, 45, 90, 65, 80, 50, 60, 40].map((h, i) => (
           <div key={i} className="w-6 bg-indigo-500/20 border-t border-indigo-400/40 rounded-t-lg transition-all duration-1000" style={{ height: isVisible ? `${h}%` : '10%' }} />
         ))}
      </div>
      <div className="mt-8 flex gap-12">
         <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black italic text-white uppercase leading-none">24ms</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mt-2">AVG Latency</div>
         </div>
         <div className="flex flex-col items-center border-l border-white/10 pl-12">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black italic text-white uppercase leading-none">0.0%</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mt-2">Packet Loss</div>
         </div>
      </div>
      <Activity className="absolute top-4 right-4 w-6 h-6 text-white/10 animate-pulse" />
    </div>
  );
};

const VPNAnalyzerDetail = ({ setView }) => {
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
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#6366f1] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Tunnel Monitoring Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-indigo-500/20 mb-6 sm:mb-8 md:mb-12">
          <Network className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Encrypted Path Analysis</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          VPN<br /><span className="text-indigo-500">ANALYZER</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Audit tunnels with forensic precision. Detect splits, analyze handshakes, and measure true end-to-end performance of your encrypted perimeter.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://vpnanalyzer.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-indigo-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/40">
            Probe Tunnel
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Node Registry <Globe className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Tunnel Health', val: '100%' },
            { label: 'Avg Overhead', val: '<4%' },
            { label: 'Protocols', val: 'IKE/WG' },
            { label: 'Security Score', val: 'A+' }
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
            <TunnelEncryptionVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SplitTunnelMonitorVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <HandshakeSequenceVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <LatencyMonitorVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'DPI for Tunnels', icon: Search, desc: 'Inspect encrypted packet headers and metadata to identify protocol misuse and non-compliant traffic patterns.' },
            { title: 'Split-Tunnel Watch', icon: Share2, desc: 'Automatically detect and block unauthorized local internet breakouts that bypass your corporate security stack.' },
            { title: 'IKE/WG Handshake', icon: Zap, desc: 'Real-time monitoring of key exchange sequences to ensure cryptographic integrity and prevent downgrade attacks.' }
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
          AUDIT YOUR<br /><span className="text-indigo-500">TUNNELS</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://vpnanalyzer.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-indigo-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Initialize Probe <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default VPNAnalyzerDetail;

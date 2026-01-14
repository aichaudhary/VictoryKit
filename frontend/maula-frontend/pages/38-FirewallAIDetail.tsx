
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Network,
  Server,
  Cloud,
  Terminal,
  Search,
  Settings,
  XCircle,
  Eye,
  Maximize,
  Layout,
  FileCode,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Firewall AI
const RuleMutationVisual = ({ isVisible }) => {
  const [rules, setRules] = useState([
    { id: 1, text: 'DENY UDP 53 -> GLOBAL', status: 'ACTIVE' },
    { id: 2, text: 'ALLOW TCP 443 -> APP_PROD', status: 'ACTIVE' },
    { id: 3, text: 'BLOCK IP 192.168.1.1', status: 'BLOCK' }
  ]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setRules(prev => {
        const next = [...prev];
        const index = Math.floor(Math.random() * next.length);
        next[index] = { ...next[index], text: `MUTATE: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`, status: 'MUTATED' };
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-emerald-500/20 overflow-hidden p-8 font-mono">
      <div className="mb-6 flex items-center justify-between">
         <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AI_RULE_ENGINE
         </div>
         <div className="text-[8px] text-white/20 animate-pulse">AUTONOMOUS_MODE</div>
      </div>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between px-6 py-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-4">
               <div className={`w-2 h-2 rounded-full ${rule.status === 'MUTATED' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
               <span className="text-xs text-emerald-400 leading-none tracking-tight">{rule.text}</span>
            </div>
            <span className="text-[8px] font-black uppercase text-white/20">{rule.status}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/5 overflow-hidden">
         <div className="h-full bg-emerald-500 w-1/2 animate-rule-progress" />
      </div>
    </div>
  );
};

const L7TrafficAnalyzer = ({ isVisible }) => {
  const apps = ['Slack', 'Zoom', 'SSH', 'HTTPS', 'Git', 'RDP'];
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051a0e] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="grid grid-cols-3 gap-6 w-full max-w-md">
        {apps.map((app, i) => (
          <div key={i} className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all cursor-crosshair">
            <div className={`p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform ${i % 2 === 0 ? 'animate-pulse' : ''}`}>
               <Globe className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">{app}</span>
            <div className="absolute -top-1 -right-1">
               <CheckCircle className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/20 italic">Layer-7 Application Awareness</div>
    </div>
  );
};

const WireSpeedGauges = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-emerald-500/20 overflow-hidden p-10 flex items-center justify-center">
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        <div className="absolute inset-0 border-[12px] border-emerald-500/10 rounded-full" />
        <div className="absolute inset-0 border-[12px] border-emerald-500 border-t-transparent border-r-transparent rounded-full rotate-45 animate-gauge-spin" />
        <Gauge className="w-16 h-16 text-emerald-400 mb-2" />
        <div className="text-5xl font-black italic uppercase text-white leading-none">100G</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2">Wire-Speed</div>
      </div>
      <div className="ml-12 space-y-4 w-32">
        {['CPU', 'MEM', 'LAT'].map((l) => (
          <div key={l} className="flex flex-col gap-1">
            <div className="flex justify-between text-[8px] font-black text-white/40 uppercase">
              <span>{l}</span>
              <span>{Math.floor(Math.random() * 20) + 10}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PayloadInspectionScan = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden p-8 font-mono">
       <div className="flex justify-between text-[10px] text-white/20 mb-8 border-b border-white/5 pb-4">
          <span>PACKET_INSPECT: 0x90A1..</span>
          <span>SRC: 10.0.4.22</span>
       </div>
       <div className="text-[10px] leading-relaxed break-all text-emerald-500/40 relative">
          50 4B 03 04 14 00 08 00 08 00 1E 82 5D 56 00 00 
          48 02 00 00 16 00 00 00 70 79 73 68 69 65 6C 64 
          2E 70 79 55 54 09 00 03 3E FB 3A 66 3E FB 3A 66 
          <span className="text-red-500 font-bold bg-red-500/10 px-1 mx-1 animate-pulse">SHELLCODE_DETECTED</span>
          75 78 0B 00 01 04 00 00 00 00 04 00 00 00 00 0B
       </div>
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
       <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500 shadow-[0_0_20px_#10b981] animate-scanner-move" />
       <div className="absolute bottom-4 left-4 flex items-center gap-2 text-red-500">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-widest">In-Line Block Triggered</span>
       </div>
    </div>
  );
};

const FirewallAIDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020503] text-white relative overflow-hidden font-sans italic selection:bg-emerald-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[150px] bg-element" />
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
        <div className="flex gap-4 items-center border border-emerald-500/20 px-4 py-1.5 rounded-full bg-emerald-500/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Autonomous Filter Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-emerald-500/20 mb-6 sm:mb-8 md:mb-12">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Next-Gen Perimeter Defense</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          FIREWALL<br /><span className="text-emerald-500">AI</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Mutating rules for a mutating threat landscape. Deploy autonomous L7 filtering with 100Gbps wire-speed accuracy and zero-latency inspection.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://firewallai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/40">
            Deploy Core
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Rule Explorer <Terminal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Throughput', val: '100G' },
            { label: 'Rule Mutations', val: '4k/sec' },
            { label: 'Detection Rate', val: '99.9%' },
            { label: 'Latency', val: '<1ms' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-emerald-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RuleMutationVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <L7TrafficAnalyzer isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <WireSpeedGauges isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PayloadInspectionScan isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Autonomous Mutation', icon: Cpu, desc: 'Rulebases dynamically update in real-time based on global threat signals and local behavioral anomalies.' },
            { title: 'App-Aware Filtering', icon: Layout, desc: 'Granular visibility into over 4,000 SaaS and enterprise applications with the ability to micro-segment traffic flows.' },
            { title: 'Deep Packet X-Ray', icon: Search, desc: 'Zero-latency inspection of encrypted payloads using hardware-accelerated decryption and AI shellcode detection.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-10 group-hover:scale-110 transition-transform">
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
          COMMAND THE<br /><span className="text-emerald-500">BORDER</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://firewallai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Initialize Core <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default FirewallAIDetail;

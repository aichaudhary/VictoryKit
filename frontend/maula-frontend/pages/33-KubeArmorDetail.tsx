
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Box,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Eye,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Network,
  Database,
  Server,
  Monitor,
  Workflow,
  Hexagon
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for KubeArmor
const PodShieldVisual = ({ isVisible }) => {
  const [threatCount, setThreatCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setThreatCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-teal-900/20 to-black rounded-3xl border border-teal-500/20 overflow-hidden flex items-center justify-center p-8">
      <div className="relative">
        <Hexagon className="w-40 h-40 text-teal-500/20 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Box className="w-16 h-16 text-white animate-pulse" />
        </div>
        {/* Armor Layers */}
        <div className="absolute inset-[-20px] border border-teal-500/10 rounded-full animate-ping" />
        <div className="absolute inset-[-40px] border border-teal-500/5 rounded-full animate-ping delay-700" title="eBPF Layer" />
      </div>
      <div className="absolute top-4 left-4">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white">Runtime Protection</h3>
      </div>
      <div className="absolute bottom-4 right-8 text-right">
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-teal-400 italic">#{threatCount}</div>
        <div className="text-[8px] font-black text-white/40 uppercase tracking-widest">Syscalls Filtered</div>
      </div>
    </div>
  );
};

const EbpfStreamVisual = ({ isVisible }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const actions = [
      'SYS_EXECVE [blocked]', 'SYS_OPENAT [allowed]', 'SYS_CONNECT [allowed]',
      'SIG_KILL [triggered]', 'FILE_WRITE [blocked]', 'NET_RECV [analyzed]'
    ];
    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev];
        if (next.length > 6) next.shift();
        next.push({ id: Date.now(), text: actions[Math.floor(Math.random() * actions.length)] });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-teal-500/20 overflow-hidden p-8 font-mono flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-teal-500/50 text-xs">
        <Terminal className="w-4 h-4" />
        EBPF_FILTER_CORE.V1
      </div>
      <div className="space-y-3 flex-1 overflow-hidden">
        {logs.map(log => (
          <div key={log.id} className="text-[10px] animate-in slide-in-from-left duration-300 flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/70">{log.text.split(' ')[0]}</span>
            <span className={log.text.includes('blocked') ? 'text-red-500' : 'text-teal-500 opacity-50'}>
              {log.text.split(' ')[1]}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};

const SecurityPolicyCard = ({ isVisible }) => {
  const [status, setStatus] = useState('Enforcing');

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
       setStatus(prev => prev === 'Enforcing' ? 'Applying...' : 'Enforcing');
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051a1a] to-black rounded-3xl border border-teal-500/20 overflow-hidden p-8">
      <div className="glass h-full rounded-2xl border border-white/5 p-6 flex flex-col justify-between overflow-hidden">
        <div className="flex justify-between items-start">
           <div>
              <div className="text-[10px] font-black uppercase text-teal-500 mb-1 tracking-widest">KubeArmorPolicy</div>
              <div className="text-lg font-bold text-white italic">Block-Reverse-Shell</div>
           </div>
           <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status === 'Enforcing' ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-white/50 animate-pulse'}`}>
             {status}
           </div>
        </div>
        <div className="font-mono text-[9px] text-white/30 space-y-1">
          <div>apiVersion: security.kubearmor.com/v1</div>
          <div>kind: KubeArmorPolicy</div>
          <div>metadata:</div>
          <div>  name: block-reverse-shell</div>
          <div className="text-teal-400/40">spec:</div>
          <div className="text-teal-400/40">  selector:</div>
          <div className="text-teal-400/40">    matchLabels:</div>
          <div className="text-teal-400/40">      container: web-server</div>
          <div className="text-red-400/40">  process:</div>
          <div className="text-red-400/40">    matchPaths:</div>
          <div className="text-red-400/40">      - path: /bin/bash</div>
          <div className="text-red-400/40">    action: Block</div>
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-10">
           <ShieldCheck className="w-40 h-40" />
        </div>
      </div>
    </div>
  );
};

const ClusterRadarVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 border border-white/10 rounded-full flex items-center justify-center">
        <div className="absolute inset-0 bg-teal-500/5 rounded-full scale-110 animate-pulse" />
        <div className="absolute w-1 h-32 bg-gradient-to-t from-teal-500 to-transparent bottom-1/2 left-1/2 -ml-[2px] origin-bottom animate-spin-slow rotate-45" />
        
        {/* Nodes */}
        <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6]" />
        <div className="absolute bottom-[40%] right-[20%] w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse" />
        <div className="absolute top-[60%] right-[30%] w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_#14b8a6]" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] font-black uppercase italic tracking-widest text-white/40">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-teal-500 rounded-full" /> Prod Cluster</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /> Threat Detected</div>
      </div>
    </div>
  );
};

const KubeArmorDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020505] text-white relative overflow-hidden font-sans italic selection:bg-teal-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-teal-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <PulseRings color="#10b981" />
        <DataStream color="#10b981" />
        <PulseRings color="#10b981" />
        <DataStream color="#10b981" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-teal-500/20 px-4 py-1.5 rounded-full bg-teal-500/5">
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#14b8a6] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-teal-400">Armor Layer Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-teal-500/20 mb-6 sm:mb-8 md:mb-12">
          <Box className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-teal-400">Kubernetes Runtime Security</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          KUBE<br /><span className="text-teal-500">ARMOR</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Cloud-native runtime security using eBPF and LSM to protect Kubernetes workloads from zero-day threats, container escapes, and unauthorized access.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://kubearmor.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-teal-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-teal-500/40">
            Armor Clusters
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Policy Hub <Terminal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Enforcement', val: 'EBPF' },
            { label: 'Pod Coverage', val: '100%' },
            { label: 'Syscall Lag', val: '<1ms' },
            { label: 'Security Mode', val: 'LSM' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-teal-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PodShieldVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <EbpfStreamVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SecurityPolicyCard isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ClusterRadarVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'eBPF Enforcement', icon: Cpu, desc: 'Real-time filtering of system calls and network events with minimal performance overhead using kernel-level eBPF.' },
            { title: 'LSM Security', icon: Layers, desc: 'Direct integration with AppArmor, SELinux, and BPF-LSM for immutable policy enforcement at the OS level.' },
            { title: 'Pod Quarantine', icon: XCircle, desc: 'Automatically isolate or kill containers showing anomalous behavior or violating security benchmarks.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-10 group-hover:scale-110 transition-transform">
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
          HARDEN YOUR<br /><span className="text-teal-500">CLUSTER</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://kubearmor.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-teal-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Runtime <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default KubeArmorDetail;

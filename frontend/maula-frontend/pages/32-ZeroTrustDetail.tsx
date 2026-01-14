
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LockOpen,
  UserCheck,
  Smartphone,
  Globe,
  Network,
  Cpu,
  Zap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Fingerprint,
  Eye,
  Key,
  Watch,
  Activity,
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Zero Trust
const IdentityVerifier = ({ isVisible }) => {
  const [step, setStep] = useState(0);
  const steps = ['Scanning Device', 'Verifying Identity', 'Checking Context', 'Validating Token'];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-black rounded-3xl border border-purple-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <Fingerprint className="w-24 h-24 text-purple-500 animate-pulse" />
        <div className="absolute inset-x-0 top-0 h-1 bg-purple-400/50 animate-scan" />
      </div>
      <div className="space-y-3 w-full max-w-xs transition-all duration-500">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${step >= i ? 'opacity-100 translate-x-0' : 'opacity-10 -translate-x-4'}`}>
            <div className={`w-2 h-2 rounded-full ${step > i ? 'bg-purple-500' : 'bg-white/20'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${step === i ? 'text-purple-400' : 'text-white/40'}`}>{s}</span>
            {step === i && <Activity className="w-3 h-3 text-purple-400 animate-bounce" />}
          </div>
        ))}
      </div>
      <div className="absolute top-4 left-4">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white">Continuous Auth</h3>
      </div>
    </div>
  );
};

const MicroSegmentationMap = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-purple-500/20 overflow-hidden p-8 font-mono">
      <div className="grid grid-cols-4 gap-4 h-full">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="relative group border border-white/5 rounded-xl flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
             <div className="absolute inset-0 border border-purple-500/0 group-hover:border-purple-500/20 transition-all scale-95 group-hover:scale-100" />
             <Shield className="w-4 h-4 text-white/10 group-hover:text-purple-500/50 transition-all duration-500" />
             {i === 5 && <div className="absolute inset-0 bg-red-500/10 animate-pulse flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-500" /></div>}
             {i === 9 && isVisible && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-[1px] bg-purple-500/50 absolute rotate-45 animate-pulse" />
                 <div className="w-full h-[1px] bg-purple-500/50 absolute -rotate-45 animate-pulse" />
               </div>
             )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 right-4 text-[8px] text-purple-500/40 uppercase tracking-widest">Blast Radius: MINIMIZED</div>
    </div>
  );
};

const TrustScoreGraph = ({ isVisible }) => {
  const [points, setPoints] = useState([80, 85, 90, 88, 92, 95, 94, 98]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1)];
        const last = next[next.length - 1];
        const change = Math.random() > 0.7 ? (Math.random() - 0.5) * 10 : (Math.random() - 0.2) * 5;
        next.push(Math.min(Math.max(last + change, 20), 100));
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0a0510] to-black rounded-3xl border border-purple-500/20 overflow-hidden p-8 flex flex-col justify-end">
      <div className="absolute top-8 left-8">
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic">{Math.round(points[points.length - 1])}</div>
        <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Adaptive Trust Score</div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {points.map((p, i) => (
          <div key={i} className="flex-1 transition-all duration-1000 bg-purple-500/20 rounded-t-sm" style={{ height: `${p}%`, backgroundColor: p < 50 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.4)' }} />
        ))}
      </div>
      <div className="absolute top-4 right-4">
        <Activity className="w-6 h-6 text-purple-500/20" />
      </div>
    </div>
  );
};

const JustInTimeGate = ({ isVisible }) => {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className={`transition-all duration-1000 mb-8 p-10 rounded-full ${seconds > 0 ? 'bg-purple-500/10 scale-110' : 'bg-red-500/10'}`}>
        {seconds > 0 ? <Lock className="w-16 h-16 text-purple-500" /> : <LockOpen className="w-16 h-16 text-red-500" />}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Ephemeral Access Window</div>
        <div className={`text-2xl sm:text-3xl md:text-4xl font-black italic transition-colors ${seconds < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          00:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-8 flex justify-between text-[8px] font-medium text-white/20 uppercase tracking-widest">
         <span>User: Admin_Ops</span>
         <span>Action: DB_Write</span>
         <span>JIT: Enabled</span>
      </div>
    </div>
  );
};

const ZeroTrustDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#050208] text-white relative overflow-hidden font-sans italic selection:bg-purple-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-purple-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-purple-500/20 px-4 py-1.5 rounded-full bg-purple-500/5">
          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-400">Trust Engine Online</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-purple-500/20 mb-6 sm:mb-8 md:mb-12">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-400">Zero Trust Architecture</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          ZERO<br /><span className="text-purple-500">TRUST</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Never Trust. Always Verify. Implement granular micro-segmentation, continuous identity verification, and ephemeral just-in-time access.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://zerotrust.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-purple-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-purple-500/40">
            Deploy ZTNA
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Access Logs <Terminal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Verification', val: '100%' },
            { label: 'Latency', val: '<5ms' },
            { label: 'Lateral Block', val: 'AUTO' },
            { label: 'Trust Basis', val: 'NONE' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-purple-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <IdentityVerifier isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <MicroSegmentationMap isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <TrustScoreGraph isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <JustInTimeGate isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Continuous Auth', icon: Fingerprint, desc: 'Every request is verified using device posture, user identity, and behavioral context in real-time.' },
            { title: 'Micro Segmentation', icon: Layers, desc: 'Isolate every workload and application. Prevent lateral movement by forcing every internal request through the trust engine.' },
            { title: 'Ephemeral Access', icon: Key, desc: 'Grant access only when needed, for the minimum duration required, reducing the attack surface by 90%.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-10 group-hover:scale-110 transition-transform">
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
          ELIMINATE<br /><span className="text-purple-500">EXPLICIT TRUST</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://zerotrust.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-purple-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate ZTNA <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ZeroTrustDetail;


import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Database,
  Cloud,
  CloudLightning,
  CloudRain,
  Timer,
  Server,
  Network,
  CheckCircle,
  XCircle,
  Undo,
  RotateCcw,
  HardDrive,
  Copy
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for DRPlan
const ImmutableBackupVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-indigo-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="flex gap-4 relative">
          {[1, 2, 3].map((i) => (
             <div key={i} className="relative group">
                <div className={`w-16 h-20 bg-indigo-500/10 border-2 rounded-xl flex items-center justify-center transition-all duration-1000 ${isVisible ? 'border-indigo-500 shadow-[0_0_20px_#6366f140]' : 'border-white/10'}`}>
                   <Database className={`w-8 h-8 ${isVisible ? 'text-indigo-400' : 'text-white/10'}`} />
                </div>
                {isVisible && (
                   <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full p-1 animate-bounce">
                      <Lock className="w-3 h-3 text-white" />
                   </div>
                )}
             </div>
          ))}
       </div>
       <div className="mt-12 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Immutable Point-in-Time</div>
          <div className="text-3xl font-black italic uppercase text-indigo-400 tracking-tighter">WORM_STORAGE_LOCKED</div>
       </div>
    </div>
  );
};

const HotSiteFailoverVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#050510] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="w-full flex justify-between items-center px-12 relative">
          <div className="flex flex-col items-center gap-4">
             <div className={`p-6 rounded-2xl border transition-all duration-1000 ${isVisible ? 'bg-red-500/10 border-red-500 grayscale opacity-40' : 'bg-white/5 border-white/10'}`}>
                <Server className="w-10 h-10 text-white/20" />
             </div>
             <span className="text-[8px] font-black uppercase text-white/20">US-EAST-1 (PRIMARY)</span>
          </div>

          <div className="flex-1 relative h-[1px]">
             <div className="absolute inset-0 bg-white/5" />
             <div className={`absolute inset-0 bg-indigo-500 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`} />
             {isVisible && <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 animate-pulse" />}
          </div>

          <div className="flex flex-col items-center gap-4">
             <div className={`p-6 rounded-2xl border transition-all duration-1000 ${isVisible ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_#6366f120]' : 'bg-white/5 border-white/10'}`}>
                <Cloud className={`w-10 h-10 ${isVisible ? 'text-indigo-400' : 'text-white/20'}`} />
             </div>
             <span className="text-[8px] font-black uppercase text-indigo-400">EU-WEST-1 (FAILOVER)</span>
          </div>
       </div>
       <div className={`mt-12 px-6 py-2 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Automatic DNS Steering: Redirection Active
       </div>
    </div>
  );
};

const RecoveryMetricsVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-indigo-500/20 overflow-hidden p-8 flex items-center justify-around">
       {[
          { label: 'RTO', val: '12m', target: '15m' },
          { label: 'RPO', val: '4m', target: '10m' }
       ].map((m, i) => (
          <div key={i} className="flex flex-col items-center">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                   <circle cx="64" cy="64" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                   <circle cx="64" cy="64" r="50" fill="transparent" stroke="#6366f1" strokeWidth="8" 
                           strokeDasharray="314" strokeDashoffset={isVisible ? '100' : '314'} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="flex flex-col items-center">
                   <span className="text-2xl font-black italic">{m.val}</span>
                   <span className="text-[8px] uppercase text-white/20">Actual</span>
                </div>
             </div>
             <div className="mt-4 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest">{m.label} Performance</div>
                <div className="text-[8px] text-indigo-500/60 uppercase">Target: &lt;{m.target}</div>
             </div>
          </div>
       ))}
    </div>
  );
};

const DrillAutomationVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0c051a] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col justify-center">
       <div className="space-y-6 max-w-sm mx-auto w-full">
          {['Compute Failover', 'Storage Sync', 'DNS Health Check', 'App Verification'].map((step, i) => (
             <div key={step} className="flex items-center gap-4 transition-all duration-700" style={{ transitionDelay: `${i * 200}s`, opacity: isVisible ? 1 : 0.2 }}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isVisible ? 'bg-indigo-500/10 border-indigo-500' : 'border-white/10'}`}>
                   {isVisible ? <CheckCircle className="w-4 h-4 text-indigo-400" /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                </div>
                <div className="flex-1">
                   <div className="text-[10px] font-black uppercase tracking-widest">{step}</div>
                   <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: isVisible ? '100%' : '0%' }} />
                   </div>
                </div>
             </div>
          ))}
       </div>
       <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-indigo-500/20 tracking-tighter italic">Weekly Auto-Drill #822</div>
    </div>
  );
};

const DRPlanDetail = ({ setView }) => {
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-100, 100)',
        rotation: 'random(-20, 20)',
        duration: 'random(8, 15)',
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
            duration: 1.2,
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
    <div ref={backgroundRef} className="min-h-screen bg-[#030108] text-white relative overflow-hidden font-sans italic selection:bg-indigo-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <HexGrid color="#ef4444" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#ef4444" />
        <HexGrid color="#ef4444" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#ef4444" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-indigo-500/20 px-4 py-1.5 rounded-full bg-indigo-500/5 text-indigo-400">
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#6366f1] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Resilience Engine Primed</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-indigo-500/20 mb-6 sm:mb-8 md:mb-12">
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400">Autonomous Business Continuity</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          DR<br /><span className="text-indigo-500">PLAN</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Data is ephemeral, resilience is eternal. Automated recovery orchestration, immutable backups, and seamless multi-region failover for the zero-downtime era.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://drplan.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-indigo-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/40">
            Activate Plan
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Recovery View <Undo className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-indigo-500/10 bg-indigo-500/5 backdrop-blur-3xl py-24 text-indigo-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'RTO Target', val: '15m' },
            { label: 'RPO Target', val: '5m' },
            { label: 'Success Rate', val: '100%' },
            { label: 'Vault Status', val: 'Locked' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-white transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ImmutableBackupVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <HotSiteFailoverVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RecoveryMetricsVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DrillAutomationVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Air-Gapped Vault', icon: Lock, desc: 'Cryptographically locked immutable backups that are physically isolated from the primary network to stop ransomware.' },
            { title: 'One-Click Failover', icon: Zap, desc: 'Seamless transition of global traffic to secondary regions with automated DNS steering and state synchronization.' },
            { title: 'Continuous Drills', icon: Timer, desc: 'Non-disruptive, automated recovery testing to ensure your playbooks work before you actually need them.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-indigo-500">
          ENSURE THE<br />SURVIVAL
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://drplan.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-indigo-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Business <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DRPlanDetail;

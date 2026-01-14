
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  ClipboardList,
  Fingerprint,
  Database,
  Eye,
  FolderOpen,
  FileCheck,
  LayoutGrid,
  Timeline,
  Workflow
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for SOC2Automator
const TrustServicesGrid = ({ isVisible }) => {
  const criteria = [
    { name: 'SECURITY', icon: Lock },
    { name: 'AVAILABILITY', icon: Activity },
    { name: 'INTEGRITY', icon: CheckCircle },
    { name: 'CONFIDENTIALITY', icon: Eye },
    { name: 'PRIVACY', icon: ShieldCheck }
  ];

  return (
    <div className="relative w-full h-96 bg-[#0a0a0f] rounded-3xl border border-amber-500/20 overflow-hidden p-8 flex items-center justify-center">
       <div className="grid grid-cols-5 gap-4 w-full">
          {criteria.map((c, i) => (
             <div key={i} className={`flex flex-col items-center justify-center space-y-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-10'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-1000 ${isVisible ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_#f59e0b40]' : 'bg-white/5 border-white/10'}`}>
                   <c.icon className={`w-6 h-6 ${isVisible ? 'text-amber-500' : 'text-white/20'}`} />
                </div>
                <span className="text-[7px] font-black tracking-widest text-white/40 uppercase">{c.name}</span>
                <div className={`w-2 h-2 rounded-full ${isVisible ? 'bg-amber-500 animate-pulse' : 'bg-white/5'}`} />
             </div>
          ))}
       </div>
       <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-amber-500/20 tracking-tighter italic">Trust Services Criteria (TSC) 2017</div>
    </div>
  );
};

const EvidenceVaultVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-12 flex flex-col items-center justify-center">
       <div className="relative w-32 h-32 border-2 border-dashed border-amber-500/20 rounded-full flex items-center justify-center">
          <FolderOpen className={`w-12 h-12 transition-all duration-1000 ${isVisible ? 'text-amber-500 scale-125' : 'text-white/10'}`} />
          {[...Array(6)].map((_, i) => (
             <div key={i} className={`absolute w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center transition-all duration-[2000ms] ${isVisible ? 'opacity-0 translate-x-0 translate-y-0' : 'opacity-100 translate-x-[150px] translate-y-[150px]'}`} 
                  style={{ 
                    transform: isVisible ? 'translate(0,0) scale(0)' : `translate(${Math.cos(i * 60) * 120}px, ${Math.sin(i * 60) * 120}px) scale(1)`,
                    transitionDelay: `${i * 100}ms`
                  }}>
                <FileCheck className="w-4 h-4 text-amber-500/40" />
             </div>
          ))}
       </div>
       <div className="mt-12 text-center text-[10px] font-black uppercase text-amber-500 italic tracking-[0.4em]">Automated Evidence Ingestion</div>
       <div className="absolute bottom-4 right-4 text-[8px] font-black text-white/20 tracking-widest">INGESTION_RATE: 4.8 GB/S</div>
    </div>
  );
};

const ContinuousMonitorPulse = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#05050a] rounded-3xl border border-indigo-500/20 overflow-hidden p-8 flex flex-col">
       <div className="flex justify-between items-center mb-6 sm:mb-8 md:mb-12">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Control EVC-04</span>
             <span className="text-[7px] text-white/40 uppercase tracking-widest">Encrypted Vol Snapshot</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
             <span className="text-[8px] font-black text-indigo-400 uppercase italic">Live Monitoring</span>
          </div>
       </div>
       <div className="flex-1 flex items-end gap-1 mb-8">
          {[...Array(40)].map((_, i) => (
             <div key={i} className="w-full bg-indigo-500/20 rounded-t-sm transition-all duration-1000" 
                  style={{ 
                    height: isVisible ? `${Math.random() * 60 + 20}%` : '5%',
                    backgroundColor: isVisible && i === 25 ? '#f59e0b' : '',
                    transitionDelay: `${i * 20}ms`
                  }} />
          ))}
       </div>
       <div className="flex justify-between text-[8px] font-black uppercase text-white/20 tracking-tighter">
          <span>00:00:00</span>
          <span className={isVisible ? 'text-amber-500 animate-pulse' : ''}>DRIFT DETECTED - AUTO-REMEDIATED</span>
          <span>CURRENT_TIME</span>
       </div>
    </div>
  );
};

const AuditReadinessGauge = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0a0a1f] to-black rounded-3xl border border-white/5 overflow-hidden p-12 flex flex-col items-center justify-center font-black italic">
       <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
             <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-white/5" />
             <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="502.4" 
                     strokeDashoffset={isVisible ? '50.24' : '502.4'} className="text-amber-500 transition-all duration-[2000ms] ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-6xl font-black text-amber-500">90%</span>
             <span className="text-[8px] tracking-[0.5em] text-white/40 mt-1">READINESS</span>
          </div>
       </div>
       <div className="mt-12 w-full grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
             <CheckCircle className="w-3 h-3 text-amber-500" />
             <span className="text-[8px] uppercase tracking-widest text-white/60">Type II Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
             <Activity className="w-3 h-3 text-indigo-500" />
             <span className="text-[8px] uppercase tracking-widest text-white/60">34 Active Monitors</span>
          </div>
       </div>
    </div>
  );
};

const SOC2AutomatorDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020205] text-white relative overflow-hidden font-sans italic selection:bg-amber-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-800/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <DataStream color="#f59e0b" />
        <HexGrid color="#f59e0b" />
        <DataStream color="#f59e0b" />
        <HexGrid color="#f59e0b" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-amber-500/20 px-4 py-1.5 rounded-full bg-amber-500/5 text-amber-400">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-400">Continuous Audit Engaged</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-amber-500/20 mb-6 sm:mb-8 md:mb-12">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-400">Enterprise Trust Engine</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          SOC2<br /><span className="text-amber-500">AUTOMATOR</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Audit readiness as code. Automatically collect evidence, monitor control drift, and generate auditor-ready reports for all 5 Trust Service Criteria.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://soc2automator.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-amber-500/40">
            Start Readiness
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Auditor View <Eye className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-amber-500/10 bg-amber-500/5 backdrop-blur-3xl py-24 text-amber-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Auto Evidence', val: '98%' },
            { label: 'Controls Managed', val: '144' },
            { label: 'Audit Speed', val: '10x' },
            { label: 'Trust Criteria', val: '5/5' }
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
            <TrustServicesGrid isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <EvidenceVaultVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ContinuousMonitorPulse isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AuditReadinessGauge isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Evidence as Code', icon: Database, desc: 'Connect to your cloud, HR, and CI/CD tools to automatically pipe evidence into encrypted vaults.' },
            { title: 'Drift Protection', icon: Workflow, desc: 'Real-time alerting when a security control falls out of compliance, with automated remediation scripts.' },
            { title: 'Type I & II Ready', icon: ClipboardList, desc: 'Flexible orchestration for both "point-in-time" Type I audits and "period-of-observation" Type II reporting.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-amber-500">
          BUILD THE<br />TRUST
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://soc2automator.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Audit <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SOC2AutomatorDetail;

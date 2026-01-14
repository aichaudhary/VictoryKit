
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  Stethoscope,
  ClipboardList,
  Fingerprint,
  Database,
  Eye,
  Cross,
  Dna,
  FileCheck
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for HIPAAGuard
const PhiVaultVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#0a0f0a] rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative">
          <Heart className={`w-24 h-24 mb-4 transition-all duration-1000 ${isVisible ? 'text-emerald-500 scale-110 drop-shadow-[0_0_20px_#10b98140]' : 'text-white/10 scale-100'}`} />
          <Shield className="absolute -bottom-2 -right-2 w-10 h-10 text-emerald-400" />
       </div>
       <div className="mt-8 space-y-2 w-full max-w-[200px]">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: isVisible ? '100%' : '0%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase text-emerald-500/40 tracking-widest">
             <span>Encrypting PHI</span>
             <span>AES-256-GCM</span>
          </div>
       </div>
       <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-emerald-500/20 tracking-tighter italic">Technical Safeguards: Article 164.312</div>
    </div>
  );
};

const AccessLogMedical = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col pt-12">
       <div className="space-y-4">
          {[
             { role: 'DOCTOR_SMITH', access: 'READ/WRITE', status: 'Authorized' },
             { role: 'NURSE_PRACTITIONER', access: 'READ_ONLY', status: 'Authorized' },
             { role: 'THIRD_PARTY_BILLING', access: 'METADATA_ONLY', status: 'Scoped' },
             { role: 'UNKNOWN_ENDPOINT', access: 'ALL', status: 'DENIED', error: true }
          ].map((log, i) => (
             <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms`, opacity: isVisible ? 1 : 0.2 }}>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white">{log.role}</span>
                   <span className="text-[7px] text-white/40 uppercase tracking-widest">{log.access}</span>
                </div>
                <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${log.error ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                   {log.status}
                </div>
             </div>
          ))}
       </div>
       <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">
          <span>Audit Trail v8.2</span>
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
       </div>
    </div>
  );
};

const DNAIntegrityVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#050a05] rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative w-16 h-64 flex flex-col justify-between">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="flex items-center justify-between group">
                <div className={`w-3 h-3 rounded-full transition-all duration-1000 ${isVisible ? 'bg-emerald-500 animate-ping' : 'bg-white/10'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                <div className="w-12 h-[1px] bg-white/10 group-hover:bg-emerald-500/40" />
                <div className={`w-3 h-3 rounded-full transition-all duration-1000 ${isVisible ? 'bg-emerald-400 animate-pulse' : 'bg-white/10'}`} style={{ animationDelay: `${i * 0.2}s` }} />
             </div>
          ))}
       </div>
       <div className="mt-8 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Immutable Record Helix</div>
          <div className="text-3xl font-black italic uppercase text-emerald-500 tracking-tighter">INTEGRITY_VERIFIED</div>
       </div>
    </div>
  );
};

const HitechComplianceGrid = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051a10] to-black rounded-3xl border border-white/5 overflow-hidden p-12 flex flex-col items-center justify-center font-black italic">
       <div className="grid grid-cols-2 gap-6 w-full">
          {['Security Rule', 'Privacy Rule', 'Breach Notification', 'HITECH Act'].map((rule, i) => (
             <div key={i} className={`p-5 rounded-2xl border transition-all duration-1000 ${isVisible ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3 mb-2">
                   <ShieldCheck className={`w-4 h-4 ${isVisible ? 'text-emerald-500' : 'text-white/20'}`} />
                   <span className={`text-[10px] uppercase tracking-widest ${isVisible ? 'text-white' : 'text-white/20'}`}>{rule}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full">
                   <div className="h-full bg-emerald-500 transition-all duration-[1500ms]" style={{ width: isVisible ? '100%' : '0%', transitionDelay: `${i * 200}ms` }} />
                </div>
             </div>
          ))}
       </div>
       <div className="absolute bottom-4 left-4 text-[10px] font-black uppercase text-emerald-500/20 italic tracking-widest">Compliance Engine v5.1</div>
    </div>
  );
};

const HIPAAGuardDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020502] text-white relative overflow-hidden font-sans italic selection:bg-emerald-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-800/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <HexGrid color="#10b981" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#10b981" />
        <HexGrid color="#10b981" />
        <FloatingIcons icons={[Database, HardDrive, FileSearch, Lock]} color="#10b981" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-emerald-500/20 px-4 py-1.5 rounded-full bg-emerald-500/5 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">HIPAA Technical Controls Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-emerald-500/20 mb-6 sm:mb-8 md:mb-12">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Medical Data Sovereignty</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          HIPAA<br /><span className="text-emerald-500">GUARD</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Sterile security for sensitive lives. Automated ePHI encryption, HITECH compliance orchestration, and immutable audit trails for modern healthcare.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://hipaaguard.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/40">
            Secure ePHI
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Audit Ledger <ClipboardList className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-emerald-500/10 bg-emerald-500/5 backdrop-blur-3xl py-24 text-emerald-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Safeguards', val: '100%' },
            { label: 'ePHI Indexed', val: '42M' },
            { label: 'Access Checks', val: '<1ms' },
            { label: 'Vault Safety', val: 'High' }
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
            <PhiVaultVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AccessLogMedical isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DNAIntegrityVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <HitechComplianceGrid isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Technical Safeguards', icon: Lock, desc: 'Automated 256-bit encryption for ePHI at rest and in transit, exceeding Article 164.312 standards.' },
            { title: 'BAA Management', icon: FileCheck, desc: 'Digital Business Associate Agreement (BAA) orchestration and continuous monitoring of vendor compliance.' },
            { title: 'Administrative Guard', icon: Database, desc: 'Role-based access control (RBAC) specifically tuned for medical environments and emergency "break-glass" scenarios.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-emerald-500">
          SECURE THE<br />PATIENT
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://hipaaguard.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Guard <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default HIPAAGuardDetail;

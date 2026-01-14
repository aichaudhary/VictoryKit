
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FileText,
  UserX,
  Map,
  BadgeCheck,
  FileCheck
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for GDPRCompliance
const RightToBeForgottenVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className={`p-6 rounded-2xl border transition-all duration-1000 ${isVisible ? 'opacity-0 scale-50 blur-2xl' : 'bg-white/5 border-white/10 opacity-100 scale-100 blur-0'}`}>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center"><UserX className="w-6 h-6 text-blue-400" /></div>
             <div>
                <div className="text-[10px] font-black uppercase text-white">Subject_ID: 9912</div>
                <div className="text-[8px] text-white/40">Request: Article 17 Erasure</div>
             </div>
          </div>
          <div className="h-2 w-full bg-blue-500/20 rounded-full" />
       </div>
       <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
          <CheckCircle className="w-16 h-16 text-blue-500 mb-4" />
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">DATA_PURGED_SUCCESSFULLY</div>
       </div>
       <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-white/10 tracking-widest italic">Article 17 Enforcement Engine</div>
    </div>
  );
};

const BreachClockVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#050510] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center font-black italic">
       <div className="relative w-48 h-48 border-4 border-white/5 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-pulse" />
          <div className="flex flex-col items-center">
             <span className="text-6xl text-blue-500">72h</span>
             <span className="text-[10px] uppercase tracking-widest text-white/20">SLA Target</span>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle cx="96" cy="96" r="92" fill="transparent" stroke="#3b82f6" strokeWidth="4" 
                     strokeDasharray="578" strokeDashoffset={isVisible ? '400' : '578'} className="transition-all duration-[2000ms] ease-linear" />
          </svg>
       </div>
       <div className="mt-8 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Article 33 Workflow</div>
          <div className="text-2xl uppercase tracking-tighter text-blue-400">Response Integrity: 100%</div>
       </div>
    </div>
  );
};

const RoPAVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex flex-col pt-12">
       <div className="space-y-4">
          {[
             { task: 'HR_PAYROLL', basis: 'Contract' },
             { task: 'MKT_EMAIL', basis: 'Consent' },
             { task: 'OPS_LOGS', basis: 'Legit_Int' },
             { task: 'USR_AUTH', basis: 'Legal_Obl' }
          ].map((item, i) => (
             <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms`, opacity: isVisible ? 1 : 0.2 }}>
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-blue-500/40" />
                   <span className="text-[10px] font-black text-white/60">{item.task}</span>
                </div>
                <div className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                   {item.basis}
                </div>
             </div>
          ))}
       </div>
       <div className="mt-auto text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Article 30 Registry</div>
       </div>
    </div>
  );
};

const DpiaHeatmapVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#05101a] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center font-black italic">
       <div className="grid grid-cols-4 grid-rows-4 gap-2 w-48 h-48">
          {[...Array(16)].map((_, i) => (
             <div key={i} className={`w-full h-full rounded-sm transition-all duration-1000 ${isVisible && i % 5 === 0 ? 'bg-red-500/40 animate-pulse' : 'bg-blue-500/10'}`} />
          ))}
       </div>
       <div className="mt-8 flex gap-6">
          <div className="flex items-center gap-2 text-[8px] text-blue-500/60 tracking-widest uppercase"><BadgeCheck className="w-3 h-3" /> Mitigated</div>
          <div className="flex items-center gap-2 text-[8px] text-white/20 tracking-widest uppercase"><Activity className="w-3 h-3" /> Analysis Active</div>
       </div>
       <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-blue-400/20">DPIA Risk Matrix v4.0</div>
    </div>
  );
};

const GDPRComplianceDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020308] text-white relative overflow-hidden font-sans italic selection:bg-blue-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[150px] bg-element" />
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
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-blue-500/20 px-4 py-1.5 rounded-full bg-blue-500/5 text-blue-400">
          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#3b82f6] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">GDPR Articles Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-blue-500/20 mb-6 sm:mb-8 md:mb-12">
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Article 32 & 33 Compliance</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          GDPR<br /><span className="text-blue-500">COMPLIANCE</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Zero-touch European data governance. Automated DPIAs, breach notification orchestration, and immutable Records of Processing Activities (RoPA).
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://gdprcompliance.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-blue-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-500/40">
            Check Compliance
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            RoPA Logs <FileCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-blue-500/10 bg-blue-500/5 backdrop-blur-3xl py-24 text-blue-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Articles Covered', val: '99' },
            { label: 'Breach Response', val: '<1h' },
            { label: 'Automation', val: '100%' },
            { label: 'DPO Ready', val: 'Yes' }
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
            <RightToBeForgottenVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <BreachClockVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RoPAVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DpiaHeatmapVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Article 30 Registry', icon: FileText, desc: 'Maintain complete and accurate Records of Processing Activities (RoPA) with continuous automated system mapping.' },
            { title: 'Smart DPIA Engine', icon: Search, desc: 'Automate Data Protection Impact Assessments with AI-driven risk identification and mitigation scoring.' },
            { title: '72hr Breach Guard', icon: Clock, desc: 'Orchestrate breach discovery to notification workflow to ensure compliance with Article 33 deadlines.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-blue-500">
          SECURE THE<br />FEDERATION
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://gdprcompliance.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-blue-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Data <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default GDPRComplianceDetail;

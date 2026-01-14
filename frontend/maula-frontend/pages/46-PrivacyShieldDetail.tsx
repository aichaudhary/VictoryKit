
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  UserPlus,
  Globe,
  Database,
  Fingerprint,
  FileText,
  Clock,
  Compass
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for PrivacyShield
const AnonymizationVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-teal-500/20 overflow-hidden p-8 flex flex-col justify-center">
       <div className="space-y-6 max-w-sm mx-auto w-full font-mono italic">
          <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-white/20 mb-2">RAW_DATA_INPUT</div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
             <div className="flex justify-between">
                <span className="text-white/40 text-[10px]">NAME:</span>
                <span className={`text-[10px] transition-all duration-1000 ${isVisible ? 'bg-teal-500/40 text-white blur-sm' : 'text-white'}`}>Johnathan Alexander Doe</span>
             </div>
             <div className="flex justify-between">
                <span className="text-white/40 text-[10px]">EMAIL:</span>
                <span className={`text-[10px] transition-all duration-1000 ${isVisible ? 'bg-teal-500/40 text-white blur-sm' : 'text-white'}`}>j.alex.doe@example.org</span>
             </div>
             <div className="flex justify-between">
                <span className="text-white/40 text-[10px]">LOC:</span>
                <span className={`text-[10px] transition-all duration-1000 ${isVisible ? 'bg-teal-500/40 text-white blur-sm' : 'text-white'}`}>London, UK</span>
             </div>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-500 mx-auto rotate-90" />
          <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-teal-500/40 mb-2">DYNAMIC_PSEUDONYMIZATION</div>
          <div className={`p-4 rounded-xl border transition-all duration-1000 ${isVisible ? 'bg-teal-500/10 border-teal-500/40' : 'bg-white/5 border-white/10'}`}>
             <div className="flex justify-between">
                <span className="text-teal-500/60 text-[10px]">ID:</span>
                <span className="text-teal-400 text-[10px]">{isVisible ? '0x8B...F2A' : 'GENERATING...'}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-teal-500/60 text-[10px]">TOKEN:</span>
                <span className="text-teal-400 text-[10px]">{isVisible ? 'SECURE_REF_8812' : 'HASHING...'}</span>
             </div>
          </div>
       </div>
    </div>
  );
};

const DsarWorkflowVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#050a0a] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative w-full max-w-xs space-y-8">
          {['Access Request', 'ID Verification', 'Data Discovery', 'Fulfillment'].map((step, i) => (
             <div key={step} className="flex items-center gap-4 transition-all duration-700" style={{ transitionDelay: `${i * 200}s`, opacity: isVisible ? 1 : 0.2 }}>
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isVisible ? 'bg-teal-500 border-teal-400 shadow-[0_0_15px_#14b8a6]' : 'bg-white/5 border-white/10'}`}>
                   {isVisible ? <CheckCircle className="w-5 h-5 text-black" /> : <div className="w-2 h-2 bg-white/20 rounded-full" />}
                </div>
                <div className="flex-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-white">{step}</div>
                   <div className="text-[8px] uppercase text-white/20 tracking-tighter">Automated Processing Active</div>
                </div>
             </div>
          ))}
          <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-white/5 -z-10" />
          {isVisible && <div className="absolute left-5 top-0 w-[2px] bg-teal-500 h-full animate-grow-y origin-top shadow-[0_0_10px_#14b8a6] -z-10" />}
       </div>
       <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase text-teal-400/20 italic">DSAR Compliance: 99.9% Automation</div>
    </div>
  );
};

const ConsentMapVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-teal-500/20 overflow-hidden p-12 flex flex-col items-center justify-center">
       <div className="grid grid-cols-2 gap-4 w-full">
          {[
             { label: 'CALIFORNIA (CCPA)', status: 'Active' },
             { label: 'EUROPE (GDPR)', status: 'Active' },
             { label: 'BRAZIL (LGPD)', status: 'Active' },
             { label: 'VIRGINIA (VCDPA)', status: 'Active' }
          ].map((region, i) => (
             <div key={i} className={`p-4 rounded-2xl border transition-all duration-1000 ${isVisible ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-white/5 border-white/10 text-white/20'}`}>
                <div className="text-[10px] font-black italic mb-1 uppercase tracking-tighter">{region.label}</div>
                <div className="flex items-center gap-2">
                   <Globe className="w-3 h-3" />
                   <span className="text-[8px] font-black uppercase tracking-widest">{region.status}</span>
                </div>
             </div>
          ))}
       </div>
       <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-white/10 tracking-widest">Global Jurisdictional Matrix</div>
    </div>
  );
};

const PrivacyImpactVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051010] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center font-black italic">
       <div className="relative w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-500/5 rounded-full animate-pulse" />
          <div className="text-8xl text-teal-500 transition-all duration-1000" style={{ transform: isVisible ? 'scale(1)' : 'scale(0.5)', opacity: isVisible ? 1 : 0 }}>
             0.12
          </div>
          <div className="absolute -bottom-4 text-[10px] uppercase tracking-widest text-teal-500/40">Risk Surface Index</div>
       </div>
       <div className="mt-8 flex gap-6">
          <div className="flex items-center gap-2 text-[8px] text-teal-500/60 tracking-widest uppercase"><ShieldCheck className="w-3 h-3" /> Safe</div>
          <div className="flex items-center gap-2 text-[8px] text-white/20 tracking-widest uppercase"><Activity className="w-3 h-3" /> Monitored</div>
       </div>
    </div>
  );
};

const PrivacyShieldDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#010505] text-white relative overflow-hidden font-sans italic selection:bg-teal-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-900/5 rounded-full blur-[150px] bg-element" />
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
        <div className="flex gap-4 items-center border border-teal-500/20 px-4 py-1.5 rounded-full bg-teal-500/5 text-teal-400">
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_#14b8a6] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Privacy Protocol Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-teal-500/20 mb-6 sm:mb-8 md:mb-12">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-teal-400">Autonomous Data Stewardship</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          PRIVACY<br /><span className="text-teal-500">SHIELD</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Trust is the new currency. Automated DSAR fulfillment, dynamic pseudonymization, and global consent orchestration for the data-aware enterprise.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://privacyshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-teal-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-teal-500/40">
            Process Requests
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Data Inventory <Layers className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-teal-500/10 bg-teal-500/5 backdrop-blur-3xl py-24 text-teal-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'DSAR Response', val: '<4hr' },
            { label: 'Privacy Automation', val: '94%' },
            { label: 'Compliance Score', val: '99.8' },
            { label: 'User Trusts', val: '2.4M' }
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
            <AnonymizationVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DsarWorkflowVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ConsentMapVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PrivacyImpactVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic text-outline-white">
          {[
            { title: 'Zero-Knowledge DSAR', icon: Clock, desc: 'Automate data discovery and retrieval across your entire stack without storing sensitive customer PII in our systems.' },
            { title: 'Dynamic Masking', icon: Fingerprint, desc: 'Real-time pseudonymization and PII masking for production logs, analytics, and third-party SaaS integrations.' },
            { title: 'Global Compliance', icon: Globe, desc: 'Unified policy engine that automatically adapts consent workflows based on user geolocation and local laws.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-10 group-hover:scale-110 transition-transform border border-teal-500/20">
                <f.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase mb-8 italic tracking-tighter leading-none border-b border-white/5 pb-6">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-xl font-medium italic">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="relative z-10 px-4 sm:px-6 md:px-8 py-32 sm:px-40 md:py-60 border-t border-white/5 flex flex-col items-center text-center">
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-teal-500">
          PROTECT THE<br />TRUST
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://privacyshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-teal-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Shield <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyShieldDetail;


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
  Globe,
  FileCheck,
  Award,
  Crown,
  Trophy,
  History
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for ISO27001
const IsmsPillarVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#0a0a0f] rounded-3xl border border-blue-500/20 overflow-hidden p-8 flex items-center justify-center">
       <div className="flex gap-12 items-end h-64">
          {['Confidentiality', 'Integrity', 'Availability'].map((pillar, i) => (
             <div key={i} className="flex flex-col items-center group">
                <div className={`w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
                     style={{ height: isVisible ? '100%' : '10%', transitionDelay: `${i * 300}ms` }}>
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{pillar}</div>
                </div>
                <div className="w-20 h-4 bg-white/10 rounded-full mt-4" />
             </div>
          ))}
       </div>
       <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <Award className={`w-12 h-12 mx-auto mb-2 transition-all duration-1000 ${isVisible ? 'text-amber-500 scale-125' : 'text-white/10'}`} />
          <div className="text-[10px] font-black uppercase text-amber-500/60 tracking-[0.5em]">ISO 27001:2022</div>
       </div>
    </div>
  );
};

const AnnexAControlOrbit = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-12 flex flex-col items-center justify-center">
       <div className="relative w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500">
          <Database className="w-8 h-8 text-blue-500" />
          {[...Array(8)].map((_, i) => (
             <div key={i} className={`absolute w-3 h-3 bg-white border border-blue-500 rounded-full transition-all duration-[3000ms] ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                  style={{ 
                    transform: isVisible ? `rotate(${i * 45}deg) translate(80px)` : 'rotate(0deg) translate(0px)',
                    animation: isVisible ? `orbit ${i * 2 + 5}s linear infinite` : 'none'
                  }} />
          ))}
       </div>
       <div className="mt-24 text-center">
          <div className="text-[10px] font-black uppercase text-white tracking-[0.4em] mb-2">Annex A Controls</div>
          <div className="text-[8px] text-white/40 uppercase tracking-widest">A.5.1 to A.18.2 | 114 Controls Verified</div>
       </div>
       <style jsx>{`
          @keyframes orbit {
             from { transform: rotate(0deg) translate(80px) rotate(0deg); }
             to { transform: rotate(360deg) translate(80px) rotate(-360deg); }
          }
       `}</style>
    </div>
  );
};

const RiskMatrixHeatmap = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#050505] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col font-black italic">
       <div className="grid grid-cols-5 gap-1 flex-1">
          {[...Array(25)].map((_, i) => {
             const row = Math.floor(i / 5);
             const col = i % 5;
             const isHigh = row < 2 && col > 2;
             return (
                <div key={i} className={`rounded-sm transition-all duration-[2000ms] ${isVisible ? (isHigh ? 'bg-red-500/40 border border-red-500' : 'bg-blue-500/20 border border-blue-500/40') : 'bg-white/5'}`}
                     style={{ transitionDelay: `${i * 30}ms` }}>
                   {isVisible && isHigh && i === 4 && (
                      <div className="w-full h-full flex items-center justify-center">
                         <XCircle className="w-4 h-4 text-red-500 animate-pulse" />
                      </div>
                   )}
                </div>
             );
          })}
       </div>
       <div className="flex justify-between mt-4 text-[7px] tracking-widest text-white/40 uppercase">
          <span>Likelihood (1-5)</span>
          <span>Impact (1-5)</span>
       </div>
       <div className="mt-4 flex items-center justify-between">
          <div className="text-[10px] uppercase text-white tracking-tighter">Residual Risk Analysis v4</div>
          <div className="text-[8px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/40">TREATMENT PLAN ACTIVE</div>
       </div>
    </div>
  );
};

const SoaDocumentVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0a0a20] to-black rounded-3xl border border-white/5 overflow-hidden p-12 flex flex-col items-center justify-center font-black italic">
       <div className="w-full max-w-[200px] bg-white/5 rounded-xl border border-white/10 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-blue-500 transition-all duration-[1500ms]`} style={{ width: isVisible ? `${100 - (i * 10)}%` : '0%', transitionDelay: `${i * 200}ms` }} />
             </div>
          ))}
          <div className={`pt-4 flex justify-between items-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
             <span className="text-[8px] uppercase tracking-widest text-blue-400">Statement of Applicability</span>
             <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
       </div>
       <div className="absolute bottom-4 left-4 text-[10px] font-black uppercase text-blue-500/20 italic tracking-widest">ISMS Core Framework</div>
    </div>
  );
};

const ISO27001Detail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020205] text-white relative overflow-hidden font-sans italic selection:bg-blue-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-800/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <DataStream color="#3b82f6" />
        <HexGrid color="#3b82f6" />
        <DataStream color="#3b82f6" />
        <HexGrid color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-blue-500/20 px-4 py-1.5 rounded-full bg-blue-500/5 text-blue-400">
          <Globe className="w-3 h-3 text-blue-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Global Gold Standard Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-blue-500/20 mb-6 sm:mb-8 md:mb-12">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">ISMS Excellence</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          ISO<br /><span className="text-blue-500">27001</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          The ultimate mandate for trust. Automate your Information Security Management System, implement 114 Annex A controls, and maintain global certification with zero friction.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://iso27001.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-blue-600 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-500/40">
            Build ISMS
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Audit Checklist <ClipboardList className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-blue-500/10 bg-blue-500/5 backdrop-blur-3xl py-24 text-blue-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Annex A Coverage', val: '100%' },
            { label: 'Controls Mapped', val: '114' },
            { label: 'Lead Auditor Ready', val: 'YES' },
            { label: 'Trust Score', val: 'Elite' }
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
            <IsmsPillarVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AnnexAControlOrbit isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <RiskMatrixHeatmap isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SoaDocumentVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Annex A Orchestrator', icon: Database, desc: 'Implementation guides and evidence templates for all 114 controls defined in the ISO 27001 standard.' },
            { title: 'ISMS Framework', icon: ShieldCheck, desc: 'A central nervous system for policies, procedures, and asset registers required for continuous certification.' },
            { title: 'Risk Treatment', icon: Zap, desc: 'Interactive risk assessment module with automated Statement of Applicability (SoA) generation for lead auditors.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-blue-600">
          THE GOLD<br />STANDARD
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://iso27001.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-blue-600 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Get Certified <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ISO27001Detail;

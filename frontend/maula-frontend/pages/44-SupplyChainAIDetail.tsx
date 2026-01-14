
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Package,
  Link,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  GitBranch,
  Box,
  Globe,
  Truck,
  FileCode,
  FileJson,
  Component,
  Cpu
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for SupplyChainAI
const DependencyGraphVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex items-center justify-center">
       <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <line x1="10%" y1="50%" x2="40%" y2="20%" stroke="white" strokeWidth="1" />
            <line x1="10%" y1="50%" x2="40%" y2="50%" stroke="white" strokeWidth="1" />
            <line x1="10%" y1="50%" x2="40%" y2="80%" stroke="white" strokeWidth="1" />
          </svg>
       </div>
       <div className="relative flex gap-16 items-center">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
             <Box className="w-8 h-8 text-emerald-400" />
          </div>
          <ArrowRight className="w-6 h-6 text-white/10" />
          <div className="flex flex-col gap-6">
             {[1, 2, 3].map((i) => (
                <div key={i} className={`p-4 rounded-xl border transition-all duration-1000 ${i === 2 && isVisible ? 'bg-red-500/10 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                   {i === 2 && isVisible ? <ShieldAlert className="w-6 h-6 text-red-500" /> : <Component className="w-6 h-6 text-white/20" />}
                </div>
             ))}
          </div>
       </div>
       <div className="absolute bottom-4 left-4 text-[10px] font-black uppercase text-white/20 tracking-widest">Recursive SBOM Extraction</div>
    </div>
  );
};

const SbomIntegrityScan = ({ isVisible }) => {
  const packages = ['react@18.2.0', 'lodash@4.17.21', 'gsap@3.12.2', 'lucide-react@0.263.1', 'tailwind@3.3.0'];
  return (
    <div className="relative w-full h-96 bg-[#050805] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col pt-12">
       <div className="space-y-4">
          {packages.map((pkg, i) => (
             <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-3">
                   <FileJson className="w-4 h-4 text-emerald-500/40" />
                   <span className="text-[10px] font-mono text-white/60">{pkg}</span>
                </div>
                <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded transition-all duration-1000 ${isVisible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                   {isVisible ? 'VERIFIED' : 'SCANNING'}
                </div>
             </div>
          ))}
       </div>
       <div className={`mt-8 p-4 rounded-xl border transition-all duration-1000 ${isVisible ? 'bg-emerald-500/10 border-emerald-500/20 opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em]">Provenance Validated: 100% Signal Success</span>
          </div>
       </div>
    </div>
  );
};

const VendorScoreRadar = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center font-black italic">
       <div className="relative w-64 h-64 border border-white/5 rounded-full flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse" />
          <div className="text-8xl text-emerald-500 transition-all duration-1000" style={{ transform: isVisible ? 'scale(1)' : 'scale(0.5)', opacity: isVisible ? 1 : 0 }}>
             98
          </div>
          <div className="absolute -bottom-4 text-[10px] uppercase tracking-widest text-emerald-500/40">Trust Index</div>
       </div>
       <div className="mt-8 flex gap-6">
          {['ISO27001', 'SOC2', 'GDPR'].map(cert => (
             <div key={cert} className="text-[8px] text-white/40 tracking-[0.3em] uppercase">{cert}</div>
          ))}
       </div>
    </div>
  );
};

const PipelineGateVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#05100a] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><GitBranch className="w-6 h-6 text-white/20" /></div>
          <div className="w-12 h-[1px] bg-white/10" />
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-1000 ${isVisible ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white/5 border-white/10'}`}>
             <ShieldCheck className={`w-8 h-8 ${isVisible ? 'text-emerald-500' : 'text-white/10'}`} />
          </div>
          <div className="w-12 h-[1px] bg-white/10" />
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><Truck className="w-6 h-6 text-white/20" /></div>
       </div>
       <div className="mt-12 text-center animate-pulse">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Policy Enforcement Gate</div>
          <div className="text-3xl font-black italic uppercase text-emerald-500 tracking-tighter">BUILD_ARTIFACT_SIGNED</div>
       </div>
    </div>
  );
};

const SupplyChainAIDetail = ({ setView }) => {
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
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-600/5 rounded-full blur-[150px] bg-element" />
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
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-emerald-500/20 px-4 py-1.5 rounded-full bg-emerald-500/5 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Supply Integrity Monitor</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-emerald-500/20 mb-6 sm:mb-8 md:mb-12">
          <Link className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Vendor Risk Orchestration</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          SUPPLY<br /><span className="text-emerald-500 text-outline">CHAIN AI</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Trust, but verify at scale. Automated SBOM analysis, continuous vendor assessments, and digital signature enforcement for the modern software factory.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://supplychainai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/40">
            Scan Vendors
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            SBOM Export <FileCode className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-emerald-500/10 bg-emerald-500/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Vendors Monitored', val: '14.2K' },
            { label: 'SBOM Items', val: '2.8M' },
            { label: 'Vulnerabilities', val: '0' },
            { label: 'Compliance', val: '100%' }
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
            <DependencyGraphVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SbomIntegrityScan isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <VendorScoreRadar isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PipelineGateVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Continuous SBOM', icon: FileCode, desc: 'Real-time generation and tracking of your Software Bill of Materials with deep recursive dependency analysis.' },
            { title: 'Vendor Risk Intel', icon: Globe, desc: 'Aggregated threat intelligence and compliance scoring for every third-party vendor in your ecosystem.' },
            { title: 'Signature Guard', icon: Lock, desc: 'Enforce digital signatures across your entire CI/CD pipeline to ensure artifact integrity from dev to prod.' }
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
        <h2 className="text-[11rem] md:text-[16rem] font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20 text-emerald-500">
          SECURE THE<br />CHAIN
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://supplychainai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Guard <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SupplyChainAIDetail;


import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  FileText,
  Code,
  CheckCircle,
  Layers,
  Zap,
  ArrowRight,
  ChevronRight,
  Shield,
  Search,
  Settings,
  Terminal,
  Activity,
  AlertTriangle,
  Lock,
  Globe,
  Database,
  Cpu,
  Monitor,
  Smartphone,
  Server,
  Cloud,
  Eye,
  Radar,
  Workflow,
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  History,
  GitBranch
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Policy Engine
const PolicyCodeVisualizer = ({ isVisible }) => {
  const [line, setLine] = useState(0);
  const codeLines = [
    'package maula.admission',
    'import data.lib.kubernetes',
    '',
    'deny[msg] {',
    '  input.review.kind.kind == "Pod"',
    '  not input.review.object.spec.securityContext.runAsNonRoot',
    '  msg := "Pod must run as non-root"',
    '}',
    '',
    'allow {',
    '  input.method == "GET"',
    '  user.role == "admin"',
    '}'
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setLine(prev => (prev + 1) % codeLines.length);
    }, 400);
    return () => clearInterval(interval);
  }, [isVisible, codeLines.length]);

  return (
    <div className="relative w-full h-96 bg-[#0a0804] rounded-3xl border border-amber-500/20 overflow-hidden font-mono text-xs p-6">
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500/20" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
        <div className="w-3 h-3 rounded-full bg-green-500/20" />
        <span className="ml-2 text-[10px] text-white/30 uppercase tracking-widest">security_policy.rego</span>
      </div>
      <div className="space-y-1">
        {codeLines.map((l, i) => (
          <div key={i} className={`flex transition-colors duration-300 ${i === line ? 'bg-amber-500/10' : ''}`}>
            <span className="w-8 text-white/10 text-right pr-4">{i + 1}</span>
            <span className={i === line ? 'text-amber-400' : 'text-white/40'}>{l}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Syntax Valid</span>
      </div>
      <div className="absolute top-4 right-4 animate-pulse">
         <Code className="w-4 h-4 text-amber-500/40" />
      </div>
    </div>
  );
};

const ComplianceRadar = ({ isVisible }) => {
  const radarRef = useRef(null);
  
  useEffect(() => {
    if (!isVisible) return;
    gsap.to(radarRef.current, {
      rotate: 360,
      duration: 4,
      repeat: -1,
      ease: "none"
    });
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-amber-900/20 to-black rounded-3xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
      <div className="relative w-64 h-64 border border-amber-500/20 rounded-full flex items-center justify-center">
        <div className="absolute inset-0 border border-amber-500/10 rounded-full scale-75" />
        <div className="absolute inset-0 border border-amber-500/10 rounded-full scale-50" />
        <div ref={radarRef} className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full origin-center" />
        
        {/* Compliance points */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
        <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
        
        <Globe className="w-12 h-12 text-amber-500/30" />
      </div>
      <div className="absolute bottom-4 left-6 text-white">
        <h3 className="text-lg font-bold">Global Posture Radar</h3>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Real-time scan in progress</p>
      </div>
    </div>
  );
};

const AutoHealWorkflow = ({ isVisible }) => {
  const [status, setStatus] = useState('violation');

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setStatus(prev => prev === 'violation' ? 'fixing' : prev === 'fixing' ? 'healed' : 'violation');
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#1a1505] to-black rounded-3xl border border-amber-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center gap-12">
        <div className={`w-20 h-20 rounded-2xl bg-white/5 border flex items-center justify-center transition-all duration-1000 ${status === 'violation' ? 'border-red-500/50 scale-110' : 'border-white/10'}`}>
          <Database className={`w-10 h-10 ${status === 'violation' ? 'text-red-500' : 'text-white/20'}`} />
        </div>
        
        <ArrowRight className={`w-8 h-8 transition-all duration-1000 ${status === 'fixing' ? 'text-amber-500 translate-x-4' : 'text-white/10'}`} />
        
        <div className={`w-20 h-20 rounded-2xl bg-white/5 border flex items-center justify-center transition-all duration-1000 ${status === 'healed' ? 'border-green-500/50 scale-110' : 'border-white/10'}`}>
          <ShieldCheck className={`w-10 h-10 ${status === 'healed' ? 'text-green-500' : 'text-white/20'}`} />
        </div>
      </div>
      
      <div className="mt-12 text-center h-8">
        {status === 'violation' && <span className="text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">Public S3 Bucket Detected</span>}
        {status === 'fixing' && <span className="text-amber-500 text-xs font-black uppercase tracking-widest">Enforcing ACL: Private</span>}
        {status === 'healed' && <span className="text-green-500 text-xs font-black uppercase tracking-widest">Compliance Restored</span>}
      </div>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">Self-Healing Assets</h3>
      </div>
    </div>
  );
};

const PolicyHierarchy = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center"><Layers className="w-4 h-4 text-amber-500" /></div>
          <div className="h-[2px] w-8 bg-amber-500/20" />
          <span className="text-xs font-bold text-white/80">Corporate Security Master</span>
        </div>
        
        <div className="ml-12 space-y-4 border-l-2 border-white/5 pl-8">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"><Cloud className="w-3 h-3 text-blue-400" /></div>
            <span className="text-[10px] text-white/50">Production Infrastructure</span>
            <div className="ml-auto px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[8px] font-black italic">ENFORCED</div>
          </div>
          <div className="flex items-center gap-4 border-l-2 border-white/5 pl-8 mt-2">
             <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center"><Server className="w-3 h-3 text-purple-400" /></div>
             <span className="text-[10px] text-white/50">Workload Isolation</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-red-400" /></div>
            <span className="text-[10px] text-white/50">Dev/Staging Sandbox</span>
            <div className="ml-auto px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black italic">AUDIT</div>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 text-amber-500/20">
        <Workflow className="w-6 h-6" />
      </div>
      <div className="absolute bottom-4 left-8 text-white">
        <h3 className="text-lg font-bold">Policy Inheritance</h3>
      </div>
    </div>
  );
};

const PolicyEngineDetail = ({ setView }) => {
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-60, 60)',
        rotation: 'random(-10, 10)',
        duration: 'random(5, 8)',
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          gsap.to(entry.target.querySelectorAll('.animate-on-scroll'), {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out"
          });
        }
      }, { threshold: 0.1 });

      if (contentRef.current) observer.observe(contentRef.current);
      return () => observer.disconnect();
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#050402] text-white relative overflow-hidden font-sans italic selection:bg-amber-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-amber-600/10 rounded-full blur-[160px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[140px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
          <Settings className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          Governance Grid
        </button>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Policy Live Enforcement</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-amber-500/20 mb-6 sm:mb-8 md:mb-12">
          <FileText className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">Universal Governance Engine</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          POLICY<br /><span className="text-amber-600">ENGINE</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20">
          Policy as code, globally enforced. Centralize security standards across your entire stack with automated enforcement that prevents misconfigurations before they happen.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://policyengine.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.4em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-amber-500/40">
            Define Standards
          </a>
          <button className="px-12 py-6 glass rounded-full font-black text-xs tracking-[0.4em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/5 transition-colors">
            Audit Assets <Search className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 py-24 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Policy Templates', val: '500+' },
            { label: 'Auto-Remediate', val: '100%' },
            { label: 'Cloud Support', val: 'ALL' },
            { label: 'Audit Speed', val: 'REAL' }
          ].map((s, i) => (
            <div key={i} className="text-center group">
              <div className="text-6xl text-white group-hover:text-amber-500 transition-colors uppercase">{s.val}</div>
              <div className="text-[8px] tracking-[0.4em] text-white/20 mt-2 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PolicyCodeVisualizer isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ComplianceRadar isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AutoHealWorkflow isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PolicyHierarchy isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {[
            { title: 'Policy-as-Code', icon: Code, desc: 'Define security guardrails using standard languages like Rego, version-controlled and testable.' },
            { title: 'Self-Correction', icon: Zap, desc: 'Optionally trigger workflows that automatically remediate non-compliant resources in milliseconds.' },
            { title: 'Unified Graph', icon: Layers, desc: 'A unified view of policy compliance across your entire environment, from code to runtime.' }
          ].map((f, i) => (
            <div key={i} className="group border-t border-white/10 pt-10 hover:border-amber-500 transition-colors">
              <div className="mb-8 w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black italic uppercase mb-6">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-lg font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="relative z-10 px-4 sm:px-6 md:px-8 py-32 sm:px-40 md:py-60 border-t border-white/5 text-center flex flex-col items-center">
        <h2 className="text-[8rem] md:text-[12rem] font-black italic tracking-tighter leading-none uppercase mb-10 sm:mb-16 md:mb-20 italic">
          CODE THE<br /><span className="text-amber-600">GUARDRAils</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <button onClick={() => setView('home')} className="px-20 py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://policyengine.maula.ai" target="_blank" rel="noopener noreferrer" className="px-20 py-10 bg-amber-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4 shadow-2xl shadow-amber-500/20">
            Deploy Policy <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PolicyEngineDetail;

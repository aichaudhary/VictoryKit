
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Lock,
  Eye,
  FileWarning,
  FileText,
  ExternalLink,
  UserCheck,
  UserX,
  AlertOctagon,
  Radar,
  Workflow,
  CheckCircle,
  XCircle,
  Layout
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Email Defender
const SandBoxDetonator = ({ isVisible }) => {
  const [detonating, setDetonating] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setDetonating(true);
      setTimeout(() => setDetonating(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-black rounded-3xl border border-emerald-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className={`relative p-10 rounded-3xl border-2 transition-all duration-500 ${detonating ? 'bg-red-500/10 border-red-500 scale-90 blur-sm' : 'bg-emerald-500/5 border-emerald-500/40 scale-100'}`}>
        <FileWarning className={`w-20 h-20 transition-colors ${detonating ? 'text-red-500' : 'text-emerald-500'}`} />
        <div className="absolute -top-4 -right-4 bg-black border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
          Sandbox.v2
        </div>
      </div>
      <div className="mt-8 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Attachment Status</div>
        <div className={`text-2xl font-black italic uppercase transition-colors ${detonating ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
          {detonating ? 'Detonating...' : 'Cleaned & Safe'}
        </div>
      </div>
      <div className="absolute bottom-4 left-4">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter text-white">Isolated Execution</h3>
      </div>
    </div>
  );
};

const PhishAnalysisVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-emerald-500/20 overflow-hidden p-8 font-mono">
      <div className="text-emerald-500/50 text-[10px] mb-6 flex items-center gap-2 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
        <Search className="w-4 h-4" />
        AI_PHISH_ANALYTICS
      </div>
      <div className="space-y-4 text-[10px] text-white/30">
        <div className="p-3 bg-white/5 rounded-lg border-l-2 border-red-500 animate-in slide-in-from-left duration-500">
           <div className="text-red-500 font-bold mb-1">[!] Header Fake</div>
           From: "CEO Name" &lt;hacker@domain.xyz&gt;
        </div>
        <div className="p-3 bg-white/5 rounded-lg border-l-2 border-amber-500 animate-in slide-in-from-left delay-300 duration-500">
           <div className="text-amber-500 font-bold mb-1">[!] Keyword Alert</div>
           Subject: "URGENT PAYMENT REQUIRED"
        </div>
        <div className="p-3 bg-white/5 rounded-lg border-l-2 border-blue-500 animate-in slide-in-from-left delay-500 duration-500">
           <div className="text-blue-500 font-bold mb-1">[!] Link Rewritten</div>
           Target: https://secure-login.bit.ly/xxxx
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-emerald-500 opacity-20">
         <ShieldAlert className="w-12 h-12" />
      </div>
    </div>
  );
};

const ImpersonationRadar = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051a10] to-black rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 rounded-full border border-emerald-500/10 flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/5 rounded-full scale-125 animate-pulse" />
        <Radar className="w-24 h-24 text-emerald-500/20 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
           <UserCheck className="w-10 h-10 text-emerald-500" />
        </div>
        {/* Identified Clones */}
        <div className="absolute top-[10%] right-[20%] animate-ping"><UserX className="w-4 h-4 text-red-500" /></div>
      </div>
      <div className="mt-8 text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Identity Verification Engine</div>
    </div>
  );
};

const BannerInjectorVisual = ({ isVisible }) => {
  const [style, setStyle] = useState(0);
  const banners = [
    { type: 'CAUTION', color: 'bg-amber-500', text: 'External Sender - Verification Required', icon: AlertOctagon },
    { type: 'DANGER', color: 'bg-red-500', text: 'High Risk Link Detected - Access Blocked', icon: ShieldAlert },
    { type: 'SECURE', color: 'bg-emerald-500', text: 'Verified Identity - Secure Communication', icon: ShieldCheck }
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setStyle(prev => (prev + 1) % banners.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isVisible, banners.length]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col justify-center">
      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10" />
          <div className="space-y-1">
             <div className="w-32 h-2 bg-white/20 rounded" />
             <div className="w-16 h-1 bg-white/10 rounded" />
          </div>
        </div>
        {(() => {
          const BannerIcon = banners[style].icon;
          const colorBase = banners[style].color.replace('bg-', '');
          return (
            <div className={`transition-all duration-700 p-3 rounded-lg flex items-center gap-3 ${banners[style].color}/20 border border-${colorBase}/30`}>
              <BannerIcon className={`w-4 h-4 text-${colorBase}`} />
              <div className="text-[9px] font-black uppercase text-white/70 tracking-widest">{banners[style].text}</div>
            </div>
          );
        })()}
        <div className="space-y-2 pt-2">
           <div className="w-full h-1 bg-white/5 rounded" />
           <div className="w-3/4 h-1 bg-white/5 rounded" />
        </div>
      </div>
      <div className="absolute top-4 right-4 text-[8px] font-black text-white/20 uppercase">Proactive Banner Injection</div>
    </div>
  );
};

const EmailDefenderDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020503] text-white relative overflow-hidden font-sans italic selection:bg-emerald-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <ParticleNetwork color="#3b82f6" />
        <DataStream color="#3b82f6" />
        <ParticleNetwork color="#3b82f6" />
        <DataStream color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-emerald-500/20 px-4 py-1.5 rounded-full bg-emerald-500/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Gateway Online</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-emerald-500/20 mb-6 sm:mb-8 md:mb-12">
          <Mail className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Next-Gen Email Security</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          EMAIL<br /><span className="text-emerald-500">DEFENDER</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Stop phishing, business email compromise, and advanced malware before they reach the inbox. Advanced detonation and AI-driven analysis.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://emaildefender.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/40">
            Defend Inbox
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Spam Analytics <Activity className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Catch Rate', val: '99.9%' },
            { label: 'Latency', val: '<2s' },
            { label: 'Sandboxing', val: 'AUTO' },
            { label: 'BEC Shield', val: 'ACTIVE' }
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
            <SandBoxDetonator isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PhishAnalysisVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ImpersonationRadar isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <BannerInjectorVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Detonation Lab', icon: FileWarning, desc: 'Every suspicious attachment is detonated in an isolated, multi-OS sandbox to trace behavior and payloads.' },
            { title: 'AI BEC Shield', icon: UserCheck, desc: 'Advanced identity analysis detects business email compromise by profiling sender habits and relationship history.' },
            { title: 'Dynamic Banners', icon: Layout, desc: 'Inject real-time security warnings and context into emails to guide users away from potential risks.' }
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-none uppercase mb-10 sm:mb-16 md:mb-20 italic">
          PURITY IN THE<br /><span className="text-emerald-500">INBOX</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://emaildefender.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Inbox <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default EmailDefenderDetail;

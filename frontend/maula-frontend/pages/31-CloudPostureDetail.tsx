
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Cloud,
  Shield,
  Settings,
  CheckCircle,
  Zap,
  ArrowRight,
  ChevronRight,
  Activity,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  Database,
  Server,
  Network,
  Cpu,
  Monitor,
  Globe,
  Layout,
  Layers,
  FileText,
  Eye,
  Radar,
  Workflow,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Clock,
  ExternalLink
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Cloud Posture
const MultiCloudStatus = ({ isVisible }) => {
  const [active, setActive] = useState(0);
  const platforms = [
    { name: 'AWS', color: '#FF9900', icon: Cloud },
    { name: 'Azure', color: '#0089D6', icon: Cloud },
    { name: 'GCP', color: '#4285F4', icon: Cloud }
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % platforms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible, platforms.length]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-black rounded-3xl border border-cyan-500/20 overflow-hidden flex items-center justify-center p-8">
      <div className="flex gap-12">
        {platforms.map((p, i) => {
          const Icon = p.icon;
          const isActive = active === i;
          return (
            <div key={i} className={`relative flex flex-col items-center transition-all duration-700 ${isActive ? 'scale-125 opacity-100' : 'scale-90 opacity-20'}`}>
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-colors" style={{ borderColor: isActive ? p.color : 'rgba(255,255,255,0.1)' }}>
                <Icon className="w-10 h-10" style={{ color: isActive ? p.color : 'white' }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{p.name}</span>
              {isActive && (
                <div className="absolute -inset-8 bg-white/10 blur-[40px] rounded-full -z-10 animate-pulse" style={{ backgroundColor: `${p.color}20` }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold italic uppercase tracking-tighter">Unified Multi-Cloud Control</h3>
      </div>
    </div>
  );
};

const MisconfigScanner = ({ isVisible }) => {
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const resources = ['IAM Role: Admin', 'S3 Bucket: Public', 'Security Group: 0.0.0.0/0', 'EBS: Unencrypted', 'VPC: Log Disabled'];
    const interval = setInterval(() => {
      setTargets(prev => {
        const next = [...prev];
        if (next.length > 5) next.shift();
        next.push({ id: Date.now(), name: resources[Math.floor(Math.random() * resources.length)] });
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-cyan-500/20 overflow-hidden p-8 font-mono">
      <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/50 animate-scan pointer-events-none" />
      <div className="text-cyan-500/50 text-xs mb-6 uppercase tracking-widest flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        POSTURE_SCANNER.LOG
      </div>
      <div className="space-y-4">
        {targets.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-[10px] animate-in slide-in-from-left duration-500">
            <div className="flex items-center gap-3">
               <AlertTriangle className="w-3 h-3 text-amber-500" />
               <span className="text-white/70">{t.name}</span>
            </div>
            <span className="text-amber-500/50">MISCONFIGURED</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};

const PostureScoreGauge = ({ isVisible }) => {
  const [score, setScore] = useState(65);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setScore(prev => {
        const diff = Math.random() > 0.6 ? 1 : -1;
        return Math.min(Math.max(prev + diff, 40), 98);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#051a1a] to-black rounded-3xl border border-cyan-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="relative">
        <svg className="w-48 h-48 -rotate-90">
          <circle cx="96" cy="96" r="80" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.05" />
          <circle cx="96" cy="96" r="80" fill="none" stroke="#06b6d4" strokeWidth="8" strokeDasharray="502" strokeDashoffset={502 - (score / 100) * 502} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-black text-white italic">{score}%</div>
          <div className="text-[8px] font-black uppercase tracking-[0.4em] text-cyan-500 mt-2">Posture Health</div>
        </div>
      </div>
      <div className="mt-8 flex gap-8">
        <div className="text-center">
          <div className="text-xs font-bold text-white">1.2K</div>
          <div className="text-[8px] text-white/30 uppercase">Checks</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-white">42</div>
          <div className="text-[8px] text-white/30 uppercase">Violations</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-white">12</div>
          <div className="text-[8px] text-white/30 uppercase">Critical</div>
        </div>
      </div>
    </div>
  );
};

const ComplianceGrid = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-8">
      <div className="grid grid-cols-2 gap-4 h-full">
        {[
          { name: 'SOC 2 Type II', status: 'Compliant', icon: ShieldCheck, color: 'text-green-500' },
          { name: 'ISO 27001', status: 'Review', icon: Clock, color: 'text-amber-500' },
          { name: 'HIPAA Security', status: 'Compliant', icon: ShieldCheck, color: 'text-green-500' },
          { name: 'CIS Benchmark', status: 'Violations', icon: ShieldAlert, color: 'text-red-500' }
        ].map((c, i) => (
          <div key={i} className="glass p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <c.icon className={`w-8 h-8 ${c.color}`} />
            <div>
               <div className="text-xs font-bold text-white uppercase tracking-widest">{c.name}</div>
               <div className={`text-[8px] font-black uppercase mt-1 ${c.color}`}>{c.status}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 right-4 text-cyan-500/20">
        <Layout className="w-12 h-12" />
      </div>
    </div>
  );
};

const CloudPostureDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#020505] text-white relative overflow-hidden font-sans italic selection:bg-cyan-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-cyan-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <PulseRings color="#3b82f6" />
        <DataStream color="#3b82f6" />
        <PulseRings color="#3b82f6" />
        <DataStream color="#3b82f6" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-cyan-500/20 px-4 py-1.5 rounded-full bg-cyan-500/5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">Posture Monitoring Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-cyan-500/20 mb-6 sm:mb-8 md:mb-12">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">Unified Cloud Posture Platform</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          CLOUD<br /><span className="text-cyan-500">POSTURE</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Cloud Security Posture Management (CSPM) with continuous misconfiguration detection and automated remediation for AWS, Azure, and GCP.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://cloudposture.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-cyan-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-cyan-500/40">
            Activate CSPM
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Inventory Data <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Policy Rules', val: '500+' },
            { label: 'Asset Visibility', val: '100%' },
            { label: 'Remediation', val: 'AUTO' },
            { label: 'Check Frequency', val: 'REAL' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-cyan-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <MultiCloudStatus isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <MisconfigScanner isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PostureScoreGauge isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ComplianceGrid isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Misconfig Guard', icon: ShieldAlert, desc: 'Continuous scanning for security misconfigurations, exposed storage, and overly permissive IAM roles.' },
            { title: 'Auto-Repair', icon: Workflow, desc: 'One-click or automated remediation of discovered issues with direct infrastructure-as-code integration.' },
            { title: 'Compliance Map', icon: ClipboardCheck, desc: 'Automatically map cloud configurations to CIS Benchmarks, SOC 2, HIPAA, and PCI-DSS requirements.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-10 group-hover:scale-110 transition-transform">
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
          UNIFY YOUR<br /><span className="text-cyan-500">POSTURE</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://cloudposture.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-cyan-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Audit Cloud <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CloudPostureDetail;

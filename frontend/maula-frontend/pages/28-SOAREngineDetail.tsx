
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Zap,
  Activity,
  Shield,
  Brain,
  Terminal,
  Layers,
  PlayCircle,
  Settings,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Network,
  Cpu,
  Workflow,
  Link,
  Bot,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Globe,
  Database,
  Search,
  Cloud,
  Lock,
  Wifi,
  Share2,
  GitBranch,
  Repeat,
  ZapOff
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for SOAR Engine
const PlaybookExecutive = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: 'Ingest Alert', icon: AlertCircle, color: '#f43f5e' },
    { label: 'Enrich Data', icon: Search, color: '#3b82f6' },
    { label: 'Analyze Risk', icon: Brain, color: '#8b5cf6' },
    { label: 'Isolate Host', icon: Lock, color: '#ef4444' },
    { label: 'Notify Team', icon: MessageSquare, color: '#10b981' }
  ];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible, steps.length]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden flex items-center justify-center p-8">
      <div className="flex items-center gap-4">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = activeStep === i;
          return (
            <React.Fragment key={i}>
              <div className={`relative flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-20'}`}>
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <StepIcon style={{ color: step.color }} className={`w-8 h-8 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{step.label}</span>
                {isActive && (
                  <div className="absolute -inset-4 bg-white/10 blur-xl rounded-full -z-10 animate-pulse" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-[2px] bg-white/10 relative overflow-hidden transition-all duration-500 ${activeStep > i ? 'opacity-100' : 'opacity-20'}`}>
                  {activeStep === i && (
                    <div className="absolute inset-0 bg-blue-500 animate-slide-right" style={{ animationDuration: '2s' }} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold">Visual Workflow Engine</h3>
      </div>
    </div>
  );
};

const ConnectorGrid = ({ isVisible }) => {
  const [activeNodes, setActiveNodes] = useState([]);
  const icons = [Cloud, Database, Globe, Lock, Share2, Wifi, MessageSquare, Terminal];

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const newNodes = Array.from({ length: count }, () => Math.floor(Math.random() * 24));
      setActiveNodes(newNodes);
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/20 overflow-hidden p-8">
      <div className="grid grid-cols-6 grid-rows-4 gap-4 h-full">
        {Array.from({ length: 24 }).map((_, i) => {
          const Icon = icons[i % icons.length];
          const isActive = activeNodes.includes(i);
          return (
            <div key={i} className={`flex items-center justify-center rounded-xl border border-white/5 transition-all duration-500 ${isActive ? 'bg-blue-500/20 border-blue-500 text-blue-400 scale-105' : 'bg-white/5 text-white/20'}`}>
              <Icon className="w-5 h-5" />
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center backdrop-blur-md">
          <Workflow className="w-12 h-12 text-blue-500 animate-spin-slow" />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-white/50 text-[10px] font-mono">
        Active Connectors: 500+
      </div>
    </div>
  );
};

const MTTRTracker = ({ isVisible }) => {
  const [seconds, setSeconds] = useState(8400); // 140 minutes

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 12) return 12;
        return Math.floor(prev * 0.95);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="text-[10px] font-black tracking-[0.5em] text-emerald-400 uppercase mb-4">MTTR Reduction</div>
      <div className="text-8xl font-black font-mono text-white mb-2 tracking-tighter">
        {formatTime(seconds)}
      </div>
      <div className="text-emerald-500 font-bold flex items-center gap-2">
        <Zap className="w-4 h-4 fill-current" />
        Automated Response Active
      </div>
      
      <div className="absolute bottom-8 left-8 right-8 flex justify-between text-[10px] font-bold text-white/40">
        <span>MANUAL (AVERAGE)</span>
        <span>SOAR ENGINE</span>
      </div>
      <div className="absolute bottom-6 left-8 right-8 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(seconds/8400)*100}%` }} />
      </div>
    </div>
  );
};

const CaseTimeline = ({ isVisible }) => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const items = [
      'Webhook Received: Cortex XDR',
      'Entity Enriched: VirusTotal',
      'IP Reputation: High Risk',
      'Host Quarantine: OK',
      'Ticket Created: Jira Security',
      'Analyst Notified: Slack',
      'Firewall Rule Applied: Palo Alto',
      'User reset: Active Directory'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setActions(prev => {
        const next = [...prev];
        if (next.length > 5) next.shift();
        next.push({ id: Date.now(), text: items[i] });
        i = (i + 1) % items.length;
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-white/5 overflow-hidden p-6 font-mono text-xs">
      <div className="text-blue-500 mb-4 flex items-center gap-2">
        <Terminal className="w-4 h-4" />
        LIVE_ORCHESTRATION_LOG.SH
      </div>
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="flex items-center gap-3 animate-in slide-in-from-left duration-500">
            <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-emerald-400">SUCCESS</span>
            <span className="text-white/70">{action.text}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
};

const SOAREngineDetail = ({ setView }) => {
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-50, 50)',
        x: 'random(-50, 50)',
        duration: 'random(4, 8)',
        repeat: -1,
        yoyo: true,
        ease: "none"
      });

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          gsap.to(entry.target.querySelectorAll('.animate-on-scroll'), {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
          });
        }
      }, { threshold: 0.1 });

      if (contentRef.current) observer.observe(contentRef.current);
      return () => observer.disconnect();
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#020205] text-white relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
          <Workflow className="w-4 h-4 group-hover:-rotate-90 transition-transform" />
          Back to Grid
        </button>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">ORCHESTRATOR ACTIVE</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-blue-500/20 mb-6 sm:mb-8 md:mb-12">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400">Automated Security Operations</span>
        </div>
        <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.75] uppercase italic mb-6 sm:mb-8 md:mb-12">
          SOAR <span className="text-blue-500">ENGINE</span>
        </h1>
        <p className="text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed mb-8 sm:mb-12 md:mb-16">
          Orchestrate at wire speed. Automated response workflows that connect your entire security ecosystem, slashing MTTR from hours to seconds.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="https://soarengine.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-blue-600 rounded-[2rem] font-black text-xs tracking-[0.4em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-blue-600/40">
            Launch Orchestrator
          </a>
          <div className="px-12 py-6 glass rounded-[2rem] font-black text-xs tracking-[0.4em] uppercase flex items-center gap-3">
            <Link className="w-4 h-4 text-blue-400" />
            500+ App Connectors
          </div>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Connectors', value: '500+' },
            { label: 'Automated Playbooks', value: '1.2K' },
            { label: 'MTTR Reduction', value: '98%' },
            { label: 'Operational Speed', value: 'ms' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-5xl font-black mb-2 group-hover:text-blue-500 transition-colors uppercase italic">{m.value}</div>
              <div className="text-[8px] font-black tracking-[0.3em] uppercase text-white/20">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Workspace */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <PlaybookExecutive isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ConnectorGrid isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <MTTRTracker isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <CaseTimeline isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {[
            { title: 'Zero-Code Flow', desc: 'Build complex logic gates and multi-app workflows using our drag-and-drop visual orchestrator—no coding required.', icon: Terminal },
            { title: 'Auto-Containment', desc: 'Instantly triggers firewall blocks, account resets, and host isolation across your multi-vendor environment.', icon: Lock },
            { title: 'Unified Cases', desc: 'Unified case management that keeps analysts, management, and legal teams synchronized during high-pressure events.', icon: Layers }
          ].map((f, i) => (
            <div key={i} className="group text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform">
                <f.icon className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 italic uppercase underline underline-offset-8 decoration-blue-500/30">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-lg">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="relative z-10 px-4 sm:px-6 md:px-8 py-32 sm:px-40 md:py-60 border-t border-white/5 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black italic tracking-tighter uppercase mb-10 sm:mb-16 md:mb-20 leading-none">
            Stop Searching<br />Start <span className="text-blue-500">Responding</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button onClick={() => setView('home')} className="px-20 py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
              Return Home
            </button>
            <a href="https://soarengine.maula.ai" target="_blank" rel="noopener noreferrer" className="px-20 py-10 bg-blue-600 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
              Deploy Playbooks <ArrowRight className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SOAREngineDetail;

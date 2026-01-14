
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Signal,
  Globe,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Network,
  Database,
  Terminal,
  Server,
  Cloud,
  Cpu,
  Eye,
  Settings,
  XCircle,
  Hash
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for DNS Firewall
const DnsQueryStream = ({ isVisible }) => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const isMalicious = Math.random() > 0.8;
      const id = Math.random();
      setQueries(prev => [...prev.slice(-10), { id, isMalicious, label: isMalicious ? 'malicious.cc' : 'safe-api.com' }]);
    }, 800);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-cyan-500/20 overflow-hidden p-8 flex flex-col justify-center">
      <div className="flex items-center justify-between mb-8">
        <Server className="w-10 h-10 text-cyan-400" />
        <div className="flex-1 h-[2px] bg-slate-800 mx-8 relative">
           <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 px-4 py-1 glass rounded-full text-[8px] font-black uppercase text-cyan-400">DNS Filtering Engine</div>
        </div>
        <Globe className="w-10 h-10 text-white/20" />
      </div>
      <div className="flex flex-col gap-2 overflow-hidden h-40">
        {queries.map((q) => (
          <div key={q.id} className={`flex items-center justify-between px-4 py-2 rounded-lg border animate-in slide-in-from-left duration-500 ${q.isMalicious ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400'}`}>
            <span className="text-[10px] font-mono tracking-wider italic uppercase">{q.label}</span>
            {q.isMalicious ? <XCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
        ))}
      </div>
      <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Live Request Stream</div>
    </div>
  );
};

const DnsTunnelDetector = ({ isVisible }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setVal(v => (v > 90 ? 0 : v + Math.random() * 20));
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#0c1421] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative group p-10">
         <div className="absolute inset-0 border-2 border-dashed border-cyan-500/20 rounded-full animate-spin-slow" />
         <Terminal className={`w-16 h-16 transition-colors duration-500 ${val > 70 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
      </div>
      <div className="mt-8 w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
         <div className={`h-full transition-all duration-1000 ${val > 70 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]'}`} style={{ width: `${val}%` }} />
      </div>
      <div className="mt-6 text-center">
         <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-2">Entropy Analysis</div>
         <div className={`text-3xl font-black italic uppercase transition-colors ${val > 70 ? 'text-red-500' : 'text-cyan-400'}`}>
            {val > 70 ? 'TUNNEL_DETECTED' : 'NORMAL_FLOW'}
         </div>
      </div>
    </div>
  );
};

const DohEncryptionVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-slate-900/40 rounded-3xl border border-cyan-500/20 overflow-hidden p-8 flex items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-4 group">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-500/40 transition-all">
          <Hash className="w-10 h-10 text-white/40" />
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">UDP 53</div>
      </div>
      <div className="flex-1 h-32 relative">
         <div className="absolute inset-0 flex items-center">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
         </div>
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 bg-slate-900 rounded-full border border-cyan-500 shadow-[0_0_20px_#22d3ee20]">
              <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
         </div>
      </div>
      <div className="flex flex-col items-center gap-4 group">
        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 group-hover:shadow-[0_0_30px_#22d3ee20] transition-all">
          <ShieldCheck className="w-10 h-10 text-cyan-400" />
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400">DNS-over-HTTPS</div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">Secure Resolver Protocol</div>
    </div>
  );
};

const ThreatIntelMapVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="relative w-64 h-40">
         <Globe className="w-full h-full text-cyan-500/10 animate-pulse" />
         <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
         <div className="absolute bottom-20 right-10 w-2 h-2 bg-red-500 rounded-full animate-ping" />
         <div className="absolute top-20 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
      </div>
      <div className="mt-10 flex gap-4 sm:gap-6 md:gap-10">
         <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-white italic uppercase">430M</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400">IoCs Synced</div>
         </div>
         <div className="flex flex-col items-center border-l border-white/10 pl-10">
            <div className="text-2xl font-black text-white italic uppercase">2.4ms</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Update Latency</div>
         </div>
      </div>
      <Database className="absolute top-4 right-4 w-6 h-6 text-white/10" />
    </div>
  );
};

const DNSFirewallDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#02040a] text-white relative overflow-hidden font-sans italic selection:bg-cyan-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-cyan-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] bg-element" />
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
        <div className="flex gap-4 items-center border border-cyan-500/20 px-4 py-1.5 rounded-full bg-cyan-500/5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">DNS Filtering Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-cyan-500/20 mb-6 sm:mb-8 md:mb-12">
          <Signal className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-cyan-400">Protective DNS Layer</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          DNS<br /><span className="text-cyan-500">FIREWALL</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Block malicious domains at the resolution layer. Prevent malware callbacks and data exfiltration through intelligent DNS interception.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://dnsfirewall.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-cyan-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-cyan-500/40">
            Secure Resolution
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Global Nodes <Globe className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="relative z-10 border-y border-white/5 bg-white/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Domains Blocked', val: '10M+' },
            { label: 'Resolution Time', val: '<5ms' },
            { label: 'Uptime', val: '99.9%' },
            { label: 'DoH Support', val: 'FULL' }
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
            <DnsQueryStream isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DnsTunnelDetector isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <DohEncryptionVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ThreatIntelMapVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24">
          {[
            { title: 'Threat Intelligence', icon: Activity, desc: 'Real-time synchronization with global threat feeds to block malicious domains, phishing sites, and C2 servers instantly.' },
            { title: 'Tunnel Detection', icon: Network, desc: 'Advanced entropy analysis to identify and block covert DNS tunnels used for data exfiltration and bypassing firewalls.' },
            { title: 'Privacy First', icon: Lock, desc: 'Support for DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) ensures your DNS queries remain encrypted and private.' }
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
          SECURE YOUR<br /><span className="text-cyan-500">QUERIES</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://dnsfirewall.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-cyan-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Protect Network <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DNSFirewallDetail;

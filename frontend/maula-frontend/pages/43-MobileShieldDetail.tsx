
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Eye,
  Scan,
  Fingerprint,
  MessageSquare,
  Globe,
  Wifi,
  Cpu,
  SmartphoneNfc,
  CheckCircle,
  XCircle,
  Hash
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for MobileShield
const AppSandboxVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-pink-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-pink-500/10 rounded-3xl animate-pulse" />
          <div className="absolute inset-2 border-2 border-pink-500/40 rounded-2xl flex items-center justify-center">
             <SmartphoneNfc className="w-12 h-12 text-pink-400" />
          </div>
          <div className="absolute -inset-4 border border-pink-500/10 rounded-[2.5rem] animate-spin-slow" />
       </div>
       <div className="space-y-4 w-full max-w-[200px]">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: isVisible ? '100%' : '0%' }} />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase text-pink-500/40 tracking-[0.2em]">
             <span>Sanitizing</span>
             <span>Runtime Check</span>
          </div>
       </div>
       <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-pink-500/20 tracking-widest">Isolated Environment v8.2</div>
    </div>
  );
};

const SmishingFilterVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#0a050a] rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col pt-12">
       <div className="space-y-4">
          <div className="max-w-[80%] bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 opacity-40">
             <p className="text-[10px] text-white/60">Hey! Your parcel is waiting. Update info at: http://bit.ly/fake-link</p>
          </div>
          <div className={`max-w-[80%] ml-auto p-4 rounded-2xl rounded-tr-none border transition-all duration-1000 ${isVisible ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_#ef444420]' : 'bg-white/5 border-white/10'}`}>
             <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Threat Detected</span>
             </div>
             <p className="text-[10px] text-red-400 font-mono italic">PHISHING_URL_BLOCKED: [REDACTED]</p>
          </div>
       </div>
       <div className="mt-auto text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">SMS/IM Guard</div>
       </div>
    </div>
  );
};

const IdentityShieldVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-pink-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative w-40 h-40">
          <Fingerprint className={`w-full h-full transition-colors duration-1000 ${isVisible ? 'text-pink-500 shadow-[0_0_40px_#ec489920]' : 'text-white/10'}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-pink-500 shadow-[0_0_10px_#ec4899] animate-scanner-move" />
       </div>
       <div className="mt-8 text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">Continuous Authentication</div>
          <div className={`text-2xl sm:text-3xl md:text-4xl font-black italic uppercase transition-colors duration-1000 ${isVisible ? 'text-pink-500' : 'text-white/20'}`}>
             {isVisible ? 'ID_VERIFIED' : 'SCANNING...'}
          </div>
       </div>
    </div>
  );
};

const NetworkScanVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-[#1a0510] to-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative flex flex-col items-center gap-12">
          <div className="flex gap-8">
             <Wifi className={`w-8 h-8 ${isVisible ? 'text-white' : 'text-white/10 text-red-400'}`} />
             <Activity className="w-8 h-8 text-pink-500/40 animate-pulse" />
             <Globe className="w-8 h-8 text-white/10" />
          </div>
          <div className="text-center">
             <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Cellular & Wi-Fi Integrity</div>
             <div className="flex gap-4">
                {['MITM', 'SSLSTRP', 'MAL_DNS'].map((check) => (
                   <div key={check} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-pink-500/60 uppercase">
                      {check}: SAFE
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

const MobileShieldDetail = ({ setView }) => {
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
    <div ref={backgroundRef} className="min-h-screen bg-[#050105] text-white relative overflow-hidden font-sans italic selection:bg-pink-500/30">
      {/* Dynamic BG */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[200px] bg-element" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          Grid Control
        </button>
        <div className="flex gap-4 items-center border border-pink-500/20 px-4 py-1.5 rounded-full bg-pink-500/5 text-pink-400">
          <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_#ec4899] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Mobile Threat Defense Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-pink-500/20 mb-6 sm:mb-8 md:mb-12">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-pink-400">Next-Gen MTD</span>
        </div>
        <h1 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          MOBILE<br /><span className="text-pink-500">SHIELD</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Enterprise security at your fingertips. Advanced app sandboxing, anti-phishing AI, and behavioral device monitoring for the modern workforce.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://mobileshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-pink-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-pink-500/40">
            Secure Devices
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            App Vetting <Scan className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-pink-500/10 bg-pink-500/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Endpoints Secured', val: '842K' },
            { label: 'App Scans', val: '12M' },
            { label: 'Risk Score', val: '0.01' },
            { label: 'Latency', val: '0ms' }
          ].map((m, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl group-hover:text-pink-400 transition-colors uppercase">{m.val}</div>
              <div className="text-[8px] tracking-[0.5em] text-white/20 mt-3 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Epic Visualizers */}
      <section ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-6 sm:mb-8 md:mb-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AppSandboxVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <SmishingFilterVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <IdentityShieldVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <NetworkScanVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Zero-Touch Vet', icon: Cpu, desc: 'Automated ML-based binary analysis of applications to detect privacy leaks and hidden malicious payloads.' },
            { title: 'Anti-Smishing AI', icon: MessageSquare, desc: 'Real-time protection against SMS phishing, WhatsApp scams, and malicious redirects at the OS level.' },
            { title: 'Adaptive Auth', icon: Fingerprint, desc: 'Biometric and behavioral identity checks to ensure only authorized users access enterprise data.' }
          ].map((f, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-10 group-hover:scale-110 transition-transform">
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
        <h2 className="text-6xl sm:text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20">
          SHIELD THE<br /><span className="text-pink-500">FLEET</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://mobileshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-pink-500 text-white rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Guard <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default MobileShieldDetail;

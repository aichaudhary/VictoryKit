
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Wifi,
  Zap,
  ArrowRight,
  RefreshCw,
  Activity,
  Layers,
  Lock,
  Eye,
  Server,
  Network,
  Search,
  CheckCircle,
  XCircle,
  Radio,
  Gamepad,
  Lightbulb,
  Printer,
  Camera,
  Component
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for IoTSentinel
const DeviceRadarVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-[#0a0f0a] rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
         <div className="w-[300px] h-[300px] border border-emerald-500/30 rounded-full" />
         <div className="w-[200px] h-[200px] border border-emerald-500/20 rounded-full absolute" />
         <div className="w-[100px] h-[100px] border border-emerald-500/10 rounded-full absolute" />
      </div>
      <div className="absolute inset-0 animate-spin-slow origin-center flex items-center justify-center">
         <div className="w-[150px] h-[1px] bg-gradient-to-r from-emerald-500 to-transparent absolute left-1/2" />
      </div>
      
      <div className="flex gap-12 relative z-10">
         <div className="group relative">
            <Camera className="w-8 h-8 text-emerald-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
         </div>
         <div className="group relative">
            <Lightbulb className="w-8 h-8 text-red-500" />
            <div className={`absolute -top-1 -right-1 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
               <XCircle className="w-4 h-4 text-red-500 animate-bounce" />
            </div>
         </div>
         <div className="group relative">
            <Printer className="w-8 h-8 text-emerald-500/40" />
         </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/30">Active Discovery Scan</div>
    </div>
  );
};

const FirmwareIntegrityVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black rounded-3xl border border-white/5 overflow-hidden p-8 flex flex-col justify-center">
       <div className="space-y-8 max-w-sm mx-auto w-full">
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/20 tracking-widest">
                <span>Production Firmware Hash</span>
                <span>SHA-256</span>
             </div>
             <div className="p-3 bg-white/5 rounded-lg font-mono text-[10px] text-emerald-400 break-all">
                a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
             </div>
          </div>
          <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/20 tracking-widest">
                <span>Runtime State Check</span>
                <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
             </div>
             <div className={`p-3 rounded-lg font-mono text-[10px] transition-all duration-1000 ${isVisible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-transparent'}`}>
                {isVisible ? 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0' : 'SCANNING_MEMORY_BLOCKS...'}
             </div>
          </div>
          {isVisible && (
            <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-bounce pt-2">
               <ShieldCheck className="w-4 h-4" /> Integrity Verified
            </div>
          )}
       </div>
    </div>
  );
};

const ProtocolTrafficVisual = ({ isVisible }) => {
  const protocols = ['MQTT', 'COAP', 'BACNET', 'HTTP', 'HTTPS', 'LORAWAN', 'ZIGBEE'];
  return (
    <div className="relative w-full h-96 bg-[#050505] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
       <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col gap-1 p-4">
             {[...Array(20)].map((_, i) => (
                <div key={i} className="flex items-center justify-between text-[7px] font-black font-mono animate-scan-up" style={{ animationDelay: `${i * 0.1}s` }}>
                   <span className="text-emerald-500/40">[{Math.random().toString(16).slice(2, 10)}]</span>
                   <span className="text-white/20 italic">{protocols[i % protocols.length]}</span>
                   <span className="text-white/60">OUTGOING_REQUEST --&gt; CLOUD_SRV</span>
                </div>
             ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
       </div>
       <div className="h-16 bg-white/5 border-t border-white/10 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-widest">Protocol Monitor</span>
          </div>
          <div className="text-[10px] font-black text-emerald-500">9.4k PPS</div>
       </div>
    </div>
  );
};

const AutoSegmentationVisual = ({ isVisible }) => {
  return (
    <div className="relative w-full h-96 bg-black/40 rounded-3xl border border-emerald-500/20 overflow-hidden p-8 flex flex-col items-center justify-center">
       <div className="relative w-full h-full flex items-center justify-around">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative transition-all duration-1000" style={{ transform: isVisible ? 'translateX(-40px)' : 'none' }}>
             <Server className="w-10 h-10 text-white/20" />
             <span className="absolute -bottom-8 left-0 text-[8px] font-black uppercase tracking-widest text-white/20">Core NW</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
             <div className={`w-[200px] h-[2px] transition-all duration-1000 ${isVisible ? 'bg-red-500 animate-pulse' : 'bg-emerald-500/20'}`} />
             {isVisible && <Lock className="w-4 h-4 text-red-500 animate-bounce" />}
          </div>

          <div className={`p-6 rounded-3xl border transition-all duration-1000 relative ${isVisible ? 'bg-red-500/10 border-red-500 translate-x-10' : 'bg-white/5 border-white/10'}`}>
             <Gamepad className={`w-10 h-10 ${isVisible ? 'text-red-500' : 'text-white/20'}`} />
             <span className="absolute -bottom-8 left-0 text-[8px] font-black uppercase tracking-widest text-red-500">IoT_QUARANTINE</span>
          </div>
       </div>
       <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-emerald-500/20 tracking-tighter">Micro-Segmentation Policy v4</div>
    </div>
  );
};

const IoTSentinelDetail = ({ setView }) => {
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
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] bg-element" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
        <ParticleNetwork color="#10b981" />
        <DataStream color="#10b981" />
        <ParticleNetwork color="#10b981" />
        <DataStream color="#10b981" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-white transition-all">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
          System Grid
        </button>
        <div className="flex gap-4 items-center border border-emerald-500/20 px-4 py-1.5 rounded-full bg-emerald-500/5 text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase">Sentinel Protocol Active</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 pb-24 sm:pb-32 md:pb-40 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border border-emerald-500/20 mb-6 sm:mb-8 md:mb-12">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-400">Industrial IoT Security</span>
        </div>
        <h1 className="text-[11rem] md:text-[15rem] font-black tracking-tighter leading-[0.75] uppercase mb-8 sm:mb-12 md:mb-16">
          IOT<br /><span className="text-emerald-500">SENTINEL</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/40 max-w-4xl mx-auto font-medium leading-relaxed mb-10 sm:mb-16 md:mb-20 italic">
          Invisible protection for the industrial web. Firmware analysis, micro-segmentation, and zero-trust orchestration for every connected device.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
          <a href="https://iotsentinel.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform shadow-2xl shadow-emerald-500/40">
            Secure Devices
          </a>
          <button className="px-8 sm:px-10 md:px-14 py-4 sm:py-5 md:py-7 glass rounded-full font-black text-xs tracking-[0.5em] uppercase flex items-center gap-3 border border-white/10 hover:bg-white/10 transition-colors">
            Protocol View <Radio className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 border-y border-emerald-500/10 bg-emerald-500/5 backdrop-blur-3xl py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 font-black italic">
          {[
            { label: 'Devices Tracked', val: '228K' },
            { label: 'Protocols Scan', val: '140+' },
            { label: 'Risk Score', val: 'Low' },
            { label: 'Uptime', val: '99.99' }
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
            <DeviceRadarVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <FirmwareIntegrityVisual isVisible={isVisible} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <ProtocolTrafficVisual isVisible={isVisible} />
          </div>
          <div className="opacity-0 translate-y-20 animate-on-scroll">
            <AutoSegmentationVisual isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32 md:py-40 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-24 font-black italic">
          {[
            { title: 'Firmware Deep Scan', icon: Lock, desc: 'Automated binary analysis to detect backdoors, hardcoded keys, and zero-day vulnerabilities in IoT device firmware.' },
            { title: 'Auto-Isolation', icon: Activity, desc: 'Instantly quarantine suspicious devices into dedicated network segments without manual operator intervention.' },
            { title: 'Protocol Forensics', icon: Search, desc: 'Deep Packet Inspection (DPI) for specialized industrial protocols like Modbus, DNP3, and MQTT.' }
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
        <h2 className="text-[11rem] md:text-[16rem] font-black italic tracking-tighter leading-[0.8] uppercase mb-10 sm:mb-16 md:mb-20">
          PROTECT THE<br /><span className="text-emerald-500">MACHINE</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center pt-20">
          <button onClick={() => setView('home')} className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 glass border border-white/10 rounded-full font-black text-xs tracking-[0.5em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://iotsentinel.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 sm:px-16 md:px-24 py-6 sm:py-8 md:py-10 bg-emerald-500 text-black rounded-full font-black text-xs tracking-[0.5em] uppercase hover:scale-105 transition-transform flex items-center gap-4">
            Activate Shield <ArrowRight className="w-7 h-7" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default IoTSentinelDetail;

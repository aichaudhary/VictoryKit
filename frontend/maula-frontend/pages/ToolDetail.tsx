
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { tools } from '../data/tools';
import { 
  ArrowLeft, Shield, Zap, Activity, Fingerprint, Server, Globe, 
  Lock, Eye, Database, Search, ShieldAlert, Cpu, Network, Crosshair,
  Mail, Globe2, Layers, Signal, Terminal
} from 'lucide-react';

const ToolDetail: React.FC = () => {
  const { setView, activeToolId } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const tool = tools.find(t => t.id === activeToolId) || tools[0];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out'
      });

      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeToolId]);

  // Dynamic icon selector based on category
  const getIcon = () => {
    const cat = tool.category.toLowerCase();
    if (cat.includes('detection')) return <ShieldAlert className="w-5 h-5" />;
    if (cat.includes('intelligence')) return <Globe className="w-5 h-5" />;
    if (cat.includes('malware')) return <Activity className="w-5 h-5" />;
    if (cat.includes('phishing')) return <Mail className="w-5 h-5" />;
    if (cat.includes('vulnerability')) return <Search className="w-5 h-5" />;
    if (cat.includes('penetration')) return <Terminal className="w-5 h-5" />;
    if (cat.includes('data')) return <Database className="w-5 h-5" />;
    if (cat.includes('identity')) return <Fingerprint className="w-5 h-5" />;
    if (cat.includes('network')) return <Network className="w-5 h-5" />;
    if (cat.includes('cloud')) return <Server className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const themePrimaryHex = tool.theme.glow.replace('rgba(', '').split(',').slice(0, 3).join(',');
  const primaryTextColor = `text-${tool.theme.primary}`;
  const primaryBgColor = `bg-${tool.theme.primary}`;

  return (
    <div ref={containerRef} className="min-h-screen text-white selection:bg-white/10 font-sans" style={{ backgroundColor: tool.theme.bgStop }}>
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] blur-[150px] rounded-full transition-colors duration-1000" 
          style={{ backgroundColor: `rgba(${themePrimaryHex}, 0.1)` }}
        />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-white/5 blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-24">
          <button 
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <div className="flex items-center gap-4">
             <div className={`w-2 h-2 rounded-full ${primaryBgColor} animate-pulse shadow-[0_0_10px_currentColor]`} />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">{tool.name} v2.0 Tactical Build</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-white/10 backdrop-blur-3xl`}>
                <span className={primaryTextColor}>{getIcon()}</span>
                <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${primaryTextColor}`}>{tool.category}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                {tool.name.split(' ').map((word, i) => (
                  <span key={i} className={i === tool.name.split(' ').length - 1 ? primaryTextColor : ''}>{word} </span>
                ))}
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                {tool.description} Deploying advanced neural heuristics to safeguard your enterprise perimeter.
              </p>
              <div className="flex gap-6 pt-4">
                 <div className={`px-8 py-4 ${primaryBgColor} text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-${tool.theme.primary}/20`}>
                    Status: Active
                 </div>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                    System Health: 100%
                 </div>
              </div>
           </div>
           <div className="relative group">
              <div className={`absolute inset-0 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000`} style={{ backgroundColor: `rgba(${themePrimaryHex}, 0.2)` }} />
              <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                 <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
           </div>
        </div>

        {/* Detailed Metrics */}
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10">
              <div className="space-y-2">
                 <div className={`text-5xl font-black tracking-tighter ${primaryTextColor}`}>{tool.stats.threatsBlocked}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Total Impact</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">{tool.stats.uptime}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">System Latency</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">{tool.stats.accuracy}</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Engine Accuracy</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">GLOBAL</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Deployment Scale</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: "Neural Heuristics", desc: "Proprietary AI modeling trained on 50PB of adversarial traffic logs.", icon: <Cpu className="w-8 h-8" /> },
                { title: "Edge Enforcement", desc: "Automated mitigation triggered at over 200 global points of presence.", icon: <Globe2 className="w-8 h-8" /> },
                { title: "Zero-Trust Mesh", desc: "Every packet is verified through multi-layered cryptographic checks.", icon: <Shield className="w-8 h-8" /> }
              ].map((feature, i) => (
                <div key={i} className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group">
                   <div className={`w-16 h-16 rounded-2xl ${primaryBgColor}/10 flex items-center justify-center ${primaryTextColor} group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                   </div>
                   <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{feature.title}</h3>
                   <p className="text-white/50 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
           </div>

           <div className="space-y-12">
              <div className="flex justify-between items-end">
                 <h2 className="text-6xl font-black tracking-tighter uppercase">Tactical <span className={primaryTextColor}>Renders</span></h2>
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Surveillance Data</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <img src={`https://picsum.photos/seed/${tool.id}1/800/600`} className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visual 1" />
                 <img src={`https://picsum.photos/seed/${tool.id}2/800/600`} className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visual 2" />
                 <img src={`https://picsum.photos/seed/${tool.id}3/800/600`} className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visual 3" />
              </div>
           </div>
        </div>

        {/* Final CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button 
              onClick={() => setView('home')}
              className="w-full md:w-auto px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
           >
              Return Home
           </button>
           <button 
              className={`w-full md:w-auto px-16 py-8 ${primaryBgColor} text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 transition-all flex items-center justify-center gap-4 shadow-2xl`}
           >
              Launch Core <Zap className="w-5 h-5 fill-current" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;

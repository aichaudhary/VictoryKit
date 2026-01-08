
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, ShieldCheck, Zap, BarChart3, Fingerprint, Activity, Server, Globe } from 'lucide-react';

const FraudGuardDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0d0404] text-white selection:bg-red-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-orange-600/5 blur-[180px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-24">
          <button 
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">FraudGuard Alpha Module v9.1</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">Tier 1 Threat Prevention</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85]">
                FRAUD <span className="text-red-500">GUARD</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                The industry standard for real-time transaction integrity. Leveraging proprietary behavioral biometrics and decentralized neural verification to halt fraud at the edge.
              </p>
              <div className="flex gap-6 pt-4">
                 <div className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/20">
                    Live Status: Optimal
                 </div>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                    Latency: 14ms
                 </div>
              </div>
           </div>
           <div className="relative group">
              <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
              <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                 <img 
                    src="https://picsum.photos/seed/fraudguard_deep/1200/1200" 
                    alt="FraudGuard AI Visualized" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0d0404] via-transparent to-transparent opacity-80" />
              </div>
           </div>
        </div>

        {/* Features Content */}
        <div ref={contentRef} className="space-y-40 mb-40">
           {/* Stats Block */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10">
              <div className="space-y-2">
                 <div className="text-5xl font-black text-red-500 tracking-tighter">99.9%</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Detection Accuracy</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">&lt;50ms</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Processing Speed</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">1.2B</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Requests/Day</div>
              </div>
              <div className="space-y-2">
                 <div className="text-5xl font-black text-white tracking-tighter">0%</div>
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">False Positives</div>
              </div>
           </div>

           {/* Technical Deep Dive Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Fingerprint className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold tracking-tight">Behavioral Bio-metrics</h3>
                 <p className="text-white/50 leading-relaxed font-medium">
                    Analysis of user interaction patterns including typing rhythm, mouse velocity, and device orientation to create a unique behavioral footprint.
                 </p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Activity className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold tracking-tight">Real-time Anomaly</h3>
                 <p className="text-white/50 leading-relaxed font-medium">
                    Continuous monitoring of global fraud trends to identify and neutralize zero-day exploits before they affect your enterprise.
                 </p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Server className="w-8 h-8" />
                 </div>
                 <h3 className="text-3xl font-bold tracking-tight">Neural Edge Core</h3>
                 <p className="text-white/50 leading-relaxed font-medium">
                    Decision making logic deployed to over 200 edge locations worldwide for ultra-low latency protection on every continent.
                 </p>
              </div>
           </div>

           {/* Gallery/Showcase */}
           <div className="space-y-12">
              <div className="flex justify-between items-end">
                 <h2 className="text-6xl font-black tracking-tighter">Tactical <span className="text-red-500">Visuals</span></h2>
                 <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Module Renderings</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <img src="https://picsum.photos/seed/fraud1/800/600" className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visualization 1" />
                 <img src="https://picsum.photos/seed/fraud2/800/600" className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visualization 2" />
                 <img src="https://picsum.photos/seed/fraud3/800/600" className="rounded-[2rem] aspect-video object-cover border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Visualization 3" />
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
              className="w-full md:w-auto px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 hover:shadow-[0_20px_60px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-4"
           >
              Launch Tool <Zap className="w-5 h-5 fill-current" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default FraudGuardDetail;

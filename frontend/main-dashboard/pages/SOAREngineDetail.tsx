
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Zap, Activity, Shield, Brain, Terminal, Layers, PlayCircle, Settings } from 'lucide-react';

const SOAREngineDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], { y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out' });
      gsap.from(contentRef.current?.children || [], { y: 100, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#08040d] text-white selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">SOAREngine Auto-Ops v4.8</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
                <PlayCircle className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">Security Orchestration Core</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                SOAR <span className="text-purple-500">ENGINE</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                Orchestrate at wire speed. Automated response workflows that connect your entire security ecosystem, slashing MTTR from hours to seconds.
              </p>
              <div className="flex gap-6 pt-4">
                 <div className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20">Sync Workflows</div>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">Integrations: 500+</div>
              </div>
           </div>
           <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://picsum.photos/seed/soar/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Tool Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
           </div>
        </div>
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
              <div><div className="text-5xl font-black text-purple-500">500+</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">App Connectors</div></div>
              <div><div className="text-5xl font-black text-white">90%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">MTTR Reduction</div></div>
              <div><div className="text-5xl font-black text-white">95%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Auto-Enforcement</div></div>
              <div><div className="text-5xl font-black text-white">VISUAL</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Editor Flow</div></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Settings className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Dynamic Playbooks</h3>
                 <p className="text-white/50 leading-relaxed">Build complex logic gates and multi-app workflows using our drag-and-drop visual orchestrator—no coding required.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Terminal className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Auto-Containment</h3>
                 <p className="text-white/50 leading-relaxed">Instantly triggers firewall blocks, account resets, and host isolation across your multi-vendor environment.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Layers className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Case Orchestration</h3>
                 <p className="text-white/50 leading-relaxed">Unified case management that keeps analysts, management, and legal teams synchronized during high-pressure events.</p>
              </div>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Return Home</button>
           <button className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center">Run Workflows <Zap className="w-5 h-5 fill-current" /></button>
        </div>
      </div>
    </div>
  );
};

export default SOAREngineDetail;

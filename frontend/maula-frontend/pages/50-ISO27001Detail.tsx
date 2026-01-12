
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Award, Zap, Shield, FileCheck, ClipboardList, Lock } from 'lucide-react';

const ISO27001Detail: React.FC = () => {
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
    <div ref={containerRef} className="min-h-screen bg-[#0d0a04] text-white selection:bg-amber-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">ISO27001 v3.0</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">ISO Certification</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                ISO <span className="text-amber-500">27001</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                ISO 27001 certification automation with ISMS management and control implementation.
              </p>
              <div className="flex gap-6 pt-4">
                 <a href="https://iso27001.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-amber-500/20">Start ISMS</a>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">114 Controls</div>
              </div>
           </div>
           <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://picsum.photos/seed/iso27001/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Tool Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
           </div>
        </div>
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
              <div><div className="text-5xl font-black text-amber-500">114</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Controls Mapped</div></div>
              <div><div className="text-5xl font-black text-white">100%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Annex A Coverage</div></div>
              <div><div className="text-5xl font-black text-white">CONT</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Improvement</div></div>
              <div><div className="text-5xl font-black text-white">CERT</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Ready</div></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><ClipboardList className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">ISMS Framework</h3>
                 <p className="text-white/50 leading-relaxed">Complete Information Security Management System with policy templates and procedure documentation.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Lock className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Control Library</h3>
                 <p className="text-white/50 leading-relaxed">Pre-built Annex A control implementations with evidence templates and audit checklists.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><FileCheck className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Risk Treatment</h3>
                 <p className="text-white/50 leading-relaxed">Risk assessment and treatment planning with Statement of Applicability generation.</p>
              </div>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Return Home</button>
           <a href="https://iso27001.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center">Start Certification <Zap className="w-5 h-5 fill-current" /></a>
        </div>
      </div>
    </div>
  );
};

export default ISO27001Detail;

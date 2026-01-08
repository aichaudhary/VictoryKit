
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, CreditCard, Zap, Activity, Shield, Search, Database, Lock, ShieldCheck } from 'lucide-react';

const PCIDSSDetail: React.FC = () => {
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
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">PCIDSSGuard v4.0.1</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">Cardholder Data Protector</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                PCI <span className="text-amber-500">DSS</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                Payment security assured. Complete PCI-DSS compliance management for cardholder data environments (CDE) with real-time network monitoring and segmentation audit.
              </p>
              <div className="flex gap-6 pt-4">
                 <div className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-amber-500/20">Analyze CDE</div>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">Support: SAQ Ready</div>
              </div>
           </div>
           <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://picsum.photos/seed/pcidss/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Tool Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
           </div>
        </div>
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
              <div><div className="text-5xl font-black text-amber-500">ALL 12</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Req Groups</div></div>
              <div><div className="text-5xl font-black text-white">REAL</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Time Segmentation</div></div>
              <div><div className="text-5xl font-black text-white">ASV</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Scanner Ready</div></div>
              <div><div className="text-5xl font-black text-white">100%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Audit Compliance</div></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Database className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">CDE Discovery</h3>
                 <p className="text-white/50 leading-relaxed">Automatically identifies and boundaries the Cardholder Data Environment to minimize your organizational audit scope.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Lock className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Tokenization Guard</h3>
                 <p className="text-white/50 leading-relaxed">Verifies that PAN data is tokenized before storage and that original clear-text values never leave the secure enclave.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><ShieldCheck className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Network Monitor</h3>
                 <p className="text-white/50 leading-relaxed">Real-time alerts for unauthorized ingress or egress traffic from the CDE, automatically blocking unapproved protocols.</p>
              </div>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Return Home</button>
           <button className="px-16 py-8 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center">Sync CDE <Zap className="w-5 h-5 fill-current" /></button>
        </div>
      </div>
    </div>
  );
};

export default PCIDSSDetail;

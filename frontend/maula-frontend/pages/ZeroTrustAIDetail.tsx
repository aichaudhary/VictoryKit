
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Zap, Shield, Network, UserCheck, ShieldCheck } from 'lucide-react';

const ZeroTrustAIDetail: React.FC = () => {
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
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">ZeroTrust v4.0</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">Zero Trust Architecture</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                ZERO <span className="text-purple-500">TRUST</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                Zero trust network architecture implementation with micro-segmentation, continuous verification, and least-privilege access controls.
              </p>
              <div className="flex gap-6 pt-4">
                 <a href="https://zerotrust.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20">Deploy ZTNA</a>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">Trust: Never</div>
              </div>
           </div>
           <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://picsum.photos/seed/zerotrust/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Tool Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
           </div>
        </div>
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
              <div><div className="text-5xl font-black text-purple-500">100%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Verification</div></div>
              <div><div className="text-5xl font-black text-white">Micro</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Segmentation</div></div>
              <div><div className="text-5xl font-black text-white">Least</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Privilege</div></div>
              <div><div className="text-5xl font-black text-white">Always</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Verify</div></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><UserCheck className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Continuous Auth</h3>
                 <p className="text-white/50 leading-relaxed">Every access request is verified regardless of source with multi-factor and context-aware authentication.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Network className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Micro-Segmentation</h3>
                 <p className="text-white/50 leading-relaxed">Granular network segments around every workload preventing lateral movement in case of breach.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Shield className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Least Privilege</h3>
                 <p className="text-white/50 leading-relaxed">Dynamic access controls that grant minimum necessary permissions based on real-time context.</p>
              </div>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Return Home</button>
           <a href="https://zerotrust.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center">Implement ZTNA <Zap className="w-5 h-5 fill-current" /></a>
        </div>
      </div>
    </div>
  );
};

export default ZeroTrustAIDetail;

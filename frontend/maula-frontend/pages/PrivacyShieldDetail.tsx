
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Server, Zap, RefreshCw, Database, Clock, Map } from 'lucide-react';

const DRPlanDetail: React.FC = () => {
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
    <div ref={containerRef} className="min-h-screen bg-[#030408] text-white selection:bg-blue-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">DRPlan v3.0</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
           <div ref={heroTextRef} className="space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-blue-500/20 backdrop-blur-3xl">
                <Server className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500">Disaster Recovery</span>
              </div>
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
                DR <span className="text-blue-500">PLAN</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
                Disaster recovery planning with automated failover and business continuity management.
              </p>
              <div className="flex gap-6 pt-4">
                 <a href="https://privacyshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-blue-500/20">Test Failover</a>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">RTO: &lt;15min</div>
              </div>
           </div>
           <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://picsum.photos/seed/drplan45/1200/1200" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Tool Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
           </div>
        </div>
        <div ref={contentRef} className="space-y-40 mb-40">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
              <div><div className="text-5xl font-black text-blue-500">&lt;15min</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Recovery Time</div></div>
              <div><div className="text-5xl font-black text-white">99.99%</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Uptime SLA</div></div>
              <div><div className="text-5xl font-black text-white">AUTO</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Failover</div></div>
              <div><div className="text-5xl font-black text-white">GLOBAL</div><div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Replication</div></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><RefreshCw className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Auto Failover</h3>
                 <p className="text-white/50 leading-relaxed">Automatic failover to secondary sites with zero manual intervention required.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Database className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Data Replication</h3>
                 <p className="text-white/50 leading-relaxed">Real-time synchronous and asynchronous replication across multiple regions.</p>
              </div>
              <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Map className="w-8 h-8" /></div>
                 <h3 className="text-3xl font-bold">Runbook Automation</h3>
                 <p className="text-white/50 leading-relaxed">Automated runbook execution for consistent and tested recovery procedures.</p>
              </div>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Return Home</button>
           <a href="https://privacyshield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-blue-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center">Launch DR Test <Zap className="w-5 h-5 fill-current" /></a>
        </div>
      </div>
    </div>
  );
};

export default DRPlanDetail;

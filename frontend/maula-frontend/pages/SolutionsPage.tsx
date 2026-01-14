
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Rocket, Zap, Target, Globe, Server, UserCheck } from 'lucide-react';

const SolutionsPage: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(heroTextRef.current?.children || [], {
      y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out'
    });
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#02000a] text-white font-sans">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-24">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>
        
        <div ref={heroTextRef} className="space-y-10 mb-40">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-blue-500/20 backdrop-blur-3xl">
             <Rocket className="w-4 h-4 text-blue-500" />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500">Tailored Defense</span>
           </div>
           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
             INDUSTRY <span className="text-blue-500">SOLUTIONS</span>
           </h1>
           <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-2xl">
             Whether you're in FinTech, Healthcare, or SaaS, Maula AI provides specialized configurations to meet your specific compliance and threat profiles.
           </p>
        </div>

        <div className="space-y-16 mb-40">
          {[
            { name: "Financial Services", icon: <Target className="text-emerald-400" />, desc: "High-frequency fraud detection and PCI-DSS compliance modules." },
            { name: "Healthcare Ops", icon: <UserCheck className="text-purple-400" />, desc: "PHI protection and HIPAA-validated encryption meshes." },
            { name: "SaaS Infrastructure", icon: <Globe className="text-blue-400" />, desc: "Global edge perimeters and multi-cloud CSPM orchestration." },
            { name: "Public Sector", icon: <Server className="text-amber-400" />, desc: "FIPS-compliant KMS and immutable audit trail vaults." }
          ].map((sol, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-12 glass p-16 rounded-[4rem] border border-white/5 hover:bg-white/[0.03] transition-all">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center shrink-0">
                {/* 
                  Fix: Provide a more specific prop type to React.ReactElement to resolve TS error with React.cloneElement
                  where it was complaining that 'className' does not exist on Partial<unknown>.
                */}
                {React.cloneElement(sol.icon as React.ReactElement<{ className?: string }>, { className: 'w-10 h-10' })}
              </div>
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-4xl font-bold">{sol.name}</h3>
                <p className="text-white/50 text-xl leading-relaxed">{sol.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Explore Tools</button>
           <button onClick={() => setView('pricing')} className="px-16 py-8 bg-blue-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4">View Plans <Zap className="w-5 h-5 fill-current" /></button>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;

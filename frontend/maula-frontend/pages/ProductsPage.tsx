
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Box, Zap, Shield, Cpu, Code, Database, Terminal } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(heroTextRef.current?.children || [], {
      y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out'
    });
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#02000a] text-white font-sans selection:bg-purple-500/30">
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-24">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>
        
        <div ref={heroTextRef} className="space-y-10 mb-40">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
             <Box className="w-4 h-4 text-purple-500" />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-500">The MAULA Ecosystem</span>
           </div>
           <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
             OUR <span className="text-purple-500">PRODUCTS</span>
           </h1>
           <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-2xl">
             From autonomous edge defense to cloud-native SIEM orchestration, our suite of tools represents the pinnacle of AI-driven cybersecurity.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
          {[
            { title: "Core Modules", desc: "50 autonomous tools ranging from IAM to DR planning.", icon: <Shield /> },
            { title: "AI Forge", desc: "Custom LLM training for organization-specific threat hunting.", icon: <Cpu /> },
            { title: "Secure API", desc: "One interface to control your entire security posture.", icon: <Code /> },
            { title: "Lattice SIEM", desc: "Decentralized log analysis at petabyte scale.", icon: <Database /> }
          ].map((item, i) => (
            <div key={i} className="glass p-12 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-4xl font-bold mb-4">{item.title}</h3>
              <p className="text-white/50 text-lg leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
           <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">Explore Tools</button>
           <button onClick={() => setView('solutions')} className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4">See Solutions <Zap className="w-5 h-5 fill-current" /></button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

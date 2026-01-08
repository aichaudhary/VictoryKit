
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { tools } from '../data/tools';

gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const heroTool = tools[0];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(sectionRef.current, { opacity: 0, duration: 0.6 })
        .from(titleRef.current, { y: 60, opacity: 0, filter: 'blur(12px)', duration: 0.8, ease: 'power3.out' }, '-=0.2')
        .from(subtitleRef.current, { y: 24, opacity: 0, duration: 0.6 }, '-=0.4')
        .from(statsRef.current?.children || [], { y: 24, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .from(imageRef.current, { x: 50, opacity: 0, scale: 0.95, duration: 0.9, ease: 'power3.out' }, '-=0.6');
    });

    return () => ctx.revert();
  }, []);

  const scrollToTools = () => {
    const heroHeight = window.innerHeight;
    const sectionHeight = window.innerHeight * 2.5;
    window.scrollTo({ top: heroHeight + sectionHeight * 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0c0606] via-[#12060c] to-[#090509] text-white flex items-center"
    >
      <div className="absolute inset-0 opacity-[0.06] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/40" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-black uppercase tracking-[0.25em]">
            • Threat Detection
          </div>

          <div>
            <h1 ref={titleRef} className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white">
              Fraud<span className="text-red-400">Guard</span>
            </h1>
            <p ref={subtitleRef} className="mt-4 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Stop fraud before it starts. AI-powered detection that analyzes patterns in real-time, identifying suspicious activities with 99.9% accuracy.
            </p>
          </div>

          <div ref={statsRef} className="grid grid-cols-3 gap-6 md:gap-10 text-left">
            {[{ label: 'Impact', value: '10M+' }, { label: 'Latency', value: '<50ms Resp' }, { label: 'Accuracy', value: '99.9%' }].map(stat => (
              <div key={stat.label} className="border-l border-white/10 pl-4">
                <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToTools}
              className="bg-red-500 hover:bg-red-600 text-white font-black px-8 py-4 rounded-2xl text-sm tracking-[0.12em] uppercase inline-flex items-center gap-3 shadow-[0_20px_50px_-15px_rgba(239,68,68,0.7)] transition-transform hover:-translate-y-0.5"
            >
              Deploy Module <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-[0.2em]">
              <Shield className="w-4 h-4 text-red-400" /> Trusted by 50+ autonomous modules
            </div>
          </div>
        </div>

        <div ref={imageRef} className="relative">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-red-900/30">
            <img
              src={heroTool.imageUrl}
              alt={heroTool.name}
              className="w-full h-[520px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15">
                <Zap className="w-4 h-4 text-amber-400" /> Real-time Defense
              </span>
              <span className="px-3 py-2 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 font-semibold">Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

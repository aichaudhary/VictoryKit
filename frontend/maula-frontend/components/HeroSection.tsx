
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldAlert, Zap, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const orbRef1 = useRef<HTMLDivElement>(null);
  const orbRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      const tl = gsap.timeline();
      tl.from([orbRef1.current, orbRef2.current], {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'elastic.out(1, 0.5)'
      })
      .from(titleRef.current, {
        y: 100,
        filter: 'blur(20px)',
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
      }, "-=0.8")
      .from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8
      }, "-=0.6")
      .from(statsRef.current?.children || [], {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, "-=0.4");

      // Floating Loop
      gsap.to(orbRef1.current, {
        y: '+=30',
        x: '+=20',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      gsap.to(orbRef2.current, {
        y: '-=40',
        x: '-=30',
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Scroll Exit Animation
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        },
        opacity: 0,
        y: -150,
        scale: 0.95,
        ease: 'none'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Orbs */}
      <div ref={orbRef1} className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
      <div ref={orbRef2} className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full" />

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Zap className="w-3.5 h-3.5" /> Next-Gen AI Infrastructure
        </div>
        
        <h1 ref={titleRef} className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight mb-8">
          MAULA<span className="gradient-text">.AI</span>
        </h1>
        
        <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          The ultimate defensive ecosystem. 50 autonomous security modules protecting your digital enterprise in real-time.
        </p>

        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12 text-center">
          <div className="glass p-6 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">50+</div>
            <div className="text-sm text-gray-500">Security Tools</div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <Lock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">1.2B+</div>
            <div className="text-sm text-gray-500">Threats Neutralized</div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <Zap className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <div className="text-3xl font-bold">0.4ms</div>
            <div className="text-sm text-gray-500">Detection Latency</div>
          </div>
        </div>

        <div className="mt-16">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 px-10 rounded-full text-lg shadow-2xl shadow-purple-900/40 transition-all hover:scale-105">
            Deploy Global Defense
          </button>
          <div className="mt-6 text-gray-600 text-sm">Scroll down to explore modules</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

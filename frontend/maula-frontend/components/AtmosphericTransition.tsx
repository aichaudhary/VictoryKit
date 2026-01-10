
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AtmosphericTransition: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Check if already played this session
  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem('atmosphericPlayed');
    if (alreadyPlayed === 'true') {
      setHasPlayed(true);
    }
  }, []);

  useEffect(() => {
    // Don't set up trigger if already played this session
    if (hasPlayed) return;

    // Trigger when footer enters viewport (top of footer hits bottom of screen)
    const trigger = ScrollTrigger.create({
      trigger: "footer",
      start: "top bottom",
      onEnter: () => {
        if (!isActive && !hasPlayed) {
          setIsActive(true);
          // Mark as played for this session
          sessionStorage.setItem('atmosphericPlayed', 'true');
          setHasPlayed(true);
        }
      },
      // Fade out the entire effect if the user scrolls back up
      onLeaveBack: () => {
        if (isActive) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              setIsActive(false);
              if (requestRef.current) cancelAnimationFrame(requestRef.current);
            }
          });
        }
      }
    });

    return () => {
      trigger.kill();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, hasPlayed]);

  useEffect(() => {
    if (isActive) {
      startSequence();
    }
  }, [isActive]);

  const startSequence = () => {
    const tl = gsap.timeline();

    // Reset initial states for a fresh start
    gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none', backgroundColor: '#000000' });
    gsap.set(textRef.current, { opacity: 0, y: 50, filter: 'blur(20px)' });
    gsap.set(sunRef.current, { opacity: 0, y: '100%', scale: 0.5 });

    // 1. Display Off (Complete Blackout)
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.8,
      ease: "expo.in"
    });

    // 2. Pause in total darkness, then start snow
    tl.add(() => {
      initSnow();
    }, "+=0.8");

    // 3. Deep Night to Early Morning Transition
    tl.to(overlayRef.current, {
      background: "radial-gradient(circle at 50% 100%, #050510 0%, #000000 100%)",
      duration: 4,
      ease: "sine.inOut"
    });

    // 4. Raising Sun (Persistent Early Morning)
    tl.to(sunRef.current, {
      y: "35%", 
      opacity: 0.45,
      scale: 1.6,
      duration: 12,
      ease: "power1.out"
    }, "-=1");

    tl.to(overlayRef.current, {
      background: "radial-gradient(circle at 50% 125%, #ffbd8b 0%, #3a3d5c 35%, #02000a 100%)",
      duration: 10,
      ease: "sine.inOut"
    }, "-=11");

    // 5. Neural Awakening Text Reveal - Appear & then Disappear with same motion
    const textTl = gsap.timeline();
    
    // Phase: Appear
    textTl.to(textRef.current, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 2.5,
      ease: "power3.out"
    });

    // Phase: Hold Clarity
    textTl.to({}, { duration: 4 }); // Simple delay

    // Phase: Disappear (Rising up further while blurring out, same style as appearing)
    textTl.to(textRef.current, {
      opacity: 0,
      y: -50,
      filter: "blur(20px)",
      duration: 2.5,
      ease: "power3.in"
    });

    tl.add(textTl, "-=6");

    // Auto-hide the entire overlay after animation completes
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        setIsActive(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      }
    }, "+=1");
  };

  const initSnow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: any[] = [];
    const count = window.innerWidth < 768 ? 80 : 200;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.5,
        v: Math.random() * 0.6 + 0.1, 
        swing: Math.random() * 1.5,   
        opacity: Math.random() * 0.3 + 0.2
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.v;
        p.x += Math.sin(p.y / 45) * p.swing; 

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
  };

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: '#000000' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* The Sun / Horizon Glow (Persistent) */}
      <div 
        ref={sunRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130vw] h-[100vw] bg-amber-200/20 blur-[200px] rounded-full translate-y-[100%] scale-50 opacity-0"
      />

      {/* The Message (Appears and Vanishes Automatically) */}
      <div ref={textRef} className="relative z-10 text-center space-y-8 px-6 opacity-0 translate-y-12 blur-xl">
         <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[1.8em] text-amber-100/40 ml-[1.8em] animate-pulse">Lattice Optimized</div>
            <div className="h-[1px] w-24 bg-white/10 mx-auto" />
         </div>

         <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] leading-tight">
           NEURAL <span className="text-amber-100">AWAKENING</span>
         </h2>

         <p className="text-white/40 text-sm md:text-lg font-medium tracking-[0.25em] uppercase max-w-2xl mx-auto leading-relaxed italic">
           "In the silence of the storm, the light of protection rises."
         </p>
      </div>

      {/* Atmospheric Mist layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default AtmosphericTransition;


import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SecurityTool } from '../types';
import { useScroll } from '../context/ScrollContext';
import { ArrowRight } from 'lucide-react';
import AIInterface from './AIInterface';
import FraudGuardHomeVisual from './tool-visuals/FraudGuardHomeVisual';
import DarkWebMonitorHomeVisual from './tool-visuals/DarkWebMonitorHomeVisual';
import ZeroDayDetectHomeVisual from './tool-visuals/ZeroDayDetectHomeVisual';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  tool: SecurityTool;
  index: number;
}

const OptimizedToolSection: React.FC<Props> = ({ tool, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const { setCurrentSection, setView } = useScroll();
  
  const [currentImageUrl, setCurrentImageUrl] = useState(tool.imageUrl);
  const pattern = index % 3;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main Entrance Timeline with Scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // Start slightly earlier to allow smooth transition
          start: 'top 100%', 
          end: 'bottom 0%',
          scrub: 1, // Reduced scrub for tighter responsiveness
          onToggle: (self) => {
            if (self.isActive) {
              setCurrentSection(index);
              // Tactical "Arrival" Pulse for the background ghost elements
              gsap.to(ghostRef.current, {
                opacity: 0.08,
                scale: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out'
              });
            } else {
              gsap.to(ghostRef.current, {
                opacity: 0,
                scale: 1.15,
                y: 40,
                duration: 0.8,
                ease: 'power2.in'
              });
            }
          }
        }
      });

      // Perspective & Parallax Orientation
      const isRight = pattern === 1;
      const isCenter = pattern === 2;
      
      const offsetX = isRight ? 120 : (isCenter ? 0 : -120);
      const offsetY = 60;
      const rotY = isRight ? -30 : (isCenter ? 0 : 30);
      const rotX = isCenter ? 20 : 12;

      // Ensure parents have perspective for the 3D effects
      gsap.set([contentRef.current, imgRef.current], { 
        transformPerspective: 2500,
        backfaceVisibility: 'hidden',
        willChange: 'transform, opacity'
      });

      // Content Refinement: Sliding into view with a 3D swivel
      tl.fromTo(contentRef.current, 
        { 
          x: offsetX * 0.5, 
          y: offsetY, 
          opacity: 0.3, // Higher starting opacity for visibility during scroll
          rotateY: rotY,
          rotateX: rotX,
          scale: 0.94,
          filter: 'blur(1px)' // Sharper entrance
        },
        { 
          x: 0, 
          y: 0, 
          opacity: 1, 
          rotateY: 0,
          rotateX: 0,
          scale: 1, 
          filter: 'blur(0px)',
          ease: 'none' // Scrubbing handles the ease
        },
        0
      );

      // Image Refinement: Heavier inverse parallax for depth
      tl.fromTo(imgRef.current,
        { 
          x: -offsetX * 0.8, 
          y: offsetY * 1.5, 
          opacity: 0.3, 
          rotateY: -rotY * 0.4,
          rotateX: -rotX * 0.3,
          scale: 0.88,
          filter: 'blur(2px)'
        },
        { 
          x: 0, 
          y: 0, 
          opacity: 1, 
          rotateY: 0,
          rotateX: 0,
          scale: 1, 
          filter: 'blur(0px)',
          ease: 'none'
        },
        0.05
      );

      // Exit Transition: Pulling away from the viewer
      tl.to([contentRef.current, imgRef.current], {
        opacity: 0,
        y: -150,
        scale: 0.92,
        rotateX: -20,
        filter: 'blur(12px)',
        stagger: 0.05
      }, 0.85);
    });

    return () => ctx.revert();
  }, [index, pattern, setCurrentSection]);

  const handleDeploy = () => {
    const routeMap: Record<number, string> = {
      1: 'fraud-guard', 2: 'dark-web-monitor', 3: 'threat-radar', 4: 'ransom-shield',
      5: 'phish-guard', 6: 'vuln-scan', 7: 'pen-test-ai', 8: 'secure-code',
      9: 'compliance-check', 10: 'data-guardian', 11: 'crypto-shield',
      12: 'iam-control', 13: 'log-intel', 14: 'net-defender', 15: 'endpoint-shield',
      16: 'cloud-secure', 17: 'api-guardian', 18: 'container-watch', 19: 'devsecops',
      20: 'incident-command', 21: 'waf-manager', 22: 'api-shield', 23: 'bot-mitigation',
      24: 'ddos-defender', 25: 'ssl-monitor', 26: 'blue-team-ai', 27: 'siem-commander',
      28: 'soar-engine', 29: 'risk-score-ai', 30: 'policy-engine', 31: 'audit-tracker',
      32: 'zero-trust-ai', 33: 'password-vault', 34: 'biometric-ai', 35: 'email-guard',
      36: 'browser-isolation', 37: 'dns-shield', 38: 'firewall-ai', 39: 'vpn-guardian',
      40: 'wireless-watch', 41: 'iot-secure', 42: 'mobile-defend', 43: 'backup-guard',
      44: 'dr-plan', 45: 'privacy-shield', 46: 'gdpr-compliance', 47: 'hipaa-guard',
      48: 'pcidss-guard', 49: 'bug-bounty-ai', 50: 'cyber-edu-ai'
    };
    
    if (routeMap[tool.id]) {
      setView(routeMap[tool.id] as any);
      // Scroll to top when navigating to detail page
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setView('home');
    }
  };

  const themeClass = `text-${tool.theme.primary}`;
  const themeBgClass = `bg-${tool.theme.primary}`;
  const themeBorderClass = `border-${tool.theme.primary}/10`;

  return (
    <div 
      ref={containerRef}
      id={`tool-section-${tool.id}`}
      className="relative h-[120vh] w-full transition-colors duration-1000 ease-in-out overflow-hidden perspective-2500"
      style={{ 
        backgroundColor: tool.theme.bgStop,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
      }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-8 md:px-24">
        
        {/* Themed Background Glow */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none transition-opacity duration-1000"
          style={{ background: `radial-gradient(circle at 50% 50%, ${tool.theme.glow} 0%, transparent 80%)` }}
        />

        {/* Tactical Ghost Text Layers */}
        <div 
          ref={ghostRef} 
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden opacity-0 scale-[1.15]"
        >
           <div className="w-full flex justify-between px-16 items-center">
             <span className={`text-[15vw] font-black uppercase tracking-tighter ${themeClass} opacity-30 blur-[2px] leading-none`}>
               {tool.category.split(' ')[0]}
             </span>
             <span className={`text-[25vw] font-black uppercase tracking-tighter ${themeClass} opacity-20 blur-[1px] leading-none`}>
               {index + 1}
             </span>
           </div>
        </div>

        <div className={`flex flex-col ${pattern === 0 ? 'md:flex-row' : pattern === 1 ? 'md:flex-row-reverse' : 'items-center text-center max-w-4xl'} gap-12 md:gap-20 w-full max-w-7xl relative z-10`}>
          
          <div ref={contentRef} className="flex-1 space-y-6 will-change-transform">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full glass border ${themeBorderClass}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${themeBgClass} shadow-[0_0_10px_currentColor]`} />
              <span className={`text-[8px] font-black tracking-[0.25em] uppercase ${themeClass}`}>{tool.category}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                {tool.name.split(' ').map((word, i) => (
                  <span key={i} className={i === tool.name.split(' ').length - 1 ? themeClass : ''}>{word} </span>
                ))}
              </h2>
              <p className="text-base md:text-xl font-medium text-white/40 max-w-lg leading-relaxed">
                {tool.description}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/[0.05]">
              <div>
                <div className={`text-2xl md:text-3xl lg:text-4xl font-black ${themeClass}`}>{tool.stats.threatsBlocked}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">Mitigated</div>
              </div>
              <div>
                <div className={`text-2xl md:text-3xl lg:text-4xl font-black ${themeClass}`}>{tool.stats.uptime}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">Response</div>
              </div>
              <div>
                <div className={`text-2xl md:text-3xl lg:text-4xl font-black ${themeClass}`}>{tool.stats.accuracy}</div>
                <div className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">Precision</div>
              </div>
            </div>

            <button onClick={handleDeploy} className={`group flex items-center gap-4 ${themeBgClass} text-white font-black px-12 py-5 rounded-2xl text-[10px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hover:brightness-110`}>
              DEPLOY MODULE <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          <div 
            ref={imgRef} 
            className="flex-1 relative w-full aspect-video md:aspect-square max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] group border border-white/10 will-change-transform"
          >
            {/* Render animated visuals for first 3 tools, static image for others */}
            {tool.id === 1 ? (
              <FraudGuardHomeVisual />
            ) : tool.id === 2 ? (
              <DarkWebMonitorHomeVisual />
            ) : tool.id === 3 ? (
              <ZeroDayDetectHomeVisual />
            ) : (
              <>
                <img 
                  src={currentImageUrl} 
                  alt={tool.name} 
                  className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-115 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
              </>
            )}
            
            {/* AI Interface only for non-animated tools */}
            {tool.id > 3 && (
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <AIInterface currentImageUrl={currentImageUrl} onUpdateImage={set => setCurrentImageUrl(set)} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OptimizedToolSection;

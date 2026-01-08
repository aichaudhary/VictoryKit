
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SecurityTool } from '../types';
import { useScroll } from '../context/ScrollContext';
import { ArrowRight } from 'lucide-react';
import AIInterface from './AIInterface';

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
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 99%', 
          end: 'bottom 1%',
          scrub: 1, 
          onToggle: (self) => {
            if (self.isActive) setCurrentSection(index);
          }
        }
      });

      const entranceX = pattern === 0 ? -50 : pattern === 1 ? 50 : 0;
      const entranceY = 30;

      tl.fromTo(contentRef.current, 
        { x: entranceX, y: entranceY, opacity: 0, scale: 0.99, rotateX: 3, transformPerspective: 1200 },
        { x: 0, y: 0, opacity: 1, scale: 1, rotateX: 0, ease: 'power2.out' },
        0
      );

      if (ghostRef.current) {
        tl.fromTo(ghostRef.current, { y: 80, opacity: 0 }, { y: -30, opacity: 1, ease: 'none' }, 0);
      }

      tl.fromTo(imgRef.current,
        { x: -entranceX * 0.2, y: entranceY * 0.4, opacity: 0, scale: 0.97, rotateY: pattern === 0 ? 8 : -8, transformPerspective: 2000 },
        { x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0, ease: 'expo.out' },
        0.05
      );

      tl.to([contentRef.current, imgRef.current], { opacity: 0, y: -40, scale: 0.99, ease: 'power2.in' }, 0.94);
    });

    return () => ctx.revert();
  }, [index, pattern, setCurrentSection]);

  const handleDeploy = () => {
    const routeMap: Record<number, string> = {
      1: 'fraud-guard', 2: 'intelli-scout', 3: 'threat-radar', 4: 'malware-hunter',
      5: 'phish-guard', 6: 'vuln-scan', 7: 'pen-test-ai', 8: 'secure-code',
      9: 'compliance-check', 10: 'data-guardian', 11: 'crypto-shield',
      12: 'iam-control', 13: 'log-intel', 14: 'net-defender', 15: 'endpoint-shield',
      16: 'cloud-secure', 17: 'api-guardian', 18: 'container-watch', 19: 'devsecops',
      20: 'incident-command', 21: 'forensics-lab', 22: 'threat-intel', 23: 'behavior-watch',
      24: 'anomaly-detect', 25: 'red-team-ai', 26: 'blue-team-ai', 27: 'siem-commander',
      28: 'soar-engine', 29: 'risk-score-ai', 30: 'policy-engine', 31: 'audit-tracker',
      32: 'zero-trust-ai', 33: 'password-vault', 34: 'biometric-ai', 35: 'email-guard',
      36: 'web-filter', 37: 'dns-shield', 38: 'firewall-ai', 39: 'vpn-guardian',
      40: 'wireless-watch', 41: 'iot-secure', 42: 'mobile-defend', 43: 'backup-guard',
      44: 'dr-plan', 45: 'privacy-shield', 46: 'gdpr-compliance', 47: 'hipaa-guard',
      48: 'pcidss-guard', 49: 'bug-bounty-ai', 50: 'cyber-edu-ai'
    };
    
    if (routeMap[tool.id]) {
      setView(routeMap[tool.id] as any);
    } else {
      setView('home');
    }
  };

  const themeClass = `text-${tool.theme.primary}`;
  const themeBgClass = `bg-${tool.theme.primary}`;
  const themeBorderClass = `border-${tool.theme.primary}/30`;
  const themeShadowClass = `shadow-${tool.theme.primary}/20`;

  return (
    <div 
      ref={containerRef} 
      className="relative h-[120vh] w-full overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ 
        backgroundColor: tool.theme.bgStop,
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 1%, black 99%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 1%, black 99%, transparent 100%)'
      }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-8 md:px-24">
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(circle at ${pattern === 0 ? '20% 40%' : pattern === 1 ? '80% 40%' : '50% 50%'}, ${tool.theme.glow} 0%, transparent 60%)` }}
        />

        <div ref={ghostRef} className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden will-change-transform">
           <div className="w-full flex justify-between px-24">
             <span className={`text-[25vw] font-black uppercase tracking-tighter ${themeClass} opacity-[0.02] blur-[0.5px]`}>{tool.category.split(' ')[0]}</span>
             <span className={`text-[25vw] font-black uppercase tracking-tighter ${themeClass} opacity-[0.02] blur-[0.5px]`}>{index + 1}</span>
           </div>
        </div>

        <div className={`flex flex-col ${pattern === 0 ? 'md:flex-row' : pattern === 1 ? 'md:flex-row-reverse' : 'items-center text-center max-w-5xl'} gap-12 md:gap-24 w-full max-w-7xl relative z-10`}>
          <div ref={contentRef} className="flex-1 space-y-10 will-change-transform">
            <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full glass border ${themeBorderClass} backdrop-blur-3xl shadow-2xl`}>
              <div className={`w-1.5 h-1.5 rounded-full ${themeBgClass} shadow-[0_0_10px_currentColor]`} />
              <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${themeClass}`}>{tool.category}</span>
            </div>
            <div className="space-y-6">
              <h2 className="text-7xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-white drop-shadow-xl">
                {tool.name.split(' ').map((word, i) => (
                  <span key={i} className={i === tool.name.split(' ').length - 1 ? themeClass : ''}>{word} </span>
                ))}
              </h2>
              <p className="text-lg md:text-xl font-medium text-white/80 max-w-lg leading-relaxed drop-shadow-sm">{tool.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-10 py-10 border-y border-white/[0.12]">
              <div className="group">
                <div className={`text-2xl md:text-4xl font-black ${themeClass} tracking-tight transition-transform duration-500 group-hover:scale-110 drop-shadow-lg`}>{tool.stats.threatsBlocked}</div>
                <div className="text-[10px] uppercase tracking-[0.35em] font-black text-white/50 mt-3">Impact</div>
              </div>
              <div className="group">
                <div className={`text-2xl md:text-4xl font-black ${themeClass} tracking-tight transition-transform duration-500 group-hover:scale-110 drop-shadow-lg`}>{tool.stats.uptime}</div>
                <div className="text-[10px] uppercase tracking-[0.35em] font-black text-white/50 mt-3">Latency</div>
              </div>
              <div className="group">
                <div className={`text-2xl md:text-4xl font-black ${themeClass} tracking-tight transition-transform duration-500 group-hover:scale-110 drop-shadow-lg`}>{tool.stats.accuracy}</div>
                <div className="text-[10px] uppercase tracking-[0.35em] font-black text-white/50 mt-3">Accuracy</div>
              </div>
            </div>
            <button onClick={handleDeploy} className={`group flex items-center gap-5 ${themeBgClass} text-white font-black px-12 py-6 rounded-2xl text-[12px] tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-2xl hover:brightness-125 hover:shadow-${tool.theme.primary}/40`}>
              DEPLOY MODULE <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <div ref={imgRef} className={`flex-1 relative w-full aspect-square max-w-xl rounded-[4rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] group border border-white/10 will-change-transform ${themeShadowClass}`}>
            <img src={currentImageUrl} alt={tool.name} className="w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-10 left-10 right-10 z-20">
               <AIInterface currentImageUrl={currentImageUrl} onUpdateImage={set => setCurrentImageUrl(set)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedToolSection;

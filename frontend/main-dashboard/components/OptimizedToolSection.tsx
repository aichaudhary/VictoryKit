
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
  const { setCurrentSection } = useScroll();
  
  const [currentImageUrl, setCurrentImageUrl] = useState(tool.imageUrl);
  const pattern = index % 3;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%', 
          end: 'bottom 15%',
          scrub: 1.2,
          onToggle: (self) => {
            if (self.isActive) setCurrentSection(index);
          }
        }
      });

      const entranceX = pattern === 0 ? -40 : pattern === 1 ? 40 : 0;
      const entranceY = 20;

      tl.fromTo(contentRef.current, 
        { x: entranceX, y: entranceY, opacity: 0, filter: 'blur(10px)', scale: 0.99 },
        { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, ease: 'power2.out' },
        0
      );

      if (ghostRef.current) {
        tl.fromTo(ghostRef.current.children,
          { opacity: 0, scale: 1.05 },
          { opacity: 1, scale: 1, ease: 'power1.out' },
          0.1
        );
      }

      tl.fromTo(imgRef.current,
        { x: -entranceX * 0.1, y: entranceY * 0.4, opacity: 0, scale: 0.98 },
        { x: 0, y: 0, opacity: 1, scale: 1, ease: 'power3.out' },
        0.05
      );

      tl.to([contentRef.current, imgRef.current, ghostRef.current], {
        opacity: 0,
        y: -30,
        filter: 'blur(10px)',
        ease: 'power2.in',
        stagger: 0.02
      }, 0.88);
    });

    return () => ctx.revert();
  }, [index, pattern, setCurrentSection]);

  const themeClass = `text-${tool.theme.primary}`;
  const themeBgClass = `bg-${tool.theme.primary}`;
  const themeBorderClass = `border-${tool.theme.primary}/10`;

  return (
    <div 
      ref={containerRef} 
      className="relative h-[110vh] w-full transition-colors duration-1000 ease-in-out overflow-hidden"
      style={{ 
        backgroundColor: tool.theme.bgStop,
        // Smoky "fog" mask for professional section merging
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)'
      }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-8 md:px-24">
        
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${tool.theme.glow} 0%, transparent 70%)` }}
        />

        <div ref={ghostRef} className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
           <div className="w-full flex justify-between px-16">
             <span className={`text-[18vw] font-black uppercase tracking-tighter ${themeClass} opacity-[0.02] blur-[2px]`}>
               {tool.category.split(' ')[0]}
             </span>
             <span className={`text-[18vw] font-black uppercase tracking-tighter ${themeClass} opacity-[0.02] blur-[2px]`}>
               {index + 1}
             </span>
           </div>
        </div>

        <div className={`flex flex-col ${pattern === 0 ? 'md:flex-row' : pattern === 1 ? 'md:flex-row-reverse' : 'items-center text-center max-w-4xl'} gap-12 md:gap-20 w-full max-w-7xl relative z-10`}>
          
          <div ref={contentRef} className="flex-1 space-y-6 will-change-transform">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full glass border ${themeBorderClass}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${themeBgClass} shadow-[0_0_8px_currentColor]`} />
              <span className={`text-[8px] font-black tracking-[0.2em] uppercase ${themeClass}`}>{tool.category}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tighter text-white">
                {tool.name.split(' ').map((word, i) => (
                  <span key={i} className={i === tool.name.split(' ').length - 1 ? themeClass : ''}>{word} </span>
                ))}
              </h2>
              <p className="text-base md:text-lg font-medium text-white/40 max-w-lg leading-relaxed">
                {tool.description}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 py-5 border-y border-white/[0.04]">
              <div>
                <div className={`text-xl md:text-2xl font-black ${themeClass}`}>{tool.stats.threatsBlocked}</div>
                <div className="text-[8px] uppercase tracking-widest font-bold opacity-30">Mitigated</div>
              </div>
              <div>
                <div className={`text-xl md:text-2xl font-black ${themeClass}`}>{tool.stats.uptime}</div>
                <div className="text-[8px] uppercase tracking-widest font-bold opacity-30">Response</div>
              </div>
              <div>
                <div className={`text-xl md:text-2xl font-black ${themeClass}`}>{tool.stats.accuracy}</div>
                <div className="text-[8px] uppercase tracking-widest font-bold opacity-30">Precision</div>
              </div>
            </div>

            <button 
              className={`group flex items-center gap-3 ${themeBgClass} text-white font-black px-10 py-4 rounded-xl text-xs tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer`}
              onClick={() => window.open(tool.url, '_blank')}
            >
              ACTIVATE SHIELD <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div 
            ref={imgRef} 
            className="flex-1 relative w-full aspect-video md:aspect-square max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/5"
          >
            <img 
              src={currentImageUrl} 
              alt={tool.name} 
              className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 z-20">
               <AIInterface currentImageUrl={currentImageUrl} onUpdateImage={set => setCurrentImageUrl(set)} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OptimizedToolSection;

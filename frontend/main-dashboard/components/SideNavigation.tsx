
import React, { useState, useEffect } from 'react';
import { useScroll } from '../context/ScrollContext';
import { tools } from '../data/tools';

const SideNavigation: React.FC = () => {
  const { currentSection, scrollProgress, totalSections, currentTheme } = useScroll();
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // Synchronize targetIndex with arrival at a section
  useEffect(() => {
    if (targetIndex !== null && currentSection === targetIndex) {
      // We've arrived at the clicked section, reset target to trigger the final pulse
      setTargetIndex(null);
    }
  }, [currentSection, targetIndex]);

  const range = 4;
  const start = Math.max(0, currentSection - range);
  const end = Math.min(totalSections - 1, currentSection + range);

  const handleClick = (index: number) => {
    // If clicking the current section, just trigger the pulse again
    if (index === currentSection) {
      setTargetIndex(-1); // Temporary state to force a re-render
      setTimeout(() => setTargetIndex(null), 10);
      return;
    }
    
    setTargetIndex(index);
    const heroHeight = window.innerHeight;
    const sectionHeight = window.innerHeight * 2.5; // Matches OptimizedToolSection height
    
    window.scrollTo({
      top: heroHeight + index * sectionHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`fixed right-8 md:right-12 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-10 transition-all duration-700 ${scrollProgress < 0.01 ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
      
      {/* Scroll Progress Line */}
      <div className="relative h-64 w-[3px] bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full transition-all duration-500 ease-out bg-${currentTheme}`}
          style={{ height: `${scrollProgress * 100}%` }}
        />
        {/* Glowing "Train" Indicator */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full z-20 transition-all duration-300`}
          style={{ 
            top: `${scrollProgress * 100}%`,
            boxShadow: `0 0 20px 4px rgba(255, 255, 255, 0.4)` 
          }}
        />
      </div>

      {/* Modern Dot Indicators */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: totalSections }).map((_, i) => {
          const isActive = i === currentSection;
          const isVisible = i >= start && i <= end;
          const toolTheme = tools[i]?.theme.primary || 'purple-500';
          
          if (!isVisible) return null;

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="group relative flex items-center justify-center h-5 w-5 outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full"
              title={tools[i]?.name}
              aria-label={`Go to ${tools[i]?.name}`}
            >
               {/* Label on Hover */}
               <span className={`absolute right-10 whitespace-nowrap px-3 py-1.5 rounded-lg glass border border-white/10 text-[10px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-[110]`}>
                  {tools[i]?.name}
               </span>

               {/* Hover Ring (only visible on non-active dots) */}
               {!isActive && (
                 <span className={`absolute inset-0 rounded-full border border-${toolTheme} opacity-0 scale-50 group-hover:scale-125 group-hover:opacity-40 transition-all duration-500`} />
               )}

               <span 
                 // Changing the key forces the element to re-mount, triggering the CSS pulse animation
                 // We trigger the pulse when a dot becomes active and is NOT currently being scrolled towards programmatically
                 key={isActive ? `dot-active-${i}-${targetIndex === null}` : `dot-inactive-${i}`}
                 className={`
                   transition-all duration-500 rounded-full cursor-pointer
                   ${isActive 
                      ? `bg-${toolTheme} w-3 h-3 scale-125 shadow-[0_0_15px_currentColor] ${targetIndex === null ? 'animate-arrival' : ''}` 
                      : `bg-white/20 w-1.5 h-1.5 group-hover:w-2.5 group-hover:h-2.5 group-hover:bg-${toolTheme} group-hover:scale-110 opacity-60 group-hover:opacity-100`
                   }
                 `} 
               />
            </button>
          );
        })}
      </div>

      {/* Dynamic Counter */}
      <div className="flex flex-col items-center font-mono">
        <div className={`text-sm font-black transition-colors duration-500 bg-${currentTheme} text-transparent bg-clip-text`}>
          {(currentSection + 1).toString().padStart(2, '0')}
        </div>
        <div className="w-4 h-[1px] bg-white/10 my-1" />
        <div className="text-[10px] font-bold opacity-30">
          {totalSections}
        </div>
      </div>

    </div>
  );
};

export default SideNavigation;

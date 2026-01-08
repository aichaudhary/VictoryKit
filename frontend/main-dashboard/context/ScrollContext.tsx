
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ScrollContextType, ViewState } from '../types';
import { tools } from '../data/tools';

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [view, setViewInternal] = useState<ViewState>('home');
  const [activeToolId, setActiveToolId] = useState<number | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (view !== 'home') {
       window.scrollTo(0, 0);
       return;
    }

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  const setView = (newView: ViewState, toolId?: number) => {
    if (toolId !== undefined) setActiveToolId(toolId);
    setViewInternal(newView);
  };

  const currentTheme = currentSection < 0 ? 'purple-500' : tools[currentSection]?.theme?.primary || 'purple-500';

  return (
    <ScrollContext.Provider value={{
      currentSection,
      scrollProgress,
      isScrolling,
      totalSections: tools.length,
      currentTheme,
      view,
      activeToolId,
      setCurrentSection,
      setScrollProgress,
      setIsScrolling,
      setView
    }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) throw new Error('useScroll must be used within ScrollProvider');
  return context;
};

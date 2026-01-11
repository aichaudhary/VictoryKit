
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
  const [pendingScrollToTool, setPendingScrollToTool] = useState<number | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Check for hash on initial load to scroll to specific tool
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#tool-')) {
      const toolNum = parseInt(hash.replace('#tool-', ''), 10);
      if (!isNaN(toolNum) && toolNum >= 1 && toolNum <= 50) {
        setPendingScrollToTool(toolNum);
        // Clear the hash without triggering navigation
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Scroll to pending tool after page loads
  useEffect(() => {
    if (pendingScrollToTool !== null && view === 'home') {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        const toolElement = document.getElementById(`tool-section-${pendingScrollToTool}`);
        if (toolElement) {
          toolElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback: calculate approximate scroll position based on tool index
          // Each tool section is approximately 120vh
          const approximatePosition = (pendingScrollToTool - 1) * window.innerHeight * 1.2;
          window.scrollTo({ top: approximatePosition, behavior: 'smooth' });
        }
        setPendingScrollToTool(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingScrollToTool, view]);

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

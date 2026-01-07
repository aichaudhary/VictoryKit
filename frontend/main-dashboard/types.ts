
export interface SecurityTool {
  id: number;
  name: string;
  description: string;
  category: string;
  stats: {
    threatsBlocked: string;
    uptime: string;
    accuracy: string;
  };
  imageUrl: string;
  url: string; // Subdomain URL for navigation
  theme: {
    primary: string;    // e.g., 'purple-500'
    secondary: string;  // e.g., 'pink-500'
    glow: string;       // hex or rgba for drop shadows
    bgStop: string;     // bg-color stop for gradient shifts
  };
}

export interface ScrollContextType {
  currentSection: number;
  scrollProgress: number;
  isScrolling: boolean;
  totalSections: number;
  currentTheme: string;
  setCurrentSection: (index: number) => void;
  setScrollProgress: (progress: number) => void;
  setIsScrolling: (status: boolean) => void;
}

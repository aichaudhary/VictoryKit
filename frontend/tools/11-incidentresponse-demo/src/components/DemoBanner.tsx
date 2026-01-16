/**
 * Demo Banner Component
 * Shows that users are in demo mode with call-to-action
 */

import { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface DemoBannerProps {
  onRequestAccess: () => void;
}

export function DemoBanner({ onRequestAccess }: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="demo-banner text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span className="font-medium">
          🎮 You're exploring the <strong>Interactive Demo</strong> — All data is simulated
        </span>
        <button
          onClick={onRequestAccess}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium flex items-center gap-1 transition-all"
        >
          Get Full Access <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 p-1 rounded transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

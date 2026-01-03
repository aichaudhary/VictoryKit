# 🏠 Homepage Architecture & Scrolling Enhancement Guide

> **Last Updated:** January 2, 2026  
> **Version:** 2.0  
> **Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Page Structure Diagram](#page-structure-diagram)
4. [Component Deep Dive](#component-deep-dive)
5. [Current Scrolling System](#current-scrolling-system)
6. [Enhancement Recommendations](#enhancement-recommendations)
7. [Implementation Examples](#implementation-examples)
8. [Performance Optimizations](#performance-optimizations)

---

## 🎯 Overview

The FYZO/MAULA.AI homepage is a **full-page scrolling experience** that showcases all 50 security tools with immersive animations. Built with **Next.js 14**, **GSAP ScrollTrigger**, and **Tailwind CSS**.

### Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework with App Router |
| GSAP + ScrollTrigger | Scroll-based animations |
| Tailwind CSS | Styling |
| Lucide Icons | Icon library |
| TypeScript | Type safety |

### Key Files
```
frontend/main-dashboard/
├── app/
│   └── page.tsx                    # Entry point (dynamic import)
├── components/
│   ├── ScrollHomePage.tsx          # Main orchestrator
│   ├── HeroSection.tsx             # Landing hero
│   ├── OptimizedToolSection.tsx    # Each tool section
│   ├── SideNavigation.tsx          # Right-side progress nav
│   ├── Header.tsx                  # Fixed header
│   ├── Footer.tsx                  # Footer section
│   └── scroll/
│       └── ScrollContext.tsx       # Scroll state management
└── data/
    └── tools.ts                    # 50 tools data
```

---

## 🏗️ Component Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                              page.tsx                                 │
│                    (Dynamic Import with Loading)                      │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        ScrollHomePage.tsx                             │
│              (Main Container + ScrollProvider Wrapper)                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                      ScrollProvider                              │ │
│  │          (Context for scroll state management)                   │ │
│  │                                                                  │ │
│  │   • currentSection: number                                       │ │
│  │   • scrollProgress: 0-1                                          │ │
│  │   • isScrolling: boolean                                         │ │
│  │   • totalSections: 50                                            │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────┐  ┌───────────────────────────────────────────┐ │
│  │     Header      │  │            SideNavigation                  │ │
│  │   (Fixed Top)   │  │           (Fixed Right)                    │ │
│  │                 │  │                                            │ │
│  │ • Logo          │  │  • Progress track (pipe)                   │ │
│  │ • Nav links     │  │  • Train indicator                         │ │
│  │ • CTA buttons   │  │  • Section dots                            │ │
│  │ • Mobile menu   │  │  • Section counter                         │ │
│  └─────────────────┘  └───────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                        HeroSection                               │ │
│  │                    (100vh - First Screen)                        │ │
│  │                                                                  │ │
│  │  • Animated gradient background                                  │ │
│  │  • Floating orbs (GSAP infinite animation)                       │ │
│  │  • Title with blur reveal animation                              │ │
│  │  • Stats cards (animated on load)                                │ │
│  │  • CTA buttons                                                   │ │
│  │  • Exit animation on scroll (parallax fade)                      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     <main> Tool Sections                         │ │
│  │                                                                  │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │           OptimizedToolSection (Tool 01)                   │  │ │
│  │  │                   height: 200vh                            │  │ │
│  │  │                   sticky: 100vh                            │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │           OptimizedToolSection (Tool 02)                   │  │ │
│  │  │                   height: 200vh                            │  │ │
│  │  │                   sticky: 100vh                            │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  │                          ... (50 tools)                          │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │           OptimizedToolSection (Tool 50)                   │  │ │
│  │  │                   height: 200vh                            │  │ │
│  │  │                   sticky: 100vh                            │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                          Footer                                  │ │
│  │                                                                  │ │
│  │  • Logo + description                                            │ │
│  │  • Product links                                                 │ │
│  │  • Company links                                                 │ │
│  │  • Newsletter signup                                             │ │
│  │  • Social links                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Page Structure Diagram

```
SCROLL DISTANCE: ~101 viewports (100vh × 101)

╔══════════════════════════════════════════════════════════════════╗
║                        VIEWPORT (100vh)                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │ HEADER (Fixed)                                    z:50   │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │                                                          │   ║
║  │                    HERO SECTION                          │   ║
║  │                      (100vh)                             │   ║
║  │                                                          │   ║
║  │  🔮 Floating Orbs                                        │   ║
║  │  📝 Title: "maula.ai"                                    │   ║
║  │  📝 Subtitle: "50 AI Security Tools"                     │   ║
║  │  📊 Stats: Tools | Protection | Uptime                   │   ║
║  │  🔘 CTA: Get Started                                     │   ║
║  │                                                          │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                    SCROLL AREA (200vh each)                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  TOOL 01: FraudGuard ────────────────────────────────────────   ║
║  ├── 0-30% scroll: Unboxing animation (rise from below)         ║
║  ├── 30-70% scroll: Content visible (pinned)                     ║
║  └── 70-100% scroll: Exit animation (fade out)                   ║
║                                                                  ║
║  TOOL 02: IntelliScout ──────────────────────────────────────   ║
║  ├── Layout: Alternate (preview on left)                         ║
║  └── Same animation sequence                                     ║
║                                                                  ║
║  ... (Tools 03-49)                                               ║
║                                                                  ║
║  TOOL 50: BugBountyAI ───────────────────────────────────────   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐   ║
║  │                        FOOTER                            │   ║
║  └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

SIDE NAVIGATION (Fixed Right) ─────────────────────────────────────
│
├── Progress Track (vertical line)
├── Train Indicator (moves with scroll)
├── Section Dots (clickable, ±5 visible)
└── Counter: "01/50"
```

---

## 🔍 Component Deep Dive

### 1. **page.tsx** - Entry Point
```tsx
// Dynamic import to avoid SSR issues with GSAP
const ScrollHomePage = dynamic(
  () => import('@/components/ScrollHomePage'),
  { 
    ssr: false,  // ⚠️ Critical: GSAP needs browser APIs
    loading: () => <LoadingSpinner />
  }
);
```

### 2. **ScrollHomePage.tsx** - Orchestrator
| Feature | Description |
|---------|-------------|
| Lazy Loading | Only renders sections within ±2 of current viewport |
| Scroll Tracking | Passive scroll listener for performance |
| GSAP Config | `ignoreMobileResize: true` for mobile stability |
| Refresh Logic | `ScrollTrigger.refresh()` after 500ms load |

### 3. **HeroSection.tsx** - Landing Experience
```
Animation Timeline (on load):
├── 0.0s: Orbs scale in (stagger 0.1s)
├── 0.2s: Title reveal (blur → clear, y: 100 → 0)
├── 0.4s: Subtitle fade in
├── 0.6s: Stats cards bounce in (back ease)
├── 0.8s: CTA button appears
└── ∞: Orbs float continuously (sine.inOut)

Scroll Exit Animation:
├── Title: y → -100, opacity → 0, scale → 0.9
├── Subtitle: y → -80, opacity → 0
├── Stats: y → -60, opacity → 0
├── CTA: y → -40, opacity → 0
└── Orbs: scale → 1.5, opacity → 0
```

### 4. **OptimizedToolSection.tsx** - Each Tool
```
Section Structure:
├── height: 200vh (scroll distance)
├── sticky container: 100vh (visible area)
├── z-index: 50 - index (stacking order)
│
Content Elements:
├── Ghost Number (35vw, opacity 0.08)
├── Preview Image/Animation
├── Headline (tool name)
├── Description
├── Stats (threats blocked, uptime, etc.)
└── CTA Button

Animation Timeline (scroll-linked):
├── 0-30%:  Rise from depth (y: 30vh → 0, blur: 20px → 0)
├── 10-50%: Headline slides in
├── 20-70%: Preview reveals
├── 35-65%: Details appear
├── 45-75%: Stats slide in
├── 55-75%: CTA appears
├── 75-90%: Hold state
└── 90-100%: Exit (fade + scale down)
```

### 5. **SideNavigation.tsx** - Progress Indicator
```
Features:
├── Visibility: Shows after scrolling 50vh
├── Track: Vertical gradient line (purple → pink → blue)
├── Train: White capsule that moves with progress
├── Dots: ±5 sections around current (performance)
└── Counter: "01/50" format at bottom

Click Behavior:
└── Smooth scroll to section (calculated offset)
```

### 6. **ScrollContext.tsx** - State Management
```tsx
interface ScrollContextType {
  currentSection: number;    // Active tool index (0-49)
  scrollProgress: number;    // 0-1 overall progress
  isScrolling: boolean;      // Debounced scroll state
  totalSections: number;     // 50
  setCurrentSection: fn;     // Called by each section
}
```

---

## 🎢 Current Scrolling System

### How It Works

```
User Scrolls
    │
    ▼
┌───────────────────────────────────────────────────┐
│              window.scrollY changes               │
└───────────────────────┬───────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────────┐         ┌─────────────────────┐
│  ScrollContext    │         │  GSAP ScrollTrigger │
│                   │         │                     │
│ • Updates         │         │ • Triggers timeline │
│   scrollProgress  │         │   animations        │
│ • Debounces       │         │ • Scrubs progress   │
│   isScrolling     │         │ • Pins sections     │
└───────────────────┘         └─────────────────────┘
        │                               │
        ▼                               ▼
┌───────────────────┐         ┌─────────────────────┐
│  SideNavigation   │         │ OptimizedToolSection│
│                   │         │                     │
│ • Train position  │         │ • Content opacity   │
│ • Active dot      │         │ • Transform values  │
│ • Section count   │         │ • Blur effects      │
└───────────────────┘         └─────────────────────┘
```

### Current GSAP Configuration

```tsx
// Default easing
gsap.defaults({
  ease: 'power2.out',
  duration: 0.5
});

// ScrollTrigger config
ScrollTrigger.config({
  ignoreMobileResize: true  // Prevents toolbar resize jumps
});

// Section trigger
gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,  // 1 second smoothing
  }
});
```

---

## 🚀 Enhancement Recommendations

### 1. **Smooth Scrolling (Lenis/LocomotiveScroll)**

Replace native scroll with a smooth scrolling library for buttery 60fps experience.

```tsx
// Install: npm install @studio-freight/lenis
import Lenis from '@studio-freight/lenis';

// In ScrollHomePage.tsx
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,           // Scroll duration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease out expo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect to GSAP
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return () => lenis.destroy();
}, []);
```

### 2. **Inertia/Momentum Scrolling**

Add momentum that continues after scroll input stops.

```tsx
// Using GSAP's InertiaPlugin
import { InertiaPlugin } from 'gsap/InertiaPlugin';
gsap.registerPlugin(InertiaPlugin);

// Apply to scroll
gsap.to(window, {
  scrollTo: { y: targetScroll },
  inertia: { y: velocity },
  duration: 0.8,
  ease: 'power3.out'
});
```

### 3. **Parallax Depth Layers**

Add multi-layer parallax for depth perception.

```tsx
// In HeroSection.tsx - add parallax layers
const parallaxLayers = [
  { element: orbsRef, speed: 0.5 },    // Slow - far
  { element: gridRef, speed: 0.3 },    // Slower - very far
  { element: contentRef, speed: 0.8 }, // Fast - close
];

parallaxLayers.forEach(({ element, speed }) => {
  gsap.to(element.current, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
});
```

### 4. **Magnetic Snap Points**

Sections snap to viewport center for better UX.

```tsx
// CSS approach (simple)
.tool-section {
  scroll-snap-align: start;
}
.main-container {
  scroll-snap-type: y proximity;
}

// GSAP approach (more control)
ScrollTrigger.create({
  trigger: section,
  start: 'top 40%',
  end: 'bottom 60%',
  onEnter: () => snapToSection(index),
  onEnterBack: () => snapToSection(index),
});

function snapToSection(index) {
  gsap.to(window, {
    scrollTo: { y: getSectionOffset(index) },
    duration: 0.6,
    ease: 'power2.inOut'
  });
}
```

### 5. **Performance: Virtual Scrolling**

Only render visible sections (already partially implemented).

```tsx
// Enhanced virtual list
const BUFFER = 2;
const sectionHeight = window.innerHeight * 2;

const visibleSections = useMemo(() => {
  const scrollY = window.scrollY;
  const currentIndex = Math.floor((scrollY - heroHeight) / sectionHeight);
  
  return tools.filter((_, i) => 
    i >= currentIndex - BUFFER && i <= currentIndex + BUFFER
  );
}, [scrollPosition]);
```

### 6. **Scroll Progress Indicator Enhancement**

```tsx
// Curved path progress (instead of straight line)
<svg className="side-nav-track" viewBox="0 0 20 400">
  <path
    d="M10,0 Q20,100 10,200 Q0,300 10,400"
    fill="none"
    stroke="rgba(255,255,255,0.1)"
    strokeWidth="2"
  />
  <path
    d="M10,0 Q20,100 10,200 Q0,300 10,400"
    fill="none"
    stroke="url(#gradient)"
    strokeWidth="2"
    strokeDasharray={pathLength}
    strokeDashoffset={pathLength * (1 - scrollProgress)}
  />
</svg>
```

### 7. **GPU-Accelerated Transforms**

```tsx
// Force GPU rendering
const animatedElement = {
  willChange: 'transform, opacity',
  transform: 'translate3d(0, 0, 0)',  // Force GPU layer
  backfaceVisibility: 'hidden',
};

// In GSAP
gsap.set(element, { force3D: true });
```

### 8. **Gesture Support (Touch/Trackpad)**

```tsx
// Detect scroll velocity for animations
let lastScrollY = 0;
let velocity = 0;

const handleScroll = () => {
  velocity = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
  
  // Apply velocity-based effects
  if (Math.abs(velocity) > 50) {
    // Fast scroll - simplify animations
    gsap.globalTimeline.timeScale(2);
  } else {
    gsap.globalTimeline.timeScale(1);
  }
};
```

---

## 💻 Implementation Examples

### Complete Lenis Integration

```tsx
// components/SmoothScroll.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    // Connect Lenis to GSAP
    lenisRef.current.on('scroll', ScrollTrigger.update);

    // Animation frame loop
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Disable GSAP's built-in lag smoothing
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

### Enhanced Tool Section Animation

```tsx
// Enhanced unboxing animation with spring physics
const springConfig = {
  mass: 1,
  stiffness: 100,
  damping: 15,
};

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,  // Faster response
  }
});

// Spring-like entrance
tl.fromTo(contentRef.current, {
  opacity: 0,
  scale: 0.6,
  y: '40vh',
  rotateX: 15,
  transformPerspective: 1200,
}, {
  opacity: 1,
  scale: 1,
  y: 0,
  rotateX: 0,
  ease: 'elastic.out(1, 0.75)',
  duration: 1,
}, 0);

// Staggered children
tl.fromTo([headline, details, stats, cta], {
  opacity: 0,
  y: 60,
  filter: 'blur(10px)',
}, {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  stagger: 0.1,
  ease: 'power3.out',
}, 0.2);
```

---

## ⚡ Performance Optimizations

### Current Optimizations
- [x] Dynamic imports (no SSR for GSAP)
- [x] Lazy section loading (±2 buffer)
- [x] Passive scroll listeners
- [x] `will-change` CSS property
- [x] `ignoreMobileResize` for ScrollTrigger

### Recommended Additions

| Optimization | Impact | Implementation |
|-------------|--------|----------------|
| `content-visibility: auto` | High | CSS on sections |
| `contain: layout paint` | Medium | CSS on containers |
| Throttled scroll handlers | Medium | `requestAnimationFrame` |
| Reduced motion media query | Low | `prefers-reduced-motion` |
| Image lazy loading | High | Next.js `Image` component |
| Font subsetting | Low | Variable fonts |

### Accessibility Considerations

```tsx
// Respect user motion preferences
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(10);  // Instant animations
  // Or disable animations entirely
}
```

---

## 📁 File References

| Component | Path |
|-----------|------|
| Entry Point | `app/page.tsx` |
| Main Container | `components/ScrollHomePage.tsx` |
| Hero | `components/HeroSection.tsx` |
| Tool Section | `components/OptimizedToolSection.tsx` |
| Navigation | `components/SideNavigation.tsx` |
| Header | `components/Header.tsx` |
| Footer | `components/Footer.tsx` |
| Context | `components/scroll/ScrollContext.tsx` |
| Tools Data | `data/tools.ts` |

---

## 🎨 Visual Summary

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ╭─────────────────────────────────────────────────────────╮ │
│   │                    FIXED HEADER                         │ │
│   ╰─────────────────────────────────────────────────────────╯ │
│                                                                │
│   ┌─────────────────────────────────────────────────────┐     │
│   │                                                     │     │
│   │              🌟 HERO SECTION 🌟                     │  ┃  │
│   │                                                     │  ┃  │
│   │         ✨ Floating Orbs Animation ✨               │  ┃  │
│   │                                                     │  ┃  │
│   │              "50 AI Security Tools"                 │  ●  │ ← Side Nav
│   │                                                     │  ┃  │
│   │            [ Get Started Button ]                   │  ┃  │
│   │                                                     │  ┃  │
│   └─────────────────────────────────────────────────────┘  ┃  │
│                                                            ┃  │
│   ┌─────────────────────────────────────────────────────┐  ●  │
│   │                                                     │  ┃  │
│   │  ┌──────────────┐    ┌────────────────────────┐    │  ┃  │
│   │  │              │    │                        │    │  ┃  │
│   │  │   PREVIEW    │    │   Tool Name            │    │  ●  │
│   │  │   ANIMATION  │    │   Description text     │    │  ┃  │
│   │  │              │    │   [ Launch Tool ]      │    │  ┃  │
│   │  │              │    │                        │    │  ┃  │
│   │  └──────────────┘    └────────────────────────┘    │  ●  │
│   │                                                     │  ┃  │
│   │                        01                           │  ┃  │
│   │                    (ghost number)                   │  ┃  │
│   │                                                     │  ┃  │
│   └─────────────────────────────────────────────────────┘  ●  │
│                                                            ┃  │
│   ... (48 more tool sections)                              ┃  │
│                                                            ●  │
│   ╭─────────────────────────────────────────────────────╮     │
│   │                      FOOTER                         │     │
│   ╰─────────────────────────────────────────────────────╯     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

**Built with ❤️ for MAULA.AI / FYZO**

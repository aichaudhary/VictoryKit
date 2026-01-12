import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Zap,
  Shield,
  Lock,
  ShieldOff,
  Search,
  Skull,
  AlertTriangle,
  CheckCircle2,
  Binary,
  FileWarning,
  HardDrive,
  Database,
  Server,
  Cpu,
  Activity,
  Eye,
  Target,
  Crosshair,
} from 'lucide-react';

// Particle System Component
const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? '#ef4444' : '#ffffff',
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(13, 4, 4, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color
          .replace(')', `, ${p.alpha})`)
          .replace('rgb', 'rgba')
          .replace('#ef4444', 'rgba(239, 68, 68')
          .replace('#ffffff', 'rgba(255, 255, 255');
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// Threat Counter Animation
const ThreatCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({
  end,
  suffix = '',
  duration = 2,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};

// Binary Rain Effect
const BinaryRain: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-red-500/30 text-xs font-mono whitespace-nowrap animate-pulse"
          style={{
            left: `${i * 5}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          {[...Array(30)].map((_, j) => (
            <div key={j} style={{ animationDelay: `${j * 0.1}s` }}>
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Scanning Line Effect
const ScanLine: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan opacity-50" />
    </div>
  );
};

const RansomShieldDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [threatDetected, setThreatDetected] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Epic entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Initial blackout then reveal
      tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .from('.hero-badge', { scale: 0, rotation: -180, duration: 0.8 }, 0.3)
        .from(
          '.hero-title span',
          {
            y: 200,
            opacity: 0,
            rotationX: -90,
            transformOrigin: 'top center',
            stagger: 0.1,
            duration: 1.2,
          },
          0.4
        )
        .from('.hero-subtitle', { y: 60, opacity: 0, duration: 1 }, 0.8)
        .from('.hero-buttons > *', { scale: 0, stagger: 0.15, duration: 0.6 }, 1)
        .from(
          shieldRef.current,
          {
            scale: 0,
            rotation: 720,
            opacity: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
          },
          0.6
        );

      // Shield pulse animation
      gsap.to(shieldRef.current, {
        boxShadow:
          '0 0 100px rgba(239, 68, 68, 0.5), 0 0 200px rgba(239, 68, 68, 0.3), inset 0 0 100px rgba(239, 68, 68, 0.1)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating animation for shield
      gsap.to(shieldRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Stats reveal
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
        },
        y: 100,
        opacity: 0,
        scale: 0.8,
        stagger: 0.15,
        duration: 0.8,
      });

      // Features 3D flip
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
        rotationY: 90,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        transformOrigin: 'left center',
      });
    }, containerRef);

    // Activate shield after entrance
    setTimeout(() => setShieldActive(true), 2000);

    // Simulate threat detection
    const threatInterval = setInterval(() => {
      setThreatDetected(true);
      setTimeout(() => setThreatDetected(false), 1000);
    }, 5000);

    return () => {
      ctx.revert();
      clearInterval(threatInterval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0202] text-white selection:bg-red-500/30 font-sans overflow-hidden"
    >
      {/* Particle Background */}
      <ParticleField />

      {/* Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-600/20 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-red-900/10 blur-[250px] rounded-full" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[150px] rounded-full animate-ping"
          style={{ animationDuration: '4s' }}
        />
        <BinaryRain />
        <ScanLine />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Threat Alert Banner */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${threatDetected ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="bg-red-500 text-white py-2 px-4 flex items-center justify-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-bold tracking-wider uppercase">
            Threat Detected &amp; Neutralized
          </span>
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-6 md:px-16 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16 pt-4">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-4 text-[10px] font-black tracking-[0.5em] uppercase text-white/40 hover:text-red-500 transition-all duration-500"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500/20 group-hover:border-red-500/50 transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="hidden md:block">Return to Base</span>
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${shieldActive ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/5 border-white/10 text-white/40'} transition-all duration-500`}
            >
              <div
                className={`w-2 h-2 rounded-full ${shieldActive ? 'bg-green-500 animate-pulse' : 'bg-white/30'}`}
              />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">
                {shieldActive ? 'Shield Active' : 'Initializing'}
              </span>
            </div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">
              v5.4.0
            </span>
          </div>
        </nav>

        {/* Hero Section */}
        <div
          ref={heroRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh] mb-32"
        >
          {/* Left Content */}
          <div className="space-y-10">
            <div className="hero-badge inline-flex items-center gap-4 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-xl">
              <div className="relative">
                <Shield className="w-6 h-6 text-red-500" />
                <div className="absolute inset-0 animate-ping">
                  <Shield className="w-6 h-6 text-red-500 opacity-50" />
                </div>
              </div>
              <span className="text-[11px] font-black tracking-[0.4em] uppercase text-red-400">
                Maximum Ransomware Defense
              </span>
            </div>

            <h1 className="hero-title text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase perspective-1000">
              <span className="block text-white transform-gpu">RANSOM</span>
              <span className="block bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent transform-gpu">
                SHIELD
              </span>
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl text-white/50 font-medium leading-relaxed max-w-xl">
              One small step for your files, one giant leap for cybersecurity.
              <span className="text-red-400"> Zero-day ransomware protection</span> with instant
              recovery capabilities.
            </p>

            <div className="hero-buttons flex flex-wrap gap-6 pt-6">
              <a
                href="https://ransomshield.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black text-sm tracking-[0.3em] uppercase overflow-hidden shadow-[0_20px_60px_-10px_rgba(239,68,68,0.5)] hover:shadow-[0_30px_80px_-10px_rgba(239,68,68,0.7)] transition-all duration-500 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Zap className="w-5 h-5 fill-current" />
                  Activate Shield
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </a>
              <button className="group px-10 py-5 bg-white/5 border-2 border-white/20 text-white rounded-2xl font-black text-sm tracking-[0.3em] uppercase hover:bg-white/10 hover:border-red-500/50 transition-all duration-500 flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Live Demo
              </button>
            </div>

            {/* Live Stats Ticker */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-white/40">Threats Blocked Today:</span>
                <span className="text-lg font-black text-green-500">
                  <ThreatCounter end={847293} />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-sm text-white/40">Active Shields:</span>
                <span className="text-lg font-black text-red-500">
                  <ThreatCounter end={2847} suffix="+" duration={1.5} />
                </span>
              </div>
            </div>
          </div>

          {/* Right - 3D Shield Visual */}
          <div className="relative flex items-center justify-center">
            <div ref={shieldRef} className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
              {/* Orbiting elements */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center backdrop-blur-xl">
                    <Skull className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>
              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: '15s', animationDirection: 'reverse' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center backdrop-blur-xl">
                    <FileWarning className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '25s' }}>
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center backdrop-blur-xl">
                    <Binary className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Shield rings */}
              <div className="absolute inset-8 rounded-full border-2 border-red-500/20 animate-pulse" />
              <div
                className="absolute inset-16 rounded-full border border-red-500/10 animate-ping"
                style={{ animationDuration: '3s' }}
              />
              <div className="absolute inset-24 rounded-full border border-red-500/5" />

              {/* Main Shield */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Hexagonal shield shape using CSS */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-red-600/20 to-red-900/30 backdrop-blur-3xl rounded-[4rem] border-2 border-red-500/40 shadow-[0_0_100px_rgba(239,68,68,0.3),inset_0_0_60px_rgba(239,68,68,0.1)] flex items-center justify-center overflow-hidden">
                    <Shield className="w-32 h-32 md:w-40 md:h-40 text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />

                    {/* Shield status indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full border border-red-500/30">
                      <div
                        className={`w-2 h-2 rounded-full ${shieldActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-bounce'}`}
                      />
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                        {shieldActive ? 'Protected' : 'Scanning'}
                      </span>
                    </div>
                  </div>

                  {/* Scanning effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-[4rem]">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 via-transparent to-transparent animate-scan" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="mb-40">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-red-500/60">
              Real-Time Defense Metrics
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mt-4">Mission Control</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                value: 1000000,
                suffix: '+',
                label: 'Samples Analyzed',
                color: 'red',
              },
              { icon: Skull, value: 500, suffix: '+', label: 'Zero-Days Blocked', color: 'orange' },
              {
                icon: Zap,
                value: 30,
                suffix: 's',
                label: 'Recovery Time',
                prefix: '<',
                color: 'yellow',
              },
              { icon: Shield, value: 99.9, suffix: '%', label: 'Prevention Rate', color: 'green' },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-item group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:bg-red-500/5 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full group-hover:bg-red-500/10 transition-all" />
                <stat.icon className={`w-8 h-8 mb-6 text-${stat.color}-500`} />
                <div className="text-4xl md:text-5xl font-black text-white">
                  {stat.prefix}
                  <ThreatCounter end={stat.value} suffix={stat.suffix} duration={2 + i * 0.3} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-3">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div ref={featuresRef} className="mb-40">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-red-500/60">
              Defense Systems
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mt-4">
              Multi-Layer Protection
            </h2>
            <p className="text-xl text-white/40 mt-6 max-w-2xl mx-auto">
              Like Armstrong's spacesuit protected him on the moon, RansomShield creates an
              impenetrable barrier around your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldOff,
                title: 'Behavioral Analysis',
                description:
                  'AI-powered detection identifies ransomware by behavior patterns like mass encryption and shadow copy deletion before damage occurs.',
                features: ['Pattern Recognition', 'Heuristic Analysis', 'ML Detection'],
              },
              {
                icon: Lock,
                title: 'File Integrity Guard',
                description:
                  'Real-time monitoring of critical files with instant snapshots and automatic rollback on any unauthorized encryption attempts.',
                features: ['Continuous Monitoring', 'Instant Snapshots', 'Auto-Rollback'],
              },
              {
                icon: HardDrive,
                title: 'Instant Recovery',
                description:
                  'Automated backup system restores encrypted files in seconds. Your data is always safe, always recoverable.',
                features: ['30-Second Recovery', 'Zero Data Loss', 'Air-Gapped Backups'],
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card group relative p-10 rounded-[3rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-red-500/40 transition-all duration-700 overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />

                {/* Icon */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-10 h-10 text-red-500" />
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/40 leading-relaxed mb-8">{feature.description}</p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((f, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Visualization */}
        <div className="mb-40 p-12 rounded-[4rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-red-500/60">
              System Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-4">Defense Grid</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            {[
              { icon: Server, label: 'Entry Point' },
              { icon: Eye, label: 'Threat Scan' },
              { icon: Cpu, label: 'AI Analysis' },
              { icon: Shield, label: 'Shield Gate' },
              { icon: Database, label: 'Safe Zone' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group hover:bg-red-500/20 transition-all">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {step.label}
                  </span>
                </div>
                {i < 4 && (
                  <div
                    className="hidden md:block absolute w-12 h-0.5 bg-gradient-to-r from-red-500/50 to-red-500/10"
                    style={{ left: `${20 + i * 20}%` }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className="text-center py-32 border-t border-white/10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
            <Crosshair className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-400">
              Ready for Launch
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Take the First Step
            <br />
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Protect Your World
            </span>
          </h2>

          <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12">
            "That's one small click for you, one giant shield for your data."
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <button
              onClick={() => setView('home')}
              className="px-12 py-6 bg-white/5 border-2 border-white/20 rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 hover:border-white/40 transition-all duration-500 flex items-center gap-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Mission Control
            </button>
            <a
              href="https://ransomshield.maula.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-12 py-6 bg-gradient-to-r from-red-600 to-red-500 rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase overflow-hidden shadow-[0_20px_60px_-10px_rgba(239,68,68,0.5)] hover:shadow-[0_30px_80px_-10px_rgba(239,68,68,0.8)] transition-all duration-500 hover:scale-105 flex items-center gap-4"
            >
              <span className="relative z-10 flex items-center gap-4">
                Launch Shield
                <Zap className="w-6 h-6 fill-current group-hover:animate-bounce" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/5">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            RansomShield • Part of the MAULA.AI Security Ecosystem • Est. 2024
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};

export default RansomShieldDetail;

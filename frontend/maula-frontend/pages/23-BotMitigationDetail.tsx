
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Bot,
  Brain,
  Fingerprint,
  Shield,
  Zap,
  Activity,
  Cpu,
  Network,
  AlertTriangle,
  Eye,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Database,
  Wifi,
  Radar,
  Target,
  Layers,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cloud,
  Code,
  FileText,
  Key,
  User,
  Users,
  Building,
  MapPin,
  Calendar,
  Timer,
  Gauge,
  Thermometer,
  Lightning,
  Protection,
  Visibility,
  Aim,
  Stack,
  Config,
  Chart,
  Pie,
  Line,
  Screen,
  Mobile,
  Tab,
  Computer,
  CloudIcon,
  CodeIcon,
  Document,
  KeyIcon,
  Person,
  Team,
  Office,
  Location,
  Time,
  Meter,
  Temp
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for Bot Mitigation
const BehavioralAnalyzer = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [behaviors, setBehaviors] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const behaviorTypes = ['Mouse Movement', 'Keystroke Pattern', 'Navigation Flow', 'Timing Analysis', 'Interaction Rate'];
    const interval = setInterval(() => {
      setBehaviors(prev => {
        const newBehaviors = [...prev];
        if (newBehaviors.length > 12) newBehaviors.shift();
        newBehaviors.push({
          id: Date.now(),
          type: behaviorTypes[Math.floor(Math.random() * behaviorTypes.length)],
          score: Math.floor(Math.random() * 100),
          isBot: Math.random() > 0.7,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        return newBehaviors;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.behavior-point'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="behaviorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="behaviorGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central ML processor */}
        <circle cx="200" cy="150" r="35" fill="#8b5cf6" filter="url(#behaviorGlow)" className="animate-pulse"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">ML</text>
        <text x="200" y="170" textAnchor="middle" fill="white" fontSize="10">ANALYZER</text>

        {/* Behavior analysis points */}
        <g className="behavior-point">
          {behaviors.map((behavior, index) => (
            <g key={behavior.id}>
              <circle
                cx={behavior.x}
                cy={behavior.y}
                r="10"
                fill={behavior.isBot ? "#ef4444" : "#10b981"}
                filter="url(#behaviorGlow)"
                className={behavior.isBot ? "animate-bounce" : "animate-pulse"}
              />
              <text
                x={behavior.x}
                y={behavior.y + 25}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.8"
              >
                {behavior.type.split(' ')[0]}
              </text>
              <line
                x1={behavior.x}
                y1={behavior.y}
                x2="200"
                y2="150"
                stroke={behavior.isBot ? "#ef4444" : "#10b981"}
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Behavioral Analyzer</h3>
        <div className="text-sm opacity-70">ML-powered bot detection</div>
      </div>
    </div>
  );
};

const DeviceFingerprinter = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [fingerprints, setFingerprints] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const deviceTypes = ['Chrome Headless', 'Firefox Spoofed', 'Safari Bot', 'Edge Automation', 'Custom Script'];
    const interval = setInterval(() => {
      setFingerprints(prev => {
        const newFingerprints = [...prev];
        if (newFingerprints.length > 8) newFingerprints.shift();
        newFingerprints.push({
          id: Date.now(),
          device: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          confidence: Math.floor(Math.random() * 100),
          blocked: Math.random() > 0.2,
          fingerprint: `FP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        });
        return newFingerprints;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.fingerprint-item'),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, fingerprints]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Device Fingerprinter</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {fingerprints.map((fp, index) => (
            <div key={fp.id} className="fingerprint-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Fingerprint className={`w-5 h-5 ${fp.blocked ? 'text-red-500' : 'text-orange-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block text-sm">{fp.device}</span>
                  <span className="text-xs text-white/50">{fp.fingerprint}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{fp.confidence}%</div>
                <div className={`text-xs ${fp.blocked ? 'text-red-400' : 'text-orange-400'}`}>
                  {fp.blocked ? 'Blocked' : 'Flagged'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fingerprint visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2">
          {[0.9, 0.7, 0.8, 0.6, 0.9, 0.5, 0.8, 0.4].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t opacity-60" style={{height: `${height * 40}px`}}></div>
          ))}
        </div>
        <div className="text-xs text-white/50 mt-2 text-center">Device Detection Confidence</div>
      </div>
    </div>
  );
};

const ChallengeEngine = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const challengeTypes = ['Invisible CAPTCHA', 'Behavioral Puzzle', 'Time-based Challenge', 'Device Trust', 'Risk Assessment'];
    const interval = setInterval(() => {
      setChallenges(prev => {
        const newChallenges = [...prev];
        if (newChallenges.length > 10) newChallenges.shift();
        newChallenges.push({
          id: Date.now(),
          type: challengeTypes[Math.floor(Math.random() * challengeTypes.length)],
          passed: Math.random() > 0.3,
          time: Math.floor(Math.random() * 2000) + 100,
          difficulty: Math.random() > 0.8 ? 'Hard' : Math.random() > 0.5 ? 'Medium' : 'Easy'
        });
        return newChallenges;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.challenge-node'),
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible, challenges]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="challengeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Challenge nodes */}
        {challenges.map((challenge, index) => {
          const angle = (index / challenges.length) * Math.PI * 2;
          const radius = 85;
          const x = 200 + Math.cos(angle) * radius;
          const y = 150 + Math.sin(angle) * radius;

          return (
            <g key={challenge.id} className="challenge-node">
              <circle
                cx={x}
                cy={y}
                r="14"
                fill={challenge.passed ? "#06b6d4" : "#ef4444"}
                opacity="0.8"
              />
              <text
                x={x}
                y={y + 30}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.7"
              >
                {challenge.type.split(' ')[0]}
              </text>
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="150"
                stroke={challenge.passed ? "#06b6d4" : "#ef4444"}
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Central challenge engine */}
        <circle cx="200" cy="150" r="28" fill="#06b6d4" opacity="0.3"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">CHALLENGE</text>
        <text x="200" y="168" textAnchor="middle" fill="white" fontSize="8">ENGINE</text>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Challenge Engine</h3>
        <div className="text-sm opacity-70">Smart verification system</div>
      </div>
    </div>
  );
};

const BotClassifier = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [classifications, setClassifications] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const botTypes = ['Web Scraper', 'Credential Stuffing', 'DDoS Bot', 'Content Thief', 'API Abuser'];
    const interval = setInterval(() => {
      setClassifications(prev => {
        const newClassifications = [...prev];
        if (newClassifications.length > 6) newClassifications.shift();
        newClassifications.push({
          id: Date.now(),
          type: botTypes[Math.floor(Math.random() * botTypes.length)],
          severity: Math.random() > 0.8 ? 'Critical' : Math.random() > 0.6 ? 'High' : 'Medium',
          confidence: Math.floor(Math.random() * 30) + 70,
          blocked: Math.random() > 0.1
        });
        return newClassifications;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.classification-alert'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "back.out(1.7)" }
    );
  }, [isVisible, classifications]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Bot Classifier</h3>
        <div className="space-y-3">
          {classifications.map((cls, index) => (
            <div key={cls.id} className="classification-alert flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Bot className={`w-5 h-5 ${cls.severity === 'Critical' ? 'text-red-500' : cls.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block">{cls.type}</span>
                  <span className={`text-xs ${cls.severity === 'Critical' ? 'text-red-400' : cls.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {cls.severity} • {cls.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${cls.blocked ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {cls.blocked ? '✓ Blocked' : '⚠ Flagged'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classification radar effect */}
      <div className="absolute top-4 right-4 w-20 h-20 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.7"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.9"/>
          <circle cx="50" cy="50" r="10" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <line x1="50" y1="50" x2="90" y2="50" stroke="#ef4444" strokeWidth="2" className="animate-pulse">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50;360 50 50"
              dur="2s"
              repeatCount="indefinite"
            />
          </line>
        </svg>
      </div>
    </div>
  );
};

const AnalyticsDashboard = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const metricTypes = ['Bots Blocked', 'False Positives', 'Detection Rate', 'Response Time', 'Throughput'];
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetrics = [...prev];
        if (newMetrics.length > 8) newMetrics.shift();
        newMetrics.push({
          id: Date.now(),
          type: metricTypes[Math.floor(Math.random() * metricTypes.length)],
          value: Math.floor(Math.random() * 100),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        });
        return newMetrics;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.metric-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", transformOrigin: "bottom" }
    );
  }, [isVisible, metrics]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="analyticsGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Analytics bars */}
        {metrics.map((metric, index) => {
          const height = (metric.value / 100) * 150;
          const x = 30 + (index * 40);
          return (
            <g key={metric.id} className="metric-bar">
              <rect
                x={x}
                y={250 - height}
                width="25"
                height={height}
                fill="#10b981"
                opacity="0.8"
              />
              <text
                x={x + 12.5}
                y={270}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.7"
              >
                {metric.type.split(' ')[0]}
              </text>
              <text
                x={x + 12.5}
                y={245 - height}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {metric.value}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Analytics Dashboard</h3>
        <div className="text-sm opacity-70">Bot mitigation metrics</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span>Improving</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
          <span>Declining</span>
        </div>
      </div>
    </div>
  );
};

const BotMitigationDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    botsBlocked: 8750000,
    detectionRate: 99.5,
    avgResponseTime: 3.2,
    falsePositives: 0.02
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        botsBlocked: prev.botsBlocked + Math.floor(Math.random() * 5000),
        detectionRate: Math.max(99.0, prev.detectionRate + (Math.random() - 0.5) * 0.1),
        avgResponseTime: Math.max(1.0, Math.min(10.0, prev.avgResponseTime + (Math.random() - 0.5) * 0.5)),
        falsePositives: Math.max(0.01, Math.min(0.1, prev.falsePositives + (Math.random() - 0.5) * 0.01))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(heroRef.current.querySelectorAll('.hero-element'),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
      );

      // Background animations
      gsap.to(backgroundRef.current.querySelectorAll('.bg-element'), {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        rotation: 'random(-5, 5)',
        duration: 'random(3, 6)',
        ease: "none",
        repeat: -1,
        yoyo: true,
        stagger: 0.5
      });

      // Content animations on scroll
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              gsap.fromTo(entry.target.querySelectorAll('.animate-on-scroll'),
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
              );
            }
          });
        },
        { threshold: 0.1 }
      );

      if (contentRef.current) {
        observer.observe(contentRef.current);
      }

      return () => observer.disconnect();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Epic Background Layers */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl bg-element"></div>

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full bg-element"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to MAULA.AI
          </button>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-500" />
            <span className="font-bold">Bot Mitigation</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="hero-element">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
                  <Bot className="w-4 h-4" />
                  Anti-Bot Defense System
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  Bot <span className="text-purple-500">Mitigation</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  Advanced bot detection and blocking using behavioral analysis,
                  device fingerprinting, and intelligent challenge systems. Stop
                  automated attacks while maintaining seamless user experience.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://botmitigation.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
                >
                  Access Dashboard
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  View Documentation
                </button>
              </div>
            </div>

            <div className="hero-element">
              <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://picsum.photos/seed/botmitigation/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="Bot Mitigation Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium">
                    ML-Powered
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 text-xs font-medium">
                    Zero Friction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Stats */}
      <section className="relative z-10 px-8 py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-purple-500 mb-2">
                {metrics.botsBlocked.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Bots Blocked
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.detectionRate.toFixed(1)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Detection Rate
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.avgResponseTime}ms
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Avg Response
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.falsePositives.toFixed(2)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                False Positives
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Complete <span className="text-purple-500">Bot Protection</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Enterprise-grade bot detection with machine learning, behavioral analysis,
              and intelligent challenge systems for comprehensive automation prevention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Behavioral Analysis</h3>
              <p className="text-white/50 leading-relaxed">
                ML-powered detection analyzing mouse movements, keystroke patterns,
                and navigation behavior to identify automated bots with high accuracy.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Fingerprint className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Device Fingerprinting</h3>
              <p className="text-white/50 leading-relaxed">
                Advanced fingerprinting detecting headless browsers, spoofed user agents,
                and automation frameworks without compromising user privacy.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Challenges</h3>
              <p className="text-white/50 leading-relaxed">
                Invisible challenges that verify humanity without disrupting legitimate
                user experience, adapting difficulty based on risk assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Engine Visualization */}
      <section ref={contentRef} className="relative z-10 px-8 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Bot Mitigation <span className="text-purple-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core components of our advanced bot detection and blocking platform
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-2">99.5%</div>
              <div className="text-sm text-white/70">Detection Accuracy</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-pink-500 mb-2">&lt;5ms</div>
              <div className="text-sm text-white/70">Analysis Time</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-2">10M+</div>
              <div className="text-sm text-white/70">Bots Blocked/Day</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-emerald-500 mb-2">0.02%</div>
              <div className="text-sm text-white/70">False Positives</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <BehavioralAnalyzer isVisible={isVisible} />
            <DeviceFingerprinter isVisible={isVisible} />
            <ChallengeEngine isVisible={isVisible} />
            <BotClassifier isVisible={isVisible} />
          </div>

          {/* Full-width Analytics Engine */}
          <AnalyticsDashboard isVisible={isVisible} />

          {/* Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live Bot Detection Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Active Sessions</span>
                  <span className="text-purple-500 font-bold">45,231</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Bots Detected</span>
                  <span className="text-red-500 font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Challenges Issued</span>
                  <span className="text-orange-500 font-bold">89</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">False Positives</span>
                  <span className="text-emerald-500 font-bold">0.02%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Avg Response</span>
                  <span className="text-cyan-500 font-bold">3.2ms</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">ML Accuracy</span>
                  <span className="text-blue-500 font-bold">99.5%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Web Scrapers</span>
                  <span className="text-red-500 font-bold">67%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Credential Stuffing</span>
                  <span className="text-orange-500 font-bold">23%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">DDoS Bots</span>
                  <span className="text-yellow-500 font-bold">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-purple-500/10">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
          Return Home
        </button>
        <a href="https://botmitigation.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
          Stop Bots <Shield className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default BotMitigationDetail;

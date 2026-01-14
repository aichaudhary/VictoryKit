
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  Zap,
  Globe,
  Filter,
  AlertTriangle,
  Activity,
  Cpu,
  Network,
  Lock,
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

// Animated Visual Components for DDoS Defender
const TrafficScrubber = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [traffic, setTraffic] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const attackTypes = ['SYN Flood', 'UDP Flood', 'HTTP Flood', 'DNS Amplification', 'NTP Flood'];
    const interval = setInterval(() => {
      setTraffic(prev => {
        const newTraffic = [...prev];
        if (newTraffic.length > 15) newTraffic.shift();
        newTraffic.push({
          id: Date.now(),
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          volume: Math.floor(Math.random() * 1000000),
          scrubbed: Math.random() > 0.3,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        return newTraffic;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.traffic-packet'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="scrubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="scrubGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central scrubbing filter */}
        <circle cx="200" cy="150" r="40" fill="#ef4444" filter="url(#scrubGlow)" className="animate-pulse"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SCRUB</text>
        <text x="200" y="170" textAnchor="middle" fill="white" fontSize="10">FILTER</text>

        {/* Traffic packets */}
        <g className="traffic-packet">
          {traffic.map((packet, index) => (
            <g key={packet.id}>
              <circle
                cx={packet.x}
                cy={packet.y}
                r="6"
                fill={packet.scrubbed ? "#10b981" : "#ef4444"}
                filter="url(#scrubGlow)"
                className={packet.scrubbed ? "animate-pulse" : "animate-bounce"}
              />
              <text
                x={packet.x}
                y={packet.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="7"
                opacity="0.8"
              >
                {packet.type.split(' ')[0]}
              </text>
              <line
                x1={packet.x}
                y1={packet.y}
                x2="200"
                y2="150"
                stroke={packet.scrubbed ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Traffic Scrubber</h3>
        <div className="text-sm opacity-70">Real-time attack filtering</div>
      </div>
    </div>
  );
};

const AttackClassifier = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const attackTypes = ['Volumetric Attack', 'Protocol Attack', 'Application Attack', 'Amplification Attack', 'State Exhaustion'];
    const interval = setInterval(() => {
      setAttacks(prev => {
        const newAttacks = [...prev];
        if (newAttacks.length > 8) newAttacks.shift();
        newAttacks.push({
          id: Date.now(),
          type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          intensity: Math.floor(Math.random() * 100),
          mitigated: Math.random() > 0.2,
          vectors: Math.floor(Math.random() * 50) + 10
        });
        return newAttacks;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.attack-item'),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, attacks]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Attack Classifier</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {attacks.map((attack, index) => (
            <div key={attack.id} className="attack-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${attack.mitigated ? 'text-green-500' : 'text-red-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block text-sm">{attack.type}</span>
                  <span className="text-xs text-white/50">{attack.vectors} attack vectors</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{attack.intensity}%</div>
                <div className={`text-xs ${attack.mitigated ? 'text-green-400' : 'text-red-400'}`}>
                  {attack.mitigated ? 'Mitigated' : 'Active'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attack classification visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2">
          {[0.8, 0.9, 0.6, 0.7, 0.8, 0.5, 0.9, 0.4].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t opacity-60" style={{height: `${height * 40}px`}}></div>
          ))}
        </div>
        <div className="text-xs text-white/50 mt-2 text-center">Attack Intensity Classification</div>
      </div>
    </div>
  );
};

const MitigationEngine = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [mitigations, setMitigations] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const mitigationTypes = ['Rate Limiting', 'Traffic Shaping', 'IP Blacklisting', 'Geo Blocking', 'Challenge Response'];
    const interval = setInterval(() => {
      setMitigations(prev => {
        const newMitigations = [...prev];
        if (newMitigations.length > 12) newMitigations.shift();
        newMitigations.push({
          id: Date.now(),
          type: mitigationTypes[Math.floor(Math.random() * mitigationTypes.length)],
          effectiveness: Math.floor(Math.random() * 30) + 70,
          active: Math.random() > 0.4,
          responseTime: Math.floor(Math.random() * 500) + 100
        });
        return newMitigations;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.mitigation-node'),
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible, mitigations]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-yellow-900/20 to-red-900/20 rounded-3xl border border-yellow-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="mitigationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Mitigation nodes */}
        {mitigations.map((mitigation, index) => {
          const angle = (index / mitigations.length) * Math.PI * 2;
          const radius = 90;
          const x = 200 + Math.cos(angle) * radius;
          const y = 150 + Math.sin(angle) * radius;

          return (
            <g key={mitigation.id} className="mitigation-node">
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={mitigation.active ? "#f59e0b" : "#6b7280"}
                opacity="0.8"
              />
              <text
                x={x}
                y={y + 25}
                textAnchor="middle"
                fill="white"
                fontSize="7"
                opacity="0.7"
              >
                {mitigation.type.split(' ')[0]}
              </text>
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="150"
                stroke={mitigation.active ? "#f59e0b" : "#6b7280"}
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Central mitigation engine */}
        <circle cx="200" cy="150" r="30" fill="#f59e0b" opacity="0.3"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">MITIGATE</text>
        <text x="200" y="168" textAnchor="middle" fill="white" fontSize="8">ENGINE</text>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Mitigation Engine</h3>
        <div className="text-sm opacity-70">Automated response system</div>
      </div>
    </div>
  );
};

const CapacityScaler = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [capacity, setCapacity] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const regions = ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa'];
    const interval = setInterval(() => {
      setCapacity(prev => {
        const newCapacity = [...prev];
        if (newCapacity.length > 6) newCapacity.shift();
        newCapacity.push({
          id: Date.now(),
          region: regions[Math.floor(Math.random() * regions.length)],
          currentLoad: Math.floor(Math.random() * 100),
          maxCapacity: Math.floor(Math.random() * 20) + 80,
          scaling: Math.random() > 0.7
        });
        return newCapacity;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.capacity-alert'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "back.out(1.7)" }
    );
  }, [isVisible, capacity]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Capacity Scaler</h3>
        <div className="space-y-3">
          {capacity.map((cap, index) => (
            <div key={cap.id} className="capacity-alert flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Server className={`w-5 h-5 ${cap.scaling ? 'text-blue-500' : 'text-green-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block">{cap.region}</span>
                  <span className="text-xs text-white/50">Load: {cap.currentLoad}% / {cap.maxCapacity}%</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${cap.scaling ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {cap.scaling ? 'Scaling' : 'Stable'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capacity scaling radar effect */}
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

const ThreatAnalytics = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const metricTypes = ['Attack Duration', 'Peak Bandwidth', 'Packets Filtered', 'Unique IPs', 'Mitigation Cost'];
    const interval = setInterval(() => {
      setAnalytics(prev => {
        const newAnalytics = [...prev];
        if (newAnalytics.length > 8) newAnalytics.shift();
        newAnalytics.push({
          id: Date.now(),
          type: metricTypes[Math.floor(Math.random() * metricTypes.length)],
          value: Math.floor(Math.random() * 100),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        });
        return newAnalytics;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.analytics-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", transformOrigin: "bottom" }
    );
  }, [isVisible, analytics]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-3xl border border-pink-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="analyticsGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Analytics bars */}
        {analytics.map((analytic, index) => {
          const height = (analytic.value / 100) * 150;
          const x = 30 + (index * 40);
          return (
            <g key={analytic.id} className="analytics-bar">
              <rect
                x={x}
                y={250 - height}
                width="25"
                height={height}
                fill="#ec4899"
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
                {analytic.type.split(' ')[0]}
              </text>
              <text
                x={x + 12.5}
                y={245 - height}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {analytic.value}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Threat Analytics</h3>
        <div className="text-sm opacity-70">DDoS attack insights</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-red-500" />
          <span>Attack Trends</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span>Mitigation Success</span>
        </div>
      </div>
    </div>
  );
};

const DDoSDefenderDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    attacksMitigated: 1542000,
    scrubbingCapacity: 15.2,
    avgResponseTime: 8.5,
    uptime: 99.999
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        attacksMitigated: prev.attacksMitigated + Math.floor(Math.random() * 500),
        scrubbingCapacity: Math.max(10.0, Math.min(20.0, prev.scrubbingCapacity + (Math.random() - 0.5) * 0.5)),
        avgResponseTime: Math.max(5.0, Math.min(15.0, prev.avgResponseTime + (Math.random() - 0.5) * 1)),
        uptime: Math.max(99.995, prev.uptime + (Math.random() - 0.5) * 0.001)
      }));
    }, 2000);

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl bg-element"></div>

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ef4444" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full bg-element"
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
            <Shield className="w-6 h-6 text-red-500" />
            <span className="font-bold">DDoS Defender</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="hero-element">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  Attack Mitigation Platform
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  DDoS <span className="text-red-500">Defender</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  Enterprise-grade DDoS protection with multi-Tbps scrubbing capacity
                  and intelligent traffic analysis to keep your services online during
                  the most aggressive attacks.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://ddosdefender.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
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
                  src="https://picsum.photos/seed/ddosdefender/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="DDoS Defender Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                    15+ Tbps Capacity
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-xs font-medium">
                    &lt;10s Response
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
              <div className="text-4xl lg:text-5xl font-black text-red-500 mb-2">
                {metrics.attacksMitigated.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Attacks Mitigated
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.scrubbingCapacity.toFixed(1)} Tbps
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Scrubbing Capacity
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.avgResponseTime}s
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Avg Response Time
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.uptime.toFixed(3)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Uptime SLA
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
              Complete <span className="text-red-500">Attack Protection</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Multi-layered DDoS defense with global scrubbing centers, intelligent
              traffic analysis, and automatic mitigation for attacks of any scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <Network className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Traffic Scrubbing</h3>
              <p className="text-white/50 leading-relaxed">
                Global scrubbing centers filter malicious traffic while allowing
                legitimate users through without added latency or performance impact.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <Gauge className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Intelligent Rate Limiting</h3>
              <p className="text-white/50 leading-relaxed">
                Advanced rate limiting that distinguishes between attack traffic
                and legitimate usage spikes using behavioral analysis and ML.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cloud Shield</h3>
              <p className="text-white/50 leading-relaxed">
                Always-on protection with automatic scaling to absorb attacks of any
                size without manual intervention or service degradation.
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
              DDoS Defender <span className="text-red-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core components of our advanced DDoS protection platform
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
                <Filter className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-red-500 mb-2">15+ Tbps</div>
              <div className="text-sm text-white/70">Scrubbing Capacity</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-2">&lt;10s</div>
              <div className="text-sm text-white/70">Mitigation Start</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-yellow-500 mb-2">50+</div>
              <div className="text-sm text-white/70">Global Centers</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 mx-auto mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-pink-500 mb-2">99.999%</div>
              <div className="text-sm text-white/70">Uptime SLA</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <TrafficScrubber isVisible={isVisible} />
            <AttackClassifier isVisible={isVisible} />
            <MitigationEngine isVisible={isVisible} />
            <CapacityScaler isVisible={isVisible} />
          </div>

          {/* Full-width Threat Analytics */}
          <ThreatAnalytics isVisible={isVisible} />

          {/* Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live DDoS Protection Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Active Attacks</span>
                  <span className="text-red-500 font-bold">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Traffic Scrubbed</span>
                  <span className="text-orange-500 font-bold">2.4 Tbps</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Mitigation Rate</span>
                  <span className="text-green-500 font-bold">99.7%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Attack Types</span>
                  <span className="text-yellow-500 font-bold">8</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Response Time</span>
                  <span className="text-cyan-500 font-bold">8.5s</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Capacity Used</span>
                  <span className="text-blue-500 font-bold">16.2%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Volumetric Attacks</span>
                  <span className="text-red-500 font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Protocol Attacks</span>
                  <span className="text-orange-500 font-bold">32%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">App Layer Attacks</span>
                  <span className="text-yellow-500 font-bold">23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-red-500/10">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
          Return Home
        </button>
        <a href="https://ddosdefender.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/20 flex items-center gap-4">
          Defend Now <Shield className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default DDoSDefenderDetail;

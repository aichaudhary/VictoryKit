
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
  Zap as Lightning,
  Shield as Protection,
  Eye as Visibility,
  Target as Aim,
  Layers as Stack,
  Settings as Config,
  BarChart3 as Chart,
  PieChart as Pie,
  LineChart as Line,
  Monitor as Screen,
  Smartphone as Mobile,
  Tablet as Tab,
  Laptop as Computer,
  Cloud as CloudIcon,
  Code as CodeIcon,
  FileText as Document,
  Key as KeyIcon,
  User as Person,
  Users as Team,
  Building as Office,
  MapPin as Location,
  Calendar as Date,
  Timer as Time,
  Gauge as Meter,
  Thermometer as Temp
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// Animated Visual Components for API Shield
const AuthValidator = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const tokenTypes = ['JWT', 'OAuth2', 'API Key', 'Bearer', 'Basic'];
    const interval = setInterval(() => {
      setTokens(prev => {
        const newTokens = [...prev];
        if (newTokens.length > 12) newTokens.shift();
        newTokens.push({
          id: Date.now(),
          type: tokenTypes[Math.floor(Math.random() * tokenTypes.length)],
          valid: Math.random() > 0.2,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        return newTokens;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.auth-token'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-3xl border border-blue-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="authGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central validation hub */}
        <circle cx="200" cy="150" r="30" fill="#3b82f6" filter="url(#authGlow)" className="animate-pulse"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VALIDATE</text>

        {/* Token validation paths */}
        <g className="auth-token">
          {tokens.map((token, index) => (
            <g key={token.id}>
              <circle
                cx={token.x}
                cy={token.y}
                r="8"
                fill={token.valid ? "#10b981" : "#ef4444"}
                filter="url(#authGlow)"
                className={token.valid ? "animate-pulse" : "animate-bounce"}
              />
              <text
                x={token.x}
                y={token.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.8"
              >
                {token.type}
              </text>
              <line
                x1={token.x}
                y1={token.y}
                x2="200"
                y2="150"
                stroke={token.valid ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Auth Validator</h3>
        <div className="text-sm opacity-70">Token authentication hub</div>
      </div>
    </div>
  );
};

const RateLimiter = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const endpoints = ['/api/users', '/api/orders', '/api/payments', '/api/data', '/api/search'];
    const interval = setInterval(() => {
      setRequests(prev => {
        const newRequests = [...prev];
        if (newRequests.length > 8) newRequests.shift();
        newRequests.push({
          id: Date.now(),
          endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
          allowed: Math.random() > 0.3,
          count: Math.floor(Math.random() * 100) + 1
        });
        return newRequests;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.rate-item'),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, requests]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Rate Limiter</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {requests.map((req, index) => (
            <div key={req.id} className="rate-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${req.allowed ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-white font-medium text-sm">{req.endpoint}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{req.count} req/min</div>
                <div className={`text-xs ${req.allowed ? 'text-green-400' : 'text-red-400'}`}>
                  {req.allowed ? 'Allowed' : 'Limited'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate limiting visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2">
          {[0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t opacity-60" style={{height: `${height * 40}px`}}></div>
          ))}
        </div>
        <div className="text-xs text-white/50 mt-2 text-center">Request Rate Distribution</div>
      </div>
    </div>
  );
};

const SchemaValidator = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const schemaTypes = ['JSON Schema', 'OpenAPI', 'GraphQL', 'XML', 'Protobuf'];
    const interval = setInterval(() => {
      setSchemas(prev => {
        const newSchemas = [...prev];
        if (newSchemas.length > 10) newSchemas.shift();
        newSchemas.push({
          id: Date.now(),
          type: schemaTypes[Math.floor(Math.random() * schemaTypes.length)],
          valid: Math.random() > 0.15,
          size: Math.floor(Math.random() * 5000) + 1000
        });
        return newSchemas;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.schema-node'),
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible, schemas]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="schemaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Schema validation nodes */}
        {schemas.map((schema, index) => {
          const angle = (index / schemas.length) * Math.PI * 2;
          const radius = 80;
          const x = 200 + Math.cos(angle) * radius;
          const y = 150 + Math.sin(angle) * radius;

          return (
            <g key={schema.id} className="schema-node">
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={schema.valid ? "#8b5cf6" : "#ef4444"}
                opacity="0.8"
              />
              <text
                x={x}
                y={y + 25}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.7"
              >
                {schema.type.split(' ')[0]}
              </text>
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="150"
                stroke={schema.valid ? "#8b5cf6" : "#ef4444"}
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Central validator */}
        <circle cx="200" cy="150" r="25" fill="#8b5cf6" opacity="0.3"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">VALIDATE</text>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Schema Validator</h3>
        <div className="text-sm opacity-70">API structure validation</div>
      </div>
    </div>
  );
};

const ThreatDetector = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const threatTypes = ['Injection Attack', 'Broken Auth', 'Data Exposure', 'Rate Abuse', 'Parameter Tampering'];
    const interval = setInterval(() => {
      setThreats(prev => {
        const newThreats = [...prev];
        if (newThreats.length > 6) newThreats.shift();
        newThreats.push({
          id: Date.now(),
          type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: Math.random() > 0.8 ? 'Critical' : Math.random() > 0.6 ? 'High' : 'Medium',
          blocked: Math.random() > 0.1
        });
        return newThreats;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.threat-alert'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "back.out(1.7)" }
    );
  }, [isVisible, threats]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Threat Detector</h3>
        <div className="space-y-3">
          {threats.map((threat, index) => (
            <div key={threat.id} className="threat-alert flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${threat.severity === 'Critical' ? 'text-red-500' : threat.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block">{threat.type}</span>
                  <span className={`text-xs ${threat.severity === 'Critical' ? 'text-red-400' : threat.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {threat.severity} • {threat.blocked ? 'Blocked' : 'Detected'}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${threat.blocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {threat.blocked ? '✓ Blocked' : '⚠ Detected'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat radar effect */}
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

const AnalyticsEngine = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const metricTypes = ['Response Time', 'Error Rate', 'Throughput', 'Latency', 'Success Rate'];
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
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="analyticsGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4"/>
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
                fill="#06b6d4"
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
        <h3 className="text-lg font-bold mb-2">Analytics Engine</h3>
        <div className="text-sm opacity-70">API performance metrics</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span>Trending Up</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
          <span>Trending Down</span>
        </div>
      </div>
    </div>
  );
};

const APIShieldDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    apiCalls: 1250000,
    uptime: 99.95,
    avgLatency: 45,
    threatsBlocked: 8750
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 1000),
        uptime: Math.max(99.90, prev.uptime + (Math.random() - 0.5) * 0.01),
        avgLatency: Math.max(30, Math.min(80, prev.avgLatency + (Math.random() - 0.5) * 5)),
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 20)
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl bg-element"></div>

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full bg-element"
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
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="font-bold">API Shield</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="hero-element">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
                  <Key className="w-4 h-4" />
                  API Security Gateway
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  API <span className="text-blue-500">Shield</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  Complete API security platform with authentication, rate limiting,
                  schema validation, and abuse detection for modern APIs. Protect
                  your endpoints from OWASP API threats and ensure reliable service delivery.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://apishield.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
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
                  src="https://picsum.photos/seed/apishield/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="API Shield Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
                    OAuth2 + JWT
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-medium">
                    Schema Validation
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
              <div className="text-4xl lg:text-5xl font-black text-blue-500 mb-2">
                {metrics.apiCalls.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                API Calls/sec
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.uptime.toFixed(2)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Uptime
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.avgLatency}ms
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Avg Latency
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.threatsBlocked.toLocaleString()}
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Threats Blocked
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
              Complete <span className="text-blue-500">API Protection</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Enterprise-grade API security with comprehensive threat detection,
              authentication management, and performance optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Authentication Gateway</h3>
              <p className="text-white/50 leading-relaxed">
                Centralized authentication with OAuth2, JWT, API keys, and mTLS support
                for all API endpoints with seamless integration.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                <Gauge className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Intelligent Rate Limiting</h3>
              <p className="text-white/50 leading-relaxed">
                Advanced rate limiting with per-user, per-endpoint, and sliding window
                quotas to prevent abuse while ensuring fair access.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Schema Validation</h3>
              <p className="text-white/50 leading-relaxed">
                Automatic OpenAPI/Swagger validation ensuring all requests conform to
                defined schemas with detailed error reporting.
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
              API Shield <span className="text-blue-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core components of our advanced API security platform
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-4">
                <Key className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-blue-500 mb-2">100%</div>
              <div className="text-sm text-white/70">Auth Success Rate</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-cyan-500 mb-2">&lt;1ms</div>
              <div className="text-sm text-white/70">Validation Latency</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-2">10M+</div>
              <div className="text-sm text-white/70">APIs Protected</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-2">99.9%</div>
              <div className="text-sm text-white/70">Threat Detection</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <AuthValidator isVisible={isVisible} />
            <RateLimiter isVisible={isVisible} />
            <SchemaValidator isVisible={isVisible} />
            <ThreatDetector isVisible={isVisible} />
          </div>

          {/* Full-width Analytics Engine */}
          <AnalyticsEngine isVisible={isVisible} />

          {/* Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live API Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Active Endpoints</span>
                  <span className="text-blue-500 font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Auth Failures</span>
                  <span className="text-red-500 font-bold">23</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Schema Errors</span>
                  <span className="text-yellow-500 font-bold">0.01%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Rate Limited</span>
                  <span className="text-orange-500 font-bold">156</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Threats Blocked</span>
                  <span className="text-red-500 font-bold">89</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Cache Hit Rate</span>
                  <span className="text-green-500 font-bold">94.7%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Avg Response</span>
                  <span className="text-cyan-500 font-bold">45ms</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Success Rate</span>
                  <span className="text-emerald-500 font-bold">99.95%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Throughput</span>
                  <span className="text-blue-500 font-bold">1.2M req/min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-blue-500/10">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
          Return Home
        </button>
        <a href="https://apishield.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-blue-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-blue-500/20 flex items-center gap-4">
          Protect APIs <Shield className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default APIShieldDetail;

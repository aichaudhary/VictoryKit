
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

// Animated Visual Components for WAF Manager
const RequestFilter = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setRequests(prev => {
        const newRequests = [...prev];
        if (newRequests.length > 20) newRequests.shift();
        newRequests.push({
          id: Date.now(),
          type: Math.random() > 0.7 ? 'blocked' : 'allowed',
          x: Math.random() * 100,
          y: Math.random() * 100
        });
        return newRequests;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.filter-line'),
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="filterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Filter Lines */}
        <g className="filter-line">
          <rect x="50" y="50" width="300" height="2" fill="#10b981" opacity="0.6"/>
          <rect x="50" y="100" width="300" height="2" fill="#06b6d4" opacity="0.4"/>
          <rect x="50" y="150" width="300" height="2" fill="#10b981" opacity="0.6"/>
          <rect x="50" y="200" width="300" height="2" fill="#06b6d4" opacity="0.4"/>
          <rect x="50" y="250" width="300" height="2" fill="#10b981" opacity="0.6"/>
        </g>

        {/* Filter Nodes */}
        <circle cx="50" cy="51" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
        <circle cx="350" cy="51" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
        <circle cx="50" cy="101" r="6" fill="#06b6d4" filter="url(#glow)"/>
        <circle cx="350" cy="101" r="6" fill="#06b6d4" filter="url(#glow)"/>
        <circle cx="50" cy="151" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
        <circle cx="350" cy="151" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
        <circle cx="50" cy="201" r="6" fill="#06b6d4" filter="url(#glow)"/>
        <circle cx="350" cy="201" r="6" fill="#06b6d4" filter="url(#glow)"/>
        <circle cx="50" cy="251" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>
        <circle cx="350" cy="251" r="8" fill="#10b981" filter="url(#glow)" className="animate-pulse"/>

        {/* Animated Requests */}
        {requests.map((req, index) => (
          <circle
            key={req.id}
            cx={50 + (req.x * 3)}
            cy={req.y * 2.5 + 25}
            r="3"
            fill={req.type === 'blocked' ? '#ef4444' : '#10b981'}
            opacity="0.8"
            className="animate-ping"
          />
        ))}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Request Filter</h3>
        <div className="text-sm opacity-70">Real-time traffic filtering</div>
      </div>
    </div>
  );
};

const ThreatClassifier = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const threatTypes = ['SQL Injection', 'XSS', 'CSRF', 'Brute Force', 'DDoS'];
    const interval = setInterval(() => {
      setThreats(prev => {
        const newThreats = [...prev];
        if (newThreats.length > 10) newThreats.shift();
        newThreats.push({
          id: Date.now(),
          type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          confidence: Math.floor(Math.random() * 40) + 60
        });
        return newThreats;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.threat-item'),
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, threats]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Threat Classification</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {threats.map((threat, index) => (
            <div key={threat.id} className="threat-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${threat.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
                <span className="text-white font-medium">{threat.type}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70">{threat.confidence}% confidence</div>
                <div className={`text-xs ${threat.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>{threat.severity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-4 right-4 w-24 h-24 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-spin" style={{animationDuration: '3s'}}/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#f97316" strokeWidth="2" className="animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}/>
        </svg>
      </div>
    </div>
  );
};

const ResponseAnalyzer = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setResponses(prev => {
        const newResponses = [...prev];
        if (newResponses.length > 15) newResponses.shift();
        newResponses.push({
          id: Date.now(),
          status: Math.random() > 0.8 ? 403 : Math.random() > 0.6 ? 200 : 404,
          size: Math.floor(Math.random() * 10000) + 1000,
          time: Math.floor(Math.random() * 200) + 50
        });
        return newResponses;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.response-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", transformOrigin: "bottom" }
    );
  }, [isVisible, responses]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl border border-blue-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="responseGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Response bars */}
        {responses.map((response, index) => {
          const height = Math.min(response.size / 100, 200);
          const x = 20 + (index * 25);
          return (
            <rect
              key={response.id}
              x={x}
              y={250 - height}
              width="20"
              height={height}
              fill={response.status === 200 ? "#10b981" : response.status === 403 ? "#ef4444" : "#f59e0b"}
              className="response-bar"
              opacity="0.8"
            />
          );
        })}

        {/* Grid lines */}
        <g opacity="0.2">
          {[0, 50, 100, 150, 200, 250].map(y => (
            <line key={y} x1="20" y1={y + 25} x2="380" y2={y + 25} stroke="#ffffff" strokeWidth="1"/>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Response Analysis</h3>
        <div className="text-sm opacity-70">Traffic pattern monitoring</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-white/70">200 OK</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-white/70">403 Forbidden</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-white/70">404 Not Found</span>
        </div>
      </div>
    </div>
  );
};

const PolicyEnforcer = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [policies, setPolicies] = useState([
    { name: 'Rate Limiting', active: true, violations: 45 },
    { name: 'IP Whitelisting', active: true, violations: 12 },
    { name: 'Geo Blocking', active: false, violations: 0 },
    { name: 'Bot Detection', active: true, violations: 89 },
    { name: 'DDoS Protection', active: true, violations: 23 }
  ]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setPolicies(prev => prev.map(policy => ({
        ...policy,
        violations: policy.active ? Math.max(0, policy.violations + Math.floor(Math.random() * 10) - 5) : 0
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.policy-item'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Policy Enforcement</h3>
        <div className="space-y-3">
          {policies.map((policy, index) => (
            <div key={index} className="policy-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${policy.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">{policy.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{policy.violations} violations</div>
                <div className={`text-xs ${policy.active ? 'text-green-400' : 'text-gray-400'}`}>
                  {policy.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated enforcement waves */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
        <svg viewBox="0 0 400 64" className="w-full h-full">
          <path d="M0,32 Q100,16 200,32 T400,32 V64 H0 Z" fill="#8b5cf6" opacity="0.3">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -50,0; 0,0"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

const IncidentReporter = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const incidentTypes = ['Blocked Attack', 'Rate Limit Hit', 'Suspicious IP', 'Malware Detected', 'Brute Force Attempt'];
    const interval = setInterval(() => {
      setIncidents(prev => {
        const newIncidents = [...prev];
        if (newIncidents.length > 8) newIncidents.shift();
        newIncidents.push({
          id: Date.now(),
          type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
          severity: Math.random() > 0.8 ? 'Critical' : Math.random() > 0.6 ? 'High' : 'Medium',
          timestamp: new Date().toLocaleTimeString()
        });
        return newIncidents;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.incident-item'),
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
    );
  }, [isVisible, incidents]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Incident Reports</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {incidents.map((incident, index) => (
            <div key={incident.id} className="incident-item flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${incident.severity === 'Critical' ? 'text-red-500' : incident.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'}`} />
                <span className="text-white text-sm">{incident.type}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs ${incident.severity === 'Critical' ? 'text-red-400' : incident.severity === 'High' ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {incident.severity}
                </div>
                <div className="text-xs text-white/50">{incident.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert indicator */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <AlertTriangle className="w-8 h-8 text-orange-500 animate-bounce" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

const WAFManagerDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    requestsBlocked: 15420,
    uptime: 99.97,
    avgResponseTime: 12,
    activeRules: 2847
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requestsBlocked: prev.requestsBlocked + Math.floor(Math.random() * 10),
        uptime: Math.max(99.90, prev.uptime + (Math.random() - 0.5) * 0.01),
        avgResponseTime: Math.max(8, Math.min(25, prev.avgResponseTime + (Math.random() - 0.5) * 2)),
        activeRules: prev.activeRules + Math.floor(Math.random() * 3) - 1
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl bg-element"></div>

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-500/20 rounded-full bg-element"
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
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="font-bold">WAF Manager</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="hero-element">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  Web Application Firewall
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  WAF <span className="text-emerald-500">Manager</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  Advanced web application firewall with AI-powered threat detection,
                  real-time rule optimization, and comprehensive attack prevention.
                  Protect your applications from OWASP Top 10 vulnerabilities and
                  emerging threats with enterprise-grade security.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://wafmanager.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
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
                  src="https://picsum.photos/seed/wafmanager/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="WAF Manager Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium">
                    AI-Powered
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-medium">
                    Real-Time
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
              <div className="text-4xl lg:text-5xl font-black text-emerald-500 mb-2">
                {metrics.requestsBlocked.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Requests Blocked
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
                {metrics.avgResponseTime}ms
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Avg Response
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.activeRules.toLocaleString()}
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Active Rules
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
              Advanced <span className="text-emerald-500">Protection</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Comprehensive web application security with intelligent threat detection,
              automated rule optimization, and real-time attack prevention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">OWASP Top 10 Protection</h3>
              <p className="text-white/50 leading-relaxed">
                Complete coverage against the most critical web application security risks,
                including injection attacks, broken authentication, and sensitive data exposure.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time Analysis</h3>
              <p className="text-white/50 leading-relaxed">
                Continuous traffic monitoring with AI-powered anomaly detection and
                instant threat classification for immediate response capabilities.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Adaptive Rules</h3>
              <p className="text-white/50 leading-relaxed">
                Machine learning-driven rule optimization that automatically adapts to
                traffic patterns and reduces false positives while maintaining security.
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
              WAF <span className="text-emerald-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core components of our advanced web application firewall system
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                <Filter className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-emerald-500 mb-2">99.9%</div>
              <div className="text-sm text-white/70">Detection Accuracy</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-cyan-500 mb-2">&lt;1ms</div>
              <div className="text-sm text-white/70">Processing Latency</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-2">500M+</div>
              <div className="text-sm text-white/70">Requests/Day</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-sm text-white/70">Monitoring</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <RequestFilter isVisible={isVisible} />
            <ThreatClassifier isVisible={isVisible} />
            <ResponseAnalyzer isVisible={isVisible} />
            <PolicyEnforcer isVisible={isVisible} />
          </div>

          {/* Full-width Incident Reporter */}
          <IncidentReporter isVisible={isVisible} />

          {/* Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Active Sessions</span>
                  <span className="text-emerald-500 font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Blocked IPs</span>
                  <span className="text-red-500 font-bold">89</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">False Positives</span>
                  <span className="text-yellow-500 font-bold">0.02%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">DDoS Attempts</span>
                  <span className="text-orange-500 font-bold">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">SQL Injections</span>
                  <span className="text-red-500 font-bold">34</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">XSS Attempts</span>
                  <span className="text-purple-500 font-bold">67</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Rule Updates</span>
                  <span className="text-cyan-500 font-bold">156</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">AI Confidence</span>
                  <span className="text-emerald-500 font-bold">98.7%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Response Time</span>
                  <span className="text-blue-500 font-bold">0.8ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-emerald-500/10">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
          Return Home
        </button>
        <a href="https://wafmanager.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-emerald-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-emerald-500/20 flex items-center gap-4">
          Manage WAF <Shield className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default WAFManagerDetail;

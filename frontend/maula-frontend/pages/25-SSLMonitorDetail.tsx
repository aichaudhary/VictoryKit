
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Lock,
  Shield,
  Bell,
  FileCheck,
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

// Animated Visual Components for SSL Monitor
const CertificateValidator = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const certTypes = ['Domain SSL', 'Wildcard', 'EV SSL', 'Multi-Domain', 'Code Signing'];
    const interval = setInterval(() => {
      setCertificates(prev => {
        const newCerts = [...prev];
        if (newCerts.length > 12) newCerts.shift();
        newCerts.push({
          id: Date.now(),
          type: certTypes[Math.floor(Math.random() * certTypes.length)],
          valid: Math.random() > 0.15,
          strength: Math.floor(Math.random() * 30) + 70,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        return newCerts;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.cert-node'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-3xl border border-green-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="certGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central validation authority */}
        <circle cx="200" cy="150" r="35" fill="#10b981" filter="url(#certGlow)" className="animate-pulse"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VALIDATE</text>
        <text x="200" y="170" textAnchor="middle" fill="white" fontSize="10">CERTS</text>

        {/* Certificate validation nodes */}
        <g className="cert-node">
          {certificates.map((cert, index) => (
            <g key={cert.id}>
              <circle
                cx={cert.x}
                cy={cert.y}
                r="10"
                fill={cert.valid ? "#10b981" : "#ef4444"}
                filter="url(#certGlow)"
                className={cert.valid ? "animate-pulse" : "animate-bounce"}
              />
              <text
                x={cert.x}
                y={cert.y + 25}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                opacity="0.8"
              >
                {cert.type.split(' ')[0]}
              </text>
              <line
                x1={cert.x}
                y1={cert.y}
                x2="200"
                y2="150"
                stroke={cert.valid ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Certificate Validator</h3>
        <div className="text-sm opacity-70">Real-time SSL validation</div>
      </div>
    </div>
  );
};

const ExpiryTracker = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [expiries, setExpiries] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const domains = ['api.maula.ai', 'dashboard.maula.ai', 'auth.maula.ai', 'cdn.maula.ai', 'web.maula.ai'];
    const interval = setInterval(() => {
      setExpiries(prev => {
        const newExpiries = [...prev];
        if (newExpiries.length > 8) newExpiries.shift();
        newExpiries.push({
          id: Date.now(),
          domain: domains[Math.floor(Math.random() * domains.length)],
          daysLeft: Math.floor(Math.random() * 90),
          critical: Math.random() > 0.8,
          autoRenew: Math.random() > 0.3
        });
        return newExpiries;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.expiry-item'),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, expiries]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Expiry Tracker</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {expiries.map((exp, index) => (
            <div key={exp.id} className="expiry-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 ${exp.critical ? 'text-red-500' : exp.daysLeft < 30 ? 'text-orange-500' : 'text-green-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block text-sm">{exp.domain}</span>
                  <span className="text-xs text-white/50">Auto-renew: {exp.autoRenew ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{exp.daysLeft} days</div>
                <div className={`text-xs ${exp.critical ? 'text-red-400' : exp.daysLeft < 30 ? 'text-orange-400' : 'text-green-400'}`}>
                  {exp.critical ? 'Critical' : exp.daysLeft < 30 ? 'Warning' : 'Good'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expiry timeline visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2">
          {[0.9, 0.7, 0.8, 0.6, 0.9, 0.5, 0.8, 0.4].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t opacity-60" style={{height: `${height * 40}px`}}></div>
          ))}
        </div>
        <div className="text-xs text-white/50 mt-2 text-center">Certificate Expiry Timeline</div>
      </div>
    </div>
  );
};

const CipherAnalyzer = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [ciphers, setCiphers] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const cipherSuites = ['AES256-GCM', 'ChaCha20-Poly1305', 'AES128-GCM', 'ECDHE-RSA-AES256', 'ECDHE-ECDSA-AES256'];
    const interval = setInterval(() => {
      setCiphers(prev => {
        const newCiphers = [...prev];
        if (newCiphers.length > 10) newCiphers.shift();
        newCiphers.push({
          id: Date.now(),
          suite: cipherSuites[Math.floor(Math.random() * cipherSuites.length)],
          secure: Math.random() > 0.2,
          performance: Math.floor(Math.random() * 30) + 70,
          tlsVersion: Math.random() > 0.7 ? '1.3' : '1.2'
        });
        return newCiphers;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.cipher-node'),
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible, ciphers]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="cipherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Cipher analysis nodes */}
        {ciphers.map((cipher, index) => {
          const angle = (index / ciphers.length) * Math.PI * 2;
          const radius = 85;
          const x = 200 + Math.cos(angle) * radius;
          const y = 150 + Math.sin(angle) * radius;

          return (
            <g key={cipher.id} className="cipher-node">
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={cipher.secure ? "#06b6d4" : "#ef4444"}
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
                {cipher.suite.split('-')[0]}
              </text>
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="150"
                stroke={cipher.secure ? "#06b6d4" : "#ef4444"}
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Central cipher analyzer */}
        <circle cx="200" cy="150" r="28" fill="#06b6d4" opacity="0.3"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">ANALYZE</text>
        <text x="200" y="168" textAnchor="middle" fill="white" fontSize="8">CIPHERS</text>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Cipher Analyzer</h3>
        <div className="text-sm opacity-70">SSL/TLS security assessment</div>
      </div>
    </div>
  );
};

const RenewalEngine = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [renewals, setRenewals] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const providers = ["Let's Encrypt", 'DigiCert', 'GlobalSign', 'Sectigo', 'Entrust'];
    const interval = setInterval(() => {
      setRenewals(prev => {
        const newRenewals = [...prev];
        if (newRenewals.length > 6) newRenewals.shift();
        newRenewals.push({
          id: Date.now(),
          provider: providers[Math.floor(Math.random() * providers.length)],
          status: Math.random() > 0.8 ? 'Failed' : Math.random() > 0.6 ? 'Pending' : 'Success',
          autoRenewed: Math.random() > 0.4,
          timeToExpiry: Math.floor(Math.random() * 30) + 1
        });
        return newRenewals;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.renewal-alert'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "back.out(1.7)" }
    );
  }, [isVisible, renewals]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Renewal Engine</h3>
        <div className="space-y-3">
          {renewals.map((renewal, index) => (
            <div key={renewal.id} className="renewal-alert flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <FileCheck className={`w-5 h-5 ${renewal.status === 'Success' ? 'text-green-500' : renewal.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block">{renewal.provider}</span>
                  <span className="text-xs text-white/50">Auto-renew: {renewal.autoRenewed ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{renewal.timeToExpiry} days left</div>
                <div className={`text-xs ${renewal.status === 'Success' ? 'text-green-400' : renewal.status === 'Pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {renewal.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal status radar effect */}
      <div className="absolute top-4 right-4 w-20 h-20 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.7"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.9"/>
          <circle cx="50" cy="50" r="10" fill="none" stroke="#10b981" strokeWidth="2"/>
          <line x1="50" y1="50" x2="90" y2="50" stroke="#10b981" strokeWidth="2" className="animate-pulse">
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

const ComplianceDashboard = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [compliance, setCompliance] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const standards = ['TLS 1.3', 'PCI DSS', 'HIPAA', 'SOX', 'GDPR'];
    const interval = setInterval(() => {
      setCompliance(prev => {
        const newCompliance = [...prev];
        if (newCompliance.length > 8) newCompliance.shift();
        newCompliance.push({
          id: Date.now(),
          standard: standards[Math.floor(Math.random() * standards.length)],
          score: Math.floor(Math.random() * 20) + 80,
          compliant: Math.random() > 0.1,
          lastAudit: Math.floor(Math.random() * 30) + 1
        });
        return newCompliance;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.compliance-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", transformOrigin: "bottom" }
    );
  }, [isVisible, compliance]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="complianceGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Compliance bars */}
        {compliance.map((comp, index) => {
          const height = (comp.score / 100) * 150;
          const x = 30 + (index * 40);
          return (
            <g key={comp.id} className="compliance-bar">
              <rect
                x={x}
                y={250 - height}
                width="25"
                height={height}
                fill="#8b5cf6"
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
                {comp.standard.split(' ')[0]}
              </text>
              <text
                x={x + 12.5}
                y={245 - height}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {comp.score}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Compliance Dashboard</h3>
        <div className="text-sm opacity-70">SSL security standards</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-white/70">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Compliant</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <XCircle className="w-3 h-3 text-red-500" />
          <span>Non-Compliant</span>
        </div>
      </div>
    </div>
  );
};

const SSLMonitorDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    certsMonitored: 125000,
    alertsSent: 8750,
    autoRenewals: 45200,
    complianceScore: 98.5
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        certsMonitored: prev.certsMonitored + Math.floor(Math.random() * 100),
        alertsSent: prev.alertsSent + Math.floor(Math.random() * 20),
        autoRenewals: prev.autoRenewals + Math.floor(Math.random() * 50),
        complianceScore: Math.max(95.0, Math.min(100.0, prev.complianceScore + (Math.random() - 0.5) * 0.5))
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl bg-element"></div>

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
            className="absolute w-1 h-1 bg-green-500/20 rounded-full bg-element"
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
            <Lock className="w-6 h-6 text-green-500" />
            <span className="font-bold">SSL Monitor</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="hero-element">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
                  <Lock className="w-4 h-4" />
                  Certificate Intelligence Platform
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  SSL <span className="text-green-500">Monitor</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  Comprehensive SSL/TLS certificate monitoring with expiration alerts,
                  chain validation, automated renewal workflows, and compliance
                  tracking for zero-downtime certificate management.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://sslmonitor.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
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
                  src="https://picsum.photos/seed/sslmonitor/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="SSL Monitor Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                    100K+ Certificates
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
                    Auto-Renewal
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
              <div className="text-4xl lg:text-5xl font-black text-green-500 mb-2">
                {metrics.certsMonitored.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Certs Monitored
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.alertsSent.toLocaleString()}
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Alerts Sent
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.autoRenewals.toLocaleString()}
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Auto Renewals
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.complianceScore.toFixed(1)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Compliance Score
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
              Complete <span className="text-green-500">Certificate Management</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Enterprise-grade SSL monitoring with proactive alerts, automated renewals,
              and comprehensive compliance tracking across all your domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-green-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expiry Alerts</h3>
              <p className="text-white/50 leading-relaxed">
                Multi-channel notifications 90, 60, 30, 14, and 7 days before
                certificate expiration with customizable alert thresholds.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-green-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Chain Validation</h3>
              <p className="text-white/50 leading-relaxed">
                Complete certificate chain analysis detecting weak ciphers,
                missing intermediates, revoked certificates, and CA trust issues.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-green-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Auto Renewal</h3>
              <p className="text-white/50 leading-relaxed">
                ACME protocol integration for automated Let's Encrypt and enterprise
                CA certificate renewals with zero-downtime deployment.
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
              SSL Monitor <span className="text-green-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core components of our advanced SSL certificate monitoring platform
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-green-500 mb-2">100%</div>
              <div className="text-sm text-white/70">Uptime Monitoring</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-blue-500 mb-2">&lt;1min</div>
              <div className="text-sm text-white/70">Alert Response</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
                <Key className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-cyan-500 mb-2">50+</div>
              <div className="text-sm text-white/70">CA Integrations</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-2">99.9%</div>
              <div className="text-sm text-white/70">Renewal Success</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <CertificateValidator isVisible={isVisible} />
            <ExpiryTracker isVisible={isVisible} />
            <CipherAnalyzer isVisible={isVisible} />
            <RenewalEngine isVisible={isVisible} />
          </div>

          {/* Full-width Compliance Dashboard */}
          <ComplianceDashboard isVisible={isVisible} />

          {/* Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live SSL Monitoring Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Certificates Active</span>
                  <span className="text-green-500 font-bold">125,847</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Expiring Soon</span>
                  <span className="text-orange-500 font-bold">23</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Auto Renewed Today</span>
                  <span className="text-blue-500 font-bold">156</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">TLS 1.3 Compliant</span>
                  <span className="text-cyan-500 font-bold">98.7%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Chain Issues</span>
                  <span className="text-red-500 font-bold">0</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Avg Cipher Strength</span>
                  <span className="text-purple-500 font-bold">A+</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Let's Encrypt</span>
                  <span className="text-green-500 font-bold">67%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Enterprise CA</span>
                  <span className="text-blue-500 font-bold">28%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Self-Signed</span>
                  <span className="text-yellow-500 font-bold">5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-green-500/10">
        <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
          Return Home
        </button>
        <a href="https://sslmonitor.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-green-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-green-500/20 flex items-center gap-4">
          Monitor Certificates <Lock className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default SSLMonitorDetail;

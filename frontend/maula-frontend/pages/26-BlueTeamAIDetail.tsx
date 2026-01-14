
import React, { useEffect, useRef, useState } from 'react';
import { useScroll } from '../context/ScrollContext';
import { gsap } from 'gsap';
import {
  Shield,
  ShieldCheck,
  Brain,
  Activity,
  Zap,
  AlertTriangle,
  Eye,
  Target,
  Radar,
  Cpu,
  Network,
  Database,
  Search,
  Terminal,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Server,
  Wifi,
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

// Animated Visual Components for Blue Team AI
const ThreatTriageEngine = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const alertTypes = ['High Priority', 'Medium Risk', 'Low Threat', 'False Positive', 'Critical Alert'];
    const interval = setInterval(() => {
      setAlerts(prev => {
        const newAlerts = [...prev];
        if (newAlerts.length > 15) newAlerts.shift();
        newAlerts.push({
          id: Date.now(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          priority: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'high' : 'medium',
          confidence: Math.floor(Math.random() * 30) + 70,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
        return newAlerts;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.alert-node'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" }
    );
  }, [isVisible]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="triageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
          </linearGradient>
          <filter id="triageGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Central triage processor */}
        <circle cx="200" cy="150" r="40" fill="#8b5cf6" filter="url(#triageGlow)" className="animate-pulse"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">TRIAGE</text>
        <text x="200" y="170" textAnchor="middle" fill="white" fontSize="10">ENGINE</text>

        {/* Alert triage nodes */}
        <g className="alert-node">
          {alerts.map((alert, index) => (
            <g key={alert.id}>
              <circle
                cx={alert.x}
                cy={alert.y}
                r="8"
                fill={alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f59e0b' : '#10b981'}
                filter="url(#triageGlow)"
                className={alert.priority === 'critical' ? "animate-bounce" : "animate-pulse"}
              />
              <text
                x={alert.x}
                y={alert.y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="6"
                opacity="0.8"
              >
                {alert.type.split(' ')[0]}
              </text>
              <line
                x1={alert.x}
                y1={alert.y}
                x2="200"
                y2="150"
                stroke={alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f59e0b' : '#10b981'}
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Threat Triage Engine</h3>
        <div className="text-sm opacity-70">Autonomous alert prioritization</div>
      </div>
    </div>
  );
};

const ResponseOrchestrator = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const actions = ['Isolate Host', 'Block IP', 'Suspend User', 'Quarantine File', 'Update Firewall'];
    const interval = setInterval(() => {
      setResponses(prev => {
        const newResponses = [...prev];
        if (newResponses.length > 8) newResponses.shift();
        newResponses.push({
          id: Date.now(),
          action: actions[Math.floor(Math.random() * actions.length)],
          status: Math.random() > 0.8 ? 'Failed' : Math.random() > 0.6 ? 'In Progress' : 'Completed',
          responseTime: Math.floor(Math.random() * 500) + 50,
          success: Math.random() > 0.15
        });
        return newResponses;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.response-item'),
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
  }, [isVisible, responses]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Response Orchestrator</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {responses.map((response, index) => (
            <div key={response.id} className="response-item flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-5 h-5 ${response.success ? 'text-green-500' : 'text-red-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block text-sm">{response.action}</span>
                  <span className="text-xs text-white/50">{response.responseTime}ms response</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{response.status}</div>
                <div className={`text-xs ${response.success ? 'text-green-400' : 'text-red-400'}`}>
                  {response.success ? 'Success' : 'Failed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response timeline visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2">
          {[0.95, 0.8, 0.9, 0.7, 0.85, 0.6, 0.8, 0.5].map((height, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t opacity-60" style={{height: `${height * 40}px`}}></div>
          ))}
        </div>
        <div className="text-xs text-white/50 mt-2 text-center">Response Success Rate</div>
      </div>
    </div>
  );
};

const EvidenceCollector = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const types = ['Network Logs', 'Memory Dump', 'File Hash', 'Process Tree', 'Registry Keys'];
    const interval = setInterval(() => {
      setEvidence(prev => {
        const newEvidence = [...prev];
        if (newEvidence.length > 12) newEvidence.shift();
        newEvidence.push({
          id: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
          size: Math.floor(Math.random() * 500) + 50,
          integrity: Math.random() > 0.1,
          collected: true
        });
        return newEvidence;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.evidence-node'),
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
    );
  }, [isVisible, evidence]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="evidenceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
          </linearGradient>
        </defs>

        {/* Evidence collection nodes */}
        {evidence.map((item, index) => {
          const angle = (index / evidence.length) * Math.PI * 2;
          const radius = 90;
          const x = 200 + Math.cos(angle) * radius;
          const y = 150 + Math.sin(angle) * radius;

          return (
            <g key={item.id} className="evidence-node">
              <circle
                cx={x}
                cy={y}
                r="10"
                fill={item.integrity ? "#06b6d4" : "#ef4444"}
                opacity="0.8"
              />
              <text
                x={x}
                y={y + 20}
                textAnchor="middle"
                fill="white"
                fontSize="6"
                opacity="0.7"
              >
                {item.type.split(' ')[0]}
              </text>
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="150"
                stroke={item.integrity ? "#06b6d4" : "#ef4444"}
                strokeWidth="2"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Central evidence collector */}
        <circle cx="200" cy="150" r="30" fill="#06b6d4" opacity="0.3"/>
        <text x="200" y="155" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">COLLECT</text>
        <text x="200" y="168" textAnchor="middle" fill="white" fontSize="8">EVIDENCE</text>
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Evidence Collector</h3>
        <div className="text-sm opacity-70">Automated forensic gathering</div>
      </div>
    </div>
  );
};

const DefenseMatrix = ({ isVisible }) => {
  const containerRef = useRef(null);
  const [matrix, setMatrix] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const defenses = ['Firewall', 'IDS', 'Endpoint', 'Network', 'Cloud Security'];
    const interval = setInterval(() => {
      setMatrix(prev => {
        const newMatrix = [...prev];
        if (newMatrix.length > 6) newMatrix.shift();
        newMatrix.push({
          id: Date.now(),
          layer: defenses[Math.floor(Math.random() * defenses.length)],
          status: Math.random() > 0.9 ? 'Compromised' : Math.random() > 0.7 ? 'Warning' : 'Active',
          coverage: Math.floor(Math.random() * 20) + 80,
          lastUpdate: Math.floor(Math.random() * 60) + 1
        });
        return newMatrix;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    gsap.fromTo(containerRef.current.querySelectorAll('.matrix-alert'),
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "back.out(1.7)" }
    );
  }, [isVisible, matrix]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden">
      <div className="absolute inset-0 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Defense Matrix</h3>
        <div className="space-y-3">
          {matrix.map((layer, index) => (
            <div key={layer.id} className="matrix-alert flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${layer.status === 'Active' ? 'text-green-500' : layer.status === 'Warning' ? 'text-yellow-500' : 'text-red-500'} animate-pulse`} />
                <div>
                  <span className="text-white font-medium block">{layer.layer}</span>
                  <span className="text-xs text-white/50">Updated {layer.lastUpdate}m ago</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{layer.coverage}% coverage</div>
                <div className={`text-xs ${layer.status === 'Active' ? 'text-green-400' : layer.status === 'Warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {layer.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Defense status radar effect */}
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

const LearningEngine = ({ isVisible }) => {
  const svgRef = useRef(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (!isVisible) return;

    const modelTypes = ['Anomaly Detection', 'Behavior Analysis', 'Threat Classification', 'Risk Scoring', 'Pattern Recognition'];
    const interval = setInterval(() => {
      setModels(prev => {
        const newModels = [...prev];
        if (newModels.length > 8) newModels.shift();
        newModels.push({
          id: Date.now(),
          type: modelTypes[Math.floor(Math.random() * modelTypes.length)],
          accuracy: Math.floor(Math.random() * 15) + 85,
          training: Math.random() > 0.8,
          lastUpdate: Math.floor(Math.random() * 24) + 1
        });
        return newModels;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    gsap.fromTo(svgRef.current.querySelectorAll('.model-bar'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", transformOrigin: "bottom" }
    );
  }, [isVisible, models]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full p-4" viewBox="0 0 400 300">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <linearGradient id="learningGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Model accuracy bars */}
        {models.map((model, index) => {
          const height = (model.accuracy / 100) * 150;
          const x = 30 + (index * 35);
          return (
            <g key={model.id} className="model-bar">
              <rect
                x={x}
                y={250 - height}
                width="20"
                height={height}
                fill="#8b5cf6"
                opacity="0.8"
              />
              <text
                x={x + 10}
                y={270}
                textAnchor="middle"
                fill="white"
                fontSize="6"
                opacity="0.7"
              >
                {model.type.split(' ')[0]}
              </text>
              <text
                x={x + 10}
                y={245 - height}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                {model.accuracy}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-bold mb-2">Learning Engine</h3>
        <div className="text-sm opacity-70">AI model adaptation</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs text-white/70">
          <Brain className="w-3 h-3 text-purple-500" />
          <span>Training Active</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Models Ready</span>
        </div>
      </div>
    </div>
  );
};

const BlueTeamAIDetail = ({ setView }) => {
  const { lenis } = useScroll();
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Live metrics state
  const [metrics, setMetrics] = useState({
    alertsProcessed: 250000,
    responseTime: 0.8,
    automationRate: 87.5,
    falsePositives: 2.1
  });

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        alertsProcessed: prev.alertsProcessed + Math.floor(Math.random() * 500),
        responseTime: Math.max(0.1, Math.min(2.0, prev.responseTime + (Math.random() - 0.5) * 0.1)),
        automationRate: Math.max(80.0, Math.min(95.0, prev.automationRate + (Math.random() - 0.5) * 0.5)),
        falsePositives: Math.max(0.5, Math.min(5.0, prev.falsePositives + (Math.random() - 0.5) * 0.2))
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
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bg-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl bg-element"></div>

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
            <Shield className="w-6 h-6 text-purple-500" />
            <span className="font-bold">Blue Team AI</span>
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
                  <ShieldCheck className="w-4 h-4" />
                  Autonomous Defense Orchestrator
                </div>
                <h1 className="text-6xl lg:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                  Blue Team <span className="text-purple-500">AI</span>
                </h1>
                <p className="text-xl text-white/70 leading-relaxed mt-6">
                  The SOC that never sleeps. Fully autonomous blue teaming that manages
                  detection, triage, and response for 80% of all infrastructure alerts
                  with zero human intervention required.
                </p>
              </div>

              <div className="hero-element flex flex-wrap gap-4">
                <a
                  href="https://blueteamai.maula.ai/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-2xl flex items-center gap-3"
                >
                  Access SOC Dashboard
                  <ArrowRight className="w-5 h-5" />
                </a>
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  View Defense Matrix
                </button>
              </div>
            </div>

            <div className="hero-element">
              <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://picsum.photos/seed/blueteam/1200/1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  alt="Blue Team AI Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                {/* Floating badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-medium">
                    24/7 Active
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
                    Zero Sleep
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
                {metrics.alertsProcessed.toLocaleString()}+
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Alerts Processed
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.responseTime.toFixed(1)}s
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Avg Response Time
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.automationRate.toFixed(1)}%
              </div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">
                Automation Rate
              </div>
            </div>
            <div className="animate-on-scroll">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {metrics.falsePositives.toFixed(1)}%
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
              Autonomous <span className="text-purple-500">Defense Operations</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              AI-powered security operations that work around the clock, eliminating
              alert fatigue and ensuring instant response to every threat detected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Autonomous Triage</h3>
              <p className="text-white/50 leading-relaxed">
                Automatically deduplicates and prioritizes alerts from across your security
                stack, eliminating 90% of alert fatigue with machine learning algorithms.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Heuristic Countermeasures</h3>
              <p className="text-white/50 leading-relaxed">
                Deploys containment actions—like host isolation or user suspension—in
                sub-second intervals upon high-confidence detection without human approval.
              </p>
            </div>

            <div className="animate-on-scroll glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Evidence Packaging</h3>
              <p className="text-white/50 leading-relaxed">
                Automatically collects logs, memory dumps, and network captures for every
                incident to streamline human analyst review and forensic investigations.
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
              Blue Team AI <span className="text-purple-500">Engine</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore the core autonomous defense components that power 24/7 threat detection and response
            </p>
          </div>

          {/* Capability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12 md:mb-16">
            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-2">&lt;1s</div>
              <div className="text-sm text-white/70">Detection Speed</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-blue-500 mb-2">99.9%</div>
              <div className="text-sm text-white/70">Uptime SLA</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-indigo-500 mb-2">95%</div>
              <div className="text-sm text-white/70">Accuracy Rate</div>
            </div>

            <div className="animate-on-scroll glass p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-cyan-500 mb-2">500K+</div>
              <div className="text-sm text-white/70">Daily Events</div>
            </div>
          </div>

          {/* Animated Visual Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 sm:mb-12 md:mb-16">
            <ThreatTriageEngine isVisible={isVisible} />
            <ResponseOrchestrator isVisible={isVisible} />
            <EvidenceCollector isVisible={isVisible} />
            <DefenseMatrix isVisible={isVisible} />
          </div>

          {/* Full-width Learning Engine */}
          <LearningEngine isVisible={isVisible} />

          {/* SOC Dashboard Preview */}
          <div className="animate-on-scroll mt-16 glass p-8 rounded-3xl border border-white/5">
            <h3 className="text-2xl font-bold mb-6 text-center">Live SOC Operations Dashboard Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Active Threats</span>
                  <span className="text-red-500 font-bold">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Contained Today</span>
                  <span className="text-green-500 font-bold">47</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">False Positives</span>
                  <span className="text-yellow-500 font-bold">3</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Avg Response Time</span>
                  <span className="text-purple-500 font-bold">0.8s</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Automation Coverage</span>
                  <span className="text-blue-500 font-bold">87.5%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">AI Confidence</span>
                  <span className="text-cyan-500 font-bold">94.2%</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Malware Detected</span>
                  <span className="text-red-500 font-bold">23</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Zero-Day Threats</span>
                  <span className="text-orange-500 font-bold">2</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <span className="text-white/70">Evidence Collected</span>
                  <span className="text-green-500 font-bold">156</span>
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
        <a href="https://blueteamai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
          Activate Defense <ShieldCheck className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

export default BlueTeamAIDetail;

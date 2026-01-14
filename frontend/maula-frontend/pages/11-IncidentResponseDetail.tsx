import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Clock,
  Users,
  Bell,
  Play,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - INCIDENT RESPONSE
// ============================================================================

// 1. IncidentDetectionRadar - Real-time incident detection and alerting
const IncidentDetectionRadar: React.FC = () => {
  const [incidents, setIncidents] = useState<
    { id: number; type: string; severity: string; source: string; detected: boolean }[]
  >([]);

  useEffect(() => {
    const incidentTypes = ['Data Breach', 'Ransomware', 'DDoS Attack', 'Malware Infection', 'Unauthorized Access'];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newIncident = {
          id: Date.now(),
          type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
          severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
          source: ['Network', 'Endpoint', 'Cloud', 'Application', 'Database'][Math.floor(Math.random() * 5)],
          detected: Math.random() > 0.8,
        };
        setIncidents((prev) => [...prev.slice(-6), newIncident]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    Low: '#22c55e',
    Medium: '#eab308',
    High: '#f97316',
    Critical: '#ef4444',
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="incidentGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#991b1b" stopOpacity="0.2" />
          </radialGradient>
          <filter id="incidentGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="0.3" opacity="0.4" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#b91c1c" strokeWidth="0.2" opacity="0.5" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="#991b1b" strokeWidth="0.2" opacity="0.6" />

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 5s linear infinite' }}>
          <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill="url(#incidentGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="10"
            stroke="#dc2626"
            strokeWidth="0.8"
            filter="url(#incidentGlow)"
          />
        </g>

        {incidents.map((incident, i) => (
          <g key={incident.id}>
            <circle
              cx={20 + Math.random() * 60}
              cy={20 + Math.random() * 60}
              r="2"
              fill={incident.detected ? '#22c55e' : '#dc2626'}
              opacity="0.9"
            >
              <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {incident.detected && (
              <circle
                cx={20 + Math.random() * 60}
                cy={20 + Math.random() * 60}
                r="5"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                opacity="0.6"
              >
                <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. ResponseCoordinationEngine - Team coordination and workflow management
const ResponseCoordinationEngine: React.FC = () => {
  const [responses, setResponses] = useState<
    { id: number; team: string; action: string; status: string; progress: number }[]
  >([]);

  useEffect(() => {
    const teams = ['Security Ops', 'Forensics', 'DevOps', 'Legal', 'Executive'];
    const actions = ['Investigate', 'Contain', 'Remediate', 'Communicate', 'Document'];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newResponse = {
          id: Date.now(),
          team: teams[Math.floor(Math.random() * teams.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          status: ['Assigned', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)],
          progress: Math.floor(Math.random() * 100),
        };
        setResponses((prev) => [...prev.slice(-5), newResponse]);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {responses.map((response, i) => (
        <div
          key={response.id}
          className={`absolute bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[7px] font-mono ${
            response.status === 'Completed' ? 'border-green-500/40 bg-green-500/10' : ''
          }`}
          style={{
            left: `${Math.random() * 75 + 10}%`,
            top: `${Math.random() * 75 + 10}%`,
            animation: `responseAlert ${2.5 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Users className="w-2 h-2 text-red-400" />
            <span className="text-red-400 font-bold">{response.team}</span>
          </div>
          <div className="text-white/70">{response.action}</div>
          <div className={`text-xs font-bold ${
            response.status === 'Completed' ? 'text-green-400' :
            response.status === 'In Progress' ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            {response.status}
          </div>
          <div className="w-full bg-red-500/20 rounded-full h-1 mt-1">
            <div className="bg-red-500 h-1 rounded-full" style={{width: `${response.progress}%`}}></div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes responseAlert {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. TimelineReconstruction - Incident timeline and evidence collection
const TimelineReconstruction: React.FC = () => {
  const [events, setEvents] = useState<
    { id: number; event: string; timestamp: string; evidence: string; collected: boolean }[]
  >([]);

  useEffect(() => {
    const eventTypes = ['Login Attempt', 'File Access', 'Network Connection', 'Process Execution', 'Data Transfer'];

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newEvent = {
          id: Date.now(),
          event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          timestamp: new Date().toLocaleTimeString(),
          evidence: `EVID-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          collected: Math.random() > 0.7,
        };
        setEvents((prev) => [...prev.slice(-4), newEvent]);

        // Simulate evidence collection completion
        setTimeout(() => {
          setEvents((prev) =>
            prev.map((e) => (e.id === newEvent.id ? { ...e, collected: true } : e))
          );
        }, 2000 + Math.random() * 3000);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-18">
      {events.map((event, i) => (
        <div
          key={event.id}
          className="absolute bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `timelineEvent ${2.8 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-orange-400 font-bold">{event.event}</div>
          <div className="text-white/70">{event.timestamp}</div>
          {event.collected ? (
            <div className="text-green-400 animate-pulse">EVIDENCE COLLECTED</div>
          ) : (
            <div className="text-orange-400 animate-pulse">COLLECTING...</div>
          )}
          <div className="text-xs text-cyan-400">{event.evidence}</div>
        </div>
      ))}
      <style>{`
        @keyframes timelineEvent {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 4. AutomatedPlaybookSystem - Automated response playbooks
const AutomatedPlaybookSystem: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<
    { id: number; name: string; trigger: string; executed: boolean; success: boolean }[]
  >([]);

  useEffect(() => {
    const playbookNames = ['Data Breach Response', 'Ransomware Protocol', 'DDoS Mitigation', 'Malware Containment', 'Access Violation'];

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const newPlaybook = {
          id: Date.now(),
          name: playbookNames[Math.floor(Math.random() * playbookNames.length)],
          trigger: ['Alert', 'Detection', 'Threshold', 'Manual'][Math.floor(Math.random() * 4)],
          executed: Math.random() > 0.6,
          success: Math.random() > 0.8,
        };
        setPlaybooks((prev) => [...prev.slice(-3), newPlaybook]);

        // Simulate playbook execution
        setTimeout(() => {
          setPlaybooks((prev) =>
            prev.map((p) => (p.id === newPlaybook.id ? { ...p, executed: true } : p))
          );
        }, 3000 + Math.random() * 4000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-12">
      {playbooks.map((playbook, i) => (
        <div
          key={playbook.id}
          className="absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[6px] font-mono max-w-36"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `playbookExec ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Play className="w-2 h-2 text-purple-400" />
            <span className="text-purple-400 font-bold">{playbook.name}</span>
          </div>
          <div className="text-white/70">Trigger: {playbook.trigger}</div>
          {playbook.executed ? (
            <div className={`text-xs font-bold ${playbook.success ? 'text-green-400' : 'text-red-400'}`}>
              {playbook.success ? 'SUCCESS' : 'FAILED'}
            </div>
          ) : (
            <div className="text-cyan-400 animate-pulse">EXECUTING...</div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes playbookExec {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 5. EscalationMatrix - Incident escalation and prioritization
const EscalationMatrix: React.FC = () => {
  const [escalations, setEscalations] = useState<boolean[][]>(
    Array(5).fill(null).map(() => Array(5).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEscalations((prev) =>
        prev.map((row) =>
          row.map(() => Math.random() > 0.9)
        )
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-8">
      <div className="grid grid-cols-5 gap-2 w-full h-full p-8">
        {escalations.flat().map((escalate, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-300 ${
              escalate ? 'bg-red-500/60 animate-pulse' : 'bg-red-500/10'
            }`}
          >
            {escalate && (
              <div className="w-full h-full bg-red-400/40 animate-ping rounded-sm"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const IncidentResponseDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'monitoring' | 'response'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    incidentsDetected: 15642,
    responseTime: 8.3,
    playbooksExecuted: 892,
    containmentRate: 97.8,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        incidentsDetected: prev.incidentsDetected + Math.floor(Math.random() * 20),
        responseTime: Math.max(1.0, prev.responseTime + (Math.random() - 0.5) * 0.5),
        playbooksExecuted: prev.playbooksExecuted + Math.floor(Math.random() * 5),
        containmentRate: Math.max(95.0, prev.containmentRate + (Math.random() - 0.99) * 0.1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0408] text-white selection:bg-red-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-red-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-orange-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <RadarSweep color="#a855f7" />
        <FloatingIcons icons={[Shield, AlertTriangle, Lock, Eye]} color="#a855f7" />
        <RadarSweep color="#a855f7" />
        <FloatingIcons icons={[Shield, AlertTriangle, Lock, Eye]} color="#a855f7" />
        <IncidentDetectionRadar />
        <ResponseCoordinationEngine />
        <TimelineReconstruction />
        <AutomatedPlaybookSystem />
        <EscalationMatrix />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">IncidentResponse Enterprise v3.1</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">Incident Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              INCIDENT <span className="text-red-500">RESPONSE</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Incident response platform. Streamlined security incident management with automated playbooks and coordinated team response workflows.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://incidentresponse.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/20 flex items-center gap-2">
                <Bell className="w-4 h-4" /> Response: Active
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                MTTR: {liveMetrics.responseTime.toFixed(1)}min
              </div>
            </div>
          </div>

          {/* Incident Response Command Center Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-red-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central incident response command center */}
              <div className="relative w-80 h-80">
                {/* Central command center */}
                <div className="absolute inset-0 border-4 border-red-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-red-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-red-300/30 rounded-full flex items-center justify-center">
                      {/* Core incident response engine */}
                      <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center relative">
                        <AlertTriangle className="w-16 h-16 text-red-400" />

                        {/* Response modules orbiting */}
                        {[
                          { icon: Bell, label: 'Detection' },
                          { icon: Users, label: 'Coordination' },
                          { icon: Clock, label: 'Timeline' },
                          { icon: Play, label: 'Playbooks' },
                          { icon: Target, label: 'Escalation' },
                          { icon: ShieldCheck, label: 'Containment' }
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-red-400/15 rounded-full flex items-center justify-center border border-red-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60) * Math.PI / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60) * Math.PI / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`
                            }}
                          >
                            <module.icon className="w-5 h-5 text-red-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-red-500/20 rounded-full animate-pulse"
                    style={{
                      top: `${50 - (i + 1) * 12}%`,
                      left: `${50 - (i + 1) * 12}%`,
                      width: `${(i + 1) * 24}%`,
                      height: `${(i + 1) * 24}%`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-400">RESPONSE: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● INCIDENT COMMAND</span>
              </div>
              <div className="mt-2 w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: '94%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-red-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500 tabular-nums">{liveMetrics.incidentsDetected.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Incidents Detected</div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: '96%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.responseTime.toFixed(1)}min</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Mean Response Time</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.playbooksExecuted.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Playbooks Executed</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-red-500">{liveMetrics.containmentRate.toFixed(1)}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Containment Rate</div>
              <div className="w-full bg-red-500/10 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: `${liveMetrics.containmentRate}%`}}></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Rapid Triage</h3>
              <p className="text-white/50 leading-relaxed">AI-powered incident classification and prioritization to focus resources on critical threats first.</p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                Processing 47 incidents/min
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Team Coordination</h3>
              <p className="text-white/50 leading-relaxed">Real-time collaboration tools for security teams with role-based task assignment and escalation.</p>
              <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                12 teams coordinated
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group hover:shadow-2xl hover:shadow-red-500/5">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Root Cause Analysis</h3>
              <p className="text-white/50 leading-relaxed">Automated timeline reconstruction and evidence collection for thorough post-incident analysis.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <FileText className="w-4 h-4 animate-pulse" />
                99.2% evidence collected
              </div>
            </div>
          </div>

          {/* Incident Response Command Center Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-red-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">Incident Response Command Center</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Advanced incident management platform with automated response orchestration, team coordination, and comprehensive evidence collection for rapid threat containment.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Response capabilities */}
                {[
                  { capability: 'Incident Detection', coverage: 99.8, icon: Bell, color: 'text-red-400' },
                  { capability: 'Team Coordination', coverage: 97.3, icon: Users, color: 'text-cyan-400' },
                  { capability: 'Timeline Reconstruction', coverage: 96.7, icon: Clock, color: 'text-orange-400' },
                  { capability: 'Automated Playbooks', coverage: 94.5, icon: Play, color: 'text-purple-400' },
                  { capability: 'Escalation Management', coverage: 98.9, icon: Target, color: 'text-green-400' },
                  { capability: 'Evidence Collection', coverage: 99.2, icon: FileText, color: 'text-blue-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-red-400 font-mono text-sm">{item.coverage}% coverage</div>
                    </div>
                    <div className="w-16 h-2 bg-red-500/20 rounded-full">
                      <div className="h-2 bg-red-500 rounded-full" style={{width: `${item.coverage}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-red-500/10 p-8">
                <div className="space-y-6">
                  {/* Response metrics */}
                  {[
                    { metric: 'Detection Accuracy', value: 99.8, status: 'excellent' },
                    { metric: 'Response Time', value: 8.3, status: 'rapid' },
                    { metric: 'Containment Success', value: 97.8, status: 'effective' },
                    { metric: 'Evidence Integrity', value: 99.9, status: 'complete' },
                    { metric: 'Team Coordination', value: 96.5, status: 'optimal' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-red-400">{item.metric}</div>
                      <div className="flex-1 bg-red-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent' ? 'bg-green-500' :
                            item.status === 'rapid' ? 'bg-blue-500' :
                            item.status === 'effective' ? 'bg-cyan-500' :
                            item.status === 'complete' ? 'bg-purple-500' : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{width: `${item.value > 10 ? item.value : item.value * 10}%`}}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">{item.value}{item.value < 10 ? 'min' : '%'}</div>
                      <div className="w-20 text-xs font-mono text-red-400 text-right capitalize">{item.status}</div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-400">
                  <span>Incident Response Status</span>
                  <span>All Teams Activated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-red-500/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://incidentresponse.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/20 flex items-center gap-4">
            Manage Incidents <AlertTriangle className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default IncidentResponseDetail;

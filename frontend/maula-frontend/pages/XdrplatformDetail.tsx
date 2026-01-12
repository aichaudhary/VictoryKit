
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Layers, Zap, Activity, Shield, Lock, Network, Monitor, Database, Eye, Radar, Server, Globe, AlertTriangle, Search, Target, Cpu, Radio, Wifi, Cloud, HardDrive, BarChart3, TrendingUp, Bell, FileSearch } from 'lucide-react';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - XDR PLATFORM
// ============================================================================

// 1. ThreatRadarSweep - Rotating radar with threat detection pulses
const ThreatRadarSweep: React.FC = () => {
  const [threats, setThreats] = useState<{id: number; x: number; y: number; type: string; severity: string}[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newThreat = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          type: ['malware', 'intrusion', 'anomaly', 'exfil'][Math.floor(Math.random() * 4)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
        };
        setThreats(prev => [...prev.slice(-8), newThreat]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  };

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        
        {/* Radar circles */}
        {[20, 35, 50].map((r, i) => (
          <circle key={i} cx="50" cy="50" r={r} fill="none" stroke="#a855f7" strokeWidth="0.2" opacity="0.3" />
        ))}
        
        {/* Radar sweep */}
        <g style={{ transformOrigin: '50px 50px', animation: 'spin 4s linear infinite' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#radarGradient)" />
          <line x1="50" y1="50" x2="50" y2="5" stroke="#a855f7" strokeWidth="0.5" filter="url(#radarGlow)" />
        </g>
        
        {/* Cross lines */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="#a855f7" strokeWidth="0.1" opacity="0.3" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="#a855f7" strokeWidth="0.1" opacity="0.3" />
        
        {/* Detected threats */}
        {threats.map(threat => (
          <g key={threat.id}>
            <circle cx={threat.x} cy={threat.y} r="2" fill={severityColors[threat.severity]} opacity="0.8">
              <animate attributeName="r" values="1;3;1" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx={threat.x} cy={threat.y} r="4" fill="none" stroke={severityColors[threat.severity]} strokeWidth="0.3">
              <animate attributeName="r" values="2;6;2" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. DataStreamMatrix - Flowing data streams across endpoints
const DataStreamMatrix: React.FC = () => {
  const streams = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      chars: Array.from({ length: 15 }, () => Math.random() > 0.5 ? '1' : '0').join('')
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {streams.map(stream => (
        <div
          key={stream.id}
          className="absolute text-purple-500 font-mono text-[8px] whitespace-nowrap"
          style={{
            left: `${stream.x}%`,
            animation: `matrixFall ${stream.duration}s linear ${stream.delay}s infinite`,
            writingMode: 'vertical-rl'
          }}
        >
          {stream.chars}
        </div>
      ))}
      <style>{`
        @keyframes matrixFall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 3. EndpointNetwork - Connected endpoint nodes visualization
const EndpointNetwork: React.FC = () => {
  const nodes = useMemo(() => [
    { id: 1, x: 50, y: 20, type: 'cloud', label: 'Cloud' },
    { id: 2, x: 20, y: 40, type: 'endpoint', label: 'Endpoint' },
    { id: 3, x: 80, y: 40, type: 'network', label: 'Network' },
    { id: 4, x: 35, y: 70, type: 'email', label: 'Email' },
    { id: 5, x: 65, y: 70, type: 'server', label: 'Server' },
    { id: 6, x: 50, y: 50, type: 'xdr', label: 'XDR' }
  ], []);

  const connections = useMemo(() => [
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
    [1, 3], [2, 4], [3, 5]
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stopColor="#a855f7" stopOpacity="1">
              <animate attributeName="offset" values="0.3;1.3" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0">
              <animate attributeName="offset" values="1;2" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>

        {/* Connections */}
        {connections.map(([from, to], i) => {
          const fromNode = nodes.find(n => n.id === from)!;
          const toNode = nodes.find(n => n.id === to)!;
          return (
            <g key={i}>
              <line
                x1={fromNode.x} y1={fromNode.y}
                x2={toNode.x} y2={toNode.y}
                stroke="#a855f7" strokeWidth="0.3" opacity="0.3"
              />
              <circle r="0.8" fill="#a855f7">
                <animateMotion
                  dur={`${2 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x} cy={node.y}
              r={node.type === 'xdr' ? 8 : 4}
              fill={node.type === 'xdr' ? '#a855f7' : '#1e1b4b'}
              stroke="#a855f7"
              strokeWidth="0.5"
              filter="url(#nodeGlow)"
            >
              {node.type === 'xdr' && (
                <animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            <text
              x={node.x} y={node.y + (node.type === 'xdr' ? 14 : 10)}
              textAnchor="middle"
              fill="#a855f7"
              fontSize="3"
              fontWeight="bold"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 4. AlertWaveform - Real-time alert waveform visualization
const AlertWaveform: React.FC = () => {
  const [points, setPoints] = useState<number[]>(Array(50).fill(50));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1];
        const spike = Math.random() > 0.9 ? (Math.random() > 0.5 ? 30 : -30) : 0;
        const newValue = Math.max(20, Math.min(80, lastValue + (Math.random() - 0.5) * 10 + spike));
        newPoints.push(newValue);
        return newPoints;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * 2} ${p}`).join(' ');

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathData + ' L 100 100 L 0 100 Z'} fill="url(#waveGradient)" />
        <path d={pathData} fill="none" stroke="#a855f7" strokeWidth="0.5" />
      </svg>
    </div>
  );
};

// 5. CorrelationWeb - Attack chain correlation visualization
const CorrelationWeb: React.FC = () => {
  const [activeChain, setActiveChain] = useState(0);
  
  const attackChains = useMemo(() => [
    { name: 'Phishing Chain', nodes: [[20, 20], [40, 35], [60, 30], [80, 45]] },
    { name: 'Lateral Movement', nodes: [[15, 60], [35, 50], [55, 65], [75, 55], [90, 70]] },
    { name: 'Data Exfil', nodes: [[25, 80], [50, 75], [75, 85]] }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChain(prev => (prev + 1) % attackChains.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [attackChains.length]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {attackChains.map((chain, chainIdx) => (
          <g key={chainIdx} opacity={chainIdx === activeChain ? 1 : 0.2}>
            {chain.nodes.map((node, i) => (
              <g key={i}>
                {i > 0 && (
                  <line
                    x1={chain.nodes[i - 1][0]} y1={chain.nodes[i - 1][1]}
                    x2={node[0]} y2={node[1]}
                    stroke={chainIdx === activeChain ? '#ef4444' : '#a855f7'}
                    strokeWidth="0.5"
                    strokeDasharray={chainIdx === activeChain ? '2,1' : 'none'}
                  >
                    {chainIdx === activeChain && (
                      <animate attributeName="stroke-dashoffset" values="0;-6" dur="0.5s" repeatCount="indefinite" />
                    )}
                  </line>
                )}
                <circle
                  cx={node[0]} cy={node[1]} r="2"
                  fill={chainIdx === activeChain ? '#ef4444' : '#a855f7'}
                >
                  {chainIdx === activeChain && (
                    <animate attributeName="r" values="1.5;3;1.5" dur="1s" repeatCount="indefinite" />
                  )}
                </circle>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

// 6. TelemetryPulse - Pulsing telemetry data points
const TelemetryPulse: React.FC = () => {
  const [pulses, setPulses] = useState<{id: number; x: number; y: number; source: string}[]>([]);
  
  const sources = ['EDR', 'NDR', 'SIEM', 'Cloud', 'Email', 'IAM'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newPulse = {
        id: Date.now(),
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        source: sources[Math.floor(Math.random() * sources.length)]
      };
      setPulses(prev => [...prev.slice(-15), newPulse]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {pulses.map(pulse => (
          <g key={pulse.id}>
            <circle cx={pulse.x} cy={pulse.y} r="0.5" fill="#a855f7">
              <animate attributeName="r" values="0.5;4;0.5" dur="2s" fill="freeze" />
              <animate attributeName="opacity" values="1;0" dur="2s" fill="freeze" />
            </circle>
            <circle cx={pulse.x} cy={pulse.y} r="1" fill="none" stroke="#a855f7" strokeWidth="0.2">
              <animate attributeName="r" values="1;8" dur="2s" fill="freeze" />
              <animate attributeName="opacity" values="0.8;0" dur="2s" fill="freeze" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 7. DetectionTimeline - Scrolling detection timeline
const DetectionTimeline: React.FC = () => {
  const [events, setEvents] = useState<{id: number; type: string; time: string; severity: string}[]>([]);
  
  useEffect(() => {
    const types = ['Malware Detected', 'Suspicious Login', 'Data Exfiltration', 'Lateral Movement', 'C2 Communication', 'Privilege Escalation'];
    const severities = ['info', 'low', 'medium', 'high', 'critical'];
    
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        time: new Date().toLocaleTimeString(),
        severity: severities[Math.floor(Math.random() * severities.length)]
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 5)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    info: 'text-blue-400',
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 opacity-40">
      <div className="space-y-1">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`text-[8px] font-mono flex items-center gap-2 ${severityColors[event.severity]}`}
            style={{ opacity: 1 - i * 0.15, transform: `translateY(${i * 2}px)` }}
          >
            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
            <span>{event.time}</span>
            <span className="uppercase">[{event.severity}]</span>
            <span>{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. HexagonGrid - Honeycomb defense grid
const HexagonGrid: React.FC = () => {
  const hexagons = useMemo(() => {
    const hexes = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        hexes.push({
          id: `${row}-${col}`,
          x: col * 12 + (row % 2) * 6,
          y: row * 10,
          active: Math.random() > 0.7
        });
      }
    }
    return hexes;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      <svg className="w-full h-full" viewBox="0 0 140 80" preserveAspectRatio="xMidYMid slice">
        {hexagons.map(hex => (
          <polygon
            key={hex.id}
            points="5,0 10,3 10,8 5,11 0,8 0,3"
            transform={`translate(${hex.x}, ${hex.y})`}
            fill={hex.active ? '#a855f7' : 'transparent'}
            stroke="#a855f7"
            strokeWidth="0.3"
            opacity={hex.active ? 0.6 : 0.2}
          >
            {hex.active && (
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
            )}
          </polygon>
        ))}
      </svg>
    </div>
  );
};

// 9. SignalStrength - Signal strength indicators
const SignalStrength: React.FC = () => {
  const [signals, setSignals] = useState<{source: string; strength: number}[]>([
    { source: 'EDR', strength: 85 },
    { source: 'NDR', strength: 92 },
    { source: 'Cloud', strength: 78 },
    { source: 'Email', strength: 88 },
    { source: 'IAM', strength: 95 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(s => ({
        ...s,
        strength: Math.max(60, Math.min(100, s.strength + (Math.random() - 0.5) * 10))
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 opacity-40">
      <div className="space-y-1">
        {signals.map(signal => (
          <div key={signal.source} className="flex items-center gap-2 text-[8px] font-mono text-purple-400">
            <span className="w-8">{signal.source}</span>
            <div className="w-16 h-1 bg-purple-900 rounded overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${signal.strength}%` }}
              />
            </div>
            <span>{Math.round(signal.strength)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 10. ThreatHeatmap - Geographic threat heatmap
const ThreatHeatmap: React.FC = () => {
  const [hotspots, setHotspots] = useState<{id: number; x: number; y: number; intensity: number}[]>([]);

  useEffect(() => {
    // Initialize hotspots
    setHotspots([
      { id: 1, x: 25, y: 30, intensity: 0.8 },
      { id: 2, x: 50, y: 25, intensity: 0.6 },
      { id: 3, x: 75, y: 35, intensity: 0.9 },
      { id: 4, x: 30, y: 60, intensity: 0.5 },
      { id: 5, x: 60, y: 55, intensity: 0.7 },
      { id: 6, x: 80, y: 65, intensity: 0.4 }
    ]);

    const interval = setInterval(() => {
      setHotspots(prev => prev.map(h => ({
        ...h,
        intensity: Math.max(0.2, Math.min(1, h.intensity + (Math.random() - 0.5) * 0.3))
      })));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="heatGradient">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
        </defs>
        {hotspots.map(spot => (
          <circle
            key={spot.id}
            cx={spot.x}
            cy={spot.y}
            r={10 * spot.intensity}
            fill="url(#heatGradient)"
            opacity={spot.intensity}
          >
            <animate attributeName="r" values={`${8 * spot.intensity};${12 * spot.intensity};${8 * spot.intensity}`} dur="3s" repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const XDRPlatformDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'response' | 'analytics'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    eventsPerSec: 12847,
    activeThreats: 23,
    sources: 54,
    mttr: 4.2
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], { y: 60, opacity: 0, duration: 1, stagger: 0.1, ease: 'power4.out' });
      gsap.from(contentRef.current?.children || [], { y: 100, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        eventsPerSec: prev.eventsPerSec + Math.floor((Math.random() - 0.5) * 500),
        activeThreats: Math.max(0, prev.activeThreats + Math.floor((Math.random() - 0.5) * 5)),
        sources: prev.sources,
        mttr: Math.max(1, +(prev.mttr + (Math.random() - 0.5) * 0.5).toFixed(1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#040412] text-white selection:bg-purple-500/30 font-sans">
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <ThreatRadarSweep />
        <DataStreamMatrix />
        <HexagonGrid />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <div className="flex items-center gap-4">
            <a 
              href="https://maula.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] font-black tracking-[0.3em] uppercase text-purple-400 hover:bg-purple-500/30 transition-all"
            >
              ← Back to Maula.AI
            </a>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">XDRPlatform v3.0</span>
          </div>
        </div>

        {/* Epic Hero Banner */}
        <div className="relative mb-16 rounded-[3rem] overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-violet-900/10 to-transparent p-12">
          <EndpointNetwork />
          <AlertWaveform />
          <SignalStrength />
          <DetectionTimeline />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Animated XDR Monogram */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full bg-[#040412] flex items-center justify-center">
                <div className="relative">
                  <Radar className="w-20 h-20 text-purple-500 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">XDR</span>
                  </div>
                </div>
              </div>
              {/* Orbiting elements */}
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-purple-500"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 90}deg) translateX(90px) translateY(-50%)`,
                    animation: `orbit 6s linear infinite`,
                    animationDelay: `${i * 1.5}s`
                  }}
                >
                  <div className="w-full h-full rounded-full bg-purple-400 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
              ))}
              <style>{`
                @keyframes orbit {
                  from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
                  to { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
                }
              `}</style>
            </div>

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-purple-400">Extended Detection & Response</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                XDR <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-500">PLATFORM</span>
              </h1>
              <p className="text-lg text-white/60 max-w-xl mb-8">
                Unified security platform correlating data across endpoints, networks, cloud, and applications for comprehensive threat visibility.
              </p>
              
              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <div className="text-2xl font-black text-purple-400">{liveMetrics.eventsPerSec.toLocaleString()}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Events/sec</div>
                </div>
                <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                  <div className="text-2xl font-black text-red-400">{liveMetrics.activeThreats}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Active Threats</div>
                </div>
                <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                  <div className="text-2xl font-black text-green-400">{liveMetrics.sources}+</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Data Sources</div>
                </div>
                <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <div className="text-2xl font-black text-blue-400">{liveMetrics.mttr}m</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Avg MTTR</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'detection', label: 'Detection', icon: Radar },
            { id: 'response', label: 'Response', icon: Zap },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Content Panels */}
        <div ref={contentRef} className="space-y-16 mb-16">
          {/* Overview Panel */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Data Sources Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Endpoint', icon: Monitor, count: '25K+' },
                  { name: 'Network', icon: Network, count: '1.2B' },
                  { name: 'Cloud', icon: Cloud, count: '8' },
                  { name: 'Email', icon: Bell, count: '50M+' },
                  { name: 'Identity', icon: Shield, count: '100K' },
                  { name: 'Applications', icon: Server, count: '200+' }
                ].map((source, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                    <div className="relative bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all text-center">
                      <source.icon className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                      <div className="text-lg font-bold text-white">{source.count}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40">{source.name}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8 group hover:border-purple-500/30 transition-all">
                  <CorrelationWeb />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mb-6">
                      <Network className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Cross-Layer Correlation</h3>
                    <p className="text-white/50 leading-relaxed">Correlate threats across endpoint, network, cloud, and email for complete attack chain visibility and automated investigation.</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8 group hover:border-purple-500/30 transition-all">
                  <TelemetryPulse />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mb-6">
                      <Monitor className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Unified Console</h3>
                    <p className="text-white/50 leading-relaxed">Single pane of glass for all security operations with automated investigation and response workflows powered by AI.</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8 group hover:border-purple-500/30 transition-all">
                  <ThreatHeatmap />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 mb-6">
                      <Database className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Threat Intelligence</h3>
                    <p className="text-white/50 leading-relaxed">Integrated threat intelligence feeds enriching alerts with context for faster triage and prioritized response actions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detection Panel */}
          {activeTab === 'detection' && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8">
                <ThreatRadarSweep />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Real-Time Threat Detection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Detection Rules', value: '15,000+', desc: 'Pre-built detection rules' },
                      { label: 'ML Models', value: '50+', desc: 'Behavioral analysis models' },
                      { label: 'Avg Detection', value: '<5min', desc: 'Mean time to detect' },
                      { label: 'False Positive', value: '<2%', desc: 'Industry-leading accuracy' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="text-3xl font-black text-purple-400">{stat.value}</div>
                        <div className="text-sm font-bold text-white mt-1">{stat.label}</div>
                        <div className="text-xs text-white/40 mt-1">{stat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Response Panel */}
          {activeTab === 'response' && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8">
                <EndpointNetwork />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Automated Response Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Isolate Endpoint', desc: 'Automatically quarantine compromised systems', icon: Lock },
                      { title: 'Block Threat', desc: 'Real-time blocking of malicious IPs/domains', icon: Shield },
                      { title: 'Kill Process', desc: 'Terminate malicious processes remotely', icon: Target },
                      { title: 'Collect Evidence', desc: 'Automated forensic data collection', icon: FileSearch }
                    ].map((action, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{action.title}</div>
                          <div className="text-sm text-white/50">{action.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Panel */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent p-8">
                <AlertWaveform />
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Security Analytics & Reporting</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Executive Dashboard', desc: 'Board-ready security metrics and KPIs', icon: BarChart3 },
                      { title: 'Trend Analysis', desc: 'Historical threat pattern analysis', icon: TrendingUp },
                      { title: 'Compliance Reports', desc: 'Automated compliance documentation', icon: FileSearch }
                    ].map((feature, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all text-center">
                        <feature.icon className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                        <div className="font-bold text-white mb-2">{feature.title}</div>
                        <div className="text-sm text-white/50">{feature.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-white/10 text-center mb-16">
          <div>
            <div className="text-5xl font-black text-purple-500">50+</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Data Sources</div>
          </div>
          <div>
            <div className="text-5xl font-black text-white">1B+</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Events/Day</div>
          </div>
          <div>
            <div className="text-5xl font-black text-white">&lt;5min</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Detection Time</div>
          </div>
          <div>
            <div className="text-5xl font-black text-white">99.9%</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Accuracy</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-20">
          <button onClick={() => setView('home')} className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://xdrplatform.maula.ai" target="_blank" rel="noopener noreferrer" className="px-12 py-6 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-[2rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/30 flex items-center gap-4 text-center">
            Launch XDR Platform <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default XDRPlatformDetail;

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
  Network,
  Wifi,
  Radio,
  Radar,
  ScanLine,
  FileSearch,
  Clock,
  Layers,
  BarChart3,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - NETWORK FORENSICS
// ============================================================================

// 1. TrafficAnalysisRadar - Real-time network traffic monitoring and anomaly detection
const TrafficAnalysisRadar: React.FC = () => {
  const [trafficData, setTrafficData] = useState<
    { id: number; source: string; destination: string; protocol: string; size: number; threat: string }[]
  >([]);

  useEffect(() => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];
    const threats = ['Normal', 'Suspicious', 'Malicious', 'Scanning'];
    const generateTraffic = () => {
      const newTraffic = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destination: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        size: Math.floor(Math.random() * 10000) + 100,
        threat: threats[Math.floor(Math.random() * threats.length)],
      }));
      setTrafficData(newTraffic);
    };

    generateTraffic();
    const interval = setInterval(generateTraffic, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-3xl border border-emerald-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBkNDZiIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      {/* Radar Sweep */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full" />
          <div className="absolute inset-4 border border-emerald-400/20 rounded-full" />
          <div className="absolute inset-8 border border-emerald-300/20 rounded-full" />
          <div className="absolute inset-12 border border-emerald-200/20 rounded-full" />

          {/* Radar Sweep Animation */}
          <div className="absolute inset-0 origin-center animate-spin" style={{ animationDuration: '4s' }}>
            <div className="w-0 h-0 border-l-[100px] border-l-emerald-500/40 border-t-[50px] border-t-transparent border-b-[50px] border-b-transparent transform -translate-x-1/2" />
          </div>

          {/* Traffic Points */}
          {trafficData.map((traffic, index) => (
            <div
              key={traffic.id}
              className={`absolute w-2 h-2 rounded-full animate-pulse ${
                traffic.threat === 'Malicious' ? 'bg-red-500' :
                traffic.threat === 'Suspicious' ? 'bg-yellow-500' :
                traffic.threat === 'Scanning' ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between text-xs font-mono text-emerald-400">
        <span>Traffic Analysis Radar</span>
        <span>{trafficData.length} Active Flows</span>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between text-xs font-mono text-emerald-300">
          <span>Real-time Network Monitoring</span>
          <span>Anomaly Detection Active</span>
        </div>
      </div>
    </div>
  );
};

// 2. DeepPacketInspector - Detailed packet inspection and protocol analysis
const DeepPacketInspector: React.FC = () => {
  const [packets, setPackets] = useState<
    { id: number; timestamp: string; protocol: string; source: string; destination: string; payload: string; flags: string[] }[]
  >([]);

  useEffect(() => {
    const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP'];
    const flags = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'];
    const generatePackets = () => {
      const newPackets = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        timestamp: new Date().toLocaleTimeString(),
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        source: `192.168.1.${Math.floor(Math.random() * 255)}`,
        destination: `10.0.0.${Math.floor(Math.random() * 255)}`,
        payload: Math.random().toString(16).substr(2, 8).toUpperCase(),
        flags: flags.slice(0, Math.floor(Math.random() * 3) + 1),
      }));
      setPackets(newPackets);
    };

    generatePackets();
    const interval = setInterval(generatePackets, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-teal-900/20 to-cyan-900/20 rounded-3xl border border-teal-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iIzFlM2E1ZSIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdHMpIi8+PC9zdmc+')] opacity-30" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-teal-400 mb-2">
        Deep Packet Inspector - Protocol Analysis
      </div>

      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/20">
          {packets.map((packet, index) => (
            <div key={packet.id} className="bg-black/20 rounded-lg p-3 border border-teal-500/10 hover:border-teal-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-teal-300">{packet.timestamp}</span>
                  <span className="text-cyan-400 font-bold">{packet.protocol}</span>
                </div>
                <div className="flex gap-1">
                  {packet.flags.map((flag, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded font-mono">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-teal-200">
                <span>{packet.source} → {packet.destination}</span>
                <span className="text-cyan-400">0x{packet.payload}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-teal-300">
        <span>Packet Stream Analysis</span>
        <span>{packets.length} Packets/sec</span>
      </div>
    </div>
  );
};

// 3. BehavioralAnomalyEngine - Machine learning-based anomaly detection
const BehavioralAnomalyEngine: React.FC = () => {
  const [anomalies, setAnomalies] = useState<
    { id: number; type: string; severity: string; confidence: number; timestamp: string; status: string }[]
  >([]);

  useEffect(() => {
    const types = ['Traffic Spike', 'Protocol Anomaly', 'Connection Pattern', 'Data Exfiltration', 'DDoS Attempt'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Investigating', 'Confirmed', 'False Positive', 'Resolved'];

    const generateAnomalies = () => {
      const newAnomalies = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        confidence: Math.floor(Math.random() * 40) + 60,
        timestamp: new Date().toLocaleTimeString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
      setAnomalies(newAnomalies);
    };

    generateAnomalies();
    const interval = setInterval(generateAnomalies, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-3xl border border-cyan-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Neural Network Visualization */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10d4b6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Connection Lines */}
          {Array.from({ length: 20 }, (_, i) => (
            <line
              key={i}
              x1={Math.random() * 400}
              y1={Math.random() * 300}
              x2={Math.random() * 400}
              y2={Math.random() * 300}
              stroke="#10d4b6"
              strokeWidth="1"
              opacity="0.2"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}

          {/* Nodes */}
          {Array.from({ length: 15 }, (_, i) => (
            <circle
              key={i}
              cx={50 + (i % 5) * 75}
              cy={50 + Math.floor(i / 5) * 75}
              r="4"
              fill="#10d4b6"
              opacity="0.6"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-cyan-400">
        Behavioral Anomaly Engine - ML Detection
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {anomalies.map((anomaly, index) => (
            <div key={anomaly.id} className="bg-black/20 rounded-lg p-3 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className={`px-2 py-1 rounded text-xs ${
                    anomaly.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    anomaly.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    anomaly.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {anomaly.severity}
                  </span>
                  <span className="text-cyan-300">{anomaly.type}</span>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  {anomaly.confidence}% confidence
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-cyan-200">
                <span>{anomaly.timestamp}</span>
                <span className="text-cyan-400">{anomaly.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-cyan-300">
        <span>AI-Powered Detection</span>
        <span>{anomalies.filter(a => a.status === 'Confirmed').length} Confirmed Threats</span>
      </div>
    </div>
  );
};

// 4. DigitalForensicMatrix - Evidence collection and timeline reconstruction
const DigitalForensicMatrix: React.FC = () => {
  const [evidence, setEvidence] = useState<
    { id: number; type: string; source: string; timestamp: string; hash: string; status: string }[]
  >([]);

  useEffect(() => {
    const types = ['Packet Capture', 'Log Entry', 'Memory Dump', 'File Artifact', 'Network Flow'];
    const sources = ['Firewall', 'IDS', 'Web Server', 'Database', 'Endpoint'];
    const statuses = ['Collected', 'Analyzed', 'Correlated', 'Archived'];

    const generateEvidence = () => {
      const newEvidence = Array.from({ length: 7 }, (_, i) => ({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        hash: Math.random().toString(16).substr(2, 16).toUpperCase(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
      setEvidence(newEvidence);
    };

    generateEvidence();
    const interval = setInterval(generateEvidence, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-3xl border border-blue-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibWF0cml4IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiMxMGQ0YjYiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtYXRyaXgpIi8+PC9zdmc+')] opacity-20" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-blue-400">
        Digital Forensic Matrix - Evidence Timeline
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-indigo-500/50" />

          <div className="space-y-3 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20">
            {evidence.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                  item.status === 'Collected' ? 'bg-blue-500 border-blue-400' :
                  item.status === 'Analyzed' ? 'bg-cyan-500 border-cyan-400' :
                  item.status === 'Correlated' ? 'bg-indigo-500 border-indigo-400' :
                  'bg-green-500 border-green-400'
                } animate-pulse`} style={{ animationDelay: `${index * 0.1}s` }} />

                <div className="ml-16 bg-black/20 rounded-lg p-3 border border-blue-500/10 hover:border-blue-500/30 transition-all flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3 text-xs font-mono">
                      <span className="text-blue-300 font-bold">{item.type}</span>
                      <span className="text-indigo-400">from {item.source}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'Collected' ? 'bg-blue-500/20 text-blue-400' :
                      item.status === 'Analyzed' ? 'bg-cyan-500/20 text-cyan-400' :
                      item.status === 'Correlated' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-blue-200">
                    <span>{item.timestamp}</span>
                    <span className="text-indigo-400">SHA256:{item.hash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-blue-300">
        <span>Evidence Chain of Custody</span>
        <span>{evidence.length} Artifacts Collected</span>
      </div>
    </div>
  );
};

// 5. EvidenceCorrelationGrid - Multi-source evidence correlation and analysis
const EvidenceCorrelationGrid: React.FC = () => {
  const [correlations, setCorrelations] = useState<
    { id: number; event: string; sources: string[]; confidence: number; impact: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    const events = ['Data Breach', 'Malware Infection', 'Unauthorized Access', 'DDoS Attack', 'Insider Threat'];
    const sources = ['Firewall', 'IDS', 'SIEM', 'Endpoint', 'Network', 'Cloud'];
    const impacts = ['Low', 'Medium', 'High', 'Critical'];

    const generateCorrelations = () => {
      const newCorrelations = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        event: events[Math.floor(Math.random() * events.length)],
        sources: sources.slice(0, Math.floor(Math.random() * 4) + 2),
        confidence: Math.floor(Math.random() * 30) + 70,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        timestamp: new Date().toLocaleTimeString(),
      }));
      setCorrelations(newCorrelations);
    };

    generateCorrelations();
    const interval = setInterval(generateCorrelations, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-indigo-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Correlation Grid */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Correlation Nodes */}
          {correlations.map((corr, index) => (
            <g key={corr.id}>
              <circle
                cx={50 + index * 80}
                cy={100 + (index % 2) * 100}
                r="15"
                fill="#6366f1"
                opacity="0.3"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
              <text
                x={50 + index * 80}
                y={105 + (index % 2) * 100}
                textAnchor="middle"
                fontSize="8"
                fill="#a5b4fc"
                fontFamily="monospace"
              >
                {corr.confidence}%
              </text>
            </g>
          ))}

          {/* Connection Lines */}
          {correlations.slice(1).map((_, index) => (
            <line
              key={index}
              x1={50 + index * 80}
              y1={100 + (index % 2) * 100}
              x2={50 + (index + 1) * 80}
              y2={100 + ((index + 1) % 2) * 100}
              stroke="#6366f1"
              strokeWidth="2"
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-indigo-400">
        Evidence Correlation Grid - Multi-Source Analysis
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20">
          {correlations.map((corr, index) => (
            <div key={corr.id} className="bg-black/20 rounded-lg p-3 border border-indigo-500/10 hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-indigo-300 font-bold">{corr.event}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    corr.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    corr.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    corr.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {corr.impact}
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-400">
                  {corr.confidence}% correlation
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-indigo-200">
                <div className="flex gap-2">
                  {corr.sources.map((source, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded">
                      {source}
                    </span>
                  ))}
                </div>
                <span>{corr.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-indigo-300">
        <span>Cross-Source Correlation</span>
        <span>{correlations.length} Events Analyzed</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const NetworkForensicsDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live metrics state
  const [packetsAnalyzed, setPacketsAnalyzed] = useState(1250000000);
  const [anomaliesDetected, setAnomaliesDetected] = useState(45000);
  const [evidenceCollected, setEvidenceCollected] = useState(8900);
  const [forensicAccuracy, setForensicAccuracy] = useState(97.8);

  useEffect(() => {
    // Live metrics simulation
    const packetsInterval = setInterval(() => {
      setPacketsAnalyzed(prev => prev + Math.floor(Math.random() * 100000) + 50000);
    }, 2000);

    const anomaliesInterval = setInterval(() => {
      setAnomaliesDetected(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 3000);

    const evidenceInterval = setInterval(() => {
      setEvidenceCollected(prev => prev + Math.floor(Math.random() * 20) + 5);
    }, 4000);

    const accuracyInterval = setInterval(() => {
      setForensicAccuracy(prev => Math.max(95, Math.min(99.9, prev + (Math.random() - 0.5) * 0.2)));
    }, 5000);

    return () => {
      clearInterval(packetsInterval);
      clearInterval(anomaliesInterval);
      clearInterval(evidenceInterval);
      clearInterval(accuracyInterval);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      // Content animations
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Floating background elements
      gsap.to('.floating-bg-1', {
        y: '+=20',
        duration: 4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.floating-bg-2', {
        y: '+=30',
        duration: 6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1,
      });

      gsap.to('.floating-bg-3', {
        x: '+=15',
        duration: 5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0f0a] text-white selection:bg-emerald-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-cyan-900/20" />

        {/* Animated floating elements */}
        <div className="floating-bg-1 absolute top-[10%] left-[5%] w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full" />
        <div className="floating-bg-2 absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-teal-600/5 blur-[120px] rounded-full" />
        <div className="floating-bg-3 absolute bottom-[20%] left-[50%] w-80 h-80 bg-cyan-600/5 blur-[80px] rounded-full" />

        {/* Data stream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBkNDZiIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-30" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            NetworkForensics v2.0
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-emerald-500/20 backdrop-blur-3xl">
              <Network className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500">
                Deep Network Analysis
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              NETWORK <span className="text-emerald-500">FORENSICS</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Advanced network forensics tools for deep packet inspection, anomaly detection,
              and comprehensive digital evidence collection and analysis.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://networkforensics.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-emerald-500/20"
              >
                Start Capture
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Speed: 100Gbps
              </div>
            </div>
          </div>

          {/* Hero Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <TrafficAnalysisRadar />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Live Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-emerald-500">
                {(packetsAnalyzed / 1000000000).toFixed(1)}B+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Packets Analyzed
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {anomaliesDetected.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Anomalies Detected
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {evidenceCollected.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Evidence Collected
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {forensicAccuracy.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Forensic Accuracy
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ScanLine className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Deep Packet Inspection</h3>
              <p className="text-white/50 leading-relaxed">
                Full Layer 7 analysis with protocol decoding, payload inspection, and
                behavioral pattern recognition across 3000+ protocols.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Radar className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Real-Time Anomaly Detection</h3>
              <p className="text-white/50 leading-relaxed">
                AI-powered behavioral analysis with machine learning models trained on
                millions of network flows to identify threats instantly.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Digital Evidence Collection</h3>
              <p className="text-white/50 leading-relaxed">
                Automated evidence gathering with chain of custody, timeline reconstruction,
                and correlation across multiple data sources.
              </p>
            </div>
          </div>

          {/* Network Forensics Engine Visualization */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
                Network Forensics <span className="text-emerald-500">Engine</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Comprehensive network analysis platform with advanced forensics capabilities,
                real-time monitoring, and automated evidence correlation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Engine Components */}
              <div className="space-y-8">
                <DeepPacketInspector />
                <BehavioralAnomalyEngine />
              </div>
              <div className="space-y-8">
                <DigitalForensicMatrix />
                <EvidenceCorrelationGrid />
              </div>
            </div>

            {/* Capability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-emerald-500/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Network className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-500">100Gbps</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Capture Speed</div>
                <div className="text-xs text-white/40">Real-time packet processing at line rate</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Database className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-500">3000+</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Protocols</div>
                <div className="text-xs text-white/40">Comprehensive protocol support and decoding</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-500">AI/ML</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Detection</div>
                <div className="text-xs text-white/40">Machine learning-powered anomaly detection</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-emerald-500">99.9%</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Accuracy</div>
                <div className="text-xs text-white/40">Industry-leading forensic accuracy</div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="glass rounded-[3rem] border border-white/5 p-12">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Forensics Dashboard</h3>
                <p className="text-white/60">Real-time network analysis and evidence management interface</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-emerald-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-500">2.4M</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Active Flows</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Normal</span>
                      <span className="text-emerald-400">98.7%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.7%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-emerald-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-red-500">47</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Active Threats</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Latest: DDoS Attempt from Russia</div>
                    <div className="text-xs text-red-400">High Priority Investigation</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-emerald-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-500">1.2TB</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Evidence Stored</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">90-day retention period</div>
                    <div className="text-xs text-blue-400">Chain of custody maintained</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://networkforensics.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-emerald-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-emerald-500/20 flex items-center gap-4">
            Analyze Traffic <Network className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NetworkForensicsDetail;

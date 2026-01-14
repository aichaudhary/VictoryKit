
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
  GitBranch,
  FileText,
  Layers,
  BarChart3,
  TrendingUp,
  Zap as Lightning,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - THREAT MODELING
// ============================================================================

// 1. ArchitectureAnalyzer - System architecture analysis and component identification
const ArchitectureAnalyzer: React.FC = () => {
  const [components, setComponents] = useState<
    { id: number; type: string; name: string; connections: number; risk: string; status: string }[]
  >([]);

  useEffect(() => {
    const types = ['Web Server', 'Database', 'API Gateway', 'Load Balancer', 'Cache', 'CDN'];
    const risks = ['Low', 'Medium', 'High', 'Critical'];
    const statuses = ['Analyzed', 'Modeling', 'Complete'];

    const generateComponents = () => {
      const newComponents = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        name: `Component-${i + 1}`,
        connections: Math.floor(Math.random() * 10) + 1,
        risk: risks[Math.floor(Math.random() * risks.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
      setComponents(newComponents);
    };

    generateComponents();
    const interval = setInterval(generateComponents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibmV0d29yayIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0iI2VmNDQ0NCIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMSIgZmlsbD0iI2VjNDg5OSIgb3BhY2l0eT0iMC4zIi8+PGxpbmUgeDE9IjIiIHkxPSIyIiB4Mj0iMTgiIHkyPSIxOCIgc3Ryb2tlPSIjZWY0NDQ0IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI25ldHdvcmspIi8+PC9zdmc+')] opacity-30" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-red-400">
        Architecture Analyzer - Component Discovery
      </div>

      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
          {components.map((component, index) => (
            <div key={component.id} className="bg-black/20 rounded-lg p-3 border border-red-500/10 hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 text-xs font-mono">
                  <span className={`px-2 py-1 rounded text-xs ${
                    component.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    component.risk === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    component.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {component.risk}
                  </span>
                  <span className="text-pink-400">{component.status}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-red-300 mb-1">{component.name}</div>
              <div className="text-xs font-mono text-red-200">{component.type}</div>
              <div className="text-xs font-mono text-pink-400 mt-1">{component.connections} connections</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-300">
        <span>System Analysis Active</span>
        <span>{components.length} Components Found</span>
      </div>
    </div>
  );
};

// 2. ThreatDiscoveryEngine - AI-powered threat identification and classification
const ThreatDiscoveryEngine: React.FC = () => {
  const [threats, setThreats] = useState<
    { id: number; category: string; description: string; likelihood: number; impact: string; confidence: number }[]
  >([]);

  useEffect(() => {
    const categories = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];
    const impacts = ['Low', 'Medium', 'High', 'Critical'];

    const generateThreats = () => {
      const newThreats = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Potential ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} attack vector`,
        likelihood: Math.floor(Math.random() * 40) + 60,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        confidence: Math.floor(Math.random() * 30) + 70,
      }));
      setThreats(newThreats);
    };

    generateThreats();
    const interval = setInterval(generateThreats, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-3xl border border-pink-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Threat Detection Visualization */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <radialGradient id="threat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Radar-like threat detection */}
          {threats.map((threat, index) => (
            <g key={threat.id}>
              <circle
                cx={80 + index * 60}
                cy={120 + (index % 2) * 60}
                r="20"
                fill="none"
                stroke={
                  threat.impact === 'Critical' ? '#ef4444' :
                  threat.impact === 'High' ? '#f97316' :
                  threat.impact === 'Medium' ? '#eab308' : '#22c55e'
                }
                strokeWidth="2"
                opacity="0.6"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
              <circle
                cx={80 + index * 60}
                cy={120 + (index % 2) * 60}
                r="8"
                fill={
                  threat.impact === 'Critical' ? '#ef4444' :
                  threat.impact === 'High' ? '#f97316' :
                  threat.impact === 'Medium' ? '#eab308' : '#22c55e'
                }
                opacity="0.8"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-pink-400">
        Threat Discovery Engine - AI-Powered Analysis
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20">
          {threats.map((threat, index) => (
            <div key={threat.id} className="bg-black/20 rounded-lg p-3 border border-pink-500/10 hover:border-pink-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-pink-300 font-bold">{threat.category}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    threat.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    threat.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    threat.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {threat.impact}
                  </span>
                </div>
                <div className="text-xs font-mono text-pink-400">
                  {threat.confidence}% confidence
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-pink-200">
                <span>{threat.description}</span>
                <span>{threat.likelihood}% likelihood</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-pink-300">
        <span>AI Threat Detection</span>
        <span>{threats.length} Threats Identified</span>
      </div>
    </div>
  );
};

// 3. RiskAssessmentMatrix - Risk scoring and prioritization visualization
const RiskAssessmentMatrix: React.FC = () => {
  const [risks, setRisks] = useState<
    { id: number; threat: string; vulnerability: string; likelihood: number; impact: number; priority: string }[]
  >([]);

  useEffect(() => {
    const threats = ['SQL Injection', 'XSS Attack', 'CSRF', 'Broken Authentication', 'Data Breach'];
    const vulnerabilities = ['Input Validation', 'Session Management', 'Access Control', 'Encryption', 'Logging'];

    const generateRisks = () => {
      const newRisks = Array.from({ length: 4 }, (_, i) => {
        const likelihood = Math.floor(Math.random() * 5) + 1;
        const impact = Math.floor(Math.random() * 5) + 1;
        const priorityScore = likelihood * impact;

        let priority = 'Low';
        if (priorityScore >= 20) priority = 'Critical';
        else if (priorityScore >= 15) priority = 'High';
        else if (priorityScore >= 10) priority = 'Medium';

        return {
          id: i,
          threat: threats[Math.floor(Math.random() * threats.length)],
          vulnerability: vulnerabilities[Math.floor(Math.random() * vulnerabilities.length)],
          likelihood,
          impact,
          priority,
        };
      });
      setRisks(newRisks);
    };

    generateRisks();
    const interval = setInterval(generateRisks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-rose-900/20 to-red-900/20 rounded-3xl border border-rose-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Risk Matrix Grid */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="matrix" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="45" height="45" fill="none" stroke="#f43f5e" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matrix)" />

          {/* Risk Points */}
          {risks.map((risk, index) => (
            <circle
              key={risk.id}
              cx={50 + risk.likelihood * 60}
              cy={250 - risk.impact * 40}
              r="8"
              fill={
                risk.priority === 'Critical' ? '#ef4444' :
                risk.priority === 'High' ? '#f97316' :
                risk.priority === 'Medium' ? '#eab308' : '#22c55e'
              }
              opacity="0.8"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          ))}

          {/* Grid Labels */}
          <text x="30" y="20" fontSize="10" fill="#f43f5e" fontFamily="monospace">HIGH</text>
          <text x="350" y="20" fontSize="10" fill="#f43f5e" fontFamily="monospace">IMPACT</text>
          <text x="30" y="280" fontSize="10" fill="#f43f5e" fontFamily="monospace">LOW</text>
          <text x="10" y="150" fontSize="10" fill="#f43f5e" fontFamily="monospace" transform="rotate(-90 10 150)">LIKELIHOOD</text>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-rose-400">
        Risk Assessment Matrix - Threat Prioritization
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rose-500/20">
          {risks.map((risk, index) => (
            <div key={risk.id} className="bg-black/20 rounded-lg p-3 border border-rose-500/10 hover:border-rose-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-rose-300 font-bold">{risk.threat}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    risk.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    risk.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    risk.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {risk.priority}
                  </span>
                </div>
                <div className="text-xs font-mono text-rose-400">
                  Risk Score: {risk.likelihood * risk.impact}
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-rose-200">
                <span>{risk.vulnerability}</span>
                <span>L:{risk.likelihood} × I:{risk.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-rose-300">
        <span>Risk Analysis Complete</span>
        <span>{risks.filter(r => r.priority === 'Critical').length} Critical Risks</span>
      </div>
    </div>
  );
};

// 4. MitigationPlanner - Automated security control recommendations
const MitigationPlanner: React.FC = () => {
  const [mitigations, setMitigations] = useState<
    { id: number; control: string; threat: string; effectiveness: number; complexity: string; status: string }[]
  >([]);

  useEffect(() => {
    const controls = ['Input Validation', 'Authentication', 'Authorization', 'Encryption', 'Logging', 'Monitoring'];
    const threats = ['Injection', 'Broken Auth', 'XSS', 'CSRF', 'Data Exposure'];
    const complexities = ['Low', 'Medium', 'High'];
    const statuses = ['Recommended', 'Implemented', 'Testing', 'Verified'];

    const generateMitigations = () => {
      const newMitigations = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        control: controls[Math.floor(Math.random() * controls.length)],
        threat: threats[Math.floor(Math.random() * threats.length)],
        effectiveness: Math.floor(Math.random() * 40) + 60,
        complexity: complexities[Math.floor(Math.random() * complexities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
      setMitigations(newMitigations);
    };

    generateMitigations();
    const interval = setInterval(generateMitigations, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Mitigation Flow */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Control Flow Lines */}
          <path d="M50 100 Q200 50 350 100" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="5,5" className="animate-pulse"/>
          <path d="M50 150 Q200 200 350 150" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.5s' }}/>
          <path d="M50 200 Q200 150 350 200" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '1s' }}/>

          {/* Control Nodes */}
          {mitigations.slice(0, 5).map((_, index) => (
            <circle
              key={index}
              cx={50 + index * 70}
              cy={100 + (index % 3) * 50}
              r="8"
              fill="#ef4444"
              opacity="0.7"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-red-400">
        Mitigation Planner - Automated Security Controls
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
          {mitigations.map((mitigation, index) => (
            <div key={mitigation.id} className="bg-black/20 rounded-lg p-3 border border-red-500/10 hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-red-300 font-bold">{mitigation.control}</span>
                  <span className="text-orange-400">vs {mitigation.threat}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mitigation.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                    mitigation.status === 'Implemented' ? 'bg-blue-500/20 text-blue-400' :
                    mitigation.status === 'Testing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {mitigation.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-red-400">
                  {mitigation.effectiveness}% effective
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-red-200">
                <span>Complexity: {mitigation.complexity}</span>
                <span>Auto-generated</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-300">
        <span>Control Recommendations</span>
        <span>{mitigations.filter(m => m.status === 'Verified').length} Verified Controls</span>
      </div>
    </div>
  );
};

// 5. ModelVisualization - Interactive threat model diagrams and flowcharts
const ModelVisualization: React.FC = () => {
  const [model, setModel] = useState<
    { id: number; component: string; threats: number; mitigations: number; risk: string; connections: string[] }[]
  >([]);

  useEffect(() => {
    const components = ['Web App', 'Database', 'API', 'Auth Service', 'File Storage', 'Cache'];
    const risks = ['Low', 'Medium', 'High', 'Critical'];

    const generateModel = () => {
      const newModel = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        component: components[Math.floor(Math.random() * components.length)],
        threats: Math.floor(Math.random() * 8) + 1,
        mitigations: Math.floor(Math.random() * 6) + 1,
        risk: risks[Math.floor(Math.random() * risks.length)],
        connections: components.slice(0, Math.floor(Math.random() * 3) + 1),
      }));
      setModel(newModel);
    };

    generateModel();
    const interval = setInterval(generateModel, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Model Diagram */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="diagram" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="#f97316" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagram)" />

          {/* Component Nodes */}
          {model.map((item, index) => (
            <g key={item.id}>
              <rect
                x={50 + index * 60}
                y={100 + (index % 2) * 80}
                width="40"
                height="20"
                fill={
                  item.risk === 'Critical' ? '#ef4444' :
                  item.risk === 'High' ? '#f97316' :
                  item.risk === 'Medium' ? '#eab308' : '#22c55e'
                }
                opacity="0.6"
                rx="4"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
              <text
                x={70 + index * 60}
                y={112 + (index % 2) * 80}
                textAnchor="middle"
                fontSize="6"
                fill="#ffffff"
                fontFamily="monospace"
              >
                {item.component.substring(0, 4)}
              </text>
            </g>
          ))}

          {/* Connection Lines */}
          {model.slice(1).map((_, index) => (
            <line
              key={index}
              x1={70 + index * 60}
              y1={110 + (index % 2) * 80}
              x2={70 + (index + 1) * 60}
              y2={110 + ((index + 1) % 2) * 80}
              stroke="#f97316"
              strokeWidth="2"
              opacity="0.4"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-orange-400">
        Model Visualization - Interactive Threat Diagrams
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20">
          {model.map((item, index) => (
            <div key={item.id} className="bg-black/20 rounded-lg p-3 border border-orange-500/10 hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-orange-300 font-bold">{item.component}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    item.risk === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    item.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {item.risk}
                  </span>
                </div>
                <div className="text-xs font-mono text-orange-400">
                  {item.threats} threats, {item.mitigations} mitigations
                </div>
              </div>
              <div className="text-xs font-mono text-orange-200">
                Connected to: {item.connections.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-orange-300">
        <span>Interactive Model</span>
        <span>{model.length} Components Modeled</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ThreatModelDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live metrics state
  const [modelsAnalyzed, setModelsAnalyzed] = useState(25000);
  const [threatsIdentified, setThreatsIdentified] = useState(185000);
  const [mitigationsGenerated, setMitigationsGenerated] = useState(95000);
  const [riskReduction, setRiskReduction] = useState(87.3);

  useEffect(() => {
    // Live metrics simulation
    const modelsInterval = setInterval(() => {
      setModelsAnalyzed(prev => prev + Math.floor(Math.random() * 100) + 50);
    }, 2000);

    const threatsInterval = setInterval(() => {
      setThreatsIdentified(prev => prev + Math.floor(Math.random() * 500) + 200);
    }, 3000);

    const mitigationsInterval = setInterval(() => {
      setMitigationsGenerated(prev => prev + Math.floor(Math.random() * 300) + 100);
    }, 4000);

    const riskInterval = setInterval(() => {
      setRiskReduction(prev => Math.max(80, Math.min(95, prev + (Math.random() - 0.5) * 0.5)));
    }, 5000);

    return () => {
      clearInterval(modelsInterval);
      clearInterval(threatsInterval);
      clearInterval(mitigationsInterval);
      clearInterval(riskInterval);
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
      className="min-h-screen bg-[#0d0408] text-white selection:bg-red-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-pink-900/10 to-rose-900/20" />

        {/* Animated floating elements */}
        <div className="floating-bg-1 absolute top-[10%] left-[5%] w-96 h-96 bg-red-600/5 blur-[100px] rounded-full" />
        <div className="floating-bg-2 absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-pink-600/5 blur-[120px] rounded-full" />
        <div className="floating-bg-3 absolute bottom-[20%] left-[50%] w-80 h-80 bg-rose-600/5 blur-[80px] rounded-full" />

        {/* Data stream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400/20 rounded-full animate-pulse"
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWY0NDQ0IiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-30" />

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
            ThreatModel v2.0
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-red-500/20 backdrop-blur-3xl">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">
                Automated Threat Modeling
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              THREAT <span className="text-red-500">MODEL</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              AI-powered threat modeling platform that analyzes system architectures,
              identifies security threats using STRIDE and custom frameworks, and generates
              comprehensive mitigation strategies with automated risk assessment.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://threatmodel.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-red-500/20"
              >
                Start Modeling
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Frameworks: STRIDE+
              </div>
            </div>
          </div>

          {/* Hero Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <ArchitectureAnalyzer />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Live Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-red-500">
                {modelsAnalyzed.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Models Analyzed
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {(threatsIdentified / 1000).toFixed(0)}K+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Threats Identified
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {(mitigationsGenerated / 1000).toFixed(0)}K+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Mitigations Generated
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {riskReduction.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Risk Reduction
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <GitBranch className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Architecture Analysis</h3>
              <p className="text-white/50 leading-relaxed">
                Automated analysis of system architectures, data flows, and trust boundaries
                with intelligent component discovery and dependency mapping.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">AI Threat Discovery</h3>
              <p className="text-white/50 leading-relaxed">
                Machine learning-powered threat identification using STRIDE, PASTA, and
                custom frameworks with confidence scoring and impact assessment.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Automated Mitigation</h3>
              <p className="text-white/50 leading-relaxed">
                Intelligent generation of security controls and remediation strategies
                with priority scoring, complexity assessment, and implementation guidance.
              </p>
            </div>
          </div>

          {/* Threat Model Engine Visualization */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
                Threat Model <span className="text-red-500">Engine</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Comprehensive threat modeling platform with AI-powered analysis,
                automated risk assessment, and intelligent mitigation planning.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Engine Components */}
              <div className="space-y-8">
                <ThreatDiscoveryEngine />
                <RiskAssessmentMatrix />
              </div>
              <div className="space-y-8">
                <MitigationPlanner />
                <ModelVisualization />
              </div>
            </div>

            {/* Capability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-red-500/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Target className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-3xl font-black text-red-500">STRIDE+</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Framework</div>
                <div className="text-xs text-white/40">Industry standard methodology</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-3xl font-black text-red-500">AI/ML</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Analysis</div>
                <div className="text-xs text-white/40">Machine learning powered</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-3xl font-black text-red-500">95%</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Accuracy</div>
                <div className="text-xs text-white/40">Threat detection precision</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <Lightning className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-3xl font-black text-red-500">Auto</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Generation</div>
                <div className="text-xs text-white/40">Automated mitigation plans</div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="glass rounded-[3rem] border border-white/5 p-12">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Threat Modeling Dashboard</h3>
                <p className="text-white/60">Real-time threat analysis and risk management interface</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-red-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-red-500">1.2K</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Active Models</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Complete</span>
                      <span className="text-red-400">87%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-red-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-orange-500">47</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Critical Threats</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Latest: Zero-day vulnerability</div>
                    <div className="text-xs text-orange-400">Immediate mitigation required</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-red-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-500">92.4%</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Risk Mitigated</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">All high-risk controls implemented</div>
                    <div className="text-xs text-green-400">Compliance ready</div>
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
          <a href="https://threatmodel.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-red-500/20 flex items-center gap-4">
            Analyze Threats <Target className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ThreatModelDetail;


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
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Calculator,
  Percent,
  Coins,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - RISK QUANTIFICATION
// ============================================================================

// 1. FinancialImpactCalculator - Convert security risks to financial terms
const FinancialImpactCalculator: React.FC = () => {
  const [calculations, setCalculations] = useState<
    { id: number; scenario: string; probability: number; impact: number; annualizedLoss: number; currency: string }[]
  >([]);

  useEffect(() => {
    const scenarios = ['Data Breach', 'Ransomware', 'DDoS Attack', 'Insider Threat', 'Supply Chain Attack'];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

    const generateCalculations = () => {
      const newCalculations = Array.from({ length: 4 }, (_, i) => {
        const probability = Math.floor(Math.random() * 30) + 5; // 5-35%
        const impact = Math.floor(Math.random() * 5000000) + 100000; // $100K-$5M
        const annualizedLoss = Math.round((probability / 100) * impact);

        return {
          id: i,
          scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
          probability,
          impact,
          annualizedLoss,
          currency: currencies[Math.floor(Math.random() * currencies.length)],
        };
      });
      setCalculations(newCalculations);
    };

    generateCalculations();
    const interval = setInterval(generateCalculations, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-amber-900/20 to-yellow-900/20 rounded-3xl border border-amber-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZmluYW5jaWFsIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjIiIGZpbGw9IiNmNTlhM2UiIG9wYWNpdHk9IjAuMyIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWEzZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNmaW5hbmNpYWwpIi8+PC9zdmc+')] opacity-30" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-amber-400">
        Financial Impact Calculator - Risk to Revenue Translation
      </div>

      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="grid grid-cols-1 gap-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20">
          {calculations.map((calc, index) => (
            <div key={calc.id} className="bg-black/20 rounded-lg p-3 border border-amber-500/10 hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 text-xs font-mono">
                  <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">
                    {calc.probability}% prob
                  </span>
                  <span className="text-yellow-400">{calc.scenario}</span>
                </div>
                <div className="text-xs font-mono text-amber-400">
                  {calc.currency}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-amber-200">
                <div>
                  <div className="text-amber-300 font-bold">${calc.impact.toLocaleString()}</div>
                  <div className="text-amber-400/60">Max Impact</div>
                </div>
                <div>
                  <div className="text-yellow-300 font-bold">${calc.annualizedLoss.toLocaleString()}</div>
                  <div className="text-yellow-400/60">Annual Loss</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-amber-300">
        <span>Risk Quantification Active</span>
        <span>{calculations.length} Scenarios Analyzed</span>
      </div>
    </div>
  );
};

// 2. MonteCarloSimulator - Probability distribution modeling
const MonteCarloSimulator: React.FC = () => {
  const [simulations, setSimulations] = useState<
    { id: number; scenario: string; iterations: number; mean: number; stdDev: number; confidence95: number; status: string }[]
  >([]);

  useEffect(() => {
    const scenarios = ['Breach Cost', 'Downtime Impact', 'Recovery Cost', 'Legal Fees', 'Reputation Damage'];

    const generateSimulations = () => {
      const newSimulations = Array.from({ length: 3 }, (_, i) => {
        const mean = Math.floor(Math.random() * 2000000) + 500000;
        const stdDev = Math.floor(mean * (0.2 + Math.random() * 0.3)); // 20-50% of mean
        const confidence95 = Math.round(mean + 1.96 * stdDev);

        return {
          id: i,
          scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
          iterations: Math.floor(Math.random() * 50000) + 10000,
          mean,
          stdDev,
          confidence95,
          status: ['Running', 'Complete', 'Analyzing'][Math.floor(Math.random() * 3)],
        };
      });
      setSimulations(newSimulations);
    };

    generateSimulations();
    const interval = setInterval(generateSimulations, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-3xl border border-yellow-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Monte Carlo Distribution Visualization */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="montecarlo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Bell curve approximation */}
          <path
            d="M50 250 Q100 100 200 50 Q300 100 350 250"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            opacity="0.6"
            className="animate-pulse"
          />
          <path
            d="M70 250 Q120 120 200 80 Q280 120 330 250"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            opacity="0.4"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Confidence interval markers */}
          <line x1="120" y1="40" x2="120" y2="260" stroke="#22c55e" strokeWidth="2" opacity="0.8" strokeDasharray="5,5"/>
          <line x1="280" y1="40" x2="280" y2="260" stroke="#22c55e" strokeWidth="2" opacity="0.8" strokeDasharray="5,5"/>
          <text x="110" y="30" fontSize="8" fill="#22c55e" fontFamily="monospace">95% CI</text>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-yellow-400">
        Monte Carlo Simulator - Probability Distribution Analysis
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500/20">
          {simulations.map((sim, index) => (
            <div key={sim.id} className="bg-black/20 rounded-lg p-3 border border-yellow-500/10 hover:border-yellow-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-yellow-300 font-bold">{sim.scenario}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sim.status === 'Complete' ? 'bg-green-500/20 text-green-400' :
                    sim.status === 'Running' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {sim.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-yellow-400">
                  {sim.iterations.toLocaleString()} iter
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-yellow-200">
                <div>
                  <div className="text-yellow-300 font-bold">${sim.mean.toLocaleString()}</div>
                  <div className="text-yellow-400/60">Mean</div>
                </div>
                <div>
                  <div className="text-orange-300 font-bold">${sim.stdDev.toLocaleString()}</div>
                  <div className="text-orange-400/60">Std Dev</div>
                </div>
                <div>
                  <div className="text-green-300 font-bold">${sim.confidence95.toLocaleString()}</div>
                  <div className="text-green-400/60">95% CI</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-yellow-300">
        <span>Simulation Running</span>
        <span>{simulations.filter(s => s.status === 'Complete').length} Complete</span>
      </div>
    </div>
  );
};

// 3. RiskHeatMap - Visual risk assessment matrix
const RiskHeatMap: React.FC = () => {
  const [heatmap, setHeatmap] = useState<
    { x: number; y: number; risk: number; asset: string; threat: string; color: string }[]
  >([]);

  useEffect(() => {
    const assets = ['Web App', 'Database', 'API', 'Network', 'User Data', 'Infrastructure'];
    const threats = ['Injection', 'XSS', 'Auth Bypass', 'Data Breach', 'DDoS', 'Malware'];

    const generateHeatmap = () => {
      const newHeatmap = Array.from({ length: 12 }, (_, i) => {
        const risk = Math.floor(Math.random() * 25) + 1; // 1-25 risk score
        const color = risk > 20 ? '#ef4444' : risk > 15 ? '#f97316' : risk > 10 ? '#eab308' : '#22c55e';

        return {
          x: i % 4,
          y: Math.floor(i / 4),
          risk,
          asset: assets[Math.floor(Math.random() * assets.length)],
          threat: threats[Math.floor(Math.random() * threats.length)],
          color,
        };
      });
      setHeatmap(newHeatmap);
    };

    generateHeatmap();
    const interval = setInterval(generateHeatmap, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Heat Map Grid */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="heatmap" width="80" height="60" patternUnits="userSpaceOnUse">
              <rect width="75" height="55" fill="none" stroke="#ea580c" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heatmap)" />

          {/* Risk Cells */}
          {heatmap.map((cell, index) => (
            <rect
              key={index}
              x={50 + cell.x * 80}
              y={50 + cell.y * 60}
              width="70"
              height="50"
              fill={cell.color}
              opacity="0.6"
              rx="4"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}

          {/* Grid Labels */}
          <text x="20" y="30" fontSize="10" fill="#ea580c" fontFamily="monospace">HIGH RISK</text>
          <text x="350" y="30" fontSize="10" fill="#ea580c" fontFamily="monospace">LOW RISK</text>
          <text x="10" y="150" fontSize="10" fill="#ea580c" fontFamily="monospace" transform="rotate(-90 10 150)">IMPACT</text>
          <text x="200" y="290" fontSize="10" fill="#ea580c" fontFamily="monospace">PROBABILITY</text>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-orange-400">
        Risk Heat Map - Asset-Threat Matrix Analysis
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20">
          {heatmap.slice(0, 8).map((cell, index) => (
            <div key={index} className="bg-black/20 rounded-lg p-2 border border-orange-500/10 hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-mono text-orange-300 font-bold">{cell.asset}</div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  cell.risk > 20 ? 'bg-red-500/20 text-red-400' :
                  cell.risk > 15 ? 'bg-orange-500/20 text-orange-400' :
                  cell.risk > 10 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {cell.risk}
                </div>
              </div>
              <div className="text-xs font-mono text-orange-200">{cell.threat}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-orange-300">
        <span>Heat Map Analysis</span>
        <span>{heatmap.filter(h => h.risk > 15).length} High Risk Areas</span>
      </div>
    </div>
  );
};

// 4. ROI_Analyzer - Mitigation return on investment calculations
const ROI_Analyzer: React.FC = () => {
  const [roiCalculations, setRoiCalculations] = useState<
    { id: number; control: string; cost: number; savings: number; payback: number; roi: number; status: string }[]
  >([]);

  useEffect(() => {
    const controls = ['WAF Implementation', 'MFA Deployment', 'Security Training', 'Vulnerability Scanning', 'Incident Response'];

    const generateROI = () => {
      const newCalculations = Array.from({ length: 5 }, (_, i) => {
        const cost = Math.floor(Math.random() * 500000) + 50000;
        const savings = Math.floor(Math.random() * 1000000) + 200000;
        const payback = Math.round((cost / savings) * 12); // months
        const roi = Math.round(((savings - cost) / cost) * 100);

        return {
          id: i,
          control: controls[Math.floor(Math.random() * controls.length)],
          cost,
          savings,
          payback,
          roi,
          status: roi > 200 ? 'Excellent' : roi > 100 ? 'Good' : roi > 0 ? 'Positive' : 'Negative',
        };
      });
      setRoiCalculations(newCalculations);
    };

    generateROI();
    const interval = setInterval(generateROI, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* ROI Chart */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="roi" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* ROI Bars */}
          {roiCalculations.slice(0, 4).map((calc, index) => (
            <g key={calc.id}>
              <rect
                x={50 + index * 80}
                y={250 - (calc.roi / 5)} // Scale ROI to fit
                width="30"
                height={Math.min(calc.roi / 5, 200)}
                fill={
                  calc.roi > 200 ? '#22c55e' :
                  calc.roi > 100 ? '#3b82f6' :
                  calc.roi > 0 ? '#eab308' : '#ef4444'
                }
                opacity="0.7"
                rx="2"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
              <text
                x={65 + index * 80}
                y={270}
                textAnchor="middle"
                fontSize="8"
                fill="#ef4444"
                fontFamily="monospace"
              >
                {calc.roi}%
              </text>
            </g>
          ))}

          {/* Zero line */}
          <line x1="30" y1="250" x2="370" y2="250" stroke="#ef4444" strokeWidth="1" opacity="0.5" strokeDasharray="2,2"/>
          <text x="10" y="255" fontSize="8" fill="#ef4444" fontFamily="monospace">ROI</text>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-red-400">
        ROI Analyzer - Security Investment Returns
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
          {roiCalculations.map((calc, index) => (
            <div key={calc.id} className="bg-black/20 rounded-lg p-3 border border-red-500/10 hover:border-red-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-red-300 font-bold">{calc.control}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    calc.status === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                    calc.status === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                    calc.status === 'Positive' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {calc.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-red-400">
                  {calc.payback}mo payback
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-red-200">
                <div>
                  <div className="text-red-300 font-bold">${calc.cost.toLocaleString()}</div>
                  <div className="text-red-400/60">Cost</div>
                </div>
                <div>
                  <div className="text-pink-300 font-bold">${calc.savings.toLocaleString()}</div>
                  <div className="text-pink-400/60">Savings</div>
                </div>
                <div>
                  <div className="text-green-300 font-bold">{calc.roi}%</div>
                  <div className="text-green-400/60">ROI</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-300">
        <span>Investment Analysis</span>
        <span>{roiCalculations.filter(r => r.roi > 100).length} Profitable Controls</span>
      </div>
    </div>
  );
};

// 5. ExecutiveDashboard - Board-ready risk reporting
const ExecutiveDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<
    { id: number; metric: string; value: string; change: number; trend: string; priority: string }[]
  >([]);

  useEffect(() => {
    const metrics = [
      'Total Risk Exposure', 'Risk Reduction', 'Cost Avoidance', 'Compliance Score',
      'Incident Frequency', 'Recovery Time', 'Board Confidence', 'Peer Comparison'
    ];

    const generateDashboard = () => {
      const newDashboard = Array.from({ length: 6 }, (_, i) => {
        const change = Math.floor(Math.random() * 40) - 20; // -20% to +20%
        const trend = change > 5 ? 'Improving' : change < -5 ? 'Declining' : 'Stable';
        const priority = Math.abs(change) > 15 ? 'High' : Math.abs(change) > 8 ? 'Medium' : 'Low';

        let value = '';
        switch (metrics[i]) {
          case 'Total Risk Exposure': value = `$${(Math.random() * 10 + 5).toFixed(1)}M`; break;
          case 'Risk Reduction': value = `${(Math.random() * 30 + 60).toFixed(1)}%`; break;
          case 'Cost Avoidance': value = `$${(Math.random() * 2 + 1).toFixed(1)}M`; break;
          case 'Compliance Score': value = `${(Math.random() * 20 + 80).toFixed(1)}%`; break;
          case 'Incident Frequency': value = `${Math.floor(Math.random() * 20 + 5)}/year`; break;
          case 'Recovery Time': value = `${Math.floor(Math.random() * 24 + 1)}hrs`; break;
          case 'Board Confidence': value = `${(Math.random() * 20 + 75).toFixed(1)}%`; break;
          case 'Peer Comparison': value = `${(Math.random() * 40 - 20).toFixed(1)}%`; break;
          default: value = 'N/A';
        }

        return {
          id: i,
          metric: metrics[i],
          value,
          change,
          trend,
          priority,
        };
      });
      setDashboard(newDashboard);
    };

    generateDashboard();
    const interval = setInterval(generateDashboard, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-3xl border border-pink-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Dashboard Grid */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="dashboard" width="60" height="40" patternUnits="userSpaceOnUse">
              <rect width="55" height="35" fill="none" stroke="#ec4899" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard)" />

          {/* Metric Indicators */}
          {dashboard.slice(0, 6).map((metric, index) => (
            <circle
              key={metric.id}
              cx={60 + (index % 3) * 120}
              cy={80 + Math.floor(index / 3) * 100}
              r="15"
              fill={
                metric.priority === 'High' ? '#ef4444' :
                metric.priority === 'Medium' ? '#f97316' : '#22c55e'
              }
              opacity="0.6"
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-pink-400">
        Executive Dashboard - Board-Ready Risk Reporting
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20">
          {dashboard.map((metric, index) => (
            <div key={metric.id} className="bg-black/20 rounded-lg p-3 border border-pink-500/10 hover:border-pink-500/30 transition-all">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-mono text-pink-300 font-bold">{metric.metric}</div>
                <div className={`px-2 py-1 rounded text-xs ${
                  metric.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                  metric.priority === 'Medium' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {metric.priority}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-pink-200">{metric.value}</div>
                <div className={`text-xs font-mono flex items-center gap-1 ${
                  metric.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change > 0 ? '↗' : '↘'} {Math.abs(metric.change)}%
                </div>
              </div>
              <div className="text-xs font-mono text-pink-400/60 mt-1">{metric.trend}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-pink-300">
        <span>Executive Summary</span>
        <span>{dashboard.filter(d => d.priority === 'High').length} Critical Metrics</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RiskQuantifyDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live metrics state
  const [riskAssessments, setRiskAssessments] = useState(45000);
  const [financialLosses, setFinancialLosses] = useState(125000000);
  const [mitigationROI, setMitigationROI] = useState(285.7);
  const [complianceScore, setComplianceScore] = useState(94.2);

  useEffect(() => {
    // Live metrics simulation
    const assessmentsInterval = setInterval(() => {
      setRiskAssessments(prev => prev + Math.floor(Math.random() * 200) + 100);
    }, 2500);

    const lossesInterval = setInterval(() => {
      setFinancialLosses(prev => prev + Math.floor(Math.random() * 5000000) + 1000000);
    }, 3500);

    const roiInterval = setInterval(() => {
      setMitigationROI(prev => Math.max(150, Math.min(400, prev + (Math.random() - 0.5) * 10)));
    }, 4500);

    const complianceInterval = setInterval(() => {
      setComplianceScore(prev => Math.max(85, Math.min(98, prev + (Math.random() - 0.5) * 0.5)));
    }, 5500);

    return () => {
      clearInterval(assessmentsInterval);
      clearInterval(lossesInterval);
      clearInterval(roiInterval);
      clearInterval(complianceInterval);
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
      className="min-h-screen bg-[#0d0a04] text-white selection:bg-amber-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-yellow-900/10 to-orange-900/20" />

        {/* Animated floating elements */}
        <div className="floating-bg-1 absolute top-[10%] left-[5%] w-96 h-96 bg-amber-600/5 blur-[100px] rounded-full" />
        <div className="floating-bg-2 absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-yellow-600/5 blur-[120px] rounded-full" />
        <div className="floating-bg-3 absolute bottom-[20%] left-[50%] w-80 h-80 bg-orange-600/5 blur-[80px] rounded-full" />

        {/* Data stream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-pulse"
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjU5YTNlIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-30" />

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
            RiskQuantify v2.0
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">
                Cyber Risk Quantification
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              RISK <span className="text-amber-500">QUANTIFY</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Transform technical security vulnerabilities into financial risk metrics.
              Monte Carlo simulations, FAIR framework implementation, and executive-ready
              dashboards for data-driven cybersecurity investment decisions.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://riskquantify.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-amber-500/20"
              >
                Calculate Risk
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Framework: FAIR
              </div>
            </div>
          </div>

          {/* Hero Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <FinancialImpactCalculator />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Live Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-amber-500">
                {riskAssessments.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Risk Assessments
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                ${(financialLosses / 1000000).toFixed(0)}M+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Losses Prevented
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {mitigationROI.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Average ROI
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {complianceScore.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Compliance Score
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Financial Translation</h3>
              <p className="text-white/50 leading-relaxed">
                Convert vulnerability findings and threat scenarios into potential financial impact
                using industry benchmarks and historical data analysis.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Monte Carlo Analysis</h3>
              <p className="text-white/50 leading-relaxed">
                Advanced probabilistic modeling with thousands of simulations to understand
                risk distributions and confidence intervals for decision-making.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Executive Dashboards</h3>
              <p className="text-white/50 leading-relaxed">
                Board-ready visualizations showing risk trends, mitigation ROI, compliance scores,
                and benchmark comparisons with industry peers.
              </p>
            </div>
          </div>

          {/* Risk Quantification Engine Visualization */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
                Risk Quantification <span className="text-amber-500">Engine</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Advanced financial risk modeling platform combining FAIR methodology,
                Monte Carlo simulations, and real-time executive reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Engine Components */}
              <div className="space-y-8">
                <MonteCarloSimulator />
                <RiskHeatMap />
              </div>
              <div className="space-y-8">
                <ROI_Analyzer />
                <ExecutiveDashboard />
              </div>
            </div>

            {/* Capability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-amber-500/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">FAIR</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Framework</div>
                <div className="text-xs text-white/40">Industry standard</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Percent className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">95%</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Accuracy</div>
                <div className="text-xs text-white/40">Prediction precision</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Coins className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">$2.1B</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Saved</div>
                <div className="text-xs text-white/40">Client value delivered</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">Board</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Ready</div>
                <div className="text-xs text-white/40">Executive reporting</div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="glass rounded-[3rem] border border-white/5 p-12">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Risk Quantification Dashboard</h3>
                <p className="text-white/60">Real-time financial risk analysis and executive reporting</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-500">$47.2M</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Annual Loss Expectancy</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Confidence</span>
                      <span className="text-amber-400">95%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-500">312%</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Security ROI</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">3-year investment payback</div>
                    <div className="text-xs text-green-400">Exceeds industry average</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-500">Top 25%</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Industry Benchmark</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Risk management maturity</div>
                    <div className="text-xs text-blue-400">Above industry median</div>
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
          <a href="https://riskquantify.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-amber-500/20 flex items-center gap-4">
            Generate Report <Calculator className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RiskQuantifyDetail;

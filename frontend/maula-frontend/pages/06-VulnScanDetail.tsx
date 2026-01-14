import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Shield,
  Wifi,
  Server,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Target,
  Clock,
  Monitor,
  Network,
  Code,
  Search,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  X,
  Cpu,
  HardDrive,
  Database,
  FileCode,
} from 'lucide-react';

// ============================================================================
// VULNSCAN DETAIL PAGE - Enterprise Vulnerability Scanner
// ============================================================================

const VulnScanDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for scan simulation
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [portsScanned, setPortsScanned] = useState(100);
  const [openPorts, setOpenPorts] = useState(0);
  const [vulnsFound, setVulnsFound] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  
  // Configuration state
  const [scanType, setScanType] = useState<'single' | 'network' | 'webapp' | 'api'>('api');
  const [scanDepth, setScanDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [targetUrl, setTargetUrl] = useState('https://vulnscan.maula.ai/');
  const [cveDetection, setCveDetection] = useState(true);
  const [misconfigDetection, setMisconfigDetection] = useState(true);

  // Stats
  const [scansToday, setScansToday] = useState(1285);
  const [totalVulnsFound, setTotalVulnsFound] = useState(3853);

  // Open ports data
  const [openPortsList, setOpenPortsList] = useState<{port: number; service: string; version: string; cves: number}[]>([]);

  // Scan stages
  const scanStages = [
    { name: 'Initialize Scanner', description: 'Loading vulnerability database...' },
    { name: 'Host Discovery', description: 'Host is up' },
    { name: 'Port Scanning', description: 'Found 10 open ports' },
    { name: 'Service Detection', description: '10 services identified' },
    { name: 'OS Fingerprinting', description: 'Windows Server 2019' },
    { name: 'CVE Analysis', description: 'Checking CVE database...' },
    { name: 'Misconfig Check', description: 'Analyzing configurations...' },
    { name: 'Report Generation', description: 'Compiling results...' },
    { name: 'Complete', description: 'Scan finished' },
  ];

  // Sample ports data
  const samplePorts = [
    { port: 14, service: 'unknown', version: '', cves: 1 },
    { port: 16, service: 'unknown', version: '', cves: 1 },
    { port: 19, service: 'unknown', version: '', cves: 1 },
    { port: 20, service: 'unknown', version: '', cves: 1 },
    { port: 21, service: 'FTP', version: 'vsftpd 3.0.3', cves: 2 },
    { port: 22, service: 'SSH', version: 'OpenSSH 8.4', cves: 1 },
    { port: 25, service: 'SMTP', version: 'Postfix', cves: 1 },
    { port: 80, service: 'HTTP', version: 'nginx 1.18', cves: 0 },
    { port: 443, service: 'HTTPS', version: 'nginx 1.18', cves: 0 },
    { port: 3306, service: 'MySQL', version: '8.0.28', cves: 2 },
  ];

  // Animation effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('[data-float]', {
        y: -5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.2
      });

      gsap.to('[data-pulse]', {
        scale: 1.05,
        opacity: 0.9,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Scan simulation
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          return 0; // Reset for continuous demo
        }
        const newProgress = prev + Math.random() * 2 + 0.5;
        
        // Update stage based on progress
        const stage = Math.floor((newProgress / 100) * 9);
        setCurrentStage(Math.min(stage, 8));
        
        // Update open ports
        const ports = Math.floor((newProgress / 100) * 10);
        setOpenPorts(ports);
        
        // Update vulns found
        const vulns = Math.floor((newProgress / 100) * 9);
        setVulnsFound(vulns);
        
        // Update risk score
        const risk = Math.min(95, Math.floor((newProgress / 100) * 95));
        setRiskScore(risk);
        
        // Update ports list
        setOpenPortsList(samplePorts.slice(0, ports));
        
        return Math.min(newProgress, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isScanning]);

  // Randomly update stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setScansToday(prev => prev + 1);
        setTotalVulnsFound(prev => prev + Math.floor(Math.random() * 5));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => setView('home');

  const getRiskLevel = () => {
    if (riskScore >= 80) return { level: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' };
    if (riskScore >= 60) return { level: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' };
    if (riskScore >= 40) return { level: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' };
    return { level: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
  };

  const riskInfo = getRiskLevel();

  // Vulnerability breakdown calculation
  const vulnBreakdown = {
    critical: Math.max(1, Math.floor(vulnsFound * 0.3)),
    high: Math.floor(vulnsFound * 0.25),
    medium: Math.floor(vulnsFound * 0.25),
    low: Math.floor(vulnsFound * 0.2),
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#12100a] to-[#0a0a12] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(245,158,11,0.3) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }} />
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-4 border-b border-amber-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Left - Logo & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">VulnScan</h1>
                <p className="text-xs text-amber-400">Enterprise Vulnerability Scanner <span className="ml-2 px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-gray-400">v6.0</span></p>
              </div>
            </div>
          </div>

          {/* Center - Stats */}
          <div className="hidden lg:flex items-center gap-6">
            {[
              { label: 'Scans Today', value: scansToday.toLocaleString(), icon: Activity, color: 'text-emerald-400' },
              { label: 'Vulns Found', value: totalVulnsFound.toLocaleString(), icon: AlertTriangle, color: 'text-red-400' },
              { label: 'Avg Scan', value: '12.4s', icon: Clock, color: 'text-gray-400' },
              { label: 'Hosts', value: '848', icon: Server, color: 'text-gray-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase">{stat.label}</div>
                    <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Status */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-emerald-400">SIM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Scan Configuration */}
          <div data-float className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/30">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Scan Configuration</h2>
                <p className="text-xs text-gray-500">Configure your vulnerability scan</p>
              </div>
            </div>

            {/* Scan Type */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Scan Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'single', label: 'Single Host', desc: 'Scan one IP or hostname', icon: Monitor },
                  { id: 'network', label: 'Network Range', desc: 'Scan IP range or CIDR', icon: Network },
                  { id: 'webapp', label: 'Web Application', desc: 'Full web app assessment', icon: Globe },
                  { id: 'api', label: 'API Endpoint', desc: 'REST/GraphQL API scan', icon: Code },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = scanType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setScanType(type.id as any)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        isActive 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                          : 'bg-slate-800/30 border-slate-700/30 text-gray-400 hover:border-slate-600/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                      <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{type.label}</div>
                      <div className="text-[10px] text-gray-500">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Target</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="Enter target URL or IP"
                />
                <button className="px-4 py-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-colors">
                  Sample
                </button>
              </div>
            </div>

            {/* Scan Depth */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Scan Depth</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'quick', label: 'Quick', desc: 'Top 100 ports, fast scan' },
                  { id: 'standard', label: 'Standard', desc: 'Top 1000 ports, service detection' },
                  { id: 'deep', label: 'Deep', desc: 'All ports, aggressive scan' },
                ].map((depth) => {
                  const isActive = scanDepth === depth.id;
                  return (
                    <button
                      key={depth.id}
                      onClick={() => setScanDepth(depth.id as any)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        isActive 
                          ? 'bg-amber-500/20 border-amber-500/50' 
                          : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                      }`}
                    >
                      <div className={`text-sm font-bold ${isActive ? 'text-amber-400' : 'text-gray-300'}`}>{depth.label}</div>
                      <div className="text-[9px] text-gray-500 mt-1">{depth.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scan Options */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-400 mb-3 block">Scan Options</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCveDetection(!cveDetection)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    cveDetection 
                      ? 'bg-amber-500/20 border-amber-500/50' 
                      : 'bg-slate-800/30 border-slate-700/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    cveDetection ? 'bg-amber-500 border-amber-500' : 'border-gray-600'
                  }`}>
                    {cveDetection && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${cveDetection ? 'text-white' : 'text-gray-400'}`}>CVE Detection</span>
                </button>
                <button
                  onClick={() => setMisconfigDetection(!misconfigDetection)}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    misconfigDetection 
                      ? 'bg-amber-500/20 border-amber-500/50' 
                      : 'bg-slate-800/30 border-slate-700/30'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    misconfigDetection ? 'bg-amber-500 border-amber-500' : 'border-gray-600'
                  }`}>
                    {misconfigDetection && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${misconfigDetection ? 'text-white' : 'text-gray-400'}`}>Misconfiguration</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsScanning(!isScanning)}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isScanning
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isScanning ? 'Stop Scan' : 'Start Scan'}
              </button>
              <button
                onClick={() => {
                  setScanProgress(0);
                  setCurrentStage(0);
                  setOpenPorts(0);
                  setVulnsFound(0);
                  setRiskScore(0);
                  setOpenPortsList([]);
                }}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-400 hover:text-white hover:border-slate-600/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Panel - Live Scan */}
          <div data-float className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Live Scan</h2>
                  <p className="text-xs text-gray-500">Awaiting scan</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">{currentStage}</span>
                <span className="text-lg text-gray-500">/9</span>
                <div className="text-[10px] text-gray-500">stages complete</div>
              </div>
            </div>

            {/* Scan Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Ports', value: portsScanned, icon: Wifi, color: 'text-blue-400' },
                { label: 'Open', value: openPorts, icon: Server, color: 'text-emerald-400' },
                { label: 'Vulns', value: vulnsFound, icon: AlertTriangle, color: 'text-red-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-[10px] text-gray-500 uppercase">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Open Ports List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-300">Open Ports ({openPorts})</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {openPortsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Scanning ports...
                  </div>
                ) : (
                  openPortsList.map((port, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-mono w-10">{port.port}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          port.service === 'unknown' 
                            ? 'bg-slate-700/50 text-gray-400' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {port.service}
                        </span>
                        {port.version && (
                          <span className="text-xs text-gray-500">{port.version}</span>
                        )}
                      </div>
                      {port.cves > 0 && (
                        <span className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs font-bold text-red-400">
                          {port.cves} CVE
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Scan Stages */}
            <div>
              <div className="text-sm font-semibold text-gray-300 mb-3">Scan Stages</div>
              <div className="space-y-2">
                {scanStages.slice(0, 5).map((stage, i) => {
                  const isComplete = i < currentStage;
                  const isActive = i === currentStage;
                  return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : isComplete 
                          ? 'bg-slate-800/30 border-slate-700/30' 
                          : 'bg-slate-800/20 border-slate-700/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isComplete 
                            ? 'bg-emerald-500/20' 
                            : isActive 
                              ? 'bg-amber-500/20' 
                              : 'bg-slate-700/30'
                        }`}>
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isActive ? (
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-slate-600 rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isActive ? 'text-amber-400' : isComplete ? 'text-white' : 'text-gray-500'}`}>
                            {stage.name}
                          </div>
                          <div className="text-[10px] text-gray-500">{stage.description}</div>
                        </div>
                      </div>
                      {(isComplete || isActive) && (
                        <CheckCircle2 className={`w-5 h-5 ${isComplete ? 'text-emerald-400' : 'text-amber-400/50'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Risk Assessment */}
          <div data-float className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-red-500/30 p-6 shadow-2xl">
            {/* Critical Risk Icon */}
            <div className="flex flex-col items-center justify-center py-8 mb-6 border-b border-slate-700/30">
              <div data-pulse className={`w-24 h-24 ${riskInfo.bg} rounded-full flex items-center justify-center border-2 ${riskInfo.border} mb-4`}>
                <div className="relative">
                  <Shield className={`w-12 h-12 ${riskInfo.color}`} />
                  <X className={`w-6 h-6 ${riskInfo.color} absolute -top-1 -right-1`} />
                </div>
              </div>
              <h2 className={`text-2xl font-black ${riskInfo.color} mb-2`}>{riskInfo.level} RISK</h2>
              <p className="text-sm text-gray-400 text-center">
                {vulnsFound > 0 ? 'Immediate action required - critical vulnerabilities found' : 'Scanning for vulnerabilities...'}
              </p>
              <div className="mt-4 px-4 py-2 bg-slate-800/50 rounded-lg">
                <span className="text-xs text-gray-500 font-mono">{targetUrl}</span>
              </div>
            </div>

            {/* Risk Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-400">Risk Score</span>
                <div className="flex items-baseline">
                  <span className={`text-4xl font-black ${riskInfo.color}`}>{riskScore}</span>
                  <span className="text-lg text-gray-500">/100</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-500">Secure</span>
                <span className="text-[10px] text-gray-500">Critical</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Ports Scanned', value: portsScanned, color: 'text-white' },
                { label: 'Open Ports', value: openPorts, color: 'text-emerald-400' },
                { label: 'Services', value: openPorts, color: 'text-blue-400' },
                { label: 'Vulnerabilities', value: vulnsFound, color: 'text-red-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Vulnerability Breakdown */}
            <div>
              <div className="text-sm font-semibold text-gray-400 mb-4">Vulnerability Breakdown</div>
              <div className="flex gap-2">
                {[
                  { label: 'Critical', count: vulnBreakdown.critical, color: 'bg-red-500/20 text-red-400 border-red-500/40' },
                  { label: 'High', count: vulnBreakdown.high, color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
                  { label: 'Medium', count: vulnBreakdown.medium, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
                  { label: 'Low', count: vulnBreakdown.low, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
                ].map((item, i) => (
                  <div key={i} className={`flex-1 px-3 py-3 rounded-xl border ${item.color} text-center transition-all hover:scale-105`}>
                    <div className="text-xl font-black">{item.count}</div>
                    <div className="text-[10px] opacity-80">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="mt-6 pt-6 border-t border-slate-700/30">
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm font-semibold text-gray-300 hover:bg-slate-700/50 hover:border-slate-600/50 transition-all flex items-center justify-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Export JSON
                </button>
                <button className="py-3 px-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-sm font-semibold text-amber-400 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2">
                  <Database className="w-4 h-4" />
                  Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VulnScanDetail;

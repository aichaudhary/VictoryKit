import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Shield,
  Search,
  Server,
  Bug,
  Activity,
  Clock,
  Target,
  Wifi,
  Globe,
  AlertTriangle,
  RefreshCw,
  Radar,
  Cpu,
  Database,
  Lock,
  Zap,
  Radio,
  Crosshair,
  ArrowLeft,
} from "lucide-react";
import VulnScanForm, { ScanFormData } from "./VulnScanForm";
import LiveScanPanel, {
  ScanStep,
  ScanEvent,
  DiscoveredPort,
} from "./LiveScanPanel";
import AnimatedVulnResult, {
  ScanResult,
  RiskLevel,
  Vulnerability,
} from "./AnimatedVulnResult";
import { scanApi, dashboardApi, Scan } from "../services/vulnscan.api";

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 EPIC ANIMATED VISUAL COMPONENTS - Neil Armstrong at Moon 🌕 Level
// ═══════════════════════════════════════════════════════════════════════════════

// 🔮 Vulnerability Particle System - Floating security threats
const VulnParticleSystem: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      type: ['bug', 'shield', 'warning', 'lock'][Math.floor(Math.random() * 4)],
      color: ['purple', 'cyan', 'red', 'green'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute opacity-20 animate-pulse`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatParticle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.type === 'bug' && <Bug className={`w-full h-full text-${p.color}-500/30`} />}
          {p.type === 'shield' && <Shield className={`w-full h-full text-${p.color}-500/30`} />}
          {p.type === 'warning' && <AlertTriangle className={`w-full h-full text-${p.color}-500/30`} />}
          {p.type === 'lock' && <Lock className={`w-full h-full text-${p.color}-500/30`} />}
        </div>
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
          25% { transform: translate(30px, -30px) rotate(90deg); opacity: 0.3; }
          50% { transform: translate(-20px, -50px) rotate(180deg); opacity: 0.2; }
          75% { transform: translate(40px, -20px) rotate(270deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// 📡 Radar Sweep Scanner - Rotating vulnerability detection
const RadarSweepScanner: React.FC<{ isActive?: boolean }> = ({ isActive = false }) => {
  return (
    <div className="absolute top-20 right-10 w-64 h-64 opacity-30">
      <div className="absolute inset-0 rounded-full border border-purple-500/20">
        {/* Concentric circles */}
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-purple-500/10"
            style={{
              inset: `${ring * 15}%`,
            }}
          />
        ))}
        
        {/* Cross lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
        </div>
        
        {/* Rotating sweep */}
        <div
          className={`absolute inset-0 ${isActive ? 'animate-spin' : ''}`}
          style={{ animationDuration: '4s' }}
        >
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-1"
            style={{
              background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8), transparent)',
              transformOrigin: 'left center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
            }}
          />
        </div>
        
        {/* Detected blips */}
        {isActive && [1, 2, 3].map((blip) => (
          <div
            key={blip}
            className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"
            style={{
              top: `${20 + blip * 20}%`,
              left: `${30 + blip * 15}%`,
              animationDelay: `${blip * 0.5}s`,
            }}
          />
        ))}
        
        {/* Center ping */}
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
        </div>
      </div>
    </div>
  );
};

// 🔲 Cyber Grid Matrix - Network topology background
const CyberGridMatrix: React.FC = () => {
  const gridLines = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      isVertical: i % 2 === 0,
      position: (i * 5) + Math.random() * 2,
      opacity: 0.03 + Math.random() * 0.05,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <pattern id="vulnGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(168, 85, 247, 0.05)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="gridFade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.1)" />
            <stop offset="50%" stopColor="rgba(6, 182, 212, 0.05)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vulnGrid)" />
        
        {/* Animated scan lines */}
        {gridLines.map((line) => (
          <line
            key={line.id}
            x1={line.isVertical ? `${line.position}%` : '0%'}
            y1={line.isVertical ? '0%' : `${line.position}%`}
            x2={line.isVertical ? `${line.position}%` : '100%'}
            y2={line.isVertical ? '100%' : `${line.position}%`}
            stroke="url(#gridFade)"
            strokeWidth="1"
            style={{
              opacity: line.opacity,
              animation: `gridPulse 3s ease-in-out infinite`,
              animationDelay: `${line.delay}s`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.08; }
        }
      `}</style>
    </div>
  );
};

// 🛡️ Pulsing Shield Orb - Central protection indicator
const ShieldOrbPulse: React.FC<{ riskLevel?: string }> = ({ riskLevel }) => {
  const color = useMemo(() => {
    switch (riskLevel) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'purple';
    }
  }, [riskLevel]);

  return (
    <div className="absolute bottom-20 left-10">
      <div className="relative w-32 h-32">
        {/* Outer pulse rings */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className={`absolute inset-0 rounded-full border-2 border-${color}-500/20 animate-ping`}
            style={{
              animationDuration: `${2 + ring * 0.5}s`,
              animationDelay: `${ring * 0.3}s`,
            }}
          />
        ))}
        
        {/* Core orb */}
        <div className={`absolute inset-4 rounded-full bg-gradient-to-br from-${color}-500/20 to-${color}-600/10 backdrop-blur-sm flex items-center justify-center`}>
          <Shield className={`w-12 h-12 text-${color}-400 animate-pulse`} />
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
          <div className={`absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 bg-${color}-400 rounded-full shadow-lg shadow-${color}-400/50`} />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
          <div className={`absolute bottom-0 left-1/2 w-2 h-2 -translate-x-1/2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50`} />
        </div>
      </div>
    </div>
  );
};

// 📊 Port Scan Visualization - Active scanning display
const PortScanVisualization: React.FC<{ portsScanned: number; isScanning: boolean }> = ({ portsScanned, isScanning }) => {
  const portBlocks = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: i % 10,
      y: Math.floor(i / 10),
      isCommon: [21, 22, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017].includes(i + 1),
    }));
  }, []);

  if (!isScanning) return null;

  return (
    <div className="absolute bottom-20 right-10 opacity-40">
      <div className="grid grid-cols-10 gap-1">
        {portBlocks.map((port) => (
          <div
            key={port.id}
            className={`w-2 h-2 rounded-sm transition-all duration-300 ${
              port.id < portsScanned
                ? port.isCommon
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-purple-500/50'
                : 'bg-slate-700/50'
            }`}
            style={{
              animationDelay: `${port.id * 10}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 🌊 Scanning Wave Effect - Visual ripple during scan
const ScanningWaveEffect: React.FC<{ isScanning: boolean }> = ({ isScanning }) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0">
      {[1, 2, 3].map((wave) => (
        <div
          key={wave}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-purple-500/20"
          style={{
            width: `${wave * 400}px`,
            height: `${wave * 400}px`,
            animation: `waveExpand 3s ease-out infinite`,
            animationDelay: `${wave * 0.8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveExpand {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 🔢 Binary Rain Effect - Matrix-style falling code
const BinaryRainEffect: React.FC = () => {
  const columns = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: i * 3.5,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      chars: Array.from({ length: 20 }, () => 
        Math.random() > 0.5 ? '1' : '0'
      ).join('\n'),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute text-purple-500 text-xs font-mono whitespace-pre leading-4"
          style={{
            left: `${col.x}%`,
            top: '-100px',
            animation: `binaryFall ${col.duration}s linear infinite`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars}
        </div>
      ))}
      <style>{`
        @keyframes binaryFall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

// 🎯 CVE Target Reticle - Vulnerability targeting animation
const CVETargetReticle: React.FC<{ vulnsFound: number }> = ({ vulnsFound }) => {
  if (vulnsFound === 0) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
      <div className="relative w-48 h-48">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-red-500 animate-spin"
          style={{ animationDuration: '10s' }}
        >
          <div className="absolute top-0 left-1/2 w-1 h-4 -translate-x-1/2 -translate-y-1/2 bg-red-500" />
        </div>
        
        {/* Inner targeting circles */}
        <div className="absolute inset-8 rounded-full border border-red-500/50 animate-pulse" />
        <div className="absolute inset-16 rounded-full border border-red-500/30" />
        
        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-0.5 bg-gradient-to-b from-transparent via-red-500/50 to-transparent" />
        </div>
        
        {/* Center indicator */}
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2">
          <Crosshair className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        
        {/* Vuln counter */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500/20 px-3 py-1 rounded-full">
          <span className="text-red-400 text-sm font-bold">{vulnsFound} CVE</span>
        </div>
      </div>
    </div>
  );
};

// 🔌 Network Node Mesh - Connected nodes visualization
const NetworkNodeMesh: React.FC = () => {
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 4 + Math.random() * 8,
      pulse: Math.random() * 2,
    }));
  }, []);

  const connections = useMemo(() => {
    const conns: { from: number; to: number }[] = [];
    nodes.forEach((_, i) => {
      const target = (i + 1 + Math.floor(Math.random() * 3)) % nodes.length;
      conns.push({ from: i, to: target });
    });
    return conns;
  }, [nodes]);

  return (
    <div className="absolute inset-0 opacity-20">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="nodeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.5)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
        </defs>
        
        {/* Connection lines */}
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={`${nodes[conn.from].x}%`}
            y1={`${nodes[conn.from].y}%`}
            x2={`${nodes[conn.to].x}%`}
            y2={`${nodes[conn.to].y}%`}
            stroke="url(#nodeGlow)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="rgba(168, 85, 247, 0.3)"
              className="animate-pulse"
              style={{ animationDelay: `${node.pulse}s` }}
            />
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size / 2}
              fill="rgba(168, 85, 247, 0.8)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

// Environment check - use real API if available
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';
const POLL_INTERVAL = 2000; // 2 seconds

// Simulated vulnerability database
const VULN_DATABASE: Vulnerability[] = [
  {
    id: "CVE-2021-44228",
    severity: "critical",
    title: "Log4j Remote Code Execution",
    description:
      "Apache Log4j2 JNDI features allow remote code execution via crafted log messages.",
    cve: "CVE-2021-44228",
    cvss: 10.0,
    service: "Java",
    remediation: "Update Log4j to version 2.17.1 or later",
  },
  {
    id: "CVE-2023-22515",
    severity: "critical",
    title: "Confluence Authentication Bypass",
    description:
      "Broken access control vulnerability allowing unauthorized admin account creation.",
    cve: "CVE-2023-22515",
    cvss: 9.8,
    service: "Confluence",
    remediation:
      "Update Confluence to patched version or restrict network access",
  },
  {
    id: "CVE-2021-34473",
    severity: "high",
    title: "Microsoft Exchange ProxyShell",
    description: "Pre-authentication path confusion leads to ACL bypass.",
    cve: "CVE-2021-34473",
    cvss: 9.1,
    service: "Exchange",
    remediation: "Apply Microsoft security updates",
  },
  {
    id: "SSL-WEAK",
    severity: "medium",
    title: "Weak SSL/TLS Configuration",
    description:
      "Server supports deprecated TLS versions or weak cipher suites.",
    remediation: "Disable TLS 1.0/1.1 and weak ciphers, enable TLS 1.3",
  },
  {
    id: "HEADER-MISSING",
    severity: "low",
    title: "Missing Security Headers",
    description:
      "Security headers like X-Frame-Options, CSP, or HSTS are not configured.",
    remediation: "Configure proper security headers on web server",
  },
];

const COMMON_PORTS: Record<number, { service: string; version?: string }> = {
  21: { service: "FTP", version: "vsftpd 3.0.3" },
  22: { service: "SSH", version: "OpenSSH 8.4" },
  25: { service: "SMTP", version: "Postfix" },
  53: { service: "DNS", version: "BIND 9.16" },
  80: { service: "HTTP", version: "nginx 1.21" },
  110: { service: "POP3" },
  143: { service: "IMAP" },
  443: { service: "HTTPS", version: "nginx 1.21" },
  445: { service: "SMB", version: "Samba 4.14" },
  993: { service: "IMAPS" },
  995: { service: "POP3S" },
  1433: { service: "MSSQL", version: "2019" },
  3306: { service: "MySQL", version: "8.0.28" },
  3389: { service: "RDP" },
  5432: { service: "PostgreSQL", version: "14.2" },
  5900: { service: "VNC" },
  6379: { service: "Redis", version: "6.2.6" },
  8080: { service: "HTTP-Proxy", version: "Apache Tomcat 9.0" },
  8443: { service: "HTTPS-Alt", version: "Jetty 11.0" },
  27017: { service: "MongoDB", version: "5.0.6" },
};

const VulnScanTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [steps, setSteps] = useState<ScanStep[]>([]);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [portsScanned, setPortsScanned] = useState(0);
  const [portsOpen, setPortsOpen] = useState(0);
  const [vulnsFound, setVulnsFound] = useState(0);
  const [discoveredPorts, setDiscoveredPorts] = useState<DiscoveredPort[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | undefined>();
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({
    scansToday: 0,
    vulnsDetected: 0,
    avgScanTime: 0,
    hostsScanned: 0,
  });

  const abortRef = useRef(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial stats from API
  useEffect(() => {
    const loadStats = async () => {
      if (!USE_REAL_API) {
        // Fallback to mock stats
        setStats({
          scansToday: 1284,
          vulnsDetected: 3847,
          avgScanTime: 12.4,
          hostsScanned: 847,
        });
        return;
      }

      try {
        const dashboardData = await dashboardApi.getDashboardData();
        setStats({
          scansToday: dashboardData.scanStats?.totalScans || 0,
          vulnsDetected: dashboardData.scanStats?.totalVulnerabilities || 0,
          avgScanTime: dashboardData.scanStats?.averageDuration || 0,
          hostsScanned: dashboardData.assetStats?.total || 0,
        });
        setIsOnline(true);
        setApiError(null);
      } catch (error) {
        console.warn('Could not load dashboard stats, using simulation mode:', error);
        setIsOnline(false);
        // Fallback to mock stats
        setStats({
          scansToday: 1284,
          vulnsDetected: 3847,
          avgScanTime: 12.4,
          hostsScanned: 847,
        });
      }
    };

    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const addEvent = useCallback((event: Omit<ScanEvent, "timestamp">) => {
    setEvents((prev) =>
      [{ ...event, timestamp: Date.now() }, ...prev].slice(0, 50)
    );
  }, []);

  const updateStep = useCallback((id: string, updates: Partial<ScanStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const parsePortRange = (range: string): number[] => {
    const ports: number[] = [];
    const parts = range.split(",");
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= Math.min(end, start + 100); i++) {
          ports.push(i);
        }
      } else {
        ports.push(Number(part));
      }
    }
    return ports.slice(0, 100); // Limit for demo
  };

  const runScan = async (data: ScanFormData): Promise<ScanResult> => {
    const startTime = Date.now();
    const foundVulns: Vulnerability[] = [];
    const openPorts: DiscoveredPort[] = [];

    // Initialize steps
    const scanSteps: ScanStep[] = [
      { id: "init", label: "Initialize Scanner", status: "pending" },
      { id: "discovery", label: "Host Discovery", status: "pending" },
      { id: "ports", label: "Port Scanning", status: "pending" },
      { id: "services", label: "Service Detection", status: "pending" },
      { id: "os", label: "OS Fingerprinting", status: "pending" },
      { id: "vulns", label: "Vulnerability Detection", status: "pending" },
      { id: "ssl", label: "SSL/TLS Analysis", status: "pending" },
      { id: "cve", label: "CVE Matching", status: "pending" },
      { id: "report", label: "Generate Report", status: "pending" },
    ];
    setSteps(scanSteps);

    // Step 1: Initialize
    updateStep("init", {
      status: "running",
      detail: "Loading vulnerability database...",
    });
    setProgress(5);
    await delay(500);
    addEvent({
      type: "info",
      severity: "info",
      message: "VulnScan engine initialized",
    });
    addEvent({
      type: "info",
      severity: "info",
      message: `Loaded ${VULN_DATABASE.length} vulnerability signatures`,
    });
    updateStep("init", { status: "complete" });
    setProgress(10);

    if (abortRef.current) return null as any;

    // Step 2: Host Discovery
    updateStep("discovery", {
      status: "running",
      detail: "Checking host availability...",
    });
    setCurrentTarget(data.target);
    await delay(600);
    addEvent({
      type: "discovery",
      severity: "info",
      message: `Target ${data.target} is reachable`,
    });
    updateStep("discovery", { status: "complete", detail: "Host is up" });
    setProgress(20);

    if (abortRef.current) return null as any;

    // Step 3: Port Scanning
    updateStep("ports", { status: "running", detail: "Scanning ports..." });
    const ports = parsePortRange(data.portRange);
    const totalPorts = ports.length;

    for (let i = 0; i < totalPorts; i++) {
      if (abortRef.current) return null as any;
      const port = ports[i];
      setPortsScanned(i + 1);
      setProgress(20 + Math.floor((i / totalPorts) * 25));

      // Simulate random open ports
      if (COMMON_PORTS[port] || Math.random() < 0.05) {
        const portInfo = COMMON_PORTS[port] || { service: "unknown" };
        const discoveredPort: DiscoveredPort = {
          port,
          state: "open",
          service: portInfo.service,
          version: portInfo.version,
        };
        openPorts.push(discoveredPort);
        setDiscoveredPorts((prev) => [...prev, discoveredPort]);
        setPortsOpen((p) => p + 1);
        addEvent({
          type: "discovery",
          severity: "info",
          message: `Port ${port} open - ${portInfo.service}`,
          port,
          service: portInfo.service,
        });
      }

      if (i % 10 === 0) {
        await delay(50);
      }
    }

    updateStep("ports", {
      status: "complete",
      detail: `Found ${openPorts.length} open ports`,
    });
    setProgress(45);

    if (abortRef.current) return null as any;

    // Step 4: Service Detection
    updateStep("services", {
      status: "running",
      detail: "Identifying services...",
    });
    await delay(800);
    for (const port of openPorts) {
      addEvent({
        type: "info",
        severity: "info",
        message: `Detected ${port.service}${
          port.version ? ` ${port.version}` : ""
        } on port ${port.port}`,
        port: port.port,
        service: port.service,
      });
    }
    updateStep("services", {
      status: "complete",
      detail: `${openPorts.length} services identified`,
    });
    setProgress(55);

    if (abortRef.current) return null as any;

    // Step 5: OS Detection
    updateStep("os", { status: "running", detail: "Fingerprinting OS..." });
    await delay(600);
    const detectedOS =
      Math.random() > 0.5 ? "Linux 5.x (Ubuntu)" : "Windows Server 2019";
    addEvent({
      type: "info",
      severity: "info",
      message: `OS detected: ${detectedOS}`,
    });
    updateStep("os", { status: "complete", detail: detectedOS });
    setProgress(65);

    if (abortRef.current) return null as any;

    // Step 6: Vulnerability Detection
    updateStep("vulns", {
      status: "running",
      detail: "Scanning for vulnerabilities...",
    });
    await delay(1000);

    // Randomly assign vulnerabilities to open ports
    for (const port of openPorts) {
      if (abortRef.current) return null as any;

      // Check for service-specific vulnerabilities
      for (const vuln of VULN_DATABASE) {
        if (Math.random() < 0.15) {
          // 15% chance per vuln
          const assignedVuln = {
            ...vuln,
            port: port.port,
            service: port.service,
          };
          foundVulns.push(assignedVuln);
          setVulnsFound((p) => p + 1);

          // Update port with vuln count
          setDiscoveredPorts((prev) =>
            prev.map((p) =>
              p.port === port.port ? { ...p, vulns: (p.vulns || 0) + 1 } : p
            )
          );

          addEvent({
            type: "vuln",
            severity: vuln.severity,
            message: `${vuln.title}`,
            port: port.port,
            service: port.service,
          });
        }
      }
      await delay(100);
    }

    updateStep("vulns", {
      status: foundVulns.length > 0 ? "warning" : "complete",
      detail: `Found ${foundVulns.length} vulnerabilities`,
    });
    setProgress(80);

    if (abortRef.current) return null as any;

    // Step 7: SSL Analysis
    updateStep("ssl", { status: "running", detail: "Analyzing SSL/TLS..." });
    await delay(500);
    const hasHttps = openPorts.some((p) => p.port === 443 || p.port === 8443);
    let sslGrade = undefined;
    if (hasHttps) {
      sslGrade = Math.random() > 0.7 ? "A" : Math.random() > 0.4 ? "B" : "C";
      addEvent({
        type: "info",
        severity: sslGrade === "A" ? "info" : "medium",
        message: `SSL/TLS Grade: ${sslGrade}`,
      });
    }
    updateStep("ssl", {
      status: "complete",
      detail: hasHttps ? `Grade: ${sslGrade}` : "No SSL detected",
    });
    setProgress(90);

    if (abortRef.current) return null as any;

    // Step 8: CVE Matching
    updateStep("cve", {
      status: "running",
      detail: "Matching CVE database...",
    });
    await delay(700);
    const cveCount = foundVulns.filter((v) => v.cve).length;
    addEvent({
      type: "info",
      severity: "info",
      message: `Matched ${cveCount} CVEs from NVD`,
    });
    updateStep("cve", {
      status: "complete",
      detail: `${cveCount} CVEs matched`,
    });
    setProgress(95);

    if (abortRef.current) return null as any;

    // Step 9: Generate Report
    updateStep("report", { status: "running", detail: "Generating report..." });
    await delay(500);
    updateStep("report", { status: "complete" });
    setProgress(100);

    // Calculate risk level
    const criticalCount = foundVulns.filter(
      (v) => v.severity === "critical"
    ).length;
    const highCount = foundVulns.filter((v) => v.severity === "high").length;
    const mediumCount = foundVulns.filter(
      (v) => v.severity === "medium"
    ).length;

    let riskLevel: RiskLevel;
    let riskScore: number;

    if (criticalCount > 0) {
      riskLevel = "CRITICAL";
      riskScore = Math.min(100, 80 + criticalCount * 5);
    } else if (highCount >= 2) {
      riskLevel = "HIGH";
      riskScore = Math.min(79, 60 + highCount * 5);
    } else if (highCount >= 1 || mediumCount >= 3) {
      riskLevel = "MEDIUM";
      riskScore = Math.min(59, 40 + mediumCount * 5);
    } else if (foundVulns.length > 0) {
      riskLevel = "LOW";
      riskScore = Math.min(39, 20 + foundVulns.length * 3);
    } else {
      riskLevel = "SECURE";
      riskScore = Math.max(5, openPorts.length);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalCount > 0) {
      recommendations.push("Immediately patch critical vulnerabilities");
    }
    if (highCount > 0) {
      recommendations.push(
        "Schedule patching for high-severity issues within 7 days"
      );
    }
    if (sslGrade && sslGrade !== "A") {
      recommendations.push("Upgrade SSL/TLS configuration for better security");
    }
    if (openPorts.length > 5) {
      recommendations.push("Review open ports and close unnecessary services");
    }
    recommendations.push("Implement regular vulnerability scanning schedule");
    recommendations.push("Enable intrusion detection/prevention systems");

    const scanDuration = Date.now() - startTime;

    return {
      riskLevel,
      riskScore,
      target: data.target,
      scanType: data.scanType,
      summary:
        riskLevel === "CRITICAL"
          ? `Critical security issues detected on ${data.target}. ${criticalCount} critical and ${highCount} high severity vulnerabilities require immediate attention.`
          : riskLevel === "HIGH"
          ? `Significant vulnerabilities found on ${data.target}. ${foundVulns.length} total issues discovered across ${openPorts.length} open ports.`
          : riskLevel === "MEDIUM"
          ? `Moderate security concerns on ${data.target}. ${foundVulns.length} vulnerabilities identified that should be addressed.`
          : riskLevel === "LOW"
          ? `Minor issues found on ${data.target}. Overall security posture is acceptable with ${foundVulns.length} low-risk findings.`
          : `No significant vulnerabilities detected on ${data.target}. ${openPorts.length} open ports found with good security configuration.`,
      portsScanned: totalPorts,
      portsOpen: openPorts.length,
      servicesDetected: openPorts.length,
      vulnerabilities: foundVulns,
      osDetected: detectedOS,
      sslGrade,
      headerScore: Math.floor(Math.random() * 40) + 60,
      recommendations,
      scanDuration,
    };
  };

  // Real API scan handler
  const runRealScan = async (data: ScanFormData): Promise<ScanResult | null> => {
    const startTime = Date.now();
    setApiError(null);

    // Initialize steps
    const scanSteps: ScanStep[] = [
      { id: "init", label: "Initialize Scanner", status: "running" },
      { id: "discovery", label: "Host Discovery", status: "pending" },
      { id: "ports", label: "Port Scanning", status: "pending" },
      { id: "services", label: "Service Detection", status: "pending" },
      { id: "os", label: "OS Fingerprinting", status: "pending" },
      { id: "vulns", label: "Vulnerability Detection", status: "pending" },
      { id: "ssl", label: "SSL/TLS Analysis", status: "pending" },
      { id: "cve", label: "CVE Matching", status: "pending" },
      { id: "report", label: "Generate Report", status: "pending" },
    ];
    setSteps(scanSteps);
    setProgress(5);

    try {
      // Create scan via API
      addEvent({
        type: "info",
        severity: "info",
        message: "Creating scan job on server...",
      });

      const scan = await scanApi.createScan({
        targetType: data.scanType === 'web' ? 'web_application' : 
                    data.scanType === 'network' ? 'network' : 'host',
        targetIdentifier: data.target,
        scanType: data.scanType === 'quick' ? 'quick' : 
                  data.scanType === 'full' ? 'full' : 
                  data.scanType === 'stealth' ? 'unauthenticated' : 'quick',
        scanConfig: {
          ports: { range: data.portRange },
          depth: data.scanType,
          options: data.options
        }
      });

      updateStep("init", { status: "complete" });
      setProgress(10);

      addEvent({
        type: "info",
        severity: "info",
        message: `Scan ${scan.scanId} created successfully`,
      });

      // Poll for scan progress
      return await pollScanProgress(scan._id, scanSteps, startTime);

    } catch (error: any) {
      console.error('Scan failed:', error);
      setApiError(error.message || 'Scan failed');
      addEvent({
        type: "warning",
        severity: "high",
        message: `Scan error: ${error.message}`,
      });
      
      // Mark all pending steps as failed
      setSteps(prev => prev.map(s => 
        s.status === 'pending' || s.status === 'running' 
          ? { ...s, status: 'error' as const } 
          : s
      ));
      
      return null;
    }
  };

  // Poll scan progress from API
  const pollScanProgress = async (scanId: string, steps: ScanStep[], startTime: number): Promise<ScanResult | null> => {
    return new Promise((resolve) => {
      const poll = async () => {
        if (abortRef.current) {
          resolve(null);
          return;
        }

        try {
          const scan = await scanApi.getScanById(scanId);
          
          // Update progress based on scan status
          const progressData = scan.progress || { percentage: 0, currentPhase: '', message: '' };
          setProgress(progressData.percentage || 0);
          
          // Update steps based on current phase
          updateStepsFromPhase(progressData.currentPhase);

          // Add events from scan
          if (progressData.message) {
            addEvent({
              type: "info",
              severity: "info",
              message: progressData.message,
            });
          }

          // Update discovered ports
          if (scan.results?.services) {
            const ports: DiscoveredPort[] = scan.results.services.map((svc: any) => ({
              port: svc.port,
              state: 'open',
              service: svc.service,
              version: svc.version
            }));
            setDiscoveredPorts(ports);
            setPortsOpen(ports.length);
          }

          if (scan.results?.openPorts) {
            setPortsScanned(scan.results.openPorts.length);
          }

          // Check if scan is complete
          if (scan.status === 'completed' || scan.status === 'failed') {
            if (pollRef.current) {
              clearTimeout(pollRef.current);
              pollRef.current = null;
            }

            if (scan.status === 'completed') {
              const result = convertScanToResult(scan, startTime);
              resolve(result);
            } else {
              setApiError('Scan failed on server');
              resolve(null);
            }
            return;
          }

          // Continue polling
          pollRef.current = setTimeout(poll, POLL_INTERVAL);
        } catch (error: any) {
          console.error('Poll error:', error);
          setApiError(error.message);
          resolve(null);
        }
      };

      poll();
    });
  };

  // Update step status based on phase
  const updateStepsFromPhase = (phase: string) => {
    const phaseMap: Record<string, string[]> = {
      'initializing': ['init'],
      'host_discovery': ['init', 'discovery'],
      'port_scanning': ['init', 'discovery', 'ports'],
      'service_detection': ['init', 'discovery', 'ports', 'services'],
      'os_detection': ['init', 'discovery', 'ports', 'services', 'os'],
      'vulnerability_scanning': ['init', 'discovery', 'ports', 'services', 'os', 'vulns'],
      'ssl_analysis': ['init', 'discovery', 'ports', 'services', 'os', 'vulns', 'ssl'],
      'cve_matching': ['init', 'discovery', 'ports', 'services', 'os', 'vulns', 'ssl', 'cve'],
      'generating_report': ['init', 'discovery', 'ports', 'services', 'os', 'vulns', 'ssl', 'cve', 'report'],
    };

    const completedSteps = phaseMap[phase] || [];
    
    setSteps(prev => prev.map(s => {
      if (completedSteps.includes(s.id)) {
        if (s.id === completedSteps[completedSteps.length - 1]) {
          return { ...s, status: 'running' };
        }
        return { ...s, status: 'complete' };
      }
      return s;
    }));
  };

  // Convert API scan result to frontend format
  const convertScanToResult = (scan: Scan, startTime: number): ScanResult => {
    const summary = scan.results?.summary || { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
    
    // Calculate risk level
    let riskLevel: RiskLevel;
    let riskScore: number;

    if (summary.critical > 0) {
      riskLevel = "CRITICAL";
      riskScore = Math.min(100, 80 + summary.critical * 5);
    } else if (summary.high >= 2) {
      riskLevel = "HIGH";
      riskScore = Math.min(79, 60 + summary.high * 5);
    } else if (summary.high >= 1 || summary.medium >= 3) {
      riskLevel = "MEDIUM";
      riskScore = Math.min(59, 40 + summary.medium * 5);
    } else if (summary.total > 0) {
      riskLevel = "LOW";
      riskScore = Math.min(39, 20 + summary.total * 3);
    } else {
      riskLevel = "SECURE";
      riskScore = Math.max(5, scan.results?.openPorts?.length || 0);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (summary.critical > 0) {
      recommendations.push("Immediately patch critical vulnerabilities");
    }
    if (summary.high > 0) {
      recommendations.push("Schedule patching for high-severity issues within 7 days");
    }
    if ((scan.results?.openPorts?.length || 0) > 5) {
      recommendations.push("Review open ports and close unnecessary services");
    }
    recommendations.push("Implement regular vulnerability scanning schedule");
    recommendations.push("Enable intrusion detection/prevention systems");

    // Mark all steps complete
    setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
    setProgress(100);

    return {
      riskLevel,
      riskScore,
      target: scan.targetIdentifier,
      scanType: scan.scanType,
      summary: generateSummaryText(riskLevel, summary, scan.targetIdentifier, scan.results?.openPorts?.length || 0),
      portsScanned: scan.results?.openPorts?.length || 0,
      portsOpen: scan.results?.openPorts?.length || 0,
      servicesDetected: scan.results?.services?.length || 0,
      vulnerabilities: [], // Will be loaded separately if needed
      osDetected: scan.results?.osDetection?.name || 'Unknown',
      sslGrade: undefined, // From SSL analysis
      headerScore: 75,
      recommendations,
      scanDuration: Date.now() - startTime,
    };
  };

  const generateSummaryText = (riskLevel: RiskLevel, summary: any, target: string, portsOpen: number): string => {
    switch (riskLevel) {
      case 'CRITICAL':
        return `Critical security issues detected on ${target}. ${summary.critical} critical and ${summary.high} high severity vulnerabilities require immediate attention.`;
      case 'HIGH':
        return `Significant vulnerabilities found on ${target}. ${summary.total} total issues discovered across ${portsOpen} open ports.`;
      case 'MEDIUM':
        return `Moderate security concerns on ${target}. ${summary.total} vulnerabilities identified that should be addressed.`;
      case 'LOW':
        return `Minor issues found on ${target}. Overall security posture is acceptable with ${summary.total} low-risk findings.`;
      default:
        return `No significant vulnerabilities detected on ${target}. ${portsOpen} open ports found with good security configuration.`;
    }
  };

  const handleScan = async (data: ScanFormData) => {
    setIsScanning(true);
    setResult(null);
    setEvents([]);
    setPortsScanned(0);
    setPortsOpen(0);
    setVulnsFound(0);
    setDiscoveredPorts([]);
    setProgress(0);
    setCurrentTarget(data.target);
    setApiError(null);
    abortRef.current = false;

    try {
      let scanResult: ScanResult | null;

      if (USE_REAL_API && isOnline) {
        // Use real API
        scanResult = await runRealScan(data);
      } else {
        // Fallback to simulation
        scanResult = await runScan(data);
      }

      if (!abortRef.current && scanResult) {
        setResult(scanResult);
        setStats((prev) => ({
          ...prev,
          scansToday: prev.scansToday + 1,
          vulnsDetected: prev.vulnsDetected + scanResult.vulnerabilities.length,
          hostsScanned: prev.hostsScanned + 1,
        }));
      }
    } catch (error: any) {
      console.error("Scan failed:", error);
      setApiError(error.message);
      addEvent({
        type: "warning",
        severity: "high",
        message: "Scan failed. Please try again.",
      });
    } finally {
      setIsScanning(false);
      setCurrentTarget(undefined);
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    setIsScanning(false);
    setCurrentTarget(undefined);
    addEvent({
      type: "info",
      severity: "info",
      message: "Scan cancelled by user",
    });
  };

  const handleNewScan = () => {
    setResult(null);
    setEvents([]);
    setSteps([]);
    setPortsScanned(0);
    setPortsOpen(0);
    setVulnsFound(0);
    setDiscoveredPorts([]);
    setProgress(0);
  };

  const handleExport = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vulnscan-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* ═══════════════════════════════════════════════════════════════════════════
          🚀 EPIC ANIMATED BACKGROUND EFFECTS - Neil Armstrong Moon Level 🌕
          All background effects are in a FIXED container that's BEHIND everything
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: -1, pointerEvents: 'none' }}>
        <VulnParticleSystem />
        <CyberGridMatrix />
        <NetworkNodeMesh />
        <BinaryRainEffect />
        <RadarSweepScanner isActive={isScanning} />
        <ScanningWaveEffect isScanning={isScanning} />
        <PortScanVisualization portsScanned={portsScanned} isScanning={isScanning} />
        <CVETargetReticle vulnsFound={vulnsFound} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          🎯 EPIC HEADER WITH ANIMATED ELEMENTS
          ═══════════════════════════════════════════════════════════════════════════ */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0" style={{ zIndex: 50, position: 'relative' }}>
        {/* Header glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5" />
        
        <div className="max-w-[1800px] mx-auto px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Animated Logo */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 transform transition-transform group-hover:scale-105">
                  <Radar className="w-7 h-7 text-white animate-pulse" />
                  <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping opacity-20" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse shadow-lg shadow-green-500/50" />
                {isScanning && (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
                  VulnScan
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400">Enterprise Vulnerability Scanner</p>
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full border border-purple-500/30 text-purple-300">
                    v6.0
                  </span>
                </div>
              </div>
            </div>

            {/* Live Stats with Animations */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Scans Today */}
              <div className="group relative flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all backdrop-blur-sm">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-1.5 rounded-lg bg-cyan-500/20">
                  <Target className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="relative">
                  <span className="text-xs text-gray-500">Scans Today</span>
                  <span className="block text-lg font-bold text-white tabular-nums">
                    {stats.scansToday.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Vulns Found */}
              <div className="group relative flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all backdrop-blur-sm">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-red-500/10 animate-pulse" />
                <div className="p-1.5 rounded-lg bg-red-500/20">
                  <Bug className="w-4 h-4 text-red-400 animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
                <div className="relative">
                  <span className="text-xs text-gray-500">Vulns Found</span>
                  <span className="block text-lg font-bold text-red-400 tabular-nums">
                    {stats.vulnsDetected.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Avg Scan Time */}
              <div className="group relative flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all backdrop-blur-sm">
                <div className="p-1.5 rounded-lg bg-green-500/20">
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500">Avg Scan</span>
                  <span className="block text-lg font-bold text-white tabular-nums">
                    {stats.avgScanTime}s
                  </span>
                </div>
              </div>
              
              {/* Hosts Scanned */}
              <div className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all backdrop-blur-sm">
                <div className="absolute inset-0 rounded-xl animate-pulse bg-purple-500/5" />
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <div className="relative">
                  <span className="text-xs text-gray-500">Hosts</span>
                  <span className="block text-lg font-bold text-purple-400 tabular-nums">
                    {stats.hostsScanned.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                isOnline 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                <span className={`text-xs font-medium ${isOnline ? 'text-green-400' : 'text-amber-400'}`}>
                  {USE_REAL_API && isOnline ? 'LIVE' : 'SIM'}
                </span>
              </div>

              {/* AI Assistant Button */}
              <a
                href="/neural-link/"
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30 hover:border-purple-400/50 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all backdrop-blur-sm"
              >
                <div className="absolute inset-0 rounded-xl animate-pulse bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
                  AI Assistant
                </span>
              </a>

              {/* Back to Maula Button */}
              <a
                href="https://maula.ai/#tool-section-6"
                className="group relative flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-amber-500/30 hover:bg-slate-800/80 transition-all backdrop-blur-sm"
              >
                <Globe className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-amber-400 transition-colors">
                  Back to Maula
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════════
          🎮 MAIN CONTENT AREA WITH ENHANCED LAYOUT
          ═══════════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-[1800px] mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>
        {/* Scanning Status Banner */}
        {isScanning && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radar className="w-6 h-6 text-purple-400 animate-spin" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-0 animate-ping opacity-30">
                    <Radar className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className="text-purple-300 font-medium">Scanning in progress...</p>
                  <p className="text-sm text-gray-500">Target: {currentTarget}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400 tabular-nums">{portsScanned}</p>
                  <p className="text-gray-500">Ports Scanned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400 tabular-nums">{portsOpen}</p>
                  <p className="text-gray-500">Open Ports</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400 tabular-nums">{vulnsFound}</p>
                  <p className="text-gray-500">Vulnerabilities</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-purple-400">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Form */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <VulnScanForm
                onScan={handleScan}
                onCancel={handleCancel}
                isScanning={isScanning}
              />
            </div>
          </div>

          {/* Column 2: Live Scan */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <LiveScanPanel
                steps={steps}
                events={events}
                isScanning={isScanning}
                portsScanned={portsScanned}
                portsOpen={portsOpen}
                vulnsFound={vulnsFound}
                discoveredPorts={discoveredPorts}
                currentTarget={currentTarget}
                progress={progress}
              />
            </div>
          </div>

          {/* Column 3: Results */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {result ? (
                <AnimatedVulnResult
                  result={result}
                  onNewScan={handleNewScan}
                  onExport={handleExport}
                />
              ) : (
                <div className="vuln-card p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-sm border border-purple-500/20 rounded-2xl bg-slate-900/80">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
                  
                  {/* Pulsing orb */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 animate-ping opacity-20">
                      <div className="w-24 h-24 rounded-2xl bg-purple-500" />
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/30">
                      <Shield className="w-12 h-12 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    Scan Results
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-sm">
                    Configure and start a vulnerability scan to see detailed
                    security analysis
                  </p>
                  
                  {/* Capability Grid */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs relative">
                    <div className="group/cap p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all">
                      <div className="relative">
                        <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover/cap:animate-pulse" />
                      </div>
                      <p className="text-sm text-gray-400">Port Scanning</p>
                    </div>
                    <div className="group/cap p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                      <div className="relative">
                        <Server className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover/cap:animate-pulse" />
                      </div>
                      <p className="text-sm text-gray-400">Service Detection</p>
                    </div>
                    <div className="group/cap p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-red-500/30 transition-all">
                      <div className="relative">
                        <Bug className="w-8 h-8 text-red-400 mx-auto mb-2 group-hover/cap:animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                      <p className="text-sm text-gray-400">CVE Matching</p>
                    </div>
                    <div className="group/cap p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all">
                      <div className="relative">
                        <Lock className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover/cap:animate-pulse" />
                      </div>
                      <p className="text-sm text-gray-400">SSL Analysis</p>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 border border-purple-500/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border border-cyan-500/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════════
          🦶 EPIC FOOTER WITH ANIMATED STATUS
          ═══════════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-purple-500/20 mt-12 bg-slate-900/50 backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-5 h-5 text-purple-400" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <span className="text-gray-400">
                <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">VulnScan</span>
                <span className="text-gray-500"> v6.0 • VictoryKit Security Suite</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {apiError && (
                <span className="text-amber-400 flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
                  <AlertTriangle className="w-4 h-4" />
                  API Error
                </span>
              )}
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-green-400">CVE Database Synced</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                USE_REAL_API && isOnline 
                  ? 'bg-purple-500/10 border border-purple-500/30' 
                  : 'bg-slate-700/50 border border-slate-600'
              }`}>
                <Zap className={`w-4 h-4 ${USE_REAL_API && isOnline ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={USE_REAL_API && isOnline ? 'text-purple-400' : 'text-gray-400'}>
                  {USE_REAL_API && isOnline ? 'Live API' : 'Simulation Mode'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isOnline 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <Activity className={`w-4 h-4 ${isOnline ? 'text-green-400 animate-pulse' : 'text-amber-400'}`} />
                <span className={isOnline ? 'text-green-400' : 'text-amber-400'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Global CSS for animations */}
      <style>{`
        @keyframes animate-gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: animate-gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default VulnScanTool;

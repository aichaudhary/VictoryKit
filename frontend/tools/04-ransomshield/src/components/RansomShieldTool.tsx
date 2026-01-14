import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  Bug,
  Shield,
  Activity,
  Clock,
  FileSearch,
  Zap,
  Server,
  Database,
  AlertTriangle,
  Radar,
  Crosshair,
  Target,
  Scan,
  Eye,
  Cpu,
  Network,
  Lock,
  Sparkles,
  ShieldCheck,
  Skull,
  Flame,
  Radio,
  ArrowLeft,
  Bot,
} from "lucide-react";
import MalwareScanForm, { ScanConfig } from "./MalwareScanForm";
import LiveScanPanel, { ScanStep, ScanEvent } from "./LiveScanPanel";
import AnimatedMalwareResult, { MalwareResult } from "./AnimatedMalwareResult";

// ═══════════════════════════════════════════════════════════════════════════════
// 🌕 NEIL ARMSTRONG UPGRADE - EPIC VISUAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Epic Particle System - Floating elements throughout the interface
const ParticleField: React.FC<{ isScanning: boolean }> = ({ isScanning }) => {
  const particles = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      type: Math.random() > 0.8 ? 'virus' : Math.random() > 0.6 ? 'shield' : 'dot'
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute transition-all duration-1000 ${isScanning ? 'opacity-80' : 'opacity-40'}`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.type === 'virus' ? (
            <Bug className={`w-3 h-3 ${isScanning ? 'text-red-500 animate-pulse' : 'text-red-500/30'}`} />
          ) : p.type === 'shield' ? (
            <Shield className={`w-2 h-2 ${isScanning ? 'text-green-400' : 'text-cyan-500/30'}`} />
          ) : (
            <div 
              className={`rounded-full ${isScanning ? 'bg-purple-400 shadow-lg shadow-purple-500/50' : 'bg-purple-500/20'}`}
              style={{ width: p.size, height: p.size }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Scanning Grid Overlay - Matrix-style background
const ScanningGrid: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <div className="absolute inset-0" style={{
      backgroundImage: `
        linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }} />
    {active && (
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent" 
           style={{ animation: 'scanLineMove 2s ease-in-out infinite' }} />
    )}
  </div>
);

// Floating Threat Counter - Real-time threat display
const FloatingThreatCounter: React.FC<{ count: number; isScanning: boolean }> = ({ count, isScanning }) => (
  <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${isScanning || count > 0 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
    <div className={`relative px-6 py-4 rounded-2xl backdrop-blur-xl border ${
      count > 0 
        ? 'bg-red-900/60 border-red-500/50 shadow-2xl shadow-red-500/30' 
        : 'bg-slate-900/60 border-purple-500/30 shadow-xl shadow-purple-500/20'
    }`}>
      {count > 0 && <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-pulse" />}
      <div className="relative flex items-center gap-3">
        <div className="relative">
          {count > 0 ? (
            <Skull className="w-8 h-8 text-red-400 animate-bounce" />
          ) : (
            <Radar className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          )}
          {count > 0 && <div className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping" />}
        </div>
        <div>
          <div className="text-xs text-gray-300 uppercase tracking-wider font-bold">
            {count > 0 ? '⚠️ THREATS FOUND' : '🔍 SCANNING'}
          </div>
          <div className={`text-3xl font-black tabular-nums ${count > 0 ? 'text-red-400' : 'text-purple-400'}`}>
            {count}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Cyber Orb - Floating decorative element
const CyberOrb: React.FC<{ position: 'left' | 'right'; isScanning: boolean }> = ({ position, isScanning }) => (
  <div className={`fixed ${position === 'left' ? '-left-32 top-1/4' : '-right-32 top-1/3'} w-64 h-64 pointer-events-none`}>
    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${
      position === 'left' ? 'from-purple-500/20 to-pink-500/10' : 'from-cyan-500/20 to-blue-500/10'
    } blur-3xl transition-all duration-1000 ${isScanning ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`} />
    <div className={`absolute inset-8 rounded-full border border-purple-500/20 ${isScanning ? 'animate-spin' : ''}`} 
         style={{ animationDuration: '15s' }} />
    <div className={`absolute inset-16 rounded-full border border-cyan-500/10 ${isScanning ? 'animate-spin' : ''}`} 
         style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
  </div>
);

// Pulsing Ring Effect
const PulseRing: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`fixed inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="absolute rounded-full border border-purple-500/20"
        style={{
          width: `${300 + i * 200}px`,
          height: `${300 + i * 200}px`,
          animation: active ? `pulseRing ${3 + i}s ease-out infinite` : 'none',
          animationDelay: `${i * 0.5}s`
        }}
      />
    ))}
  </div>
);

// Status Beacon - Shows system status
const StatusBeacon: React.FC<{ status: 'idle' | 'scanning' | 'threat' | 'clean' }> = ({ status }) => {
  const config = {
    idle: { color: 'bg-gray-500', pulse: false, label: 'STANDBY' },
    scanning: { color: 'bg-purple-500', pulse: true, label: 'ACTIVE SCAN' },
    threat: { color: 'bg-red-500', pulse: true, label: 'THREAT DETECTED' },
    clean: { color: 'bg-green-500', pulse: false, label: 'ALL CLEAR' },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.pulse && <div className={`absolute inset-0 rounded-full ${config.color} animate-ping opacity-75`} />}
      </div>
      <span className="text-xs font-bold tracking-wider text-gray-400">{config.label}</span>
    </div>
  );
};

const SCAN_STEPS: ScanStep[] = [
  { id: "init", label: "Initializing Engine", status: "pending" },
  { id: "signature", label: "Signature Scan", status: "pending" },
  { id: "heuristic", label: "Heuristic Analysis", status: "pending" },
  { id: "behavioral", label: "Behavioral Detection", status: "pending" },
  { id: "sandbox", label: "Sandbox Execution", status: "pending" },
  { id: "yara", label: "YARA Rules", status: "pending" },
  { id: "pe", label: "PE Analysis", status: "pending" },
  { id: "memory", label: "Memory Patterns", status: "pending" },
  { id: "network", label: "Network Indicators", status: "pending" },
  { id: "final", label: "Final Assessment", status: "pending" },
];

const MALWARE_NAMES = [
  "Trojan.GenericKD.46587412",
  "Ransomware.WannaCry.Gen",
  "Adware.BrowserModifier.Win32",
  "Backdoor.Agent.AXYZ",
  "Worm.Win32.AutoRun",
  "Rootkit.MBR.Infection",
  "Spyware.KeyLogger.Gen",
  "Cryptominer.CoinHive.A",
  "Dropper.Agent.BXYZ",
  "PUP.Optional.OpenCandy",
];

const MALWARE_TYPES = [
  "Trojan",
  "Ransomware",
  "Adware",
  "Backdoor",
  "Worm",
  "Rootkit",
  "Spyware",
  "Cryptominer",
  "Dropper",
  "PUP",
];

const FILES = [
  "setup.exe",
  "update.dll",
  "document.pdf",
  "invoice.docx",
  "archive.zip",
  "script.js",
  "installer.msi",
  "patch.sys",
];

const RansomShieldTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [steps, setSteps] = useState<ScanStep[]>(SCAN_STEPS);
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [result, setResult] = useState<MalwareResult | null>(null);
  const [filesScanned, setFilesScanned] = useState(0);
  const [threatsFound, setThreatsFound] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [liveStats, setLiveStats] = useState({
    activeScans: 0,
    filesProtected: 847293,
    threatsBlocked: 12847,
    lastUpdate: new Date().toLocaleTimeString(),
  });

  const abortRef = useRef(false);

  const addEvent = useCallback((event: ScanEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 50));
  }, []);

  const updateStep = useCallback(
    (
      stepId: string,
      status: ScanStep["status"],
      detail?: string,
      progress?: number
    ) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status, detail, progress } : s
        )
      );
    },
    []
  );

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generateResult = (
    config: ScanConfig,
    detectedThreats: number
  ): MalwareResult => {
    const malwareCount = Math.floor(detectedThreats * 0.4);
    const pupCount = Math.floor(detectedThreats * 0.3);
    const suspiciousCount = detectedThreats - malwareCount - pupCount;

    const riskScore = Math.min(
      100,
      malwareCount * 30 + pupCount * 10 + suspiciousCount * 5
    );

    const verdict: MalwareResult["verdict"] =
      malwareCount > 0
        ? "MALICIOUS"
        : pupCount > 0
        ? "SUSPICIOUS"
        : detectedThreats > 0
        ? "UNKNOWN"
        : "CLEAN";

    const detections = Array.from(
      { length: Math.min(5, detectedThreats) },
      (_, i) => ({
        name: MALWARE_NAMES[Math.floor(Math.random() * MALWARE_NAMES.length)],
        type: MALWARE_TYPES[Math.floor(Math.random() * MALWARE_TYPES.length)],
        severity: (i === 0 && malwareCount > 0
          ? "critical"
          : i < 2
          ? "high"
          : "medium") as "critical" | "high" | "medium" | "low",
        file: FILES[Math.floor(Math.random() * FILES.length)],
        action: "Quarantine recommended",
      })
    );

    const aiAnalysis =
      verdict === "MALICIOUS"
        ? "CRITICAL: Multiple malicious files detected. Immediate action required. The detected malware includes active trojans capable of data exfiltration. Recommend immediate quarantine and system scan."
        : verdict === "SUSPICIOUS"
        ? "WARNING: Potentially unwanted programs detected. These files may affect system performance or privacy. Review each detection and remove if not intentionally installed."
        : detectedThreats > 0
        ? "CAUTION: Some files exhibit suspicious behavior patterns. While not definitively malicious, monitoring is recommended. Consider sandboxed execution for further analysis."
        : "CLEAN: No threats detected. All scanned files appear safe. Continue regular scanning to maintain security posture.";

    return {
      verdict,
      riskScore,
      totalScanned: config.files.length || 1,
      threatsFound: detectedThreats,
      scanDuration:
        config.scanDepth === "deep"
          ? 45
          : config.scanDepth === "standard"
          ? 20
          : 8,
      detections,
      summary: {
        malware: malwareCount,
        pup: pupCount,
        suspicious: suspiciousCount,
        clean: (config.files.length || 1) - detectedThreats,
      },
      aiAnalysis,
      recommendations: [
        "Quarantine detected threats",
        "Run full system scan",
        "Update security definitions",
        "Enable real-time protection",
      ],
    };
  };

  const runScan = async (config: ScanConfig) => {
    abortRef.current = false;
    setIsScanning(true);
    setResult(null);
    setFilesScanned(0);
    setThreatsFound(0);
    setScanProgress(0);
    setEvents([]);
    setSteps(
      SCAN_STEPS.map((s) => ({
        ...s,
        status: "pending",
        detail: undefined,
        progress: undefined,
      }))
    );
    setLiveStats((prev) => ({
      ...prev,
      activeScans: 1,
      lastUpdate: new Date().toLocaleTimeString(),
    }));

    const stepDurations = {
      quick: [300, 400, 400, 300, 200, 300, 400, 300, 200, 300],
      standard: [500, 700, 800, 600, 500, 600, 700, 600, 500, 500],
      deep: [800, 1200, 1500, 1200, 1000, 1000, 1200, 1000, 800, 800],
    };
    const durations = stepDurations[config.scanDepth];

    addEvent({
      timestamp: Date.now(),
      type: "scan",
      severity: "info",
      message: `Malware scan initiated - Depth: ${config.scanDepth}`,
    });

    let totalThreats = 0;
    const totalFiles = config.files.length || 5;

    for (let i = 0; i < SCAN_STEPS.length; i++) {
      if (abortRef.current) break;

      const step = SCAN_STEPS[i];
      updateStep(step.id, "running", "Processing...", 0);
      setScanProgress((i / SCAN_STEPS.length) * 100);

      addEvent({
        timestamp: Date.now(),
        type: "scan",
        severity: "info",
        message: `${step.label} starting...`,
      });

      // Simulate file scanning during signature step
      if (step.id === "signature") {
        for (let f = 0; f < totalFiles; f++) {
          if (abortRef.current) break;
          const fileName = config.files[f]?.name || FILES[f % FILES.length];
          setCurrentFile(fileName);
          setFilesScanned((prev) => prev + 1);
          updateStep(
            step.id,
            "running",
            `Scanning ${fileName}`,
            Math.round((f / totalFiles) * 100)
          );
          await delay(durations[i] / totalFiles);
        }
      } else {
        await delay(durations[i] * 0.5);
        updateStep(step.id, "running", "Analyzing...", 50);
        await delay(durations[i] * 0.5);
      }

      // Simulate threat detection
      if (Math.random() > 0.6 && i > 1 && i < 8) {
        const severity =
          Math.random() > 0.7
            ? "critical"
            : Math.random() > 0.5
            ? "high"
            : "medium";
        const malwareName =
          MALWARE_NAMES[Math.floor(Math.random() * MALWARE_NAMES.length)];
        const file = FILES[Math.floor(Math.random() * FILES.length)];

        addEvent({
          timestamp: Date.now(),
          type: "detection",
          severity: severity as ScanEvent["severity"],
          message: `Detected: ${malwareName}`,
          file,
        });
        totalThreats++;
        setThreatsFound((prev) => prev + 1);

        if (severity === "critical") {
          updateStep(step.id, "warning", `Threat detected!`);
          await delay(200);
        }
      }

      updateStep(step.id, "complete", "✓ Complete", 100);

      addEvent({
        timestamp: Date.now(),
        type: "analysis",
        severity: "low",
        message: `${step.label} completed`,
      });
    }

    setCurrentFile("");
    setScanProgress(100);

    if (!abortRef.current) {
      const finalResult = generateResult(config, totalThreats);
      setResult(finalResult);
      setLiveStats((prev) => ({
        ...prev,
        activeScans: 0,
        threatsBlocked: prev.threatsBlocked + totalThreats,
        filesProtected: prev.filesProtected + totalFiles,
        lastUpdate: new Date().toLocaleTimeString(),
      }));

      addEvent({
        timestamp: Date.now(),
        type: "scan",
        severity: totalThreats > 0 ? "high" : "info",
        message: `Scan complete: ${totalThreats} threats detected`,
      });
    }

    setIsScanning(false);
  };

  const handleScan = (config: ScanConfig) => {
    runScan(config);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsScanning(false);
    addEvent({
      timestamp: Date.now(),
      type: "warning",
      severity: "medium",
      message: "Scan cancelled by user",
    });
  };

  // Determine current status
  const currentStatus = isScanning ? 'scanning' : threatsFound > 0 ? 'threat' : result ? 'clean' : 'idle';

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 overflow-hidden">
      {/* Epic CSS Animations */}
      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-20px) rotate(5deg); opacity: 0.8; }
          50% { transform: translateY(-10px) rotate(-5deg); opacity: 0.6; }
          75% { transform: translateY(-30px) rotate(3deg); opacity: 0.9; }
        }
        @keyframes scanLineMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.2); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(168, 85, 247, 0.3); }
          50% { border-color: rgba(168, 85, 247, 0.6); }
        }
        @keyframes float3D {
          0%, 100% { transform: translateY(0) rotateX(0); }
          50% { transform: translateY(-10px) rotateX(5deg); }
        }
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes threatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .epic-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.8) 100%);
          border: 1px solid rgba(168, 85, 247, 0.2);
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        .epic-card:hover {
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.15);
        }
        .scanning-active {
          animation: glowPulse 2s ease-in-out infinite;
        }
        .stats-card {
          background: linear-gradient(180deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px solid rgba(168, 85, 247, 0.15);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.1);
        }
      `}</style>

      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
        
        {/* Radial glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)'
        }} />
        
        {/* Bottom glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
        }} />
      </div>

      {/* Epic Visual Effects */}
      <ParticleField isScanning={isScanning} />
      <ScanningGrid active={isScanning} />
      <PulseRing active={isScanning} />
      <CyberOrb position="left" isScanning={isScanning} />
      <CyberOrb position="right" isScanning={isScanning} />
      
      {/* Floating Threat Counter */}
      <FloatingThreatCounter count={threatsFound} isScanning={isScanning} />

      {/* Back to Maula Button - Fixed Top Right */}
      <a
        href="https://maula.ai/#tool-section-4"
        className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-purple-500/30 text-white hover:bg-slate-800/90 transition-all flex items-center gap-2 shadow-xl hover:shadow-purple-500/20 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Back to Maula</span>
      </a>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Epic Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-5">
              {/* Animated Logo - Clickable Branding */}
              <a
                href="https://ransomshield.maula.ai"
                className="relative group cursor-pointer"
              >
                <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-50 blur-lg transition-all duration-500 ${isScanning ? 'animate-pulse opacity-75' : 'group-hover:opacity-75'}`} />
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center shadow-2xl ${isScanning ? 'scanning-active' : ''}`}>
                  <Bug className={`w-9 h-9 text-white ${isScanning ? 'animate-bounce' : ''}`} />
                  
                  {/* Scanning indicator rings */}
                  {isScanning && (
                    <>
                      <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping" />
                      <div className="absolute -inset-1 rounded-2xl border border-purple-400/50" style={{ animation: 'radarSweep 2s linear infinite' }} />
                    </>
                  )}
                </div>
                
                {/* Status dot */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                  isScanning ? 'bg-green-500 animate-pulse' : threatsFound > 0 ? 'bg-red-500' : 'bg-gray-600'
                }`}>
                  {isScanning && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </a>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-transparent tracking-tight">
                    RansomShield
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                    v3.0
                  </span>
                </div>
                <p className="text-gray-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI-Powered Malware Detection & Analysis Engine
                </p>
              </div>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* AI Assistant Button */}
              <a
                href="/neural-link/"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 group"
              >
                <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">AI Assistant</span>
              </a>

              {/* Status Beacon */}
              <StatusBeacon status={currentStatus} />
            </div>
          </div>

          {/* Epic Stats Bar */}
          <div className="grid grid-cols-4 gap-4 p-5 rounded-2xl epic-card">
            {/* Active Scans */}
            <div className="stats-card rounded-xl p-4 group cursor-default">
              <div className="flex items-center gap-4">
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Activity className={`w-6 h-6 text-purple-400 ${isScanning ? 'animate-pulse' : ''}`} />
                  {isScanning && (
                    <div className="absolute inset-0 rounded-xl border border-purple-400/50 animate-ping" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active Scans</div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {liveStats.activeScans}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Files Protected */}
            <div className="stats-card rounded-xl p-4 group cursor-default">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSearch className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Files Protected</div>
                  <div className="text-2xl font-black text-green-400 tabular-nums">
                    {liveStats.filesProtected.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Threats Blocked */}
            <div className={`stats-card rounded-xl p-4 group cursor-default ${liveStats.threatsBlocked > 0 ? 'border-red-500/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform ${liveStats.threatsBlocked > 0 ? 'animate-pulse' : ''}`}>
                  <Shield className="w-6 h-6 text-red-400" />
                  {liveStats.threatsBlocked > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Threats Blocked</div>
                  <div className="text-2xl font-black text-red-400 tabular-nums">
                    {liveStats.threatsBlocked.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Last Update */}
            <div className="stats-card rounded-xl p-4 group cursor-default">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Last Update</div>
                  <div className="text-2xl font-black text-cyan-400 tabular-nums">
                    {liveStats.lastUpdate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Epic 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scan Form */}
          <div className={`lg:col-span-1 transform transition-all duration-300 ${isScanning ? 'scale-[0.99]' : 'hover:scale-[1.01]'}`}>
            <MalwareScanForm
              onSubmit={handleScan}
              isLoading={isScanning}
              onStop={handleStop}
            />
          </div>

          {/* Middle Column - Live Scan Panel */}
          <div className={`lg:col-span-1 transform transition-all duration-300 ${isScanning ? 'scale-[1.02]' : ''}`}>
            <LiveScanPanel
              steps={steps}
              events={events}
              isScanning={isScanning}
              filesScanned={filesScanned}
              threatsFound={threatsFound}
              currentFile={currentFile}
              scanProgress={scanProgress}
            />
          </div>

          {/* Right Column - Results */}
          <div className={`lg:col-span-1 transform transition-all duration-300 ${result ? 'scale-[1.01]' : ''}`}>
            <AnimatedMalwareResult
              data={result}
              isScanning={isScanning}
              onQuarantine={() => console.log("Quarantine")}
              onViewReport={() => console.log("View report")}
            />
          </div>
        </div>

        {/* Epic Footer */}
        <div className="mt-10 pt-6 border-t border-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>System Online</span>
              </div>
              <span className="text-gray-700">•</span>
              <span>Neural Engine v3.0</span>
              <span className="text-gray-700">•</span>
              <span>Definitions: Latest</span>
            </div>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="font-medium">RansomShield Detection Engine</span>
              <span className="text-gray-700">•</span>
              <span className="text-purple-400">Powered by AI Threat Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RansomShieldTool;

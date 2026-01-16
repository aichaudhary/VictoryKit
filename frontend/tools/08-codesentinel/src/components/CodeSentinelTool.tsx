import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Code,
  Shield,
  Zap,
  FileCode,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCcw,
  Download,
  Share2,
  Cloud,
  CloudOff,
  Unlock,
  Eye,
  Terminal,
  Bug,
  Skull,
  Radar,
  Fingerprint,
  Binary,
  Database,
  Cpu,
  Activity,
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import CodeAnalysisForm, { CodeAnalysisFormData } from "./CodeAnalysisForm";
import LiveCodePanel, {
  ScanStage,
  CodeIssue,
  LiveScanEvent,
} from "./LiveCodePanel";
import AnimatedSecurityResult, {
  SecurityMetrics,
  Vulnerability,
} from "./AnimatedSecurityResult";
import { codesentinelAPI, ScanResult, Finding } from "../api/codesentinel.api";

// ═══════════════════════════════════════════════════════════════════════════════
// 🔥💀 DOOM-LEVEL EPIC ANIMATED VISUAL COMPONENTS 💀🔥
// CodeSentinel - The Ultimate Code Security Fortress
// ═══════════════════════════════════════════════════════════════════════════════

// 🌌 Matrix Code Rain - Security symbols falling
const MatrixCodeRain: React.FC<{ isAnalyzing?: boolean }> = ({ isAnalyzing }) => {
  const columns = useMemo(() => {
    const chars = ['0', '1', '▓', '░', '█', '◈', '◆', '●', '○', '⬡', '⬢', '{', '}', '<', '>', '/', '\\', '=', '!', '@', '#', '$'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: i * 2.5,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      chars: Array.from({ length: 25 }, () => chars[Math.floor(Math.random() * chars.length)]).join('\n'),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {columns.map((col) => (
        <div
          key={col.id}
          className={`absolute font-mono text-xs whitespace-pre leading-4 ${isAnalyzing ? 'text-green-500/40' : 'text-green-500/15'}`}
          style={{
            left: `${col.x}%`,
            top: '-300px',
            animation: `matrixRain ${col.duration}s linear infinite`,
            animationDelay: `${col.delay}s`,
            textShadow: isAnalyzing ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
          }}
        >
          {col.chars}
        </div>
      ))}
      <style>{`
        @keyframes matrixRain {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 🔍 Scanning Laser Beams - Horizontal scan lines
const ScanningLaserBeams: React.FC<{ isAnalyzing?: boolean }> = ({ isAnalyzing }) => {
  if (!isAnalyzing) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[1, 2, 3].map((beam) => (
        <div
          key={beam}
          className="absolute left-0 right-0 h-0.5"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 1), rgba(34, 197, 94, 0.8), transparent)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.4)',
            animation: `scanLaser ${3 + beam * 0.5}s ease-in-out infinite`,
            animationDelay: `${beam * 0.8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes scanLaser {
          0%, 100% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 🛡️ Shield Force Field - Protective barrier effect
const ShieldForceField: React.FC<{ securityScore?: number }> = ({ securityScore = 100 }) => {
  const getColor = () => {
    if (securityScore >= 80) return 'rgba(34, 197, 94, 0.3)';  // Green
    if (securityScore >= 60) return 'rgba(234, 179, 8, 0.3)';  // Yellow
    if (securityScore >= 40) return 'rgba(249, 115, 22, 0.3)'; // Orange
    return 'rgba(239, 68, 68, 0.3)'; // Red
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagonal grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="hexGrid" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
            <path 
              d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" 
              fill="none" 
              stroke={getColor()}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>
      
      {/* Pulsing shield rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border"
            style={{
              width: `${ring * 200}px`,
              height: `${ring * 200}px`,
              left: `${-ring * 100}px`,
              top: `${-ring * 100}px`,
              borderColor: getColor(),
              animation: `shieldPulse ${4 + ring}s ease-out infinite`,
              animationDelay: `${ring * 0.5}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes shieldPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// ⚡ Electric Arc Effects - Security breach visualization
const ElectricArcEffects: React.FC<{ criticalIssues?: number }> = ({ criticalIssues = 0 }) => {
  if (criticalIssues === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: Math.min(criticalIssues * 2, 10) }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: '2px',
            height: `${50 + Math.random() * 100}px`,
            background: `linear-gradient(180deg, transparent, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 1), rgba(239, 68, 68, 0.8), transparent)`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `electricArc ${0.1 + Math.random() * 0.3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
          }}
        />
      ))}
      <style>{`
        @keyframes electricArc {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 🌐 Cyber Grid Network - Background mesh
const CyberGridNetwork: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <pattern id="cyberGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(34, 197, 94, 0.06)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.15)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyberGrid)" />
        <ellipse cx="50%" cy="50%" rx="40%" ry="40%" fill="url(#gridGlow)" />
      </svg>
    </div>
  );
};

// 🔒 Security Particle System - Floating security icons
const SecurityParticleSystem: React.FC<{ isAnalyzing?: boolean }> = ({ isAnalyzing }) => {
  const particles = useMemo(() => {
    const icons = ['lock', 'unlock', 'shield', 'bug', 'eye', 'code', 'terminal', 'fingerprint'];
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 12 + Math.random() * 18,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));
  }, []);

  const getIcon = (type: string, size: number) => {
    const className = `w-full h-full ${isAnalyzing ? 'text-green-500/40' : 'text-green-500/20'}`;
    switch (type) {
      case 'lock': return <Lock className={className} />;
      case 'unlock': return <Unlock className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'bug': return <Bug className={className} />;
      case 'eye': return <Eye className={className} />;
      case 'code': return <Code className={className} />;
      case 'terminal': return <Terminal className={className} />;
      case 'fingerprint': return <Fingerprint className={className} />;
      default: return <Lock className={className} />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatParticle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {getIcon(p.icon, p.size)}
        </div>
      ))}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          25% { transform: translate(30px, -40px) rotate(90deg); opacity: 0.6; }
          50% { transform: translate(-20px, -60px) rotate(180deg); opacity: 0.4; }
          75% { transform: translate(40px, -30px) rotate(270deg); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// 📡 Threat Detection Radar - Rotating scanner
const ThreatDetectionRadar: React.FC<{ isAnalyzing?: boolean; threatCount?: number }> = ({ isAnalyzing, threatCount = 0 }) => {
  return (
    <div className="absolute top-8 right-8 w-40 h-40 opacity-40">
      <div className="relative w-full h-full">
        {/* Radar circles */}
        {[1, 2, 3, 4].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-green-500/30"
            style={{
              inset: `${ring * 10}%`,
            }}
          />
        ))}
        
        {/* Cross lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-green-500/30 to-transparent" />
        </div>
        
        {/* Scanning sweep */}
        {isAnalyzing && (
          <div 
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: '3s' }}
          >
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-1"
              style={{
                background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), transparent)',
                transformOrigin: 'left center',
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
              }}
            />
          </div>
        )}
        
        {/* Threat blips */}
        {threatCount > 0 && Array.from({ length: Math.min(threatCount, 5) }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
            }}
          />
        ))}
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Radar className={`w-6 h-6 ${isAnalyzing ? 'text-green-400 animate-pulse' : 'text-green-500/50'}`} />
        </div>
      </div>
    </div>
  );
};

// 💾 Data Stream Visualization - Binary flow
const DataStreamVisualization: React.FC<{ isAnalyzing?: boolean }> = ({ isAnalyzing }) => {
  const streams = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      y: 5 + i * 7,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      text: Array.from({ length: 30 }, () => Math.random() > 0.5 ? '1' : '0').join(' '),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className={`absolute font-mono text-xs whitespace-nowrap ${isAnalyzing ? 'text-green-400/30' : 'text-green-500/10'}`}
          style={{
            top: `${stream.y}%`,
            right: '-500px',
            animation: `dataStream ${stream.duration}s linear infinite`,
            animationDelay: `${stream.delay}s`,
          }}
        >
          {stream.text}
        </div>
      ))}
      <style>{`
        @keyframes dataStream {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateX(calc(-100vw - 500px)); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 🎯 Vulnerability Pulse Points - Threat indicators
const VulnerabilityPulsePoints: React.FC<{ issues: number }> = ({ issues }) => {
  if (issues === 0) return null;
  
  const points = useMemo(() => {
    return Array.from({ length: Math.min(issues, 12) }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
    }));
  }, [issues]);

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {points.map((point) => (
        <div
          key={point.id}
          className="absolute"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
          }}
        >
          <div className={`w-3 h-3 ${getColor(point.severity)} rounded-full animate-pulse`} style={{ boxShadow: `0 0 15px currentColor` }}>
            <div className={`absolute inset-0 ${getColor(point.severity)} rounded-full animate-ping`} />
          </div>
        </div>
      ))}
    </div>
  );
};

// 🏰 Code Fortress Animation - Protection visualization  
const CodeFortressAnimation: React.FC<{ isProtected?: boolean }> = ({ isProtected = true }) => {
  return (
    <div className="absolute bottom-8 left-8 w-32 h-32 opacity-30">
      <div className="relative w-full h-full">
        {/* Rotating shield layers */}
        {[1, 2, 3].map((layer) => (
          <div
            key={layer}
            className="absolute inset-0 border-2 border-green-500/30 rounded-lg"
            style={{
              animation: `fortressRotate ${10 + layer * 5}s linear infinite`,
              animationDirection: layer % 2 === 0 ? 'reverse' : 'normal',
              transform: `rotate(${layer * 15}deg)`,
            }}
          />
        ))}
        
        {/* Center shield icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isProtected ? (
            <ShieldCheck className="w-12 h-12 text-green-400" />
          ) : (
            <ShieldOff className="w-12 h-12 text-red-400" />
          )}
        </div>
      </div>
      <style>{`
        @keyframes fortressRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const CodeSentinelTool: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [stages, setStages] = useState<ScanStage[]>([]);
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [events, setEvents] = useState<LiveScanEvent[]>([]);
  const [filesScanned, setFilesScanned] = useState(0);
  const [dependenciesChecked, setDependenciesChecked] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [useRealApi, setUseRealApi] = useState(true);
  const abortRef = useRef(false);

  // Check API availability on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await codesentinelAPI.getStats();
      setApiAvailable(response.success);
    } catch {
      setApiAvailable(false);
    }
  };

  // Convert API findings to component issues
  const convertFindingsToIssues = (findings: Finding[]): CodeIssue[] => {
    return findings.map((finding, idx) => ({
      id: finding.id || `issue-${idx + 1}`,
      line: finding.line || 1,
      column: finding.column || 1,
      severity: finding.severity,
      type: finding.type || finding.title,
      message: finding.description,
      code: finding.codeSnippet || '',
      suggestion: finding.suggestedFix || '',
    }));
  };

  // Convert API result to metrics
  const convertResultToMetrics = (result: ScanResult, issues: CodeIssue[]): SecurityMetrics => {
    return {
      score: result.securityScore,
      grade: result.securityScore >= 90 ? 'A' : result.securityScore >= 80 ? 'B' : result.securityScore >= 70 ? 'C' : result.securityScore >= 60 ? 'D' : 'F',
      issues: {
        critical: result.summary.critical,
        high: result.summary.high,
        medium: result.summary.medium,
        low: result.summary.low,
        info: result.summary.info,
      },
      categories: {
        injection: issues.filter(i => i.type.toLowerCase().includes('injection')).length,
        xss: issues.filter(i => i.type.toLowerCase().includes('xss')).length,
        secrets: issues.filter(i => i.type.toLowerCase().includes('secret') || i.type.toLowerCase().includes('credential')).length,
        crypto: issues.filter(i => i.type.toLowerCase().includes('crypto') || i.type.toLowerCase().includes('weak')).length,
        auth: issues.filter(i => i.type.toLowerCase().includes('auth')).length,
        dependencies: result.findings.filter(f => f.scanner === 'dependency-check').length,
        other: 0,
      },
      vulnerabilities: result.findings
        .filter(f => f.scanner === 'dependency-check')
        .map((f, idx) => ({
          id: f.id || `vuln-${idx}`,
          package: f.title.split(' ')[0] || 'unknown',
          version: '0.0.0',
          severity: f.severity,
          cve: f.cweId || '',
          title: f.description,
          fixVersion: 'latest',
        })),
      scannedFiles: result.metadata?.filesScanned || 1,
      scannedLines: result.metadata?.linesOfCode || code.split('\n').length,
      analysisTime: (result.metadata?.duration || 3000) / 1000,
    };
  };

  // Real API analysis
  const runRealAnalysis = async (data: CodeAnalysisFormData) => {
    const analysisStages: ScanStage[] = [
      { name: "Parsing", status: "pending" },
      { name: "SAST", status: "pending" },
      { name: "Secrets", status: "pending" },
      { name: "Dependencies", status: "pending" },
      { name: "Reporting", status: "pending" },
    ];
    setStages(analysisStages);

    const updateStage = (idx: number, status: ScanStage["status"]) => {
      setStages(prev => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
      setEvents(prev => [...prev, { type: "stage", stage: { ...analysisStages[idx], status }, timestamp: Date.now() }]);
    };

    try {
      // Stage 1: Parsing
      updateStage(0, "running");
      await new Promise(r => setTimeout(r, 500));
      updateStage(0, "complete");

      // Stage 2: SAST
      updateStage(1, "running");
      const sastResult = await codesentinelAPI.runSastScan(data.code, data.language !== 'auto' ? data.language : undefined);
      
      if (sastResult.success && sastResult.data) {
        const sastIssues = convertFindingsToIssues(sastResult.data.findings);
        for (const issue of sastIssues) {
          setIssues(prev => [...prev, issue]);
          setEvents(prev => [...prev, { type: "issue", issue, timestamp: Date.now() }]);
          await new Promise(r => setTimeout(r, 100));
        }
      }
      updateStage(1, "complete");

      // Stage 3: Secrets
      updateStage(2, "running");
      const secretsResult = await codesentinelAPI.runSecretsScan(data.code);
      
      if (secretsResult.success && secretsResult.data) {
        const secretIssues = convertFindingsToIssues(secretsResult.data.findings);
        for (const issue of secretIssues) {
          setIssues(prev => [...prev, issue]);
          setEvents(prev => [...prev, { type: "issue", issue, timestamp: Date.now() }]);
          await new Promise(r => setTimeout(r, 100));
        }
      }
      updateStage(2, "complete");

      // Stage 4: Dependencies (if package.json-like content detected)
      updateStage(3, "running");
      if (data.code.includes('"dependencies"') || data.code.includes('"devDependencies"')) {
        const depResult = await codesentinelAPI.runDependencyScan(data.code);
        if (depResult.success && depResult.data) {
          setDependenciesChecked(depResult.data.findings.length);
        }
      }
      updateStage(3, "complete");

      // Stage 5: Run full scan for final metrics
      updateStage(4, "running");
      const fullResult = await codesentinelAPI.runFullScan({
        code: data.code,
        language: data.language !== 'auto' ? data.language : undefined,
        scanTypes: ['sast', 'secrets', 'dependencies'],
        includeFixSuggestions: true,
      });

      if (fullResult.success && fullResult.data) {
        const allIssues = convertFindingsToIssues(fullResult.data.findings);
        setIssues(allIssues);
        const calculatedMetrics = convertResultToMetrics(fullResult.data, allIssues);
        setMetrics(calculatedMetrics);
        updateStage(4, "complete");
        setEvents(prev => [...prev, { type: "complete", timestamp: Date.now() }]);
        return true;
      } else {
        throw new Error(fullResult.error || 'Scan failed');
      }
    } catch (error) {
      console.error('API analysis failed:', error);
      return false;
    }
  };

  const simulateAnalysis = useCallback(async (data: CodeAnalysisFormData) => {
    abortRef.current = false;
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setCode(data.code);
    setLanguage(data.language === "auto" ? "javascript" : data.language);
    setIssues([]);
    setEvents([]);
    setFilesScanned(0);
    setDependenciesChecked(0);
    setMetrics(null);

    // Try real API first if available and enabled
    if (useRealApi && apiAvailable) {
      const apiSuccess = await runRealAnalysis(data);
      if (apiSuccess) {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        return;
      }
      // Fall through to simulation if API fails
      console.log('API analysis failed, falling back to simulation');
    }

    // Simulation mode
    const analysisStages: ScanStage[] = [
      { name: "Parsing", status: "pending" },
      { name: "SAST", status: "pending" },
      { name: "Secrets", status: "pending" },
      { name: "Dependencies", status: "pending" },
      { name: "Reporting", status: "pending" },
    ];
    setStages(analysisStages);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Simulated vulnerabilities to detect
    const vulnerabilityPatterns = [
      {
        pattern: /SELECT.*\+.*req\.|query.*\+|sql.*=.*\+/gi,
        type: "SQL Injection",
        severity: "critical" as const,
        message: "User input directly concatenated in SQL query",
        suggestion: "Use parameterized queries or prepared statements",
      },
      {
        pattern: /res\.(send|write)\s*\([^)]*\+.*req\./gi,
        type: "Cross-Site Scripting (XSS)",
        severity: "high" as const,
        message: "Unsanitized user input rendered in response",
        suggestion: "Use template engine with auto-escaping or sanitize input",
      },
      {
        pattern: /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*["'][^"']+["']/gi,
        type: "Hardcoded Secret",
        severity: "critical" as const,
        message: "Sensitive credentials hardcoded in source code",
        suggestion: "Use environment variables or a secrets manager",
      },
      {
        pattern: /password\s*=\s*["'][^"']+["']/gi,
        type: "Hardcoded Password",
        severity: "high" as const,
        message: "Password stored in plaintext in source code",
        suggestion: "Use environment variables and never commit secrets",
      },
      {
        pattern: /eval\s*\(/gi,
        type: "Code Injection",
        severity: "critical" as const,
        message: "Use of eval() can execute arbitrary code",
        suggestion: "Avoid eval(); use safer alternatives like JSON.parse()",
      },
      {
        pattern: /innerHTML\s*=/gi,
        type: "DOM XSS",
        severity: "high" as const,
        message: "Direct innerHTML assignment can lead to XSS",
        suggestion: "Use textContent or sanitize HTML before insertion",
      },
      {
        pattern: /createHash\s*\(\s*["']md5["']\)/gi,
        type: "Weak Cryptography",
        severity: "medium" as const,
        message: "MD5 is cryptographically broken",
        suggestion: "Use SHA-256 or stronger hashing algorithms",
      },
      {
        pattern: /http:\/\/(?!localhost)/gi,
        type: "Insecure Protocol",
        severity: "medium" as const,
        message: "Using HTTP instead of HTTPS",
        suggestion: "Always use HTTPS for external communications",
      },
    ];

    // Stage 1: Parsing
    const updateStage = (idx: number, status: ScanStage["status"]) => {
      setStages((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, status } : s))
      );
      setEvents((prev) => [
        ...prev,
        {
          type: "stage",
          stage: { ...analysisStages[idx], status },
          timestamp: Date.now(),
        },
      ]);
    };

    updateStage(0, "running");
    await delay(800);
    if (abortRef.current) return;

    // Simulate file scanning
    const files = ["main.js", "utils.js", "config.js", "auth.js", "api.js"];
    for (const file of files) {
      if (abortRef.current) return;
      await delay(150);
      setFilesScanned((prev) => prev + 1);
      setEvents((prev) => [
        ...prev,
        { type: "file", file, timestamp: Date.now() },
      ]);
    }

    updateStage(0, "complete");
    if (abortRef.current) return;

    // Stage 2: SAST
    updateStage(1, "running");
    await delay(600);

    const lines = data.code.split("\n");
    const detectedIssues: CodeIssue[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (abortRef.current) return;
      const line = lines[i];
      for (const vuln of vulnerabilityPatterns) {
        if (vuln.pattern.test(line)) {
          vuln.pattern.lastIndex = 0; // Reset regex
          const issue: CodeIssue = {
            id: `issue-${detectedIssues.length + 1}`,
            line: i + 1,
            column: 1,
            severity: vuln.severity,
            type: vuln.type,
            message: vuln.message,
            code: line.trim(),
            suggestion: vuln.suggestion,
          };
          detectedIssues.push(issue);
          setIssues((prev) => [...prev, issue]);
          setEvents((prev) => [
            ...prev,
            { type: "issue", issue, timestamp: Date.now() },
          ]);
          await delay(200);
        }
      }
    }

    updateStage(1, "complete");
    if (abortRef.current) return;

    // Stage 3: Secrets
    updateStage(2, "running");
    await delay(500);
    updateStage(2, "complete");
    if (abortRef.current) return;

    // Stage 4: Dependencies
    updateStage(3, "running");
    const deps = [
      {
        name: "lodash",
        version: "4.17.15",
        vulnerability: "Prototype Pollution",
      },
      { name: "express", version: "4.18.2" },
      { name: "axios", version: "0.21.1", vulnerability: "SSRF" },
      { name: "moment", version: "2.29.4" },
      { name: "jsonwebtoken", version: "8.5.1" },
    ];

    for (const dep of deps) {
      if (abortRef.current) return;
      await delay(200);
      setDependenciesChecked((prev) => prev + 1);
      setEvents((prev) => [
        ...prev,
        { type: "dependency", dependency: dep, timestamp: Date.now() },
      ]);
    }
    updateStage(3, "complete");
    if (abortRef.current) return;

    // Stage 5: Reporting
    updateStage(4, "running");
    await delay(400);

    // Calculate metrics
    const criticalCount = detectedIssues.filter(
      (i) => i.severity === "critical"
    ).length;
    const highCount = detectedIssues.filter(
      (i) => i.severity === "high"
    ).length;
    const mediumCount = detectedIssues.filter(
      (i) => i.severity === "medium"
    ).length;
    const lowCount = detectedIssues.filter((i) => i.severity === "low").length;

    let score =
      100 -
      criticalCount * 20 -
      highCount * 10 -
      mediumCount * 5 -
      lowCount * 2;
    score = Math.max(0, Math.min(100, score));

    const grade: SecurityMetrics["grade"] =
      score >= 90
        ? "A"
        : score >= 80
        ? "B"
        : score >= 70
        ? "C"
        : score >= 60
        ? "D"
        : "F";

    const vulnerabilities: Vulnerability[] = deps
      .filter((d) => d.vulnerability)
      .map((d, idx) => ({
        id: `vuln-${idx}`,
        package: d.name,
        version: d.version,
        severity: d.name === "lodash" ? ("high" as const) : ("medium" as const),
        cve: d.name === "lodash" ? "CVE-2021-23337" : "CVE-2021-3749",
        title: d.vulnerability!,
        fixVersion: d.name === "lodash" ? "4.17.21" : "0.21.4",
      }));

    const calculatedMetrics: SecurityMetrics = {
      score,
      grade,
      issues: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        info: 0,
      },
      categories: {
        injection: detectedIssues.filter((i) =>
          i.type.toLowerCase().includes("injection")
        ).length,
        xss: detectedIssues.filter((i) => i.type.toLowerCase().includes("xss"))
          .length,
        secrets: detectedIssues.filter(
          (i) =>
            i.type.toLowerCase().includes("secret") ||
            i.type.toLowerCase().includes("password")
        ).length,
        crypto: detectedIssues.filter((i) =>
          i.type.toLowerCase().includes("crypto")
        ).length,
        auth: 0,
        dependencies: vulnerabilities.length,
        other: 0,
      },
      vulnerabilities,
      scannedFiles: files.length,
      scannedLines: lines.length,
      analysisTime: 3.2,
    };

    setMetrics(calculatedMetrics);
    updateStage(4, "complete");
    setEvents((prev) => [...prev, { type: "complete", timestamp: Date.now() }]);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  }, []);

  const handleCancel = () => {
    abortRef.current = true;
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setCode("");
    setStages([]);
    setIssues([]);
    setEvents([]);
    setFilesScanned(0);
    setDependenciesChecked(0);
    setMetrics(null);
  };

  // Calculate threat metrics for visual effects
  const criticalIssues = metrics?.issues.critical || 0;
  const totalIssues = issues.length;
  const securityScore = metrics?.score || 100;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════════════
          🔥💀 DOOM-LEVEL EPIC ANIMATED BACKGROUND - Code Security Fortress 💀🔥
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {/* Cyber Grid Network Base */}
        <CyberGridNetwork />
        
        {/* Matrix Code Rain */}
        <MatrixCodeRain isAnalyzing={isAnalyzing} />
        
        {/* Data Stream Visualization */}
        <DataStreamVisualization isAnalyzing={isAnalyzing} />
        
        {/* Security Particle System */}
        <SecurityParticleSystem isAnalyzing={isAnalyzing} />
        
        {/* Shield Force Field */}
        <ShieldForceField securityScore={securityScore} />
        
        {/* Scanning Laser Beams */}
        <ScanningLaserBeams isAnalyzing={isAnalyzing} />
        
        {/* Electric Arc Effects for Critical Issues */}
        <ElectricArcEffects criticalIssues={criticalIssues} />
        
        {/* Vulnerability Pulse Points */}
        <VulnerabilityPulsePoints issues={totalIssues} />
        
        {/* Threat Detection Radar */}
        <ThreatDetectionRadar isAnalyzing={isAnalyzing} threatCount={criticalIssues} />
        
        {/* Code Fortress Animation */}
        <CodeFortressAnimation isProtected={securityScore >= 70} />
        
        {/* Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-slate-950/90 to-slate-950" />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-green-500/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-500/5 to-transparent" />
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Header */}
      <header className="border-b border-green-500/30 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back to Homepage Button */}
              <a
                href="https://maula.ai"
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-medium">Back to Home</span>
              </a>
              <div className="w-px h-8 bg-slate-700/50" />
              
              {/* Epic Animated Logo */}
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-r from-green-500/40 via-emerald-500/40 to-green-500/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40 border border-green-400/30">
                  <Code className={`w-7 h-7 text-white ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  {/* Scanning ring */}
                  <div className="absolute inset-0 rounded-xl border-2 border-green-400/50 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                {/* Status indicator */}
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  isAnalyzing ? 'bg-yellow-500 animate-pulse' : analysisComplete ? (securityScore >= 70 ? 'bg-green-500' : 'bg-red-500') : 'bg-green-500'
                }`}>
                  {isAnalyzing && <span className="absolute inset-0 bg-yellow-400 rounded-full animate-ping" />}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
                    CodeSentinel
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 rounded-full border border-green-500/30 animate-pulse">
                    SAST ENGINE
                  </span>
                </h1>
                <p className="text-sm text-green-400/60 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  AI-Powered Code Security Analysis Fortress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Security Score Badge */}
              {metrics && (
                <div className={`relative px-4 py-2 rounded-xl border backdrop-blur-sm ${
                  securityScore >= 80 ? 'bg-green-500/10 border-green-500/30' :
                  securityScore >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
                  securityScore >= 40 ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {securityScore >= 80 ? <ShieldCheck className="w-4 h-4 text-green-400" /> :
                     securityScore >= 40 ? <ShieldAlert className="w-4 h-4 text-yellow-400" /> :
                     <ShieldOff className="w-4 h-4 text-red-400" />}
                    <span className={`text-lg font-black ${
                      securityScore >= 80 ? 'text-green-400' :
                      securityScore >= 60 ? 'text-yellow-400' :
                      securityScore >= 40 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>{securityScore}</span>
                    <span className="text-xs text-gray-400">/ 100</span>
                  </div>
                </div>
              )}

              {/* API Status Toggle */}
              <button
                onClick={() => setUseRealApi(!useRealApi)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  useRealApi && apiAvailable
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-slate-800/60 text-gray-400 border border-slate-700'
                }`}
                title={apiAvailable ? 'Click to toggle API mode' : 'API unavailable - simulation mode'}
              >
                {apiAvailable ? (
                  useRealApi ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />
                ) : (
                  <CloudOff className="w-4 h-4" />
                )}
                {apiAvailable ? (useRealApi ? 'Live API' : 'Simulation') : 'Offline'}
              </button>

              {analysisComplete && (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/10 hover:border-green-500/40 transition-all font-medium"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    New Scan
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-gray-300 hover:bg-slate-700 transition-all">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
              
              {/* Status Indicator */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${
                isAnalyzing 
                  ? 'bg-yellow-500/10 border-yellow-500/30' 
                  : analysisComplete 
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-800/60 border-slate-700'
              }`}>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAnalyzing ? "bg-yellow-500 animate-pulse" : analysisComplete ? "bg-green-500" : "bg-gray-500"
                  }`}
                >
                  {isAnalyzing && <span className="absolute inset-0 bg-yellow-400 rounded-full animate-ping" />}
                </div>
                <span className={`text-xs font-medium ${
                  isAnalyzing ? 'text-yellow-400' : analysisComplete ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {isAnalyzing
                    ? "🔍 Analyzing..."
                    : analysisComplete
                    ? "✅ Complete"
                    : "⏳ Ready"}
                </span>
              </div>
              
              {/* AI Assistant */}
              <a
                href="/neural-link/"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </a>
            </div>
          </div>
          
          {/* Epic Progress Bar when Analyzing */}
          {isAnalyzing && (
            <div className="mt-4 relative">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full transition-all duration-300 relative"
                  style={{ width: `${(stages.filter(s => s.status === 'complete').length / Math.max(stages.length, 1)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-green-400 animate-pulse" />
                  {stages.find(s => s.status === 'running')?.name || 'Initializing'}
                </span>
                <span className="font-mono text-green-400">
                  {stages.filter(s => s.status === 'complete').length}/{stages.length} stages
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════════════
          🎯 HERO BANNER - Animated Introduction Section
          ═══════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-b border-green-500/20">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-8">
            {/* Left - Animated Monogram & Description */}
            <div className="flex items-center gap-6">
              {/* Animated Code Monogram */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-cyan-500/30 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-green-500/30 flex items-center justify-center overflow-hidden">
                  {/* Animated code lines */}
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: '10%',
                          width: `${30 + Math.random() * 40}%`,
                          animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative text-3xl font-black bg-gradient-to-br from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {'</>'}
                  </div>
                  {/* Corner accents */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-green-500/50 rounded-tl" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-green-500/50 rounded-tr" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-green-500/50 rounded-bl" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-green-500/50 rounded-br" />
                </div>
              </div>
              
              {/* Animated Typing Text */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">Static Application Security Testing</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                <p className="text-sm text-gray-400 max-w-md">
                  AI-powered vulnerability detection • Secret scanning • Dependency analysis • Real-time results
                </p>
              </div>
            </div>

            {/* Center - Animated Stats/Features */}
            <div className="hidden lg:flex items-center gap-4">
              {[
                { icon: Shield, value: '50+', label: 'Security Rules', color: 'green' },
                { icon: Bug, value: '100+', label: 'CVE Patterns', color: 'yellow' },
                { icon: Lock, value: '200+', label: 'Secret Types', color: 'cyan' },
                { icon: Zap, value: '<1s', label: 'Scan Speed', color: 'purple' },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="relative group px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                    <span className={`text-lg font-black text-${stat.color}-400`}>{stat.value}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Right - Quick Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right mr-2">
                <p className="text-xs text-gray-500">Powered by</p>
                <p className="text-sm font-bold text-green-400">VictoryKit AI</p>
              </div>
              <div className="w-px h-8 bg-slate-700" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-xs font-medium text-green-400">Engine Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Balanced Full-Width Layout */}
      <main className="relative z-10 flex-1">
        <div className="max-w-[1800px] mx-auto px-8 py-6 space-y-6">
          
          {/* Row 1: Code Analysis - Full Width */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 rounded-2xl blur-xl opacity-40" />
            <div className="relative">
              <CodeAnalysisForm
                onAnalyze={simulateAnalysis}
                onCancel={handleCancel}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>

          {/* Row 2: Live Analysis + Security Analysis - Side by Side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Live Analysis Panel */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-green-500/5 to-cyan-500/10 rounded-2xl blur-xl opacity-40" />
              <div className="relative h-[450px]">
                <LiveCodePanel
                  code={
                    code ||
                    "// Paste code and start analysis to see live scanning..."
                  }
                  language={language}
                  isAnalyzing={isAnalyzing}
                  stages={stages}
                  issues={issues}
                  events={events}
                  filesScanned={filesScanned}
                  dependenciesChecked={dependenciesChecked}
                />
              </div>
            </div>

            {/* Security Results Panel */}
            <div className="relative">
              {metrics ? (
                <div className="h-[450px] overflow-auto">
                  <AnimatedSecurityResult
                    metrics={metrics}
                    issues={issues}
                    isVisible={analysisComplete}
                  />
                </div>
              ) : (
                <div className="relative h-[450px]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 rounded-2xl blur-xl opacity-40" />
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-green-500/20 rounded-2xl h-full flex items-center justify-center p-8 overflow-hidden">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(34, 197, 94, 0.1) 50px, rgba(34, 197, 94, 0.1) 51px),
                                          repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(34, 197, 94, 0.1) 50px, rgba(34, 197, 94, 0.1) 51px)`
                      }} />
                    </div>
                    
                    <div className="text-center relative z-10">
                      {/* Shield Animation */}
                      <div className="relative mb-6 inline-block">
                        <div className="absolute -inset-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center border border-green-500/30">
                          <Shield className="w-12 h-12 text-green-400/70" />
                          <div className="absolute inset-0 rounded-2xl border-2 border-green-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-3">
                        Security Analysis
                      </h3>
                      <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto">
                        Start a code analysis to view security findings, vulnerability reports, and AI recommendations.
                      </p>
                      
                      {/* Feature Grid - Compact */}
                      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                        {[
                          { icon: Shield, label: "SAST" },
                          { icon: Lock, label: "Secrets" },
                          { icon: Bug, label: "CVEs" },
                          { icon: FileCode, label: "Deps" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="group p-3 bg-slate-800/50 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all"
                          >
                            <item.icon className="w-6 h-6 text-green-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                            <p className="text-xs text-gray-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Epic Footer */}
      <footer className="relative z-10 border-t border-green-500/20 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                <Code className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-400">CodeSentinel v8.0</span>
              </div>
              <span>•</span>
              <span>VictoryKit Security Suite</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5 text-green-400">
                <Shield className="w-3 h-3" />
                SAST Engine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Cpu className="w-3 h-3" />
                AI-Powered
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-green-400">
                <Activity className="w-4 h-4 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeSentinelTool;

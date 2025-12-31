import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Cpu,
  Globe,
  Fingerprint,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Activity,
  Eye,
  Network,
  Timer,
  TrendingUp,
  Scan,
  Radio,
} from "lucide-react";

interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "complete" | "warning" | "error";
  result?: string;
  duration?: number;
  details?: string[];
  score?: number;
}

interface LiveAnalysisPanelProps {
  isAnalyzing: boolean;
  transactionData?: any;
  onComplete?: (result: any) => void;
}

const ANALYSIS_STEPS: Omit<AnalysisStep, "status">[] = [
  {
    id: "init",
    name: "Initializing Scan",
    description: "Preparing fraud detection engines...",
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    id: "ip_check",
    name: "IP Address Analysis",
    description: "Checking IP reputation and geolocation...",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    id: "device",
    name: "Device Fingerprint",
    description: "Analyzing device signature and history...",
    icon: <Fingerprint className="w-5 h-5" />,
  },
  {
    id: "velocity",
    name: "Velocity Check",
    description: "Checking transaction frequency patterns...",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: "behavior",
    name: "Behavioral Analysis",
    description: "Comparing against user behavior profile...",
    icon: <Eye className="w-5 h-5" />,
  },
  {
    id: "network",
    name: "Network Analysis",
    description: "Analyzing connection patterns and proxies...",
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: "ml_model",
    name: "ML Model Inference",
    description: "Running neural network prediction...",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: "rules",
    name: "Rule Engine",
    description: "Evaluating custom fraud rules...",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "scoring",
    name: "Risk Scoring",
    description: "Calculating final fraud score...",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    id: "complete",
    name: "Analysis Complete",
    description: "Generating comprehensive report...",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
];

// Simulated results for each step
const STEP_RESULTS = {
  init: [
    "Loaded 12 detection modules",
    "Connected to ML Engine",
    "Cache warmed up",
  ],
  ip_check: [
    "IP: Clean reputation",
    "Location: Matched billing",
    "VPN: Not detected",
  ],
  device: ["Device: Previously seen", "Browser: Chrome 120", "OS: Windows 11"],
  velocity: ["24h transactions: 2", "Weekly average: 3.5", "Pattern: Normal"],
  behavior: [
    "Session duration: 12m",
    "Navigation: Organic",
    "Mouse patterns: Human",
  ],
  network: ["Proxy: None detected", "TOR: No", "Datacenter IP: No"],
  ml_model: ["Model: FraudNet v3.2", "Confidence: 94.2%", "Latency: 23ms"],
  rules: ["Rules checked: 47", "Triggers: 0", "Custom rules: Passed"],
  scoring: ["Base score: 15", "Risk factors: +8", "Mitigations: -5"],
  complete: ["Total checks: 127", "Anomalies: 1", "Report generated"],
};

export const LiveAnalysisPanel: React.FC<LiveAnalysisPanelProps> = ({
  isAnalyzing,
  transactionData,
  onComplete,
}) => {
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [scanLines, setScanLines] = useState<number[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize steps when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setSteps(ANALYSIS_STEPS.map((step) => ({ ...step, status: "pending" })));
      setCurrentStep(0);
      setLogs([]);
      setProgress(0);
      addLog("🚀 Starting fraud analysis pipeline...");
      addLog(`📋 Transaction: ${transactionData?.transaction_id || "N/A"}`);
      addLog(
        `💰 Amount: ${transactionData?.currency || "USD"} ${
          transactionData?.amount || 0
        }`
      );
    }
  }, [isAnalyzing, transactionData]);

  // Process steps sequentially
  useEffect(() => {
    if (!isAnalyzing || currentStep < 0 || currentStep >= steps.length) return;

    const processStep = async () => {
      // Start current step
      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep ? { ...s, status: "running" } : s
        )
      );

      const stepKey = steps[currentStep]?.id as keyof typeof STEP_RESULTS;
      addLog(`\n⚡ ${steps[currentStep]?.name}...`);

      // Simulate processing with random delay
      const processingTime = 300 + Math.random() * 700;
      await new Promise((resolve) => setTimeout(resolve, processingTime));

      // Add result logs
      const results = STEP_RESULTS[stepKey] || [];
      for (const result of results) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        addLog(`   ✓ ${result}`);
      }

      // Determine step status (mostly success, occasional warning)
      const status = Math.random() > 0.15 ? "complete" : "warning";
      const stepScore = Math.floor(Math.random() * 15);

      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentStep
            ? {
                ...s,
                status,
                duration: Math.round(processingTime),
                details: results,
                score: stepScore,
              }
            : s
        )
      );

      // Update progress
      const newProgress = ((currentStep + 1) / steps.length) * 100;
      setProgress(newProgress);

      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Analysis complete
        addLog("\n✅ Analysis complete! Generating final report...");
        onComplete?.({
          score: Math.floor(Math.random() * 40) + 10,
          risk_level: "low",
          confidence: 94.2,
          indicators: [],
          recommendation:
            "Transaction appears legitimate. Recommend approval with standard monitoring.",
        });
      }
    };

    processStep();
  }, [currentStep, isAnalyzing]);

  // Animate scan lines
  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setScanLines((prev) => {
        const newLines = prev.map((l) => l + 2).filter((l) => l < 100);
        if (Math.random() > 0.7) newLines.push(0);
        return newLines;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const getStatusIcon = (status: AnalysisStep["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
      default:
        return (
          <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
        );
    }
  };

  const getStatusColor = (status: AnalysisStep["status"]) => {
    switch (status) {
      case "complete":
        return "border-green-500/50 bg-green-500/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "error":
        return "border-red-500/50 bg-red-500/10";
      case "running":
        return "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20";
      default:
        return "border-gray-700 bg-gray-800/30";
    }
  };

  if (!isAnalyzing && steps.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-8 text-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block">
            <Scan className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <div className="absolute inset-0 animate-ping">
              <Scan className="w-20 h-20 text-red-400 opacity-30" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Ready for Analysis
          </h3>
          <p className="text-gray-400 mb-4">
            Submit a transaction to see real-time fraud detection in action
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>AI-Powered Detection Engine Standing By</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden relative">
      {/* Scan line animation */}
      {isAnalyzing &&
        scanLines.map((pos, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 pointer-events-none z-50"
            style={{ top: `${pos}%` }}
          />
        ))}

      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 border-b border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-red-400" />
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Live Fraud Analysis
              </h2>
              <p className="text-sm text-gray-400">
                Real-time detection pipeline
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400 tabular-nums">
                {Math.round(progress)}%
              </div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-700"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-cyan-500 transition-all duration-500"
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="36"
                  cx="48"
                  cy="48"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 36}`,
                    strokeDashoffset: `${
                      2 * Math.PI * 36 * (1 - progress / 100)
                    }`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {isAnalyzing ? (
                  <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="p-4 border-b border-red-500/20 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${getStatusColor(
                step.status
              )}`}
            >
              {/* Step indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === "running" ? (
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 animate-pulse" />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      step.status === "complete"
                        ? "bg-green-500/20 text-green-400"
                        : step.status === "warning"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : step.status === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-700/50 text-gray-500"
                    }`}
                  >
                    {step.icon}
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-sm ${
                        step.status === "running"
                          ? "text-cyan-300"
                          : step.status === "complete"
                          ? "text-green-300"
                          : step.status === "pending"
                          ? "text-gray-500"
                          : "text-white"
                      }`}
                    >
                      {step.name}
                    </span>
                    {getStatusIcon(step.status)}
                  </div>
                  {step.duration && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {step.duration}ms
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-0.5">
                  {step.status === "running" ? (
                    <span className="text-cyan-400 animate-pulse">
                      {step.description}
                    </span>
                  ) : (
                    step.description
                  )}
                </p>

                {/* Step details */}
                {step.details && step.details.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {step.details.map((detail, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-slate-900/50 text-gray-400"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Logs Terminal */}
      <div className="bg-slate-900/80">
        <div className="flex items-center justify-between px-4 py-2 border-b border-red-500/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-500 font-mono ml-2">
              analysis.log
            </span>
          </div>
          <span className="text-xs text-gray-600">{logs.length} entries</span>
        </div>

        <div className="p-4 font-mono text-xs max-h-[200px] overflow-y-auto bg-black/30">
          <pre className="text-green-400 whitespace-pre-wrap">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes("✓")
                    ? "text-green-400"
                    : log.includes("⚡")
                    ? "text-cyan-400"
                    : log.includes("✅")
                    ? "text-green-500 font-bold"
                    : log.includes("🚀")
                    ? "text-yellow-400"
                    : "text-gray-400"
                }`}
              >
                {log}
              </div>
            ))}
            {isAnalyzing && (
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
            )}
          </pre>
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LiveAnalysisPanel;

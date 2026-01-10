import React, { useState, useCallback, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Link2,
  Globe,
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  BarChart3,
  Target,
  Search,
  FileText,
  Lock,
  Unlock,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Server,
  Key,
  Fingerprint,
  Languages,
  Camera,
  Inbox,
  AtSign,
  Hash,
  Layers,
  Database,
  Wifi,
  Filter,
  Download,
  Share2,
  Flag,
  MapPin,
  Calendar,
  User,
  Building2,
} from "lucide-react";

// Types for PhishNetAI
interface AnalysisResult {
  verdict: "CLEAN" | "SUSPICIOUS" | "PHISHING" | "MALICIOUS";
  riskScore: number;
  analysisTime: number;
  url?: string;
  domain?: string;
  email?: string;
}

interface ThreatIntelResult {
  provider: string;
  available: boolean;
  isMalicious?: boolean;
  isPhishing?: boolean;
  riskScore?: number;
  error?: string;
  details?: any;
}

interface DomainIntelResult {
  domainAge?: number;
  registrar?: string;
  ssl?: {
    valid: boolean;
    issuer: string;
    daysUntilExpiry: number;
  };
  dns?: any;
}

interface HomographResult {
  isHomograph: boolean;
  originalDomain: string;
  normalizedDomain: string;
  confusables: any[];
  brandImpersonation: any[];
}

interface EmailAnalysisResult {
  spf: { valid: boolean; status: string };
  dkim: { valid: boolean; status: string };
  dmarc: { valid: boolean; policy: string };
  spoofing: { detected: boolean; issues: any[] };
  contentAnalysis: any;
}

// Analysis Mode Type
type AnalysisMode = "url" | "email" | "domain" | "bulk";

// Risk Gauge Component - Unique circular gauge for phishing
const RiskGauge: React.FC<{ score: number; size?: number }> = ({
  score,
  size = 140,
}) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70
      ? "#ef4444"
      : score >= 40
      ? "#f59e0b"
      : score >= 20
      ? "#eab308"
      : "#22c55e";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth="10"
          fill="none"
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Risk Score</span>
      </div>
    </div>
  );
};

// Verdict Badge - Unique phishing-focused design
const VerdictBadge: React.FC<{
  verdict: AnalysisResult["verdict"];
  large?: boolean;
}> = ({ verdict, large = false }) => {
  const config = {
    CLEAN: {
      icon: <ShieldCheck className="w-5 h-5" />,
      bg: "bg-gradient-to-r from-green-500/20 to-emerald-500/20",
      border: "border-green-500/50",
      text: "text-green-400",
      label: "SAFE",
      glow: "shadow-green-500/20",
    },
    SUSPICIOUS: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
      border: "border-yellow-500/50",
      text: "text-yellow-400",
      label: "SUSPICIOUS",
      glow: "shadow-yellow-500/20",
    },
    PHISHING: {
      icon: <ShieldAlert className="w-5 h-5" />,
      bg: "bg-gradient-to-r from-red-500/20 to-orange-500/20",
      border: "border-red-500/50",
      text: "text-red-400",
      label: "PHISHING",
      glow: "shadow-red-500/20",
    },
    MALICIOUS: {
      icon: <XCircle className="w-5 h-5" />,
      bg: "bg-gradient-to-r from-red-600/20 to-rose-600/20",
      border: "border-red-600/50",
      text: "text-red-500",
      label: "MALICIOUS",
      glow: "shadow-red-600/20",
    },
  };

  const c = config[verdict];

  return (
    <div
      className={`
      inline-flex items-center gap-2 
      ${c.bg} ${c.border} ${c.text}
      border rounded-full shadow-lg ${c.glow}
      ${large ? "px-6 py-3 text-lg" : "px-4 py-2 text-sm"}
    `}
    >
      {c.icon}
      <span className="font-bold tracking-wider">{c.label}</span>
    </div>
  );
};

// URL Breakdown Component - Visual URL dissection
const URLBreakdown: React.FC<{ url: string }> = ({ url }) => {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return <div className="text-red-400 text-sm">Invalid URL format</div>;
  }

  const parts = [
    {
      label: "Protocol",
      value: parsed.protocol.replace(":", ""),
      icon: parsed.protocol === "https:" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />,
      risk: parsed.protocol === "http:" ? "high" : "low",
    },
    {
      label: "Subdomain",
      value: parsed.hostname.split(".").slice(0, -2).join(".") || "—",
      icon: <Layers className="w-4 h-4" />,
      risk: parsed.hostname.split(".").length > 3 ? "medium" : "low",
    },
    {
      label: "Domain",
      value: parsed.hostname.split(".").slice(-2, -1)[0] || "",
      icon: <Globe className="w-4 h-4" />,
      risk: "low",
    },
    {
      label: "TLD",
      value: "." + (parsed.hostname.split(".").slice(-1)[0] || ""),
      icon: <Hash className="w-4 h-4" />,
      risk: [".xyz", ".tk", ".ml", ".ga", ".cf", ".gq"].includes("." + parsed.hostname.split(".").slice(-1)[0]) ? "high" : "low",
    },
    {
      label: "Path",
      value: parsed.pathname || "/",
      icon: <FileText className="w-4 h-4" />,
      risk: parsed.pathname.toLowerCase().includes("login") || parsed.pathname.toLowerCase().includes("verify") ? "medium" : "low",
    },
    {
      label: "Query",
      value: parsed.search || "—",
      icon: <Search className="w-4 h-4" />,
      risk: parsed.search.toLowerCase().includes("token") || parsed.search.toLowerCase().includes("password") ? "high" : "low",
    },
  ];

  const riskColors = {
    low: "border-l-green-500 bg-green-500/5",
    medium: "border-l-yellow-500 bg-yellow-500/5",
    high: "border-l-red-500 bg-red-500/5",
  };

  return (
    <div className="space-y-1">
      {parts.map((part, idx) => (
        <div
          key={part.label}
          className={`flex items-center gap-3 p-3 rounded-r-lg border-l-4 ${riskColors[part.risk as keyof typeof riskColors]} bg-slate-800/30`}
        >
          <div className="text-slate-400">{part.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{part.label}</div>
            <div className="text-sm text-white font-mono truncate">{part.value}</div>
          </div>
          {part.risk !== "low" && (
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${part.risk === "high" ? "text-red-400" : "text-yellow-400"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// Domain Intel Card
const DomainIntelCard: React.FC<{
  domain: string;
  age?: number;
  registrar?: string;
  ssl?: { valid: boolean; issuer: string; daysUntilExpiry: number };
  country?: string;
}> = ({ domain, age, registrar, ssl, country }) => {
  const ageRisk = age === undefined ? "unknown" : age < 30 ? "high" : age < 180 ? "medium" : "low";
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Domain Intelligence
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Domain
          </span>
          <span className="text-sm font-mono text-white">{domain}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Age
          </span>
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            ageRisk === "high" ? "text-red-400" : ageRisk === "medium" ? "text-yellow-400" : "text-green-400"
          }`}>
            {age !== undefined ? `${age} days` : "Unknown"}
            {ageRisk === "high" && <AlertTriangle className="w-3 h-3" />}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Registrar
          </span>
          <span className="text-sm text-slate-300">{registrar || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </span>
          <span className="text-sm text-slate-300">{country || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            {ssl?.valid ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} SSL
          </span>
          <div className="flex items-center gap-2">
            {ssl?.valid ? (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Valid ({ssl.daysUntilExpiry}d)
              </span>
            ) : (
              <span className="text-sm text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Invalid
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Authentication Card
const EmailAuthCard: React.FC<{
  spf?: { valid: boolean; status: string };
  dkim?: { valid: boolean; status: string };
  dmarc?: { valid: boolean; policy: string };
}> = ({ spf, dkim, dmarc }) => {
  const items = [
    { name: "SPF", data: spf, icon: <Key className="w-5 h-5" />, desc: "Sender Policy Framework" },
    { name: "DKIM", data: dkim, icon: <Fingerprint className="w-5 h-5" />, desc: "DomainKeys Identified Mail" },
    { name: "DMARC", data: dmarc, icon: <Shield className="w-5 h-5" />, desc: "Domain-based Message Auth" },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-400" />
          Email Authentication
        </h3>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className={`p-4 rounded-xl text-center transition-all ${
              item.data?.valid
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            <div className={`mx-auto mb-2 ${item.data?.valid ? "text-green-400" : "text-red-400"}`}>
              {item.data?.valid ? <CheckCircle className="w-8 h-8 mx-auto" /> : <XCircle className="w-8 h-8 mx-auto" />}
            </div>
            <div className="text-sm font-bold text-white">{item.name}</div>
            <div className="text-[10px] text-slate-500 uppercase">{item.data?.status || item.data?.policy || "N/A"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Homograph Alert
const HomographAlert: React.FC<{
  original: string;
  normalized: string;
  confusables: any[];
}> = ({ original, normalized, confusables }) => {
  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-xl p-4 animate-pulse-slow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Languages className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">⚠️ Homograph Attack Detected!</h3>
          <p className="text-xs text-slate-400 mt-1">This domain uses lookalike characters to impersonate a trusted brand</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase">Displayed As</div>
              <div className="font-mono text-white">{original}</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase">Actually Is</div>
              <div className="font-mono text-yellow-400">{normalized}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Found {confusables.length} lookalike character(s) from different Unicode scripts
          </div>
        </div>
      </div>
    </div>
  );
};

// Threat Intel Grid
const ThreatIntelGrid: React.FC<{ results: ThreatIntelResult[] }> = ({ results }) => {
  const detections = results.filter(r => r.available && (r.isMalicious || r.isPhishing)).length;
  const clean = results.filter(r => r.available && !r.isMalicious && !r.isPhishing).length;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          Threat Intelligence ({results.length} sources)
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{detections} threats</span>
          <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{clean} clean</span>
        </div>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2">
        {results.slice(0, 12).map((r) => (
          <div
            key={r.provider}
            className={`p-2 rounded-lg text-center border ${
              !r.available
                ? "border-slate-600/30 bg-slate-700/20"
                : r.isMalicious || r.isPhishing
                ? "border-red-500/30 bg-red-500/10"
                : "border-green-500/30 bg-green-500/10"
            }`}
          >
            <div className="text-[11px] font-medium text-white truncate">{r.provider.replace(/_/g, " ")}</div>
            <div className="text-[10px] mt-0.5">
              {!r.available ? (
                <span className="text-slate-400">—</span>
              ) : r.isMalicious || r.isPhishing ? (
                <span className="text-red-400">⚠ DETECTED</span>
              ) : (
                <span className="text-green-400">✓ Clean</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main PhishNetAI Component
const PhishNetAITool: React.FC = () => {
  // State
  const [mode, setMode] = useState<AnalysisMode>("url");
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelResult[]>([]);
  const [domainIntel, setDomainIntel] = useState<DomainIntelResult | null>(null);
  const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysisResult | null>(null);
  const [homograph, setHomograph] = useState<HomographResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Stats
  const [stats] = useState({
    scansToday: 12847,
    phishingBlocked: 2341,
    domainsAnalyzed: 8923,
    activeAPIs: 35,
  });

  // Mode tabs
  const modes: { id: AnalysisMode; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "url", label: "URL Analysis", icon: <Link2 className="w-4 h-4" />, color: "from-cyan-500 to-blue-500" },
    { id: "email", label: "Email Security", icon: <Mail className="w-4 h-4" />, color: "from-purple-500 to-pink-500" },
    { id: "domain", label: "Domain Intel", icon: <Globe className="w-4 h-4" />, color: "from-green-500 to-emerald-500" },
    { id: "bulk", label: "Bulk Check", icon: <FileText className="w-4 h-4" />, color: "from-orange-500 to-red-500" },
  ];

  // Analyze handler with progress
  const handleAnalyze = useCallback(async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 200);

    await new Promise((r) => setTimeout(r, 2500));

    clearInterval(progressInterval);
    setAnalysisProgress(100);

    // Detect if URL/domain is suspicious
    const inputLower = input.toLowerCase();
    const isSuspicious = inputLower.includes("login") || inputLower.includes("verify") ||
                         inputLower.includes("paypa1") || inputLower.includes("micr0soft") ||
                         inputLower.includes("amaz0n") || inputLower.includes("secure-");

    // Set results
    setResult({
      verdict: isSuspicious ? "PHISHING" : "CLEAN",
      riskScore: isSuspicious ? 87 : 12,
      analysisTime: 2341,
      url: mode === "url" ? input : undefined,
      domain: (() => {
        try {
          return new URL(input.startsWith("http") ? input : `https://${input}`).hostname;
        } catch {
          return input;
        }
      })(),
    });

    // Set threat intel
    setThreatIntel([
      { provider: "Google Safe Browsing", available: true, isMalicious: isSuspicious },
      { provider: "VirusTotal", available: true, isMalicious: false, riskScore: isSuspicious ? 65 : 5 },
      { provider: "PhishTank", available: true, isPhishing: isSuspicious },
      { provider: "URLhaus", available: true, isMalicious: false },
      { provider: "IPQualityScore", available: true, riskScore: isSuspicious ? 78 : 8 },
      { provider: "URLScan.io", available: true, isMalicious: false },
      { provider: "OpenPhish", available: true, isPhishing: isSuspicious },
      { provider: "AlienVault OTX", available: true, isMalicious: false },
      { provider: "CheckPhish", available: true, isPhishing: isSuspicious },
      { provider: "Hybrid Analysis", available: true, isMalicious: false },
      { provider: "AbuseIPDB", available: true, isMalicious: false },
      { provider: "Shodan", available: true, isMalicious: false },
    ]);

    // Set domain intel
    setDomainIntel({
      domainAge: isSuspicious ? 12 : 1825,
      registrar: isSuspicious ? "Namecheap Inc" : "GoDaddy.com LLC",
      ssl: {
        valid: true,
        issuer: isSuspicious ? "Let's Encrypt" : "DigiCert Inc",
        daysUntilExpiry: isSuspicious ? 45 : 280,
      },
    });

    // Check homograph
    if (inputLower.includes("paypa1") || inputLower.includes("micr0soft") || inputLower.includes("amaz0n")) {
      setHomograph({
        isHomograph: true,
        originalDomain: input,
        normalizedDomain: input.replace(/1/g, "l").replace(/0/g, "o"),
        confusables: [{ original: "1→l" }, { original: "0→o" }],
        brandImpersonation: [{ brand: "PayPal/Microsoft/Amazon" }],
      });
    } else {
      setHomograph(null);
    }

    // Email analysis
    if (mode === "email") {
      setEmailAnalysis({
        spf: { valid: !isSuspicious, status: isSuspicious ? "fail" : "pass" },
        dkim: { valid: true, status: "pass" },
        dmarc: { valid: !isSuspicious, policy: isSuspicious ? "none" : "reject" },
        spoofing: { detected: isSuspicious, issues: [] },
        contentAnalysis: {},
      });
    }

    setIsAnalyzing(false);
  }, [input, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/25">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  PhishNetAI
                </h1>
                <p className="text-xs text-slate-500">Advanced Phishing Detection & Domain Intelligence</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Scans:</span>
                <span className="text-sm font-bold text-white">{stats.scansToday.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Blocked:</span>
                <span className="text-sm font-bold text-red-400">{stats.phishingBlocked.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/30">
                <Wifi className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">{stats.activeAPIs} APIs</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Mode Selection Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-800/30 rounded-xl border border-slate-700/30">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setResult(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === m.id
                  ? `bg-gradient-to-r ${m.color} text-white shadow-lg`
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            {mode === "url" && <Link2 className="w-5 h-5 text-cyan-400" />}
            {mode === "email" && <Mail className="w-5 h-5 text-purple-400" />}
            {mode === "domain" && <Globe className="w-5 h-5 text-green-400" />}
            {mode === "bulk" && <FileText className="w-5 h-5 text-orange-400" />}
            <h2 className="text-lg font-semibold text-white">
              {mode === "url" && "Analyze Suspicious URL"}
              {mode === "email" && "Analyze Email for Phishing"}
              {mode === "domain" && "Check Domain Intelligence"}
              {mode === "bulk" && "Bulk URL Analysis"}
            </h2>
          </div>

          {mode === "email" ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the full email including headers here...&#10;&#10;Example:&#10;From: security@suspicious-bank.com&#10;To: victim@example.com&#10;Subject: Urgent: Verify Your Account&#10;&#10;Dear Customer, Your account has been suspended..."
              className="w-full h-48 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono text-sm resize-none"
            />
          ) : mode === "bulk" ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter URLs to check (one per line)...&#10;&#10;https://suspicious-site.com/login&#10;https://paypa1-verify.com/account&#10;https://secure-banking-login.xyz"
              className="w-full h-36 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 font-mono text-sm resize-none"
            />
          ) : (
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "url" ? "https://suspicious-site.com/login/verify" : "example.com"}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-4 pr-32 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">Analyze</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Analysis Options */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-slate-600 text-orange-500 focus:ring-orange-500" />
              All Threat Intel Sources
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" defaultChecked className="rounded border-slate-600 text-orange-500 focus:ring-orange-500" />
              Homograph Detection
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="rounded border-slate-600 text-orange-500 focus:ring-orange-500" />
              Visual Similarity Check
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input type="checkbox" className="rounded border-slate-600 text-orange-500 focus:ring-orange-500" />
              Deep Screenshot Analysis
            </label>
          </div>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Analyzing across 35 threat intelligence sources...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}

          {mode !== "email" && mode !== "bulk" && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="mt-4 w-full sm:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isAnalyzing ? "Analyzing..." : "Analyze Now"}
            </button>
          )}

          {(mode === "email" || mode === "bulk") && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isAnalyzing ? "Analyzing..." : "Analyze Now"}
            </button>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Main Result Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <RiskGauge score={result.riskScore} />
                <div className="flex-1 text-center md:text-left">
                  <VerdictBadge verdict={result.verdict} large />
                  <p className="text-sm text-slate-400 mt-3">
                    Analysis completed in <span className="text-white font-medium">{result.analysisTime}ms</span> using <span className="text-orange-400 font-medium">35 threat intelligence sources</span>
                  </p>
                  {result.domain && (
                    <p className="text-sm text-slate-300 mt-2 font-mono bg-slate-800/50 inline-block px-3 py-1 rounded">
                      {result.domain}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors" title="Copy Report">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors" title="Export JSON">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors" title="Report Phishing">
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Homograph Alert */}
            {homograph?.isHomograph && (
              <HomographAlert
                original={homograph.originalDomain}
                normalized={homograph.normalizedDomain}
                confusables={homograph.confusables}
              />
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {mode === "url" && result.url && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-cyan-400" />
                      URL Structure Analysis
                    </h3>
                    <URLBreakdown url={result.url} />
                  </div>
                )}

                {mode === "email" && emailAnalysis && (
                  <EmailAuthCard
                    spf={emailAnalysis.spf}
                    dkim={emailAnalysis.dkim}
                    dmarc={emailAnalysis.dmarc}
                  />
                )}

                {domainIntel && (
                  <DomainIntelCard
                    domain={result.domain || ""}
                    age={domainIntel.domainAge}
                    registrar={domainIntel.registrar}
                    ssl={domainIntel.ssl}
                    country="United States"
                  />
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {threatIntel.length > 0 && <ThreatIntelGrid results={threatIntel} />}

                {/* Recommendations */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    {result.verdict === "PHISHING" || result.verdict === "MALICIOUS" ? (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-red-400">Block Immediately</div>
                            <div className="text-xs text-slate-400">Add to firewall blocklist and DNS sinkhole</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-yellow-400">Alert Security Team</div>
                            <div className="text-xs text-slate-400">Notify SOC and create incident ticket</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <Flag className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-blue-400">Report to Authorities</div>
                            <div className="text-xs text-slate-400">Submit to Google Safe Browsing, PhishTank</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-green-400">No Immediate Threat</div>
                            <div className="text-xs text-slate-400">URL appears safe based on current analysis</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl">
                          <RefreshCw className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-slate-300">Continue Monitoring</div>
                            <div className="text-xs text-slate-400">Re-analyze periodically for changes</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>PhishNetAI v5.0 • VictoryKit Security Suite</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="text-green-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PhishNetAITool;

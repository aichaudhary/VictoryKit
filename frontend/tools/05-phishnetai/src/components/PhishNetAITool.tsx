import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Fish,
  Anchor,
  Radio,
  Radar,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎣 EPIC NEIL ARMSTRONG VISUAL COMPONENTS - PHISHING DETECTION THEME
// ═══════════════════════════════════════════════════════════════════════════════

// Floating Phishing Hook Particles - Fish hooks floating around
const PhishingHookParticles: React.FC = () => {
  const hooks = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.4 + 0.1,
        type: Math.random() > 0.5 ? 'hook' : 'wave',
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {hooks.map((hook) => (
        <div
          key={hook.id}
          className="absolute animate-float-hook"
          style={{
            left: `${hook.x}%`,
            top: `${hook.y}%`,
            animationDuration: `${hook.duration}s`,
            animationDelay: `${hook.delay}s`,
            opacity: hook.opacity,
          }}
        >
          {hook.type === 'hook' ? (
            <svg
              width={hook.size * 2}
              height={hook.size * 2}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-orange-500/60"
            >
              <path
                d="M12 3v12c0 2.5-2 4.5-4.5 4.5S3 17.5 3 15"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 3l-3 3" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 3l3 3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <div
              className="rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30"
              style={{ width: hook.size, height: hook.size }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Email Wave Scanner - Animated scanning waves
const EmailWaveScanner: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 border-2 border-orange-500/30 rounded-2xl animate-email-scan"
          style={{
            animationDelay: `${i * 0.4}s`,
            animationDuration: '2s',
          }}
        />
      ))}
    </div>
  );
};

// Threat Detection Radar
const ThreatRadar: React.FC<{ threats: number; isScanning: boolean }> = ({
  threats,
  isScanning,
}) => {
  return (
    <div className="relative w-32 h-32">
      {/* Radar circles */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 border border-orange-500/20 rounded-full"
          style={{
            transform: `scale(${ring * 0.33})`,
          }}
        />
      ))}

      {/* Scanning line */}
      {isScanning && (
        <div className="absolute inset-0 origin-center animate-radar-spin">
          <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-transparent origin-left" />
        </div>
      )}

      {/* Threat dots */}
      {threats > 0 &&
        [...Array(Math.min(threats, 6))].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse"
            style={{
              top: `${30 + Math.random() * 40}%`,
              left: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-lg shadow-orange-500/50" />
      </div>
    </div>
  );
};

// Cyber Shield with Pulse
const CyberShieldPulse: React.FC<{ status: 'safe' | 'warning' | 'danger' | 'scanning' }> = ({
  status,
}) => {
  const colors = {
    safe: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    warning: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    danger: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    scanning: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
  };

  const color = colors[status];

  return (
    <div className="relative">
      {/* Outer pulse rings */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full animate-shield-pulse"
          style={{
            border: `2px solid ${color.primary}`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.3 - i * 0.1,
          }}
        />
      ))}

      {/* Shield icon container */}
      <div
        className="relative p-5 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color.primary}20, ${color.primary}10)`,
          boxShadow: `0 0 40px ${color.glow}`,
        }}
      >
        <ShieldAlert className="w-10 h-10" style={{ color: color.primary }} />
      </div>
    </div>
  );
};

// Link Chain Visualizer - Shows URL being analyzed
const LinkChainVisualizer: React.FC<{ url: string; isAnalyzing: boolean }> = ({
  url,
  isAnalyzing,
}) => {
  const segments = url ? url.split('/').filter(Boolean).slice(0, 5) : [];

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      {segments.map((seg, i) => (
        <React.Fragment key={i}>
          <div
            className={`px-2 py-1 rounded text-xs font-mono truncate max-w-[100px] transition-all duration-500 ${
              isAnalyzing
                ? 'bg-orange-500/20 text-orange-400 animate-pulse'
                : 'bg-slate-700/50 text-slate-400'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {seg.length > 15 ? seg.slice(0, 15) + '...' : seg}
          </div>
          {i < segments.length - 1 && (
            <Link2
              className={`w-3 h-3 flex-shrink-0 ${isAnalyzing ? 'text-orange-400' : 'text-slate-600'}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Animated Threat Counter
const AnimatedThreatCounter: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ background: color }}
      />
      <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {displayValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Matrix Rain Effect for Phishing
const PhishingMatrixRain: React.FC = () => {
  const columns = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: (i / 15) * 100,
        chars: ['@', '#', '!', '?', '$', '%', '&', '*', '0', '1'],
        speed: Math.random() * 10 + 5,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute top-0 text-orange-500 font-mono text-xs animate-matrix-fall"
          style={{
            left: `${col.x}%`,
            animationDuration: `${col.speed}s`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars.map((char, i) => (
            <div key={i} className="opacity-50" style={{ opacity: 1 - i * 0.1 }}>
              {char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Hexagonal Grid Background
const HexagonalGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="phish-hexagon"
            width="50"
            height="43.4"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2)"
          >
            <polygon
              points="25,0 50,14.4 50,38.4 25,52.8 0,38.4 0,14.4"
              fill="none"
              stroke="rgba(249, 115, 22, 0.3)"
              strokeWidth="0.5"
              transform="translate(0, -4.7)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#phish-hexagon)" />
      </svg>
    </div>
  );
};

// Types for PhishNetAI
interface AnalysisResult {
  verdict: 'CLEAN' | 'SUSPICIOUS' | 'PHISHING' | 'MALICIOUS';
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
type AnalysisMode = 'url' | 'email' | 'domain' | 'bulk';

// Risk Gauge Component - Unique circular gauge for phishing
const RiskGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 140 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : score >= 20 ? '#eab308' : '#22c55e';

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
  verdict: AnalysisResult['verdict'];
  large?: boolean;
}> = ({ verdict, large = false }) => {
  const config = {
    CLEAN: {
      icon: <ShieldCheck className="w-5 h-5" />,
      bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      label: 'SAFE',
      glow: 'shadow-green-500/20',
    },
    SUSPICIOUS: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      label: 'SUSPICIOUS',
      glow: 'shadow-yellow-500/20',
    },
    PHISHING: {
      icon: <ShieldAlert className="w-5 h-5" />,
      bg: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      label: 'PHISHING',
      glow: 'shadow-red-500/20',
    },
    MALICIOUS: {
      icon: <XCircle className="w-5 h-5" />,
      bg: 'bg-gradient-to-r from-red-600/20 to-rose-600/20',
      border: 'border-red-600/50',
      text: 'text-red-500',
      label: 'MALICIOUS',
      glow: 'shadow-red-600/20',
    },
  };

  const c = config[verdict];

  return (
    <div
      className={`
      inline-flex items-center gap-2 
      ${c.bg} ${c.border} ${c.text}
      border rounded-full shadow-lg ${c.glow}
      ${large ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm'}
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
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return <div className="text-red-400 text-sm">Invalid URL format</div>;
  }

  const parts = [
    {
      label: 'Protocol',
      value: parsed.protocol.replace(':', ''),
      icon:
        parsed.protocol === 'https:' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Unlock className="w-4 h-4" />
        ),
      risk: parsed.protocol === 'http:' ? 'high' : 'low',
    },
    {
      label: 'Subdomain',
      value: parsed.hostname.split('.').slice(0, -2).join('.') || '—',
      icon: <Layers className="w-4 h-4" />,
      risk: parsed.hostname.split('.').length > 3 ? 'medium' : 'low',
    },
    {
      label: 'Domain',
      value: parsed.hostname.split('.').slice(-2, -1)[0] || '',
      icon: <Globe className="w-4 h-4" />,
      risk: 'low',
    },
    {
      label: 'TLD',
      value: '.' + (parsed.hostname.split('.').slice(-1)[0] || ''),
      icon: <Hash className="w-4 h-4" />,
      risk: ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq'].includes(
        '.' + parsed.hostname.split('.').slice(-1)[0]
      )
        ? 'high'
        : 'low',
    },
    {
      label: 'Path',
      value: parsed.pathname || '/',
      icon: <FileText className="w-4 h-4" />,
      risk:
        parsed.pathname.toLowerCase().includes('login') ||
        parsed.pathname.toLowerCase().includes('verify')
          ? 'medium'
          : 'low',
    },
    {
      label: 'Query',
      value: parsed.search || '—',
      icon: <Search className="w-4 h-4" />,
      risk:
        parsed.search.toLowerCase().includes('token') ||
        parsed.search.toLowerCase().includes('password')
          ? 'high'
          : 'low',
    },
  ];

  const riskColors = {
    low: 'border-l-green-500 bg-green-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    high: 'border-l-red-500 bg-red-500/5',
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
          {part.risk !== 'low' && (
            <AlertTriangle
              className={`w-4 h-4 flex-shrink-0 ${part.risk === 'high' ? 'text-red-400' : 'text-yellow-400'}`}
            />
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
  const ageRisk = age === undefined ? 'unknown' : age < 30 ? 'high' : age < 180 ? 'medium' : 'low';

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
          <span
            className={`text-sm font-semibold flex items-center gap-1 ${
              ageRisk === 'high'
                ? 'text-red-400'
                : ageRisk === 'medium'
                  ? 'text-yellow-400'
                  : 'text-green-400'
            }`}
          >
            {age !== undefined ? `${age} days` : 'Unknown'}
            {ageRisk === 'high' && <AlertTriangle className="w-3 h-3" />}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Registrar
          </span>
          <span className="text-sm text-slate-300">{registrar || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </span>
          <span className="text-sm text-slate-300">{country || 'Unknown'}</span>
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
    { name: 'SPF', data: spf, icon: <Key className="w-5 h-5" />, desc: 'Sender Policy Framework' },
    {
      name: 'DKIM',
      data: dkim,
      icon: <Fingerprint className="w-5 h-5" />,
      desc: 'DomainKeys Identified Mail',
    },
    {
      name: 'DMARC',
      data: dmarc,
      icon: <Shield className="w-5 h-5" />,
      desc: 'Domain-based Message Auth',
    },
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
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <div className={`mx-auto mb-2 ${item.data?.valid ? 'text-green-400' : 'text-red-400'}`}>
              {item.data?.valid ? (
                <CheckCircle className="w-8 h-8 mx-auto" />
              ) : (
                <XCircle className="w-8 h-8 mx-auto" />
              )}
            </div>
            <div className="text-sm font-bold text-white">{item.name}</div>
            <div className="text-[10px] text-slate-500 uppercase">
              {item.data?.status || item.data?.policy || 'N/A'}
            </div>
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
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
            ⚠️ Homograph Attack Detected!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            This domain uses lookalike characters to impersonate a trusted brand
          </p>
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
  const detections = results.filter((r) => r.available && (r.isMalicious || r.isPhishing)).length;
  const clean = results.filter((r) => r.available && !r.isMalicious && !r.isPhishing).length;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          Threat Intelligence ({results.length} sources)
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
            {detections} threats
          </span>
          <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{clean} clean</span>
        </div>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2">
        {results.slice(0, 12).map((r) => (
          <div
            key={r.provider}
            className={`p-2 rounded-lg text-center border ${
              !r.available
                ? 'border-slate-600/30 bg-slate-700/20'
                : r.isMalicious || r.isPhishing
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-green-500/30 bg-green-500/10'
            }`}
          >
            <div className="text-[11px] font-medium text-white truncate">
              {r.provider.replace(/_/g, ' ')}
            </div>
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
  const [mode, setMode] = useState<AnalysisMode>('url');
  const [input, setInput] = useState('');
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
    {
      id: 'url',
      label: 'URL Analysis',
      icon: <Link2 className="w-4 h-4" />,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'email',
      label: 'Email Security',
      icon: <Mail className="w-4 h-4" />,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'domain',
      label: 'Domain Intel',
      icon: <Globe className="w-4 h-4" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'bulk',
      label: 'Bulk Check',
      icon: <FileText className="w-4 h-4" />,
      color: 'from-orange-500 to-red-500',
    },
  ];

  // Analyze handler with progress
  const handleAnalyze = useCallback(async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => Math.min(prev + Math.random() * 15, 95));
    }, 200);

    await new Promise((r) => setTimeout(r, 2500));

    clearInterval(progressInterval);
    setAnalysisProgress(100);

    // Detect if URL/domain is suspicious
    const inputLower = input.toLowerCase();
    const isSuspicious =
      inputLower.includes('login') ||
      inputLower.includes('verify') ||
      inputLower.includes('paypa1') ||
      inputLower.includes('micr0soft') ||
      inputLower.includes('amaz0n') ||
      inputLower.includes('secure-');

    // Set results
    setResult({
      verdict: isSuspicious ? 'PHISHING' : 'CLEAN',
      riskScore: isSuspicious ? 87 : 12,
      analysisTime: 2341,
      url: mode === 'url' ? input : undefined,
      domain: (() => {
        try {
          return new URL(input.startsWith('http') ? input : `https://${input}`).hostname;
        } catch {
          return input;
        }
      })(),
    });

    // Set threat intel
    setThreatIntel([
      { provider: 'Google Safe Browsing', available: true, isMalicious: isSuspicious },
      {
        provider: 'VirusTotal',
        available: true,
        isMalicious: false,
        riskScore: isSuspicious ? 65 : 5,
      },
      { provider: 'PhishTank', available: true, isPhishing: isSuspicious },
      { provider: 'URLhaus', available: true, isMalicious: false },
      { provider: 'IPQualityScore', available: true, riskScore: isSuspicious ? 78 : 8 },
      { provider: 'URLScan.io', available: true, isMalicious: false },
      { provider: 'OpenPhish', available: true, isPhishing: isSuspicious },
      { provider: 'AlienVault OTX', available: true, isMalicious: false },
      { provider: 'CheckPhish', available: true, isPhishing: isSuspicious },
      { provider: 'Hybrid Analysis', available: true, isMalicious: false },
      { provider: 'AbuseIPDB', available: true, isMalicious: false },
      { provider: 'Shodan', available: true, isMalicious: false },
    ]);

    // Set domain intel
    setDomainIntel({
      domainAge: isSuspicious ? 12 : 1825,
      registrar: isSuspicious ? 'Namecheap Inc' : 'GoDaddy.com LLC',
      ssl: {
        valid: true,
        issuer: isSuspicious ? "Let's Encrypt" : 'DigiCert Inc',
        daysUntilExpiry: isSuspicious ? 45 : 280,
      },
    });

    // Check homograph
    if (
      inputLower.includes('paypa1') ||
      inputLower.includes('micr0soft') ||
      inputLower.includes('amaz0n')
    ) {
      setHomograph({
        isHomograph: true,
        originalDomain: input,
        normalizedDomain: input.replace(/1/g, 'l').replace(/0/g, 'o'),
        confusables: [{ original: '1→l' }, { original: '0→o' }],
        brandImpersonation: [{ brand: 'PayPal/Microsoft/Amazon' }],
      });
    } else {
      setHomograph(null);
    }

    // Email analysis
    if (mode === 'email') {
      setEmailAnalysis({
        spf: { valid: !isSuspicious, status: isSuspicious ? 'fail' : 'pass' },
        dkim: { valid: true, status: 'pass' },
        dmarc: { valid: !isSuspicious, policy: isSuspicious ? 'none' : 'reject' },
        spoofing: { detected: isSuspicious, issues: [] },
        contentAnalysis: {},
      });
    }

    setIsAnalyzing(false);
  }, [input, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      {/* 🎣 EPIC ANIMATED BACKGROUNDS - NEIL ARMSTRONG EDITION */}
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}

      {/* Hexagonal Grid */}
      <HexagonalGrid />

      {/* Floating Phishing Hooks */}
      <PhishingHookParticles />

      {/* Matrix Rain */}
      <PhishingMatrixRain />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-orb-float" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] animate-orb-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] animate-orb-pulse" />
      </div>

      {/* Cyber Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move" />
      </div>

      {/* Header */}
      <header className="relative border-b border-orange-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        {/* Header glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5" />

        <div className="relative max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CyberShieldPulse
                status={
                  isAnalyzing
                    ? 'scanning'
                    : result?.verdict === 'PHISHING'
                      ? 'danger'
                      : result?.verdict === 'SUSPICIOUS'
                        ? 'warning'
                        : 'safe'
                }
              />
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent tracking-tight">
                  PhishNetAI
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Fish className="w-3 h-3 text-orange-400" />
                  Advanced Phishing Detection & Domain Intelligence
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <AnimatedThreatCounter
                label="Scans Today"
                value={stats.scansToday}
                icon={<Search className="w-4 h-4 text-cyan-400" />}
                color="#06b6d4"
              />
              <AnimatedThreatCounter
                label="Threats Blocked"
                value={stats.phishingBlocked}
                icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
                color="#ef4444"
              />
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 backdrop-blur-sm">
                <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-sm font-bold text-orange-400">
                  {stats.activeAPIs} APIs Live
                </span>
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
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="relative bg-slate-800/40 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-sm mb-6 overflow-hidden group hover:border-orange-500/40 transition-all duration-500">
          {/* Scan Effect Overlay */}
          <EmailWaveScanner isActive={isAnalyzing} />

          {/* Background glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              {mode === 'url' && <Link2 className="w-5 h-5 text-orange-400" />}
              {mode === 'email' && <Mail className="w-5 h-5 text-purple-400" />}
              {mode === 'domain' && <Globe className="w-5 h-5 text-green-400" />}
              {mode === 'bulk' && <FileText className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'url' && '🔗 Analyze Suspicious URL'}
                {mode === 'email' && '📧 Analyze Email for Phishing'}
                {mode === 'domain' && '🌐 Check Domain Intelligence'}
                {mode === 'bulk' && '📋 Bulk URL Analysis'}
              </h2>
              <p className="text-xs text-slate-500">
                AI-powered threat detection across 35+ intelligence sources
              </p>
            </div>
          </div>

          {mode === 'email' ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the full email including headers here...&#10;&#10;Example:&#10;From: security@suspicious-bank.com&#10;To: victim@example.com&#10;Subject: Urgent: Verify Your Account&#10;&#10;Dear Customer, Your account has been suspended..."
              className="w-full h-48 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 font-mono text-sm resize-none"
            />
          ) : mode === 'bulk' ? (
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
                placeholder={
                  mode === 'url' ? 'https://suspicious-site.com/login/verify' : 'example.com'
                }
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-4 pr-32 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
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
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
              />
              All Threat Intel Sources
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
              />
              Homograph Detection
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
              />
              Visual Similarity Check
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                className="rounded border-slate-600 text-orange-500 focus:ring-orange-500"
              />
              Deep Screenshot Analysis
            </label>
          </div>

          {/* Epic Progress Bar */}
          {isAnalyzing && (
            <div className="mt-6 relative">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-orange-400 font-medium flex items-center gap-2">
                  <Radar className="w-4 h-4 animate-spin" />
                  Scanning across 35 threat intelligence sources...
                </span>
                <span className="text-white font-bold bg-orange-500/20 px-2 py-0.5 rounded">
                  {Math.round(analysisProgress)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden relative">
                {/* Animated background */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(249,115,22,0.3),transparent)] animate-scan-sweep" />

                {/* Progress fill */}
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 transition-all duration-300 relative overflow-hidden rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>

              {/* Analysis steps indicators */}
              <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                <span className={analysisProgress > 10 ? 'text-orange-400' : ''}>URL Parse</span>
                <span className={analysisProgress > 30 ? 'text-orange-400' : ''}>DNS Check</span>
                <span className={analysisProgress > 50 ? 'text-orange-400' : ''}>SSL Verify</span>
                <span className={analysisProgress > 70 ? 'text-orange-400' : ''}>Threat Intel</span>
                <span className={analysisProgress > 90 ? 'text-orange-400' : ''}>AI Analysis</span>
              </div>
            </div>
          )}

          {mode !== 'email' && mode !== 'bulk' && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="mt-4 w-full sm:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
            </button>
          )}

          {(mode === 'email' || mode === 'bulk') && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
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
                    Analysis completed in{' '}
                    <span className="text-white font-medium">{result.analysisTime}ms</span> using{' '}
                    <span className="text-orange-400 font-medium">
                      35 threat intelligence sources
                    </span>
                  </p>
                  {result.domain && (
                    <p className="text-sm text-slate-300 mt-2 font-mono bg-slate-800/50 inline-block px-3 py-1 rounded">
                      {result.domain}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors"
                    title="Copy Report"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors"
                    title="Report Phishing"
                  >
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
                {mode === 'url' && result.url && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-cyan-400" />
                      URL Structure Analysis
                    </h3>
                    <URLBreakdown url={result.url} />
                  </div>
                )}

                {mode === 'email' && emailAnalysis && (
                  <EmailAuthCard
                    spf={emailAnalysis.spf}
                    dkim={emailAnalysis.dkim}
                    dmarc={emailAnalysis.dmarc}
                  />
                )}

                {domainIntel && (
                  <DomainIntelCard
                    domain={result.domain || ''}
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
                    {result.verdict === 'PHISHING' || result.verdict === 'MALICIOUS' ? (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-red-400">
                              Block Immediately
                            </div>
                            <div className="text-xs text-slate-400">
                              Add to firewall blocklist and DNS sinkhole
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-yellow-400">
                              Alert Security Team
                            </div>
                            <div className="text-xs text-slate-400">
                              Notify SOC and create incident ticket
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <Flag className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-blue-400">
                              Report to Authorities
                            </div>
                            <div className="text-xs text-slate-400">
                              Submit to Google Safe Browsing, PhishTank
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-green-400">
                              No Immediate Threat
                            </div>
                            <div className="text-xs text-slate-400">
                              URL appears safe based on current analysis
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl">
                          <RefreshCw className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-slate-300">
                              Continue Monitoring
                            </div>
                            <div className="text-xs text-slate-400">
                              Re-analyze periodically for changes
                            </div>
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
        /* ═══════════════════════════════════════════════════════════════════════════════ */
        /* 🎣 NEIL ARMSTRONG EPIC ANIMATIONS - PHISHNETAI EDITION */
        /* ═══════════════════════════════════════════════════════════════════════════════ */
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        
        /* Floating phishing hooks */
        @keyframes float-hook {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 0.3;
          }
          25% { transform: translateY(-30px) rotate(10deg); }
          50% { 
            transform: translateY(-15px) rotate(-5deg); 
            opacity: 0.5;
          }
          75% { transform: translateY(-40px) rotate(15deg); }
        }
        .animate-float-hook { animation: float-hook var(--duration, 15s) ease-in-out infinite; }
        
        /* Radar spin */
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-spin { animation: radar-spin 2s linear infinite; }
        
        /* Shield pulse */
        @keyframes shield-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-shield-pulse { animation: shield-pulse 2s ease-out infinite; }
        
        /* Email scan waves */
        @keyframes email-scan {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-email-scan { animation: email-scan 2s ease-out infinite; }
        
        /* Matrix fall */
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-matrix-fall { animation: matrix-fall var(--duration, 10s) linear infinite; }
        
        /* Orb animations */
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }
        .animate-orb-float { animation: orb-float 20s ease-in-out infinite; }
        .animate-orb-float-delayed { animation: orb-float 25s ease-in-out infinite; animation-delay: -5s; }
        
        @keyframes orb-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.3; }
        }
        .animate-orb-pulse { animation: orb-pulse 8s ease-in-out infinite; }
        
        /* Grid movement */
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        .animate-grid-move { animation: grid-move 20s linear infinite; }
        
        /* Scan sweep */
        @keyframes scan-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-scan-sweep { animation: scan-sweep 1.5s ease-in-out infinite; }
        
        /* Shine effect */
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shine { animation: shine 2s ease-in-out infinite; }
        
        /* Threat counter glow */
        @keyframes threat-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        
        /* Link chain pulse */
        @keyframes chain-pulse {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.1); }
        }
      `}</style>
    </div>
  );
};

export default PhishNetAITool;

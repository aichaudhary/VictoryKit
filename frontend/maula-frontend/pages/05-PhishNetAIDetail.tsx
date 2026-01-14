
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
  Mail,
  Globe,
  Link,
  Brain,
  MousePointer,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - PHISH NET AI
// ============================================================================

// 1. PhishingDetectionNet - AI-powered phishing detection network
const PhishingDetectionNet: React.FC = () => {
  const [phishingAttempts, setPhishingAttempts] = useState<
    { id: number; x: number; y: number; type: string; confidence: number; blocked: boolean }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newAttempt = {
          id: Date.now(),
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          type: ['email_phish', 'url_phish', 'spear_phish', 'malicious_link'][Math.floor(Math.random() * 4)],
          confidence: 70 + Math.random() * 30,
          blocked: Math.random() > 0.3,
        };
        setPhishingAttempts((prev) => [...prev.slice(-10), newAttempt]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-25">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
          <radialGradient id="phishNetGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </radialGradient>
          <filter id="phishNetGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Neural network connections */}
        <g opacity="0.3">
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={Math.random() * 100}
              y1={Math.random() * 100}
              x2={Math.random() * 100}
              y2={Math.random() * 100}
              stroke="#8b5cf6"
              strokeWidth="0.2"
              opacity="0.4"
            >
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
            </line>
          ))}
        </g>

        {/* Detection nodes */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={20 + (i % 5) * 15}
            cy={20 + Math.floor(i / 5) * 15}
            r="1.5"
            fill="#8b5cf6"
            opacity="0.6"
          >
            <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
          </circle>
        ))}

        <g style={{ transformOrigin: '50px 50px', animation: 'spin-radar 8s linear infinite' }}>
          <path d="M50,50 L50,5 A45,45 0 0,1 85,30 Z" fill="url(#phishNetGradient)" />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="#8b5cf6"
            strokeWidth="0.8"
            filter="url(#phishNetGlow)"
          />
        </g>

        {phishingAttempts.map((attempt) => (
          <g key={attempt.id}>
            <circle
              cx={attempt.x}
              cy={attempt.y}
              r="1.5"
              fill={attempt.blocked ? '#ef4444' : '#06b6d4'}
              opacity="0.8"
            >
              <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={attempt.x}
              cy={attempt.y}
              r="4"
              fill="none"
              stroke={attempt.blocked ? '#ef4444' : '#06b6d4'}
              strokeWidth="0.5"
              opacity="0.4"
            >
              <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// 2. URLAnalyzer - Real-time URL analysis and classification
const URLAnalyzer: React.FC = () => {
  const [urls, setUrls] = useState<
    { id: number; url: string; risk: string; analyzing: boolean; result: string }[]
  >([]);

  useEffect(() => {
    const sampleUrls = [
      'paypal-secure.com/login',
      'bankofamerica-update.net',
      'microsoft-support.co',
      'amazon-delivery.org',
      'google-drive-share.biz'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
        const newUrl = {
          id: Date.now(),
          url: randomUrl,
          risk: 'analyzing',
          analyzing: true,
          result: '',
        };
        setUrls((prev) => [...prev.slice(-6), newUrl]);

        // Simulate analysis completion
        setTimeout(() => {
          setUrls((prev) =>
            prev.map((u) =>
              u.id === newUrl.id
                ? { ...u, risk: Math.random() > 0.7 ? 'malicious' : 'safe', analyzing: false, result: Math.random() > 0.7 ? 'BLOCKED' : 'ALLOWED' }
                : u
            )
          );
        }, 2000 + Math.random() * 3000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {urls.map((url, i) => (
        <div
          key={url.id}
          className="absolute bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-[8px] font-mono max-w-32"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `urlAnalysis ${3 + Math.random() * 2}s ease-in-out infinite`,
          }}
        >
          <div className="text-purple-400 font-bold truncate">{url.url}</div>
          <div className={`text-xs ${url.risk === 'malicious' ? 'text-red-400' : url.risk === 'safe' ? 'text-green-400' : 'text-yellow-400'}`}>
            {url.analyzing ? 'ANALYZING...' : url.result}
          </div>
          {url.analyzing && (
            <div className="w-full bg-purple-500/20 rounded-full h-0.5 mt-1">
              <div className="h-0.5 bg-purple-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          )}
        </div>
      ))}
      <style>{`
        @keyframes urlAnalysis {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 3. EmailScanner - Email content analysis and threat detection
const EmailScanner: React.FC = () => {
  const [emails, setEmails] = useState<
    { id: number; subject: string; sender: string; scanned: boolean; threat: boolean }[]
  >([]);

  useEffect(() => {
    const subjects = [
      'Urgent: Account Verification Required',
      'Your Package Delivery Update',
      'Security Alert: Unusual Activity',
      'Invoice Payment Due',
      'Password Reset Confirmation'
    ];
    const senders = [
      'support@paypal.com',
      'noreply@amazon.com',
      'security@bank.com',
      'admin@microsoft.com',
      'service@google.com'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newEmail = {
          id: Date.now(),
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          sender: senders[Math.floor(Math.random() * senders.length)],
          scanned: false,
          threat: Math.random() > 0.7,
        };
        setEmails((prev) => [...prev.slice(-8), newEmail]);

        // Simulate scanning
        setTimeout(() => {
          setEmails((prev) =>
            prev.map((e) => (e.id === newEmail.id ? { ...e, scanned: true } : e))
          );
        }, 1500);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-15">
      {emails.map((email, i) => (
        <div
          key={email.id}
          className="absolute bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-[7px] font-mono max-w-40"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animation: `emailScan ${4 + Math.random() * 2}s linear infinite`,
          }}
        >
          <div className="flex items-center gap-1">
            <Mail className="w-2 h-2 text-cyan-400" />
            <span className="text-cyan-400 font-bold truncate">{email.sender}</span>
          </div>
          <div className="text-white/70 truncate mt-0.5">{email.subject}</div>
          <div className="flex items-center gap-1 mt-1">
            {email.scanned ? (
              email.threat ? (
                <>
                  <AlertTriangle className="w-2 h-2 text-red-400" />
                  <span className="text-red-400">THREAT</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-2 h-2 text-green-400" />
                  <span className="text-green-400">SAFE</span>
                </>
              )
            ) : (
              <>
                <Activity className="w-2 h-2 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400">SCANNING</span>
              </>
            )}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes emailScan {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// 4. ContentClassifier - AI content classification engine
const ContentClassifier: React.FC = () => {
  const [classifications, setClassifications] = useState<
    { id: number; content: string; category: string; confidence: number; processing: boolean }[]
  >([]);

  useEffect(() => {
    const contentTypes = [
      'Login Form',
      'Payment Page',
      'Download Link',
      'Survey Form',
      'Support Request'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.75) {
        const newClassification = {
          id: Date.now(),
          content: contentTypes[Math.floor(Math.random() * contentTypes.length)],
          category: 'processing',
          confidence: 0,
          processing: true,
        };
        setClassifications((prev) => [...prev.slice(-5), newClassification]);

        // Simulate classification
        setTimeout(() => {
          setClassifications((prev) =>
            prev.map((c) =>
              c.id === newClassification.id
                ? {
                    ...c,
                    category: Math.random() > 0.6 ? 'phishing' : 'legitimate',
                    confidence: 75 + Math.random() * 25,
                    processing: false,
                  }
                : c
            )
          );
        }, 1000 + Math.random() * 2000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      {classifications.map((classification, i) => (
        <div
          key={classification.id}
          className="absolute bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-[8px] font-mono"
          style={{
            left: `${Math.random() * 70 + 15}%`,
            top: `${Math.random() * 70 + 15}%`,
            animation: `contentClassify ${2.5 + Math.random()}s ease-in-out infinite`,
          }}
        >
          <div className="text-blue-400 font-bold">{classification.content}</div>
          {classification.processing ? (
            <div className="text-yellow-400">CLASSIFYING...</div>
          ) : (
            <>
              <div className={`text-xs ${classification.category === 'phishing' ? 'text-red-400' : 'text-green-400'}`}>
                {classification.category.toUpperCase()}
              </div>
              <div className="text-white/60">{classification.confidence.toFixed(0)}% confidence</div>
            </>
          )}
        </div>
      ))}
      <style>{`
        @keyframes contentClassify {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// 5. ThreatPatternMatcher - Pattern recognition and matching
const ThreatPatternMatcher: React.FC = () => {
  const [patterns, setPatterns] = useState<boolean[][]>(
    Array(10).fill(null).map(() => Array(10).fill(false))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPatterns((prev) =>
        prev.map((row) =>
          row.map(() => Math.random() > 0.85)
        )
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <div className="grid grid-cols-10 gap-0.5 w-full h-full p-8">
        {patterns.flat().map((active, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-all duration-200 ${
              active ? 'bg-purple-500/60 animate-pulse' : 'bg-purple-500/10'
            }`}
          >
            {active && (
              <div className="w-full h-full bg-purple-400/40 animate-ping rounded-sm"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PhishNetAIDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'analysis' | 'prevention'>('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    emailsScanned: 284739,
    threatsDetected: 15684,
    urlsAnalyzed: 89234,
    accuracyRate: 99.8,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Live metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        emailsScanned: prev.emailsScanned + Math.floor(Math.random() * 100),
        threatsDetected: prev.threatsDetected + Math.floor((Math.random() - 0.9) * 20),
        urlsAnalyzed: prev.urlsAnalyzed + Math.floor(Math.random() * 50),
        accuracyRate: Math.max(99, prev.accuracyRate + (Math.random() - 0.5) * 0.01),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0a0208] text-white selection:bg-purple-500/30 font-sans overflow-hidden"
    >
      {/* Epic Animated Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[800px] h-[800px] bg-purple-600/8 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-20%] w-[1000px] h-[1000px] bg-cyan-600/6 blur-[250px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        <ParticleNetwork color="#a855f7" />
        <DataStream color="#a855f7" />
        <ParticleNetwork color="#a855f7" />
        <DataStream color="#a855f7" />
        <PhishingDetectionNet />
        <URLAnalyzer />
        <EmailScanner />
        <ContentClassifier />
        <ThreatPatternMatcher />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-24">
          <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">PhishNetAI Enterprise v5.2</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-purple-500/20 backdrop-blur-3xl">
              <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-500">AI Phishing Defense</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              PHISH NET <span className="text-purple-500">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Catch every phish in the net. AI-powered phishing detection that analyzes URLs, emails, and web content with machine learning precision and neural network intelligence.
            </p>
            <div className="flex gap-6 pt-4">
              <a href="https://phishnetai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-2">
                <Brain className="w-4 h-4" /> AI Active
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Detection: {liveMetrics.accuracyRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* AI Detection Network Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-purple-500/20 shadow-2xl bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Central AI detection engine */}
              <div className="relative w-80 h-80">
                {/* Central AI engine */}
                <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-purple-400/40 rounded-full flex items-center justify-center">
                    <div className="w-48 h-48 border border-purple-300/30 rounded-full flex items-center justify-center">
                      {/* Core AI engine */}
                      <div className="w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center relative">
                        <Brain className="w-16 h-16 text-purple-400" />

                        {/* Detection modules orbiting */}
                        {[
                          { icon: Mail, label: 'Email Analysis' },
                          { icon: Link, label: 'URL Scanner' },
                          { icon: Globe, label: 'Web Content' },
                          { icon: MousePointer, label: 'Behavior Analysis' },
                          { icon: Activity, label: 'Pattern Matching' },
                          { icon: Target, label: 'Threat Detection' }
                        ].map((module, i) => (
                          <div
                            key={i}
                            className="absolute w-10 h-10 bg-purple-400/15 rounded-full flex items-center justify-center border border-purple-400/30"
                            style={{
                              top: `${50 + 45 * Math.sin((i * 60) * Math.PI / 180)}%`,
                              left: `${50 + 45 * Math.cos((i * 60) * Math.PI / 180)}%`,
                              transform: 'translate(-50%, -50%)',
                              animationDelay: `${i * 0.15}s`
                            }}
                          >
                            <module.icon className="w-5 h-5 text-purple-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detection rings */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-purple-500/20 rounded-full animate-pulse"
                    style={{
                      top: `${50 - (i + 1) * 12}%`,
                      left: `${50 - (i + 1) * 12}%`,
                      width: `${(i + 1) * 24}%`,
                      height: `${(i + 1) * 24}%`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Status overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400">AI DETECTION: ACTIVE</span>
                <span className="text-green-400 animate-pulse">● NEURAL NET</span>
              </div>
              <div className="mt-2 w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-purple-500/10 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500 tabular-nums">{liveMetrics.emailsScanned.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Emails Scanned</div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: '95%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white tabular-nums">{liveMetrics.threatsDetected.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Threats Detected</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{width: '97%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-white">{liveMetrics.urlsAnalyzed.toLocaleString()}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">URLs Analyzed</div>
              <div className="w-full bg-white/5 rounded-full h-1">
                <div className="bg-cyan-500 h-1 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-6xl font-black text-purple-500">{liveMetrics.accuracyRate.toFixed(1)}%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Accuracy Rate</div>
              <div className="w-full bg-purple-500/10 rounded-full h-1">
                <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{width: `${liveMetrics.accuracyRate}%`}}></div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Email Analysis</h3>
              <p className="text-white/50 leading-relaxed">Advanced AI analysis of email content, headers, and attachments to detect sophisticated phishing attempts and social engineering.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                284K emails analyzed daily
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Link className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">URL Intelligence</h3>
              <p className="text-white/50 leading-relaxed">Real-time URL analysis using machine learning to identify malicious links, domain reputation, and phishing site characteristics.</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
                <Globe className="w-4 h-4 animate-pulse" />
                89K URLs scanned hourly
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-purple-500/20 transition-all group hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Neural Detection</h3>
              <p className="text-white/50 leading-relaxed">Deep learning neural networks trained on millions of phishing samples to recognize emerging threats and zero-day attacks.</p>
              <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4 animate-pulse" />
                99.8% detection accuracy
              </div>
            </div>
          </div>

          {/* AI Detection Engine Visualization */}
          <div className="glass p-16 rounded-[4rem] border border-purple-500/10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-5xl font-black mb-6">AI Detection Engine</h2>
              <p className="text-white/50 text-xl max-w-2xl mx-auto">Multi-layered AI-powered phishing detection combining neural networks, machine learning, and behavioral analysis for comprehensive threat protection.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                {/* Detection capabilities */}
                {[
                  { capability: 'Neural Network Analysis', coverage: 99.8, icon: Brain, color: 'text-purple-400' },
                  { capability: 'URL Reputation Scoring', coverage: 98.5, icon: Link, color: 'text-blue-400' },
                  { capability: 'Email Content Analysis', coverage: 97.3, icon: Mail, color: 'text-green-400' },
                  { capability: 'Behavioral Pattern Matching', coverage: 96.9, icon: Activity, color: 'text-yellow-400' },
                  { capability: 'Real-time Classification', coverage: 99.2, icon: Target, color: 'text-red-400' },
                  { capability: 'Zero-day Detection', coverage: 98.7, icon: Zap, color: 'text-cyan-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{item.capability}</div>
                      <div className="text-purple-400 font-mono text-sm">{item.coverage}% accuracy</div>
                    </div>
                    <div className="w-16 h-2 bg-purple-500/20 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{width: `${item.coverage}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI dashboard */}
              <div className="relative h-96 bg-black/50 rounded-3xl border border-purple-500/10 p-8">
                <div className="space-y-6">
                  {/* AI metrics */}
                  {[
                    { metric: 'Neural Network Confidence', value: 98.5, status: 'excellent' },
                    { metric: 'False Positive Rate', value: 0.2, status: 'minimal' },
                    { metric: 'Processing Speed', value: 0.05, status: 'lightning' },
                    { metric: 'Model Accuracy', value: 99.8, status: 'perfect' },
                    { metric: 'Training Data Size', value: 5000000, status: 'massive' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-mono text-purple-400">{item.metric}</div>
                      <div className="flex-1 bg-purple-500/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            item.status === 'excellent' ? 'bg-green-500' :
                            item.status === 'minimal' ? 'bg-blue-500' :
                            item.status === 'lightning' ? 'bg-purple-500' :
                            item.status === 'perfect' ? 'bg-red-500' : 'bg-yellow-500'
                          } transition-all duration-1000`}
                          style={{width: `${typeof item.value === 'number' && item.value > 100 ? (item.value / 5000000) * 100 : item.value}%`}}
                        ></div>
                      </div>
                      <div className="w-20 text-sm font-mono text-right text-white">{item.value}{typeof item.value === 'number' && item.value > 100 ? ' samples' : '%'}</div>
                      <div className="w-20 text-xs font-mono text-purple-400 text-right capitalize">{item.status}</div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-purple-400">
                  <span>AI Engine Status</span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-purple-500/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://phishnetai.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-purple-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-purple-500/20 flex items-center gap-4">
            Deploy AI Defense <Brain className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhishNetAIDetail;

import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Cpu,
  Lock,
  Download,
  Share2,
  Eye,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import { FraudScore } from "../types";

interface AnimatedFraudScoreCardProps {
  data: FraudScore | null;
  isAnalyzing?: boolean;
  onViewDetails?: () => void;
  onExport?: () => void;
}

export const AnimatedFraudScoreCard: React.FC<AnimatedFraudScoreCardProps> = ({
  data,
  isAnalyzing = false,
  onViewDetails,
  onExport,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showIndicators, setShowIndicators] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [revealedIndicators, setRevealedIndicators] = useState(0);
  const [typedRecommendation, setTypedRecommendation] = useState("");
  const [pulseRing, setPulseRing] = useState(true);
  const scoreRef = useRef<number>(0);

  // Animate score counting up
  useEffect(() => {
    if (!data) {
      setDisplayScore(0);
      setShowIndicators(false);
      setShowRecommendation(false);
      setRevealedIndicators(0);
      setTypedRecommendation("");
      return;
    }

    scoreRef.current = 0;
    const targetScore = data.score;
    const duration = 1500;
    const steps = 60;
    const increment = targetScore / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      scoreRef.current += increment;
      if (scoreRef.current >= targetScore) {
        scoreRef.current = targetScore;
        clearInterval(timer);

        // After score animation, show indicators
        setTimeout(() => setShowIndicators(true), 300);
      }
      setDisplayScore(Math.round(scoreRef.current));
    }, stepTime);

    return () => clearInterval(timer);
  }, [data]);

  // Animate indicators reveal
  useEffect(() => {
    if (!showIndicators || !data?.indicators) return;

    const interval = setInterval(() => {
      setRevealedIndicators((prev) => {
        if (prev >= data.indicators.length) {
          clearInterval(interval);
          setTimeout(() => setShowRecommendation(true), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showIndicators, data?.indicators]);

  // Type recommendation text
  useEffect(() => {
    if (!showRecommendation || !data?.recommendation) return;

    let index = 0;
    const text = data.recommendation;

    const interval = setInterval(() => {
      if (index <= text.length) {
        setTypedRecommendation(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        setPulseRing(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [showRecommendation, data?.recommendation]);

  // Pulse ring effect
  useEffect(() => {
    if (data) setPulseRing(true);
  }, [data]);

  if (!data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 p-8 text-center relative overflow-hidden min-h-[400px] flex items-center justify-center">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid-animation" />
        </div>

        <div className="relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-dashed border-red-500/30 flex items-center justify-center animate-spin-slow">
              <Shield className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Awaiting Results
          </h3>
          <p className="text-gray-400 max-w-xs mx-auto">
            Complete the transaction analysis to see your fraud risk assessment
          </p>
        </div>
      </div>
    );
  }

  const score = data.score;
  const getScoreColor = () => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreGradient = () => {
    if (score >= 70) return "from-red-500 to-pink-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-emerald-500";
  };

  const getScoreBg = () => {
    if (score >= 70) return "from-red-500/20 to-red-600/5";
    if (score >= 40) return "from-yellow-500/20 to-yellow-600/5";
    return "from-green-500/20 to-green-600/5";
  };

  const getRiskIcon = () => {
    if (data.risk_level === "high" || data.risk_level === "critical")
      return <XCircle className="w-8 h-8 text-red-500" />;
    if (data.risk_level === "medium")
      return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    return <CheckCircle className="w-8 h-8 text-green-500" />;
  };

  const getIndicatorColor = (severity: string) => {
    if (severity === "high" || severity === "critical")
      return "border-red-500/50 bg-red-500/10";
    if (severity === "medium") return "border-yellow-500/50 bg-yellow-500/10";
    return "border-green-500/50 bg-green-500/10";
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 overflow-hidden relative">
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-pink-500/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div
        className={`bg-gradient-to-r ${getScoreBg()} p-6 relative overflow-hidden`}
      >
        {/* Animated scan line */}
        {pulseRing && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan" />
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreGradient()} flex items-center justify-center shadow-lg`}
              >
                <Shield className="w-7 h-7 text-white" />
              </div>
              {pulseRing && (
                <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Risk Assessment
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getRiskIcon()}
            <span className={`text-lg font-bold uppercase ${getScoreColor()}`}>
              {data.risk_level}
            </span>
          </div>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="p-8 border-b border-red-500/20">
        <div className="flex items-center justify-center gap-12">
          {/* Circular Score Gauge */}
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-700/50"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
                r="80"
                cx="96"
                cy="96"
              />
              {/* Animated progress circle */}
              <circle
                className={`transition-all duration-1000 ${
                  score >= 70
                    ? "text-red-500"
                    : score >= 40
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
                strokeWidth="12"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="80"
                cx="96"
                cy="96"
                style={{
                  strokeDasharray: `${2 * Math.PI * 80}`,
                  strokeDashoffset: `${
                    2 * Math.PI * 80 * (1 - displayScore / 100)
                  }`,
                  filter: `drop-shadow(0 0 10px currentColor)`,
                }}
              />
            </svg>

            {/* Center score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-6xl font-bold tabular-nums ${getScoreColor()}`}
              >
                {displayScore}
              </span>
              <span className="text-gray-500 text-sm mt-1">Risk Score</span>
            </div>

            {/* Animated particles */}
            {pulseRing && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${getScoreColor().replace(
                      "text-",
                      "bg-"
                    )} animate-float`}
                    style={{
                      top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                      left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 tabular-nums">
                  {data.confidence}%
                </div>
                <div className="text-xs text-gray-500">ML Confidence</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">
                  {data.indicators.length}
                </div>
                <div className="text-xs text-gray-500">Risk Factors</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">127</div>
                <div className="text-xs text-gray-500">Checks Performed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Indicators - Animated Reveal */}
      {showIndicators && data.indicators.length > 0 && (
        <div className="p-6 border-b border-red-500/20">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Detected Risk Factors
            <span className="text-xs text-gray-500 font-normal">
              ({data.indicators.length} found)
            </span>
          </h3>

          <div className="grid gap-3">
            {data.indicators
              .slice(0, revealedIndicators)
              .map((indicator, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-500 animate-slideIn ${getIndicatorColor(
                    indicator.severity
                  )}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      indicator.severity === "high"
                        ? "bg-red-500/20"
                        : indicator.severity === "medium"
                        ? "bg-yellow-500/20"
                        : "bg-green-500/20"
                    }`}
                  >
                    {indicator.severity === "high" ? (
                      <TrendingUp className="w-5 h-5 text-red-400" />
                    ) : indicator.severity === "medium" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">
                        {indicator.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${
                          indicator.severity === "high"
                            ? "bg-red-500/30 text-red-300"
                            : indicator.severity === "medium"
                            ? "bg-yellow-500/30 text-yellow-300"
                            : "bg-green-500/30 text-green-300"
                        }`}
                      >
                        {indicator.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {indicator.description}
                    </p>

                    {/* Weight bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-900/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            indicator.severity === "high"
                              ? "bg-gradient-to-r from-red-600 to-red-400"
                              : indicator.severity === "medium"
                              ? "bg-gradient-to-r from-yellow-600 to-yellow-400"
                              : "bg-gradient-to-r from-green-600 to-green-400"
                          }`}
                          style={{ width: `${indicator.weight * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12">
                        {(indicator.weight * 100).toFixed(0)}% wt
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recommendation - Typed Effect */}
      {showRecommendation && (
        <div className="p-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            AI Recommendation
          </h3>
          <div
            className={`p-5 rounded-xl border ${
              score >= 70
                ? "bg-red-500/10 border-red-500/30"
                : score >= 40
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-green-500/10 border-green-500/30"
            }`}
          >
            <p className="text-gray-200 leading-relaxed">
              {typedRecommendation}
              {typedRecommendation.length <
                (data.recommendation?.length || 0) && (
                <span className="inline-block w-0.5 h-5 bg-white animate-blink ml-0.5" />
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onViewDetails}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-white py-3 px-4 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-200 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Full Report
            </button>
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white py-3 px-4 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200 font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Animated Footer */}
      <div className="px-6 py-4 bg-slate-900/50 border-t border-red-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Secured by FraudGuard AI Engine v3.2</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Analysis Complete</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
        .animate-float { animation: float 2s ease-in-out infinite; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default AnimatedFraudScoreCard;

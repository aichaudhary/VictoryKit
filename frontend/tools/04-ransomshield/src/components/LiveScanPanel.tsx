import React, { useEffect, useRef } from 'react';
import {
  Shield,
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  Bug,
  Cpu,
  FileSearch,
  Database,
  Brain,
  Fingerprint,
  Microscope,
  Layers,
  Zap,
  AlertOctagon,
  Skull,
  Radar,
  Radio,
  Sparkles,
  Target,
} from 'lucide-react';

export interface ScanStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'warning' | 'error';
  detail?: string;
  progress?: number;
}

export interface ScanEvent {
  timestamp: number;
  type: 'scan' | 'detection' | 'analysis' | 'warning' | 'info';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file?: string;
}

interface LiveScanPanelProps {
  steps: ScanStep[];
  events: ScanEvent[];
  isScanning: boolean;
  filesScanned: number;
  threatsFound: number;
  currentFile?: string;
  scanProgress?: number;
}

const LiveScanPanel: React.FC<LiveScanPanelProps> = ({
  steps,
  events,
  isScanning,
  filesScanned,
  threatsFound,
  currentFile,
  scanProgress = 0,
}) => {
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = 0;
    }
  }, [events]);

  const getStepIcon = (stepId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      init: <Shield className="w-4 h-4" />,
      signature: <Fingerprint className="w-4 h-4" />,
      heuristic: <Brain className="w-4 h-4" />,
      behavioral: <Cpu className="w-4 h-4" />,
      sandbox: <Layers className="w-4 h-4" />,
      yara: <FileSearch className="w-4 h-4" />,
      pe: <Bug className="w-4 h-4" />,
      memory: <Database className="w-4 h-4" />,
      network: <Zap className="w-4 h-4" />,
      final: <Microscope className="w-4 h-4" />,
    };
    return iconMap[stepId] || <Shield className="w-4 h-4" />;
  };

  const getStepStatus = (status: ScanStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: ScanEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-gray-400 bg-slate-800/50 border-slate-700';
    }
  };

  const getEventIcon = (event: ScanEvent) => {
    if (event.severity === 'critical') return <Skull className="w-3.5 h-3.5" />;
    if (event.severity === 'high') return <AlertOctagon className="w-3.5 h-3.5" />;
    if (event.type === 'detection') return <Bug className="w-3.5 h-3.5" />;
    if (event.type === 'warning') return <AlertTriangle className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  const completedSteps = steps.filter((s) => s.status === 'complete').length;

  return (
    <div
      className={`relative p-6 h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500 ${
        isScanning
          ? 'bg-gradient-to-br from-slate-900/95 via-purple-950/30 to-slate-900/95 border-purple-500/40 shadow-2xl shadow-purple-500/20'
          : 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-700/50'
      } border backdrop-blur-xl`}
    >
      {/* Animated Background Effects */}
      {isScanning && (
        <>
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              }}
            />
          </div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
        </>
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                isScanning
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/40'
                  : 'bg-slate-800/80 border border-slate-700'
              }`}
            >
              {isScanning ? (
                <Radar
                  className="w-6 h-6 text-white animate-spin"
                  style={{ animationDuration: '3s' }}
                />
              ) : (
                <Microscope className="w-6 h-6 text-purple-400" />
              )}
            </div>
            {isScanning && (
              <>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-slate-900" />
                <div className="absolute inset-0 rounded-xl border-2 border-purple-400/50 animate-ping" />
              </>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Live Analysis
              {isScanning && <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />}
            </h3>
            <p
              className={`text-sm transition-colors ${isScanning ? 'text-purple-300' : 'text-gray-500'}`}
            >
              {isScanning ? '🔥 Neural scan in progress...' : 'Awaiting scan command'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-3xl font-black tabular-nums transition-colors ${
              isScanning ? 'text-purple-400' : 'text-gray-500'
            }`}
          >
            {completedSteps}/{steps.length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Steps</div>
        </div>
      </div>

      {/* Epic Progress Bar */}
      {isScanning && (
        <div className="relative mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-purple-300 font-medium flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Overall Progress
            </span>
            <span className="text-purple-400 font-bold tabular-nums">
              {Math.round(scanProgress)}%
            </span>
          </div>
          <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden border border-purple-500/20">
            <div
              className="h-full rounded-full relative transition-all duration-300"
              style={{
                width: `${scanProgress}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f43f5e)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Current File Scanner */}
      {isScanning && currentFile && (
        <div className="mb-5 p-4 bg-slate-800/60 rounded-xl border border-purple-500/30 backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs text-purple-300 uppercase tracking-wider font-bold">
              Currently Scanning
            </span>
          </div>
          <div className="text-sm text-white truncate font-mono bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
            {currentFile}
          </div>
        </div>
      )}

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className={`p-4 rounded-xl border transition-all ${
            isScanning ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileSearch className={`w-5 h-5 ${isScanning ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Files Scanned</span>
          </div>
          <div
            className={`text-2xl font-black tabular-nums ${isScanning ? 'text-cyan-400' : 'text-white'}`}
          >
            {filesScanned}
          </div>
        </div>
        <div
          className={`p-4 rounded-xl border transition-all ${
            threatsFound > 0
              ? 'bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/10'
              : 'bg-slate-800/50 border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bug
              className={`w-5 h-5 ${threatsFound > 0 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}
            />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Threats Found</span>
          </div>
          <div
            className={`text-2xl font-black tabular-nums ${threatsFound > 0 ? 'text-red-400' : 'text-white'}`}
          >
            {threatsFound}
          </div>
          {threatsFound > 0 && (
            <div className="mt-2 text-xs text-red-300 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Action Required
            </div>
          )}
        </div>
      </div>
      {/* Epic Scan Steps */}
      <div className="mb-5">
        <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-purple-400" />
          Analysis Stages
        </h4>
        <div className="space-y-1.5">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                step.status === 'running'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : step.status === 'complete'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : step.status === 'warning'
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : 'bg-slate-800/30 border border-transparent'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  step.status === 'complete'
                    ? 'bg-green-500/20 text-green-400'
                    : step.status === 'running'
                      ? 'bg-purple-500/30 text-purple-300 animate-pulse'
                      : step.status === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-800 text-gray-600'
                }`}
              >
                {getStepIcon(step.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      step.status === 'running'
                        ? 'text-purple-300'
                        : step.status === 'complete'
                          ? 'text-white'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.status === 'running' && step.progress !== undefined && (
                    <span className="text-xs text-purple-400 font-bold tabular-nums bg-purple-500/20 px-2 py-0.5 rounded-full">
                      {step.progress}%
                    </span>
                  )}
                </div>
                {step.detail && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{step.detail}</p>
                )}
              </div>
              <div className="flex-shrink-0">{getStepStatus(step.status)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Epic Event Log */}
      <div className="flex-1 min-h-0">
        <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-yellow-400" />
          Detection Events
          {events.length > 0 && (
            <span className="ml-auto text-xs text-gray-500 bg-slate-800 px-2 py-0.5 rounded-full normal-case">
              {events.length} events
            </span>
          )}
        </h4>
        <div
          ref={eventsRef}
          className="h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
        >
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
              <Shield className="w-8 h-8 mb-2 opacity-30" />
              <span>{isScanning ? 'Waiting for events...' : 'Start a scan to see events'}</span>
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border text-xs backdrop-blur transition-all hover:scale-[1.02] ${getSeverityColor(event.severity)}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">{getEventIcon(event)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed font-medium">{event.message}</p>
                    {event.file && (
                      <p className="text-gray-500 truncate mt-1.5 font-mono text-[10px] bg-slate-900/50 px-2 py-1 rounded">
                        📁 {event.file}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap text-[10px] font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Epic Footer Status */}
      <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${
                isScanning ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
            {isScanning && (
              <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </div>
          <span
            className={`text-xs font-medium ${isScanning ? 'text-green-400' : 'text-gray-500'}`}
          >
            {isScanning ? 'Neural analysis engine active' : 'Engine standby'}
          </span>
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <Shield className="w-3 h-3 text-purple-500" />
          <span className="font-bold text-purple-400">RansomShield</span> v4.0
        </div>
      </div>
    </div>
  );
};

export default LiveScanPanel;

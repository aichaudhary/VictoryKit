import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Shield,
  Lock,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  ChevronDown,
  Download,
  Eye,
  Zap,
} from 'lucide-react';

const RuntimeGuardHomeVisual: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [activeEvent, setActiveEvent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
      setActiveEvent((e) => (e + 1) % 5);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const frameworks = [
    { name: 'GDPR', color: 'blue', active: true },
    { name: 'HIPAA', color: 'pink', active: true },
    { name: 'PCI DSS', color: 'cyan', active: false },
    { name: 'SOX', color: 'green', active: true },
    { name: 'ISO 27001', color: 'purple', active: false },
    { name: 'NIST CSF', color: 'indigo', active: true },
    { name: 'SOC 2', color: 'amber', active: false },
    { name: 'CCPA', color: 'emerald', active: false },
  ];

  const categories = [
    { name: 'Data Protection', icon: Shield, progress: 100, reqs: 4 },
    { name: 'Security Measures', icon: Lock, progress: 100, reqs: 3 },
    { name: 'Access Controls', icon: Users, progress: 100, reqs: 2 },
  ];

  const events = [
    { type: 'stage', label: 'Generate Report' },
    { type: 'score', label: 'Calculate Score' },
    { type: 'control', label: 'Assess Controls', code: 'Art. 38' },
    { type: 'finding', label: 'Art. 25 - Privacy by Design' },
    { type: 'gap', label: 'Encryption in Transit' },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 flex flex-col p-2 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <ClipboardCheck className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-white">RuntimeGuard</span>
            <span className="ml-1 px-1 py-0.5 text-[6px] font-medium bg-indigo-500/20 text-indigo-400 rounded">GRC</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-[6px] text-yellow-400 flex items-center gap-0.5">
            <Zap className="w-2 h-2" /> Simulation
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[6px] text-gray-400">Complete</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-1 mb-2 px-1">
        {[
          { value: '50+', label: 'Security Rules' },
          { value: '8', label: 'Frameworks', color: 'indigo' },
          { value: '100+', label: 'Controls' },
          { value: '<3s', label: 'Assessment' },
          { value: 'AI', label: 'Powered' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/30 rounded px-1 py-1 text-center border border-slate-700/30">
            <div className={`text-[8px] font-bold ${stat.color ? `text-${stat.color}-400` : 'text-white'}`}>{stat.value}</div>
            <div className="text-[5px] text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        {/* Compliance Assessment Panel */}
        <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/30 flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-4 h-4 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-2.5 h-2.5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[7px] font-bold text-white block truncate">Compliance Assessment</span>
              <div className="text-[5px] text-gray-500">Configure check</div>
            </div>
          </div>

          {/* Organization Name */}
          <div className="text-[6px] text-gray-400 mb-0.5">Organization Name</div>
          <div className="bg-slate-900/50 rounded px-1.5 py-1 text-[6px] text-gray-500 mb-1.5 flex items-center justify-between">
            <span>for example</span>
            <Building2 className="w-2 h-2 text-gray-600" />
          </div>

          {/* Industry */}
          <div className="text-[6px] text-gray-400 mb-0.5">Industry</div>
          <div className="bg-slate-900/50 rounded px-1.5 py-1 text-[6px] text-gray-300 mb-1.5 flex items-center justify-between">
            <span>Retail & E-commerce</span>
            <ChevronDown className="w-2 h-2 text-gray-500" />
          </div>

          {/* Compliance Frameworks */}
          <div className="text-[6px] text-gray-400 mb-1">Compliance Frameworks</div>
          <div className="grid grid-cols-2 gap-1 flex-1 overflow-hidden">
            {frameworks.map((fw, i) => (
              <div
                key={i}
                className={`px-1 py-1 rounded text-[6px] flex items-center gap-1 ${
                  fw.active
                    ? `bg-${fw.color}-500/10 border border-${fw.color}-500/20 text-${fw.color}-400`
                    : 'bg-slate-800/50 text-gray-500 border border-slate-700/30'
                }`}
              >
                <div className={`w-1 h-1 rounded-full ${fw.active ? `bg-${fw.color}-400` : 'bg-gray-600'}`} />
                <span className="truncate">{fw.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Assessment Panel */}
        <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0">
                <Eye className="w-2.5 h-2.5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[7px] font-bold text-white">Live Assessment</span>
                <div className="text-[5px] text-gray-500">61 / 61 controls</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {['GDPR', 'SOX', 'HIPAA'].map((fw, i) => (
                <span key={i} className="px-1 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[5px]">{fw}</span>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-1.5">
            <div className="flex items-center justify-between text-[5px] mb-0.5">
              <span className="text-gray-400">Assessment Progress</span>
              <span className="text-indigo-400 font-bold">100%</span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-full" />
            </div>
          </div>

          {/* Stages */}
          <div className="flex gap-0.5 mb-1.5 flex-wrap">
            {['Initialize', 'Collect', 'Assess', 'Report'].map((stage, i) => (
              <div key={i} className="flex items-center gap-0.5 px-1 py-0.5 bg-slate-700/50 rounded text-[5px] text-gray-300 border border-slate-600/30">
                <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                {stage}
              </div>
            ))}
          </div>

          {/* Control Categories - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-0.5">
            {categories.map((cat, i) => (
              <div key={i} className="bg-slate-900/30 rounded p-1.5 border border-slate-700/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-indigo-500/20 rounded flex items-center justify-center">
                      <cat.icon className="w-2 h-2 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-[6px] text-white font-medium block">{cat.name}</span>
                      <span className="text-[5px] text-gray-500">{cat.reqs} requirements</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.progress}%` }} />
                    </div>
                    <span className="text-[5px] text-emerald-400">{cat.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Events - Fixed Height */}
          <div className="mt-1.5 border-t border-slate-700/30 pt-1.5">
            <div className="text-[5px] text-gray-400 mb-1">Live Events</div>
            <div className="space-y-0.5 max-h-12 overflow-hidden">
              {events.slice(0, 4).map((event, i) => (
                <div key={i} className={`flex items-center gap-1 text-[5px] ${i === activeEvent % 4 ? 'text-white' : 'text-gray-500'}`}>
                  <Zap className={`w-2 h-2 ${event.type === 'gap' ? 'text-amber-400' : 'text-indigo-400'}`} />
                  <span className="truncate">{event.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-slate-800/30 rounded-xl p-2 border border-red-500/20 flex flex-col overflow-hidden">
          {/* Score and Grade */}
          <div className="flex items-center justify-between mb-2">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="126"
                  strokeDashoffset="126"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-red-400">0%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[6px] font-bold text-red-400 mb-0.5 inline-block">
                Non Compliant
              </div>
              <div className="text-[5px] text-gray-400">Critical gaps found</div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="bg-slate-900/50 rounded p-1 text-center">
              <div className="text-[5px] text-gray-500">Assessment</div>
              <div className="text-[6px] text-gray-300">1/15/2026</div>
            </div>
            <div className="bg-slate-900/50 rounded p-1 text-center">
              <div className="text-[5px] text-gray-500">Next Due</div>
              <div className="text-[6px] text-gray-300">4/15/2026</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-1.5 border-b border-slate-700/30 pb-1">
            {['Overview', 'Frameworks', 'Remediation'].map((tab, i) => (
              <span key={i} className={`text-[5px] px-1.5 py-0.5 rounded ${i === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500'}`}>
                {tab}
              </span>
            ))}
          </div>

          {/* Risk Areas */}
          <div className="text-[5px] text-gray-400 mb-1 flex items-center gap-0.5">
            <AlertTriangle className="w-2 h-2" /> Risk Areas
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="bg-red-500/10 border border-red-500/20 rounded p-1">
              <div className="flex items-center justify-between">
                <span className="text-[6px] text-gray-300">Access Control</span>
                <span className="text-[7px] font-bold text-red-400">1</span>
              </div>
              <span className="text-[5px] text-red-400">High</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-1">
              <div className="flex items-center justify-between">
                <span className="text-[6px] text-gray-300">Data Protection</span>
                <span className="text-[7px] font-bold text-amber-400">3</span>
              </div>
              <span className="text-[5px] text-amber-400">Medium</span>
            </div>
          </div>

          {/* Control Distribution */}
          <div className="text-[5px] text-gray-400 mb-1">Control Distribution</div>
          <div className="space-y-0.5 mb-2 flex-1">
            {[
              { label: 'Compliant', value: 0, color: 'emerald' },
              { label: 'Partial', value: 0, color: 'yellow' },
              { label: 'Non-Compliant', value: 0, color: 'red' },
              { label: 'N/A', value: 0, color: 'gray' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[5px]">
                <span className="text-gray-400">{item.label}</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: '0%' }} />
                  </div>
                  <span className="text-gray-500 w-8 text-right">{item.value} (0%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1 mt-auto">
            <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-500 rounded text-[6px] text-white font-medium">
              <Download className="w-2 h-2" /> Export
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-[6px] text-gray-300">
              <FileText className="w-2 h-2" /> Details
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 px-1 text-[6px]">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Engine: <span className="text-emerald-400">Ready</span></span>
          <span className="text-gray-500">Mode: <span className="text-indigo-400">GRC</span></span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">COMPLETE</span>
        </div>
      </div>
    </div>
  );
};

export default RuntimeGuardHomeVisual;

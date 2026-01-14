import React, { useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';

const FraudGuardHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate transaction flows
      gsap.to('.transaction-flow', {
        y: '100%',
        duration: 3,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.5,
          repeat: -1,
        },
      });

      // Pulse risk indicators
      gsap.to('.risk-pulse', {
        scale: 1.2,
        opacity: 0.6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // Animate detection stats
      gsap.to('.stat-bar', {
        scaleX: 1,
        duration: 2,
        ease: 'power2.out',
        stagger: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">FraudGuard</div>
              <div className="text-gray-400 text-xs">Real-time Monitoring</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 risk-pulse" />
            <span className="text-xs text-green-400 font-mono">ACTIVE</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Scanned', value: '12.4K', color: 'blue', icon: Activity },
            { label: 'Blocked', value: '247', color: 'red', icon: AlertTriangle },
            { label: 'Risk Score', value: '18', color: 'yellow', icon: TrendingUp },
            { label: 'Accuracy', value: '99.9%', color: 'green', icon: Shield },
          ].map((stat, i) => (
            <div key={i} className={`bg-slate-800/40 border border-${stat.color}-500/20 rounded-lg p-3`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-400 mb-1`} />
              <div className={`text-xl font-black text-${stat.color}-400 tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Live Transaction Monitor */}
        <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Live Transaction Feed</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>

          {/* Transaction List */}
          <div className="space-y-2 relative h-[calc(100%-2rem)]">
            {[
              { id: 'TXN-9432', amount: '$4,250', status: 'BLOCKED', risk: 'HIGH', color: 'red' },
              { id: 'TXN-9431', amount: '$1,890', status: 'APPROVED', risk: 'LOW', color: 'green' },
              { id: 'TXN-9430', amount: '$750', status: 'REVIEW', risk: 'MED', color: 'yellow' },
              { id: 'TXN-9429', amount: '$12,400', status: 'BLOCKED', risk: 'CRIT', color: 'red' },
              { id: 'TXN-9428', amount: '$950', status: 'APPROVED', risk: 'LOW', color: 'green' },
            ].map((txn, i) => (
              <div
                key={i}
                className="transaction-flow flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700/30 rounded-lg"
                style={{ transform: `translateY(-${i * 100}%)` }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${txn.color}-500 risk-pulse`} />
                  <div>
                    <div className="text-[10px] font-mono text-white">{txn.id}</div>
                    <div className="text-[9px] text-gray-500">{txn.amount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-${txn.color}-500/20 text-${txn.color}-400 border border-${txn.color}-500/30`}>
                    {txn.risk}
                  </span>
                  <span className={`text-[9px] font-bold text-${txn.color}-400`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detection Stats Bar */}
        <div className="mt-4 space-y-2">
          {[
            { label: 'Pattern Analysis', value: 94, color: 'bg-blue-500' },
            { label: 'Risk Assessment', value: 87, color: 'bg-orange-500' },
            { label: 'Fraud Detection', value: 99, color: 'bg-red-500' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-gray-400">{stat.label}</span>
                <span className="text-[9px] text-white font-bold">{stat.value}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`stat-bar h-full ${stat.color} rounded-full origin-left`}
                  style={{ transform: 'scaleX(0)', width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-red-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};

export default FraudGuardHomeVisual;

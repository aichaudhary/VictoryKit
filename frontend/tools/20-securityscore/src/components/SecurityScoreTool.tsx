/**
 * SecurityScore Tool Component - Tool 20 - Security Posture Scoring
 */
import { useState, useEffect } from 'react';
import { securityScoreApi, simulatedData, type ScoreDashboard, type ScoreCategory } from '../api/securityscore.api';

type TabType = 'dashboard' | 'breakdown' | 'trends' | 'improve';

export default function SecurityScoreTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<ScoreDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await securityScoreApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function getGradeColor(grade: string) { const colors: Record<string, string> = { A: 'text-green-400 bg-green-900/30', B: 'text-cyan-400 bg-cyan-900/30', C: 'text-yellow-400 bg-yellow-900/30', D: 'text-orange-400 bg-orange-900/30', F: 'text-red-400 bg-red-900/30' }; return colors[grade] || 'text-gray-400 bg-gray-900/30'; }
  function getScoreColor(score: number) { if (score >= 80) return 'text-green-400'; if (score >= 60) return 'text-cyan-400'; if (score >= 40) return 'text-yellow-400'; return 'text-red-400'; }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    const { currentScore } = dashboard;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-gray-800/50 rounded-xl p-6 border border-cyan-500/20 flex flex-col items-center justify-center">
            <p className="text-gray-400 text-sm mb-2">Overall Score</p>
            <div className="relative w-32 h-32"><svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" /><circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="10" strokeDasharray={`${currentScore.overallScore * 2.83} 283`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className={`text-3xl font-bold ${getScoreColor(currentScore.overallScore)}`}>{currentScore.overallScore}</span></div></div>
            <div className={`mt-4 px-4 py-2 rounded-lg text-2xl font-bold ${getGradeColor(currentScore.grade)}`}>{currentScore.grade}</div>
          </div>
          <div className="col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-4">{currentScore.categories.map((cat: ScoreCategory) => (<div key={cat.name} className="space-y-1"><div className="flex justify-between"><span className="text-gray-300">{cat.name}</span><span className={getScoreColor(cat.score)}>{cat.score}/{cat.maxScore}</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${cat.score >= 80 ? 'bg-green-500' : cat.score >= 60 ? 'bg-cyan-500' : cat.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${cat.score}%` }} /></div></div>))}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-gray-400 text-sm">vs Industry</p><p className={`text-xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.industry ? 'text-green-400' : 'text-red-400'}`}>{currentScore.overallScore >= currentScore.benchmarkComparison.industry ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.industry} pts</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-gray-400 text-sm">vs Peers</p><p className={`text-xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.peers ? 'text-green-400' : 'text-red-400'}`}>{currentScore.overallScore >= currentScore.benchmarkComparison.peers ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.peers} pts</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-gray-400 text-sm">vs Previous</p><p className={`text-xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.previous ? 'text-green-400' : 'text-red-400'}`}>{currentScore.overallScore >= currentScore.benchmarkComparison.previous ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.previous} pts</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Top Improvements</h3>
          <div className="space-y-3">{dashboard.improvements.map((imp, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">+{imp.impact}</div><div><p className="text-white">{imp.action}</p><p className="text-gray-500 text-sm">{imp.category}</p></div></div><span className={`px-2 py-1 rounded text-sm ${imp.effort === 'Low' ? 'bg-green-900/30 text-green-400' : imp.effort === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>{imp.effort} Effort</span></div>))}</div>
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '🎯' }, { id: 'breakdown' as TabType, label: 'Breakdown', icon: '📊' }, { id: 'trends' as TabType, label: 'Trends', icon: '📈' }, { id: 'improve' as TabType, label: 'Improve', icon: '🚀' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">🎯</div><div><h1 className="text-xl font-bold">SecurityScore</h1><p className="text-gray-400 text-sm">Security Posture Scoring</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-cyan-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'breakdown' && <div className="text-gray-400 text-center py-12">Detailed score breakdown coming soon...</div>}
        {!loading && activeTab === 'trends' && <div className="text-gray-400 text-center py-12">Score trends over time coming soon...</div>}
        {!loading && activeTab === 'improve' && <div className="text-gray-400 text-center py-12">Improvement recommendations coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">SecurityScore Tool 20 • VictoryKit Security Platform</div></footer>
    </div>
  );
}

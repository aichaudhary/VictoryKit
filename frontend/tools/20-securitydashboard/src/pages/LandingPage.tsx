/**
 * Landing Page - SecurityDashboard Tool 20
 * Marketing landing page for the tool
 */

import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Security<span className="text-emerald-400">Score</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Unified security posture scoring and benchmarking. 
              Get a comprehensive view of your security health with real-time metrics and industry comparisons.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/maula')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
              >
                Launch Tool
              </button>
              <button
                onClick={() => navigate('/maula/ai')}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg border border-emerald-500/30 transition-all duration-200"
              >
                🧠 AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Unified Score</h3>
            <p className="text-gray-400">Single score aggregating all security metrics for executive-level visibility.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
              📈
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Trend Analysis</h3>
            <p className="text-gray-400">Track security improvements over time with historical trending.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
              🎯
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Benchmarking</h3>
            <p className="text-gray-400">Compare your security posture against industry peers and standards.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        Part of the VictoryKit Security Platform • Tool 20 of 50
      </div>
    </div>
  );
}

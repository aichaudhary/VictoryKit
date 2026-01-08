/**
 * Landing Page - PasswordVault Tool 33
 * Marketing landing page for the tool
 */

import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-4xl">🔑</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Password<span className="text-amber-400">Vault</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Enterprise-grade password management with AI-powered security. 
              Secure storage, rotation policies, and breach detection for all credentials.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/maula')}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-amber-500/30"
              >
                Launch Tool
              </button>
              <button
                onClick={() => navigate('/maula/ai')}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg border border-amber-500/30 transition-all duration-200"
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
              🔐
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Storage</h3>
            <p className="text-gray-400">AES-256 encryption with hardware security module integration.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
              🔄
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Auto-Rotation</h3>
            <p className="text-gray-400">Automated password rotation with policy enforcement.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
              🚨
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Breach Detection</h3>
            <p className="text-gray-400">Real-time monitoring against known data breaches.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        Part of the VictoryKit Security Platform • Tool 33 of 50
      </div>
    </div>
  );
}

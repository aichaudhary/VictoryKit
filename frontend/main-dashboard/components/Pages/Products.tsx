
import React from 'react';
import { Shield, ChevronRight, Zap, Lock, Globe, Server, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const products = [
  {
    id: 1,
    name: 'FraudGuard',
    description: 'AI-powered fraud detection with 99.9% accuracy. Real-time transaction monitoring and behavioral analytics.',
    icon: ShieldCheck,
    color: 'from-red-500 to-pink-500',
    features: ['Real-time monitoring', 'ML pattern recognition', 'Custom rules engine'],
    price: '$299/mo'
  },
  {
    id: 2,
    name: 'ThreatRadar',
    description: '360° threat visibility across your entire infrastructure with AI-driven prioritization.',
    icon: Eye,
    color: 'from-blue-500 to-cyan-500',
    features: ['Unified visibility', 'AI prioritization', 'Auto-remediation'],
    price: '$399/mo'
  },
  {
    id: 3,
    name: 'VulnScan Pro',
    description: 'Continuous vulnerability scanning with zero false positives and instant remediation guides.',
    icon: Server,
    color: 'from-green-500 to-emerald-500',
    features: ['24/7 scanning', 'Zero false positives', 'Auto-patching'],
    price: '$249/mo'
  },
  {
    id: 4,
    name: 'CloudShield',
    description: 'Multi-cloud security posture management. AWS, Azure, GCP unified protection.',
    icon: Globe,
    color: 'from-purple-500 to-violet-500',
    features: ['Multi-cloud support', 'Compliance automation', 'Cost optimization'],
    price: '$499/mo'
  },
  {
    id: 5,
    name: 'IdentityFortress',
    description: 'Zero-trust identity management with biometric MFA and behavioral authentication.',
    icon: Lock,
    color: 'from-orange-500 to-amber-500',
    features: ['Biometric MFA', 'SSO integration', 'Privileged access'],
    price: '$199/mo'
  },
  {
    id: 6,
    name: 'AI SecOps',
    description: 'Autonomous security operations center. 24/7 AI-driven threat hunting and response.',
    icon: Zap,
    color: 'from-pink-500 to-rose-500',
    features: ['Autonomous SOC', 'Threat hunting', 'Incident response'],
    price: '$799/mo'
  },
];

const Products: React.FC = () => {
  const { setView } = useAuth();

  return (
    <div className="min-h-screen bg-[#02000a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-[#02000a]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-purple-600 p-2 rounded-lg">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <span className="text-white border-b-2 border-purple-500 pb-1">Products</span>
          <span onClick={() => setView('solutions')} className="hover:text-white cursor-pointer transition-colors">Solutions</span>
          <span onClick={() => setView('docs')} className="hover:text-white cursor-pointer transition-colors">Docs</span>
          <span onClick={() => setView('pricing')} className="hover:text-white cursor-pointer transition-colors">Pricing</span>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setView('login')} className="text-sm font-medium text-white hover:text-purple-400 transition-colors">Log in</button>
          <button onClick={() => setView('signup')} className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-50 transition-all">
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">50+ Security Tools</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Enterprise Security<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Complete security coverage with AI-powered tools designed for modern enterprises. Deploy in minutes, protect forever.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id}
              className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:bg-white/10"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <product.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">{product.description}</p>
              <ul className="space-y-2 mb-8">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-400">{product.price}</span>
                <button 
                  onClick={() => setView('signup')}
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-purple-400 transition-colors"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your enterprise?</h2>
          <p className="text-gray-400 mb-8">Start your 14-day free trial. No credit card required.</p>
          <button 
            onClick={() => setView('signup')}
            className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-purple-100 transition-colors"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <span>© 2026 MAULA.AI. All rights reserved.</span>
          <div className="flex gap-6">
            <span onClick={() => setView('landing')} className="hover:text-white cursor-pointer">Home</span>
            <span onClick={() => setView('docs')} className="hover:text-white cursor-pointer">Documentation</span>
            <span onClick={() => setView('pricing')} className="hover:text-white cursor-pointer">Pricing</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;


import React from 'react';
import { Shield, ChevronRight, Building2, Landmark, Heart, ShoppingCart, Plane, Factory, GraduationCap, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const industries = [
  {
    id: 1,
    name: 'Financial Services',
    description: 'Protect banking, trading, and fintech platforms with real-time fraud detection and compliance automation.',
    icon: Landmark,
    color: 'from-blue-500 to-cyan-500',
    stats: { clients: '200+', threats: '99.9%', compliance: 'SOC2, PCI-DSS' }
  },
  {
    id: 2,
    name: 'Healthcare',
    description: 'HIPAA-compliant security for patient data, medical devices, and healthcare infrastructure.',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    stats: { clients: '150+', threats: '99.8%', compliance: 'HIPAA, HITRUST' }
  },
  {
    id: 3,
    name: 'E-Commerce',
    description: 'Secure transactions, prevent account takeovers, and protect customer data at scale.',
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-500',
    stats: { clients: '500+', threats: '99.9%', compliance: 'PCI-DSS, GDPR' }
  },
  {
    id: 4,
    name: 'Government',
    description: 'FedRAMP authorized solutions for federal, state, and local government agencies.',
    icon: Building2,
    color: 'from-purple-500 to-violet-500',
    stats: { clients: '50+', threats: '99.99%', compliance: 'FedRAMP, FISMA' }
  },
  {
    id: 5,
    name: 'Travel & Hospitality',
    description: 'Protect reservation systems, loyalty programs, and guest data across global operations.',
    icon: Plane,
    color: 'from-orange-500 to-amber-500',
    stats: { clients: '100+', threats: '99.7%', compliance: 'GDPR, CCPA' }
  },
  {
    id: 6,
    name: 'Manufacturing',
    description: 'Secure OT/IT convergence, protect supply chains, and defend against industrial espionage.',
    icon: Factory,
    color: 'from-gray-500 to-slate-500',
    stats: { clients: '80+', threats: '99.8%', compliance: 'NIST, IEC 62443' }
  },
  {
    id: 7,
    name: 'Education',
    description: 'Protect student data, research IP, and campus networks from sophisticated threats.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-blue-500',
    stats: { clients: '300+', threats: '99.6%', compliance: 'FERPA, GDPR' }
  },
  {
    id: 8,
    name: 'Technology',
    description: 'DevSecOps integration, API security, and cloud-native protection for tech companies.',
    icon: Cpu,
    color: 'from-pink-500 to-rose-500',
    stats: { clients: '400+', threats: '99.9%', compliance: 'SOC2, ISO 27001' }
  },
];

const Solutions: React.FC = () => {
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
          <span onClick={() => setView('products')} className="hover:text-white cursor-pointer transition-colors">Products</span>
          <span className="text-white border-b-2 border-purple-500 pb-1">Solutions</span>
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Industry<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Solutions</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Tailored security solutions for every industry. Compliance-ready, battle-tested, and trusted by Fortune 500 companies.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry) => (
            <div 
              key={industry.id}
              className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <industry.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{industry.name}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{industry.description}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{industry.stats.clients}</div>
                      <div className="text-xs text-gray-500 uppercase">Clients</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{industry.stats.threats}</div>
                      <div className="text-xs text-gray-500 uppercase">Detection</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-purple-400">{industry.stats.compliance}</div>
                      <div className="text-xs text-gray-500 uppercase">Compliance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't see your industry?</h2>
          <p className="text-gray-400 mb-8">Contact our team for a custom security solution tailored to your needs.</p>
          <button 
            onClick={() => setView('signup')}
            className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-purple-100 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <span>© 2026 MAULA.AI. All rights reserved.</span>
          <div className="flex gap-6">
            <span onClick={() => setView('landing')} className="hover:text-white cursor-pointer">Home</span>
            <span onClick={() => setView('products')} className="hover:text-white cursor-pointer">Products</span>
            <span onClick={() => setView('pricing')} className="hover:text-white cursor-pointer">Pricing</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Solutions;

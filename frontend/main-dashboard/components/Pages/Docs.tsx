
import React, { useState } from 'react';
import { Shield, ChevronRight, Search, Book, Code, Zap, Settings, FileText, Video, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const docCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Zap,
    articles: [
      { title: 'Quick Start Guide', time: '5 min read', description: 'Get up and running with MAULA.AI in minutes.' },
      { title: 'Installation', time: '3 min read', description: 'Install the MAULA agent on your infrastructure.' },
      { title: 'First Scan', time: '4 min read', description: 'Run your first security scan and understand results.' },
      { title: 'Dashboard Overview', time: '6 min read', description: 'Navigate the security dashboard like a pro.' },
    ]
  },
  {
    id: 'api-reference',
    name: 'API Reference',
    icon: Code,
    articles: [
      { title: 'Authentication', time: '4 min read', description: 'API keys, OAuth, and service accounts.' },
      { title: 'REST API', time: '10 min read', description: 'Complete REST API documentation.' },
      { title: 'Webhooks', time: '5 min read', description: 'Real-time event notifications.' },
      { title: 'Rate Limits', time: '2 min read', description: 'Understanding API quotas and limits.' },
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Settings,
    articles: [
      { title: 'AWS Integration', time: '8 min read', description: 'Connect MAULA to your AWS environment.' },
      { title: 'Azure Integration', time: '8 min read', description: 'Secure your Azure resources.' },
      { title: 'GCP Integration', time: '7 min read', description: 'Google Cloud Platform setup.' },
      { title: 'SIEM Integration', time: '6 min read', description: 'Connect to Splunk, Sentinel, and more.' },
    ]
  },
  {
    id: 'guides',
    name: 'Guides & Tutorials',
    icon: Book,
    articles: [
      { title: 'Zero Trust Implementation', time: '15 min read', description: 'Step-by-step zero trust architecture.' },
      { title: 'Compliance Automation', time: '12 min read', description: 'Automate SOC2, HIPAA, PCI compliance.' },
      { title: 'Incident Response', time: '10 min read', description: 'Handle security incidents effectively.' },
      { title: 'Threat Hunting', time: '20 min read', description: 'Proactive threat hunting techniques.' },
    ]
  },
];

const resources = [
  { icon: FileText, title: 'Changelog', description: 'Latest updates and features' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step visual guides' },
  { icon: MessageCircle, title: 'Community', description: 'Join 10k+ security pros' },
];

const Docs: React.FC = () => {
  const { setView } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const activeDoc = docCategories.find(c => c.id === activeCategory);

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
          <span onClick={() => setView('solutions')} className="hover:text-white cursor-pointer transition-colors">Solutions</span>
          <span className="text-white border-b-2 border-purple-500 pb-1">Docs</span>
          <span onClick={() => setView('pricing')} className="hover:text-white cursor-pointer transition-colors">Pricing</span>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setView('login')} className="text-sm font-medium text-white hover:text-purple-400 transition-colors">Log in</button>
          <button onClick={() => setView('signup')} className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-50 transition-all">
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero with Search */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Documentation
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Everything you need to integrate, configure, and master MAULA.AI security platform.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-7xl mx-auto flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-32 space-y-2">
              {docCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-purple-500/20 text-white border border-purple-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </nav>

            <div className="mt-12 space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Resources</h4>
              {resources.map((resource, idx) => (
                <button key={idx} className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  <resource.icon className="w-4 h-4" />
                  <span className="text-sm">{resource.title}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Articles */}
          <main className="flex-1">
            <div className="flex items-center gap-3 mb-8">
              {activeDoc && <activeDoc.icon className="w-8 h-8 text-purple-400" />}
              <h2 className="text-3xl font-bold">{activeDoc?.name}</h2>
            </div>

            <div className="grid gap-4">
              {activeDoc?.articles.map((article, idx) => (
                <div 
                  key={idx}
                  className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{article.title}</h3>
                      <p className="text-gray-400 mb-3">{article.description}</p>
                      <span className="text-xs text-gray-500">{article.time}</span>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <span>© 2026 MAULA.AI. All rights reserved.</span>
          <div className="flex gap-6">
            <span onClick={() => setView('landing')} className="hover:text-white cursor-pointer">Home</span>
            <span onClick={() => setView('products')} className="hover:text-white cursor-pointer">Products</span>
            <span onClick={() => setView('solutions')} className="hover:text-white cursor-pointer">Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Docs;

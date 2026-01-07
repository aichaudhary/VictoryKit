
import React from 'react';
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScroll } from '../context/ScrollContext';

const Footer: React.FC = () => {
  const { setView } = useAuth();
  const { setCurrentSection } = useScroll();

  // Helper to scroll to specific tool indices on the landing page
  const navigateToTool = (index: number) => {
    const heroHeight = window.innerHeight;
    const sectionHeight = window.innerHeight * 1.2; // Matches 120vh section height
    
    window.scrollTo({
      top: heroHeight + (index * sectionHeight),
      behavior: 'smooth'
    });
    setCurrentSection(index);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentSection(-1);
  };

  return (
    <footer className="relative bg-[#05001a] border-t border-white/5 py-24 px-6 md:px-24 z-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={scrollToTop}
          >
            <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
          </div>
          <p className="text-gray-500 leading-relaxed text-sm">
            The world's first autonomous AI security network. Decentralized protection for the modern enterprise.
          </p>
          <div className="flex items-center gap-4 text-gray-400">
            <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Github className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Linkedin className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Mail className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest">Platform</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li onClick={() => navigateToTool(0)} className="hover:text-purple-400 cursor-pointer transition-colors">Defense Modules</li>
            <li onClick={() => navigateToTool(15)} className="hover:text-purple-400 cursor-pointer transition-colors">AI Infrastructure</li>
            <li onClick={() => navigateToTool(16)} className="hover:text-purple-400 cursor-pointer transition-colors">API Integration</li>
            <li onClick={() => navigateToTool(49)} className="hover:text-purple-400 cursor-pointer transition-colors">Global Shield</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest">Company</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li onClick={() => setView('signup')} className="hover:text-purple-400 cursor-pointer transition-colors">About Us</li>
            <li onClick={() => setView('signup')} className="hover:text-purple-400 cursor-pointer transition-colors">Careers</li>
            <li onClick={() => setView('login')} className="hover:text-purple-400 cursor-pointer transition-colors">Press Kit</li>
            <li onClick={() => setView('login')} className="hover:text-purple-400 cursor-pointer transition-colors">Contact</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest">Subscribe</h4>
          <p className="text-gray-500 text-sm mb-4">Get the latest threat intelligence reports.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-purple-500 text-white" 
            />
            <button 
              onClick={() => setView('signup')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
            >
              Join
            </button>
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
        <div>© 2026 MAULA.AI. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setView('login')}>PRIVACY POLICY</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setView('login')}>TERMS OF SERVICE</span>
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setView('login')}>SECURITY DISCLOSURE</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

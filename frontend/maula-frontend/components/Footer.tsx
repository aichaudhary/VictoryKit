
import React from 'react';
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { useScroll } from '../context/ScrollContext';

const Footer: React.FC = () => {
  const { setView } = useScroll();

  return (
    <footer className="relative bg-[#05001a] border-t border-white/5 py-24 px-6 md:px-24 z-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="col-span-1 md:col-span-1 space-y-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-purple-600 p-2 rounded-lg">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
          </div>
          <p className="text-gray-500 leading-relaxed">
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
            <li onClick={() => setView('home')} className="hover:text-purple-400 cursor-pointer">Defense Modules</li>
            <li onClick={() => setView('products')} className="hover:text-purple-400 cursor-pointer">AI Infrastructure</li>
            <li onClick={() => setView('solutions')} className="hover:text-purple-400 cursor-pointer">API Integration</li>
            <li onClick={() => setView('global-shield-detail')} className="hover:text-purple-400 cursor-pointer">Global Shield</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest">Company</h4>
          <ul className="space-y-4 text-gray-500 text-sm">
            <li onClick={() => setView('about-us')} className="hover:text-purple-400 cursor-pointer">About Us</li>
            <li onClick={() => setView('careers')} className="hover:text-purple-400 cursor-pointer">Careers</li>
            <li onClick={() => setView('press-kit')} className="hover:text-purple-400 cursor-pointer">Press Kit</li>
            <li onClick={() => setView('contact')} className="hover:text-purple-400 cursor-pointer">Contact</li>
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
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors whitespace-nowrap">Join Now</button>
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
        <div>© 2026 MAULA.AI. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-8">
          <span onClick={() => setView('privacy-policy')} className="hover:text-white cursor-pointer">PRIVACY POLICY</span>
          <span onClick={() => setView('terms-of-service')} className="hover:text-white cursor-pointer">TERMS OF SERVICE</span>
          <span onClick={() => setView('security-disclosure')} className="hover:text-white cursor-pointer">SECURITY DISCLOSURE</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

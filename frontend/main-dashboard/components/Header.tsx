
import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { useScroll } from '../context/ScrollContext';

const Header: React.FC = () => {
  const { setView } = useScroll();

  return (
    <header className="fixed top-0 left-0 w-full z-[100] glass px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300">
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => setView('home')}
      >
        <div className="bg-purple-600 p-2 rounded-lg">
          <Shield className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <button onClick={() => setView('products')} className="hover:text-white transition-colors">Products</button>
        <button onClick={() => setView('solutions')} className="hover:text-white transition-colors">Solutions</button>
        <button onClick={() => setView('docs')} className="hover:text-white transition-colors">Docs</button>
        <button onClick={() => setView('pricing')} className="hover:text-white transition-colors">Pricing</button>
      </nav>

      <div className="flex items-center gap-4">
        <button className="hidden sm:block text-sm font-medium text-white hover:text-purple-400 transition-colors">Log in</button>
        <button 
          onClick={() => setView('products')}
          className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-50 transition-all"
        >
          Get Started <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;

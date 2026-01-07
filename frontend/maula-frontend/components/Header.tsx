
import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { setView } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-[100] glass px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="bg-purple-600 p-2 rounded-lg">
          <Shield className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <a href="#" className="hover:text-white transition-colors">Products</a>
        <a href="#" className="hover:text-white transition-colors">Solutions</a>
        <a href="#" className="hover:text-white transition-colors">Docs</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setView('login')}
          className="hidden sm:block text-sm font-medium text-white hover:text-purple-400 transition-colors"
        >
          Log in
        </button>
        <button 
          onClick={() => setView('signup')}
          className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-50 transition-all"
        >
          Get Started <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;

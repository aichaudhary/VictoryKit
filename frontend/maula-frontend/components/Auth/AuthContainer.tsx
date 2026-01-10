
import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';

const AuthContainer: React.FC<{ children: React.ReactNode; title: string; subtitle: string; showBack?: boolean }> = ({ children, title, subtitle, showBack = true }) => {
  const { setView: setAuthView } = useAuth();
  const { setView: setScrollView } = useScroll();

  const handleBackToHome = () => {
    setScrollView('home');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#02000a] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div 
            className="bg-purple-600 p-3 rounded-2xl shadow-xl shadow-purple-900/40 mb-4 cursor-pointer hover:scale-110 transition-transform"
            onClick={handleBackToHome}
          >
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter cursor-pointer" onClick={handleBackToHome}>Maula<span className="text-purple-500">.ai</span></h1>
        </div>

        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          {showBack && (
            <button 
              onClick={handleBackToHome}
              className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors flex items-center gap-1 group"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/40">{subtitle}</p>
          </div>

          {children}
        </div>
        
        <p className="mt-8 text-center text-xs font-bold text-white/20 uppercase tracking-[0.2em]">
          Secured by Maula Neural Network v5.0
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;

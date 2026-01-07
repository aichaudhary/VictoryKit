
import React from 'react';
import { Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthContainer from './AuthContainer';

const Login: React.FC = () => {
  const { setView, login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <AuthContainer title="Welcome Back" subtitle="Verify your identity to access the command center.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type="email" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
              placeholder="admin@maula.ai"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Password</label>
            <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black uppercase text-purple-500 hover:text-purple-400 transition-colors">Forgot?</button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type="password" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-6"
        >
          LOG IN <ChevronRight className="w-4 h-4" />
        </button>

        <div className="pt-4 text-center">
          <p className="text-xs text-white/40">
            New to the shield? {' '}
            <button type="button" onClick={() => setView('signup')} className="font-bold text-white hover:text-purple-400 transition-colors underline decoration-purple-500/30">Create an account</button>
          </p>
        </div>
      </form>
    </AuthContainer>
  );
};

export default Login;

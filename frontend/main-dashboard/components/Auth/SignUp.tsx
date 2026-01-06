
import React from 'react';
import { User, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthContainer from './AuthContainer';

const SignUp: React.FC = () => {
  const { setView, login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <AuthContainer title="Join the Network" subtitle="Create your secure access profile today.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
            <input 
              type="text" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
              placeholder="John Matrix"
            />
          </div>
        </div>

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
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Security Key</label>
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
          className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-6"
        >
          DEPLOY ACCOUNT <ShieldCheck className="w-4 h-4" />
        </button>

        <div className="pt-4 text-center">
          <p className="text-xs text-white/40">
            Already registered? {' '}
            <button type="button" onClick={() => setView('login')} className="font-bold text-white hover:text-purple-400 transition-colors underline decoration-purple-500/30">Log in here</button>
          </p>
        </div>
      </form>
    </AuthContainer>
  );
};

export default SignUp;

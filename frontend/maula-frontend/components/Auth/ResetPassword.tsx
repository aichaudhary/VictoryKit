
import React from 'react';
import { Lock, ShieldAlert, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthContainer from './AuthContainer';

const ResetPassword: React.FC = () => {
  const { setView } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('login');
  };

  return (
    <AuthContainer title="New Credentials" subtitle="Define your new tactical security key.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">New Password</label>
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

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Confirm New Password</label>
          <div className="relative group">
            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
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
          UPDATE PASSWORD <ChevronRight className="w-4 h-4" />
        </button>
      </form>
    </AuthContainer>
  );
};

export default ResetPassword;

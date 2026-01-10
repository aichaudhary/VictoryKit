
import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthContainer from './AuthContainer';

const ForgotPassword: React.FC = () => {
  const { setView } = useAuth();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <AuthContainer title="Check Your Inbox" subtitle="A recovery signal has been dispatched to your email." showBack>
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <button 
            onClick={() => setView('reset')}
            className="w-full bg-white/5 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
          >
            I received the link
          </button>
        </div>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer title="Recover Access" subtitle="Enter your email to receive a secure recovery link." showBack>
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <button 
          type="submit"
          className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
        >
          SEND LINK <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 text-center">
          <button 
            type="button" 
            onClick={() => setView('login')} 
            className="text-xs font-bold text-white/40 hover:text-white transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </AuthContainer>
  );
};

export default ForgotPassword;

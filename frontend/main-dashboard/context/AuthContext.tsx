
import React, { createContext, useContext, useState } from 'react';

type AuthView = 'landing' | 'login' | 'signup' | 'forgot' | 'reset' | 'dashboard' | 'products' | 'solutions' | 'docs' | 'pricing';

interface AuthContextType {
  view: AuthView;
  setView: (view: AuthView) => void;
  user: any | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start on the public landing page
  const [view, setView] = useState<AuthView>('landing');
  const [user, setUser] = useState<any | null>(null);

  const login = () => {
    setUser({ name: 'Security Admin', email: 'admin@maula.ai', tier: 'Enterprise' });
    // Redirect to dashboard upon successful login
    setView('dashboard');
  };

  const logout = () => {
    setUser(null);
    setView('landing');
  };

  return (
    <AuthContext.Provider value={{ view, setView, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthContextType {
  isAuthenticated: boolean;
  view: AuthView;
  login: () => void;
  logout: () => void;
  setView: (view: AuthView) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<AuthView>('login');

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, view, login, logout, setView }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


import React, { useEffect, useMemo } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import OptimizedToolSection from './components/OptimizedToolSection';
import SideNavigation from './components/SideNavigation';
import Footer from './components/Footer';
import AIInterface from './components/AIInterface';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Pages/Products';
import Solutions from './components/Pages/Solutions';
import Docs from './components/Pages/Docs';
import Pricing from './components/Pages/Pricing';
import { ScrollProvider, useScroll } from './context/ScrollContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { tools } from './data/tools';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MainContent: React.FC = () => {
  const { currentSection } = useScroll();
  const { view } = useAuth();

  const currentBg = useMemo(() => {
    if (currentSection < 0) return '#02000a';
    return tools[currentSection]?.theme?.bgStop || '#02000a';
  }, [currentSection]);

  useEffect(() => {
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    
    gsap.defaults({
      ease: 'power3.out',
      duration: 1.2
    });

    window.onload = () => {
      ScrollTrigger.refresh();
    };
  }, []);

  // Conditional Rendering based on Auth View
  if (view === 'login') return <Login />;
  if (view === 'signup') return <SignUp />;
  if (view === 'forgot') return <ForgotPassword />;
  if (view === 'reset') return <ResetPassword />;
  if (view === 'dashboard') return <Dashboard />;
  if (view === 'products') return <Products />;
  if (view === 'solutions') return <Solutions />;
  if (view === 'docs') return <Docs />;
  if (view === 'pricing') return <Pricing />;

  // Default: Landing/Home Page
  return (
    <div 
      className="text-white selection:bg-white/10 transition-colors duration-1000 ease-in-out relative min-h-screen"
      style={{ backgroundColor: currentBg }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[999]" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#02000a]/30 to-[#02000a]/90 z-0" />

      <Header />
      <SideNavigation />
      
      <AIInterface onUpdateImage={() => {}} />
      
      <main className="relative z-10">
        <HeroSection />
        <div className="space-y-0">
          {tools.map((tool, index) => (
            <OptimizedToolSection 
              key={tool.id} 
              tool={tool} 
              index={index} 
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ScrollProvider>
        <MainContent />
      </ScrollProvider>
    </AuthProvider>
  );
};

export default App;

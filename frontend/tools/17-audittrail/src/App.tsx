import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import AuditLogs from './components/AuditLogs';
import ComplianceReports from './components/ComplianceReports';
import SecurityEvents from './components/SecurityEvents';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RealTimeMonitor from './components/RealTimeMonitor';
import NeuralLinkInterface from './components/NeuralLinkInterface';
import LandingPage from './pages/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

// Full tool experience with sidebar layout
function AuditTrailExperience() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<AuditLogs />} />
            <Route path="/compliance" element={<ComplianceReports />} />
            <Route path="/security" element={<SecurityEvents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <RealTimeMonitor />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/maula/*" element={<AuditTrailExperience />} />
        <Route path="/maula/ai" element={<NeuralLinkInterface />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;

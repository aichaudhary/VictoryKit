import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import TrafficMonitor from './pages/TrafficMonitor.tsx';
import AttackDetection from './pages/AttackDetection.tsx';
import MitigationCenter from './pages/MitigationCenter.tsx';
import ProtectionRules from './pages/ProtectionRules.tsx';
import Analytics from './pages/Analytics.tsx';
import IncidentResponse from './pages/IncidentResponse.tsx';
import Settings from './pages/Settings.tsx';

// Components
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/traffic-monitor" element={<TrafficMonitor />} />
              <Route path="/attack-detection" element={<AttackDetection />} />
              <Route path="/mitigation-center" element={<MitigationCenter />} />
              <Route path="/protection-rules" element={<ProtectionRules />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/incident-response" element={<IncidentResponse />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to={BASE_PATH} replace />} />
              <Route path={`${BASE_PATH}`} element={<Dashboard />} />
              <Route path={`${BASE_PATH}/traffic-monitor`} element={<TrafficMonitor />} />
              <Route path={`${BASE_PATH}/attack-detection`} element={<AttackDetection />} />
              <Route path={`${BASE_PATH}/mitigation-center`} element={<MitigationCenter />} />
              <Route path={`${BASE_PATH}/protection-rules`} element={<ProtectionRules />} />
              <Route path={`${BASE_PATH}/analytics`} element={<Analytics />} />
              <Route path={`${BASE_PATH}/incident-response`} element={<IncidentResponse />} />
              <Route path={`${BASE_PATH}/settings`} element={<Settings />} />
              <Route path={`${BASE_PATH}/ai`} element={<NeuralLinkInterface />} />
              <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
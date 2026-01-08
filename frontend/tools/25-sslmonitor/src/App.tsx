import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CertificateMonitor from './pages/CertificateMonitor';
import DomainManager from './pages/DomainManager';
import AlertCenter from './pages/AlertCenter';
import ScanManager from './pages/ScanManager';
import Analytics from './pages/Analytics';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';
import './App.css';
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to={BASE_PATH} replace />} />
              <Route path={`${BASE_PATH}`} element={<Dashboard />} />
              <Route path={`${BASE_PATH}/certificates`} element={<CertificateMonitor />} />
              <Route path={`${BASE_PATH}/domains`} element={<DomainManager />} />
              <Route path={`${BASE_PATH}/alerts`} element={<AlertCenter />} />
              <Route path={`${BASE_PATH}/scans`} element={<ScanManager />} />
              <Route path={`${BASE_PATH}/analytics`} element={<Analytics />} />
              <Route path={`${BASE_PATH}/compliance`} element={<Compliance />} />
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/certificates" element={<CertificateMonitor />} />
              <Route path="/domains" element={<DomainManager />} />
              <Route path="/alerts" element={<AlertCenter />} />
              <Route path="/scans" element={<ScanManager />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
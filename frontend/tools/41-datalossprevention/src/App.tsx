/**
 * App Component - Main Router
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import Incidents from './pages/Incidents';
import Discovery from './pages/Discovery';
import UsersRisk from './pages/UsersRisk';
import Compliance from './pages/Compliance';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-dlp-darker">
        <Navigation />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:id" element={<Incidents />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/users" element={<UsersRisk />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
    dataTypesProtected: 0,
    endpointsMonitored: 0,
    cloudAppsConnected: 0
  });
  const [incidentCount, setIncidentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
export default App;

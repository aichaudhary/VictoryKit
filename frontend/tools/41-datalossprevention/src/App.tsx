/**
 * App Component - Main Router
 */

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import NeuralLinkInterface from '../../../neural-link-interface/App';
import Dashboard from './pages/Dashboard';
import Policies from './pages/Policies';
import Incidents from './pages/Incidents';
import Discovery from './pages/Discovery';
import UsersRisk from './pages/UsersRisk';
import Compliance from './pages/Compliance';
import Navigation from './components/Navigation';

const DataLossPreventionLayout: React.FC = () => (
  <div className="flex min-h-screen bg-dlp-darker">
    <Navigation />
    <main className="flex-1 ml-64">
      <Outlet />
    </main>
  </div>
);

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/maula" replace />} />
    <Route path="/maula" element={<DataLossPreventionLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="policies" element={<Policies />} />
      <Route path="incidents" element={<Incidents />} />
      <Route path="incidents/:id" element={<Incidents />} />
      <Route path="discovery" element={<Discovery />} />
      <Route path="users" element={<UsersRisk />} />
      <Route path="compliance" element={<Compliance />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
    <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    <Route path="*" element={<Navigate to="/maula" replace />} />
  </Routes>
);

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

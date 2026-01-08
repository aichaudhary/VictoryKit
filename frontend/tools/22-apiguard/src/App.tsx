import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import APIInventory from './pages/APIInventory';
import APIDetail from './pages/APIDetail';
import Endpoints from './pages/Endpoints';
import SecurityScanner from './pages/SecurityScanner';
import Policies from './pages/Policies';
import PolicyEditor from './pages/PolicyEditor';
import Anomalies from './pages/Anomalies';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`${BASE_PATH}/dashboard`} replace />} />
        <Route path={`${BASE_PATH}`} element={<Layout />}>
          <Route index element={<Navigate to={`${BASE_PATH}/dashboard`} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apis" element={<APIInventory />} />
          <Route path="apis/:apiId" element={<APIDetail />} />
          <Route path="endpoints" element={<Endpoints />} />
          <Route path="security" element={<SecurityScanner />} />
          <Route path="policies" element={<Policies />} />
          <Route path="policies/:id" element={<PolicyEditor />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path={`${BASE_PATH}/ai`} element={<NeuralLinkInterface />} />
        <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

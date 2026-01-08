import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BotTraffic from './pages/BotTraffic';
import DetectedBots from './pages/DetectedBots';
import Challenges from './pages/Challenges';
import Fingerprints from './pages/Fingerprints';
import RulesEngine from './pages/RulesEngine';
import IPReputation from './pages/IPReputation';
import Analytics from './pages/Analytics';
import Incidents from './pages/Incidents';
import Settings from './pages/Settings';
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={BASE_PATH} replace />} />
      <Route path={`${BASE_PATH}`} element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="traffic" element={<BotTraffic />} />
        <Route path="bots" element={<DetectedBots />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="fingerprints" element={<Fingerprints />} />
        <Route path="rules" element={<RulesEngine />} />
        <Route path="reputation" element={<IPReputation />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path={`${BASE_PATH}/ai`} element={<NeuralLinkInterface />} />
      <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
    </Routes>
  );
}

export default App;

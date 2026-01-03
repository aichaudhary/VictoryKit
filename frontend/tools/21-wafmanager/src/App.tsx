import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WAFInstances from './pages/WAFInstances';
import RulesManager from './pages/RulesManager';
import PoliciesManager from './pages/PoliciesManager';
import AttackLogs from './pages/AttackLogs';
import TrafficAnalytics from './pages/TrafficAnalytics';
import ThreatIntelligence from './pages/ThreatIntelligence';
import Settings from './pages/Settings';
import RuleEditor from './pages/RuleEditor';
import LiveMonitor from './pages/LiveMonitor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="instances" element={<WAFInstances />} />
        <Route path="rules" element={<RulesManager />} />
        <Route path="rules/editor" element={<RuleEditor />} />
        <Route path="rules/editor/:ruleId" element={<RuleEditor />} />
        <Route path="policies" element={<PoliciesManager />} />
        <Route path="attacks" element={<AttackLogs />} />
        <Route path="traffic" element={<TrafficAnalytics />} />
        <Route path="threats" element={<ThreatIntelligence />} />
        <Route path="live" element={<LiveMonitor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;

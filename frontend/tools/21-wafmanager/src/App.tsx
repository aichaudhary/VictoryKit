import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LiveMonitor from "./pages/LiveMonitor";
import WAFInstances from "./pages/WAFInstances";
import RulesManager from "./pages/RulesManager";
import RuleEditor from "./pages/RuleEditor";
import PoliciesManager from "./pages/PoliciesManager";
import AttackLogs from "./pages/AttackLogs";
import TrafficAnalytics from "./pages/TrafficAnalytics";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="live" element={<LiveMonitor />} />
        <Route path="instances" element={<WAFInstances />} />
        <Route path="rules" element={<RulesManager />} />
        <Route path="rules/new" element={<RuleEditor />} />
        <Route path="rules/:id" element={<RuleEditor />} />
        <Route path="policies" element={<PoliciesManager />} />
        <Route path="attacks" element={<AttackLogs />} />
        <Route path="traffic" element={<TrafficAnalytics />} />
        <Route path="threats" element={<ThreatIntelligence />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

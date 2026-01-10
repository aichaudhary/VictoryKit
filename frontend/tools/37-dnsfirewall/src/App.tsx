import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DNSFirewallTool from "./components/DNSFirewallTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DNSFirewallTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

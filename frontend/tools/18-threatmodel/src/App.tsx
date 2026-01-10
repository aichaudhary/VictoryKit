import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ThreatModelTool from "./components/ThreatModelTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ThreatModelTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VPNAnalyzerTool from "./components/VPNAnalyzerTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VPNAnalyzerTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

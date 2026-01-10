import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VulnScanTool from "./components/VulnScanTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<VulnScanTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

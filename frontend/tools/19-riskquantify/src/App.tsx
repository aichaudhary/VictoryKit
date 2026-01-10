import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RiskQuantifyTool from "./components/RiskQuantifyTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RiskQuantifyTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

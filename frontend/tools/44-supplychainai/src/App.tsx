import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SupplyChainAITool from "./components/SupplyChainAITool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SupplyChainAITool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

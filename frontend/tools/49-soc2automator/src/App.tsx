import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SOC2AutomatorTool from "./components/SOC2AutomatorTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SOC2AutomatorTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

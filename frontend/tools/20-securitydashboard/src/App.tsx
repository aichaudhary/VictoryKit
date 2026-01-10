import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SecurityDashboardTool from "./components/SecurityDashboardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SecurityDashboardTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuditTrailProTool from "./components/AuditTrailProTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuditTrailProTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

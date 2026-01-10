import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SSLMonitorTool from "./components/SSLMonitorTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SSLMonitorTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

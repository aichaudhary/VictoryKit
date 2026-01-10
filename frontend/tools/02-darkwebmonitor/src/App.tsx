import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DarkWebMonitorTool from "./components/DarkWebMonitorTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DarkWebMonitorTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

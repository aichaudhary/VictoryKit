import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DDoSDefenderTool from "./components/DDoSDefenderTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DDoSDefenderTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

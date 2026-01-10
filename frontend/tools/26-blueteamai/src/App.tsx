import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BlueTeamAITool from "./components/BlueTeamAITool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BlueTeamAITool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

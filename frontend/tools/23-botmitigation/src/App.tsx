import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BotMitigationTool from "./components/BotMitigationTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BotMitigationTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

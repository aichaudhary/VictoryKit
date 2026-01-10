import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WirelessHunterTool from "./components/WirelessHunterTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WirelessHunterTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NetworkForensicsTool from "./components/NetworkForensicsTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NetworkForensicsTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

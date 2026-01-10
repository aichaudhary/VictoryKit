import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SecretVaultTool from "./components/SecretVaultTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SecretVaultTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

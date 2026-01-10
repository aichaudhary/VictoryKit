import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivacyShieldTool from "./components/PrivacyShieldTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivacyShieldTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

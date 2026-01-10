import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MobileShieldTool from "./components/MobileShieldTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MobileShieldTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

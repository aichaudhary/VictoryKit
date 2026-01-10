import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RuntimeGuardTool from "./components/RuntimeGuardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RuntimeGuardTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

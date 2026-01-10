import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FraudGuardTool from "./components/FraudGuardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FraudGuardTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

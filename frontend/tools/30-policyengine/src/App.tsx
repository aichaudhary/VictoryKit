import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PolicyEngineTool from "./components/PolicyEngineTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PolicyEngineTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

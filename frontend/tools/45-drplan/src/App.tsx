import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DRPlanTool from "./components/DRPlanTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DRPlanTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

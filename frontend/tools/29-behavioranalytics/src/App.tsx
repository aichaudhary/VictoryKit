import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BehaviorAnalyticsTool from "./components/BehaviorAnalyticsTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BehaviorAnalyticsTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

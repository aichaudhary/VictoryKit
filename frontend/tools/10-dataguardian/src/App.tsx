import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DataGuardianTool from "./components/DataGuardianTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DataGuardianTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

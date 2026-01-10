import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DLPAdvancedTool from "./components/DLPAdvancedTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DLPAdvancedTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

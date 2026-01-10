import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PhishNetAITool from "./components/PhishNetAITool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PhishNetAITool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

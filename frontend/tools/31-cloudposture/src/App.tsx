import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CloudPostureTool from "./components/CloudPostureTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CloudPostureTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

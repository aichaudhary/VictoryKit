import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IncidentResponseTool from "./components/IncidentResponseTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IncidentResponseTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

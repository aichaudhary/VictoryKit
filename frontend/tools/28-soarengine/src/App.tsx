import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SOAREngineTool from "./components/SOAREngineTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SOAREngineTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

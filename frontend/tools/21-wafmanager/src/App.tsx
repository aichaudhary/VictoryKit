import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WAFManagerTool from "./components/WAFManagerTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WAFManagerTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

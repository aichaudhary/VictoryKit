import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import KubeArmorTool from "./components/KubeArmorTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<KubeArmorTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

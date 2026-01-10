import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IdentityForgeTool from "./components/IdentityForgeTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IdentityForgeTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

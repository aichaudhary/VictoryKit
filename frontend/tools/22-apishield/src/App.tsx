import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import APIShieldTool from "./components/APIShieldTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<APIShieldTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

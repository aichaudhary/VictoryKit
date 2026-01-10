import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivilegeGuardTool from "./components/PrivilegeGuardTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PrivilegeGuardTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

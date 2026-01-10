import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ISO27001Tool from "./components/ISO27001Tool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ISO27001Tool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

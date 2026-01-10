import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SIEMCommanderTool from "./components/SIEMCommanderTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SIEMCommanderTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

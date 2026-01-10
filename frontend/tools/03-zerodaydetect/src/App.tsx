import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ZeroDayDetectTool from "./components/ZeroDayDetectTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ZeroDayDetectTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

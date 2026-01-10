import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IoTSentinelTool from "./components/IoTSentinelTool";

function App() {
  return (
    <Routes>
      <Route path="/" element={<IoTSentinelTool />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
